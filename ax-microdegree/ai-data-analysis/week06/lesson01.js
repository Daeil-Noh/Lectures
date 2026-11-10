// 6주 1차시 전용: 강도 점 그림, 시소·줄 세우기, 이상치 끌기, 편차 그림, 두 설비 퍼짐, 표준편차 띠, describe 읽기
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
  function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const median = (a) => { const b = [...a].sort((x, y) => x - y), n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
  const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };

  /* process.csv 에서 가져온 실제 값 (tools 없이 python 으로 넣음) */
  const D = /*DATA*/{"strength":[34.57,41.44,42.13,42.05,40.04,42.38,33.96,40.32,39.07,35.98,41.0,36.96,33.72,35.93,37.98,44.62,43.03,32.84,32.22,41.99,35.42,46.68,36.75,43.26,37.11,38.24,41.94,41.09,38.63,37.48,37.46,41.2,41.97,35.02,38.88,36.07,36.35,39.47,40.56,39.27,37.72,42.88,38.92,38.59,40.99,41.23,33.91,39.06,41.53,40.0,41.22,35.55,41.93,39.01,38.83,38.46,40.15,35.66,39.38,38.03,38.33,38.72,38.5,32.57,40.13,36.45,34.65,39.28,43.46,39.27,42.13,41.86,39.73,42.93,34.91,33.96,42.1,40.07,38.5,41.75,42.92,39.07,36.81,39.82,40.99,42.94,38.64,38.06,36.8,39.17,35.19,42.68,32.72,39.76,39.1,41.7,39.91,43.92,43.73,32.55,44.03,43.33,38.38,44.9,36.94,39.49,38.19,39.25,42.05,33.09,38.38,35.77,37.72,34.3,40.13,34.6,43.93,42.54,37.65,43.8,38.73,36.02,40.1,33.3,37.85,37.99,36.81,39.82,41.0,37.91,42.67,33.38,31.7,41.3,40.71,35.09,42.39,40.34,36.75,43.35,36.27,40.47,40.21,39.39,40.72,36.13,38.08,38.04,34.3,38.21,43.14,34.64,37.58,39.07,34.98,38.18,39.28,37.39,39.31,43.87,43.81,38.74,41.36,43.74,39.34,40.85,39.42,38.19,39.61,28.48,35.48,36.5,35.95,41.12,36.85,41.87,39.34,44.69,39.38,37.96,38.93,40.44,39.99,39.41,38.48,43.24,37.94,35.68,39.75,42.02,36.01,40.9,37.99,35.95,34.21,40.06,34.67,38.64,40.55,37.88,42.27,41.38,36.08,36.16,41.43,38.34,31.56,35.91,43.25,40.79,36.3,26.64,40.56,38.46,32.84,43.58,37.82,38.61,39.75,43.59,37.19,44.25,39.02,37.28,39.35,39.15,40.42,38.89,41.62,42.79,28.85,38.45,36.95,33.94,36.56,44.23,37.59,34.85,35.64,42.5,40.78,38.02,37.74,41.81,44.49,40.75,36.06,35.77,39.37,41.27,43.55,41.24,40.23,38.06,36.02,38.37,32.95,36.31,43.65,37.2,34.69,38.44,37.88,39.75,34.59,36.34,38.2,42.17,36.83,38.98,43.65,36.21,36.03,38.31,35.58,41.99,32.43,41.64,34.45,40.35,42.43,43.82,40.59,35.02,37.02,39.06,40.19,41.26,36.63,39.46,38.39,41.8,44.66,35.88,34.28,39.4,37.0,40.52,36.02,39.94,40.93,38.04,45.16,41.07,40.38,38.1,42.73,36.66,39.06,41.79,36.52,40.64,42.16,36.72,46.17,43.06,36.86,38.16,40.74,33.38,39.49,38.01,39.24,43.07,33.26,38.74,39.43,36.82,35.38,36.03,36.58,37.87,38.79,40.13,37.87,40.13,39.12,33.32,36.93,42.44,43.55,42.78,41.75,36.17,37.14,37.15,41.03,36.14,39.52,37.94,41.11,43.72,37.19,41.08,36.2,41.66,35.89,41.15,37.97,35.07,42.09,42.03,33.69,40.41,41.15,43.08,43.0,35.83,41.45,39.02,40.28,35.02,31.54,36.74,40.53,41.06,40.3,36.17,36.85,38.02,37.31,40.96,39.09,41.5,40.51,41.57,31.5,43.06,39.05,39.45,34.06,43.37,41.01,42.12,42.85,41.83,43.83,32.04,32.02,41.02,37.66,41.2,37.27,37.79,35.35,35.08,31.92,36.68,39.53,35.39,40.88,39.2,37.73,42.12,43.12,36.42,41.17,40.96,37.05,36.29,37.51,33.2,35.31,38.56,34.02,39.28,37.26,44.22,36.24,38.52,40.91,42.28,31.71,39.39,40.0,39.32,39.97,39.96,37.82,40.35,40.2,32.52,37.05,36.51,41.45,39.09,43.13,30.42,40.01,40.97,43.32,31.77,39.95,40.72,39.01,36.86,41.15,38.16,41.31,40.13,38.62,40.15,36.82,39.14,40.0,38.99,42.02,40.29,37.78,37.58,40.29,38.41,33.89,39.14,38.72,31.94,35.73,31.32,40.88,38.41,42.13,39.19,37.03,39.6,34.67,42.34,38.05,38.86,33.46,40.95,36.92,40.09,37.16,41.45]}; // DATA END
  const S = D.strength;                                                   // 인장강도 494개
  const T9 = [216.1, 204.6, 205.4, 211.6, 207.2, 204.1, 204.6, 209.7, 198.5]; // 3호기 첫 제품 9개 온도

  /* ───────── 공통: 점 쌓기 그림 (dot plot) ───────── */
  function dotStack(svg, vals, o) {
    const { x0, x1, L, R, base, top, bw, tick } = o;
    const X = (v) => L + (v - x0) / (x1 - x0) * (R - L);
    const bins = {};
    vals.forEach((v, i) => { const k = Math.floor((v - x0) / bw); (bins[k] = bins[k] || []).push(i); });
    const cols = o.cols || 1, bpx = bw / (x1 - x0) * (R - L), colw = bpx / cols;
    const maxN = Math.max(...Object.values(bins).map((b) => b.length));
    const step = Math.min(o.rmax * 2 + 1, colw, (base - top) / Math.ceil(maxN / cols));
    const r = Math.max(1.8, step / 2 - 0.5);
    for (let t = Math.ceil(x0 / tick) * tick; t <= x1 + 1e-9; t += tick) {
      el('line', { x1: X(t), x2: X(t), y1: top - 6, y2: base + 2, class: 'p-grid' }, svg);
      el('text', { x: X(t), y: base + 22, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = +t.toFixed(2);
    }
    el('line', { x1: L, x2: R, y1: base + 2, y2: base + 2, class: 'p-axis' }, svg);
    const g = el('g', {}, svg), dots = [];
    Object.keys(bins).forEach((k) => bins[k].sort((a, b) => vals[a] - vals[b]).forEach((i, j) => {
      const cx = L + (+k) * bpx + ((j % cols) + 0.5) * colw;
      dots[i] = el('circle', { cx, cy: base - step / 2 - Math.floor(j / cols) * step, r, class: 'p-good' }, g);
    }));
    return { X, dots };
  }

  /* ───────── 1) 도입: 인장강도 494개 ───────── */
  (function intro() {
    const svg = $('intro'); if (!svg) return;
    dotStack(svg, S, { x0: 26, x1: 48, L: 30, R: 1070, base: 222, top: 14, bw: 0.5, cols: 3, tick: 2, rmax: 4.5 });
    el('text', { x: 1070, y: 30, 'text-anchor': 'end', class: 't-main', style: 'font-size:20px' }, svg).textContent = '점 494개를 숫자 몇 개로?';
    el('text', { x: 550, y: 266, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = '인장강도 (MPa) →';
  })();

  /* ───────── 2) 평균 = 균형점, 중앙값 = 한가운데 ───────── */
  (function concept() {
    const ss = $('seesaw'), so = $('sorted'); if (!ss) return;
    const m = mean(T9), md = median(T9);
    const X = (v) => 30 + (v - 196) / (219 - 196) * 440;
    el('rect', { x: 20, y: 104, width: 460, height: 7, rx: 3.5, class: 'f-muted' }, ss);
    const seen = {};
    T9.forEach((v) => { const k = v.toFixed(1); seen[k] = (seen[k] || 0) + 1; el('circle', { cx: X(v), cy: 104 - 11 - (seen[k] - 1) * 22, r: 10, class: v === 198.5 ? 'f-acc2' : 'f-acc', 'fill-opacity': 0.85 }, ss); });
    el('path', { d: `M${X(m)},111 l-18,34 h36 z`, class: 'f-acc2' }, ss);
    el('text', { x: X(m), y: 164, 'text-anchor': 'middle', class: 't-acc2', style: 'font-size:16px' }, ss).textContent = '평균 ' + m.toFixed(1) + '℃';
    [200, 205, 210, 215].forEach((t) => (el('text', { x: X(t), y: 132, 'text-anchor': 'middle', class: 'p-tick' }, ss).textContent = t));
    // 줄 세우기
    const b = [...T9].sort((x, y) => x - y), w = 40, gap = 12, x0 = (500 - (9 * w + 8 * gap)) / 2;
    b.forEach((v, i) => {
      const h = 20 + (v - 196) * 5.6, x = x0 + i * (w + gap), mid = i === 4;
      el('rect', { x, y: 130 - h, width: w, height: h, rx: 6, class: mid ? 'f-acc' : 'f-accs' }, so);
      el('text', { x: x + w / 2, y: 130 - h - 6, 'text-anchor': 'middle', class: 'p-tick', style: mid ? 'font-weight:800;fill:var(--accent)' : '' }, so).textContent = v.toFixed(1);
      el('text', { x: x + w / 2, y: 152, 'text-anchor': 'middle', class: 'p-tick', style: mid ? 'font-weight:800;fill:var(--accent)' : '' }, so).textContent = (i + 1) + '번째';
    });
    void md;
  })();

  /* ───────── 3) 직접 해 보기 1: 점 하나 끌기 ───────── */
  (function drag() {
    const svg = $('drag'); if (!svg) return;
    const fixed = T9.slice(0, 8), START = 198.5, ERR = 999.9;
    const x0 = 195, x1 = 300, L = 50, R = 545, AY = 296, SLOT = 604;
    const X = (v) => (v > x1 ? SLOT : L + (v - x0) / (x1 - x0) * (R - L));
    for (let t = 200; t <= 300; t += 20) {
      el('line', { x1: X(t), x2: X(t), y1: 60, y2: AY, class: 'p-grid' }, svg);
      el('text', { x: X(t), y: AY + 22, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = t;
    }
    el('line', { x1: L - 10, x2: R + 8, y1: AY, y2: AY, class: 'p-axis' }, svg);
    el('path', { d: `M${R + 14},${AY + 10} l8,-20 M${R + 24},${AY + 10} l8,-20`, stroke: 'var(--muted)', 'stroke-width': 2 }, svg);
    el('line', { x1: SLOT - 26, x2: SLOT + 26, y1: AY, y2: AY, class: 'p-axis' }, svg);
    el('text', { x: SLOT, y: AY + 22, 'text-anchor': 'middle', class: 'p-tick', style: 'font-weight:700' }, svg).textContent = '999.9';
    el('text', { x: R, y: 404, 'text-anchor': 'end', class: 'p-lab' }, svg).textContent = '사출 온도 (℃) →';
    el('text', { x: L - 4, y: 40, class: 't-sub', style: 'font-size:14px' }, svg).textContent = '파란 점 8개는 고정, 주황 점 하나만 움직입니다';
    // 겹치지 않게 위로 쌓기 (맨 아래 줄은 주황 점 자리로 비워 둠)
    const placed = [];
    [...fixed].sort((a, b) => a - b).forEach((v) => {
      let lv = 1; while (placed.some((p) => p.lv === lv && Math.abs(p.x - X(v)) < 17)) lv++;
      placed.push({ x: X(v), lv });
      el('circle', { cx: X(v), cy: AY - 11 - lv * 19, r: 8.5, class: 'p-good' }, svg);
    });
    // 표시: 중앙값 ▼(위), 평균 ▲(아래)
    const medG = el('g', { class: 'mk' }, svg);
    el('path', { d: 'M0,0 l-11,-18 h22 z', class: 'f-acc' }, medG);
    el('line', { x1: 0, x2: 0, y1: 0, y2: 122, stroke: 'var(--accent)', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, medG);
    const medT = el('text', { y: -26, 'text-anchor': 'middle', class: 't-acc', style: 'font-size:16px' }, medG);
    const meanG = el('g', { class: 'mk' }, svg);
    el('path', { d: 'M0,0 l-12,22 h24 z', class: 'f-acc2' }, meanG);
    el('line', { x1: 0, x2: 0, y1: 0, y2: -30, stroke: 'var(--accent-2)', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, meanG);
    const meanT = el('text', { y: 42, 'text-anchor': 'middle', class: 't-acc2', style: 'font-size:16px' }, meanG);
    // 움직이는 점
    const dg = el('g', { class: 'drag', tabindex: 0, role: 'slider', 'aria-label': '주황 점 온도', 'aria-valuemin': x0, 'aria-valuemax': x1 }, svg);
    el('circle', { r: 20, fill: 'var(--accent-2)', 'fill-opacity': 0.18 }, dg);
    el('circle', { r: 10, class: 'p-bad' }, dg);
    const s = $('d-s');
    let v = START;
    const m0 = mean(T9), md0 = median(T9);
    function render() {
      const all = fixed.concat([v]), m = mean(all), md = median(all);
      dg.setAttribute('transform', `translate(${X(v)} ${AY - 11})`);
      dg.setAttribute('aria-valuenow', v);
      meanG.style.transform = `translate(${X(m)}px, ${AY + 34}px)`;
      medG.style.transform = `translate(${X(md)}px, ${AY - 122}px)`;
      meanT.textContent = '평균 ' + m.toFixed(1);
      medT.textContent = '중앙값 ' + md.toFixed(1);
      $('d-o').textContent = v.toFixed(1) + '℃';
      $('d-mean').textContent = m.toFixed(1);
      $('d-med').textContent = md.toFixed(1);
      const dm = m - m0, dmd = md - md0;
      let msg;
      if (v === START) msg = '주황 점을 <strong>오른쪽으로 끌어</strong> 보세요. 평균(▲)과 중앙값(▼) 중 누가 더 크게 움직일까요?';
      else if (v === ERR) msg = `센서 오류값 하나로 평균이 <strong>${dm.toFixed(1)}℃</strong> 뛰어, 제품이 하나도 없는 <strong>${m.toFixed(1)}℃</strong>에 섰습니다. 중앙값은 ${dmd.toFixed(1)}℃만 움직였습니다.`;
      else msg = `평균은 <strong>${dm >= 0 ? '+' : ''}${dm.toFixed(1)}℃</strong>, 중앙값은 <strong>${dmd >= 0 ? '+' : ''}${dmd.toFixed(1)}℃</strong> 움직였습니다.` + (v > 230 ? ' 중앙값은 아무리 끌어도 <strong>207.2℃</strong>에서 멈춥니다.' : '');
      $('d-msg').innerHTML = msg;
    }
    function set(nv) { v = Math.round(Math.max(x0, Math.min(x1, nv)) * 10) / 10; s.value = v; render(); }
    s.addEventListener('input', () => set(+s.value));
    $('d-err').addEventListener('click', () => { v = ERR; s.value = x1; render(); });
    $('d-reset').addEventListener('click', () => set(START));
    let dragging = false;
    const toVal = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return x0 + (q.x - L) / (R - L) * (x1 - x0); };
    dg.addEventListener('pointerdown', (e) => { dragging = true; dg.setPointerCapture(e.pointerId); e.preventDefault(); });
    dg.addEventListener('pointermove', (e) => { if (dragging) set(toVal(e)); });
    dg.addEventListener('pointerup', () => { dragging = false; });
    dg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); set((v > x1 ? x1 : v) + (e.key === 'ArrowRight' ? 1 : -1)); }
    });
    render();
  })();

  /* ───────── 4) 편차 그림 ───────── */
  (function devs() {
    const svg = $('devs'); if (!svg) return;
    const m = mean(T9), L = 64, R = 520, T = 26, B = 300;
    const Y = (v) => B - (v - 196) / (219 - 196) * (B - T), X = (i) => L + 26 + i * ((R - L - 52) / 8);
    for (let t = 200; t <= 215; t += 5) {
      el('line', { x1: L, x2: R, y1: Y(t), y2: Y(t), class: 'p-grid' }, svg);
      el('text', { x: L - 10, y: Y(t) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = t;
    }
    el('text', { x: 16, y: (T + B) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 16 ${(T + B) / 2})` }, svg).textContent = '온도 (℃)';
    el('line', { x1: L, x2: R, y1: Y(m), y2: Y(m), stroke: 'var(--accent-2)', 'stroke-width': 2.5 }, svg);
    el('text', { x: L - 10, y: Y(m) + 5, 'text-anchor': 'end', class: 't-acc2', style: 'font-size:14px' }, svg).textContent = '평균';
    el('text', { x: R - 4, y: T + 4, 'text-anchor': 'end', class: 't-acc2', style: 'font-size:14px' }, svg).textContent = '가로선 = 평균 ' + m.toFixed(1) + '℃';
    T9.forEach((v, i) => {
      const up = v > m;
      el('line', { x1: X(i), x2: X(i), y1: Y(m), y2: Y(v), stroke: up ? 'var(--accent-2)' : 'var(--accent)', 'stroke-width': 3, 'stroke-dasharray': '1 0' }, svg);
      el('circle', { cx: X(i), cy: Y(v), r: 8, class: 'p-good' }, svg);
      const d = v - m;
      el('text', { x: X(i), y: up ? Y(v) - 14 : Y(v) + 24, 'text-anchor': 'middle', class: 'p-tick', style: `font-weight:800;fill:${up ? 'var(--accent-2)' : 'var(--accent)'}` }, svg).textContent = (d > 0 ? '+' : '') + d.toFixed(1);
    });
    el('text', { x: (L + R) / 2, y: B + 30, 'text-anchor': 'middle', class: 't-sub', style: 'font-size:14px' }, svg).textContent = '막대 = 편차 (값 − 평균). 더하면 0이 되므로 제곱해서 평균';
    // 범위
    const mn = Math.min(...T9), mx = Math.max(...T9), bx = R + 34;
    el('path', { d: `M${bx - 8},${Y(mx)} H${bx} V${Y(mn)} H${bx - 8}`, fill: 'none', stroke: 'var(--muted)', 'stroke-width': 2 }, svg);
    el('text', { x: bx + 8, y: (Y(mx) + Y(mn)) / 2 - 4, class: 'p-tick', style: 'font-weight:800' }, svg).textContent = '범위';
    el('text', { x: bx + 8, y: (Y(mx) + Y(mn)) / 2 + 14, class: 'p-tick', style: 'font-weight:800' }, svg).textContent = (mx - mn).toFixed(1);
  })();

  /* ───────── 5) 직접 해 보기 2: 두 설비 ───────── */
  (function machines() {
    const svg = $('mach'); if (!svg) return;
    const std40 = (seed) => { const r = rng(seed), z = []; for (let i = 0; i < 40; i++) z.push(gauss(r)); const m = mean(z), s = sd(z); return z.map((v) => (v - m) / s); };
    const zA = std40(61), zB = std40(17), SA = 0.03, LO = 1.9, HI = 2.1;
    const x0 = 1.74, x1 = 2.26, L = 40, R = 610, X = (v) => L + (Math.max(x0, Math.min(x1, v)) - x0) / (x1 - x0) * (R - L);
    const panels = [{ y: 182, name: 'A설비' }, { y: 360, name: 'B설비' }];
    el('rect', { x: X(LO), y: 20, width: X(HI) - X(LO), height: 352, fill: 'var(--ok)', 'fill-opacity': 0.07 }, svg);
    [LO, HI].forEach((t) => {
      el('line', { x1: X(t), x2: X(t), y1: 20, y2: 372, stroke: 'var(--ok)', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
      el('text', { x: X(t), y: 14, 'text-anchor': 'middle', class: 'p-tick', style: 'fill:var(--ok);font-weight:800' }, svg).textContent = (t === LO ? '규격 하한 ' : '규격 상한 ') + t.toFixed(2);
    });
    el('line', { x1: X(2), x2: X(2), y1: 28, y2: 372, stroke: 'var(--accent-2)', 'stroke-width': 2 }, svg);
    panels.forEach((p) => {
      el('line', { x1: L, x2: R, y1: p.y + 2, y2: p.y + 2, class: 'p-axis' }, svg);
      el('text', { x: L, y: p.y - 140, class: 't-main', style: 'font-size:17px' }, svg).textContent = p.name;
      p.g = el('g', {}, svg);
    });
    for (let t = 1.8; t <= 2.21; t += 0.1) el('text', { x: X(t), y: 396, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = t.toFixed(1);
    el('text', { x: (L + R) / 2, y: 416, 'text-anchor': 'middle', class: 'p-lab', style: 'font-size:13px' }, svg).textContent = '두께 (mm) →  · 주황 세로선 = 평균 2.00';
    function draw(p, vals) {
      p.g.innerHTML = '';
      const bins = {}; let out = 0;
      vals.forEach((v) => {
        const k = Math.round((v - x0) / 0.012); bins[k] = (bins[k] || 0) + 1;
        const bad = v < LO || v > HI; if (bad) out++;
        el('circle', { cx: X(x0 + k * 0.012), cy: p.y - 6 - (bins[k] - 1) * 13, r: 5.6, class: bad ? 'p-bad' : 'p-good' }, p.g);
        if (bad) el('circle', { cx: X(x0 + k * 0.012), cy: p.y - 6 - (bins[k] - 1) * 13, r: 8.5, class: 'p-wrong' }, p.g);
      });
      return out;
    }
    const s = $('m-s');
    function update() {
      const SB = +s.value;
      const A = zA.map((z) => 2 + SA * z), B = zB.map((z) => 2 + SB * z);
      const oa = draw(panels[0], A), ob = draw(panels[1], B);
      $('m-o').textContent = SB.toFixed(3) + 'mm';
      $('m-a').textContent = sd(A).toFixed(3) + 'mm';
      $('m-b').textContent = sd(B).toFixed(3) + 'mm';
      $('m-ao').textContent = oa + '개'; $('m-bo').textContent = ob + '개';
      $('m-msg').innerHTML = ob > oa
        ? `평균은 똑같이 2.00mm인데, B는 <strong>40개 중 ${ob}개(${Math.round(ob / 40 * 100)}%)</strong>가 규격 밖입니다. 차이를 만든 것은 <strong>표준편차</strong>입니다.`
        : SB < SA ? `B의 표준편차가 A보다 작아졌습니다. 이제 B가 <strong>더 고르게</strong> 만드는 설비입니다.` : `표준편차가 작으면 제품이 평균 근처에 모여 <strong>규격 밖 제품이 없습니다.</strong> 슬라이더를 키워 보세요.`;
    }
    s.addEventListener('input', update);
    update();
  })();

  /* ───────── 6) 표준편차 띠 ───────── */
  (function band() {
    const svg = $('band'); if (!svg) return;
    const m = mean(S), s1 = sd(S);
    const zone = el('g', {}, svg);
    const P = dotStack(svg, S, { x0: 26, x1: 48, L: 30, R: 1070, base: 200, top: 50, bw: 0.5, cols: 3, tick: 2, rmax: 4 });
    el('text', { x: 550, y: 244, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = '인장강도 (MPa) →';
    const btns = document.querySelectorAll('.seg button[data-k]');
    function pick(k) {
      btns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.k == k));
      const lo = m - k * s1, hi = m + k * s1;
      zone.innerHTML = '';
      el('rect', { x: P.X(lo), y: 26, width: P.X(hi) - P.X(lo), height: 178, fill: 'var(--accent)', 'fill-opacity': 0.1, rx: 8 }, zone);
      el('line', { x1: P.X(m), x2: P.X(m), y1: 22, y2: 204, stroke: 'var(--accent-2)', 'stroke-width': 2.5 }, zone);
      el('text', { x: P.X(m), y: 18, 'text-anchor': 'middle', class: 't-acc2', style: 'font-size:15px' }, zone).textContent = '평균 ' + m.toFixed(2);
      [[lo, '−'], [hi, '+']].forEach(([v, sg]) => el('text', { x: P.X(v), y: 40, 'text-anchor': 'middle', class: 't-acc', style: 'font-size:14px' }, zone).textContent = `${sg}${k}σ ${v.toFixed(1)}`);
      let n = 0;
      S.forEach((v, i) => { const inn = v >= lo && v <= hi; if (inn) n++; P.dots[i].setAttribute('class', inn ? 'p-good' : ''); P.dots[i].style.fill = inn ? '' : 'var(--muted)'; P.dots[i].style.fillOpacity = inn ? '' : 0.45; });
      $('band-msg').innerHTML = `${lo.toFixed(1)} ~ ${hi.toFixed(1)} MPa 안에 <strong>494개 중 ${n}개 (${(n / S.length * 100).toFixed(1)}%)</strong>가 들어 있습니다.` + (k === 1 ? ' 대략 <strong>⅔</strong>.' : ' 거의 <strong>다</strong> 들어옵니다.');
    }
    btns.forEach((b) => b.addEventListener('click', () => pick(+b.dataset.k)));
    pick(1);
  })();

  /* ───────── 7) 직접 해 보기 3: describe 읽기 ───────── */
  (function describe() {
    const tb = document.querySelector('#desc tbody'); if (!tb) return;
    const rows = [
      ['count', '494.00', '494.00', 'database', '개수 (count)', '비어 있지 않은 값의 개수. 결측치는 세지 않는다.', '두 열 모두 494 → 5주차에 결측치를 모두 정리했다.', '열마다 count가 다르면 결측치를 의심'],
      ['mean', '211.44', '38.79', 'target', '평균 (mean)', '모두 더해 개수로 나눈 균형점.', '온도 평균 211.44℃, 강도 평균 38.79 MPa', '중앙값(50%)과 비교하는 습관'],
      ['std', '7.40', '3.15', 'activity', '표준편차 (std)', '평균에서 보통 얼마나 떨어져 있는지.', '온도는 보통 ±7.4℃, 강도는 ±3.15 MPa 정도 흩어져 있다.', '단위가 다른 열끼리는 크기를 직접 비교하지 않는다'],
      ['min', '191.90', '26.64', 'trend', '최솟값 (min)', '가장 작은 값.', '가장 약한 제품 26.64 MPa — 평균보다 표준편차의 약 4배 아래.', '6-2: 이 값은 이상치일까?'],
      ['25%', '206.10', '36.80', 'layers', '제1사분위수 (Q1)', '작은 값부터 줄 세웠을 때 25% 위치의 값.', '제품 4개 중 1개는 강도가 36.80 MPa 이하.', '6-2: 상자그림의 아래쪽 끝'],
      ['50%', '211.60', '39.06', 'chart', '중앙값 (median)', '줄 세웠을 때 한가운데 값. 50% 위치.', '강도: 평균 38.79 &lt; 중앙값 39.06 → 낮은 쪽에 극단값이 조금 있다.', '평균과 차이가 크면 데이터를 들여다본다'],
      ['75%', '216.70', '41.05', 'layers', '제3사분위수 (Q3)', '줄 세웠을 때 75% 위치의 값.', '제품 4개 중 3개는 강도가 41.05 MPa 이하.', '6-2: 상자그림의 위쪽 끝'],
      ['max', '235.30', '46.68', 'alert', '최댓값 (max)', '가장 큰 값.', '최고 온도 235.3℃ — 평균보다 표준편차의 3배 넘게 높다.', '6-2: 과열일까, 센서 문제일까?'],
    ];
    const seen = new Set();
    rows.forEach((r, i) => {
      const tr = document.createElement('tr');
      tr.tabIndex = 0;
      tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>`;
      const pick = () => {
        tb.querySelectorAll('tr').forEach((t) => t.classList.remove('on'));
        tr.classList.add('on', 'seen'); seen.add(i);
        $('ds-ic').innerHTML = `<svg class="ic"><use href="#i-${r[3]}"/></svg>`;
        $('ds-h').textContent = r[4];
        $('ds-d').textContent = r[5];
        $('ds-ex').innerHTML = r[6];
        $('ds-wk').textContent = '→ ' + r[7];
        $('ds-score').textContent = seen.size + ' / 8 확인';
      };
      tr.addEventListener('click', pick);
      tr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(); } });
      tb.appendChild(tr);
    });
  })();
})();
