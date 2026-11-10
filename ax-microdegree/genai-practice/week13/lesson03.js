// 13주 3차시 전용: 관점 스펙트럼, AI와 나의 역할 분담 플래너(+ 프롬프트 자동 완성)
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  /* ───────── 1) 관점 스펙트럼 ───────── */
  (function spectrum() {
    const wrap = $('ps-chips'); if (!wrap) return;
    const V = [
      { pos: 8, n: '기술 낙관론', s: '“크게 좋아진다”', c: 'AI가 생산성을 크게 높이고, 사람을 지루하고 힘든 일에서 풀어 준다.', e: '과거의 큰 기술 변화도 사라진 일보다 새로운 일을 더 많이 만들었다는 역사적 경험.', w: '바뀌는 과정에서 일자리를 잃는 사람의 고통, 혜택이 고르게 나뉘지 않는 문제를 가볍게 본다.' },
      { pos: 30, n: '증강론', s: '“대체보다 보강”', c: 'AI는 사람을 대신하기보다 사람의 능력을 넓혀 준다. 핵심은 사람과 AI의 협업.', e: '직업을 업무로 쪼개 보면, 많은 직업에서 일부 업무만 자동화된다는 분석.', w: 'AI를 잘 다루는 사람만 혜택을 보고, 그렇지 못한 사람은 뒤처질 수 있다.' },
      { pos: 50, n: '조건론', s: '“우리 선택에 달렸다”', c: '결과는 기술이 아니라 교육·제도·기업의 선택에 따라 달라진다.', e: '같은 기술도 나라·회사마다 도입 방식과 결과가 다르게 나타난다.', w: '“그래서 무엇을 해야 하는가”가 모호해질 수 있다.' },
      { pos: 72, n: '비판론', s: '“누구를 위한 기술인가”', c: 'AI가 불평등, 감시, 일의 질 저하, 소수 기업으로의 힘 쏠림을 키울 수 있다.', e: '데이터를 가진 소수 기업의 영향력, 일하는 사람을 감시하는 데 쓰일 위험에 대한 우려.', w: '이미 생기고 있는 편익과 새로운 기회를 작게 볼 수 있다.' },
      { pos: 92, n: '회의론', s: '“생각보다 느리다”', c: '지금의 기대는 과장이다. 실제 일터의 변화는 훨씬 느리고 제한적이다.', e: '도입 비용, 신뢰·책임 문제, 과거 기술 유행의 과대광고와 실망을 되풀이한 경험.', w: '이미 바뀌고 있는 업무와 준비할 시간을 놓칠 수 있다.' },
    ];
    const chips = V.map((v, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pchip';
      b.innerHTML = `${v.n}<small>${v.s}</small>`;
      b.addEventListener('click', () => show(i)); wrap.appendChild(b); return b;
    });
    function show(i) {
      const v = V[i];
      chips.forEach((c, k) => c.classList.toggle('on', k === i));
      $('ps-view').innerHTML = `<div class="ph">${v.n} — ${v.s}</div><div><b class="l">주장</b>${v.c}</div><div><b class="l">근거로 드는 것</b>${v.e}</div><div><b class="l2">비판받는 점</b>${v.w}</div>`;
    }
    const s = $('ps-s');
    function update() {
      const x = +s.value;
      $('ps-me').style.left = x + '%';
      $('ps-o').textContent = x < 20 ? '기대 큼' : x < 40 ? '기대 쪽' : x <= 60 ? '가운데' : x <= 80 ? '걱정 쪽' : '걱정·의심 큼';
      let near = 0, far = 0;
      V.forEach((v, i) => { if (Math.abs(v.pos - x) < Math.abs(V[near].pos - x)) near = i; if (Math.abs(v.pos - x) > Math.abs(V[far].pos - x)) far = i; });
      chips.forEach((c, k) => c.classList.toggle('near', k === near));
      $('ps-st').innerHTML = `<b class="k">가장 가까운 관점: ${V[near].n}</b>가장 먼 관점은 <strong>${V[far].n}</strong>. 그 근거를 눌러 읽어 보세요.`;
    }
    s.addEventListener('input', update);
    s.addEventListener('change', () => { /* 놓았을 때 가장 먼 관점을 보여 줌 */
      const x = +s.value; let far = 0;
      V.forEach((v, i) => { if (Math.abs(v.pos - x) > Math.abs(V[far].pos - x)) far = i; });
      show(far);
    });
    show(2); update();
  })();

  /* ───────── 2) AI와 나의 역할 분담 ───────── */
  (function planner() {
    const box = $('rp-tasks'); if (!box) return;
    // f: r = 반복·규칙적, j = 판단·책임이 핵심, e = 공감·관계가 핵심 / x = 예시 분담
    const J = [
      { n: '온라인 마케터', t: [['시장·트렌드 자료 조사', 'r', 'co'], ['홍보 문구·SNS 게시물 초안', 'r', 'co'], ['게시 일정·채널별 정리', 'r', 'ai'], ['고객·매장 인터뷰', 'e', 'me'], ['캠페인 성과 해석', 'j', 'co'], ['예산·전략 결정', 'j', 'me']] },
      { n: '회계·재무', t: [['거래 내역·영수증 분류', 'r', 'ai'], ['월별 보고서 초안', 'r', 'co'], ['이상한 거래 찾기', 'r', 'co'], ['세무 규정 확인', 'j', 'co'], ['경영진에게 결과 설명', 'e', 'me'], ['결산 최종 승인', 'j', 'me']] },
      { n: '인사(HR)', t: [['채용 공고 초안', 'r', 'co'], ['면접 일정 조율', 'r', 'ai'], ['지원서 1차 정리', 'j', 'co'], ['사내 교육 자료 만들기', 'r', 'co'], ['직원 고충 상담', 'e', 'me'], ['최종 합격 결정', 'j', 'me']] },
      { n: '고객 상담', t: [['자주 묻는 질문 답변(고지 포함)', 'r', 'ai'], ['문의 분류·요약', 'r', 'ai'], ['답변 초안 작성', 'r', 'co'], ['불만 고객 응대', 'e', 'me'], ['환불·보상 결정', 'j', 'me'], ['상담 기록 분석·개선안', 'j', 'co']] },
      { n: '기자·에디터', t: [['보도자료 요약', 'r', 'ai'], ['제목·기사 초안 후보', 'r', 'co'], ['번역·자막', 'r', 'co'], ['현장 취재·인터뷰', 'e', 'me'], ['사실 확인', 'j', 'co'], ['게재 결정과 책임', 'j', 'me']] },
      { n: '행정·공공기관', t: [['민원 문의 분류', 'r', 'ai'], ['공문 초안', 'r', 'co'], ['법령·지침 찾기', 'j', 'co'], ['민원인 면담', 'e', 'me'], ['예산 집행 판단', 'j', 'me'], ['정책 홍보물 만들기', 'r', 'co']] },
    ];
    const FL = { r: '반복·규칙적', j: '판단·책임이 핵심', e: '공감·관계가 핵심' };
    const LB = { ai: 'AI', co: '함께', me: '나' };
    let cur = 0, st = [];
    const jb = J.map((j, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'jobbtn'; b.textContent = j.n;
      b.addEventListener('click', () => pick(i)); $('rp-jobs').appendChild(b); return b;
    });
    function pick(i) {
      cur = i; st = J[i].t.map(() => null);
      jb.forEach((b, k) => b.setAttribute('aria-pressed', k === i));
      box.innerHTML = '';
      J[i].t.forEach(([nm, f], k) => {
        const row = document.createElement('div'); row.className = 'task';
        row.innerHTML = `<div><span class="tn">${nm}</span><span class="tf">${FL[f]}</span><span class="warn"></span></div><div class="seg">${['ai', 'co', 'me'].map((x) => `<button type="button" data-k="${x}" aria-pressed="false">${LB[x]}</button>`).join('')}</div>`;
        row.querySelectorAll('.seg button').forEach((b) => b.addEventListener('click', () => { st[k] = b.dataset.k; render(); }));
        box.appendChild(row);
      });
      render();
    }
    function render() {
      const t = J[cur].t, rows = box.querySelectorAll('.task');
      const n = { ai: 0, co: 0, me: 0 }; const warns = [];
      t.forEach(([nm, f], k) => {
        rows[k].querySelectorAll('.seg button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.k === st[k]));
        let w = '';
        if (st[k] === 'ai' && f === 'j') w = '⚠ 판단·책임이 핵심 — AI에만 맡기면 위험. 최종 확인은 사람이';
        if (st[k] === 'ai' && f === 'e') w = '⚠ 공감·관계가 핵심 — 상대는 사람을 기대할 수 있음';
        rows[k].classList.toggle('w', !!w); rows[k].querySelector('.warn').textContent = w;
        if (w) warns.push(nm);
        if (st[k]) n[st[k]]++;
      });
      $('rp-ai').textContent = n.ai; $('rp-co').textContent = n.co; $('rp-me').textContent = n.me;
      const done = st.filter(Boolean).length, box2 = $('rp-st');
      const cand = t.find(([, f], k) => f === 'r' && (st[k] === 'ai' || st[k] === 'co'));
      if (done < t.length) { box2.className = 'status mid'; box2.innerHTML = `<b class="k">분담해 보기 · ${done} / ${t.length}</b>업무마다 AI · 함께 · 나 중 하나를 고르세요.`; }
      else if (warns.length) { box2.className = 'status bad'; box2.innerHTML = `<b class="k">다시 생각해 볼 업무 ${warns.length}개</b>${warns.join(', ')} — 사람이 맡아야 할 이유가 있는 업무입니다.`; }
      else if (n.me === 0) { box2.className = 'status mid'; box2.innerHTML = '<b class="k">내가 맡는 업무가 없어요</b>판단·책임·공감이 필요한 업무는 누가 맡을까요?'; }
      else { box2.className = 'status ok'; box2.innerHTML = `<b class="k">분담 완료</b>${cand ? `업무 개선안 후보: <strong>“${cand[0]}”</strong> — 반복적이고 AI와 나눌 수 있는 업무입니다.` : '반복 업무를 AI와 나누면 개선안 후보가 됩니다.'}`; }
      // 다음 장 프롬프트 채우기
      const pre = $('rp-prompt'); if (!pre) return;
      const list = (k) => t.filter((x, i) => st[i] === k).map((x) => x[0]).join(', ') || '(아직 고르지 않음)';
      pre.innerHTML = `나는 <mark>[내 전공]</mark> 2학년 학생이고, <mark>${esc(J[cur].n)}</mark> 직무를 희망해.\n이 직무의 업무를 생성형AI와 이렇게 나눠 보려고 해.\n- AI에 맡길 업무: ${esc(list('ai'))}\n- AI와 함께할 업무: ${esc(list('co'))}\n- 내가 직접 할 업무: ${esc(list('me'))}\n업무마다 ① AI 결과를 검증하는 방법 ② 사람이 맡아야 하는 이유(있다면) ③ 내가 키워야 할 역량을 표로 정리해 줘.\n내가 빠뜨린 대표 업무가 있으면 2개만 더 알려 줘.`;
    }
    $('rp-ex').addEventListener('click', () => { st = J[cur].t.map((x) => x[2]); render(); });
    pick(0);
  })();
})();
