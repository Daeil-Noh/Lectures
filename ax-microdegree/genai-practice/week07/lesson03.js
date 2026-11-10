// 7주 3차시 전용: 7주 지도, 이럴 땐 어떤 습관?, 중간고사 준비 점검표
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };

  /* ───────── 0) 표지: 길 위의 1~7주 ───────── */
  (function cover() {
    const road = $('road'), g = $('cover-stops'); if (!road || !g) return;
    const L = road.getTotalLength();
    for (let w = 1; w <= 7; w++) {
      const p = road.getPointAtLength(L * (w - 1) / 7.4);
      el('circle', { cx: p.x, cy: p.y, r: 20, class: w === 7 ? 'f-acc2' : 'f-acc' }, g);
      el('text', { x: p.x, y: p.y + 6, 'text-anchor': 'middle', fill: 'var(--surface)' }, g).textContent = w;
    }
  })();

  /* ───────── 1) 7주 지도 ───────── */
  (function map() {
    const svg = $('map'); if (!svg) return;
    const AREA = {
      base: { n: '원리·한계', c: 'var(--muted)', ic: 'bot' },
      prompt: { n: '프롬프트', c: 'var(--accent)', ic: 'chat' },
      doc: { n: '문서', c: 'var(--accent-2)', ic: 'log' },
      res: { n: '리서치', c: 'var(--ok)', ic: 'link' },
      data: { n: '데이터', c: 'color-mix(in srgb, var(--accent) 55%, var(--accent-2))', ic: 'chart' },
    };
    const W = [
      { w: 1, a: 'base', x: 90, y: 110, h: 'AI 전환과 일의 변화', l: ['생성형AI가 바꾸는 직무와 활용 사례', '수업에 쓸 AI 도구 준비하기(Gemini·Claude)', '안전 규칙: 개인정보·기밀·저작권'], k: '개인정보·기밀은 넣지 않는다 — 어떤 도구든 같다' },
      { w: 2, a: 'base', x: 250, y: 110, h: '생성형AI 이해하기', l: ['LLM은 어떻게 답을 만드는가', '텍스트·이미지·영상 AI 도구 비교', 'AI의 한계: 환각과 편향'], k: '다음 말을 예측한다 → 그럴듯하지만 틀릴 수 있다' },
      { w: 3, a: 'prompt', x: 410, y: 110, h: '프롬프트 기초', l: ['좋은 프롬프트의 구성(역할·맥락·지시·형식)', '같은 질문, 다른 결과 비교하기', '대화로 결과 다듬기'], k: '역할·맥락·지시·형식, 그리고 이어서 다듬기' },
      { w: 4, a: 'prompt', x: 570, y: 110, h: '프롬프트 활용', l: ['예시 제시와 단계별 지시', '나만의 업무 프롬프트 템플릿', '템플릿 적용 실습'], k: '예시로 보여 주고, 단계로 나누고, 틀로 남긴다' },
      { w: 5, a: 'doc', x: 570, y: 300, h: '문서 작성', l: ['보고서·기획서 초안 작성', '이메일·공문 작성', '요약과 교정 (과제1: 업무 문서 작성)'], k: '초안은 AI, 사실·어조·책임은 나' },
      { w: 6, a: 'res', x: 410, y: 300, h: '리서치와 정보 검증', l: ['시장·트렌드 조사', '출처 확인과 팩트체크', '조사 결과 정리 실습'], k: '숫자·인용·링크는 원 출처를 직접 연다' },
      { w: 7, a: 'data', x: 250, y: 300, h: '데이터 활용', l: ['스프레드시트 데이터를 AI로 분석하기', '차트 만들기와 해석', '전반부 핵심 정리'], k: 'AI의 숫자는 후보 — 두세 개는 직접 확인한다' },
    ];
    const road = 'M90,110 H570 C 680,110 680,300 570,300 H90';
    el('path', { d: road, fill: 'none', stroke: 'var(--line)', 'stroke-width': 18, 'stroke-linecap': 'round' }, svg);
    el('path', { d: road, fill: 'none', stroke: 'var(--surface)', 'stroke-width': 3, 'stroke-dasharray': '10 12' }, svg);
    const dot = el('circle', { r: 8, fill: 'var(--accent)', class: 'flowdot' }, svg);
    el('animateMotion', { dur: '9s', repeatCount: 'indefinite', path: road }, dot);
    // 8주 깃발
    el('line', { x1: 90, y1: 300, x2: 90, y2: 236, stroke: 'var(--accent-2)', 'stroke-width': 4 }, svg);
    el('path', { d: 'M90,236 h62 l-12,15 l12,15 h-62z', fill: 'var(--accent-2)' }, svg);
    el('text', { x: 118, y: 256, 'text-anchor': 'middle', style: 'font-size:13px;font-weight:800;fill:var(--surface)' }, svg).textContent = '8주';
    el('text', { x: 90, y: 340, 'text-anchor': 'middle', class: 't-main', style: 'font-size:16px' }, svg).textContent = '중간고사';
    // 구역 범례
    Object.values(AREA).forEach((a, i) => {
      const x = 30 + i * 132;
      el('circle', { cx: x + 8, cy: 404, r: 8, fill: a.c }, svg);
      el('text', { x: x + 22, y: 409, class: 't-sub', style: 'font-size:14px;font-weight:700;fill:var(--text)' }, svg).textContent = a.n;
    });
    const stops = W.map((s) => {
      const A = AREA[s.a];
      const g = el('g', { class: 'stop', tabindex: 0, role: 'button', 'aria-label': s.w + '주 ' + s.h }, svg);
      el('circle', { cx: s.x, cy: s.y, r: 44, class: 'pad' }, g);
      el('circle', { cx: s.x, cy: s.y, r: 30, fill: A.c }, g);
      el('text', { x: s.x, y: s.y + 8, 'text-anchor': 'middle', style: 'font-size:22px;font-weight:800;fill:var(--surface);pointer-events:none' }, g).textContent = s.w;
      el('text', { x: s.x, y: s.y + (s.y < 200 ? -56 : 66), 'text-anchor': 'middle', class: 't-main', style: 'font-size:15px;pointer-events:none' }, g).textContent = s.h;
      const pick = () => {
        stops.forEach((x) => x.classList.remove('on')); g.classList.add('on');
        $('mp-ic').innerHTML = `<svg class="ic"><use href="#i-${A.ic}"/></svg>`;
        $('mp-ic').className = 'ic-badge' + (s.a === 'doc' ? ' o' : s.a === 'base' ? ' g' : '');
        $('mp-area').textContent = A.n + ' 구역 · ' + s.w + '주';
        $('mp-h').textContent = s.h;
        $('mp-list').innerHTML = s.l.map((t, i) => `<li>${s.w}-${i + 1} ${t}</li>`).join('');
        const k = $('mp-key'); k.hidden = false; k.textContent = '“' + s.k + '”';
      };
      g.addEventListener('click', pick);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(); } });
      return g;
    });
  })();

  /* ───────── 2) 이럴 땐 어떤 습관? ───────── */
  (function habits() {
    const wrap = $('hcards'); if (!wrap) return;
    const H = { p: ['user', '개인정보·기밀'], s: ['link', '출처'], v: ['check', '검증'] };
    const items = [
      { k: 'p', n: '고객 문의 메일을 AI로 요약하려는데 메일에 고객 이름·전화번호가 있다', a: '이름·번호를 지우거나 [고객A]처럼 바꾼 뒤 넣는다.' },
      { k: 's', n: 'AI가 “최근 조사에 따르면 건강 간식 시장이 크게 성장”이라고 썼다', a: '어떤 기관의 어떤 조사인지 묻고, 원문을 직접 찾아 확인한다.' },
      { k: 'v', n: 'AI가 계산한 채널별 매출 합계를 대표님께 보고하려 한다', a: '스프레드시트 필터·합계로 핵심 숫자 두세 개를 직접 확인한다.' },
      { k: 'p', n: '아르바이트하는 가게의 실제 매출 파일을 분석해 보고 싶다', a: '영업 기밀일 수 있다. 가게 주인의 허락이 먼저.' },
      { k: 'v', n: 'AI가 쓴 공문 초안에 행사 날짜와 금액이 들어 있다', a: '날짜·금액·이름 같은 사실 정보는 원래 자료와 대조한다.' },
      { k: 's', n: 'AI가 참고 문헌으로 논문 제목과 링크를 알려 줬다', a: '링크를 직접 열어 실제로 있는 논문인지, 내용이 맞는지 본다.' },
      { k: 'v', n: 'AI가 회의록을 요약했는데 회의에서 나오지 않은 결정이 적혀 있는 것 같다', a: '원문 회의록과 대조해 없는 내용을 지운다 (요약 속 환각).' },
      { k: 's', n: '조사 보고서에 넣을 경쟁사 가격을 AI가 표로 정리해 줬다', a: '가격은 자주 바뀐다. 공식 판매 페이지 등 원 출처와 확인 날짜를 적는다.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="nm">${it.n}</span><span class="verdict"><svg class="ic"><use href="#i-${H[it.k][0]}"/></svg>${H[it.k][1]}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('hc-score').textContent = opened + ' / ' + items.length + ' 확인' + (opened === items.length ? ' — 개인정보 2 · 출처 3 · 검증 3. 실제 일에서는 세 습관이 함께 필요한 경우가 많습니다.' : '');
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 3) 중간고사 준비 점검표 ───────── */
  (function check() {
    const wrap = $('chk'); if (!wrap) return;
    const items = [
      ['생성형AI가 답을 만드는 원리와 환각·편향을 예를 들어 설명할 수 있다', '2주'],
      ['AI에 넣으면 안 되는 정보(개인정보·기밀)를 구분할 수 있다', '1주 · 7주'],
      ['프롬프트의 역할·맥락·지시·형식을 구분해 쓸 수 있다', '3주'],
      ['예시 제시·단계별 지시·템플릿을 언제 쓰는지 안다', '4주'],
      ['AI 문서 초안에서 직접 확인해야 할 부분을 짚을 수 있다', '5주'],
      ['AI가 준 출처·숫자를 원 출처로 확인하는 방법을 안다', '6주'],
      ['반품률·광고비 대비 매출을 계산하고 스프레드시트로 확인할 수 있다', '7주'],
      ['목적에 맞는 차트를 고르고 잘린 축을 알아볼 수 있다', '7주'],
    ];
    let n = 0;
    function update() {
      $('chk-n').textContent = n + ' / ' + items.length;
      $('chk-bar').style.width = n / items.length * 100 + '%';
      const st = $('chk-st');
      if (n === items.length) { st.className = 'status ok'; st.innerHTML = '<b class="k">준비 완료</b>이제 각 차시 확인 문제로 <strong>시간을 재고</strong> 풀어 보세요.'; }
      else if (n >= 5) { st.className = 'status mid'; st.innerHTML = `<b class="k">거의 다 왔다</b>남은 ${items.length - n}개 항목의 주차만 다시 보면 됩니다.`; }
      else { st.className = 'status bad'; st.innerHTML = '<b class="k">복습 계획 세우기</b>체크하지 못한 항목부터 하루에 한 주차씩 다시 봅니다.'; }
    }
    items.forEach(([t, w]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tgl'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="chk"></span><span>${t}</span><span class="wk">${w}</span>`;
      b.addEventListener('click', () => { n += toggle(b) ? 1 : -1; update(); });
      wrap.appendChild(b);
    });
    update();
  })();
})();
