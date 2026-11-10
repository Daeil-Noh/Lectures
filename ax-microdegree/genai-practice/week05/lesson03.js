// 5주 3차시 전용: 요약 종류 바꾸기, 원문 대조기, 교정 단계 토글
(function () {
  const $ = (id) => document.getElementById(id);
  const len = (t) => t.replace(/\n/g, '').length;   // 글자 수(공백 포함, 줄바꿈 제외)
  const ORIGINAL = 2000;                              // market_report.txt 본문 글자 수(공백 포함)

  /* ───────── 1) 요약 종류 × 읽는 사람 ───────── */
  (function summaries() {
    const tBox = $('s-type'), aBox = $('s-aud'); if (!tBox) return;
    const S = {
      one: {
        use: '<strong>한 줄 요약</strong>: 메신저 공유, 메일 제목, 회의 첫마디. 결론 하나만.',
        ceo: '20~30대는 작은 포장으로 먼저 맛보고 자사몰에서 다시 사는 경향이 있어, 저가 체험 상품과 자사몰 유도가 기회입니다.',
        staff: '젊은 손님은 처음엔 작은 포장으로 맛보고 싶어 하니, 작은 포장 제품과 자사몰 구매를 함께 안내하면 좋습니다.',
      },
      three: {
        use: '<strong>핵심 3가지</strong>: 회의 자료, 팀 공유. 서로 겹치지 않는 세 가지를 고른다.',
        ceo: '① 20~30대의 54%는 처음 사는 간식을 작은 포장으로 먼저 산다(3,000원 이하 선호 44%).\n② 자사몰 구매자의 재구매 비율(46%)이 오픈마켓(23%)의 두 배다.\n③ 다만 20~30대는 가격에 민감하고(1만 원 초과 제품은 “할인할 때만” 37%), 온라인 설문이라 한계가 있다.',
        staff: '① 젊은 손님 절반 이상은 처음 사는 간식을 작은 포장으로 고른다.\n② 매장이나 여행지에서 먹어 본 뒤 온라인으로 다시 주문하는 손님이 적지 않다.\n③ 자사몰에서 산 손님이 같은 브랜드를 다시 사는 경우가 많다.',
      },
      rep: {
        use: '<strong>보고용</strong>: 결정할 사람에게. 결론 → 근거 → 주의 → 제안 순서.',
        ceo: '[결론] 20~30대 신규 고객 확보에는 소용량 체험 상품과 자사몰 첫 구매 유도가 효과적일 것으로 보입니다.\n[근거] 20~30대의 54%가 처음엔 작은 포장을 사고, 자사몰 구매자의 재구매 비율은 46%로 오픈마켓(23%)의 두 배입니다.\n[주의] 가격 민감도가 높고, 온라인 설문이라 실제 행동과 다를 수 있습니다.\n[제안] 3,000원 이하 체험 상품을 검토하고, 12월 자사몰 구매 기록 분석으로 효과를 확인하겠습니다.',
        staff: '[결론] 처음 오는 젊은 손님에게는 작은 포장 제품을 먼저 권하면 좋습니다.\n[이유] 20~30대 절반 이상이 처음 사는 간식은 작은 포장으로 고르고, 먹어 본 뒤 온라인으로 다시 주문하기도 합니다.\n[주의] 가격에 민감한 편이라, 할인 소식을 함께 알려 주면 좋습니다.\n[할 일] 자사몰에서 다시 살 수 있다는 점을 함께 안내해 주세요.',
      },
    };
    const AUD = { ceo: '대표님', staff: '매장 직원' };
    const st = { type: 'three', aud: 'ceo' };
    function render() {
      tBox.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === st.type));
      aBox.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === st.aud));
      const t = S[st.type][st.aud];
      $('s-k').textContent = '예시 요약 — ' + AUD[st.aud] + '께 / ' + { one: '한 줄', three: '핵심 3가지', rep: '보고용' }[st.type];
      if (st.aud === 'staff') $('s-k').textContent = '예시 요약 — 매장 직원에게 / ' + { one: '한 줄', three: '핵심 3가지', rep: '보고용' }[st.type];
      $('s-txt').textContent = t;
      const n = len(t);
      $('s-n').textContent = n + '자';
      $('s-r').textContent = Math.round(n / ORIGINAL * 100) + '%';
      $('s-use').innerHTML = S[st.type].use + (st.aud === 'staff' ? ' 직원용은 숫자를 줄이고 <strong>할 일</strong> 중심.' : ' 대표님용은 <strong>숫자와 단서</strong>를 남긴다.');
    }
    tBox.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { st.type = b.dataset.v; render(); }));
    aBox.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { st.aud = b.dataset.v; render(); }));
    render();
  })();

  /* ───────── 2) 원문 대조기 ───────── */
  (function checker() {
    const srcBox = $('src'), sumBox = $('sums'); if (!srcBox) return;
    const SRC = [
      ['(2)', '20~30대는 ‘맛’(48%) 다음으로 ‘당 함량’(31%)을 보고 간식을 고른다고 답했다.'],
      ['(2)', '40대는 ‘원재료’를 가장 먼저 본다고 답했다.'],
      ['(3)', '20~30대 응답자 중 54%는 처음 사 보는 간식은 작은 포장으로 먼저 사 본다고 답했다.'],
      ['(4)', '구매 경로는 오픈마켓이 41%로 가장 많았다.'],
      ['(4)', '자사몰 구매자의 46%가 같은 브랜드 제품을 다시 샀다고 답한 반면, 오픈마켓 구매자는 23%였다.'],
      ['(5)', 'SNS에서 간식 정보를 얻는다는 응답은 20대 58%, 30대 39%, 40대 21%였다.'],
      ['4.', '20~30대는 가격에 민감했다. 1만 원이 넘는 간식은 “할인할 때만 산다”는 응답이 37%였다.'],
      ['4.', '이 조사는 온라인 설문이라 실제 구매 행동과 다를 수 있다.'],
    ];
    const MISSING = [6, 7];
    const SUM = [
      { t: '20~30대는 맛 다음으로 당 함량을 보고 간식을 고른다.', s: [0], m: '원문 (2)와 일치합니다.' },
      { t: '20~30대의 절반 이상은 처음 사는 간식을 작은 포장으로 먼저 사 본다.', s: [2], m: '원문 (3)의 54%를 “절반 이상”으로 줄였습니다. 뜻이 같습니다.' },
      { t: '자사몰 구매자의 재구매 비율은 오픈마켓의 두 배다.', s: [4], m: '46%와 23% — 두 배가 맞습니다. 계산한 표현은 숫자로 다시 확인합니다.' },
      { t: '20대의 절반 이상이 SNS에서 간식 정보를 얻는다.', s: [5], m: '원문 (5)의 20대 58%와 일치합니다. 30대(39%)까지 넓히면 틀린 말이 됩니다.' },
      { t: '따라서 바다결 체험팩은 20~30대에게 가장 인기 있는 상품이 될 것이다.', s: [], m: '' },
    ];
    const sEls = SRC.map(([no, t]) => { const d = document.createElement('span'); d.innerHTML = `<i>${no}</i>${t}`; srcBox.appendChild(d); return d; });
    const seen = new Set();
    const btns = SUM.map((it, k) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = it.t;
      b.addEventListener('click', () => {
        btns.forEach((x) => x.classList.remove('on', 'none'));
        sEls.forEach((e) => e.classList.remove('hit', 'miss'));
        seen.add(k); b.classList.add('seen');
        const st = $('c-st');
        if (it.s.length) {
          b.classList.add('on'); it.s.forEach((i) => sEls[i].classList.add('hit'));
          st.className = 'status ok'; st.innerHTML = '<b class="k">근거 있음</b>' + it.m;
        } else {
          b.classList.add('none');
          st.className = 'status bad'; st.innerHTML = '<b class="k">근거 없음 — 없는 말</b>원문 어디에도 이런 <strong>예측</strong>은 없습니다. 원문은 “첫 구매의 문턱을 낮출 수 있다”까지만 말합니다. “따라서”로 자연스럽게 이어 붙인 환각입니다.';
        }
        $('c-n').textContent = seen.size + ' / ' + SUM.length;
      });
      sumBox.appendChild(b); return b;
    });
    $('c-miss').addEventListener('click', () => {
      btns.forEach((x) => x.classList.remove('on', 'none'));
      sEls.forEach((e) => e.classList.remove('hit', 'miss'));
      MISSING.forEach((i) => sEls[i].classList.add('miss'));
      const st = $('c-st'); st.className = 'status mid';
      st.innerHTML = '<b class="k">빠진 것 2가지</b>가격 민감도(37%)와 조사의 한계가 요약에 없습니다. 체험팩 <strong>가격</strong>을 정할 때 꼭 필요한 단서입니다.';
    });
  })();

  /* ───────── 3) 교정 단계 토글 ───────── */
  (function proof() {
    const box = $('pf'); if (!box) return;
    // [분류, 원래, 고친 것] — 분류: sp 맞춤법·띄어쓰기, st 문체, cut 불필요한 표현
    const SEG = [
      ['sp', '이번주', '이번 주'], [null, ' 매장 시식 행사는 '], ['sp', '예정데로', '예정대로'], [null, ' '], ['st', '진행했음.', '진행했습니다.'],
      [null, ' 방문객 반응은 좋았고 특히 여행 오신 분들이 체험팩 가격을 많이 '], ['sp', '물어 보셨습니다.', '물어보셨습니다.'],
      [null, ' 다만 시식용 그래놀라가 '], ['sp', '이틀만에', '이틀 만에'], [null, ' 떨어져서 '], ['sp', '몇일은', '며칠은'], [null, ' 시식을 '], ['st', '하지 못했다.', '하지 못했습니다.'],
      [null, ' 다음 행사 때에는 시식용 물량을 '], ['cut', '미리 사전에', '미리'], [null, ' 넉넉하게 '], ['cut', '준비를 하도록 하겠습니다.', '준비하겠습니다.'],
      [null, ' 쿠폰 QR은 아직 안내판이 '], ['sp', '안되서', '안 돼서'], [null, ' 계산대에서 말로만 '], ['cut', '안내하는 부분이 있었습니다.', '안내했습니다.'],
    ];
    const REWRITE = '금주 진행된 매장 시식 이벤트는 성공적으로 마무리되었으며, 방문 고객들로부터 폭발적인 호응을 얻었습니다. 특히 체험팩에 대한 높은 관심은 향후 매출 증대로 이어질 것으로 기대됩니다. 일부 시식 물량이 조기 소진되었으나, 차기 행사에서는 체계적인 물량 관리로 고객 만족도를 극대화하겠습니다. QR 쿠폰 안내 역시 원활하게 진행되었으며, 앞으로도 고객 중심의 행사 운영을 위해 지속적으로 노력하겠습니다.';
    const on = { sp: false, st: false, cut: false, all: false };
    const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    function render() {
      const pb = $('pf-box'), st = $('pf-st');
      if (on.all) {
        pb.classList.add('rewrite');
        box.textContent = REWRITE;
        $('pf-n').textContent = '전부'; $('pf-c').textContent = len(REWRITE) + '자';
        st.className = 'status bad';
        st.innerHTML = '<b class="k">교정이 아니라 다시 쓰기</b>“폭발적”, “성공적” 과장, 원문에 없는 “매출 증대” 예측, 그리고 <strong>“QR 안내 원활”은 사실과 반대</strong>(안내판이 없었다). 글은 더 길어졌고, 내 말투도 사라졌습니다.';
        return;
      }
      pb.classList.remove('rewrite');
      let h = '', n = 0, plain = '';
      SEG.forEach(([c, a, b]) => {
        if (!c) { h += esc(a); plain += a; return; }
        if (on[c]) { h += `<span class="fx">${esc(b)}</span>`; plain += b; n++; }
        else { h += `<span class="er">${esc(a)}</span>`; plain += a; }
      });
      box.innerHTML = h;
      $('pf-n').textContent = n + '곳';
      $('pf-c').textContent = len(plain) + '자';
      const k = ['sp', 'st', 'cut'].filter((x) => on[x]).length;
      if (k === 0) { st.className = 'status mid'; st.innerHTML = '<b class="k">원래 초안</b>물결 밑줄이 고칠 후보입니다. 하나씩 켜 보세요.'; }
      else if (k < 3) { st.className = 'status mid'; st.innerHTML = `<b class="k">고치는 중</b>초록이 고친 곳. 아직 물결 밑줄이 남아 있습니다.`; }
      else { st.className = 'status ok'; st.innerHTML = '<b class="k">교정 완료</b>내용·사실·말투는 그대로, 틀린 곳과 군더더기만 고쳤습니다. 문제점(시식 물량, QR 안내판)도 그대로 남았습니다.'; }
    }
    document.querySelectorAll('.tgl[data-c]').forEach((b) => b.addEventListener('click', () => {
      const c = b.dataset.c, v = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', v); on[c] = v;
      render();
    }));
    render();
  })();
})();
