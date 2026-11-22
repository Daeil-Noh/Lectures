// 수학 포함판 추가 데모: 경사하강법 (오차 곡선 MSE(w) = (w − 3)² + 1)
(function () {
  const svg = document.getElementById('g1'); if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const txt = (p, x, y, s, a) => { const t = el('text', Object.assign({ x, y }, a || {}), p); t.textContent = s; return t; };
  const $ = (id) => document.getElementById(id);
  const L = (w) => (w - 3) ** 2 + 1, dL = (w) => 2 * (w - 3);
  const W = 640, H = 400, P = { l: 56, r: 18, t: 14, b: 46 }, xr = [-3, 9], yr = [0, 40];
  const X = (w) => P.l + (w - xr[0]) / (xr[1] - xr[0]) * (W - P.l - P.r);
  const Y = (v) => H - P.b - (Math.min(v, 44) - yr[0]) / (yr[1] - yr[0]) * (H - P.t - P.b);
  const eta = $('g1eta');
  let path = [-2], timer = null;
  const done = () => { const w = path[path.length - 1]; return Math.abs(w - 3) < 0.005 || Math.abs(w) > 60 || path.length > 80; };

  function draw() {
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.innerHTML = '';
    const cp = el('clipPath', { id: 'gdclip' }, el('defs', {}, svg));
    el('rect', { x: P.l, y: P.t, width: W - P.l - P.r, height: H - P.t - P.b }, cp);
    for (let w = -2; w <= 8; w += 2) { el('line', { x1: X(w), x2: X(w), y1: P.t, y2: H - P.b, class: 'p-grid' }, svg); txt(svg, X(w), H - P.b + 20, w, { class: 'p-tick', 'text-anchor': 'middle' }); }
    for (let v = 0; v <= 40; v += 10) { el('line', { x1: P.l, x2: W - P.r, y1: Y(v), y2: Y(v), class: 'p-grid' }, svg); txt(svg, P.l - 8, Y(v) + 4, v, { class: 'p-tick', 'text-anchor': 'end' }); }
    el('line', { x1: P.l, x2: W - P.r, y1: H - P.b, y2: H - P.b, class: 'p-axis' }, svg);
    el('line', { x1: P.l, x2: P.l, y1: P.t, y2: H - P.b, class: 'p-axis' }, svg);
    txt(svg, (W + P.l) / 2, H - 8, '가중치 w', { class: 'p-lab', 'text-anchor': 'middle' });
    txt(svg, 16, H / 2, '오차', { class: 'p-lab', 'text-anchor': 'middle', transform: `rotate(-90 16 ${H / 2})` });
    const g = el('g', { 'clip-path': 'url(#gdclip)' }, svg);
    let d = ''; for (let i = 0; i <= 240; i++) { const w = xr[0] + i / 240 * 12; d += (i ? 'L' : 'M') + X(w).toFixed(1) + ' ' + Y(L(w)).toFixed(1); }
    el('path', { d, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 4 }, g);
    txt(g, X(3), Y(1) - 12, '바닥', { class: 'p-tick', 'text-anchor': 'middle' });
    for (let i = 1; i < path.length; i++) el('line', { x1: X(path[i - 1]), y1: Y(L(path[i - 1])), x2: X(path[i]), y2: Y(L(path[i])), stroke: 'var(--accent-2)', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
    path.forEach((w, i) => el('circle', { cx: X(w), cy: Y(L(w)), r: i === path.length - 1 ? 9 : 5, fill: 'var(--accent-2)', 'fill-opacity': i === path.length - 1 ? 1 : 0.5 }, g));
    const w = path[path.length - 1];
    if (Math.abs(w) < 20) { // 현재 위치의 접선
      const s = dL(w), y0 = L(w);
      el('line', { x1: X(w - 1.5), y1: Y(y0 - 1.5 * s), x2: X(w + 1.5), y2: Y(y0 + 1.5 * s), stroke: 'var(--text)', 'stroke-width': 2 }, g);
    }
    const e = +eta.value;
    $('g1etao').textContent = e.toFixed(2);
    $('g1n').textContent = path.length - 1;
    $('g1L').textContent = Math.abs(w) > 60 ? '∞' : L(w).toFixed(2);
    $('g1w').innerHTML = Math.abs(w) > 60 ? '' : `지금 w = <b>${w.toFixed(2)}</b> · 기울기 = <b>${dL(w).toFixed(2)}</b> → 다음 w = ${w.toFixed(2)} − ${e.toFixed(2)} × ${dL(w).toFixed(2)} = <b>${(w - e * dL(w)).toFixed(2)}</b>`;
    let s;
    if (Math.abs(w) > 60) s = '<b>발산</b> — 보폭이 너무 커서 바닥을 넘어 점점 멀어집니다.';
    else if (Math.abs(w - 3) < 0.005) s = `<b>바닥 도착!</b> ${path.length - 1}걸음 걸렸습니다.`;
    else if (e < 0.3) s = '학습률이 작으면 <b>안전하지만 느립니다</b>.';
    else if (Math.abs(e - 0.5) < 0.01) s = '이 곡선에서는 η = 0.5가 <b>한 걸음에</b> 바닥으로 갑니다.';
    else if (e > 1.01) s = '학습률이 너무 크면 바닥을 건너뛰어 <b>발산</b>합니다. 몇 걸음 가 보세요.';
    else if (Math.abs(e - 1) < 0.01) s = 'η = 1.0은 양쪽 벽을 <b>영원히 왔다 갔다</b> 합니다.';
    else if (e > 0.5) s = '바닥을 넘었다 돌아오는 <b>지그재그</b>로 다가갑니다.';
    else s = '적당한 보폭으로 <b>빠르게</b> 다가갑니다.';
    $('g1state').innerHTML = s;
  }
  function step() { if (done()) return false; const w = path[path.length - 1]; path.push(w - +eta.value * dL(w)); draw(); return true; }
  function stop() { clearInterval(timer); timer = null; }
  $('g1step').addEventListener('click', () => { stop(); step(); });
  $('g1run').addEventListener('click', () => { stop(); let k = 0; timer = setInterval(() => { if (!step() || ++k > 40) stop(); }, 140); });
  $('g1reset').addEventListener('click', () => { stop(); path = [-2]; draw(); });
  eta.addEventListener('input', () => { stop(); path = [-2]; draw(); });
  draw();
})();
