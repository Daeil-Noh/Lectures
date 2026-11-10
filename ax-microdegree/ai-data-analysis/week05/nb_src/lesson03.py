# %% [markdown]
# # 5주 3차시 · 결측치 처리와 자료형 정리
#
# **학습 목표**
# 1. `isna().sum()`·`info()`·`describe()`로 빈칸, 오류값, 수상한 자료형을 찾는다.
# 2. 센서 오류값(999.9, -1.0)을 빈칸(NaN)으로 바꾼다.
# 3. `dropna`(지우기)와 `fillna`(채우기: 평균·중앙값)의 장단점을 비교한다.
# 4. 문자열 숫자(`'2.01mm'`)를 실수로 고치고, 중복 행을 지우고, **바꾼 내용을 기록**한다.
#
# **사용 데이터**
# - `process_raw.csv` — 5-1·5-2에서 쓴 공정 기록의 **정리 전 원본** (499행, 가상 데이터)
# - `process.csv` — 정리본 (494행). 마지막에 내 결과와 비교하는 데만 씁니다.

# %% [markdown]
# ## 0. 준비

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import pandas as pd
import numpy as np                 # NaN(빈칸)을 쓰기 위해

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
raw = pd.read_csv(DATA + 'process_raw.csv')
print(raw.shape)

# %% [markdown]
# ## 1. 문제 찾기
# ### 1-1. 빈칸(NaN) 세기
# `isna()`는 칸마다 빈칸이면 True, `sum()`은 열마다 True 개수를 셉니다.

# %%
raw.isna().sum()

# %% [markdown]
# ### 1-2. 자료형 확인
# `thickness`(두께)는 숫자여야 하는데 자료형이 무엇으로 나오나요?

# %%
raw.info()

# %% [markdown]
# ### 1-3. 말이 안 되는 값 찾기
# 빈칸이 0개인 `temp`도 `describe()`로 최소·최대를 보면 문제가 보입니다.

# %%
print(raw['temp'].describe().round(2))
print('---')
print(raw['temp'].value_counts().head(3))     # 자주 나온 값 상위 3개 → 999.9 가 6번이나!

# %% [markdown]
# ### 1-4. 중복 행 찾기
# `duplicated()`는 앞의 행과 **완전히 같은** 행이면 True입니다. `keep=False`는 겹친 행을 모두 표시합니다.

# %%
print('중복 행:', raw.duplicated().sum())
raw[raw.duplicated(keep=False)].sort_values('product_id')[['product_id', 'date', 'temp', 'humidity']]

# %% [markdown]
# ## 2. 정리하기 — 순서: 중복 → 오류값 → 자료형 → 결측
# 원본 `raw`는 그대로 두고 복사본 `df`를 고칩니다. 단계마다 **숫자로 확인**하고 `log`에 기록합니다.

# %%
log = []                                   # 변경 기록

df = raw.drop_duplicates().copy()          # ① 완전히 같은 행 삭제 (.copy() = 원본과 분리된 복사본)
log.append(f'① 중복 행 삭제: {len(raw)} → {len(df)}행')
print(log[-1])

# %% [markdown]
# ### ② 센서 오류값 → NaN
# 999.9와 -1.0은 센서가 끊겼을 때 남는 **오류 코드**로 보입니다. 행 전체를 지우지 않고 그 **칸만** 비웁니다.

# %%
before = round(df['temp'].mean(), 2)
df['temp'] = df['temp'].replace([999.9, -1.0], np.nan)
after = round(df['temp'].mean(), 2)

log.append(f"② temp 오류값 {df['temp'].isna().sum()}개 → NaN: 평균 {before} → {after}")
print(log[-1])
print('남은 범위:', df['temp'].min(), '~', df['temp'].max())

# %% [markdown]
# ### ③ 문자열 숫자 고치기
# `'1.994mm'`처럼 단위가 붙은 값이 섞여 열 전체가 문자열이 되었습니다. 바로 `astype(float)`을 하면 오류가 나므로, `'mm'`를 지운 뒤 바꿉니다.

# %%
n_mm = df['thickness'].str.contains('mm').sum()
df['thickness'] = df['thickness'].str.replace('mm', '').astype(float)

log.append(f"③ thickness 'mm' {n_mm}개 제거 → {df['thickness'].dtype}")
print(log[-1])

# 주의: pd.to_numeric(..., errors='coerce') 는 못 바꾸는 값을 조용히 NaN 으로 만든다
check = pd.to_numeric(raw['thickness'], errors='coerce')
print("원본에 to_numeric(errors='coerce')만 쓰면 사라지는 값:", check.isna().sum(), '개')

# %% [markdown]
# ### ④ 결측치: 지우기 vs 채우기 비교
# 먼저 두 방법의 결과를 나란히 비교해 봅니다.

# %%
print('지금 빈칸:', df.isna().sum().sum(), '칸')
print(df.isna().sum()[df.isna().sum() > 0])

dropped = df.dropna()                                   # 빈칸 있는 행 삭제
filled = df.fillna(df.median(numeric_only=True))        # 숫자 열 빈칸을 중앙값으로

