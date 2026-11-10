// 10주 2차시 전용: 메시지 판정 카드, 톤·길이 슬라이더, 채널별 형식, 과장 표현 검사기
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ───────── 1) 메시지 후보 판정 ───────── */
  (function msgCards() {
    const wrap = $('msgcards'); if (!wrap) return;
    const items = [
      { ic: 'check', n: '“덜 달아서 매일 아침, 바다결 무가당 견과 믹스”', k: 'ok', v: '써도 좋다', a: '서윤의 고민(바쁜 아침·단 것 싫음)에 답하고, 후기라는 근거가 있다.' },
      { ic: 'alert', n: '“모두를 위한 최고의 건강 간식”', k: 'no', v: '고쳐야 한다', a: '“모두”는 아무에게도 닿지 않고, “최고”는 근거 없는 최상급 표현이다.' },
      { ic: 'x', n: '“먹기만 하면 살 빠지는 아침”', k: 'no', v: '쓰면 안 된다', a: '일반식품에 체중 감량 효과를 표방 — 건강기능식품 오인·과장 광고 우려.' },
      { ic: 'map', n: '“부산 매장에서 맛본 그 맛, 이제 집에서도”', k: 'ok', v: '써도 좋다', a: '“여행 중 매장에서 맛보고 주문” 후기 13건이 근거. 다른 장면의 좋은 메시지다.' },
      { ic: 'user', n: '“MZ라면 무조건 사는 힙한 간식”', k: 'no', v: '쓰면 안 된다', a: '세대 고정관념에 “무조건”이라는 과장까지. 10-1에서 걸러 낸 내용이다.' },
      { ic: 'clock', n: '“10년 전통, 부산 대표 간식 바다결”', k: 'mid', v: '사실 확인 먼저', a: '회사 자료에 없는 연혁이다. AI가 그럴듯하게 지어낸 것일 수 있다(2-3 환각).' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="ic-badge ${it.k !== 'ok' ? 'o' : ''}"><svg class="ic"><use href="#i-${it.ic}"/></svg></span><span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('msg-score').textContent = opened + ' / ' + items.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 2) 톤·길이 슬라이더 (미리 써 둔 9가지 카피) ───────── */
  (function tone() {
    const t = $('tone'), l = $('len'); if (!t) return;
    // C[톤][길이] — 숫자는 reviews_2026.csv(가상)에서 계산: 무가당 견과 믹스 후기 29건, 평균 4.0점, “아침에 먹기 좋아요” 7건
    const C = [
      [ { h: '오늘 아침, 바삭하게 시작해요', b: '많이 달지 않아 아침에 먹기 좋은 바다결 무가당 견과 믹스.', c: '자사몰에서 보기' },
        { h: '바쁜 아침엔 한 줌으로 가볍게', b: '출근 준비로 정신없는 아침, 요거트나 우유에 한 줌 올려 보세요.\n“많이 달지 않아서 아침에 먹기 좋아요” — 이 제품 후기에서 가장 많이 들은 말이에요.', c: '자사몰에서 주문하기' },
        { h: '바쁜 아침, 견과 믹스로 가볍게 시작하는 법', b: '아침마다 “뭐 먹지?” 고민하다 결국 거르는 날, 많죠.\n요거트나 우유에 바다결 무가당 견과 믹스를 한 줌 올리면 준비가 간단해요.\n이 제품 후기에서 가장 많이 들은 말은 “많이 달지 않아서 아침에 먹기 좋아요”였어요.\n부산 매장에서 먼저 맛보고 온라인으로 다시 주문해 주신 분들도 계세요.', c: '자사몰에서 13,500원에 만나 보기' } ],
      [ { h: '덜 달아서, 매일 아침', b: '부산에서 만든 바다결 무가당 견과 믹스 13,500원.', c: '제품 보러 가기' },
        { h: '견과가 넉넉한, 덜 단 아침 간식', b: '바다결 무가당 견과 믹스는 “견과가 넉넉하다”, “많이 달지 않다”는 후기를 자주 듣는 제품이에요.\n부산 매장에서 맛보고 온라인으로 다시 찾는 분들도 있어요.', c: '제품 자세히 보기' },
        { h: '덜 단 아침 간식을 찾는다면: 바다결 무가당 견과 믹스', b: '바다결은 부산에서 간식을 만드는 작은 회사예요.\n무가당 견과 믹스는 “많이 달지 않다”, “견과가 넉넉하다”는 후기를 자주 듣는 제품입니다.\n요거트·우유와 함께 아침으로, 출출한 오후에 간식으로 즐겨 보세요.\n성분과 원산지는 제품 페이지에서 확인할 수 있어요.', c: '제품 페이지에서 확인하기' } ],
      [ { h: '아침 한 줌, 담백하게', b: '이 제품 후기에서 가장 많이 나온 말 — “많이 달지 않아서 아침에 먹기 좋아요.”', c: '후기 보기' },
        { h: '아침을 간단하게, 맛은 담백하게', b: '바다결 무가당 견과 믹스(13,500원).\n후기 29건의 평균 별점은 4.0점, 가장 많이 나온 후기는 “많이 달지 않아서 아침에 먹기 좋아요”입니다.', c: '후기 전체 보기' },
        { h: '바다결 무가당 견과 믹스, 후기로 살펴보기', b: '2026년 1~9월 이 제품에 남겨진 후기는 29건, 평균 별점은 4.0점입니다.\n가장 많이 나온 후기는 “많이 달지 않아서 아침에 먹기 좋아요”(7건)였고, “견과가 넉넉하다”는 후기도 있었습니다.\n“맛은 괜찮은데 특별하진 않다”는 아쉬운 의견도 함께 소개합니다.', c: '후기 전체 보기' } ],
    ];
    const TN = ['친근함', '균형', '차분함'], LN = ['짧게', '보통', '길게'];
    const USE = ['문자·짧은 영상 캡션·배너에 맞는 길이', '인스타그램 피드 본문에 맞는 길이', '블로그·상세 페이지의 도입부에 맞는 길이'];
    const TONE = ['말을 거는 듯한 말투 — 공감을 얻기 쉽지만 가벼워 보일 수 있다', '정보와 친근함의 균형 — 처음 쓰는 기본 톤으로 무난하다', '숫자와 후기를 그대로 — 신뢰를 주지만 딱딱할 수 있다'];
    function render() {
      const ti = +t.value, li = +l.value, c = C[ti][li];
      $('tone-o').textContent = TN[ti]; $('len-o').textContent = LN[li];
      $('tone-post').innerHTML = `<div class="who"><i></i>바다결 (가상 계정)</div>${li > 0 ? '<div class="img" style="height:' + (li === 1 ? 110 : 70) + 'px">제품 사진 자리</div>' : ''}<div class="hl">${c.h}</div><div class="bd">${esc(c.b)}</div><div><span class="cta">${c.c}</span></div>`;
      $('tone-n').textContent = c.b.replace(/\n/g, ' ').length + '자';
      $('tone-msg').innerHTML = `<strong>${TN[ti]}</strong>: ${TONE[ti]}<br><strong>${LN[li]}</strong>: ${USE[li]}`;
    }
    t.addEventListener('input', render); l.addEventListener('input', render);
    render();
  })();

  /* ───────── 3) 채널별 형식 ───────── */
  (function channels() {
    const view = $('ch-view'); if (!view) return;
    const V = {
      feed: {
        html: `<div class="post" style="max-width:440px;margin:auto"><div class="who"><i></i>badagyeol_official (가상 계정)</div><div class="img" style="height:150px">정사각형 사진 — 요거트 위 견과 믹스</div><div class="bd"><b>바쁜 아침엔 한 줌으로 가볍게</b>
요거트나 우유에 한 줌 올려 보세요.
“많이 달지 않아서 아침에 먹기 좋아요” — 후기에서 가장 많이 들은 말이에요.
주문은 프로필 링크에서.</div><div class="tags">#아침간식 #견과믹스 #부산간식</div></div>`,
        r: [['사진이 먼저', '사진 한 장이 첫인상. 글보다 먼저 보인다'], ['첫 줄', '“더보기” 전에 보이는 첫 줄에 핵심 메시지'], ['해시태그', '제품·상황에 맞는 것 <b>3~5개</b>만. 관련 없는 인기 태그는 빼기'], ['CTA', '“프로필 링크에서”처럼 갈 곳 하나']] },
      short: {
        html: `<div style="display:flex;gap:22px;align-items:center;justify-content:center;width:100%"><div class="vframe">세로 영상 자리<div class="sub">덜 달아서, 매일 아침</div></div><div style="flex:1;max-width:300px;display:grid;gap:10px"><div class="muted" style="font-size:14px;font-weight:800">캡션 (영상 아래 글)</div><div class="post"><div class="bd">한 줌이면 아침 준비 끝? 요거트 위에 올려 봤어요.
#아침간식 #견과믹스</div></div><div class="muted" style="font-size:14px">영상 속 자막·말이 메시지의 중심. 대본·장면 구성은 11-2에서.</div></div></div>`,
        r: [['첫 장면', '처음 몇 초 안에 상황(바쁜 아침)을 보여 준다'], ['자막', '소리 없이 보는 사람도 있다 — 핵심 메시지를 자막으로'], ['캡션', '1~2줄 + 해시태그 2~3개. 길게 쓰지 않는다'], ['광고 표시', '협찬 영상이면 시작과 끝에 “광고” 표시']] },
      blog: {
        html: `<div class="post" style="max-width:520px;margin:auto"><div class="muted" style="font-size:13px;font-weight:800">블로그 글 (가상)</div><div class="hl">덜 단 아침 간식을 찾는다면: 바다결 무가당 견과 믹스</div><div class="bd" style="font-size:15px"><b>1. 아침마다 “뭐 먹지?”</b>
바쁜 아침, 간단하지만 너무 달지 않은 걸 찾는 분들께.
<b>2. 후기로 본 제품</b>
1~9월 후기 29건, 평균 별점 4.0점. 가장 많은 후기는 “많이 달지 않아서 아침에 먹기 좋아요”.
<b>3. 가격과 구매처</b>
13,500원 · 자사몰·오픈마켓·부산 매장</div><div class="img" style="height:46px">사진 2~3장 자리</div></div>`,
        r: [['검색어', '제목에 사람들이 찾는 말: “덜 단 아침 간식”'], ['구조', '소제목으로 나눠 훑어보기 쉽게'], ['정보', '가격·구매처·후기 숫자처럼 <b>확인한 사실</b>'], ['체험단 글', '대가를 받았다면 제목이나 첫 부분에 광고 표시']] },
      sms: {
        html: `<div style="display:grid;gap:10px;justify-items:center;width:100%"><div class="muted" style="font-size:14px;font-weight:800">문자 메시지 (가상 번호·가상 회사)</div><div class="sms">(광고) 바다결
덜 달아서 매일 아침, 무가당 견과 믹스 13,500원
자사몰에서 보기: (링크)
무료 수신거부 080-000-0000</div><div class="muted" style="font-size:14px">짧을수록 좋다 — 핵심 메시지 한 줄 + CTA 하나</div></div>`,
        r: [['동의', '광고 문자 수신에 <b>미리 동의한 사람</b>에게만'], ['맨 앞', '“(광고)”와 보내는 곳 이름으로 시작'], ['수신거부', '무료 수신거부 방법을 함께 적는다'], ['시간', '밤 9시~아침 8시는 별도 동의 필요']] },
    };
    function pick(k) {
      view.innerHTML = V[k].html;
      $('ch-rules').innerHTML = V[k].r.map(([a, b]) => `<div><b>${a}</b> · ${b}</div>`).join('') +
        '<div style="background:var(--accent-soft);border-color:transparent">채널이 바뀌어도 <b>핵심 메시지는 같다</b> — “덜 달아서 매일 아침”</div>';
      document.querySelectorAll('#ch-btns .btn').forEach((b) => b.setAttribute('aria-pressed', b.dataset.c === k));
    }
    document.querySelectorAll('#ch-btns .btn').forEach((b) => b.addEventListener('click', () => pick(b.dataset.c)));
    pick('feed');
  })();

  /* ───────── 4) 과장 표현 검사기 ───────── */
  (function checker() {
    const inp = $('chk-in'); if (!inp) return;
    // 수업용 간이 목록. k: bad=바꿔야 할 표현, mid=사실 확인 필요
    const RULES = [
      { re: /살\s?(이\s?)?빠지[는다고]*|살\s?빼[는주]*|다이어트(\s?(효과|간식|식품))?|체중\s?감량|체지방(\s?감소)?|지방\s?(분해|연소|흡수\s?차단)/g, k: 'bad', cat: '체중 감량 효과 표방', why: '일반식품을 건강기능식품처럼 오인하게 할 수 있다', fix: '“가볍게 즐기는 아침 간식”' },
      { re: /혈당|콜레스테롤|혈압|면역력?|변비|당뇨|피로\s?회복|해독|디톡스|노화\s?방지/g, k: 'bad', cat: '질병·건강 효능 연상', why: '질병 예방·치료나 기능성을 떠올리게 한다', fix: '빼기 — 맛·식감·먹는 상황으로' },
      { re: /치료|예방|약처럼|약보다|처방/g, k: 'bad', cat: '의약품 오인', why: '식품을 약처럼 보이게 한다', fix: '빼기' },
      { re: /100\s?%\s?건강|100\s?%|완벽한|무조건|누구나|기적의?/g, k: 'bad', cat: '절대·과장 표현', why: '모든 사람에게 항상 그렇다고 보장할 근거가 없다', fix: '“많이 달지 않다는 후기가 많은”' },
      { re: /건강해지[는다]*|건강을\s?지켜[주는]*|몸에\s?좋은/g, k: 'bad', cat: '건강 효과 단정', why: '몸에 대한 효과를 근거 없이 약속한다', fix: '“매일 아침 부담 없이”' },
      { re: /최고의?|최초|1위|가장\s?좋은|유일한|부산\s?대표/g, k: 'mid', cat: '최상급·순위', why: '객관적 근거(조사·출처)가 있을 때만 쓸 수 있다', fix: '근거가 없으면 빼기' },
      { re: /타사|다른\s?(회사|브랜드)|○○사/g, k: 'mid', cat: '다른 회사와 비교', why: '근거 없는 비교·비방은 금지 유형', fix: '우리 제품의 사실만' },
      { re: /당\s?0\s?g?|설탕\s?(0|제로)|무설탕|제로\s?슈거|저칼로리/g, k: 'mid', cat: '성분·수치 표현', why: '포장의 표시 내용과 같은지 확인해야 한다', fix: '포장 표시와 대조 후 사용' },
      { re: /오늘만|마감\s?임박|선착순|단\s?하루|\d+년\s?전통/g, k: 'mid', cat: '기한·연혁 주장', why: '사실이 아니면 소비자를 속이는 광고가 된다', fix: '실제 일정·회사 자료로 확인' },
    ];
    const SAMPLES = [
      '먹기만 해도 살 빠지는 아침 간식! 바다결 견과 믹스로 100% 건강한 하루를. 혈당 걱정 없는 최고의 선택, 오늘만 특가!',
      '면역력을 지켜 주는 부산 대표 그래놀라. 타사 제품보다 몸에 좋은 무설탕 간식, 다이어트 중이라면 무조건!',
      '덜 달아서 매일 아침. 요거트에 한 줌 올리면 준비 끝 — “많이 달지 않아서 아침에 먹기 좋아요”가 이 제품 후기에서 가장 많이 나온 말이에요. 무가당 견과 믹스 13,500원.',
    ];
    function run() {
      const s = inp.value;
      const hits = [];
      RULES.forEach((r, ri) => { r.re.lastIndex = 0; let m; while ((m = r.re.exec(s))) { if (m[0].trim()) hits.push({ a: m.index, b: m.index + m[0].length, t: m[0], r, ri }); } });
      hits.sort((x, y) => x.a - y.a || (y.b - y.a) - (x.b - x.a));
      const keep = []; let end = -1;
      hits.forEach((h) => { if (h.a >= end) { keep.push(h); end = h.b; } });
      let out = '', i = 0;
      keep.forEach((h) => { out += esc(s.slice(i, h.a)) + `<mark class="${h.r.k}">${esc(h.t)}</mark>`; i = h.b; });
      out += esc(s.slice(i));
      $('chk-out').innerHTML = out || '<span class="muted">카피를 입력하세요</span>';
      const nb = keep.filter((h) => h.r.k === 'bad').length, nm = keep.length - nb;
      $('chk-bad').textContent = nb; $('chk-mid').textContent = nm;
      $('chk-finds').innerHTML = keep.map((h) => `<div class="find ${h.r.k}"><b>“${esc(h.t)}”</b> · ${h.r.cat}<br>${h.r.why} → <span class="fix">${h.r.fix}</span></div>`).join('');
      const st = $('chk-st');
      if (!s.trim()) { st.className = 'status mid'; st.innerHTML = '<b class="k">입력 대기</b>예시를 고르거나 직접 써 보세요.'; }
      else if (nb) { st.className = 'status bad'; st.innerHTML = `<b class="k">바꿔야 할 표현 ${nb}곳</b>몸에 대한 효과·절대 표현을 빼고, 맛·상황·후기 같은 사실로 바꿔 보세요.`; }
      else if (nm) { st.className = 'status mid'; st.innerHTML = `<b class="k">확인할 것 ${nm}곳</b>근거 자료가 있으면 써도 되지만, 없으면 빼는 것이 안전합니다.`; }
      else { st.className = 'status ok'; st.innerHTML = '<b class="k">목록에 걸리는 표현 없음</b>그래도 검사기는 목록에 있는 말만 찾습니다. 가격·후기 숫자 확인과 광고 표시는 <strong>사람이 마지막으로</strong>.'; }
    }
    inp.addEventListener('input', run);
    inp.addEventListener('keydown', (e) => e.stopPropagation()); // 입력 중 슬라이드 넘김 방지
    document.querySelectorAll('.samples .btn[data-s]').forEach((b) => b.addEventListener('click', () => { inp.value = SAMPLES[+b.dataset.s]; run(); }));
    inp.value = SAMPLES[0];
    run();
  })();
})();
