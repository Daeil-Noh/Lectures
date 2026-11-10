// 9주 2차시 전용: 지금 방식 vs AI 활용 비교, 자동화해도 될까? 카드, 시간 절약 계산기
(function () {
  const $ = (id) => document.getElementById(id);
  const hm = (min) => { const h = Math.round(min / 6) / 10; return (min < 60 ? min + '분' : h + '시간'); };

  /* ───────── 1) 지금 방식 vs AI 활용 ─────────
     who: hu 사람, ai AI, ck 사람 확인 · 시간(분)은 설명용 가정 */
  (function beforeAfter() {
    const box = $('ba-steps'); if (!box) return;
    const T = {
      mail: {
        before: [['hu', '메일 10통 하나씩 읽기', 20], ['hu', '유형별로 나누기', 10], ['hu', '답장 한 통씩 처음부터 쓰기', 50], ['hu', '다시 읽고 보내기', 10]],
        after: [['hu', '개인정보 지우고 메일 붙여 넣기', 10], ['ai', '분류 + 답장 초안 10개', 5], ['ck', '정책·어조 확인하고 고치기', 25], ['hu', '보내기', 10]],
        msg: '시간이 가장 많이 드는 <strong>“처음부터 쓰기”</strong>가 <strong>“확인하고 고치기”</strong>로 바뀝니다.',
      },
      meet: {
        before: [['hu', '메모를 문장으로 정리', 30], ['hu', '할 일 뽑아 내기', 15], ['hu', '담당자별 메시지 쓰기', 15]],
        after: [['hu', '회의 메모 붙여 넣기', 5], ['ai', '요약 + 할 일 표 + 메시지 초안', 3], ['ck', '참석자가 담당·기한 확인', 15], ['hu', '공유하기', 5]],
        msg: 'AI가 표를 만들어도 <strong>담당자·기한 확인</strong>은 꼭 남습니다. 빠진 할 일이 없는지도 봅니다.',
      },
      rev: {
        before: [['hu', '후기 하나씩 읽기', 30], ['hu', '유형 나누고 직접 세기', 30], ['hu', '보고서 처음부터 쓰기', 40]],
        after: [['hu', '후기 파일 올리기 (가상 자료)', 5], ['ai', '분류·요약·보고서 초안', 5], ['ck', '숫자를 원자료와 대조', 20], ['ck', '해석·제안 직접 다듬기', 20]],
        msg: '숫자 세기는 AI가 돕지만, <strong>숫자 대조와 해석</strong>은 사람이 합니다(7주차).',
      },
    };
    let task = 'mail', mode = 'before';
    const MAXM = 50;
    function render() {
      const steps = T[task][mode];
      box.innerHTML = steps.map(([w, n, m]) => `<div class="srow ${w}"><span class="who">${w === 'ai' ? 'AI' : w === 'ck' ? '사람 확인' : '사람'}</span><span class="nm">${n}</span><span class="tr"><i style="width:${Math.min(100, m / MAXM * 100)}%"></i></span><span class="m">${m}분</span></div>`).join('');
      const sum = (a) => a.reduce((s, x) => s + x[2], 0);
      const b = sum(T[task].before), a = sum(T[task].after);
      $('ba-tot').innerHTML = mode === 'before' ? `<span>합계 (가정)</span><span>${b}분</span>` : `<span>합계 (가정) — 지금 방식 ${b}분과 비교</span><span style="color:var(--accent)">${a}분</span>`;
      $('ba-msg').innerHTML = mode === 'before'
        ? '모든 단계를 <strong>사람</strong>이 합니다. <strong>AI 활용</strong>을 눌러 바뀌는 단계를 보세요.'
        : T[task].msg + ` 1회 약 <strong>${b - a}분</strong> 절약(가정).`;
      document.querySelectorAll('.taskbtn').forEach((x) => x.setAttribute('aria-pressed', x.dataset.t === task));
      document.querySelectorAll('.modebtn').forEach((x) => x.setAttribute('aria-pressed', x.dataset.m === mode));
    }
    document.querySelectorAll('.taskbtn').forEach((x) => x.addEventListener('click', () => { task = x.dataset.t; mode = 'before'; render(); }));
    document.querySelectorAll('.modebtn').forEach((x) => x.addEventListener('click', () => { mode = x.dataset.m; render(); }));
    render();
  })();

  /* ───────── 2) 자동화해도 될까? ───────── */
  (function verdict() {
    const wrap = $('acards'); if (!wrap) return;
    const V = { ok: '맡겨도 됨', mid: 'AI 초안 → 사람 확인 후', no: '자동화하지 않음' };
    const items = [
      { n: '사내 공지 문장의 맞춤법·띄어쓰기 다듬기', k: 'ok', a: '틀려도 피해가 작고 고치기 쉽다. 결과만 한 번 훑어본다.' },
      { n: '고객 문의에 AI가 답장을 써서 바로 자동 발송', k: 'mid', a: '초안까지는 좋다. 발송 전에 정책·약속 문장을 사람이 확인한다.' },
      { n: '신입 사원 지원서를 읽고 합격·불합격 결정', k: 'no', a: '사람에 대한 중요한 결정. 공정성·책임 문제가 크다(13주).' },
      { n: '회의 메모를 할 일 표로 정리', k: 'mid', a: '담당자·기한이 틀리면 일이 꼬인다. 참석자가 확인 후 공유.' },
      { n: '고객 주민등록번호가 적힌 신청서 요약', k: 'no', a: '고유식별정보는 채팅창에 넣지 않는다. 요약이 필요하면 번호를 지운 뒤에.' },
      { n: '신제품 이름 아이디어 20개 뽑기', k: 'ok', a: '후보를 많이 내는 일. 고르고 상표 문제를 확인하는 건 사람.' },
      { n: '거래처 대금 지급 승인', k: 'no', a: '돈이 나가는 최종 승인. 책임질 사람이 직접 결정한다.' },
      { n: '한 달 후기 요약 보고서 초안', k: 'mid', a: '건수·평균은 원자료로 다시 계산하고, 인용이 실제 원문인지 확인.' },
      { n: '매장 안내 카드 영어 번역', k: 'mid', a: '알레르기·성분 표현은 틀리면 위험. 원문과 대조한다.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="nm">${it.n}</span><span class="verdict">${V[it.k]}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('ac-score').textContent = opened + ' / ' + items.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 3) 시간 절약 계산기 ─────────
     지금 = n × b, AI 활용 = n × (a + c), 절약 = 지금 − AI 활용 */
  (function calc() {
    const n = $('c-n'); if (!n) return;
    const b = $('c-b'), a = $('c-a'), c = $('c-c');
    const P = [
      { k: '후기 답글 (바다결)', v: [20, 30, 5, 10] },
      { k: '문의 메일 10통', v: [8, 90, 15, 35] },
      { k: '회의록 정리', v: [4, 60, 8, 20] },
      { k: '한 달 후기 보고', v: [1, 100, 10, 40] },
    ];
    const pre = $('c-pre');
    const btns = P.map((p, i) => {
      const x = document.createElement('button'); x.type = 'button'; x.textContent = p.k; x.setAttribute('aria-pressed', i === 0);
      x.addEventListener('click', () => { [n.value, b.value, a.value, c.value] = p.v; btns.forEach((y) => y.setAttribute('aria-pressed', y === x)); update(); });
      pre.appendChild(x); return x;
    });
    function update() {
      const N = +n.value, B = +b.value, A = +a.value, C = +c.value;
      $('c-n-o').textContent = N + '회'; $('c-b-o').textContent = B + '분'; $('c-a-o').textContent = A + '분'; $('c-c-o').textContent = C + '분';
      const before = N * B, after = N * (A + C), save = before - after;
      const max = Math.max(before, after, 1);
      $('c-bb').style.width = before / max * 100 + '%';
      $('c-ba').style.width = N * A / max * 100 + '%';
      $('c-bc').style.width = N * C / max * 100 + '%';
      $('c-bv').textContent = hm(before); $('c-av').textContent = hm(after);
      $('c-save').textContent = save > 0 ? hm(save) : '없음';
      $('c-save').classList.toggle('o', save <= 0);
      const st = $('c-st');
      if (save <= 0) { st.className = 'status bad'; st.innerHTML = '<b class="k">' + (save < 0 ? '오히려 늘어남' : '아끼는 시간 없음') + '</b>초안·확인에 드는 시간이 지금과 같거나 더 깁니다. 이 업무는 <strong>자동화 대상이 아니거나</strong> 방법을 바꿔야 합니다.'; }
      else if (C < B * 0.2) { st.className = 'status mid'; st.innerHTML = `<b class="k">확인 시간을 너무 적게 잡지 않았나요?</b>1회 ${B}분 걸리던 일을 ${C}분 만에 확인할 수 있을까요? 확인을 건너뛰면 절약이 아니라 <strong>위험</strong>입니다.`; }
      else { st.className = 'status ok'; st.innerHTML = `<b class="k">개선안에 이렇게 쓰기</b>월 ${N}회 × (${B}분 → 초안 ${A}분 + 확인 ${C}분, 가정) = 월 약 <strong>${hm(save)}</strong> 절약. 시험해 보고 실제 시간을 다시 잽니다.`; }
    }
    [n, b, a, c].forEach((x) => x.addEventListener('input', () => { btns.forEach((y) => y.setAttribute('aria-pressed', false)); update(); }));
    update();
  })();
})();
