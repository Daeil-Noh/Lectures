# %% [markdown]
# # 9주 1차시 · 머신러닝이란? (지도·비지도 학습)
#
# **학습 목표**
# - 표에서 **입력(X, 특성)** 과 **정답(y, 목표 변수)** 을 골라낸다.
# - scikit-learn 의 기본 흐름 **모델 고르기 → `fit`(학습) → `predict`(예측)** 을 직접 실행해 본다.
# - 같은 흐름으로 **회귀**(숫자 예측), **분류**(범주 판정), **군집**(정답 없이 묶기)을 한 번씩 맛본다.
#
# **사용 데이터** (모두 실습용 가상 데이터)
# - `process.csv` — 사출 성형 공정 기록 494행: 온도·압력·속도·습도·두께, 인장강도(strength), 불량 여부(defect)
# - `vibration.csv` — 설비 6대 × 120일 진동 기록: rms(진동 세기), temp(설비 온도), failure(고장일=1)
#
# 위에서부터 차례로 ▶ 실행하세요. 오늘은 **모델이 얼마나 정확한지**는 따지지 않습니다 — 그건 다음 차시(9-2)의 주제입니다.

# %% [markdown]
# ## 0. 준비
# 한글 그래프용 패키지를 설치하고, 데이터를 읽어 옵니다.

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib

# %%
import pandas as pd
import matplotlib.pyplot as plt

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
df = pd.read_csv(DATA + 'process.csv')
print(df.shape)      # (행 수, 열 수)
df.head()

# %% [markdown]
# ## 1. 입력 X와 정답 y 나누기
# 머신러닝 모델에게는 **입력 표 X** 와 **정답 열 y** 를 따로 건네줍니다.
# - 입력 X: 대괄호를 **두 겹** `[[ ]]` 으로 써서 **표 모양**으로 고릅니다(입력 열이 여러 개일 수 있으므로).
# - 정답 y: 대괄호 **한 겹** `[ ]` 으로 **열 하나**를 고릅니다.

# %%
X = df[['pressure']]      # 입력: 사출 압력 (표 모양, 열 1개)
y = df['strength']        # 정답: 인장강도 (열 하나)

print('X 모양:', X.shape)   # (494, 1) → 494행 1열짜리 표
print('y 모양:', y.shape)   # (494,)   → 값 494개짜리 열

# %% [markdown]
# ## 2. 회귀: 모델 고르기 → fit(학습)
# 정답(인장강도)이 **숫자**이므로 **회귀** 문제입니다. 가장 단순한 회귀 모델인 직선 회귀(`LinearRegression`)를 씁니다.
# `fit(X, y)` 를 실행하는 순간, 모델이 494개 제품을 보고 “압력 → 강도” 규칙(직선)을 찾습니다.

# %%
from sklearn.linear_model import LinearRegression

model = LinearRegression()   # ① 모델 고르기
model.fit(X, y)              # ② 학습: 데이터에서 규칙 찾기

# 찾은 규칙: 강도 = 기울기 × 압력 + 절편
print('기울기:', round(model.coef_[0], 3))       # 압력 1 bar 오를 때 강도 변화(MPa)
print('절편:', round(model.intercept_, 2))

# %% [markdown]
# ## 3. predict(예측): 새 제품의 강도는?
# 아직 만들지 않은 제품의 압력 조건을 **입력과 같은 모양(표)** 으로 만들어 `predict` 에 넣습니다.

# %%
new = pd.DataFrame({'pressure': [70, 80, 90]})   # 새 제품 3개의 압력 조건
pred = model.predict(new)                        # ③ 예측
print(pred.round(2))                             # 답이 '숫자' → 회귀

# %% [markdown]
# 그래프로 보면, 모델이 찾은 규칙은 점들 사이를 지나는 **직선 하나**입니다. 점들이 직선에서 퍼져 있는 만큼 예측에도 오차가 생깁니다.

# %%
plt.figure(figsize=(7, 4))
plt.scatter(df['pressure'], df['strength'], s=10, alpha=0.4, label='실제 제품')
line = pd.DataFrame({'pressure': [62, 98]})
plt.plot(line['pressure'], model.predict(line), color='tab:orange', linewidth=3, label='학습한 직선')
plt.scatter(new['pressure'], pred, s=120, color='tab:red', zorder=3, label='새 제품 예측')
plt.xlabel('압력 (bar)')
plt.ylabel('인장강도 (MPa)')
plt.legend()
plt.show()

# %% [markdown]
# ## 4. 입력을 여러 개로
# 입력 열을 늘려도 코드 모양은 **똑같습니다**. 바뀌는 것은 `X` 를 만드는 한 줄뿐입니다.

# %%
cols = ['temp', 'pressure', 'speed', 'humidity', 'thickness']   # 공정 조건 5개
model5 = LinearRegression()
model5.fit(df[cols], df['strength'])

new5 = pd.DataFrame({'temp': [210, 225], 'pressure': [80, 80], 'speed': [1200, 1200],
                     'humidity': [55, 70], 'thickness': [2.00, 1.92]})
print(model5.predict(new5).round(2))   # 두 번째 제품: 온도·습도↑, 두께↓

# %% [markdown]
# ## 5. 분류: 같은 흐름, 다른 모델
# 이번 정답은 `defect`(0=양품, 1=불량)입니다. 숫자로 적혀 있지만 뜻은 **범주** → **분류** 문제입니다.
# 분류 모델 중 하나인 의사결정나무(`DecisionTreeClassifier`, 11주에 자세히)를 써 봅니다. **fit → predict 모양은 그대로**입니다.

# %%
from sklearn.tree import DecisionTreeClassifier

clf = DecisionTreeClassifier(max_depth=3, random_state=0)   # 모델 고르기 (질문 3단계까지만)
clf.fit(df[cols], df['defect'])                             # 학습

