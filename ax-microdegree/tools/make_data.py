"""실습용 가상 데이터 생성 (항상 같은 결과가 나오도록 seed 고정).
python3 tools/make_data.py  →  ai-data-analysis/data/*.csv
"""
import numpy as np, pandas as pd, os
OUT = os.path.join(os.path.dirname(__file__), '..', 'ai-data-analysis', 'data')
rng = np.random.default_rng(2026)

# ── 1) 공정 데이터: process.csv (정리된 데이터), process_raw.csv (정리 전 데이터)
dates = pd.bdate_range('2026-03-02', periods=30)
rows = []
for d in dates:
    for shift in ['주간', '야간']:
        for _ in range(rng.integers(7, 11)):
            machine = int(rng.integers(1, 7))
            line = (machine + 1) // 2
            temp = rng.normal(210 + (3 if machine == 4 else 0) + (2 if shift == '야간' else 0), 7)
            pressure = rng.normal(80, 6)
            speed = rng.normal(1200, 80)
            humidity = rng.normal(55 + (6 if shift == '야간' else 0), 9)
            thickness = rng.normal(2.0, 0.07)
            strength = (40 + 0.35 * (pressure - 80) - 0.02 * (temp - 210) ** 2 + 14 * (thickness - 2.0)
                        - 0.004 * (speed - 1200) - 0.05 * (humidity - 55) + rng.normal(0, 1.2))
            z = (-4.0 + 0.13 * (temp - 210) + 0.07 * (humidity - 55) - 12 * (thickness - 2.0)
                 + 0.6 * (shift == '야간') + 0.5 * (machine == 4) - 0.25 * (strength - 40))
            defect = int(rng.random() < 1 / (1 + np.exp(-z)))
            if defect:
                if thickness < 1.95: dtype = '치수불량'
                elif humidity > 62: dtype = '찍힘'
                else: dtype = '스크래치'
            else:
                dtype = '정상'
            rows.append(dict(date=d.strftime('%Y-%m-%d'), shift=shift, line=f'{line}라인', machine=f'{machine}호기',
                             temp=round(temp, 1), pressure=round(pressure, 1), speed=int(round(speed)),
                             humidity=round(humidity, 1), thickness=round(thickness, 3), strength=round(strength, 2),
                             defect=defect, defect_type=dtype))
df = pd.DataFrame(rows)
df.insert(0, 'product_id', [f'P{i:05d}' for i in range(1, len(df) + 1)])
df.to_csv(os.path.join(OUT, 'process.csv'), index=False, encoding='utf-8-sig')

raw = df.copy().astype({'thickness': object, 'temp': object})
idx = rng.permutation(len(raw))
raw.loc[idx[:int(len(raw) * .04)], 'humidity'] = np.nan                       # 습도 결측 4%
raw.loc[idx[40:40 + int(len(raw) * .02)], 'pressure'] = np.nan               # 압력 결측 2%
for i in idx[60:66]: raw.loc[i, 'temp'] = 999.9                              # 센서 오류값
for i in idx[66:68]: raw.loc[i, 'temp'] = -1.0
for i in idx[70:70 + int(len(raw) * .05)]: raw.loc[i, 'thickness'] = f"{df.loc[i, 'thickness']}mm"   # 단위가 섞인 값
raw = pd.concat([raw, raw.iloc[idx[100:105]]]).reset_index(drop=True)        # 중복 행 5개
raw.to_csv(os.path.join(OUT, 'process_raw.csv'), index=False, encoding='utf-8-sig')

# ── 2) 설비 진동 데이터: vibration.csv (6대 × 120일, 3호기·5호기 고장)
vr = []
fail = {3: 96, 5: 110}
for m in range(1, 7):
    for day in range(120):
        base = 1.0 + 0.05 * (m - 3.5) / 3
        wear = 0.0
        if m in fail and day >= fail[m] - 25:
            wear = ((day - (fail[m] - 25)) / 25) ** 2 * 2.2
        if m in fail and day > fail[m]:  # 고장 후 정비 완료
            wear = 0.0
        rms = base + wear + rng.normal(0, 0.08) + (0.4 if rng.random() < 0.02 else 0)
        vr.append(dict(machine=f'{m}호기', day=day + 1, date=(pd.Timestamp('2026-03-02') + pd.Timedelta(days=day)).strftime('%Y-%m-%d'),
                       rms=round(rms, 3), peak=round(rms * rng.normal(3.0, 0.15), 3),
                       temp=round(45 + 6 * wear + rng.normal(0, 1.0), 1), current=round(12 + 1.5 * wear + rng.normal(0, 0.3), 2),
                       failure=int(m in fail and day + 1 == fail[m])))
pd.DataFrame(vr).to_csv(os.path.join(OUT, 'vibration.csv'), index=False, encoding='utf-8-sig')

# ── 3) 실험 수율 데이터: lab_yield.csv (실험 60회)
lr = []
for i in range(60):
    t = rng.choice([60, 70, 80, 90, 100]); h = rng.choice([1, 2, 3, 4, 5]); c = round(rng.uniform(0.5, 2.5), 2)
    y = 40 + 50 * np.exp(-(((t - 92) / 14) ** 2 + ((h - 2.3) / 1.8) ** 2) / 2) + 4 * (c - 1.5) + rng.normal(0, 2.5)
    lr.append(dict(exp_id=f'E{i + 1:03d}', temp=int(t), hours=int(h), catalyst=c, yield_pct=round(float(y), 1)))
pd.DataFrame(lr).to_csv(os.path.join(OUT, 'lab_yield.csv'), index=False, encoding='utf-8-sig')

print('process', df.shape, 'defect rate', round(df.defect.mean(), 3), df.defect_type.value_counts().to_dict())
print('process_raw', raw.shape)
print('vibration', len(vr), 'lab_yield', len(lr))
