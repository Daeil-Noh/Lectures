# %% [markdown]
# # 4주 1차시 · 생성형AI로 코드 만들고 실행하기
#
# **학습 목표**
# - 좋은 코딩 프롬프트의 네 요소(목표 · 데이터 설명 · 조건 · 출력 형식)를 갖춰 요청할 수 있다.
# - 생성형AI가 만든 코드를 Colab에 붙여 넣고 실행해 결과를 확인할 수 있다.
# - 이어지는 요청으로 코드를 한 걸음씩 다듬을 수 있다.
#
# **사용 데이터** `process.csv` — 사출 성형 공정 기록(가상 데이터, 494행).
# 제품마다 근무조(`shift`), 라인(`line`), 설비(`machine`), 공정 조건(온도·압력·속도·습도), 두께, 인장강도(`strength`), 불량 여부(`defect`, 0/1)가 기록되어 있습니다.
#
# 오늘의 질문: **“주간과 야간, 어느 근무조의 불량률이 더 높을까?”**
#
# > 이 파일의 “AI가 만든 코드”는 강의용으로 미리 써 둔 예시입니다. 여러분이 쓰는 생성형AI(ChatGPT, Gemini, Claude, Colab의 AI 기능 등)에 같은 프롬프트를 넣으면 **조금 다른 코드**가 나올 수 있습니다. 그것도 실행해 보고 비교해 보세요.

# %% [markdown]
# ## 0. 준비
# 한글 그래프용 패키지를 설치하고, pandas를 불러옵니다. 데이터 주소는 `DATA`에 담아 둡니다.
# **이 셀을 먼저 실행해야** 아래 셀들이 동작합니다.

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import pandas as pd
import matplotlib.pyplot as plt

# 실습 데이터가 있는 주소
DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'

# %% [markdown]
# ## 1. 프롬프트에 넣을 “데이터 설명” 재료 모으기
# AI는 우리 데이터를 보지 못합니다. 그래서 **파일 이름 · 열 이름 · 자료형 · 값의 예**를 알려 줘야 합니다.
# 먼저 데이터를 읽고 크기(행, 열)를 확인합니다.

# %%
# 데이터 불러오기 → df(데이터프레임)에 표 전체가 담긴다
df = pd.read_csv(DATA + 'process.csv')
print('행, 열 =', df.shape)

# %%
# 위에서 5줄만 보기
df.head()

# %% [markdown]
# 열마다 자료형을 확인합니다. `int64` = 정수, `float64` = 실수, `object`(또는 `str`) = 글자입니다.

# %%
df.dtypes

# %% [markdown]
# 글자 열이나 0/1 열은 **어떤 값이 들어 있는지**도 알려 주면 AI가 덜 헷갈립니다.

# %%
# 열에 들어 있는 서로 다른 값들
print('shift :', df['shift'].unique().tolist())
print('defect:', df['defect'].unique().tolist())
print('line  :', df['line'].unique().tolist())

# %% [markdown]
# ## 2. 네 요소를 갖춘 프롬프트
# 위에서 확인한 내용으로 이렇게 요청했다고 합시다.
#
# > **목표:** 주간·야간 근무조별 불량률을 비교하고 싶어.
# > **데이터:** process.csv (Colab에서 `DATA + 'process.csv'`로 읽음). `shift` = 근무조(글자, 주간/야간), `defect` = 불량 여부(정수 0/1, 1이 불량).
# > **조건:** pandas만 쓰고, 파이썬 초보자용으로 줄마다 한국어 주석을 달아 줘.
# > **출력:** 근무조별 불량률을 %로, 소수 첫째 자리까지 표로 보여 줘.
#
# ⚠️ 데이터 **전체**를 붙여 넣지 않았다는 점에 주목하세요. 열 이름·자료형·값의 예면 충분하고, 개인정보·기밀은 넣지 않습니다(1주 3차시).

# %% [markdown]
# ## 3. AI가 만든 코드 실행하기
# 아래는 위 프롬프트에 대한 AI의 답(예시)을 **그대로 붙여 넣은** 셀입니다. 실행해 보세요(▶ 또는 Shift + Enter).

# %%
# ===== AI가 만든 코드 (예시) =====
# 근무조(shift)별 불량률 = defect(0/1)의 평균
#  → 0과 1의 평균은 '1의 비율', 즉 불량 비율이 된다
rate = df.groupby('shift')['defect'].mean() * 100

# 비율 × 100 → %, 소수 첫째 자리까지
print(rate.round(1))

# %% [markdown]
# 결과가 **말이 되는지** 생각해 봅시다. 불량률이 0~100% 사이인가요? 전체 불량률(약 13.8%)과 비교하면 어느 쪽이 높고 어느 쪽이 낮나요?

