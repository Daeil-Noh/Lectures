// 2주 2차시 전용: 정형/비정형 카드, 열 분류, 일일 진동 시계열, 샘플링 주기, 이미지·텍스트를 숫자로
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };

  /* ───────── 1) 정형일까 비정형일까 ───────── */
  (function scards() {
    const wrap = $('scards'); if (!wrap) return;
    const items = [
      { ic: 'database', n: '사출 공정 기록 CSV (제품별 온도·압력·불량)', k: 'yes', v: '정형', a: '행 = 제품, 열 = 항목. 바로 표로 다룰 수 있다.' },
      { ic: 'eye', n: '비전 검사 카메라로 찍은 제품 사진', k: 'no', v: '비정형', a: '화소 덩어리. 표의 칸에 그대로 들어가지 않는다.' },
      { ic: 'log', n: '작업일지 메모 “3호기 소음 심함”', k: 'no', v: '비정형', a: '자유롭게 쓴 글. 단어를 세거나 분류해야 숫자가 된다.' },
      { ic: 'activity', n: '진동 센서가 0.01초마다 잰 값', k: 'yes', v: '정형 (시계열)', a: '시각 + 측정값의 표. 행 순서가 시간이라는 점이 특별하다.' },
      { ic: 'code', n: '설비 알람 기록 {"code": "E12", "level": 2}', k: 'mid', v: '반정형', a: '이름표(키)는 있지만 기록마다 항목이 다를 수 있다. 정리하면 표가 된다.' },
      { ic: 'flask', n: '조건별 수율 실험 결과 엑셀', k: 'yes', v: '정형', a: '조건 열과 결과 열로 된 표.' },
      { ic: 'chat', n: '고객이 보낸 품질 불만 이메일', k: 'no', v: '비정형', a: '글이다. 불만 유형을 분류해 범주형 열로 바꿔 쓸 수 있다.' },
      { ic: 'gauge', n: '베어링 소리를 녹음한 음성 파일', k: 'no', v: '비정형', a: '소리 파형. 주파수 특징 등을 뽑아 숫자로 바꿔 분석한다.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="ic-badge"><svg class="ic"><use href="#i-${it.ic}"/></svg></span><span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('sc-score').textContent = opened + ' / ' + items.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 2) process.csv 열 분류 ───────── */
  (function classify() {
    const grid = $('colgrid'); if (!grid) return;
    // dt: Colab(pandas 2.x)에서 pd.read_csv 로 읽은 자료형
    const COLS = [
      { c: 'product_id', s: 'P00001, P00002', a: 'id', dt: 'object', why: '제품마다 다른 이름표. 계산하지 않는다.' },
      { c: 'date', s: '2026-03-02', a: 'id', dt: 'object', why: '날짜. 시간 순서를 나타낸다(시계열의 기준).' },
      { c: 'shift', s: '주간, 야간', a: 'cat', dt: 'object', why: '두 무리로 나누는 이름표.' },
      { c: 'line', s: '1라인~3라인', a: 'cat', dt: 'object', why: '숫자가 붙어도 라인 이름표.' },
      { c: 'machine', s: '1호기~6호기', a: 'cat', dt: 'object', why: '설비 이름표. 평균 “3.5호기”는 뜻이 없다.' },
      { c: 'temp', s: '211.7 ℃', a: 'num', dt: 'float64', why: '연속형 측정값.' },
      { c: 'pressure', s: '68.6 bar', a: 'num', dt: 'float64', why: '연속형 측정값.' },
      { c: 'speed', s: '1312 rpm', a: 'num', dt: 'int64', why: '정수로 기록됐지만 회전 속도를 잰 값 → 수치형.' },
      { c: 'humidity', s: '60.7 %', a: 'num', dt: 'float64', why: '연속형 측정값.' },
      { c: 'thickness', s: '1.980 mm', a: 'num', dt: 'float64', why: '연속형 측정값.' },
      { c: 'strength', s: '34.57 MPa', a: 'num', dt: 'float64', why: '연속형 측정값(인장강도).' },
      { c: 'defect', s: '0, 1', a: 'cat', dt: 'int64', why: '0·1 숫자지만 “정상/불량” 두 범주.' },
      { c: 'defect_type', s: '정상, 찍힘 …', a: 'cat', dt: 'object', why: '불량 유형 4가지 이름표.' },
    ];
    const NAME = { num: '수치형', cat: '범주형', id: '식별자·날짜' };
    const ans = COLS.map(() => null);
    let sel = 0, checked = false;
    const chips = COLS.map((c, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'colchip';
      b.innerHTML = `<span class="cn">${c.c}</span><span class="sv">${c.s}</span><span class="ctag"></span><span class="dt">컴퓨터: ${c.dt}</span>`;
      b.addEventListener('click', () => { sel = i; render(); });
      grid.appendChild(b); return b;
    });
    function render() {
      chips.forEach((b, i) => {
        b.className = 'colchip' + (ans[i] ? ' b-' + ans[i] : '') + (i === sel ? ' sel' : '') + (checked && ans[i] ? (ans[i] === COLS[i].a ? ' ok' : ' no') : '');
        b.querySelector('.ctag').textContent = ans[i] ? NAME[ans[i]] + (checked ? (ans[i] === COLS[i].a ? ' ✓' : ' ✗') : '') : '';
      });
    }
    document.querySelectorAll('.bucket').forEach((bt) => bt.addEventListener('click', () => {
      if (sel < 0) return;
      ans[sel] = bt.dataset.b; checked = false;
      const c = COLS[sel];
      $('cl-msg').innerHTML = `<code class="mono">${c.c}</code> → <strong>${NAME[ans[sel]]}</strong>. 다음 열을 골라 보세요.`;
      const next = ans.findIndex((v, i) => v === null && i > sel);
      sel = next >= 0 ? next : ans.indexOf(null);
      render();
    }));
    $('cl-check').addEventListener('click', () => {
      const done = ans.filter(Boolean).length;
      if (done < COLS.length) { $('cl-msg').innerHTML = `아직 <strong>${COLS.length - done}개 열</strong>이 남았습니다.`; return; }
      checked = true; render();
      const wrong = COLS.map((c, i) => (ans[i] !== c.a ? i : -1)).filter((i) => i >= 0);
      const ok = COLS.length - wrong.length;
      $('cl-msg').innerHTML = wrong.length === 0
        ? `<strong>${ok} / 13 정답!</strong> 이제 ‘컴퓨터 눈’을 켜 보세요. <code class="mono">defect</code>를 컴퓨터는 숫자(int64)로 읽습니다 — 의미는 사람이 알려 줘야 합니다.`
        : `<strong>${ok} / 13</strong>. 예: <code class="mono">${COLS[wrong[0]].c}</code> — ${COLS[wrong[0]].why} 빨간 점선 칸을 다시 골라 보세요.`;
    });
    $('cl-dt').addEventListener('click', () => {
      const on = toggle($('cl-dt'));
      grid.classList.toggle('showdt', on);
      if (on) $('cl-msg').innerHTML = 'pandas는 <strong>글자(object)·실수(float64)·정수(int64)</strong>만 구분합니다. <code class="mono">speed</code>와 <code class="mono">defect</code>는 둘 다 int64지만 하나는 측정값, 하나는 범주입니다.';
    });
    render();
  })();

  /* ───────── 3) 일일 진동 시계열 (vibration.csv 1호기 rms) ───────── */
  (function ts() {
    const svg = $('ts'); if (!svg) return;
    const V = [0.83, 1.1, 1.0, 0.87, 0.97, 1.01, 0.96, 0.95, 0.91, 0.93, 0.92, 0.91, 0.97, 0.95, 0.96, 1.46, 1.01, 1.03, 1.0, 0.93, 0.89, 0.99, 0.86, 1.1, 1.08, 0.86, 0.94, 0.93, 0.92, 0.95, 0.96, 1.0, 0.96, 0.88, 0.82, 0.99, 0.99, 0.99, 0.91, 1.06, 1.04, 1.06, 0.94, 0.98, 0.97, 0.9, 0.98, 1.0, 0.99, 0.98, 0.98, 1.01, 0.87, 0.97, 1.02, 1.06, 0.9, 1.0, 0.94, 0.98, 0.94, 0.95, 0.99, 1.12, 0.83, 0.97, 0.96, 0.95, 0.86, 0.91, 0.9, 0.89, 0.87, 1.03, 0.87, 0.93, 0.76, 0.95, 1.07, 0.98, 0.94, 0.94, 0.97, 1.01, 0.97, 1.09, 1.03, 0.98, 0.99, 1.02, 0.99, 0.84, 0.92, 0.97, 0.99, 0.97, 1.1, 1.01, 0.92, 1.12, 0.84, 1.03, 0.84, 0.96, 0.95, 0.94, 1.03, 1.11, 0.9, 0.94, 0.99, 0.93, 1.08, 1.09, 1.01, 0.99, 0.94, 0.93, 0.91, 1.02];
    const L = 54, R = 626, T = 20, B = 250;
    const X = (d) => L + (d - 1) / 119 * (R - L), Y = (v) => B - (v - 0.6) / 1.0 * (B - T);
    for (let v = 0.6; v <= 1.61; v += 0.2) {
      el('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), class: 'p-grid' }, svg);
      el('text', { x: L - 8, y: Y(v) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = v.toFixed(1);
    }
    for (let d = 1; d <= 120; d += 20) el('text', { x: X(d), y: B + 20, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = d + '일';
    el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis' }, svg);
    el('text', { x: (L + R) / 2, y: B + 44, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = '날짜 (하루 1번 측정) →';
    el('text', { x: 14, y: (T + B) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 14 ${(T + B) / 2})` }, svg).textContent = '진동 rms';
    el('polyline', { points: V.map((v, i) => X(i + 1).toFixed(1) + ',' + Y(v).toFixed(1)).join(' '), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, svg);
    V.forEach((v, i) => el('circle', { cx: X(i + 1), cy: Y(v), r: 2.6, class: 'f-acc' }, svg));
    el('circle', { cx: X(16), cy: Y(1.46), r: 9, fill: 'none', stroke: 'var(--accent-2)', 'stroke-width': 3 }, svg);
    el('text', { x: X(16) + 14, y: Y(1.46) + 5, class: 't-acc2' }, svg).textContent = '16일째 1.46 — 그날 무슨 일이?';
  })();

  /* ───────── 4) 샘플링 주기 ───────── */
  (function sampling() {
    const svg = $('smp'); if (!svg) return;
    const hash = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
    const spike = (t) => (t >= 6.28 && t <= 6.38 ? 2.4 * (1 - Math.abs(t - 6.33) / 0.05) : 0);
    const sig = (t) => 0.35 * Math.sin(2 * Math.PI * 1.1 * t) + 0.18 * Math.sin(2 * Math.PI * 2.9 * t + 1) + (hash(Math.round(t * 1000)) - 0.5) * 0.16 + spike(t);
    const DTS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1];
    const L = 54, R = 640, T = 24, B = 360;
    const X = (t) => L + t / 10 * (R - L), Y = (v) => B - (v + 1) / 3.6 * (B - T);
    for (let v = -1; v <= 2.51; v += 0.5) {
      el('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), class: 'p-grid' }, svg);
      el('text', { x: L - 8, y: Y(v) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = v.toFixed(1);
    }
    for (let t = 0; t <= 10; t += 2) el('text', { x: X(t), y: B + 20, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = t + '초';
    el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis' }, svg);
    el('text', { x: (L + R) / 2, y: B + 46, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = '시간 →';
    el('text', { x: 14, y: (T + B) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 14 ${(T + B) / 2})` }, svg).textContent = '진동 →';
    // 실제 신호(흐리게)
    let d = '';
    for (let k = 0; k <= 2000; k++) { const t = k * 0.005; d += (k ? 'L' : 'M') + X(t).toFixed(1) + ',' + Y(sig(+t.toFixed(3))).toFixed(1); }
    el('path', { d, fill: 'none', stroke: 'var(--muted)', 'stroke-width': 1.2, opacity: 0.35 }, svg);
    el('rect', { x: X(6.25), y: T, width: X(6.41) - X(6.25), height: B - T, fill: 'var(--accent-2)', 'fill-opacity': 0.08 }, svg);
    el('text', { x: X(6.33), y: T + 14, 'text-anchor': 'middle', class: 'p-tick', style: 'font-weight:800;fill:var(--accent-2)' }, svg).textContent = '순간 충격';
    const line = el('polyline', { fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, svg);
    const dots = el('g', {}, svg);
    const leg = el('g', { transform: `translate(${R - 250} ${B - 22})` }, svg);
    el('line', { x1: 0, x2: 22, y1: 0, y2: 0, stroke: 'var(--muted)', opacity: 0.5, 'stroke-width': 2 }, leg); el('text', { x: 28, y: 4, class: 'p-tick' }, leg).textContent = '실제 진동';
    el('circle', { cx: 112, cy: 0, r: 4, class: 'f-acc' }, leg); el('text', { x: 122, y: 4, class: 'p-tick' }, leg).textContent = '측정해서 남은 값';
    const s = $('sm-s');
    function update() {
      const dt = DTS[+s.value];
      const pts = [];
      for (let k = 0; k * dt <= 10 + 1e-9; k++) { const t = +(k * dt).toFixed(4); pts.push([t, sig(t)]); }
      line.setAttribute('points', pts.map(([t, v]) => X(t).toFixed(1) + ',' + Y(v).toFixed(1)).join(' '));
      dots.innerHTML = '';
      if (pts.length <= 101) pts.forEach(([t, v]) => el('circle', { cx: X(t), cy: Y(v), r: pts.length > 60 ? 3 : 4.5, class: 'f-acc' }, dots));
      const mx = Math.max(...pts.map((p) => p[1]));
      $('sm-o').textContent = dt + '초' + (dt < 1 ? ` (${Math.round(1 / dt)}Hz)` : ' (1Hz)');
      $('sm-n').textContent = pts.length.toLocaleString() + '개';
      $('sm-max').textContent = mx.toFixed(2);
      $('sm-day').textContent = Math.round(86400 / dt).toLocaleString() + '행';
      $('sm-msg').innerHTML = mx >= 1.8
        ? `순간 충격을 <strong>제대로 잡았습니다</strong>(최대 ${mx.toFixed(2)}). 대신 하루에 <strong>${Math.round(86400 / dt).toLocaleString()}행</strong>이 쌓입니다.`
        : mx >= 0.8
          ? `충격이 <strong>실제보다 작게</strong> 기록됐습니다(최대 ${mx.toFixed(2)}, 실제 약 2.3). 충격의 꼭대기를 건너뛰었습니다.`
          : `측정 사이에 충격이 끼어 <strong>흔적 없이 사라졌습니다</strong>(최대 ${mx.toFixed(2)}). 데이터만 보면 “아무 일 없음”입니다.`;
    }
    s.addEventListener('input', update);
    update();
  })();

  /* ───────── 5) 이미지·텍스트 → 숫자 ───────── */
  (function pix() {
    const box = $('pix'); if (!box) return;
    const cells = [];
    for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
      const dist = Math.hypot(r - 4.5, c - 4.5);
      let v = dist < 4.2 ? (dist < 1.6 ? 120 : 214 - Math.round(dist * 6)) : 38;
      if (dist < 4.2 && Math.abs((r - 2) - (c - 1) * 0.55) < 0.6 && c >= 1 && c <= 7) v = 64;   // 흠집
      v = Math.max(0, Math.min(255, v + ((r * 7 + c * 13) % 9) - 4));
      const sp = document.createElement('span');
      sp.style.background = `rgb(${v},${v},${v})`; sp.textContent = v;
      if (v < 100) sp.classList.add('dk');
      box.appendChild(sp); cells.push(sp);
    }
    const memo = $('memo'), raw = memo.innerHTML;
    $('px-btn').addEventListener('click', () => {
      const on = toggle($('px-btn'));
      box.classList.toggle('nums', on);
      $('px-btn').innerHTML = on ? '<svg class="ic"><use href="#i-eye"/></svg> 다시 이미지로 보기' : '<svg class="ic"><use href="#i-eye"/></svg> 이미지를 숫자로 보기';
      if (on) $('px-msg').innerHTML = '흠집 자리는 <strong>숫자가 작습니다(어둡다)</strong>. AI는 이 숫자 패턴에서 흠집을 찾습니다(13주 비전 검사).';
    });
    $('wd-btn').addEventListener('click', () => {
      const on = toggle($('wd-btn'));
      $('words').hidden = !on;
      memo.innerHTML = on ? '작업일지: “<mark>3호기</mark> 소음 심함. 오후에 <mark>3호기</mark> 점검 요청.”' : raw;
      if (on) $('px-msg').innerHTML = '글은 단어를 세면 <strong>표(정형)</strong>가 됩니다. “3호기”가 두 번 — 이 메모의 핵심이 숫자로 드러납니다.';
    });
  })();
})();
