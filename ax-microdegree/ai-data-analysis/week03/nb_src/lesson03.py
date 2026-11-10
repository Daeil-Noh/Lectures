# %% [markdown]
# # 3주 3차시 · 파이썬 최소 문법 ②: 조건문·반복문·라이브러리
#
# **학습 목표**
# - `if · elif · else` 로 온도 기준에 따라 다르게 판단한다
# - `for` 로 리스트를 돌며 평균을 내고, 기준을 넘는 값을 센다 (들여쓰기 = 범위)
# - 함수를 불러 쓰고, `import` 로 라이브러리(pandas)를 꺼내 첫 CSV 파일을 읽는다
#
# **사용 데이터**: 설명용 온도 6개, 그리고 `process.csv` — 사출 성형 공정 기록 494행 (실습용 가상 데이터)의 온도(temp) 열.
#
# > 먼저 **파일 → Drive에 사본 저장**! 그리고 위에서부터 차례로 실행하세요 (Shift + Enter).

# %% [markdown]
# ## 0. 준비
# 그래프 한글 표시 도구입니다. 처음 한 번 실행하세요.

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import matplotlib.pyplot as plt

# %% [markdown]
# ## 1. 조건문 if: 조건이 참이면 들여쓴 줄을 실행
# 비교 기호: `>` `<` `>=` `<=` `==`(같다) `!=`(다르다). 비교의 결과는 `True` 또는 `False` 입니다.

# %%
temp = 223.4
print(temp > 220)        # 비교 결과 확인 → True

if temp > 220:
    print('경보! 온도가 높습니다')
print('점검 끝')         # 들여쓰지 않은 줄은 조건과 상관없이 실행

# %% [markdown]
# ## 2. if · elif · else: 3단계 경보
# 위에서부터 검사해서 **처음으로 참인 곳 하나만** 실행합니다. `temp` 값을 바꿔 가며 다시 실행해 보세요 (예: 230, 218, 210).
#
# > 들여쓰기 실험: 아래 셀에서 `print('정상')` 앞의 공백 4칸을 지우고 실행해 보세요 → `IndentationError`. 확인했으면 다시 4칸을 넣어 두세요.

# %%
temp = 218.0
if temp >= 225:
    print('위험: 즉시 정지')
elif temp >= 215:
    print('주의: 냉각 확인')
else:
    print('정상')

# %% [markdown]
# ## 3. 반복문 for: 하나씩 꺼내 반복
# `for t in temps:` → 리스트에서 값을 하나씩 꺼내 `t` 에 넣고, 들여쓴 줄을 반복합니다.

# %%
temps = [218.2, 222.5, 209.8, 225.1, 216.4, 221.0]
for t in temps:
    print(t, '확인')
print('끝')

# %%
# 횟수로 반복할 때는 range — 0부터 시작합니다
for i in range(3):
    print(i, '번째 반복')

# %% [markdown]
# ## 4. 반복문의 단골 패턴: 누적(합)과 세기
# 슬라이드의 **직접 해 보기 2** 와 같은 코드입니다.

# %%
total = 0                  # 합을 쌓을 상자
count = 0                  # 개수를 셀 상자
for t in temps:
    total = total + t      # ① 누적
    if t > 220:            # ② 조건에 맞으면
        count = count + 1  #    +1
avg = total / len(temps)
print(f'평균 {avg:.1f}℃, 220 초과 {count}개')

# %%
# 반복문과 if를 함께: 값마다 판정 붙이기
for t in temps:
    if t > 220:
        print(t, '→ 경보')
    else:
        print(t, '→ 정상')

# %% [markdown]
# ## 5. 함수: 이름(입력)으로 불러 쓰기
# 이미 `print()`, `type()`, `len()` 을 써 봤습니다. 다른 함수도 같은 모양입니다.

# %%
print(round(avg, 1))           # 반올림
print(max(temps), min(temps))  # 가장 큰 값, 가장 작은 값
print(sum(temps))              # 합

