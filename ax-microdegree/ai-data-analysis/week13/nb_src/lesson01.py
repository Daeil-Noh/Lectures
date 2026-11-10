# %% [markdown]
# # 13주 1차시 · 신경망 원리 직관적으로 이해하기
#
# **학습 목표**
# - 직선 하나(로지스틱 회귀)로는 나눌 수 없는 데이터를 신경망이 나누는 모습을 그림으로 확인한다.
# - 은닉층의 뉴런 수를 바꾸며 경계선 모양이 어떻게 달라지는지 본다.
# - 학습이 “오차를 조금씩 줄이는 과정”임을 오차 곡선(loss curve)으로 확인한다.
# - 실제 공정 데이터에 신경망을 적용하고, 의사결정나무(11주)와 비교한다.
#
# **사용 데이터**
# - ① 이 노트북 안에서 만드는 가상 데이터: 온도·압력이 **적정 구간** 안에 있으면 정상, 벗어나면 불량 (고정 난수, 300개)
# - ② `process.csv`: 사출 성형 공정 기록 494행 (가상 데이터)
#
# 위에서부터 셀을 하나씩 실행하세요 (Shift + Enter).

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.pipeline import make_pipeline
from sklearn.metrics import accuracy_score, recall_score
import warnings
warnings.filterwarnings('ignore')   # 반복 횟수가 부족하다는 경고 등은 숨긴다

# %% [markdown]
# ## 1. 가상 데이터 만들기: “적정 공정 구간”
# 온도가 너무 낮거나 높아도, 압력이 너무 낮거나 높아도 불량이 됩니다.
# 정상 제품은 가운데 **타원 모양 구간**에 모여 있습니다. 직선 하나로는 이 구간을 둘러쌀 수 없습니다.

# %%
rng = np.random.default_rng(13)          # 고정 난수: 누가 실행해도 같은 데이터
n = 300
temp = rng.uniform(194, 228, n)          # 온도(℃)
pressure = rng.uniform(62, 100, n)       # 압력(bar)

# 가운데(211℃, 81bar)에서 얼마나 떨어져 있는가 → 1보다 크면 적정 구간 밖
dist = ((temp - 211) / 12.5) ** 2 + ((pressure - 81) / 14) ** 2 + rng.normal(0, 0.12, n)
defect = (dist > 1).astype(int)          # 1 = 불량, 0 = 정상

df = pd.DataFrame({'temp': temp, 'pressure': pressure, 'defect': defect})
print(df.head())
print('불량 비율:', round(df['defect'].mean(), 3))

# %%
# 산점도로 보기: 파란 점 = 정상, 주황 점 = 불량
plt.figure(figsize=(5, 4.5))
plt.scatter(df['temp'], df['pressure'], c=df['defect'], cmap='coolwarm', s=18)
plt.xlabel('온도 (℃)')
plt.ylabel('압력 (bar)')
plt.title('적정 공정 구간 데이터 (가상)')
plt.show()

# %% [markdown]
# ## 2. 직선 하나(로지스틱 회귀) vs 신경망
# - 훈련 데이터 70%, 시험 데이터 30%로 나눕니다 (9주차).
# - 신경망은 숫자의 크기에 민감하므로 **표준화**(평균 0, 표준편차 1로 맞추기)를 먼저 합니다.
# - `MLPClassifier`: 은닉층이 있는 신경망. `hidden_layer_sizes=(8,)` = 은닉층 1개에 뉴런 8개

# %%
X = df[['temp', 'pressure']]
y = df['defect']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

scaler = StandardScaler().fit(X_train)   # 훈련 데이터로만 기준을 정한다
Xs_train = scaler.transform(X_train)
Xs_test = scaler.transform(X_test)

line_model = LogisticRegression().fit(Xs_train, y_train)          # 뉴런 1개 = 직선 1개
print('로지스틱 회귀(직선) 시험 정확도:', round(line_model.score(Xs_test, y_test), 3))

# %%
mlp = MLPClassifier(hidden_layer_sizes=(8,),        # 은닉층 1개, 뉴런 8개
                    learning_rate_init=0.03,          # 한 번에 고치는 폭(보폭)
                    max_iter=2000, random_state=0)
mlp.fit(Xs_train, y_train)
print('신경망(은닉 뉴런 8개) 시험 정확도:', round(mlp.score(Xs_test, y_test), 3))

# %% [markdown]
# ### 두 모델의 경계선을 그림으로 비교
# 화면을 촘촘한 격자로 나누고, 격자 점마다 모델이 “불량일 확률”을 계산해 색으로 칠합니다.

# %%
def draw_boundary(model, ax, title):
    tt, pp = np.meshgrid(np.linspace(194, 228, 200), np.linspace(62, 100, 200))
    grid = scaler.transform(pd.DataFrame({'temp': tt.ravel(), 'pressure': pp.ravel()}))
    prob = model.predict_proba(grid)[:, 1].reshape(tt.shape)   # 불량일 확률
    ax.contourf(tt, pp, prob, levels=20, cmap='coolwarm', alpha=0.35)
    ax.contour(tt, pp, prob, levels=[0.5], colors='k')          # 확률 0.5 = 경계선
    ax.scatter(X_test['temp'], X_test['pressure'], c=y_test, cmap='coolwarm', s=16, edgecolors='k', linewidths=0.3)
    ax.set_title(title)
    ax.set_xlabel('온도 (℃)')

fig, axes = plt.subplots(1, 2, figsize=(10, 4.2), sharey=True)
draw_boundary(line_model, axes[0], '로지스틱 회귀: 직선 하나')
draw_boundary(mlp, axes[1], '신경망: 은닉 뉴런 8개')
axes[0].set_ylabel('압력 (bar)')
plt.show()

