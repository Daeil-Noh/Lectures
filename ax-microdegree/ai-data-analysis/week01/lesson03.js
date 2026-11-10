// 1주 3차시 전용: 카메라 마스킹, 개인정보일까?, 결합 재식별, 가명처리, 데이터 편향, 생성형AI 입력 판단
(function () {
  const $ = (id) => document.getElementById(id);
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };

  /* ───────── 1) 카메라: 얼굴 흐림·검사 영역 ───────── */
  (function cam() {
    const b1 = $('c-blur'), b2 = $('c-roi'); if (!b1) return;
    const face = $('face'), dim = $('roiDim'), box = $('roiBox'), st = $('c-st');
    function update() {
      const blur = b1.getAttribute('aria-pressed') === 'true', roi = b2.getAttribute('aria-pressed') === 'true';
      face.setAttribute('filter', blur ? 'url(#blurF)' : '');
      dim.setAttribute('opacity', roi ? 0.88 : 0);
      box.setAttribute('opacity', roi ? 1 : 0);
      if (roi) { st.className = 'status ok'; st.innerHTML = '<b class="k">저장되는 정보</b><strong>제품 이미지만</strong> — 검사 목적에 꼭 필요한 데이터만 남습니다.'; }
      else if (blur) { st.className = 'status mid'; st.innerHTML = '<b class="k">저장되는 정보</b>얼굴은 흐려졌지만 <strong>작업복의 사번</strong>은 그대로 보입니다. 아직 누구인지 알 수 있습니다.'; }
      else { st.className = 'status bad'; st.innerHTML = '<b class="k">저장되는 정보</b>제품 이미지 + <strong>작업자 얼굴·사번</strong> → 개인정보가 함께 쌓입니다.'; }
    }
    [b1, b2].forEach((b) => b.addEventListener('click', () => { toggle(b); update(); }));
    update();
  })();

  /* ───────── 공통: 뒤집는 판단 카드 ───────── */
  function cards(wrapId, items, scoreId) {
    const wrap = $(wrapId); if (!wrap) return;
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="ic-badge ${it.o ? 'o' : ''}"><svg class="ic"><use href="#i-${it.ic}"/></svg></span><span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        if (scoreId) $(scoreId).textContent = opened + ' / ' + items.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  }

  /* ───────── 2) 개인정보일까? ───────── */
  cards('pcards', [
    { ic: 'user', n: '이름 + 사번 21034', k: 'yes', v: '개인정보 O', a: '이름으로 바로 누구인지 알 수 있다.' },
    { ic: 'activity', n: '3호기 설비 진동 기록', k: 'no', v: '개인정보 X', a: '사람이 아니라 설비에 관한 정보다.' },
    { ic: 'eye', n: '작업자 얼굴이 찍힌 CCTV 영상', k: 'yes', v: '개인정보 O', a: '영상으로 누구인지 알아볼 수 있다.' },
    { ic: 'chart', n: '라인별 월간 불량률', k: 'no', v: '개인정보 X', a: '공정 단위로 모은 통계다.' },
    { ic: 'chat', n: '휴대전화 번호', k: 'yes', v: '개인정보 O', a: '번호만으로 특정 개인과 연결된다.' },
    { ic: 'clock', n: '사번별 월간 작업시간 기록', k: 'yes', v: '개인정보 O', a: '이름이 없어도 사번을 인사 기록과 쉽게 결합해 알아볼 수 있다.' },
    { ic: 'thermo', n: '실험실 온도·습도 기록', k: 'no', v: '개인정보 X', a: '환경 측정값이다. 단, 출입 기록과 함께 저장하면 달라질 수 있다.' },
    { ic: 'book', n: '학번만 적힌 과제 점수표', k: 'yes', v: '개인정보 O', a: '학번은 학교 명부와 결합해 누구인지 알 수 있다.' },
  ], 'pc-score');

  /* ───────── 3) 결합하면 알아볼 수 있다 ───────── */
  (function reid() {
    const wrap = $('people'), tg = $('re-tg'); if (!wrap) return;
    const A = [
      { k: 'dept', label: '학과: 인공지능학과', vals: ['인공지능', '기계', '전자', '화학'] },
      { k: 'yr', label: '학년: 2학년', vals: [2, 1, 3, 4] },
      { k: 'sex', label: '성별: 여', vals: ['여', '남'] },
      { k: 'com', label: '통학: 기차', vals: ['기차', '버스', '지하철', '도보'] },
      { k: 'club', label: '동아리: 드론', vals: ['드론', '밴드', '축구', '없음'] },
    ];
    const r = rng(21), pop = [];
    for (let i = 0; i < 40; i++) {
      const p = {};
      A.forEach((a) => {
        // 첫 번째 값(목표 값)이 너무 흔하지 않게 가중치
        const w = a.k === 'dept' ? 0.45 : a.k === 'sex' ? 0.45 : 0.32;
        p[a.k] = r() < w ? a.vals[0] : a.vals[1 + Math.floor(r() * (a.vals.length - 1))];
      });
      pop.push(p);
    }
    const T = 17; A.forEach((a) => (pop[T][a.k] = a.vals[0]));            // 목표 인물
    pop.forEach((p, i) => { if (i !== T && A.every((a) => p[a.k] === a.vals[0])) p.club = '밴드'; });
    const els = pop.map(() => {
      const d = document.createElement('div'); d.className = 'person';
      d.innerHTML = '<svg class="ic"><use href="#i-user"/></svg>'; wrap.appendChild(d); return d;
    });
    const on = new Set();
    A.forEach((a) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tgl'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span class="chk"></span>' + a.label;
      b.addEventListener('click', () => { toggle(b) ? on.add(a.k) : on.delete(a.k); update(); });
      tg.appendChild(b);
    });
    function update() {
      const match = pop.map((p) => A.every((a) => !on.has(a.k) || p[a.k] === a.vals[0]));
      const n = match.filter(Boolean).length;
      els.forEach((e, i) => { e.className = 'person' + (on.size ? (match[i] ? (n === 1 ? ' one' : ' hit') : ' off') : ''); });
      $('re-n').textContent = n + '명';
      const st = $('re-st');
      if (n === 1) { st.className = 'status bad'; st.innerHTML = '<b class="k">누구인지 특정됨</b>이름이 없어도 이 조합은 <strong>단 한 사람</strong>을 가리킵니다. 같은 학과 친구라면 바로 알아봅니다 → <strong>개인정보</strong>.'; }
      else if (n <= 3) { st.className = 'status mid'; st.innerHTML = `<b class="k">위험</b>${n}명으로 좁혀졌습니다. 조건 하나만 더하면 특정될 수 있습니다.`; }
      else { st.className = 'status ok'; st.innerHTML = `<b class="k">아직은 안전</b>${n}명 중 한 명이라 누구인지 알기 어렵습니다.`; }
    }
    update();
  })();

  /* ───────── 4) 가명처리 ───────── */
  (function pseudo() {
    const tab = $('ptab'); if (!tab) return;
    const rows = [
      ['김민준', '21034', 34, '2라인', 176, 3],
      ['이서연', '19112', 41, '1라인', 168, 1],
      ['박도윤', '22057', 27, '2라인', 181, 5],
      ['최하은', '17089', 46, '3라인', 159, 0],
      ['정시우', '20041', 38, '1라인', 172, 2],
    ];
    const pid = ['P-04', 'P-02', 'P-05', 'P-01', 'P-03'];
    const state = { name: false, id: false, age: false, key: false };
    function render() {
      let h = '<thead><tr><th>이름</th><th>사번</th><th>나이</th><th>라인</th><th>월 작업시간</th><th>불량 건수</th></tr></thead><tbody>';
      rows.forEach((r, i) => {
        h += '<tr>';
        h += state.name ? '<td class="del">' + r[0] + '</td>' : '<td>' + r[0] + '</td>';
        h += state.id ? '<td class="chg">' + pid[i] + '</td>' : '<td>' + r[1] + '</td>';
        h += state.age ? '<td class="chg">' + Math.floor(r[2] / 10) * 10 + '대</td>' : '<td>' + r[2] + '세</td>';
        h += '<td>' + r[3] + '</td><td>' + r[4] + '시간</td><td>' + r[5] + '건</td></tr>';
      });
      tab.innerHTML = h + '</tbody>';
      $('keybox').hidden = !state.key;
      $('ktab').innerHTML = '<tr><th>임의 번호</th><th>사번</th><th>이름</th></tr>' + rows.map((r, i) => `<tr><td>${pid[i]}</td><td>${r[1]}</td><td>${r[0]}</td></tr>`).join('');
      const st = $('p-st');
      if (state.name && state.id && state.age) {
        st.className = 'status mid';
        st.innerHTML = '<b class="k">가명정보</b>이 표만으로는 누구인지 알 수 없습니다. 하지만 <strong>매핑표와 합치면 되돌릴 수 있어</strong> 여전히 개인정보입니다. 통계·연구 목적이면 동의 없이 분석할 수 있습니다.';
      } else if (state.name || state.id || state.age) {
        st.className = 'status bad';
        st.innerHTML = '<b class="k">아직 개인정보</b>' + (!state.id ? '사번이 남아 있으면 인사 기록과 결합해 알아볼 수 있습니다.' : !state.name ? '이름이 그대로 보입니다.' : '정확한 나이 + 라인 조합으로 특정될 수 있습니다.');
      } else {
        st.className = 'status bad';
        st.innerHTML = '<b class="k">원본 개인정보</b>이름·사번으로 누구인지 바로 알 수 있습니다.';
      }
    }
    document.querySelectorAll('.tgl[data-p]').forEach((b) => b.addEventListener('click', () => { state[b.dataset.p] = toggle(b); render(); }));
    render();
  })();

  /* ───────── 5) 데이터 편향 ───────── */
  (function bias() {
    const s = $('b-s'); if (!s) return;
    const strip = $('b-strip');
    const cells = [];
    for (let i = 0; i < 100; i++) { const c = document.createElement('span'); strip.appendChild(c); cells.push(c); }
    function update() {
      const p = +s.value;
      const day = Math.round(96 - p * 0.04);
      const night = Math.round(Math.min(94, 58 + p * 1.6 - (p > 25 ? (p - 25) * 0.55 : 0)));
      $('b-o').textContent = p + '%';
      $('b-day').textContent = day + '%'; $('b-night').textContent = night + '%';
      $('b-dbar').style.width = day + '%'; $('b-nbar').style.width = night + '%';
      cells.forEach((c, i) => { c.style.background = i >= 100 - p ? 'var(--text)' : 'var(--accent-soft)'; c.style.opacity = i >= 100 - p ? 0.75 : 1; });
      const st = $('b-st'), gap = day - night;
      if (gap > 15) { st.className = 'status bad'; st.innerHTML = `<b class="k">야간 근무조에 불리한 AI</b>정확도 차이 <strong>${gap}%p</strong>. 야간 제품을 자꾸 잘못 판정합니다.`; }
      else if (gap > 5) { st.className = 'status mid'; st.innerHTML = `<b class="k">나아지는 중</b>정확도 차이 ${gap}%p. 야간 데이터를 더 모아야 합니다.`; }
      else { st.className = 'status ok'; st.innerHTML = `<b class="k">고르게 판단</b>정확도 차이 ${Math.max(gap, 0)}%p. 여러 조건의 데이터를 <strong>골고루</strong> 학습했습니다.`; }
    }
    s.addEventListener('input', update);
    update();
  })();

  /* ───────── 6) 생성형AI에 넣어도 될까? ───────── */
  cards('gcards', [
    { ic: 'code', n: '내 과제 코드에서 난 오류 메시지', k: 'no', v: '넣어도 됨', a: '개인정보·기밀이 없는 내 코드라면 괜찮다. 4주차에 이렇게 활용한다.' },
    { ic: 'database', n: '공공데이터포털에서 받은 공개 CSV', k: 'no', v: '대체로 됨', a: '공개 데이터라도 이용 조건(출처 표시 등)은 지킨다.' },
    { ic: 'user', n: '현장실습 회사의 고객 이름·연락처 명단', k: 'yes', v: '넣으면 안 됨', a: '개인정보다. 외부 서버로 전송되는 순간 회사의 통제를 벗어난다.' },
    { ic: 'flask', n: '연구실의 아직 발표 안 한 실험 데이터', k: 'mid', v: '허락 먼저', a: '연구 기밀일 수 있다. 지도교수·기관 지침을 먼저 확인한다.' },
    { ic: 'log', n: '수업 강의자료 PDF 요약 요청', k: 'mid', v: '주의', a: '저작물이다. 개인 학습용 요약은 몰라도, 재배포하면 안 된다.' },
    { ic: 'chart', n: '사번이 들어간 작업 기록 엑셀', k: 'yes', v: '넣으면 안 됨', a: '사번은 결합하면 알아볼 수 있는 개인정보. 최소한 가명처리가 먼저다.' },
  ]);
})();
