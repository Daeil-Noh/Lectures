// 3주 1차시 전용: 빈칸 찾기, 프롬프트 조립기, 요소 분류 카드, 조건 바꾸기
// 모든 AI 답변은 미리 써 둔 예시 문장이다(실제 서비스 출력 아님).
(function () {
  const $ = (id) => document.getElementById(id);
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ───────── 1) AI가 채운 빈칸 찾기 ───────── */
  (function blanks() {
    const chips = $('g-chips'); if (!chips) return;
    const st = $('g-st');
    const why = {
      who: '“여러분” — 누가 읽는지 몰라서 <strong>모든 사람</strong>에게 하는 말이 됐습니다.',
      what: '제품 이름·재료·가격을 몰라서 <strong>어떤 제품에나 붙는 칭찬</strong>만 남았습니다.',
      where: '인스타그램인지 매장 포스터인지 몰라서 <strong>공지문 같은 인사</strong>로 끝났습니다.',
      len: '길이를 정하지 않아 <strong>있으나 마나 한 문장</strong>이 덧붙었습니다.',
      tone: '말투를 정하지 않아 <strong>가장 흔한 광고 말투</strong>가 나왔습니다.',
    };
    const on = new Set();
    chips.querySelectorAll('.tgl').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.g;
      toggle(b) ? on.add(k) : on.delete(k);
      document.querySelectorAll('#g-ans .guess[data-g="' + k + '"]').forEach((s) => s.classList.toggle('on', on.has(k)));
      $('g-n').textContent = on.size + ' / 5';
      if (on.size === 5) { st.className = 'status bad'; st.innerHTML = '<b class="k">빈칸 5개 모두 AI의 추측</b>질문에 없던 결정을 AI가 전부 <strong>무난한 쪽으로</strong> 내렸습니다. 이 빈칸을 우리가 먼저 채우는 것이 좋은 프롬프트입니다.'; }
      else if (on.has(k)) { st.className = 'status mid'; st.innerHTML = '<b class="k">AI의 추측</b>' + why[k]; }
      else { st.className = 'status mid'; st.innerHTML = '<b class="k">찾아보세요</b>질문은 한 줄인데, 답에는 질문에 없던 결정이 여럿 들어 있습니다.'; }
    }));
  })();

  /* ───────── 2) 프롬프트 조립기 ───────── */
  (function builder() {
    const pre = $('b-prompt'); if (!pre) return;
    const P = {
      role: '너는 20~30대 고객을 잘 아는 식품 브랜드 SNS 마케터야.',
      ctx: '우리 회사 바다결은 부산의 건강 간식 회사야. 이번에 ‘미역귀 현미칩 매콤맛’을 새로 출시해. 기존 미역귀 현미칩처럼 튀기지 않고 구웠고, 청양고추로 매운맛을 냈어. 1봉 6,900원이야.',
      ins: '인스타그램 신제품 소개 게시물 문구를 써 줘. ‘튀기지 않은 칩’과 ‘맵지만 계속 손이 가는 맛’ 두 장점이 드러나게 해 줘.',
      base: '신제품 소개 문구 써 줘.',
      fmt: '서로 다른 느낌으로 3가지 버전, 각 2문장 이내, 버전마다 해시태그 3개를 붙여 줘.',
    };
    const LBL = { role: '역할', ctx: '맥락', ins: '지시', fmt: '형식' };
    // 답의 조각: 첫 문장(역할×맥락), 본문(맥락×지시), 해시태그(맥락)
    const HOOK = {
      '00': ['새로운 맛, 새로운 즐거움!', '기다리던 신제품이 드디어 나왔습니다.', '일상에 특별함을 더해 보세요.'],
      '10': ['오늘 간식, 아직 못 정했다면?', '요즘 다들 찾는 그 맛, 드디어 출시!', '한 봉으로 끝낼 수 있을까?'],
      '01': ['바다결 미역귀 현미칩 매콤맛이 출시되었습니다.', '미역귀 현미칩에 매콤맛이 새로 나왔습니다.', '바다결의 새 간식, 미역귀 현미칩 매콤맛을 소개합니다.'],
      '11': ['야식은 당기는데 튀긴 과자는 부담될 때.', '청양고추 한 꼬집, 미역귀 현미칩이 매워졌다.', '6,900원으로 즐기는 오늘 밤 매운 간식.'],
    };
    const BODY = {
      '00': ['엄선한 재료로 정성껏 만들어 맛과 품질 모두 만족하실 거예요.', '누구나 좋아할 맛으로 준비했어요.', '지금 바로 만나 보세요.'],
      '01': ['튀기지 않아 가볍고, 맵지만 자꾸 손이 가는 맛이에요.', '튀기지 않은 칩이라 부담 없이, 매콤함에 한 봉이 금방이에요.', '맵다, 그런데 또 먹게 된다. 튀기지 않아 더 가볍게.'],
      '10': ['현미와 미역귀로 만든 칩에 청양고추의 매운맛을 더했습니다.', '부산 바다결이 만든 건강한 간식, 이제 매콤하게 즐겨 보세요.', '맛과 건강을 모두 생각한 바다결의 신제품입니다.'],
      '11': ['튀기지 않고 구운 현미칩이라 가볍고, 청양고추 매운맛이 계속 손을 부릅니다.', '기름에 튀기지 않아 바삭함은 그대로, 매운맛은 한 단계 위로.', '맵지만 멈출 수 없는 맛, 튀기지 않아 부담은 덜었어요.'],
    };
    const TAGS = {
      0: ['#신제품 #간식추천 #맛스타그램', '#새로운맛 #일상 #추천', '#신상 #간식 #데일리'],
      1: ['#바다결 #미역귀현미칩 #매콤간식', '#튀기지않은칩 #청양고추 #야식추천', '#부산간식 #신제품 #바다결'],
    };
    const S = { role: false, ctx: false, ins: false, fmt: false };
    let last = null;
    function render(changed) {
      let h = '';
      const part = (k, txt) => `<span class="part p-${k}${k === changed ? ' new' : ''}" data-l="${LBL[k]}">${esc(txt)}</span>`;
      if (S.role) h += part('role', P.role);
      if (S.ctx) h += part('ctx', P.ctx);
      h += S.ins ? part('ins', P.ins) : `<span class="part" data-l="요청">${esc(P.base)}</span>`;
      if (S.fmt) h += part('fmt', P.fmt);
      pre.innerHTML = h;
      const hk = HOOK[(+S.role) + '' + (+S.ctx)], bd = BODY[(+S.ctx) + '' + (+S.ins)], tg = TAGS[+S.ctx];
      let a;
      if (S.fmt) {
        a = [0, 1, 2].map((i) => `${i + 1}) ${hk[i]} ${bd[i]}\n${tg[i]}`).join('\n\n');
      } else {
        a = hk[0] + ' ' + bd[0] + (S.ctx ? ' 1봉 6,900원, 부산 바다결의 정성을 담았습니다.' : '') + (S.ins ? '' : ' 언제나 함께하는 든든한 간식이 되어 드리겠습니다.') + ' 많은 관심과 사랑 부탁드립니다!';
      }
      $('b-ans').innerHTML = '<span class="who">AI</span>' + esc(a);
      const C = [
        ['ctx', '우리 제품 이야기인가? (제품명·특징·가격)'],
        ['ins', '목적과 강조점이 분명한가? (인스타그램·장점 2개)'],
        ['role', '20~30대에게 말을 거는 말투인가?'],
        ['fmt', '바로 골라 붙여 넣을 모양인가? (3안·2문장·태그)'],
      ];
      $('b-checks').innerHTML = C.map(([k, t]) => `<div class="${S[k] ? 'ok' : ''}"><i>${S[k] ? '✓' : '·'}</i>${t}</div>`).join('');
      const n = Object.values(S).filter(Boolean).length;
      const st = $('b-st');
      if (n === 4) { st.className = 'status ok'; st.innerHTML = '<b class="k">네 조각 완성</b>바로 고쳐 쓸 수 있는 <strong>초안</strong>이 됐습니다. 그래도 가격·사실은 직접 확인!'; }
      else if (n === 0) { st.className = 'status bad'; st.innerHTML = '<b class="k">조각 0개</b>어느 회사에나 붙일 수 있는 문구입니다. 조각을 하나씩 켜 보세요.'; }
      else {
        const miss = ['role', 'ctx', 'ins', 'fmt'].filter((k) => !S[k]).map((k) => LBL[k]).join('·');
        st.className = 'status mid'; st.innerHTML = `<b class="k">조각 ${n}개</b>나아졌지만 빠진 조각(<strong>${miss}</strong>)은 아직 AI의 추측입니다.`;
      }
    }
    document.querySelectorAll('#b-tg .tgl').forEach((b) => b.addEventListener('click', () => { S[b.dataset.k] = toggle(b); render(S[b.dataset.k] ? b.dataset.k : null); }));
    render();
  })();

  /* ───────── 3) 이 문장은 어떤 조각? ───────── */
  (function classify() {
    const wrap = $('c-cards'); if (!wrap) return;
    const V = { role: '역할', ctx: '맥락', ins: '지시', fmt: '형식', cond: '조건' };
    const items = [
      { n: '너는 10년 차 고객 상담 팀장이야.', k: 'role', a: '누구의 관점·전문성으로 답할지 정한다.' },
      { n: '고객이 배송 지연으로 두 번째 문의를 보낸 상황이야.', k: 'ctx', a: 'AI가 알 수 없는 지금의 상황이다.' },
      { n: '사과와 해결 방법이 담긴 답장을 써 줘.', k: 'ins', a: '무엇을 할지 동사(써 줘)로 말한다.' },
      { n: '번호 목록으로, 마지막 줄에 담당자 연락 방법을 넣어 줘.', k: 'fmt', a: '결과의 모양을 정한다.' },
      { n: '5문장 이내로, 정중하지만 딱딱하지 않게.', k: 'cond', a: '분량·톤 조건. 형식과 함께 쓰는 경우가 많다.' },
      { n: '우리 회사는 직원 12명인 부산의 건강 간식 회사야.', k: 'ctx', a: '회사 배경 정보도 맥락이다.' },
      { n: '제품명 · 장점 · 가격 세 칸짜리 표로 정리해 줘.', k: 'fmt', a: '표·칸 구성은 형식이다.' },
      { n: '처음 매장에 온 50대 손님이 읽는다고 생각해 줘.', k: 'cond', a: '대상 조건. 누가 읽느냐에 따라 단어가 바뀐다.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="nm">“${it.n}”</span><span class="verdict">${V[it.k]}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('c-score').textContent = opened + ' / ' + items.length + ' 확인' + (opened === items.length ? ' — 조건(분량·톤·대상)은 네 요소를 더 날카롭게 만드는 장치입니다.' : '');
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 4) 조건 바꾸기 ───────── */
  (function cond() {
    const pre = $('k-prompt'); if (!pre) return;
    const WHO = ['20대 사회 초년생(첫 명절 선물을 고르는 중)', '50대 거래처 선물 담당자'];
    const TONE = ['친근하게', '격식 있게'];
    const LEN = ['한 줄', '세 줄'];
    // [대상][톤][분량]
    const T = {
      '000': '첫 명절, 부모님께 뭐 드릴지 고민이라면? 바다결 선물 세트 32,000원으로 센스 있게!',
      '001': '첫 월급 받고 맞는 첫 명절, 선물 고민되죠?\n그래놀라·견과 믹스·현미칩을 한 상자에 담은 바다결 선물 세트, 32,000원이에요.\n한 상자에 다 들어 있어서 고르기 고민도 끝!',
      '010': '사회생활 첫 명절, 감사한 분께 바다결 선물 세트(32,000원)로 마음을 전해 보세요.',
      '011': '처음 맞는 명절, 감사의 마음을 전할 선물을 준비해 보시기 바랍니다.\n바다결 선물 세트는 그래놀라·견과 믹스·현미칩으로 구성되어 있으며 가격은 32,000원입니다.\n남녀노소 부담 없이 드실 수 있는 건강 간식입니다.',
      '100': '거래처 선물, 올해는 건강 간식 어떠세요? 바다결 선물 세트 32,000원!',
      '101': '매년 비슷한 명절 선물, 올해는 좀 바꿔 볼까요?\n부산에서 만든 그래놀라·견과 믹스·현미칩 세트, 32,000원이에요.\n받는 분 취향 걱정 없는 구성이라 여러 곳에 보내기도 좋아요!',
      '110': '올 명절 거래처 선물로 바다결 건강 간식 선물 세트(32,000원)를 제안드립니다.',
      '111': '귀사의 명절 선물 준비에 바다결 선물 세트를 제안드립니다.\n부산에서 만든 그래놀라·견과 믹스·현미칩으로 구성되어 있으며 가격은 세트당 32,000원입니다.\n연령과 취향에 관계없이 부담 없이 드실 수 있는 구성입니다.',
    };
    const S = { who: 0, tone: 0, len: 0 };
    const seen = new Set();
    function render() {
      pre.innerHTML = '바다결 명절 선물 세트 안내 문구를 써 줘. 구성은 그래놀라·견과 믹스·현미칩, 가격은 32,000원이야.\n대상: <mark>' + WHO[S.who] + '</mark>\n톤: <mark>' + TONE[S.tone] + '</mark> · 분량: <mark>' + LEN[S.len] + '</mark>';
      const key = '' + S.who + S.tone + S.len;
      seen.add(key);
      $('k-ans').innerHTML = '<span class="who">AI</span>' + esc(T[key]);
      $('k-n').textContent = seen.size + ' / 8';
      if (seen.size === 8) $('k-msg').innerHTML = '8가지를 모두 봤습니다. 가격·구성(사실)은 그대로, <strong>강조점·어미·정보량</strong>만 바뀌었죠? 조건은 <strong>사실을 바꾸지 않고 표현을 맞추는</strong> 다이얼입니다.';
    }
    document.querySelectorAll('.crow .switch').forEach((sw) => {
      sw.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        sw.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
        S[sw.dataset.k] = +b.dataset.v; render();
      }));
    });
    render();
  })();
})();
