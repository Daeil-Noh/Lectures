// 1주 2차시 전용: 공정 지도, 비전 검사, 예지보전, 실험 줄이기, 로봇 집기, AX 순환
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const icon = (name, x, y, size, color, parent) => {
    const g = el('g', { transform: `translate(${x} ${y}) scale(${size / 24})`, style: `color:${color};pointer-events:none` }, parent);
    el('use', { href: '#i-' + name, width: 24, height: 24 }, g);
    return g;
  };
  const $ = (id) => document.getElementById(id);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  /* ───────── 1) 공정 지도 ───────── */
  (function processMap() {
    const svg = $('pmap'); if (!svg) return;
    const S = [
      { k: 'plan', x: 85, ic: 'chart', name: '계획·입고', h: '수요 예측 → 생산 계획', d: '지난 주문 기록으로 다음 달 주문량을 예측해 생산량과 원자재 입고를 정한다.', data: '쓰는 데이터: 주문·판매 기록, 계절·시기', wk: '이 강의: 10주 회귀(예측)' },
      { k: 'proc', x: 215, ic: 'thermo', name: '가공', h: '공정 조건 → 품질 예측', d: '온도·압력·속도 같은 공정 조건으로 제품 품질을 미리 예측하고, 좋은 조건을 찾는다.', data: '쓰는 데이터: 공정 센서(온도·압력·속도)', wk: '이 강의: 6~7주 관계 분석, 10주 회귀' },
      { k: 'asm', x: 345, ic: 'user', name: '조립', h: '사람과 함께 일하는 로봇', d: '협동로봇이 반복·무거운 작업을 맡고, 카메라가 작업 순서·부품 누락을 확인한다.', data: '쓰는 데이터: 카메라 영상, 힘·거리 센서', wk: '이 강의: 13주 딥러닝(영상 인식)' },
      { k: 'insp', x: 475, ic: 'eye', name: '검사', h: '비전 검사', d: '카메라로 찍은 제품 이미지에서 AI가 흠집·찍힘·이물질을 찾아 불량을 판정한다.', data: '쓰는 데이터: 제품 이미지', wk: '이 강의: 11주 분류, 13주 이미지 인식 → 다음 장에서 직접 해 보기' },
      { k: 'ship', x: 605, ic: 'map', name: '출하·물류', h: '재고·물류 최적화', d: '이동로봇이 스스로 경로를 찾아 운반하고, 재고 데이터로 적정 재고를 유지한다.', data: '쓰는 데이터: 재고·위치 기록', wk: '이 강의: 기초 분석 도구로 활용' },
      { k: 'pdm', x: 345, y: 300, ic: 'activity', name: '설비 관리', h: '예지보전', d: '설비의 진동·전류·온도 변화를 보고 고장 징후를 미리 찾아, 멈추기 전에 정비한다.', data: '쓰는 데이터: 진동·전류·온도 센서', wk: '이 강의: 12주 이상탐지 → 다음다음 장에서 직접 해 보기', wide: true },
    ];
    S.forEach((s) => {
      const g = el('g', { class: 'station', tabindex: 0, role: 'button', 'aria-label': s.name }, svg);
      const w = s.wide ? 240 : 112, h = s.wide ? 92 : 112;
      const x = s.x - w / 2, y = s.y ? s.y : 52;
      if (s.wide) {
        [85, 215, 345, 475, 605].forEach((mx) => el('path', { d: `M${mx},196 Q${mx},${y - 30} ${s.x},${y}`, fill: 'none', stroke: 'var(--line)', 'stroke-width': 2, 'stroke-dasharray': '4 6' }, svg.insertBefore(el('g', {}), svg.firstChild)));
      }
      el('rect', { x, y, width: w, height: h, rx: 18, class: 'pad' }, g);
      if (s.wide) {
        icon(s.ic, x + 26, y + 24, 44, 'var(--accent-2)', g);
        el('text', { x: x + 86, y: y + 44, class: 't-main', style: 'font-size:20px' }, g).textContent = s.name;
        el('text', { x: x + 86, y: y + 68, class: 't-sub', style: 'font-size:14px' }, g).textContent = '모든 공정의 기계';
      } else {
        icon(s.ic, s.x - 22, y + 16, 44, 'var(--accent)', g);
        el('text', { x: s.x, y: y + 92, 'text-anchor': 'middle', class: 't-main', style: 'font-size:18px' }, g).textContent = s.name;
        el('line', { x1: s.x, x2: s.x, y1: y + h, y2: 180, stroke: 'var(--line)', 'stroke-width': 3 }, svg);
      }
      const pick = () => {
        svg.querySelectorAll('.station').forEach((n) => n.classList.remove('on'));
        g.classList.add('on');
        $('pm-ic').innerHTML = `<svg class="ic"><use href="#i-${s.ic}"/></svg>`;
        $('pm-ic').className = 'ic-badge' + (s.k === 'pdm' ? ' o' : '');
        $('pm-h').textContent = s.name + ' · ' + s.h;
        $('pm-d').textContent = s.d;
        $('pm-data').textContent = s.data;
        $('pm-wk').textContent = s.wk;
      };
      g.addEventListener('click', pick);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(); } });
    });
  })();

  /* ───────── 2) 비전 검사 ───────── */
  (function vision() {
    const box = $('parts'); if (!box) return;
    // 불량 7개, 양품 17개 — AI 점수는 대체로 맞지만 애매한 것도 섞여 있음
    const defects = [[92, 'scratch'], [88, 'crack'], [81, 'chip'], [74, 'stain'], [66, 'scratch'], [48, 'chip'], [37, 'stain']];
    const goods = [6, 9, 12, 14, 17, 20, 23, 26, 29, 31, 34, 39, 43, 51, 57, 62, 18];
    let items = defects.map(([s, t]) => ({ bad: true, s, t })).concat(goods.map((s) => ({ bad: false, s })));
    const r = rng(11);
    items = items.map((v) => ({ v, k: r() })).sort((a, b) => a.k - b.k).map((o) => o.v);
    const parts = items.map((it) => {
      const d = document.createElement('div');
      d.className = 'part' + (it.bad ? ' truebad' : '');
      let svg = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="var(--surface)" stroke="var(--muted)" stroke-width="3"/><circle cx="50" cy="50" r="15" fill="var(--surface-2)" stroke="var(--muted)" stroke-width="3"/><circle cx="50" cy="50" r="30" fill="none" stroke="var(--line)" stroke-width="2"/>';
      if (it.t === 'scratch') svg += '<path d="M24 34 L58 26" stroke="var(--accent-2)" stroke-width="3.5" stroke-linecap="round"/>';
      if (it.t === 'crack') svg += '<path d="M64 60 l8 6 l-4 5 l9 7" fill="none" stroke="var(--accent-2)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>';
      if (it.t === 'chip') svg += '<path d="M76 30 L92 40 L84 52 Z" fill="var(--surface-2)"/>';
      if (it.t === 'stain') svg += '<ellipse cx="34" cy="66" rx="7" ry="5" fill="var(--accent-2)" opacity=".55"/>';
      d.innerHTML = svg + '</svg><span class="sc">' + it.s + '</span>';
      box.appendChild(d);
      return d;
    });
    let scanned = false;
    const th = $('v-th');
    function update() {
      const T = +th.value;
      $('v-th-o').textContent = T + '점 이상';
      if (!scanned) return;
      let tp = 0, fn = 0, fp = 0;
      items.forEach((it, i) => {
        const flag = it.s >= T;
        parts[i].classList.toggle('flag', flag);
        parts[i].classList.toggle('miss', it.bad && !flag);
        if (it.bad && flag) tp++; else if (it.bad) fn++; else if (flag) fp++;
      });
      $('v-tp').textContent = tp + '/7'; $('v-fn').textContent = fn; $('v-fp').textContent = fp;
      $('v-msg').innerHTML = fn > 0 && fp > 0 ? `불량 <strong>${fn}개를 놓치고</strong>, 양품 <strong>${fp}개에 잘못 경보</strong>. 기준을 움직여 보세요 — 둘 다 0으로 만들 수 있을까요?`
        : fn > 0 ? `잘못 경보는 없지만 불량 <strong>${fn}개가 고객에게</strong> 갑니다. 기준이 너무 높습니다.`
        : fp > 0 ? `불량은 모두 잡았지만 양품 <strong>${fp}개를 버리거나 재검사</strong>해야 합니다.`
        : '완벽한 기준입니다!';
    }
    $('v-scan').addEventListener('click', async () => {
      const pl = box.parentElement;
      box.classList.remove('scanning'); void box.offsetWidth; box.classList.add('scanning');
      $('v-scan').disabled = true;
      await wait(1400);
      box.classList.add('scanned'); scanned = true; $('v-scan').disabled = false;
      $('v-scan').innerHTML = '<svg class="ic"><use href="#i-reset"/></svg> 다시 검사';
      update();
    });
    $('v-ans').addEventListener('click', () => {
      const on = box.classList.toggle('reveal');
      $('v-ans').textContent = on ? '정답 숨기기' : '정답 보기';
    });
    th.addEventListener('input', update);
    update();
  })();

  /* ───────── 3) 예지보전 ───────── */
  (function pdm() {
    const svg = $('pdm'); if (!svg) return;
    const r = rng(3), sig = [];
    for (let d = 0; d <= 60; d++) {
      const base = 1 + (d > 34 ? ((d - 34) / 26) ** 2 * 2.4 : 0);
      sig.push(base + (r() - 0.5) * 0.36 + (r() < 0.05 ? 0.35 : 0));
    }
    const L = 56, R = 610, T = 24, B = 362;
    const X = (d) => L + d / 60 * (R - L), Y = (v) => B - (v - 0.5) / 3.3 * (B - T);
    for (let v = 1; v <= 3.5; v += 0.5) {
      el('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), class: 'p-grid' }, svg);
      el('text', { x: L - 10, y: Y(v) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = v.toFixed(1);
    }
    for (let d = 0; d <= 60; d += 10) el('text', { x: X(d), y: B + 20, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = d + '일';
    el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis' }, svg);
    el('text', { x: (L + R) / 2, y: B + 46, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = '날짜 →';
    el('text', { x: 16, y: (T + B) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 16 ${(T + B) / 2})` }, svg).textContent = '진동 세기 →';
    el('rect', { x: X(34), y: T, width: X(60) - X(34), height: B - T, fill: 'var(--accent-2)', 'fill-opacity': 0.05 }, svg);
    const hint = el('text', { x: X(35), y: T + 18, class: 'p-tick', style: 'font-weight:700' }, svg); hint.textContent = '이때부터 부품이 닳기 시작 (현장에서는 모름)';
    const failG = el('g', {}, svg);
    el('line', { x1: X(60), x2: X(60), y1: T, y2: B, stroke: 'var(--bad)', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, failG);
    el('text', { x: X(60) - 6, y: B - 8, 'text-anchor': 'end', class: 'p-tick', style: 'fill:var(--bad);font-weight:800' }, failG).textContent = '고장';
    const thLine = el('line', { x1: L, x2: R, class: 'p-line', 'stroke-dasharray': '8 6' }, svg);
    const thTxt = el('text', { x: R, 'text-anchor': 'end', class: 'p-tick', style: 'fill:var(--accent-2);font-weight:800' }, svg);
    const path = el('polyline', { fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, svg);
    const marks = el('g', {}, svg);
    let day = 0, timer = null;
    const th = $('p-th');
    function render() {
      const t = +th.value;
      $('p-th-o').textContent = t.toFixed(1);
      thLine.setAttribute('y1', Y(t)); thLine.setAttribute('y2', Y(t));
      thTxt.setAttribute('y', Y(t) - 8); thTxt.textContent = '경보 기준 ' + t.toFixed(1);
      path.setAttribute('points', sig.slice(0, day + 1).map((v, d) => X(d).toFixed(1) + ',' + Y(v).toFixed(1)).join(' '));
      marks.innerHTML = '';
      let falseN = 0, real = -1;
      for (let d = 0; d <= day; d++) {
        if (sig[d] > t) {
          const isFalse = d < 35;
          if (isFalse) falseN++; else if (real < 0) real = d;
          if (isFalse || d === real) {
            el('circle', { cx: X(d), cy: Y(sig[d]), r: 9, fill: 'none', stroke: isFalse ? 'var(--bad)' : 'var(--accent-2)', 'stroke-width': 3 }, marks);
            el('text', { x: X(d), y: Y(sig[d]) - 16, 'text-anchor': 'middle', class: 'p-tick', style: `font-weight:800;fill:${isFalse ? 'var(--bad)' : 'var(--accent-2)'}` }, marks).textContent = isFalse ? '잘못 경보' : '경보!';
          }
        }
      }
      $('p-day').textContent = day + '일';
      $('p-alarm').textContent = real >= 0 ? real + '일째' : '-';
      const done = day >= 60;
      if (!done && day === 0) return;
      let m = '';
      if (falseN) m += `기준이 너무 낮아 <strong>정상일 때도 ${falseN}번 경보</strong>가 울렸습니다. 경보를 믿지 않게 됩니다. `;
      if (real >= 0) {
        const lead = 60 - real;
        m += lead >= 10 ? `고장 <strong>${lead}일 전</strong>에 알아챘습니다. 정비 일정을 잡을 시간이 충분합니다.`
          : `고장 <strong>${lead}일 전</strong>에야 알아챘습니다. 부품 주문·정비가 빠듯합니다.`;
      } else if (done) m += '경보 없이 <strong>고장</strong>! 기준이 너무 높았습니다. 라인이 멈춥니다.';
      else m += '진동이 조금씩 커지고 있습니다…';
      $('p-msg').innerHTML = m;
    }
    function reset() {
      clearInterval(timer); timer = null; day = 0;
      $('p-run').disabled = false;
      $('p-msg').innerHTML = '진동 센서가 매일 설비 상태를 기록합니다. <strong>60일째 고장</strong>이 납니다. 언제 알아챌 수 있을까요?';
      render();
    }
    $('p-run').addEventListener('click', () => {
      if (timer) return;
      if (day >= 60) day = 0;
      $('p-run').disabled = true;
      timer = setInterval(() => {
        day++; render();
        if (day >= 60) { clearInterval(timer); timer = null; $('p-run').disabled = false; }
      }, 70);
    });
    $('p-reset').addEventListener('click', reset);
    th.addEventListener('input', render);
    reset();
  })();

  /* ───────── 4) 실험 줄이기 ───────── */
  (function lab() {
    const wrap = $('cells'); if (!wrap) return;
    const temps = ['60℃', '70℃', '80℃', '90℃', '100℃'], times = ['1시간', '2시간', '3시간', '4시간', '5시간'];
    const f = (i, j) => Math.round(40 + 50 * Math.exp(-((i - 3.2) ** 2 + (j - 1.3) ** 2) / 4.5));
    const cells = [];
    for (let i = 4; i >= 0; i--) {         // 위쪽이 높은 온도
      const ax = document.createElement('div'); ax.className = 'ax'; ax.textContent = temps[i]; wrap.appendChild(ax);
      for (let j = 0; j < 5; j++) {
        const c = document.createElement('div'); c.className = 'cell'; c.innerHTML = '<span class="pr"></span>';
        wrap.appendChild(c); cells.push({ i, j, v: f(i, j), el: c, tried: false });
      }
    }
    wrap.appendChild(document.createElement('div'));
    times.forEach((t) => { const ax = document.createElement('div'); ax.className = 'ax'; ax.textContent = t; wrap.appendChild(ax); });
    const TRUE_BEST = Math.max(...cells.map((c) => c.v));
    const color = (v) => { const p = Math.max(0, Math.min(100, (v - 40) / 50 * 100)); return `color-mix(in srgb, var(--accent-2) ${p}%, var(--accent) )`; };
    let n = 0, best = -1, busy = false;
    function reset() {
      cells.forEach((c) => { c.tried = false; c.el.className = 'cell'; c.el.style.background = ''; c.el.innerHTML = '<span class="pr"></span>'; });
      n = 0; best = -1; show();
    }
    function show() { $('e-n').textContent = n + '번'; $('e-best').textContent = best < 0 ? '-' : best + '%'; }
    function tryCell(c) {
      c.tried = true; n++;
      c.el.className = 'cell tried new'; c.el.style.background = color(c.v); c.el.textContent = c.v;
      if (c.v > best) best = c.v;
      show();
    }
    function markBest() { cells.filter((c) => c.tried && c.v === best).forEach((c) => c.el.classList.add('best')); }
    function predict() {
      const tried = cells.filter((c) => c.tried);
      cells.filter((c) => !c.tried).forEach((c) => {
        let num = 0, den = 0;
        tried.forEach((t) => { const w = 1 / (((t.i - c.i) ** 2 + (t.j - c.j) ** 2) ** 1.5); num += w * t.v; den += w; });
        c.pred = num / den;
        c.el.innerHTML = `<span class="pr">예측 ${Math.round(c.pred)}</span>`;
        c.el.style.background = `color-mix(in srgb, ${color(c.pred)} 22%, var(--surface-2))`;
      });
    }
    function lock(on) { busy = on; $('e-all').disabled = on; $('e-ai').disabled = on; }
    $('e-all').addEventListener('click', async () => {
      if (busy) return; lock(true); reset();
      $('e-msg').innerHTML = '모든 조건을 하나씩 실험합니다…';
      for (const c of cells) { tryCell(c); await wait(110); }
      markBest();
      $('e-msg').innerHTML = `<strong>25번(25일)</strong> 실험한 끝에 최고 수율 <strong>${best}%</strong>를 확인했습니다.`;
      lock(false);
    });
    $('e-ai').addEventListener('click', async () => {
      if (busy) return; lock(true); reset();
      $('e-msg').innerHTML = '① 먼저 서로 멀리 떨어진 조건 <strong>5개</strong>만 실험합니다.';
      for (const [i, j] of [[0, 0], [0, 4], [4, 0], [4, 4], [2, 2]]) { tryCell(cells.find((c) => c.i === i && c.j === j)); await wait(350); }
      await wait(400);
      predict();
      $('e-msg').innerHTML = '② AI가 실험 결과로 <strong>나머지 조건의 수율을 예측</strong>합니다 (회색 숫자).';
      await wait(1800);
      while (n < 8) {
        const next = cells.filter((c) => !c.tried).sort((a, b) => b.pred - a.pred)[0];
        $('e-msg').innerHTML = `③ 예측이 가장 높은 조건(${temps[next.i]}·${times[next.j]})을 실험합니다.`;
        next.el.style.outline = '3px dashed var(--accent)';
        await wait(900);
        next.el.style.outline = '';
        tryCell(next); await wait(350); predict(); await wait(700);
      }
      markBest();
      $('e-msg').innerHTML = best === TRUE_BEST
        ? `<strong>8번 만에</strong> 최고 수율 <strong>${best}%</strong> 조건을 찾았습니다. 실험을 <strong>17번(17일) 아꼈습니다.</strong>`
        : `8번 실험으로 찾은 최고 수율은 ${best}%입니다.`;
      lock(false);
    });
    reset();
  })();

  /* ───────── 5) 로봇 집기 ───────── */
  (function robot() {
    const svg = $('robot'); if (!svg) return;
    const BX = 320, BY = 396, L1 = 170, L2 = 152;
    const TRAY = { x: 170, y: 150, w: 300, h: 150 }, FIX = { x: 320, y: 225 }, BIN = { x: 560, y: 320 }, HOME = { x: 320, y: 110 };
    // 배경
    el('rect', { x: TRAY.x, y: TRAY.y, width: TRAY.w, height: TRAY.h, rx: 14, class: 'f-s2', stroke: 'var(--line)', 'stroke-width': 2 }, svg);
    el('text', { x: TRAY.x + 10, y: TRAY.y + TRAY.h + 22, class: 'p-tick' }, svg).textContent = '부품 트레이';
    el('circle', { cx: FIX.x, cy: FIX.y, r: 16, fill: 'none', stroke: 'var(--muted)', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, svg);
    el('text', { x: FIX.x, y: FIX.y + 34, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = '프로그램된 좌표';
    el('rect', { x: BIN.x - 50, y: BIN.y - 30, width: 100, height: 70, rx: 10, class: 'f-accs', stroke: 'var(--accent)', 'stroke-width': 2 }, svg);
    el('text', { x: BIN.x, y: BIN.y + 60, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = '완성품 상자';
    // 카메라
    const cam = el('g', {}, svg);
    el('path', { d: `M86,58 L${TRAY.x},${TRAY.y} M86,58 L${TRAY.x + TRAY.w},${TRAY.y}`, stroke: 'var(--accent)', 'stroke-width': 1.5, 'stroke-dasharray': '3 5', opacity: 0.6 }, cam);
    el('rect', { x: 52, y: 36, width: 56, height: 40, rx: 8, class: 'f-acc' }, cam);
    el('circle', { cx: 80, cy: 56, r: 11, fill: 'var(--surface)' }, cam);
    el('circle', { cx: 80, cy: 56, r: 5, class: 'f-acc' }, cam);
    el('text', { x: 80, y: 96, 'text-anchor': 'middle', class: 'p-tick', style: 'font-weight:700' }, cam).textContent = '카메라';
    cam.style.opacity = 0.35;
    // 부품, 인식 상자, 팔
    const part = el('g', {}, svg);
    el('rect', { x: -17, y: -17, width: 34, height: 34, rx: 7, class: 'f-acc2' }, part);
    el('circle', { cx: 0, cy: 0, r: 6, fill: 'var(--surface)' }, part);
    const det = el('g', { opacity: 0 }, svg);
    const detR = el('rect', { width: 56, height: 56, rx: 6, fill: 'none', stroke: 'var(--ok)', 'stroke-width': 3 }, det);
    const detT = el('text', { class: 'p-tick', style: 'fill:var(--ok);font-weight:800' }, det);
    el('rect', { x: BX - 46, y: BY - 18, width: 92, height: 30, rx: 8, class: 'f-muted' }, svg);
    const l1 = el('line', { stroke: 'var(--muted)', 'stroke-width': 18, 'stroke-linecap': 'round' }, svg);
    const l2 = el('line', { stroke: 'var(--accent)', 'stroke-width': 14, 'stroke-linecap': 'round' }, svg);
    const j0 = el('circle', { cx: BX, cy: BY, r: 14, fill: 'var(--surface)', stroke: 'var(--muted)', 'stroke-width': 4 }, svg);
    const j1 = el('circle', { r: 11, fill: 'var(--surface)', stroke: 'var(--muted)', 'stroke-width': 4 }, svg);
    const grip = el('path', { fill: 'none', stroke: 'var(--text)', 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
    const fx = el('text', { 'text-anchor': 'middle', style: 'font-size:22px;font-weight:800' }, svg);
    let P = { ...HOME }, holding = false, partPos = null, busy = false, s1 = [0, 0], s2 = [0, 0];

    function ik(x, y) {
      const dx = x - BX, dy = y - BY, d = Math.min(Math.hypot(dx, dy), L1 + L2 - 1);
      const c2 = Math.max(-1, Math.min(1, (d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2)));
      let bestE = null;
      for (const sgn of [1, -1]) {
        const t2 = sgn * Math.acos(c2);
        const t1 = Math.atan2(dy, dx) - Math.atan2(L2 * Math.sin(t2), L1 + L2 * Math.cos(t2));
        const e = { x: BX + L1 * Math.cos(t1), y: BY + L1 * Math.sin(t1) };
        if (!bestE || e.y < bestE.y) bestE = e;
      }
      return bestE;
    }
    function draw() {
      const e = ik(P.x, P.y);
      l1.setAttribute('x1', BX); l1.setAttribute('y1', BY); l1.setAttribute('x2', e.x); l1.setAttribute('y2', e.y);
      l2.setAttribute('x1', e.x); l2.setAttribute('y1', e.y); l2.setAttribute('x2', P.x); l2.setAttribute('y2', P.y);
      j1.setAttribute('cx', e.x); j1.setAttribute('cy', e.y);
      const g = holding ? 14 : 22;
      grip.setAttribute('d', `M${P.x - g},${P.y + 22} L${P.x - g},${P.y + 6} L${P.x + g},${P.y + 6} L${P.x + g},${P.y + 22}`);
      if (holding) partPos = { x: P.x, y: P.y + 26 };
      if (partPos) part.setAttribute('transform', `translate(${partPos.x} ${partPos.y})`);
      part.style.display = partPos ? '' : 'none';
    }
    function moveTo(x, y, ms) {
      const s = { ...P };
      return new Promise((res) => {
        const t0 = performance.now();
        const tick = (now) => {
          const k = Math.min(1, (now - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
          P = { x: s.x + (x - s.x) * e, y: s.y + (y - s.y) * e }; draw();
          k < 1 ? requestAnimationFrame(tick) : res();
        };
        requestAnimationFrame(tick);
      });
    }
    function place() {
      let p;
      do { p = { x: TRAY.x + 30 + Math.random() * (TRAY.w - 60), y: TRAY.y + 30 + Math.random() * (TRAY.h - 60) }; }
      while (Math.hypot(p.x - FIX.x, p.y - FIX.y) < 45);
      partPos = p; holding = false; det.setAttribute('opacity', 0); fx.textContent = ''; draw();
    }
    function score() { $('rb-s1').textContent = s1[0] + '/' + s1[1]; $('rb-s2').textContent = s2[0] + '/' + s2[1]; }
    function lock(on) { busy = on; ['rb-new', 'rb-fixed', 'rb-ai'].forEach((id) => ($(id).disabled = on)); }
    async function carry() {
      holding = true; draw(); await wait(150);
      await moveTo(P.x, P.y - 60, 350);
      await moveTo(BIN.x, BIN.y - 70, 800);
      holding = false; partPos = null; draw(); await wait(200);
      await moveTo(HOME.x, HOME.y, 700);
    }
    $('rb-new').addEventListener('click', () => { if (!busy) { place(); $('rb-msg').innerHTML = '부품이 새 위치에 놓였습니다.'; } });
    $('rb-fixed').addEventListener('click', async () => {
      if (busy || !partPos) return; lock(true);
      $('rb-msg').innerHTML = '프로그램에 적힌 좌표로 이동합니다. 부품이 어디 있는지는 <strong>보지 않습니다.</strong>';
      await moveTo(FIX.x, FIX.y - 26, 900);
      const ok = Math.hypot(partPos.x - FIX.x, partPos.y - FIX.y) < 18;
      s1[1]++; if (ok) s1[0]++; score();
      if (ok) { await carry(); }
      else {
        fx.setAttribute('x', FIX.x); fx.setAttribute('y', FIX.y - 60); fx.setAttribute('fill', 'var(--bad)'); fx.textContent = '빈손!';
        await wait(700); fx.textContent = ''; await moveTo(HOME.x, HOME.y, 700);
        $('rb-msg').innerHTML = '부품이 정해진 자리에 없어 <strong>실패</strong>했습니다. 이번엔 <strong>AI 비전</strong>으로 해 보세요.';
      }
      lock(false);
    });
    $('rb-ai').addEventListener('click', async () => {
      if (busy || !partPos) return; lock(true);
      cam.style.opacity = 1;
      $('rb-msg').innerHTML = '① 카메라가 트레이를 찍고, AI가 이미지에서 <strong>부품 위치를 찾습니다.</strong>';
      detR.setAttribute('x', partPos.x - 28); detR.setAttribute('y', partPos.y - 28);
      detT.setAttribute('x', partPos.x - 28); detT.setAttribute('y', partPos.y - 36);
      detT.textContent = '부품 97%';
      for (let k = 0; k < 3; k++) { det.setAttribute('opacity', 1); await wait(220); det.setAttribute('opacity', 0.3); await wait(160); }
      det.setAttribute('opacity', 1);
      $('rb-msg').innerHTML = '② 찾은 위치로 팔을 움직여 집습니다.';
      await moveTo(partPos.x, partPos.y - 26, 900);
      det.setAttribute('opacity', 0);
      s2[1]++; s2[0]++; score();
      await carry();
      cam.style.opacity = 0.35;
      $('rb-msg').innerHTML = '<strong>성공!</strong> 로봇이 <strong>보고 판단</strong>했기 때문에 위치가 달라도 집을 수 있습니다. 부품을 새로 놓고 반복해 보세요.';
      await wait(500); place();
      lock(false);
    });
    place(); draw(); score();
  })();

  /* ───────── 6) AX 순환 ───────── */
  (function loop() {
    const svg = $('loop'); if (!svg) return;
    const cx = 380, cy = 205, rx = 270, ry = 150;
    const nodes = [
      { t: '센서', ic: 'gauge' }, { t: '데이터', ic: 'database' }, { t: 'AI 모델', ic: 'bot' }, { t: '판단', ic: 'target' }, { t: '행동', ic: 'arm' },
    ];
    const cases = {
      vision: ['카메라', '제품 이미지', '불량 점수 계산', '기준 넘으면 불량', '불량품 빼기'],
      pdm: ['진동 센서', '매일의 진동 세기', '정상 패턴과 비교', '이상하면 경보', '고장 전 정비'],
      lab: ['측정 장비', '조건별 수율', '수율 예측', '다음 조건 선택', '실험 실행'],
      robot: ['카메라', '트레이 이미지', '부품 위치 인식', '집을 좌표 결정', '로봇 팔 이동'],
    };
    const ell = `M${cx},${cy - ry} a${rx},${ry} 0 1,1 -0.1,0`;
    el('path', { d: ell, fill: 'none', stroke: 'var(--line)', 'stroke-width': 4, 'stroke-dasharray': '2 10', 'stroke-linecap': 'round' }, svg);
    for (let k = 0; k < 4; k++) {
      const d = el('circle', { r: 7, class: 'flowdot', fill: k % 2 ? 'var(--accent-2)' : 'var(--accent)' }, svg);
      const am = el('animateMotion', { dur: '8s', begin: (k * 2) + 's', repeatCount: 'indefinite', path: ell }, d);
    }
    const caps = [];
    nodes.forEach((n, k) => {
      const a = -Math.PI / 2 + k * 2 * Math.PI / 5;
      const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
      const g = el('g', { class: 'loopnode on', transform: `translate(${x - 115} ${y - 42})` }, svg);
      el('rect', { width: 230, height: 84, rx: 18 }, g);
      icon(n.ic, 14, 20, 40, k === 4 ? 'var(--accent-2)' : 'var(--accent)', g);
      el('text', { x: 64, y: 34, class: 't-main', style: 'font-size:18px' }, g).textContent = (k + 1) + '. ' + n.t;
      caps.push(el('text', { x: 64, y: 60, class: 't-sub', style: 'font-size:15px' }, g));
    });
    const btns = document.querySelectorAll('.casebtn');
    function pick(k) {
      btns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.case === k));
      cases[k].forEach((c, i) => (caps[i].textContent = c));
    }
    btns.forEach((b) => b.addEventListener('click', () => pick(b.dataset.case)));
    pick('vision');
  })();
})();
