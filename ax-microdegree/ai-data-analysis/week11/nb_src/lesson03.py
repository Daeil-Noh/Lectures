# %% [markdown]
# # 11주 3차시 · 정확도·정밀도·재현율
#
# **학습 목표**
# - 혼동행렬로 판정 결과를 잡은 불량(TP)·놓친 불량(FN)·잘못 경보(FP)·정상 통과(TN)로 나눈다.
# - 정확도·정밀도·재현율(그리고 F1)을 계산하고 “전부 정상” 기준선과 비교한다.
# - `predict_proba` 로 판정 기준(불량 확률 기준값)을 바꾸며 정밀도와 재현율의 맞바꿈을 확인한다.
# - 오류 비용을 가정해 판정 기준을 고르는 방법을 익힌다 → **과제2**의 연습.
#
# **사용 데이터** `process.csv` — 사출 성형 공정 기록 494개(가상 데이터). 지난 시간과 같은 나무(`max_depth=3`)를 다시 만듭니다.
#
# 슬라이드의 “실습 파일 N단계”는 아래 제목의 번호와 같습니다.

# %% [markdown]
# ## 1. 준비

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (confusion_matrix, ConfusionMatrixDisplay, accuracy_score,
                             precision_score, recall_score, f1_score)

# %% [markdown]
# ## 2. 데이터 불러오고 나누기 (11-2와 같음)

# %%
DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
df = pd.read_csv(DATA + 'process.csv')
features = ['temp', 'pressure', 'speed', 'humidity', 'thickness']
X = df[features]
y = df['defect']
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y)
print('시험 데이터:', len(y_test), '개 / 그중 불량:', y_test.sum(), '개')

# %% [markdown]
# ## 3. 나무 학습하고 시험 데이터 판정하기

# %%
model = DecisionTreeClassifier(max_depth=3, random_state=42)
model.fit(X_train, y_train)
pred = model.predict(X_test)          # 시험 제품 149개의 판정 (0/1)
print('정확도:', round(model.score(X_test, y_test), 3))

# %% [markdown]
# ## 4. 혼동행렬 — `confusion_matrix(실제, 판정)`
# sklearn은 라벨을 작은 수부터 놓습니다. **행 = 실제(0 정상, 1 불량), 열 = 판정(0 정상, 1 불량)**
# → 왼쪽 위 = 정상 통과(TN), 오른쪽 위 = 잘못 경보(FP), 왼쪽 아래 = 놓친 불량(FN), 오른쪽 아래 = 잡은 불량(TP).

# %%
from sklearn.metrics import confusion_matrix
pred = model.predict(X_test)
cm = confusion_matrix(y_test, pred)   # (실제, 판정) 순서
print(cm)

tn, fp, fn, tp = cm.ravel()           # 2×2 표를 한 줄로 펴서 이름 붙이기
print('정상 통과 TN:', tn, '/ 잘못 경보 FP:', fp, '/ 놓친 불량 FN:', fn, '/ 잡은 불량 TP:', tp)

ConfusionMatrixDisplay(cm, display_labels=['정상', '불량']).plot(cmap='Blues')
plt.xlabel('판정')
plt.ylabel('실제')
plt.title('혼동행렬 (max_depth=3 나무, 기준 0.5)')
plt.show()

# %% [markdown]
# ## 5. 세 가지 지표 (+ F1)
# - 정확도 = (TP + TN) ÷ 전체 — 전체 중 몇 개 맞혔나
# - 정밀도 = TP ÷ (TP + FP) — 불량이라고 한 것 중 진짜 불량은?
# - 재현율 = TP ÷ (TP + FN) — 진짜 불량 중 몇 개를 잡았나
# - F1 = 정밀도와 재현율의 조화평균 (이름만 알아 두기)

# %%
print('정확도:', accuracy_score(y_test, pred))
print('정밀도:', precision_score(y_test, pred))
print('재현율:', recall_score(y_test, pred))
print('F1    :', f1_score(y_test, pred))

# 공식으로 직접 계산해서 같은지 확인
print('직접 계산 → 정밀도', round(tp / (tp + fp), 3), '/ 재현율', round(tp / (tp + fn), 3))

# %% [markdown]
# ## 6. 게으른 검사기(전부 정상)와 비교
# 경보가 한 번도 울리지 않으면 정밀도의 분모가 0이 됩니다. `zero_division=0` 으로 0이라고 표시하게 합니다.

# %%
lazy = [0] * len(y_test)               # 모든 제품을 정상(0)으로
compare = pd.DataFrame({
    '게으른 검사기': [accuracy_score(y_test, lazy), precision_score(y_test, lazy, zero_division=0), recall_score(y_test, lazy)],
    '나무 (깊이 3)': [accuracy_score(y_test, pred), precision_score(y_test, pred), recall_score(y_test, pred)],
}, index=['정확도', '정밀도', '재현율'])
compare.round(3)

# %% [markdown]
# ## 7. 판정 기준 바꾸기 — `predict_proba`
# `predict` 는 불량 확률 0.5를 기준으로 판정합니다. 기준을 바꾸려면 불량 확률을 꺼내 직접 비교합니다.

