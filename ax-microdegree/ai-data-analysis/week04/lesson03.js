// 4주 3차시 전용: AI 코드 리뷰 게임, 이상치 제거로 사라지는 행, 검증 체크리스트
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  // slides.js 와 같은 규칙으로 파이썬 코드 색 입히기
  function hl(src) {
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

  /* ───────── 실습 데이터: process.csv 의 strength(인장강도), defect(0/1) 494행 ───────── */
  const STR = [34.57,41.44,42.13,42.05,40.04,42.38,33.96,40.32,39.07,35.98,41,36.96,33.72,35.93,37.98,44.62,43.03,32.84,32.22,41.99,35.42,46.68,36.75,43.26,37.11,38.24,41.94,41.09,38.63,37.48,37.46,41.2,41.97,35.02,38.88,36.07,36.35,39.47,40.56,39.27,37.72,42.88,38.92,38.59,40.99,41.23,33.91,39.06,41.53,40,41.22,35.55,41.93,39.01,38.83,38.46,40.15,35.66,39.38,38.03,38.33,38.72,38.5,32.57,40.13,36.45,34.65,39.28,43.46,39.27,42.13,41.86,39.73,42.93,34.91,33.96,42.1,40.07,38.5,41.75,42.92,39.07,36.81,39.82,40.99,42.94,38.64,38.06,36.8,39.17,35.19,42.68,32.72,39.76,39.1,41.7,39.91,43.92,43.73,32.55,44.03,43.33,38.38,44.9,36.94,39.49,38.19,39.25,42.05,33.09,38.38,35.77,37.72,34.3,40.13,34.6,43.93,42.54,37.65,43.8,38.73,36.02,40.1,33.3,37.85,37.99,36.81,39.82,41,37.91,42.67,33.38,31.7,41.3,40.71,35.09,42.39,40.34,36.75,43.35,36.27,40.47,40.21,39.39,40.72,36.13,38.08,38.04,34.3,38.21,43.14,34.64,37.58,39.07,34.98,38.18,39.28,37.39,39.31,43.87,43.81,38.74,41.36,43.74,39.34,40.85,39.42,38.19,39.61,28.48,35.48,36.5,35.95,41.12,36.85,41.87,39.34,44.69,39.38,37.96,38.93,40.44,39.99,39.41,38.48,43.24,37.94,35.68,39.75,42.02,36.01,40.9,37.99,35.95,34.21,40.06,34.67,38.64,40.55,37.88,42.27,41.38,36.08,36.16,41.43,38.34,31.56,35.91,43.25,40.79,36.3,26.64,40.56,38.46,32.84,43.58,37.82,38.61,39.75,43.59,37.19,44.25,39.02,37.28,39.35,39.15,40.42,38.89,41.62,42.79,28.85,38.45,36.95,33.94,36.56,44.23,37.59,34.85,35.64,42.5,40.78,38.02,37.74,41.81,44.49,40.75,36.06,35.77,39.37,41.27,43.55,41.24,40.23,38.06,36.02,38.37,32.95,36.31,43.65,37.2,34.69,38.44,37.88,39.75,34.59,36.34,38.2,42.17,36.83,38.98,43.65,36.21,36.03,38.31,35.58,41.99,32.43,41.64,34.45,40.35,42.43,43.82,40.59,35.02,37.02,39.06,40.19,41.26,36.63,39.46,38.39,41.8,44.66,35.88,34.28,39.4,37,40.52,36.02,39.94,40.93,38.04,45.16,41.07,40.38,38.1,42.73,36.66,39.06,41.79,36.52,40.64,42.16,36.72,46.17,43.06,36.86,38.16,40.74,33.38,39.49,38.01,39.24,43.07,33.26,38.74,39.43,36.82,35.38,36.03,36.58,37.87,38.79,40.13,37.87,40.13,39.12,33.32,36.93,42.44,43.55,42.78,41.75,36.17,37.14,37.15,41.03,36.14,39.52,37.94,41.11,43.72,37.19,41.08,36.2,41.66,35.89,41.15,37.97,35.07,42.09,42.03,33.69,40.41,41.15,43.08,43,35.83,41.45,39.02,40.28,35.02,31.54,36.74,40.53,41.06,40.3,36.17,36.85,38.02,37.31,40.96,39.09,41.5,40.51,41.57,31.5,43.06,39.05,39.45,34.06,43.37,41.01,42.12,42.85,41.83,43.83,32.04,32.02,41.02,37.66,41.2,37.27,37.79,35.35,35.08,31.92,36.68,39.53,35.39,40.88,39.2,37.73,42.12,43.12,36.42,41.17,40.96,37.05,36.29,37.51,33.2,35.31,38.56,34.02,39.28,37.26,44.22,36.24,38.52,40.91,42.28,31.71,39.39,40,39.32,39.97,39.96,37.82,40.35,40.2,32.52,37.05,36.51,41.45,39.09,43.13,30.42,40.01,40.97,43.32,31.77,39.95,40.72,39.01,36.86,41.15,38.16,41.31,40.13,38.62,40.15,36.82,39.14,40,38.99,42.02,40.29,37.78,37.58,40.29,38.41,33.89,39.14,38.72,31.94,35.73,31.32,40.88,38.41,42.13,39.19,37.03,39.6,34.67,42.34,38.05,38.86,33.46,40.95,36.92,40.09,37.16,41.45];
  const DEF = '00000000010010000110000000000000000000000000000100010001000000100000000000010000000000000100000010000000001000000100000000010000000010000100000000000000001110000100000001000010000000100000001000101000000000100001000000100000000010000000000000000000000000001000100001000001000010100000000000000010001000000000000001000001000010010100000000000001000000000000101000100000000011010000000000101000000001000000011000000001000100011000100010000000000001010000000000000000000001111000000000000000100000';

  /* ───────── 1) AI 코드 리뷰 게임 ───────── */
  (function review() {
    const box = $('rv-code'); if (!box) return;
    const ROUNDS = [
      { name: '① 없는 기능', ask: '“process.csv를 읽고, 인장강도 이상치를 지운 뒤 라인별 평균 강도를 구해 줘.”', lines: [
        ['import pandas as pd'],
        ["df = pd.read_csv(DATA + 'process.csv', auto_clean=True)", 'read_csv에는 <b>auto_clean</b>이라는 인자가 없다 → TypeError: unexpected keyword argument'],
        ['# 인장강도 이상치 제거'],
        ["df = df.remove_outliers('strength')", 'DataFrame에 <b>remove_outliers</b> 기능은 없다 → AttributeError'],
        ['# 라인별 평균 인장강도'],
        ["print(df.groupby('line')['strength'].mean().round(2))"],
      ] },
      { name: '② 추측', ask: '“온도가 너무 높은 제품과 강도가 부족한 제품이 각각 몇 개인지 세어 줘.”', lines: [
        ['# 온도가 230℃를 넘는 제품'],
        ["hot = df[df['temperature'] > 230]", '열 이름 추측: 실제 열은 <b>temp</b> → KeyError: \'temperature\''],
        ['# 강도가 부족한 제품'],
        ["weak = df[df['strength'] < 400]", '단위·규모 추측: 이 데이터의 인장강도는 <b>27~47 MPa</b> → 494개 전부 “부족”'],
        ["print('고온:', len(hot), '개')"],
        ["print('강도 부족:', len(weak), '개')"],
      ] },
      { name: '③ 숫자·행', ask: '“야간 불량률을 구하고, 이상치를 뺀 평균 인장강도도 알려 줘.”', lines: [
        ["night = df[df['shift'] == '야간']"],
        ["rate = df['defect'].mean() * 100", 'night가 아니라 <b>전체 df</b>로 계산 → 13.8%(전체 불량률). 실제 야간은 <b>20.3%</b>'],
        ["print(f'야간 불량률: {rate:.1f}%')"],
        ['# 이상치 제거'],
        ["df = df[df['strength'] > df['strength'].mean() - 2 * df['strength'].std()]", '강도 낮은 <b>17행을 말없이 삭제</b> — 그중 12개가 불량품. df를 덮어써 이후 분석에도 영향'],
        ["print(df['strength'].mean().round(2))"],
      ] },
    ];
    let cur = 0, graded = false;
    const rb = $('rv-rounds');
    ROUNDS.forEach((r, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ghost'; b.style.cssText = 'font-size:15px;padding:6px 12px';
      b.textContent = r.name; b.addEventListener('click', () => load(i)); rb.appendChild(b);
    });
    function load(i) {
      cur = i; graded = false;
      rb.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-pressed', j === i));
      $('rv-ask').innerHTML = '<b>요청</b> ' + ROUNDS[i].ask;
      box.className = 'review'; box.innerHTML = '';
      ROUNDS[i].lines.forEach(([code], k) => {
        const d = document.createElement('div'); d.className = 'rl'; d.tabIndex = 0; d.setAttribute('role', 'button');
        d.innerHTML = `<span class="ln">${k + 1}</span><span>${hl(code)}</span><span class="mk"></span>`;
        const tg = () => { if (graded) return; d.classList.toggle('flag'); };
        d.addEventListener('click', tg);
        d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); tg(); } });
        box.appendChild(d);
      });
      const nb = ROUNDS[i].lines.filter((l) => l[1]).length;
      $('rv-score').textContent = '- / ' + nb;
      $('rv-st').className = 'status mid';
      $('rv-st').innerHTML = '<b class="k">힌트</b>없는 기능? 추측한 열 이름? 데이터와 맞지 않는 숫자? 엉뚱한 표로 계산?';
    }
    $('rv-grade').addEventListener('click', () => {
      graded = true; box.classList.add('graded');
      const L = ROUNDS[cur].lines; let hit = 0, fp = 0; const why = [];
      box.querySelectorAll('.rl').forEach((d, k) => {
        const bad = !!L[k][1], fl = d.classList.contains('flag'), mk = d.querySelector('.mk');
        if (bad && fl) { d.classList.add('hit'); mk.textContent = '✓'; mk.style.color = '#6fcf9d'; hit++; }
        else if (bad) { d.classList.add('miss'); mk.textContent = '!'; mk.style.color = '#f28b82'; }
        else if (fl) { d.classList.add('fp'); mk.textContent = '–'; mk.style.color = '#8a93a6'; fp++; }
        if (bad) why.push(`<li><b>${k + 1}번 줄</b> ${L[k][1]}</li>`);
      });
      const nb = L.filter((l) => l[1]).length;
      $('rv-score').textContent = hit + ' / ' + nb;
      const st = $('rv-st');
      st.className = 'status ' + (hit === nb && !fp ? 'ok' : hit ? 'mid' : 'bad');
      st.innerHTML = `<b class="k">${hit === nb ? (fp ? '함정은 다 찾음 · 정상 줄 ' + fp + '개도 표시' : '완벽한 리뷰!') : '놓친 함정 ' + (nb - hit) + '개 (빨간 점선)'}</b><ul class="why" style="margin:2px 0 0;padding-left:1.1em">${why.join('')}</ul>`;
    });
    $('rv-reset').addEventListener('click', () => load(cur));
    load(0);
  })();

  /* ───────── 2) 이상치 제거로 사라지는 행 ───────── */
  (function outliers() {
    const svg = $('ol-plot'); if (!svg) return;
    const N = STR.length;
    const mean = STR.reduce((a, b) => a + b, 0) / N;
    const sd = Math.sqrt(STR.reduce((a, b) => a + (b - mean) ** 2, 0) / (N - 1));   // pandas std (n-1)
    const nDef = [...DEF].filter((c) => c === '1').length;
    const L = 40, R = 680, X0 = 24, X1 = 50, X = (v) => L + (v - X0) / (X1 - X0) * (R - L);
    const BAND = { 0: [24, 150], 1: [178, 248] }, AXY = 268;
    const zoneL = el('rect', { y: 10, height: AXY - 10, fill: 'var(--muted)', 'fill-opacity': 0.14 }, svg);
    const zoneR = el('rect', { y: 10, height: AXY - 10, fill: 'var(--muted)', 'fill-opacity': 0.14 }, svg);
    const lineL = el('line', { y1: 10, y2: AXY, stroke: 'var(--muted)', 'stroke-width': 2, 'stroke-dasharray': '5 5' }, svg);
    const lineR = el('line', { y1: 10, y2: AXY, stroke: 'var(--muted)', 'stroke-width': 2, 'stroke-dasharray': '5 5' }, svg);
    const cut = el('text', { y: 26, class: 'p-tick', style: 'font-weight:800' }, svg);
    el('text', { x: R, y: BAND[0][0] + 6, 'text-anchor': 'end', class: 'p-tick', style: 'font-weight:700' }, svg).textContent = '양품 ' + (N - nDef) + '개';
    el('text', { x: R, y: BAND[1][0] + 2, 'text-anchor': 'end', class: 'p-tick', style: 'font-weight:700;fill:var(--accent-2)' }, svg).textContent = '불량 ' + nDef + '개';
    el('line', { x1: L, x2: R, y1: AXY, y2: AXY, class: 'p-axis' }, svg);
    for (let v = 25; v <= 50; v += 5) el('text', { x: X(v), y: AXY + 18, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = v;
    el('text', { x: (L + R) / 2, y: AXY + 30, 'text-anchor': 'middle', class: 'p-lab', style: 'font-size:13px' }, svg).textContent = '인장강도 (MPa) →';
    el('line', { x1: X(mean), x2: X(mean), y1: 10, y2: AXY, stroke: 'var(--accent)', 'stroke-width': 1.5 }, svg);
    el('text', { x: X(mean) + 4, y: AXY - 6, class: 'p-tick', style: 'fill:var(--accent);font-weight:700' }, svg).textContent = '평균 ' + mean.toFixed(1);
    const r = rng(43);
    const pts = STR.map((v, i) => {
      const d = DEF[i] === '1' ? 1 : 0, [y0, y1] = BAND[d];
      const c = el('circle', { cx: X(v), cy: y0 + 8 + r() * (y1 - y0 - 8), r: 3.6, fill: d ? 'var(--accent-2)' : 'var(--accent)', 'fill-opacity': d ? 0.95 : 0.6 }, svg);
      return { v, d, c };
    });
    const KS = [0, 3, 2.5, 2, 1.5, 1];
    const kb = $('ol-k');
    KS.forEach((k) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = k ? 'k = ' + k : '제거 안 함';
      b.addEventListener('click', () => set(k)); kb.appendChild(b);
    });
    function set(k) {
      kb.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', KS[i] === k));
      const lo = k ? mean - k * sd : -Infinity, hi = k ? mean + k * sd : Infinity;
      let rows = 0, gone = 0, keepDef = 0;
      pts.forEach((p) => {
        const keep = p.v >= lo && p.v <= hi;
        if (keep) { rows++; keepDef += p.d; } else if (p.d) gone++;
        p.c.setAttribute('opacity', keep ? 1 : 0.18);
        p.c.setAttribute('stroke', !keep && p.d ? 'var(--bad)' : 'none');
        p.c.setAttribute('stroke-width', 2.5);
        p.c.setAttribute('r', !keep && p.d ? 5 : 3.6);
        if (!keep && p.d) p.c.setAttribute('opacity', 0.9);
      });
      const vis = k ? 1 : 0;
      const xl = k ? Math.max(L, X(lo)) : L, xr = k ? Math.min(R, X(hi)) : R;
      zoneL.setAttribute('x', L); zoneL.setAttribute('width', xl - L); zoneR.setAttribute('x', xr); zoneR.setAttribute('width', R - xr);
      [lineL, lineR].forEach((l) => l.setAttribute('opacity', vis));
      lineL.setAttribute('x1', xl); lineL.setAttribute('x2', xl); lineR.setAttribute('x1', xr); lineR.setAttribute('x2', xr);
      cut.setAttribute('x', xl + 6); cut.textContent = k ? '회색 = 삭제 (' + lo.toFixed(1) + ' 미만 · ' + hi.toFixed(1) + ' 초과)' : '';
      const rate = keepDef / rows * 100;
      $('ol-rows').textContent = rows; $('ol-gone').textContent = gone; $('ol-rate').textContent = rate.toFixed(1) + '%';
      $('ol-code').innerHTML = hl(k
        ? `m = df['strength'].mean()\ns = df['strength'].std()\nclean = df[(df['strength'] - m).abs() <= ${k} * s]   # 이상치 제거\nprint(len(df), '→', len(clean))`
        : `clean = df          # 이상치 제거 안 함\nprint(len(df), '→', len(clean))`);
      const st = $('ol-st');
      if (!k) { st.className = 'status ok'; st.innerHTML = `<b class="k">원본 그대로</b>${N}행, 불량 ${nDef}개 — 불량률 ${(nDef / N * 100).toFixed(1)}%.`; }
      else if (gone >= 10) { st.className = 'status bad'; st.innerHTML = `<b class="k">불량품 ${gone}개가 ‘이상치’로 사라짐</b>지운 ${N - rows}행 중 ${gone}개가 불량. 불량률이 ${(nDef / N * 100).toFixed(1)}% → <b>${rate.toFixed(1)}%</b>로 좋아 보이지만 착시입니다.`; }
      else { st.className = 'status mid'; st.innerHTML = `<b class="k">적어 보여도 확인</b>지운 ${N - rows}행 중 ${gone}개가 불량품. 불량률 ${rate.toFixed(1)}%. 무엇을 지웠는지 꼭 봅니다.`; }
    }
    set(0);
  })();

  /* ───────── 3) 검증 체크리스트 ───────── */
  (function checklist() {
    const list = $('ck-finds'); if (!list) return;
    const F = [
      { k: 'mid', t: '실행 결과 <code>야간 불량률: 13.8%</code> — 오류 없음. 하지만 <b>오류가 없다 ≠ 맞다</b>.' },
      { k: 'bad', t: '<code>len(night)</code> = <b>251행</b>인데, 계산한 줄은 <code>df</code>(<b>494행</b> 전체)를 쓴다 → 야간만 고른 표를 쓰지 않았다!' },
      { k: 'bad', t: '직접 계산: 야간 불량 <b>51개 ÷ 251개 = 20.3%</b>. AI가 말한 13.8%와 다르다.' },
      { k: 'ok', t: 'AI: “night 대신 df를 썼습니다. <code>night[\'defect\'].mean() * 100</code> → 20.3%” — 고친 코드도 <b>다시 실행해</b> 확인한다.' },
      { k: 'bad', t: '13.8%는 <b>전체 불량률</b>과 똑같다 → 필터가 빠졌다는 신호. 주간은 7.0%이므로 “차이가 크지 않다”는 결론도 틀렸다.' },
    ];
    const on = new Set();
    function render() {
      list.innerHTML = '';
      [...on].sort().forEach((i) => {
        const d = document.createElement('div'); d.className = 'fd ' + F[i].k;
        d.innerHTML = `<span class="num">${i + 1}</span><span>${F[i].t}</span>`; list.appendChild(d);
      });
      const st = $('ck-st');
      const caught = [1, 2, 4].some((i) => on.has(i));
      if (!on.size) { st.className = 'status mid'; st.innerHTML = '<b class="k">판정 전</b>아직은 AI의 말만 있습니다.'; }
      else if (!caught && !on.has(3)) { st.className = 'status mid'; st.innerHTML = '<b class="k">아직 판단 불가</b>실행만으로는 맞는지 알 수 없습니다. 다른 단계도 눌러 보세요.'; }
      else { st.className = 'status bad'; st.innerHTML = '<b class="k">틀린 답 발견</b>야간 불량률은 <b>20.3%</b> — 주간(7.0%)의 약 3배.' + (on.size === 5 ? ' <b>다섯 단계 검증 완료!</b>' : ''); }
    }
    document.querySelectorAll('.chk-step').forEach((b) => b.addEventListener('click', () => {
      const i = +b.dataset.s;
      if (on.has(i)) { on.delete(i); b.setAttribute('aria-pressed', 'false'); } else { on.add(i); b.setAttribute('aria-pressed', 'true'); }
      render();
    }));
    render();
  })();
})();
