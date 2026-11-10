# %% [markdown]
# # 실습 4 · 연구실 요청 처리기: 라우터 + 작성–검토 루프
# **멀티 에이전트 시스템 구축 · 3회** — 노대일 (동의대학교 인공지능학과)
#
# - **A. 라우터**: 요청을 작은 모델로 분류하고(구조화 출력), 정답과 비교해 정확도를 잰다
# - **B. 작성–검토 루프**: 실험 계획 초안을 기준표로 반복 개선한다 (멈춤 조건 세 가지)
# - **C. 자기 검토 실험**: 검토자가 작성 맥락을 함께 보면 점수가 어떻게 달라지나
#
# 예상 비용: 전체 한 번에 수 센트~수십 센트 (C의 반복 횟수에 따라)

# %%
!pip -q install anthropic

# %%
import os, json, time
try:
    from google.colab import userdata
    os.environ['ANTHROPIC_API_KEY'] = userdata.get('ANTHROPIC_API_KEY')
except ImportError:
    pass
import anthropic
client = anthropic.Anthropic(max_retries=4)

SMALL, MAIN = 'claude-haiku-5-5', 'claude-sonnet-5-5'
PRICE = {'claude-haiku-5-5': (0.10, 0.50), 'claude-sonnet-5-5': (2.0, 10.0), 'claude-opus-5-5': (4.0, 20.0)}  # $/MTok, 2026.11
LOG = []
def call(tag, **kw):
    t0 = time.time()
    r = client.messages.create(**kw)
    pin, pout = PRICE.get(kw['model'], (0, 0))
    LOG.append({'tag': tag, 'model': kw['model'], 'in': r.usage.input_tokens, 'out': r.usage.output_tokens,
                'usd': (r.usage.input_tokens * pin + r.usage.output_tokens * pout) / 1e6, 'sec': round(time.time() - t0, 1)})
    return r

def text_of(r):
    return ''.join(b.text for b in r.content if b.type == 'text')

def forced(tag, model, tool, user, system=None, max_tokens=800):
    """도구를 강제로 쓰게 해 스키마에 맞는 출력(dict)을 받는다."""
    kw = dict(model=model, max_tokens=max_tokens, tools=[tool], tool_choice={'type': 'tool', 'name': tool['name']},
              messages=[{'role': 'user', 'content': user}])
    if system:
        kw['system'] = system
    r = call(tag, **kw)
    return next(b.input for b in r.content if b.type == 'tool_use')

# %% [markdown]
# ## A. 라우터
# 분류만 모델이 하고, **다음에 무엇을 할지는 코드가** 정합니다. `enum` 으로 값의 범위를 막습니다.

# %%
REQUESTS = [
    ('P07 논문이 고장 사례를 몇 건 썼는지 알려 줘', '문헌'),
    ('다음 주부터 진동 센서로 모터 고장 예측 실험을 하려는데 실험 계획 초안을 잡아 줘', '실험계획'),
    ('다음 달 학회 출장비 정산 서류 양식이 어디 있나요?', '행정'),
    ('양자 커널 SVM 관련해서 우리 문헌 중에 결론이 부정적인 게 있어?', '문헌'),
    ('엣지 보드에서 오토인코더 경량화 실험을 어떻게 설계하면 좋을까', '실험계획'),
    ('연구실 GPU 서버 계정 신청은 누구한테 하나요?', '행정'),
    ('오늘 점심 메뉴 추천해 줘', '기타'),
    ('소수샷 비전 검사 논문이 조명 변화를 어떻게 다뤘는지 정리하고, 그걸 개선하는 실험도 짜 줘', '실험계획'),  # 애매한 요청
]

ROUTE = {
    'name': 'route',
    'description': '연구실로 들어온 요청 하나를 분류한다.',
    'input_schema': {'type': 'object', 'properties': {
        'category': {'type': 'string', 'enum': ['문헌', '실험계획', '행정', '기타'],
                     'description': '문헌=논문 내용 질문, 실험계획=실험 설계·계획 작성, 행정=서류·계정·출장 등, 기타=연구실 업무 아님'},
        'confidence': {'type': 'number', 'description': '0~1. 두 범주에 걸치면 낮게'},
        'reason': {'type': 'string', 'description': '한 문장'}},
        'required': ['category', 'confidence', 'reason']},
}

