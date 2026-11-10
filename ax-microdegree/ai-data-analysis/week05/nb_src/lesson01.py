# %% [markdown]
# # 5주 1차시 · 표 데이터 불러오기와 살펴보기(pandas)
#
# **학습 목표**
# 1. DataFrame(표)의 행·열·인덱스를 구분한다.
# 2. `pd.read_csv`로 인터넷 주소의 CSV 파일을 불러온다.
# 3. `shape`·`head`·`info`로 표의 크기·모양·자료형을 확인한다.
# 4. `describe`·`value_counts`로 숫자 열과 범주 열을 요약한다.
#
# **사용 데이터**: `process.csv` — 사출 성형 공정 기록 494행(가상 데이터)
# - 한 행 = 제품 하나
# - `product_id` 제품 번호, `date` 생산일, `shift` 주간/야간, `line` 1~3라인, `machine` 1~6호기
# - `temp` 온도(℃), `pressure` 압력(bar), `speed` 회전수(rpm), `humidity` 습도(%)
# - `thickness` 두께(mm), `strength` 인장강도(MPa), `defect` 불량 여부(0/1), `defect_type` 불량 유형
#
# 위에서부터 셀을 하나씩 실행하세요 (Shift + Enter).

# %% [markdown]
# ## 0. 준비
# 그래프에 한글이 깨지지 않도록 하는 도구를 설치하고, pandas를 `pd`라는 이름으로 불러옵니다.

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import pandas as pd

# %% [markdown]
# ## 1. CSV 불러오기
# 실습 데이터가 있는 폴더 주소를 `DATA`에 담아 두고, 파일 이름을 붙여 읽습니다.
# `pd.read_csv`는 CSV를 **DataFrame**(표)으로 만들어 줍니다.

# %%
DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'

df = pd.read_csv(DATA + 'process.csv')   # 표를 만들어 변수 df에 담기
df.shape                                  # (행 개수, 열 개수)

# %% [markdown]
# `(494, 13)` → 제품 494개(행), 기록 항목 13개(열)입니다.
#
# ## 2. 표의 모양 보기: head, tail, columns
# 셀의 **마지막 줄** 값은 `print` 없이도 화면에 표로 나옵니다.

# %%
df.head()        # 앞 5행 (괄호 안에 숫자를 넣으면 그 개수만큼)

# %%
df.tail(3)       # 뒤 3행 → 인덱스가 493에서 끝나는지 확인

# %%
print(df.columns.tolist())   # 열 이름 13개 (철자 그대로 써야 꺼낼 수 있다)
print('행 개수:', len(df))

# %% [markdown]
# ## 3. 표의 부분 꺼내기: 열(Series), 행, 값 하나
# - `df['열 이름']` → 열 하나 = **Series**
# - `df.loc[인덱스]` → 행 하나
# - `df.loc[인덱스, '열 이름']` → 값 하나

# %%
temp = df['temp']          # 온도 열 하나
print(type(temp))          # Series 라는 자료형
print(temp.head(3))

print('---')
print(df.loc[2])                   # 인덱스 2인 행 (세 번째 제품)
print('---')
print(df.loc[2, 'temp'])           # 세 번째 제품의 온도

# %% [markdown]
# ## 4. 자료형과 빈칸 확인: info
# - **Non-Null Count**: 비어 있지 않은 값의 개수. 행 개수(494)보다 작으면 빈칸(결측치)이 있다는 뜻
# - **Dtype**: 자료형. `float64` 실수, `int64` 정수, `object`(pandas 3.0부터는 `str`) 문자열

# %%
df.info()

# %%
# 자료형만 따로 보기
df.dtypes

# %% [markdown]
# ## 5. 숫자 열 요약: describe
# count(개수), mean(평균), std(표준편차), min·max(최소·최대), 25%·50%·75%(줄 세웠을 때의 위치)를 한 번에 계산합니다.
# **min·max가 말이 되는 범위인지** 꼭 확인하세요. 온도가 999℃라면 센서 오류일 수 있습니다(5-3차시).

# %%
df.describe().round(2)     # 소수 둘째 자리까지

# %% [markdown]
# `defect`(0/1) 열의 평균은 **1의 비율 = 불량률**입니다.

# %%
print('불량률:', round(df['defect'].mean() * 100, 1), '%')

# %% [markdown]
# ## 6. 범주 열 세기: value_counts
# 문자열 열(범주)은 값마다 몇 개인지 셉니다. `normalize=True`를 주면 비율로 나옵니다.

# %%
counts = df['defect_type'].value_counts()
print(counts)
print('합계:', counts.sum(), '← 행 개수와 같은지 확인')

# %%
df['defect_type'].value_counts(normalize=True).round(3)   # 비율

# %%
# 막대그래프로 한눈에 (그래프는 7주차에 자세히)
counts.plot(kind='bar', title='불량 유형별 개수')

# %% [markdown]
# ## 7. 직접 바꿔 보기
# 아래 셀의 값을 바꿔 실행해 보세요. 기본값으로도 실행됩니다.
# 1. `N`을 10으로 바꿔 앞 10행을 보세요.
# 2. `COL`을 `'shift'`, `'line'`, `'machine'` 중 하나로 바꿔 범주별 개수를 세어 보세요. 개수의 합이 494인가요?
# 3. `FILE`을 `'lab_yield.csv'`로 바꿔 다른 데이터(실험 수율)를 불러오고, 몇 행 몇 열인지 확인해 보세요.

# %% [exercise]
N = 5                  # 1) 보고 싶은 행 개수
COL = 'defect_type'    # 2) 세어 볼 범주 열
FILE = 'process.csv'   # 3) 불러올 파일 이름

print(df.head(N))
print(df[COL].value_counts())

other = pd.read_csv(DATA + FILE)
print(FILE, '의 크기:', other.shape)
other.head()

# %% [markdown]
# ## 정리
# - **DataFrame** = 이름 붙은 열(Series) 여러 개 + 행 번호(인덱스)
# - `pd.read_csv(주소)` 한 줄로 CSV를 표로 불러온다
# - 분석 전 건강검진: `shape` → `head` → `info` → `describe` → `value_counts`
#
# **생성형AI에게 물어볼 만한 질문** (데이터 전체 대신 `df.info()`·`df.head()` 결과만 붙여 넣으세요)
# - “아래는 내 데이터의 `df.info()` 결과야. 숫자여야 할 것 같은데 문자열(object)로 나온 열이 있는지, 있다면 왜 그럴 수 있는지 알려 줘.”
# - “`df.describe()` 결과를 붙일게. 최소·최대값 중 공정 데이터로 보기에 이상한 값이 있는지 짚어 줘.”
#
# AI의 답은 반드시 **직접 코드로 다시 확인**하세요. 예: “humidity에 빈칸이 있다”고 하면 `df['humidity'].isna().sum()`으로 확인.
