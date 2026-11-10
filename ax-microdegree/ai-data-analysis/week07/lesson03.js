// 7주 3차시 전용: r 눈금 그림, 상관계수 슬라이더, 공정 변수 고르기, 온도 곡선, corr 순위, 야간 불량·교란 변수 데모
(function () {
  const D = window.W07, P = window.P7; if (!D || !P) return;
  const { el, $, frame, bars, dots, text, mean, corr, pick, rng, gauss, nice } = P;
  const N = D.n, idx = [...Array(N).keys()];
  const pct = (v) => v.toFixed(1) + '%';
  const rate = (mask) => { const s = idx.filter(mask); return { r: 100 * s.filter((i) => D.defect[i]).length / s.length, n: s.length }; };
  const f2 = (v) => (v < -0.005 ? '−' : '') + Math.abs(v).toFixed(2);
  const strengthWord = (r) => { const a = Math.round(Math.abs(r) * 100) / 100; const d = r > 0 ? '양(+)의' : '음(−)의'; return a >= 0.7 ? `강한 ${d} 관계` : a >= 0.3 ? `보통 정도의 ${d} 관계` : a >= 0.1 ? `약한 ${d} 관계` : '직선 관계가 거의 없음'; };
  // 최소제곱 직선 y = a + b x
  function fitLine(x, y) { const mx = mean(x), my = mean(y); let sxy = 0, sxx = 0; x.forEach((v, i) => { sxy += (v - mx) * (y[i] - my); sxx += (v - mx) ** 2; }); const b = sxy / sxx; return { a: my - b * mx, b }; }
  // 2차식 y = c0 + c1 t + c2 t², t = x - x0 (정규방정식)
  function fitQuad(x, y, x0) {
    const S = [0, 0, 0, 0, 0], T = [0, 0, 0];
    x.forEach((v, i) => { const t = v - x0; let p = 1; for (let k = 0; k < 5; k++) { S[k] += p; if (k < 3) T[k] += p * y[i]; p *= t; } });
    const A = [[S[0], S[1], S[2], T[0]], [S[1], S[2], S[3], T[1]], [S[2], S[3], S[4], T[2]]];
    for (let c = 0; c < 3; c++) { for (let r = c + 1; r < 3; r++) { const f = A[r][c] / A[c][c]; for (let k = c; k < 4; k++) A[r][k] -= f * A[c][k]; } }
    const z = [0, 0, 0]; for (let r = 2; r >= 0; r--) { let s = A[r][3]; for (let k = r + 1; k < 3; k++) s -= A[r][k] * z[k]; z[r] = s / A[r][r]; }
    const f = (v) => z[0] + z[1] * (v - x0) + z[2] * (v - x0) ** 2;
    f.peak = x0 - z[1] / (2 * z[2]);
    return f;
  }
  // 목표 r을 정확히 갖는 점구름 (x와 직교시킨 잡음 사용)
  function cloud(n, seed) {
    const r = rng(seed), x = [], z = [];
    for (let i = 0; i < n; i++) { x.push(gauss(r)); z.push(gauss(r)); }
    const std = (a) => { const m = mean(a), s = Math.sqrt(mean(a.map((v) => (v - m) ** 2))); return a.map((v) => (v - m) / s); };
    const xs = std(x); let zs = std(z); const k = mean(zs.map((v, i) => v * xs[i])); zs = std(zs.map((v, i) => v - k * xs[i]));
    return (rho) => ({ x: xs, y: xs.map((v, i) => rho * v + Math.sqrt(Math.max(0, 1 - rho * rho)) * zs[i]) });
  }

  /* ── 도입 산점도 ── */
  (function intro() {
    const svg = $('c-intro'); if (!svg) return;
    const F = frame(svg, { x: [60, 100], y: [26, 48], xt: [60, 70, 80, 90, 100], yt: [28, 32, 36, 40, 44, 48], xlab: '사출 압력 (bar)', ylab: '인장강도 (MPa)', xGrid: true, clip: true });
    dots(F, D.pressure, D.strength, { fill: 'var(--accent)', 'fill-opacity': 0.4 }, 4);
  })();

  /* ── r 눈금 그림 ── */
  (function scale() {
    const wrap = $('scale'); if (!wrap) return;
    const mk = cloud(120, 5);
    [-0.9, -0.5, 0, 0.5, 0.9].forEach((rho) => {
      const t = document.createElement('div'); t.className = 'tile';
      const { x, y } = mk(rho);
      t.innerHTML = `<svg viewBox="0 0 200 140" aria-hidden="true"></svg><div style="font-size:19px;font-weight:800;color:${rho < 0 ? 'var(--accent-2)' : rho > 0 ? 'var(--accent)' : 'var(--text)'}">r = ${f2(corr(x, y))}</div>`;
      wrap.appendChild(t);
      const svg = t.querySelector('svg');
      el('rect', { x: 2, y: 2, width: 196, height: 136, rx: 10, fill: 'var(--surface-2)' }, svg);
      const g = el('g', { fill: rho < 0 ? 'var(--accent-2)' : 'var(--accent)', 'fill-opacity': 0.6 }, svg);
      x.forEach((v, i) => el('circle', { cx: 100 + v * 28, cy: 70 - y[i] * 19, r: 3 }, g));
    });
  })();

  /* ───────── 직접 해 보기 1: r 슬라이더 ───────── */
  (function rdemo() {
    const svg = $('rdemo'), s = $('rd-s'); if (!svg) return;
    const mk = cloud(200, 17), bL = $('rd-line'), bO = $('rd-out');
    const tog = (b) => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); update(); };
    function update() {
      const rho = +s.value, { x, y } = mk(rho);
      const out = bO.getAttribute('aria-pressed') === 'true', line = bL.getAttribute('aria-pressed') === 'true';
      const X = x.slice(), Y = y.slice();
      const oy = rho >= 0 ? -3.2 : 3.2;
      if (out) { X.push(3.3); Y.push(oy); }
      const r0 = corr(x, y), r = corr(X, Y);
      const F = frame(svg, { x: [-3.6, 3.6], y: [-3.6, 3.6], xt: [-3, -2, -1, 0, 1, 2, 3], yt: [-3, -2, -1, 0, 1, 2, 3], xlab: '변수 X (표준화) →', ylab: '변수 Y (표준화) →', xGrid: true, clip: true });
      dots(F, x, y, { fill: 'var(--accent)', 'fill-opacity': 0.45 }, 4.5);
      if (out) {
        el('circle', { cx: F.sx(3.3), cy: F.sy(oy), r: 8, fill: 'var(--accent-2)' }, F.g);
        el('circle', { cx: F.sx(3.3), cy: F.sy(oy), r: 14, fill: 'none', stroke: 'var(--bad)', 'stroke-width': 2.5 }, F.g);
      }
      if (line) { const { a, b } = fitLine(X, Y); el('line', { x1: F.sx(-3.6), y1: F.sy(a - 3.6 * b), x2: F.sx(3.6), y2: F.sy(a + 3.6 * b), class: 'p-line' }, F.g); }
      $('rd-o').textContent = f2(rho);
      $('rd-r').textContent = f2(r);
      $('rd-r').classList.toggle('o', r < 0);
      const st = $('rd-st');
      const a = Math.round(Math.abs(r) * 100) / 100;
      st.className = 'status ' + (a >= 0.7 ? 'ok' : a >= 0.3 ? 'mid' : 'bad');
      let m = `<b class="k">${strengthWord(r)}</b>`;
      m += a >= 0.95 ? '점들이 거의 한 줄로 늘어섭니다.' : a >= 0.7 ? '뚜렷한 띠 모양 — 그래도 띠 안에서 흩어져 있습니다.' : a >= 0.3 ? '경향은 보이지만 흩어짐이 큽니다.' : '둥근 구름 모양 — 한쪽이 커져도 다른 쪽을 짐작하기 어렵습니다.';
      if (out) m += ` <br><strong>점 하나</strong>로 r이 ${f2(r0)} → ${f2(r)}로 바뀌었습니다. 이상치는 r을 크게 흔듭니다(6주차).`;
      st.innerHTML = m;
    }
    s.addEventListener('input', update);
    bL.addEventListener('click', () => tog(bL)); bO.addEventListener('click', () => tog(bO));
    update();
  })();

  /* ───────── 직접 해 보기 2: 공정 변수 고르기 ───────── */
  const VAR = {
    pressure: { nm: '압력', ax: '사출 압력 (bar)' }, thickness: { nm: '두께', ax: '두께 (mm)' }, humidity: { nm: '습도', ax: '습도 (%)' },
    speed: { nm: '속도', ax: '속도 (rpm)' }, temp: { nm: '온도', ax: '사출 온도 (℃)' },
  };
  function binMeans(x, y, k) {
    const o = x.map((v, i) => i).sort((a, b) => x[a] - x[b]), res = [];
    for (let j = 0; j < k; j++) { const part = o.slice(Math.round(j * o.length / k), Math.round((j + 1) * o.length / k)); res.push([mean(part.map((i) => x[i])), mean(part.map((i) => y[i]))]); }
    return res;
  }
  (function vs() {
    const svg = $('vs'); if (!svg) return;
    const bL = $('vs-line'), bB = $('vs-bin'); let v = 'pressure';
    const tog = (b) => { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); render(); };
    function render() {
      document.querySelectorAll('#vs-btns button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === v));
      const x = D[v], y = D.strength, r = corr(x, y), nx = nice(Math.min(...x), Math.max(...x), 5);
      const F = frame(svg, { x: [nx.lo, nx.hi], y: [26, 48], xt: nx.ticks, xf: (t) => +t.toFixed(3), yt: [28, 32, 36, 40, 44, 48], xlab: VAR[v].ax, ylab: '인장강도 (MPa)', xGrid: true, clip: true });
      dots(F, x, y, { fill: 'var(--accent)', 'fill-opacity': 0.35 }, 4);
      const line = bL.getAttribute('aria-pressed') === 'true', bin = bB.getAttribute('aria-pressed') === 'true';
      if (line) { const { a, b } = fitLine(x, y); el('line', { x1: F.sx(nx.lo), y1: F.sy(a + b * nx.lo), x2: F.sx(nx.hi), y2: F.sy(a + b * nx.hi), class: 'p-line' }, F.g); }
      let bm = null;
      if (bin) {
        bm = binMeans(x, y, 8);
        el('polyline', { points: bm.map(([a, b]) => F.sx(a) + ',' + F.sy(b)).join(' '), fill: 'none', stroke: 'var(--text)', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, F.g);
        bm.forEach(([a, b]) => el('circle', { cx: F.sx(a), cy: F.sy(b), r: 6, fill: 'var(--surface)', stroke: 'var(--text)', 'stroke-width': 3 }, F.g));
      }
      $('vs-lbl').textContent = VAR[v].nm + ' ↔ 인장강도 상관계수';
      $('vs-r').textContent = f2(r); $('vs-r').classList.toggle('o', r < 0);
      const st = $('vs-st'), a = Math.round(Math.abs(r) * 100) / 100;
      if (v === 'temp') {
        if (bin) { const top = bm.reduce((p, q) => (q[1] > p[1] ? q : p)); st.className = 'status mid'; st.innerHTML = `<b class="k">숫자는 약한데, 모양은 뚜렷!</b>구간 평균선이 <strong>산 모양</strong> — ${top[0].toFixed(0)}℃ 근처 구간이 가장 강합니다(평균 ${top[1].toFixed(1)} MPa). 직선이 아니라서 r이 작게 나왔습니다.`; }
        else { st.className = 'status bad'; st.innerHTML = `<b class="k">${strengthWord(r)}?</b>r만 보면 온도는 강도와 상관없어 보입니다. <strong>구간 평균선</strong>을 켜 보세요.`; }
      } else {
        st.className = 'status ' + (a >= 0.7 ? 'ok' : a >= 0.3 ? 'mid' : 'bad');
        st.innerHTML = `<b class="k">${strengthWord(r)}</b>` + (v === 'pressure' ? '다섯 변수 중 가장 강합니다. 압력이 높은 제품일수록 강도가 높은 경향.' : v === 'thickness' ? '두꺼운 제품이 조금 더 강한 경향. 흩어짐이 큽니다.' : v === 'humidity' ? '습할수록 조금 약해지는 경향 — 방향이 반대(−)입니다.' : '거의 수평 — 속도와 강도는 직선 관계가 약합니다.');
      }
    }
    document.querySelectorAll('#vs-btns button').forEach((b) => b.addEventListener('click', () => { v = b.dataset.v; render(); }));
    bL.addEventListener('click', () => tog(bL)); bB.addEventListener('click', () => tog(bB));
    render();
  })();

  /* ── 온도의 함정 ── */
  (function tempTrap() {
    const svg = $('c-temp'); if (!svg) return;
    const x = D.temp, y = D.strength, q = fitQuad(x, y, 210), r = corr(x, y);
    const F = frame(svg, { x: [190, 240], y: [26, 48], xt: [190, 200, 210, 220, 230, 240], yt: [28, 32, 36, 40, 44, 48], xlab: '사출 온도 (℃)', ylab: '인장강도 (MPa)', xGrid: true, clip: true });
    dots(F, x, y, { fill: 'var(--accent)', 'fill-opacity': 0.35 }, 4);
    const { a, b } = fitLine(x, y);
    el('line', { x1: F.sx(190), y1: F.sy(a + b * 190), x2: F.sx(240), y2: F.sy(a + b * 240), class: 'p-line2' }, F.g);
    let d = '';
    for (let t = 191; t <= 236; t += 0.5) d += (d ? 'L' : 'M') + F.sx(t).toFixed(1) + ',' + F.sy(q(t)).toFixed(1);
    const best = [q.peak, q(q.peak)];
    el('path', { d, fill: 'none', stroke: 'var(--accent-2)', 'stroke-width': 4 }, F.g);
    el('line', { x1: F.sx(best[0]), x2: F.sx(best[0]), y1: F.T + 30, y2: F.B, stroke: 'var(--accent-2)', 'stroke-width': 1.5, 'stroke-dasharray': '4 5' }, F.top);
    el('rect', { x: F.sx(best[0]) - 70, y: F.T + 2, width: 140, height: 28, rx: 8, fill: 'var(--surface)', stroke: 'var(--accent-2)', 'stroke-width': 2 }, F.top);
    text(F.top, F.sx(best[0]), F.T + 22, `꼭대기 ≈ ${best[0].toFixed(0)}℃`, 'font-size:16px;font-weight:800;fill:var(--accent-2)', 'middle');
    text(F.top, F.R - 8, F.B - 12, `직선으로 보면 r = ${f2(r)} (점선)`, 'font-size:15px;font-weight:700', 'end');
    $('tp-d').innerHTML = `${best[0].toFixed(0)}℃ 부근에서 강도가 가장 높고, 너무 낮거나 높으면 약해진다 (<strong style="color:var(--text)">산 모양 곡선</strong>)`;
  })();

  /* ── corr 순위 ── */
  (function corrRank() {
    const out = $('corr-out'), svg = $('c-corr'); if (!out) return;
    const cols = ['temp', 'pressure', 'speed', 'humidity', 'thickness', 'strength'];
    const r = cols.map((c) => [c, corr(D[c], D.strength)]).sort((p, q) => p[1] - q[1]);
    out.textContent = r.map(([c, v]) => c.padEnd(10) + (v < 0 ? '' : ' ') + v.toFixed(2).padStart(5)).join('\n') + '\nName: strength, dtype: float64';
    const rows = r.filter(([c]) => c !== 'strength').reverse();
    const L = 120, R = 500, T = 16, H = 46, x0 = (L + R) / 2, sx = (v) => x0 + v * (R - L) / 2;
    [-1, -0.5, 0, 0.5, 1].forEach((v) => { el('line', { x1: sx(v), x2: sx(v), y1: T - 4, y2: T + H * 5, class: v ? 'p-grid' : 'p-axis', style: v ? '' : 'stroke:var(--muted)' }, svg); text(svg, sx(v), T + H * 5 + 20, v, 'font-size:13px', 'middle'); });
    rows.forEach(([c, v], k) => {
      const y = T + k * H + 8;
      el('rect', { x: Math.min(sx(0), sx(v)), y, width: Math.abs(sx(v) - sx(0)), height: H - 16, rx: 5, fill: c === 'temp' ? 'var(--accent-2)' : v > 0 ? 'var(--accent)' : 'var(--muted)' }, svg);
      text(svg, L - 12, y + (H - 16) / 2 + 5, VAR[c].nm, 'font-size:16px;font-weight:800;fill:var(--text)', 'end');
      text(svg, v > 0 ? sx(v) + 8 : sx(v) - 8, y + (H - 16) / 2 + 5, f2(v), 'font-size:15px;font-weight:800;fill:var(--text)', v > 0 ? 'start' : 'end');
    });
    text(svg, (L + R) / 2, T + H * 5 + 40, '인장강도와의 상관계수 r', 'font-size:14px;font-weight:700;fill:var(--text)', 'middle');
  })();

  /* ── 야간 불량 ── */
  const SH = [['주간', (i) => !D.night[i]], ['야간', (i) => D.night[i]]];
  (function night() {
    const svg = $('c-night'); if (!svg) return;
    const panel = (x0, w, ttl, vals, ymax, yt, fmt) => {
      const g = el('g', {}, svg), T = 50, B = 268, sy = (v) => B - v / ymax * (B - T);
      text(g, x0 + w / 2, 26, ttl, 'font-size:17px;font-weight:800;fill:var(--text)', 'middle');
      yt.forEach((v) => { el('line', { x1: x0 + 30, x2: x0 + w, y1: sy(v), y2: sy(v), class: 'p-grid' }, g); text(g, x0 + 24, sy(v) + 4, v, 'font-size:12px', 'end'); });
      el('line', { x1: x0 + 30, x2: x0 + w, y1: B, y2: B, stroke: 'var(--muted)', 'stroke-width': 1.5 }, g);
      vals.forEach((v, k) => {
        const cx = x0 + 30 + (w - 30) * (k + 0.5) / 2, bw = (w - 30) * 0.32;
        el('rect', { x: cx - bw / 2, y: sy(v), width: bw, height: B - sy(v), rx: 5, fill: k ? 'var(--accent-2)' : 'var(--accent)' }, g);
        text(g, cx, sy(v) - 8, fmt(v), 'font-size:16px;font-weight:800;fill:var(--text)', 'middle');
        text(g, cx, B + 20, SH[k][0], 'font-size:15px;font-weight:700;fill:var(--text)', 'middle');
      });
    };
    panel(0, 250, '불량률 (%)', SH.map(([, m]) => rate(m).r), 25, [0, 5, 10, 15, 20, 25], pct);
    panel(265, 250, '평균 습도 (%)', SH.map(([, m]) => mean(pick(D.humidity, m))), 70, [0, 20, 40, 60], (v) => v.toFixed(1));
    const t = SH.map(([, m]) => mean(pick(D.temp, m)));
    el('rect', { x: 10, y: 312, width: 500, height: 54, rx: 12, fill: 'var(--surface-2)' }, svg);
    text(svg, 260, 345, `평균 사출 온도  주간 ${t[0].toFixed(1)}℃  ·  야간 ${t[1].toFixed(1)}℃ (+${(t[1] - t[0]).toFixed(1)}℃)`, 'font-size:16px;font-weight:800;fill:var(--text)', 'middle');
  })();

  /* ───────── 직접 해 보기 3: 교란 변수 ───────── */
  (function conf() {
    const svg = $('conf'); if (!svg) return;
    const BAND = [['50 이하', (v) => v <= 50], ['50~60', (v) => v > 50 && v <= 60], ['60~70', (v) => v > 60 && v <= 70], ['70 초과', (v) => v > 70]];
    const inB = (k) => (i) => BAND[k][1](D.humidity[i]);
    const all = SH.map(([, m]) => rate(m)), hum = BAND.map((_, k) => rate(inB(k)));
    const strat = BAND.map((_, k) => SH.map(([, m]) => rate((i) => inB(k)(i) && m(i))));
    const hm = SH.map(([, m]) => mean(pick(D.humidity, m)));
    const nLab = (F, x, n) => text(F.top, x, F.B + 42, 'n=' + n, 'font-size:13px', 'middle');
    const V = {
      all() {
        const F = frame(svg, { cats: ['주간', '야간'], y: [0, 50], yt: [0, 10, 20, 30, 40, 50], yf: (v) => v + '%', ylab: '불량률 (%)', B: 66 });
        bars(F, all.map((o) => o.r), { w: 0.42, color: (i) => (i ? 'var(--accent-2)' : 'var(--accent)'), label: pct });
        all.forEach((o, i) => nLab(F, F.sx(i), o.n));
        return `<b class="k">차이 ${(all[1].r - all[0].r).toFixed(1)}%p — 야간 근무 탓?</b>그런데 두 교대는 <strong>습도</strong>도 다릅니다: 평균 주간 ${hm[0].toFixed(1)}% · 야간 ${hm[1].toFixed(1)}%.`;
      },
      hum() {
        const F = frame(svg, { cats: BAND.map((b) => b[0]), y: [0, 50], yt: [0, 10, 20, 30, 40, 50], yf: (v) => v + '%', ylab: '불량률 (%)', xlab: '습도 구간 (%)', B: 66 });
        bars(F, hum.map((o) => o.r), { w: 0.5, color: () => 'var(--muted)', label: pct });
        hum.forEach((o, i) => nLab(F, F.sx(i) + 34, o.n));
        return `<b class="k">습할수록 불량이 많다</b>교대와 상관없이 습도만으로 나눠 봐도 ${pct(hum[0].r)} → ${pct(hum[3].r)}로 올라갑니다.`;
      },
      mix() {
        const F = frame(svg, { cats: BAND.map((b) => b[0]), y: [0, 100], yt: [0, 25, 50, 75, 100], yf: (v) => v + '%', ylab: '구간 안 제품 비율 (%)', xlab: '습도 구간 (%)', B: 66, T: 44 });
        const w = F.bw * 0.56, sh = BAND.map((_, k) => { const s = idx.filter(inB(k)); return 100 * s.filter((i) => D.night[i]).length / s.length; });
        sh.forEach((p, k) => {
          el('rect', { x: F.sx(k) - w / 2, y: F.sy(100), width: w, height: F.sy(p) - F.sy(100), fill: 'var(--accent)' }, F.g);
          el('rect', { x: F.sx(k) - w / 2, y: F.sy(p), width: w, height: F.B - F.sy(p), fill: 'var(--accent-2)' }, F.g);
          text(F.top, F.sx(k), F.sy(p) + 22, '야간 ' + Math.round(p) + '%', 'font-size:15px;font-weight:800;fill:var(--surface)', 'middle');
          nLab(F, F.sx(k) + 34, hum[k].n);
        });
        [['var(--accent-2)', '야간'], ['var(--accent)', '주간']].forEach(([c, t], k) => { el('rect', { x: F.L + 10 + k * 80, y: 14, width: 14, height: 14, rx: 3, fill: c }, svg); text(svg, F.L + 30 + k * 80, 26, t, 'font-size:14px;font-weight:700;fill:var(--text)'); });
        return `<b class="k">습한 구간에 야간 제품이 몰려 있다</b>습도 70% 초과 구간의 ${Math.round(sh[3])}%가 야간 제품입니다. 야간 ↔ 습도 ↔ 불량이 <strong>얽혀</strong> 있습니다.`;
      },
      strat() {
        const F = frame(svg, { cats: BAND.map((b) => b[0]), y: [0, 50], yt: [0, 10, 20, 30, 40, 50], yf: (v) => v + '%', ylab: '불량률 (%)', xlab: '습도 구간 (%)', B: 66, T: 44 });
        const w = F.bw * 0.32;
        strat.forEach((pair, k) => pair.forEach((o, j) => {
          const cx = F.sx(k) + (j ? w / 2 + 3 : -w / 2 - 3);
          el('rect', { x: cx - w / 2, y: F.sy(o.r), width: w, height: F.B - F.sy(o.r), rx: 4, fill: j ? 'var(--accent-2)' : 'var(--accent)' }, F.g);
          text(F.top, cx, F.sy(o.r) - 7, o.r.toFixed(1), 'font-size:14px;font-weight:800;fill:var(--text)', 'middle');
          text(F.top, cx, F.B + 42, o.n, 'font-size:12px', 'middle');
        }));
        [['var(--accent)', '주간'], ['var(--accent-2)', '야간']].forEach(([c, t], k) => { el('rect', { x: F.L + 10 + k * 80, y: 14, width: 14, height: 14, rx: 3, fill: c }, svg); text(svg, F.L + 30 + k * 80, 26, t, 'font-size:14px;font-weight:700;fill:var(--text)'); });
        const gap = strat.map((p) => p[1].r - p[0].r), mn = gap.indexOf(Math.min(...gap));
        return `<b class="k">습도를 맞추면? 차이가 들쭉날쭉</b>${BAND[mn][0]}% 구간에선 ${gap[mn].toFixed(1)}%p로 거의 같지만, 다른 구간에선 여전히 야간이 높습니다. → 습도는 차이의 <strong>일부</strong>를 설명할 뿐, 데이터에 없는 다른 요인도 있을 수 있습니다. 관찰 데이터만으로는 <strong>원인을 확정할 수 없습니다</strong>. (n이 작은 칸은 우연의 영향도 큼)`;
      },
    };
    const btns = document.querySelectorAll('#cf-btns button');
    function show(k) { btns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === k)); $('cf-st').innerHTML = V[k](); }
    btns.forEach((b) => b.addEventListener('click', () => show(b.dataset.v)));
    show('all');
  })();
})();
