# %% [markdown]
# # 13주 2차시 · 이미지 인식과 비전 검사
#
# **학습 목표**
# - 이미지가 컴퓨터 안에서 **숫자 격자**라는 것을 직접 확인한다.
# - 사람이 만든 규칙(수작업 특징)이 조명이 바뀌면 왜 깨지는지 본다.
# - 신경망(MLPClassifier)으로 정상·스크래치·얼룩 이미지를 분류하고, 틀린 이미지를 눈으로 확인한다.
# - 데이터 양, 밝기 보정(전처리), 조명 편향이 결과에 주는 영향을 실험한다.
#
# **사용 데이터**: 이 노트북 안에서 고정 난수로 만드는 **가상 부품 표면 이미지** (16×16 픽셀, 흑백)
# - 정상 / 스크래치(어두운 선) / 얼룩(어두운 번짐) 세 종류, 조명 밝기는 제각각
#
# 위에서부터 셀을 하나씩 실행하세요 (Shift + Enter).

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib

import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import confusion_matrix
import warnings
warnings.filterwarnings('ignore')   # 반복 횟수가 부족하다는 경고 등은 숨긴다

NAMES = ['정상', '스크래치', '얼룩']

# %% [markdown]
# ## 1. 가상 부품 이미지 만들기
# 실제 공장에서는 카메라로 찍지만, 여기서는 규칙에 따라 이미지를 **만들어** 씁니다.
# - 표면 밝기(조명) + 작은 잡음 + 조명 기울기
# - 스크래치: 표면보다 어두운 가는 선 / 얼룩: 둥글게 번진 어두운 부분

# %%
S = 16   # 이미지 크기: 16 × 16 픽셀

