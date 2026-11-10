# %% [markdown]
# # 과제2 · 불량품 분류 — 시작 파일
#
# **할 일**
# 1. `process.csv` 로 불량(`defect`)을 판정하는 분류 모델을 만든다. (특성 선택, `max_depth` 등은 자유)
# 2. 시험 데이터에서 **내가 고른 판정 기준**으로 혼동행렬과 정확도·정밀도·재현율을 구하고, “전부 정상” 기준선과 비교한다.
# 3. 판정 기준을 **2개 이상** 비교한 표를 만들고, 왜 그 기준을 골랐는지 근거를 쓴다. (어떤 오류가 더 비싼 공장인지 가정을 밝힐 것)
# 4. 결과를 **A4 1쪽 해석**으로 정리한다 — 결과를 공장 말로, 한계와 개선 아이디어, 생성형AI 사용 내역.
#
# **제출물** 실행 결과가 남은 이 노트북(.ipynb) + 1쪽 해석(PDF) · **제출** LMS 과제 게시판 · **기한** LMS 공지 기준
#
# **평가 기준 (100점)** 모델과 실행 20 · 평가 지표 25 · 판정 기준의 근거 25 · 해석과 한계 20 · 형식·AI 활용 10
#
# **사용법** 먼저 `파일 → Drive에 사본 저장`. 이 파일은 그대로도 끝까지 실행됩니다. `# ← 바꿀 곳` 표시가 있는 셀을 내 선택으로 바꾸고, 마지막에 `런타임 → 모두 실행` 후 저장해 제출하세요.
#
# **규칙** 훈련·시험 나누기(`test_size=0.3, random_state=42, stratify=y`)는 바꾸지 않습니다. 모두 같은 시험 데이터로 비교하기 위해서입니다.

# %% [markdown]
# ## 0. 제출자 정보 (직접 입력)
# - 학번:
# - 이름:
# - 전공:

# %% [markdown]
# ## 1. 준비

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, plot_tree, export_text
from sklearn.metrics import (confusion_matrix, ConfusionMatrixDisplay, accuracy_score,
                             precision_score, recall_score)

# %% [markdown]
# ## 2. 데이터 불러오기

# %%
DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
df = pd.read_csv(DATA + 'process.csv')
print(df.shape)
print('불량률:', round(df['defect'].mean(), 3))
df.head()

# %% [markdown]
# ## 3. 입력 특성 고르기 ← 바꿀 곳
# 쓸 수 있는 숫자 열: `temp, pressure, speed, humidity, thickness`.
# 근무조(`shift`)를 쓰고 싶다면 아래처럼 숫자 열(야간 = 1)을 만들어 추가할 수 있습니다.
# `strength` 는 제품을 끊어 봐야 아는 값이므로, 쓴다면 왜 써도 되는지 보고서에 밝히세요.

# %%
df['night'] = (df['shift'] == '야간').astype(int)     # 야간이면 1, 주간이면 0

MY_FEATURES = ['temp', 'pressure', 'speed', 'humidity', 'thickness']   # ← 바꿀 곳

X = df[MY_FEATURES]
y = df['defect']
print('입력 특성:', MY_FEATURES)

# %% [markdown]
# ## 4. 훈련·시험 데이터 나누기 (바꾸지 마세요)

# %%
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y)
print('훈련', len(X_train), '개 / 시험', len(X_test), '개 (시험 불량', y_test.sum(), '개)')

# %% [markdown]
# ## 5. 모델 만들고 학습하기 ← 바꿀 곳
# `max_depth`, `min_samples_leaf` 등을 바꿔 보고, 훈련·시험 정확도 차이로 과적합 여부를 확인하세요.

# %%
MY_DEPTH = 3          # ← 바꿀 곳
MY_LEAF = 1           # ← 바꿀 곳 (잎 하나의 최소 훈련 데이터 제품 수)

model = DecisionTreeClassifier(max_depth=MY_DEPTH, min_samples_leaf=MY_LEAF, random_state=42)
model.fit(X_train, y_train)
print('훈련 정확도:', round(model.score(X_train, y_train), 3))
print('시험 정확도:', round(model.score(X_test, y_test), 3))
print('기준선(전부 정상):', round((y_test == 0).mean(), 3))

# %% [markdown]
# ## 6. 나무 규칙과 특성 중요도 확인하기
# 보고서에는 규칙 한두 개를 공장 말로 옮겨 적어 보세요. 중요도는 원인의 크기가 아님에 주의!

