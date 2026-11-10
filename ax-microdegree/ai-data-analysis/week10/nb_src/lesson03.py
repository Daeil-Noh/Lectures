# %% [markdown]
# # 10주 3차시 · 예측 오차로 성능 평가하기
#
# **학습 목표**
# - MAE, RMSE 를 직접 계산하고 scikit-learn 함수 결과와 비교한다 (단위: MPa).
# - R² 를 “평균으로 찍는 것보다 얼마나 나은가”로 해석한다.
# - 예측-실제 그래프와 잔차 그래프로 모델이 어디서 틀리는지 찾는다.
# - 훈련용 vs 시험용 오차, 입력 1개 vs 여러 개 모델을 같은 기준으로 비교한다.
#
# **사용 데이터** — `process.csv` (사출 성형 공정 기록, 가상 데이터 494행)
# - 입력: `pressure`, `thickness`, `humidity`, `speed`, `temp` / 목표: `strength`(인장강도, MPa)

# %% [markdown]
# ## 0. 준비 — 10-2 와 같은 방식으로 나누고 학습하기

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'
df = pd.read_csv(DATA + 'process.csv')

features = ['pressure', 'thickness', 'humidity', 'speed', 'temp']
X = df[features]
y = df['strength']
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)
model = LinearRegression().fit(X_train, y_train)
print('훈련용', X_train.shape, ' 시험용', X_test.shape)

# %% [markdown]
# ## 1. 시험용 제품의 오차 보기
# 오차(잔차) = 실제 − 예측. 처음 6개만 표로 봅니다.

# %%
pred = model.predict(X_test)        # 시험용 99개 예측
result = pd.DataFrame({'제품': df.loc[X_test.index, 'product_id'],
                       '실제': y_test, '예측': pred.round(2),
                       '오차': (y_test - pred).round(2)})
result.head(6)

# %% [markdown]
# ## 2. MAE 와 RMSE 직접 계산하기
# - **MAE** = 오차의 절댓값(부호 뗀 크기)의 평균
# - **RMSE** = 오차를 제곱 → 평균 → 제곱근. 큰 오차에 더 민감합니다.

# %%
err = y_test - pred
mae_hand = err.abs().mean()
rmse_hand = (err ** 2).mean() ** 0.5
print(f'직접 계산: MAE = {mae_hand:.2f} MPa, RMSE = {rmse_hand:.2f} MPa')

# %% [markdown]
# scikit-learn 함수로도 계산해 같은지 확인합니다.

# %%
mae  = mean_absolute_error(y_test, pred)
rmse = mean_squared_error(y_test, pred) ** 0.5   # √
r2   = r2_score(y_test, pred)
print(f'MAE  = {mae:.2f} MPa')
print(f'RMSE = {rmse:.2f} MPa')
print(f'R²   = {r2:.3f}')

# %% [exercise]
# ✏️ 직접 바꿔 보기 1: 제품 하나의 오차를 크게 만들면 MAE 와 RMSE 는 각각 얼마나 커질까요?
#    big 값을 0, 5, 10 등으로 바꿔 보세요. (기본값 8 MPa)
big = 8
err2 = err.copy()
err2.iloc[3] = big          # 네 번째 제품(P00176)의 오차를 바꾼다
print(f'MAE : {mae_hand:.3f} → {err2.abs().mean():.3f}')
print(f'RMSE: {rmse_hand:.3f} → {(err2 ** 2).mean() ** 0.5:.3f}')

# %% [markdown]
# ## 3. R² = 평균으로 찍는 것보다 얼마나 나은가
# R² = 1 − (모델의 오차 제곱합 ÷ 평균으로 예측할 때의 오차 제곱합)

# %%
sse_model = (err ** 2).sum()
sse_mean = ((y_test - y_test.mean()) ** 2).sum()
print('평균으로 찍을 때 오차 제곱합 =', round(sse_mean, 1))
print('모델의 오차 제곱합         =', round(sse_model, 1))
print('R² (직접 계산) =', round(1 - sse_model / sse_mean, 3))

# %% [markdown]
# ## 4. 예측-실제 그래프
# 점선(예측 = 실제) 위에 있을수록 정확합니다. 멀리 떨어진 점이 크게 틀린 제품입니다.

# %%
plt.figure(figsize=(5, 5))
plt.scatter(pred, y_test, s=18)
plt.plot([28, 48], [28, 48], '--', color='gray')
plt.xlabel('예측 강도 (MPa)')
plt.ylabel('실제 강도 (MPa)')
plt.title('시험용 99개: 예측 vs 실제')
plt.show()

# 가장 크게 틀린 제품 3개
result['온도'] = df.loc[X_test.index, 'temp']
result.reindex(result['오차'].abs().sort_values(ascending=False).index).head(3)

