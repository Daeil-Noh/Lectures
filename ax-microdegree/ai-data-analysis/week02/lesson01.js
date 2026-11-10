// 2주 1차시 전용: 순서 맞추기, 문제 정의 카드, 그룹별 탐색, 되돌아가기 순환
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
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const STEPS = ['문제 정의', '데이터 수집', '정리', '탐색', '분석·모델', '해석·공유'];

  /* ───────── 1) 순서 맞추기 ───────── */
  (function order() {
    const slotsBox = $('o-slots'), pool = $('o-pool'); if (!slotsBox) return;
    const TASKS = [
      '“야간 불량률이 주간보다 높은가, 왜인가?”로 질문을 정한다',
      '공정 기록 시스템에서 3~4월 생산 기록을 내려받는다',
      '센서 오류값 999.9℃와 중복된 행을 찾아 고친다',
      '근무조·라인별 불량률을 그래프로 비교해 본다',
      '습도·온도와 불량의 관계를 통계로 확인한다',
      '결과를 반장님께 보고하고 다음 조치를 정한다',
    ];
    const slots = [], cards = [];
    let placed = [null, null, null, null, null, null], seed = 5;
    for (let i = 0; i < 6; i++) {
      const s = document.createElement('button');
      s.type = 'button'; s.className = 'slot';
      s.innerHTML = `<span class="n">${i + 1}</span><span class="tx"></span><span class="stp"></span>`;
      s.addEventListener('click', () => {
        if (placed[i] === null) return;
        cards[placed[i]].classList.remove('used'); placed[i] = null; clearMarks(); render();
      });
      slotsBox.appendChild(s); slots.push(s);
    }
    function shuffle() {
      const r = rng(seed++), idx = [0, 1, 2, 3, 4, 5];
      for (let i = 5; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      if (idx.every((v, i) => v === i)) idx.reverse();
      pool.querySelectorAll('.ocard').forEach((c) => c.remove());
      cards.length = 0;
      const tmp = [];
      idx.forEach((t) => {
        const c = document.createElement('button');
        c.type = 'button'; c.className = 'ocard'; c.textContent = TASKS[t]; c.dataset.t = t;
        c.addEventListener('click', () => {
          const k = placed.indexOf(null); if (k < 0) return;
          placed[k] = t; c.classList.add('used'); clearMarks(); render();
        });
        tmp[t] = c; pool.appendChild(c);
      });
      tmp.forEach((c, t) => (cards[t] = c));
      placed = [null, null, null, null, null, null];
      clearMarks(); render();
      $('o-score').textContent = '- / 6';
      $('o-msg').innerHTML = '반장님 질문을 해결하는 동안 할 일 여섯 가지입니다. <strong>무엇이 먼저</strong>일까요?';
    }
    function clearMarks() { slots.forEach((s) => { s.classList.remove('ok', 'no'); s.querySelector('.stp').textContent = ''; }); }
    function render() {
      slots.forEach((s, i) => {
        s.classList.toggle('filled', placed[i] !== null);
        s.querySelector('.tx').textContent = placed[i] === null ? '' : TASKS[placed[i]];
      });
    }
    $('o-check').addEventListener('click', () => {
      const n = placed.filter((v) => v !== null).length;
      if (n < 6) { $('o-msg').innerHTML = `아직 <strong>${6 - n}칸</strong>이 비어 있습니다. 카드를 모두 놓은 뒤 확인하세요.`; return; }
      let ok = 0;
      slots.forEach((s, i) => {
        const good = placed[i] === i; if (good) ok++;
        s.classList.add(good ? 'ok' : 'no');
        s.querySelector('.stp').textContent = good ? STEPS[i] : '';
      });
      $('o-score').textContent = ok + ' / 6';
      const firstBad = placed.findIndex((v, i) => v !== i);
      $('o-msg').innerHTML = ok === 6
        ? '<strong>모두 맞았습니다!</strong> 질문 → 수집 → 정리 → 탐색 → 분석 → 해석·공유. 칸마다 단계 이름이 붙었습니다.'
        : `${firstBad + 1}번 칸부터 다시 보세요. 힌트: <strong>${STEPS[firstBad]}</strong> 단계가 와야 합니다. 빨간 칸을 눌러 되돌린 뒤 다시 놓아 보세요.`;
    });
    $('o-reset').addEventListener('click', shuffle);
    shuffle();
  })();

  /* ───────── 2) 좋은 질문 / 고칠 질문 카드 ───────── */
  (function qcards() {
    const wrap = $('qcards'); if (!wrap) return;
    const items = [
      { ic: 'target', n: '“불량을 없애자.”', k: 'no', v: '고쳐야 함 · 목표일 뿐', a: '대상·기간·지표가 없다. “어느 라인의 어떤 불량을, 언제와 비교해?”' },
      { ic: 'clock', n: '“3~4월 야간조 불량률이 주간조보다 높은가?”', k: 'yes', v: '좋은 질문', a: '대상·기간·지표·비교 기준이 모두 있다. 기록으로 바로 답할 수 있다.' },
      { ic: 'bot', n: '“AI로 공장을 똑똑하게 만들 수 있을까?”', k: 'no', v: '고쳐야 함 · 너무 넓음', a: '무엇을 예측·판정할지 정해야 한다. 도구(AI)가 질문이 되면 안 된다.' },
      { ic: 'eye', n: '“야간에 특히 늘어난 불량 유형은 무엇인가?”', k: 'yes', v: '좋은 질문', a: '불량 유형 기록으로 답할 수 있고, 답에 따라 점검할 공정이 달라진다.' },
      { ic: 'user', n: '“야간조 작업자들이 게으른가?”', k: 'no', v: '고쳐야 함 · 사람 탓', a: '측정할 수 없고 결론을 미리 정했다. “야간에 달라지는 공정 조건은?”으로 바꾼다.' },
      { ic: 'thermo', n: '“습도가 70%를 넘는 날 인장강도가 낮아지는가?”', k: 'yes', v: '좋은 질문', a: '조건(습도)과 결과(강도)가 분명하고 둘 다 기록돼 있다.' },
      { ic: 'cpu', n: '“3호기를 새 기계로 바꿔야 할까?”', k: 'mid', v: '다듬으면 좋아짐', a: '결정과 연결된 점은 좋다. “3호기 불량률이 다른 호기보다 높은가?”처럼 측정할 비교를 붙인다.' },
      { ic: 'gauge', n: '“압력을 80→85bar로 올리면 강도가 오르는가?”', k: 'yes', v: '좋은 질문', a: '바꿀 조건과 볼 결과가 분명하다. 실험으로 직접 확인할 수도 있다.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="ic-badge ${it.k === 'no' ? 'o' : it.k === 'mid' ? 'g' : ''}"><svg class="ic"><use href="#i-${it.ic}"/></svg></span><span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('qc-score').textContent = opened + ' / ' + items.length + ' 확인' + (opened === items.length ? ' — 좋은 질문: 구체적 · 측정 가능 · 데이터로 답 · 행동과 연결' : '');
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 3) 그룹별 탐색 (process.csv에서 계산한 값) ───────── */
  (function explore() {
    const svg = $('ex-svg'); if (!svg) return;
    // pandas로 계산: 불량 수 / 제품 수
    const G = {
      line: { unit: '%', bars: [['1라인', 23, 165], ['2라인', 23, 164], ['3라인', 22, 165]],
        msg: '라인별로는 <strong>13~14%</strong>로 거의 같습니다. 라인은 원인 후보에서 멀어집니다.' },
      machine: { unit: '%', bars: [['1호기', 13, 90], ['2호기', 10, 75], ['3호기', 10, 76], ['4호기', 13, 88], ['5호기', 9, 81], ['6호기', 13, 84]],
        msg: '호기별로는 <strong>11~15%</strong>. 조금씩 다르지만 한 기계만 튀지는 않습니다.' },
      shift: { unit: '%', bars: [['주간', 17, 243], ['야간', 51, 251]],
        msg: '근무조로 나누니 <strong>야간 20.3% vs 주간 7.0%</strong>. 반장님 말이 데이터로 확인됐습니다. 다음 질문: 왜?' },
      type: { unit: '개', bars: [['치수불량', 6, 24], ['찍힘', 2, 21], ['스크래치', 9, 6]], grouped: true,
        msg: '야간에는 <strong>찍힘(2 → 21개)</strong>과 치수불량이 크게 늘었고, 스크래치는 오히려 적습니다. 원인이 한 가지가 아닐 수도 있습니다.' },
    };
    const L = 70, R = 650, T = 44, B = 350;
    const g = el('g', {}, svg);
    function draw(k) {
      g.innerHTML = '';
      const d = G[k];
      const max = d.grouped ? 30 : 25;
      const Y = (v) => B - v / max * (B - T);
      const step = d.grouped ? 5 : 5;
      for (let v = 0; v <= max; v += step) {
        el('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), class: 'p-grid' }, g);
        el('text', { x: L - 10, y: Y(v) + 4, 'text-anchor': 'end', class: 'p-tick' }, g).textContent = v + (d.unit === '%' ? '%' : '');
      }
      el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis' }, g);
      el('text', { x: 18, y: (T + B) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 18 ${(T + B) / 2})` }, g).textContent = d.grouped ? '불량 개수 →' : '불량률 →';
      const n = d.bars.length, slot = (R - L) / n;
      if (!d.grouped) {
        const avg = 68 / 494 * 100;
        d.bars.forEach(([name, bad, tot], i) => {
          const v = bad / tot * 100, w = Math.min(110, slot * 0.6), x = L + slot * i + (slot - w) / 2;
          const hot = k === 'shift' && name === '야간';
          const r = el('rect', { x, y: B, width: w, height: 0, rx: 8, fill: hot ? 'var(--accent-2)' : 'var(--accent)' }, g);
          requestAnimationFrame(() => { r.style.transition = 'y .45s, height .45s'; r.setAttribute('y', Y(v)); r.setAttribute('height', B - Y(v)); });
          el('text', { x: x + w / 2, y: Y(v) - 10, 'text-anchor': 'middle', class: 't-main', style: 'font-size:19px' }, g).textContent = v.toFixed(1) + '%';
          el('text', { x: x + w / 2, y: B + 24, 'text-anchor': 'middle', class: 't-main', style: 'font-size:16px' }, g).textContent = name;
          el('text', { x: x + w / 2, y: B + 44, 'text-anchor': 'middle', class: 't-sub' }, g).textContent = `${bad} / ${tot}개`;
        });
        el('line', { x1: L, x2: R, y1: Y(avg), y2: Y(avg), class: 'p-line2' }, g);
        el('line', { x1: R - 200, x2: R - 170, y1: T - 12, y2: T - 12, class: 'p-line2' }, g);
        el('text', { x: R - 162, y: T - 7, class: 'p-tick', style: 'font-weight:700' }, g).textContent = '전체 평균 ' + avg.toFixed(1) + '%';
      } else {
        d.bars.forEach(([name, day, night], i) => {
          const w = 64, cx = L + slot * i + slot / 2;
          [[day, 'var(--accent)', '주간', -w - 6], [night, 'var(--accent-2)', '야간', 6]].forEach(([v, c, lab, dx]) => {
            const x = cx + dx;
            const r = el('rect', { x, y: B, width: w, height: 0, rx: 8, fill: c }, g);
            requestAnimationFrame(() => { r.style.transition = 'y .45s, height .45s'; r.setAttribute('y', Y(v)); r.setAttribute('height', B - Y(v)); });
            el('text', { x: x + w / 2, y: Y(v) - 10, 'text-anchor': 'middle', class: 't-main', style: 'font-size:18px' }, g).textContent = v;
          });
          el('text', { x: cx, y: B + 26, 'text-anchor': 'middle', class: 't-main', style: 'font-size:17px' }, g).textContent = name;
        });
        const lg = el('g', { transform: `translate(${R - 170} ${T})` }, g);
        el('rect', { width: 14, height: 14, rx: 3, fill: 'var(--accent)' }, lg); el('text', { x: 20, y: 12, class: 't-sub' }, lg).textContent = '주간';
        el('rect', { x: 70, width: 14, height: 14, rx: 3, fill: 'var(--accent-2)' }, lg); el('text', { x: 90, y: 12, class: 't-sub' }, lg).textContent = '야간';
      }
      $('ex-msg').innerHTML = d.msg;
      document.querySelectorAll('.casebtn[data-g]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.g === k));
    }
    document.querySelectorAll('.casebtn[data-g]').forEach((b) => b.addEventListener('click', () => draw(b.dataset.g)));
    draw('line');
    $('ex-msg').innerHTML = '라인별로는 <strong>13~14%</strong>로 거의 같습니다. 다른 기준으로도 나눠 보세요.';
  })();

  /* ───────── 4) 되돌아가기 순환 ───────── */
  (function loop() {
    const svg = $('loop'); if (!svg) return;
    const cx = 350, cy = 205, rx = 250, ry = 150;
    const ICS = ['target', 'database', 'filter', 'chart', 'bot', 'bulb'];
    const defs = el('defs', {}, svg);
    const mk = el('marker', { id: 'lp-ah', viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs);
    el('path', { d: 'M0 0 10 5 0 10z', fill: 'var(--accent)' }, mk);
    const mk2 = el('marker', { id: 'lp-ah2', viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto' }, defs);
    el('path', { d: 'M0 0 10 5 0 10z', fill: 'var(--line)' }, mk2);
    const pos = STEPS.map((_, k) => { const a = -Math.PI / 2 + k * 2 * Math.PI / 6; return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) }; });
    // 정방향 화살표
    pos.forEach((p, k) => {
      const q = pos[(k + 1) % 6];
      const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
      const ox = (mx - cx) * 0.12, oy = (my - cy) * 0.12;
      const sx = p.x + (q.x - p.x) * 0.3, sy = p.y + (q.y - p.y) * 0.3, ex = p.x + (q.x - p.x) * 0.7, ey = p.y + (q.y - p.y) * 0.7;
      el('path', { d: `M${sx},${sy} Q${mx + ox},${my + oy} ${ex},${ey}`, fill: 'none', stroke: 'var(--line)', 'stroke-width': 4, 'marker-end': 'url(#lp-ah2)' }, svg);
    });
    const back = el('path', { fill: 'none', stroke: 'var(--accent)', 'stroke-width': 4, 'stroke-dasharray': '10 7', 'marker-end': 'url(#lp-ah)', opacity: 0 }, svg);
    const nodes = pos.map((p, k) => {
      const g = el('g', { class: 'loopnode', transform: `translate(${p.x - 88} ${p.y - 30})` }, svg);
      el('rect', { width: 176, height: 60, rx: 16 }, g);
      icon(ICS[k], 12, 14, 32, k === 5 ? 'var(--accent-2)' : 'var(--accent)', g);
      el('text', { x: 52, y: 37, class: 't-main', style: 'font-size:18px' }, g).textContent = (k + 1) + '. ' + STEPS[k];
      return g;
    });
    const CASES = [
      { from: 3, to: 2, m: '오류값은 <strong>정리</strong> 단계의 일입니다. 고친 뒤 다시 탐색합니다. 실제 분석에서 가장 자주 일어나는 되돌아가기입니다.' },
      { from: 4, to: 1, m: '필요한 변수가 데이터에 없으면 <strong>수집</strong>으로 돌아가 새로 모읍니다(예: 조명 센서 설치, 작업일지 확인).' },
      { from: 5, to: 0, m: '결정하는 사람이 궁금한 것은 비용이었습니다. <strong>문제 정의</strong>에 “불량 비용”이라는 지표를 더해 다시 시작합니다.' },
      { from: 5, to: 1, m: '시험 운영의 결과는 <strong>새 데이터</strong>입니다. 다시 수집해 한 바퀴 더 — 결정의 효과를 데이터로 확인합니다.' },
    ];
    const btns = document.querySelectorAll('.casebtn[data-c]');
    function pick(i) {
      const c = CASES[i];
      btns.forEach((b) => b.setAttribute('aria-pressed', +b.dataset.c === i));
      nodes.forEach((n, k) => n.setAttribute('class', 'loopnode' + (k === c.from ? ' from' : k === c.to ? ' to' : '')));
      const a = pos[c.from], b = pos[c.to];
      const s = { x: a.x + (cx - a.x) * 0.28, y: a.y + (cy - a.y) * 0.28 }, e = { x: b.x + (cx - b.x) * 0.3, y: b.y + (cy - b.y) * 0.3 };
      back.setAttribute('d', `M${s.x},${s.y} Q${cx},${cy} ${e.x},${e.y}`);
      back.setAttribute('opacity', 1);
      $('lp-msg').innerHTML = c.m;
    }
    btns.forEach((b) => b.addEventListener('click', () => pick(+b.dataset.c)));
  })();
})();