# %% [markdown]
# ## 4. 이어서 요청 ① “라인별로도 나눠 줘”
# 한 번에 하나씩 요청합니다. AI가 고친 코드(예시)입니다. **바뀐 줄**은 `groupby` 안에 열이 두 개가 된 부분과 `.unstack()`(표를 옆으로 펼치기)입니다.

# %%
# 라인(line)과 근무조(shift)로 함께 묶어 불량률(%) 계산
rate2 = df.groupby(['line', 'shift'])['defect'].mean().unstack() * 100
print(rate2.round(1))

# %% [markdown]
# ## 5. 이어서 요청 ② “막대그래프로 그려 줘”

# %%
# 라인별·근무조별 불량률 막대그래프
rate2.plot(kind='bar')
plt.ylabel('불량률 (%)')
plt.title('라인·근무조별 불량률')
plt.xticks(rotation=0)   # 아래 글자를 똑바로
plt.show()

# %% [markdown]
# ## 6. AI의 해석, 숫자로 대조하기
# “결과를 해석해 줘”라고 하자 AI가 **“야간 불량률이 주간의 약 3배입니다.”** 라고 답했다고 합시다.
# 해석 속 숫자는 그대로 믿지 말고, 실행 결과로 직접 확인합니다.

# %%
# 야간 불량률 ÷ 주간 불량률 = 몇 배?
night = rate['야간']
day = rate['주간']
print('야간', round(night, 1), '% / 주간', round(day, 1), '%')
print('야간은 주간의', round(night / day, 1), '배')

# %% [markdown]
# ## 7. 직접 바꿔 보기
# 아래 셀들은 그대로도 실행됩니다. 값을 바꾸고 다시 실행해 결과가 어떻게 달라지는지 보세요.
#
# **과제 1.** `group_col`을 `'line'` 또는 `'machine'`으로, `value_col`을 `'strength'`(인장강도)나 `'temp'`(온도)로 바꿔 보세요.

# %% [exercise]
group_col = 'shift'     # ← 'line', 'machine' 으로 바꿔 보기
value_col = 'defect'    # ← 'strength', 'temp', 'humidity' 로 바꿔 보기

result = df.groupby(group_col)[value_col].mean()
print(group_col, '별', value_col, '평균')
print(result.round(2))

# %% [markdown]
# **과제 2.** 두 열로 묶어 봅니다. `cols`를 `['machine', 'shift']`로 바꾸면 설비별·근무조별 불량률이 나옵니다.

# %% [exercise]
cols = ['line', 'shift']    # ← ['machine', 'shift'] 로 바꿔 보기

table = df.groupby(cols)['defect'].mean().unstack() * 100
print(table.round(1))

# %% [markdown]
# **과제 3. 나만의 프롬프트 만들기** — 3주차에 배운 반복문·조건문으로 “데이터 설명”을 자동으로 만듭니다.
# `goal`과 `use_cols`를 바꾼 뒤, 출력된 프롬프트를 복사해 생성형AI에게 그대로 요청해 보세요. 받은 코드를 아래에 새 셀을 만들어 실행해 봅니다.

# %% [exercise]
goal = '라인별 평균 인장강도를 비교하고 싶어.'      # ← 알고 싶은 것으로 바꾸기
use_cols = ['line', 'strength']                    # ← 쓸 열 이름으로 바꾸기

lines = []
for c in use_cols:
    t = str(df[c].dtype)
    if t.startswith('int'):
        kind = '정수'
    elif t.startswith('float'):
        kind = '실수'
    else:
        kind = '글자'
    lines.append(f'{c}({kind}, 예: {df[c].iloc[0]})')

print('목표:', goal)
print("데이터: process.csv (DATA + 'process.csv'로 읽음). 열:", ', '.join(lines))
print('조건: pandas만 쓰고, 초보자용으로 줄마다 한국어 주석을 달아 줘.')
print('출력: 결과를 소수 둘째 자리까지 표로 보여 줘.')

# %% [markdown]
# ## 정리
# - 좋은 코딩 프롬프트 = **목표 + 데이터 설명 + 조건 + 출력 형식**. 빠진 칸은 AI가 추측합니다.
# - 데이터 설명은 `df.shape`, `df.head()`, `df.dtypes`, `unique()`로 확인해 **열 이름·자료형·값의 예**만 적습니다.
# - AI의 코드는 Colab에서 **실행하고**, 결과와 해석 속 숫자가 말이 되는지 **직접 확인**합니다.
# - 다듬을 때는 **한 번에 하나씩** 요청합니다.
#
# **생성형AI에게 물어볼 만한 질문**
# - “`df.groupby('shift')['defect'].mean()`이 왜 불량 비율이 되는지 0과 1로 된 작은 예로 설명해 줘.”
# - “방금 코드에서 `.unstack()`을 빼면 결과가 어떻게 달라지는지 보여 주고, 차이를 설명해 줘.”
