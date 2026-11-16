// 머신러닝 알고리즘 특강 · 그림과 '직접 해 보기' 데모
// 모든 데이터는 고정된 씨앗(seed)으로 만든 가짜 데이터라 새로 고쳐도 같은 그림이 나옵니다.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const txt = (parent, x, y, s, attrs) => { const t = el('text', Object.assign({ x, y }, attrs || {}), parent); t.textContent = s; return t; };
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const gauss = (r) => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };
  const COL = ['var(--accent)', 'var(--accent-2)'];
  const pct = (v) => Math.round(v * 100) + '%';
  let clipN = 0;

  // ── 좌표 평면 그리기 ──
  function frame(svg, o) {
    const W = o.W || 640, H = o.H || 400, P = Object.assign({ l: 56, r: 18, t: 14, b: 46 }, o.pad || {});
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';
    const [x0, x1] = o.xr, [y0, y1] = o.yr;
    const pw = W - P.l - P.r, ph = H - P.t - P.b;
    const X = (x) => P.l + (x - x0) / (x1 - x0) * pw;
    const Y = (y) => H - P.b - (y - y0) / (y1 - y0) * ph;
    const ix = (px) => x0 + (px - P.l) / pw * (x1 - x0);
    const iy = (py) => y0 + (H - P.b - py) / ph * (y1 - y0);
    const id = 'clip' + (++clipN);
    const cp = el('clipPath', { id }, el('defs', {}, svg));
    el('rect', { x: P.l, y: P.t, width: pw, height: ph }, cp);
    const g = el('g', {}, svg);
    (o.xt || []).forEach((v) => { el('line', { x1: X(v), x2: X(v), y1: P.t, y2: H - P.b, class: 'p-grid' }, g); if (!o.noTicks) txt(g, X(v), H - P.b + 20, o.xf ? o.xf(v) : v, { class: 'p-tick', 'text-anchor': 'middle' }); });
    (o.yt || []).forEach((v) => { el('line', { x1: P.l, x2: W - P.r, y1: Y(v), y2: Y(v), class: 'p-grid' }, g); if (!o.noTicks) txt(g, P.l - 8, Y(v) + 4, o.yf ? o.yf(v) : v, { class: 'p-tick', 'text-anchor': 'end' }); });
    el('line', { x1: P.l, x2: W - P.r, y1: H - P.b, y2: H - P.b, class: 'p-axis' }, g);
    el('line', { x1: P.l, x2: P.l, y1: P.t, y2: H - P.b, class: 'p-axis' }, g);
    if (o.xl) txt(g, P.l + pw / 2, H - 8, o.xl, { class: 'p-lab', 'text-anchor': 'middle' });
    if (o.yl) txt(g, 16, P.t + ph / 2, o.yl, { class: 'p-lab', 'text-anchor': 'middle', transform: `rotate(-90 16 ${P.t + ph / 2})` });
    const layer = (clip) => el('g', clip ? { 'clip-path': `url(#${id})` } : {}, svg);
    return { X, Y, ix, iy, W, H, P, pw, ph, layer, x0, x1, y0, y1 };
  }
  function svgPoint(svg, e) {
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  const pathOf = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');

  /* ════════ 1. 선형회귀 ════════ */
  const houses = (() => { const r = rng(7), a = []; for (let i = 0; i < 14; i++) { const x = 14 + r() * 30; a.push([x, 0.6 + 0.13 * x + gauss(r) * 0.45]); } return a; })();
  function ols(P) {
    const n = P.length; let sx = 0, sy = 0, sxx = 0, sxy = 0;
    P.forEach(([x, y]) => { sx += x; sy += y; sxx += x * x; sxy += x * y; });
    const den = n * sxx - sx * sx, m = den ? (n * sxy - sx * sy) / den : 0;
    return [m, (sy - m * sx) / n];
  }
  const mse = (P, m, b) => P.reduce((a, [x, y]) => a + (y - (m * x + b)) ** 2, 0) / P.length;

  // 설명용 그림
  (function () {
    const svg = $('linIllu'); if (!svg) return;
    const F = frame(svg, { W: 560, H: 380, xr: [10, 50], yr: [0, 9], xt: [10, 20, 30, 40, 50], yt: [0, 3, 6, 9], xl: '평수', yl: '가격 (억 원)' });
    const [m, b] = ols(houses), L = F.layer(true);
    houses.forEach(([x, y]) => el('line', { x1: F.X(x), x2: F.X(x), y1: F.Y(y), y2: F.Y(m * x + b), stroke: 'var(--accent-2)', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, L));
    el('line', { x1: F.X(10), y1: F.Y(m * 10 + b), x2: F.X(50), y2: F.Y(m * 50 + b), stroke: 'var(--accent)', 'stroke-width': 4, 'stroke-linecap': 'round' }, L);
    houses.forEach(([x, y]) => el('circle', { cx: F.X(x), cy: F.Y(y), r: 6.5, class: 'p-good', stroke: 'var(--surface)', 'stroke-width': 1.5 }, L));
  })();

  // 직접 해 보기 1
  (function () {
    const svg = $('d1'); if (!svg) return;
    const m = $('d1m'), b = $('d1b');
    const OUT = [17, 9.2];
    let user = [], outlier = false, F;
    const all = () => houses.concat(user, outlier ? [OUT] : []);
    function draw() {
      F = frame(svg, { xr: [10, 50], yr: [0, 10], xt: [10, 20, 30, 40, 50], yt: [0, 2, 4, 6, 8, 10], xl: '평수', yl: '가격 (억 원)' });
      const mm = +m.value, bb = +b.value, P = all(), L = F.layer(true);
      P.forEach(([x, y]) => el('line', { x1: F.X(x), x2: F.X(x), y1: F.Y(y), y2: F.Y(mm * x + bb), stroke: 'var(--accent-2)', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, L));
      el('line', { x1: F.X(10), y1: F.Y(mm * 10 + bb), x2: F.X(50), y2: F.Y(mm * 50 + bb), stroke: 'var(--accent)', 'stroke-width': 4, 'stroke-linecap': 'round' }, L);
      P.forEach(([x, y], i) => el('circle', { cx: F.X(x), cy: F.Y(y), r: 7, class: outlier && i === P.length - 1 ? 'p-bad' : 'p-good', stroke: 'var(--surface)', 'stroke-width': 1.5 }, L));
      if (outlier) txt(L, F.X(OUT[0]) + 12, F.Y(OUT[1]) + 5, '이상한 집', { class: 'p-lab' });
      $('d1mo').textContent = '1평당 ' + Math.round(mm * 10000).toLocaleString() + '만 원';
      $('d1bo').textContent = bb.toFixed(1) + '억';
      const e = mse(P, mm, bb), [om, ob] = ols(P), best = mse(P, om, ob);
      $('d1err').textContent = e.toFixed(2);
      $('d1best').textContent = best.toFixed(2);
      $('d1bar').style.width = Math.min(100, best / e * 100) + '%';
    }
    m.addEventListener('input', draw); b.addEventListener('input', draw);
    let anim = null;
    $('d1fit').addEventListener('click', () => {
      const [om, ob] = ols(all()), sm = +m.value, sb = +b.value, t0 = performance.now();
      cancelAnimationFrame(anim);
      const step = (t) => { const k = Math.min(1, (t - t0) / 700), e = 1 - (1 - k) ** 3; m.value = sm + (om - sm) * e; b.value = sb + (ob - sb) * e; draw(); if (k < 1) anim = requestAnimationFrame(step); };
      anim = requestAnimationFrame(step);
    });
    $('d1out').addEventListener('click', () => { outlier = !outlier; $('d1out').textContent = outlier ? '이상한 집 빼기' : '이상한 집 추가'; draw(); });
    $('d1reset').addEventListener('click', () => { user = []; outlier = false; $('d1out').textContent = '이상한 집 추가'; m.value = 0.05; b.value = 3; draw(); });
    svg.addEventListener('click', (e) => { const p = svgPoint(svg, e), x = F.ix(p.x), y = F.iy(p.y); if (x > 10 && x < 50 && y > 0 && y < 10) { user.push([x, y]); draw(); } });
    draw();
  })();

  /* ════════ 2. 다중회귀 집값 계산기 ════════ */
  (function () {
    const svg = $('d2'); if (!svg) return;
    const BASE = 1.5;
    const F = [
      { id: 'd2a', name: '평수', w: 0.12, unit: '평', wtxt: '1평당 +1,200만 원' },
      { id: 'd2s', name: '역까지 걷는 시간', w: -0.06, unit: '분', wtxt: '1분당 −600만 원' },
      { id: 'd2y', name: '지은 지', w: -0.05, unit: '년', wtxt: '1년당 −500만 원' },
      { id: 'd2f', name: '층', w: 0.03, unit: '층', wtxt: '1층당 +300만 원' }
    ];
    const won = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2) + '억';
    function draw() {
      svg.setAttribute('viewBox', '0 0 640 400'); svg.innerHTML = '';
      const L = 200, R = 620, max = 10, X = (v) => L + v / max * (R - L);
      for (let v = 0; v <= max; v += 2) { el('line', { x1: X(v), x2: X(v), y1: 10, y2: 360, class: 'p-grid' }, svg); txt(svg, X(v), 382, v + '억', { class: 'p-tick', 'text-anchor': 'middle' }); }
      const rows = [{ name: '기본값', sub: '모든 요인이 0일 때', v: BASE, base: true }].concat(F.map((f) => { const x = +$(f.id).value; $(f.id + 'o').textContent = x + f.unit; return { name: f.name + ' ' + x + f.unit, sub: f.wtxt, v: f.w * x }; }));
      let run = 0; const h = 46, gap = 12;
      rows.forEach((r, i) => {
        const y = 14 + i * (h + gap), a = run, z = run + r.v; run = z;
        txt(svg, 10, y + 21, r.name, { class: 'p-lab' });
        txt(svg, 10, y + 40, r.sub, { class: 'p-tick' });
        el('rect', { x: X(Math.min(a, z)), y: y + 6, width: Math.max(2, Math.abs(X(z) - X(a))), height: h - 12, rx: 6, fill: r.base ? 'var(--muted)' : r.v >= 0 ? 'var(--accent)' : 'var(--accent-2)', 'fill-opacity': r.base ? 0.5 : 0.85 }, svg);
        if (i < rows.length - 1) el('line', { x1: X(z), x2: X(z), y1: y + h - 6, y2: y + h + gap + 6, stroke: 'var(--muted)', 'stroke-dasharray': '3 3' }, svg);
        txt(svg, X(Math.max(a, z)) + 6, y + 29, r.base ? r.v.toFixed(2) + '억' : won(r.v), { class: 'p-tick', style: 'font-weight:700' });
      });
      const y = 14 + rows.length * (h + gap);
      txt(svg, 10, y + 24, '= 예상 가격', { class: 'p-lab' });
      el('rect', { x: X(0), y: y + 6, width: Math.max(2, X(Math.max(0, run)) - X(0)), height: h - 12, rx: 6, fill: 'var(--accent)' }, svg);
      $('d2price').textContent = run.toFixed(2) + '억';
    }
    F.forEach((f) => $(f.id).addEventListener('input', draw));
    draw();
  })();

  /* ════════ 3. 다항회귀 · 과적합 · 규제 ════════ */
  const poly = (() => {
    const r = rng(21), f = (x) => Math.sin(2 * Math.PI * x);
    const train = [], test = [];
    for (let i = 0; i < 12; i++) { const x = (i + 0.2 + r() * 0.6) / 12; train.push([x, f(x) + gauss(r) * 0.3]); }
    for (let i = 0; i < 60; i++) { const x = r(); test.push([x, f(x) + gauss(r) * 0.3]); }
    return { train, test };
  })();
  function polyfit(P, d, lam) {
    const n = d + 1, A = [], v = [];
    for (let i = 0; i < n; i++) { A.push(new Array(n).fill(0)); v.push(0); }
    P.forEach(([x, y]) => { const z = 2 * x - 1, pw = []; for (let k = 0, t = 1; k < n; k++, t *= z) pw.push(t); for (let i = 0; i < n; i++) { v[i] += pw[i] * y; for (let j = 0; j < n; j++) A[i][j] += pw[i] * pw[j]; } });
    for (let i = 1; i < n; i++) A[i][i] += lam;
    A[0][0] += 1e-12;
    for (let c = 0; c < n; c++) { // 가우스 소거
      let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
      [A[c], A[p]] = [A[p], A[c]]; [v[c], v[p]] = [v[p], v[c]];
      for (let i = c + 1; i < n; i++) { const k = A[i][c] / A[c][c]; for (let j = c; j < n; j++) A[i][j] -= k * A[c][j]; v[i] -= k * v[c]; }
    }
    const w = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) { let s = v[i]; for (let j = i + 1; j < n; j++) s -= A[i][j] * w[j]; w[i] = s / A[i][i]; }
    return (x) => { const z = 2 * x - 1; let s = 0; for (let k = n - 1; k >= 0; k--) s = s * z + w[k]; return s; };
  }
  const err = (P, f) => P.reduce((a, [x, y]) => a + (y - f(x)) ** 2, 0) / P.length;
  function drawPoly(svg, d, lam, showTest, small) {
    const F = frame(svg, small ? { W: 360, H: 230, pad: { l: 12, r: 12, t: 12, b: 12 }, xr: [0, 1], yr: [-2, 2], noTicks: true } : { xr: [0, 1], yr: [-2.2, 2.2], xt: [0, .25, .5, .75, 1], yt: [-2, -1, 0, 1, 2], xl: '입력', yl: '출력' });
    const f = polyfit(poly.train, d, lam), L = F.layer(true), pts = [];
    for (let i = 0; i <= 300; i++) { const x = i / 300; pts.push([F.X(x), F.Y(Math.max(-9, Math.min(9, f(x))))]); }
    if (showTest) poly.test.forEach(([x, y]) => el('circle', { cx: F.X(x), cy: F.Y(y), r: 5, fill: 'none', stroke: 'var(--muted)', 'stroke-width': 1.6 }, L));
    el('path', { d: pathOf(pts), fill: 'none', stroke: 'var(--accent-2)', 'stroke-width': small ? 3 : 3.5 }, L);
    poly.train.forEach(([x, y]) => el('circle', { cx: F.X(x), cy: F.Y(y), r: small ? 5.5 : 7, class: 'p-good', stroke: 'var(--surface)', 'stroke-width': 1.5 }, L));
    return f;
  }
  [['fit3a', 1], ['fit3b', 3], ['fit3c', 11]].forEach(([id, d]) => { if ($(id)) drawPoly($(id), d, 0, false, true); });
  (function () {
    const svg = $('d3'); if (!svg) return;
    const d = $('d3d'), reg = $('d3reg'), tst = $('d3test');
    const fmt = (v) => v > 9.99 ? '9.99+' : v.toFixed(2);
    function draw() {
      const deg = +d.value, lam = reg.checked ? 0.05 : 0;
      $('d3do').textContent = deg + '차' + (deg === 1 ? ' (직선)' : '');
      const f = drawPoly(svg, deg, lam, tst.checked, false);
      const tr = err(poly.train, f), te = err(poly.test, f);
      $('d3tr').textContent = fmt(tr); $('d3te').textContent = fmt(te);
      let s;
      if (tr > 0.2) s = '<b>과소적합</b> — 너무 단순해 연습 문제도 잘 못 맞힙니다.';
      else if (te > 0.25 && te > tr * 1.8) s = '<b>과적합</b> — 연습은 거의 완벽한데 실전이 나빠졌습니다. 점 사이에서 곡선이 출렁이는 곳을 보세요.' + (reg.checked ? '' : ' <b>규제</b>를 켜 보세요.');
      else s = '<b>적당함</b> — 연습과 실전 오차가 둘 다 낮고 비슷합니다.' + (reg.checked && deg > 6 ? ' 복잡한 모델이지만 규제가 얌전하게 잡아 줍니다.' : '');
      $('d3state').innerHTML = s;
    }
    [d, reg, tst].forEach((x) => x.addEventListener('input', draw));
    draw();
  })();

  /* ════════ 4. 로지스틱 회귀 ════════ */
  const study = (() => {
    const r = rng(5), a = [];
    for (let i = 0; i < 24; i++) { const x = 0.4 + r() * 9.2, p = 1 / (1 + Math.exp(-1.2 * (x - 5))); a.push([x, r() < p ? 1 : 0]); }
    let w = 0, b = 0;
    for (let it = 0; it < 6000; it++) { let gw = 0, gb = 0; a.forEach(([x, y]) => { const p = 1 / (1 + Math.exp(-(w * x + b))); gw += (p - y) * x; gb += p - y; }); w -= 0.02 * gw / a.length * 4; b -= 0.02 * gb / a.length * 4; }
    return { pts: a, p: (x) => 1 / (1 + Math.exp(-(w * x + b))), xAt: (t) => (Math.log(t / (1 - t)) - b) / w };
  })();
  function drawSig(svg, opts) {
    const F = frame(svg, Object.assign({ xr: [0, 10], yr: [-0.08, 1.08], xt: [0, 2, 4, 6, 8, 10], yt: [0, 0.5, 1], yf: (v) => pct(v), xl: '공부 시간', yl: '합격 확률' }, opts.frame || {}));
    const L = F.layer(true), pts = [];
    for (let i = 0; i <= 200; i++) { const x = i / 20; pts.push([F.X(x), F.Y(study.p(x))]); }
    return { F, L, pts };
  }
  (function () {
    const svg = $('sig'); if (!svg) return;
    const { F, L, pts } = drawSig(svg, { frame: { W: 560, H: 380 } });
    const xt = study.xAt(0.5);
    el('line', { x1: F.X(0), x2: F.X(10), y1: F.Y(0.5), y2: F.Y(0.5), class: 'p-line2' }, L);
    el('line', { x1: F.X(xt), x2: F.X(xt), y1: F.Y(-0.08), y2: F.Y(1.08), class: 'p-line2' }, L);
    el('path', { d: pathOf(pts), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 4 }, L);
    study.pts.forEach(([x, y]) => el('circle', { cx: F.X(x), cy: F.Y(y ? 1 : 0), r: 6.5, class: y ? 'p-good' : 'p-bad', stroke: 'var(--surface)', 'stroke-width': 1.5 }, L));
    txt(L, F.X(xt) + 8, F.Y(0.5) - 8, '기준 50%', { class: 'p-lab' });
    txt(L, F.X(9.8), F.Y(0.9), '합격(1)', { class: 'p-tick', 'text-anchor': 'end' });
    txt(L, F.X(0.2), F.Y(0.1), '불합격(0)', { class: 'p-tick' });
  })();
  (function () {
    const svg = $('d4'); if (!svg) return;
    const h = $('d4h'), t = $('d4t');
    function draw() {
      const { F, L, pts } = drawSig(svg, {});
      const th = +t.value, xt = study.xAt(th), hx = +h.value, hp = study.p(hx);
      el('rect', { x: F.X(Math.max(0, xt)), y: F.P.t, width: Math.max(0, F.X(10) - F.X(Math.max(0, xt))), height: F.ph, fill: 'var(--accent)', 'fill-opacity': 0.07 }, L);
      el('line', { x1: F.X(0), x2: F.X(10), y1: F.Y(th), y2: F.Y(th), class: 'p-line2' }, L);
      el('line', { x1: F.X(xt), x2: F.X(xt), y1: F.Y(-0.08), y2: F.Y(1.08), stroke: 'var(--text)', 'stroke-width': 2.5 }, L);
      txt(L, F.X(xt) + 8, F.Y(1.08) + 18, '→ 합격 판정', { class: 'p-lab' });
      txt(L, F.X(xt) - 8, F.Y(1.08) + 18, '불합격 판정 ←', { class: 'p-lab', 'text-anchor': 'end' });
      el('path', { d: pathOf(pts), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 4 }, L);
      let miss = 0, fa = 0;
      study.pts.forEach(([x, y]) => {
        const pred = study.p(x) >= th ? 1 : 0, cy = F.Y(y ? 1 : 0);
        el('circle', { cx: F.X(x), cy, r: 6.5, class: y ? 'p-good' : 'p-bad', stroke: 'var(--surface)', 'stroke-width': 1.5 }, L);
        if (pred !== y) { el('circle', { cx: F.X(x), cy, r: 12, class: 'p-wrong' }, L); if (y) miss++; else fa++; }
      });
      el('line', { x1: F.X(hx), x2: F.X(hx), y1: F.Y(0), y2: F.Y(hp), stroke: 'var(--text)', 'stroke-dasharray': '2 4' }, L);
      el('path', { class: 'star', d: `M${F.X(hx)} ${F.Y(hp) - 13} l4 9 10 1 -8 6 3 10 -9 -5 -9 5 3 -10 -8 -6 10 -1z` }, L);
      $('d4ho').textContent = hx.toFixed(1) + '시간'; $('d4to').textContent = pct(th);
      $('d4p').textContent = pct(hp);
      $('d4verdict').innerHTML = '기준 ' + pct(th) + ' → <b>' + (hp >= th ? '합격' : '불합격') + '</b>으로 판정';
      $('d4miss').textContent = miss + '명'; $('d4fa').textContent = fa + '명';
    }
    [h, t].forEach((x) => x.addEventListener('input', draw));
    draw();
  })();

  /* ════════ 5. KNN ════════ */
  const knnData = (() => { const r = rng(3), a = []; for (let i = 0; i < 56; i++) { const x = r() * 10, y = r() * 10; let c = y > 4.6 + 2.2 * Math.sin(x * 0.75) ? 1 : 0; if (r() < 0.1) c = 1 - c; a.push([x, y, c]); } return a; })();
  function knn(P, q, k) { return P.map((p) => [Math.hypot(p[0] - q[0], p[1] - q[1]), p]).sort((a, b) => a[0] - b[0]).slice(0, k); }
  (function () {
    const svg = $('d5'); if (!svg) return;
    const k = $('d5k'), reg = $('d5reg');
    let q = [5, 5], F;
    function draw() {
      const K = +k.value;
      F = frame(svg, { xr: [0, 10], yr: [0, 10], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6, 8, 10], xl: '특징 ①', yl: '특징 ②' });
      const L = F.layer(true);
      if (reg.checked) {
        const n = 50, m = 50, cw = F.pw / n, ch = F.ph / m;
        for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
          const x = (i + .5) / n * 10, y = (j + .5) / m * 10, nb = knn(knnData, [x, y], K), v = nb.reduce((a, b) => a + b[1][2], 0);
          el('rect', { x: F.P.l + i * cw, y: F.P.t + (m - 1 - j) * ch, width: cw + .6, height: ch + .6, fill: COL[v * 2 > K ? 1 : 0], 'fill-opacity': 0.13, 'shape-rendering': 'crispEdges' }, L);
        }
      }
      const nb = knn(knnData, q, K), rad = nb[nb.length - 1][0];
      el('ellipse', { cx: F.X(q[0]), cy: F.Y(q[1]), rx: rad / 10 * F.pw, ry: rad / 10 * F.ph, fill: 'none', stroke: 'var(--text)', 'stroke-width': 2, 'stroke-dasharray': '6 6' }, L);
      nb.forEach(([, p]) => el('line', { x1: F.X(q[0]), y1: F.Y(q[1]), x2: F.X(p[0]), y2: F.Y(p[1]), stroke: 'var(--text)', 'stroke-width': 1.5, opacity: .55 }, L));
      knnData.forEach(([x, y, c]) => el('circle', { cx: F.X(x), cy: F.Y(y), r: 6.5, fill: COL[c], stroke: 'var(--surface)', 'stroke-width': 1.5 }, L));
      nb.forEach(([, p]) => el('circle', { cx: F.X(p[0]), cy: F.Y(p[1]), r: 10, class: 'pick' }, L));
      el('path', { class: 'star', d: `M${F.X(q[0])} ${F.Y(q[1]) - 15} l5 10 11 1 -9 7 3 11 -10 -6 -10 6 3 -11 -9 -7 11 -1z` }, L);
      const vb = nb.reduce((a, b) => a + b[1][2], 0), va = K - vb;
      $('d5ko').textContent = K;
      $('d5votes').innerHTML = `<b class="ca">A ${va}표</b> : <b class="cb">B ${vb}표</b>`;
      $('d5res').innerHTML = vb > va ? '<span class="cb">B</span>로 판정' : '<span class="ca">A</span>로 판정';
    }
    [k, reg].forEach((x) => x.addEventListener('input', draw));
    svg.addEventListener('click', (e) => { const p = svgPoint(svg, e), x = F.ix(p.x), y = F.iy(p.y); if (x >= 0 && x <= 10 && y >= 0 && y <= 10) { q = [x, y]; draw(); } });
    draw();
  })();

  /* ════════ 6~7. 결정트리 · 랜덤 포레스트 ════════ */
  const blob = (() => {
    const r = rng(42), make = (n) => { const a = []; for (let i = 0; i < n; i++) { const x = r() * 10, y = r() * 10; let c = ((x - 5) / 4.2) ** 2 + ((y - 5) / 3.5) ** 2 < 1 ? 1 : 0; if (r() < 0.1) c = 1 - c; a.push([x, y, c]); } return a; };
    return { train: make(110), test: make(400) };
  })();
  const gini = (c, n) => { if (!n) return 0; const p = c / n; return 2 * p * (1 - p); };
  function buildTree(P, depth, maxD, pickFeat) {
    const n = P.length, c1 = P.reduce((a, p) => a + p[2], 0);
    const node = { n, c1, cls: c1 * 2 > n ? 1 : 0 };
    if (depth >= maxD || c1 === 0 || c1 === n || n < 2) return node;
    let best = null;
    for (const f of (pickFeat ? pickFeat() : [0, 1])) {
      const S = P.slice().sort((a, b) => a[f] - b[f]);
      let l1 = 0;
      for (let i = 1; i < n; i++) {
        l1 += S[i - 1][2];
        if (S[i][f] === S[i - 1][f]) continue;
        const imp = gini(l1, i) * i + gini(c1 - l1, n - i) * (n - i);
        if (!best || imp < best.imp - 1e-12) best = { imp, f, t: (S[i][f] + S[i - 1][f]) / 2 };
      }
    }
    if (!best || best.imp >= gini(c1, n) * n - 1e-12) return node;
    node.f = best.f; node.t = best.t;
    node.l = buildTree(P.filter((p) => p[best.f] < best.t), depth + 1, maxD, pickFeat);
    node.r = buildTree(P.filter((p) => p[best.f] >= best.t), depth + 1, maxD, pickFeat);
    return node;
  }
  const leafOf = (nd, p) => { while (nd.l) nd = p[nd.f] < nd.t ? nd.l : nd.r; return nd; };
  const acc = (P, pred) => P.reduce((a, p) => a + (pred(p) === p[2] ? 1 : 0), 0) / P.length;
  function countLeaves(nd) { return nd.l ? countLeaves(nd.l) + countLeaves(nd.r) : 1; }
  function drawRegions(L, F, nd, x0, x1, y0, y1, op) {
    if (nd.l) {
      if (nd.f === 0) { drawRegions(L, F, nd.l, x0, nd.t, y0, y1, op); drawRegions(L, F, nd.r, nd.t, x1, y0, y1, op); }
      else { drawRegions(L, F, nd.l, x0, x1, y0, nd.t, op); drawRegions(L, F, nd.r, x0, x1, nd.t, y1, op); }
      return;
    }
    el('rect', { x: F.X(x0), y: F.Y(y1), width: F.X(x1) - F.X(x0), height: F.Y(y0) - F.Y(y1), fill: COL[nd.cls], 'fill-opacity': op, stroke: 'var(--surface)', 'stroke-width': 0.8 }, L);
  }
  const blobFrame = (svg) => frame(svg, { xr: [0, 10], yr: [0, 10], xt: [0, 2, 4, 6, 8, 10], yt: [0, 2, 4, 6, 8, 10], xl: '특징 ①', yl: '특징 ②' });
  const dots = (L, F, P, hollow) => P.forEach(([x, y, c]) => el('circle', hollow ? { cx: F.X(x), cy: F.Y(y), r: 3.5, fill: 'none', stroke: COL[c], 'stroke-width': 1.4 } : { cx: F.X(x), cy: F.Y(y), r: 5.5, fill: COL[c], stroke: 'var(--surface)', 'stroke-width': 1.2 }, L));

  (function () {
    const svg = $('d6'); if (!svg) return;
    const d = $('d6d'), tst = $('d6test');
    const fname = ['특징 ①', '특징 ②'];
    function draw() {
      const D = +d.value, tree = buildTree(blob.train, 0, D);
      const F = blobFrame(svg), L = F.layer(true);
      drawRegions(L, F, tree, 0, 10, 0, 10, 0.2);
      dots(L, F, tst.checked ? blob.test : blob.train, tst.checked);
      const pred = (p) => leafOf(tree, p).cls;
      $('d6do').textContent = D;
      $('d6tr').textContent = pct(acc(blob.train, pred));
      $('d6te').textContent = pct(acc(blob.test, pred));
      const nl = countLeaves(tree);
      $('d6info').innerHTML = `잎(최종 그룹) <b>${nl}개</b> · 질문 <b>${nl - 1}개</b>` + (tree.l ? `<br>첫 질문: <b>${fname[tree.f]} &lt; ${tree.t.toFixed(1)}?</b>` : '');
    }
    [d, tst].forEach((x) => x.addEventListener('input', draw));
    draw();
  })();

  (function () {
    const svg = $('d7'); if (!svg) return;
    const N = $('d7n'), r = rng(99), trees = [];
    for (let k = 0; k < 60; k++) {
      const boot = []; for (let i = 0; i < blob.train.length; i++) boot.push(blob.train[Math.floor(r() * blob.train.length)]);
      trees.push(buildTree(boot, 0, 14, () => [r() < 0.5 ? 0 : 1]));
    }
    const single = buildTree(blob.train, 0, 14);
    const vote = (p, n) => { let s = 0; for (let k = 0; k < n; k++) s += leafOf(trees[k], p).cls; return s / n; };
    ['d7t1', 'd7t2', 'd7t3'].forEach((id, i) => {
      const F = frame($(id), { W: 110, H: 110, pad: { l: 2, r: 2, t: 2, b: 2 }, xr: [0, 10], yr: [0, 10], noTicks: true });
      drawRegions(F.layer(true), F, trees[i], 0, 10, 0, 10, 0.45);
    });
    $('d7one').textContent = pct(acc(blob.test, (p) => leafOf(single, p).cls));
    function draw() {
      const n = +N.value, F = blobFrame(svg), L = F.layer(true);
      if (n === 1) drawRegions(L, F, trees[0], 0, 10, 0, 10, 0.22);
      else {
        const g = 60, cw = F.pw / g, ch = F.ph / g;
        for (let i = 0; i < g; i++) for (let j = 0; j < g; j++) {
          const v = vote([(i + .5) / g * 10, (j + .5) / g * 10], n), c = v > 0.5 ? 1 : 0, conf = Math.abs(v - 0.5) * 2;
          el('rect', { x: F.P.l + i * cw, y: F.P.t + (g - 1 - j) * ch, width: cw + .6, height: ch + .6, fill: COL[c], 'fill-opacity': 0.06 + 0.3 * conf, 'shape-rendering': 'crispEdges' }, L);
        }
      }
      dots(L, F, blob.train, false);
      $('d7no').textContent = n + '그루';
      $('d7forest').textContent = pct(acc(blob.test, (p) => vote(p, n) > 0.5 ? 1 : 0));
    }
    N.addEventListener('input', draw);
    draw();
  })();

  /* ════════ 8. 그래디언트 부스팅 ════════ */
  (function () {
    const svg = $('d8'); if (!svg) return;
    const r = rng(8), P = [];
    for (let i = 0; i < 44; i++) { const x = 0.2 + r() * 9.6; P.push([x, 3 + 2 * Math.sin(x * 0.9) + 0.25 * x + gauss(r) * 0.35]); }
    P.sort((a, b) => a[0] - b[0]);
    const mean = P.reduce((a, p) => a + p[1], 0) / P.length;
    function regTree(xs, rs, depth) { // xs 정렬됨
      const n = xs.length, m = rs.reduce((a, b) => a + b, 0) / n;
      if (depth === 0 || n < 4) return () => m;
      let best = null, sl = 0, sq = 0;
      const tot = rs.reduce((a, b) => a + b, 0), totq = rs.reduce((a, b) => a + b * b, 0);
      for (let i = 1; i < n; i++) {
        sl += rs[i - 1]; sq += rs[i - 1] ** 2;
        if (i < 2 || n - i < 2) continue;
        const sse = (sq - sl * sl / i) + (totq - sq - (tot - sl) ** 2 / (n - i));
        if (!best || sse < best.sse) best = { sse, i };
      }
      if (!best) return () => m;
      const t = (xs[best.i - 1] + xs[best.i]) / 2;
      const L = regTree(xs.slice(0, best.i), rs.slice(0, best.i), depth - 1), R = regTree(xs.slice(best.i), rs.slice(best.i), depth - 1);
      return (x) => x < t ? L(x) : R(x);
    }
    let models = [], prevF = null;
    const lr = $('d8lr');
    const predict = (x, ms) => ms.reduce((a, m) => a + m.lr * m.f(x), mean);
    function add(k) {
      prevF = models.slice();
      for (let j = 0; j < k; j++) {
        const xs = P.map((p) => p[0]), rs = P.map((p) => p[1] - predict(p[0], models));
        models.push({ f: regTree(xs, rs, 2), lr: +lr.value });
      }
      draw();
    }
    function curve(F, ms) { const pts = []; for (let i = 0; i <= 400; i++) { const x = i / 40; pts.push([F.X(x), F.Y(predict(x, ms))]); } return pathOf(pts); }
    function draw() {
      const F = frame(svg, { xr: [0, 10], yr: [0, 9], xt: [0, 2, 4, 6, 8, 10], yt: [0, 3, 6, 9], xl: '입력', yl: '출력' }), L = F.layer(true);
      P.forEach(([x, y]) => el('line', { x1: F.X(x), x2: F.X(x), y1: F.Y(y), y2: F.Y(predict(x, models)), stroke: 'var(--accent-2)', 'stroke-width': 2, 'stroke-dasharray': '3 3' }, L));
      if (prevF && models.length) el('path', { d: curve(F, prevF), fill: 'none', stroke: 'var(--muted)', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, L);
      el('path', { d: curve(F, models), fill: 'none', stroke: 'var(--accent-2)', 'stroke-width': 4 }, L);
      P.forEach(([x, y]) => el('circle', { cx: F.X(x), cy: F.Y(y), r: 6, class: 'p-good', stroke: 'var(--surface)', 'stroke-width': 1.5 }, L));
      $('d8lro').textContent = (+lr.value).toFixed(1);
      $('d8n').textContent = models.length;
      $('d8err').textContent = (P.reduce((a, [x, y]) => a + (y - predict(x, models)) ** 2, 0) / P.length).toFixed(2);
    }
    $('d8add1').addEventListener('click', () => add(1));
    $('d8add10').addEventListener('click', () => add(10));
    $('d8reset').addEventListener('click', () => { models = []; prevF = null; draw(); });
    lr.addEventListener('input', draw);
    draw();
  })();

  /* ════════ 9. 다수결 (집단지성) ════════ */
  (function () {
    const svg = $('d9'); if (!svg) return;
    const N = $('d9n'), Pp = $('d9p'), R = $('d9r');
    let live = rng(Date.now() % 100000);
    function trial(n, p, rho, r) { // 모델마다 정확도 p, rho 확률로 '공통 의견'을 따라감
      const lead = r() < p, v = [];
      for (let i = 0; i < n; i++) v.push(r() < rho ? lead : r() < p);
      return v;
    }
    function draw(reroll) {
      const n = +N.value, p = +Pp.value, rho = +R.value;
      $('d9no').textContent = n + '개'; $('d9po').textContent = pct(p); $('d9ro').textContent = pct(rho);
      const r = rng(1234); let ok = 0; const T = 6000;
      for (let t = 0; t < T; t++) { const v = trial(n, p, rho, r); let c = 0; for (const x of v) c += x; if (c * 2 > n) ok++; }
      $('d9single').textContent = pct(p); $('d9group').textContent = pct(ok / T);
      if (reroll) live = rng(Math.floor(Math.random() * 1e6));
      const v = trial(n, p, rho, live), cols = 13, sz = 44, rows = Math.ceil(n / cols);
      svg.setAttribute('viewBox', `0 0 ${cols * sz} ${Math.max(4, rows) * sz}`); svg.innerHTML = '';
      v.forEach((x, i) => {
        const cx = (i % cols) * sz + sz / 2, cy = Math.floor(i / cols) * sz + sz / 2;
        el('rect', { x: cx - 17, y: cy - 14, width: 34, height: 28, rx: 8, fill: x ? 'var(--accent)' : 'var(--bad)' }, svg);
        el('circle', { cx: cx - 7, cy: cy - 2, r: 3.5, fill: 'var(--surface)' }, svg); el('circle', { cx: cx + 7, cy: cy - 2, r: 3.5, fill: 'var(--surface)' }, svg);
        el('line', { x1: cx, x2: cx, y1: cy - 14, y2: cy - 20, stroke: x ? 'var(--accent)' : 'var(--bad)', 'stroke-width': 3 }, svg);
      });
      const c = v.reduce((a, b) => a + b, 0);
      $('d9vote').innerHTML = `맞힘 <b>${c}</b> · 틀림 <b>${n - c}</b> → 다수결 결과: ` + (c * 2 > n ? '<b class="ca">정답</b>' : '<b style="color:var(--bad)">오답</b>');
    }
    [N, Pp, R].forEach((x) => x.addEventListener('input', () => draw(false)));
    $('d9roll').addEventListener('click', () => draw(true));
    draw(true);
  })();
})();
