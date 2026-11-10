# %% [markdown]
# # 실습 3 · 리드 + 워커 시스템
# **멀티 에이전트 시스템 구축 · 2회** — 노대일 (동의대학교 인공지능학과)
#
# 실습 2의 에이전트 루프를 **비동기**로 바꾸고, 통째로 `delegate` 도구로 감싸 **오케스트레이터–워커** 시스템을 만듭니다.
# - 리드: `delegate` 도구 하나만 가진다 (직접 검색하지 않는다)
# - 워커: `search_papers`, `read_paper` 를 가진 루프 (새 컨텍스트에서 시작)
# - 리드가 한 응답에서 delegate 를 여러 번 부르면 워커들이 **동시에** 돈다
#
# 자료: 실습용 가상 논문 초록 12편 · 예상 비용: Sonnet 리드 + Haiku 워커 기준 한 번 실행에 수 센트~십수 센트

# %%
!pip -q install anthropic

# %%
import os, json, time, asyncio, re, urllib.request
try:
    from google.colab import userdata
    os.environ['ANTHROPIC_API_KEY'] = userdata.get('ANTHROPIC_API_KEY')
except ImportError:
    pass
import anthropic
aclient = anthropic.AsyncAnthropic(max_retries=4)

LEAD_MODEL = 'claude-sonnet-5-5'
WORKER_MODEL = 'claude-haiku-5-5'      # 워커는 작은 모델로 (바꿔 보기)
PRICE = {'claude-haiku-5-5': (0.10, 0.50), 'claude-sonnet-5-5': (2.0, 10.0), 'claude-opus-5-5': (4.0, 20.0)}  # $/MTok, 2026.11
LIMIT = asyncio.Semaphore(3)            # 동시에 최대 3개 호출

LOG = []
def record(tag, model, usage, t0, t1):
    pin, pout = PRICE.get(model, (0, 0))
    LOG.append({'tag': tag, 'model': model, 'in': usage.input_tokens, 'out': usage.output_tokens,
                'usd': (usage.input_tokens * pin + usage.output_tokens * pout) / 1e6, 'start': t0, 'end': t1})

def text_of(resp):
    return ''.join(b.text for b in resp.content if b.type == 'text')

# %% [markdown]
# ## 1. 자료와 워커용 도구 (실습 2와 같음)

# %%
DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/multi-agent/labs/data/'
with urllib.request.urlopen(DATA + 'papers.json') as f:
    PAPERS = {p['id']: p for p in json.load(f)['papers']}

READ_BY = {}   # 어떤 워커가 어떤 논문을 실제로 읽었는지 (인용 검사용)

def search_papers(query: str):
    words = [w for w in query.replace(',', ' ').split() if w]
    scored = sorted(((sum((p['title'] + p['abstract']).count(w) for w in words), p) for p in PAPERS.values()), key=lambda x: -x[0])
    hits = [{'id': p['id'], 'title': p['title'], 'year': p['year'], 'area': p['area']} for s, p in scored if s][:5]
    return hits or {'result': '검색 결과 없음. 더 짧은 키워드로 다시 찾아 보세요.'}

def make_read(worker_tag):
    def read_paper(paper_id: str):
        p = PAPERS.get(paper_id.strip().upper())
        if not p:
            raise KeyError(f'{paper_id} 없음. 있는 id: P01~P12')
        READ_BY.setdefault(worker_tag, set()).add(p['id'])
        return p
    return read_paper

WORKER_TOOLS = [
    {'name': 'search_papers',
     'description': ('연구실 문헌 모음(가상 논문 12편)에서 키워드로 논문을 찾는다. 최대 5편의 id·제목·연도·분야를 돌려준다. '
                     '초록 내용은 주지 않으므로 내용이 필요하면 read_paper 를 쓴다. 독립적인 검색은 한 번에 여러 개 요청해도 된다.'),
     'input_schema': {'type': 'object', 'properties': {'query': {'type': 'string', 'description': '한두 단어 키워드'}}, 'required': ['query']}},
    {'name': 'read_paper',
     'description': '논문 id(예: P07)로 초록 전체를 읽는다. 주장을 쓰기 전에 반드시 읽고 확인한다.',
     'input_schema': {'type': 'object', 'properties': {'paper_id': {'type': 'string'}}, 'required': ['paper_id']}},
]

# %% [markdown]
# ## 2. 비동기 에이전트 루프
# 한 응답의 `tool_use` 블록들을 `asyncio.gather` 로 **동시에** 실행합니다. 도구 함수가 `async` 이면 기다리고, 아니면 그냥 부릅니다.

