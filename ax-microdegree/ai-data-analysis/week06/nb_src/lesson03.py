# %% [markdown]
# # 6주 3차시 · 그룹별 집계로 비교하기
#
# **학습 목표**
# - `groupby`의 세 단계(나누기 → 계산하기 → 합치기)를 이해하고 코드로 쓴다.
# - 0/1 열(`defect`)의 평균이 불량률이 되는 것을 확인한다.
# - 주야간·라인·호기별 불량률을 `agg`, `pivot_table`, `crosstab`으로 비교한다.
# - 개수가 적은 그룹의 극단적인 비율을 경계한다.
#
# **사용 데이터** — `process.csv` (가상 데이터, 494행)
# 사출 성형 공정 기록. 범주 열: `shift`(주간/야간), `line`(1~3라인), `machine`(1~6호기), `date`(30일), `defect_type`(정상/치수불량/찍힘/스크래치).
# 숫자 열: `temp`, `pressure`, `speed`, `humidity`, `thickness`, `strength`, 그리고 `defect`(불량 1, 정상 0).

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
df[['product_id', 'date', 'shift', 'line', 'machine', 'defect', 'defect_type']].head()

# %% [markdown]
# ## 1. 0/1 열의 평균 = 비율
# `defect`는 불량이면 1, 정상이면 0입니다. 모두 더하면 불량 개수, 개수로 나누면(평균) 불량률입니다.

# %%
print('불량 개수:', df['defect'].sum())
print('제품 수  :', len(df))
print('불량률   :', round(df['defect'].mean(), 4))

# %% [markdown]
# ## 2. groupby: 나누기 → 계산하기 → 합치기
# `df.groupby(무엇으로 나눌까)[어떤 열을].무슨계산()`
#
# > 열은 `df['shift']`처럼 대괄호로 씁니다. `df.shift`는 pandas에 이미 있는 다른 기능의 이름이라 열이 나오지 않습니다.

# %%
print(df.groupby('shift')['defect'].mean())

# 확인: 주간만 골라서(5주차 조건 고르기) 평균을 내면 같은 값이 나올까?
day = df[df['shift'] == '주간']
print('\n주간만 골라 평균:', round(day['defect'].mean(), 6))

# %% [markdown]
# ## 3. 기준을 바꿔 가며 비교하기
# 기준 열만 바꾸면 라인별, 호기별 불량률도 같은 모양의 코드로 구합니다.

# %%
for by in ['shift', 'line', 'machine']:
    print(df.groupby(by)['defect'].mean().round(3), '\n')

# %% [markdown]
# ## 4. agg: 계산 여러 개를 한 번에
# 비율 옆에는 늘 **개수**를 같이 봅니다. `mean` = 불량률, `sum` = 불량 개수, `count` = 제품 수.

# %%
g = df.groupby('shift')
g['defect'].agg(['mean', 'sum', 'count']).round(3)

# %%
cols = ['mean', 'median', 'std', 'count']
g['strength'].agg(cols).round(2)

# %% [markdown]
# 야간과 주간은 공정 조건도 다를까요? 여러 열의 평균을 한 번에 봅니다.

# %%
g[['defect', 'humidity', 'temp', 'pressure', 'strength']].mean().round(3)

# %% [markdown]
# 야간이 불량률도 높고 습도·온도도 조금 높습니다. 하지만 **차이를 찾은 것이지 원인을 밝힌 것은 아닙니다.** (7주 3차시: 상관관계와 인과관계)
#
# 막대그래프로 그려 봅니다.

# %%
rate = df.groupby('machine')['defect'].mean() * 100
rate.plot(kind='bar', color='steelblue', figsize=(7, 3))
plt.axhline(df['defect'].mean() * 100, color='orange', linestyle='--', label='전체')
plt.ylabel('불량률 (%)'); plt.xticks(rotation=0); plt.legend()
plt.show()

# %% [markdown]
# ## 5. pivot_table과 crosstab: 기준 두 개로 펼치기
# - `pivot_table`: 행 기준 × 열 기준으로 값을 계산해 표로 펼친다.
# - `crosstab`: 범주 두 개의 **개수**를 센다. `normalize='index'`면 행마다 비율.

# %%
df.pivot_table(index='machine', columns='shift', values='defect', aggfunc='mean').round(3)

# %%
print(pd.crosstab(df['shift'], df['defect_type']), '\n')                      # 개수
print(pd.crosstab(df['shift'], df['defect_type'], normalize='index').round(3))  # 행마다 비율

# %% [markdown]
# ## 6. 작은 그룹 조심하기
# 날짜 × 호기로 잘게 나누면 그룹마다 제품이 몇 개뿐입니다. 불량률이 100%인 그룹은 몇 개짜리일까요?

# %%
small = df.groupby(['date', 'machine'])['defect'].agg(['mean', 'count'])
print('그룹 수:', len(small))
small.sort_values(['mean', 'count'], ascending=False).head(8)

# %% [markdown]
# ## 7. 직접 바꿔 보기
# **(1)** `by`와 `col`을 바꿔 보세요. 예: `by = 'line'`, `col = 'thickness'`. 어떤 기준에서 차이가 가장 크게 나나요?

# %% [exercise]
by = 'shift'                          # ← 'line', 'machine', 'date', 'defect_type'
col = 'strength'                      # ← 'humidity', 'temp', 'thickness', 'defect' ...
df.groupby(by)[col].agg(['mean', 'count']).round(3)

# %% [markdown]
# **(2)** 행 기준과 열 기준을 바꿔 보세요. 예: `index='line'`, `columns='shift'`.

# %% [exercise]
df.pivot_table(index='line', columns='shift', values='defect', aggfunc='mean').round(3)

# %% [markdown]
# **(3)** `최소개수`를 바꿔 보세요. 제품이 몇 개 이상인 그룹만 남기면 가장 높은 불량률은 얼마가 되나요?

# %% [exercise]
최소개수 = 5                            # ← 1, 3, 5, 7
big = small[small['count'] >= 최소개수]
print(f'{최소개수}개 이상 그룹 {len(big)}개, 가장 높은 불량률 {big["mean"].max():.3f}')

# %% [markdown]
# ## 정리
# - `df.groupby(기준)[열].계산()` = 나누기 → 계산하기 → 합치기. 기준·열·계산만 바꿔 끼운다.
# - 0/1 열의 평균은 비율. 야간 불량률 20.3%, 주간 7.0%.
# - 비율 옆에는 개수(count). 작은 그룹은 묶거나 데이터를 더 모은다. **차이 ≠ 원인.**
#
# **생성형AI에게 물어볼 만한 질문**
# - “pandas에서 shift별, machine별 불량률(defect 평균)과 제품 수를 한 표로 보여 주는 코드를 짜 줘. 제품 수가 30개 미만인 칸은 표시해 줘.”
# - “야간 불량률이 주간보다 높게 나왔어. 원인을 확인하려면 어떤 변수를 더 비교해 봐야 할까?”
#
# AI가 준 결과의 **개수 합계가 494인지**, 야간 불량률이 위와 같은지 직접 확인하세요.
