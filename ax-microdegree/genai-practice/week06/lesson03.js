// 6주 3차시 전용: 브리프 조립 보드, 출처 표기 고치기, 제출 전 점검표
(function () {
  const $ = (id) => document.getElementById(id);
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };

  /* ───────── 1) 브리프 조립 보드 ───────── */
  (function board() {
    const pool = $('pool'), slotsEl = $('slots'); if (!pool) return;
    const SLOTS = [
      { k: 'title', name: '① 제목', ic: 'log', wide: true },
      { k: 'sum', name: '② 핵심 요약', ic: 'check' },
      { k: 'table', name: '③ 표', ic: 'chart' },
      { k: 'impl', name: '④ 시사점 (할 일)', ic: 'bulb' },
      { k: 'src', name: '⑤ 출처 목록', ic: 'book' },
      { k: 'out', name: '빼기 — 본문에 쓰지 않음', ic: 'x', wide: true, bin: true },
    ];
    // ok: 알맞은 칸(여러 개 가능), why: 점검 때 보여 줄 이유
    const CHIPS = [
      { t: '제목: 20~30대 그래놀라 수요 조사 (2026.11.)', ok: ['title'], why: '무엇을·언제 조사했는지 담은 제목' },
      { t: '20대 38%·30대 41% 최근 1년 구매 [확인]', ok: ['sum', 'table'], why: '확인된 핵심 사실' },
      { t: '구매 이유 1위 ‘아침 식사 대용’ [확인]', ok: ['sum'], why: '확인된 핵심 사실' },
      { t: '바다결 그래놀라 1월 1,871개 → 9월 2,076개 [확인·내부]', ok: ['sum', 'table'], why: '직접 계산한 내부 사실' },
      { t: '경쟁 3종 가격·용량 비교 [확인·11.3. 기준]', ok: ['table'], why: '비교가 필요한 내용은 표로' },
      { t: '“덜 단 아침 한 끼” 문구를 자사몰에서 시험 [제안]', ok: ['impl'], why: '사실에서 나온 바다결의 할 일' },
      { t: '1인 소포장 선호 [추정·근거 없음] → 설문으로 확인', ok: ['impl'], why: '추정이라고 밝히고 확인 계획과 함께 시사점에' },
      { t: '한국건강간식협회(가상), 「2026 건강 간식 소비자 조사」, 협회 누리집, 2026.6. (11.3. 확인)', ok: ['src'], why: '팀 형식에 맞춘 출처' },
      { t: '시장 매년 15% 성장 [확인 안 됨·AI 답변]', ok: ['out'], why: '원문이 없는 AI 답변 — 본문에서 뺀다' },
      { t: '시장 3년 새 2배 [출처 불명 블로그]', ok: ['out'], why: '근거 없는 제휴 광고 글 — 본문에서 뺀다' },
    ];
    const where = CHIPS.map(() => null);
    let sel = null, checked = false;
    const SNAME = Object.fromEntries(SLOTS.map((s) => [s.k, s.name]));
    const slotIn = {};
    SLOTS.forEach((s) => {
      const d = document.createElement('div');
      d.className = 'slot' + (s.wide ? ' wide' : '') + (s.bin ? ' bin' : '');
      d.dataset.k = s.k; d.tabIndex = 0; d.setAttribute('role', 'button'); d.setAttribute('aria-label', s.name + ' 칸');
      d.innerHTML = `<span class="lb"><svg class="ic"><use href="#i-${s.ic}"/></svg>${s.name}</span><div class="in"></div>`;
      const put = () => { if (sel !== null) { where[sel] = s.k; sel = null; checked = false; render(); } };
      d.addEventListener('click', (e) => { if (e.target.closest('.chip')) return; put(); });
      d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); put(); } });
      d.addEventListener('dragover', (e) => { e.preventDefault(); d.classList.add('drop'); });
      d.addEventListener('dragleave', () => d.classList.remove('drop'));
      d.addEventListener('drop', (e) => { e.preventDefault(); d.classList.remove('drop'); const i = +e.dataTransfer.getData('text/plain'); if (!isNaN(i)) { where[i] = s.k; sel = null; checked = false; render(); } });
      slotsEl.appendChild(d); slotIn[s.k] = d.querySelector('.in');
    });
    pool.addEventListener('dragover', (e) => { e.preventDefault(); pool.classList.add('drop'); });
    pool.addEventListener('dragleave', () => pool.classList.remove('drop'));
    pool.addEventListener('drop', (e) => { e.preventDefault(); pool.classList.remove('drop'); const i = +e.dataTransfer.getData('text/plain'); if (!isNaN(i)) { where[i] = null; checked = false; render(); } });
    const chips = CHIPS.map((c, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.draggable = true;
      b.addEventListener('click', (e) => { e.stopPropagation(); sel = sel === i ? null : i; render(); });
      b.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', String(i)); sel = i; });
      return b;
    });
    const right = (i) => where[i] !== null && CHIPS[i].ok.includes(where[i]);
    function render() {
      CHIPS.forEach((c, i) => {
        const b = chips[i];
        const target = where[i] === null ? pool : slotIn[where[i]];
        if (b.parentElement !== target) target.appendChild(b);
        b.setAttribute('aria-pressed', sel === i);
        const mark = checked && where[i] !== null ? (right(i) ? '✓' : '✗') : '';
        b.className = 'chip' + (mark ? (right(i) ? ' good' : ' bad') : '');
        b.innerHTML = (mark ? `<span class="mk">${mark}</span>` : '') + c.t;
      });
      const placed = where.filter((w) => w !== null).length, ok = CHIPS.filter((c, i) => right(i)).length;
      $('bd-n').textContent = (checked ? ok : 0) + ' / 10';
      $('bd-bar').style.width = (checked ? ok * 10 : 0) + '%';
      const st = $('bd-st');
      if (!checked) {
        st.className = 'status mid';
        st.innerHTML = sel !== null
          ? `<b class="k">조각을 골랐습니다</b>놓을 칸을 누르세요. 다시 누르면 선택이 풀립니다.`
          : `<b class="k">${placed} / 10 놓음</b>${placed < 10 ? '남은 조각도 칸에 놓아 보세요.' : '모두 놓았습니다. 점검하기를 누르세요.'}`;
        return;
      }
      const wrong = CHIPS.map((c, i) => i).filter((i) => where[i] !== null && !right(i));
      if (ok === 10) {
        st.className = 'status ok';
        st.innerHTML = '<b class="k">완벽한 브리프!</b>확인된 사실은 요약·표에, 제안과 추정은 시사점에, 확인 안 된 내용은 <strong>빼기</strong>로.';
      } else if (wrong.length) {
        const i = wrong[0], c = CHIPS[i];
        st.className = 'status bad';
        st.innerHTML = `<b class="k">${wrong.length}개 조각을 다시 보세요</b>“${c.t.slice(0, 18)}…” → ${SNAME[c.ok[0]]} 칸이 알맞습니다. ${c.why}.`;
      } else {
        st.className = 'status mid';
        st.innerHTML = `<b class="k">놓은 조각은 모두 맞습니다</b>아직 ${10 - placed}개가 남았습니다.`;
      }
    }
    $('bd-check').addEventListener('click', () => { checked = true; sel = null; render(); });
    $('bd-reset').addEventListener('click', () => { where.fill(null); sel = null; checked = false; render(); });
    render();
  })();

  /* ───────── 2) 출처 표기 고치기 ───────── */
  (function fixer() {
    const tabsEl = $('cf-tabs'); if (!tabsEl) return;
    const N = (t) => `<span class="p new">${t}</span>`;
    const M = (t) => `<span class="miss">[${t}?]</span>`;
    const C = [
      { before: '협회 보고서 https://example.com/kfsa/2026-survey',
        fix: [['org', '작성 기관 이름 쓰기'], ['title', '보고서 제목을 「」로'], ['pub', '매체·발행일 넣기'], ['chk', '확인일 붙이기']],
        build: (f) => `${f.org ? N('한국건강간식협회(가상)') : M('누가')}, ${f.title ? N('「2026 건강 간식 소비자 조사」') : M('제목')}, ${f.pub ? N('협회 누리집, 2026.6.') : M('매체·발행일')} https://example.com/kfsa/2026-survey ${f.chk ? N('(2026.11.3. 확인)') : M('확인일')}`,
        done: '보고서 출처 완성. 누가·무엇·어디·언제·확인일이 모두 있습니다.' },
      { before: '가상일보, 2026/8/12, 김하늘 기자, 아침 대용 그래놀라 찾는 2030',
        fix: [['order', '순서 맞추기 (작성자 → 제목 → 매체 → 날짜)'], ['date', '날짜 형식 통일 (2026.8.12.)'], ['url', 'URL과 확인일 붙이기']],
        build: (f) => {
          const d = f.date ? N('2026.8.12.') : '<span class="miss">2026/8/12</span>';
          const u = f.url ? N('https://example.com/gasang-daily/2026/08/12/granola (2026.11.3. 확인)') : M('URL·확인일');
          return f.order ? `${N('김하늘(가상일보)')}, ${N('「아침 대용 그래놀라 찾는 2030」')}, 가상일보, ${d} ${u}` : `가상일보, ${d}, 김하늘 기자, 아침 대용 그래놀라 찾는 2030 ${u}`;
        },
        done: '기사 출처 완성. 다른 출처와 같은 순서·같은 날짜 형식이 되었습니다.' },
      { before: '출처: 인터넷',
        fix: [['find', '실제 페이지를 찾아 형식대로 쓰기'], ['drop', '인용할 만한가? → 목록에서 빼기']],
        build: (f) => {
          const t = f.find ? `${N('푸드트렌드 블로그(가상)')}, ${N('「요즘 뜨는 그래놀라 TOP5」')}, 블로그, ${N('날짜 없음')}. ${N('https://example.com/foodtrend-blog/granola-top5')}` : `<span class="miss">출처: 인터넷</span> ${M('어떤 페이지')}`;
          return f.drop ? `<span class="after out">${t}</span>` : t;
        },
        memo: (f) => f.drop ? '근거 없는 제휴 광고 글이라 브리프 본문에 쓰지 않습니다. <strong>쓰지 않은 자료는 출처 목록에서도 뺍니다.</strong> (필요하면 “뺀 내용”에 이유만)' : '“인터넷”은 출처가 아닙니다. 어떤 페이지인지 찾아야 판단할 수 있습니다.',
        done: '먼저 정확히 찾아 적고, 그다음 인용할 만한지 판단했습니다.' },
      { before: 'Gemini 답변 (2026)',
        fix: [['orig', 'AI가 가리킨 원문을 확인해 바꾸기'], ['note', 'AI 활용 사실은 따로 밝히기']],
        build: (f) => f.orig ? `<span class="after out">Gemini 답변 (2026)</span><br>→ ${N('[S1] 협회 소비자 조사 원문')}으로 대체 (이미 목록에 있음) · 「2026 시장 보고서」는 ${N('찾지 못해 넣지 않음')}` : `<span class="miss">Gemini 답변 (2026)</span>`,
        memo: (f) => f.note ? '<b>브리프 맨 끝:</b> ※ 자료 탐색과 초안 작성에 생성형AI(Gemini·Claude)를 활용했고, 모든 수치는 원문·내부 자료로 확인함.' : 'AI 답변은 출처가 아니라 출처를 찾아 주는 도구입니다.',
        done: 'AI가 가리킨 원문만 남기고, AI를 쓴 사실은 따로 밝혔습니다.' },
    ];
    const state = C.map(() => ({}));
    let cur = 0;
    const tabs = C.map((c, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = '출처 ' + (i + 1);
      b.addEventListener('click', () => { cur = i; render(); });
      tabsEl.appendChild(b); return b;
    });
    const isDone = (i) => C[i].fix.every(([k]) => state[i][k]);
    function render() {
      const c = C[cur], f = state[cur];
      tabs.forEach((b, i) => { b.setAttribute('aria-pressed', i === cur); b.classList.toggle('done', isDone(i)); });
      const fixEl = $('cf-fix'); fixEl.innerHTML = '';
      c.fix.forEach(([k, label]) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'tgl'; b.setAttribute('aria-pressed', !!f[k]);
        b.innerHTML = `<span class="chk"></span>${label}`;
        b.addEventListener('click', () => { f[k] = toggle(b); render(); });
        fixEl.appendChild(b);
      });
      $('cf-cite').innerHTML = `<div class="before">고치기 전: <s>${c.before}</s></div><div class="after">${c.build(f)}</div>` + (c.memo ? `<div class="memo">${c.memo(f)}</div>` : '');
      const n = C.filter((x, i) => isDone(i)).length;
      $('cf-n').textContent = n + ' / 4';
      $('cf-bar').style.width = n * 25 + '%';
      const st = $('cf-st'), left = c.fix.filter(([k]) => !f[k]).length;
      if (isDone(cur)) {
        st.className = 'status ok';
        st.innerHTML = `<b class="k">출처 ${cur + 1} 완성</b>${c.done}` + (n === 4 ? '<br><strong>네 출처 모두 고쳤습니다!</strong> 이제 한 문서 안의 형식이 같습니다.' : '');
      } else {
        st.className = 'status mid';
        st.innerHTML = `<b class="k">출처 ${cur + 1} · 고칠 곳 ${left}개 남음</b>빨간 글씨가 빠졌거나 형식이 다른 부분입니다.`;
      }
    }
    render();
  })();

  /* ───────── 3) 제출 전 점검표 ───────── */
  (function checklist() {
    const wrap = $('ck'); if (!wrap) return;
    const items = [
      '핵심 요약이 세 줄이고, 숫자마다 [S번호]가 있다',
      '모든 문장에 확인·추정·확인 필요가 붙어 있다',
      '‘확인 안 됨’ 내용은 본문에 없다 (뺀 내용에만)',
      '시사점이 “그래서 바다결은 무엇을?”에 답한다',
      '출처 목록이 한 형식이고 확인일이 있다',
      '생성형AI를 활용한 사실을 밝혔다',
    ];
    let n = 0;
    items.forEach((t) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tgl'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="chk"></span>${t}`;
      b.addEventListener('click', () => { n += toggle(b) ? 1 : -1; update(); });
      wrap.appendChild(b);
    });
    function update() {
      $('ck-n').textContent = n + ' / 6';
      $('ck-bar').style.width = Math.round(n / 6 * 100) + '%';
      const st = $('ck-st');
      if (n === 6) { st.className = 'status ok'; st.innerHTML = '<b class="k">제출 준비 끝</b>대표가 한눈에 읽고, 필요하면 원문까지 찾아볼 수 있는 브리프입니다.'; }
      else if (n >= 3) { st.className = 'status mid'; st.innerHTML = `<b class="k">${6 - n}개 남음</b>체크하지 못한 항목을 고친 뒤 다시 확인하세요.`; }
      else { st.className = 'status mid'; st.innerHTML = '<b class="k">내 브리프를 옆에 두고</b>왼쪽 완성 예시와 비교하며 하나씩 체크하세요.'; }
    }
    update();
  })();
})();
