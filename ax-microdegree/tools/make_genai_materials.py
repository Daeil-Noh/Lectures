"""생성형AI 활용 실무 공통 실습 자료 (가상 회사 '바다결') — python3 tools/make_genai_materials.py"""
import numpy as np, pandas as pd, os
OUT = os.path.join(os.path.dirname(__file__), '..', 'genai-practice', 'materials')
rng = np.random.default_rng(1105)
products = [('오리지널 그래놀라', 9800), ('다크초코 그래놀라', 11800), ('무가당 견과 믹스', 13500), ('미역귀 현미칩', 6500), ('선물 세트', 32000)]
channels = ['자사몰', '오픈마켓', '오프라인 매장']
rows = []
for m in range(1, 10):
    for pi, (p, price) in enumerate(products):
        for ci, ch in enumerate(channels):
            base = [420, 260, 180, 300, 60][pi] * [0.8, 1.3, 0.6][ci]
            season = 1.0 + (0.9 if (pi == 4 and m in (1, 2, 9)) else 0) + (0.25 if pi == 3 and m in (6, 7, 8) else 0)
            trend = 1 + 0.03 * (m - 1) if ci == 0 else 1
            units = int(base * season * trend * rng.normal(1, 0.08))
            ad = int(rng.normal([90, 140, 15][ci], 12) * 10000 * (1.3 if m in (7, 8) and ci == 1 else 1))
            ret = int(max(0, units * rng.normal([0.015, 0.03, 0.005][ci], 0.004)))
            rows.append(dict(month=f'2026-{m:02d}', product=p, channel=ch, price=price, units=units,
                             revenue=units * price, ad_spend=ad, returns=ret))
pd.DataFrame(rows).to_csv(os.path.join(OUT, 'sales_2026.csv'), index=False, encoding='utf-8-sig')

pos = ['바삭하고 많이 달지 않아서 아침에 먹기 좋아요', '포장이 꼼꼼해서 선물하기 좋았습니다', '견과가 넉넉하게 들어 있어요', '재구매했어요. 아이들도 잘 먹네요', '배송이 빨랐어요', '부산 여행 때 매장에서 먹어 보고 주문했어요']
neg = ['생각보다 양이 적어요', '배송 중에 봉투가 터져서 왔어요', '조금 딱딱해서 우유에 오래 불려야 해요', '가격이 조금 부담됩니다', '유통기한이 짧게 남은 제품이 왔어요', '문의 답변이 늦었어요']
mid = ['무난해요', '맛은 괜찮은데 특별하진 않아요', '선물 세트 구성이 조금 더 다양했으면 해요']
rv = []
for i in range(120):
    p = products[rng.integers(0, 5)][0]; ch = channels[rng.integers(0, 3)]
    r = int(rng.choice([5, 5, 5, 4, 4, 4, 3, 2, 1]))
    txt = rng.choice(pos) if r >= 4 else (rng.choice(mid) if r == 3 else rng.choice(neg))
    rv.append(dict(review_id=f'R{i + 1:03d}', date=f'2026-{rng.integers(1, 10):02d}-{rng.integers(1, 29):02d}', product=p, channel=ch, rating=r, text=txt))
pd.DataFrame(rv).sort_values('date').to_csv(os.path.join(OUT, 'reviews_2026.csv'), index=False, encoding='utf-8-sig')
print(len(rows), 'sales rows,', len(rv), 'reviews')
