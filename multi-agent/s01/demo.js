// 1회 직접 해 보기: 패턴 흐름 · 비용/시간 계산기 · 판단 체크리스트
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  /* ── 1. 패턴 흐름 ── */
  const svg = document.getElementById('patSvg');
  if (svg) {
    const P = {
      chain: {
        nodes: { in: [20, 165, '입력', 1], a: [140, 165, 'LLM 1'], g: [260, 165, '검사', 1], b: [380, 165, 'LLM 2'], c: [500, 165, 'LLM 3'], out: [610, 165, '출력', 1] },
        edges: [['in', 'a'], ['a', 'g'], ['g', 'b'], ['b', 'c'], ['c', 'out']],
        run: () => [['a'], ['g'], ['b'], ['c'], ['out']],
        note: '단계가 고정된 직렬 흐름. 사이의 <b>코드 검사</b>로 중간 결과를 걸러 낼 수 있습니다.'
      },
      route: {
        nodes: { in: [20, 165, '입력', 1], r: [170, 165, '분류 LLM'], x: [380, 50, '장비 담당'], y: [380, 165, '행정 담당'], z: [380, 280, '연구 담당'], out: [600, 165, '출력', 1] },
        edges: [['in', 'r'], ['r', 'x'], ['r', 'y'], ['r', 'z'], ['x', 'out'], ['y', 'out'], ['z', 'out']],
        run: (k) => [['r'], [['x', 'y', 'z'][k % 3]], ['out']],
        note: '분류 결과에 따라 <b>한 갈래만</b> 실행됩니다. 실행할 때마다 다른 담당으로 갈 수 있습니다.'
      },
      par: {
        nodes: { in: [20, 165, '입력', 1], s: [150, 165, '나누기', 1], x: [320, 50, '관점 A'], y: [320, 165, '관점 B'], z: [320, 280, '관점 C'], m: [490, 165, '합치기', 1], out: [610, 165, '출력', 1] },
        edges: [['in', 's'], ['s', 'x'], ['s', 'y'], ['s', 'z'], ['x', 'm'], ['y', 'm'], ['z', 'm'], ['m', 'out']],
        run: () => [['s'], ['x', 'y', 'z'], ['m'], ['out']],
        note: '나누는 방법이 <b>미리 정해져</b> 있고 셋이 <b>동시에</b> 돕니다. 호출은 3번이어도 기다림은 1단계.'
      },
      orch: {
        nodes: { in: [20, 165, '입력', 1], o: [160, 165, '리드 LLM'], w1: [360, 30, '워커 1'], w2: [360, 120, '워커 2'], w3: [360, 210, '워커 3'], w4: [360, 300, '워커 4'], s: [520, 165, '리드 종합'], out: [630, 165, '출력', 1] },
        edges: [['in', 'o'], ['o', 'w1'], ['o', 'w2'], ['o', 'w3'], ['o', 'w4'], ['w1', 's'], ['w2', 's'], ['w3', 's'], ['w4', 's'], ['s', 'out']],
        run: (k) => { const n = [3, 2, 4][k % 3]; return [['o'], ['w1', 'w2', 'w3', 'w4'].slice(0, n), ['s'], ['out']]; },
        note: '리드가 입력을 보고 <b>그때그때 워커 수와 일을 정합니다</b>. 다시 실행하면 워커 수가 바뀝니다.'
      },
      eval: {
        nodes: { in: [20, 165, '입력', 1], g: [210, 165, '작성 LLM'], e: [430, 165, '검토 LLM'], out: [610, 165, '통과', 1] },
        edges: [['in', 'g'], ['g', 'e'], ['e', 'g', 1], ['e', 'out']],
        run: (k) => { const r = [2, 1, 3][k % 3]; const s = []; for (let i = 0; i < r; i++) s.push(['g'], ['e']); s.push(['out']); return s; },
        note: '검토가 <b>기준을 넘을 때까지</b> 고쳐 씁니다. 반복 횟수는 결과에 따라 달라집니다.'
      }
    };
    let cur = 'chain', runs = { chain: 0, route: 0, par: 0, orch: 0, eval: 0 }, timer = null;
    const W = 96, H = 50;
    function draw() {
      svg.innerHTML = '';
      const p = P[cur];
      const defs = el('defs', {}, svg);
      const mk = el('marker', { id: 'pa', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
      el('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--muted)' }, mk);
      p.edges.forEach(([a, b, back]) => {
        const A = p.nodes[a], B = p.nodes[b];
        let d;
        if (back) d = `M${A[0] + W / 2} ${A[1] - 4} C ${A[0] + W / 2} ${A[1] - 110}, ${B[0] + W / 2} ${B[1] - 110}, ${B[0] + W / 2} ${B[1] - 4}`;
        else d = `M${A[0] + W} ${A[1] + H / 2} L ${B[0] - 4} ${B[1] + H / 2}`;
        el('path', { d, class: 'pat-edge', 'data-to': b, 'marker-end': 'url(#pa)' }, svg);
        if (back) { const t = el('text', { x: (A[0] + B[0]) / 2 + W / 2, y: A[1] - 72, 'text-anchor': 'middle', class: 't-sub' }, svg); t.textContent = '기준 미달 → 다시'; }
      });
      for (const id in p.nodes) {
        const [x, y, label, code] = p.nodes[id];
        const g = el('g', { class: 'pat-node' + (code ? ' code' : ''), 'data-id': id, transform: `translate(${x} ${y})` }, svg);
        el('rect', { width: W, height: H, rx: 12 }, g);
        const t = el('text', { x: W / 2, y: H / 2 + 6, 'text-anchor': 'middle', class: code ? 't-sub' : 't-main', style: code ? 'font-size:15px' : 'font-size:16px' }, g);
        t.textContent = label;
      }
      document.getElementById('patNote').innerHTML = p.note + ' 점선 상자는 LLM이 아닌 코드입니다.';
      document.getElementById('patCalls').textContent = '–';
      document.getElementById('patDepth').textContent = '–';
    }
    function run() {
      clearInterval(timer);
      const p = P[cur];
      const steps = p.run(runs[cur]++);
      let i = 0, calls = 0, depth = 0;
      svg.querySelectorAll('.on').forEach((n) => n.classList.remove('on'));
      document.getElementById('patCalls').textContent = '0';
      document.getElementById('patDepth').textContent = '0';
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const tick = () => {
        if (i >= steps.length) { clearInterval(timer); return; }
        svg.querySelectorAll('.on').forEach((n) => n.classList.remove('on'));
        const st = steps[i++];
        let llm = 0;
        st.forEach((id) => {
          const n = svg.querySelector(`.pat-node[data-id="${id}"]`); if (n) n.classList.add('on');
          svg.querySelectorAll(`.pat-edge[data-to="${id}"]`).forEach((e) => e.classList.add('on'));
          if (!p.nodes[id][3]) llm++;
        });
        if (llm) { calls += llm; depth++; }
        document.getElementById('patCalls').textContent = calls;
        document.getElementById('patDepth').textContent = depth;
      };
      if (reduce) { while (i < steps.length) tick(); return; }
      tick(); timer = setInterval(tick, 750);
    }
    document.getElementById('patSel').addEventListener('change', (e) => { cur = e.target.value; clearInterval(timer); draw(); });
    document.getElementById('patRun').addEventListener('click', run);
    draw();
  }

  /* ── 2. 비용 · 시간 계산기 ── */
  const cs = document.getElementById('costSvg');
  if (cs) {
    const PRICE = { h: [0.10, 0.50], s: [2, 10], o: [4, 20] }; // 달러 / 백만 토큰 (Claude 모델 문서, 2026.11)
    const LEAD = PRICE.s;
    const callTime = (inTok, outTok) => 2 + outTok / 60 + inTok / 20000; // 가정: 출력 초당 60토큰
    const $ = (id) => document.getElementById(id);
    function calc() {
      const n = +$('cNr').value, T = +$('cTr').value * 1000, m = $('cM').value, par = $('cP').checked;
      $('cN').textContent = n; $('cT').textContent = (T / 1000) + 'k';
      const planIn = 8000, planOut = 1500, wIn = T + 2000, wOut = 1500, sIn = 8000 + n * wOut, sOut = 3000;
      const cost = (planIn * LEAD[0] + planOut * LEAD[1] + sIn * LEAD[0] + sOut * LEAD[1]) / 1e6 + n * (wIn * PRICE[m][0] + wOut * PRICE[m][1]) / 1e6;
      const tPlan = callTime(planIn, planOut), tW = 20 + T / 1000 * 0.4 + callTime(wIn, wOut) - 2, tS = callTime(sIn, sOut);
      const total = tPlan + (n ? (par ? tW : n * tW) : 0) + tS;
      $('cCost').textContent = '$' + (cost < 0.1 ? cost.toFixed(3) : cost.toFixed(2));
      $('cTime').textContent = total >= 90 ? (total / 60).toFixed(1) + '분' : Math.round(total) + '초';
      // 그림
      cs.innerHTML = '';
      const maxT = tPlan + n * tW + tS; // 축: 같은 조건을 순차로 돌렸을 때 길이
      const k = 600 / maxT, x0 = 20;
      const rows = par ? Math.max(1, n) : 1;
      const rowH = Math.min(28, 150 / rows);
      const bar = (x, y, w, h, cls, label) => {
        const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', Math.max(2, w)); r.setAttribute('height', h); r.setAttribute('rx', 5); r.setAttribute('class', cls); cs.appendChild(r);
        if (label && w > 46) { const t = document.createElementNS('http://www.w3.org/2000/svg', 'text'); t.setAttribute('x', x + 6); t.setAttribute('y', y + h / 2 + 5); t.setAttribute('class', 't-w'); t.setAttribute('style', 'font-size:12px'); t.textContent = label; cs.appendChild(t); }
      };
      let x = x0;
      bar(x, 10, tPlan * k, 26, 'f-acc', '계획'); x += tPlan * k;
      for (let i = 0; i < n; i++) {
        const y = 46 + (par ? i * rowH : 0), xi = par ? x : x + i * tW * k;
        bar(xi, y, tW * k - (par ? 0 : 1), Math.max(6, rowH - 4), 'f-acc2', par || i === 0 ? '워커' + (i + 1) : '');
      }
      x += n ? (par ? tW : n * tW) * k : 0;
      bar(x, 206, tS * k, 26, 'f-acc', '종합');
      const ax = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ax.setAttribute('x1', x0); ax.setAttribute('x2', x0 + 600); ax.setAttribute('y1', 243); ax.setAttribute('y2', 243); ax.setAttribute('class', 'p-axis'); cs.appendChild(ax);
    }
    ['cNr', 'cTr', 'cM', 'cP'].forEach((id) => $(id).addEventListener('input', calc));
    $('cM').addEventListener('change', calc);
    calc();
  }

  /* ── 3. 판단 체크리스트 ── */
  const judge = document.getElementById('judge');
  if (judge) {
    const V = document.getElementById('jV'), W = document.getElementById('jWhy');
    function decide() {
      const s = {};
      judge.querySelectorAll('input').forEach((i) => (s[i.dataset.k] = i.checked));
      const any = Object.values(s).some(Boolean);
      if (!any) { V.textContent = '—'; W.innerHTML = '해당하는 항목을 체크해 보세요.'; return; }
      let v, why;
      const split = s.indep || s.big;
      if (!s.value) { v = '워크플로 또는 에이전트 하나'; why = '가치가 비용을 감당하지 못하면 가장 단순한 구조로 시작합니다. 성능이 부족하다는 증거가 생길 때 복잡도를 올리세요.'; }
      else if (s.open && split && s.read) { v = '오케스트레이터–워커'; why = '탐색적이고, 나눌 수 있고, 읽기 위주 — 멀티 에이전트가 가장 잘 맞는 조건입니다. 쓰기(최종 결과 작성)는 리드 한 곳에서 하세요.'; }
      else if (s.open && split && !s.read) { v = '에이전트 하나 + 읽기 전용 보조'; why = '여럿이 동시에 쓰면 암묵적 결정이 충돌합니다. 쓰기는 한 에이전트가 맡고, 조사만 하위 에이전트에 맡기세요.'; }
      else if (s.open) { v = '에이전트 하나'; why = '단계를 미리 정할 수는 없지만 나눌 이유(독립성·자료량)가 없습니다. 한 에이전트가 맥락을 온전히 갖는 편이 낫습니다.'; }
      else if (s.indep) { v = '병렬화 워크플로'; why = '나누는 방법을 미리 알고 서로 독립적이면, 코드로 나눠 동시에 돌리고 코드로 합치면 됩니다.'; }
      else { v = '체인 또는 라우팅 워크플로'; why = '순서를 미리 정할 수 있으면 코드가 흐름을 정하는 편이 싸고 예측 가능합니다.'; }
      if (s.verify && s.value) why += ' <b>+ 결과를 확인할 기준이 있으니 작성–검토 루프를 붙일 만합니다.</b>';
      if (!s.verify) why += ' <br><span class="muted">※ 결과를 확인할 방법이 없다면, 어떤 구조든 먼저 검증 방법부터 정하세요.</span>';
      V.textContent = v; W.innerHTML = why;
    }
    judge.addEventListener('change', decide);
  }
})();
