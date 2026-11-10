// 1주 1차시 전용: 직접 해 보기 화면들
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const pct = (v) => Math.round(v * 100) + '%';

  /* ───────── 가상 데이터 (항상 같은 값이 나오도록 고정 난수) ───────── */
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function gen(n, seed) {
    const r = rng(seed), a = [];
    for (let i = 0; i < n; i++) {
      const t = 1.55 + r() * 0.7, T = 66 + r() * 24;               // 두께(mm), 온도(℃)
      const z = (T - 78) / 4.5 - (t - 1.9) / 0.11 + gauss(r) * 0.6;  // 얇고 뜨거울수록 불량
      a.push({ t, T, y: z > 0 ? 1 : 0 });
    }
    return a;
  }
  const train = gen(160, 7), test = gen(400, 99);
  const acc = (d, f) => d.filter((p) => f(p) === p.y).length / d.length;

  /* ───────── 로지스틱 회귀 ───────── */
  const feat = (p) => [(p.t - 1.9) / 0.2, (p.T - 78) / 7];
  function step(w, d, lr) {
    const g = [0, 0, 0];
    for (const p of d) {
      const [a, b] = feat(p);
      const e = 1 / (1 + Math.exp(-(w[0] + w[1] * a + w[2] * b))) - p.y;
      g[0] += e; g[1] += e * a; g[2] += e * b;
    }
    return w.map((v, j) => v - lr * g[j] / d.length);
  }
  function fit(d, iters, lr) { let w = [0, 0, 0.3]; for (let i = 0; i < iters; i++) w = step(w, d, lr || 0.5); return w; }
  const predW = (w) => (p) => { const [a, b] = feat(p); return w[0] + w[1] * a + w[2] * b > 0 ? 1 : 0; };

  /* ───────── 산점도 공통 ───────── */
  const X0 = 1.55, X1 = 2.25, Y0 = 66, Y1 = 90;
  const L = 62, R = 600, Tp = 18, B = 386;
  const sx = (t) => L + (t - X0) / (X1 - X0) * (R - L);
  const sy = (T) => B - (T - Y0) / (Y1 - Y0) * (B - Tp);

  function makePlot(svg) {
    svg.innerHTML = '';
    const id = svg.id + '-clip';
    const cp = el('clipPath', { id }, svg); el('rect', { x: L, y: Tp, width: R - L, height: B - Tp }, cp);
    for (let T = 70; T <= 90; T += 5) {
      el('line', { x1: L, x2: R, y1: sy(T), y2: sy(T), class: 'p-grid' }, svg);
      el('text', { x: L - 10, y: sy(T) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = T;
    }
    for (let t = 1.6; t <= 2.21; t += 0.1) {
      el('line', { x1: sx(t), x2: sx(t), y1: Tp, y2: B, class: 'p-grid' }, svg);
      el('text', { x: sx(t), y: B + 20, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = t.toFixed(1);
    }
    el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis' }, svg);
    el('line', { x1: L, x2: L, y1: Tp, y2: B, class: 'p-axis' }, svg);
    el('text', { x: (L + R) / 2, y: B + 46, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = '두께 (mm) →';
    const yl = el('text', { x: 16, y: (Tp + B) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 16 ${(Tp + B) / 2})` }, svg);
    yl.textContent = '온도 (℃) →';
    const zone = el('g', { 'clip-path': `url(#${id})` }, svg);
    const pts = el('g', {}, svg);
    const marks = el('g', {}, svg);
    return { svg, zone, pts, marks };
  }
  function drawPoints(P, data, pred, flipped) {
    P.pts.innerHTML = ''; P.marks.innerHTML = '';
    data.forEach((p, i) => {
      const cx = sx(p.t), cy = sy(p.T);
      el('circle', { cx, cy, r: 6, class: p.y ? 'p-bad' : 'p-good' }, P.pts);
      if (flipped && flipped.has(i)) el('circle', { cx, cy, r: 9, class: 'p-wrong', style: 'stroke-width:2' }, P.marks);
      else if (pred && pred(p) !== p.y) el('circle', { cx, cy, r: 10, class: 'p-wrong' }, P.marks);
    });
  }
  // 로지스틱 경계선: w0 + w1*a + w2*b = 0  →  b = -(w0 + w1*a)/w2
  function linePts(w) {
    const T = (t) => 78 + 7 * (-(w[0] + w[1] * ((t - 1.9) / 0.2)) / w[2]);
    return [[sx(X0 - 0.2), sy(T(X0 - 0.2))], [sx(X1 + 0.2), sy(T(X1 + 0.2))]];
  }
  function drawBoundary(P, w, cls, shade) {
    const [[x0, y0], [x1, y1]] = linePts(w);
    if (shade) el('path', { d: `M${x0},${y0} L${x1},${y1} L${x1},-400 L${x0},-400 Z`, class: 'p-zone' }, P.zone);
    el('line', { x1: x0, y1: y0, x2: x1, y2: y1, class: cls }, P.zone);
  }

  /* ───────── 1) 도입: 시간대별 공장 ───────── */
  (function factory() {
    const s = document.getElementById('fx-slider');
    if (!s) return;
    const temp = (h) => 72 + 10 * Math.exp(-((h - 15) ** 2) / (2 * 2.2 ** 2));
    const rate = (T) => Math.min(0.4, 0.02 + Math.max(0, T - 76) * 0.03);
    // 하루 곡선
    const gx = (h) => 40 + (h - 9) / 9 * 560, gy = (T) => 368 - (T - 70) / 14 * 56;
    let d = ''; for (let h = 9; h <= 18.001; h += 0.1) d += (d ? 'L' : 'M') + gx(h).toFixed(1) + ',' + gy(temp(h)).toFixed(1);
    document.getElementById('fx-curve').setAttribute('d', d);
    // 컨베이어 위 제품 (불량 위치는 고정 순서로)
    const items = document.getElementById('fx-items');
    const order = [3, 11, 7, 15, 1, 9, 13, 5, 17, 0, 10, 6];
    const boxes = [];
    for (let i = 0; i < 18; i++) boxes.push(el('rect', { x: 256 + i * 46, y: 200, width: 32, height: 32, rx: 6 }, items));
    function update() {
      const h = +s.value, T = temp(h), r = rate(T);
      const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
      document.getElementById('fx-h').textContent = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
      document.getElementById('fx-t').textContent = T.toFixed(1) + '℃';
      document.getElementById('fx-r').textContent = Math.round(r * 100) + '%';
      document.getElementById('fx-temp-txt').textContent = T.toFixed(1) + '℃';
      const fh = 16 + (T - 70) / 14 * 110;
      const th = document.getElementById('fx-thermo');
      th.setAttribute('y', 234 - fh); th.setAttribute('height', fh);
      const hot = T > 78;
      th.setAttribute('class', hot ? 'f-acc2' : 'f-acc');
      document.getElementById('fx-bulb').setAttribute('class', hot ? 'f-acc2' : 'f-acc');
      const nBad = Math.round(r * 18 * 1.5); // 18개 중 화면에 보이는 불량 수 (강조)
      const bad = new Set(order.slice(0, nBad));
      boxes.forEach((b, i) => b.setAttribute('class', bad.has(i % 18) ? 'f-acc2' : 'f-accs'));
      const x = gx(h), y = gy(T);
      const now = document.getElementById('fx-now'); now.setAttribute('x1', x); now.setAttribute('x2', x);
      const dot = document.getElementById('fx-dot'); dot.setAttribute('cx', x); dot.setAttribute('cy', y);
    }
    s.addEventListener('input', update);
    update();
  })();

  /* ───────── 2) 내가 규칙 만들기 ───────── */
  let humanBest = 0;
  (function ruleDemo() {
    const svg = document.getElementById('plot-rule');
    if (!svg) return;
    const P = makePlot(svg);
    const a = document.getElementById('r-a'), b = document.getElementById('r-b');
    for (let x = 1.55; x <= 2.25; x += 0.01) for (let y = 66; y <= 90; y += 0.5)
      humanBest = Math.max(humanBest, acc(train, (p) => (p.t < x || p.T > y) ? 1 : 0));
    function update() {
      const A = +a.value, Bv = +b.value;
      const rule = (p) => (p.t < A || p.T > Bv) ? 1 : 0;
      P.zone.innerHTML = '';
      el('path', { d: `M${L},${Tp} H${R} V${sy(Bv)} H${sx(A)} V${B} H${L} Z`, class: 'p-zone' }, P.zone);
      el('line', { x1: sx(A), x2: sx(A), y1: sy(Bv), y2: B, class: 'p-line' }, P.zone);
      el('line', { x1: sx(A), x2: R, y1: sy(Bv), y2: sy(Bv), class: 'p-line' }, P.zone);
      el('text', { x: R - 8, y: Tp + 22, 'text-anchor': 'end', class: 'p-tick', style: 'font-weight:700;fill:var(--accent-2)' }, P.zone).textContent = '불량으로 판정하는 영역';
      drawPoints(P, train, rule);
      const v = acc(train, rule);
      document.getElementById('r-acc').textContent = pct(v);
      document.getElementById('r-bar').style.width = pct(v);
      document.getElementById('r-a-o').textContent = A.toFixed(2) + 'mm';
      document.getElementById('r-b-o').textContent = Bv.toFixed(1) + '℃';
      document.getElementById('r-a-t').textContent = A.toFixed(2);
      document.getElementById('r-b-t').textContent = Bv.toFixed(1);
    }
    a.addEventListener('input', update); b.addEventListener('input', update);
    update();
  })();

  /* ───────── 3) 컴퓨터가 학습하기 ───────── */
  (function mlDemo() {
    const svg = document.getElementById('plot-ml');
    if (!svg) return;
    const P = makePlot(svg);
    const run = document.getElementById('ml-run'), reset = document.getElementById('ml-reset');
    const hb = document.getElementById('ml-human'); if (hb && humanBest) hb.textContent = pct(humanBest);
    let w, it, timer = null;
    const MAX = 120;
    function render() {
      P.zone.innerHTML = '';
      drawBoundary(P, w, 'p-line', true);
      const pr = predW(w);
      drawPoints(P, train, pr);
      document.getElementById('ml-it').textContent = it;
      document.getElementById('ml-acc').textContent = pct(acc(train, pr));
    }
    function init() {
      clearInterval(timer); timer = null;
      w = [0, 0, 0.3]; it = 0;
      run.disabled = false;
      run.innerHTML = '<svg class="ic"><use href="#i-play"/></svg> 학습 시작';
      document.getElementById('ml-msg').innerHTML = '처음에는 아무렇게나 그은 선(“온도 78℃ 넘으면 불량”)에서 시작합니다.';
      render();
    }
    run.addEventListener('click', () => {
      if (timer) return;
      run.disabled = true; run.innerHTML = '학습 중…';
      document.getElementById('ml-msg').innerHTML = '컴퓨터가 틀린 점을 줄이는 방향으로 경계선을 <strong>조금씩 옮기는 중</strong>입니다.';
      timer = setInterval(() => {
        w = step(w, train, 0.12); it++;
        render();
        if (it >= MAX) {
          clearInterval(timer); timer = null;
          run.innerHTML = '<svg class="ic"><use href="#i-check"/></svg> 학습 완료';
          document.getElementById('ml-msg').innerHTML = '사람은 규칙을 한 줄도 쓰지 않았지만, 컴퓨터가 <strong>비스듬한 경계선</strong>을 찾아냈습니다. 이렇게 찾은 규칙이 <strong>모델</strong>입니다.';
        }
      }, 45);
    });
    reset.addEventListener('click', init);
    document.addEventListener('slideenter', (e) => { if (e.detail.slide.contains(svg) && !timer && it >= MAX) init(); });
    init();
  })();

  /* ───────── 4) 잘못된 데이터의 영향 ───────── */
  (function gigoDemo() {
    const svg = document.getElementById('plot-gigo');
    if (!svg) return;
    const P = makePlot(svg);
    const s = document.getElementById('g-s');
    const defIdx = train.map((p, i) => (p.y ? i : -1)).filter((i) => i >= 0);
    const wClean = fit(train, 300);
    const base = acc(test, predW(wClean));
    function update() {
      const f = +s.value / 100;
      const d = train.map((p) => ({ ...p }));
      const flipped = new Set(defIdx.slice(0, Math.round(defIdx.length * f)));
      flipped.forEach((i) => { d[i].y = 0; });
      const w = fit(d, 300);
      P.zone.innerHTML = '';
      drawBoundary(P, w, 'p-line', true);
      drawBoundary(P, wClean, 'p-line2', false);
      drawPoints(P, d, null, flipped);
      const v = acc(test, predW(w));
      document.getElementById('g-o').textContent = Math.round(f * 100) + '%';
      document.getElementById('g-acc').textContent = pct(v);
      document.getElementById('g-acc').classList.toggle('o', v < base - 0.03);
      document.getElementById('g-bar').style.width = pct(v);
      const missed = test.filter((p) => p.y === 1 && predW(w)(p) === 0).length;
      const total = test.filter((p) => p.y === 1).length;
      document.getElementById('g-msg').innerHTML = f === 0
        ? 'Garbage in, garbage out — 쓰레기를 넣으면 쓰레기가 나온다. 슬라이더를 움직여 보세요.'
        : `진짜 불량 ${total}개 중 <strong>${missed}개를 양품으로 놓칩니다.</strong> 잘못 기록된 데이터로 배운 AI는 현장에서 실수합니다.`;
    }
    s.addEventListener('input', update);
    update();
  })();

  /* ───────── 5) 포함관계 클릭 ───────── */
  (function nest() {
    const svg = document.getElementById('nest');
    if (!svg) return;
    const info = {
      ai:  { ic: 'user', h: '인공지능 (AI)', d: '사람의 지적 능력이 필요한 일을 컴퓨터가 하게 만드는 기술 전체', ex: '예: 사람이 규칙을 직접 넣은 전문가 시스템', wk: '이 강의: 1주' },
      ml:  { ic: 'trend', h: '머신러닝', d: '규칙을 데이터에서 스스로 학습하는 AI', ex: '예: 회귀(품질 예측), 의사결정나무(불량 판정), 군집', wk: '이 강의: 9~12주 (강의의 중심)' },
      dl:  { ic: 'eye', h: '딥러닝', d: '뇌의 신경망을 본뜬 여러 층의 모델로 학습하는 머신러닝', ex: '예: 이미지 인식, 비전 검사', wk: '이 강의: 13주' },
      gen: { ic: 'sparkles', h: '생성형AI', d: '새로운 글·그림·코드를 만들어 내는 딥러닝', ex: '예: ChatGPT, Gemini, Claude', wk: '이 강의: 4주(도구로 활용), 13주(원리)' },
    };
    const rings = svg.querySelectorAll('.ring');
    function pick(k) {
      const v = info[k];
      svg.classList.add('focus');
      rings.forEach((r) => r.classList.toggle('on', r.dataset.k === k));
      document.getElementById('nest-ic').innerHTML = `<svg class="ic"><use href="#i-${v.ic}"/></svg>`;
      document.getElementById('nest-ic').className = 'ic-badge' + (k === 'gen' ? ' o' : '');
      document.getElementById('nest-h').textContent = v.h;
      document.getElementById('nest-d').textContent = v.d;
      document.getElementById('nest-ex').textContent = v.ex;
      document.getElementById('nest-wk').textContent = v.wk;
    }
    rings.forEach((r) => {
      r.addEventListener('click', (e) => { e.stopPropagation(); pick(r.dataset.k); });
      r.addEventListener('keydown', (e) => { if (e.key === 'Enter') pick(r.dataset.k); });
    });
  })();
})();
