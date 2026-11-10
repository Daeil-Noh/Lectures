# %% [markdown]
# # 3주 2차시 · 파이썬 최소 문법 ①: 변수·자료형·리스트
#
# **학습 목표**
# - `=` 로 값에 이름(변수)을 붙이고, 값을 바꿔 넣는다
# - 자료형(int·float·str·bool)을 `type()` 으로 확인하고, 계산·출력(f-string)을 한다
# - 리스트를 만들고 인덱스(0부터)·`len`·`append`·슬라이싱을 쓴다
#
# **사용 데이터**: 1~6호기 평균 온도(`process.csv`에서 계산한 값)와, 마지막 단계에서 `process.csv`(사출 성형 공정 기록 494행, 실습용 가상 데이터)의 온도 열.
#
# > 먼저 **파일 → Drive에 사본 저장**! 그리고 위에서부터 차례로 실행하세요 (Shift + Enter).

# %% [markdown]
# ## 0. 준비
# 그래프에 한글이 깨지지 않게 하는 도구입니다. 처음 한 번 실행하세요.

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import matplotlib.pyplot as plt

# %% [markdown]
# ## 1. 변수: 이름표를 붙인 상자
# `=` 는 “같다”가 아니라 **“오른쪽 값을 왼쪽 이름에 넣어라”** 입니다.

# %%
temp = 211.5      # 3호기 온도
count = 120       # 오늘 생산 개수
print(temp)
print(count)

# %% [markdown]
# 같은 이름에 다시 넣으면 **덮어씁니다.** 오른쪽(`temp + 3`)을 먼저 계산한 뒤 temp에 넣습니다.

# %%
temp = temp + 3   # 온도가 3도 올랐다
print(temp)

# %% [markdown]
# ## 2. 자료형: 값의 종류
# | 자료형 | 뜻 | 예 |
# |---|---|---|
# | `int` | 정수 | 120 |
# | `float` | 실수(소수점) | 211.5 |
# | `str` | 문자열(따옴표) | '3호기' |
# | `bool` | 참/거짓 | True, False |

# %%
name = '3호기'
is_defect = False          # 불량인가? → 아니오
print(type(count), type(temp), type(name), type(is_defect))

# %% [markdown]
# ## 3. 계산하기
# `+ - * /` 와 함께 `//`(몫), `%`(나머지)도 자주 씁니다. `/` 의 결과는 항상 소수(float)입니다.

# %%
defect = 7                       # 불량 개수
good = count - defect            # 양품 개수
rate = defect / count * 100      # 불량률(%)
print(good)
print(rate)
print(125 // 12, 125 % 12)       # 125개를 12개씩 담으면: 몇 상자, 몇 개 남나

# %% [markdown]
# ## 4. f-string으로 보기 좋게 출력
# 따옴표 앞에 `f`, 변수는 `{ }` 안에. `{rate:.1f}` 는 소수 첫째 자리까지 보여 줍니다.

# %%
print(f'{name} 온도: {temp}℃')
print(f'양품 {good}개, 불량률 {rate:.1f}%')

# %% [markdown]
# **글자와 숫자는 섞이지 않습니다.** 새 코드 셀을 만들어 `'3호기' + 1` 을 실행해 보세요 → `TypeError` 가 납니다.
# 아래처럼 글자끼리 `+` 하면 이어 붙고, `int()` 로 숫자로 바꾸면 계산됩니다.

# %%
print('120' + '5')       # 글자끼리: 이어 붙이기
print(int('120') + 5)    # 숫자로 바꾼 뒤 더하기

# %% [markdown]
# ## 5. 리스트: 여러 값을 순서대로
# 대괄호 `[ ]` 안에 쉼표로 구분합니다. **번호(인덱스)는 0부터** 셉니다. 음수 인덱스는 뒤에서부터입니다.

# %%
temps = [210.9, 211.7, 210.0, 213.0, 211.7, 211.1]   # 1~6호기 평균 온도
print(temps)
print(temps[0], temps[2], temps[-1])   # 1호기, 3호기, 마지막(6호기)
print(len(temps))                      # 칸 개수

# %% [markdown]
# **슬라이싱** `[a:b]` 는 a번부터 **b번 앞까지** 자릅니다. `append()` 는 맨 뒤에 값을 하나 붙입니다.

# %%
print(temps[0:3])        # 0, 1, 2번 → 1~3호기
temps.append(212.4)      # 새로 들인 7호기(가상 값) 추가
print(temps)
print(len(temps))

# %%
# 평균 = 합 ÷ 개수
avg = sum(temps) / len(temps)
print(f'평균 온도: {avg:.1f}℃')
print(f'가장 높은 온도: {max(temps)}℃, 가장 낮은 온도: {min(temps)}℃')

# %%
# 리스트 두 개로 막대그래프 그리기 (그래프는 7주차에 자세히)
machines = ['1호기', '2호기', '3호기', '4호기', '5호기', '6호기', '7호기']
plt.bar(machines, temps)
plt.ylim(208, 214)
plt.title('호기별 평균 온도')
plt.ylabel('온도 (℃)')
plt.show()

# %% [markdown]
# ## 6. 실제 데이터도 결국 값의 줄
# `process.csv` 의 온도 열 494개를 리스트로 받아 봅니다. (pandas는 3-3과 5주차에 배웁니다)

# %%
import pandas as pd

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
df = pd.read_csv(DATA + 'process.csv')
real = df['temp'].tolist()       # 온도 열 → 파이썬 리스트
print(len(real))                 # 몇 개?
print(real[:5])                  # 앞의 5개
print(f'평균 {sum(real) / len(real):.1f}℃')

# %% [markdown]
# ## 직접 바꿔 보기
# 1. 아래 첫 셀의 `count`, `defect` 를 바꿔 보세요. 불량률이 어떻게 바뀌나요? (예: 200개 중 13개)
# 2. `i` 를 0~6 사이로 바꿔 보세요. `i = 7` 이면 어떤 오류가 날까요? 음수(-1, -2)도 넣어 보세요.
# 3. `start`, `end` 를 바꿔 원하는 호기만 잘라 보세요. `end` 번 칸이 포함되나요?

# %% [exercise]
count = 120
defect = 7
good = count - defect
print(f'양품 {good}개, 불량률 {defect / count * 100:.1f}%')

# %% [exercise]
i = 2
print(f'인덱스 {i} → 온도 {temps[i]}℃')

# %% [exercise]
start = 0
end = 3
print(temps[start:end])

# %% [markdown]
# ## 정리
# - **변수**: `=` 는 오른쪽 값을 왼쪽 이름에 넣기. 다시 넣으면 덮어쓴다.
# - **자료형**: int · float · str(따옴표) · bool. 글자와 숫자는 섞이지 않는다.
# - **리스트**: 인덱스는 0부터, `[-1]` 은 마지막, `[a:b]` 는 b 앞까지. `len`, `append`, `sum`.
#
# 다음 차시(3-3)에서는 리스트의 값을 하나씩 꺼내(**반복문**) 기준과 비교하는(**조건문**) 법을 배웁니다.
