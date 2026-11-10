# %% [markdown]
# # 6주 2차시 · 분포와 이상치
#
# **학습 목표**
# - 히스토그램을 그리고, 구간 수(bins)에 따라 모양이 어떻게 달라지는지 확인한다.
# - 분포의 모양(대칭·치우침)을 평균과 중앙값의 위치로 확인한다.
# - 사분위수·IQR로 상자그림을 읽고, IQR 규칙으로 이상치 **후보**를 찾는다.
# - 후보가 센서 오류인지 진짜 극단값인지 구분해 다르게 처리한다.
#
# **사용 데이터** — `process.csv` (가상 데이터, 494행)
# 사출 성형 공정 기록. 숫자 열: `temp`(℃), `pressure`(bar), `speed`(rpm), `humidity`(%), `thickness`(mm), `strength`(MPa).
# 6번에서는 5주차에 정리하기 전 파일 `process_raw.csv`도 씁니다.

# %% [markdown]
# ## 0. 준비

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import pandas as pd
import matplotlib.pyplot as plt

# %%
DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
df = pd.read_csv(DATA + 'process.csv')
nums = ['temp', 'pressure', 'speed', 'humidity', 'thickness', 'strength']   # 숫자 열
print(df.shape)

# %% [markdown]
# ## 1. 히스토그램: 숫자 열 여섯 개 한 번에
# 히스토그램은 값을 같은 너비의 구간으로 나누고, 구간마다 개수를 세어 막대로 그린 그림입니다.

# %%
df[nums].hist(bins=20, figsize=(12, 6), color='steelblue')
plt.tight_layout()
plt.show()

# %% [markdown]
# ## 2. 구간 수(bins)를 바꾸면?
# 같은 인장강도 데이터를 구간 5개, 20개, 100개로 그려 비교합니다.

# %%
fig, axes = plt.subplots(1, 3, figsize=(13, 3.2))
for ax, b in zip(axes, [5, 20, 100]):
    ax.hist(df['strength'], bins=b, color='steelblue')
    ax.set_title(f'bins = {b}')
    ax.set_xlabel('인장강도 (MPa)')
plt.tight_layout()
plt.show()

# %% [markdown]
# 너무 적으면 모양이 뭉개지고, 너무 많으면 들쭉날쭉해집니다. 몇 가지로 바꿔 보며 **안정적인 모양**을 찾습니다.
#
# ## 3. 모양 확인: 평균 vs 중앙값
# 꼬리가 있는 쪽으로 평균이 끌려갑니다. 평균 − 중앙값이 음수면 왼쪽 꼬리, 양수면 오른쪽 꼬리를 의심합니다.

# %%
summary = pd.DataFrame({'평균': df[nums].mean(), '중앙값': df[nums].median()})
summary['평균-중앙값'] = summary['평균'] - summary['중앙값']
summary.round(3) + 0.0                # + 0.0: -0.0 표시를 0.0으로

# %% [markdown]
# ## 4. 사분위수와 IQR 규칙
# - Q1(25%), Q2(50% = 중앙값), Q3(75%) / **IQR = Q3 − Q1** (가운데 50%의 폭)
# - 울타리: Q1 − 1.5×IQR, Q3 + 1.5×IQR → 울타리 밖은 **이상치 후보**

# %%
s = df['strength']
q1 = s.quantile(0.25)
q3 = s.quantile(0.75)
iqr = q3 - q1
low = q1 - 1.5 * iqr                  # 아래 울타리
high = q3 + 1.5 * iqr                 # 위 울타리
print(f'Q1 {q1:.2f} / Q3 {q3:.2f} / IQR {iqr:.2f}')
print(f'울타리: {low:.2f} ~ {high:.2f}')

# %%
out = df[(s < low) | (s > high)]      # 울타리 밖 행 (지우지 말고 열어 본다)
print('후보', len(out), '개')
out[['product_id', 'shift', 'machine', 'temp', 'pressure', 'strength', 'defect_type']]

# %% [markdown]
# ## 5. 상자그림
# 상자 = Q1~Q3, 가운데 선 = 중앙값, 수염 = 울타리 안 가장 먼 값, 점 = 울타리 밖.
# `by='shift'`를 주면 주간·야간을 나란히 비교합니다.

# %%
fig, axes = plt.subplots(1, 2, figsize=(11, 3.5))
df.boxplot(column='strength', ax=axes[0])
axes[0].set_title('전체 인장강도')
df.boxplot(column='strength', by='shift', ax=axes[1])
axes[1].set_title('주야간 비교')
plt.suptitle('')                      # pandas가 자동으로 붙이는 큰 제목 지우기
plt.tight_layout()
plt.show()

