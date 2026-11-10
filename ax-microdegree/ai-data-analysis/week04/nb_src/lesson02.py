# %% [markdown]
# # 4주 2차시 · AI로 오류 메시지 읽고 해결하기
#
# **학습 목표**
# - 오류 메시지(트레이스백)를 **아래에서부터** 읽고 오류 종류·메시지·문제 줄을 찾을 수 있다.
# - 자주 만나는 오류 여섯 가지(NameError, KeyError, TypeError, ValueError, FileNotFoundError, IndentationError)의 흔한 원인을 말할 수 있다.
# - 오류 메시지 전체·코드·하려던 것·열 이름을 묶어 생성형AI에게 질문할 수 있다.
#
# **사용 데이터** `process.csv` — 사출 성형 공정 기록(가상 데이터, 494행). 열: `product_id, date, shift, line, machine, temp, pressure, speed, humidity, thickness, strength, defect, defect_type`
#
# > 이 파일은 **일부러 오류를 냅니다.** 그래도 끝까지 멈추지 않도록, 오류가 나면 빨간 글씨 대신 “오류 종류 : 메시지”를 한 줄로 보여 주게 만들어 두었습니다.

# %% [markdown]
# ## 0. 준비

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import pandas as pd
import traceback          # 오류 메시지 전체를 글자로 꺼내 보는 도구

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'

# %% [markdown]
# ## 1. 오류를 멈추지 않고 보여 주는 장치: `try` / `except`
# 보통은 오류가 나면 셀이 그 자리에서 멈추고 빨간 메시지가 나옵니다.
# `try:` 안의 코드를 실행하다 오류가 나면, 멈추는 대신 `except` 아래 코드가 실행됩니다.
# 여기서는 **오류 종류**(`type(e).__name__`)와 **메시지**(`e`)를 출력하게 했습니다. 트레이스백 맨 아래 한 줄과 같은 내용입니다.

# %%
try:
    print(rate)          # rate 라는 변수는 아직 만든 적이 없다
except Exception as e:
    print('오류 종류:', type(e).__name__)
    print('메시지  :', e)

# %% [markdown]
# 이제 데이터를 읽어 둡니다. (이 셀을 건너뛰면 아래에서 `NameError: name 'df' is not defined`가 납니다.)

# %%
df = pd.read_csv(DATA + 'process.csv')
print('행, 열 =', df.shape)

# %% [markdown]
# ## 2. 트레이스백 전체를 아래에서부터 읽기
# 4주 1차시의 “막연한 요청”으로 받은 코드입니다. `traceback.format_exc()`로 오류 메시지 **전체**를 출력해 봅니다.
#
# 읽는 순서: **① 맨 아래 줄**(오류 종류: 메시지) → **② 내 코드의 줄**(`<module>` 또는 `<cell line>` 이 있는 덩어리) → ③ 그 사이 pandas 내부 경로는 건너뛰기.
# (Colab에서 오류를 그대로 내면 모양이 조금 다르게 보이지만, 맨 아래 줄은 같습니다.)

# %%
try:
    print(df['불량'].value_counts())     # AI가 추측한 열 이름
except Exception:
    print(traceback.format_exc())

# %% [markdown]
# 덩어리가 두 개(“The above exception was the direct cause of the following exception”)로 나와도 당황하지 마세요. **마지막 덩어리의 맨 아래 줄**이 핵심입니다.
# `File "<string>"` 또는 `<module>`이 있는 줄이 내 코드이고, `.../pandas/...` 줄은 pandas 내부라 건너뜁니다.
#
# 맨 아래 `KeyError: '불량'` = “‘불량’이라는 열(키)을 찾을 수 없다.” 실제 열 이름을 확인하고 고칩니다.

# %%
# 실제 열 이름 확인
print(df.columns.tolist())

# 고친 코드: 불량 여부 열의 실제 이름은 defect (0=양품, 1=불량)
print(df['defect'].value_counts())

# %% [markdown]
# ## 3. 자주 만나는 오류 여섯 가지 — 내 보고, 고쳐 보기
# 각 셀은 **오류가 나는 코드**를 `try`로 감싸 메시지를 보여 준 뒤, 아래에 **고친 코드**를 실행합니다.
#
# **① NameError — 모르는 이름(오타, 실행하지 않은 셀)**

# %%
try:
    print(dff.shape)          # 오타: dff
except Exception as e:
    print(type(e).__name__, ':', e)

print('고친 코드 →', df.shape)

# %% [markdown]
# **② KeyError — 없는 열 이름(대소문자도 구분)**

# %%
try:
    print(df.groupby('Shift')['defect'].mean())     # 대문자 S
except Exception as e:
    print(type(e).__name__, ':', e)

print('고친 코드 →')
print(df.groupby('shift')['defect'].mean())

# %% [markdown]
# **③ TypeError — 맞지 않는 자료형끼리 계산(글자 + 숫자)**

# %%
avg = df['strength'].mean()
try:
    print('평균 강도: ' + avg)            # 글자 + 숫자
except Exception as e:
    print(type(e).__name__, ':', e)

print('고친 코드 → 평균 강도:', round(avg, 2))       # 쉼표로 나눠 출력
print(f'고친 코드 → 평균 강도: {avg:.2f} MPa')       # f-문자열도 가능

# %% [markdown]
# **④ ValueError — 자료형은 맞는데 값이 이상함**
# 정리 전 데이터 `process_raw.csv`의 두께(`thickness`) 열에는 `'2.01mm'`처럼 단위가 붙은 글자가 섞여 있습니다.

