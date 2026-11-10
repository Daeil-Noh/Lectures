// 1주 3차시 전용: 넣어도 될까? 판정 카드, 고객 문의 가리기, 확인의 사다리, AI 사용 표시 만들기
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };

  /* ───────── 1) 넣어도 될까? 판정 카드 ───────── */
  (function verdicts() {
    const wrap = $('vcards'); if (!wrap) return;
    const LAB = { ok: '가능', mid: '주의', no: '금지' };
    const C = [
      ['chart', '홈페이지에 공개된 바다결 제품 가격표', 'ok', '이미 누구나 볼 수 있게 공개된 정보다.'],
      ['database', '수업 실습 파일 reviews_2026.csv', 'ok', '개인정보·기밀이 없는 가상 자료라서 올려도 된다.'],
      ['mail', '이름·연락처가 그대로인 고객 문의 메일', 'no', '개인정보다. 다음 장처럼 가리고 넣으면 ‘주의’로 바뀐다.'],
      ['lock', '아르바이트하는 카페의 신메뉴·원가표', 'no', '회사 기밀이다. 가게의 허락 없이 외부 서비스에 보내지 않는다.'],
      ['chat', '친구들과의 단체 대화방 캡처', 'no', '다른 사람들의 대화와 개인정보가 담겨 있고, 그들의 동의가 없다.'],
      ['user', '내 자기소개서 초안 다듬기', 'mid', '내 정보라도 연락처·주민등록번호 등은 빼고 필요한 내용만 넣는다.'],
      ['book', '신문 기사 전문을 붙여 넣고 요약 요청', 'mid', '저작물이다. 필요한 부분만 쓰고, 요약 결과를 그대로 게시·배포하지 않는다.'],
      ['log', '발표 전인 회사의 분기 실적 자료', 'no', '미공개 자료다. 공개 전에 새어 나가면 회사에 피해가 생길 수 있다.'],
      ['globe', '공공기관이 공개한 보도자료', 'ok', '공개 자료다. 활용할 때는 출처를 밝힌다.'],
    ];
    let done = 0, same = 0;
    C.forEach(([ic, name, ans, why]) => {
      const card = document.createElement('div'); card.className = 'vcard';
      card.innerHTML = `<div class="top"><span class="ic-badge"><svg class="ic"><use href="#i-${ic}"/></svg></span><span class="nm">${name}</span></div><div class="pick"></div><div class="why"></div>`;
      const pick = card.querySelector('.pick');
      ['ok', 'mid', 'no'].forEach((k) => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = LAB[k]; b.dataset.k = k;
        b.addEventListener('click', () => {
          if (card.classList.contains('done')) return;
          card.classList.add('done', 'v-' + ans); done++; if (k === ans) same++;
          pick.querySelectorAll('button').forEach((x) => { x.disabled = true; if (x.dataset.k === ans) x.classList.add('ans', ans); });
          b.classList.add('mine');
          card.querySelector('.why').innerHTML = (k === ans ? '<b style="color:var(--ok)">맞았어요.</b> ' : `<b style="color:var(--bad)">판정: ${LAB[ans]}</b> `) + why;
          $('vc-score').innerHTML = done < C.length ? `${done} / ${C.length} 판정 · 맞힌 카드 ${same}개`
            : `<strong style="color:var(--text)">맞힌 카드 ${same} / ${C.length}</strong> — 기준은 하나: “회사 밖, 모르는 사람에게 보여도 괜찮은가?”`;
        });
        pick.appendChild(b);
      });
      wrap.appendChild(card);
    });
  })();

  /* ───────── 2) 고객 문의 가리기 ───────── */
  (function redact() {
    const box = $('mail'); if (!box) return;
    const P = (t, m) => ({ t, k: 'pii', m });
    const K = (t, why) => ({ t, k: 'keep', why });
    const S = [
      '안녕하세요. 지난주에 ', K('자사몰', '판매 채널 이름은 개인정보가 아니다. 답장에 필요한 정보.'), '에서 ', K('추석 선물 세트 2개', '주문한 상품은 답장에 꼭 필요한 내용이다.'), '를 주문한 ', P('김하늘', '[고객 이름]'), '입니다.\n',
      '주문번호는 ', P('BD-260915-0042', '[주문번호]'), '이고, 받는 분은 저희 어머니 ', P('박정숙', '[받는 분 이름]'), ' 님(', P('부산시 가나구 다라로 12, 101동 1004호', '[주소]'), ')입니다.\n\n',
      '아직 배송이 시작되지 않아서 연락드립니다. ', K('추석 전', '희망 일정은 답장에 필요한 내용이다.'), '에 받을 수 있을까요?\n',
      '그리고 어머니가 ', { t: '견과류 알레르기', k: 'mid' }, '가 있으신데, 선물 세트에 ', K('견과 믹스', '제품 이름은 개인정보가 아니다.'), '가 들어 있다면 다른 제품으로 바꾸고 싶습니다.\n\n',
      '연락은 ', P('010-1234-5678', '[전화번호]'), ' 또는 ', P('haneul.kim@example.com', '[이메일]'), ' 으로 부탁드립니다.\n감사합니다. ', P('김하늘', '[고객 이름]'), ' 드림',
    ];
    const N = S.filter((s) => s.k === 'pii').length;
    const els = [];
    S.forEach((s) => {
      if (typeof s === 'string') { box.appendChild(document.createTextNode(s)); return; }
      const sp = document.createElement('span'); sp.className = 'tk'; sp.textContent = s.t; sp.tabIndex = 0; sp.setAttribute('role', 'button');
      s.el = sp; s.on = false; els.push(s);
      const act = () => click(s);
      sp.addEventListener('click', act);
      sp.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); act(); } });
      box.appendChild(sp);
    });
    const st = $('rd-st');
    let midSeen = false;
    function click(s) {
      if (s.k === 'pii') { s.on = !s.on; s.el.className = 'tk' + (s.on ? ' masked' : ''); s.el.textContent = s.on ? s.m : s.t; update(); }
      else if (s.k === 'keep') {
        s.el.className = 'tk kept nudge';
        setTimeout(() => s.el.classList.remove('nudge'), 400);
        st.className = 'status ok'; st.innerHTML = `<b class="k">가리지 않아도 됨</b>${s.why}`;
      } else {
        midSeen = true; s.el.className = 'tk mid';
        st.className = 'status mid'; st.innerHTML = '<b class="k">건강 정보 — 주의</b>이름과 함께 있으면 더 엄격히 보호할 정보입니다. 이름을 모두 가렸다면 답장에 필요한 내용이라 남겨도 되지만, “알레르기”처럼 <strong>필요한 만큼만</strong> 쓰는 습관을 들이세요.';
      }
    }
    function plain() { return S.map((s) => (typeof s === 'string' ? s : s.k === 'pii' && s.on ? s.m : s.t)).join(''); }
    function update() {
      const n = els.filter((s) => s.k === 'pii' && s.on).length;
      $('rd-n').textContent = n + ' / ' + N;
      $('rd-bar').style.width = Math.round(n / N * 100) + '%';
      if (n === N) { st.className = 'status ok'; st.innerHTML = '<b class="k">모두 가렸습니다!</b>이제 AI에게 답장 초안을 부탁해도 됩니다. 가린 문의는 다음 장 프롬프트에 들어갔습니다.' + (midSeen ? '' : ' 남은 <strong>건강 정보</strong>도 눌러 보세요.'); }
      else if (n > 0) { st.className = 'status bad'; st.innerHTML = `<b class="k">아직 ${N - n}곳 남음</b>하나라도 남으면 누구인지 알 수 있습니다. 이름은 두 번 나옵니다.`; }
      else { st.className = 'status mid'; st.innerHTML = '<b class="k">찾아보세요</b>점선 밑줄이 있는 곳을 누르면 가려집니다. 가리지 않아도 되는 곳도 섞여 있습니다.'; }
      const pre = $('masked-prompt');
      if (pre) pre.innerHTML = '너는 바다결 고객센터 담당자야. 아래 고객 문의에 대한 답장 초안을 정중하게 써 줘. [ ]는 개인정보를 가린 부분이니 그대로 두고, 배송 일정처럼 확인이 필요한 내용은 <mark>[확인 필요]</mark>로 표시해 줘.\n\n' + (n ? esc(plain()) : '(앞 장에서 가린 문의가 여기에 들어갑니다.)');
    }
    $('rd-all').addEventListener('click', () => { els.forEach((s) => { if (s.k === 'pii') { s.on = true; s.el.className = 'tk masked'; s.el.textContent = s.m; } }); update(); });
    $('rd-0').addEventListener('click', () => { midSeen = false; els.forEach((s) => { s.on = false; s.el.className = 'tk'; s.el.textContent = s.t; }); update(); });
    update();
  })();

  /* ───────── 3) 확인의 사다리 ───────── */
  (function ladder() {
    const wrap = $('ladder'); if (!wrap) return;
    const R = [
      [1, '끝까지 읽고 이상한 곳 표시하기'],
      [2, '숫자·이름·날짜를 원자료와 대조하기'],
      [2, 'AI 초안을 바탕으로 썼다고 동료에게 알리기'],
      [3, '개인정보·내부 정보가 섞이지 않았는지 확인'],
      [3, '말투와 약속(환불·일정)이 회사 정책과 맞는지 확인'],
      [4, '법·규정을 확인하고, 근거 자료의 출처 밝히기'],
      [4, '담당자·상사의 검토와 승인 받기'],
    ];
    const els = R.map(([lv, t], i) => {
      const d = document.createElement('div'); d.className = 'rung';
      d.innerHTML = `<span class="n">${i + 1}</span>${t}`; wrap.appendChild(d); return d;
    });
    const U = ['', '나만 보는 메모', '팀 내부 공유', '고객에게 발송', '공식 문서·계약'];
    const M = ['',
      '혼자 보는 메모라면 대충 맞는지 읽어 보는 정도로 충분합니다.',
      '동료가 이 내용을 믿고 일합니다. <strong>숫자·이름·날짜</strong>는 원자료와 맞춰 봅니다.',
      '회사 밖으로 나갑니다. 틀린 약속은 <strong>회사의 약속</strong>이 됩니다.',
      '법적 책임이 생길 수 있습니다. <strong>혼자 판단하지 말고</strong> 검토를 받습니다.'];
    const s = $('ld-s');
    function update() {
      const v = +s.value;
      let n = 0;
      els.forEach((e, i) => { const on = R[i][0] <= v; e.className = 'rung' + (on ? ' on' : '') + (R[i][0] === v && v > 1 ? ' new' : ''); if (on) n++; });
      $('ld-o').textContent = U[v]; $('ld-n').textContent = n + '가지'; $('ld-msg').innerHTML = M[v];
      $('ld-msg').className = 'callout' + (v >= 3 ? '' : ' b');
    }
    s.addEventListener('input', update);
    update();
  })();

  /* ───────── 4) AI 사용 표시 만들기 ───────── */
  (function disclose() {
    const pre = $('disc'); if (!pre) return;
    const btns = document.querySelectorAll('.tgl[data-g]');
    const pickd = (g) => Array.from(btns).filter((b) => b.dataset.g === g && b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.v);
    const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return c >= 0 && c <= 11171 && c % 28 ? a : b; };
    function update() {
      const tool = pickd('tool'), use = pickd('use'), me = pickd('me');
      const T = tool.length ? tool.join('와 ') : '[도구]';
      const Uu = use.length ? use.join(', ') : '[쓴 곳]';
      let t = `[AI 사용 표시] 이 과제는 ${T}를 활용해 ${Uu}에 도움을 받았습니다.`;
      if (me.length) { const last = me[me.length - 1]; t += ` ${me.join(', ')}${josa(last, '은', '는')} 본인이 직접 했습니다.`; }
      pre.textContent = t;
      const st = $('disc-st');
      if (!tool.length || !use.length) { st.className = 'status mid'; st.innerHTML = '<b class="k">무엇이 빠졌을까?</b>쓴 도구와 쓴 곳을 하나 이상 고르세요.'; }
      else if (!me.length) { st.className = 'status bad'; st.innerHTML = '<b class="k">내가 한 일이 비어 있어요</b>이대로면 AI가 다 한 것처럼 보입니다. 내가 <strong>확인하고 고치고 판단한 일</strong>을 고르세요.'; }
      else { st.className = 'status ok'; st.innerHTML = '<b class="k">좋은 표시입니다</b>도구·쓴 곳·내가 한 일이 모두 들어갔습니다. 복사해서 과제 끝에 붙이세요.'; }
    }
    btns.forEach((b) => b.addEventListener('click', () => { toggle(b); update(); }));
    update();
  })();
})();
