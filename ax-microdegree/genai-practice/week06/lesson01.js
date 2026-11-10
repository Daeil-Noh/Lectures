// 6주 1차시 전용: 좋은 조사 질문 카드, 조사 질문 나무, 웹 검색 켬/끔
(function () {
  const $ = (id) => document.getElementById(id);

  /* ───────── 1) 좋은 질문 vs 막연한 질문 (뒤집는 카드) ───────── */
  (function qcards() {
    const wrap = $('qcards'); if (!wrap) return;
    const items = [
      { n: '그래놀라 시장 어때?', k: 'no', v: '막연함', a: '대상·기간·지표가 없다. → “최근 3년 국내 그래놀라 시장 규모를 연도별로”' },
      { n: '최근 3년 국내 시리얼·그래놀라 시장 규모를 연도별로, 출처 기관·발표 연도와 함께 알려 줘', k: 'yes', v: '좋은 조사 질문', a: '기간·지역·지표·출처 요구까지 들어 있다.' },
      { n: 'MZ세대 트렌드 알려 줘', k: 'no', v: '막연함', a: '‘MZ’는 범위가 넓고, 무슨 트렌드인지 없다. → “20~30대의 간식 소비 트렌드”' },
      { n: '20~30대가 아침 대용 간식을 고를 때 보는 기준을 다룬 최근 2년 이내 조사 자료를 찾아 줘', k: 'yes', v: '좋은 조사 질문', a: '누구·무엇·언제가 분명하고, ‘조사 자료’를 찾게 한다.' },
      { n: '우리 그래놀라가 경쟁사보다 맛있어?', k: 'mid', v: 'AI에게 물을 게 아님', a: 'AI는 맛을 모른다. 후기 분석·시식 조사로 직접 확인한다.' },
      { n: '온라인에서 1만 원 안팎에 팔리는 그래놀라 5종의 가격·용량·특징을 표로, 확인한 날짜와 함께', k: 'yes', v: '좋은 조사 질문', a: '비교 대상·항목·형식이 정해져 있다. 가격은 바뀌므로 날짜까지.' },
      { n: '내년에 그래놀라가 대박 날까?', k: 'no', v: '막연함', a: '근거 없는 예측만 듣게 된다. → “성장 요인과 위험 요인을 근거와 함께”' },
      { n: '경쟁사 A사의 올해 내부 매출을 알려 줘', k: 'mid', v: 'AI에게 물을 게 아님', a: '비공개 정보다. AI가 숫자를 지어낼 위험이 크다.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="nm">“${it.n}”</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('qc-score').textContent = opened + ' / ' + items.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 2) 조사 질문 나무 ───────── */
  (function tree() {
    const br = $('tree-br'), opts = $('tr-opts'); if (!br) return;
    // q: good(좋은 조사 질문) / vague(막연함) / out(AI가 답할 수 없음)
    const B = [
      { k: 'size', name: '시장 규모', ic: 'chart', o: [
        { t: '그래놀라 시장은 커?', q: 'vague', why: '‘크다’의 기준이 없다. 기간·지표를 넣자.' },
        { t: '최근 3년 국내 시리얼·그래놀라 시장 규모는 연도별로 어떻게 변했나? (출처 기관·발표 연도 포함)', q: 'good', why: '기간·지역·지표·출처까지 분명하다.' },
        { t: '우리 그래놀라는 올해 몇 개 팔렸나?', q: 'out', why: '내부 데이터다. AI가 아니라 우리 판매 자료(sales_2026.csv)에서 계산한다.' },
      ] },
      { k: 'why', name: '성장 요인', ic: 'trend', o: [
        { t: '20~30대가 그래놀라를 사는 주된 이유는 무엇이고, 어떤 조사에서 나왔나?', q: 'good', why: '대상이 분명하고, 근거 조사까지 요구한다.' },
        { t: '요즘 왜 건강 간식이 인기야?', q: 'vague', why: '대상·제품이 넓다. 20~30대·그래놀라로 좁히자.' },
        { t: '그래놀라는 몸에 좋아?', q: 'vague', why: '사업 질문과 관계가 멀다. 구매 이유를 묻는 질문이 필요하다.' },
      ] },
      { k: 'comp', name: '경쟁', ic: 'layers', o: [
        { t: '경쟁사는 누구야?', q: 'vague', why: '어떤 시장의 경쟁인지 없다. 가격대·채널을 정하자.' },
        { t: '경쟁사 A사의 내부 원가는 얼마야?', q: 'out', why: '비공개 정보다. AI는 알 수 없고, 지어낼 위험이 있다.' },
        { t: '온라인에서 1만 원 안팎에 파는 그래놀라 5종의 가격·용량·특징을 표로 비교하면? (확인 날짜 포함)', q: 'good', why: '비교 대상·항목·형식·날짜가 정해져 있다.' },
      ] },
      { k: 'trend', name: '소비자 트렌드', ic: 'user', o: [
        { t: 'MZ세대 트렌드 알려 줘', q: 'vague', why: '범위가 넓고, 무엇의 트렌드인지 없다.' },
        { t: '내년에 그래놀라가 유행할까?', q: 'vague', why: '근거 없는 예측을 부른다. 지금의 근거 자료를 묻자.' },
        { t: '최근 1~2년 20~30대 간식 소비 트렌드 3가지와 각각의 근거 자료는?', q: 'good', why: '기간·대상·개수·근거까지 요구한다.' },
      ] },
    ];
    const pick = {}; let cur = 0;
    const heads = [], slots = [];
    const BADGE = { good: '좋은 조사 질문', vague: '막연함 — 다시 고르기', out: 'AI에게 물을 게 아님' };
    B.forEach((b, i) => {
      const col = document.createElement('div'); col.className = 'branch';
      const h = document.createElement('button'); h.type = 'button'; h.className = 'br-h';
      h.innerHTML = `<svg class="ic"><use href="#i-${b.ic}"/></svg>${b.name}`;
      h.addEventListener('click', () => { cur = i; render(); });
      const s = document.createElement('div'); s.className = 'br-slot'; s.textContent = '질문을 골라 보세요';
      col.appendChild(h); col.appendChild(s); br.appendChild(col);
      heads.push(h); slots.push(s);
    });
    function render() {
      const b = B[cur];
      heads.forEach((h, i) => h.setAttribute('aria-pressed', i === cur));
      $('tr-lbl').textContent = `가지 ‘${b.name}’에 달 질문을 고르세요`;
      opts.innerHTML = '';
      b.o.forEach((o, j) => {
        const btn = document.createElement('button'); btn.type = 'button';
        btn.textContent = o.t; btn.setAttribute('aria-pressed', pick[b.k] === j);
        btn.addEventListener('click', () => choose(j));
        opts.appendChild(btn);
      });
      B.forEach((bb, i) => {
        const j = pick[bb.k], s = slots[i];
        if (j === undefined) { s.className = 'br-slot'; s.textContent = '질문을 골라 보세요'; return; }
        const o = bb.o[j];
        s.className = 'br-slot ' + o.q;
        s.innerHTML = `<span class="badge">${BADGE[o.q]}</span><span>${o.t}</span>`;
      });
      const good = B.filter((bb) => pick[bb.k] !== undefined && bb.o[pick[bb.k]].q === 'good').length;
      $('tr-n').textContent = good + ' / 4';
      $('tr-bar').style.width = good * 25 + '%';
    }
    function choose(j) {
      const b = B[cur], o = b.o[j];
      pick[b.k] = j;
      const m = $('tr-msg');
      if (o.q === 'good') {
        const next = B.findIndex((bb) => pick[bb.k] === undefined || bb.o[pick[bb.k]].q !== 'good');
        if (next >= 0) cur = next;
        m.className = 'callout b';
        m.innerHTML = next < 0
          ? '<strong>네 가지 모두 좋은 조사 질문!</strong> 이 네 질문이 다음 장 프롬프트의 ‘네 칸’이 됩니다.'
          : `<strong>좋아요.</strong> ${o.why}`;
      } else {
        m.className = 'callout';
        m.innerHTML = `<strong>${BADGE[o.q]}.</strong> ${o.why}`;
      }
      render();
    }
    render();
  })();

  /* ───────── 3) 웹 검색 켬/끔 ───────── */
  (function web() {
    const wrap = $('wq'); if (!wrap) return;
    // 상태: ok 답할 수 있음 / chk 찾을 수 있음(원문 확인) / risk 위험 / no 알 수 없음
    const Q = [
      { q: '그래놀라는 어떤 음식인가?', off: ['ok', '일반 지식이라 검색 없이도 답할 수 있다.'], on: ['ok', '일반 지식이라 검색 없이도 답할 수 있다.'] },
      { q: '지난달 발표된 식품 소비 관련 통계', off: ['risk', '학습 이후의 일이다. 모른다고 하거나, 옛 숫자를 섞을 수 있다.'], on: ['chk', '찾아올 수 있다. 발표 기관의 원문과 날짜를 확인한다.'] },
      { q: '온라인몰에서 파는 그래놀라의 오늘 가격', off: ['risk', '가격은 자주 바뀐다. 예전 가격을 말할 수 있다.'], on: ['chk', '찾을 수 있지만 몰마다·날마다 다르다. 확인 날짜를 적는다.'] },
      { q: '20~30대가 SNS에서 많이 쓰는 그래놀라 해시태그', off: ['risk', '오래된 기억에 기대 답한다.'], on: ['chk', '일부를 찾을 수 있다. SNS 화제가 다수 의견은 아니다.'] },
      { q: '유료 시장 보고서 속 상세 수치', off: ['no', '공개되지 않은 내용이다. 숫자를 지어낼 위험이 크다.'], on: ['no', '검색으로도 공개 요약까지만 보인다. 상세 수치는 알 수 없다.'] },
      { q: '바다결 자사몰의 9월 판매량', off: ['no', '내부 데이터다. 인터넷 어디에도 없다.'], on: ['no', '검색해도 없다. 우리가 파일을 줘야 한다(7주차).'] },
    ];
    const LBL = { ok: '답할 수 있음', chk: '찾을 수 있음 · 원문 확인', risk: '위험 · 오래됐거나 지어냄', no: '알 수 없음 · 직접 구하기' };
    const ICN = { ok: 'check', chk: 'search', risk: 'alert', no: 'x' };
    const cards = Q.map((it) => {
      const d = document.createElement('div'); d.className = 'qc';
      d.innerHTML = `<div class="qq">${it.q}</div><div class="st"></div><div class="why"></div>`;
      wrap.appendChild(d); return d;
    });
    const bOff = $('w-off'), bOn = $('w-on');
    function set(on) {
      bOff.setAttribute('aria-pressed', !on); bOn.setAttribute('aria-pressed', on);
      let n = 0;
      Q.forEach((it, i) => {
        const [s, why] = on ? it.on : it.off;
        if (s === 'ok' || s === 'chk') n++;
        cards[i].className = 'qc ' + s;
        cards[i].querySelector('.st').innerHTML = `<svg class="ic"><use href="#i-${ICN[s]}"/></svg>${LBL[s]}`;
        cards[i].querySelector('.why').textContent = why;
      });
      $('w-n').textContent = n + ' / 6';
      $('w-msg').innerHTML = on
        ? '검색을 켜면 <strong>최신 공개 자료</strong>는 찾을 수 있지만 <strong>원문 확인</strong>이 필요합니다. 빨간 칸(비공개·내부)은 켜도 그대로입니다.'
        : '검색을 꺼 두면 AI는 <strong>학습한 시점까지의 지식</strong>으로만 답합니다. 스위치를 켜 보세요.';
    }
    bOff.addEventListener('click', () => set(false));
    bOn.addEventListener('click', () => set(true));
    set(false);
  })();
})();
