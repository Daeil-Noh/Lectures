# %% [markdown]
# # 4주 3차시 · AI 코드 검증 기초: 환각과 편향
#
# **학습 목표**
# - 오류 없이 실행된 AI 코드의 결과를 **직접 계산한 참값**과 비교해 검증할 수 있다.
# - AI가 지어낸 함수·인자, 추측한 열 이름·단위, 말없이 지워진 행을 찾아낼 수 있다.
#
# **사용 데이터** `process.csv` — 사출 성형 공정 기록(가상 데이터, 494행). 근무조(`shift`), 라인(`line`), 설비(`machine`), 인장강도(`strength`, MPa), 불량 여부(`defect`, 0/1) 등.
#
# > 이 파일의 “AI의 답”은 강의용으로 만든 예시입니다. 실제 생성형AI가 늘 이렇게 틀린다는 뜻이 아니라, **이런 실수가 있을 수 있으니 확인하는 습관**을 기르자는 것입니다.

# %% [markdown]
# ## 0. 준비

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import pandas as pd
import inspect            # 함수가 어떤 인자를 받는지 확인하는 도구

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'

# %%
df = pd.read_csv(DATA + 'process.csv')
print('행, 열 =', df.shape)
df.head(3)

# %% [markdown]
# ## 1. AI의 답: “야간 불량률은 13.8%입니다”
# “야간 근무조의 불량률을 구해 줘”라고 요청했더니 AI가 아래 코드와 함께 **“야간 불량률은 13.8%로 전체와 비슷하며, 근무조에 따른 차이는 크지 않습니다.”** 라고 답했습니다. 먼저 그대로 실행해 봅니다.

# %%
# ===== AI의 답 (예시) =====
night = df[df['shift'] == '야간']
rate = df['defect'].mean() * 100
print(f'야간 불량률: {rate:.1f}%')

# %% [markdown]
# 오류 없이 실행됐습니다. 그런데 **오류가 없다 ≠ 맞다**. 검증 습관을 차례로 적용해 봅니다.
#
# **검증 ② 모양 확인** — 계산에 쓴 표의 행 수를 봅니다.

# %%
print('전체 df 행 수   :', len(df))
print('night 행 수     :', len(night))
print('AI가 계산에 쓴 표: df  ← night가 아니다!')

# %% [markdown]
# **검증 ③ 손 계산** — 야간 행만 골라 “불량 개수 ÷ 행 수”를 직접 셉니다. `mean()`을 쓰지 않는 **다른 방법**으로 같은 값이 나오는지 보는 것이 핵심입니다.

# %%
n_bad = night['defect'].sum()       # 야간 불량 개수 (1의 개수)
n_all = len(night)                  # 야간 전체 개수
print('야간 불량', n_bad, '개 ÷', n_all, '개 =', round(n_bad / n_all * 100, 1), '%')
print('참고: 전체 불량률 =', round(df['defect'].mean() * 100, 1), '%  ← AI가 말한 13.8%와 같다')

# %% [markdown]
# **고친 코드** — `df`를 `night`로 바꾸고, 주간도 함께 구해 비교합니다. “차이가 크지 않다”는 AI의 결론도 확인합니다.

# %%
rate_night = night['defect'].mean() * 100
rate_day = df[df['shift'] == '주간']['defect'].mean() * 100
print(f'야간 {rate_night:.1f}% / 주간 {rate_day:.1f}%  → 약 {rate_night / rate_day:.1f}배')

# 한 줄로 두 근무조를 한꺼번에 (4-1에서 쓴 방법)
print((df.groupby('shift')['defect'].mean() * 100).round(1))

# %% [markdown]
# ## 2. 지어낸 함수·인자 확인하기
# AI가 “`df.remove_outliers('strength')`로 이상치를 지우세요”, “`pd.read_csv(..., auto_clean=True)`로 읽으면 자동 정리됩니다”라고 했다고 합시다.
# 실행하면 오류가 나서 금방 드러나지만, **미리 확인하는 방법**도 있습니다.

# %%
# 그런 기능이 있나? (hasattr = has attribute, 그 이름의 기능을 가지고 있는가)
print('remove_outliers 있음?', hasattr(df, 'remove_outliers'))
print('dropna 있음?         ', hasattr(df, 'dropna'))       # 비교: 실제로 있는 기능

# read_csv가 받는 인자 목록에 있나?
params = inspect.signature(pd.read_csv).parameters
print('auto_clean 인자 있음?', 'auto_clean' in params)
print('encoding 인자 있음?  ', 'encoding' in params)          # 비교: 실제로 있는 인자

# %%
# 실제로 실행하면? (오류 메시지 읽기는 4-2에서)
try:
    df.remove_outliers('strength')
except Exception as e:
    print(type(e).__name__, ':', e)

try:
    pd.read_csv(DATA + 'process.csv', auto_clean=True)
except Exception as e:
    print(type(e).__name__, ':', e)

# %% [markdown]
# 공식 문서(pandas.pydata.org)에서 함수 이름을 검색해 보는 것도 좋은 방법입니다. 없으면 AI에게 **“그 함수가 pandas에 실제로 있어? 문서 주소를 알려 줘”** 라고 되묻습니다.
#
# ## 3. 단위·규모 추측 확인하기
# AI가 “인장강도 400 MPa 미만이면 강도 부족”이라는 기준으로 코드를 짰습니다. 데이터와 맞는지 봅니다.

