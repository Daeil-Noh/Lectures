// 13주 1차시 전용: 경계선 미리보기, 뉴런 하나, 뉴런 합치기, 신경망 그림, 경사하강법, 작은 신경망 학습
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);
  const pct = (v) => Math.round(v * 100) + '%';
  const sig = (z) => 1 / (1 + Math.exp(-z));
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };

  /* ───────── 가상 데이터 (고정 난수) ───────── */
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  const T0 = 194, T1 = 228, P0 = 62, P1 = 100;            // 온도(℃), 압력(bar) 범위
  // A: 온도가 높고 압력이 낮을수록 불량 (직선으로 나뉨)
  function genA(n, seed) {
    const r = rng(seed), a = [];
    for (let i = 0; i < n; i++) {
      const T = T0 + r() * (T1 - T0), P = P0 + r() * (P1 - P0);
      const z = (T - 211) / 6 - (P - 81) / 8 + gauss(r) * 0.55;
      a.push({ T, P, y: z > 0.7 ? 1 : 0 });
    }
    return a;
  }
  // B: 적정 구간(가운데 타원) 안이면 정상, 밖이면 불량
  function genB(n, seed) {
    const r = rng(seed), a = [];
    for (let i = 0; i < n; i++) {
      const T = T0 + r() * (T1 - T0), P = P0 + r() * (P1 - P0);
      const q = ((T - 211) / 12.5) ** 2 + ((P - 81) / 14) ** 2 + gauss(r) * 0.12;
      a.push({ T, P, y: q > 1 ? 1 : 0 });
    }
    return a;
  }
  const A = genA(120, 5), B = genB(170, 8);
  const nx = (T, P) => [(T - 211) / 10, (P - 81) / 10];   // 기준값과의 차이 (표준화한 입력)
  const acc = (d, f) => d.filter((p) => f(p) === p.y).length / d.length;

  /* ───────── 산점도 공통 ───────── */
  const L = 62, R = 600, Tp = 18, Bt = 386;
  const sx = (T) => L + (T - T0) / (T1 - T0) * (R - L);
  const sy = (P) => Bt - (P - P0) / (P1 - P0) * (Bt - Tp);
  function makePlot(svg) {
    svg.innerHTML = '';
    const id = svg.id + '-clip';
    const cp = el('clipPath', { id }, svg); el('rect', { x: L, y: Tp, width: R - L, height: Bt - Tp }, cp);
    const heat = el('g', { 'clip-path': `url(#${id})` }, svg);
    for (let P = 65; P <= 100; P += 5) {
      el('line', { x1: L, x2: R, y1: sy(P), y2: sy(P), class: 'p-grid' }, svg);
      el('text', { x: L - 10, y: sy(P) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = P;
    }
    for (let T = 195; T <= 228; T += 5) {
      el('line', { x1: sx(T), x2: sx(T), y1: Tp, y2: Bt, class: 'p-grid' }, svg);
      el('text', { x: sx(T), y: Bt + 20, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = T;
    }
    el('line', { x1: L, x2: R, y1: Bt, y2: Bt, class: 'p-axis' }, svg);
    el('line', { x1: L, x2: L, y1: Tp, y2: Bt, class: 'p-axis' }, svg);
    el('text', { x: (L + R) / 2, y: Bt + 46, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = '온도 (℃) →';
    el('text', { x: 16, y: (Tp + Bt) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 16 ${(Tp + Bt) / 2})` }, svg).textContent = '압력 (bar) →';
    const zone = el('g', { 'clip-path': `url(#${id})` }, svg);
    const pts = el('g', {}, svg), marks = el('g', {}, svg), top = el('g', {}, svg);
    // 범례
    const lg = el('g', { transform: `translate(${L + 10} ${Tp + 8})` }, top);
    el('rect', { x: 0, y: 0, width: 214, height: 28, rx: 8, fill: 'var(--surface)', opacity: 0.9 }, lg);
    el('circle', { cx: 14, cy: 14, r: 6, class: 'p-good' }, lg); el('text', { x: 24, y: 19, class: 'p-tick' }, lg).textContent = '정상';
    el('circle', { cx: 74, cy: 14, r: 6, class: 'p-bad' }, lg); el('text', { x: 84, y: 19, class: 'p-tick' }, lg).textContent = '불량';
    el('circle', { cx: 134, cy: 14, r: 7, class: 'p-wrong' }, lg); el('text', { x: 146, y: 19, class: 'p-tick' }, lg).textContent = '틀린 판정';
    return { svg, heat, zone, pts, marks };
  }
  function drawPoints(P, data, pred) {
    P.pts.innerHTML = ''; P.marks.innerHTML = '';
    data.forEach((p) => {
      const cx = sx(p.T), cy = sy(p.P);
      el('circle', { cx, cy, r: 6, class: p.y ? 'p-bad' : 'p-good' }, P.pts);
      if (pred && pred(p) !== p.y) el('circle', { cx, cy, r: 10, class: 'p-wrong' }, P.marks);
    });
  }
  // 확률 색칠용 격자
  const GX = 34, GY = 19;
  function makeHeat(P) {
    const cells = [];
    const w = (R - L) / GX, h = (Bt - Tp) / GY;
    for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) {
      const T = T0 + (i + 0.5) / GX * (T1 - T0), Pv = P1 - (j + 0.5) / GY * (P1 - P0);
      cells.push({ T, P: Pv, r: el('rect', { x: L + i * w, y: Tp + j * h, width: w + 0.6, height: h + 0.6, fill: 'var(--accent-2)', 'fill-opacity': 0 }, P.heat) });
    }
    return (f) => cells.forEach((c) => { const p = f(c.T, c.P); c.r.setAttribute('fill-opacity', (0.04 + 0.34 * p).toFixed(3)); });
  }

  /* ───────── 0) 도입: 세 가지 경계 미리보기 ───────── */
  (function minis() {
    const r = rng(41), pts = [];
    for (let i = 0; i < 46; i++) {
      const x = 14 + r() * 212, y = 12 + r() * 136;
      pts.push({ x, y, bad: ((x - 120) / 70) ** 2 + ((y - 80) / 46) ** 2 > 1 });
    }
    function base(id) {
      const svg = $(id); if (!svg) return null;
      el('rect', { x: 2, y: 2, width: 236, height: 156, rx: 12, class: 'f-s2' }, svg);
      return svg;
    }
    function dots(svg) { pts.forEach((p) => el('circle', { cx: p.x, cy: p.y, r: 4.5, class: p.bad ? 'p-bad' : 'p-good' }, svg)); }
    let s = base('mini-a');
    if (s) { el('path', { d: 'M2,2 L238,2 L238,40 L2,128 Z', class: 'p-zone' }, s); dots(s); el('line', { x1: 2, y1: 128, x2: 238, y2: 40, class: 'p-line' }, s); }
    s = base('mini-b');
    if (s) {
      el('path', { d: 'M2,2 H238 V158 H2 Z M60,38 H178 V122 H60 Z', class: 'p-zone', 'fill-rule': 'evenodd' }, s); dots(s);
      el('path', { d: 'M60,38 H178 V122 H60 Z', fill: 'none', class: 'p-line' }, s);
    }
    s = base('mini-c');
    if (s) {
      el('path', { d: 'M2,2 H238 V158 H2 Z M50,80 a70,46 0 1,0 140,0 a70,46 0 1,0 -140,0 Z', class: 'p-zone', 'fill-rule': 'evenodd' }, s); dots(s);
      el('ellipse', { cx: 120, cy: 80, rx: 70, ry: 46, fill: 'none', class: 'p-line' }, s);
    }
  })();

  /* ───────── 0-1) 시그모이드 곡선 ───────── */
  (function sigCurve() {
    const p = $('sigc'); if (!p) return;
    let d = '';
    for (let x = 20; x <= 420; x += 4) { const z = (x - 220) / 40; d += (d ? 'L' : 'M') + x + ',' + (160 - 130 * sig(z)).toFixed(1); }
    p.setAttribute('d', d);
  })();

  /* ───────── 1) 뉴런 하나 ───────── */
  (function neuron() {
    const svg = $('neuron'); if (!svg) return;
    const P = makePlot(svg), paint = makeHeat(P);
    const w1 = $('n-w1'), w2 = $('n-w2'), bb = $('n-b');
    const line = el('line', { class: 'p-line' }, P.zone);
    let best = 0;
    function update() {
      const a = +w1.value, b = +w2.value, c = +bb.value;
      const z = (T, Pv) => { const [u, v] = nx(T, Pv); return a * u + b * v + c; };
      paint((T, Pv) => sig(z(T, Pv)));
      // 경계선: z = 0
      let x1, y1, x2, y2;
      if (Math.abs(b) > Math.abs(a)) {
        const Pat = (T) => 81 + 10 * (-(a * (T - 211) / 10 + c) / b);
        x1 = sx(T0 - 20); y1 = sy(Pat(T0 - 20)); x2 = sx(T1 + 20); y2 = sy(Pat(T1 + 20));
      } else if (Math.abs(a) > 1e-9) {
        const Tat = (Pv) => 211 + 10 * (-(b * (Pv - 81) / 10 + c) / a);
        x1 = sx(Tat(P0 - 20)); y1 = sy(P0 - 20); x2 = sx(Tat(P1 + 20)); y2 = sy(P1 + 20);
      } else { x1 = x2 = y1 = y2 = -999; }
      [['x1', x1], ['y1', y1], ['x2', x2], ['y2', y2]].forEach(([k, v]) => line.setAttribute(k, v));
      const pred = (p) => (z(p.T, p.P) > 0 ? 1 : 0);
      drawPoints(P, A, pred);
      const v = acc(A, pred); best = Math.max(best, v);
      $('n-acc').textContent = pct(v); $('n-bar').style.width = pct(v);
      $('n-w1-o').textContent = a.toFixed(1); $('n-w2-o').textContent = b.toFixed(1); $('n-b-o').textContent = c.toFixed(1);
      $('n-w1-t').textContent = a.toFixed(1); $('n-w2-t').textContent = (b < 0 ? '(' + b.toFixed(1) + ')' : b.toFixed(1)); $('n-b-t').textContent = (c < 0 ? '(' + c.toFixed(1) + ')' : c.toFixed(1));
      $('n-msg').innerHTML = v >= 0.9
        ? `<strong>${pct(v)}!</strong> 뉴런 하나로 이 데이터를 잘 나눴습니다. 직선 하나로 나뉘는 데이터이기 때문입니다.`
        : `가중치는 선의 <strong>기울기</strong>, 편향은 선의 <strong>위치</strong>를 바꿉니다. 90% 넘게 맞혀 보세요. (최고 ${pct(best)})`;
    }
    [w1, w2, bb].forEach((s) => s.addEventListener('input', update));
    update();
  })();

  /* ───────── 2) 뉴런 합치기 ───────── */
  (function combine() {
    const svg = $('combine'); if (!svg) return;
    const P = makePlot(svg);
    const N = [
      { label: '뉴런 1: 온도 199℃ 미만?', f: (p) => p.T < 199, line: [sx(199), Tp, sx(199), Bt], zone: [L, Tp, sx(199) - L, Bt - Tp] },
      { label: '뉴런 2: 온도 223℃ 초과?', f: (p) => p.T > 223, line: [sx(223), Tp, sx(223), Bt], zone: [sx(223), Tp, R - sx(223), Bt - Tp] },
      { label: '뉴런 3: 압력 67bar 미만?', f: (p) => p.P < 67, line: [L, sy(67), R, sy(67)], zone: [L, sy(67), R - L, Bt - sy(67)] },
      { label: '뉴런 4: 압력 95bar 초과?', f: (p) => p.P > 95, line: [L, sy(95), R, sy(95)], zone: [L, Tp, R - L, sy(95) - Tp] },
    ];
    const on = [false, false, false, false];
    const zg = el('g', {}, P.zone), lg = el('g', {}, P.zone);
    // 작은 신경망 그림
    const net = $('cb-net');
    const inY = [36, 84], hidY = [12, 44, 76, 108], edgesIn = [], edgesOut = [], hidN = [];
    hidY.forEach((y, k) => {
      inY.forEach((iy) => edgesIn.push({ k, e: el('line', { x1: 52, y1: iy, x2: 166, y2: y, class: 'ed' }, net) }));
      edgesOut.push(el('line', { x1: 166, y1: y, x2: 280, y2: 60, class: 'ed' }, net));
    });
    inY.forEach((y, i) => { el('circle', { cx: 40, cy: y, r: 12, class: 'nd' }, net); el('text', { x: 18, y: y + 5, 'text-anchor': 'end', class: 'p-tick' }, net).textContent = i ? '압력' : '온도'; });
    hidY.forEach((y, k) => { hidN.push(el('circle', { cx: 166, cy: y, r: 11, class: 'nd' }, net)); el('text', { x: 166, y: y + 4, 'text-anchor': 'middle', class: 'p-tick', style: 'font-size:11px;font-weight:800;pointer-events:none' }, net).textContent = k + 1; });
    const outN = el('circle', { cx: 280, cy: 60, r: 14, class: 'nd' }, net);
    el('text', { x: 300, y: 65, class: 'p-tick' }, net).textContent = '불량?';
    N.forEach((n, k) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tgl'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span class="chk"></span>' + n.label;
      b.addEventListener('click', () => { on[k] = toggle(b); update(); });
      $('cb-tg').appendChild(b);
    });
    function update() {
      zg.innerHTML = ''; lg.innerHTML = '';
      N.forEach((n, k) => {
        if (!on[k]) return;
        el('rect', { x: n.zone[0], y: n.zone[1], width: n.zone[2], height: n.zone[3], class: 'p-zone', style: 'fill-opacity:.16' }, zg);
        el('line', { x1: n.line[0], y1: n.line[1], x2: n.line[2], y2: n.line[3], class: 'p-line' }, lg);
      });
      const pred = (p) => (N.some((n, k) => on[k] && n.f(p)) ? 1 : 0);
      drawPoints(P, B, pred);
      const v = acc(B, pred), cnt = on.filter(Boolean).length;
      $('cb-acc').textContent = pct(v); $('cb-bar').style.width = pct(v);
      hidN.forEach((c, k) => c.classList.toggle('on', on[k]));
      edgesIn.forEach((e) => e.e.classList.toggle('on', on[e.k]));
      edgesOut.forEach((e, k) => e.classList.toggle('on', on[k]));
      outN.classList.toggle('on', cnt > 0);
      const st = $('cb-st');
      if (cnt === 0) { st.className = 'status mid'; st.innerHTML = `<b class="k">뉴런 0개 · ${pct(v)}</b>은닉 뉴런을 하나씩 켜 보세요. 지금은 모두 정상이라고 판정합니다.`; }
      else if (cnt === 1) { st.className = 'status mid'; st.innerHTML = `<b class="k">뉴런 1개 = 직선 1개 · ${pct(v)}</b>한쪽 바깥만 잡습니다. 직선 하나로는 가운데를 둘러쌀 수 없습니다.`; }
      else if (cnt < 4) { st.className = 'status mid'; st.innerHTML = `<b class="k">뉴런 ${cnt}개 · ${pct(v)}</b>직선이 늘수록 불량 영역이 넓어집니다. 나머지도 켜 보세요.`; }
      else { st.className = 'status ok'; st.innerHTML = `<b class="k">뉴런 4개 · ${pct(v)}</b>직선 4개가 모여 <strong>상자</strong>가 됐습니다. 남은 오류(모서리)는 뉴런을 늘리면 줄어듭니다.`; }
    }
    update();
  })();

  /* ───────── 3) 신경망 구조 그림 ───────── */
  (function deepnet() {
    const g = $('deepnet'); if (!g) return;
    const layers = [
      { x: 70, n: 4, lab: ['온도', '압력', '속도', '습도'], name: '입력층' },
      { x: 270, n: 5, name: '은닉층 1' },
      { x: 450, n: 4, name: '은닉층 2' },
      { x: 630, n: 1, lab: ['불량 확률'], name: '출력층' },
    ];
    const Y = (n, i) => 210 + (i - (n - 1) / 2) * 74;
    const eg = el('g', {}, g);
    for (let l = 0; l < layers.length - 1; l++) {
      const a = layers[l], b = layers[l + 1];
      for (let i = 0; i < a.n; i++) for (let j = 0; j < b.n; j++)
        el('line', { x1: a.x, y1: Y(a.n, i), x2: b.x, y2: Y(b.n, j), stroke: l === 0 ? 'var(--accent)' : 'var(--accent-2)', 'stroke-opacity': 0.35, 'stroke-width': 1.6 }, eg);
    }
    layers.forEach((L1, l) => {
      for (let i = 0; i < L1.n; i++) {
        const y = Y(L1.n, i);
        el('circle', { cx: L1.x, cy: y, r: l === 3 ? 26 : 20, fill: l === 0 ? 'var(--accent-soft)' : l === 3 ? 'var(--accent-2)' : 'var(--surface)', stroke: l === 0 ? 'var(--accent)' : 'var(--accent-2)', 'stroke-width': 2.5 }, g);
        if (L1.lab) el('text', { x: l === 0 ? L1.x - 30 : L1.x, y: l === 0 ? y + 5 : y + 50, 'text-anchor': l === 0 ? 'end' : 'middle', class: 't-sub', style: 'font-size:15px' }, g).textContent = L1.lab[i];
      }
      el('text', { x: L1.x, y: 405, 'text-anchor': 'middle', class: l === 1 || l === 2 ? 't-acc2' : 't-acc', style: 'font-size:16px' }, g).textContent = L1.name;
    });
    el('path', { d: 'M240 30 H480', stroke: 'var(--accent-2)', 'stroke-width': 3, fill: 'none' }, g);
    el('text', { x: 360, y: 22, 'text-anchor': 'middle', class: 't-acc2', style: 'font-size:15px' }, g).textContent = '이 부분이 깊어지면 딥러닝';
  })();

  /* ───────── 4) 경사하강법 ───────── */
  (function gd() {
    const svg = $('gd'); if (!svg) return;
    const E = (w) => 0.25 * (w - 3) ** 2 + 0.5, G = (w) => 0.5 * (w - 3);
    const W0 = -2.2, W1 = 8.2, EMAX = 6.6;
    const L2 = 60, R2 = 616, T2 = 20, B2 = 360;
    const X = (w) => L2 + (w - W0) / (W1 - W0) * (R2 - L2), Y = (e) => B2 - Math.min(e, EMAX + 0.4) / EMAX * (B2 - T2);
    for (let e = 0; e <= 6; e += 2) { el('line', { x1: L2, x2: R2, y1: Y(e), y2: Y(e), class: 'p-grid' }, svg); el('text', { x: L2 - 10, y: Y(e) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = e; }
    el('line', { x1: L2, x2: R2, y1: B2, y2: B2, class: 'p-axis' }, svg);
    el('text', { x: (L2 + R2) / 2, y: B2 + 36, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = '가중치 w →';
    el('text', { x: 18, y: (T2 + B2) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 18 ${(T2 + B2) / 2})` }, svg).textContent = '오차 →';
    let d = ''; for (let w = W0; w <= W1 + 1e-9; w += 0.05) d += (d ? 'L' : 'M') + X(w).toFixed(1) + ',' + Y(E(w)).toFixed(1);
    el('path', { d, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 3 }, svg);
    el('circle', { cx: X(3), cy: Y(E(3)), r: 5, class: 'f-ok' }, svg);
    el('text', { x: X(3), y: Y(E(3)) + 24, 'text-anchor': 'middle', class: 'p-tick', style: 'fill:var(--ok);font-weight:800' }, svg).textContent = '바닥 (오차 최소)';
    const trail = el('g', {}, svg);
    const tan = el('line', { stroke: 'var(--accent-2)', 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, svg);
    const ball = el('circle', { r: 11, class: 'f-acc2', stroke: 'var(--surface)', 'stroke-width': 3 }, svg);
    const lr = $('gd-lr');
    let w, n, path, timer = null, out = false, arrived = 0;
    function draw() {
      trail.innerHTML = '';
      for (let i = 1; i < path.length; i++) {
        const a = path[i - 1], b = path[i];
        el('line', { x1: X(a), y1: Y(E(a)), x2: X(b), y2: Y(E(b)), stroke: 'var(--accent-2)', 'stroke-width': 1.8, 'stroke-opacity': 0.6 }, trail);
        el('circle', { cx: X(a), cy: Y(E(a)), r: 4, fill: 'var(--accent-2)', 'fill-opacity': 0.5 }, trail);
      }
      const vis = Math.max(W0, Math.min(W1, w));
      ball.setAttribute('cx', X(vis)); ball.setAttribute('cy', Y(E(vis)));
      const s = G(vis), dx = 1.1;
      tan.setAttribute('x1', X(vis - dx)); tan.setAttribute('y1', Y(E(vis) - s * dx));
      tan.setAttribute('x2', X(vis + dx)); tan.setAttribute('y2', Y(E(vis) + s * dx));
      $('gd-n').textContent = n;
      $('gd-e').textContent = out ? '폭주' : E(w).toFixed(2);
    }
    function message() {
      const k = +lr.value, e = E(w), m = $('gd-msg');
      if (out) m.innerHTML = `보폭이 너무 커서 걸음마다 더 멀리 튕겨 나갑니다. <strong>오차가 오히려 커졌습니다</strong> — 학습 실패.`;
      else if (n === 0) m.innerHTML = '왼쪽 위에서 출발합니다. 보폭을 바꿔 가며 몇 걸음 만에 바닥에 닿는지 보세요.';
      else if (arrived) m.innerHTML = `<strong>${arrived}걸음</strong> 만에 바닥에 도착! ` + (k <= 0.6 ? '보폭이 작아 안전하지만 오래 걸렸습니다.' : k > 2 ? '바닥을 지나쳐 좌우로 출렁이다가 겨우 멈췄습니다.' : '적당한 보폭입니다.');
      else if (k > 2 && n > 0) m.innerHTML = '바닥을 <strong>지나쳐 반대편으로</strong> 넘어갑니다. 좌우로 출렁이고 있습니다.';
      else m.innerHTML = '기울기가 가파른 곳에서는 크게, 바닥 근처 완만한 곳에서는 <strong>작게</strong> 움직입니다.';
    }
    function stepOnce() {
      if (out) return;
      w = w - (+lr.value) * G(w); n++; path.push(w);
      if (E(w) > EMAX + 2) out = true;
      if (!arrived && E(w) < 0.51) arrived = n;
      draw(); message();
    }
    function reset() { clearInterval(timer); timer = null; w = -1.5; n = 0; path = [w]; out = false; arrived = 0; $('gd-lr-o').textContent = (+lr.value).toFixed(1); draw(); message(); lockBtns(false); }
    function lockBtns(on) { $('gd-step').disabled = on; $('gd-auto').disabled = on; }
    $('gd-step').addEventListener('click', stepOnce);
    $('gd-auto').addEventListener('click', () => {
      if (timer) return; lockBtns(true); let k = 0;
      timer = setInterval(() => { stepOnce(); k++; if (k >= 10 || out) { clearInterval(timer); timer = null; lockBtns(false); } }, 260);
    });
    $('gd-reset').addEventListener('click', reset);
    lr.addEventListener('input', reset);
    reset();
  })();

  /* ───────── 5) 작은 신경망 학습 (입력 2 → 은닉 H(tanh) → 출력 1(시그모이드)) ───────── */
  function makeNet(H, seed) {
    const r = rng(seed), W1 = [], b1 = [], W2 = [];
    for (let h = 0; h < H; h++) { W1.push([gauss(r), gauss(r)]); b1.push(gauss(r) * 0.5); W2.push(gauss(r) * 0.5); }
    return { H, W1, b1, W2, b2: 0, m: { W1: W1.map(() => [0, 0]), b1: b1.map(() => 0), W2: W2.map(() => 0), b2: 0 } };
  }
  function forward(n, u, v) {
    const hs = []; let z = n.b2;
    for (let h = 0; h < n.H; h++) { const a = Math.tanh(n.W1[h][0] * u + n.W1[h][1] * v + n.b1[h]); hs.push(a); z += n.W2[h] * a; }
    return { hs, o: sig(z) };
  }
  function epoch(n, d, lr) {               // 전체 데이터로 한 번 가중치 고치기 (관성 있는 경사하강법)
    const H = n.H, gW1 = n.W1.map(() => [0, 0]), gb1 = new Array(H).fill(0), gW2 = new Array(H).fill(0);
    let gb2 = 0, loss = 0;
    for (const p of d) {
      const [u, v] = nx(p.T, p.P), { hs, o } = forward(n, u, v);
      loss += -(p.y * Math.log(o + 1e-9) + (1 - p.y) * Math.log(1 - o + 1e-9));
      const e = o - p.y; gb2 += e;
      for (let h = 0; h < H; h++) { gW2[h] += e * hs[h]; const dh = e * n.W2[h] * (1 - hs[h] * hs[h]); gW1[h][0] += dh * u; gW1[h][1] += dh * v; gb1[h] += dh; }
    }
    const N = d.length, mu = 0.9, M = n.m;
    for (let h = 0; h < H; h++) {
      M.W1[h][0] = mu * M.W1[h][0] - lr * gW1[h][0] / N; n.W1[h][0] += M.W1[h][0];
      M.W1[h][1] = mu * M.W1[h][1] - lr * gW1[h][1] / N; n.W1[h][1] += M.W1[h][1];
      M.b1[h] = mu * M.b1[h] - lr * gb1[h] / N; n.b1[h] += M.b1[h];
      M.W2[h] = mu * M.W2[h] - lr * gW2[h] / N; n.W2[h] += M.W2[h];
    }
    M.b2 = mu * M.b2 - lr * gb2 / N; n.b2 += M.b2;
    return loss / N;
  }
  (function trainDemo() {
    const svg = $('train'); if (!svg) return;
    const P = makePlot(svg), paint = makeHeat(P);
    const lossSvg = $('tr-loss');
    const lossPath = el('polyline', { fill: 'none', stroke: 'var(--accent-2)', 'stroke-width': 2.5 }, lossSvg);
    el('line', { x1: 0, x2: 300, y1: 58, y2: 58, class: 'p-axis' }, lossSvg);
    const MAX = 600, PER = 4;
    let H = 3, net, it, losses, timer = null;
    const predOf = (p) => (forward(net, ...nx(p.T, p.P)).o > 0.5 ? 1 : 0);
    function render() {
      paint((T, Pv) => forward(net, ...nx(T, Pv)).o);
      drawPoints(P, B, predOf);
      $('tr-it').textContent = it;
      $('tr-acc').textContent = pct(acc(B, predOf));
      const top = Math.max(0.8, losses[0] || 0.8);
      lossPath.setAttribute('points', losses.map((l, i) => (i / (MAX / PER) * 300).toFixed(1) + ',' + (56 - l / top * 52).toFixed(1)).join(' '));
    }
    function init() {
      clearInterval(timer); timer = null;
      net = makeNet(H, 1); it = 0; losses = [];
      $('tr-run').disabled = false;
      $('tr-run').innerHTML = '<svg class="ic"><use href="#i-play"/></svg> 학습 시작';
      $('tr-msg').innerHTML = `은닉 뉴런 <strong>${H}개</strong>. 처음 가중치는 아무렇게나 정해져 있습니다. 학습을 시작하면 <strong>모든 가중치를 동시에</strong> 조금씩 고칩니다.`;
      render();
    }
    $('tr-run').addEventListener('click', () => {
      if (timer) return;
      if (it >= MAX) init();
      $('tr-run').disabled = true; $('tr-run').textContent = '학습 중…';
      timer = setInterval(() => {
        let l; for (let k = 0; k < PER; k++) { l = epoch(net, B, 0.1); it++; }
        losses.push(l); render();
        if (it >= MAX) {
          clearInterval(timer); timer = null;
          $('tr-run').disabled = false;
          $('tr-run').innerHTML = '<svg class="ic"><use href="#i-reset"/></svg> 다시 학습';
          const a = acc(B, predOf);
          $('tr-msg').innerHTML = H === 1
            ? `뉴런 1개는 직선 하나뿐 — 오차가 거의 줄지 않고 정확도 <strong>${pct(a)}</strong>에서 멈췄습니다. 뉴런을 늘려 보세요.`
            : H === 3
              ? `뉴런 3개의 직선 판단을 합쳐 <strong>가운데를 둘러싸는 영역</strong>을 만들어 정확도 <strong>${pct(a)}</strong>. 8개로도 해 보세요.`
              : `뉴런 8개는 <strong>둥근 경계</strong>까지 만들어 정확도 <strong>${pct(a)}</strong>. 단, 훈련 데이터 기준 — 너무 복잡하면 과적합(11주)! 시험 데이터로 확인합니다.`;
        }
      }, 30);
    });
    $('tr-reset').addEventListener('click', init);
    document.querySelectorAll('#tr-h button').forEach((b) => b.addEventListener('click', () => {
      document.querySelectorAll('#tr-h button').forEach((x) => x.setAttribute('aria-pressed', x === b));
      H = +b.dataset.h; init();
    }));
    init();
  })();
})();
