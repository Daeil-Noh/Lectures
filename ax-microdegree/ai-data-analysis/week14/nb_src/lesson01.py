# %% [markdown]
# # 14주 1차시 · 예시 프로젝트: AI와 함께 분석 전 과정 따라 하기
#
# **학습 목표**
# - 질문 → 불러오기·정리 → 탐색 → 모델 → 해석 → 한계, 분석의 전 과정을 한 번에 따라 간다.
# - 단계마다 생성형AI에게 **무엇을 물었고**, 그 답을 **어떻게 확인했는지** 기록하는 습관을 익힌다.
# - 이 파일의 구성을 그대로 **내 전공 분석 보고서**의 뼈대로 쓴다.
#
# **사용 데이터** (모두 가상 데이터)
# - `process_raw.csv` : 사출 성형 공정 기록 499행, **정리 전** 버전 (결측·센서 오류값·단위 섞인 값·중복 행 포함)
# - `process.csv` : 같은 데이터의 정리된 버전 494행 — 내 정리 결과가 맞는지 **대조**하는 데만 쓴다.
# - 주요 열: `temp`(℃), `pressure`(bar), `speed`(rpm), `humidity`(%), `thickness`(mm), `strength`(인장강도 MPa), `shift`(주간/야간), `defect`(불량 0/1)
#
# > 각 단계의 **[AI에게 물은 것] / [내가 확인한 것]** 상자는 실제 보고서의 "AI 활용 내역"에 옮겨 적을 내용의 예시입니다.

# %% [markdown]
# ## 0단계 · 준비
# 한글 그래프용 패키지를 설치하고, 데이터 주소를 정합니다.

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'

# %% [markdown]
# ## 1단계 · 질문 정하기
# 막연한 질문("품질을 좋게 하려면?")을 **데이터로 답할 수 있는 질문**으로 바꿉니다 (9주 3차시).
#
# > **분석 질문**: 어떤 공정 조건이 **인장강도**를 좌우하는가? 공정 조건만으로 강도를 **예측**할 수 있는가?
#
# - 결과 변수(맞히고 싶은 값): `strength`
# - 입력 변수(공정 조건): `temp`, `pressure`, `speed`, `humidity`, `thickness`
# - 성공 기준: 시험 데이터에서 "평균값으로 찍기"보다 오차가 **확실히** 작을 것
#
# **[AI에게 물은 것]**: "사출 성형 공정 데이터(온도·압력·속도·습도·두께·인장강도)로 2학년 수준의 분석 질문 3개를 제안해 줘. 결과 변수와 입력 변수를 같이 적어 줘."
# **[내가 확인한 것]**: 제안 중 "불량 원인 규명"은 인과를 묻는 질문이라 이 데이터(관찰 기록)로는 답하기 어렵다 → **예측·관계** 질문으로 좁혔다.

# %%
# 질문을 코드로 적어 두면 뒤 단계에서 그대로 쓸 수 있다
target = 'strength'                                              # 결과 변수
features = ['temp', 'pressure', 'speed', 'humidity', 'thickness']  # 입력 변수
print('결과 변수:', target)
print('입력 변수:', features)

# %% [markdown]
# ## 2단계 · 불러오기와 정리
# 정리 전 데이터 `process_raw.csv`를 읽고, **문제부터 찾습니다** (5주).

# %%
raw = pd.read_csv(DATA + 'process_raw.csv')
print('행, 열:', raw.shape)
print('중복 행:', raw.duplicated().sum())
print('결측값:', raw[['temp', 'pressure', 'humidity']].isna().sum().to_dict())
print('thickness 자료형:', raw['thickness'].dtype)        # 숫자가 아니라 문자열!
print('온도 범위 밖(100℃ 미만·300℃ 초과):', ((raw['temp'] < 100) | (raw['temp'] > 300)).sum())

