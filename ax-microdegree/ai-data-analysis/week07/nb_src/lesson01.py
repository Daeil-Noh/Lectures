# %% [markdown]
# # 7주 1차시 · 목적에 맞는 그래프 고르기
#
# **학습 목표**
# - 그래프를 그리기 전에 “무엇을 알고 싶은가(질문)”를 한 문장으로 쓴다.
# - 비교·추이·분포·관계·구성 다섯 가지 목적에 맞는 그래프를 고른다.
# - y축을 자르면 차이가 얼마나 과장되는지 직접 확인한다.
#
# **사용 데이터** (모두 실습용 가상 데이터)
# - `process.csv` : 사출 성형 공정 기록 494행 — 교대(shift), 라인, 호기, 온도·압력·습도, 인장강도(strength, MPa), 불량 여부(defect) 등
# - `vibration.csv` : 설비 6대 × 120일 일일 진동(rms)
#
# 코드 한 줄 한 줄의 뜻은 **다음 차시(7-2)**에 자세히 배웁니다. 오늘은 셀을 실행하고 **그래프를 읽는 데** 집중하세요.

# %% [markdown]
# ## 0. 준비: 라이브러리와 데이터
# 한글 그래프를 위해 `koreanize-matplotlib`을 설치합니다(Colab에서 처음 한 번).

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import pandas as pd
import matplotlib.pyplot as plt

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
df = pd.read_csv(DATA + 'process.csv')
vib = pd.read_csv(DATA + 'vibration.csv')
print(df.shape, vib.shape)
df.head()

# %% [markdown]
# ## 1. 비교 → 막대그래프
# **질문:** 주간과 야간 중 어디서 불량이 더 많이 나올까?
# 6주차에 배운 `groupby`로 교대별 불량률(%)을 구한 뒤 막대로 그립니다. 막대는 길이로 비교하므로 y축은 0부터 시작합니다.

# %%
rate = df.groupby('shift')['defect'].mean() * 100   # 교대별 불량률(%)
print(rate.round(1))

ax = rate.plot(kind='bar', color=['tab:orange', 'tab:blue'], rot=0)
ax.set_title('야간 불량률이 주간의 약 3배')
ax.set_xlabel('교대')
ax.set_ylabel('불량률 (%)')
plt.show()

# %% [markdown]
# ## 2. 추이 → 선 그래프
# **질문:** 3호기 진동은 시간이 지나며 어떻게 변했을까? 정상 설비(1호기)와 함께 그려 비교합니다.

# %%
for m in ['1호기', '3호기']:
    one = vib[vib['machine'] == m]          # 한 설비만 고르기
    plt.plot(one['day'], one['rms'], label=m)

plt.axvline(96, color='red', linestyle='--')   # 3호기 고장일
plt.title('3호기 진동은 고장(96일) 전 약 25일 동안 계속 커졌다')
plt.xlabel('가동 일수 (일)')
plt.ylabel('진동 RMS')
plt.legend()
plt.show()

# %% [markdown]
# ## 3. 분포 → 히스토그램 · 상자그림
# **질문:** 강도는 어느 범위에 몰려 있고, 튀는 값은 없을까?
# - 히스토그램: 구간별 개수 → 분포의 모양
# - 상자그림: 중앙값·사분위·이상치 → 집단끼리 비교

# %%
plt.hist(df['strength'], bins=11, edgecolor='white')
plt.title('인장강도 분포 (제품 494개)')
plt.xlabel('인장강도 (MPa)')
plt.ylabel('제품 수 (개)')
plt.show()

# %%
df.boxplot(column='strength', by='shift', grid=False)
plt.suptitle('')                       # pandas가 자동으로 붙이는 위쪽 제목 지우기
plt.title('교대별 인장강도 분포')
plt.xlabel('교대')
plt.ylabel('인장강도 (MPa)')
plt.show()

# %% [markdown]
# ## 4. 관계 → 산점도
# **질문:** 사출 압력이 높으면 강도도 높을까? 점 하나가 제품 하나입니다. 점이 겹치므로 `alpha`로 반투명하게 합니다.

# %%
plt.scatter(df['pressure'], df['strength'], alpha=0.4)
plt.title('압력이 높을수록 강도도 높은 경향')
plt.xlabel('사출 압력 (bar)')
plt.ylabel('인장강도 (MPa)')
plt.show()

