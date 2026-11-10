// 7주 2차시 전용: 그래프 구조 그림, 코드 한 줄씩 켜기, 코드+결과 그래프(실제 데이터), 히스토그램 bins, 그래프 코드 만들기 도구
(function () {
  const D = window.W07, P = window.P7; if (!D || !P) return;
  const { el, $, frame, bars, line, dots, box, text, mean, pick, histCounts, nice, hl, quantile } = P;
  const N = D.n, idx = [...Array(N).keys()];
  const rate = (mask) => { const s = idx.filter(mask); return 100 * s.filter((i) => D.defect[i]).length / s.length; };
  const title = (F, s) => text(F.top, (F.L + F.R) / 2, 24, s, 'font-size:17px;font-weight:800;fill:var(--text)', 'middle');
  const legend = (svg, x, y, items) => items.forEach(([c, t], k) => {
    el('circle', { cx: x + 7, cy: y + k * 22 - 4, r: 6, fill: c }, svg);
    text(svg, x + 20, y + k * 22 + 1, t, 'font-size:14px;font-weight:700;fill:var(--text)');
  });

  /* ───────── 그래프의 구조 ───────── */
  (function anat() {
    const svg = $('anat'); if (!svg) return;
    const F = frame(svg, { cats: ['주간', '야간'], y: [0, 22], yt: [0, 5, 10, 15, 20], ylab: '불량률 (%)', L: 150, R: 70, T: 96, B: 112 });
    bars(F, [7.0, 20.3], { w: 0.5 });
    el('rect', { x: 92, y: 40, width: F.R - 92 + 40, height: F.B + 66 - 40, rx: 14, fill: 'none', stroke: 'var(--accent-2)', 'stroke-width': 2.5, 'stroke-dasharray': '8 6' }, svg);
    el('rect', { x: F.L, y: F.T, width: F.R - F.L, height: F.B - F.T, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.5 }, svg);
    text(svg, (F.L + F.R) / 2, 76, '교대별 불량률', 'font-size:18px;font-weight:800;fill:var(--text)', 'middle');
    text(svg, (F.L + F.R) / 2, F.B + 58, '교대', 'font-size:16px;font-weight:700;fill:var(--text)', 'middle');
    const tag = (x, y, s, c, anchor) => text(svg, x, y, s, `font-size:14px;font-weight:800;fill:${c || 'var(--accent)'}`, anchor);
    tag(100, 30, 'fig — 그림 전체(도화지)', 'var(--accent-2)');
    tag(F.L + 10, F.T + 20, 'ax — 그래프 한 칸', 'var(--accent)');
    tag(F.R + 34, 70, 'ax.set_title()', 'var(--accent)', 'end');
    tag(F.R + 34, F.B + 58, 'ax.set_xlabel()', 'var(--accent)', 'end');
    tag(104, F.T - 8, 'ax.set_ylabel()', 'var(--accent)');
    tag(F.sx(1) + 48, F.sy(12), '← ax.bar()', 'var(--accent)');
    tag(100, F.B + 46, '눈금: 자동', 'var(--muted)');
  })();

  /* ───────── 직접 해 보기 1: 한 줄씩 켜기 ───────── */
  (function lines() {
    const pre = $('ln-code'), svg = $('ln-chart'); if (!pre) return;
    const R = [rate((i) => D.night[i]), rate((i) => !D.night[i])];
    const st = { kor: true, title: false, x: false, y: false, lab: false };
    const L = [
      { t: 'import matplotlib.pyplot as plt' },
      { t: 'import koreanize_matplotlib', k: 'kor' },
      { t: "rate = df.groupby('shift')['defect'].mean() * 100" },
      { t: 'fig, ax = plt.subplots()' },
      { t: 'bars = ax.bar(rate.index, rate.values)' },
      { t: "ax.set_title('야간 불량률이 주간의 약 3배')", k: 'title' },
      { t: "ax.set_xlabel('교대')", k: 'x' },
      { t: "ax.set_ylabel('불량률 (%)')", k: 'y' },
      { t: "ax.bar_label(bars, fmt='%.1f')", k: 'lab' },
      { t: 'plt.show()' },
    ];
    let last = null;
    function render() {
      pre.innerHTML = L.map((l, j) => {
        if (!l.k) return `<span class="ln"><span class="sp"></span>${hl(l.t)}</span>`;
        const on = st[l.k];
        return `<span class="ln opt${on ? ' on' : ''}" data-j="${j}" role="button" tabindex="0" aria-pressed="${on}"><span class="cb"></span>${hl(on ? l.t : '# ' + l.t)}</span>`;
      }).join('');
      const T = (s) => (st.kor ? s : s.replace(/[가-힣]/g, '□'));
      const F = frame(svg, { cats: ['야간', '주간'].map(T), y: [0, 22], yt: [0, 5, 10, 15, 20], ylab: st.y ? T('불량률 (%)') : '', xlab: st.x ? T('교대') : '', T: 50 });
      bars(F, R, { w: 0.55, label: st.lab ? (v) => v.toFixed(1) : null });
      if (st.title) title(F, T('야간 불량률이 주간의 약 3배'));
      const s = $('ln-st');
      const named = ['title', 'x', 'y', 'lab'].filter((k) => st[k]).length;
      if (!st.kor) { s.className = 'status bad'; s.innerHTML = '<b class="k">한글이 □□로 깨짐</b>Colab에는 경고 <code>Glyph … missing from font(s)</code>가 뜹니다. 기본 글꼴에 한글이 없기 때문 — koreanize 줄을 다시 켜세요.'; }
      else if (named === 4) { s.className = 'status ok'; s.innerHTML = '<b class="k">완성!</b>제목이 결론을 말하고, 축 이름·단위와 값까지 보입니다. 보고서에 그대로 넣을 수 있는 그래프.'; }
      else {
        s.className = 'status mid';
        const what = { title: '<code>set_title</code> → 맨 위 제목', x: '<code>set_xlabel</code> → x축 이름', y: '<code>set_ylabel</code> → y축 이름', lab: '<code>bar_label</code> → 막대 위 숫자', kor: 'koreanize → 한글 표시' };
        s.innerHTML = `<b class="k">이름표 ${named} / 4</b>` + (last ? what[last] + (st[last] ? ' 이(가) 생겼습니다.' : ' 이(가) 사라졌습니다.') : '막대는 그려졌지만 무엇을 나타내는지 알 수 없습니다. 줄을 켜 보세요.') + ' x축 순서가 야간·주간인 이유: <code>groupby</code>가 이름순으로 정렬하기 때문.';
      }
    }
    function flip(j) { const k = L[j].k; st[k] = !st[k]; last = k; render(); }
    pre.addEventListener('click', (e) => { const ln = e.target.closest('.ln.opt'); if (ln) flip(+ln.dataset.j); });
    pre.addEventListener('keydown', (e) => { const ln = e.target.closest('.ln.opt'); if (ln && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); flip(+ln.dataset.j); pre.querySelector(`[data-j="${ln.dataset.j}"]`).focus(); } });
    render();
  })();

  /* ───────── 코드 + 결과 그래프 ───────── */
  (function gBar() {
    const svg = $('g-bar'); if (!svg) return;
    const r = [1, 2, 3, 4, 5, 6].map((m) => [m + '호기', rate((i) => D.machine[i] === m)]).sort((a, b) => b[1] - a[1]);
    const F = frame(svg, { cats: r.map((x) => x[0]), y: [0, 17], yt: [0, 4, 8, 12, 16], xlab: '설비', ylab: '불량률 (%)', T: 46 });
    bars(F, r.map((x) => x[1]), { w: 0.6, label: (v) => v.toFixed(1) });
    title(F, '호기별 불량률 (제품 494개)');
  })();
  (function gLine() {
    const svg = $('g-line'); if (!svg) return;
    const ys = D.vib[3], xs = ys.map((_, i) => i + 1);
    const F = frame(svg, { x: [0, 121], y: [0.5, 3.5], yt: [0.5, 1, 1.5, 2, 2.5, 3, 3.5], yf: (v) => v.toFixed(1), xt: [0, 20, 40, 60, 80, 100, 120], xlab: '가동 일수 (일)', ylab: '진동 RMS', T: 46 });
    line(F, xs, ys, { 'stroke-width': 2 });
    dots(F, xs, ys, { fill: 'var(--accent)' }, 2.2);
    el('line', { x1: F.sx(96), x2: F.sx(96), y1: F.T, y2: F.B, stroke: 'var(--bad)', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, F.top);
    title(F, '3호기 진동: 고장 전 약 25일간 상승');
  })();
  (function gBox() {
    const svg = $('g-box'); if (!svg) return;
    const F = frame(svg, { cats: ['주간', '야간'], y: [26, 48], yt: [28, 32, 36, 40, 44, 48], ylab: '인장강도 (MPa)', T: 46 });
    const a = box(F, 0, pick(D.strength, (i) => !D.night[i])), b = box(F, 1, pick(D.strength, (i) => D.night[i]));
    [[0, a], [1, b]].forEach(([i, s]) => text(F.top, F.sx(i) + F.bw * 0.2, F.sy(s.med) + 5, '중앙값 ' + s.med.toFixed(2), 'font-size:13px;font-weight:800;fill:var(--text)'));
    title(F, '교대별 인장강도 분포');
  })();
  (function gSc() {
    const svg = $('g-sc'); if (!svg) return;
    const F = frame(svg, { x: [60, 100], y: [26, 48], xt: [60, 70, 80, 90, 100], yt: [28, 32, 36, 40, 44, 48], xlab: '사출 압력 (bar)', ylab: '인장강도 (MPa)', T: 46, clip: true });
    const ok = (i) => !D.defect[i], bad = (i) => D.defect[i];
    dots(F, pick(D.pressure, ok), pick(D.strength, ok), { fill: 'var(--accent)', 'fill-opacity': 0.4 }, 4);
    dots(F, pick(D.pressure, bad), pick(D.strength, bad), { fill: 'var(--accent-2)', 'fill-opacity': 0.85 }, 4.2);
    legend(F.top, F.R - 90, F.T + 18, [['var(--accent)', '정상'], ['var(--accent-2)', '불량']]);
    title(F, '압력과 인장강도 (불량은 아래쪽에 몰림)');
  })();

  /* ───────── 직접 해 보기 2: bins ───────── */
  (function bins() {
    const svg = $('bins'), s = $('bins-s'); if (!svg) return;
    const a = D.strength, lo = Math.min(...a), hi = Math.max(...a);
    function update() {
      const n = +s.value, w = (hi - lo) / n, edges = [];
      for (let k = 0; k <= n; k++) edges.push(lo + w * k);
      const c = histCounts(a, edges), top = Math.max(...c), k = c.indexOf(top), ny = nice(0, top * 1.08, 5);
      const F = frame(svg, { x: [26, 48], y: [0, ny.hi], yt: ny.ticks, xt: [26, 30, 34, 38, 42, 46], xlab: '인장강도 (MPa)', ylab: '제품 수 (개)' });
      c.forEach((v, j) => {
        const x0 = F.sx(edges[j]), x1 = F.sx(edges[j + 1]);
        el('rect', { x: x0, y: F.sy(v), width: Math.max(0.5, x1 - x0 - (n > 40 ? 0.5 : 1.5)), height: F.B - F.sy(v), fill: j === k ? 'var(--accent-2)' : 'var(--accent)' }, F.g);
      });
      $('bins-o').textContent = n;
      $('bins-w').textContent = w.toFixed(2) + ' MPa';
      $('bins-m').textContent = edges[k].toFixed(1) + '~' + edges[k + 1].toFixed(1) + ' (' + top + '개)';
      const code = ['fig, ax = plt.subplots()', `ax.hist(df['strength'], bins=${n})`, "ax.set_xlabel('인장강도 (MPa)')", "ax.set_ylabel('제품 수 (개)')", 'plt.show()'];
      $('bins-code').innerHTML = code.map((l, j) => `<span class="ln${j === 1 ? ' chg' : ''}">${hl(l)}</span>`).join('');
      const st = $('bins-st');
      if (n < 6) { st.className = 'status bad'; st.innerHTML = `<b class="k">너무 적다</b>구간이 ${n}개뿐이라 봉우리 모양과 왼쪽 꼬리가 뭉개집니다.`; }
      else if (n > 35) { st.className = 'status mid'; st.innerHTML = `<b class="k">너무 많다</b>구간마다 제품이 몇 개뿐이라 들쭉날쭉 — 우연한 차이가 패턴처럼 보입니다.`; }
      else { st.className = 'status ok'; st.innerHTML = '<b class="k">적당하다</b>38~40 MPa 근처의 봉우리와 <strong>왼쪽으로 긴 꼬리</strong>(약한 제품)가 잘 보입니다. 보통 10~30개에서 몇 개 바꿔 보며 고릅니다.'; }
    }
    s.addEventListener('input', update);
    update();
  })();

  /* ───────── 직접 해 보기 3: 그래프 코드 만들기 ───────── */
  (function builder() {
    const svg = $('bd'); if (!svg) return;
    const COL = {
      shift: { nm: '교대', cat: true, keys: [1, 0], lab: ['야간', '주간'], arr: D.night },
      line: { nm: '라인', cat: true, keys: [1, 2, 3], lab: ['1라인', '2라인', '3라인'], arr: D.line },
      machine: { nm: '설비', cat: true, keys: [1, 2, 3, 4, 5, 6], lab: [1, 2, 3, 4, 5, 6].map((m) => m + '호기'), arr: D.machine },
      temp: { nm: '온도', ax: '사출 온도 (℃)', arr: D.temp },
      pressure: { nm: '압력', ax: '사출 압력 (bar)', arr: D.pressure },
      speed: { nm: '속도', ax: '속도 (rpm)', arr: D.speed },
      humidity: { nm: '습도', ax: '습도 (%)', arr: D.humidity },
      thickness: { nm: '두께', ax: '두께 (mm)', arr: D.thickness },
      strength: { nm: '인장강도', ax: '인장강도 (MPa)', arr: D.strength },
      defect: { nm: '불량률', ax: '불량률 (%)', arr: D.defect, pct: true },
    };
    const CATS = ['shift', 'line', 'machine'], NUMS = ['strength', 'pressure', 'temp', 'humidity', 'thickness', 'speed'];
    const T = {
      bar: { x: CATS, y: [...NUMS, 'defect'], dx: 'shift', dy: 'defect', rule: '막대: x는 <b>범주</b>(교대·라인·설비), y는 범주별 <b>평균</b>. 비교에 쓴다.' },
      line: { x: ['date'], y: [...NUMS, 'defect'], dx: 'date', dy: 'strength', rule: '선: x는 <b>시간 순서</b>(날짜), y는 날짜별 평균. 추이에 쓴다.' },
      hist: { x: NUMS, y: ['count'], dx: 'strength', dy: 'count', rule: '히스토그램: x에 <b>숫자 열 하나</b>, y는 구간별 개수(자동). 분포에 쓴다.' },
      box: { x: CATS, y: NUMS, dx: 'shift', dy: 'strength', rule: '상자그림: x는 <b>범주</b>, y는 <b>숫자</b>. 집단별 분포 비교에 쓴다.' },
      scatter: { x: NUMS, y: NUMS, dx: 'pressure', dy: 'strength', rule: '산점도: x·y 모두 <b>숫자 열</b>. 관계에 쓴다.' },
    };
    const NAME = { date: '날짜', count: '개수' };
    const nm = (k) => (COL[k] ? COL[k].nm : NAME[k]);
    const axn = (k) => (COL[k] ? COL[k].ax || COL[k].nm : k === 'date' ? '날짜' : '제품 수 (개)');
    const josa = (w) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return c >= 0 && c % 28 ? '과' : '와'; };
    const sx = $('bd-x'), sy = $('bd-y');
    let type = 'bar';
    const fill = (sel, list, val) => {
      sel.innerHTML = list.map((k) => `<option value="${k}">${k} (${nm(k)})</option>`).join('');
      sel.value = val; sel.disabled = list.length === 1;
    };
    function setType(t) {
      type = t;
      document.querySelectorAll('#bd-type button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.t === t));
      fill(sx, T[t].x, T[t].dx); fill(sy, T[t].y, T[t].dy);
      render();
    }
    const gm = (k, keys, arr) => keys.map((g) => { const v = idx.filter((i) => arr[i] === g).map((i) => COL[k].arr[i]); return mean(v) * (COL[k].pct ? 100 : 1); });
    function render() {
      const x = sx.value, y = sy.value, mul = COL[y] && COL[y].pct ? ' * 100' : '';
      let ttl, code, info = '';
      if (type === 'bar') {
        ttl = COL[y].pct ? `${nm(x)}별 불량률` : `${nm(x)}별 평균 ${nm(y)}`;
        const c = COL[x], v = gm(y, c.keys, c.arr), ny = nice(0, Math.max(...v) * 1.12, 5);
        const F = frame(svg, { cats: c.lab, y: [0, ny.hi], yt: ny.ticks, xlab: axn(x), ylab: axn(y), T: 46 });
        bars(F, v, { w: 0.55, label: (val) => val.toFixed(1) });
        title(F, ttl);
        const m = v.indexOf(Math.max(...v)); info = `가장 높은 곳: <b>${c.lab[m]}</b> (${v[m].toFixed(1)})`;
        code = [`r = df.groupby('${x}')['${y}'].mean()${mul}`, 'fig, ax = plt.subplots()', 'ax.bar(r.index, r.values)'];
      } else if (type === 'line') {
        ttl = COL[y].pct ? '날짜별 불량률' : `날짜별 평균 ${nm(y)}`;
        const v = D.dates.map((_, k) => mean(idx.filter((i) => D.day[i] === k).map((i) => COL[y].arr[i])) * (COL[y].pct ? 100 : 1));
        const ny = nice(Math.min(...v), Math.max(...v), 5);
        const F = frame(svg, { x: [0, 29], y: [ny.lo, ny.hi], yt: ny.ticks, xt: [0, 5, 10, 15, 20, 25, 29], xf: (k) => D.dates[k], xlab: '날짜', ylab: axn(y), T: 46 });
        const xs = v.map((_, k) => k); line(F, xs, v); dots(F, xs, v, { fill: 'var(--accent)' }, 3.5);
        title(F, ttl);
        info = `날짜별 값의 범위: ${Math.min(...v).toFixed(1)} ~ ${Math.max(...v).toFixed(1)}`;
        code = [`r = df.groupby('date')['${y}'].mean()${mul}`, 'fig, ax = plt.subplots()', "ax.plot(r.index, r.values, marker='o')", "ax.tick_params(axis='x', labelrotation=90)"];
      } else if (type === 'hist') {
        ttl = `${nm(x)} 분포`;
        const a = COL[x].arr, lo = Math.min(...a), hi = Math.max(...a), w = (hi - lo) / 15, edges = [];
        for (let k = 0; k <= 15; k++) edges.push(lo + w * k);
        const c = histCounts(a, edges), nx = nice(lo, hi, 6), ny = nice(0, Math.max(...c) * 1.08, 5);
        const F = frame(svg, { x: [nx.lo, nx.hi], y: [0, ny.hi], yt: ny.ticks, xt: nx.ticks, xf: (v) => +v.toFixed(3), xlab: axn(x), ylab: '제품 수 (개)', T: 46 });
        c.forEach((v, j) => el('rect', { x: F.sx(edges[j]), y: F.sy(v), width: Math.max(0.5, F.sx(edges[j + 1]) - F.sx(edges[j]) - 1.5), height: F.B - F.sy(v), fill: 'var(--accent)' }, F.g));
        title(F, ttl);
        const m = c.indexOf(Math.max(...c)); info = `가장 많은 구간: ${edges[m].toFixed(2)} ~ ${edges[m + 1].toFixed(2)} (${c[m]}개)`;
        code = ['fig, ax = plt.subplots()', `ax.hist(df['${x}'], bins=15, edgecolor='white')`];
      } else if (type === 'box') {
        ttl = `${nm(x)}별 ${nm(y)} 분포`;
        const c = COL[x], groups = c.keys.map((g) => idx.filter((i) => c.arr[i] === g).map((i) => COL[y].arr[i]));
        const all = COL[y].arr, ny = nice(Math.min(...all), Math.max(...all), 5);
        const F = frame(svg, { cats: c.lab, y: [ny.lo, ny.hi], yt: ny.ticks, xlab: axn(x), ylab: axn(y), T: 46 });
        const meds = groups.map((g, k) => box(F, k, g).med);
        title(F, ttl);
        const m = meds.indexOf(Math.max(...meds)); info = `중앙값이 가장 높은 곳: <b>${c.lab[m]}</b> (${meds[m].toFixed(2)})`;
        code = ['fig, ax = plt.subplots()', `df.boxplot(column='${y}', by='${x}',`, '           ax=ax, grid=False)', "fig.suptitle('')          # 자동 제목 지우기"];
      } else {
        ttl = `${nm(x)}${josa(nm(x))} ${nm(y)}의 관계`;
        const a = COL[x].arr, b = COL[y].arr, nx = nice(Math.min(...a), Math.max(...a), 5), ny = nice(Math.min(...b), Math.max(...b), 5);
        const F = frame(svg, { x: [nx.lo, nx.hi], y: [ny.lo, ny.hi], xt: nx.ticks, yt: ny.ticks, xf: (v) => +v.toFixed(3), xlab: axn(x), ylab: axn(y), T: 46, xGrid: true, clip: true });
        dots(F, a, b, { fill: 'var(--accent)', 'fill-opacity': 0.4 }, 3.8);
        title(F, ttl);
        info = x === y ? '같은 열끼리 그리면 한 줄로 늘어설 뿐 — 서로 다른 두 열을 고르세요.' : '점 494개 = 제품 494개. 관계의 세기는 7-3에서 숫자로.';
        code = ['fig, ax = plt.subplots()', `ax.scatter(df['${x}'], df['${y}'], alpha=0.4)`];
      }
      const ylabel = type === 'hist' ? '제품 수 (개)' : axn(y);
      code.push(`ax.set_title('${ttl}')`, `ax.set_xlabel('${axn(x)}')`, `ax.set_ylabel('${ylabel}')`, 'plt.show()');
      $('bd-code').innerHTML = code.map((l) => `<span class="ln">${hl(l)}</span>`).join('');
      $('bd-msg').innerHTML = T[type].rule + '<br>' + info;
    }
    document.querySelectorAll('#bd-type button').forEach((b) => b.addEventListener('click', () => setType(b.dataset.t)));
    sx.addEventListener('change', render); sy.addEventListener('change', render);
    setType('bar');
  })();
})();
