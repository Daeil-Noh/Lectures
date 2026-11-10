# %% [markdown]
# # 12주 3차시 · 제공 코드로 이상탐지 실습
#
# **학습 목표**
# - 설비 6대의 진동 기록을 불러와 설비별로 그려 본다.
# - 설비마다 **z-점수(3σ)**, **7일 이동평균**, **IsolationForest** 경보를 만든다.
# - 정비 관리자의 눈으로 평가한다: 고장 난 3·5호기는 **며칠 전에** 알았나? 멀쩡한 1·2·4·6호기에는 **잘못 경보**가 몇 번 울렸나?
#
# **사용 데이터**: `vibration.csv` — 설비 6대 × 120일 (가상 데이터). 3호기는 96일째, 5호기는 110일째 고장.
#
# **평가 약속**
# - 1~60일 = 정상 기준 구간 (설비마다 평균·표준편차 계산)
# - 고장 전 30일 안의 경보 = 맞은 경보, 첫 맞은 경보일로 “고장 며칠 전”을 계산
# - 고장 설비의 그보다 앞선 경보, 정상 설비의 모든 경보 = 잘못 경보 (고장 설비의 고장 이후는 정비 기간이라 평가에서 뺌)
#
# 위에서부터 차례로 ▶ 실행하세요.

# %% [markdown]
# ## 1. 준비: 데이터 불러오기

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib   # 그래프 한글 표시
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
vib = pd.read_csv(DATA + 'vibration.csv')
print(vib.shape)
vib.groupby('machine')[['rms', 'temp', 'current']].mean().round(2)

# %% [markdown]
# ## 2. 설비별로 그려 보기
# 평균만 보면 3·5호기가 조금 높을 뿐입니다. 그래프로 보면 언제, 어떻게 달라지는지 보입니다.

# %%
FAIL = {'3호기': 96, '5호기': 110}              # 고장일

fig, axes = plt.subplots(2, 3, figsize=(12, 5), sharey=True)
for ax, (m, d) in zip(axes.flat, vib.groupby('machine')):
    ax.plot(d['day'], d['rms'])
    if m in FAIL:
        ax.axvline(FAIL[m], color='red', linestyle='--')
    ax.set_title(m)
fig.supxlabel('날짜 (일)')
fig.supylabel('진동 rms')
plt.tight_layout()
plt.show()

# %% [markdown]
# ## 3. 설비마다 “평소 기준” 만들기
# 설비마다 평소 진동이 조금씩 다릅니다. 그래서 **설비별로** 1~60일의 평균·표준편차를 구해 붙입니다.

# %%
BASE = 60                                # 정상 기준 구간: 1~60일
normal = vib[vib['day'] <= BASE]
base = normal.groupby('machine')['rms'].agg(['mean', 'std'])
# 각 행에 그 설비의 평균·표준편차 붙이기
vib = vib.merge(base, on='machine')

vib['z'] = (vib['rms'] - vib['mean']) / vib['std']   # z-점수
base.round(3)

# %% [markdown]
# ## 4. 7일 이동평균 (설비별로!)
# `groupby('machine')` 없이 `rolling` 을 하면 1호기 마지막 날과 2호기 첫날이 섞입니다. **설비별로** 계산합니다.

# %%
W = 7                                           # 이동평균 기간 (일)
vib['rms_ma'] = vib.groupby('machine')['rms'].transform(lambda s: s.rolling(W).mean())
vib['z_ma'] = (vib['rms_ma'] - vib['mean']) / vib['std']   # 같은 평소 기준으로 z-점수
vib[['machine', 'day', 'rms', 'rms_ma', 'z', 'z_ma']].iloc[264:270].round(3)   # 3호기 25~30일

# %% [markdown]
# ## 5. 규칙 경보: z > 3

# %%
K = 3                                           # 경보 기준 z
vib['alarm_z'] = vib['z'] > K                   # 원래 값으로 3σ
vib['alarm_ma'] = vib['z_ma'] > K               # 7일 이동평균으로 3σ (처음 6일은 NaN → False)
vib.groupby('machine')[['alarm_z', 'alarm_ma']].sum()   # 설비별 경보 일수

# %% [markdown]
# ## 6. IsolationForest: 진동·온도·전류를 함께
# - 학습: 6대의 정상 기준 구간(1~60일) 360일, 특징 3개
# - `contamination=0.01`: 정상 데이터 중 가장 수상한 1% 정도를 이상으로 볼 만큼의 기준
# - `predict` 가 -1 이면 이상. `score_samples` 에 −를 붙인 값은 **클수록 이상**한 점수

# %%
feats = ['rms', 'temp', 'current']
model = IsolationForest(contamination=0.01,
                        random_state=0)
model.fit(vib.loc[vib['day'] <= BASE, feats])   # 6대 × 60일

vib['alarm_if'] = model.predict(vib[feats]) == -1
# 이상 점수: 클수록 이상
vib['score_if'] = -model.score_samples(vib[feats])
vib.groupby('machine')['alarm_if'].sum()