# %% [markdown]
# **맛보기: 함수를 직접 만들기 (`def`)** — 이 강의에서는 대부분 불러 쓰기만 하지만, 생성형AI가 만든 코드에서 자주 보게 됩니다.
# `return` 은 함수의 결과를 돌려줍니다.

# %%
def check(t):
    if t > 220:
        return '경보'
    return '정상'

print(check(223.4))
print(check(209.8))

# %% [markdown]
# ## 6. 라이브러리: import로 공구함 꺼내기
# 라이브러리는 쓰기 전에 **import** 해야 합니다. `as` 는 별명입니다. (Colab에는 이미 설치되어 있습니다)

# %%
import math
print(math.sqrt(16))      # 공구함.도구( )
print(round(math.pi, 2))

# %% [markdown]
# ## 7. 총동원: process.csv 494개 중 220℃ 초과 세기
# `pd.read_csv` 로 표를 읽고, 온도 열을 리스트로 바꾼 뒤, 오늘 배운 반복문과 조건문으로 셉니다.

# %%
import pandas as pd

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
df = pd.read_csv(DATA + 'process.csv')
print(df.shape)                    # (행 수, 열 수)

real = df['temp'].tolist()         # 온도 열 → 리스트
count = 0
for t in real:
    if t > 220:
        count = count + 1
print(f'{len(real)}개 중 220℃ 초과 {count}개')

# %%
# 5주차 미리 보기: pandas로는 한 줄!
print((df['temp'] > 220).sum())

# 히스토그램에 기준선 그리기
df['temp'].hist(bins=30)
plt.axvline(220, color='red', linestyle='--', label='기준 220℃')
plt.title('사출 온도 분포와 경보 기준')
plt.xlabel('온도 (℃)')
plt.ylabel('제품 수')
plt.legend()
plt.show()

# %% [markdown]
# ## 직접 바꿔 보기
# 1. `limit` 을 215, 225로 바꿔 보세요. 494개 중 기준을 넘는 개수가 어떻게 바뀌나요?
# 2. 3단계 경보의 기준 `warn`, `danger` 를 바꿔 보세요. 그리고 **if와 elif의 조건을 서로 바꿔** 실행하면 위험 개수가 어떻게 되나요? (슬라이드 직접 해 보기 1)
# 3. `>` 를 `>=` 로 바꾸면 결과가 달라지나요? 기준과 **똑같은 값**이 있을 때 차이가 납니다.

# %% [exercise]
limit = 220
count = 0
for t in real:
    if t > limit:
        count = count + 1
print(f'{limit}℃ 초과: {count}개')

# %% [exercise]
warn = 215
danger = 225
n_ok, n_warn, n_danger = 0, 0, 0     # 세 상자를 한 줄에 0으로
for t in real:
    if t >= danger:
        n_danger = n_danger + 1
    elif t >= warn:
        n_warn = n_warn + 1
    else:
        n_ok = n_ok + 1
print(f'정상 {n_ok}개, 주의 {n_warn}개, 위험 {n_danger}개')

# %% [exercise]
values = [221.0, 219.5, 224.3, 220.0]
count = 0
for t in values:
    if t > 220:
        count = count + 1
print(count)

# %% [markdown]
# ## 정리
# - **조건문**: `if · elif · else` 는 위에서부터 검사해 처음 참인 곳 하나만 실행한다. 조건의 순서가 중요하다.
# - **반복문**: `for t in 리스트:` 로 하나씩 꺼내 반복. 누적(`total = total + t`)과 세기(`count = count + 1`). **들여쓰기가 범위**.
# - **함수·라이브러리**: `이름(입력)` 으로 불러 쓰고, 라이브러리는 `import` 먼저. `import pandas as pd` → `pd.read_csv(...)`.
#
# 다음 주(4주차)에는 이런 코드를 **생성형AI에게 만들어 달라고** 하고, 오늘 배운 문법으로 그 코드를 읽고 검증합니다.
