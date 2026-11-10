// 1주 2차시 전용: 수업 준비 체크리스트, 채팅 화면 구조, 다시 생성 vs 질문 수정, 두 답 점검
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };

  /* ───────── 1) 수업 준비 체크리스트 ───────── */
  (function ready() {
    const wrap = $('ready'); if (!wrap) return;
    const KEY = 'genai-w01l02-ready';
    const G = [
      ['Gemini', 'var(--accent)', ['학교 Google 계정으로 Gemini에 로그인했다', '프로필을 눌러 학교 계정인지 확인했다']],
      ['Claude', 'var(--accent-2)', ['Claude 무료 계정을 만들고 로그인했다', '새 대화를 열어 인사를 보내 보았다']],
      ['공통', 'var(--muted)', ['두 사이트를 브라우저 즐겨찾기에 추가했다', '두 도구의 데이터·개인정보 설정 위치를 찾아보았다', '같은 프롬프트를 두 도구에 보내 비교했다']],
    ];
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { saved = []; }
    const btns = [];
    G.forEach(([g, c, items]) => {
      const h = document.createElement('div'); h.className = 'grp';
      h.innerHTML = `<i class="dot" style="background:${c}"></i>${g}`; wrap.appendChild(h);
      items.forEach((t) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'tgl';
        const i = btns.length;
        b.setAttribute('aria-pressed', saved[i] ? 'true' : 'false');
        b.innerHTML = '<span class="chk"></span>' + t;
        b.addEventListener('click', () => { toggle(b); update(); });
        wrap.appendChild(b); btns.push(b);
      });
    });
    function update() {
      const st = btns.map((b) => b.getAttribute('aria-pressed') === 'true');
      const n = st.filter(Boolean).length, N = btns.length;
      try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* 저장 안 되어도 동작 */ }
      $('rd-n').textContent = n + ' / ' + N;
      $('rd-bar').style.width = Math.round(n / N * 100) + '%';
      const s = $('rd-st');
      if (n === N) { s.className = 'status ok'; s.innerHTML = '<b class="k">수업 준비 완료!</b>두 도구 모두 쓸 준비가 되었습니다. 다음 차시부터 바로 따라 할 수 있습니다.'; }
      else if (n >= 4) { s.className = 'status mid'; s.innerHTML = `<b class="k">거의 다 왔어요</b>${N - n}개 남았습니다. 마지막 항목은 이 차시 끝의 첫 실습에서 합니다.`; }
      else { s.className = 'status mid'; s.innerHTML = '<b class="k">준비 중</b>영상을 멈추고 한 가지씩 직접 해 본 뒤 체크하세요.'; }
    }
    $('rd-reset').addEventListener('click', () => { btns.forEach((b) => b.setAttribute('aria-pressed', 'false')); update(); });
    update();
  })();

  /* ───────── 2) 채팅 화면 구조 ───────── */
  (function ui() {
    const svg = $('ui'); if (!svg) return;
    const I = {
      1: ['plus', '① 새 대화', '새 주제를 시작하는 버튼. 보통 화면 왼쪽 위 메뉴에 있습니다.', '주제가 바뀌면 항상 새 대화부터'],
      2: ['clock', '② 대화 기록', '지난 대화 목록. 다시 열어 이어 쓰거나, 이름을 바꾸거나, 삭제할 수 있습니다.', '과제별로 대화 이름을 바꿔 두면 찾기 쉽다'],
      3: ['pen', '③ 입력창', '프롬프트를 쓰는 곳. 대부분 Enter는 보내기, Shift + Enter는 줄바꿈입니다.', '긴 글은 메모장에 써서 붙여 넣기'],
      4: ['clip', '④ 파일 첨부', '입력창 옆의 + 또는 클립 모양. 문서·표·이미지를 올릴 수 있습니다.', '올리기 전에: 개인정보·기밀이 없는가? (1-3)'],
      5: ['play', '⑤ 보내기', '화살표 모양 버튼. 답이 나오는 도중에 멈추는 버튼으로 바뀌기도 합니다.', '답이 엉뚱하게 흘러가면 멈추고 고쳐 보내기'],
      6: ['reset', '⑥ 답변 도구', '답 아래의 작은 버튼들: 복사, 다시 생성(다른 답 받기), 좋아요·싫어요 평가 등.', '다시 생성 vs 질문 수정 → 직접 해 보기 3'],
      7: ['gear', '⑦ 설정·계정', '이름이나 프로필을 누르면 설정이 열립니다. 데이터·개인정보 설정도 여기에 있습니다.', '로그인한 계정이 맞는지도 여기서 확인'],
    };
    const hots = svg.querySelectorAll('.hot'), zones = svg.querySelectorAll('.zone');
    function pick(z) {
      hots.forEach((h) => h.classList.toggle('on', h.dataset.z === z));
      zones.forEach((r) => r.classList.toggle('on', r.dataset.z === z));
      const [ic, h, d, tip] = I[z];
      $('ui-ic').innerHTML = `<svg class="ic"><use href="#i-${ic}"/></svg>`;
      $('ui-h').textContent = h; $('ui-d').textContent = d; $('ui-tip').textContent = '→ ' + tip;
    }
    hots.forEach((h) => {
      h.addEventListener('click', () => pick(h.dataset.z));
      h.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(h.dataset.z); } });
    });
  })();

  /* ───────── 3) 다시 생성 vs 질문 수정 (미리 써 둔 예시 답) ───────── */
  (function regen() {
    const q = $('rg-q'), a = $('rg-a'); if (!q) return;
    const Q0 = '그래놀라 홍보 문구 써 줘.';
    const Q1 = '바다결 다크초코 그래놀라 홍보 문구를 써 줘. 대상은 20~30대 직장인, 퇴근 후 간식이라는 느낌으로, 20자 이내 2개.';
    const A0 = [
      '건강한 아침의 시작! 고소한 곡물과 달콤한 과일이 가득한 그래놀라로 하루를 활기차게 열어 보세요. 우유, 요거트 어디에나 잘 어울립니다.',
      '바삭함 속에 담긴 자연의 맛. 온 가족이 함께 즐기는 영양 가득 그래놀라, 지금 만나 보세요!',
      '아침을 거르기 쉬운 당신에게. 한 그릇의 그래놀라가 든든한 에너지를 채워 드립니다. 다이어트 중에도 부담 없이!',
    ];
    const A1 = '1. 퇴근길, 달콤한 한 줌의 쉼표\n2. 오늘 수고한 나에게 다크초코';
    let n = 0, edited = false;
    function render(anim) {
      q.textContent = edited ? Q1 : Q0;
      a.innerHTML = '<span class="who">AI · 예시 답변' + (edited ? ' (수정한 질문)' : n ? ` (다시 생성 ${n}번째)` : '') + '</span>' + esc(edited ? A1 : A0[n % A0.length]);
      if (anim) { a.classList.remove('re'); void a.offsetWidth; a.classList.add('re'); }
      $('rg-n').textContent = n + '번';
      $('rg-v').textContent = edited ? '수정' : '처음';
      const m = $('rg-msg');
      if (edited) m.innerHTML = '질문에 <strong>제품·대상·느낌·길이</strong>를 넣자 원하는 답에 바로 가까워졌습니다. 조건이 빠졌다면 다시 생성보다 <strong>질문 수정</strong>.';
      else if (n >= 2) m.innerHTML = `다시 생성 ${n}번 — 문장은 바뀌지만 여전히 <strong>길고, 대상도 제품도 막연</strong>합니다. 질문에 없는 조건은 AI도 모릅니다.`;
      else if (n === 1) m.innerHTML = '같은 질문으로 <strong>다른 답</strong>이 나왔습니다. 한 번 더 눌러 보세요.';
      else m.innerHTML = '<strong>다시 생성</strong>은 같은 질문으로 다른 답을, <strong>질문 수정</strong>은 고친 질문으로 새 답을 받습니다.';
    }
    $('rg-re').addEventListener('click', () => { n++; render(true); });
    $('rg-ed').addEventListener('click', () => { edited = true; render(true); });
    $('rg-0').addEventListener('click', () => { n = 0; edited = false; render(true); });
    render(false);
  })();

  /* ───────── 4) 두 답 점검 ───────── */
  (function compare() {
    const box = $('cmp'); if (!box) return;
    const LIMIT = 40;
    // [문장, 회사 자료에 없는 사실 부분(없으면 null)]
    const A = [
      ['바쁜 아침, 우유만 부으면 든든한 한 끼가 완성돼요.', null],
      ['오후 3시의 허기, 책상 위 그래놀라 한 줌으로 달래 보세요.', null],
      ['부산 기장 직영 농장에서 키운 귀리로 만든 바다결 그래놀라.', '부산 기장 직영 농장에서 키운 귀리'],
    ];
    const B = [
      ['출근길 5분, 바다결 오리지널 그래놀라로 아침을 챙기세요.', null],
      ['야근하는 날에도 가볍고 든든하게, 바삭한 그래놀라 한 그릇.', null],
      ['9,800원으로 일주일 아침을 책임지는 바다결 오리지널 그래놀라, 지금 자사몰에서 만나 보세요.', null],
      ['건강한 하루의 시작, 바다결과 함께.', null],
    ];
    const len = (s) => [...s].length;
    function fill(ol, list, cntEl) {
      ol.innerHTML = list.map(([s, f], i) => {
        let t = esc(s);
        if (f) t = t.replace(esc(f), `<span class="fact">${esc(f)}</span>`);
        const L = len(s);
        return `<li class="${i >= 3 ? 'extra' : ''}">${t}<span class="len ${L > LIMIT ? 'over' : ''}">${L}자</span></li>`;
      }).join('');
      cntEl.textContent = list.length + '개'; cntEl.className = 'cnt ' + (list.length === 3 ? 'ok' : 'bad');
    }
    fill($('ans-a'), A, $('cnt-a')); fill($('ans-b'), B, $('cnt-b'));
    const on = { cnt: false, len: false, fact: false };
    const overB = B.filter(([s]) => len(s) > LIMIT).length, overA = A.filter(([s]) => len(s) > LIMIT).length;
    function update() {
      ['cnt', 'len', 'fact'].forEach((k) => box.classList.toggle('c-' + k, on[k]));
      const st = $('cmp-st'), parts = [];
      if (on.cnt) parts.push(`개수: A는 3개, B는 <strong>${B.length}개</strong> — B가 조건을 어겼습니다.`);
      if (on.len) parts.push(`길이: 40자 넘는 문장 A ${overA}개, B <strong>${overB}개</strong>.`);
      if (on.fact) parts.push('사실: A의 <strong>“기장 직영 농장 귀리”</strong>는 회사 자료에 없는 내용 — AI가 지어냈을 수 있습니다.');
      if (!parts.length) { st.className = 'status mid'; st.innerHTML = '<b class="k">어느 쪽이 나을까?</b>먼저 눈으로 읽고 고른 뒤, 기준을 켜서 확인하세요.'; return; }
      const all = on.cnt && on.len && on.fact;
      st.className = 'status ' + (all ? 'ok' : 'bad');
      st.innerHTML = `<b class="k">${all ? '결론: 둘 다 그대로는 못 쓴다' : '점검 결과'}</b>` + parts.join('<br>') + (all ? '<br>좋은 문장만 골라 <strong>고쳐 쓰는 것</strong>이 사람의 몫입니다.' : '');
    }
    document.querySelectorAll('.tgl[data-c]').forEach((b) => b.addEventListener('click', () => { on[b.dataset.c] = toggle(b); update(); }));
    update();
  })();
})();
