// 13주 1차시 전용: 수상한 곳 찾기, 가짜 대표 전화, “진짜일까?” 점검표
(function () {
  const $ = (id) => document.getElementById(id);

  /* ───────── 1) 수상한 곳 찾기 ───────── */
  (function hotspots() {
    const post = $('fakepost'); if (!post) return;
    const spots = post.querySelectorAll('.hs');
    const found = new Set();
    const total = spots.length;
    spots.forEach((s) => s.addEventListener('click', () => {
      const k = s.dataset.k;
      if (found.has(k)) return;
      found.add(k);
      s.classList.add('found');
      document.querySelector(`#hs-clues div[data-k="${k}"]`).classList.add('on');
      $('hs-n').textContent = found.size + ' / ' + total;
      $('hs-bar').style.width = (found.size / total * 100) + '%';
      $('hs-msg').innerHTML = found.size < total
        ? `좋아요. <strong>${total - found.size}곳</strong> 더 있습니다.`
        : '<strong>모두 찾았습니다.</strong> 바다결 <strong>공식몰·공식 계정</strong>에는 이런 공지가 없습니다 → <strong>가짜 공지</strong>.';
    }));
  })();

  /* ───────── 2) 가짜 대표 전화 ───────── */
  (function call() {
    const wrap = $('call'); if (!wrap) return;
    const fb = $('cl-flag'), st = $('cl-st');
    fb.addEventListener('click', () => {
      const on = wrap.classList.toggle('showflags');
      fb.innerHTML = on ? '<svg class="ic"><use href="#i-eye"/></svg> 의심 신호 숨기기' : '<svg class="ic"><use href="#i-eye"/></svg> 의심 신호 표시하기';
    });
    const R = {
      a: ['bad', '위험한 선택', '목소리는 짧은 녹음만으로도 <strong>복제</strong>될 수 있습니다. 목소리가 같다는 것은 확인이 아닙니다.'],
      b: ['ok', '좋은 대응', '걸려 온 번호가 아니라 <strong>내가 원래 알던 경로</strong>로 다시 연락해 확인합니다. 진짜 대표라면 잠깐 늦어져도 문제없습니다.'],
      c: ['bad', '위험한 선택', '“일부만”도 송금은 송금입니다. 사기범은 <strong>급하게 만들어</strong> 확인 단계를 건너뛰게 합니다.'],
      d: ['ok', '좋은 대응', '미리 정한 <strong>확인 질문</strong>과 <strong>다른 사람에게 알리기</strong>는 “비밀로 해” 압박을 깨는 방법입니다. ②와 함께 하면 더 안전합니다.'],
    };
    document.querySelectorAll('#cl-choices .choice').forEach((b) => b.addEventListener('click', () => {
      document.querySelectorAll('#cl-choices .choice').forEach((x) => x.classList.remove('good', 'bad'));
      const [k, h, d] = R[b.dataset.c];
      b.classList.add(k === 'ok' ? 'good' : 'bad');
      st.className = 'status ' + k;
      st.innerHTML = `<b class="k">${h}</b>${d}`;
      if (!wrap.classList.contains('showflags')) fb.click();
    }));
  })();

  /* ───────── 3) “진짜일까?” 점검표 ───────── */
  (function verify() {
    const box = $('v-checks'); if (!box) return;
    const Q = [
      ['① 멈추기', '감정을 자극하거나 서두르게 만드나?'],
      ['② 출처', '누가 처음 올렸나? 공식 계정·사이트인가?'],
      ['③ 원본', '이미지로 검색하면 더 오래된 원본이 나오나?'],
      ['④ 맥락', '날짜·장소·상황이 내용과 맞나?'],
      ['⑤ 교차 확인', '믿을 만한 다른 곳에도 같은 내용이 있나?'],
    ];
    // r = 의심 신호, g = 믿을 근거, n = 판단에 큰 영향 없음
    const C = [
      { b: 'A · “창립 기념 90% 할인” SNS 게시물', src: '처음 보는 계정이 올린 게시물', claim: '“주식회사 바다결 창립 기념, 오늘 자정까지 전 제품 90% 할인. 아래 주소에서 신청!”',
        r: [['r', '“오늘 자정까지”, “선착순” — 서두르게 만든다.'], ['r', '공식 계정이 아니다. 철자가 비슷한 사칭 계정.'], ['n', '이미지 검색 결과 없음. 새로 만든 이미지로 보인다(원본 없음 = 진짜라는 뜻은 아님).'], ['r', '바다결 창립일과 무관한 날짜. 링크 주소도 공식몰이 아니다.'], ['r', '공식몰·공식 계정·고객센터 어디에도 이런 공지가 없다.']],
        v: ['bad', '가짜일 가능성 매우 높음', '의심 신호 4개, 믿을 근거 0개. <strong>공유하지 말고</strong> 회사에 사칭 계정을 알린다.'] },
      { b: 'B · “오늘 광안리에 돌고래 떼” 사진', src: '지역 소식 단체방에 올라온 사진 한 장', claim: '“지금 광안리 해변에 돌고래 수십 마리! 방금 찍었대요” (사진 1장)',
        r: [['r', '“지금”, “방금” — 빨리 보러 가거나 공유하고 싶게 만든다.'], ['r', '찍은 사람을 아무도 모른다. “~했대요”로만 전달됨.'], ['r', '이미지로 검색하니 <b>몇 년 전 다른 나라 해변</b> 사진으로 먼저 올라와 있다.'], ['r', '사진 속 건물·해안선이 광안리와 다르다.'], ['n', '지역 언론·관계 기관 소식에 관련 내용이 아직 없다.']],
        v: ['bad', '사실과 다름 — 오래된 사진의 재사용', '가짜 합성이 아니어도 <strong>진짜 사진을 다른 맥락에 붙이면</strong> 허위정보가 된다. 원본 찾기가 핵심.'] },
      { b: 'C · “추석 선물 세트 사전 예약” 메시지', src: '지인이 전달한 메시지', claim: '“바다결 추석 선물 세트 사전 예약 시작! 자사몰에서 예약하면 무료 배송”',
        r: [['n', '특별히 서두르게 하는 표현은 없다.'], ['g', '메시지 속 주소가 바다결 <b>공식몰 주소</b>와 같다.'], ['n', '제품 사진이 공식몰 상세 페이지 사진과 같다.'], ['g', '매년 비슷한 시기에 진행해 온 행사다.'], ['g', '공식 계정과 오프라인 매장 안내문에도 같은 내용이 있다.']],
        v: ['ok', '사실로 확인됨', '믿을 근거 3개, 의심 신호 0개. 모든 정보가 가짜는 아니다 — <strong>확인한 뒤</strong> 안심하고 공유한다.'] },
    ];
    const cases = $('v-cases');
    let cur = 0, done = new Set();
    const btns = C.map((c, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'casebtn'; b.textContent = c.b;
      b.addEventListener('click', () => pick(i)); cases.appendChild(b); return b;
    });
    const items = Q.map((q, j) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chk';
      b.innerHTML = `<span class="bx"></span><span><b>${q[0]}</b> ${q[1]}</span><span class="res"></span>`;
      b.addEventListener('click', () => { done.add(j); render(); });
      box.appendChild(b); return b;
    });
    function render() {
      const c = C[cur];
      let red = 0, green = 0;
      items.forEach((b, j) => {
        const on = done.has(j), [t, txt] = c.r[j];
        b.className = 'chk' + (on ? ' done ' + (t === 'r' ? 'red' : t === 'g' ? 'green' : 'gray') : '');
        b.querySelector('.res').innerHTML = (t === 'r' ? '의심 신호 · ' : t === 'g' ? '믿을 근거 · ' : '참고 · ') + txt;
        if (on && t === 'r') red++; if (on && t === 'g') green++;
      });
      $('v-red').textContent = red; $('v-green').textContent = green;
      $('v-n').textContent = done.size + ' / 5'; $('v-bar').style.width = done.size * 20 + '%';
      const st = $('v-st');
      if (done.size === 5) { st.className = 'status ' + c.v[0]; st.innerHTML = `<b class="k">판정: ${c.v[1]}</b>${c.v[2]}`; }
      else if (done.size >= 3) { st.className = 'status mid'; st.innerHTML = `<b class="k">기울기: ${red > green ? '의심 쪽' : green > red ? '믿음 쪽' : '아직 반반'}</b>아직 ${5 - done.size}개를 확인하지 않았습니다. 다 확인하기 전에는 <strong>공유 보류</strong>.`; }
      else { st.className = 'status mid'; st.innerHTML = '<b class="k">판정 보류</b>점검 항목을 눌러 하나씩 확인해 보세요.'; }
    }
    function pick(i) {
      cur = i; done = new Set();
      btns.forEach((b, k) => b.setAttribute('aria-pressed', k === i));
      $('v-claim').innerHTML = `<small>${C[i].src}</small>${C[i].claim}`;
      render();
    }
    pick(0);
  })();
})();