# %%
weak = df[df['strength'] < 400]            # AI가 쓴 기준
print('강도 부족 판정:', len(weak), '/', len(df), '개')

# 이 데이터의 인장강도는 실제로 어느 범위일까?
print(df['strength'].describe().round(2))

# %% [markdown]
# 전부 “부족”으로 나온다면 기준이 데이터와 맞지 않는 것입니다. 이 데이터의 인장강도는 약 27~47 MPa입니다. 금속에서 흔한 수백 MPa 기준을 그대로 가져온 것으로 보입니다. **기준값은 전공 지식과 데이터의 범위로 확인**합니다.
#
# ## 4. 말없이 사라지는 행
# AI가 “이상치를 제거하고 분석하세요”라며 아래 코드를 주었습니다. **지우기 전과 후**를 비교합니다.

# %%
m = df['strength'].mean()
s = df['strength'].std()
clean = df[(df['strength'] - m).abs() <= 2 * s]      # AI의 이상치 제거 (평균 ± 2 표준편차)

print('행 수     :', len(df), '→', len(clean))
print('불량 개수 :', df['defect'].sum(), '→', clean['defect'].sum())
print('불량률(%) :', round(df['defect'].mean() * 100, 1), '→', round(clean['defect'].mean() * 100, 1))

# %% [markdown]
# 지운 행 중 상당수가 **불량품**입니다. 불량품은 인장강도가 낮은 편이라 “이상치”로 함께 잘렸고, 그 결과 불량률이 실제보다 **좋아 보이게** 됐습니다. 이상치를 지울지는 **분석 목적**에 따라 판단해야 합니다(6주 2차시).
#
# ## 5. 직접 바꿔 보기
# **과제 1.** 이상치 기준 `k`를 `3`, `1.5`, `1`로 바꿔 보세요. 지워지는 불량품 수와 불량률은 어떻게 변하나요?

# %% [exercise]
k = 2       # ← 3, 2.5, 1.5, 1 로 바꿔 보기

clean = df[(df['strength'] - m).abs() <= k * s]
gone = df['defect'].sum() - clean['defect'].sum()
print(f'k = {k}: 남은 행 {len(clean)} / 지워진 행 {len(df) - len(clean)} / 그중 불량품 {gone}개')
print(f'불량률 {df["defect"].mean() * 100:.1f}% → {clean["defect"].mean() * 100:.1f}%')

# %% [markdown]
# **과제 2. AI의 다른 주장 검증하기** — AI가 **“3라인의 야간 불량률이 23.1%로 가장 높습니다.”** 라고 했습니다.
# `line`과 `shift`를 바꿔 가며 직접 계산해 확인해 보세요. (`claim`에 AI가 말한 숫자를 넣으면 맞는지 판정합니다.)

# %% [exercise]
line = '3라인'      # ← '1라인', '2라인' 으로 바꿔 보기
shift = '야간'      # ← '주간' 으로 바꿔 보기
claim = 23.1        # ← AI가 말한 숫자

part = df[(df['line'] == line) & (df['shift'] == shift)]
true_rate = part['defect'].sum() / len(part) * 100
print(f'{line} {shift}: {part["defect"].sum()}개 ÷ {len(part)}개 = {true_rate:.1f}%')
if abs(true_rate - claim) < 0.05:
    print('AI의 숫자와 일치')
else:
    print('AI의 숫자와 다름! →', claim, 'vs', round(true_rate, 1))

# %% [markdown]
# **과제 3.** AI가 **“평균 인장강도가 가장 높은 설비는 2호기입니다.”** 라고 했습니다. 맞나요? `col`을 `'temp'`나 `'humidity'`로 바꿔 다른 주장도 확인해 보세요.

# %% [exercise]
col = 'strength'     # ← 'temp', 'humidity', 'thickness' 로 바꿔 보기

by_machine = df.groupby('machine')[col].mean().sort_values(ascending=False)
print(by_machine.round(2))
print('가장 높은 설비:', by_machine.index[0])

# %% [markdown]
# ## 정리
# - **오류 없이 실행돼도 틀릴 수 있다.** 계산에 쓴 표(df? night?)와 행 수부터 확인합니다.
# - **다른 방법으로 손 계산**해서 같은 숫자가 나오는지 봅니다(`sum() / len()` vs `mean()`).
# - 낯선 함수·인자는 `hasattr`, `inspect.signature`, 공식 문서로 **실제로 있는지** 확인합니다.
# - 기준값·단위는 **데이터의 범위와 전공 지식**으로 확인하고, 행을 지우는 코드는 **전후의 행 수와 무엇이 지워졌는지**를 봅니다.
# - AI에게 질문할 때는 개인정보·기밀을 넣지 않고, 답을 정해 놓고 묻지 않습니다(“야간이 더 나쁘지?” 대신 “근무조별 불량률을 비교해 줘”).
#
# **생성형AI에게 물어볼 만한 질문**
# - “방금 코드에서 행을 지우거나 걸러 내는 줄이 있으면 모두 알려 주고, 몇 행이 사라질 수 있는지 확인하는 코드도 함께 줘.”
# - “이 코드가 가정하고 있는 것(열 이름, 단위, 기준값)을 목록으로 정리해 줘. 내가 데이터에서 직접 확인할 수 있게.”
