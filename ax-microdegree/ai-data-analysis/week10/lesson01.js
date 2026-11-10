// 10주 1차시 전용: 강도 맞혀 보기, 산점도, 잔차 확인, 직선 맞추기(최소제곱), 회귀·분류 카드
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);
  const f1 = (v) => v.toFixed(1), f2 = (v) => v.toFixed(2);
  const sgn = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  /* ───────── 데이터: process.csv 에서 고른 제품 40개 (df.sample(40, random_state=1)) — [압력 bar, 강도 MPa] ───────── */
  const S40 = [[80.5,41.66],[78.1,39.25],[83.7,40.85],[76.5,38.64],[86.4,41.15],[81.9,39.34],[79.1,39.14],[79.0,41.12],[78.4,38.88],[85.4,38.74],[88.8,39.28],[82.1,42.94],[74.4,34.69],[62.0,28.85],[87.0,42.34],[82.1,39.24],[85.4,43.0],[84.7,39.43],[91.6,43.87],[75.2,38.46],[82.1,37.97],[78.8,41.2],[89.2,43.08],[68.2,37.02],[76.4,37.99],[81.4,41.0],[87.5,43.32],[80.9,39.97],[81.1,40.21],[85.2,42.73],[80.5,43.24],[87.0,42.02],[83.4,38.31],[85.0,40.04],[89.5,41.8],[76.3,37.87],[80.6,39.45],[84.1,39.46],[80.8,40.75],[81.2,33.94]];
  const IDS = ['P00356','P00108','P00166','P00198','P00457','P00165','P00464','P00174','P00035','P00326','P00068','P00086','P00261','P00231','P00486','P00323','P00367','P00327','P00160','P00214','P00359','P00032','P00366','P00285','P00193','P00129','P00451','P00437','P00143','P00307','P00186','P00190','P00274','P00005','P00292','P00335','P00390','P00290','P00246','P00234'];
  // 제품 40개의 최소제곱 직선 (scikit-learn LinearRegression 결과)
  const BEST = { a: 0.37180361, b: 9.49006309 };
  // process.csv 전체 494개 [압력, 강도]
  const ALL = [[68.6,34.57],[84.3,41.44],[83.3,42.13],[90.9,42.05],[85.0,40.04],[81.2,42.38],[75.1,33.96],[79.9,40.32],[74.2,39.07],[69.6,35.98],[87.7,41.0],[72.6,36.96],[72.3,33.72],[68.3,35.93],[82.9,37.98],[90.0,44.62],[86.2,43.03],[67.8,32.84],[74.1,32.22],[89.3,41.99],[74.9,35.42],[97.5,46.68],[74.7,36.75],[88.6,43.26],[75.6,37.11],[77.8,38.24],[81.2,41.94],[82.5,41.09],[80.6,38.63],[80.4,37.48],[76.6,37.46],[78.8,41.2],[84.6,41.97],[73.3,35.02],[78.4,38.88],[71.3,36.07],[67.5,36.35],[79.2,39.47],[80.2,40.56],[82.7,39.27],[79.3,37.72],[86.5,42.88],[78.4,38.92],[80.5,38.59],[78.6,40.99],[82.3,41.23],[77.6,33.91],[79.2,39.06],[91.1,41.53],[81.6,40.0],[75.0,41.22],[82.6,35.55],[81.7,41.93],[88.8,39.01],[70.8,38.83],[75.3,38.46],[82.9,40.15],[75.8,35.66],[84.4,39.38],[74.9,38.03],[76.2,38.33],[80.0,38.72],[82.4,38.5],[71.7,32.57],[82.6,40.13],[73.1,36.45],[74.9,34.65],[88.8,39.28],[87.6,43.46],[80.2,39.27],[85.6,42.13],[91.0,41.86],[81.6,39.73],[85.5,42.93],[68.6,34.91],[73.1,33.96],[87.7,42.1],[80.7,40.07],[79.4,38.5],[85.5,41.75],[84.9,42.92],[78.4,39.07],[78.9,36.81],[83.8,39.82],[80.1,40.99],[82.1,42.94],[81.2,38.64],[75.2,38.06],[71.5,36.8],[79.1,39.17],[77.0,35.19],[92.2,42.68],[74.9,32.72],[83.4,39.76],[77.4,39.1],[93.3,41.7],[88.8,39.91],[91.9,43.92],[86.5,43.73],[73.8,32.55],[91.4,44.03],[89.1,43.33],[79.5,38.38],[89.3,44.9],[76.3,36.94],[88.0,39.49],[79.3,38.19],[78.1,39.25],[84.3,42.05],[71.2,33.09],[85.7,38.38],[80.1,35.77],[76.0,37.72],[83.9,34.3],[90.4,40.13],[67.6,34.6],[90.1,43.93],[87.3,42.54],[87.6,37.65],[87.0,43.8],[81.5,38.73],[68.7,36.02],[82.3,40.1],[67.5,33.3],[75.1,37.85],[81.1,37.99],[81.6,36.81],[79.0,39.82],[81.4,41.0],[84.6,37.91],[88.4,42.67],[70.0,33.38],[71.7,31.7],[83.5,41.3],[84.1,40.71],[72.1,35.09],[82.6,42.39],[82.2,40.34],[75.1,36.75],[85.2,43.35],[72.3,36.27],[81.8,40.47],[81.1,40.21],[84.2,39.39],[79.2,40.72],[71.2,36.13],[74.9,38.08],[76.3,38.04],[71.8,34.3],[85.9,38.21],[85.0,43.14],[72.1,34.64],[76.1,37.58],[73.7,39.07],[80.8,34.98],[76.9,38.18],[76.2,39.28],[77.3,37.39],[80.3,39.31],[91.6,43.87],[95.1,43.81],[73.4,38.74],[80.3,41.36],[81.9,43.74],[81.9,39.34],[83.7,40.85],[82.2,39.42],[77.2,38.19],[75.3,39.61],[80.6,28.48],[74.1,35.48],[74.9,36.5],[81.3,35.95],[79.0,41.12],[81.5,36.85],[78.1,41.87],[86.6,39.34],[90.5,44.69],[74.7,39.38],[73.9,37.96],[82.6,38.93],[84.1,40.44],[77.3,39.99],[74.4,39.41],[77.3,38.48],[80.5,43.24],[77.5,37.94],[74.3,35.68],[85.0,39.75],[87.0,42.02],[78.4,36.01],[87.0,40.9],[76.4,37.99],[66.7,35.95],[70.6,34.21],[78.6,40.06],[75.4,34.67],[76.5,38.64],[84.3,40.55],[80.3,37.88],[84.1,42.27],[81.7,41.38],[77.0,36.08],[79.7,36.16],[81.6,41.43],[73.9,38.34],[75.6,31.56],[77.2,35.91],[89.6,43.25],[79.9,40.79],[70.4,36.3],[73.9,26.64],[84.0,40.56],[75.2,38.46],[66.3,32.84],[84.2,43.58],[73.7,37.82],[76.0,38.61],[84.1,39.75],[86.9,43.59],[75.2,37.19],[96.9,44.25],[81.5,39.02],[79.1,37.28],[82.2,39.35],[86.8,39.15],[83.4,40.42],[86.5,38.89],[92.5,41.62],[82.0,42.79],[62.0,28.85],[74.9,38.45],[68.7,36.95],[81.2,33.94],[78.9,36.56],[88.1,44.23],[73.9,37.59],[69.5,34.85],[79.0,35.64],[82.9,42.5],[80.4,40.78],[75.0,38.02],[79.5,37.74],[86.9,41.81],[94.0,44.49],[80.8,40.75],[78.2,36.06],[82.8,35.77],[74.2,39.37],[88.1,41.27],[92.4,43.55],[80.8,41.24],[81.6,40.23],[84.0,38.06],[72.0,36.02],[82.0,38.37],[72.7,32.95],[77.9,36.31],[84.6,43.65],[80.7,37.2],[74.4,34.69],[77.6,38.44],[74.7,37.88],[83.7,39.75],[68.6,34.59],[76.9,36.34],[77.5,38.2],[83.9,42.17],[73.2,36.83],[81.0,38.98],[86.0,43.65],[79.1,36.21],[74.3,36.03],[83.4,38.31],[75.4,35.58],[87.6,41.99],[79.0,32.43],[86.7,41.64],[73.0,34.45],[82.2,40.35],[89.9,42.43],[90.6,43.82],[86.7,40.59],[79.8,35.02],[68.2,37.02],[75.4,39.06],[80.1,40.19],[83.9,41.26],[78.1,36.63],[84.1,39.46],[74.6,38.39],[89.5,41.8],[80.0,44.66],[83.3,35.88],[89.9,34.28],[77.0,39.4],[69.8,37.0],[88.5,40.52],[78.8,36.02],[81.9,39.94],[81.1,40.93],[76.4,38.04],[87.7,45.16],[82.4,41.07],[87.7,40.38],[76.2,38.1],[85.2,42.73],[79.0,36.66],[83.6,39.06],[84.0,41.79],[81.0,36.52],[90.3,40.64],[82.2,42.16],[84.7,36.72],[86.7,46.17],[88.2,43.06],[74.5,36.86],[78.2,38.16],[89.7,40.74],[72.4,33.38],[79.4,39.49],[82.8,38.01],[82.1,39.24],[84.9,43.07],[67.0,33.26],[85.4,38.74],[84.7,39.43],[75.4,36.82],[68.7,35.38],[89.0,36.03],[74.1,36.58],[75.2,37.87],[81.4,38.79],[80.7,40.13],[76.3,37.87],[75.3,40.13],[80.4,39.12],[66.8,33.32],[75.2,36.93],[87.0,42.44],[87.7,43.55],[82.9,42.78],[82.9,41.75],[87.7,36.17],[75.0,37.14],[76.5,37.15],[80.6,41.03],[70.8,36.14],[78.0,39.52],[82.3,37.94],[76.9,41.11],[83.4,43.72],[79.9,37.19],[83.0,41.08],[72.5,36.2],[80.5,41.66],[75.4,35.89],[81.9,41.15],[82.1,37.97],[76.7,35.07],[95.0,42.09],[86.1,42.03],[78.4,33.69],[83.9,40.41],[85.6,41.15],[89.2,43.08],[85.4,43.0],[80.3,35.83],[84.3,41.45],[73.2,39.02],[84.4,40.28],[77.7,35.02],[84.7,31.54],[81.0,36.74],[87.0,40.53],[88.6,41.06],[83.2,40.3],[86.8,36.17],[81.6,36.85],[85.0,38.02],[73.8,37.31],[87.5,40.96],[80.1,39.09],[79.8,41.5],[89.8,40.51],[82.3,41.57],[76.4,31.5],[90.7,43.06],[85.6,39.05],[80.6,39.45],[83.6,34.06],[85.4,43.37],[85.5,41.01],[94.7,42.12],[88.3,42.85],[88.1,41.83],[88.1,43.83],[69.0,32.04],[70.6,32.02],[77.3,41.02],[82.2,37.66],[83.7,41.2],[74.8,37.27],[77.6,37.79],[79.0,35.35],[74.8,35.08],[68.3,31.92],[79.2,36.68],[71.8,39.53],[71.4,35.39],[87.6,40.88],[83.9,39.2],[76.6,37.73],[81.8,42.12],[80.2,43.12],[77.5,36.42],[83.8,41.17],[83.3,40.96],[82.6,37.05],[76.5,36.29],[75.8,37.51],[75.0,33.2],[74.9,35.31],[78.9,38.56],[67.1,34.02],[88.5,39.28],[81.6,37.26],[89.0,44.22],[82.0,36.24],[78.1,38.52],[86.5,40.91],[86.3,42.28],[69.3,31.71],[81.1,39.39],[96.4,40.0],[74.4,39.32],[80.9,39.97],[74.8,39.96],[79.7,37.82],[87.2,40.35],[81.8,40.2],[84.7,32.52],[72.3,37.05],[75.3,36.51],[81.2,41.45],[79.6,39.09],[85.4,43.13],[71.2,30.42],[79.9,40.01],[88.1,40.97],[87.5,43.32],[79.6,31.77],[83.4,39.95],[80.7,40.72],[79.3,39.01],[78.7,36.86],[86.4,41.15],[80.9,38.16],[85.1,41.31],[81.2,40.13],[82.5,38.62],[90.7,40.15],[74.5,36.82],[79.1,39.14],[77.3,40.0],[80.6,38.99],[79.3,42.02],[79.3,40.29],[73.6,37.78],[81.6,37.58],[89.1,40.29],[81.4,38.41],[84.4,33.89],[82.3,39.14],[80.2,38.72],[74.7,31.94],[66.9,35.73],[68.4,31.32],[75.2,40.88],[87.1,38.41],[88.1,42.13],[77.4,39.19],[79.7,37.03],[75.4,39.6],[65.1,34.67],[87.0,42.34],[77.4,38.05],[76.3,38.86],[73.9,33.46],[83.3,40.95],[79.4,36.92],[77.5,40.09],[76.5,37.16],[84.3,41.45]];

  /* ───────── 산점도 공통 ───────── */
  function frame(svg, o) {
    const W = o.W || 620, H = o.H || 430;
    const L = o.L || 62, R = W - (o.r || 18), T = o.T || 16, B = H - (o.b || 56);
    const sx = (x) => L + (x - o.x0) / (o.x1 - o.x0) * (R - L);
    const sy = (y) => B - (y - o.y0) / (o.y1 - o.y0) * (B - T);
    svg.innerHTML = '';
    const id = svg.id + '-clip';
    const cp = el('clipPath', { id }, svg); el('rect', { x: L, y: T, width: R - L, height: B - T }, cp);
    o.yt.forEach((v) => {
      el('line', { x1: L, x2: R, y1: sy(v), y2: sy(v), class: 'p-grid' }, svg);
      el('text', { x: L - 10, y: sy(v) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = v;
    });
    o.xt.forEach((v) => {
      el('line', { x1: sx(v), x2: sx(v), y1: T, y2: B, class: 'p-grid' }, svg);
      el('text', { x: sx(v), y: B + 20, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = v;
    });
    el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis' }, svg);
    el('line', { x1: L, x2: L, y1: T, y2: B, class: 'p-axis' }, svg);
    el('text', { x: (L + R) / 2, y: B + 44, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = o.xl;
    el('text', { x: 16, y: (T + B) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 16 ${(T + B) / 2})` }, svg).textContent = o.yl;
    const clip = el('g', { 'clip-path': `url(#${id})` }, svg);
    return { svg, sx, sy, L, R, T, B, clip };
  }
  const AX = { x0: 60, x1: 95, y0: 26, y1: 48, xt: [60, 65, 70, 75, 80, 85, 90, 95], yt: [28, 32, 36, 40, 44, 48], xl: '압력 (bar) →', yl: '인장강도 (MPa) →' };
  const sse = (a, b) => S40.reduce((s, [x, y]) => s + (y - (a * x + b)) ** 2, 0);

  /* ───────── 1) 도입: 압력만 보고 강도 맞혀 보기 ───────── */
  (function guess() {
    const svg = $('gs-plot'); if (!svg) return;
    const P = frame(svg, AX);
    const r = rng(10);
    const order = S40.map((v, i) => ({ i, k: r() })).sort((a, b) => a.k - b.k).map((o) => o.i);
    const ref = order.slice(0, 15), quiz = order.slice(15);
    const refG = el('g', {}, svg), doneG = el('g', {}, svg), curG = el('g', {}, svg);
    ref.forEach((i) => el('circle', { cx: P.sx(S40[i][0]), cy: P.sy(S40[i][1]), r: 6, fill: 'var(--muted)', 'fill-opacity': 0.45 }, refG));
    el('text', { x: P.R - 8, y: P.T + 20, 'text-anchor': 'end', class: 'p-tick', style: 'font-weight:700' }, svg).textContent = '회색 점 = 이미 측정한 제품 15개';
    const s = $('gs-s');
    let q = 0, checked = false, errs = [];
    function showCur() {
      const i = quiz[q % quiz.length];
      $('gs-id').textContent = '제품 ' + IDS[i] + ' · 강도는?';
      $('gs-p').textContent = '압력 ' + f1(S40[i][0]) + ' bar';
      curG.innerHTML = '';
      const x = P.sx(S40[i][0]);
      el('line', { x1: x, x2: x, y1: P.T, y2: P.B, stroke: 'var(--accent)', 'stroke-width': 2, 'stroke-dasharray': '5 5' }, curG);
      const g = +s.value;
      el('circle', { cx: x, cy: P.sy(g), r: 8, fill: 'none', stroke: 'var(--accent-2)', 'stroke-width': 3 }, curG);
      $('gs-o').textContent = f1(g) + ' MPa';
    }
    function check() {
      if (checked) return;
      checked = true;
      const i = quiz[q % quiz.length], g = +s.value, y = S40[i][1], x = P.sx(S40[i][0]);
      const e = Math.abs(y - g); errs.push(e);
      curG.innerHTML = '';
      el('line', { x1: x, x2: x, y1: P.sy(g), y2: P.sy(y), stroke: 'var(--accent-2)', 'stroke-width': 2 }, doneG);
      el('circle', { cx: x, cy: P.sy(g), r: 7, fill: 'none', stroke: 'var(--accent-2)', 'stroke-width': 2.5 }, doneG);
      el('circle', { cx: x, cy: P.sy(y), r: 7, class: 'p-good' }, doneG);
      const avg = errs.reduce((a, b) => a + b, 0) / errs.length;
      $('gs-n').textContent = errs.length + '개';
      $('gs-e').textContent = f1(avg) + ' MPa';
      $('gs-check').disabled = true;
      $('gs-msg').innerHTML = `실제 강도는 <strong>${f2(y)} MPa</strong> — 내 예상과 <strong>${f1(e)} MPa</strong> 차이.` +
        (errs.length >= 3 ? ' 머릿속에 그은 <strong>“압력 ↑ → 강도 ↑” 경향선</strong>이 곧 예측 규칙입니다.' : ' 다음 제품도 해 보세요.');
    }
    s.addEventListener('input', () => { if (!checked) showCur(); });
    $('gs-check').addEventListener('click', check);
    $('gs-next').addEventListener('click', () => { q++; checked = false; $('gs-check').disabled = false; showCur(); });
    showCur();
  })();

  /* ───────── 2) 전체 494개 산점도 ───────── */
  (function all() {
    const svg = $('sc-all'); if (!svg || typeof ALL === 'undefined') return;
    const P = frame(svg, { ...AX, W: 640, H: 420, x0: 60, x1: 100, xt: [60, 65, 70, 75, 80, 85, 90, 95, 100], y0: 26, y1: 48 });
    ALL.forEach(([x, y]) => el('circle', { cx: P.sx(x), cy: P.sy(y), r: 4.2, class: 'p-good', 'fill-opacity': 0.45 }, svg));
  })();

  /* ───────── 3) 잔차 확인 ───────── */
  (function resid() {
    const svg = $('rs-plot'); if (!svg) return;
    const P = frame(svg, AX);
    const A = 0.36, Bc = 10.0, f = (x) => A * x + Bc;
    el('line', { x1: P.sx(60), y1: P.sy(f(60)), x2: P.sx(95), y2: P.sy(f(95)), class: 'p-line' }, P.clip);
    const lines = el('g', {}, svg), sel = el('g', {}, svg), pts = el('g', {}, svg);
    S40.forEach(([x, y]) => el('line', { x1: P.sx(x), x2: P.sx(x), y1: P.sy(y), y2: P.sy(f(x)), stroke: 'var(--accent-2)', 'stroke-opacity': 0.3, 'stroke-width': 1.5 }, lines));
    let cur = -1;
    function pick(i) {
      cur = i;
      const [x, y] = S40[i], p = f(x), rr = y - p;
      sel.innerHTML = '';
      el('line', { x1: P.sx(x), x2: P.sx(x), y1: P.sy(y), y2: P.sy(p), stroke: 'var(--accent-2)', 'stroke-width': 4 }, sel);
      el('circle', { cx: P.sx(x), cy: P.sy(p), r: 6, fill: 'var(--surface)', stroke: 'var(--accent-2)', 'stroke-width': 3 }, sel);
      el('circle', { cx: P.sx(x), cy: P.sy(y), r: 12, fill: 'none', stroke: 'var(--text)', 'stroke-width': 2 }, sel);
      const tx = P.sx(x) + (x > 85 ? -14 : 14);
      el('text', { x: tx, y: (P.sy(y) + P.sy(p)) / 2 + 5, 'text-anchor': x > 85 ? 'end' : 'start', class: 'p-tick', style: 'font-weight:800;font-size:15px;fill:var(--accent-2)' }, sel).textContent = '잔차 ' + sgn(rr);
      $('rs-id').textContent = '제품 ' + IDS[i];
      $('rs-p').textContent = '압력 ' + f1(x) + ' bar';
      $('rs-ic').innerHTML = '<svg class="ic"><use href="#i-gauge"/></svg>';
      $('rs-y').textContent = f2(y);
      $('rs-f').textContent = f2(p);
      $('rs-r').textContent = sgn(rr);
      $('rs-msg').innerHTML = rr >= 0
        ? `실제가 예측보다 <strong>${f2(rr)} MPa 높다</strong> → 점이 직선 <strong>위</strong>, 잔차 <strong>+</strong>.`
        : `실제가 예측보다 <strong>${f2(-rr)} MPa 낮다</strong> → 점이 직선 <strong>아래</strong>, 잔차 <strong>−</strong>.`;
      pts.querySelectorAll('circle').forEach((c, j) => c.setAttribute('r', j === i ? 8 : 6));
    }
    S40.forEach(([x, y], i) => {
      const c = el('circle', { cx: P.sx(x), cy: P.sy(y), r: 6, class: 'p-good pt', tabindex: 0, role: 'button', 'aria-label': IDS[i] + ' 잔차 보기' }, pts);
      c.addEventListener('click', () => pick(i));
      c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(i); } });
    });
    el('text', { x: P.R - 8, y: P.B - 12, 'text-anchor': 'end', class: 'p-tick', style: 'font-weight:700;fill:var(--accent-2)' }, svg).textContent = '예측 직선';
  })();

  /* ───────── 4) 직선 맞추기: 오차 제곱합 줄이기 ───────── */
  (function fit() {
    const svg = $('fit-plot'); if (!svg) return;
    const P = frame(svg, AX);
    const XL = 64, XR = 93;                     // 손잡이 위치(압력)
    const sa = $('fit-a'), sc = $('fit-c'), bsq = $('fit-sq');
    const sqG = el('g', {}, P.clip), resG = el('g', {}, P.clip);
    const line = el('line', { class: 'p-line', 'stroke-width': 4 }, P.clip);
    const ptsG = el('g', {}, svg);
    const eqT = el('text', { x: P.L + 14, y: P.T + 26, class: 'p-lab', style: 'font-size:19px;fill:var(--accent-2)' }, svg);
    S40.forEach(([x, y]) => el('circle', { cx: P.sx(x), cy: P.sy(y), r: 6, class: 'p-good' }, ptsG));
    const ghost = el('line', { class: 'p-line2', opacity: 0 }, P.clip);
    const hL = el('circle', { r: 11, class: 'handle', tabindex: 0, 'aria-label': '직선 왼쪽 손잡이' }, svg);
    const hR = el('circle', { r: 11, class: 'handle', tabindex: 0, 'aria-label': '직선 오른쪽 손잡이' }, svg);
    const START = { a: 0.10, c: 38.0 };
    const SSE0 = sse(START.a, START.c - 80 * START.a);
    const SSEmin = sse(BEST.a, BEST.b);
    let a = START.a, c = START.c, myBest = Infinity, anim = null, found = false;
    function render() {
      const b = c - 80 * a, v = sse(a, b);
      line.setAttribute('x1', P.sx(55)); line.setAttribute('y1', P.sy(a * 55 + b));
      line.setAttribute('x2', P.sx(100)); line.setAttribute('y2', P.sy(a * 100 + b));
      hL.setAttribute('cx', P.sx(XL)); hL.setAttribute('cy', P.sy(a * XL + b));
      hR.setAttribute('cx', P.sx(XR)); hR.setAttribute('cy', P.sy(a * XR + b));
      resG.innerHTML = ''; sqG.innerHTML = '';
      const showSq = bsq.getAttribute('aria-pressed') === 'true';
      S40.forEach(([x, y]) => {
        const px = P.sx(x), py = P.sy(y), pf = P.sy(a * x + b);
        el('line', { x1: px, x2: px, y1: py, y2: pf, class: 'resid', 'stroke-opacity': 0.75 }, resG);
        if (showSq) { const d = Math.abs(pf - py); el('rect', { x: px, y: Math.min(py, pf), width: d, height: d, class: 'sq' }, sqG); }
      });
      eqT.textContent = `강도 = ${f2(a)} × 압력 ${b >= 0 ? '+' : '−'} ${f1(Math.abs(b))}`;
      $('fit-a-o').textContent = f2(a); $('fit-c-o').textContent = f1(c) + ' MPa';
      $('fit-sse').textContent = f1(v);
      $('fit-bar').style.width = Math.min(100, v / SSE0 * 100) + '%';
      if (!anim && !found) {
        if (v < myBest) myBest = v;
        $('fit-msg').innerHTML = v - SSEmin < 3
          ? `<strong style="color:var(--ok)">거의 최소입니다!</strong> 내 최고 기록 ${f1(myBest)}. 이제 컴퓨터의 답과 비교해 보세요.`
          : `내 최고 기록: <strong>${f1(myBest)}</strong>. 직선 양 끝의 동그라미를 끌어도 됩니다.`;
      }
    }
    function setFromSliders() { a = +sa.value; c = +sc.value; render(); }
    function syncSliders() { sa.value = a; sc.value = c; }
    sa.addEventListener('input', () => { found = false; setFromSliders(); });
    sc.addEventListener('input', () => { found = false; setFromSliders(); });
    bsq.addEventListener('click', () => { bsq.setAttribute('aria-pressed', bsq.getAttribute('aria-pressed') !== 'true'); render(); });
    // 손잡이 끌기: 한쪽 손잡이를 움직이면 다른 쪽은 고정된 채 직선이 돈다
    function toData(evt) {
      const pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      return AX.y0 + (P.B - p.y) / (P.B - P.T) * (AX.y1 - AX.y0);
    }
    function drag(h, isLeft) {
      let on = false;
      h.addEventListener('pointerdown', (e) => { on = true; found = false; h.setPointerCapture(e.pointerId); e.preventDefault(); });
      h.addEventListener('pointermove', (e) => {
        if (!on) return;
        const b = c - 80 * a;
        let yL = a * XL + b, yR = a * XR + b;
        const v = Math.max(AX.y0, Math.min(AX.y1, toData(e)));
        if (isLeft) yL = v; else yR = v;
        a = Math.max(-0.2, Math.min(0.8, (yR - yL) / (XR - XL)));
        const nb = (isLeft ? yR - a * XR : yL - a * XL);
        c = Math.max(32, Math.min(44, a * 80 + nb));
        syncSliders(); render();
      });
      const up = () => { on = false; };
      h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
      h.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        e.preventDefault(); e.stopPropagation(); found = false;
        const d = e.key === 'ArrowUp' ? 0.3 : -0.3, b = c - 80 * a;
        let yL = a * XL + b, yR = a * XR + b;
        if (isLeft) yL += d; else yR += d;
        a = (yR - yL) / (XR - XL); c = a * 80 + (yL - a * XL);
        syncSliders(); render();
      });
    }
    drag(hL, true); drag(hR, false);
    $('fit-best').addEventListener('click', () => {
      if (anim) return;
      const a0 = a, c0 = c, a1 = BEST.a, c1 = BEST.a * 80 + BEST.b, t0 = performance.now(), ms = 1100;
      const before = sse(a, c - 80 * a);
      ghost.setAttribute('x1', P.sx(55)); ghost.setAttribute('y1', P.sy(a * 55 + c - 80 * a));
      ghost.setAttribute('x2', P.sx(100)); ghost.setAttribute('y2', P.sy(a * 100 + c - 80 * a));
      ghost.setAttribute('opacity', 1);
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      anim = true; $('fit-best').disabled = true;
      $('fit-msg').innerHTML = '컴퓨터가 오차 제곱합이 가장 작은 a, b 를 계산하는 중…';
      const tick = (now) => {
        const k = reduce ? 1 : Math.min(1, (now - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        a = a0 + (a1 - a0) * e; c = c0 + (c1 - c0) * e; syncSliders(); render();
        if (k < 1) requestAnimationFrame(tick);
        else {
          anim = null; found = true; $('fit-best').disabled = false;
          $('fit-msg').innerHTML = `<strong>최소제곱 직선</strong>: 오차 제곱합 <strong>${f1(SSEmin)}</strong> — 어떤 직선도 이보다 작게 만들 수 없습니다.` +
            (isFinite(myBest) && myBest < before ? ` 내 최고 기록은 ${f1(myBest)}.` : '') + ' 점선 = 버튼을 누르기 전 직선.';
        }
      };
      requestAnimationFrame(tick);
    });
    $('fit-reset').addEventListener('click', () => {
      if (anim) return;
      a = START.a; c = START.c; found = false; myBest = Infinity; ghost.setAttribute('opacity', 0); syncSliders(); render();
    });
    render();
  })();

  /* ───────── 5) 회귀일까, 분류일까? ───────── */
  (function cards() {
    const wrap = $('rc-cards'); if (!wrap) return;
    const items = [
      { ic: 'gauge', n: '사출 압력·온도로 인장강도(MPa) 예측', k: 'reg', v: '회귀', a: '답이 34.5, 41.2 … 같은 숫자다.' },
      { ic: 'check', n: '이 제품은 불량일까, 양품일까?', k: 'clf', v: '분류', a: '답이 ‘불량/양품’ 두 종류 중 하나다.' },
      { ic: 'flask', n: '반응 온도·시간으로 실험 수율(%) 예측', k: 'reg', v: '회귀', a: '수율 64.3% 처럼 숫자로 답한다.' },
      { ic: 'activity', n: '진동 기록으로 설비 고장 여부 판정', k: 'clf', v: '분류', a: '‘고장/정상’ 중 하나를 고른다.' },
      { ic: 'clock', n: '이 베어링은 앞으로 며칠 더 쓸 수 있을까?', k: 'reg', v: '회귀', a: '남은 수명 23일 처럼 숫자다.' },
      { ic: 'eye', n: '결함 종류: 치수불량·찍힘·스크래치?', k: 'clf', v: '분류', a: '종류가 셋 이상이어도 종류를 고르면 분류다.' },
      { ic: 'activity', n: '내일 공장 전력 사용량(kWh) 예측', k: 'reg', v: '회귀', a: '숫자를 예측한다.' },
      { ic: 'target', n: '강도가 35 MPa 미만일까?', k: 'clf', v: '분류', a: '같은 강도라도 ‘기준 미만인가?’로 물으면 예/아니오 — 분류가 된다.', o: true },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="ic-badge ${it.o ? 'o' : ''}"><svg class="ic"><use href="#i-${it.ic}"/></svg></span><span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('rc-score').textContent = opened + ' / ' + items.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  })();
})();