# %% [markdown]
# ## 5. 구성 → 누적 막대
# **질문:** 불량은 어떤 유형으로 이루어져 있고, 교대마다 다를까?
# `pd.crosstab`으로 교대 × 불량 유형 표를 만들고(불량만), `stacked=True`로 쌓아 그립니다.

# %%
bad = df[df['defect'] == 1]                          # 불량품만
table = pd.crosstab(bad['shift'], bad['defect_type'])
print(table)

ax = table.plot(kind='bar', stacked=True, rot=0)
ax.set_title('야간에는 찍힘 불량이 특히 많다')
ax.set_xlabel('교대')
ax.set_ylabel('불량 건수 (건)')
plt.show()

# %% [markdown]
# 같은 내용을 원그래프로 그리면 어떨까요? 전체 비율은 보이지만 **교대별 차이는 사라집니다.**

# %%
bad['defect_type'].value_counts().plot(kind='pie', autopct='%.0f%%')
plt.title('전체 불량 유형 비율 (교대 구분 없음)')
plt.ylabel('')
plt.show()

# %% [markdown]
# ## 6. 오해를 부르는 그래프: 잘린 y축
# 호기별 불량률을 두 번 그립니다. 왼쪽은 y축 0부터, 오른쪽은 10%부터. 같은 숫자인데 인상이 어떻게 다른가요?

# %%
mrate = df.groupby('machine')['defect'].mean() * 100
print(mrate.round(1))

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
mrate.plot(kind='bar', ax=axes[0], rot=0, title='y축 0부터 (정직)')
mrate.plot(kind='bar', ax=axes[1], rot=0, title='y축 10%부터 (과장)')
axes[1].set_ylim(10, 16)
for ax in axes:
    ax.set_ylabel('불량률 (%)')
plt.show()

# %% [markdown]
# ## 7. 직접 바꿔 보기
# 아래 셀의 값을 바꾸고 다시 실행해 보세요. 기본값 그대로도 실행됩니다.
# 1. `group_col`을 `'line'`이나 `'machine'`으로 바꾸면 무엇과 무엇을 비교하게 되나요?
# 2. `n_bins`를 5, 20, 40으로 바꾸면 히스토그램 모양이 어떻게 달라지나요?
# 3. `y_start`를 0, 5, 12로 바꾸며 “눈에 보이는 차이”가 어떻게 변하는지 보세요.

# %% [exercise]
group_col = 'shift'   # 'shift', 'line', 'machine' 중 하나
n_bins = 11           # 히스토그램 구간 개수
y_start = 0           # 막대그래프 y축 시작값(%)

fig, axes = plt.subplots(1, 2, figsize=(11, 4))
r = df.groupby(group_col)['defect'].mean() * 100
r.plot(kind='bar', ax=axes[0], rot=0)
axes[0].set_ylim(y_start, r.max() * 1.15)
axes[0].set_title(f'{group_col}별 불량률 (y축 {y_start}%부터)')
axes[0].set_ylabel('불량률 (%)')

axes[1].hist(df['strength'], bins=n_bins, edgecolor='white')
axes[1].set_title(f'인장강도 분포 (bins={n_bins})')
axes[1].set_xlabel('인장강도 (MPa)')
axes[1].set_ylabel('제품 수 (개)')
plt.show()

# %% [markdown]
# ## 정리
# - 그래프는 **질문에 대한 답**입니다. 질문을 먼저 한 문장으로 쓰세요.
# - 비교=막대 · 추이=선 · 분포=히스토그램/상자그림 · 관계=산점도 · 구성=누적 막대(원그래프는 항목이 적을 때만)
# - 막대는 0부터, 3D·색 남용 금지, **제목·축 이름·단위**는 꼭 붙입니다.
#
# **생성형AI에게 물어볼 만한 질문**
# - “process.csv에 shift, line, machine, temp, pressure, strength, defect 열이 있어. ‘라인별로 강도 분포가 다른가?’라는 질문에는 어떤 그래프가 맞을까? 이유도 설명해 줘.”
# - “내가 그린 막대그래프의 y축이 10부터 시작해. 이 그래프가 오해를 부를 수 있는 이유와 고치는 방법을 알려 줘.”
#
# → AI가 추천한 그래프가 오늘 배운 다섯 가지 목적과 맞는지 **직접 확인**하세요.
