// 7주 2차시 전용: 실제 데이터로 그리는 SVG 차트 — 도입, 차트 종류 바꾸기, 요청 예시, 읽기, 잘린 축, 한 문장 인사이트
// 숫자는 모두 genai-practice/materials/sales_2026.csv 를 pandas로 직접 계산한 값 (단위: 원)
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);
  const man = (v) => Math.round(v / 1e4).toLocaleString('ko-KR');   // 만 원

  const M = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월'];
  const OM_AD = [6670463, 6899640, 6856542, 7251863, 6894632, 7083674, 8870021, 9175566, 6955071];
  const OM_REV = [19918000, 18730600, 17795100, 16070300, 17974300, 18623300, 18513200, 18730100, 19603000];
  const TOTAL_REV = [41221800, 39884200, 36443400, 36398200, 37238500, 39370500, 39588600, 41047000, 45248300];
  const GIFT = [10048000, 9152000, 5056000, 4992000, 5024000, 5376000, 5024000, 5472000, 10624000];
  const CH = { cats: ['오픈마켓', '자사몰', '오프라인 매장'], vals: [165957900, 115302400, 75180200] };
  const PR = { cats: ['오리지널 그래놀라', '다크초코 그래놀라', '무가당 견과 믹스', '선물 세트', '미역귀 현미칩'], vals: [104673800, 76865200, 60898500, 60768000, 53235000] };
  const PALETTE = ['var(--accent)', 'var(--accent-2)', 'var(--ok)', 'var(--muted)', 'color-mix(in srgb, var(--accent) 40%, var(--surface))'];

  function frame(svg, o) {
    svg.innerHTML = '';
    const vb = svg.viewBox.baseVal, W = vb.width, H = vb.height;
    const L = o.L || 78, R = W - (o.R || 24), T = o.T || (o.title ? 64 : 36), B = H - (o.B || 46);
    if (o.title) el('text', { x: L - 60, y: 24, class: 't-main', style: 'font-size:17px' }, svg).textContent = o.title;
    const y0 = o.yMin || 0, y1 = o.yMax;
    const Y = (v) => B - (v - y0) / (y1 - y0) * (B - T);
    for (let v = y0; v <= y1 + 1e-6; v += o.yStep) {
      el('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), class: 'p-grid' }, svg);
      el('text', { x: L - 8, y: Y(v) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = o.yFmt ? o.yFmt(v) : v.toLocaleString('ko-KR');
    }
    el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis' }, svg);
    if (o.yLab) el('text', { x: L - 8, y: T - 16, 'text-anchor': 'end', class: 'p-tick', style: 'font-weight:700' }, svg).textContent = o.yLab;
    return { W, H, L, R, T, B, Y };
  }
  function lineChart(svg, o) {
    const f = frame(svg, o), n = o.cats.length;
    const X = (i) => f.L + 24 + i * (f.R - f.L - 48) / (n - 1);
    o.cats.forEach((c, i) => el('text', { x: X(i), y: f.B + 20, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = c);
    if (o.band) el('rect', { x: X(o.band[0]) - 18, y: f.T, width: X(o.band[1]) - X(o.band[0]) + 36, height: f.B - f.T, fill: 'var(--accent-2)', 'fill-opacity': 0.08 }, svg);
    o.series.forEach((s) => {
      el('polyline', { points: s.vals.map((v, i) => X(i) + ',' + f.Y(v)).join(' '), fill: 'none', stroke: s.color, 'stroke-width': 3, 'stroke-linejoin': 'round' }, svg);
      s.vals.forEach((v, i) => el('circle', { cx: X(i), cy: f.Y(v), r: 4.5, fill: s.color }, svg));
      if (s.label) { const i = n - 1; el('text', { x: X(i) - 6, y: f.Y(s.vals[i]) - 12, 'text-anchor': 'end', style: `font-size:14px;font-weight:800;fill:${s.color}` }, svg).textContent = s.label; }
      if (s.valLabels) s.vals.forEach((v, i) => el('text', { x: X(i), y: f.Y(v) - 12, 'text-anchor': 'middle', class: 'p-tick', style: 'font-size:12px' }, svg).textContent = s.valLabels(v, i));
    });
    return { f, X };
  }
  function barChart(svg, o) {
    const f = frame(svg, o), n = o.cats.length;
    const slot = (f.R - f.L) / n, bw = Math.min(o.bw || 80, slot * 0.62);
    const clip = 'c' + Math.random().toString(36).slice(2);
    const cp = el('clipPath', { id: clip }, svg); el('rect', { x: f.L, y: f.T - 2, width: f.R - f.L, height: f.B - f.T + 2 }, cp);
    const g = el('g', { 'clip-path': `url(#${clip})` }, svg);
    o.cats.forEach((c, i) => {
      const x = f.L + slot * i + (slot - bw) / 2, v = o.vals[i];
      const top = f.Y(v), base = f.B;
      el('rect', { x, y: Math.min(top, base), width: bw, height: Math.max(0, base - top), rx: 5, fill: (o.colors && o.colors[i]) || 'var(--accent)' }, g);
      el('text', { x: x + bw / 2, y: f.B + 20, 'text-anchor': 'middle', class: 'p-tick', style: o.catStyle || '' }, svg).textContent = c;
      if (o.labels) el('text', { x: x + bw / 2, y: top - 8, 'text-anchor': 'middle', class: 'p-tick', style: 'font-weight:800;fill:var(--text);font-size:' + (o.lblSize || 14) + 'px' }, svg).textContent = o.labels(v, i);
    });
    return f;
  }
  function pieChart(svg, o) {
    svg.innerHTML = '';
    const vb = svg.viewBox.baseVal, cx = o.cx || 210, cy = vb.height / 2 + 6, r = o.r || 150;
    const tot = o.vals.reduce((a, b) => a + b, 0);
    let a0 = -Math.PI / 2;
    o.vals.forEach((v, i) => {
      const a1 = a0 + v / tot * 2 * Math.PI, big = a1 - a0 > Math.PI ? 1 : 0;
      el('path', { d: `M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${big} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z`, fill: PALETTE[i % PALETTE.length], stroke: 'var(--surface)', 'stroke-width': 3 }, svg);
      const am = (a0 + a1) / 2;
      if (v / tot > 0.08) el('text', { x: cx + r * 0.62 * Math.cos(am), y: cy + r * 0.62 * Math.sin(am) + 5, 'text-anchor': 'middle', style: 'font-size:15px;font-weight:800;fill:var(--surface)' }, svg).textContent = (v / tot * 100).toFixed(1) + '%';
      a0 = a1;
    });
    const lx = cx + r + 40;
    o.cats.forEach((c, i) => {
      const y = cy - o.cats.length * 17 + i * 34 + 8;
      el('rect', { x: lx, y: y - 12, width: 16, height: 16, rx: 4, fill: PALETTE[i % PALETTE.length] }, svg);
      el('text', { x: lx + 24, y: y + 1, class: 't-main', style: 'font-size:15px;font-weight:700' }, svg).textContent = c;
      el('text', { x: lx + 24, y: y + 17, class: 't-sub', style: 'font-size:12.5px' }, svg).textContent = man(o.vals[i]) + '만 원';
    });
    if (o.title) el('text', { x: 18, y: 24, class: 't-main', style: 'font-size:17px' }, svg).textContent = o.title;
  }
  const legend = (svg, x, y, items) => items.forEach(([name, color], i) => {
    el('rect', { x: x + i * 150, y: y - 11, width: 22, height: 6, rx: 3, fill: color }, svg);
    el('text', { x: x + i * 150 + 30, y, class: 'p-tick', style: 'font-weight:700;fill:var(--text)' }, svg).textContent = name;
  });
  const adRev = (svg, o = {}) => {
    const r = lineChart(svg, Object.assign({
      cats: M, yMax: 2200, yStep: 500, yLab: '만 원', title: o.title,
      series: [
        { vals: OM_REV.map((v) => v / 1e4), color: 'var(--accent)' },
        { vals: OM_AD.map((v) => v / 1e4), color: 'var(--accent-2)' },
      ], band: o.band,
    }, o.extra || {}));
    legend(svg, r.f.R - 300, o.title ? 24 : r.f.T - 16, [['매출 (revenue)', 'var(--accent)'], ['광고비 (ad_spend)', 'var(--accent-2)']]);
    return r;
  };

  /* ───────── 1) 도입 ───────── */
  if ($('intro')) {
    const r = lineChart($('intro'), { cats: M, yMin: 600, yMax: 950, yStep: 50, yLab: '만 원', series: [{ vals: OM_AD.map((v) => v / 1e4), color: 'var(--accent-2)', valLabels: (v) => Math.round(v) }], band: [6, 7] });
    el('text', { x: r.X(6.5), y: r.f.T + 16, 'text-anchor': 'middle', style: 'font-size:15px;font-weight:800;fill:var(--accent-2)' }, $('intro')).textContent = '7~8월';
  }

  /* ───────── 2) 차트 종류 바꾸기 ───────── */
  (function switcher() {
    const svg = $('sw'); if (!svg) return;
    const Q = {
      cmp: { title: '1~9월 채널별 매출 합계', cats: CH.cats, vals: CH.vals, best: 'bar' },
      trend: { title: '월별 전체 매출 (5개 제품·3개 채널 합계)', cats: M, vals: TOTAL_REV, best: 'line' },
      share: { title: '1~9월 제품별 매출 비중', cats: PR.cats, vals: PR.vals, best: 'pie' },
    };
    const V = {
      cmp: {
        bar: ['ok', '알맞은 선택', '막대 길이로 크기를 바로 비교합니다. 오픈마켓(1억 6,596만 원)이 가장 크고, 오프라인 매장(7,518만 원)의 약 2.2배입니다.'],
        line: ['bad', '맞지 않음', '채널 사이에는 시간 순서가 없습니다. 선으로 이으면 “줄어드는 변화”처럼 잘못 읽힙니다.'],
        pie: ['mid', '쓸 수는 있음', '비중(46.6% · 32.3% · 21.1%)은 보이지만, “얼마나 더 큰가”는 막대가 더 정확하게 보여 줍니다.'],
      },
      trend: {
        line: ['ok', '알맞은 선택', '3~4월에 낮아졌다가 9월에 4,525만 원으로 가장 높아지는 흐름이 한눈에 보입니다.'],
        bar: ['mid', '쓸 수는 있음', '달별 크기는 보이지만 흐름(오르내림)은 선이 더 잘 보여 줍니다. 막대는 9개쯤까지 괜찮습니다.'],
        pie: ['bad', '맞지 않음', '원 차트에서는 시간 순서가 사라집니다. “어떻게 변했나”에 답할 수 없습니다.'],
      },
      share: {
        pie: ['ok', '알맞은 선택', '전체를 100%로 놓고 각 제품의 몫을 봅니다. 오리지널 그래놀라가 29.4%로 가장 큽니다.'],
        bar: ['mid', '쓸 수는 있음', '제품끼리 크기 비교는 쉽지만, “전체 중 몇 %인가”는 따로 계산해야 합니다.'],
        line: ['bad', '맞지 않음', '제품 사이에는 순서가 없습니다. 선으로 이으면 의미 없는 오르내림이 생깁니다.'],
      },
    };
    let q = 'cmp', c = 'bar';
    function render() {
      const d = Q[q];
      if (c === 'pie') pieChart(svg, { cats: d.cats, vals: d.vals, title: d.title, cx: q === 'trend' ? 190 : 210, r: q === 'trend' ? 150 : 155 });
      else if (c === 'bar') barChart(svg, { title: d.title, cats: d.cats, vals: d.vals.map((v) => v / 1e4), yMax: q === 'cmp' ? 18000 : q === 'trend' ? 5000 : 12000, yStep: q === 'cmp' ? 3000 : q === 'trend' ? 1000 : 2000, yLab: '만 원', labels: (v) => Math.round(v).toLocaleString('ko-KR'), lblSize: q === 'trend' ? 12 : 14, catStyle: q === 'share' ? 'font-size:12px' : '', colors: d.vals.map((v) => v === Math.max(...d.vals) ? 'var(--accent-2)' : 'var(--accent)') });
      else lineChart(svg, { title: d.title, cats: d.cats.map((s) => q === 'share' ? s.replace(' 그래놀라', '').replace(' 견과 믹스', ' 견과') : s), vals: null, yMin: q === 'trend' ? 0 : 0, yMax: q === 'cmp' ? 18000 : q === 'trend' ? 5000 : 12000, yStep: q === 'cmp' ? 3000 : q === 'trend' ? 1000 : 2000, yLab: '만 원', series: [{ vals: d.vals.map((v) => v / 1e4), color: 'var(--accent)', valLabels: (v) => Math.round(v).toLocaleString('ko-KR') }] });
      const [k, h, t] = V[q][c];
      const st = $('sw-st'); st.className = 'status ' + k;
      st.innerHTML = `<b class="k">${h}</b>${t}`;
    }
    const bind = (wrap, attr, set) => wrap.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      wrap.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); set(b.dataset[attr]); render();
    }));
    bind($('sw-q'), 'q', (v) => (q = v));
    bind($('sw-c'), 'c', (v) => (c = v));
    render();
  })();

  /* ───────── 3) 요청 예시 속 차트 ───────── */
  if ($('req')) {
    const svg = $('req');
    const r = lineChart(svg, { cats: M.map((m) => m.replace('월', '')), yMax: 2200, yStep: 1000, yLab: '만 원', L: 64, R: 14, B: 30, T: 40, series: [{ vals: OM_REV.map((v) => v / 1e4), color: 'var(--accent)' }, { vals: OM_AD.map((v) => v / 1e4), color: 'var(--accent-2)' }] });
    legend(svg, r.f.R - 250, 20, [['매출', 'var(--accent)'], ['광고비', 'var(--accent-2)']]);
  }

  /* ───────── 4) 보여 주는 것 / 보여 주지 않는 것 ───────── */
  if ($('read')) {
    const svg = $('read');
    const r = adRev(svg, { title: '오픈마켓 월별 매출과 광고비', band: [6, 7] });
    el('text', { x: r.X(6.5), y: r.f.Y(OM_AD[7] / 1e4) - 22, 'text-anchor': 'middle', style: 'font-size:14px;font-weight:800;fill:var(--accent-2)' }, svg).textContent = '광고비 ↑';
    el('text', { x: r.X(6.5), y: r.f.Y(OM_REV[7] / 1e4) - 16, 'text-anchor': 'middle', style: 'font-size:14px;font-weight:800;fill:var(--accent)' }, svg).textContent = '매출 거의 그대로';
  }

  /* ───────── 5) 잘린 축 ───────── */
  (function cut() {
    const svg = $('cut'), s = $('cut-s'); if (!svg) return;
    const vals = OM_REV.map((v) => v / 1e4);
    const hi = 0, lo = 3; // 1월(최고), 4월(최저)
    function render() {
      const y0 = +s.value;
      const f = barChart(svg, { title: '오픈마켓 월별 매출', cats: M, vals, yMin: y0, yMax: 2100, yStep: y0 >= 1500 ? 100 : y0 >= 1000 ? 200 : 500, yLab: '만 원', labels: (v) => Math.round(v).toLocaleString('ko-KR'), lblSize: 12, colors: vals.map((v, i) => i === hi || i === lo ? 'var(--accent-2)' : 'var(--accent)') });
      if (y0 > 0) {
        el('path', { d: `M${f.L - 12},${f.B - 6} l12,-6 l12,6`, fill: 'none', stroke: 'var(--bad)', 'stroke-width': 2.5 }, svg);
        el('text', { x: f.L - 8, y: f.B + 38, 'text-anchor': 'end', class: 'p-tick', style: 'fill:var(--bad);font-weight:800' }, svg).textContent = '0이 아님!';
      }
      $('cut-o').textContent = y0.toLocaleString('ko-KR') + '만 원';
      const ratio = (vals[hi] - y0) / (vals[lo] - y0);
      $('cut-r').textContent = ratio.toFixed(ratio >= 10 ? 0 : ratio >= 3 ? 1 : 2) + '배';
      const st = $('cut-st');
      if (y0 === 0) { st.className = 'status ok'; st.innerHTML = '<b class="k">정직한 축</b>세로축이 0에서 시작합니다. 막대 길이 비율 = 실제 값 비율.'; }
      else if (ratio < 2) { st.className = 'status mid'; st.innerHTML = `<b class="k">조금 부풀려짐</b>실제로는 1.24배인데 막대는 ${ratio.toFixed(2)}배로 보입니다.`; }
      else { st.className = 'status bad'; st.innerHTML = `<b class="k">오해를 부르는 차트</b>“4월에 매출이 폭락했다”처럼 보이지만, 실제로는 1월보다 <strong>약 385만 원(19%) 낮을 뿐</strong>입니다. 막대는 <strong>${ratio.toFixed(1)}배</strong>로 보입니다.`; }
    }
    s.addEventListener('input', render);
    render();
  })();

  /* ───────── 6) 한 문장 인사이트 ───────── */
  (function insight() {
    const svg = $('ins-svg'), list = $('ins-list'); if (!svg) return;
    const giftBase = GIFT.slice(2, 8).reduce((a, b) => a + b, 0) / 6 / 1e4; // 3~8월 평균 (만 원)
    const D = {
      ad: {
        draw: () => adRev(svg, { title: '오픈마켓 월별 매출과 광고비', band: [6, 7] }),
        c: [
          { t: '7~8월에 오픈마켓 광고비가 늘었다.', k: 'mid', v: '묘사만 했다', a: '사실이지만 숫자도, “그래서?”도 없습니다.' },
          { t: '광고비를 늘렸더니 매출이 크게 늘었다.', k: 'bad', v: '숫자가 틀림', a: '7·8월 매출은 1~6월 평균보다 1.8%, 3.0% 늘었을 뿐입니다.' },
          { t: '7·8월 광고비는 1~6월 평균보다 약 30% 많았지만 매출은 2~3% 느는 데 그쳤다. 광고비 증액 효과를 점검하자.', k: 'good', v: '좋은 인사이트', a: '사실(숫자) + 의미 + 다음 행동. 원인을 단정하지 않습니다.' },
          { t: '오픈마켓 광고는 효과가 전혀 없으니 모두 끊어야 한다.', k: 'bad', v: '과장·단정', a: '광고를 안 했을 때의 매출은 이 데이터에 없습니다. “전혀 없다”는 말할 수 없습니다.' },
        ],
      },
      gift: {
        draw: () => {
          const r = lineChart(svg, { title: '선물 세트 월별 매출', cats: M, yMax: 1200, yStep: 200, yLab: '만 원', series: [{ vals: GIFT.map((v) => v / 1e4), color: 'var(--accent)', valLabels: (v) => Math.round(v) }] });
          el('line', { x1: r.X(2) - 10, x2: r.X(7) + 10, y1: r.f.Y(giftBase), y2: r.f.Y(giftBase), stroke: 'var(--muted)', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
          el('text', { x: r.X(4.5), y: r.f.Y(giftBase) + 22, 'text-anchor': 'middle', class: 'p-tick', style: 'font-weight:700' }, svg).textContent = `3~8월 평균 약 ${Math.round(giftBase)}만 원`;
        },
        c: [
          { t: '선물 세트 매출은 9월에 가장 높았다.', k: 'mid', v: '묘사만 했다', a: '맞는 사실(1,062만 원)이지만 의미와 행동이 없습니다.' },
          { t: '1·2·9월 매출이 3~8월 평균의 약 1.8~2.1배였다. 명절 한 달 전부터 재고·홍보를 준비하자.', k: 'good', v: '좋은 인사이트', a: '근거 숫자 + 다음 행동. 명절과 겹친다는 해석은 “확인할 가설”로 둡니다.' },
          { t: '선물 세트는 여름에 안 팔리니 단종하자.', k: 'bad', v: '과장·단정', a: '3~8월에도 매달 약 500만 원어치가 팔렸습니다.' },
          { t: '명절 때문에 판매가 늘어난 것이 확실하다.', k: 'mid', v: '주의: 원인 단정', a: '시기가 겹칠 뿐, 차트는 원인을 증명하지 않습니다. “명절 시기와 겹친다”까지가 안전합니다.' },
        ],
      },
    };
    let k = 'ad', opened = 0;
    function render() {
      D[k].draw();
      list.innerHTML = ''; opened = 0; $('ins-score').textContent = '0 / 4 확인';
      D[k].c.forEach((c) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'ins';
        b.innerHTML = `<span>${c.t}</span><span class="v">${c.v}</span><span class="a">${c.a}</span>`;
        b.addEventListener('click', () => {
          if (b.classList.contains('open')) return;
          b.classList.add('open', c.k); opened++;
          $('ins-score').textContent = opened + ' / 4 확인' + (opened === 4 ? ' — 좋은 문장에는 숫자·의미·행동이 모두 있습니다.' : '');
        });
        list.appendChild(b);
      });
    }
    $('ins-sw').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      $('ins-sw').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); k = b.dataset.k; render();
    }));
    render();
  })();
})();
