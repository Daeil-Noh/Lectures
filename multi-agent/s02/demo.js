// 2회 직접 해 보기: 루프 단계 보기 · 위임 브리프 점검 · 동시 실행 일정
(function () {
  /* ── 1. 루프 단계 보기 ── */
  const tr = document.getElementById('trace');
  if (tr) {
    // 각 단계: 화면에 추가할 메시지, 그때의 stop_reason, 그 호출의 입력 토큰(예시값), 설명
    const S = [
      { add: [['user', 'user', '2025년 이후 나온 <b>예지보전</b> 논문을 찾아 핵심을 요약해 줘.']], note: '사용자 과제가 대화 기록의 첫 메시지가 됩니다. 이제 모델을 부릅니다.' },
      { add: [['tu', 'assistant · tool_use', '<code>search_papers({"query": "예지보전"})</code>']], stop: 'tool_use', tok: 820, note: '<b>호출 1</b>: 모델이 도구를 요청했습니다. 실행은 우리 코드가 합니다.' },
      { add: [['tres', 'user · tool_result', 'P03 (2023) · P07 (2025) · P11 (2026)']], note: '도구 결과를 같은 id로 덧붙였습니다. 다시 모델을 부릅니다.' },
      { add: [['tu', 'assistant · tool_use ×2', '<code>read_paper("P07")</code><br><code>read_paper("P11")</code>']], stop: 'tool_use', tok: 1240, note: '<b>호출 2</b>: 한 응답에 도구 요청이 <b>두 개</b> — 동시에 실행해도 됩니다. 2023년 논문은 스스로 걸렀습니다.' },
      { add: [['tres', 'user · tool_result ×2', 'P07 초록 (약 300토큰)<br>P11 초록 (약 300토큰)']], note: '두 결과를 <b>한 메시지</b>에 모아 돌려줍니다.' },
      { add: [['fin', 'assistant · text', 'P07은 진동 스펙트럼 + 1D-CNN으로 … P11은 … [P07][P11]']], stop: 'end_turn', tok: 1960, note: '<b>호출 3</b>: stop_reason 이 end_turn — 루프가 끝났습니다. 호출 3번, 도구 실행 3번.' }
    ];
    let i = 0;
    const stopR = document.getElementById('stopR'), ctxT = document.getElementById('ctxT'), bar = document.getElementById('ctxBar'), note = document.getElementById('stepNote'), btn = document.getElementById('stepBtn');
    function reset() { tr.innerHTML = ''; i = 0; stopR.textContent = '—'; ctxT.textContent = '0'; bar.style.width = '0'; note.innerHTML = '「다음 단계」를 눌러 보세요.'; btn.disabled = false; }
    function step() {
      if (i >= S.length) return;
      const s = S[i++];
      tr.querySelectorAll('.new').forEach((n) => n.classList.remove('new'));
      s.add.forEach(([cls, role, html]) => {
        const d = document.createElement('div');
        d.className = 'm new ' + cls;
        d.innerHTML = '<span class="r">' + role + '</span>' + html;
        tr.appendChild(d);
      });
      tr.scrollTop = tr.scrollHeight;
      if (s.stop) { stopR.textContent = s.stop; stopR.style.color = s.stop === 'end_turn' ? 'var(--ok)' : ''; }
      if (s.tok) { ctxT.textContent = s.tok.toLocaleString(); bar.style.width = Math.min(100, s.tok / 20) + '%'; }
      note.innerHTML = s.note;
      if (i >= S.length) btn.disabled = true;
    }
    btn.addEventListener('click', step);
    document.getElementById('stepReset').addEventListener('click', () => { reset(); step(); });
    reset(); step();
  }

  /* ── 2. 위임 브리프 점검 ── */
  const chips = document.getElementById('briefChips');
  if (chips) {
    const PART = {
      goal: '목표: 설비 예지보전에 쓰이는 <b>고전 머신러닝 계열</b>(SVM·랜덤 포레스트 등) 방법을 조사한다. 상위 질문은 "계열별 방법 비교표 만들기"다.',
      fmt: '출력 형식: 방법마다 한 줄 — 방법 · 입력 데이터 · 보고된 장점 · 한계 · [논문 id]. 마지막에 "찾지 못한 것". 400자 이내.',
      tool: '도구 안내: search_papers 로 "SVM", "랜덤 포레스트", "특징 추출" 등을 먼저 찾고, 관련 있어 보이는 것만 read_paper 로 읽는다.',
      bound: '경계: 딥러닝·양자 계열은 다른 워커 담당이니 조사하지 않는다. read_paper 는 최대 4편. 근거 없는 내용은 쓰지 않는다.'
    };
    const BAD = {
      goal: ['무엇을 왜 하는지 모름', '엉뚱한 범위를 조사하거나 바로 끝냄 (명세 위반)'],
      fmt: ['보고 모양이 제각각', '리드가 합치기 어렵고, 원문을 통째로 보고해 리드 컨텍스트가 커짐'],
      tool: ['어디서부터 찾을지 모름', '같은 검색을 반복하거나 읽지 않고 제목만 보고 추측'],
      bound: ['다른 워커와 일이 겹침', '중복 조사 · 끝날 줄 모르고 계속 읽음 (종료 조건 없음)']
    };
    const txt = document.getElementById('briefText'), fails = document.getElementById('briefFails');
    function render() {
      const on = {};
      chips.querySelectorAll('button').forEach((b) => (on[b.dataset.k] = b.getAttribute('aria-pressed') === 'true'));
      const lines = Object.keys(PART).filter((k) => on[k]).map((k) => '<span class="add">' + PART[k] + '</span>');
      txt.innerHTML = lines.length ? lines.join('\n\n') : '<span class="muted">(비어 있는 브리프 — "조사해 줘")</span>';
      const miss = Object.keys(BAD).filter((k) => !on[k]);
      fails.innerHTML = miss.length
        ? miss.map((k) => '<div><b>' + BAD[k][0] + '</b><br>' + BAD[k][1] + '</div>').join('')
        : '<div class="ok"><b>네 요소를 모두 갖췄습니다.</b><br>남은 위험: 리드의 비교 기준 같은 <i>암묵적 결정</i>은 여전히 워커가 모릅니다 → 출력 형식에 기준을 적어 주세요.</div>';
    }
    chips.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      render();
    });
    render();
  }

  /* ── 3. 동시 실행 일정 ── */
  const ss = document.getElementById('schedSvg');
  if (ss) {
    const DUR = [14, 9, 22, 11, 17, 8];
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (tag, a, txt) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; ss.appendChild(e); return e; };
    function draw() {
      const cap = +document.getElementById('semR').value;
      document.getElementById('semO').textContent = cap;
      // 순서대로 빈 자리에 넣기
      const slots = new Array(cap).fill(0); const plan = [];
      DUR.forEach((d, i) => { let k = 0; for (let j = 1; j < cap; j++) if (slots[j] < slots[k]) k = j; plan.push({ i, s: slots[k], e: slots[k] + d }); slots[k] += d; });
      const total = Math.max(...plan.map((p) => p.e)), seq = DUR.reduce((a, b) => a + b, 0);
      ss.innerHTML = '';
      const x0 = 80, W = 570, k = W / seq, rowH = 42;
      for (let t = 0; t <= seq; t += 10) { mk('line', { x1: x0 + t * k, x2: x0 + t * k, y1: 10, y2: 6 * rowH + 18, class: 'p-grid' }); mk('text', { x: x0 + t * k, y: 6 * rowH + 38, 'text-anchor': 'middle', class: 'p-tick' }, t + '초'); }
      plan.forEach((p) => {
        const y = 14 + p.i * rowH;
        mk('text', { x: 8, y: y + 24, class: 'p-lab' }, '워커 ' + (p.i + 1));
        mk('rect', { x: x0 + p.s * k, y, width: Math.max(2, (p.e - p.s) * k - 2), height: rowH - 10, rx: 7, class: 'f-acc2' });
        mk('text', { x: x0 + p.s * k + 8, y: y + 21, class: 't-w', style: 'font-size:13px' }, DUR[p.i] + '초');
      });
      mk('line', { x1: x0 + total * k, x2: x0 + total * k, y1: 4, y2: 6 * rowH + 20, stroke: 'var(--accent)', 'stroke-width': 3 });
      document.getElementById('schedT').textContent = total + '초';
      document.getElementById('schedBar').style.width = (total / seq * 100) + '%';
      const slow = Math.max(...DUR);
      document.getElementById('schedNote').innerHTML = cap === 1 ? '한 번에 하나씩: 모든 시간을 더한 <b>' + seq + '초</b>.'
        : total === slow ? '가장 느린 워커(<b>' + slow + '초</b>)가 전체 시간을 정합니다. 더 늘려도 빨라지지 않습니다.'
        : '순차 실행(' + seq + '초)보다 <b>' + Math.round((1 - total / seq) * 100) + '%</b> 짧습니다.';
    }
    document.getElementById('semR').addEventListener('input', draw);
    draw();
  }
})();
