# %% [markdown]
# # 2주 2차시 · 데이터의 종류 — 실제 파일의 열 들여다보기 (선택 실습)
#
# **학습 목표**
# - 공정 기록 `process.csv`의 열마다 어떤 종류의 변수인지 확인한다.
# - 컴퓨터(pandas)가 읽은 자료형과 사람이 아는 의미가 다를 수 있음을 본다.
# - 범주형은 개수·비율로, 수치형은 평균·범위로 요약해 본다.
# - 센서 시계열(`vibration.csv`)과 실험 데이터(`lab_yield.csv`)의 생김새를 비교한다.
#
# **사용 데이터** (모두 이 강의용 가상 데이터)
# - `process.csv`: 사출 성형 공정 기록 494행 — 제품 하나가 한 행
# - `vibration.csv`: 설비 6대의 하루 1번 진동 측정 기록
# - `lab_yield.csv`: 실험 조건(온도·시간·촉매량)별 수율 60행
#
# > 코드를 직접 쓰지 않아도 됩니다. 각 칸 왼쪽의 ▶ 버튼을 눌러 위에서부터 차례로 실행하세요.
# > Colab 사용법은 3주 1차시에서 자세히 배웁니다.

# %% [markdown]
# ## 0. 준비
# 그래프에 한글이 보이도록 글꼴 도구를 설치하고, 데이터 분석 도구(pandas)를 불러옵니다.

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import pandas as pd
import matplotlib.pyplot as plt

# 실습 데이터가 있는 주소
DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'

# %% [markdown]
# ## 1. 공정 기록 불러오기
# 표 모양 그대로 읽어 `df`라는 이름으로 둡니다. 앞의 5줄만 봅니다.

# %%
df = pd.read_csv(DATA + 'process.csv')
df.head()

# %% [markdown]
# 행(제품)과 열(기록 항목)이 몇 개인지 확인합니다. 결과는 `(행 수, 열 수)`입니다.

# %%
df.shape

# %% [markdown]
# ## 2. 컴퓨터는 열을 어떻게 읽었을까?
# - `object` = 글자, `float64` = 소수가 있는 숫자, `int64` = 정수
# - 슬라이드에서 분류한 결과와 비교해 보세요. `speed`와 `defect`는 둘 다 `int64`인데, 의미도 같을까요?

# %%
df.dtypes

# %% [markdown]
# 열마다 서로 다른 값이 몇 가지인지 셉니다. 값의 가짓수가 적으면 범주형일 가능성이 큽니다.

# %%
df.nunique()

# %% [markdown]
# ## 3. 범주형 열은 개수로 요약한다
# 근무조(`shift`)별로 제품이 몇 개인지 셉니다.

# %%
df['shift'].value_counts()

# %% [markdown]
# **직접 바꿔 보기 ①**: 따옴표 안의 열 이름을 `'line'`, `'machine'`, `'defect_type'` 중 하나로 바꿔 다시 실행해 보세요.

# %% [exercise]
col = 'shift'          # ← 여기를 'line', 'machine', 'defect_type' 등으로 바꿔 보세요
df[col].value_counts()

# %% [markdown]
# ## 4. 수치형 열은 평균·범위로 요약한다
# `describe()`는 수치형 열의 개수·평균·표준편차·최솟값·사분위수·최댓값을 한 번에 보여 줍니다.

# %%
df[['temp', 'pressure', 'speed', 'humidity', 'thickness', 'strength']].describe().round(2)

# %% [markdown]
# `defect`는 0(정상)과 1(불량)로 된 범주형이지만, 평균을 내면 **1의 비율 = 불량률**이 됩니다.

# %%
print('defect 평균:', round(df['defect'].mean(), 3))
print('불량률(%):', round(df['defect'].mean() * 100, 1))

# %% [markdown]
# **직접 바꿔 보기 ②**: `machine` 열의 평균을 내 보려고 하면 어떻게 될까요? 아래 칸은 오류 없이 실행되도록 `try`로 감싸 두었습니다.
# 범주형 열(`'machine'`)을 수치형 열(`'temp'`)로 바꿔 결과를 비교해 보세요.

# %% [exercise]
col = 'machine'        # ← 'temp' 로 바꿔 보세요
try:
    print(col, '평균:', df[col].mean())
except Exception as e:
    print(col, '열은 평균을 낼 수 없습니다 →', type(e).__name__)

# %% [markdown]
# ## 5. 센서 시계열: 시간 순서가 의미를 가진다
# `vibration.csv`에서 1호기만 골라, 하루 1번 잰 진동(`rms`)을 날짜 순서대로 그립니다.

# %%
vib = pd.read_csv(DATA + 'vibration.csv')
m1 = vib[vib['machine'] == '1호기']
plt.figure(figsize=(9, 3))
plt.plot(m1['day'], m1['rms'], marker='.')
plt.xlabel('날짜 (일)')
plt.ylabel('진동 rms')
plt.title('1호기 일일 진동 — 하루 1번 측정')
plt.show()

# %% [markdown]
# **직접 바꿔 보기 ③**: `'1호기'`를 `'2호기'`~`'6호기'` 중 하나로 바꿔 보세요. 설비마다 모양이 같을까요?

# %% [exercise]
name = '1호기'         # ← 다른 호기로 바꿔 보세요
m = vib[vib['machine'] == name]
plt.figure(figsize=(9, 3))
plt.plot(m['day'], m['rms'], marker='.')
plt.title(name + ' 일일 진동')
plt.show()

# %% [markdown]
# ## 6. 실험 데이터: 조건 → 결과
# 앞의 세 열(`temp`, `hours`, `catalyst`)은 사람이 정한 **조건**, 마지막 열(`yield_pct`)은 잰 **결과**입니다.

# %%
lab = pd.read_csv(DATA + 'lab_yield.csv')
print(lab.shape)
lab.head()

# %% [markdown]
# ## 정리
# - 표의 **한 행 = 관측 하나**, **한 열 = 변수 하나**
# - pandas는 글자(`object`)·실수(`float64`)·정수(`int64`)만 구분한다. **범주형인지 수치형인지는 의미를 아는 사람이 판단**한다.
# - 범주형은 `value_counts()`로 개수, 수치형은 `describe()`로 평균·범위를 본다.
# - 센서 데이터는 **시간 순서**, 실험 데이터는 **조건 → 결과** 구조를 기억하자.
