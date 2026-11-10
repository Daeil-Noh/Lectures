// 5주 1차시 전용: 목차 조립기, AI가 지어낸 숫자 찾기
(function () {
  const $ = (id) => document.getElementById(id);

  /* ───────── 1) 목차 조립기 ───────── */
  (function outline() {
    const chipsBox = $('chips'), list = $('olist'); if (!chipsBox) return;
    // r: 기본 항목의 바른 순서(1~6), extra: 넣어도 좋은 항목, junk: 이 기획서에 필요 없는 항목
    const C = [
      { k: 'bg', t: '배경', r: 1, d: '왜 지금 이 일을?' },
      { k: 'goal', t: '목표', r: 2, d: '무엇을 얼마나?' },
      { k: 'plan', t: '실행 방안', r: 3, d: '어떻게?' },
      { k: 'sch', t: '일정', r: 4, d: '언제, 누가?' },
      { k: 'bud', t: '예산', r: 5, d: '얼마가 드나?' },
      { k: 'eff', t: '기대효과', r: 6, d: '무엇이 좋아지나?' },
      { k: 'risk', t: '위험과 대응', r: 6.5, extra: true, d: '안 되면 어떻게?' },
      { k: 'hist', t: '회사 연혁', junk: true, d: '' },
      { k: 'ceo', t: '대표 인사말', junk: true, d: '' },
      { k: 'comp', t: '경쟁사 전체 소개', junk: true, d: '' },
    ];
    const picked = [];
    const btns = {};
    C.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = '+ ' + c.t;
      b.addEventListener('click', () => { if (!picked.includes(c)) { picked.push(c); render(); } });
      chipsBox.appendChild(b); btns[c.k] = b;
    });
    $('o-reset').addEventListener('click', () => { picked.length = 0; render(); });

    function render() {
      list.innerHTML = '';
      if (!picked.length) {
        const li = document.createElement('li'); li.className = 'empty'; li.textContent = '오른쪽에서 항목을 눌러 목차를 만드세요.'; list.appendChild(li);
      }
      // 순서가 어긋난 항목: 앞에 더 큰 순번이 있는 기본 항목
      let maxR = 0; const late = new Set();
      picked.forEach((c) => { if (c.r) { if (c.r < maxR) late.add(c); maxR = Math.max(maxR, c.r); } });
      picked.forEach((c, i) => {
        const li = document.createElement('li');
        li.className = c.junk ? 'bad' : late.has(c) ? 'late' : '';
        li.title = '누르면 목차에서 뺍니다';
        li.innerHTML = `<span class="n">${i + 1}.</span><span>${c.t}</span><span class="s">${c.junk ? '이 기획서엔 불필요' : late.has(c) ? '순서 확인' : c.d}</span>`;
        li.addEventListener('click', () => { picked.splice(picked.indexOf(c), 1); render(); });
        list.appendChild(li);
      });
      C.forEach((c) => (btns[c.k].disabled = picked.includes(c)));
      const core = picked.filter((c) => c.r && !c.extra).length;
      $('o-n').textContent = core + ' / 6';
      const missing = C.filter((c) => c.r && !c.extra && !picked.includes(c)).map((c) => c.t);
      const junk = picked.filter((c) => c.junk);
      const st = $('o-st');
      if (!picked.length) { st.className = 'status mid'; st.innerHTML = '<b class="k">빈 목차</b>먼저 “왜 이 일을 하는가”부터.'; }
      else if (junk.length) { st.className = 'status bad'; st.innerHTML = `<b class="k">불필요한 항목</b>“${junk[0].t}”는 대표님이 <strong>결정하는 데 필요 없는</strong> 내용입니다. 눌러서 빼 보세요.`; }
      else if (late.size) { st.className = 'status mid'; st.innerHTML = `<b class="k">순서 확인</b>“${[...late][0].t}”가 너무 뒤(또는 앞)에 있습니다. 왜 → 무엇을 → 어떻게 → 언제 → 얼마 → 효과 순이 읽기 쉽습니다.`; }
      else if (missing.length) { st.className = 'status mid'; st.innerHTML = `<b class="k">아직 빠진 항목 ${missing.length}개</b>다음 차례: <strong>${missing[0]}</strong>`; }
      else {
        st.className = 'status ok';
        st.innerHTML = '<b class="k">뼈대 완성</b>' + (picked.some((c) => c.extra) ? '“위험과 대응”까지 — 대표님이 물어볼 질문에 미리 답하는 좋은 추가 항목입니다.' : '이 목차를 AI에게 주면 됩니다. “위험과 대응”을 더해도 좋습니다.');
      }
      // 목차가 그대로 프롬프트가 된다
      const items = picked.filter((c) => !c.junk);
      $('o-pv').textContent = items.length
        ? '아래 목차로 기획서의 항목별 핵심 내용을 한 줄씩 먼저 써 줘. 본문은 아직 쓰지 마.\n' + items.map((c, i) => `${i + 1}. ${c.t}`).join('  ')
        : '(목차를 만들면 여기에 프롬프트 문장이 만들어집니다)';
    }
    render();
  })();

  /* ───────── 2) AI가 지어낸 숫자 찾기 ───────── */
  (function hallucination() {
    const box = $('draft'); if (!box) return;
    // [표시할 숫자, 지어낸 숫자인가, 설명]
    const N = {
      a: ['1,254만 원', false, '회의록 1번(현황)과 같습니다.'],
      b: ['1,592만 원', false, '회의록 1번(현황)과 같습니다.'],
      c: ['18%', true, '회의록: 고객 나이 자료가 <strong>없다</strong>. 자료에 없는 숫자를 지어냈습니다.'],
      d: ['120건', false, '회의록 2번(고객 반응)과 같습니다.'],
      e: ['13건', false, '회의록 2번(고객 반응)과 같습니다.'],
      f: ['2만 명', true, '회의록: 팔로워 <strong>약 3,200명</strong>. 숫자가 바뀌었습니다 — 지어낸 것보다 찾기 어려운 실수.'],
      g: ['500만 원', false, '회의록 4번(예산·일정)과 같습니다.'],
      h: ['3.2%', true, '“업계 평균 전환율”은 회의록 어디에도 없습니다. 출처 없는 통계는 쓰지 않습니다.'],
      i: ['40%', true, '회의록: 목표 수치는 <strong>미정</strong>. 사람이 근거를 갖고 정할 숫자입니다.'],
    };
    const B = (k) => `<button type="button" class="num" data-k="${k}">${N[k][0]}</button>`;
    box.innerHTML =
      `<h4>1. 배경</h4><p>바다결의 자사몰 월 매출은 1월 ${B('a')}에서 9월 ${B('b')}으로 늘었습니다. 그러나 구매 고객 중 20~30대는 ${B('c')}에 그쳐 신규 고객 확보가 필요합니다. 올해 후기 ${B('d')} 중 ${B('e')}은 매장에서 먹어 본 뒤 주문했다는 내용입니다.</p>` +
      `<h4>2. 실행 방안</h4><p>현재 ${B('f')}인 인스타그램 팔로워를 활용해 짧은 영상을 주 2회 올립니다.</p>` +
      `<h4>3. 예산·기대효과</h4><p>3개월 예산 ${B('g')}을 쓰면, 업계 평균 전환율 ${B('h')}를 고려할 때 신규 고객이 ${B('i')} 늘 것으로 예상됩니다.</p>`;
    let seen = 0, found = 0;
    const total = Object.values(N).filter((v) => v[1]).length;
    box.querySelectorAll('.num').forEach((b) => b.addEventListener('click', () => {
      if (b.classList.contains('ok') || b.classList.contains('bad')) return;
      const [t, bad, why] = N[b.dataset.k];
      b.classList.add(bad ? 'bad' : 'ok'); seen++; if (bad) found++;
      $('h-all').textContent = seen + ' / 9';
      $('h-bad').textContent = found + ' / ' + total;
      $('h-msg').innerHTML = (bad ? `<strong style="color:var(--bad)">“${t}” — 근거 없음.</strong> ` : `<strong style="color:var(--ok)">“${t}” — 회의록과 일치.</strong> `) + why +
        (found === total ? '<br><strong>4개를 모두 찾았습니다.</strong> 문장이 자연스러워도 숫자는 하나씩 대조해야 합니다.' : '');
    }));
  })();
})();
