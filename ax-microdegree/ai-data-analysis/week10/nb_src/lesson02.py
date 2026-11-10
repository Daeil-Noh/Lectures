# %% [markdown]
# # 10주 2차시 · 공정 조건으로 품질 예측하기
#
# **학습 목표**
# - 입력 X(공정 조건 5개)와 목표 y(인장강도)를 정하고, 훈련용·시험용으로 나눈다.
# - `LinearRegression` 으로 학습하고 `coef_`(계수)를 단위와 함께 해석한다.
# - 새 제품의 강도를 예측하고, 직선이 놓친 온도의 곡선 관계를 새 특성으로 보완한다.
#
# **사용 데이터** — `process.csv` (사출 성형 공정 기록, 가상 데이터 494행)
# - 입력: `pressure`(압력, bar), `thickness`(두께, mm), `humidity`(습도, %), `speed`(속도, rpm), `temp`(온도, ℃)
# - 목표: `strength`(인장강도, MPa)

# %% [markdown]
# ## 0. 준비

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
df = pd.read_csv(DATA + 'process.csv')
df.head(3)

# %% [markdown]
# ## 1. X 와 y 정하고 나누기
# - X: 생산할 때 **미리 알 수 있는** 공정 조건 5개
# - y: 맞히고 싶은 인장강도
# - `defect`(불량 여부)는 강도를 잰 뒤에야 정해지는 결과라서 입력에 넣지 않습니다.
#
# 훈련용 80%, 시험용 20% 로 나눕니다. `random_state=42` 로 나누는 방식을 고정합니다.

# %%
features = ['pressure', 'thickness', 'humidity',
            'speed', 'temp']
X = df[features]       # 입력: 공정 조건 5개
y = df['strength']     # 목표: 인장강도

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)  # 8:2
print(X_train.shape, X_test.shape)

# %% [markdown]
# ## 2. 학습하고 계수 보기
# `fit` 은 **훈련용 데이터로만** 합니다. 시험용은 다음 차시에 채점할 때 씁니다.

# %%
model = LinearRegression()
model.fit(X_train, y_train)   # 훈련용으로만 학습

coef = pd.Series(model.coef_, index=features)
print(coef.round(4))          # 입력별 계수
print('절편 b =', round(model.intercept_, 2))

# %% [markdown]
# ## 3. 계수를 “읽기 쉬운 단위”로 바꿔 막대그래프로 보기
# 계수는 “입력 1 단위당” 강도 변화입니다. 두께 1 mm 는 너무 큰 변화이므로,
# 현장에서 말이 되는 변화량(압력 +1 bar, 두께 +0.1 mm, 습도 +10 %, 속도 +100 rpm, 온도 +10 ℃)을 곱해서 비교합니다.

# %%
step = pd.Series({'pressure': 1, 'thickness': 0.1, 'humidity': 10, 'speed': 100, 'temp': 10})
effect = coef * step          # 변화량만큼 바꿨을 때의 강도 변화 (MPa)
print(effect.round(2))

colors = ['tab:blue' if v > 0 else 'tab:orange' for v in effect]
plt.figure(figsize=(6, 3.5))
plt.barh(['압력 +1bar', '두께 +0.1mm', '습도 +10%', '속도 +100rpm', '온도 +10℃'], effect, color=colors)
plt.axvline(0, color='gray')
plt.xlabel('강도 변화 (MPa)')
plt.title('다른 조건은 그대로 두고 하나만 바꿀 때')
plt.show()

# %% [exercise]
# ✏️ 직접 바꿔 보기 1: step 대신 “보통 변하는 폭(표준편차)”으로 비교해 보세요.
#    아래 줄을 그대로 실행하면 표준편차 기준 결과가 나옵니다. 어떤 조건의 영향이 가장 큰가요?
step2 = df[features].std()
print('표준편차:'); print(step2.round(3))
print('표준편차만큼 바꿀 때 강도 변화 (MPa):'); print((coef * step2).round(2))

# %% [markdown]
# ## 4. 새 제품의 강도 예측하기
# 열 이름은 학습 때와 **똑같이** 넣어야 합니다.

# %%
# 생산 예정 제품의 공정 조건 (열 이름은 학습 때와 같게)
new = pd.DataFrame({
    'pressure': [85], 'thickness': [2.02],
    'humidity': [55], 'speed': [1200], 'temp': [210]})
pred = model.predict(new)
print('예측 강도:', pred.round(2), 'MPa')

# %% [exercise]
# ✏️ 직접 바꿔 보기 2: 조건을 바꿔 예측 강도 42 MPa 이상을 만들어 보세요.
#    (데이터에 있는 범위: 압력 62~98, 두께 1.80~2.20, 습도 28~88, 속도 984~1405, 온도 192~235)
my = pd.DataFrame({
    'pressure': [85], 'thickness': [2.02],
    'humidity': [55], 'speed': [1200], 'temp': [210]})