def make_image(kind, light, rng):
    img = light + rng.normal(0, 6, (S, S))                          # 표면 + 잡음
    img += np.linspace(-10, 10, S)[None, :] * rng.uniform(-1, 1)     # 조명 기울기
    if kind == 1:                                                    # 스크래치: 어두운 선
        x0, y0 = rng.uniform(2, 14, 2)
        ang, length = rng.uniform(0, np.pi), rng.uniform(6, 12)
        for t in np.linspace(-length / 2, length / 2, 40):
            x, y = int(round(x0 + t * np.cos(ang))), int(round(y0 + t * np.sin(ang)))
            if 0 <= x < S and 0 <= y < S:
                img[y, x] = light * 0.6
    elif kind == 2:                                                  # 얼룩: 둥근 번짐
        yy, xx = np.mgrid[0:S, 0:S]
        cx, cy = rng.uniform(3, 13, 2)
        r = rng.uniform(1.5, 2.8)
        img *= 1 - 0.4 * np.exp(-((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * r * r))
    return np.clip(img, 0, 255)

def make_set(n, light_lo, light_hi, seed):
    rng = np.random.default_rng(seed)            # 고정 난수: 누가 실행해도 같은 이미지
    X, y, light = [], [], []
    for i in range(n):
        kind = i % 3                              # 세 종류를 같은 수만큼
        L = rng.uniform(light_lo, light_hi)       # 조명 밝기
        X.append(make_image(kind, L, rng).ravel())  # 16×16 → 숫자 256개 한 줄
        y.append(kind)
        light.append(L)
    return np.array(X), np.array(y), np.array(light)

X, y, light = make_set(1500, 110, 210, seed=13)   # 1500장, 조명 밝기 110~210
print('이미지 데이터 모양:', X.shape)             # (이미지 수, 픽셀 수)

# %%
# 종류별로 6장씩 보기
fig, axes = plt.subplots(3, 6, figsize=(9, 4.8))
for k in range(3):
    idx = np.where(y == k)[0][:6]
    for j, i in enumerate(idx):
        axes[k, j].imshow(X[i].reshape(S, S), cmap='gray', vmin=0, vmax=255)
        axes[k, j].set_xticks([]); axes[k, j].set_yticks([])
    axes[k, 0].set_ylabel(NAMES[k])
plt.suptitle('가상 부품 표면 이미지 (밝기가 제각각)')
plt.show()

# %% [markdown]
# ## 2. 이미지 = 숫자 격자
# 컴퓨터에게 흑백 이미지는 0(검정)~255(흰색) 사이 숫자의 격자입니다. 스크래치 이미지 하나의 왼쪽 위 8×8 부분을 숫자로 찍어 봅니다.

# %%
i = np.where(y == 1)[0][0]                      # 첫 번째 스크래치 이미지
grid = X[i].reshape(S, S).round().astype(int)
print(grid[:8, :8])
print('가장 어두운 픽셀:', grid.min(), '/ 평균 밝기:', round(grid.mean()))

# %% [markdown]
# ## 3. 사람이 만든 규칙: “가장 어두운 픽셀이 130보다 어두우면 불량”
# 수작업 특징(가장 어두운 픽셀 값)으로 불량을 판정해 봅니다. **밝은 조명(170 이상)** 과 **어두운 조명(140 이하)** 으로 나눠 맞힌 비율을 봅니다.

# %%
threshold = 130                                  # ← 90, 110 으로도 바꿔 보세요
rule_bad = X.min(axis=1) < threshold             # 규칙: 불량이라고 판정?
true_bad = y > 0                                 # 실제 불량(스크래치 또는 얼룩)
bright, dark = light >= 170, light <= 140

print('밝은 조명 이미지 정확도:', round(np.mean(rule_bad[bright] == true_bad[bright]), 3))
print('어두운 조명 이미지 정확도:', round(np.mean(rule_bad[dark] == true_bad[dark]), 3))

# %% [markdown]
# 어두운 조명에서는 **정상 표면도 130보다 어두워서** 정상 이미지가 모두 불량으로 판정됩니다(정확도 약 2/3). 기준을 90으로 낮추면 이번엔 밝은 조명의 불량을 대부분 놓칩니다.
# 조명·부품·불량 모양이 바뀔 때마다 사람이 규칙을 다시 만들어야 합니다 → **특징을 데이터에서 배우게** 하자.

# %% [markdown]
# ## 4. 신경망으로 배우기
# - **밝기 보정**(전처리): 각 이미지를 자기 평균 밝기로 나눠, 조명이 달라도 “주변보다 얼마나 어두운가”만 남깁니다.
# - 훈련 75%, 시험 25%로 나눕니다.

# %%
use_norm = True                                   # 밝기 보정 사용 여부

def prepare(X):
    if use_norm:
        return X / X.mean(axis=1, keepdims=True) - 1   # 자기 평균 대비 밝기
    return X / 255                                      # 0~1로만 줄이기

X_train, X_test, y_train, y_test = train_test_split(prepare(X), y, test_size=0.25, random_state=0, stratify=y)

model = MLPClassifier(hidden_layer_sizes=(128,), max_iter=500, random_state=0)
model.fit(X_train, y_train)
print('시험 정확도:', round(model.score(X_test, y_test), 3))

# %%
# 혼동행렬(11주 3차시): 행 = 실제, 열 = 예측
pred = model.predict(X_test)
cm = confusion_matrix(y_test, pred)
print('        예측→', NAMES)
for k in range(3):
    print(f'실제 {NAMES[k]:5s}', cm[k])

# %% [markdown]
# ## 5. 틀린 이미지 눈으로 보기
# 숫자만 보지 말고 **틀린 사례를 직접 봐야** 왜 틀렸는지(흐린 얼룩? 가장자리에 걸친 스크래치?) 알 수 있습니다.

# %%
wrong = np.where(pred != y_test)[0]
print('틀린 이미지 수:', len(wrong), '/', len(y_test))

raw_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)[1]   # 보정 전 원본 이미지
fig, axes = plt.subplots(1, 8, figsize=(12, 2.2))
for ax, i in zip(axes, wrong[:8]):
    ax.imshow(raw_test[i].reshape(S, S), cmap='gray', vmin=0, vmax=255)
    ax.set_title(f'실제 {NAMES[y_test[i]]}\n예측 {NAMES[pred[i]]}', fontsize=9)
    ax.set_xticks([]); ax.set_yticks([])
