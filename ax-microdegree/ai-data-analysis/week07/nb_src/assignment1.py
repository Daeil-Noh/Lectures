# %% [markdown]
# # 과제1 · 데이터 시각화 — 목적이 다른 그래프 3장
#
# **이름 / 학번 / 학과** : (여기에 적으세요)
#
# **과제 내용**
# - `process.csv`(필요하면 `vibration.csv`도)로 그래프 **3장**을 그립니다.
# - 세 그래프의 목적은 **모두 달라야** 합니다: 비교 · 추이 · 분포 · 관계 · 구성 중 세 가지.
# - 그래프마다 ① **질문 한 문장** ② **그래프**(결론이 보이는 제목·축 이름·단위) ③ **해석 2~3문장**을 씁니다.
#
# **제출** : 모든 셀을 실행해 그래프가 보이는 상태의 `.ipynb` 파일 또는 PDF를 강의 **LMS** 과제1 게시판에 올립니다. 마감은 **LMS 공지 기준**입니다.
# (Colab: 파일 → 다운로드 → .ipynb 다운로드 / PDF는 파일 → 인쇄 → PDF로 저장)
#
# **평가 기준** (세부 사항은 LMS 공지를 따릅니다)
#
# | 기준 | 확인하는 것 | 배점 |
# |---|---|---|
# | 목적과 그래프 | 세 그래프의 목적이 서로 다르고, 목적에 맞는 종류를 골랐다 | 30 |
# | 그래프 완성도 | 결론이 보이는 제목, 축 이름·단위, 막대는 0부터 | 30 |
# | 해석 | 그래프에서 읽은 사실 + 의미 2~3문장, 상관을 인과로 단정하지 않음 | 30 |
# | 제출 형식 | 코드가 오류 없이 실행된 결과 포함, 생성형AI 사용 표기 | 10 |

# %% [markdown]
# ## 0. 준비 (그대로 실행)

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import pandas as pd
import matplotlib.pyplot as plt

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
df = pd.read_csv(DATA + 'process.csv')
vib = pd.read_csv(DATA + 'vibration.csv')    # 추이 그래프에 쓰고 싶다면
print(df.shape, vib.shape)
print(df.columns.tolist())

# %% [markdown]
# ### 참고: 목적별 그래프 고르기 (7-1)
# | 목적 | 질문의 모양 | 그래프 | 코드 예 |
# |---|---|---|---|
# | 비교 | A와 B 중 어느 쪽이 더 큰가? | 막대 | `ax.bar(r.index, r.values)` |
# | 추이 | 시간에 따라 어떻게 변하나? | 선 | `ax.plot(x, y)` |
# | 분포 | 값이 어떻게 퍼져 있나? | 히스토그램·상자그림 | `ax.hist(df['열'], bins=15)` / `df.boxplot(column=, by=)` |
# | 관계 | 두 값이 함께 움직이나? | 산점도 | `ax.scatter(df['x열'], df['y열'], alpha=0.4)` |
# | 구성 | 무엇으로 이루어져 있나? | 누적 막대 | `pd.crosstab(...).plot(kind='bar', stacked=True)` |
#
# 수업 예시(교대별 불량률, 압력-강도 산점도 등)와 **똑같은 그래프 대신 자기 질문**으로 만들어 보세요.
# 아래 셀의 코드는 **시작용 예시**입니다. 열 이름·그래프 종류·제목을 자기 질문에 맞게 바꾸세요.

# %% [markdown]
# ---
# ## 그래프 1
# **목적** : (비교 / 추이 / 분포 / 관계 / 구성 중 하나)
#
# **질문** : (예: 라인별로 평균 인장강도가 다를까?)

# %% [exercise]
# 그래프 1 — 아래는 '비교(막대)' 시작 예시입니다. 자기 질문에 맞게 고치세요.
r1 = df.groupby('line')['strength'].mean()
print(r1.round(2))                          # 그래프 전에 숫자를 직접 확인

fig, ax = plt.subplots(figsize=(7, 4))
ax.bar(r1.index, r1.values)
ax.set_title('(결론이 보이는 제목으로 바꾸세요)')
ax.set_xlabel('라인')
ax.set_ylabel('평균 인장강도 (MPa)')
fig.savefig('graph1.png', dpi=150, bbox_inches='tight')
plt.show()

# %% [markdown]
# **해석 (2~3문장)** :
# - 사실: (그래프에서 읽은 것 — 숫자를 넣어서)
# - 의미: (그래서 무엇을 생각할 수 있는가)
# - 주의: (이 그래프로 말할 수 없는 것, 예: 원인인지는 알 수 없다)

# %% [markdown]
# ---
# ## 그래프 2
# **목적** : (그래프 1과 다른 목적)
#
# **질문** :

# %% [exercise]
# 그래프 2 — 아래는 '분포(히스토그램)' 시작 예시입니다.
fig, ax = plt.subplots(figsize=(7, 4))
ax.hist(df['thickness'], bins=15, edgecolor='white')
ax.set_title('(결론이 보이는 제목으로 바꾸세요)')
ax.set_xlabel('두께 (mm)')
ax.set_ylabel('제품 수 (개)')
fig.savefig('graph2.png', dpi=150, bbox_inches='tight')
plt.show()

# %% [markdown]
# **해석 (2~3문장)** :
# - 사실:
# - 의미:
# - 주의:

# %% [markdown]
# ---
# ## 그래프 3
# **목적** : (그래프 1·2와 다른 목적)
#
# **질문** :

# %% [exercise]
# 그래프 3 — 아래는 '관계(산점도)' 시작 예시입니다.
r3 = df['humidity'].corr(df['strength'])
print('상관계수 r =', round(r3, 2))

fig, ax = plt.subplots(figsize=(7, 4))
ax.scatter(df['humidity'], df['strength'], alpha=0.4)
ax.set_title('(결론이 보이는 제목으로 바꾸세요)')
ax.set_xlabel('습도 (%)')
ax.set_ylabel('인장강도 (MPa)')
fig.savefig('graph3.png', dpi=150, bbox_inches='tight')
plt.show()

# %% [markdown]
# **해석 (2~3문장)** :
# - 사실:
# - 의미:
# - 주의:

# %% [markdown]
# ---
# ## 제출 전 체크리스트
# - [ ] 그래프 3장의 목적이 **서로 다르다** (비교·추이·분포·관계·구성 중 세 가지)
# - [ ] 제목이 **결론**을 말한다 (“무엇을 그렸나”가 아니라 “무엇을 알았나”)
# - [ ] 축 이름과 **단위**가 있다 — 강도(MPa), 온도(℃), 압력(bar), 습도(%), 두께(mm), 불량률(%)
# - [ ] 막대그래프의 y축이 **0부터** 시작한다
# - [ ] 해석에 **숫자**가 들어가고, 상관을 **원인으로 단정하지 않았다**
# - [ ] 런타임 → 모두 실행 후 오류 없이 그래프가 보인다
# - [ ] 생성형AI를 썼다면 아래에 적었다
#
# **생성형AI 사용 내역** : (사용하지 않았으면 “없음”. 사용했다면 어떤 도구를 어디에 썼는지 한두 줄로)