# %%
proba = model.predict_proba(X_test)[:, 1]   # 불량 확률
for t in [0.2, 0.3, 0.5, 0.9]:
    p = (proba >= t).astype(int)      # 기준 이상 → 1(불량)
    tn, fp, fn, tp = confusion_matrix(y_test, p).ravel()
    print(t, tp, fn, fp,
          round(precision_score(y_test, p), 3),
          round(recall_score(y_test, p), 3))

# %% [markdown]
# ## 8. 기준별 표와 그래프
# 기준을 0.05 간격으로 바꿔 가며 표로 모으고, 정밀도·재현율이 어떻게 맞바뀌는지 그래프로 봅니다.

# %%
rows = []
for t in [round(0.05 * i, 2) for i in range(1, 20)]:
    p = (proba >= t).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, p).ravel()
    rows.append({'기준': t, '잡은 불량': tp, '놓친 불량': fn, '잘못 경보': fp,
                 '정확도': round(accuracy_score(y_test, p), 3),
                 '정밀도': round(precision_score(y_test, p, zero_division=0), 3),
                 '재현율': round(recall_score(y_test, p), 3)})
table = pd.DataFrame(rows)
print(table.to_string(index=False))

plt.figure(figsize=(8, 4))
plt.plot(table['기준'], table['정밀도'], marker='o', label='정밀도')
plt.plot(table['기준'], table['재현율'], marker='o', label='재현율')
plt.xlabel('불량 판정 기준 (불량 확률 ≥ 기준)')
plt.ylabel('값')
plt.title('기준을 낮추면 재현율↑, 정밀도↓')
plt.legend()
plt.show()

# %% [markdown]
# ## 9. 오류 비용으로 기준 고르기
# “놓친 불량 1건이 잘못 경보 몇 건만큼 비싼가?”를 가정하면 기준마다 **총비용**을 계산할 수 있습니다.
# 총비용 = 잘못 경보 수 × 1 + 놓친 불량 수 × `COST_RATIO`. (비용은 설명을 위한 가정입니다.)

# %%
COST_RATIO = 5
table['총비용'] = table['잘못 경보'] + table['놓친 불량'] * COST_RATIO
best = table.loc[table['총비용'].idxmin()]
print(table[['기준', '놓친 불량', '잘못 경보', '총비용']].to_string(index=False))
print('가장 싼 기준(표에서 처음 나오는 값):', best['기준'], '/ 총비용:', int(best['총비용']))

# %% [markdown]
# ## 직접 바꿔 보기
# 1. `MY_T` 를 0.1, 0.3, 0.6으로 바꿔 혼동행렬과 세 지표가 어떻게 바뀌는지 보세요.
# 2. 9단계의 `COST_RATIO` 를 1, 3, 20으로 바꿔 다시 실행해 보세요. 가장 싼 기준이 어느 쪽으로 움직이나요?
# 3. 나무의 확률은 잎 개수만큼만 나옵니다. 아래 셀의 나무(`max_depth=5, min_samples_leaf=10`)로 기준별 표를 만들면 기준을 더 세밀하게 고를 수 있나요?

# %% [exercise]
MY_T = 0.3          # ← 바꿔 보기
p = (proba >= MY_T).astype(int)
print(confusion_matrix(y_test, p))
print('정확도', round(accuracy_score(y_test, p), 3),
      '/ 정밀도', round(precision_score(y_test, p, zero_division=0), 3),
      '/ 재현율', round(recall_score(y_test, p), 3))

# %% [exercise]
# 3번: 잎이 더 많은 나무의 확률로 기준별 표 만들기
model2 = DecisionTreeClassifier(max_depth=5, min_samples_leaf=10, random_state=42).fit(X_train, y_train)
proba2 = model2.predict_proba(X_test)[:, 1]
print('불량 확률 값의 종류:', sorted(set(proba2.round(3).tolist())))
for t in [0.05, 0.1, 0.15, 0.3, 0.5]:
    p2 = (proba2 >= t).astype(int)
    print(t, '정밀도', round(precision_score(y_test, p2, zero_division=0), 3), '재현율', round(recall_score(y_test, p2), 3))

# %% [markdown]
# ## 정리
# - **혼동행렬**: 잡은 불량(TP)·놓친 불량(FN)·잘못 경보(FP)·정상 통과(TN). sklearn은 [[TN, FP], [FN, TP]] 순서.
# - **정밀도**는 “경보를 믿을 수 있나”, **재현율**은 “불량을 다 잡았나”. 불량이 드물면 정확도만으로는 판단할 수 없다.
# - 판정 기준을 낮추면 재현율↑ 정밀도↓. 기준은 **오류 비용**을 아는 사람이 정하고 근거를 남긴다 → 과제2.
#
# **생성형AI에게 물어볼 만한 질문**
# - “불량 판정 모델에서 정밀도와 재현율 중 무엇을 우선할지, 자동차 부품 공장과 일회용 컵 공장을 예로 비교해 설명해 줘.”
# - “이 기준별 표(붙여 넣기)를 보고 기준을 고르는 근거를 세 가지로 정리해 줘.” — AI가 말한 숫자가 표의 숫자와 같은지 반드시 대조하세요.