import pandas as pd
rows = []
for req, gold in REQUESTS:
    out = forced('route', SMALL, ROUTE, req, max_tokens=300)
    rows.append({'요청': req[:28] + '…', '정답': gold, '분류': out['category'], 'conf': out['confidence'],
                 '맞음': out['category'] == gold, '사람 확인': out['confidence'] < 0.7, '이유': out['reason']})
route_df = pd.DataFrame(rows)
print('정확도:', route_df['맞음'].mean(), '| 비용: $%.4f' % sum(r['usd'] for r in LOG if r['tag'] == 'route'))
route_df

# %% [exercise]
# 직접 바꿔 보기 1: ROUTE 의 category 설명(description)을 지우고 다시 돌려 보세요. 애매한 요청(마지막 줄)의 분류와 confidence 가 어떻게 바뀌나요?
# 직접 바꿔 보기 2: 사람 확인 기준(0.7)을 바꾸면 '사람에게 넘기는 비율'과 '틀린 채 자동 처리되는 비율'이 어떻게 맞바뀌나요?
threshold = 0.7
print('사람에게 넘김:', (route_df['conf'] < threshold).mean(), '| 틀렸는데 자동 처리:', ((route_df['conf'] >= threshold) & ~route_df['맞음']).mean())

# %% [markdown]
# ## B. 작성–검토 루프
# - 작성자와 검토자는 **다른 컨텍스트** — 검토자는 요청 · 초안 · 기준표만 본다
# - 통과 여부는 검토자가 말한 `pass` 가 아니라 **항목 점수를 코드로 더해** 판단한다
# - 멈춤 조건: ① 최대 라운드 ② 기준 통과 ③ 개선 없음

# %%
TASK = REQUESTS[1][0]
RUBRIC = '''평가 기준표 (각 0~25점, 합계 100점)
1. hypothesis: 검증할 가설이 하나의 문장으로 분명하고 반증 가능한가
2. data: 데이터(설비, 센서, 기간, 건수)와 실험 조건이 재현 가능할 만큼 구체적인가
3. metric: 성공을 판단할 평가 지표와 비교 기준(베이스라인)이 정해져 있는가
4. risk: 예상 위험(데이터 부족, 고장 사례 희소 등)과 대안이 있는가'''
PASS_LINE = 80
MAX_ROUNDS = 3

REVIEW = {
    'name': 'submit_review',
    'description': '실험 계획 초안을 기준표로 채점하고 고칠 점을 낸다.',
    'input_schema': {'type': 'object', 'properties': {
        'scores': {'type': 'object', 'properties': {k: {'type': 'integer'} for k in ['hypothesis', 'data', 'metric', 'risk']},
                   'required': ['hypothesis', 'data', 'metric', 'risk']},
        'evidence': {'type': 'string', 'description': '점수의 근거가 된 초안 속 구절'},
        'feedback': {'type': 'array', 'items': {'type': 'string'}, 'description': '무엇을·왜·어떻게 고칠지, 최대 3개'}},
        'required': ['scores', 'evidence', 'feedback']},
}
REVIEWER_SYSTEM = '너는 깐깐한 연구 계획 심사위원이다. 기준표에 따라서만 채점하고, 근거를 초안에서 인용한다.'
WRITER_SYSTEM = '너는 스마트 팩토리 연구실의 대학원생이다. 실험 계획서를 600자 안팎, 소제목 4개(가설/데이터와 조건/평가/위험과 대안)로 쓴다.'

def write(draft=None, feedback=None):
    if draft is None:
        user = TASK
    else:
        user = f'요청: {TASK}\n\n지난 초안:\n{draft}\n\n심사 의견:\n- ' + '\n- '.join(feedback) + '\n\n심사 의견을 반영해 계획서를 다시 써 줘.'
    return text_of(call('writer', model=MAIN, max_tokens=1500, system=WRITER_SYSTEM, messages=[{'role': 'user', 'content': user}]))

def review(draft, tag='reviewer'):
    out = forced(tag, MAIN, REVIEW, f'요청: {TASK}\n\n{RUBRIC}\n\n초안:\n{draft}', system=REVIEWER_SYSTEM)
    out['total'] = sum(max(0, min(25, int(v))) for v in out['scores'].values())   # 합계는 코드가 계산
    return out