# %%
raw = pd.read_csv(DATA + 'process_raw.csv')
mm = raw[raw['thickness'].str.contains('mm')]
print('mm가 붙은 값', len(mm), '개, 예:', mm['thickness'].head(3).tolist())

try:
    print(float('2.01mm'))
except Exception as e:
    print(type(e).__name__, ':', e)

print('고친 코드 →', float('2.01mm'.replace('mm', '')))   # 'mm'를 지운 뒤 숫자로

# %% [markdown]
# **⑤ FileNotFoundError — 없는 파일(파일 이름 오타, 경로 빠짐)**
# `DATA +`를 빼먹으면 Colab은 내 작업 폴더에서 파일을 찾다가 실패합니다.
# (참고: 인터넷 주소 안의 파일 이름을 틀리면 `HTTPError: HTTP Error 404: Not Found`가 납니다.)

# %%
try:
    pd.read_csv('process.csv')          # 경로(DATA) 빠짐
except Exception as e:
    print(type(e).__name__, ':', e)

print('고친 코드 →', pd.read_csv(DATA + 'process.csv').shape)

# %% [markdown]
# **⑥ IndentationError — 들여쓰기가 맞지 않음**
# 들여쓰기 오류가 있으면 셀 전체가 아예 실행되지 않습니다. 그래서 여기서는 코드를 **글자(문자열)** 로 만들어 실행해 메시지만 확인합니다.

# %%
bad_code = 'for i in range(3):\nprint(i)'      # for 다음 줄을 안 들여 씀
try:
    exec(bad_code)
except Exception as e:
    print(type(e).__name__, ':', e)

print('고친 코드 →')
for i in range(3):
    print(i)

# %% [markdown]
# ## 4. 고친 뒤에는 결과까지 확인
# 오류가 사라졌다고 끝이 아닙니다. 고친 코드의 결과가 **말이 되는지** 봅니다.
# 불량 개수 ÷ 전체 개수 = 불량률이고, 0/1 열의 평균과 같아야 합니다.

# %%
n_bad = df['defect'].sum()
n_all = len(df)
print('불량', n_bad, '개 / 전체', n_all, '개')
print('직접 계산한 불량률(%):', round(n_bad / n_all * 100, 1))
print('mean()으로 구한 불량률(%):', round(df['defect'].mean() * 100, 1))

# %% [markdown]
# ## 5. 직접 바꿔 보기
# **과제 1.** 오류 메시지를 읽고 `col`을 올바른 열 이름으로 고쳐 보세요. (힌트가 함께 출력됩니다.)

# %% [exercise]
col = 'Strength'      # ← 오류 메시지를 읽고 고쳐 보기

try:
    print(col, '평균:', round(df[col].mean(), 2))
except Exception as e:
    print('오류 →', type(e).__name__, ':', e)
    print('힌트: 실제 열 이름 =', df.columns.tolist())

# %% [markdown]
# **과제 2.** `text`를 숫자로 바꿀 수 있게 고쳐 보세요. 방법은 두 가지: 값을 `'2.01'`로 바꾸거나, `float(text.replace('mm', ''))`로 고치기.

# %% [exercise]
text = '2.01mm'       # ← process_raw.csv 의 thickness 열에 실제로 섞여 있는 모양

try:
    value = float(text)
    print('두께 + 0.1 =', round(value + 0.1, 3))
except Exception as e:
    print('오류 →', type(e).__name__, ':', e)

# %% [markdown]
# **과제 3. AI에게 보낼 질문 묶음 만들기** — 오류가 나면 코드·오류 메시지 전체·하려던 것·열 이름을 한 번에 출력합니다.
# 출력된 내용을 복사해 생성형AI에게 그대로 보내 보세요. `my_code`를 다른 오류 코드(예: `"df.groupby('Line')['strength'].mean()"`)로 바꿔 봐도 됩니다.

# %% [exercise]
my_code = "print(df['불량'].value_counts())"     # ← 오류가 난 코드
goal = '불량품 개수와 불량률을 알고 싶었어.'       # ← 하려던 것

try:
    exec(my_code)
    print('오류 없이 실행됐습니다!')
except Exception:
    print('Colab에서 아래 코드를 실행했더니 오류가 났어. 원인과 고친 코드를 초보자도 알게 설명해 줘.')
    print('[코드]', my_code)
    print('[오류]')
    print(traceback.format_exc())
    print('[하려던 것]', goal)
    print('[데이터 열]', ', '.join(f'{c}({df[c].dtype})' for c in df.columns))

# %% [markdown]
# ## 정리
# - 트레이스백은 **아래에서부터**: 맨 아래 “오류 종류: 메시지” → 내 코드의 줄 → pandas 내부는 건너뛰기.
# - 여섯 가지 오류의 첫 확인: 이름 오타·셀 실행 순서(NameError), `df.columns`(KeyError), 자료형(TypeError), 값의 모양(ValueError), 경로(FileNotFoundError), 들여쓰기(IndentationError).
# - AI에게는 **오류 메시지 전체 + 코드 + 하려던 것 + 열 이름**을 함께. 질문에 개인정보·비밀번호가 섞이지 않았는지 먼저 확인합니다.
# - 고친 뒤에는 **다시 실행하고 결과가 말이 되는지** 확인합니다.
#
# **생성형AI에게 물어볼 만한 질문**
# - “`KeyError`와 `NameError`의 차이를 pandas 데이터프레임 예시로 한 가지씩 보여 줘.”
# - “방금 고쳐 준 코드에서 원래 코드와 **달라진 줄만** 표시하고, 왜 그렇게 바꿨는지 설명해 줘.”