# %%
async def acall_tool(impl, name, args):
    if name not in impl:
        return {'content': f'알 수 없는 도구: {name}', 'is_error': True}
    try:
        out = impl[name](**args)
        if asyncio.iscoroutine(out):
            out = await out
        return {'content': out if isinstance(out, str) else json.dumps(out, ensure_ascii=False)[:4000]}
    except Exception as e:
        return {'content': f'{type(e).__name__}: {e}', 'is_error': True}

async def arun_agent(system, task, tools, impl, model, tag, max_turns=8):
    messages = [{'role': 'user', 'content': task}]
    for turn in range(max_turns):
        async with LIMIT:
            t0 = time.time()
            resp = await aclient.messages.create(model=model, max_tokens=2000, system=system, tools=tools, messages=messages)
            record(tag, model, resp.usage, t0, time.time())
        messages.append({'role': 'assistant', 'content': resp.content})
        if resp.stop_reason != 'tool_use':
            return text_of(resp), messages
        calls = [b for b in resp.content if b.type == 'tool_use']
        print(f'[{tag}] ' + ', '.join(f'{b.name}({list(b.input.values())[0] if b.input else ""})' for b in calls))
        outs = await asyncio.gather(*[acall_tool(impl, b.name, b.input) for b in calls])
        messages.append({'role': 'user', 'content': [{'type': 'tool_result', 'tool_use_id': b.id, **o} for b, o in zip(calls, outs)]})
    return '[중단] 최대 반복 횟수 초과 — 지금까지 찾은 것만 보고함', messages

# %% [markdown]
# ## 3. 워커를 도구로 감싸기: `delegate`
# - 입력 스키마가 **브리프의 네 요소 중 셋**(목표 · 출력 형식 · 경계)을 필수로 요구합니다. 도구 안내는 워커 시스템 프롬프트에 있습니다.
# - 워커의 대화 기록은 돌려주지 않습니다 → **컨텍스트 격리**

# %%
WORKER_SYSTEM = ('너는 문헌 조사 워커다. 리드가 준 브리프의 목표와 경계 안에서만 조사한다. '
                 'search_papers 로 후보를 찾고, 쓸 내용은 반드시 read_paper 로 읽고 확인한다. read_paper 는 최대 4편. '
                 '모든 주장 끝에 [P07]처럼 id를 단다. 브리프의 출력 형식을 정확히 따르고, 찾지 못한 것도 보고한다.')

N_WORKERS = 0
async def delegate(objective: str, output_format: str, boundaries: str):
    global N_WORKERS
    N_WORKERS += 1
    tag = f'worker{N_WORKERS}'
    brief = f'목표: {objective}\n출력 형식: {output_format}\n하지 말 것: {boundaries}'
    impl = {'search_papers': search_papers, 'read_paper': make_read(tag)}
    report, _ = await arun_agent(WORKER_SYSTEM, brief, WORKER_TOOLS, impl, WORKER_MODEL, tag, max_turns=6)
    return f'({tag} 보고)\n{report}'

DELEGATE = {
    'name': 'delegate',
    'description': ('하위 조사 하나를 워커에게 맡긴다. 워커는 지금까지의 대화를 모르므로 필요한 맥락을 모두 쓴다. '
                    '서로 독립적인 조사는 한 응답에서 delegate 를 여러 번 불러 동시에 맡긴다.'),
    'input_schema': {'type': 'object', 'properties': {
        'objective': {'type': 'string', 'description': '무엇을 왜 조사하는지. 상위 질문의 맥락 포함'},
        'output_format': {'type': 'string', 'description': '보고 형식·길이·출처 표기법'},
        'boundaries': {'type': 'string', 'description': '하지 말 것, 다른 워커의 몫, 멈출 조건'}},
        'required': ['objective', 'output_format', 'boundaries']},
}

LEAD_SYSTEM = ('너는 연구 조사 리드다. 직접 검색하지 않고 delegate 로 워커에게 맡긴다.\n'
               '노력 조절 규칙: 문헌은 12편뿐이다. 단순 확인은 워커 1명, 비교 질문은 워커 2~3명. 4명 이상 쓰지 않는다.\n'
               '독립적인 조사는 한 응답에서 동시에 맡긴다. 워커끼리 범위가 겹치지 않게 경계를 쓴다.\n'
               '보고가 모이면 종합한다. 워커가 단 [P..] id를 그대로 유지하고, 워커끼리 다른 내용은 고르지 말고 드러낸다. 한국어로 쓴다.')

# %% [markdown]
# ## 4. 실행
# Colab(주피터)은 이미 이벤트 루프가 돌고 있으므로 셀에서 바로 `await` 를 씁니다.

# %%
QUESTION = ('설비 예지보전에 쓸 수 있는 방법들을 고전 머신러닝 · 딥러닝 · 양자 머신러닝 계열로 나누어 비교하는 표를 만들어 줘. '
            '표의 열: 방법, 필요한 데이터 양, 장점, 한계, 근거 논문. 모든 칸의 주장에 논문 id를 달아. 표 아래에 우리 연구실에 주는 시사점 3줄.')

