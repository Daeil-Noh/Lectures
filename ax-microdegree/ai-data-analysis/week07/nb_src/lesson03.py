# %% [markdown]
# # 7주 3차시 · 상관관계와 인과관계: 공정 변수와 품질
#
# **학습 목표**
# - 산점도를 그리고 상관계수 r(−1~1)을 구해 읽는다.
# - 곡선 관계는 r로 잡히지 않는다는 것을 확인한다 — 숫자 전에 그래프부터.
# - 교란 변수(습도)를 의심하고, 상관과 인과를 구분한다.
#
# **사용 데이터** : `process.csv` (사출 성형 공정 기록 494행, 실습용 가상 데이터)
# - 공정 변수: `temp`(℃), `pressure`(bar), `speed`(rpm), `humidity`(%), `thickness`(mm)
# - 품질: `strength`(인장강도, MPa), `defect`(불량 1 / 정상 0), `shift`(주간/야간)

# %% [markdown]
# ## 0. 준비

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import pandas as pd
import matplotlib.pyplot as plt

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
df = pd.read_csv(DATA + 'process.csv')
print(df.shape)

# %% [markdown]
# ## 1. 산점도 + 상관계수
# `.corr()`는 두 열의 **상관계수 r**을 계산합니다. +1에 가까우면 같이 증가, −1에 가까우면 반대로, 0에 가까우면 직선 관계가 거의 없습니다.

# %%
r = df['pressure'].corr(df['strength'])
print('압력 ↔ 강도 r =', round(r, 3))

plt.scatter(df['pressure'], df['strength'], alpha=0.4)
plt.title(f'압력과 인장강도 (r = {r:.2f})')
plt.xlabel('사출 압력 (bar)')
plt.ylabel('인장강도 (MPa)')
plt.show()

# %% [markdown]
# ## 2. 여러 변수의 상관계수를 한꺼번에
# 상관 행렬에서 `strength` 열만 꺼내 정렬합니다.

# %%
cols = ['temp', 'pressure', 'speed', 'humidity', 'thickness', 'strength']
r_all = df[cols].corr()['strength']
print(r_all.round(2).sort_values())

# %% [markdown]
# ## 3. 숫자 전에 그래프부터: 온도의 함정
# 온도의 r은 작습니다. 그럼 온도는 강도와 상관없을까요? 산점도와 **온도 구간별 평균 강도**를 함께 봅니다.

# %%
print('온도 ↔ 강도 r =', round(df['temp'].corr(df['strength']), 3))

df['temp_band'] = pd.cut(df['temp'], [190, 200, 205, 210, 215, 220, 225, 240])
band_mean = df.groupby('temp_band', observed=True)['strength'].agg(['mean', 'count'])
print(band_mean.round(2))

# %%
plt.scatter(df['temp'], df['strength'], alpha=0.3, label='제품')
mid = [(b.left + b.right) / 2 for b in band_mean.index]   # 구간 가운데 값
plt.plot(mid, band_mean['mean'], 'o-', color='black', label='구간 평균')
plt.title('온도가 210℃ 부근일 때 강도가 가장 높다 (곡선 관계)')
plt.xlabel('사출 온도 (℃)')
plt.ylabel('인장강도 (MPa)')
plt.legend()
plt.show()

# %% [markdown]
# 상관계수는 **직선** 관계만 잽니다. 올라갔다 내려가는 산 모양 관계는 r이 작게 나옵니다. 그래서 `corr()` 결과만 보고 변수를 버리면 안 됩니다.

# %% [markdown]
# ## 4. 야간에 불량이 많은 이유는?
# 교대별 불량률과 함께 평균 습도·온도를 비교합니다.

# %%
summary = df.groupby('shift')[['defect', 'humidity', 'temp']].mean()
summary['defect'] = summary['defect'] * 100          # 불량률(%)로
print(summary.round(1))

# %% [markdown]
# 야간에는 **습도도 높습니다.** 습도 구간별 불량률을 보면 습할수록 불량이 많습니다. 그렇다면 야간의 높은 불량률 중 일부는 습도 때문일 수 있습니다 — 습도는 **교란 변수** 후보입니다.

# %%
df['hum_band'] = pd.cut(df['humidity'], [0, 50, 60, 70, 100])
print((df.groupby('hum_band', observed=True)['defect'].mean() * 100).round(1))

