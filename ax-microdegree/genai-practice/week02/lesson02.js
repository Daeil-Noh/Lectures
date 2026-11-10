// 2주 2차시 전용: 같은 요청 다른 결과물, 갈래별 능력 카드, 세 질문으로 고르기, 업무 매칭
(function () {
  const $ = (id) => document.getElementById(id);
  const ic = (n) => `<svg class="ic"><use href="#i-${n}"/></svg>`;
  const CATS = [
    { k: 'text', n: '대화형 텍스트', ic: 'chat' },
    { k: 'search', n: '검색 결합', ic: 'search' },
    { k: 'image', n: '이미지 생성', ic: 'image' },
    { k: 'av', n: '영상·음성', ic: 'video' },
    { k: 'doc', n: '문서·발표 보조', ic: 'present' },
  ];
  const CAT = Object.fromEntries(CATS.map((c) => [c.k, c]));
  function tabs(wrapId, onPick) {
    const w = $(wrapId); if (!w) return null;
    CATS.forEach((c) => {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.k = c.k; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = ic(c.ic) + c.n;
      b.addEventListener('click', () => { w.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); onPick(c.k); });
      w.appendChild(b);
    });
    return (k) => w.querySelector(`[data-k="${k}"]`).click();
  }

  /* ───────── 1) 같은 요청, 다른 결과물 ───────── */
  (function outputs() {
    const box = $('o-box'); if (!box) return;
    const giftSvg = '<svg viewBox="0 0 520 170" style="height:170px;width:auto;max-width:100%" aria-label="설명용으로 직접 그린 선물 상자 배너 그림">' +
      '<rect width="520" height="170" rx="12" fill="var(--accent-soft)"/><path d="M0 120 Q130 95 260 120 T520 118 V170 H0z" fill="var(--accent)" opacity=".35"/>' +
      '<circle cx="440" cy="44" r="24" fill="var(--accent-2)" opacity=".75"/>' +
      '<rect x="70" y="58" width="96" height="76" rx="6" fill="var(--accent-2)"/><rect x="62" y="46" width="112" height="20" rx="5" fill="var(--accent-2)" opacity=".8"/><rect x="112" y="46" width="12" height="88" fill="var(--surface)"/>' +
      '<text x="200" y="88" style="font-size:26px;font-weight:800;fill:var(--text)">추석 선믈 셋트</text>' +
      '<text x="200" y="116" style="font-size:15px;fill:var(--muted)">↑ 그림 속 글자가 이렇게 깨지기도 함</text></svg>';
    const O = {
      text: { h: '대화형 텍스트', d: '홍보 문구·소개 글 같은 <strong>글</strong>을 바로 만들어 준다.',
        chk: '가격·구성 같은 <strong>사실은 내가 준 정보</strong>와 맞는지 확인.',
        out: '<div class="lbl">예시 결과물 — 홍보 문구 초안</div><div>“올 추석, 부산 바다의 건강함을 선물하세요.”<br>바다결 추석 선물 세트 32,000원 — 그래놀라와 견과 믹스를 한 상자에.<br>부모님께, 거래처에, 고마운 분께 마음을 전해 보세요.</div>' },
      search: { h: '검색 결합', d: '웹을 찾아보고 <strong>요즘 동향과 출처 링크</strong>를 함께 정리한다.',
        chk: '링크를 <strong>직접 열어</strong> 원문 내용과 날짜를 확인. 광고성 글이 섞일 수 있다.',
        out: '<div class="lbl">예시 결과물 — 출처가 붙은 조사 요약</div><div>최근 명절 선물 세트 홍보에서는 ‘건강’, ‘실속 구성’을 강조하는 경우가 많고, 온라인 사전 예약 할인도 흔합니다. <span class="chip">출처 1</span><span class="chip">출처 2</span><span class="chip">출처 3</span></div><div class="muted" style="font-size:14px">※ 예시 문장 — 실제 조사 결과가 아니다</div>' },
      image: { h: '이미지 생성', d: '분위기를 보여 주는 <strong>배너·포스터 시안</strong>을 여러 장 빠르게 만든다.',
        chk: '그림 속 <strong>글자 깨짐</strong>, 실제 제품과 다른 모양, 실존 인물·상표가 없는지. 저작권은 11주에.',
        out: '<div class="lbl">예시 결과물 — 배너 시안 (설명용으로 직접 그린 그림)</div>' + giftSvg },
      av: { h: '영상·음성', d: '짧은 <strong>영상 클립</strong>이나 내레이션 <strong>음성</strong>을 만든다. 장면 구성 아이디어는 대화형 AI로도.',
        chk: '제공 여부가 <strong>서비스·요금제마다 다르다</strong>. 실제 사람의 얼굴·목소리를 흉내 내지 않기 (13주).',
        out: '<div class="lbl">예시 결과물 — 15초 숏폼 장면 구성</div><div class="frames"><div><b>0~5초</b>바다가 보이는 창가, 선물 상자가 놓여 있다</div><div><b>5~10초</b>상자를 열자 그래놀라·견과 믹스</div><div><b>10~15초</b>“올 추석엔 바다결” 자막과 가격</div></div><div class="muted" style="font-size:14px">숏폼 기획(대본·스토리보드)은 11주 2차시에서</div>' },
      doc: { h: '문서·발표 보조', d: '기획서 초안이나 <strong>발표 슬라이드 개요</strong>를 만든다.',
        chk: '숫자·일정·회사 사정은 <strong>사람이 채우고 고친다</strong>. 원문에 없는 내용이 끼어 있지 않은지.',
        out: '<div class="lbl">예시 결과물 — 홍보 기획 발표 개요</div><div class="sl"><div><b>1</b>추석 선물 세트 소개</div><div><b>2</b>대상 고객과 메시지</div><div><b>3</b>채널별 홍보 계획</div><div><b>4</b>일정과 예산 (사람이 채움)</div></div>' },
    };
    const pick = tabs('o-tabs', (k) => {
      box.innerHTML = O[k].out; $('o-h').innerHTML = ic(CAT[k].ic) + ' ' + O[k].h; $('o-d').innerHTML = O[k].d;
      $('o-chk').innerHTML = '<strong>확인할 점</strong> · ' + O[k].chk;
    });
    pick('text');
  })();

  /* ───────── 2) 갈래별 능력 카드 ───────── */
  (function capability() {
    if (!$('c-tabs')) return;
    const C = {
      text: { g: ['초안 쓰기 — 메일·공지·소개 글', '요약·번역·말투 바꾸기', '아이디어 여러 개 내기'],
        w: ['배운 시점 이후 일은 모른다', '긴 계산·정확한 숫자에 약하다', '출처 없이도 그럴듯하게 말한다'],
        ex: '후기 120건을 붙여 넣고 불만 유형 정리 · 고객 문의 답장 초안', chk: '사실·숫자는 원자료와 대조, 넣는 자료에 개인정보가 없는지' },
      search: { g: ['최근 소식·가격·동향 찾기', '출처 링크를 함께 제시', '여러 글을 한 번에 요약'],
        w: ['검색된 글이 틀리면 그대로 옮긴다', '출처 내용을 잘못 요약하기도 한다', '광고·오래된 글이 섞일 수 있다'],
        ex: '경쟁 그래놀라 신제품·가격 조사 · 식품 관련 제도 변화 찾아보기', chk: '링크를 직접 열어 원문·날짜 확인 (6주 2차시 팩트체크)' },
      image: { g: ['분위기 시안을 빠르게 여러 장', '배경 바꾸기 등 사진 편집', '글로 설명하기 어려운 느낌 보여 주기'],
        w: ['그림 속 글자가 자주 깨진다', '실제 제품 모양을 정확히 재현하기 어렵다', '손·작은 부분이 어색할 수 있다'],
        ex: '추석 선물 세트 배너 시안 · SNS 게시물 배경 그림', chk: '실존 인물·상표·저작권 (11주 3차시), AI 생성 표시' },
      av: { g: ['짧은 영상 클립·움직임 시안', '받아쓰기(회의 녹음 → 글)', '글 읽어 주기·음성 대화'],
        w: ['길고 일관된 영상은 아직 어렵다', '서비스·요금제마다 제공 여부가 다르다', '받아쓰기에서 고유명사가 틀리기 쉽다'],
        ex: '신제품 숏폼 장면 시안 · 매장 안내 방송 음성', chk: '실제 사람의 얼굴·목소리 흉내 금지 — 딥페이크 (13주), 녹음 전 동의' },
      doc: { g: ['보고서·기획서 뼈대 잡기', '발표 슬라이드 개요·문장 다듬기', '긴 문서 요약, 표로 정리'],
        w: ['회사 사정·실제 숫자는 모른다', '원문에 없는 내용을 끼워 넣기도 한다', '디자인은 손볼 곳이 많다'],
        ex: '월간 실적 보고 발표 개요 · 회의록을 보고서 형식으로', chk: '최종 문서는 내가 처음부터 끝까지 읽고 고친다' },
    };
    const pick = tabs('c-tabs', (k) => {
      $('c-good').innerHTML = C[k].g.map((x) => `<li>${x}</li>`).join('');
      $('c-weak').innerHTML = C[k].w.map((x) => `<li>${x}</li>`).join('');
      $('c-ex').textContent = C[k].ex; $('c-chk').textContent = C[k].chk;
    });
    pick('text');
  })();

  /* ───────── 3) 세 가지 질문으로 고르기 ───────── */
  (function decide() {
    if (!$('d-q1')) return;
    const Q1 = [['text', '글·표'], ['image', '그림'], ['av', '영상·소리'], ['doc', '문서·발표 자료']];
    const Q2 = [['yes', '예, 필요하다'], ['no', '아니요']];
    const Q3 = [['yes', '예, 있다'], ['no', '아니요, 없다']];
    const st = { q1: null, q2: null, q3: null };
    function group(id, opts, key) {
      const w = $(id).querySelector('.opts2');
      opts.forEach(([v, t]) => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => { w.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); st[key] = v; render(); });
        w.appendChild(b);
      });
    }
    group('d-q1', Q1, 'q1'); group('d-q2', Q2, 'q2'); group('d-q3', Q3, 'q3');
    const TOOL = {
      text: '수업에서는: Gemini 또는 Claude (둘 다 가능)',
      search: '수업에서는: Gemini 또는 Claude의 웹 검색 — 답 속 링크를 꼭 열어 보기',
      image: '수업에서는: Gemini (Claude는 그림을 생성하지 않음)',
      av: '수업에서는: 장면 구성·대본은 Gemini 또는 Claude로. 영상 생성은 서비스·요금제에 따라 다름',
      doc: '수업에서는: Gemini 또는 Claude로 개요·초안 → 발표 프로그램에서 마무리 (12주 2차시)',
    };
    function render() {
      $('d-q2').classList.toggle('off', !st.q1);
      $('d-q3').classList.toggle('off', !st.q2);
      if (!st.q1) return;
      let k = st.q1;
      if (st.q2 === 'yes' && (k === 'text' || k === 'doc')) k = 'search';
      const c = CAT[k];
      $('d-ic').innerHTML = ic(c.ic); $('d-ic').className = 'ic-badge' + (k === 'image' ? ' o' : '');
      $('d-h').textContent = '추천: ' + c.n;
      const why = { text: '글을 만들거나 다듬는 일 — 대화형 텍스트가 가장 잘 맞습니다.', search: '최신 정보·출처가 필요하므로 <strong>검색 결합</strong> 기능을 켜고 씁니다.', image: '결과물이 그림 — 이미지 생성 도구로 시안을 만듭니다.', av: '결과물이 영상·소리 — 먼저 장면·대본을 글로 기획하고, 생성 도구는 그다음.', doc: '문서·발표 자료 — 뼈대와 초안을 AI로, 마무리는 사람이.' };
      let d = why[k];
      if (st.q2 === 'yes' && (st.q1 === 'image' || st.q1 === 'av')) d += ' 최신 정보가 들어가야 한다면 <strong>검색 결합으로 먼저 사실을 확인</strong>한 뒤 만듭니다.';
      $('d-d').innerHTML = d; $('d-tool').textContent = TOOL[k];
      const s = $('d-st');
      if (!st.q3) { s.hidden = true; return; }
      s.hidden = false;
      if (st.q3 === 'yes') { s.className = 'status bad'; s.innerHTML = '<b class="k">잠깐! 그대로 넣지 마세요</b>개인정보는 지우거나 가명처리하고, 회사 기밀은 <strong>담당자 허락</strong>을 먼저 받습니다 (1주 3차시). 어떤 도구든 같습니다.'; }
      else { s.className = 'status ok'; s.innerHTML = '<b class="k">진행해도 좋습니다</b>결과는 그대로 쓰지 말고 <strong>사실·숫자·표현을 확인</strong>한 뒤 사용합니다.'; }
    }
    render();
  })();

  /* ───────── 4) 업무 매칭 ───────── */
  (function matching() {
    const wrap = $('mcards'); if (!wrap) return;
    const T = [
      { n: '후기 120건에서 불만 유형 정리', a: 'text', ex: '후기를 붙여 넣고 분류·요약 → 대화형 텍스트. 가상 자료라 넣어도 됨.' },
      { n: '이번 달 경쟁 그래놀라 신제품·가격 조사', a: 'search', ex: '최신 정보·출처가 필요 → 검색 결합. 링크를 열어 날짜 확인.' },
      { n: '추석 선물 세트 SNS 배너 시안', a: 'image', ex: '결과물이 그림 → 이미지 생성(수업에선 Gemini). 글자 깨짐 확인.' },
      { n: '매장 안내 방송 문구를 음성으로', a: 'av', ex: '글 → 소리 → 음성. 문구 자체는 대화형 텍스트로 먼저 다듬기.' },
      { n: '월간 실적 보고 발표 슬라이드 개요', a: 'doc', ex: '발표 자료의 뼈대 → 문서·발표 보조. 숫자는 원자료에서 직접.' },
      { n: '고객 문의 메일 답장 초안', a: 'text', ex: '짧은 업무 글 → 대화형 텍스트. 고객 이름·연락처는 빼고 넣기.' },
      { n: '신제품 15초 숏폼 장면 시안', a: 'av', ex: '움직이는 결과물 → 영상. 장면 구성은 글로 먼저 기획(11주).' },
      { n: '식품 포장 표시에 관한 최신 규정 확인', a: 'search', ex: '규정은 최신성이 중요 → 검색 결합 + 반드시 공식 기관 원문 확인.' },
    ];
    let right = 0, done = 0;
    T.forEach((t) => {
      const c = document.createElement('div'); c.className = 'mcard';
      c.innerHTML = `<div class="nm">${t.n}</div><div class="bt">${CATS.map((k) => `<button type="button" data-k="${k.k}" aria-label="${k.n}" title="${k.n}">${ic(k.ic)}</button>`).join('')}</div><div class="ex"></div>`;
      c.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        if (c.classList.contains('done')) return;
        const ok = b.dataset.k === t.a; done++; if (ok) right++;
        c.querySelectorAll('button').forEach((x) => { x.disabled = true; if (x.dataset.k === t.a) x.classList.add('right'); });
        if (!ok) b.classList.add('wrong');
        c.classList.add('done', ok ? 'ok' : 'no');
        c.querySelector('.ex').innerHTML = `<strong style="color:${ok ? 'var(--ok)' : 'var(--accent-2)'}">${ok ? '맞음' : '정답: ' + CAT[t.a].n}</strong> · ${t.ex}`;
        $('m-score').textContent = `${right} / ${T.length} 맞힘` + (done === T.length ? ' · 완료!' : '');
      }));
      wrap.appendChild(c);
    });
  })();
})();
