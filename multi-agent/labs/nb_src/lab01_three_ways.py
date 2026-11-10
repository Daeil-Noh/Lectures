# %% [markdown]
# # 실습 1 · 같은 질문, 세 가지 방식
# **멀티 에이전트 시스템 구축 · 1회** — 노대일 (동의대학교 인공지능학과)
#
# 같은 질문을 **A. 한 번 호출 · B. 체인 · C. 병렬 + 종합** 으로 풀고, LLM 호출 수 · 토큰 · 비용 · 시간 · 품질을 비교합니다.
#
# **준비**: Colab 왼쪽 🔑 *보안 비밀(Secrets)* 에 `ANTHROPIC_API_KEY` 를 저장하고 이 노트북의 액세스를 허용하세요. 키를 코드에 직접 쓰지 마세요.
#
# **예상 비용**: Sonnet 기준 노트북 전체 1회 실행에 수 센트 수준(질문 길이에 따라 다름).

# %%
!pip -q install anthropic

# %%
import os, time, json
from concurrent.futures import ThreadPoolExecutor

try:  # Colab: 보안 비밀에서 키 읽기
    from google.colab import userdata
    os.environ['ANTHROPIC_API_KEY'] = userdata.get('ANTHROPIC_API_KEY')
except ImportError:  # 로컬: 환경 변수 ANTHROPIC_API_KEY 를 미리 설정
    pass

import anthropic
client = anthropic.Anthropic(max_retries=4)   # 429(요청 과다) 등은 자동 재시도

MODEL = 'claude-sonnet-5-5'                    # 바꿔 보기: 'claude-haiku-5-5', 'claude-opus-5-5'
PRICE = {                                       # 달러 / 백만 토큰 (입력, 출력) — Claude 모델 문서 2026.11 기준
    'claude-haiku-5-5': (0.10, 0.50),           # Haiku 는 '부터' 가격, 실제는 문서 확인
    'claude-sonnet-5-5': (2.0, 10.0),
    'claude-opus-5-5': (4.0, 20.0),
}

# %% [markdown]
# ## 모든 호출을 기록하는 장부
# 멀티 에이전트에서는 **호출이 어디서 몇 번 일어났는지** 모르면 비용도 실패도 설명할 수 없습니다. 처음부터 기록 습관을 들입니다.

# %%
class Ledger:
    """LLM 호출마다 이름표 · 토큰 · 시간을 기록한다."""
    def __init__(self):
        self.rows = []

    def ask(self, tag, user, system='너는 정확하고 간결한 연구 조교다. 한국어로 답한다.', model=None, max_tokens=1200, **kw):
        model = model or MODEL
        t0 = time.time()
        resp = client.messages.create(model=model, max_tokens=max_tokens, system=system,
                                      messages=[{'role': 'user', 'content': user}], **kw)
        dt = time.time() - t0
        u = resp.usage
        pin, pout = PRICE.get(model, (0, 0))
        self.rows.append({'tag': tag, 'model': model, 'in': u.input_tokens, 'out': u.output_tokens,
                          'usd': (u.input_tokens * pin + u.output_tokens * pout) / 1e6, 'sec': round(dt, 1)})
        return resp

    def summary(self, prefix):
        rows = [r for r in self.rows if r['tag'].startswith(prefix)]
        return {'calls': len(rows), 'in': sum(r['in'] for r in rows), 'out': sum(r['out'] for r in rows),
                'usd': round(sum(r['usd'] for r in rows), 4)}

def text_of(resp):
    return ''.join(b.text for b in resp.content if b.type == 'text')

L = Ledger()
r = L.ask('test', '멀티 에이전트를 한 문장으로 정의해 줘.', max_tokens=200)
print(text_of(r))
print(L.rows[-1])

# %% [markdown]
# ## 오늘의 질문
# 자기 연구 분야의 질문으로 바꿔도 됩니다. **여러 관점에서 따져 볼 만한** 질문이 좋습니다.

# %%
QUESTION = ('스마트 팩토리의 설비 진동 데이터로 고장을 미리 알아내는 연구에 '
            '양자 머신러닝을 적용하려 한다. 이 연구 방향의 가능성과 위험을 평가해 줘.')

# %% [markdown]
# ## A. 한 번 호출

# %%
t0 = time.time()
a = L.ask('A', QUESTION + '\n\n500자 안팎의 보고서로 답해 줘.')
time_A = time.time() - t0
print(text_of(a))

# %% [markdown]
# ## B. 체인 (3단계)
# 1단계 결과를 **구조화된 형식(JSON)** 으로 받기 위해 *도구 강제 호출* 을 씁니다. 모델에게 `submit_perspectives` 라는 도구를 반드시 쓰게 하면, 그 입력이 곧 우리가 원하는 형식의 데이터입니다.

# %%
PERSPECTIVE_TOOL = {
    'name': 'submit_perspectives',
    'description': '질문을 평가할 서로 다른 관점 목록을 제출한다.',
    'input_schema': {
        'type': 'object',
        'properties': {'perspectives': {'type': 'array', 'items': {'type': 'string'}, 'minItems': 3, 'maxItems': 3,
                                        'description': '겹치지 않는 관점 3개, 각 10자 안팎'}},
        'required': ['perspectives'],
    },
}

