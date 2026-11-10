// 9주 2차시 전용: 외운 모델 vs 규칙 모델, 나누는 비율·random_state, stratify
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const f2 = (v) => v.toFixed(2);

  /* ───────── 실제 계산 결과 (tools 없이 scikit-learn 으로 미리 계산해 옮긴 값) ───────── */
  // process.csv 에서 무작위로 뽑은 40개 [pressure, strength] — 앞 20개 학습, 뒤 20개 새 제품
  const MEM = [[74.9, 36.5], [88.5, 40.52], [77.7, 35.02], [76.4, 37.99], [68.3, 35.93], [78.0, 39.52], [79.8, 35.02], [83.4, 38.31], [77.0, 36.08], [77.6, 37.79], [75.2, 37.87], [88.6, 41.06], [87.7, 41.0], [84.7, 31.54], [87.0, 42.44], [74.2, 39.37], [82.3, 37.94], [81.9, 43.74], [78.6, 40.06], [79.7, 36.16], [85.5, 41.75], [87.7, 40.38], [78.1, 38.52], [72.3, 33.72], [89.6, 43.25], [90.5, 44.69], [83.9, 40.41], [96.4, 40.0], [76.9, 41.11], [77.3, 39.99], [84.0, 40.56], [81.6, 37.26], [82.2, 42.16], [81.0, 38.98], [77.2, 35.91], [72.3, 36.27], [89.0, 36.03], [75.1, 36.75], [74.4, 34.69], [76.6, 37.46]];
  // test_size → random_state 0~4 별 [훈련 수, 시험 수, 직선 훈련 MAE, 직선 시험 MAE, 나무 훈련 MAE, 나무 시험 MAE]
  const SPLIT = {"0.1": [[444, 50, 1.42, 1.44, 0.0, 1.56], [444, 50, 1.41, 1.52, 0.0, 1.79], [444, 50, 1.4, 1.51, 0.0, 1.61], [444, 50, 1.43, 1.43, 0.0, 1.7], [444, 50, 1.4, 1.48, 0.0, 1.82]], "0.15": [[419, 75, 1.43, 1.34, 0.0, 1.64], [419, 75, 1.41, 1.49, 0.0, 2.02], [419, 75, 1.41, 1.42, 0.0, 1.82], [419, 75, 1.42, 1.44, 0.0, 1.73], [419, 75, 1.38, 1.53, 0.0, 1.67]], "0.2": [[395, 99, 1.41, 1.46, 0.0, 1.93], [395, 99, 1.4, 1.48, 0.0, 2.11], [395, 99, 1.4, 1.46, 0.0, 1.84], [395, 99, 1.44, 1.4, 0.0, 1.78], [395, 99, 1.39, 1.5, 0.0, 1.76]], "0.25": [[370, 124, 1.4, 1.45, 0.0, 1.98], [370, 124, 1.42, 1.41, 0.0, 1.74], [370, 124, 1.37, 1.55, 0.0, 1.9], [370, 124, 1.45, 1.35, 0.0, 1.68], [370, 124, 1.41, 1.41, 0.0, 1.62]], "0.3": [[345, 149, 1.39, 1.47, 0.0, 1.78], [345, 149, 1.41, 1.43, 0.0, 1.74], [345, 149, 1.39, 1.49, 0.0, 1.81], [345, 149, 1.42, 1.43, 0.0, 1.67], [345, 149, 1.36, 1.51, 0.0, 1.8]], "0.35": [[321, 173, 1.41, 1.44, 0.0, 1.87], [321, 173, 1.43, 1.41, 0.0, 1.7], [321, 173, 1.41, 1.45, 0.0, 1.78], [321, 173, 1.43, 1.42, 0.0, 1.69], [321, 173, 1.38, 1.48, 0.0, 1.81]], "0.4": [[296, 198, 1.38, 1.46, 0.0, 1.79], [296, 198, 1.41, 1.42, 0.0, 1.81], [296, 198, 1.42, 1.46, 0.0, 1.74], [296, 198, 1.43, 1.43, 0.0, 1.81], [296, 198, 1.37, 1.5, 0.0, 1.86]], "0.45": [[271, 223, 1.37, 1.45, 0.0, 2.02], [271, 223, 1.41, 1.42, 0.0, 1.75], [271, 223, 1.42, 1.44, 0.0, 1.72], [271, 223, 1.46, 1.41, 0.0, 1.76], [271, 223, 1.31, 1.53, 0.0, 1.71]], "0.5": [[247, 247, 1.37, 1.44, 0.0, 1.94], [247, 247, 1.4, 1.42, 0.0, 1.86], [247, 247, 1.43, 1.43, 0.0, 1.87], [247, 247, 1.49, 1.38, 0.0, 1.71], [247, 247, 1.31, 1.5, 0.0, 1.99]]};
  // random_state 0~9 별 시험 데이터(99개) 속 불량 수 [그냥 나누기, stratify]
  const STRAT = [[14, 14], [13, 14], [18, 14], [9, 14], [20, 14], [14, 14], [12, 14], [6, 14], [13, 14], [21, 14]];

  /* 순수 계산 (node 로 점검할 수 있게 밖에 둔다) */
  const train = MEM.slice(0, 20), test = MEM.slice(20);
  const sorted = [...train].sort((a, b) => a[0] - b[0]);
  function memo(x) {   // 학습한 점을 그대로 이어 붙인 '외운' 모델
    if (x <= sorted[0][0]) return sorted[0][1];
    for (let i = 1; i < sorted.length; i++) if (x <= sorted[i][0]) { const [x0, y0] = sorted[i - 1], [x1, y1] = sorted[i]; return x1 === x0 ? y1 : y0 + (y1 - y0) * (x - x0) / (x1 - x0); }
    return sorted[sorted.length - 1][1];
  }
  const LINE = (function () {   // 최소제곱 직선
    const n = train.length, mx = train.reduce((s, p) => s + p[0], 0) / n, my = train.reduce((s, p) => s + p[1], 0) / n;
    const a = train.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / train.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
    return { a, b: my - a * mx };
  })();
  const line = (x) => LINE.a * x + LINE.b;
  const mae = (d, f) => d.reduce((s, p) => s + Math.abs(f(p[0]) - p[1]), 0) / d.length;
  const MEMSTAT = { memo: [mae(train, memo), mae(test, memo)], line: [mae(train, line), mae(test, line)] };
  if (typeof window !== 'undefined') window.__W92 = { MEMSTAT, SPLIT, STRAT };

  /* ───────── 1) 외운 모델 vs 규칙 모델 ───────── */
  (function memDemo() {
    const svg = $('mem'); if (!svg) return;
    const L = 60, R = 620, T = 18, B = 370, x0 = 66, x1 = 98, y0 = 30, y1 = 46;
    const sx = (v) => L + (v - x0) / (x1 - x0) * (R - L), sy = (v) => B - (v - y0) / (y1 - y0) * (B - T);
    for (let v = 70; v <= 95; v += 5) { el('line', { x1: sx(v), x2: sx(v), y1: T, y2: B, class: 'p-grid' }, svg); el('text', { x: sx(v), y: B + 20, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = v; }
    for (let v = 32; v <= 46; v += 4) { el('line', { x1: L, x2: R, y1: sy(v), y2: sy(v), class: 'p-grid' }, svg); el('text', { x: L - 10, y: sy(v) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = v; }
    el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis' }, svg); el('line', { x1: L, x2: L, y1: T, y2: B, class: 'p-axis' }, svg);
    el('text', { x: (L + R) / 2, y: B + 44, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = '압력 pressure (bar) →';
    el('text', { x: 16, y: (T + B) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 16 ${(T + B) / 2})` }, svg).textContent = '인장강도 strength (MPa) →';
    const cp = el('clipPath', { id: 'mem-clip' }, svg); el('rect', { x: L, y: T, width: R - L, height: B - T }, cp);
    const res = el('g', {}, svg), curve = el('g', { 'clip-path': 'url(#mem-clip)' }, svg), pts = el('g', {}, svg), tpts = el('g', {}, svg);
    train.forEach((p) => el('circle', { cx: sx(p[0]), cy: sy(p[1]), r: 7, class: 'p-good', 'fill-opacity': 0.9 }, pts));
    let mode = 'memo', shown = false;
    function render() {
      const f = mode === 'memo' ? memo : line;
      curve.innerHTML = ''; res.innerHTML = ''; tpts.innerHTML = '';
      let d = '';
      for (let x = x0; x <= x1 + 0.001; x += 0.05) d += (d ? 'L' : 'M') + sx(x).toFixed(1) + ',' + sy(f(x)).toFixed(1);
      el('path', { d, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 3, 'stroke-linejoin': 'round' }, curve);
      if (mode === 'line') train.forEach((p) => el('line', { x1: sx(p[0]), x2: sx(p[0]), y1: sy(p[1]), y2: sy(f(p[0])), stroke: 'var(--accent)', 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }, res));
      if (shown) test.forEach((p) => {
        el('line', { x1: sx(p[0]), x2: sx(p[0]), y1: sy(p[1]), y2: sy(f(p[0])), stroke: 'var(--accent-2)', 'stroke-width': 2.2 }, res);
        el('rect', { x: sx(p[0]) - 6, y: sy(p[1]) - 6, width: 12, height: 12, rx: 2, transform: `rotate(45 ${sx(p[0])} ${sy(p[1])})`, class: 'f-acc2' }, tpts);
      });
      const st = MEMSTAT[mode];
      $('mem-tr').textContent = f2(st[0]);
      $('mem-te').textContent = shown ? f2(st[1]) : '?';
      if (!shown) $('mem-msg').innerHTML = mode === 'memo'
        ? '외운 모델은 학습한 점 20개를 <strong>하나도 빠짐없이</strong> 지나갑니다. 훈련 데이터 오차 <strong>0.00</strong>!'
        : `직선 모델은 점들을 다 지나지 못합니다. 훈련 데이터 오차 <strong>${f2(st[0])} MPa</strong>. 그럼 외운 모델이 더 좋은 걸까요?`;
      else $('mem-msg').innerHTML = mode === 'memo'
        ? `처음 보는 제품(◆)에서는 평균 <strong>${f2(st[1])} MPa</strong> 틀립니다. 훈련 데이터의 <strong>들쭉날쭉한 잡음까지 외웠기</strong> 때문입니다. 직선 모델로 바꿔 보세요.`
        : `직선 모델은 새 제품에서 <strong>${f2(st[1])} MPa</strong> — 외운 모델(${f2(MEMSTAT.memo[1])})보다 낫습니다. 훈련 점수가 아니라 <strong>새 데이터 점수</strong>로 비교해야 합니다.`;
    }
    $('mem-mode').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      mode = b.dataset.m;
      $('mem-mode').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
      render();
    }));
    $('mem-new').addEventListener('click', () => {
      shown = !shown;
      $('mem-new').innerHTML = shown ? '<svg class="ic"><use href="#i-reset"/></svg> 새 제품 숨기기' : '<svg class="ic"><use href="#i-play"/></svg> 새 제품 20개 도착';
      render();
    });
    render();
  })();

  /* ───────── 2) 비율 · random_state ───────── */
  (function splitDemo() {
    const s = $('sp-s'); if (!s) return;
    let rs = 0;
    const MAX = 2.4, LO = 1.5, HI = 2.2;
    const dots = $('sp-dots');
    const marks = [0, 1, 2, 3, 4].map(() => { const i = document.createElement('i'); dots.appendChild(i); return i; });
    function render() {
      const ts = (+s.value).toFixed(2), key = String(+ts);
      const rows = SPLIT[key], r = rows[rs];
      $('sp-o').textContent = ts;
      $('sp-tr').style.flex = r[0]; $('sp-te').style.flex = r[1];
      $('sp-tr').textContent = '훈련 ' + r[0] + '행'; $('sp-te').textContent = '시험 ' + r[1] + '행';
      [['e-lt', r[2]], ['e-lv', r[3]], ['e-mt', r[4]], ['e-mv', r[5]]].forEach(([id, v]) => { $(id).style.width = Math.max(1, v / MAX * 100) + '%'; $(id + '-v').textContent = f2(v); });
      const tv = rows.map((x) => x[5]);
      marks.forEach((m, j) => {
        m.style.left = ((tv[j] - LO) / (HI - LO) * 100) + '%';
        m.style.background = j === rs ? 'var(--accent-2)' : 'var(--muted)';
        m.style.opacity = j === rs ? 1 : 0.45;
        m.style.zIndex = j === rs ? 2 : 1;
      });
      const lo = Math.min(...tv), hi = Math.max(...tv);
      $('sp-msg').innerHTML = `외운 모델: 훈련 <strong>${f2(r[4])}</strong> → 시험 <strong>${f2(r[5])}</strong>. 직선 회귀는 훈련 ${f2(r[2])} · 시험 ${f2(r[3])}, <strong>차이가 작습니다.</strong> ` +
        `같은 ${Math.round(ts * 100)}%라도 섞는 번호에 따라 외운 모델의 시험 오차가 ${f2(lo)}~${f2(hi)}로 달라집니다.`;
      $('sp-rs').querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-pressed', j === rs));
    }
    s.addEventListener('input', render);
    $('sp-rs').querySelectorAll('button').forEach((b, j) => b.addEventListener('click', () => { rs = j; render(); }));
    render();
  })();

  /* ───────── 3) stratify ───────── */
  (function stratDemo() {
    const gtr = $('st-tr'), gte = $('st-te'); if (!gtr) return;
    const NTR = 395, NTE = 99, ND = 68;
    const ctr = [], cte = [];
    for (let i = 0; i < NTR; i++) { const c = document.createElement('span'); gtr.appendChild(c); ctr.push(c); }
    for (let i = 0; i < NTE; i++) { const c = document.createElement('span'); gte.appendChild(c); cte.push(c); }
    let mode = 'rand', rs = 0;
    const hist = [];
    function paint(cells, k, seed) {
      const r = rng(seed), idx = cells.map((_, i) => ({ i, k: r() })).sort((a, b) => a.k - b.k).slice(0, k).map((o) => o.i);
      const set = new Set(idx);
      cells.forEach((c, i) => c.classList.toggle('d', set.has(i)));
    }
    function render(push) {
      const kte = STRAT[rs][mode === 'rand' ? 0 : 1], ktr = ND - kte;
      paint(ctr, ktr, 100 + rs * 7 + (mode === 'rand' ? 0 : 3));
      paint(cte, kte, 500 + rs * 11 + (mode === 'rand' ? 0 : 5));
      const pte = kte / NTE * 100, ptr = ktr / NTR * 100;
      $('st-trn').textContent = ktr; $('st-trp').textContent = ptr.toFixed(1) + '%';
      $('st-ten').textContent = kte; $('st-tep').textContent = pte.toFixed(1) + '%';
      $('st-rs').textContent = 'random_state=' + rs;
      if (push) { hist.push({ m: mode, v: pte }); if (hist.length > 10) hist.shift(); }
      $('st-hist').innerHTML = hist.map((h) => `<span class="${h.m === 'rand' ? 'r' : 's'}">${h.v.toFixed(1)}%</span>`).join('');
      const gap = Math.abs(pte - 13.8);
      $('st-msg').innerHTML = mode === 'strat'
        ? `<strong>stratify=y</strong>: 어떤 번호로 섞어도 시험 데이터 불량 <strong>${kte}개(${pte.toFixed(1)}%)</strong> — 전체 13.8%와 거의 같습니다.`
        : gap > 3
          ? `시험 데이터 불량률 <strong>${pte.toFixed(1)}%</strong> — 전체 13.8%와 <strong>${gap.toFixed(1)}%p</strong> 차이! ${pte < 13.8 ? '불량이 적어 불량을 잘 잡는지 채점하기 어렵습니다.' : '훈련 데이터 쪽 불량이 줄어 모델이 불량을 덜 배웁니다.'}`
          : `이번에는 ${pte.toFixed(1)}%로 운 좋게 비슷했습니다. <strong>다시 섞기</strong>를 몇 번 눌러 보세요.`;
    }
    $('st-mode').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      mode = b.dataset.m;
      $('st-mode').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
      render(true);
    }));
    $('st-shuf').addEventListener('click', () => { rs = (rs + 1) % STRAT.length; render(true); });
    render(true);
  })();
})();
