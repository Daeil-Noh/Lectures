# %% [markdown]
# # 7주 2차시 · 그래프 그리기 실습
#
# **학습 목표**
# - `fig, ax = plt.subplots()`로 그래프의 기본 틀을 만든다.
# - 막대(`bar`)·선(`plot`)·히스토그램(`hist`)·상자그림(`boxplot`)·산점도(`scatter`)를 그린다.
# - 제목·축 이름·단위를 붙이고, 한글이 깨지지 않게 하며, 그래프를 파일로 저장한다.
#
# **사용 데이터** (모두 실습용 가상 데이터)
# - `process.csv` : 사출 성형 공정 기록 494행 (교대·라인·호기, 온도·압력·습도·두께, 인장강도 MPa, 불량 여부)
# - `vibration.csv` : 설비 6대 × 120일 일일 진동

# %% [markdown]
# ## 0. 준비
# `koreanize_matplotlib`을 import하면 그래프에 한글이 제대로 나옵니다. 없으면 한글이 □□로 깨집니다.

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib          # 그래프 한글 표시
import pandas as pd                  # 표 다루기
import matplotlib.pyplot as plt      # 그래프 그리기

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
df = pd.read_csv(DATA + 'process.csv')
vib = pd.read_csv(DATA + 'vibration.csv')
print(df.shape, vib.shape)

# %% [markdown]
# ## 1. 기본 틀: 만들고 → 그리고 → 이름 붙이기
# - `fig` : 그림 전체(도화지), `ax` : 그래프가 그려지는 한 칸
# - `ax.그래프종류(x, y)`로 그리고, `set_title`, `set_xlabel`, `set_ylabel`로 이름표를 붙입니다.

# %%
rate = df.groupby('shift')['defect'].mean() * 100   # 교대별 불량률(%)

fig, ax = plt.subplots(figsize=(6, 4))
bars = ax.bar(rate.index, rate.values)
ax.set_title('야간 불량률이 주간의 약 3배')
ax.set_xlabel('교대')
ax.set_ylabel('불량률 (%)')
ax.bar_label(bars, fmt='%.1f')      # 막대 위에 숫자 표시
plt.show()

# %% [markdown]
# 같은 그래프를 pandas의 `.plot()`으로 그리면 더 짧습니다. 결과가 `ax`이므로 다듬기 코드는 똑같습니다.

# %%
ax = rate.plot(kind='bar', rot=0)
ax.set_title('교대별 불량률 (pandas .plot)')
ax.set_ylabel('불량률 (%)')
plt.show()

# %% [markdown]
# ## 2. 막대: 비교
# 호기별 불량률을 큰 순서로 정렬해 그립니다.

# %%
rate_m = df.groupby('machine')['defect'].mean() * 100
rate_m = rate_m.sort_values(ascending=False)   # 큰 순서로
print(rate_m.round(1))

fig, ax = plt.subplots(figsize=(7, 4))
ax.bar(rate_m.index, rate_m.values, color='tab:blue')
ax.set_title('호기별 불량률 (제품 494개)')
ax.set_xlabel('설비')
ax.set_ylabel('불량률 (%)')
plt.show()

# %% [markdown]
# ## 3. 선: 추이
# 3호기 진동을 날짜 순서로 그리고, 고장일(96일)에 세로선을 긋습니다.

# %%
m3 = vib[vib['machine'] == '3호기']        # 3호기만 고르기

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(m3['day'], m3['rms'], marker='.')
ax.axvline(96, color='red', linestyle='--')  # 고장일 표시
ax.set_title('3호기 진동: 고장 전 약 25일간 상승')
ax.set_xlabel('가동 일수 (일)')
ax.set_ylabel('진동 RMS')
plt.show()

# %% [markdown]
# ## 4. 히스토그램: 분포
# `bins`는 구간 개수입니다. 너무 적으면 모양이 뭉개지고, 너무 많으면 들쭉날쭉합니다.

# %%
fig, ax = plt.subplots(figsize=(7, 4))
ax.hist(df['strength'], bins=11, edgecolor='white')
ax.set_title('인장강도 분포 (제품 494개)')
ax.set_xlabel('인장강도 (MPa)')
ax.set_ylabel('제품 수 (개)')
plt.show()

# %% [markdown]
# ## 5. 상자그림: 집단별 분포 비교
# 5주차에 배운 조건 고르기로 교대별 강도 묶음을 만들고, 리스트로 넣습니다.

# %%
day = df[df['shift'] == '주간']['strength']
night = df[df['shift'] == '야간']['strength']
print('중앙값  주간', day.median(), ' 야간', night.median())

