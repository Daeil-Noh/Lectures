# %% [markdown]
# # 14주 2차시 · 전공 분석 보고서 템플릿
#
# **사용 방법**
# 1. `파일 → 드라이브에 사본 저장`으로 내 사본을 만든다.
# 2. `[ ]`로 표시된 곳을 내 내용으로 바꾼다. 안내 문장(> 로 시작하는 줄)은 다 쓴 뒤 지운다.
# 3. 코드 셀은 예시로 `process.csv`(가상 공정 데이터)를 읽도록 되어 있어 **그대로도 실행된다**. 내 데이터로 바꿔 쓴다.
# 4. 제출 전 `런타임 → 모두 실행`으로 **위에서부터 끝까지 오류 없이** 도는지 확인한다 (14주 3차시 점검표).
#
# ---
#
# # [제목: 무엇을, 어떤 데이터로 — 예) 사출 성형 공정 조건에 따른 인장강도 예측]
#
# [학과] [학번] [이름] · AI와 데이터 분석 · 전공 분석 보고서

# %% [markdown]
# ## 요약
# > 4~5문장. ① 질문 ② 데이터(무엇, 몇 개) ③ 방법 ④ 핵심 결과(숫자 포함) ⑤ 결론·한계 한 줄.
#
# [14주 1차시 예시) 공정 조건으로 인장강도를 예측할 수 있는지 알아보기 위해 사출 성형 기록 494개를 분석하였다. 선형 회귀에 온도의 곡선 효과를 더한 모델은 시험 데이터에서 평균 절대 오차 1.05 MPa(R² 0.83)로 강도를 예측하였다. 관찰 범위 안에서 압력이 강도와 가장 크게 관련되었다. 관찰 데이터이므로 인과 관계는 실험으로 확인해야 한다.]

# %% [markdown]
# ## 1. 배경과 분석 질문
# > 왜 이 문제가 중요한가(전공 맥락 2~3문장) → **데이터로 답할 수 있는 질문** 1~2개 (9주 3차시).
#
# - 배경: [ ]
# - 분석 질문: [ ]
# - 결과 변수: [ ] / 입력 변수: [ ]

# %% [markdown]
# ## 2. 데이터
# > 출처(기관·데이터명·연도·주소·접근일), 수집 기간, 행·열 수, 주요 변수와 단위, 전처리(무엇을 몇 개 어떻게)를 적는다.
#
# - 출처: [예) 「AI와 데이터 분석」 실습 데이터 process.csv (가상 데이터), 2026, 접근일 YYYY-MM-DD]
# - 기간·규모: [ ]
# - 전처리: [예) 중복 5행 제거, 센서 오류값 8개를 결측 처리 후 중앙값으로 채움]

# %%
# 준비: 한글 그래프
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'

# %% [exercise]
# 내 데이터로 바꾸는 곳 — 파일 이름과 변수 이름만 바꾸면 아래 셀이 그대로 돈다
df = pd.read_csv(DATA + 'process.csv')
target = 'strength'                                   # 결과 변수
features = ['temp', 'pressure', 'speed', 'humidity', 'thickness']   # 입력 변수
print(df.shape)
df.head()

# %%
# 데이터 품질 확인: 결측·중복·범위 — 결과를 '2. 데이터' 문단에 숫자로 옮겨 적는다
print('결측값:', df[features + [target]].isna().sum().to_dict())
print('중복 행:', df.duplicated().sum())
df[features + [target]].describe().round(2)

# %% [markdown]
# ## 3. 방법
# > 다른 사람이 **똑같이 다시 할 수 있게**: 사용한 분석(그룹 비교, 회귀, 분류 등), 훈련/시험 분할 비율과 `random_state`, 평가 지표(MAE, R², 정확도·재현율 등), 사용 도구(Python, pandas, scikit-learn, Colab).
#
# [ ]

# %% [markdown]
# ## 4. 결과
# > **관찰한 사실과 숫자만** 쓴다(해석은 다음 절). 그림·표마다 번호와 캡션: 그림 캡션은 그림 **아래**, 표 제목은 표 **위**.