# %% [markdown]
# 찾은 문제 네 가지를 차례로 고칩니다.
#
# **[AI에게 물은 것]**: "pandas로 ① 중복 행 제거 ② thickness의 'mm' 글자 제거 후 숫자로 ③ temp의 999.9, -1.0 같은 센서 오류값을 결측으로 ④ 결측은 중앙값으로 채우는 코드를 써 줘. 각 줄에 한국어 주석을 달아 줘."
# **[내가 확인한 것]**: AI가 처음 준 코드는 `astype(float)`부터 해서 `ValueError: could not convert string to float: '1.994mm'` 오류가 났다 → 'mm'를 먼저 지우도록 순서를 바꿨다. 또 `dropna()`로 지우자는 제안은 **36행(7%)** 을 잃어서 중앙값 채우기를 택했다.

# %%
df = raw.drop_duplicates().copy()                                        # ① 중복 행 제거
df['thickness'] = df['thickness'].astype(str).str.replace('mm', '').astype(float)  # ② 단위 글자 제거 → 숫자
bad = (df['temp'] < 100) | (df['temp'] > 300)
df.loc[bad, 'temp'] = np.nan                                             # ③ 센서 오류값 → 결측
print('지우면 남는 행:', len(df.dropna()), '/ 채우면 남는 행:', len(df))
for col in ['temp', 'pressure', 'humidity']:
    df[col] = df[col].fillna(df[col].median())                          # ④ 결측 → 중앙값
print('정리 후:', df.shape, '/ 남은 결측:', df.isna().sum().sum())

# %% [markdown]
# **검증**: 정리된 공식본 `process.csv`와 비교해 내 정리가 맞는지 확인합니다. 행 수와 평균이 거의 같으면 성공입니다.

# %%
ref = pd.read_csv(DATA + 'process.csv')
print('행 수  내 정리:', len(df), '/ 공식본:', len(ref))
compare = pd.DataFrame({'내 정리': df[features + [target]].mean(), '공식본': ref[features + [target]].mean()})
print(compare.round(2))

# %% [markdown]
# ## 3단계 · 탐색: 숫자와 그림으로 살펴보기
# 상관계수(7주)로 먼저 훑고, **반드시 그림으로** 확인합니다.

# %%
print(df[features + [target]].corr()[target].drop(target).round(2).sort_values())

# %%
fig, axes = plt.subplots(1, 5, figsize=(17, 3.4), sharey=True)
for ax, col in zip(axes, features):
    ax.scatter(df[col], df[target], s=8, alpha=0.5)
    ax.set_xlabel(col)
    ax.set_title(f'r = {df[col].corr(df[target]):.2f}')
axes[0].set_ylabel('인장강도 (MPa)')
plt.suptitle('그림 1. 공정 조건과 인장강도 (process_raw.csv 정리 후 494개)', y=1.04)
plt.show()

# %% [markdown]
# **[AI에게 물은 것]**: "온도와 강도의 상관계수가 -0.11이야. 온도는 강도와 관계가 없다고 써도 될까?"
# **[내가 확인한 것]**: AI는 "약한 관계"라고 답했지만, 산점도를 보니 **가운데가 볼록한 곡선**이다. 상관계수는 직선 관계만 잰다(7주). 아래처럼 구간별 평균으로 다시 확인했다.

# %%
# 구간별 평균 비교 (6주 그룹별 집계)
temp_band = pd.cut(df['temp'], [180, 200, 205, 210, 215, 220, 240])
print(df.groupby(temp_band, observed=True)[target].agg(['mean', 'count']).round(2))
press_band = pd.cut(df['pressure'], [60, 75, 80, 85, 100])
print(df.groupby(press_band, observed=True)[target].agg(['mean', 'count']).round(2))
print(df.groupby('shift')[['defect', 'humidity']].mean().round(3))   # 불량률·습도: 주간 vs 야간

# %% [markdown]
# ## 4단계 · 모델: 강도 예측하기 (10주 회귀)
# 훈련 80% / 시험 20%로 나누고(9주), 선형 회귀로 강도를 예측합니다. 비교 기준으로 "훈련 데이터 평균으로 찍기"의 오차도 같이 봅니다.

# %%
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score

