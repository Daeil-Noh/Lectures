# %% [markdown]
# # 9주 2차시 · 훈련 데이터와 시험 데이터 나누기
#
# **학습 목표**
# - 학습에 쓴 데이터로 채점하면 왜 믿을 수 없는지 **직접 확인**한다.
# - `train_test_split` 으로 데이터를 훈련용·시험용으로 나누고, `test_size`·`random_state` 의 뜻을 안다.
# - 훈련 오차와 시험 오차를 비교해 **외운 모델(과적합)** 을 알아본다.
# - 불량처럼 드문 범주가 있을 때 `stratify` 로 비율을 지켜 나눈다.
#
# **사용 데이터** — `process.csv` (사출 성형 공정 기록 494행, 실습용 가상 데이터)
# - 입력 X: 공정 조건 5개 `temp, pressure, speed, humidity, thickness`
# - 정답 y: 인장강도 `strength`(MPa, 회귀) / 불량 여부 `defect`(0·1, 분류)
#
# 채점 기준은 **평균 오차(MAE)**: 예측값과 실제값 차이의 평균, **작을수록 좋다** (10주에 자세히).

# %% [markdown]
# ## 0. 준비

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib

# %%
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_absolute_error as mae   # 평균 오차, 짧은 이름으로

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
df = pd.read_csv(DATA + 'process.csv')

cols = ['temp', 'pressure', 'speed', 'humidity', 'thickness']
X = df[cols]            # 입력: 공정 조건 5개
y = df['strength']      # 정답: 인장강도
print(X.shape, y.shape)

# %% [markdown]
# ## 1. 함정: 전부로 학습하고, 같은 데이터로 채점하기
# 의사결정나무(`DecisionTreeRegressor`)는 깊이를 제한하지 않으면 훈련 데이터를 **거의 외워 버립니다.**
# 494개 전부로 학습하고 **같은 494개로** 채점하면?

# %%
memo = DecisionTreeRegressor(random_state=0)
memo.fit(X, y)                                  # 494개로 학습
print('평균 오차:', mae(y, memo.predict(X)))     # 같은 494개로 채점

# %% [markdown]
# 0.0 — 완벽해 보입니다. 하지만 모델이 **이미 본 문제**로 시험을 친 셈입니다. 처음 보는 제품에서도 그럴까요?

# %% [markdown]
# ## 2. train_test_split 으로 나누기
# - `test_size=0.2` → 20%(99행)는 시험용, 80%(395행)는 훈련용
# - `random_state=0` → 섞는 방법을 고정하는 번호. 같은 번호면 언제 실행해도 **같은 결과**
# - 결과는 항상 **X_train, X_test, y_train, y_test** 순서로 받습니다.

# %%
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

print('훈련용:', X_train.shape, y_train.shape)
print('시험용:', X_test.shape, y_test.shape)

# %% [markdown]
# ## 3. 학습은 train으로만, 채점은 둘 다
# 외운 모델(깊이 제한 없는 나무)과 단순한 규칙(직선 회귀)을 **똑같이** 학습시키고, 훈련 데이터 오차와 시험 데이터 오차를 나란히 봅니다.

# %%
models = {
    '외운 모델(나무)': DecisionTreeRegressor(random_state=0),
    '직선 회귀': LinearRegression(),
}
rows = []
for name, m in models.items():
    m.fit(X_train, y_train)                              # 학습: train 만
    rows.append({'모델': name,
                 '훈련 오차': round(mae(y_train, m.predict(X_train)), 2),
                 '시험 오차': round(mae(y_test, m.predict(X_test)), 2)})
result = pd.DataFrame(rows)
result

# %%
result.set_index('모델').plot.bar(figsize=(7, 4), rot=0)
plt.ylabel('평균 오차 (MPa) — 작을수록 좋다')
plt.title('훈련 오차 vs 시험 오차')
plt.show()

# %% [markdown]
# 외운 모델은 훈련 오차 0.0 이지만 시험 오차는 직선 회귀보다 큽니다. 훈련 데이터의 **잡음까지 외운** 상태 — **과적합(overfitting)** 입니다 (11주에 자세히).
# 시험 데이터가 없었다면 이 차이를 볼 수 없었습니다.

# %% [markdown]
# ## 4. random_state 를 바꾸면?
# 섞는 번호만 바꿔서 같은 실험을 5번 해 봅니다. 시험 오차가 조금씩 달라집니다 — 그래서 **번호를 고정해 적어 두어야** 다른 사람이 같은 결과를 재현할 수 있습니다.

# %%
for rs in range(5):
    a, b, c, d = train_test_split(X, y, test_size=0.2, random_state=rs)
    m = DecisionTreeRegressor(random_state=0).fit(a, c)
    print(f'random_state={rs}: 외운 모델 시험 오차 {mae(d, m.predict(b)):.2f}')

