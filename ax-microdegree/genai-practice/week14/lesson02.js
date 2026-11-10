// 14주 2차시 전용: 표지 문서, 10개 항목 탐색기, 효과 계산기, 문단 고치기
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  /* ───────── 0) 표지: 열 개의 칸 ───────── */
  (function cover() {
    const g = $('cv-lines'); if (!g) return;
    const w = [210, 160, 230, 190, 150, 220, 170, 200, 140, 180];
    for (let i = 0; i < 10; i++) {
      const y = 112 + i * 28;
      el('circle', { cx: 140, cy: y, r: 9, class: i === 8 || i === 9 ? 'f-acc2s' : 'f-accs' }, g);
      el('text', { x: 140, y: y + 4.5, 'text-anchor': 'middle', style: `font-size:11px;font-weight:800;fill:${i >= 8 ? 'var(--accent-2)' : 'var(--accent)'}` }, g).textContent = i + 1;
      const r = el('rect', { x: 158, y: y - 6, width: w[i], height: 12, rx: 6, class: 'f-line' }, g);
      if (i === 2 || i === 5) { r.setAttribute('class', 'f-acc2'); r.setAttribute('opacity', '.75'); }
    }
  })();

  /* ───────── 1) 10개 항목 탐색기 ───────── */
  (function explorer() {
    const list = $('secs'), panel = $('ex-panel'); if (!list) return;
    const S = [
      { n: '제목', ic: 'target', w: '업무 + AI 쓰임 + 기대 결과를 한 줄로.', c: ['무슨 업무인가?', '무엇이 좋아지나?', '추정이면 (추정)'], g: '고객 후기 답글과 월간 요약, 생성형AI 초안 + 담당자 검토로 월 약 2시간 줄이기(추정)', b: 'AI를 활용한 업무 효율화 방안 — 어떤 업무인지 알 수 없다.' },
      { n: '요약', ic: 'log', w: '3~4문장: 문제 → 방안 → 효과(추정) → 주의. 이 칸만 읽고도 결정할 수 있게.', c: ['결론이 먼저', '숫자 하나 이상', '주의할 점 한 줄'], g: '후기 답글이 월말에 몰려 늦어진다. AI가 분류·답글 초안을 쓰고 담당자가 확인해 게시한다. 9월 기준 월 약 136분 절약(추정). 보상·규정 약속은 담당자가 확인한다.', b: '요즘 AI가 화제이며 여러 기업이 도입하고 있다… — 배경만 길고 결론이 없다.' },
      { n: '현재 업무와 문제', ic: 'alert', w: '지금의 작업 순서, 빈도와 시간, 문제의 근거(건수·사례). 모르는 숫자는 가정이라고 밝힌다.', c: ['작업 순서', '건수·시간', '근거 자료'], g: '1~9월 후기 120건, 1~2점 27건(22.5%). 답글은 건당 약 6분(가정). 부정 후기 중 6건이 “문의 답변이 늦었다”.', b: '후기가 너무 많아서 담당자가 힘들어한다. — 얼마나? 근거가 없다.' },
      { n: 'AI 활용 방안', ic: 'sparkles', w: '사용 도구, 프롬프트 원문, 사람과 AI가 나눠 맡는 작업 흐름. 남이 그대로 따라 할 수 있게.', c: ['도구 이름', '프롬프트 원문', '단계별 AI/사람'], g: '(사람) 후기를 표로 모은다 → (AI, Gemini 또는 Claude) 분류·답글 초안 → (사람) 약속·숫자·말투 확인 후 게시.', b: 'AI를 활용하여 후기를 처리한다. — 따라 할 수 없다.' },
      { n: '시연 결과', ic: 'eye', w: '가상 자료로 실제 해 본 입력과 출력, 내가 고친 점, AI가 틀린 점.', c: ['입력 일부', '출력 그대로', '고친 점'], g: 'AI 답글 초안에 “3~5분 불려 드세요”라는 근거 없는 숫자가 있어 “잠시 두었다가”로 고쳤다.', b: 'AI에게 후기를 넣어 보니 답글이 잘 나왔다. — 무엇이 잘 나왔는지 보이지 않는다.' },
      { n: '기대 효과', ic: 'trend', w: '가정과 계산식이 있는 추정치. 검토·수정 시간도 포함. 숫자로 어려운 효과는 말로.', c: ['가정 밝히기', '계산식', '검토 시간 포함'], g: '답글 19건 × (6−2)분 = 76분 + 요약 70분 − 모으기 10분 → 월 약 136분 절약(추정).', b: '업무 시간이 90% 줄어든다. — 어디서 나온 숫자인가?' },
      { n: '위험과 대응', ic: 'shield', w: '개인정보 · 저작권 · 환각 · 편향 — 이 개선안에서 생길 수 있는 일과 대응.', c: ['네 가지 모두', '구체적 대응', '사람 확인 단계'], g: '환각: AI가 없는 보상 규정을 지어낼 수 있다 → 약속은 [담당자 확인]으로 비우게 지시하고 게시 전 확인.', b: '위험은 특별히 없다. — 가장 위험한 문장.' },
      { n: '실행 계획', ic: 'clock', w: '작게 시범 → 점검 → 확대. 단계마다 할 일, 담당, 기간.', c: ['시범 범위', '점검 기준', '담당자'], g: '1~4주: 오픈마켓 후기만 시범, 처리 시간 기록 → 5주: 점검·프롬프트 수정 → 6주부터 전체 채널.', b: '다음 달부터 전 직원이 AI를 쓴다. — 범위도 점검도 없다.' },
      { n: 'AI 활용 내역', ic: 'bot', w: '개선안을 쓰며 생성형AI를 쓴 단계, 도구, 시킨 일, 내가 확인·수정한 것.', c: ['단계·도구', '시킨 일', '내가 고친 것'], g: 'Gemini: 9월 후기 분류(시연) → 채널 오류 수정 / Claude: 같은 프롬프트 비교 → 프롬프트 수정.', b: '(빈칸) 또는 “AI 사용함” 한 줄.' },
      { n: '참고 자료', ic: 'book', w: '사용한 자료·통계·규정의 원래 출처. AI 답변은 출처가 아니다.', c: ['원래 출처', '자료 이름', '확인한 날'], g: '바다결 고객 후기 2026년 1~9월 — 수업 공통 실습 자료 reviews_2026.csv', b: '참고: AI 답변 — 원래 자료를 확인하지 않았다.' },
    ];
    const btns = S.map((s, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'secbtn'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="n">${i + 1}</span>${s.n}`;
      b.addEventListener('click', () => pick(i));
      list.appendChild(b);
      return b;
    });
    function pick(i) {
      const s = S[i];
      btns.forEach((b, k) => b.setAttribute('aria-pressed', k === i));
      panel.innerHTML = `<div class="eh"><span class="ic-badge${i >= 8 ? ' o' : ''}"><svg class="ic"><use href="#i-${s.ic}"/></svg></span>${i + 1}. ${s.n}</div>`
        + `<div class="what">${s.w}</div>`
        + `<div class="chk">${s.c.map((c) => '<span>✓ ' + c + '</span>').join('')}</div>`
        + `<div class="ex-good"><b>예시 (바다결 후기 개선안)</b>${s.g}</div>`
        + `<div class="ex-bad"><b>흔한 실수</b>${s.b}</div>`;
    }
    pick(0);
  })();

  /* ───────── 2) 효과 계산기 ───────── */
  (function calc() {
    const n = $('c-n'); if (!n) return;
    const a = $('c-a'), b = $('c-b'), s = $('c-s'), x = $('c-x');
    const fmt = (m) => m >= 60 ? `${m}분(약 ${(m / 60).toFixed(1)}시간)` : `${m}분`;
    function update() {
      const N = +n.value, A = +a.value, B0 = +b.value, S0 = +s.value, mistake = x.getAttribute('aria-pressed') === 'true';
      const B = mistake ? 0.5 : B0;
      $('c-n-o').textContent = N + '건'; $('c-a-o').textContent = A + '분'; $('c-b-o').textContent = B0 + '분'; $('c-s-o').textContent = S0 + '분';
      const before = N * A, after = Math.round(N * B), save = before - after;
      const max = Math.max(before, after, 1);
      $('c-before').textContent = before + '분'; $('c-after').textContent = after + '분';
      $('c-bb').style.width = (before / max * 100) + '%'; $('c-ab').style.width = (after / max * 100) + '%';
      $('c-save').textContent = save + '분';
      $('c-save').classList.toggle('o', save <= 0 || mistake);
      const out = $('c-text');
      if (mistake) {
        const real = N * (A - B0);
        out.innerHTML = `<b class="k" style="color:var(--bad)">과장된 계산</b>AI 초안을 <strong>읽고 고치는 시간</strong>을 빼면 절약이 ${fmt(save)}까지 부풀려집니다. 검토를 넣은 실제 추정은 <strong>${fmt(Math.max(real, 0))}</strong>입니다.`;
        return;
      }
      if (save <= 0) {
        out.innerHTML = '<b class="k" style="color:var(--bad)">AI가 오히려 느림</b>확인·수정이 직접 하는 것보다 오래 걸린다면, 이 업무는 개선안 주제로 맞지 않을 수 있습니다. 다른 단계를 찾아보세요.';
        return;
      }
      const pct = Math.round(save / before * 100);
      const pay = S0 === 0 ? '준비 시간 없음' : (S0 <= save ? '첫 달 안에 준비 시간을 회수' : `약 ${Math.ceil(S0 / save)}개월이면 준비 시간을 회수`);
      out.innerHTML = `<b class="k">개선안에 이렇게 씁니다</b>가정: 월 ${N}건, 건당 ${A}분 → ${B0}분(검토 포함). 계산: ${N}건 × (${A}−${B0})분 = <strong>월 ${fmt(save)} 절약(추정, ${pct}%)</strong>. 처음 준비 ${S0}분 → ${pay}(추정).`;
    }
    [n, a, b, s].forEach((r) => r.addEventListener('input', update));
    x.addEventListener('click', () => { x.setAttribute('aria-pressed', x.getAttribute('aria-pressed') !== 'true'); update(); });
    update();
  })();

  /* ───────── 3) 문단 고치기 ───────── */
  (function fix() {
    const tabs = $('fx-tabs'); if (!tabs) return;
    const P = [
      { t: '현재 업무와 문제', w: '요즘 후기가 너무 많아서 담당자가 많이 힘들어한다. 그래서 AI가 꼭 필요하다.',
        o: [['a', '문장이 너무 짧다'], ['b', '근거(건수·시간·사례)가 없다'], ['c', 'AI 도구 이름이 없다']], ans: 'b',
        e: '“많다”, “힘들다”는 느낌입니다. 읽는 사람은 <strong>얼마나</strong>인지 묻습니다.',
        f: '1~9월 후기는 <mark>120건</mark>이고 그중 1~2점 후기가 <mark>27건(22.5%)</mark>이다. 담당자는 후기를 하나씩 읽고 답글을 직접 쓰며 <mark>건당 약 6분(가정)</mark>이 걸린다. 부정 후기 중 <mark>6건</mark>은 “문의 답변이 늦었다”는 내용이다.' },
      { t: '기대 효과', w: 'AI를 도입하면 업무 시간이 90% 줄고 고객 만족도가 크게 오를 것이다.',
        o: [['a', '근거 없는 숫자로 단정했다'], ['b', '긍정적인 표현이 부족하다'], ['c', '고객 만족도는 쓰면 안 된다']], ans: 'a',
        e: '90%는 어디서 나왔을까요? 검토 시간도 빠졌습니다. 만족도는 <strong>아직 알 수 없는 효과</strong>입니다.',
        f: '9월 후기 19건 기준, <mark>건당 6분 → 2분(검토 포함)</mark>으로 가정하면 답글 작성 시간이 <mark>114분 → 38분</mark>으로 줄어든다(추정). 고객 만족도 변화는 <mark>실행 후 별점 추이로 확인</mark>한다.' },
      { t: 'AI 활용 방안', w: 'AI를 활용해 후기를 효율적으로 처리한다.',
        o: [['a', '‘효율적’이라는 말이 어렵다'], ['b', '후기 대신 문의를 다뤄야 한다'], ['c', '도구·프롬프트·흐름이 없어 따라 할 수 없다']], ans: 'c',
        e: '이 문장만으로는 내일 누구도 따라 할 수 없습니다.',
        f: '① (사람) 지난주 후기를 <mark>고객 정보 없이</mark> 표로 모은다 ② (AI) <mark>Gemini(학교 계정) 또는 Claude</mark>에 [후기 분류 프롬프트]를 넣어 분류와 답글 초안을 받는다 ③ (사람) <mark>약속·숫자·말투를 확인</mark>해 고친 뒤 게시한다.' },
      { t: '위험과 대응', w: '생성형AI는 성능이 좋아서 위험은 특별히 없다.',
        o: [['a', '성능을 숫자로 쓰지 않았다'], ['b', '위험을 숨겨 오히려 믿기 어렵다'], ['c', '위험 칸은 원래 비워 둔다']], ans: 'b',
        e: '위험이 없는 도구는 없습니다. 위험을 알고 <strong>대응을 정했다</strong>는 것이 신뢰를 줍니다.',
        f: '<mark>개인정보</mark>: 주문자 이름·연락처는 지우고 넣는다. <mark>환각</mark>: 없는 보상 규정을 지어낼 수 있어 약속은 담당자가 확인한다. <mark>편향</mark>: 채널별로 말투가 달라지지 않는지 매주 3건씩 비교한다. <mark>저작권</mark>: 후기를 광고에 쓰려면 별도 동의가 필요할 수 있어 답글용으로만 쓴다.' },
    ];
    const done = new Set();
    let cur = 0;
    const tbtn = P.map((p, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tab'; b.setAttribute('aria-pressed', 'false'); b.textContent = p.t;
      b.addEventListener('click', () => show(i));
      tabs.appendChild(b);
      return b;
    });
    function show(i) {
      cur = i; const p = P[i];
      tbtn.forEach((b, k) => b.setAttribute('aria-pressed', k === i));
      $('fx-weak').innerHTML = `<b class="k">약한 문단 · ${p.t}</b>${p.w}`;
      const fx = $('fx-fixed');
      fx.innerHTML = `<b class="k">고친 문단</b>${p.f}`;
      fx.hidden = !done.has(i);
      const d = $('fx-diag'); d.innerHTML = '';
      p.o.forEach(([v, txt]) => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = txt;
        if (done.has(i)) { b.disabled = true; if (v === p.ans) b.classList.add('correct'); }
        b.addEventListener('click', () => {
          if (v === p.ans) {
            d.querySelectorAll('button').forEach((x) => { x.disabled = true; });
            b.classList.add('correct'); done.add(i); tbtn[i].classList.add('done');
            fx.hidden = false;
            $('fx-msg').innerHTML = '<strong>맞습니다.</strong> ' + p.e + (done.size < P.length ? ' 다른 탭도 고쳐 보세요.' : ' 네 문단을 모두 고쳤습니다!');
            $('fx-msg').className = 'callout b';
            $('fx-score').textContent = done.size + ' / ' + P.length + ' 고침';
          } else {
            b.classList.add('wrong'); b.disabled = true;
            $('fx-msg').innerHTML = '다시 생각해 보세요. 읽는 사람이 이 문단을 보고 <strong>가장 먼저 물을 질문</strong>은 무엇일까요?';
            $('fx-msg').className = 'callout';
          }
        });
        d.appendChild(b);
      });
      if (!done.has(i)) { $('fx-msg').className = 'callout b'; $('fx-msg').innerHTML = '진단을 고르면 <strong>고친 문단</strong>이 나타납니다.'; }
    }
    show(0);
  })();
})();
