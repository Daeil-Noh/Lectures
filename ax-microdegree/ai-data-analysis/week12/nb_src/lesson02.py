# %% [markdown]
# # 12주 2차시 · 이상탐지와 설비 예지보전
#
# **학습 목표**
# - 정상 구간의 평균·표준편차로 **z-점수(3σ) 경보**를 만들고, 첫 경보일과 잘못 경보를 센다.
# - **이동평균**으로 순간 튐(잡음)을 걸러 내고, 그 대가(늦은 경보)를 확인한다.
# - 진동·온도·전류를 **함께** 보고, IsolationForest를 한 번 돌려 본다.
#
# **사용 데이터**: `vibration.csv` — 설비 6대 × 120일의 하루 진동 기록 (가상 데이터).
# 열: `machine`(호기), `day`(1~120), `rms`(진동 세기), `peak`(최대 진동), `temp`(온도 ℃), `current`(전류 A), `failure`(고장일 = 1).
# 오늘은 **96일째 고장 난 3호기**를 집중해서 봅니다.

# %% [markdown]
# ## 1. 준비: 데이터 불러와 3호기만 고르기

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib   # 그래프 한글 표시
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
vib = pd.read_csv(DATA + 'vibration.csv')
print(vib.shape)
print('고장 기록:', vib[vib['failure'] == 1][['machine', 'day']].values.tolist())

FAIL_DAY = 96                                   # 3호기 고장일
m3 = vib[(vib['machine'] == '3호기') & (vib['day'] <= FAIL_DAY)].reset_index(drop=True)
m3.head()

# %% [markdown]
# ## 2. 센서 셋을 나란히 그려 보기
# 고장 전에 무엇이 먼저, 어떻게 변하나요? 하루만 툭 튀는 날도 찾아보세요.

# %%
fig, axes = plt.subplots(3, 1, figsize=(9, 6.5), sharex=True)
for ax, col, name in zip(axes, ['rms', 'temp', 'current'], ['진동 rms', '온도 (℃)', '전류 (A)']):
    ax.plot(m3['day'], m3[col])
    ax.axvline(FAIL_DAY, color='red', linestyle='--')   # 고장일
    ax.set_ylabel(name)
axes[0].set_title('3호기 1~96일')
axes[2].set_xlabel('날짜 (일)')
plt.show()

# %% [markdown]
# ## 3. 평소 기준 만들기: z-점수와 3σ 규칙
# 1~60일을 **정상 기준 구간**으로 정하고 평균·표준편차를 구합니다.
# - z = (오늘 값 − 정상 평균) ÷ 정상 표준편차
# - z > 3 이면 경보 (3σ 규칙)
#
# 평가 기준: 고장 전 30일(67~96일)의 경보 = **맞은 경보**, 그보다 앞선 경보 = **잘못 경보**.

# %%
BASE = 60                                       # 정상 기준 구간: 1~60일
base = m3[m3['day'] <= BASE]
mean, std = base['rms'].mean(), base['rms'].std()
print(f'정상 평균 {mean:.3f}, 표준편차 {std:.3f}, 3σ 선 {mean + 3 * std:.2f}')

K = 3                                           # 경보 기준 z
m3['z'] = (m3['rms'] - mean) / std
m3['alarm'] = m3['z'] > K

def evaluate(alarm_days, fail_day=FAIL_DAY):
    """경보가 울린 날 목록 → (고장 전 30일 안 첫 경보일, 그 전 잘못 경보 날들)"""
    hit = [d for d in alarm_days if fail_day - 30 < d <= fail_day]
    false = [d for d in alarm_days if d <= fail_day - 30]
    return (min(hit) if hit else None), false

first, false = evaluate(m3.loc[m3['alarm'], 'day'].tolist())
print(f'첫 경보 {first}일째 (고장 {FAIL_DAY - first}일 전), 잘못 경보 {false}')

# %% [markdown]
# ## 4. 경보를 그래프에 표시하기

# %%
plt.figure(figsize=(9, 3.8))
plt.plot(m3['day'], m3['rms'], label='rms')
plt.axhline(mean + K * std, color='orange', linestyle='--', label=f'z = {K} 선')
al = m3[m3['alarm']]
plt.scatter(al['day'], al['rms'], color='red', zorder=3, label='경보')
plt.axvline(FAIL_DAY, color='red', linestyle=':')
plt.xlabel('날짜 (일)')
plt.ylabel('진동 rms')
plt.legend()
plt.show()

# %% [markdown]
# 27일·47일의 빨간 점은 고장과 관계없는 **순간 튐**입니다. 이런 잘못 경보가 잦으면 아무도 경보를 믿지 않게 됩니다.
#
# ## 5. 이동평균으로 튐 걸러 내기
# `rolling(7).mean()` 은 **오늘 포함 최근 7일**의 평균입니다 (앞날 값은 쓰지 않음). 경보선은 그대로 둡니다.

# %%
W = 7                                           # 이동평균 기간 (일)
m3['rms_ma'] = m3['rms'].rolling(W).mean()
m3['alarm_ma'] = m3['rms_ma'] > mean + K * std  # 같은 3σ 선과 비교

first_ma, false_ma = evaluate(m3.loc[m3['alarm_ma'], 'day'].tolist())
print(f'{W}일 이동평균: 첫 경보 {first_ma}일째 (고장 {FAIL_DAY - first_ma}일 전), 잘못 경보 {false_ma}')

