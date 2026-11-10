// 12주 3차시 전용: 맥락 있는 번역 비교, 번역 점검 카드, 매뉴얼 → 퀴즈·요약 카드 생성기(모의)
(function () {
  const $ = (id) => document.getElementById(id);
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };

  /* ───────── 1) 맥락 있는 번역 ───────── */
  (function translate() {
    const card = $('tr-card'); if (!card) return;
    const st = { A: false, P: false, G: false, B: false };
    const X = (s) => `<span class="x">${s}</span>`;   // 문제가 있는 부분
    const C = (s) => `<span class="chg">${s}</span>`; // 맥락 덕분에 바뀐 부분
    function build() {
      const { A, P, G } = st;
      const mall = G ? C('official online store') : X('own mall');
      const mallK = G ? '공식 온라인 스토어' : '<span class="x">자기 쇼핑몰</span>';
      const en = {}, ko = {};
      en.br = G ? C('BADAGYEOL') : X('Sea Texture');
      ko.br = G ? '바다결' : '<span class="x">바다 질감</span>';
      en.nm = (G ? C('No Added Sugar') : X('Sugar-free')) + ' Nut Mix';
      ko.nm = (G ? '설탕 무첨가' : '<span class="x">무설탕</span>') + ' 견과 믹스';
      if (P) { en.l1 = G ? 'Just nuts. No added sugar.' : 'Just nuts. No sugar.'; ko.l1 = G ? '견과만. 설탕 무첨가.' : '견과만. <span class="x">설탕 없음.</span>'; }
      else if (A) { en.l1 = (G ? 'We add no sugar' : 'We use no sugar') + ' — just a mix of nuts.'; ko.l1 = '설탕을 넣지 않고 견과만 섞었습니다.'; }
      else { en.l1 = X('We did not put sugar, and we put only nuts.'); ko.l1 = '우리는 설탕을 넣지 않았고, 견과만 넣었습니다.'; }
      if (P && A) { en.l2 = `${C('Loved it here?')} Order again at our ${mall}.`; ko.l2 = `여기서 마음에 드셨나요? ${mallK}에서 다시 주문하세요.`; }
      else if (A) { en.l2 = `${C('Enjoyed it at our Busan store?')} Order it again anytime from our ${mall}.`; ko.l2 = `부산 매장에서 맛있게 드셨나요? 언제든 ${mallK}에서 다시 주문하세요.`; }
      else { en.l2 = `Taste it at Busan store, and ${X('meet again')} at ${mall}.`; ko.l2 = `부산 가게에서 맛보고, ${mallK}에서 <span class="x">다시 만나요</span>.`; }
      en.pr = G ? C('KRW 13,500') : X('13,500 won');
      ko.pr = '13,500원';
      en.al = G ? 'Allergy: ' + C('Contains tree nuts') + ' (almond, walnut)' : 'Allergy information: nuts (almond, walnut) included';
      ko.al = '알레르기: 견과류(아몬드, 호두) 함유';
      const iss = [];
      if (!G) iss.push('브랜드명을 뜻으로 번역 (Sea Texture)', '무가당 → Sugar-free: ‘무설탕’으로 읽힘', '‘own mall’ — 뜻이 통하지 않음', '가격 표기가 용어집과 다름');
      if (!A) iss.push('직역 말투 — 관광객이 읽기에 어색함');
      if (!P) iss.push('계산대 옆 작은 카드에는 문장이 김');
      return { en, ko, iss };
    }
    function render() {
      const { en, ko, iss } = build();
      card.innerHTML = `<div class="br">${en.br}</div><div class="nm">${en.nm}</div><div class="ln">${en.l1}</div><div class="ln">${en.l2}</div><div class="pr">${en.pr}</div><div class="al">${en.al}</div>`;
      const back = $('tr-back');
      back.hidden = !st.B;
      back.innerHTML = `<b class="k">역번역 (번역문 → 한국어)</b>${ko.br} ${ko.nm} / ${ko.l1} / ${ko.l2} / ${ko.pr} / ${ko.al}`;
      $('tr-n').textContent = iss.length;
      $('tr-n').classList.toggle('o', iss.length > 0);
      $('tr-iss').innerHTML = iss.length
        ? iss.map((s) => `<li>${s}</li>`).join('') + (st.B ? '' : '<li style="list-style:none;margin-left:-1.1em;color:var(--muted)">‘역번역 보기’로 뜻이 바뀐 곳을 확인해 보세요.</li>')
        : '<li style="list-style:none;margin-left:-1.1em"><strong style="color:var(--ok)">고칠 곳 없음.</strong> 그래도 알레르기 문구는 담당자·원어민이 최종 확인합니다.</li>';
    }
    document.querySelectorAll('.tgl[data-c]').forEach((b) => b.addEventListener('click', () => { st[b.dataset.c] = toggle(b); render(); }));
    render();
  })();

  /* ───────── 2) 번역 점검 카드 ───────── */
  (function checkCards() {
    const wrap = $('tcards'); if (!wrap) return;
    const items = [
      { ko: '원문: 오리지널 그래놀라 9,800원', n: 'Original Granola KRW 98,000', k: 'no', v: '숫자 오류 ✕', a: '0이 하나 더 붙었다. 가격·수량·날짜는 원문과 한 자리씩 대조한다.' },
      { ko: '원문: 바다결 선물 세트', n: 'Sea Texture Gift Set', k: 'no', v: '고유명사 ✕', a: '역번역하면 ‘바다 질감 선물 세트’. 브랜드명은 용어집대로 BADAGYEOL.' },
      { ko: '원문: 그래놀라 2종과 견과 믹스 구성. 견과류 함유.', n: 'Two granolas and a nut mix.', k: 'no', v: '누락 ✕', a: '알레르기 문장이 통째로 빠졌다. 안전 정보는 원어민·담당자가 반드시 확인한다.' },
      { ko: '원문: 무가당 견과 믹스', n: 'Sugar-free Nut Mix', k: 'no', v: '뜻이 바뀜 ✕', a: '역번역하면 ‘무설탕’. 당을 넣지 않았다는 뜻과 다르다. 용어집: No Added Sugar.' },
      { ko: '원문: 매장에서 직접 맛보세요', n: 'Try it in our store.', k: 'yes', v: '그대로 써도 됨 ✓', a: '역번역 ‘매장에서 드셔 보세요’ — 뜻이 같고 짧다.' },
      { ko: '원문: 1+1 행사 중', n: '1+1 event in progress', k: 'mid', v: '현지화 필요 △', a: '뜻은 짐작되지만 영어권에서 흔한 표현은 ‘Buy 1, Get 1 Free’.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="ko">${it.ko}</span><span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('tc-score').textContent = opened + ' / ' + items.length + ' 확인' + (opened === items.length ? ' — 숫자·고유명사·누락·뜻 바뀜 4건, 현지화 1건, 문제없음 1건' : '');
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 3) 매뉴얼 → 퀴즈·요약 카드 (모의) ───────── */
  (function quiz() {
    const out = $('qz-out'); if (!out) return;
    const MAN = {
      A: { t: '1. 출근과 위생 · 2. 제품 보관과 진열', L: [
        ['1-1', '손 씻기, 위생모·앞치마 착용'], ['1-2', '시식용은 개봉한 날에만, 남으면 폐기'], ['1-3', '시식 접시·집게 2시간마다 교체'],
        ['2-1', '직사광선 피해 서늘하고 건조한 곳에 보관'], ['2-2', '소비기한 14일 이하 남으면 진열 않고 매니저에게'], ['2-3', '먼저 들어온 제품을 앞쪽에'] ] },
      B: { t: '3. 고객 응대 · 5. 문의 응대', L: [
        ['3-1', '먼저 인사하고 시식 권하기'], ['3-2', '알레르기 문의: 성분 표시 함께 확인, 모르면 매니저'], ['3-3', '견과류 제품: 견과 믹스·선물 세트 / 그래놀라는 같은 시설 표시 안내'],
        ['3-4', '외국인 고객에게 영문 제품 안내 카드'], ['5-1', '자사몰 문의는 영업일 기준 하루 안에'], ['5-2', '모르면 “확인 후 연락드리겠습니다”'] ] },
      C: { t: '4. 교환과 반품 · 6. 고객 정보', L: [
        ['4-1', '제품 문제: 영수증 확인 후 같은 제품 교환'], ['4-2', '개봉 후 단순 변심 교환은 받지 않음'], ['4-3', '온라인 구매는 구매처 고객센터 안내'],
        ['6-1', '연락처는 교환 접수 양식에만'], ['6-2', '양식을 개인 휴대전화로 찍거나 메신저로 보내지 않음'], ['6-3', '양식을 생성형AI 채팅창에 올리지 않음'] ] },
    };
    // ev: 근거 번호, 없으면 null(AI가 덧붙인 내용)
    const SETS = {
      A: {
        quiz: [
          { q: '소비기한이 며칠 이하로 남은 제품은 진열하지 않나요?', op: '① 7일 ② <b>14일</b> ③ 30일', ev: ['2-2'] },
          { q: '시식용 제품은 언제까지 쓰나요?', op: '① <b>개봉한 날까지</b> ② 개봉 후 3일 ③ 소비기한까지', ev: ['1-2'] },
          { q: '개봉한 제품은 냉장 보관해야 한다. (O / X)', op: '정답: <b>O</b>', ev: null, why: '매뉴얼에 없음. 2-1은 ‘서늘하고 건조한 곳’ — AI가 일반 상식을 덧붙여 매뉴얼과 어긋남' },
        ],
        card: [
          { q: '출근하면 손 씻기 → 위생모·앞치마', ev: ['1-1'] },
          { q: '시식: 개봉한 날만, 접시·집게는 2시간마다 새것', ev: ['1-2', '1-3'] },
          { q: '진열 전 소비기한 확인, 14일 이하는 빼고 매니저에게', ev: ['2-2'] },
          { q: '시식은 한 사람당 한 번만 권한다', ev: null, why: '매뉴얼에 없는 규칙 — AI가 만들어 넣음' },
        ] },
      B: {
        quiz: [
          { q: '알레르기 문의를 받았는데 확실하지 않다면?', op: '① 비슷한 제품 기준으로 답한다 ② <b>성분 표시를 함께 보고, 모르면 매니저에게 확인</b> ③ 괜찮다고 안내한다', ev: ['3-2'] },
          { q: '자사몰 문의 게시판 글은 언제까지 답하나요?', op: '① <b>영업일 기준 하루 안</b> ② 일주일 안 ③ 다음 달', ev: ['5-1'] },
          { q: '외국인 고객에게는 영어로 시식을 권해야 한다. (O / X)', op: '정답: <b>O</b>', ev: null, why: '매뉴얼(3-4)은 ‘영문 안내 카드를 드린다’뿐 — AI가 바꿔 씀' },
        ],
        card: [
          { q: '들어오면 먼저 인사, 시식 권하기', ev: ['3-1'] },
          { q: '알레르기 문의: 성분 표시 함께 확인, 모르면 추측 말고 매니저', ev: ['3-2'] },
          { q: '견과류 알레르기 고객에게는 그래놀라를 추천', ev: null, why: '매뉴얼과 반대 — 3-3: 그래놀라는 견과류와 같은 시설 표시를 안내' },
          { q: '모르는 질문은 “확인 후 연락드리겠습니다”', ev: ['5-2'] },
        ] },
      C: {
        quiz: [
          { q: '오픈마켓에서 산 제품을 매장에서 교환해 달라고 하면?', op: '① 매장에서 바로 교환 ② <b>구매한 곳의 고객센터 안내</b> ③ 현금 환불', ev: ['4-3'] },
          { q: '고객 연락처는 어디에 적나요?', op: '① <b>교환 접수 양식에만</b> ② 개인 휴대전화 메모 ③ 단체 메신저', ev: ['6-1'] },
          { q: '개봉한 제품도 7일 안에 가져오면 교환할 수 있다. (O / X)', op: '정답: <b>O</b>', ev: null, why: '매뉴얼에 ‘7일’ 규정 없음 — 4-2와 어긋나는 지어낸 기간' },
        ],
        card: [
          { q: '포장 터짐·이물: 영수증 확인 후 같은 제품으로 교환', ev: ['4-1'] },
          { q: '개봉 후 단순 변심: 교환 안 함', ev: ['4-2'] },
          { q: '교환할 때 고객 신분증을 확인한다', ev: null, why: '매뉴얼에 없는 절차 — 오히려 불필요한 개인정보 수집' },
          { q: '고객 정보 양식: 사진·메신저·AI 채팅창 금지', ev: ['6-2', '6-3'] },
        ] },
    };
    const st = { sec: 'A', fmt: 'quiz', cmp: false };
    function render() {
      const set = SETS[st.sec][st.fmt], man = MAN[st.sec];
      out.classList.toggle('cmp', st.cmp);
      const head = `<div class="hd"><svg class="ic"><use href="#i-sparkles"/></svg> AI 생성 결과 · 예시 (${st.fmt === 'quiz' ? '퀴즈 3문제' : '요약 카드'})</div>`;
      out.innerHTML = head + set.map((it, i) => `<div class="qi ${it.ev ? 'ok' : 'bad'}${st.fmt === 'card' ? ' cardi' : ''}">` +
        `<span class="ev">${it.ev ? '근거 ' + it.ev.join('·') + ' ✓' : '근거 없음 ✕'}</span>` +
        `<div class="qq">${st.fmt === 'quiz' ? 'Q' + (i + 1) + '. ' : '· '}${it.q}</div>` +
        (it.op ? `<div class="op">${it.op}</div>` : '') +
        (it.why ? `<div class="why">${it.why}</div>` : '') + '</div>').join('');
      const hits = new Set(st.cmp ? set.flatMap((it) => it.ev || []) : []);
      $('qz-man').innerHTML = `<div class="t">매뉴얼 원문 요약 · ${man.t}</div>` + man.L.map(([k, v]) => `<div class="${hits.has(k) ? 'hit' : ''}"><b>${k}</b> ${v}</div>`).join('');
      const bad = set.filter((it) => !it.ev).length;
      $('qz-msg').innerHTML = st.cmp
        ? `${set.length}개 중 <strong>${bad}개는 매뉴얼에 근거가 없습니다.</strong> 그럴듯해 보여도 빼고, 필요하면 담당자에게 확인합니다.`
        : '겉보기엔 모두 그럴듯합니다. <strong>근거 대조</strong>를 눌러 매뉴얼 번호와 맞춰 보세요.';
      $('qz-cmp').innerHTML = st.cmp ? '<svg class="ic"><use href="#i-reset"/></svg> 대조 표시 끄기' : '<svg class="ic"><use href="#i-eye"/></svg> 매뉴얼과 근거 대조하기';
    }
    document.querySelectorAll('.seg').forEach((g) => {
      g.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
        st[g.dataset.k] = b.dataset.v; render();
      }));
    });
    $('qz-cmp').addEventListener('click', () => { st.cmp = !st.cmp; render(); });
    render();
  })();
})();