fig, ax = plt.subplots(figsize=(6, 4))
ax.boxplot([day, night])
ax.set_xticks([1, 2], ['주간', '야간'])   # 상자 이름
ax.set_title('교대별 인장강도 분포')
ax.set_ylabel('인장강도 (MPa)')
plt.show()

# %% [markdown]
# ## 6. 산점도: 관계
# 정상과 불량을 따로 그려 색을 다르게 하고, `label` + `legend()`로 범례를 붙입니다.

# %%
ok = df[df['defect'] == 0]
bad = df[df['defect'] == 1]

fig, ax = plt.subplots(figsize=(7, 4))
ax.scatter(ok['pressure'], ok['strength'], alpha=0.4, label='정상')
ax.scatter(bad['pressure'], bad['strength'], alpha=0.8, label='불량')
ax.set_title('압력과 인장강도 (불량은 아래쪽에 몰림)')
ax.set_xlabel('사출 압력 (bar)')
ax.set_ylabel('인장강도 (MPa)')
ax.legend()
plt.show()

# %% [markdown]
# ## 7. 그래프를 파일로 저장하기
# `fig.savefig()`로 PNG 파일을 만듭니다. 실행 후 Colab 왼쪽 **폴더 아이콘(파일 패널)**에서 파일 이름 옆 ⋮ → 다운로드.
# `plt.savefig()`를 쓴다면 반드시 `plt.show()`보다 **먼저** 써야 합니다(뒤에 쓰면 빈 그림).

# %%
fig, ax = plt.subplots(figsize=(7, 4))
ax.bar(rate_m.index, rate_m.values)
ax.set_title('호기별 불량률 (제품 494개)')
ax.set_xlabel('설비')
ax.set_ylabel('불량률 (%)')
fig.savefig('graph1_bar.png', dpi=150, bbox_inches='tight')
plt.show()

import os
print('저장됨:', os.path.exists('graph1_bar.png'))

# %% [markdown]
# ## 8. 직접 바꿔 보기
# 1. `group_col`을 `'line'`이나 `'shift'`로 바꿔 막대그래프를 다시 그려 보세요.
# 2. `x_col`을 `'thickness'`, `'humidity'`, `'temp'`로 바꿔 산점도 모양이 어떻게 달라지는지 보세요.
# 3. `n_bins`와 `bar_color`를 바꾸고, `save_name`으로 저장해 내려받아 보세요.

# %% [exercise]
group_col = 'machine'    # 'machine', 'line', 'shift'
x_col = 'pressure'       # 'pressure', 'thickness', 'humidity', 'temp', 'speed'
n_bins = 11
bar_color = 'tab:green'
save_name = 'my_graphs.png'

fig, axes = plt.subplots(1, 3, figsize=(15, 4))
r = df.groupby(group_col)['defect'].mean() * 100
axes[0].bar(r.index, r.values, color=bar_color)
axes[0].set_title(f'{group_col}별 불량률')
axes[0].set_ylabel('불량률 (%)')

axes[1].scatter(df[x_col], df['strength'], alpha=0.4)
axes[1].set_title(f'{x_col}와 인장강도')
axes[1].set_xlabel(x_col)
axes[1].set_ylabel('인장강도 (MPa)')

axes[2].hist(df['strength'], bins=n_bins, color=bar_color, edgecolor='white')
axes[2].set_title(f'인장강도 분포 (bins={n_bins})')
axes[2].set_xlabel('인장강도 (MPa)')
axes[2].set_ylabel('제품 수 (개)')

fig.savefig(save_name, dpi=150, bbox_inches='tight')
plt.show()

# %% [markdown]
# ## 정리
# - 기본 틀: `fig, ax = plt.subplots()` → `ax.그래프()` → 제목·축 이름·단위 → `plt.show()`
# - 함수만 바꾼다: `bar` · `plot` · `hist` · `boxplot` · `scatter` (표에서 바로는 `.plot(kind=...)`)
# - 한글은 `koreanize_matplotlib`, 저장은 `savefig` — 과제1에서 그대로 씁니다.
#
# **생성형AI에게 물어볼 만한 질문**
# - “df에 line(라인 이름), strength(인장강도, MPa) 열이 있어. 라인별 강도 분포를 비교하는 상자그림을 matplotlib으로 그려 줘. 제목과 y축 이름(단위 포함)도 붙여 줘.”
# - “matplotlib 그래프의 x축 글자가 겹쳐. 글자를 45도 기울이는 방법을 알려 줘.”
#
# → 받은 코드의 **열 이름이 실제 데이터와 같은지**, 그래프의 숫자가 `print()`로 확인한 값과 같은지 검증하세요.