t_start = time.time()
report, lead_history = await arun_agent(LEAD_SYSTEM, QUESTION, [DELEGATE], {'delegate': delegate}, LEAD_MODEL, 'lead', max_turns=6)
elapsed = time.time() - t_start
print('\n' + '=' * 60 + '\n' + report)

# %% [markdown]
# ## 5. 누가 얼마나 썼나
# `start`·`end` 로 워커들이 실제로 **겹쳐서**(동시에) 돌았는지 확인할 수 있습니다.

# %%
import pandas as pd
df = pd.DataFrame(LOG)
df['start'] = (df['start'] - t_start).round(1)
df['end'] = (df['end'] - t_start).round(1)
print(f'전체 {elapsed:.1f}초 · 비용 ${df.usd.sum():.4f} · 호출 {len(df)}회')
print(df.groupby('tag')[['in', 'out', 'usd']].sum().round(4))
df

# %%
import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(9, 3))
tags = list(dict.fromkeys(df['tag']))
for _, r in df.iterrows():
    ax.barh(tags.index(r['tag']), r['end'] - r['start'], left=r['start'], color='#0b6e63' if r['tag'] == 'lead' else '#c2571a')
ax.set_yticks(range(len(tags)), tags); ax.set_xlabel('seconds'); ax.set_title('LLM calls timeline')
plt.tight_layout(); plt.show()

# %% [markdown]
# ## 6. 인용 검사 (코드로)
# 1. 보고서에 나온 [P..] id가 **실제로 존재**하는가?
# 2. 그 id를 **어느 워커든 실제로 읽었는가**? (읽지 않고 인용했다면 제목만 보고 추측했을 가능성)

# %%
cited = sorted(set(re.findall(r'P\d{2}', report)))
read_any = set().union(*READ_BY.values()) if READ_BY else set()
check = pd.DataFrame([{'id': c, 'exists': c in PAPERS, 'read_by_worker': c in read_any} for c in cited])
print('인용된 id:', cited)
print('워커별로 읽은 논문:', {k: sorted(v) for k, v in READ_BY.items()})
print('통과율:', (check['exists'] & check['read_by_worker']).mean() if len(check) else '인용 없음')
check

# %% [exercise]
# 직접 바꿔 보기 1: 같은 도구를 가진 '에이전트 하나'와 공정하게 비교하기.
# 리드 + 워커의 총 토큰·비용·시간·인용 통과율과 나란히 표로 정리해 보세요.
LOG_MULTI = list(LOG); READ_BY.clear(); LOG.clear()
SINGLE_SYSTEM = WORKER_SYSTEM.replace('read_paper 는 최대 4편. ', '')
t0 = time.time()
single_report, _ = await arun_agent(SINGLE_SYSTEM, QUESTION, WORKER_TOOLS,
                                    {'search_papers': search_papers, 'read_paper': make_read('single')}, LEAD_MODEL, 'single', max_turns=15)
single = {'방식': '에이전트 하나', 'calls': len(LOG), 'tokens': sum(r['in'] + r['out'] for r in LOG), 'usd': round(sum(r['usd'] for r in LOG), 4), 'sec': round(time.time() - t0, 1)}
multi = {'방식': '리드 + 워커', 'calls': len(LOG_MULTI), 'tokens': sum(r['in'] + r['out'] for r in LOG_MULTI), 'usd': round(sum(r['usd'] for r in LOG_MULTI), 4), 'sec': round(elapsed, 1)}
pd.DataFrame([multi, single])

# %% [exercise]
# 직접 바꿔 보기 2: LIMIT = asyncio.Semaphore(1) 로 바꾸고 4번 셀부터 다시 실행해 타임라인 그림이 어떻게 변하는지 보세요.
# 직접 바꿔 보기 3: LEAD_SYSTEM 에서 '노력 조절 규칙' 줄을 지우고 실행하면 워커 수가 어떻게 되나요?
print('현재 동시 실행 상한:', LIMIT._value)

# %% [markdown]
# ## 정리
# - 워커는 리드의 대화를 모른다 → `delegate` 스키마로 브리프의 필수 요소를 **강제**했다.
# - 리드 창에는 위임과 보고만 쌓인다(격리). 그 대가로 워커가 놓친 맥락은 리드가 알 수 없다.
# - 인용 id를 끝까지 들고 다니면 **코드로 검증**할 수 있다 → 5회 평가의 출발점.
#
# **AI에게 물어볼 만한 질문**: "이 리드 + 워커 실행 기록(LOG 표)을 보고 비용을 절반으로 줄일 방법을 근거와 함께 3가지 제안해 줘."