plt.figure(figsize=(9, 3.8))
plt.plot(m3['day'], m3['rms'], color='lightgray', label='원래 값')
plt.plot(m3['day'], m3['rms_ma'], label=f'{W}일 이동평균')
plt.axhline(mean + K * std, color='orange', linestyle='--', label='3σ 선')
plt.xlabel('날짜 (일)')
plt.legend()
plt.show()

# %% [markdown]
# 기간을 바꿔 가며 한 번에 비교해 봅니다. 기간이 길수록 무엇이 좋아지고 무엇이 나빠지나요?

# %%
for w in [1, 3, 5, 7, 10, 14]:
    ma = m3['rms'].rolling(w).mean()
    f, fa = evaluate(m3.loc[ma > mean + K * std, 'day'].tolist())
    print(f'기간 {w:2d}일 → 첫 경보 {f}일째 (고장 {FAIL_DAY - f:2d}일 전), 잘못 경보 {len(fa)}일')

# %% [markdown]
# ## 6. 여러 센서를 함께 보기
# 센서마다 정상 구간 평균·표준편차로 z-점수를 구해 한 그래프에 겹칩니다.
# 81일째 근처를 보세요. 하나씩은 3을 넘지 않지만 **셋이 함께** 올라갑니다.

# %%
plt.figure(figsize=(9, 3.8))
for col in ['rms', 'temp', 'current']:
    z = (m3[col] - base[col].mean()) / base[col].std()
    plt.plot(m3['day'], z, label=col)
plt.axhline(3, color='red', linestyle='--')
plt.ylim(-4, 12)
plt.xlabel('날짜 (일)')
plt.ylabel('z-점수')
plt.legend()
plt.show()

# %% [markdown]
# ## 7. IsolationForest 한 번 돌려 보기
# IsolationForest는 무작위로 자르기를 반복해 **빨리 혼자 남는 점**을 이상으로 봅니다.
# - 학습: 6대의 정상 기준 구간(1~60일) 360일, 특징 3개 `[rms, temp, current]`
# - `contamination=0.01`: 정상 데이터 중 가장 수상한 1% 정도를 이상으로 볼 만큼의 기준
# - 결과: `predict` 가 **-1이면 이상**, 1이면 정상

# %%
feats = ['rms', 'temp', 'current']
train = vib[vib['day'] <= BASE][feats]          # 6대 × 60일
model = IsolationForest(contamination=0.01, random_state=0)
model.fit(train)

m3['alarm_if'] = model.predict(m3[feats]) == -1
first_if, false_if = evaluate(m3.loc[m3['alarm_if'], 'day'].tolist())
print(f'IsolationForest: 첫 경보 {first_if}일째 (고장 {FAIL_DAY - first_if}일 전), 잘못 경보 {false_if}')

# %% [markdown]
# 3σ(원래 값)는 83일, 7일 이동평균은 85일, IsolationForest는 81일에 처음 경보를 울렸습니다.
# 가장 빠른 방법에도 잘못 경보가 있습니다. 어떤 방법이 좋은지는 **다른 설비에서 잘못 경보가 몇 번 나는지**까지 봐야 합니다 → 12-3.
#
# ## 8. 직접 바꿔 보기
# 1. `K` 를 2, 4로 바꿔 보세요. 첫 경보일과 잘못 경보 수가 어떻게 바뀌나요?
# 2. `W` 를 3, 14로 바꿔 보세요. 튐은 사라지나요? 경보는 며칠 늦어지나요?
# 3. `MACHINE` 을 `'5호기'`, `FAIL` 을 `110` 으로 바꾸면 5호기는 며칠 전에 알 수 있나요?

# %% [exercise]
MACHINE, FAIL = '3호기', 96                     # ← 예: '5호기', 110
K, W = 3, 7                                     # ← 경보 기준 z, 이동평균 기간

d = vib[(vib['machine'] == MACHINE) & (vib['day'] <= FAIL)].reset_index(drop=True)
b = d[d['day'] <= BASE]['rms']
raw_days = d.loc[(d['rms'] - b.mean()) / b.std() > K, 'day'].tolist()
ma_days = d.loc[d['rms'].rolling(W).mean() > b.mean() + K * b.std(), 'day'].tolist()
print(MACHINE, '원래 값   :', evaluate(raw_days, FAIL))
print(MACHINE, f'{W}일 이동평균:', evaluate(ma_days, FAIL))

# %% [markdown]
# ## 정리
# - 고장 예시는 드물다 → **정상 구간**으로 평소 기준을 만들고 벗어난 날을 찾는다.
# - **3σ 규칙**은 간단하지만 순간 튐에 약하다. **이동평균**은 튐을 거르지만 경보가 늦어진다.
# - 여러 센서를 **함께** 보면 더 일찍 잡을 수 있다(IsolationForest). 대신 잘못 경보도 따져야 한다.
#
# **생성형AI에게 물어볼 만한 질문**
# - “pandas 로 설비별(groupby) 7일 이동평균을 구하는 코드를 보여 줘. 앞날 값을 쓰지 않는지도 설명해 줘.” → 받은 코드를 3호기에 돌려 **이 파일의 결과(85일째)와 같은지** 확인하세요.
# - “IsolationForest 의 contamination 값을 바꾸면 경보 수가 어떻게 달라져? 내 데이터에서 직접 확인하는 코드도 줘.”
