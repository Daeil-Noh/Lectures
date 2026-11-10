// 13주 2차시 전용: 표지·도입 그림, 픽셀 그리기, 필터 밀기, 필터 고르기, CNN 그림, 조명 편향
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
  const gray = (v) => { const g = Math.max(0, Math.min(255, Math.round(v))); return `rgb(${g},${g},${g})`; };
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  /* ───────── 12×12 가상 표면 이미지 ───────── */
  const N = 12, DARK = 72;
  const surface = (seed) => { const r = rng(seed); return Array.from({ length: N * N }, () => Math.round(185 + gauss(r) * 6)); };
  function sample(kind, seed) {
    const a = surface(seed), set = (x, y, v) => { if (x >= 0 && x < N && y >= 0 && y < N) a[y * N + x] = v; };
    if (kind === 'v') for (let y = 2; y <= 9; y++) set(6, y, DARK);
    if (kind === 'd') for (let k = 2; k <= 9; k++) set(k, k, DARK);
    if (kind === 's') for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const d2 = (x - 4) ** 2 + (y - 7) ** 2; a[y * N + x] = Math.round(a[y * N + x] * (1 - 0.5 * Math.exp(-d2 / 1.62))); }
    return a;
  }
  // 필터 (어두운 정도 = 255 − 밝기 에 곱한다)
  const FILT = {
    v: { name: '세로 선', k: [-1, 2, -1, -1, 2, -1, -1, 2, -1] },
    h: { name: '가로 선', k: [-1, -1, -1, 2, 2, 2, -1, -1, -1] },
    d: { name: '대각선 ↘', k: [2, -1, -1, -1, 2, -1, -1, -1, 2] },
    p: { name: '점·얼룩', k: [-1, -1, -1, -1, 8, -1, -1, -1, -1] },
  };
  const SCALE = 700;                       // 반응 700 → 100점
  const resp = (img, k, x, y) => { let s = 0; for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) s += k[j * 3 + i] * (255 - img[(y + j) * N + x + i]); return s; };
  const score = (s) => Math.round(Math.min(1, Math.max(0, s) / SCALE) * 100);
  const fmap = (img, k) => { const o = []; for (let y = 0; y < N - 2; y++) for (let x = 0; x < N - 2; x++) o.push(score(resp(img, k, x, y))); return o; };

  // 직접 해 보기 1·2가 함께 쓰는 이미지 (처음엔 대각선 흠집 하나)
  const BASE = surface(7);
  const IMG = BASE.slice();
  function preset() { for (let i = 0; i < IMG.length; i++) IMG[i] = BASE[i]; for (let k = 0; k < 7; k++) IMG[(3 + k) * N + 2 + k] = DARK; }
  preset();

  /* ───────── 0) 표지·도입 그림 ───────── */
  (function cover() {
    const g = $('cover-px'); if (!g) return;
    const r = rng(3);
    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
      const onScratch = (x >= 4 && x <= 8 && Math.abs(y - (x - 1)) === 0);
      el('rect', { x: 90 + x * 30, y: 60 + y * 30, width: 29, height: 29, fill: 'var(--text)', 'fill-opacity': (onScratch ? 0.55 : 0.04 + r() * 0.08).toFixed(3) }, g);
    }
  })();
  (function intro() {
    const g = $('intro-grid'); if (!g) return;
    const r = rng(9), W = 6, H = 5, c = 66, x0 = 460, y0 = 40;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const line = (y === 4 - Math.round(x * 0.66));
      const v = line ? 70 + Math.round(r() * 12) : 178 + Math.round(gauss(r) * 7);
      el('rect', { x: x0 + x * c, y: y0 + y * c, width: c - 4, height: c - 4, rx: 6, fill: gray(v) }, g);
      el('text', { x: x0 + x * c + (c - 4) / 2, y: y0 + y * c + c / 2 + 4, 'text-anchor': 'middle', style: `font-size:19px;font-weight:800;fill:${v < 128 ? '#fff' : '#222'}` }, g).textContent = v;
    }
  })();

  /* ───────── 1) 픽셀 그리기 ───────── */
  (function paint() {
    const svg = $('paint'); if (!svg) return;
    const C = 32, X0 = 40, Y0 = 18;
    const cells = [], nums = [];
    const gp = el('g', { class: 'paint' }, svg);
    for (let i = 0; i < N * N; i++) {
      const x = i % N, y = Math.floor(i / N);
      cells.push(el('rect', { class: 'px', x: X0 + x * C, y: Y0 + y * C, width: C, height: C }, gp));
      nums.push(el('text', { x: X0 + x * C + C / 2, y: Y0 + y * C + C / 2 + 4, 'text-anchor': 'middle', style: 'font-size:11px;font-weight:700;pointer-events:none;font-variant-numeric:tabular-nums' }, gp));
    }
    const sel = el('rect', { width: C, height: C, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 3, opacity: 0, 'pointer-events': 'none' }, svg);
    // 밝기 막대
    const BX = 470, BT = 40, BB = 380;
    const gd = el('linearGradient', { id: 'pgrad', x1: 0, y1: 0, x2: 0, y2: 1 }, el('defs', {}, svg));
    el('stop', { offset: 0, 'stop-color': '#fff' }, gd); el('stop', { offset: 1, 'stop-color': '#000' }, gd);
    el('rect', { x: BX, y: BT, width: 30, height: BB - BT, rx: 6, fill: 'url(#pgrad)', stroke: 'var(--line)' }, svg);
    el('text', { x: BX + 40, y: BT + 6, class: 'p-tick' }, svg).textContent = '255 흰색';
    el('text', { x: BX + 40, y: BB, class: 'p-tick' }, svg).textContent = '0 검정';
    const by = (v) => BB - v / 255 * (BB - BT);
    el('line', { x1: BX - 4, x2: BX + 34, y1: by(185), y2: by(185), stroke: 'var(--accent)', 'stroke-width': 2 }, svg);
    el('text', { x: BX + 40, y: by(185) + 4, class: 'p-tick', style: 'fill:var(--accent);font-weight:700' }, svg).textContent = '표면 약 185';
    el('line', { x1: BX - 4, x2: BX + 34, y1: by(DARK), y2: by(DARK), stroke: 'var(--accent-2)', 'stroke-width': 2 }, svg);
    el('text', { x: BX + 40, y: by(DARK) + 4, class: 'p-tick', style: 'fill:var(--accent-2);font-weight:700' }, svg).textContent = '스크래치 약 ' + DARK;
    const mk = el('path', { fill: 'var(--text)', opacity: 0 }, svg);
    let tool = 'line', showNum = false, down = false;
    function render() {
      IMG.forEach((v, i) => {
        cells[i].setAttribute('fill', gray(v));
        nums[i].textContent = showNum ? v : '';
        nums[i].style.fill = v < 128 ? '#fff' : '#222';
      });
    }
    function pick(i) {
      const x = i % N, y = Math.floor(i / N);
      sel.setAttribute('x', X0 + x * C); sel.setAttribute('y', Y0 + y * C); sel.setAttribute('opacity', 1);
      $('pt-where').textContent = `고른 칸 (${y + 1}행 ${x + 1}열)의 밝기`;
      $('pt-val').textContent = IMG[i];
      const yy = by(IMG[i]);
      mk.setAttribute('d', `M${BX - 6},${yy} l-12,-8 v16 z`); mk.setAttribute('opacity', 1);
    }
    function apply(i) {
      const x = i % N, y = Math.floor(i / N);
      if (tool === 'line') IMG[i] = DARK;
      else if (tool === 'erase') IMG[i] = BASE[i];
      else for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue;
        const j = yy * N + xx, f = dx === 0 && dy === 0 ? 0.55 : (dx === 0 || dy === 0) ? 0.72 : 0.84;
        IMG[j] = Math.min(IMG[j], Math.round(BASE[j] * f));
      }
      render(); pick(i);
    }
    function idxAt(ev) {
      const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      const x = Math.floor((p.x - X0) / C), y = Math.floor((p.y - Y0) / C);
      return x >= 0 && y >= 0 && x < N && y < N ? y * N + x : -1;
    }
    gp.addEventListener('pointerdown', (e) => { down = true; const i = idxAt(e); if (i >= 0) apply(i); e.preventDefault(); });
    svg.addEventListener('pointermove', (e) => { const i = idxAt(e); if (i < 0) return; if (down) { if (tool !== 'blob') apply(i); } else pick(i); });
    window.addEventListener('pointerup', () => { down = false; });
    document.querySelectorAll('#pt-tool button').forEach((b) => b.addEventListener('click', () => {
      document.querySelectorAll('#pt-tool button').forEach((x) => x.setAttribute('aria-pressed', x === b)); tool = b.dataset.t;
    }));
    $('pt-num').addEventListener('click', () => { showNum = toggle($('pt-num')); render(); });
    $('pt-reset').addEventListener('click', () => { preset(); render(); });
    render();
  })();

  /* ───────── 2) 필터 밀기 ───────── */
  (function conv() {
    const svg = $('conv'); if (!svg) return;
    const C = 26, IX = 12, IY = 60, MX = 400, MY = 86;
    el('text', { x: IX, y: IY - 16, class: 'p-lab' }, svg).textContent = '입력 이미지 (12×12)';
    el('text', { x: MX, y: MY - 16, class: 'p-lab' }, svg).textContent = '특징 지도 (10×10)';
    const icells = [], mcells = [];
    for (let i = 0; i < N * N; i++) icells.push(el('rect', { class: 'px', x: IX + (i % N) * C, y: IY + Math.floor(i / N) * C, width: C, height: C }, svg));
    el('rect', { x: MX, y: MY, width: 10 * C, height: 10 * C, class: 'f-s2' }, svg);
    for (let i = 0; i < 100; i++) mcells.push(el('rect', { x: MX + (i % 10) * C, y: MY + Math.floor(i / 10) * C, width: C - 1, height: C - 1, fill: 'var(--accent-2)', 'fill-opacity': 0 }, svg));
    const l1 = el('line', { stroke: 'var(--accent)', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, svg);
    const l2 = el('line', { stroke: 'var(--accent)', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, svg);
    const win = el('rect', { width: 3 * C, height: 3 * C, fill: 'var(--accent)', 'fill-opacity': 0.12, stroke: 'var(--accent)', 'stroke-width': 3 }, svg);
    const mcur = el('rect', { width: C, height: C, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 3 }, svg);
    const vtxt = el('text', { class: 'p-lab', style: 'fill:var(--accent)', 'text-anchor': 'middle' }, svg);
    el('text', { x: MX, y: 410, class: 'p-tick' }, svg).textContent = '진할수록 반응이 크다 = “찾는 모양이 여기 있다”';
    let f = 'd', pos = -1, done = new Array(100).fill(null), timer = null;
    const pick = $('cv-pick');
    Object.entries(FILT).forEach(([k, v]) => {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.f = k; b.textContent = v.name + ' 필터';
      b.setAttribute('aria-pressed', k === f);
      b.addEventListener('click', () => { f = k; pick.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); reset(); });
      pick.appendChild(b);
    });
    function kern() { $('cv-kern').innerHTML = FILT[f].k.map((v) => `<span class="${v > 0 ? 'p' : v < 0 ? 'n' : ''}">${v > 0 ? '+' + v : v}</span>`).join(''); }
    function draw() {
      IMG.forEach((v, i) => icells[i].setAttribute('fill', gray(v)));
      done.forEach((s, i) => mcells[i].setAttribute('fill-opacity', s == null ? 0 : (s / 100 * 0.95).toFixed(3)));
      const vis = pos >= 0 && pos < 100;
      [win, mcur, l1, l2, vtxt].forEach((e) => e.setAttribute('opacity', vis ? 1 : 0));
      if (!vis) return;
      const x = pos % 10, y = Math.floor(pos / 10);
      win.setAttribute('x', IX + x * C); win.setAttribute('y', IY + y * C);
      mcur.setAttribute('x', MX + x * C); mcur.setAttribute('y', MY + y * C);
      l1.setAttribute('x1', IX + (x + 3) * C); l1.setAttribute('y1', IY + y * C); l1.setAttribute('x2', MX + x * C); l1.setAttribute('y2', MY + y * C);
      l2.setAttribute('x1', IX + (x + 3) * C); l2.setAttribute('y1', IY + (y + 3) * C); l2.setAttribute('x2', MX + x * C); l2.setAttribute('y2', MY + (y + 1) * C);
      vtxt.setAttribute('x', MX + x * C + C / 2); vtxt.setAttribute('y', MY + y * C - 6); vtxt.textContent = done[pos];
    }
    function calc(p) {
      const x = p % 10, y = Math.floor(p / 10), s = resp(IMG, FILT[f].k, x, y);
      done[p] = score(s);
      $('cv-calc').innerHTML = `(${y + 1}행 ${x + 1}열) 9칸 곱의 합 = <strong>${s}</strong> → 반응 <strong>${done[p]}</strong>점` + (s < 0 ? ' (음수는 0)' : '');
    }
    function finish() {
      let best = 0, bi = 0; done.forEach((s, i) => { if (s > best) { best = s; bi = i; } });
      const cnt = done.filter((s) => s >= 50).length;
      $('cv-msg').innerHTML = best >= 50
        ? `<strong>${FILT[f].name}</strong> 필터가 <strong>${cnt}곳</strong>에서 크게 반응했습니다 (최고 ${best}점, ${Math.floor(bi / 10) + 1}행 ${bi % 10 + 1}열). 같은 필터 하나가 이미지 <strong>어디에 있든</strong> 그 모양을 찾습니다.`
        : `<strong>${FILT[f].name}</strong> 필터는 크게 반응한 곳이 없습니다 (최고 ${best}점). 이 이미지에는 그 모양이 없다는 뜻 — 다른 필터를 고르거나 1에서 그림을 바꿔 보세요.`;
    }
    function reset() { clearInterval(timer); timer = null; pos = -1; done = new Array(100).fill(null); kern(); draw(); $('cv-play').disabled = false; $('cv-msg').innerHTML = `<strong>${FILT[f].name}</strong> 필터를 이미지 왼쪽 위부터 한 칸씩 밀어 봅니다. “밀어 보기”를 누르세요.`; $('cv-calc').innerHTML = '필터 9칸 × 아래 픽셀의 <strong>어두운 정도</strong>를 곱해 더한 값 = 이 위치의 반응'; }
    function step() { if (pos >= 99) return false; pos++; calc(pos); draw(); if (pos >= 99) finish(); return pos < 99; }
    $('cv-step').addEventListener('click', () => { if (timer) return; if (pos >= 99) reset(); step(); });
    $('cv-play').addEventListener('click', () => {
      if (timer) return; if (pos >= 99) reset();
      $('cv-play').disabled = true;
      timer = setInterval(() => { if (!step()) { clearInterval(timer); timer = null; $('cv-play').disabled = false; } }, 45);
    });
    $('cv-all').addEventListener('click', () => { clearInterval(timer); timer = null; $('cv-play').disabled = false; for (let p = 0; p < 100; p++) calc(p); pos = 99; draw(); finish(); });
    document.addEventListener('slideenter', (e) => { if (e.detail.slide.contains(svg)) reset(); });
    reset();
  })();

  /* ───────── 3) 필터 고르기 ───────── */
  (function fsel() {
    const svg = $('fsel'); if (!svg) return;
    const S = [
      { k: 'n', name: '정상', img: sample('n', 1) },
      { k: 'v', name: '세로 흠집', img: sample('v', 2) },
      { k: 'd', name: '대각선 흠집', img: sample('d', 3) },
      { k: 's', name: '얼룩', img: sample('s', 4) },
    ];
    const C1 = 11, C2 = 13.2, W = 170;
    const maps = [], tops = [], badges = [];
    S.forEach((s, c) => {
      const x0 = 8 + c * W;
      el('text', { x: x0 + 66, y: 24, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = s.name;
      s.img.forEach((v, i) => el('rect', { class: 'px', x: x0 + (i % N) * C1, y: 36 + Math.floor(i / N) * C1, width: C1, height: C1, fill: gray(v) }, svg));
      el('path', { d: `M${x0 + 66},${36 + 12 * C1 + 8} v22`, stroke: 'var(--muted)', 'stroke-width': 2, 'marker-end': '' }, svg);
      el('rect', { x: x0, y: 206, width: 10 * C2, height: 10 * C2, class: 'f-s2' }, svg);
      const m = []; for (let i = 0; i < 100; i++) m.push(el('rect', { x: x0 + (i % 10) * C2, y: 206 + Math.floor(i / 10) * C2, width: C2 - 0.8, height: C2 - 0.8, fill: 'var(--accent-2)', 'fill-opacity': 0 }, svg));
      maps.push(m);
      tops.push(el('text', { x: x0 + 66, y: 370, 'text-anchor': 'middle', class: 'p-tick', style: 'font-size:14px' }, svg));
      badges.push(el('text', { x: x0 + 66, y: 396, 'text-anchor': 'middle', style: 'font-size:16px;font-weight:800' }, svg));
    });
    const pick = $('fs-pick');
    const keys = Object.keys(FILT).concat(['all']);
    keys.forEach((k) => {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.f = k;
      b.textContent = k === 'all' ? '필터 4개 함께 쓰기' : FILT[k].name;
      if (k === 'all') b.className = 'wide';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => { pick.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); show(k); });
      pick.appendChild(b);
    });
    function show(k) {
      const found = [];
      S.forEach((s, c) => {
        let m, label;
        if (k === 'all') {
          const all = Object.keys(FILT).map((f) => ({ f, m: fmap(s.img, FILT[f].k) }));
          const lines = all.filter((a) => a.f !== 'p'), lineBest = lines.reduce((a, b) => (Math.max(...b.m) > Math.max(...a.m) ? b : a));
          m = all[0].m.map((_, i) => Math.max(...all.map((a) => a.m[i])));
          const pBest = Math.max(...all.find((a) => a.f === 'p').m), lb = Math.max(...lineBest.m);
          label = pBest < 50 ? '정상' : lb >= 50 ? FILT[lineBest.f].name + ' 흠집' : '얼룩';
          tops[c].textContent = `점 ${pBest} · ${FILT[lineBest.f].name} ${lb}`;
          badges[c].textContent = '→ ' + label; badges[c].style.fill = label === '정상' ? 'var(--accent)' : 'var(--accent-2)';
        } else {
          m = fmap(s.img, FILT[k].k);
          const best = Math.max(...m);
          tops[c].textContent = '가장 센 반응 ' + best;
          const hit = best >= 50; if (hit) found.push(s.name);
          badges[c].textContent = hit ? '찾음' : '못 찾음'; badges[c].style.fill = hit ? 'var(--accent-2)' : 'var(--muted)';
        }
        m.forEach((v, i) => maps[c][i].setAttribute('fill-opacity', (v / 100 * 0.95).toFixed(3)));
      });
      const st = $('fs-st');
      if (k === 'all') { st.className = 'status ok'; st.innerHTML = '<b class="k">필터를 조합하면 종류까지</b>“점·얼룩” 필터로 <strong>불량 여부</strong>, 선 필터들로 <strong>흠집 방향</strong>을 판단해 네 장을 모두 맞혔습니다. CNN의 다음 층이 하는 일입니다.'; }
      else if (!found.length) { st.className = 'status mid'; st.innerHTML = `<b class="k">${FILT[k].name} 필터: 아무것도 못 찾음</b>이 네 장에는 그 모양이 없습니다. 필터는 <strong>자기가 찾는 모양에만</strong> 반응합니다.`; }
      else { st.className = found.length > 1 ? 'status ok' : 'status mid'; st.innerHTML = `<b class="k">${FILT[k].name} 필터: ${found.join(', ')}</b>` + (k === 'p' ? '주변보다 어두운 곳이면 모두 반응 — 불량 <strong>여부</strong>는 알지만 <strong>종류</strong>는 모릅니다.' : '그 방향의 선에만 크게 반응합니다. 정상 이미지에는 반응하지 않습니다.'); }
    }
    show('v'); pick.querySelector('[data-f="v"]').setAttribute('aria-pressed', 'true');
  })();

  /* ───────── 4) CNN 그림 ───────── */
  (function cnn() {
    const g1 = $('cnn-l1'), g2 = $('cnn-l2'); if (!g1) return;
    const marks = [
      (x, y, s, g) => el('line', { x1: x + s / 2, y1: y + 12, x2: x + s / 2, y2: y + s - 12, stroke: 'var(--accent-2)', 'stroke-width': 4 }, g),
      (x, y, s, g) => el('line', { x1: x + 12, y1: y + s / 2, x2: x + s - 12, y2: y + s / 2, stroke: 'var(--accent-2)', 'stroke-width': 4 }, g),
      (x, y, s, g) => el('line', { x1: x + 12, y1: y + 12, x2: x + s - 12, y2: y + s - 12, stroke: 'var(--accent-2)', 'stroke-width': 4 }, g),
      (x, y, s, g) => el('circle', { cx: x + s / 2, cy: y + s / 2, r: 6, class: 'f-acc2' }, g),
    ];
    marks.forEach((f, i) => {
      const x = 262 + i * 16, y = 92 + i * 16, s = 140;
      el('rect', { x, y, width: s, height: s, rx: 10, class: 'f-surface', stroke: 'var(--accent)', 'stroke-width': 2 }, g1);
      if (i === 3) { marks.forEach((m, j) => m(x + (j % 2) * 70, y + Math.floor(j / 2) * 70, 70, g1)); }
    });
    el('text', { x: 370, y: 82, 'text-anchor': 'middle', class: 't-sub', style: 'font-size:14px' }, g1).textContent = '필터마다 특징 지도 한 장';
    [['긴 선', (x, y) => el('path', { d: `M${x + 22},${y + 22} L${x + 88},${y + 100}`, stroke: 'var(--accent-2)', 'stroke-width': 6, 'stroke-linecap': 'round' }, g2)],
     ['둥근 번짐', (x, y) => el('circle', { cx: x + 55, cy: y + 62, r: 28, class: 'f-acc2', 'fill-opacity': 0.6 }, g2)]].forEach(([t, f], i) => {
      const x = 548 + i * 118, y = 125;
      el('rect', { x, y, width: 110, height: 140, rx: 10, class: 'f-surface', stroke: 'var(--accent-2)', 'stroke-width': 2 }, g2);
      f(x, y);
      el('text', { x: x + 55, y: y + 130, 'text-anchor': 'middle', class: 't-sub', style: 'font-size:13px' }, g2).textContent = t;
    });
  })();

  /* ───────── 5) 조명 편향 (8×8 이미지, 특징 2개 로지스틱 회귀) ───────── */
  (function lighting() {
    const s = $('lb-s'); if (!s) return;
    const S8 = 8;
    function img(r, dark, bad) {
      const L = dark ? 95 + r() * 30 : 175 + r() * 30, px = [];
      for (let i = 0; i < S8 * S8; i++) px.push(L + gauss(r) * 6);
      if (bad) {                                       // 흠집: 표면보다 20% 어두운 선 (가로·세로·대각선)
        const dir = Math.floor(r() * 3), x = 1 + Math.floor(r() * 4), y = 1 + Math.floor(r() * 4), len = 4 + Math.floor(r() * 3);
        for (let k = 0; k < len; k++) {
          const xx = Math.min(S8 - 1, x + (dir !== 1 ? k : 0)), yy = Math.min(S8 - 1, y + (dir !== 0 ? k : 0));
          px[yy * S8 + xx] = L * 0.8 + gauss(r) * 4;
        }
      }
      return { px, dark, y: bad ? 1 : 0 };
    }
    function feats(im, norm) {
      const m = im.px.reduce((a, b) => a + b) / im.px.length, mn = Math.min(...im.px);
      return norm ? [(mn / m - 0.85) * 10] : [m / 100, mn / 100];  // 보정: 가장 어두운 픽셀 ÷ 평균 밝기
    }
    function fit(d, norm) {
      const F = d.map((im) => feats(im, norm)), k = F[0].length;
      let w = new Array(k + 1).fill(0);
      for (let it = 0; it < 3000; it++) {
        const g = new Array(k + 1).fill(0);
        d.forEach((im, i) => { let z = w[k]; for (let j = 0; j < k; j++) z += w[j] * F[i][j]; const e = sig(z) - im.y; for (let j = 0; j < k; j++) g[j] += e * F[i][j]; g[k] += e; });
        w = w.map((v, j) => v - g[j] / d.length);
      }
      return (im) => { const f = feats(im, norm); let z = w[k]; f.forEach((v, j) => (z += w[j] * v)); return z > 0 ? 1 : 0; };
    }
    const rt = rng(77), testB = [], testD = [];
    for (let i = 0; i < 20; i++) { testB.push(img(rt, false, i % 2 === 0)); testD.push(img(rt, true, i % 2 === 0)); }
    function trainSet(f) {                              // 60장 중 앞쪽 f%가 어두운 조명
      const r = rng(31), nd = Math.round(60 * f), a = [];
      for (let i = 0; i < 60; i++) a.push(img(r, i < nd, i % 2 === 0));
      return a;
    }
    function thumb(im) {
      const d = document.createElement('div'); d.className = 'tcell' + (im.y ? ' bad' : '');
      const c = document.createElement('canvas'); c.width = S8; c.height = S8;
      const ctx = c.getContext('2d'), data = ctx.createImageData(S8, S8);
      im.px.forEach((v, i) => { const g = Math.max(0, Math.min(255, Math.round(v))); data.data.set([g, g, g, 255], i * 4); });
      ctx.putImageData(data, 0, 0); d.appendChild(c); return d;
    }
    const cache = {};
    let norm = false;
    function update() {
      const f = +s.value / 100, key = f + '|' + norm;
      $('lb-o').textContent = Math.round(f * 100) + '%';
      const tr = trainSet(f);
      const model = cache[key] || (cache[key] = fit(tr, norm));
      const tw = $('lb-train'); tw.innerHTML = ''; tr.forEach((im) => tw.appendChild(thumb(im)));
      $('lb-trn').textContent = `밝은 ${tr.filter((x) => !x.dark).length}장 · 어두운 ${tr.filter((x) => x.dark).length}장`;
      const show = (set, id) => {
        const w = $(id); w.innerHTML = ''; let ok = 0, flagged = 0;
        set.forEach((im) => { const p = model(im); const t = thumb(im); if (p !== im.y) t.classList.add('wrong'); else ok++; if (p) flagged++; w.appendChild(t); });
        return { acc: ok / set.length, flagged: flagged / set.length };
      };
      const B = show(testB, 'lb-bright'), D = show(testD, 'lb-dark');
      $('lb-bv').textContent = pct(B.acc); $('lb-dv').textContent = pct(D.acc);
      $('lb-ba').textContent = '정확도 ' + pct(B.acc); $('lb-da').textContent = '정확도 ' + pct(D.acc);
      const st = $('lb-st');
      if (D.acc < 0.7) { st.className = 'status bad'; st.innerHTML = `<b class="k">“어두우면 불량”으로 배운 AI</b>어두운 조명 이미지의 <strong>${pct(D.flagged)}를 불량</strong>이라고 합니다. 훈련 데이터에 어두운 사진이 ${f ? '너무 적습니다' : '한 장도 없습니다'}.`; }
      else if (D.acc < 0.95) { st.className = 'status mid'; st.innerHTML = `<b class="k">나아지는 중 · 어두운 조명 ${pct(D.acc)}</b>` + (norm && !f ? '밝기 보정만으로도 크게 좋아졌습니다. 어두운 사진을 조금 섞어 보세요.' : '어두운 사진을 조금 더 섞거나 밝기 보정을 켜 보세요.'); }
      else { st.className = 'status ok'; st.innerHTML = `<b class="k">조명이 달라도 판정 · 어두운 조명 ${pct(D.acc)}</b>` + (norm && !f ? '밝기 보정(전처리)으로 조명 차이를 줄였습니다. 그래도 가장 확실한 것은 다양한 조건의 데이터입니다.' : `훈련 데이터의 ${Math.round(f * 100)}%만 어두운 사진이어도 크게 좋아졌습니다. <strong>다양한 조건</strong>을 골고루!`); }
    }
    s.addEventListener('input', update);
    $('lb-norm').addEventListener('click', () => { norm = toggle($('lb-norm')); update(); });
    update();
  })();
})();