# %%
# 그림 1 — 탐색 그래프 (변수 이름을 내 데이터에 맞게)
x = features[1]
plt.figure(figsize=(6, 4))
plt.scatter(df[x], df[target], s=10, alpha=0.5)
plt.xlabel(f'{x}')
plt.ylabel(f'{target}')
plt.show()

# %% [markdown]
# **그림 1.** [무엇과 무엇의 관계인지, 데이터·개수(n=), 단위. 예) 성형 압력(bar)과 인장강도(MPa)의 산점도 (process.csv, n=494)]

# %%
# 그림 2 — 그룹별 비교 (범주형 열 하나를 골라서. 없으면 이 셀은 지운다)
group_col = 'shift'
summary = df.groupby(group_col)[target].agg(['mean', 'count']).round(2)
summary['mean'].plot(kind='bar', figsize=(5, 3.5), rot=0)
plt.ylabel(f'{target} 평균')
plt.show()
print(summary)

# %% [markdown]
# **그림 2.** [그룹 이름과 개수, 무엇의 평균인지, 단위]

# %%
# 모델 — 훈련/시험 분할 후 시험 점수 보고
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score

train, test = train_test_split(df, test_size=0.2, random_state=42)
model = LinearRegression().fit(train[features], train[target])
pred = model.predict(test[features])
base = np.full(len(test), train[target].mean())
table1 = pd.DataFrame({'시험 MAE': [mean_absolute_error(test[target], base), mean_absolute_error(test[target], pred)],
                       '시험 R²': [r2_score(test[target], base), r2_score(test[target], pred)]},
                      index=['평균으로 찍기(기준)', '선형 회귀'])

# %% [markdown]
# **표 1.** [표 제목 — 예) 시험 데이터(n=99)에서의 모델별 예측 오차]

# %%
table1.round(3)

# %% [markdown]
# ## 5. 해석
# > 결과가 **질문에 어떤 답을 주는지**, 전공 지식으로 왜 그럴 수 있는지. "~로 보인다", "~범위 안에서"처럼 근거만큼만 말한다. 상관 ≠ 인과 (7주 3차시).
#
# [ ]
#
# ## 6. 한계
# > 데이터(기간·규모·편향·결측 처리), 방법(분할에 따른 점수 변화, 입력 범위 밖 예측), 인과 여부를 정직하게.
#
# 1. [ ]
# 2. [ ]
#
# ## 7. 결론
# > 질문에 대한 답 1~2문장 + 다음에 해 볼 일(추가 데이터, 실험) 1문장.
#
# [ ]

# %% [markdown]
# ## 참고문헌
# > 데이터 출처, 참고한 문헌·웹 문서. 형식 예: 기관(연도). 「자료명」. 주소 (접근일).
#
# 1. [ ]
#
# ## AI 활용 내역
# > 생성형AI를 쓴 곳을 **모두** 적는다. 쓰지 않았다면 "사용하지 않음".
#
# | 단계 | 사용 도구 | AI에게 요청한 내용 | 내가 확인·수정한 것 |
# |---|---|---|---|
# | [예) 데이터 정리] | [도구 이름] | [결측 처리 코드 작성] | [오류 순서 수정, 행 수 대조] |
# | [ ] | [ ] | [ ] | [ ] |

# %% [exercise]
# 제출 전 자기 점검 — 모두 True가 되도록 (14주 3차시 점검표의 일부)
check = {
    '결측 없음(또는 처리함)': int(df[features + [target]].isna().sum().sum()) == 0,
    '시험 데이터로 평가함': len(test) > 0,
    '기준(평균 찍기)보다 나음': table1.loc['선형 회귀', '시험 MAE'] < table1.loc['평균으로 찍기(기준)', '시험 MAE'],
}
for k, v in check.items():
    print('[O]' if v else '[X]', k)

# %% [markdown]
# ---
# **생성형AI에게 물어볼 만한 질문**
# - "아래 결과 문단에서 '해석'이 섞인 문장과 근거보다 과장된 표현을 찾아 줘: [내 문단]"
# - "이 그림 캡션에 빠진 정보(번호, 변수와 단위, 데이터 개수)가 있는지 점검해 줘: [내 캡션]"
#
# (개인정보·기밀 데이터는 채팅창에 붙여 넣지 않는다 — 1주 3차시)