print(clf.predict(new5))                       # 답이 0 또는 1 → '범주'
print(clf.predict_proba(new5).round(2))        # [양품일 확률, 불량일 확률]

# %% [markdown]
# ### 잠깐: 입력에 넣으면 안 되는 열
# `defect_type`(불량 유형)을 입력에 넣으면 어떨까요? 아래 결과가 `True` 라면, `defect_type` 만 보면 정답을 **그대로** 알 수 있다는 뜻입니다.
# 이런 열을 입력에 넣으면 모델은 “커닝”을 해서 점수만 좋아지고, 실제로 새 제품을 판정할 때(아직 검사 전이라 `defect_type` 을 모를 때)는 쓸 수 없습니다.

# %%
same = (df['defect_type'] != '정상').astype(int).equals(df['defect'])
print('defect_type 으로 정답을 그대로 알 수 있나?', same)

# %% [markdown]
# ## 6. 비지도학습: 정답 없이 묶기(군집)
# 이번에는 **정답 y 를 주지 않습니다.** 설비 진동 데이터의 rms·온도 두 값만 보고, 비슷한 날끼리 두 묶음으로 나누게 합니다(`KMeans`, 12주에 자세히).
# 두 값의 단위가 달라서 `StandardScaler` 로 크기를 맞춘 뒤 묶습니다. `fit_predict` 에 **X만** 들어간다는 점을 보세요.

# %%
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

vib = pd.read_csv(DATA + 'vibration.csv')
Z = StandardScaler().fit_transform(vib[['rms', 'temp']])   # 단위 맞추기

km = KMeans(n_clusters=2, n_init=10, random_state=0)       # 두 묶음으로
vib['group'] = km.fit_predict(Z)                           # 정답 없이 fit → 묶음 번호
print(vib['group'].value_counts())

# %%
plt.figure(figsize=(7, 4))
plt.scatter(vib['rms'], vib['temp'], c=vib['group'], cmap='coolwarm', s=12)
plt.xlabel('진동 세기 rms')
plt.ylabel('설비 온도 (℃)')
plt.title('정답 없이 나눈 두 묶음')
plt.show()

# %% [markdown]
# 묶을 때는 쓰지 않았던 고장 기록(`failure`)과 설비 번호를 나중에 비교해 봅니다. 작은 묶음은 어느 설비의 어떤 날들일까요?

# %%
print(vib.groupby('group')[['rms', 'temp']].mean().round(2))   # 묶음별 평균
small = vib['group'].value_counts().idxmin()                    # 작은 묶음 번호
print(vib[vib['group'] == small]['machine'].value_counts())      # 작은 묶음에 속한 설비

# %% [markdown]
# ## 7. 직접 바꿔 보기
# 아래 셀의 값을 바꾸고 다시 실행해 보세요. 기본값 그대로도 실행됩니다.
#
# **과제 1.** 회귀의 입력 열을 바꿔 보세요. 예: `['pressure', 'thickness']`, `['humidity']` … 새 제품 예측값이 어떻게 달라지나요?

# %% [exercise]
my_cols = ['pressure', 'thickness']          # ← 입력 열을 바꿔 보세요
m = LinearRegression().fit(df[my_cols], df['strength'])
my_new = pd.DataFrame({c: [df[c].mean()] for c in my_cols})   # 각 열의 평균값을 가진 '보통' 제품
print('입력:', my_cols)
print('보통 제품의 예측 강도:', m.predict(my_new).round(2))

# %% [markdown]
# **과제 2.** 분류 모델에 넣을 새 제품의 조건을 바꿔 보세요. 어떤 조건에서 불량(1)으로 판정되나요?

# %% [exercise]
my_product = pd.DataFrame({'temp': [215], 'pressure': [78], 'speed': [1200],
                           'humidity': [65], 'thickness': [1.95]})   # ← 값을 바꿔 보세요
print('판정 (0=양품, 1=불량):', clf.predict(my_product))
print('불량일 확률:', clf.predict_proba(my_product)[0, 1].round(2))

# %% [markdown]
# **과제 3.** 군집의 묶음 개수(`n_clusters`)를 3, 4로 바꿔 보세요. 평소 데이터가 어떻게 쪼개지나요? 몇 개가 적당하다고 생각하나요?

# %% [exercise]
k = 3                                          # ← 묶음 개수를 바꿔 보세요
vib['g'] = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(Z)
print(vib.groupby('g')[['rms', 'temp']].agg(['mean', 'count']).round(2))

# %% [markdown]
# ## 정리
# | 유형 | 정답 y | 오늘 쓴 모델 | 결과 모양 |
# |---|---|---|---|
# | 회귀 | 있음(숫자) | `LinearRegression` | 숫자 (예: 38.66 MPa) |
# | 분류 | 있음(범주) | `DecisionTreeClassifier` | 범주 (0/1) |
# | 군집 | **없음** | `KMeans` | 묶음 번호 |
#
# 흐름은 언제나 **데이터 준비(X, y) → 모델 고르기 → `fit` → `predict`**. 남은 단계는 **평가** — “이 예측, 믿어도 될까?” 는 다음 차시에서 다룹니다.
#
# **생성형AI에게 물어볼 만한 질문**
# - “scikit-learn에서 `fit`과 `predict`가 각각 무엇을 하는지, 공정 데이터 예시로 초보자에게 설명해 줘.”
# - “pandas에서 `df[['pressure']]`와 `df['pressure']`의 차이가 뭐야? 왜 X에는 대괄호를 두 겹 쓰지?”
#
# 답을 받으면 이 노트북에서 직접 `type()`, `.shape` 로 **확인해 보는 습관**을 들이세요.