train, test = train_test_split(df, test_size=0.2, random_state=42)   # random_state 고정 → 다시 해도 같은 결과
model1 = LinearRegression().fit(train[features], train[target])
pred1 = model1.predict(test[features])
print('시험 MAE :', round(mean_absolute_error(test[target], pred1), 2), 'MPa')
print('시험 R²  :', round(r2_score(test[target], pred1), 3))
base = np.full(len(test), train[target].mean())
print('평균으로 찍기 MAE:', round(mean_absolute_error(test[target], base), 2), 'MPa')

# %% [markdown]
# **잔차**(실제 − 예측)를 온도 구간별로 보면, 모델이 어디서 틀리는지 보입니다.

# %%
resid = df[target] - model1.predict(df[features])
band_resid = resid.groupby(temp_band, observed=True).mean()
band_resid.plot(kind='bar', figsize=(7, 3))
plt.axhline(0, color='gray')
plt.ylabel('평균 잔차 (MPa)')
plt.title('그림 2. 온도 구간별 평균 잔차 (모델 1)')
plt.show()
print(band_resid.round(2))

# %% [markdown]
# 온도 양 끝에서 잔차가 크게 음수 → 직선 모델이 **곡선**을 놓쳤습니다.
#
# **[AI에게 물은 것]**: "선형 회귀 잔차가 온도 양 끝에서 음수야. 곡선 관계를 반영하려면 어떻게 해?"
# **[내가 확인한 것]**: AI가 제안한 '온도 제곱 열 추가'를 해 본 뒤 **훈련 점수가 아니라 시험 점수**로 좋아졌는지 확인했다. 210은 탐색에서 본 곡선의 꼭대기 근처 값이다.

# %%
df['temp2'] = (df['temp'] - 210) ** 2           # 210℃에서 멀어질수록 커지는 열
train, test = train_test_split(df, test_size=0.2, random_state=42)   # 같은 random_state → 같은 행으로 다시 나뉜다
features2 = features + ['temp2']
model2 = LinearRegression().fit(train[features2], train[target])
for name, m, cols in [('모델 1', model1, features), ('모델 2', model2, features2)]:
    tr = r2_score(train[target], m.predict(train[cols]))
    te = r2_score(test[target], m.predict(test[cols]))
    mae = mean_absolute_error(test[target], m.predict(test[cols]))
    print(f'{name}  학습 R² {tr:.3f}  시험 R² {te:.3f}  시험 MAE {mae:.2f} MPa')

# %% [markdown]
# ## 5단계 · 해석: 숫자를 말로 바꾸기
# 단위가 다른 변수를 비교하려고 "각 조건이 **1 표준편차** 늘 때 강도가 얼마나 바뀌는가"로 봅니다.

# %%
effect = pd.Series(model2.coef_ * train[features2].std().values, index=features2)
print('1 표준편차 변화당 강도 변화(MPa):')
print(effect.round(2).sort_values())
# 무엇이 바뀌면? — 다른 조건은 그대로 두고 압력만 75 → 85 bar
new = pd.DataFrame({'temp': [210, 210], 'pressure': [75, 85], 'speed': [1200, 1200],
                    'humidity': [55, 55], 'thickness': [2.0, 2.0]})
new['temp2'] = (new['temp'] - 210) ** 2
print('예측 강도(75 bar, 85 bar):', model2.predict(new[features2]).round(2))

# %% [markdown]
# **결과**(관찰한 사실): 압력이 1 표준편차(약 6 bar) 높을 때 예측 강도는 약 2.1 MPa 높다. 온도는 210℃ 부근에서 강도가 가장 높고 양 끝에서 낮다.
#
# **해석**(의미): 이 데이터 범위(압력 62~98 bar) 안에서는 압력이 강도를 가장 크게 좌우하는 조건으로 **보인다**. 다만 관찰 데이터이므로 "압력을 올리면 강도가 오른다"는 인과는 실험으로 확인해야 한다.
#
# **[AI에게 물은 것]**: "이 계수 표를 보고 결과 문단 초안을 써 줘."
# **[내가 확인한 것]**: AI 초안의 "압력을 높이면 강도가 반드시 오른다 → 압력을 120 bar로"는 **관찰 범위 밖**이고 인과 표현이라 고쳤다. 숫자는 모두 위 출력과 대조했다.

