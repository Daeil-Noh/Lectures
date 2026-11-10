// 12주 1차시 전용: 이야기 조립기, 사실 vs 꾸민 이야기 카드, 내 목소리로 다듬기
(function () {
  const $ = (id) => document.getElementById(id);

  /* ───────── 1) 이야기 조립기 ───────── */
  (function storyBuilder() {
    const wrap = $('sb'); if (!wrap) return;
    // 문장은 미리 써 둔 예시. ev = 근거(사실 메모 번호), 없으면 null
    const rows = [
      { k: 's', lab: '상황', sub: '누구의 이야기?', opts: [
        { id: 'a', t: '바쁜 아침, 아이를 둔 부모', s: '아침마다 아이에게 무엇을 먹일지 고민하는 부모가 있습니다.', ev: '메모 10·11', hero: true },
        { id: 'b', t: '부산 여행 중인 여행자', s: '부산 여행 중 작은 매장에 들른 여행자가 있습니다.', ev: '메모 1·12', hero: true },
        { id: 'c', t: '2010년 창업한 바다결', s: '바다결은 2010년 창업 이래 업계를 이끌어 왔습니다.', ev: null, hero: false, why: '창업 연도 기록 없음 + 회사가 주인공' } ] },
      { k: 'p', lab: '문제', sub: '무엇이 불편한가?', opts: [
        { id: 'a', t: '너무 단 시리얼, 긴 하루', s: '시리얼은 너무 달고, 그냥 보내기엔 하루가 깁니다.', ev: '메모 11' },
        { id: 'b', t: '집에선 다시 찾기 어려운 맛', s: '집에 돌아오니 여행지에서 맛본 간식을 다시 찾기 어렵습니다.', ev: '메모 12' },
        { id: 'c', t: '사라질 위기의 할머니 비법', s: '해녀였던 할머니의 비법은 사라질 위기에 놓였습니다.', ev: null, why: '가족사·비법 기록 없음' } ] },
      { k: 't', lab: '전환', sub: '바다결이 돕는 순간', opts: [
        { id: 'a', t: '단맛을 줄인 그래놀라', s: '그때 만난 것이 단맛을 줄인 바다결 그래놀라였습니다.', ev: '메모 5' },
        { id: 'b', t: '매장의 맛을 자사몰에서', s: '매장에서 먹어 본 그 맛을 바다결 자사몰에서 다시 주문할 수 있었습니다.', ev: '메모 4·8' },
        { id: 'c', t: '국내 최초 특허 기술', s: '국내 최초 특허 기술로 만든 기적의 간식이 탄생했습니다.', ev: null, why: '‘최초’·특허 근거 없음' } ] },
      { k: 'r', lab: '결과', sub: '주인공은 어떻게?', opts: [
        { id: 'a', t: '아이도 잘 먹는 아침', s: '이제 아이들도 잘 먹는 아침이 되었고, 다시 주문하는 집이 늘었습니다.', ev: '메모 10' },
        { id: 'b', t: '여행의 기억이 식탁으로', s: '여행의 기억이 집 식탁 위에서 이어집니다.', ev: '메모 12' },
        { id: 'c', t: '전국 판매 1위 브랜드', s: '바다결은 전국 판매 1위 브랜드가 되었습니다.', ev: null, why: '순위 근거 없음 + 회사가 주인공' } ] },
    ];
    const sel = {};
    rows.forEach((r) => {
      const row = document.createElement('div'); row.className = 'sb-row';
      row.innerHTML = `<div class="sb-lab">${r.lab}<small>${r.sub}</small></div>`;
      r.opts.forEach((o) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'pick'; b.setAttribute('aria-pressed', 'false');
        b.textContent = o.t;
        b.addEventListener('click', () => {
          row.querySelectorAll('.pick').forEach((x) => x.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true'); sel[r.k] = o; update();
        });
        row.appendChild(b);
      });
      wrap.appendChild(row);
    });
    const setChk = (id, state, v) => {
      const e = $(id); e.className = 'chk-row' + (state === true ? ' ok' : state === false ? ' no' : '');
      e.querySelector('.mk').textContent = state === true ? '✓' : state === false ? '✕' : '?';
      e.querySelector('.v').textContent = v || '';
    };
    function update() {
      const chosen = rows.map((r) => sel[r.k]).filter(Boolean);
      const story = $('sb-story');
      story.innerHTML = chosen.length
        ? rows.map((r) => sel[r.k] ? (sel[r.k].ev ? sel[r.k].s : `<span class="bad">${sel[r.k].s}</span>`) : '<span class="ph">( … )</span>').join(' ')
        : '<span class="ph">줄마다 카드를 하나씩 고르면 여기에 이야기가 완성됩니다.</span>';
      // 주인공
      if (!sel.s) setChk('ck-hero', null, '');
      else setChk('ck-hero', sel.s.hero && !(sel.r && sel.r.id === 'c'), sel.s.hero ? (sel.r && sel.r.id === 'c' ? '결과가 회사 자랑' : '고객') : '회사');
      // 근거
      const nEv = chosen.filter((o) => o.ev).length;
      const noEv = chosen.filter((o) => !o.ev);
      setChk('ck-fact', !chosen.length ? null : noEv.length ? false : chosen.length === 4 ? true : null, chosen.length ? `${nEv} / ${chosen.length}문장` : '');
      // 줄기
      const ids = new Set(chosen.filter((o) => o.ev).map((o) => o.id));
      setChk('ck-flow', chosen.length < 4 ? (ids.size > 1 ? false : null) : (ids.size === 1 && !noEv.length), ids.size > 1 ? '두 이야기가 섞임' : '');
      const msg = $('sb-msg');
      if (noEv.length) msg.innerHTML = `빨간 문장은 <strong>근거가 없습니다</strong> — ${noEv.map((o) => o.why).join(', ')}. AI가 자주 끼워 넣는 유형입니다.`;
      else if (ids.size > 1) msg.innerHTML = '문장마다 사실이지만 <strong>주인공이 바뀌었습니다</strong>. 한 사람의 이야기로 이어지게 골라 보세요.';
      else if (chosen.length === 4) msg.innerHTML = `<strong>완성!</strong> 고객이 주인공이고, 네 문장 모두 근거(${chosen.map((o) => o.ev).join(' / ')})가 있습니다.`;
      else msg.innerHTML = '근거는 사실 메모 번호(메모 n)로 판정합니다. 나머지 줄도 골라 보세요.';
    }
    update();
  })();

  /* ───────── 2) 사실 vs AI가 꾸민 이야기 ───────── */
  (function factCards() {
    const wrap = $('fcards'); if (!wrap) return;
    const items = [
      { ic: 'factory', n: '바다결은 부산에 본사와 생산 시설을 두고 있다.', k: 'yes', v: '사실 ✓', a: '근거: 사실 메모 1번 (회사 소개와 같음).' },
      { ic: 'user', n: '창업자는 해녀였던 할머니의 레시피를 이어받았다.', k: 'no', v: 'AI가 꾸민 이야기 ✕', a: '메모에 창업자 개인사가 없다. 실제 인물처럼 지어내면 거짓 광고가 될 수 있다.' },
      { ic: 'chat', n: '가장 많이 나온 후기는 “재구매했어요. 아이들도 잘 먹네요”다.', k: 'yes', v: '사실 ✓', a: '근거: 후기 120건 중 18건으로 가장 많다 (메모 10번).' },
      { ic: 'clock', n: '2015년 해운대의 작은 부엌에서 시작했다.', k: 'no', v: 'AI가 꾸민 이야기 ✕', a: '창업 연도·장소 기록이 없다. 그럴듯한 숫자일수록 의심한다.' },
      { ic: 'alert', n: '무가당 견과 믹스는 설탕이 전혀 없는 무설탕 제품이다.', k: 'mid', v: '오해 소지 △', a: '메모 6번: 당을 따로 넣지 않을 뿐, 견과 자체의 당은 있다. ‘무가당’과 ‘무설탕’은 다르다.' },
      { ic: 'map', n: '부산 여행 때 매장에서 먹어 보고 주문했다는 후기가 있다.', k: 'yes', v: '사실 ✓', a: '근거: 같은 문장의 후기 13건 (메모 12번).' },
      { ic: 'trend', n: '바다결 그래놀라는 국내 판매 1위다.', k: 'no', v: 'AI가 꾸민 이야기 ✕', a: '순위를 뒷받침할 자료가 없다. ‘1위·최초’는 근거 자료가 있을 때만.' },
      { ic: 'chart', n: '후기 10건 중 약 7건이 별점 4~5점이다.', k: 'yes', v: '사실 ✓', a: '근거: 120건 중 82건 = 약 68% (메모 9번). 반올림 표현도 원래 숫자와 맞는지 확인.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="ic-badge ${it.k === 'no' ? 'o' : ''}"><svg class="ic"><use href="#i-${it.ic}"/></svg></span><span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('fc-score').textContent = opened + ' / ' + items.length + ' 확인' + (opened === items.length ? ' — 사실 4 · 꾸민 이야기 3 · 오해 소지 1' : '');
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 3) 내 목소리로 다듬기 ───────── */
  (function voice() {
    const s = $('v-s'); if (!s) return;
    const S = [
      { l: '0단계 · AI 초안 그대로', hype: 5, ex: 2,
        h: '바다결과 함께라면 당신의 아침은 <span class="hype">놀랍도록 특별해집니다</span>! <span class="hype">엄선된</span> <span class="hype">최고급</span> 재료로 만든 <span class="hype">혁신적인</span> 그래놀라가 건강한 라이프스타일의 <span class="hype">새로운 기준</span>을 제시합니다. 지금 바로 경험해 보세요!',
        m: 'AI 초안은 <strong>어느 회사에나 붙일 수 있는</strong> 문장입니다. 빨간 표시는 근거 자료가 없는 꾸밈말. 슬라이더를 움직여 보세요.' },
      { l: '1단계 · 근거 없는 꾸밈말 빼기', hype: 0, ex: 1,
        h: '바다결과 함께라면 당신의 아침이 <span class="cut">놀랍도록 특별해집니다!</span> <span class="add">달라집니다.</span> <span class="cut">엄선된 최고급 재료로 만든 혁신적인</span> <span class="add">단맛을 줄인</span> 그래놀라가 <span class="cut">건강한 라이프스타일의 새로운 기준을 제시합니다.</span> <span class="add">아침 식사를 돕습니다.</span> 지금 바로 경험해 보세요!',
        m: '‘엄선·최고급·혁신’은 증명할 자료가 없습니다. 대신 <strong>사실(단맛을 줄임, 메모 5)</strong>로 바꿨습니다.' },
      { l: '2단계 · 고객의 장면 넣기', hype: 0, ex: 1,
        h: '<span class="add">아침마다 아이에게 무엇을 먹일지 고민하셨나요?</span> 단맛을 줄인 바다결 그래놀라<span class="add">는 “바삭하고 많이 달지 않아서 아침에 먹기 좋다”는 이야기를 자주 듣습니다.</span> 지금 바로 경험해 보세요!',
        m: '막연한 ‘당신’ 대신 <strong>구체적인 고객의 장면</strong>과 <strong>후기 속 실제 말</strong>을 넣었습니다.' },
      { l: '3단계 · 우리 말투로 (담백·따뜻)', hype: 0, ex: 0,
        h: '아침마다 아이에게 무엇을 먹일지 고민하셨지요. 바다결 그래놀라는 단맛을 줄였습니다. “바삭하고 많이 달지 않아서 아침에 먹기 좋다”는 후기를 자주 듣고, 다시 주문하는 집도 많습니다. <span class="add">내일 아침 한 그릇, 가볍게 시작해 보세요.</span>',
        m: '느낌표와 재촉하는 말을 빼고 <strong>담백한 권유</strong>로. 브랜드 말투를 정해 두면 글마다 일정해집니다.' },
      { l: '4단계 · 근거 표시 달기 (검토용)', hype: 0, ex: 0, refs: 3,
        h: '아침마다 아이에게 무엇을 먹일지 고민하셨지요. 바다결 그래놀라는 단맛을 줄였습니다<span class="src">[1]</span>. “바삭하고 많이 달지 않아서 아침에 먹기 좋다”는 후기를 자주 듣고<span class="src">[2]</span>, 다시 주문하는 집도 많습니다<span class="src">[3]</span>. 내일 아침 한 그릇, 가볍게 시작해 보세요.<div class="refs">[1] 사실 메모 5 · [2] 후기 15건 · [3] “재구매했어요…” 후기 18건 — reviews_2026.csv, 120건 중<br>검토용 표시: AI 초안을 바탕으로 담당자가 사실을 확인하고 고쳐 씀</div>',
        m: '근거 번호를 달아 두면 <strong>검토하는 사람이 바로 확인</strong>할 수 있습니다. 게시할 때 번호는 빼도 됩니다.' },
    ];
    const steps = $('v-steps').querySelectorAll('span');
    function update() {
      const i = +s.value, v = S[i];
      $('v-o').textContent = i + ' / 4';
      $('v-lbl').textContent = v.l;
      $('v-draft').innerHTML = v.h;
      $('v-hype').textContent = v.hype; $('v-hype').classList.toggle('o', v.hype > 0);
      $('v-ex').textContent = v.ex; $('v-ex').classList.toggle('o', v.ex > 0);
      $('v-msg').innerHTML = v.m;
      steps.forEach((e, k) => e.classList.toggle('on', k < i));
    }
    s.addEventListener('input', update);
    update();
  })();
})();
