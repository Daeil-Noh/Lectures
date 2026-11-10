# %% [markdown]
# # 실습 2 · 에이전트 루프 직접 짜기
# **멀티 에이전트 시스템 구축 · 2회** — 노대일 (동의대학교 인공지능학과)
#
# 프레임워크 없이 Claude Messages API만으로 **도구를 쓰는 에이전트 루프**를 만듭니다.
# 자료는 실습용 **가상 논문 초록 12편**입니다(실제로 존재하지 않는 논문, 수치도 가상).
#
# 준비: Colab 🔑 보안 비밀에 `ANTHROPIC_API_KEY` 저장 · 노트북 액세스 허용

# %%
!pip -q install anthropic

# %%
import os, json, time, urllib.request
try:
    from google.colab import userdata
    os.environ['ANTHROPIC_API_KEY'] = userdata.get('ANTHROPIC_API_KEY')
except ImportError:
    pass
import anthropic
client = anthropic.Anthropic(max_retries=4)

MODEL = 'claude-sonnet-5-5'
PRICE = {'claude-haiku-5-5': (0.10, 0.50), 'claude-sonnet-5-5': (2.0, 10.0), 'claude-opus-5-5': (4.0, 20.0)}  # $/MTok, 2026.11

LOG = []   # 모든 호출 기록
def record(tag, model, usage, sec):
    pin, pout = PRICE.get(model, (0, 0))
    LOG.append({'tag': tag, 'model': model, 'in': usage.input_tokens, 'out': usage.output_tokens,
                'usd': (usage.input_tokens * pin + usage.output_tokens * pout) / 1e6, 'sec': round(sec, 1)})

def text_of(resp_or_content):
    content = getattr(resp_or_content, 'content', resp_or_content)
    return ''.join(b.text for b in content if b.type == 'text')

# %% [markdown]
# ## 1. 자료와 도구
# 도구는 두 개입니다. **설명(description)이 곧 프롬프트**라는 점을 기억하세요.

# %%
DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/multi-agent/labs/data/'
with urllib.request.urlopen(DATA + 'papers.json') as f:
    PAPERS = {p['id']: p for p in json.load(f)['papers']}
print(len(PAPERS), '편:', ', '.join(f"{p['id']}({p['area']})" for p in PAPERS.values()))

def search_papers(query: str):
    """제목·초록에 키워드가 많이 나오는 순으로 최대 5편 (id·제목·연도·분야)"""
    words = [w for w in query.replace(',', ' ').split() if w]
    scored = []
    for p in PAPERS.values():
        text = p['title'] + ' ' + p['abstract']
        s = sum(text.count(w) for w in words)
        if s:
            scored.append((s, p))
    scored.sort(key=lambda x: -x[0])
    return [{'id': p['id'], 'title': p['title'], 'year': p['year'], 'area': p['area']} for _, p in scored[:5]] \
        or {'result': '검색 결과 없음. 더 짧은 키워드(한 단어)로 다시 찾아 보세요.'}

def read_paper(paper_id: str):
    p = PAPERS.get(paper_id.strip().upper())
    if not p:
        raise KeyError(f'{paper_id} 없음. 있는 id: P01~P12')    # 고칠 방법을 알려 주는 오류
    return p

TOOLS = [
    {'name': 'search_papers',
     'description': ('연구실 문헌 모음(가상 논문 12편)에서 키워드로 논문을 찾는다. 제목·초록에 키워드가 많이 들어간 순으로 '
                     '최대 5편의 id·제목·연도·분야를 돌려준다. 초록 내용은 주지 않으므로, 내용이 필요하면 read_paper 를 쓴다.'),
     'input_schema': {'type': 'object', 'properties': {'query': {'type': 'string', 'description': '한두 단어 한국어 키워드'}},
                      'required': ['query']}},
    {'name': 'read_paper',
     'description': '논문 id(예: P07)로 제목·연도·분야·초록 전체를 읽는다. 주장을 쓰기 전에 반드시 읽고 확인한다.',
     'input_schema': {'type': 'object', 'properties': {'paper_id': {'type': 'string'}}, 'required': ['paper_id']}},
]
IMPL = {'search_papers': search_papers, 'read_paper': read_paper}

print(search_papers('예지보전'))

# %% [markdown]
# ## 2. 도구 실행기와 루프
# - 모델은 도구를 **요청**(`tool_use`)만 합니다. 실행과 결과 반환(`tool_result`)은 우리 코드의 몫입니다.
# - 실패도 결과로 돌려줍니다(`is_error`). 그래야 모델이 다른 방법을 시도합니다.

# %%
def call_tool(impl, name, args):
    if name not in impl:
        return {'content': f'알 수 없는 도구: {name}', 'is_error': True}
    try:
        out = impl[name](**args)
        return {'content': json.dumps(out, ensure_ascii=False)[:4000]}
    except Exception as e:
        return {'content': f'{type(e).__name__}: {e}', 'is_error': True}