# %% [markdown]
# ## 5. stratify: 불량 비율을 지켜 나누기
# 이번에는 정답을 `defect`(불량 여부)로 바꿉니다. 불량은 494개 중 68개(13.8%)뿐이라, 그냥 나누면 운에 따라 시험 데이터에 불량이 너무 적거나 많이 들어갈 수 있습니다.

# %%
yd = df['defect']
print('전체 불량률:', round(yd.mean(), 3))

for rs in range(5):
    _, _, tr1, te1 = train_test_split(X, yd, test_size=0.2, random_state=rs)
    _, _, tr2, te2 = train_test_split(X, yd, test_size=0.2, random_state=rs, stratify=yd)
    print(f'random_state={rs}: 그냥 나누기 시험 데이터 불량률 {te1.mean():.3f}  |  stratify {te2.mean():.3f}')

# %% [markdown]
# `stratify=yd` 를 주면 양품 무리와 불량 무리를 **각각** 8:2로 나눠 합치므로, 어떤 번호로 섞어도 시험 데이터 불량률이 전체(0.138)와 거의 같습니다.
# 불량·고장처럼 드문 범주가 있는 **분류** 문제에서는 기본으로 써 두는 것이 좋습니다.

# %% [markdown]
# ## 6. 직접 바꿔 보기
# 값을 바꾸고 다시 실행해 보세요. 기본값 그대로도 실행됩니다.
#
# **과제 1.** `test_size` 를 0.1, 0.3, 0.5 로 바꿔 보세요. 훈련·시험 행 수와 두 모델의 오차는 어떻게 달라지나요?

# %% [exercise]
my_test_size = 0.3        # ← 0.1 ~ 0.5 사이로 바꿔 보세요
a, b, c, d = train_test_split(X, y, test_size=my_test_size, random_state=0)
print('훈련', len(a), '행 / 시험', len(b), '행')
for name, m in [('외운 모델', DecisionTreeRegressor(random_state=0)), ('직선 회귀', LinearRegression())]:
    m.fit(a, c)
    print(f'{name}: 훈련 오차 {mae(c, m.predict(a)):.2f}, 시험 오차 {mae(d, m.predict(b)):.2f}')

# %% [markdown]
# **과제 2.** 나무의 깊이(`max_depth`)를 2, 3, 5, 10 으로 제한해 보세요. 깊이를 제한하면 외우기가 줄어듭니다. 훈련 오차와 시험 오차의 **차이**가 어떻게 변하나요?

# %% [exercise]
my_depth = 3              # ← 2, 3, 5, 10, None 등으로 바꿔 보세요
t = DecisionTreeRegressor(max_depth=my_depth, random_state=0).fit(X_train, y_train)
tr, te = mae(y_train, t.predict(X_train)), mae(y_test, t.predict(X_test))
print(f'max_depth={my_depth}: 훈련 오차 {tr:.2f}, 시험 오차 {te:.2f}, 차이 {te - tr:.2f}')

# %% [markdown]
# **과제 3.** `stratify` 를 쓴 나누기와 안 쓴 나누기에서, `random_state` 를 바꿔 가며 **훈련 데이터** 쪽 불량 개수를 비교해 보세요.

# %% [exercise]
my_rs = 7                 # ← 0 ~ 9 로 바꿔 보세요
_, _, tr1, te1 = train_test_split(X, yd, test_size=0.2, random_state=my_rs)
_, _, tr2, te2 = train_test_split(X, yd, test_size=0.2, random_state=my_rs, stratify=yd)
print('그냥 나누기  → 훈련 데이터 불량', tr1.sum(), '개 / 시험 데이터 불량', te1.sum(), '개')
print('stratify    → 훈련 데이터 불량', tr2.sum(), '개 / 시험 데이터 불량', te2.sum(), '개')

# %% [markdown]
# ## 정리
# - 학습에 쓴 데이터로 채점하면 **외운 모델도 완벽해 보인다** → 채점용(시험) 데이터는 **학습이 끝날 때까지 숨긴다.**
# - `train_test_split(X, y, test_size=0.2, random_state=0)` — 보통 **7:3 · 8:2**, 번호를 고정해 **재현 가능**하게.
# - **훈련 오차 ≪ 시험 오차**면 과적합을 의심한다 (11주).
# - 드문 범주가 있는 분류 문제는 `stratify=y`.
#
# **생성형AI에게 물어볼 만한 질문**
# - “train_test_split에서 test_size, random_state, stratify가 각각 무슨 뜻인지 예시 코드와 함께 설명해 줘.”
# - “훈련 오차는 0인데 시험 오차가 큰 모델은 어떤 상태야? 의사결정나무에서 이걸 줄이는 방법을 알려 줘.”
#
# AI가 알려 준 방법은 위 **과제 2** 처럼 직접 실행해서 시험 오차가 정말 줄어드는지 확인하세요.