# %% [markdown]
# ## 3. 학습 = 오차를 조금씩 줄이기
# 신경망은 가중치를 처음에 아무렇게나 정한 뒤, **오차가 줄어드는 방향으로 조금씩** 고칩니다(경사하강법).
# `loss_curve_` 에는 반복할 때마다의 오차가 기록되어 있습니다.

# %%
plt.figure(figsize=(6, 3.5))
plt.plot(mlp.loss_curve_)
plt.xlabel('반복 횟수')
plt.ylabel('오차 (loss)')
plt.title('학습할수록 오차가 줄어든다')
plt.show()
print('반복 횟수:', mlp.n_iter_, '/ 마지막 오차:', round(mlp.loss_curve_[-1], 3))

# %% [markdown]
# ### 직접 바꿔 보기 ①: 은닉 뉴런 수
# `sizes` 목록을 바꿔 보세요. 뉴런이 1개면? 3개면? 층을 두 개 쌓으면(`(8, 8)`)?

# %% [exercise]
sizes = [(1,), (3,), (8,), (8, 8)]      # ← 바꿔 보기: (2,), (16,), (32, 16) ...

for s in sizes:
    m = MLPClassifier(hidden_layer_sizes=s, learning_rate_init=0.03, max_iter=2000, random_state=0)
    m.fit(Xs_train, y_train)
    print(f'은닉층 {s}: 훈련 정확도 {m.score(Xs_train, y_train):.3f}, 시험 정확도 {m.score(Xs_test, y_test):.3f}')

# %% [markdown]
# ## 4. 실제 공정 데이터에 적용하기 (`process.csv`)
# 11주차에 의사결정나무로 했던 불량 판정을 신경망으로도 해 봅니다.
# 입력: 온도·압력·속도·습도·두께 → 출력: 불량(1) / 정상(0)

# %%
DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
proc = pd.read_csv(DATA + 'process.csv')

cols = ['temp', 'pressure', 'speed', 'humidity', 'thickness']
Xp, yp = proc[cols], proc['defect']
Xp_train, Xp_test, yp_train, yp_test = train_test_split(Xp, yp, test_size=0.3, random_state=0, stratify=yp)
print('훈련', len(Xp_train), '행 / 시험', len(Xp_test), '행, 불량 비율', round(yp.mean(), 3))

# %%
def new_nn():                       # 같은 구조의 신경망을 새로 만든다
    return MLPClassifier(hidden_layer_sizes=(16, 8), max_iter=2000, random_state=0)

models = {
    '의사결정나무(깊이 4)': DecisionTreeClassifier(max_depth=4, random_state=0),
    '신경망(표준화 O)': make_pipeline(StandardScaler(), new_nn()),
    '신경망(표준화 X)': new_nn(),
}
for name, m in models.items():
    m.fit(Xp_train, yp_train)
    pred = m.predict(Xp_test)
    print(f'{name:14s} 정확도 {accuracy_score(yp_test, pred):.3f}  재현율 {recall_score(yp_test, pred):.3f}')

# %% [markdown]
# **읽는 법**
# - 표준화를 하지 않은 신경망은 정확도가 높아 보여도 **재현율이 0** — 불량을 하나도 잡지 못하고 모두 “정상”이라고 답합니다 (11주 3차시: 정확도의 함정).
#   속도(약 1200)처럼 큰 숫자가 학습을 망가뜨리기 때문입니다.
# - 표 형태의 작은 데이터에서는 신경망이 늘 최고는 아닙니다. 데이터의 양과 형태에 맞는 모델을 고릅니다.

# %% [markdown]
# ### 직접 바꿔 보기 ②: 신경망 구조와 반복 횟수
# `hidden` 과 `iters` 를 바꿔 보세요. 결과가 좋아지나요, 나빠지나요? 시험 데이터 기준으로 판단합니다.
# (이렇게 설정을 고르는 데 쓰면 그 데이터는 사실상 **검증 데이터** 역할을 합니다. 실무에서는 검증 데이터로 고르고, 시험 데이터는 마지막에 한 번만 씁니다 — 9주 2차시.)

# %% [exercise]
hidden = (16, 8)     # ← 바꿔 보기: (4,), (32,), (32, 16, 8)
iters = 2000         # ← 바꿔 보기: 20, 200 (너무 적으면 학습이 덜 끝난다)

m = make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=hidden, max_iter=iters, random_state=0))
m.fit(Xp_train, yp_train)
pred = m.predict(Xp_test)
print(f'은닉층 {hidden}, 반복 {iters}: 정확도 {accuracy_score(yp_test, pred):.3f}, 재현율 {recall_score(yp_test, pred):.3f}')

# %% [markdown]
# ## 정리
# 1. **뉴런** = 입력 × 가중치의 합 + 편향 → 활성화. 뉴런 하나는 **직선 하나**를 긋는다.
# 2. 뉴런을 **층으로 쌓으면** 직선들이 합쳐져 곡선·닫힌 영역 같은 복잡한 경계를 만든다.
# 3. **학습** = 오차가 줄어드는 방향으로 가중치를 조금씩 고치는 것. 신경망은 표준화가 필요하고, 언제나 최고의 모델은 아니다.
#
# **생성형AI에게 물어볼 만한 질문**
# - “MLPClassifier의 hidden_layer_sizes=(16, 8)이 무슨 뜻인지 그림으로 설명해 줘. 가중치는 모두 몇 개야?”
# - “표준화 없이 신경망을 학습하면 재현율이 0이 나왔어. 왜 그런지 이 코드 기준으로 설명해 줘.” → 답을 받으면 직접 실행해서 확인하세요.
