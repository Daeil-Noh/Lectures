# %% [markdown]
# # 10주 1차시 · 회귀의 개념
#
# **학습 목표**
# - 회귀가 “숫자를 예측하는” 지도학습임을 이해한다.
# - 직선 규칙 `강도 = a × 압력 + b` 에서 기울기 a 와 절편 b 의 뜻을 말한다.
# - 잔차(실제 − 예측)와 오차 제곱합을 계산하고, 최소제곱 직선이 무엇인지 확인한다.
#
# **사용 데이터** — `process.csv` (사출 성형 공정 기록, 가상 데이터 494행)
# - `pressure` : 사출 압력 (bar)
# - `strength` : 인장강도 (MPa) ← 오늘 예측할 **목표(정답)**
#
# 위에서부터 셀을 하나씩 실행하세요 (Shift + Enter).

# %% [markdown]
# ## 0. 준비
# 한글 그래프용 패키지를 설치하고, 필요한 라이브러리를 불러옵니다.

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import pandas as pd
import matplotlib.pyplot as plt

# %% [markdown]
# ## 1. 데이터 불러오기
# 오늘은 `pressure`(압력)와 `strength`(인장강도) 두 열만 봅니다.

# %%
DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
df = pd.read_csv(DATA + 'process.csv')
print('행, 열 =', df.shape)
df[['product_id', 'pressure', 'strength']].head()

# %% [markdown]
# ## 2. 산점도로 관계 보기
# 점 하나 = 제품 하나. 압력이 높을수록 강도가 높은 경향이 보이나요?

# %%
plt.figure(figsize=(6, 4))
plt.scatter(df['pressure'], df['strength'], s=12, alpha=0.5)
plt.xlabel('압력 (bar)')
plt.ylabel('인장강도 (MPa)')
plt.title('압력과 인장강도')
plt.show()
print('상관계수 =', round(df['pressure'].corr(df['strength']), 2))

# %% [markdown]
# ## 3. 내가 직선을 정해 보기
# `강도 = a × 압력 + b` 의 a, b 를 직접 정해 봅니다.
# - **예측값** = a × 압력 + b
# - **잔차** = 실제값 − 예측값 (직선 위의 점은 +, 아래의 점은 −)
# - **오차 제곱합** = 잔차를 제곱해서 모두 더한 값 (작을수록 좋은 직선)

# %% [exercise]
# ✏️ 직접 바꿔 보기 1: a, b 를 바꿔 오차 제곱합을 줄여 보세요. (예: a = 0.4, b = 6)
a = 0.3
b = 15

df['내예측'] = a * df['pressure'] + b
df['내잔차'] = df['strength'] - df['내예측']
my_sse = (df['내잔차'] ** 2).sum()
print(f'내 직선: 강도 = {a} × 압력 + {b}')
print('내 직선의 오차 제곱합 =', round(my_sse, 1))

# %% [markdown]
# 제품 5개만 골라 실제값·예측값·잔차를 확인해 봅니다.

# %%
df[['product_id', 'pressure', 'strength', '내예측', '내잔차']].head().round(2)

# %% [markdown]
# ## 4. 컴퓨터가 최소제곱 직선 찾기
# `LinearRegression` 은 오차 제곱합이 **가장 작은** a, b 를 찾아 줍니다.
# - `X` 는 입력(특성) — 대괄호 두 겹 `[['pressure']]` 로 **표 모양**으로 넣습니다.
# - `y` 는 정답(목표) — 대괄호 한 겹.

# %%
from sklearn.linear_model import LinearRegression

X = df[['pressure']]        # 입력: 압력 (표 모양)
y = df['strength']          # 정답: 인장강도

model = LinearRegression()  # 직선 모델 준비
model.fit(X, y)             # 학습: 최소제곱 직선 찾기
print('기울기 a =', round(model.coef_[0], 3))
print('절편 b =', round(model.intercept_, 2))

# %% [markdown]
# 컴퓨터 직선의 오차 제곱합을 내 직선과 비교해 봅니다.