print('내 조건의 예측 강도:', model.predict(my).round(2), 'MPa')

# %% [markdown]
# ## 5. 직선이 놓친 것: 온도
# 직선 모델의 온도 계수는 작은 음수(−0.056)였습니다. “온도는 낮을수록 좋다”는 뜻일까요?
# 시험용 제품의 **잔차(실제 − 예측)** 를 온도에 따라 그려 봅니다. 잔차에 모양이 남아 있다면 모델이 놓친 관계가 있다는 신호입니다.

# %%
resid = y_test - model.predict(X_test)
plt.figure(figsize=(6, 3.5))
plt.scatter(X_test['temp'], resid, s=18)
plt.axhline(0, color='gray')
plt.xlabel('온도 (℃)')
plt.ylabel('잔차 (MPa)')
plt.title('직선 모델의 잔차 — 온도 양 끝에서 아래로 처진다')
plt.show()

# %% [markdown]
# ## 6. 특성 하나 만들어 넣기
# 210℃(7주차 산점도에서 강도가 가장 높았던 부근)에서 **벗어난 정도의 제곱**을 새 열로 만듭니다.
# 위로든 아래로든 멀어질수록 커지는 값이라, 곡선(산 모양) 관계를 표현할 수 있습니다.

# %%
# 210℃에서 벗어난 정도의 제곱을 새 열로
df['temp_gap2'] = (df['temp'] - 210) ** 2
features2 = features + ['temp_gap2']

X2_train, X2_test, y_train, y_test = train_test_split(
    df[features2], y, test_size=0.2, random_state=42)
model2 = LinearRegression().fit(X2_train, y_train)
print(pd.Series(model2.coef_, index=features2).round(4))

# %% [markdown]
# 두 모델로 온도만 바꿔 가며 예측해 봅니다 (나머지 조건은 위의 새 제품과 같게).

# %%
temps = list(range(195, 230, 5))
rows = pd.DataFrame({'pressure': 85, 'thickness': 2.02, 'humidity': 55,
                     'speed': 1200, 'temp': temps})
rows['temp_gap2'] = (rows['temp'] - 210) ** 2
compare = pd.DataFrame({'온도': temps,
                        '직선 모델': model.predict(rows[features]).round(2),
                        '곡선 보완 모델': model2.predict(rows[features2]).round(2)})
print(compare.to_string(index=False))

plt.figure(figsize=(6, 3.5))
plt.plot(compare['온도'], compare['직선 모델'], 'o--', label='직선 모델')
plt.plot(compare['온도'], compare['곡선 보완 모델'], 'o-', label='곡선 보완 모델 (+temp_gap2)')
plt.xlabel('온도 (℃)')
plt.ylabel('예측 강도 (MPa)')
plt.legend()
plt.show()

# %% [exercise]
# ✏️ 직접 바꿔 보기 3: 기준 온도 center 를 200 이나 220 으로 바꿔 다시 학습해 보세요.
#    계수가 어떻게 바뀌고, 예측이 210 일 때보다 나빠지는지(시험용 오차 제곱합) 확인합니다.
center = 210
df['gap_try'] = (df['temp'] - center) ** 2
Xa_train, Xa_test, ya_train, ya_test = train_test_split(
    df[features + ['gap_try']], y, test_size=0.2, random_state=42)
m_try = LinearRegression().fit(Xa_train, ya_train)
sse_try = ((ya_test - m_try.predict(Xa_test)) ** 2).sum()
print(pd.Series(m_try.coef_, index=features + ['gap_try']).round(4))
print(f'기준 {center}℃ → 시험용 오차 제곱합 {sse_try:.1f}')

# %% [markdown]
# ## 정리
# - **나누고 → 학습 → 예측**: `train_test_split` → `fit(X_train, y_train)` → `predict(새 조건)`
# - **계수 읽기**: 다른 조건은 그대로 두고, 단위와 함께, 데이터 범위 안에서. 계수는 원인이라는 증거가 아니다.
# - **곡선은 특성으로**: `(온도 − 210)²` 같은 새 열을 넣으면 선형회귀도 곡선 관계를 표현한다 (특성 공학).
# - 모델이 “얼마나 잘” 맞히는지는 다음 차시에 시험용 데이터로 채점한다.
#
# **생성형AI에게 물어볼 만한 질문**
# - “선형회귀 계수 pressure 0.3525 (bar), thickness 13.3215 (mm), humidity −0.0580 (%), speed −0.0052 (rpm), temp −0.0562 (℃) 를 단위와 함께 한 문장씩 해석해 줘. 인과관계로 말하면 안 되는 이유도 알려 줘.”
# - “잔차를 입력 변수에 대해 그렸을 때 가운데가 높고 양 끝이 낮은 산 모양이 보이면 무슨 뜻이고, 어떻게 고칠 수 있어?”
#
# AI의 답에 나온 숫자는 **이 노트북의 출력과 같은지** 꼭 확인하세요.