def list_perspectives(tag):
    r = L.ask(tag, f'다음 질문을 평가할 서로 겹치지 않는 관점 3개를 골라 줘.\n\n질문: {QUESTION}',
              tools=[PERSPECTIVE_TOOL], tool_choice={'type': 'tool', 'name': 'submit_perspectives'}, max_tokens=300)
    return next(b.input for b in r.content if b.type == 'tool_use')['perspectives']

t0 = time.time()
persp = list_perspectives('B1')
print('관점:', persp)
b2 = L.ask('B2', f'질문: {QUESTION}\n\n다음 관점 각각에서 200자 안팎으로 분석해 줘: {persp}')
b3 = L.ask('B3', f'질문: {QUESTION}\n\n관점별 분석:\n{text_of(b2)}\n\n이를 종합해 500자 안팎의 보고서를 써 줘. 관점 사이의 충돌도 짚어 줘.')
time_B = time.time() - t0
print(text_of(b3))

# %% [markdown]
# ## C. 병렬 + 종합
# 관점마다 **따로**(새 컨텍스트에서) **동시에** 분석합니다. 각 분석은 다른 관점의 내용을 보지 못합니다 — 이것이 *컨텍스트 격리* 입니다.

# %%
def analyze(p):
    r = L.ask('C2', f'질문: {QUESTION}\n\n오직 「{p}」 관점에서만 300자 안팎으로 분석해 줘.')
    return p, text_of(r)

t0 = time.time()
persp_c = list_perspectives('C1')
with ThreadPoolExecutor(max_workers=3) as ex:       # 동시에 3개
    parts = list(ex.map(analyze, persp_c))
joined = '\n\n'.join(f'[{p}]\n{t}' for p, t in parts)
c3 = L.ask('C3', f'질문: {QUESTION}\n\n관점별 분석:\n{joined}\n\n이를 종합해 500자 안팎의 보고서를 써 줘. 관점 사이의 충돌도 짚어 줘.')
time_C = time.time() - t0
print(text_of(c3))

# %% [markdown]
# ## 비교표
# `my_score` 에는 세 보고서를 읽고 **직접** 1~5점을 매겨 넣으세요. 무엇을 기준으로 점수를 줬는지도 메모해 두세요(5회 평가 기준표의 씨앗이 됩니다).

# %%
import pandas as pd
my_score = {'A': 3, 'B': 3, 'C': 3}     # ← 직접 고치기
table = pd.DataFrame([
    {'방식': 'A 한 번', **L.summary('A'), 'sec': round(time_A, 1), 'my_score': my_score['A']},
    {'방식': 'B 체인', **L.summary('B'), 'sec': round(time_B, 1), 'my_score': my_score['B']},
    {'방식': 'C 병렬', **L.summary('C'), 'sec': round(time_C, 1), 'my_score': my_score['C']},
])
table

# %%
pd.DataFrame(L.rows)   # 호출 하나하나의 기록

# %% [exercise]
# 직접 바꿔 보기 1: 병렬 분석(C2)만 작은 모델로 돌려 비용이 얼마나 줄고 품질은 어떤지 보세요.
WORKER_MODEL = 'claude-haiku-5-5'
def analyze_small(p):
    r = L.ask('D2', f'질문: {QUESTION}\n\n오직 「{p}」 관점에서만 300자 안팎으로 분석해 줘.', model=WORKER_MODEL)
    return p, text_of(r)
with ThreadPoolExecutor(max_workers=3) as ex:
    parts_d = list(ex.map(analyze_small, persp_c))
d3 = L.ask('D3', f'질문: {QUESTION}\n\n관점별 분석:\n' + '\n\n'.join(f'[{p}]\n{t}' for p, t in parts_d) + '\n\n500자 안팎으로 종합해 줘.')
print(L.summary('D'), '← C:', L.summary('C'))

# %% [exercise]
# 직접 바꿔 보기 2: 관점 수를 5개로 늘리려면 어디를 고쳐야 할까요? (힌트: PERSPECTIVE_TOOL 의 minItems·maxItems, max_workers)
# 고친 뒤 C 방식을 다시 돌려 시간과 비용이 어떻게 변하는지 기록해 보세요.
print(PERSPECTIVE_TOOL['input_schema']['properties']['perspectives'])

# %% [markdown]
# ## 정리
# - **B와 C는 호출 구조가 다릅니다.** B는 한 컨텍스트에서 관점들을 함께 보고, C는 관점마다 컨텍스트를 나눠 동시에 봅니다.
# - C가 빠른 이유는 *병렬*, 결과가 다른 이유는 *격리* 입니다. 격리는 장점(서로 휩쓸리지 않음)이자 단점(서로 모름)입니다.
# - 비교할 때는 **토큰 예산을 함께** 보세요. 더 많이 쓴 쪽이 더 좋은 건 놀랍지 않습니다.
#
# **AI에게 물어볼 만한 질문**: "이 비교표를 보고, 내 질문에서 B와 C의 품질 차이가 생긴 원인을 가설 3개로 정리해 줘."