# %% [markdown]
# ## 6단계 · 한계: 정직하게 적기
# 시험 점수는 훈련/시험을 **어떻게 나눴는지**에 따라 조금씩 달라집니다. 몇 번 바꿔 보고 범위로 보고합니다.

# %%
for rs in [0, 1, 7, 42, 2026]:
    a, b = train_test_split(df, test_size=0.2, random_state=rs)
    m = LinearRegression().fit(a[features2], a[target])
    print(f'random_state={rs:<5} 시험 R² {r2_score(b[target], m.predict(b[features2])):.3f}')
print('입력 범위:', {c: (float(df[c].min()), float(df[c].max())) for c in ['temp', 'pressure']})

# %% [markdown]
# **이 분석의 한계**
# 1. 가상 데이터, 30일(평일)·1개 공장 기록 → 계절·원료 변화는 반영되지 않았다.
# 2. 관찰 데이터 → 관계는 보였지만 **인과**는 확인하지 못했다.
# 3. 결측 36개(약 7%)를 중앙값으로 채웠다 → 그 행들의 변동이 실제보다 작게 들어갔다.
# 4. 시험 R²는 분할에 따라 0.79~0.87 사이로 달라졌다. 입력 범위 밖(예: 압력 98 bar 초과)은 예측할 수 없다.

# %% [exercise]
# 직접 바꿔 보기 ① 입력 변수에서 하나를 빼면 시험 R²가 얼마나 떨어질까?
#   'pressure'를 빼 보고, 'speed'를 빼 보세요. 어느 쪽이 더 크게 떨어지나요?
drop_col = 'pressure'
cols = [c for c in features2 if c != drop_col]
m = LinearRegression().fit(train[cols], train[target])
print(drop_col, '뺐을 때 시험 R²:', round(r2_score(test[target], m.predict(test[cols])), 3))

# %% [exercise]
# 직접 바꿔 보기 ② 조건을 바꿔 강도를 예측해 보세요.
#   압력을 70, 80, 90으로, 온도를 200, 210, 225로 바꿔 보세요. 입력 범위(위 출력) 밖이면 믿으면 안 됩니다.
my = pd.DataFrame({'temp': [210], 'pressure': [80], 'speed': [1200], 'humidity': [58], 'thickness': [2.0]})
my['temp2'] = (my['temp'] - 210) ** 2
print('예측 인장강도:', round(model2.predict(my[features2])[0], 2), 'MPa')

# %% [markdown]
# ## 정리
# - 분석은 **질문 → 정리 → 탐색 → 모델 → 해석 → 한계**의 한 흐름이다. 이 파일이 보고서의 뼈대다.
# - 생성형AI는 코드 초안·아이디어에 크게 도움이 됐지만, **오류(순서), 과장(인과·범위 밖), 놓친 곡선**은 내가 출력·그림으로 확인해서 고쳤다.
# - 보고서에는 **시험 데이터 점수**, **입력 범위**, **AI 활용 내역(물은 것 / 확인한 것)** 을 함께 적는다.
#
# | 단계 | AI에게 물은 것 | 내가 확인한 것 |
# |---|---|---|
# | 질문 | 분석 질문 후보 3개 | 인과 질문은 제외, 예측·관계로 좁힘 |
# | 정리 | 정리 코드 4단계 | 오류 난 순서 수정, 공식본과 행 수·평균 대조 |
# | 탐색 | 상관 -0.11의 의미 | 산점도·구간 평균으로 곡선 확인 |
# | 모델 | 곡선 반영 방법 | 시험 R² 0.654 → 0.831 확인 |
# | 해석 | 결과 문단 초안 | 범위 밖·인과 표현 수정, 숫자 대조 |
#
# **생성형AI에게 물어볼 만한 질문**
# - "이 출력(시험 R², MAE)을 처음 보는 사람에게 두 문장으로 설명해 줘. 과장된 표현이 있으면 알려 줘."
# - "내 분석의 한계를 3가지 찾아 줘. 데이터 수집 기간, 결측 처리, 분할 방법을 기준으로."