# %% [markdown]
# 이상 점수를 설비별로 그려 봅니다. 점선 아래(평범)에 머물다가 고장 전에 튀어 오르는 설비가 보이나요?

# %%
cut = -model.offset_                            # 이 점수를 넘으면 경보
fig, axes = plt.subplots(2, 3, figsize=(12, 5), sharey=True)
for ax, (m, d) in zip(axes.flat, vib.groupby('machine')):
    ax.plot(d['day'], d['score_if'], color='purple')
    ax.axhline(cut, color='orange', linestyle='--')
    ax.set_title(m)
fig.supxlabel('날짜 (일)')
fig.supylabel('이상 점수')
plt.tight_layout()
plt.show()

# %% [markdown]
# ## 7. 평가: 정비 관리자의 표
# 경보 열 이름을 넣으면 설비별로 **첫 경보일 · 고장 며칠 전 · 잘못 경보 일수**를 돌려주는 함수입니다.

# %%
def evaluate(col):
    rows = []
    for m, d in vib.groupby('machine'):
        days = d.loc[d[col], 'day']              # 경보가 울린 날들
        if m in FAIL:
            f = FAIL[m]
            hit = days[(days > f - 30) & (days <= f)]          # 고장 전 30일 안
            first = int(hit.min()) if len(hit) else None
            lead = f - first if first is not None else None
            rows.append([m, first, lead, int((days <= f - 30).sum())])
        else:
            rows.append([m, None, None, len(days)])          # 정상 설비: 전부 잘못 경보
    out = pd.DataFrame(rows, columns=['설비', '첫 경보일', '고장 며칠 전', '잘못 경보'])
    return out.astype({'첫 경보일': 'Int64', '고장 며칠 전': 'Int64'})   # 빈칸은 <NA>

evaluate('alarm_z')

# %% [markdown]
# 세 방법을 한 줄씩 요약해 비교합니다. 부품 주문에 **10일**이 걸린다면 어떤 방법을 고를까요?

# %%
healthy = ['1호기', '2호기', '4호기', '6호기']        # 고장 없는 설비
rows = []
for col in ['alarm_z', 'alarm_ma', 'alarm_if']:
    r = evaluate(col).set_index('설비')
    rows.append([col, r.loc['3호기', '고장 며칠 전'], r.loc['5호기', '고장 며칠 전'],
                 r.loc[healthy, '잘못 경보'].sum(), r.loc[['3호기', '5호기'], '잘못 경보'].sum()])
pd.DataFrame(rows, columns=['방법', '3호기_며칠전', '5호기_며칠전', '정상설비_잘못', '고장설비_이른잘못'])

# %% [markdown]
# ## 8. 직접 바꿔 보기
# 1. `K2` 를 2, 2.5, 4로 바꿔 보세요. 미리 안 날수와 잘못 경보는 어떻게 맞바뀌나요?
# 2. `W2` 를 3, 14로 바꿔 보세요.
# 3. `C2`(contamination)를 0.005, 0.05로 바꿔 보세요. IsolationForest의 잘못 경보가 어떻게 변하나요?

# %% [exercise]
K2, W2, C2 = 3, 7, 0.01                         # ← 경보 기준 z, 이동평균 기간, contamination

ma2 = vib.groupby('machine')['rms'].transform(lambda s: s.rolling(W2).mean())
vib['try_ma'] = (ma2 - vib['mean']) / vib['std'] > K2
m2 = IsolationForest(contamination=C2, random_state=0).fit(vib.loc[vib['day'] <= BASE, feats])
vib['try_if'] = m2.predict(vib[feats]) == -1

for col in ['try_ma', 'try_if']:
    r = evaluate(col).set_index('설비')
    print(col, '| 고장 며칠 전:', r.loc[['3호기', '5호기'], '고장 며칠 전'].tolist(),
          '| 정상 설비 잘못 경보:', r.loc[healthy, '잘못 경보'].sum())

# %% [markdown]
# ## 정리
# - 설비마다 평소 값이 다르다 → **설비별** 평균·표준편차, **설비별** 이동평균.
# - 평가는 두 숫자로: 고장 설비의 **미리 안 날수**, 정상 설비의 **잘못 경보**.
# - 이 데이터에서는 7일 이동평균 + 3σ가 잘못 경보 없이 11일 전에 알렸고, IsolationForest는 15~16일 전에 알렸지만 잘못 경보가 있었다.
# - 주의: 같은 데이터를 보며 기준을 고르면 **이 데이터에만 맞춘 기준**이 되기 쉽다(9주차 시험 데이터). 새 기간·새 설비에서 다시 확인한다.
#
# **생성형AI에게 물어볼 만한 질문**
# - “`evaluate('alarm_ma')` 결과 표를 줄게. 정비 관리자에게 보고할 세 문장 요약을 써 줘: (표 붙여넣기)” → 요약의 숫자가 **표와 같은지** 하나씩 대조하세요.
# - “설비가 100대로 늘면 이 코드에서 무엇을 바꿔야 해? 고장일(FAIL)을 모르는 실제 운영에서는 평가를 어떻게 해?”