plt.show()

# %% [markdown]
# ### 직접 바꿔 보기 ①: 밝기 보정을 끄면?
# 4단계 셀의 `use_norm = True` 를 `False` 로 바꾸고 4단계부터 다시 실행해 보세요. 아래 셀은 두 경우를 한 번에 비교합니다.

# %% [exercise]
for flag in [True, False]:        # ← 이 목록을 바꿔 보세요
    use_norm = flag
    Xa, Xb, ya, yb = train_test_split(prepare(X), y, test_size=0.25, random_state=0, stratify=y)
    m = MLPClassifier(hidden_layer_sizes=(128,), max_iter=500, random_state=0).fit(Xa, ya)
    print('밝기 보정', flag, '→ 시험 정확도', round(m.score(Xb, yb), 3))
use_norm = True

# %% [markdown]
# ### 직접 바꿔 보기 ②: 데이터 양
# 이미지 수 `n_images` 를 300, 600, 1500, 3000 으로 바꿔 보세요. 학습 이미지가 적으면 어떻게 될까요? (3000은 실행에 몇 초 더 걸립니다)

# %% [exercise]
n_images = 300                    # ← 바꿔 보기: 600, 1500, 3000

Xs, ys, _ = make_set(n_images, 110, 210, seed=13)
Xa, Xb, ya, yb = train_test_split(prepare(Xs), ys, test_size=0.25, random_state=0, stratify=ys)
m = MLPClassifier(hidden_layer_sizes=(128,), max_iter=500, random_state=0).fit(Xa, ya)
print(f'이미지 {n_images}장 → 훈련 정확도 {m.score(Xa, ya):.3f}, 시험 정확도 {m.score(Xb, yb):.3f}')

# %% [markdown]
# ### 직접 바꿔 보기 ③: 밝은 조명으로만 학습했다면? (1주 3차시: 데이터 편향)
# 학습은 밝은 조명(170~210) 이미지로만, 시험은 어두운 조명(110~140) 이미지로 해 봅니다. `use_norm` 도 바꿔 보세요.

# %% [exercise]
use_norm = False                  # ← True 로도 바꿔 보기

X_bright, y_bright, _ = make_set(900, 170, 210, seed=21)
X_dark, y_dark, _ = make_set(300, 110, 140, seed=22)
m = MLPClassifier(hidden_layer_sizes=(128,), max_iter=500, random_state=0).fit(prepare(X_bright), y_bright)
print('밝은 조명 시험 정확도:', round(m.score(prepare(make_set(300, 170, 210, seed=23)[0]), make_set(300, 170, 210, seed=23)[1]), 3))
print('어두운 조명 시험 정확도:', round(m.score(prepare(X_dark), y_dark), 3))
use_norm = True

# %% [markdown]
# ## 정리
# 1. 이미지는 **숫자 격자**다. 16×16 흑백 = 숫자 256개, 컬러는 그 3배.
# 2. 사람이 만든 규칙은 조명이 바뀌면 깨진다. 신경망은 **많은 라벨 이미지**에서 특징을 배운다.
# 3. 결과는 **데이터 양·전처리·조명 편향**에 크게 좌우된다. 틀린 이미지를 직접 보는 습관을 들이자.
#
# 참고: 이 실습은 설치 없이 빨리 돌리려고 MLPClassifier를 썼습니다. 실제 비전 검사에는 위치가 달라도 같은 필터를 쓰는 **CNN**이 주로 쓰이며, 이런 이미지에서 훨씬 강합니다.
#
# **생성형AI에게 물어볼 만한 질문**
# - “이 노트북의 MLPClassifier를 같은 데이터에서 CNN으로 바꾸려면 어떤 라이브러리와 코드가 필요해? 차이를 설명해 줘.”
# - “밝기 보정을 끄면 정확도가 떨어지는 이유를 이 코드의 prepare 함수 기준으로 설명해 줘.” → 설명을 듣고 직접 실행해 확인하세요.