# %%
df['모델예측'] = model.predict(X)
best_sse = ((df['strength'] - df['모델예측']) ** 2).sum()
print('내 직선의 오차 제곱합     =', round(my_sse, 1))
print('최소제곱 직선의 오차 제곱합 =', round(best_sse, 1))

# %% [markdown]
# 두 직선을 산점도 위에 함께 그려 봅니다.

# %%
xs = pd.DataFrame({'pressure': [60, 100]})
plt.figure(figsize=(6, 4))
plt.scatter(df['pressure'], df['strength'], s=12, alpha=0.4)
plt.plot(xs['pressure'], a * xs['pressure'] + b, '--', color='gray', label='내 직선')
plt.plot(xs['pressure'], model.predict(xs), color='tab:orange', linewidth=3, label='최소제곱 직선')
plt.xlabel('압력 (bar)')
plt.ylabel('인장강도 (MPa)')
plt.legend()
plt.show()

# %% [markdown]
# ## 5. 새 제품 예측하기
# 학습한 직선으로 아직 측정하지 않은 제품의 강도를 예측합니다.
# 입력은 학습 때와 똑같은 **열 이름**의 표로 넣어야 합니다.

# %% [exercise]
# ✏️ 직접 바꿔 보기 2: 압력을 바꿔 보세요. (데이터에 있는 62~98 bar 범위 안에서)
new_pressure = 85

new = pd.DataFrame({'pressure': [new_pressure]})
pred = model.predict(new)[0]
print(f'압력 {new_pressure} bar → 예측 강도 {pred:.2f} MPa')

# %% [markdown]
# ## 6. 입력을 바꿔 보기
# 압력 대신 다른 열 하나로 예측하면 오차 제곱합은 어떻게 될까요?
# 상관이 약한 입력일수록 오차 제곱합이 커집니다.

# %% [exercise]
# ✏️ 직접 바꿔 보기 3: x_col 을 'thickness', 'humidity', 'speed', 'temp' 로 바꿔 보세요.
x_col = 'thickness'

m2 = LinearRegression().fit(df[[x_col]], y)
sse2 = ((y - m2.predict(df[[x_col]])) ** 2).sum()
print(f'입력 = {x_col}: 기울기 {m2.coef_[0]:.3f}, 절편 {m2.intercept_:.2f}')
print(f'오차 제곱합 = {sse2:.1f}  (압력으로 예측: {best_sse:.1f})')

# %% [markdown]
# ## 7. 미리 보기: 입력이 여러 개라면
# 표에 열을 더 넣기만 하면 됩니다. 입력마다 계수가 하나씩 생깁니다 → 다음 차시에 자세히.

# %%
m3 = LinearRegression().fit(df[['pressure', 'thickness']], y)
sse3 = ((y - m3.predict(df[['pressure', 'thickness']])) ** 2).sum()
print('계수 (압력, 두께) =', m3.coef_.round(3), ' 절편 =', round(m3.intercept_, 2))
print('오차 제곱합 =', round(sse3, 1), ' ← 압력만 쓸 때보다 작아졌나요?')

# %% [markdown]
# ## 정리
# - **회귀** = 입력으로 숫자(강도 MPa)를 예측하는 지도학습
# - **직선 규칙** `강도 = a × 압력 + b` : a 는 압력이 1 bar 늘 때 강도가 늘어나는 정도
# - **잔차** = 실제 − 예측, **최소제곱법** = 잔차 제곱의 합이 가장 작은 직선을 고르는 방법
# - 회귀(숫자 예측)와 분류(종류 판정)는 “답의 형태”로 구분한다
#
# **생성형AI에게 물어볼 만한 질문**
# - “`LinearRegression` 의 `coef_` 와 `intercept_` 가 무엇인지, 압력과 인장강도 예시로 고등학생도 알 수 있게 설명해 줘.”
# - “오차를 그냥 더하지 않고 제곱해서 더하는 이유를 예를 들어 설명해 줘. 절댓값을 더하는 방법과는 무엇이 다른지도 알려 줘.”
#
# AI의 설명을 읽은 뒤에는 **이 노트북의 숫자로 직접 확인**해 보세요.