# %%
print(export_text(model, feature_names=MY_FEATURES, show_weights=True))
print(pd.Series(model.feature_importances_, index=MY_FEATURES).sort_values(ascending=False).round(3))

# %% [markdown]
# ## 7. 판정 기준별 비교표
# 불량 확률이 기준 이상이면 불량(1)으로 판정합니다. `MY_THRESHOLDS` 에 비교할 기준을 **2개 이상** 넣으세요.

# %%
proba = model.predict_proba(X_test)[:, 1]             # 시험 제품의 불량 확률

MY_THRESHOLDS = [0.2, 0.3, 0.5]                       # ← 바꿀 곳

rows = []
for t in MY_THRESHOLDS:
    p = (proba >= t).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, p).ravel()
    rows.append({'기준': t, '잡은 불량(TP)': tp, '놓친 불량(FN)': fn, '잘못 경보(FP)': fp, '정상 통과(TN)': tn,
                 '정확도': round(accuracy_score(y_test, p), 3),
                 '정밀도': round(precision_score(y_test, p, zero_division=0), 3),
                 '재현율': round(recall_score(y_test, p), 3)})
table = pd.DataFrame(rows)
table

# %% [markdown]
# ## 8. (선택) 오류 비용 가정으로 비교하기 ← 바꿀 곳
# “놓친 불량 1건이 잘못 경보 몇 건만큼 비싼가?”를 내 공장 상황에 맞게 가정해 보세요. 가정의 이유도 보고서에 씁니다.

# %%
COST_RATIO = 5        # ← 바꿀 곳: 놓친 불량 1건 = 잘못 경보 몇 건의 비용?
table['총비용'] = table['잘못 경보(FP)'] + table['놓친 불량(FN)'] * COST_RATIO
table[['기준', '놓친 불량(FN)', '잘못 경보(FP)', '총비용']]

# %% [markdown]
# ## 9. 최종 판정 기준의 혼동행렬과 지표 ← 바꿀 곳
# 7~8단계를 보고 고른 기준을 `MY_THRESHOLD` 에 넣으세요. 보고서의 숫자는 이 셀의 출력과 같아야 합니다.

# %%
MY_THRESHOLD = 0.5    # ← 바꿀 곳

final = (proba >= MY_THRESHOLD).astype(int)
cm = confusion_matrix(y_test, final)
tn, fp, fn, tp = cm.ravel()
print('혼동행렬 [[TN, FP], [FN, TP]]:')
print(cm)
print('잡은 불량', tp, '/ 놓친 불량', fn, '/ 잘못 경보', fp, '/ 정상 통과', tn)
print('정확도:', round(accuracy_score(y_test, final), 3))
print('정밀도:', round(precision_score(y_test, final, zero_division=0), 3))
print('재현율:', round(recall_score(y_test, final), 3))

ConfusionMatrixDisplay(cm, display_labels=['정상', '불량']).plot(cmap='Blues')
plt.xlabel('판정')
plt.ylabel('실제')
plt.title(f'최종 혼동행렬 (기준 {MY_THRESHOLD})')
plt.show()

# %% [markdown]
# ## 10. 1쪽 해석 쓰기 (PDF로 따로 제출)
# 아래 틀을 참고해 A4 1쪽으로 정리하세요.
#
# 1. **모델 요약** — 사용한 특성, `max_depth` 등 설정, 훈련·시험 정확도, 기준선과의 차이.
# 2. **혼동행렬을 공장 말로** — 시험 제품 149개 중 잡은 불량·놓친 불량·잘못 경보·정상 통과가 각각 몇 개이고, 현장에서 무슨 뜻인지.
# 3. **판정 기준과 근거** — 비교한 기준들의 정밀도·재현율, 내가 가정한 공장 상황(어떤 오류가 더 비싼지), 그래서 고른 기준.
# 4. **한계와 개선** — 이 결과를 그대로 믿기 어려운 이유(데이터 크기, 가상 데이터, 중요도 ≠ 원인 등)와 해 보고 싶은 개선.
# 5. **생성형AI 사용 내역** — 무엇을 물었고, 답을 어떻게 검증했는지. 사용하지 않았다면 “사용하지 않음”.
#
# **제출 전 확인**: 런타임 → 모두 실행 후 저장 / 보고서 숫자 = 노트북 출력 숫자 / 시험 데이터를 학습에 쓰지 않았다.
