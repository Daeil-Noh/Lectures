// 7주차 공통: SVG 그래프를 그리는 작은 도구 모음 + 통계 계산 (데이터는 w07data.js 의 window.W07)
window.P7 = (function () {
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

  /* ── 통계 ── */
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  const mean = (a) => sum(a) / a.length;
  function corr(a, b) {
    const ma = mean(a), mb = mean(b); let ab = 0, aa = 0, bb = 0;
    for (let i = 0; i < a.length; i++) { const x = a[i] - ma, y = b[i] - mb; ab += x * y; aa += x * x; bb += y * y; }
    return ab / Math.sqrt(aa * bb);
  }
  // pandas 기본(linear)과 같은 분위수
  function quantile(a, q) {
    const s = [...a].sort((x, y) => x - y), p = (s.length - 1) * q, i = Math.floor(p);
    return s[i] + (s[Math.min(i + 1, s.length - 1)] - s[i]) * (p - i);
  }
  const pick = (col, mask) => col.filter((_, i) => mask(i));
  // keys 값별 평균: {key: mean}
  function groupMean(vals, keys) {
    const s = {}, n = {};
    vals.forEach((v, i) => { const k = keys[i]; s[k] = (s[k] || 0) + v; n[k] = (n[k] || 0) + 1; });
    const o = {}; for (const k in s) o[k] = s[k] / n[k]; return o;
  }
  function boxStats(a) {
    const q1 = quantile(a, 0.25), med = quantile(a, 0.5), q3 = quantile(a, 0.75), iqr = q3 - q1;
    const lo = Math.min(...a.filter((v) => v >= q1 - 1.5 * iqr)), hi = Math.max(...a.filter((v) => v <= q3 + 1.5 * iqr));
    return { q1, med, q3, lo, hi, out: a.filter((v) => v < lo || v > hi) };
  }
  function histCounts(a, edges) {
    const c = new Array(edges.length - 1).fill(0);
    a.forEach((v) => {
      for (let k = 0; k < c.length; k++) {
        const last = k === c.length - 1;
        if (v >= edges[k] && (v < edges[k + 1] || (last && v <= edges[k + 1]))) { c[k]++; break; }
      }
    });
    return c;
  }

  /* ── 좌표축 ──
     o: { L,R,T,B 여백, x:[x0,x1] 또는 cats:[이름…], y:[y0,y1], yt:[눈금], xt:[눈금], yf, xf, xlab, ylab, clip } */
  function frame(svg, o) {
    svg.innerHTML = '';
    const vb = svg.viewBox.baseVal, W = vb.width, H = vb.height;
    const L = o.L ?? 74, R = W - (o.R ?? 24), T = o.T ?? 22, B = H - (o.B ?? 58);
    const F = { svg, L, R, T, B, W, H };
    const [y0, y1] = o.y;
    F.sy = (v) => B - (v - y0) / (y1 - y0) * (B - T);
    if (o.cats) {
      F.bw = (R - L) / o.cats.length;
      F.sx = (i) => L + F.bw * (i + 0.5);
    } else {
      const [x0, x1] = o.x;
      F.sx = (v) => L + (v - x0) / (x1 - x0) * (R - L);
    }
    F.grid = el('g', {}, svg);
    const yf = o.yf || ((v) => v);
    (o.yt || []).forEach((v) => {
      if (!o.noGrid) el('line', { x1: L, x2: R, y1: F.sy(v), y2: F.sy(v), class: 'p-grid' }, F.grid);
      el('text', { x: L - 10, y: F.sy(v) + 5, 'text-anchor': 'end', class: 'p-tick', style: 'font-size:14px' }, F.grid).textContent = yf(v);
    });
    if (o.cats) {
      o.cats.forEach((c, i) => el('text', { x: F.sx(i), y: B + 24, 'text-anchor': 'middle', class: 'p-tick', style: 'font-size:15px;font-weight:700;fill:var(--text)' }, F.grid).textContent = c);
    } else {
      const xf = o.xf || ((v) => v);
      (o.xt || []).forEach((v) => {
        if (o.xGrid) el('line', { x1: F.sx(v), x2: F.sx(v), y1: T, y2: B, class: 'p-grid' }, F.grid);
        el('text', { x: F.sx(v), y: B + 22, 'text-anchor': 'middle', class: 'p-tick', style: 'font-size:14px' }, F.grid).textContent = xf(v);
      });
    }
    F.axis = el('g', {}, svg);
    el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis', style: 'stroke:var(--muted)' }, F.axis);
    if (!o.noYAxis) el('line', { x1: L, x2: L, y1: T, y2: B, class: 'p-axis', style: 'stroke:var(--muted)' }, F.axis);
    if (o.xlab) F.xl = el('text', { x: (L + R) / 2, y: H - 8, 'text-anchor': 'middle', class: 'p-lab', style: 'font-size:16px' }, svg);
    if (o.xlab) F.xl.textContent = o.xlab;
    if (o.ylab) {
      F.yl = el('text', { x: 18, y: (T + B) / 2, 'text-anchor': 'middle', class: 'p-lab', style: 'font-size:16px', transform: `rotate(-90 18 ${(T + B) / 2})` }, svg);
      F.yl.textContent = o.ylab;
    }
    if (o.clip) {
      const id = svg.id + '-clip';
      const cp = el('clipPath', { id }, svg); el('rect', { x: L, y: T - 2, width: R - L, height: B - T + 2 }, cp);
      F.g = el('g', { 'clip-path': `url(#${id})` }, svg);
    } else F.g = el('g', {}, svg);
    F.top = el('g', {}, svg);
    return F;
  }

  // 막대: vals 와 같은 길이의 cats 기준. opt: {w:막대 폭 비율, color(i), label(v,i), base(축 시작값)}
  function bars(F, vals, opt = {}) {
    const w = F.bw * (opt.w || 0.56), base = opt.base ?? 0;
    vals.forEach((v, i) => {
      const y = F.sy(Math.max(v, base)), yb = F.sy(base);
      el('rect', { x: F.sx(i) - w / 2, y, width: w, height: Math.max(0, yb - y), rx: 6, fill: opt.color ? opt.color(i) : 'var(--accent)' }, F.g);
      if (opt.label) el('text', { x: F.sx(i), y: y - 10, 'text-anchor': 'middle', class: 'p-lab', style: 'font-size:18px' }, F.top).textContent = opt.label(v, i);
    });
  }
  function line(F, xs, ys, attrs) {
    return el('polyline', Object.assign({ points: xs.map((x, i) => F.sx(x).toFixed(1) + ',' + F.sy(ys[i]).toFixed(1)).join(' '), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, attrs || {}), F.g);
  }
  function dots(F, xs, ys, attrs, r) {
    const g = el('g', attrs || { fill: 'var(--accent)', 'fill-opacity': 0.45 }, F.g);
    xs.forEach((x, i) => el('circle', { cx: F.sx(x).toFixed(1), cy: F.sy(ys[i]).toFixed(1), r: r || 4 }, g));
    return g;
  }
  function hist(F, a, edges, attrs) {
    const c = histCounts(a, edges), g = el('g', {}, F.g);
    c.forEach((n, k) => {
      const x0 = F.sx(edges[k]), x1 = F.sx(edges[k + 1]), y = F.sy(n);
      el('rect', Object.assign({ x: x0 + 0.5, y, width: Math.max(0, x1 - x0 - 1), height: F.B - y, fill: 'var(--accent)' }, attrs || {}), g);
    });
    return c;
  }
  // 세로 상자그림 (범주 i 위치)
  function box(F, i, a, color) {
    const s = boxStats(a), w = F.bw * 0.36, x = F.sx(i), c = color || 'var(--accent)';
    const g = el('g', {}, F.g);
    el('line', { x1: x, x2: x, y1: F.sy(s.hi), y2: F.sy(s.q3), stroke: c, 'stroke-width': 2.5 }, g);
    el('line', { x1: x, x2: x, y1: F.sy(s.q1), y2: F.sy(s.lo), stroke: c, 'stroke-width': 2.5 }, g);
    el('line', { x1: x - w / 3, x2: x + w / 3, y1: F.sy(s.hi), y2: F.sy(s.hi), stroke: c, 'stroke-width': 2.5 }, g);
    el('line', { x1: x - w / 3, x2: x + w / 3, y1: F.sy(s.lo), y2: F.sy(s.lo), stroke: c, 'stroke-width': 2.5 }, g);
    el('rect', { x: x - w / 2, y: F.sy(s.q3), width: w, height: F.sy(s.q1) - F.sy(s.q3), rx: 6, fill: 'var(--surface)', stroke: c, 'stroke-width': 2.5 }, g);
    el('rect', { x: x - w / 2, y: F.sy(s.q3), width: w, height: F.sy(s.q1) - F.sy(s.q3), rx: 6, fill: c, 'fill-opacity': 0.15 }, g);
    el('line', { x1: x - w / 2, x2: x + w / 2, y1: F.sy(s.med), y2: F.sy(s.med), stroke: 'var(--accent-2)', 'stroke-width': 4 }, g);
    s.out.forEach((v) => el('circle', { cx: x, cy: F.sy(v), r: 4.5, fill: 'none', stroke: c, 'stroke-width': 2 }, g));
    return s;
  }
  const text = (parent, x, y, s, style, anchor) => { const t = el('text', { x, y, 'text-anchor': anchor || 'start', class: 'p-tick', style: style || '' }, parent); t.textContent = s; return t; };

  // 보기 좋은 눈금: [lo, hi] 를 감싸는 1·2·2.5·5 단위 눈금
  function nice(lo, hi, n) {
    const raw = (hi - lo) / (n || 5), mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
    const a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step, ticks = [];
    for (let v = a; v <= b + step / 2; v += step) ticks.push(+v.toFixed(6));
    return { lo: a, hi: b, ticks, step };
  }

  // 파이썬 코드 색 입히기 (slides.js 와 같은 규칙, 동적으로 바뀌는 코드용)
  function hl(src) {
    const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const KW = /^(import|from|as|def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|print|class|with|try|except|lambda|pass|break|continue|range|len)$/;
    const re = /(#[^\n]*)|("""[\s\S]*?"""|'[^'\n]*'|"[^"\n]*"|f'[^'\n]*'|f"[^"\n]*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_가-힣][A-Za-z0-9_가-힣]*)(?=\s*\()|([A-Za-z_][A-Za-z0-9_]*)/g;
    let out = '', i = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(i, m.index));
      if (m[1]) out += '<span class="c">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="s">' + esc(m[2]) + '</span>';
      else if (m[3]) out += '<span class="n">' + m[3] + '</span>';
      else if (m[4]) out += (KW.test(m[4]) ? '<span class="k">' : '<span class="f">') + esc(m[4]) + '</span>';
      else out += KW.test(m[5]) ? '<span class="k">' + m[5] + '</span>' : m[5];
      i = re.lastIndex;
    }
    return out + esc(src.slice(i));
  }

  return { el, $, rng, gauss, sum, mean, corr, quantile, pick, groupMean, boxStats, histCounts, frame, bars, line, dots, hist, box, text, nice, hl };
})();