history = []
draft = write()
for rnd in range(1, MAX_ROUNDS + 1):
    rv = review(draft)
    history.append({'round': rnd, 'total': rv['total'], **rv['scores']})
    print(f"[{rnd}라운드] {rv['total']}점 {rv['scores']}")
    if rv['total'] >= PASS_LINE:
        print('→ 통과'); break
    if len(history) > 1 and rv['total'] <= history[-2]['total']:
        print('→ 개선 없음, 멈춤'); break
    if rnd == MAX_ROUNDS:
        print('→ 최대 라운드, 멈춤'); break
    draft = write(draft, rv['feedback'])
print('\n=== 마지막 초안 ===\n' + draft)

# %%
import matplotlib.pyplot as plt
h = pd.DataFrame(history)
ax = h.set_index('round')[['hypothesis', 'data', 'metric', 'risk']].plot(kind='bar', stacked=True, figsize=(6, 3.2))
ax.axhline(PASS_LINE, ls='--', c='green'); ax.set_ylabel('score'); ax.set_title('review score by round')
plt.tight_layout(); plt.show()
print('루프 비용: $%.4f' % sum(r['usd'] for r in LOG if r['tag'] in ('writer', 'reviewer')))

# %% [markdown]
# ## C. 자기 검토 실험
# 같은 초안을 두 방식으로 채점합니다.
# - **독립 검토**: 새 컨텍스트, 초안과 기준표만
# - **자기 검토**: 작성자의 대화를 이어서 "네가 쓴 초안을 채점해" — 작성 의도와 변명을 다 아는 상태
#
# LLM 출력은 확률적이므로 **여러 번 반복해 평균**을 봅니다.

# %%
N_REPEAT = 3
first_draft_msgs = [{'role': 'user', 'content': TASK}]
r = call('writer', model=MAIN, max_tokens=1500, system=WRITER_SYSTEM, messages=first_draft_msgs)
d0 = text_of(r)
first_draft_msgs.append({'role': 'assistant', 'content': d0})

def self_review():
    msgs = first_draft_msgs + [{'role': 'user', 'content': f'좋아. 이제 네가 방금 쓴 계획서를 아래 기준표로 채점해 줘.\n\n{RUBRIC}'}]
    r = call('self', model=MAIN, max_tokens=800, system=WRITER_SYSTEM, messages=msgs,
             tools=[REVIEW], tool_choice={'type': 'tool', 'name': 'submit_review'})
    out = next(b.input for b in r.content if b.type == 'tool_use')
    return sum(max(0, min(25, int(v))) for v in out['scores'].values())

indep = [review(d0, tag='indep')['total'] for _ in range(N_REPEAT)]
selfs = [self_review() for _ in range(N_REPEAT)]
cmp = pd.DataFrame({'독립 검토': indep, '자기 검토': selfs})
print(cmp.describe().loc[['mean', 'std']].round(1))
cmp

# %% [exercise]
# 직접 바꿔 보기 3: 검토자 모델을 SMALL 로 바꾸면 점수의 평균과 흩어짐(std)이 어떻게 변하나요?
# 직접 바꿔 보기 4: PASS_LINE 을 90 으로 올리고 B를 다시 돌려 보세요. 어느 멈춤 조건에 걸리나요? 비용은?
print(pd.DataFrame(LOG).groupby('tag')[['in', 'out', 'usd']].sum().round(4))

# %% [markdown]
# ## 정리
# - 라우터: 분류는 작은 모델, 분기는 코드. 애매한 요청은 confidence 로 사람에게.
# - 작성–검토: 기준표 · 코드로 계산한 합계 · 세 가지 멈춤 조건.
# - 자기 검토는 후해지기 쉽다 → 만드는 자와 평가하는 자의 **맥락을 분리**한다. 그래도 같은 모델 계열의 맹점은 남으니 사람 표본 검토를 곁들인다(5회).
#
# **AI에게 물어볼 만한 질문**: "이 실험 결과(독립 검토 vs 자기 검토 점수)를 논문의 한 문단으로 쓴다면 어떤 한계와 추가 실험을 함께 적어야 할까?"