# %%
day = df[df['shift'] == '주간']['strength']
night = df[df['shift'] == '야간']['strength']
pd.DataFrame({'주간': day.describe(), '야간': night.describe()}).round(2)

# %% [markdown]
# ## 6. 오류일까, 진짜일까? — 정리 전 온도
# 정리 전 파일의 온도에 IQR 규칙을 쓰면 후보가 몇 개 나오는지, 어떤 값인지 봅니다.

# %%
raw = pd.read_csv(DATA + 'process_raw.csv')
t = raw['temp']
tq1, tq3 = t.quantile(0.25), t.quantile(0.75)
tlow, thigh = tq1 - 1.5 * (tq3 - tq1), tq3 + 1.5 * (tq3 - tq1)
cand = raw[(t < tlow) | (t > thigh)]
print(f'울타리 {tlow:.1f} ~ {thigh:.1f}, 후보 {len(cand)}개')
cand[['product_id', 'shift', 'machine', 'temp', 'strength', 'defect_type']].sort_values('temp')

# %% [markdown]
# - **999.9, −1.0** → 사출 온도로 불가능한 값이 반복됨 → **센서 오류** → 결측치로 바꾼다.
# - **233.5, 235.3** → 가능한 온도이고, 강도가 낮고 불량 판정 → **진짜 극단값** → 남기고 원인을 조사한다.
#
# 규칙은 후보를 찾을 뿐, 판단은 사람이 합니다. 불가능한 값만 골라 결측치로 바꿔 봅니다.

# %%
possible = (t > 0) & (t < 900)        # 물리적으로 가능한 범위 (판단 기준은 사람이 정한다)
raw['temp_clean'] = t.where(possible) # 가능하지 않으면 결측치(NaN)로
print('결측치로 바꾼 개수:', raw['temp_clean'].isna().sum())
print('남은 최고 온도:', raw['temp_clean'].max())

# %% [markdown]
# ## 7. 직접 바꿔 보기
# **(1)** `col`과 `b`를 바꿔 보세요. 습도(`'humidity'`)는 bins를 몇으로 할 때 모양이 가장 잘 보이나요?

# %% [exercise]
col = 'strength'                      # ← 'temp', 'humidity', 'thickness' ...
b = 20                                # ← 구간 수
plt.figure(figsize=(7, 3))
plt.hist(df[col], bins=b, color='steelblue')
plt.axvline(df[col].mean(), color='orange', label='평균')
plt.axvline(df[col].median(), color='navy', linestyle='--', label='중앙값')
plt.legend(); plt.xlabel(col)
plt.show()

# %% [markdown]
# **(2)** 울타리 배수 `k`를 `1.0`, `2.0`, `3.0`으로 바꿔 보세요. 인장강도 후보는 몇 개가 되나요?

# %% [exercise]
k = 1.5                               # ← 울타리 배수
n_out = ((s < q1 - k * iqr) | (s > q3 + k * iqr)).sum()
print(f'k = {k}: 후보 {n_out}개')

# %% [markdown]
# **(3)** `col2`를 `'humidity'`나 `'thickness'`로 바꿔 후보를 찾고, 각 행이 오류인지 진짜인지 판단해 보세요.

# %% [exercise]
col2 = 'humidity'                     # ← 열 이름
x = df[col2]
xq1, xq3 = x.quantile(0.25), x.quantile(0.75)
xi = xq3 - xq1
df[(x < xq1 - 1.5 * xi) | (x > xq3 + 1.5 * xi)][['product_id', 'date', 'machine', col2, 'defect_type']]

# %% [markdown]
# ## 정리
# - 요약 통계 전에 **히스토그램으로 모양**을 본다. bins는 몇 가지로 바꿔 확인한다.
# - 상자그림 = 사분위수. 상자는 가운데 50%(IQR), 울타리는 상자에서 1.5×IQR.
# - IQR 규칙이 찾은 것은 **후보**. 센서 오류는 결측 처리, 진짜 극단값은 남기고 원인을 찾는다. 무엇을 왜 바꿨는지 기록한다.
#
# **생성형AI에게 물어볼 만한 질문**
# - “사출 성형 온도 데이터에 999.9와 −1.0이 섞여 있어. 이 값만 결측치로 바꾸는 pandas 코드를 짜 주고, 바꾸기 전후 개수를 출력해 줘.”
# - “IQR 규칙으로 찾은 이상치를 전부 삭제해도 될까? 제조 공정 데이터에서 주의할 점을 알려 줘.”
#
# AI가 “이상치는 모두 삭제하세요”라고 답하면, **진짜 극단값까지 지우는 것은 아닌지** 직접 확인하세요.