print('\ndropna  →', dropped.shape, '/ 습도 표준편차', round(dropped['humidity'].std(), 2))
print('fillna  →', filled.shape, '/ 습도 표준편차', round(filled['humidity'].std(), 2))

# %%
# 평균 vs 중앙값: 오류값이 남아 있는 원본 온도로 비교하면 차이가 분명하다
print('오류값이 섞인 temp  평균:', round(raw['temp'].mean(), 2), ' 중앙값:', raw['temp'].median())
print('정리한 temp        평균:', round(df['temp'].mean(), 2), ' 중앙값:', df['temp'].median())

# %% [markdown]
# 이번에는 행을 살리기 위해 **중앙값으로 채우기**를 선택하고 기록합니다.

# %%
med = df.median(numeric_only=True)
n_na = df.isna().sum().sum()
df = df.fillna(med)
log.append(f"④ 빈칸 {n_na}칸 중앙값으로 채움 (temp {med['temp']}, pressure {med['pressure']}, humidity {med['humidity']})")
print(log[-1])

# %% [markdown]
# ## 3. 최종 확인과 변경 기록

# %%
print('최종 크기:', df.shape, '/ 빈칸:', df.isna().sum().sum(), '/ 중복:', df.duplicated().sum())
print(df.dtypes[['temp', 'pressure', 'humidity', 'thickness']])
print('\n[변경 기록]')
for line in log:
    print(line)

# %%
# 정리본 process.csv 와 비교 (실제 수업에서는 정답이 없다는 점에 주의)
clean = pd.read_csv(DATA + 'process.csv')
compare = pd.DataFrame({'내 결과': df[['temp', 'pressure', 'humidity', 'thickness']].mean(),
                        '정리본': clean[['temp', 'pressure', 'humidity', 'thickness']].mean()}).round(3)
compare

# %%
# 채운 값이 분포에 어떻게 보이는지 (습도)
ax = df['humidity'].plot(kind='hist', bins=26, title='습도 분포 (중앙값으로 채운 뒤)')
ax.axvline(med['humidity'], color='orange', linestyle='--', label='채운 값')
ax.legend()

# %% [markdown]
# ## 4. 직접 바꿔 보기
# 1. `LOW`, `HIGH`(정상 온도 범위)를 바꿔 보세요. 범위를 너무 좁히면 진짜 측정값까지 NaN이 됩니다.
# 2. `METHOD`를 `'mean'`(평균), `'drop'`(삭제)으로 바꿔 행 수·평균·표준편차를 비교하세요.
# 3. 결과를 정리본 `clean`의 평균과 비교해 보세요. 어느 방법이 가장 가까운가요?

# %% [exercise]
LOW, HIGH = 150, 300          # 1) 정상 온도 범위
METHOD = 'median'             # 2) 'median', 'mean', 'drop'

t = raw.drop_duplicates().copy()
t['temp'] = t['temp'].where((t['temp'] >= LOW) & (t['temp'] <= HIGH))   # 범위 밖 → NaN
t['thickness'] = t['thickness'].str.replace('mm', '').astype(float)

if METHOD == 'drop':
    t = t.dropna()
elif METHOD == 'mean':
    t = t.fillna(t.mean(numeric_only=True))
else:
    t = t.fillna(t.median(numeric_only=True))

print('방법:', METHOD, '/ 크기:', t.shape)
print('temp 평균:', round(t['temp'].mean(), 2), '(정리본', round(clean['temp'].mean(), 2), ')')
print('humidity 표준편차:', round(t['humidity'].std(), 2), '(정리본', round(clean['humidity'].std(), 2), ')')

# %% [markdown]
# ## 정리
# - 빈칸은 `isna().sum()`, 오류값은 `describe()`의 최소·최대, 수상한 자료형은 `info()`로 찾는다
# - 오류값은 행을 지우지 말고 그 칸을 `NaN`으로 → 평균 계산에서 자동으로 빠진다
# - `dropna`는 행을 잃고, `fillna`는 추측값을 넣는다(퍼짐이 줄어든다). 이상값이 있으면 **중앙값**
# - 문자열 숫자는 `str.replace` 후 `astype(float)`. `errors='coerce'`는 사라진 개수를 꼭 확인
# - 순서: **중복 → 오류값 → 자료형 → 결측**, 그리고 숫자와 함께 **기록**
#
# **생성형AI에게 물어볼 만한 질문**
# - “아래는 `df.info()`와 `df.describe()` 결과야. 결측치·오류값·자료형 문제를 찾아서, 단계별 주석이 달린 pandas 정리 코드를 써 줘. 각 단계 뒤에 확인용 print도 넣어 줘.”
# - “습도 결측치 19개를 평균으로 채우는 것과 행을 지우는 것의 장단점을 공정 데이터 관점에서 설명해 줘.”
#
# AI가 준 정리 코드는 단계마다 **행 수·빈칸 수·자료형**이 기대대로 바뀌는지 직접 확인하세요. “300℃ 넘으면 오류” 같은 기준은 공정 지식으로 검토합니다.
