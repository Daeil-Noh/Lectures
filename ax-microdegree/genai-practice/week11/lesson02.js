// 11주 2차시 전용: 훅 비교, 스토리보드 짜기
(function () {
  const $ = (id) => document.getElementById(id);

  /* ───────── 1) 어느 훅이 더 붙잡을까? ───────── */
  (function hooks() {
    const wrap = $('hk-wrap'); if (!wrap) return;
    const CR = ['첫 장면 궁금증·공감', '타깃의 상황이 보인다', '화면과 자막이 맞물린다', '사실·과장 없음'];
    const R = [
      { a: { ic: 'box', ph: '#4a5563', cap: '바다결 그래놀라를 소개합니다', scn: '첫 화면: 회사 이름과 제품 사진', f: [0, 0, 0, 1] },
        b: { ic: 'clock', ph: '#1f4e79', cap: '아침, 또 거를 거예요?', scn: '첫 화면: 알람을 끄는 손, 시계 7:50', f: [1, 1, 1, 1] },
        win: 'b', why: '“소개합니다”는 광고라는 신호라 넘기기 쉽습니다. B는 <strong>타깃의 아침 상황 + 질문</strong>으로 붙잡습니다.' },
      { a: { ic: 'clock', ph: '#2f6f62', cap: '붓기만 하면, 아침 준비 끝', scn: '첫 화면: 출근 준비 중 그릇에 붓는 손', f: [1, 1, 1, 1] },
        b: { ic: 'sparkles', ph: '#8a3a7a', cap: '세상에서 제일 건강한 간식!', scn: '첫 화면: 반짝이 효과 + 제품', f: [0, 0, 1, 0] },
        win: 'a', why: '“제일 건강한”은 <strong>확인할 수 없는 과장</strong>입니다. 광고 문제도 되고 신뢰도 잃습니다. A는 바쁜 아침이라는 상황이 구체적입니다.' },
      { a: { ic: 'type', ph: '#222', cap: '(자막 없음)', scn: '첫 화면: 검은 화면에 브랜드 이름이 천천히 나타남', f: [0, 0, 0, 1] },
        b: { ic: 'music', ph: '#7a5530', cap: '이 소리, 들려요?', scn: '첫 화면: 우유 붓는 클로즈업 + 바삭 소리', f: [1, 0, 1, 1] },
        win: 'b', why: '로고만 몇 초 보여 주면 이미 넘어갑니다. B는 <strong>움직임과 소리</strong>로 첫 장면부터 제품을 보여 줍니다.' },
      { a: { ic: 'bulb', ph: '#355e3b', cap: '미역귀로 칩을 만들면?', scn: '첫 화면: 미역귀를 든 손 + 물음표', f: [1, 0, 1, 1] },
        b: { ic: 'cart', ph: '#5b4a8a', cap: '6,500원, 링크는 프로필에', scn: '첫 화면: 가격표와 링크 표시', f: [0, 0, 1, 1] },
        win: 'a', why: 'B는 좋은 <strong>행동 유도</strong>지만 맨 끝에 둘 컷입니다. 첫 장면엔 A처럼 <strong>궁금증</strong>을 먼저.' },
    ];
    let r = 0, score = 0;
    function card(side, o) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'hk'; b.dataset.side = side;
      b.innerHTML = `<span class="ab">${side.toUpperCase()}</span>
        <span class="phone" style="--ph:${o.ph}"><svg class="ic big"><use href="#i-${o.ic}"/></svg><span class="cap">${o.cap}</span></span>
        <span class="scn">${o.scn}</span>
        <ul class="crit">${CR.map((c, i) => `<li><span class="${o.f[i] ? 'y' : 'n'}">${o.f[i] ? '✓' : '✗'}</span>${c}</li>`).join('')}</ul>`;
      return b;
    }
    function show() {
      const q = R[r];
      wrap.innerHTML = ''; wrap.classList.remove('done');
      const A = card('a', q.a), B = card('b', q.b);
      wrap.append(A, B);
      $('hk-r').textContent = (r + 1) + ' / ' + R.length;
      $('hk-next').disabled = true;
      $('hk-msg').innerHTML = '둘 중 <strong>계속 보고 싶은</strong> 첫 화면을 누르세요. 고르면 네 가지 기준으로 채점됩니다.';
      [A, B].forEach((btn) => btn.addEventListener('click', () => {
        const ok = btn.dataset.side === q.win;
        if (ok) score++;
        $('hk-s').textContent = score;
        wrap.classList.add('done');
        [A, B].forEach((x) => { x.disabled = true; x.classList.add(x.dataset.side === q.win ? 'win' : 'lose'); });
        if (!ok) btn.classList.add('pickwrong');
        $('hk-msg').innerHTML = (ok ? '<b style="color:var(--ok)">맞아요.</b> ' : '<b style="color:var(--bad)">다시 볼까요?</b> ') + q.why;
        if (r < R.length - 1) { $('hk-next').disabled = false; $('hk-next').textContent = '다음 비교 →'; }
        else {
          $('hk-next').disabled = false; $('hk-next').textContent = '처음부터 다시';
          $('hk-msg').innerHTML += `<br><strong>${R.length}번 중 ${score}번</strong> 맞혔습니다. 좋은 훅의 공통점: 첫 장면에 <strong>타깃의 상황이나 궁금증</strong>, 그리고 사실.`;
        }
      }));
    }
    $('hk-next').addEventListener('click', () => { if (r < R.length - 1) r++; else { r = 0; score = 0; $('hk-s').textContent = 0; } show(); });
    show();
  })();

  /* ───────── 2) 스토리보드 짜기 ───────── */
  (function storyboard() {
    const slotsEl = $('sb-slots'), libEl = $('sb-lib'); if (!slotsEl) return;
    const ROLE = { hook: ['훅', 'r-hook'], prob: ['문제', 'r-prob'], prod: ['제품', 'r-prod'], ben: ['결과', 'r-ben'], cta: ['행동 유도', 'r-cta'], intro: ['소개', 'r-intro'], risk: ['주의', 'r-risk'] };
    const CUTS = [
      { id: 'c1', role: 'hook', ic: 'clock', scr: '알람을 끄는 손, 시계 7:50', cap: '아침, 또 거를 거예요?', snd: '알람 소리 → 뚝', sec: 3 },
      { id: 'c2', role: 'prob', ic: 'user', scr: '빈 식탁, 급히 나가는 발', cap: '바빠서 아침은 늘 패스', snd: '빠른 발소리', sec: 4 },
      { id: 'c3', role: 'prod', ic: 'box', scr: '그릇에 그래놀라 붓고 우유 붓기', cap: '붓고, 붓고, 끝', snd: '바삭, 붓는 소리', sec: 5 },
      { id: 'c4', role: 'prod', ic: 'eye', scr: '한 숟가락 클로즈업', cap: '바삭한 한 숟가락', snd: '바삭 소리 강조', sec: 4 },
      { id: 'c5', role: 'ben', ic: 'sparkles', scr: '가방 메고 나서는 뒷모습', cap: '든든하게, 출근 완료', snd: '밝은 음악 시작', sec: 4 },
      { id: 'c6', role: 'cta', ic: 'cart', scr: '제품 봉지 + 글자 화면', cap: '바다결 자사몰에서 만나요', snd: '음악 마무리', sec: 3 },
      { id: 'c7', role: 'intro', ic: 'type', scr: '회사 이름과 소개 글자 화면', cap: '바다결은 부산의 간식 회사', snd: '잔잔한 음악', sec: 6 },
      { id: 'c8', role: 'risk', ic: 'alert', scr: '유명 배우를 닮은 AI 모델이 먹는 장면', cap: '그 배우도 먹는 그래놀라', snd: '배경 음악', sec: 5 },
    ];
    let seq = [];
    const caps = {};
    function render() {
      slotsEl.innerHTML = '';
      for (let i = 0; i < 6; i++) {
        const c = seq[i] && CUTS.find((x) => x.id === seq[i]);
        const d = document.createElement('div');
        if (!c) { d.className = 'slot empty'; d.innerHTML = `<span>컷 ${i + 1}<br>비어 있음</span>`; slotsEl.appendChild(d); continue; }
        const [rn, rc] = ROLE[c.role];
        d.className = 'slot fill ' + rc;
        d.innerHTML = `<span class="no">컷 ${i + 1}</span><span class="sec">${c.sec}초</span><span><span class="role">${rn}</span></span>
          <div class="thumb"><svg class="ic"><use href="#i-${c.ic}"/></svg></div>
          <div class="scr">${c.scr}</div>
          <textarea rows="2" aria-label="컷 ${i + 1} 자막" maxlength="24"></textarea>
          <div class="snd">♪ ${c.snd}</div>
          <div class="bar2"><button type="button" data-a="l" aria-label="앞으로">◀</button><button type="button" data-a="x" aria-label="빼기">✕</button><button type="button" data-a="r" aria-label="뒤로">▶</button></div>`;
        const inp = d.querySelector('textarea');
        inp.value = caps[c.id] ?? c.cap;
        inp.addEventListener('keydown', (e) => e.stopPropagation());
        inp.addEventListener('input', () => { caps[c.id] = inp.value; });
        d.querySelectorAll('.bar2 button').forEach((b) => b.addEventListener('click', () => {
          const a = b.dataset.a;
          if (a === 'x') seq.splice(i, 1);
          else if (a === 'l' && i > 0) [seq[i - 1], seq[i]] = [seq[i], seq[i - 1]];
          else if (a === 'r' && i < seq.length - 1) [seq[i + 1], seq[i]] = [seq[i], seq[i + 1]];
          clearChecks(); render();
        }));
        slotsEl.appendChild(d);
      }
      libEl.innerHTML = '';
      CUTS.forEach((c) => {
        const [rn, rc] = ROLE[c.role];
        const b = document.createElement('button'); b.type = 'button'; b.className = rc;
        b.disabled = seq.includes(c.id) || seq.length >= 6;
        b.innerHTML = `<span><span class="role">${rn}</span> <b>${c.sec}초</b></span><span>${c.scr}</span>`;
        b.addEventListener('click', () => { if (seq.length < 6 && !seq.includes(c.id)) { seq.push(c.id); clearChecks(); render(); } });
        libEl.appendChild(b);
      });
      const total = seq.reduce((s, id) => s + CUTS.find((x) => x.id === id).sec, 0);
      $('sb-n').textContent = seq.length;
      $('sb-t').textContent = total + '초';
    }
    function clearChecks() { $('sb-checks').innerHTML = ''; $('sb-msg').innerHTML = '컷을 바꿨습니다. 다 놓았으면 <strong>점검하기</strong>를 누르세요.'; }
    function check() {
      const cs = seq.map((id) => CUTS.find((x) => x.id === id));
      const roles = cs.map((c) => c.role);
      const total = cs.reduce((s, c) => s + c.sec, 0);
      const iProb = roles.indexOf('prob'), iProd = roles.indexOf('prod');
      const longCap = cs.filter((c) => (caps[c.id] ?? c.cap).length > 16);
      const items = [
        ['컷 4~6개', seq.length >= 4 && seq.length <= 6],
        ['첫 컷이 훅', roles[0] === 'hook'],
        ['제품이 나온다', iProd >= 0],
        ['문제(공감) → 제품 순서', iProb >= 0 && iProd > iProb],
        ['마지막 컷이 행동 유도', roles[roles.length - 1] === 'cta'],
        ['길이 30초 이내', total > 0 && total <= 30],
        ['자막 16자 이내', cs.length > 0 && longCap.length === 0],
        ['권리 문제 컷 없음', !roles.includes('risk')],
      ];
      $('sb-checks').innerHTML = items.map(([t, ok]) => `<li><span class="m ${ok ? 'y' : 'n'}">${ok ? '✓' : '✗'}</span>${t}</li>`).join('');
      const m = $('sb-msg');
      if (roles.includes('risk')) m.innerHTML = '<strong style="color:var(--bad)">유명인을 닮은 AI 모델</strong>은 초상권·퍼블리시티 문제입니다. 이 컷은 빼세요(11-3에서 자세히).';
      else if (seq.length < 4) m.innerHTML = '컷이 부족합니다. <strong>4개 이상</strong> 넣어 보세요.';
      else if (roles[0] !== 'hook') m.innerHTML = roles[0] === 'intro' ? '회사 소개로 시작하면 <strong>첫 장면에서 넘어갑니다.</strong> 훅 컷을 맨 앞으로.' : '첫 컷에 <strong>훅</strong>을 두세요. ◀ ▶ 버튼으로 순서를 바꿀 수 있습니다.';
      else if (iProd < 0) m.innerHTML = '제품이 한 번도 나오지 않습니다. <strong>제품 컷</strong>을 넣으세요.';
      else if (roles[roles.length - 1] !== 'cta') m.innerHTML = '보고 나서 무엇을 하라는 걸까요? 마지막에 <strong>행동 유도</strong> 컷을.';
      else if (total > 30) m.innerHTML = `${total}초 — 깁니다. 컷을 빼거나 <strong>소개 컷</strong>처럼 약한 컷을 덜어 내세요.`;
      else if (longCap.length) m.innerHTML = `자막이 깁니다: “${caps[longCap[0].id] ?? longCap[0].cap}” — 한 줄에 읽히게 줄여 보세요.`;
      else if (!(iProb >= 0 && iProd > iProb)) m.innerHTML = '거의 다 왔습니다. <strong>문제(공감)</strong> 컷을 제품 앞에 두면 “그래서 이게 필요하구나”가 생깁니다.';
      else m.innerHTML = `<strong>완성!</strong> ${seq.length}컷 · ${total}초. 이 순서를 양식에 옮기고, 컷마다 <strong>만드는 방법</strong>을 정해 샷 리스트로.`;
    }
    $('sb-check').addEventListener('click', check);
    $('sb-reset').addEventListener('click', () => { seq = []; for (const k in caps) delete caps[k]; $('sb-checks').innerHTML = ''; $('sb-msg').innerHTML = '컷 보관함에서 <strong>4~6개</strong>를 골라 넣으세요. 목표: 30초 이내, 4단 구조.'; render(); });
    render();
  })();
})();