# %% [markdown]
# ## 5. 잔차 그래프 — 온도에 따라
# 잔차가 0 주변에 고르게 흩어지면 좋은 신호, **모양이 남아 있으면** 모델이 놓친 관계가 있다는 신호입니다.
# 아래에서 직선 모델(입력 5개)과 온도 특성을 더한 모델을 나란히 봅니다.

# %%
df['temp_gap2'] = (df['temp'] - 210) ** 2
features2 = features + ['temp_gap2']
X2_train, X2_test, y_train, y_test = train_test_split(
    df[features2], y, test_size=0.2, random_state=42)
model2 = LinearRegression().fit(X2_train, y_train)
err_2 = y_test - model2.predict(X2_test)

fig, ax = plt.subplots(1, 2, figsize=(10, 3.5), sharey=True)
ax[0].scatter(X_test['temp'], err, s=16)
ax[0].set_title('입력 5개 직선 모델')
ax[1].scatter(X2_test['temp'], err_2, s=16, color='tab:orange')
ax[1].set_title('+ 온도 특성 (temp_gap2)')
for a in ax:
    a.axhline(0, color='gray')
    a.set_xlabel('온도 (℃)')
ax[0].set_ylabel('잔차 (MPa)')
plt.show()

# %% [markdown]
# ## 6. 여러 모델을 같은 기준으로 비교하기
# 모든 모델을 **같은 훈련용·시험용**으로 나누어 학습·채점합니다.
# 훈련용 오차와 시험용 오차가 비슷하면, 처음 보는 제품에도 비슷하게 통한다는 뜻입니다.

# %%
cands = {'압력만': ['pressure'],
         '입력 5개': features,
         '+온도 특성': features2}
for name, cols in cands.items():
    m = LinearRegression().fit(X2_train[cols], y_train)
    p_tr = m.predict(X2_train[cols])    # 훈련용 예측
    p_te = m.predict(X2_test[cols])     # 시험용 예측
    rmse_tr = mean_squared_error(y_train, p_tr) ** 0.5
    rmse_te = mean_squared_error(y_test, p_te) ** 0.5
    r2 = r2_score(y_test, p_te)
    print(f'{name}: 훈련 {rmse_tr:.2f}  시험 {rmse_te:.2f}',
          f' R² {r2:.3f}')

# %% [exercise]
# ✏️ 직접 바꿔 보기 2: 나만의 입력 조합을 만들어 채점해 보세요.
#    예: ['pressure', 'thickness'] 또는 ['pressure', 'temp', 'temp_gap2']
my_cols = ['pressure', 'thickness']
m = LinearRegression().fit(X2_train[my_cols], y_train)
p_te = m.predict(X2_test[my_cols])
print(my_cols)
print(f'시험용 MAE {mean_absolute_error(y_test, p_te):.2f}  '
      f'RMSE {mean_squared_error(y_test, p_te) ** 0.5:.2f}  R² {r2_score(y_test, p_te):.3f}')

# %% [exercise]
# ✏️ 직접 바꿔 보기 3: 허용 오차 tol 을 바꿔, 오차가 그 안에 드는 시험 제품 비율을 비교해 보세요.
tol = 2.0
print(f'±{tol} MPa 안에 든 비율 — 입력 5개: {(err.abs() <= tol).mean():.0%}, '
      f'+온도 특성: {(err_2.abs() <= tol).mean():.0%}')

# %% [markdown]
# ## 정리
# - **MAE** = 평균적으로 몇 MPa 틀리나, **RMSE** = 큰 오차에 더 민감 (RMSE ≥ MAE)
# - **R²** = 1 − 모델 오차 제곱합 ÷ 평균 예측 오차 제곱합. 1 이면 완벽, 0 이면 평균 수준, 음수면 평균만도 못함
# - **그래프**: 예측-실제 그래프로 크게 틀린 제품을, 잔차 그래프로 모델이 놓친 관계(온도의 곡선)를 찾는다
# - 점수는 항상 **시험용**으로, **단위와 함께**, 같은 나누기로 비교한다
#
# **생성형AI에게 물어볼 만한 질문**
# - “인장강도 회귀 모델의 시험용 결과가 MAE 0.99, RMSE 1.24, R² 0.852 이고 허용 오차는 ±2 MPa 야. 현장에 써도 될지 판단하려면 무엇을 더 확인해야 해?”
# - “MAE 와 RMSE 의 차이가 크게 나면 데이터에 어떤 일이 있는 거야? 예를 들어 설명해 줘.”
#
# AI가 “R² 가 0.8 이상이면 좋다” 같은 기준을 말하면, 그 기준의 근거를 묻고 **현장 기준과 직접 비교**하세요.
