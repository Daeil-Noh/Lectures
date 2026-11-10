// 7주 1차시 전용: 목적별 그래프(실제 데이터), 같은 데이터·여섯 질문, 그래프 고르기 카드, 잘린 y축, 나쁜 그래프 고치기
(function () {
  const D = window.W07, P = window.P7; if (!D || !P) return;
  const { el, $, frame, bars, line, dots, hist, box, text, mean, pick, groupMean, histCounts } = P;
  const N = D.n, idx = [...Array(N).keys()];
  const pct = (v) => v.toFixed(1) + '%';
  const rate = (mask) => { const s = idx.filter(mask); return 100 * s.filter((i) => D.defect[i]).length / s.length; };
  const nightStr = pick(D.strength, (i) => D.night[i]), dayStr = pick(D.strength, (i) => !D.night[i]);
  const R = { day: rate((i) => !D.night[i]), night: rate((i) => D.night[i]) };
  const legend = (svg, x, y, items) => items.forEach(([c, t], k) => {
    el('rect', { x, y: y + k * 22 - 11, width: 14, height: 14, rx: 3, fill: c }, svg);
    text(svg, x + 20, y + k * 22 + 1, t, 'font-size:14px;font-weight:700;fill:var(--text)');
  });
  const EDGES = []; for (let e = 26; e <= 48; e += 2) EDGES.push(e);

  /* ── 공통 그리기 ── */
  function drawShift(svg, o = {}) {
    const F = frame(svg, { cats: ['주간', '야간'], y: [0, 25], yt: [0, 5, 10, 15, 20, 25], yf: (v) => v + '%', ylab: '불량률 (%)', L: 66, B: o.B ?? 44 });
    bars(F, [R.day, R.night], { w: 0.5, color: (i) => (i ? 'var(--accent-2)' : 'var(--accent)'), label: pct });
    return F;
  }
  function drawHist(svg) {
    const F = frame(svg, { x: [26, 48], y: [0, 130], yt: [0, 40, 80, 120], xt: [26, 30, 34, 38, 42, 46], xlab: '인장강도 (MPa)', ylab: '제품 수 (개)', L: 62, R: 14 });
    const c = hist(F, D.strength, EDGES, { fill: 'var(--accent)', 'fill-opacity': 0.85 });
    const k = c.indexOf(Math.max(...c));
    text(F.top, F.sx(EDGES[k] + 1), F.sy(c[k]) - 8, c[k] + '개', 'font-size:15px;font-weight:800;fill:var(--accent)', 'middle');
    return F;
  }
  function drawBox(svg, wide) {
    const F = frame(svg, { cats: ['주간', '야간'], y: [26, 48], yt: [28, 32, 36, 40, 44, 48], ylab: '인장강도 (MPa)', L: wide ? 74 : 58, R: 10 });
    const a = box(F, 0, dayStr, 'var(--accent)'), b = box(F, 1, nightStr, 'var(--accent-2)');
    if (wide) {
      [[0, a], [1, b]].forEach(([i, s]) => text(F.top, F.sx(i) + F.bw * 0.2, F.sy(s.med) + 5, '중앙값 ' + s.med.toFixed(2), 'font-size:14px;font-weight:800;fill:var(--text)'));
    }
    return [a, b];
  }
  function drawScatter(svg) {
    const F = frame(svg, { x: [60, 100], y: [26, 48], xt: [60, 70, 80, 90, 100], yt: [28, 32, 36, 40, 44, 48], xlab: '사출 압력 (bar)', ylab: '인장강도 (MPa)', xGrid: true, clip: true });
    dots(F, D.pressure, D.strength, { fill: 'var(--accent)', 'fill-opacity': 0.4 }, 4.2);
    return F;
  }

  /* ── 도입 ── */
  if ($('c-intro')) drawShift($('c-intro'), { B: 40 });

  /* ── 비교: 교대 + 라인 ── */
  (function cmp() {
    const svg = $('c-cmp'); if (!svg) return;
    const L1 = rate((i) => D.line[i] === 1), L2 = rate((i) => D.line[i] === 2), L3 = rate((i) => D.line[i] === 3);
    const F = frame(svg, { cats: ['주간', '야간', '1라인', '2라인', '3라인'], y: [0, 25], yt: [0, 5, 10, 15, 20, 25], yf: (v) => v + '%', ylab: '불량률 (%)', T: 46 });
    bars(F, [R.day, R.night, L1, L2, L3], { w: 0.56, color: (i) => (i === 1 ? 'var(--accent-2)' : i < 2 ? 'var(--accent)' : 'var(--muted)'), label: pct });
    const mid = (F.sx(1) + F.sx(2)) / 2;
    el('line', { x1: mid, x2: mid, y1: 30, y2: F.B, stroke: 'var(--line)', 'stroke-width': 2, 'stroke-dasharray': '5 5' }, F.top);
    text(F.top, (F.sx(0) + F.sx(1)) / 2, 26, '교대별', 'font-size:16px;font-weight:800;fill:var(--accent)', 'middle');
    text(F.top, F.sx(3), 26, '라인별', 'font-size:16px;font-weight:800;fill:var(--muted)', 'middle');
  })();

  /* ── 추이: 진동 ── */
  (function trend() {
    const svg = $('c-trend'); if (!svg) return;
    const xs = D.vib[1].map((_, i) => i + 1);
    const F = frame(svg, { x: [1, 120], y: [0.5, 3.5], yt: [0.5, 1, 1.5, 2, 2.5, 3, 3.5], yf: (v) => v.toFixed(1), xt: [1, 20, 40, 60, 80, 100, 120], xf: (v) => v + '일', xlab: '가동 일수 (일)', ylab: '진동 RMS' });
    line(F, xs, D.vib[1], { stroke: 'var(--muted)', 'stroke-width': 2 });
    line(F, xs, D.vib[3], { stroke: 'var(--accent)', 'stroke-width': 3 });
    el('line', { x1: F.sx(96), x2: F.sx(96), y1: F.T, y2: F.B, stroke: 'var(--bad)', 'stroke-width': 2, 'stroke-dasharray': '5 5' }, F.top);
    text(F.top, F.sx(96) - 8, F.T + 20, '96일 고장', 'font-size:15px;font-weight:800;fill:var(--bad)', 'end');
    text(F.top, F.sx(101), F.sy(1.32), '정비 후', 'font-size:14px;font-weight:700');
    legend(F.top, F.L + 18, F.T + 16, [['var(--accent)', '3호기'], ['var(--muted)', '1호기 (정상)']]);
  })();

  /* ── 분포 ── */
  if ($('c-hist')) drawHist($('c-hist'));
  if ($('c-box')) drawBox($('c-box'));

  /* ── 관계 ── */
  if ($('c-rel')) drawScatter($('c-rel'));

  /* ── 구성: 누적 막대 + 원그래프 ── */
  const TYPES = [['치수불량', 'var(--accent)'], ['찍힘', 'var(--accent-2)'], ['스크래치', 'var(--muted)']];
  const cnt = (mask, t) => idx.filter((i) => mask(i) && D.dtype[i] === t).length;
  (function stack() {
    const svg = $('c-stack'); if (!svg) return;
    const F = frame(svg, { cats: ['주간', '야간'], y: [0, 60], yt: [0, 10, 20, 30, 40, 50, 60], ylab: '불량 건수 (건)', L: 64, T: 76, R: 10 });
    [0, 1].forEach((s) => {
      let base = 0; const w = F.bw * 0.5;
      TYPES.forEach(([nm, c], k) => {
        const n = cnt((i) => D.night[i] === s, k + 1);
        el('rect', { x: F.sx(s) - w / 2, y: F.sy(base + n), width: w, height: F.sy(base) - F.sy(base + n), fill: c, stroke: 'var(--surface)', 'stroke-width': 2 }, F.g);
        if (n >= 4) text(F.top, F.sx(s), (F.sy(base) + F.sy(base + n)) / 2 + 6, n, 'font-size:16px;font-weight:800;fill:var(--surface)', 'middle');
        base += n;
      });
      text(F.top, F.sx(s), F.sy(base) - 10, '합계 ' + base, 'font-size:16px;font-weight:800;fill:var(--text)', 'middle');
    });
    legend(svg, F.L + 10, 18, TYPES.map(([nm, c]) => [c, nm]));
  })();
  (function pie() {
    const svg = $('c-pie'); if (!svg) return;
    const n = TYPES.map((_, k) => cnt(() => true, k + 1)), tot = n.reduce((a, b) => a + b, 0);
    const cx = 130, cy = 220, r = 92; let a0 = -Math.PI / 2;
    text(svg, cx, 64, '전체 불량 ' + tot + '건', 'font-size:16px;font-weight:800;fill:var(--text)', 'middle');
    text(svg, cx, 86, '원그래프로 그리면', 'font-size:14px', 'middle');
    n.forEach((v, k) => {
      const a1 = a0 + v / tot * 2 * Math.PI, big = a1 - a0 > Math.PI ? 1 : 0;
      el('path', { d: `M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${big} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z`, fill: TYPES[k][1], stroke: 'var(--surface)', 'stroke-width': 3 }, svg);
      const am = (a0 + a1) / 2;
      text(svg, cx + r * 0.6 * Math.cos(am), cy + r * 0.6 * Math.sin(am) + 6, Math.round(100 * v / tot) + '%', 'font-size:16px;font-weight:800;fill:var(--surface)', 'middle');
      a0 = a1;
    });
    text(svg, cx, 350, '어느 교대에서 나왔는지는', 'font-size:14px', 'middle');
    text(svg, cx, 370, '보이지 않습니다', 'font-size:14px', 'middle');
  })();

  /* ───────── 직접 해 보기 1: 같은 데이터, 여섯 질문 ───────── */
  (function switcher() {
    const svg = $('sw'); if (!svg) return;
    const sb = [[0, 35, '35 미만'], [35, 38, '35~38'], [38, 41, '38~41'], [41, 99, '41 이상']];
    const sbRate = sb.map(([a, b]) => rate((i) => D.strength[i] >= a && D.strength[i] < b));
    const dmean = groupMean(D.strength, D.day), dm = D.dates.map((_, k) => dmean[k]);
    const hc = histCounts(D.strength, EDGES), hk = hc.indexOf(Math.max(...hc));
    const low = D.strength.filter((v) => v < 35).length;
    const V = {
      bar: {
        q: '주간과 야간 중 평균 강도가 높은 쪽은?',
        a: `주간 ${mean(dayStr).toFixed(2)} vs 야간 ${mean(nightStr).toFixed(2)} MPa — 주간이 <strong>${(mean(dayStr) - mean(nightStr)).toFixed(2)} MPa</strong> 높다.`,
        n: '제품마다 얼마나 들쭉날쭉한지(퍼짐)',
        draw() {
          const F = frame(svg, { cats: ['주간', '야간'], y: [0, 45], yt: [0, 10, 20, 30, 40], ylab: '평균 인장강도 (MPa)' });
          bars(F, [mean(dayStr), mean(nightStr)], { w: 0.42, color: (i) => (i ? 'var(--accent-2)' : 'var(--accent)'), label: (v) => v.toFixed(2) });
        },
      },
      line: {
        q: '30일 동안 강도가 좋아지거나 나빠졌나?',
        a: `날짜별 평균이 ${Math.min(...dm).toFixed(1)}~${Math.max(...dm).toFixed(1)} MPa 사이를 오르내릴 뿐, <strong>뚜렷한 증가·감소 경향은 없다.</strong>`,
        n: '교대별 차이, 낱낱의 제품 값',
        draw() {
          const F = frame(svg, { x: [0, 29], y: [36, 41], yt: [36, 37, 38, 39, 40, 41], xt: [0, 5, 10, 15, 20, 25, 29], xf: (k) => D.dates[k], xlab: '생산일 (2026년, 평일 30일)', ylab: '날짜별 평균 강도 (MPa)' });
          const xs = dm.map((_, k) => k);
          line(F, xs, dm, { 'stroke-width': 3 });
          dots(F, xs, dm, { fill: 'var(--accent)' }, 4);
          text(F.top, F.R - 6, F.T + 14, 'y축 36부터 (선 그래프는 변화를 보므로 0이 아니어도 됨)', 'font-size:13px', 'end');
        },
      },
      hist: {
        q: '강도는 어느 범위에 몰려 있나?',
        a: `${EDGES[hk]}~${EDGES[hk + 1]} MPa 구간이 가장 많고(${hc[hk]}개), 35 MPa 미만인 약한 제품이 <strong>${low}개</strong>.`,
        n: '교대·압력 같은 다른 변수와의 관계',
        draw() { drawHist(svg); },
      },
      box: {
        q: '교대별로 강도의 퍼짐과 이상치는 어떻게 다른가?',
        a: '', n: '날짜에 따른 변화, 제품 하나하나의 조건',
        draw() {
          const [a, b] = drawBox(svg, true);
          this.a = `중앙값 주간 ${a.med.toFixed(2)} · 야간 ${b.med.toFixed(2)} MPa. 두 상자가 많이 겹치고, 아래쪽 이상치(○)가 <strong>${a.out.length + b.out.length}개</strong> 있다.`;
        },
      },
      scatter: {
        q: '압력이 높으면 강도도 높은가?',
        a: '점들이 <strong>오른쪽 위로</strong> 올라간다 — 압력이 높을수록 강도도 높은 경향.',
        n: '압력이 강도를 높인 “원인”인지 (7-3에서)',
        draw() { drawScatter(svg); },
      },
      stack: {
        q: '강도 구간마다 불량은 몇 %씩 섞여 있나?',
        a: `35 MPa 미만은 <strong>${pct(sbRate[0])}</strong>가 불량, 41 MPa 이상은 ${pct(sbRate[3])}만 불량.`,
        n: '구간마다 제품이 몇 개인지 (비율만 보임)',
        draw() {
          const F = frame(svg, { cats: sb.map((s) => s[2]), y: [0, 100], yt: [0, 25, 50, 75, 100], yf: (v) => v + '%', xlab: '인장강도 구간 (MPa)', ylab: '구성 비율 (%)', T: 50 });
          const w = F.bw * 0.6;
          sbRate.forEach((r, k) => {
            el('rect', { x: F.sx(k) - w / 2, y: F.sy(100), width: w, height: F.sy(r) - F.sy(100), fill: 'var(--accent-soft)', stroke: 'var(--accent)', 'stroke-width': 1.5 }, F.g);
            el('rect', { x: F.sx(k) - w / 2, y: F.sy(r), width: w, height: F.B - F.sy(r), fill: 'var(--accent-2)' }, F.g);
            text(F.top, F.sx(k), Math.min(F.sy(r) - 8, F.B - 8), pct(r), 'font-size:16px;font-weight:800;fill:var(--text)', 'middle');
          });
          legend(svg, F.L + 10, 22, [['var(--accent-2)', '불량']]);
          legend(svg, F.L + 90, 22, [['var(--accent-soft)', '정상']]);
        },
      },
    };
    const btns = document.querySelectorAll('#sw-btns button');
    function show(k) {
      btns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.k === k));
      V[k].draw();
      $('sw-q').textContent = V[k].q; $('sw-a').innerHTML = V[k].a; $('sw-n').textContent = V[k].n;
    }
    btns.forEach((b) => b.addEventListener('click', () => show(b.dataset.k)));
    show('bar');
  })();

  /* ───────── 직접 해 보기 2: 그래프 고르기 카드 ───────── */
  (function cards() {
    const wrap = $('pick'); if (!wrap) return;
    const items = [
      { ic: 'factory', n: '설비 6대의 이번 달 평균 가동률을 견주고 싶다', v: '막대그래프 · 비교', a: '항목(설비)별 값 하나씩 → 막대 길이로 비교. 크기순 정렬하면 더 좋다.' },
      { ic: 'thermo', n: '3호기 모터 온도를 120일 동안 매일 기록했다. 변화를 보고 싶다', v: '선 그래프 · 추이', a: 'x축 = 날짜. 점을 이으면 서서히 오르는 흐름이 보인다.' },
      { ic: 'gauge', n: '제품 494개의 두께가 규격(2.00mm) 근처에 어떻게 퍼져 있나', v: '히스토그램 · 분포', a: '구간별 개수로 퍼짐·치우침을 본다. 규격선을 함께 그으면 좋다.' },
      { ic: 'link', n: '사출 온도와 인장강도가 함께 움직이는지 알고 싶다', v: '산점도 · 관계', a: '두 숫자 변수 → 점 하나에 제품 하나. 7-3에서 자세히.' },
      { ic: 'layers', n: '라인별 불량이 어떤 유형으로 이루어졌는지 비교하고 싶다', v: '누적 막대 · 구성', a: '라인마다 막대 하나, 안을 유형별로 나눈다. 원그래프 3개보다 비교가 쉽다.' },
      { ic: 'eye', n: '주간·야간 강도의 퍼짐과 이상치를 나란히 보고 싶다', v: '상자그림 · 분포 비교', a: '집단별 중앙값·사분위·이상치를 한 화면에. 히스토그램 2개보다 간단하다.' },
      { ic: 'trend', n: '월별 불량률이 개선되고 있는지 보고에 넣고 싶다', v: '선 그래프 · 추이', a: '“개선되고 있나?” = 시간에 따른 변화. 막대도 가능하지만 흐름은 선이 잘 보인다.' },
      { ic: 'chart', n: '전체 불량 중 치수불량이 차지하는 비율을 한 장으로', v: '누적 막대 (원그래프도 가능)', a: '항목이 3개뿐이고 합이 100%라면 원그래프도 괜찮다. 단, 집단 비교에는 누적 막대.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="ic-badge"><svg class="ic"><use href="#i-${it.ic}"/></svg></span><span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans2">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open'); opened++;
        $('pick-score').textContent = opened + ' / ' + items.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 직접 해 보기 3: 잘린 y축 ───────── */
  (function trunc() {
    const svg = $('trunc'), s = $('tr-s'); if (!svg) return;
    const r = [1, 2, 3, 4, 5, 6].map((m) => rate((i) => D.machine[i] === m));
    const real = r[5] / r[4];
    $('tr-real').textContent = real.toFixed(1) + '배';
    function update() {
      const y0 = +s.value, step = y0 > 6 ? 1 : 2, yt = [y0];
      for (let v = Math.ceil((y0 + 0.01) / step) * step; v <= 16; v += step) if (v - y0 > 0.6) yt.push(v);
      const F = frame(svg, { cats: [1, 2, 3, 4, 5, 6].map((m) => m + '호기'), y: [y0, 16.5], yt, yf: (v) => (v % 1 ? v.toFixed(1) : v) + '%', ylab: '불량률 (%)' });
      bars(F, r, { base: y0, w: 0.56, color: (i) => (i === 5 ? 'var(--accent-2)' : i === 4 ? 'var(--accent)' : 'var(--muted)'), label: pct });
      if (y0 > 0) {
        const y = F.B;
        el('path', { d: `M${F.L - 9},${y - 14} l18,-6 M${F.L - 9},${y - 6} l18,-6`, stroke: 'var(--bad)', 'stroke-width': 2.5 }, F.top);
        text(F.top, F.L + 8, F.T + 14, `y축이 0이 아니라 ${y0}%에서 시작!`, 'font-size:15px;font-weight:800;fill:var(--bad)');
      }
      const vis = (r[5] - y0) / (r[4] - y0);
      $('tr-o').textContent = y0 + '%';
      $('tr-vis').textContent = vis.toFixed(1) + '배';
      const st = $('tr-st');
      if (y0 === 0) { st.className = 'status ok'; st.innerHTML = `<b class="k">정직한 그래프</b>막대 길이 비율(${vis.toFixed(1)}배)이 실제 값의 비율과 같습니다. 차이는 ${(r[5] - r[4]).toFixed(1)}%p.`; }
      else if (vis < real * 1.6) { st.className = 'status mid'; st.innerHTML = `<b class="k">조금 과장</b>실제 ${real.toFixed(1)}배 차이가 ${vis.toFixed(1)}배로 보입니다.`; }
      else { st.className = 'status bad'; st.innerHTML = `<b class="k">오해를 부르는 그래프</b>실제 ${real.toFixed(1)}배 차이가 <strong>${vis.toFixed(1)}배</strong>로 보입니다. “6호기가 압도적으로 나쁘다”고 읽히기 쉽습니다.`; }
    }
    s.addEventListener('input', update);
    update();
  })();

  /* ───────── 직접 해 보기 4: 나쁜 그래프 고치기 ───────── */
  (function fix() {
    const svg = $('fix'); if (!svg) return;
    const sb = [[0, 35, '35 미만'], [35, 38, '35~38'], [38, 41, '38~41'], [41, 99, '41 이상']];
    const v = sb.map(([a, b]) => rate((i) => D.strength[i] >= a && D.strength[i] < b));
    const st = { flat: false, color: false, title: false, axis: false };
    const RAIN = ['var(--accent)', 'var(--ok)', 'var(--bad)', 'var(--accent-2)'];
    function render() {
      const F = frame(svg, {
        cats: st.axis ? sb.map((s) => s[2]) : ['A', 'B', 'C', 'D'], y: [0, 60], yt: [0, 10, 20, 30, 40, 50, 60],
        yf: (x) => (st.axis ? x + '%' : x), xlab: st.axis ? '인장강도 구간 (MPa)' : '', ylab: st.axis ? '불량률 (%)' : '', T: 62, noGrid: !st.flat,
      });
      const w = F.bw * 0.5, dx = 22, dy = -14;
      v.forEach((val, k) => {
        const c = st.color ? (k === 0 ? 'var(--accent-2)' : 'var(--muted)') : RAIN[k];
        const op = st.color && k ? 0.45 : 1;
        const x = F.sx(k) - w / 2, y = F.sy(val), yb = F.B;
        if (!st.flat) {
          el('path', { d: `M${x + w},${y} l${dx},${dy} V${yb + dy} l${-dx},${-dy} Z`, fill: c, 'fill-opacity': op * 0.55 }, F.g);
          el('path', { d: `M${x},${y} l${dx},${dy} h${w} l${-dx},${-dy} Z`, fill: c, 'fill-opacity': op * 0.75 }, F.g);
        }
        el('rect', { x, y, width: w, height: yb - y, rx: st.flat ? 6 : 0, fill: c, 'fill-opacity': op }, F.g);
        if (st.flat) text(F.top, F.sx(k), y - 10, st.axis ? pct(val) : val.toFixed(1), 'font-size:17px;font-weight:800;fill:var(--text)', 'middle');
      });
      if (!st.color) {
        ['계열 1', '계열 2', '계열 3', '계열 4'].forEach((t, k) => {
          el('rect', { x: F.R - 300 + k * 74, y: F.T + 2, width: 14, height: 14, rx: 3, fill: RAIN[k] }, F.top);
          text(F.top, F.R - 282 + k * 74, F.T + 14, t, 'font-size:13px');
        });
      }
      text(F.top, F.L, 30, st.title ? '강도 35 MPa 미만 제품은 절반 이상이 불량' : '그래프 1', `font-size:${st.title ? 21 : 16}px;font-weight:800;fill:var(--text)`);
      const n = Object.values(st).filter(Boolean).length, s = $('fx-st');
      const left = [];
      if (!st.flat) left.push('기울어진 3D 막대는 높이를 읽기 어렵습니다');
      if (!st.color) left.push('색 4개가 아무 의미 없이 쓰였습니다');
      if (!st.title) left.push('제목이 결론을 말하지 않습니다');
      if (!st.axis) left.push('축이 무엇이고 단위가 무엇인지 모릅니다');
      if (n === 4) { s.className = 'status ok'; s.innerHTML = '<b class="k">고친 항목 4 / 4</b>한눈에 읽힙니다. 제목만 읽어도 결론이 보이고, 강조한 막대 하나로 시선이 모입니다.'; }
      else { s.className = n >= 2 ? 'status mid' : 'status bad'; s.innerHTML = `<b class="k">고친 항목 ${n} / 4</b>` + left.join(' · ') + '.'; }
    }
    document.querySelectorAll('.tgl[data-f]').forEach((b) => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); st[b.dataset.f] = on; render();
    }));
    render();
  })();
})();