# %% [markdown]
# ## 5. 습도를 같게 맞춰 놓고 교대 비교
# 습도 구간 × 교대별 불량률(%)과 제품 수를 함께 봅니다. 같은 습도 구간 안에서도 야간이 높을까요?

# %%
table = df.groupby(['hum_band', 'shift'], observed=True)['defect'].agg(['mean', 'count'])
table['mean'] = (table['mean'] * 100).round(1)
print(table)

ax = (df.groupby(['hum_band', 'shift'], observed=True)['defect'].mean() * 100).unstack().plot(kind='bar', rot=0)
ax.set_title('같은 습도 구간 안에서 교대별 불량률')
ax.set_xlabel('습도 구간 (%)')
ax.set_ylabel('불량률 (%)')
plt.show()

# %% [markdown]
# 습도를 비슷하게 맞추면 차이가 거의 사라지는 구간(60~70%)도 있지만, 다른 구간에서는 여전히 야간이 높습니다.
# → 습도는 차이의 **일부**를 설명할 뿐이고, 데이터에 없는 다른 요인이 있을 수도 있습니다.
# 관찰 데이터만으로는 원인을 확정할 수 없습니다. 원인을 확인하려면 **다른 조건은 고정하고 습도만 바꾸는 실험**(무작위 배정)이 필요합니다.
# (제품 수가 적은 칸 — 예: 습도 70% 초과의 주간 — 은 우연의 영향이 크다는 점도 기억하세요.)

# %% [markdown]
# ## 6. 직접 바꿔 보기
# 1. `x_col`을 `'thickness'`, `'humidity'`, `'speed'`로 바꿔 r과 산점도를 비교해 보세요.
# 2. `temp_edges`의 구간 경계를 바꿔 구간 평균선 모양이 어떻게 변하는지 보세요.
# 3. `group_col`을 `'hum_band'` 대신 온도 구간 `'temp_band'`로 바꿔, 온도를 맞춰 놓고 교대를 비교해 보세요.

# %% [exercise]
x_col = 'thickness'                                   # 'thickness', 'humidity', 'speed', 'temp', 'pressure'
temp_edges = [190, 200, 205, 210, 215, 220, 225, 240]  # 온도 구간 경계
group_col = 'hum_band'                                 # 'hum_band' 또는 'temp_band'

r_x = df[x_col].corr(df['strength'])
df['temp_band'] = pd.cut(df['temp'], temp_edges)

fig, axes = plt.subplots(1, 2, figsize=(12, 4))
axes[0].scatter(df[x_col], df['strength'], alpha=0.4)
axes[0].set_title(f'{x_col}와 인장강도 (r = {r_x:.2f})')
axes[0].set_xlabel(x_col)
axes[0].set_ylabel('인장강도 (MPa)')

(df.groupby([group_col, 'shift'], observed=True)['defect'].mean() * 100).unstack().plot(kind='bar', rot=0, ax=axes[1])
axes[1].set_title(f'{group_col}별 교대 불량률')
axes[1].set_ylabel('불량률 (%)')
plt.show()

print(df.groupby('temp_band', observed=True)['strength'].mean().round(2))

# %% [markdown]
# ## 정리
# - 상관계수 r: −1~1. 부호 = 방향, 크기 = 직선에 가까운 정도 (압력 ↔ 강도 약 0.70)
# - 곡선 관계(온도)는 r이 작게 나온다 → **숫자 전에 산점도**
# - 상관 ≠ 인과: 교란 변수(습도)를 의심하고, 원인은 **하나만 바꾸는 통제 실험**으로 확인한다
#
# **생성형AI에게 물어볼 만한 질문**
# - “야간 근무조의 불량률이 주간보다 3배 높은데, 야간에는 습도도 높아. 야간 근무가 원인이라고 말할 수 있을까? 교란 변수 관점에서 설명해 줘.”
# - “습도가 사출 불량의 원인인지 확인하는 공장 실험을 설계해 줘. 무엇을 고정하고 무엇을 무작위로 정해야 할까?”
#
# → AI의 설명이 오늘 계산한 숫자(교대별·습도 구간별 불량률)와 맞는지 **직접 확인**하세요.
