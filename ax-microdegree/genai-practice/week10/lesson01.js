// 10주 1차시 전용: 세그먼트/페르소나 판정 카드, 후기 근거 고르기, 판매 단서 차트, 페르소나 빌더
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);

  /* ───────── 1) 세그먼트일까, 페르소나일까? ───────── */
  (function segCards() {
    const wrap = $('segcards'); if (!wrap) return;
    const items = [
      { ic: 'map', n: '부산·경남에 사는 20~30대 고객', k: 'seg', v: '세그먼트', a: '지역·나이라는 기준으로 나눈 고객 집단이다.' },
      { ic: 'user', n: '“서윤, 출근 전 5분 안에 아침을 해결하고 싶다. 너무 단 건 싫다.”', k: 'per', v: '페르소나', a: '상황·목표·불편이 있는 한 사람으로 그렸다.' },
      { ic: 'reset', n: '자사몰에서 두 번 이상 구매한 고객', k: 'seg', v: '세그먼트', a: '구매 횟수(행동)로 나눈 집단이다.' },
      { ic: 'check', n: '“민재, 선물을 고를 때 포장부터 본다. 받는 사람이 부담스럽지 않은 가격을 찾는다.”', k: 'per', v: '페르소나', a: '구매 이유와 불편이 구체적인 한 사람이다.' },
      { ic: 'factory', n: '오프라인 매장 방문 고객', k: 'seg', v: '세그먼트', a: '구매 채널로 나눈 집단이다.' },
      { ic: 'alert', n: '“20대 여성은 모두 다이어트 중이다”', k: 'no', v: '둘 다 아님 — 고정관념', a: '근거 없이 나이·성별로 사람을 단정했다. 페르소나에 넣지 않는다.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="ic-badge ${it.k === 'per' ? 'o' : ''}"><svg class="ic"><use href="#i-${it.ic}"/></svg></span><span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('seg-score').textContent = opened + ' / ' + items.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 2) 후기 근거 고르기 ───────── */
  (function reviewPicker() {
    const wrap = $('rchips'); if (!wrap) return;
    const SLOTS = [['sit', '상황'], ['goal', '목표'], ['pain', '불편'], ['ch', '채널'], ['why', '구매 이유']];
    // 건수·별점은 reviews_2026.csv 에서 계산한 값
    const R = [
      { t: '바삭하고 많이 달지 않아서 아침에 먹기 좋아요', n: 15, s: 4.5, fill: { sit: '아침 식사', goal: '덜 단 간편식' }, k: 'ok', m: '<b class="k">좋은 근거</b>상황(아침)과 목표(덜 단 간편식)를 한 번에 채웁니다. 15건이나 나온 문장입니다.' },
      { t: '부산 여행 때 매장에서 먹어 보고 주문했어요', n: 13, s: 4.5, fill: { ch: '매장 체험 → 온라인 주문', why: '직접 맛본 경험' }, k: 'ok', m: '<b class="k">좋은 근거</b>채널(매장 → 온라인)과 구매 이유(맛본 경험)가 보입니다.' },
      { t: '포장이 꼼꼼해서 선물하기 좋았습니다', n: 13, s: 4.5, fill: { why: '선물용 포장' }, k: 'ok', m: '<b class="k">좋은 근거</b>구매 이유(선물) — “선물을 고르는 사람”이라는 또 다른 페르소나의 단서도 됩니다.' },
      { t: '생각보다 양이 적어요', n: 7, s: 1.7, fill: { pain: '양에 비해 아쉬움' }, k: 'ok', m: '<b class="k">좋은 근거 (불편)</b>별점이 낮은 후기도 소중합니다. 7건 모두 오프라인 매장 후기라는 점도 단서입니다.' },
      { t: '가격이 조금 부담됩니다', n: 3, s: 1.3, fill: { pain: '가격 부담' }, k: 'ok', m: '<b class="k">근거 (불편)</b>3건으로 적지만 망설이는 이유를 보여 줍니다. 건수가 적다는 점도 함께 적어 둡니다.' },
      { t: '조금 딱딱해서 우유에 오래 불려야 해요', n: 6, s: 1.8, fill: { pain: '딱딱한 식감' }, k: 'ok', m: '<b class="k">근거 (불편)</b>“바쁜 아침”과 부딪히는 불편입니다. 카피에서 “바로 먹는다”고 쓰면 안 되는 이유가 됩니다.' },
      { t: '재구매했어요. 아이들도 잘 먹네요', n: 18, s: 4.6, fill: {}, k: 'mid', warn: true, m: '<b class="k">다른 고객의 근거</b>가장 많은 후기지만 <strong>아이를 키우는 가족 고객</strong>의 목소리로 보입니다. 지금의 주 고객을 알려 주는 단서 — 20~30대 신규 고객 페르소나에 그대로 넣으면 안 됩니다.' },
      { t: '배송이 빨랐어요', n: 14, s: 4.4, fill: {}, k: 'mid', warn: true, m: '<b class="k">구분에는 약한 근거</b>누구나 좋아하는 점이라 이 고객만의 특징을 알려 주지 않습니다.' },
      { t: '문의 답변이 늦었어요', n: 6, s: 1.3, fill: {}, k: 'mid', warn: true, m: '<b class="k">운영 개선 과제</b>페르소나보다 고객 응대(9주 업무 자동화)에서 다룰 문제입니다.' },
      { t: '유통기한이 짧게 남은 제품이 왔어요', n: 4, s: 1.3, fill: {}, k: 'mid', warn: true, m: '<b class="k">운영 개선 과제</b>품질·재고 관리 문제입니다. 페르소나의 특징이 아닙니다.' },
    ];
    const on = new Set();
    const slotsEl = $('slots');
    function renderSlots() {
      slotsEl.innerHTML = '';
      SLOTS.forEach(([k, lbl]) => {
        const vals = R.filter((r, i) => on.has(i) && r.fill[k]).map((r) => r.fill[k]);
        const d = document.createElement('div');
        d.className = 'slot' + (vals.length ? ' fill' : '');
        d.innerHTML = `<b>${lbl}</b><span>${vals.length ? vals.join(' · ') : '아직 근거 없음'}</span>`;
        slotsEl.appendChild(d);
      });
    }
    R.forEach((r, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'rchip' + (r.warn ? ' warnc' : ''); b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="t">“${r.t}”</span><span class="m">${r.n}건 · 평균 ★${r.s.toFixed(1)}</span>`;
      b.addEventListener('click', () => {
        const now = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', now);
        now ? on.add(i) : on.delete(i);
        const st = $('rv-st');
        const filled = SLOTS.filter(([k]) => R.some((x, j) => on.has(j) && x.fill[k])).length;
        if (now) { st.className = 'status ' + r.k; st.innerHTML = r.m; }
        else { st.className = 'status mid'; st.innerHTML = '<b class="k">선택 해제</b>다른 후기도 눌러 보세요.'; }
        if (filled === 5 && now && r.k === 'ok') st.innerHTML += ' <strong>다섯 칸이 모두 근거로 채워졌습니다!</strong>';
        renderSlots();
      });
      wrap.appendChild(b);
    });
    renderSlots();
  })();

  /* ───────── 3) 판매 기록의 단서 ───────── */
  (function salesClues() {
    const svg = $('salesplot'); if (!svg) return;
    const M = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월'];
    // sales_2026.csv 에서 python3 로 계산한 월별 합계 (모든 채널)
    const D = {
      seaweed: { name: '미역귀 현미칩 판매량', unit: '개', v: [838, 800, 842, 856, 852, 1087, 1017, 1061, 837], hl: [5, 6, 7],
        lbl: '여름(6~8월) 평균 vs 1~5월 평균', val: '+26%', msg: '여름 석 달에 평균 <strong>1,055개</strong>, 1~5월 평균 838개보다 많이 팔렸습니다.', q: '단서: 여름 나들이·휴가 간식? → 이유는 데이터에 없으니 <strong>가설</strong>입니다.' },
      gift: { name: '선물 세트 판매량', unit: '개', v: [314, 286, 158, 156, 157, 168, 157, 171, 332], hl: [0, 1, 8],
        lbl: '1·2·9월 평균 vs 나머지 달 평균', val: '약 2배', msg: '1·2·9월 평균 <strong>311개</strong>, 나머지 달 평균 161개. 명절이 있는 달에 몰립니다.', q: '단서: “선물을 고르는 사람”도 하나의 페르소나가 될 수 있습니다.' },
      mall: { name: '자사몰 매출', unit: '만 원', v: [1254, 1258, 1018, 1227, 1223, 1297, 1251, 1409, 1592], hl: [7, 8],
        lbl: '9월 vs 1월 자사몰 매출', val: '+27%', msg: '자사몰 매출이 8~9월에 늘어 9월 <strong>1,592만 원</strong>(1월 1,254만 원).', q: '단서: 온라인으로 다시 찾는 고객이 늘었을까? → 누가 늘었는지는 <strong>확인 필요</strong>.' },
      orig: { name: '오리지널 그래놀라 판매량', unit: '개', v: [1159, 1104, 1174, 1191, 1181, 1150, 1226, 1208, 1288], hl: [],
        lbl: '전체 판매량 중 비중 (1~9월)', val: '34%', msg: '9개월 동안 <strong>10,681개</strong>로 가장 많이 팔린 제품. 달마다 큰 변화 없이 꾸준합니다.', q: '단서: 처음 사 보는 고객에게 권할 “대표 제품” 후보입니다.' },
    };
    const L = 70, R = 620, T = 30, B = 340;
    const grid = el('g', {}, svg), bars = el('g', {}, svg), labels = el('g', {}, svg);
    const title = el('text', { x: L, y: 20, class: 'p-lab' }, svg);
    function draw(k) {
      const d = D[k];
      const max = Math.max(...d.v) * 1.15;
      const Y = (v) => B - v / max * (B - T);
      grid.innerHTML = ''; bars.innerHTML = ''; labels.innerHTML = '';
      const step = max > 1500 ? 500 : max > 600 ? 200 : 100;
      for (let v = 0; v <= max; v += step) {
        el('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), class: 'p-grid' }, grid);
        el('text', { x: L - 10, y: Y(v) + 4, 'text-anchor': 'end', class: 'p-tick' }, grid).textContent = v.toLocaleString();
      }
      el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis' }, grid);
      const w = (R - L) / 9;
      d.v.forEach((v, i) => {
        const x = L + i * w + w * 0.18, bw = w * 0.64;
        const hot = d.hl.includes(i);
        el('rect', { x, y: Y(v), width: bw, height: B - Y(v), rx: 6, fill: hot ? 'var(--accent-2)' : 'var(--accent)', 'fill-opacity': hot ? 1 : 0.55 }, bars);
        el('text', { x: x + bw / 2, y: Y(v) - 7, 'text-anchor': 'middle', class: 'p-tick', style: 'font-weight:700' + (hot ? ';fill:var(--accent-2)' : '') }, labels).textContent = v.toLocaleString();
        el('text', { x: x + bw / 2, y: B + 22, 'text-anchor': 'middle', class: 'p-tick' }, labels).textContent = M[i];
      });
      title.textContent = d.name + ' (' + d.unit + ', 2026년 1~9월)';
      $('sp-lbl').textContent = d.lbl; $('sp-val').textContent = d.val;
      $('sp-msg').innerHTML = d.msg; $('sp-q').innerHTML = d.q;
      document.querySelectorAll('#sales-btns .btn').forEach((b) => b.setAttribute('aria-pressed', b.dataset.k === k));
    }
    document.querySelectorAll('#sales-btns .btn').forEach((b) => b.addEventListener('click', () => draw(b.dataset.k)));
    draw('seaweed');
  })();

  /* ───────── 4) 페르소나 빌더 ───────── */
  (function builder() {
    const wrap = $('pb'); if (!wrap) return;
    // t: e=근거(데이터에 있음), h=가설(확인 필요), s=고정관념(근거 없는 일반화)
    const G = [
      { k: 'sit', h: '상황 — 언제 필요해지나?', o: [
        { v: '출근·등교 전 바쁜 아침', t: 'e', src: '후기 “아침에 먹기 좋아요” 15건' },
        { v: '부산 여행 중 매장에 들렀다', t: 'e', src: '후기 13건' },
        { v: '혼자 사는 1인 가구', t: 'h', src: '데이터에 없음 → 설문으로 확인' },
        { v: '20대라서 늘 다이어트 중', t: 's', src: '나이로 단정' } ] },
      { k: 'goal', h: '목표 — 무엇을 원하나?', o: [
        { v: '간단하고 너무 달지 않은 한 끼', t: 'e', src: '후기 “많이 달지 않아서” 15건' },
        { v: '부담 없는 선물 고르기', t: 'e', src: '후기 “선물하기 좋았습니다” 13건' },
        { v: 'SNS에 자랑할 ‘힙한’ 간식', t: 's', src: '세대 이미지로 단정' } ] },
      { k: 'pain', h: '불편 — 무엇이 걸리나?', o: [
        { v: '양에 비해 가격이 부담', t: 'e', src: '“양이 적어요” 7건 · “가격 부담” 3건' },
        { v: '딱딱해서 오래 불려야 함', t: 'e', src: '후기 6건' },
        { v: 'MZ는 브랜드 충성도가 없다', t: 's', src: '세대 이미지로 단정' } ] },
      { k: 'ch', h: '채널 — 어디서 보고 사나?', o: [
        { v: '온라인 검색 후 구매', t: 'e', src: '판매량 47% 오픈마켓 · 32% 자사몰' },
        { v: '매장에서 맛보고 온라인 재주문', t: 'e', src: '후기 13건' },
        { v: '짧은 영상으로 간식을 찾는다', t: 'h', src: '데이터에 없음 → 반응 비교로 확인' },
        { v: '20~30대는 인스타그램만 본다', t: 's', src: '세대 이미지로 단정' } ] },
      { k: 'why', h: '구매 이유 — 결국 왜 고르나?', wide: true, o: [
        { v: '바삭하고 덜 단 맛', t: 'e', src: '후기 15건 · 평균 ★4.5' },
        { v: '꼼꼼한 포장', t: 'e', src: '후기 13건' },
        { v: '직접 맛본 경험', t: 'e', src: '후기 13건' },
        { v: '유행이면 무조건 산다', t: 's', src: '세대 이미지로 단정' } ] },
    ];
    const LBL = { sit: '상황', goal: '목표', pain: '불편', ch: '채널', why: '구매 이유' };
    const CHIP = { e: ['e', '근거'], h: ['h', '가설'], s: ['s', '고정관념'] };
    const pick = {};
    G.forEach((g) => {
      const d = document.createElement('div'); d.className = 'grp' + (g.wide ? ' wide' : '');
      d.innerHTML = `<div class="gh">${g.h}</div>`;
      const row = document.createElement('div'); row.className = 'opts2';
      g.o.forEach((o, i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.setAttribute('aria-pressed', 'false');
        b.dataset.g = g.k; b.dataset.i = i; b.textContent = o.v;
        b.addEventListener('click', () => { pick[g.k] = pick[g.k] === i ? undefined : i; render(); });
        row.appendChild(b);
      });
      d.appendChild(row); wrap.appendChild(d);
    });
    function render() {
      wrap.querySelectorAll('.opt').forEach((b) => b.setAttribute('aria-pressed', pick[b.dataset.g] === +b.dataset.i));
      let h = '', cnt = { e: 0, h: 0, s: 0 }, n = 0;
      G.forEach((g) => {
        const i = pick[g.k];
        if (i === undefined) { h += `<div class="prow"><b>${LBL[g.k]}</b><span class="v none">—</span><span></span></div>`; return; }
        const o = g.o[i]; cnt[o.t]++; n++;
        h += `<div class="prow"><b>${LBL[g.k]}</b><span class="v">${o.v}<br><span class="muted" style="font-size:12px;font-weight:400">${o.src}</span></span><span class="chip ${CHIP[o.t][0]}">${CHIP[o.t][1]}</span></div>`;
      });
      $('pcard-rows').innerHTML = h;
      const st = $('pb-st');
      if (!n) { st.className = 'status mid'; st.innerHTML = '<b class="k">칸을 채워 보세요</b>왼쪽에서 칸마다 하나씩 고릅니다.'; return; }
      if (cnt.s >= 3) { st.className = 'status bad'; st.innerHTML = `<b class="k">고정관념 경고 · ${cnt.s}칸</b>이 페르소나는 데이터가 아니라 <strong>세대·나이에 대한 흔한 이미지</strong>로 만들어졌습니다. 이대로 카피를 쓰면 실제 고객에게 닿지 않고, 고객을 불쾌하게 할 수도 있습니다 (2-3 편향).`; }
      else if (cnt.s) { st.className = 'status bad'; st.innerHTML = `<b class="k">고정관념 ${cnt.s}칸</b>빨간 표시 칸은 근거 없이 나이·세대로 단정한 내용입니다. 데이터에 있는 선택지로 바꿔 보세요.`; }
      else if (cnt.h) { st.className = 'status mid'; st.innerHTML = `<b class="k">가설 ${cnt.h}칸 · 근거 ${cnt.e}칸</b>가설은 써도 되지만 <strong>“확인 필요”</strong>로 표시하고, 확인할 방법을 함께 적습니다.`; }
      else if (n < 5) { st.className = 'status ok'; st.innerHTML = `<b class="k">근거 ${cnt.e}칸</b>좋습니다. 남은 ${5 - n}칸도 채워 보세요.`; }
      else { st.className = 'status ok'; st.innerHTML = '<b class="k">다섯 칸 모두 근거</b>데이터로 설명할 수 있는 페르소나입니다. 단, “20~30대”라는 점은 여전히 가설 — 확인할 방법을 정해 둡니다.'; }
    }
    function preset(list) { G.forEach((g, gi) => { pick[g.k] = list[gi]; }); render(); }
    $('pb-stereo').addEventListener('click', () => preset([3, 2, 2, 3, 3]));
    $('pb-evid').addEventListener('click', () => preset([0, 0, 0, 1, 0]));
    render();
  })();
})();