def run_agent(system, task, tools, impl, max_turns=10, model=None, tag='agent', verbose=True):
    model = model or MODEL
    messages = [{'role': 'user', 'content': task}]
    for turn in range(max_turns):
        t0 = time.time()
        resp = client.messages.create(model=model, max_tokens=2000, system=system, tools=tools, messages=messages)
        record(tag, model, resp.usage, time.time() - t0)
        messages.append({'role': 'assistant', 'content': resp.content})
        if verbose:
            for b in resp.content:
                if b.type == 'tool_use':
                    print(f'  [{tag} {turn + 1}] 도구 요청: {b.name}({b.input})')
        if resp.stop_reason != 'tool_use':
            return text_of(resp), messages
        results = []
        for b in resp.content:
            if b.type == 'tool_use':
                results.append({'type': 'tool_result', 'tool_use_id': b.id, **call_tool(impl, b.name, b.input)})
        messages.append({'role': 'user', 'content': results})
    return '[중단] 최대 반복 횟수 초과', messages

# %% [markdown]
# ## 3. 실행

# %%
SYSTEM = ('너는 연구실 문헌 조사 조교다. 반드시 도구로 찾고 읽은 내용만 근거로 쓴다. '
          '모든 주장 끝에 [P07]처럼 논문 id를 단다. 찾지 못한 것은 찾지 못했다고 쓴다. 한국어로 답한다.')
TASK = '2025년 이후 나온 예지보전 관련 논문을 찾아 핵심을 요약해 줘.'

answer, history = run_agent(SYSTEM, TASK, TOOLS, IMPL, tag='loop')
print('\n=== 답 ===\n' + answer)

# %% [markdown]
# ## 4. 대화 기록 들여다보기
# 이 기록 전체가 이 에이전트의 **컨텍스트**입니다. 매 호출마다 이것을 통째로 다시 보냅니다.

# %%
for i, m in enumerate(history):
    if isinstance(m['content'], str):
        print(f"{i} {m['role']}: {m['content'][:80]}")
        continue
    for b in m['content']:
        kind = b['type'] if isinstance(b, dict) else b.type
        if kind == 'text':
            print(f"{i} {m['role']} · text: {(b.text if not isinstance(b, dict) else b['text'])[:70]}")
        elif kind == 'tool_use':
            print(f"{i} {m['role']} · tool_use: {b.name} {b.input}")
        elif kind == 'tool_result':
            print(f"{i} {m['role']} · tool_result{' (오류)' if b.get('is_error') else ''}: {b['content'][:60]}")

# %%
import pandas as pd
df = pd.DataFrame(LOG)
print('호출 수:', len(df), '| 입력 토큰 처음→마지막:', df['in'].iloc[0], '→', df['in'].iloc[-1])
df

# %% [exercise]
# 직접 바꿔 보기 1: read_paper 의 설명을 일부러 모호하게 바꾸고 다시 실행해 보세요.
# 모델이 read_paper 를 덜 쓰고 제목만 보고 추측하는지, 인용이 정확한지 비교합니다.
BAD_TOOLS = [TOOLS[0], {**TOOLS[1], 'description': '논문 관련 도구.'}]
answer_bad, history_bad = run_agent(SYSTEM, TASK, BAD_TOOLS, IMPL, tag='bad-desc')
print(answer_bad)

# %% [exercise]
# 직접 바꿔 보기 2: 없는 논문 id를 읽게 하면? 오류 메시지가 '고칠 방법'을 알려 주니 모델이 스스로 바로잡는지 보세요.
answer_err, _ = run_agent(SYSTEM, 'P99 논문을 읽고 요약해 줘. 없으면 가장 비슷한 주제의 논문을 대신 요약해.', TOOLS, IMPL, tag='err')
print(answer_err)

# %% [exercise]
# 직접 바꿔 보기 3: max_turns=2 로 줄이면 어떻게 끝나나요? 실제 시스템에서 상한에 걸렸을 때 사용자에게 무엇을 돌려줘야 할까요?
answer_short, _ = run_agent(SYSTEM, TASK, TOOLS, IMPL, max_turns=2, tag='short')
print(answer_short)

# %% [markdown]
# ## 정리
# - 루프의 끝은 `stop_reason` 이 `tool_use` 가 아닐 때 — **모델이 끝을 정한다**.
# - 컨텍스트는 호출마다 커진다. 긴 조사를 한 에이전트가 계속하면 비용과 혼란이 함께 는다 → 다음 실습에서 워커로 나눈다.
# - 다음 실습(실습 3)에서는 이 `run_agent` 를 **비동기**로 바꾸고, 통째로 '도구 하나'로 감쌉니다.
#
# **AI에게 물어볼 만한 질문**: "이 run_agent 함수에 누적 토큰이 일정 값을 넘으면 멈추는 예산 상한을 넣어 줘. 상한에 걸리면 지금까지 찾은 것을 요약해 돌려주게."
