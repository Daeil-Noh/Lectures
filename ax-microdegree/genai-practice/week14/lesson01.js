// 14주 1차시 전용: 표지 궤도, AI 역할 카드, 직무별 업무 지도, 답장 검토, 개선안 주제 다듬기
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const ROLE = { ai: 'AI 초안', co: '함께', hu: '사람' };
  const roleTag = (r) => `<span class="role ${r}">${ROLE[r]}</span>`;
  const USES = {
    sum: { n: '요약', d: '긴 자료를 핵심만 줄이기' },
    draft: { n: '초안', d: '첫 버전 문서·문장 만들기' },
    conv: { n: '변환', d: '번역·말투·난이도·형식 바꾸기' },
    sort: { n: '분류·정리', d: '표로 나누고 숫자 모으기' },
    idea: { n: '아이디어·검토', d: '후보를 늘리고 빠진 점 질문받기' },
  };

  /* ───────── 직무별 업무 지도 (대표 업무를 일반화한 예시) ───────── */
  const JOBS = [
    { k: 'biz', n: '경영(기획·인사)', ic: 'target', tasks: [
      { n: '회의록 정리', r: 'ai', d: '메모·녹취를 요약하고 할 일 목록으로', ai: '회의 메모를 결정 사항·할 일·담당자 표로 정리한 초안', hu: '결정 사항이 맞는지 확인, 공유 전 민감한 발언 삭제', wk: '5주 3차시 요약과 교정', out: '회의 요약본과 할 일 표', uses: ['sum', 'sort'] },
      { n: '사업 기획서 작성', r: 'co', d: '목차·초안·예상 반론', ai: '목차 제안, 섹션별 초안, “팀장이 물을 질문” 목록', hu: '목표·숫자·전략을 정하고 근거 자료 확인', wk: '5주 1차시 보고서·기획서 초안', out: '기획서 초안과 예상 질문 목록', uses: ['draft', 'idea'] },
      { n: '채용 공고·면접 질문', r: 'co', d: '공고 문안과 직무 기반 질문', ai: '직무 설명을 바탕으로 공고 문안·면접 질문 후보', hu: '차별적 표현 점검, 지원자 평가는 사람이 직접', wk: '13주 2차시 책임과 공정성', out: '채용 공고 문안과 면접 질문지', uses: ['draft', 'idea'] },
      { n: '인사 평가 결정', r: 'hu', d: '평가·보상·징계는 사람의 판단', ai: '평가 기준표 양식 같은 빈 틀 정도', hu: '평가와 결정, 그 책임. 직원 개인정보는 AI에 넣지 않음', wk: '1주 3차시 · 13주 2차시', out: '평가 기준표 빈 양식', uses: ['idea'] },
    ] },
    { k: 'acc', n: '회계·세무', ic: 'chart', tasks: [
      { n: '비용 변동 설명문', r: 'ai', d: '월별 표를 보고 보고 문장 초안', ai: '표에서 크게 변한 항목을 찾아 설명 문장 초안', hu: '숫자를 직접 다시 계산, 변동의 실제 원인 확인', wk: '7주 데이터 활용', out: '월간 비용 변동 보고 문단', uses: ['sum', 'sort'] },
      { n: '거래 내역 분류', r: 'co', d: '계정 분류 제안과 표 정리', ai: '가상·비식별 자료로 분류 기준 제안, 스프레드시트 정리 방법 설명', hu: '증빙과 대조, 실제 장부 자료는 회사 지침 확인 후', wk: '7주 1차시 스프레드시트 분석', out: '거래 분류 기준표', uses: ['sort'] },
      { n: '세법·회계기준 질문', r: 'co', d: '개념 설명과 확인할 조문 목록', ai: '개념을 쉬운 말로 설명, 찾아볼 기준·조문 목록', hu: '법령·기준서 원문과 최신 개정 확인 (AI 답은 출처가 아님)', wk: '6주 2차시 출처 확인과 팩트체크', out: '질문별 확인 목록', uses: ['sum', 'idea'] },
      { n: '결산·세금 신고 확정', r: 'hu', d: '법적 책임이 따르는 확정', ai: '일정표·체크리스트 같은 준비 자료', hu: '금액 확정과 신고, 그 책임', wk: '13주 2차시 책임과 공정성', out: '결산 준비 체크리스트', uses: ['sort'] },
    ] },
    { k: 'mkt', n: '마케팅', ic: 'sparkles', tasks: [
      { n: '고객 후기·설문 분석', r: 'ai', d: '주제별 분류와 요약', ai: '후기를 주제별로 나누고 자주 나온 불만·칭찬 요약', hu: '원문 확인, 표본이 한쪽으로 치우치지 않았는지 점검', wk: '7주 · 14주 3차시 예시 A', out: '후기 분류표와 월간 요약', uses: ['sum', 'sort'] },
      { n: 'SNS 카피·게시물', r: 'ai', d: '여러 버전의 문구 초안', ai: '타깃·톤에 맞춘 카피 후보 여러 개', hu: '브랜드 말투, 과장·허위 광고 표현 점검', wk: '10주 2차시 카피와 SNS 게시물', out: 'SNS 게시물 3종 초안', uses: ['draft', 'idea'] },
      { n: '홍보 이미지·숏폼 기획', r: 'co', d: '이미지 시안, 대본·스토리보드', ai: '이미지 시안(Gemini), 숏폼 대본·장면 구성 초안', hu: '저작권·초상권 확인, AI 생성 콘텐츠 표시', wk: '11주 이미지·숏폼 영상', out: '숏폼 대본과 스토리보드', uses: ['draft', 'idea'] },
      { n: '광고 예산 배분 결정', r: 'hu', d: '어느 채널에 얼마를 쓸지', ai: '성과표 정리, 여러 배분안의 장단점 정리', hu: '예산 결정과 결과 책임', wk: '7주 · 14주 3차시 예시 B', out: '채널별 성과표', uses: ['sort', 'sum'] },
    ] },
    { k: 'trade', n: '무역·물류', ic: 'map', tasks: [
      { n: '해외 바이어 메일', r: 'ai', d: '영문 답장 초안과 번역', ai: '정중한 영문 답장 초안과 한국어 번역', hu: '단가·수량·납기 같은 조건과 숫자 기입·확인', wk: '5주 2차시 · 12주 3차시', out: '문의 유형별 답장 초안', uses: ['draft', 'conv'] },
      { n: '수출입 서류 점검', r: 'co', d: '항목 대조 체크리스트', ai: '서류마다 확인할 항목 체크리스트 초안', hu: '원본 서류 대조, 규정은 공식 자료로 확인', wk: '6주 2차시 출처 확인', out: '서류 점검 체크리스트', uses: ['sort', 'idea'] },
      { n: '수출 시장 조사', r: 'co', d: '조사 질문과 자료 요약', ai: '조사 질문 목록, 찾은 자료 요약', hu: '최신 통계·출처 확인, 결론은 직접', wk: '6주 리서치와 정보 검증', out: '국가별 조사 요약표', uses: ['sum', 'idea'] },
      { n: '계약 조건 협상', r: 'hu', d: '가격·조건을 정하는 대화', ai: '예상 질문과 영어 표현 연습 상대', hu: '협상과 계약 확정, 그 책임', wk: '13주 3차시 사람의 몫', out: '협상 예상 질문 목록', uses: ['idea'] },
    ] },
    { k: 'gov', n: '행정(공공·사무)', ic: 'log', tasks: [
      { n: '공문·안내문 작성', r: 'ai', d: '서식에 맞춘 초안, 쉬운 말로', ai: '기관 서식에 맞춘 초안, 어려운 문장을 쉬운 말로', hu: '규정 근거와 기관 서식 확인, 결재', wk: '5주 2차시 이메일·공문', out: '쉬운 말 안내문', uses: ['draft', 'conv'] },
      { n: '민원 회신', r: 'co', d: '개인정보를 지운 회신 초안', ai: '개인정보를 지운 문의 내용으로 회신 초안', hu: '사실 확인, 공감 표현, 최종 발송', wk: '1주 3차시 · 이 차시 직접 해 보기 3', out: '민원 유형별 회신 초안', uses: ['draft', 'sum'] },
      { n: '지침·규정 찾아보기', r: 'co', d: '긴 지침 요약, 관련 조항 후보', ai: '긴 지침을 요약하고 관련 조항 후보 표시', hu: '원문 조항 확인, 해석은 담당자가', wk: '6주 2차시 출처 확인', out: '지침 요약표', uses: ['sum'] },
      { n: '예산·인허가 결정', r: 'hu', d: '공적 책임이 따르는 결정', ai: '검토 항목 목록 같은 준비 자료', hu: '결정과 그 책임', wk: '13주 2차시 책임과 공정성', out: '검토 항목 목록', uses: ['idea'] },
    ] },
    { k: 'hum', n: '출판·번역·기록', ic: 'book', tasks: [
      { n: '원고 교정·윤문', r: 'ai', d: '맞춤법·문장 다듬기 제안', ai: '맞춤법·띄어쓰기·어색한 문장 고칠 곳 제안', hu: '저자의 의도와 문체 유지, 제안 중 고를 것 결정', wk: '5주 3차시 요약과 교정', out: '교정 제안표', uses: ['conv', 'idea'] },
      { n: '번역 초벌', r: 'co', d: '초벌 번역과 용어집', ai: '초벌 번역, 용어집 초안', hu: '뉘앙스·문화 맥락 다듬기, 번역 원고의 저작권 확인', wk: '12주 3차시 번역·교육 콘텐츠', out: '초벌 번역과 용어집', uses: ['conv'] },
      { n: '사료·기록 정리', r: 'co', d: '목록화·요약·키워드', ai: '공개 자료의 목록·요약·키워드 초안', hu: '원문과 대조, 고증과 해석 (AI가 없는 사실을 지어낼 수 있음)', wk: '6주 리서치와 정보 검증', out: '자료 목록과 요약 카드', uses: ['sum', 'sort'] },
      { n: '기획 방향·해석', r: 'hu', d: '무엇을 왜 말할지 정하기', ai: '다른 관점의 질문 던지기 정도', hu: '관점과 해석, 기획의 방향', wk: '12주 1차시 AI와 스토리텔링', out: '관점별 질문 목록', uses: ['idea'] },
    ] },
    { k: 'edu', n: '교육', ic: 'cap', tasks: [
      { n: '수업 자료 수준별 변환', r: 'ai', d: '같은 지문을 여러 난이도로', ai: '같은 내용을 쉬운·보통·어려운 버전과 예시로', hu: '내용 정확성, 학습 목표에 맞는지 확인', wk: '12주 3차시 번역·교육 콘텐츠', out: '3단계 난이도 지문', uses: ['conv'] },
      { n: '문항·퀴즈 초안', r: 'co', d: '문항과 오답 보기 초안', ai: '문항 초안과 그럴듯한 오답 보기', hu: '정답 검토, 난이도·공정성 점검', wk: '4주 예시 제시와 단계별 지시', out: '확인 문제 10개', uses: ['draft', 'idea'] },
      { n: '학생 피드백 문장', r: 'co', d: '피드백 문장의 틀', ai: '학생 정보 없이 피드백 문장 틀·표현 제안', hu: '직접 관찰한 내용으로 채우기, 학생 개인정보 입력 금지', wk: '1주 3차시 개인정보', out: '피드백 문장 틀', uses: ['draft'] },
      { n: '성적 평가·기록', r: 'hu', d: '평가와 공식 기록', ai: '채점 기준표 빈 양식 정도', hu: '평가와 기록, 그 책임', wk: '13주 2차시 책임과 공정성', out: '채점 기준표 양식', uses: ['idea'] },
    ] },
    { k: 'media', n: '미디어(언론·콘텐츠)', ic: 'play', tasks: [
      { n: '인터뷰 녹취 정리', r: 'ai', d: '녹취 요약과 인용 후보', ai: '녹취록 요약, 인용할 만한 문장 후보', hu: '원 발언과 대조, 인용 동의 확인', wk: '5주 3차시 요약과 교정', out: '인터뷰 요약과 인용 후보', uses: ['sum'] },
      { n: '기사·대본 구성', r: 'co', d: '구성안과 제목 후보', ai: '구성안, 제목·소제목 후보', hu: '취재한 사실로 쓰기, 출처 밝히기', wk: '12주 스토리텔링과 발표', out: '구성안과 제목 후보 10개', uses: ['draft', 'idea'] },
      { n: '사실 확인', r: 'hu', d: '1차 출처로 확인', ai: '확인해야 할 주장 목록 만들기', hu: '1차 출처로 직접 확인 (AI 답은 출처가 아님)', wk: '6주 2차시 · 13주 1차시', out: '확인할 주장 목록', uses: ['sort'] },
      { n: '자막·썸네일 시안', r: 'ai', d: '자막 초안, 썸네일 시안', ai: '자막 초안, 썸네일 문구·이미지 시안(Gemini)', hu: '오탈자 확인, 딥페이크·초상권 점검', wk: '11주 · 13주 1차시', out: '자막 초안과 썸네일 시안', uses: ['draft', 'conv'] },
    ] },
  ];

  /* ───────── 0) 표지 궤도 ───────── */
  (function cover() {
    const g = $('cv-orbit'); if (!g) return;
    JOBS.forEach((j, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / JOBS.length;
      const x = 260 + 168 * Math.cos(a), y = 220 + 168 * Math.sin(a);
      el('circle', { cx: x, cy: y, r: 34, class: i % 3 === 2 ? 'f-acc2s' : 'f-accs', stroke: 'var(--bg)', 'stroke-width': 5 }, g);
      const ic = el('g', { transform: `translate(${x - 17} ${y - 17}) scale(${34 / 24})`, style: `color:${i % 3 === 2 ? 'var(--accent-2)' : 'var(--accent)'}` }, g);
      el('use', { href: '#i-' + j.ic, width: 24, height: 24 }, ic);
    });
  })();

  /* ───────── 1) AI 역할 카드 ───────── */
  (function roleCards() {
    const wrap = $('rcards'); if (!wrap) return;
    const items = [
      { ic: 'filter', n: '1시간 회의 메모를 다섯 줄로 요약', k: 'ai', a: 'AI가 잘하는 일. 결정 사항이 빠지지 않았는지만 사람이 확인한다.' },
      { ic: 'check', n: '거래처와 납품 단가 최종 확정', k: 'hu', a: '결과에 책임지는 결정. AI는 비교표 정리까지만.' },
      { ic: 'sparkles', n: '신제품 SNS 카피 후보 10개', k: 'ai', a: '후보를 늘리는 데 강하다. 과장 광고 표현은 사람이 걸러 낸다.' },
      { ic: 'chat', n: '항의 고객과의 전화 응대', k: 'hu', a: '공감과 관계의 일. AI는 응대 요령 정리 정도로 돕는다.' },
      { ic: 'book', n: '영문 계약서를 한국어로 초벌 번역', k: 'co', a: '초벌은 AI가 돕지만 조항 하나하나는 사람이 원문과 대조. 기밀이면 넣지 않는다.' },
      { ic: 'eye', n: '기사에 인용할 통계 확인', k: 'hu', a: '원래 출처를 사람이 확인한다. AI는 숫자를 지어낼 수 있다.' },
      { ic: 'cap', n: '같은 지문을 쉬운 버전으로 바꾸기', k: 'ai', a: '변환은 AI의 장점. 뜻이 바뀌지 않았는지 사람이 본다.' },
      { ic: 'log', n: '민원 회신 공문 작성', k: 'co', a: '개인정보를 지운 내용으로 초안을 받고, 규정 근거와 사실은 담당자가 확인한다.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="top"><span class="ic-badge ${it.k === 'hu' ? 'o' : ''}"><svg class="ic"><use href="#i-${it.ic}"/></svg></span><span class="nm">${it.n}</span></span><span class="verdict">${roleTag(it.k)}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('rc-score').innerHTML = `${opened} / ${items.length} 확인 · ${roleTag('ai')} ${roleTag('co')} ${roleTag('hu')}`;
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 2) 직무별 업무 지도 ───────── */
  (function taskMap() {
    const jw = $('jobs'), tw = $('tasks'); if (!jw) return;
    let cur = null;
    const jbtns = JOBS.map((j) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<svg class="ic"><use href="#i-${j.ic}"/></svg>${j.n}`;
      b.addEventListener('click', () => pickJob(j));
      jw.appendChild(b);
      return b;
    });
    function pickTask(t, j, btn) {
      tw.querySelectorAll('.task').forEach((x) => x.setAttribute('aria-pressed', x === btn));
      $('tm-ic').innerHTML = `<svg class="ic"><use href="#i-${j.ic}"/></svg>`;
      $('tm-ic').className = 'ic-badge' + (t.r === 'hu' ? ' o' : '');
      $('tm-h').textContent = t.n;
      $('tm-role').innerHTML = roleTag(t.r);
      $('tm-ai').innerHTML = '<b>AI가 돕는 일</b>' + t.ai;
      $('tm-hu').innerHTML = '<b>사람이 할 일</b>' + t.hu;
      $('tm-wk').textContent = '이 수업에서: ' + t.wk;
    }
    function pickJob(j) {
      cur = j;
      jbtns.forEach((b, i) => b.setAttribute('aria-pressed', JOBS[i] === j));
      tw.innerHTML = '';
      let first = null;
      j.tasks.forEach((t) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'task'; b.setAttribute('aria-pressed', 'false');
        b.innerHTML = `<span class="tn">${t.n}</span>${roleTag(t.r)}<span class="td">${t.d}</span>`;
        b.addEventListener('click', () => pickTask(t, j, b));
        tw.appendChild(b);
        if (!first) first = [t, b];
      });
      pickTask(first[0], j, first[1]);
    }
    pickJob(JOBS[2]);
  })();

  /* ───────── 3) AI 답장 검토 ───────── */
  (function replyCheck() {
    const box = $('reply'); if (!box) return;
    const S = [
      { t: '김서연 고객님(주문번호 BD-2091), 상품이 파손되어 도착했다니 정말 죄송합니다.', bad: true, h: '개인정보', e: '고객 이름·주문번호를 AI에 그대로 넣었다는 뜻. [고객명] 같은 자리표시로 바꿔 넣고, 보낼 때 사람이 채운다.' },
      { t: '배송 중에 포장이 손상되어 불편을 드렸습니다.', bad: false },
      { t: '바다결 고객 보상 규정 제5조에 따라 결제 금액의 2배를 보상해 드립니다.', bad: true, h: '지어낸 규정', e: 'AI는 회사의 실제 규정을 모른다. 그럴듯한 조항과 금액을 지어냈다(환각). 보상 기준은 담당자가 확인.' },
      { t: '새 제품은 이번 주 금요일까지 반드시 도착하도록 보내 드리겠습니다.', bad: true, h: '확인 안 된 약속', e: '배송 일정은 AI가 알 수 없다. 지킬 수 없는 약속은 회사의 책임이 된다. 날짜는 사람이 확인 후 기입.' },
      { t: '파손된 상품 사진을 보내 주시면 바로 확인하겠습니다.', bad: false },
      { t: '앞으로 포장을 더 꼼꼼히 살피겠습니다.', bad: false },
    ];
    const N = S.filter((s) => s.bad).length;
    let found = 0;
    S.forEach((s) => {
      const sp = document.createElement('span');
      sp.className = 'sent'; sp.tabIndex = 0; sp.setAttribute('role', 'button'); sp.textContent = s.t;
      const hit = () => {
        if (sp.classList.contains('issue') || sp.classList.contains('okay')) return;
        if (s.bad) {
          sp.classList.add('issue'); found++;
          const d = document.createElement('div'); d.innerHTML = `<b>${s.h}</b> — ${s.e}`; $('rp-list').appendChild(d);
        } else sp.classList.add('okay');
        $('rp-n').textContent = found + ' / ' + N;
        const st = $('rp-st');
        if (found === N) { st.className = 'status ok'; st.innerHTML = '<b class="k">검토 완료</b>세 곳을 고치면 보낼 수 있습니다. 이 확인이 바로 <strong>사람의 몫</strong>입니다.'; }
        else if (!s.bad) { st.className = 'status mid'; st.innerHTML = '<b class="k">이 문장은 괜찮음</b>사실을 약속하지 않는 공감·절차 문장입니다. 나머지를 찾아보세요.'; }
        else { st.className = 'status bad'; st.innerHTML = `<b class="k">문제 발견</b>그대로 보냈다면 곤란해졌을 문장입니다. 남은 문제 ${N - found}개.`; }
      };
      sp.addEventListener('click', hit);
      sp.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); hit(); } });
      box.appendChild(sp); box.appendChild(document.createTextNode(' '));
    });
  })();

  /* ───────── 4) 개선안 주제 다듬기 ───────── */
  (function topic() {
    const jw = $('tp-job'), tw = $('tp-task'), uw = $('tp-use'); if (!jw) return;
    const st = { job: null, task: null, use: null, chk: { data: false, safe: false, num: false } };
    const mk = (wrap, label, on) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.setAttribute('aria-pressed', 'false'); b.innerHTML = label; b.addEventListener('click', on); wrap.appendChild(b); return b; };
    const press = (wrap, b) => wrap.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', x === b));
    JOBS.forEach((j) => {
      const b = mk(jw, j.n, () => { st.job = j; st.task = null; press(jw, b); drawTasks(); render(); });
    });
    function drawTasks() {
      tw.innerHTML = '';
      if (!st.job) { tw.innerHTML = '<span class="muted" style="font-size:15px">먼저 직무를 고르세요</span>'; return; }
      st.job.tasks.forEach((t) => {
        const b = mk(tw, `${t.n} ${roleTag(t.r)}`, () => { st.task = t; press(tw, b); render(); });
      });
    }
    Object.keys(USES).forEach((k) => {
      const b = mk(uw, USES[k].n, () => { st.use = k; press(uw, b); render(); });
    });
    document.querySelectorAll('#tp-chk .tgl').forEach((b) => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); st.chk[b.dataset.c] = on; render();
    }));
    function render() {
      const out = $('tp-out'), msg = $('tp-msg');
      if (!st.job || !st.task) {
        out.innerHTML = '<div class="tt">직무와 업무를 골라 보세요</div><div class="ln">고른 내용으로 개선안 제목 후보가 만들어집니다.</div>';
        score(0); msg.innerHTML = '9주 1차시에서 고른 <strong>반복 업무</strong>를 떠올리며 골라 보세요.'; return;
      }
      const t = st.task, u = st.use ? USES[st.use] : null;
      const fit = u && t.uses.includes(st.use);
      let n = 0;
      if (t.r !== 'hu') n++;
      if (fit) n++;
      n += Object.values(st.chk).filter(Boolean).length;
      out.innerHTML = `<div class="tt">${t.n}, 생성형AI ${u ? u.n : '○○'} + 담당자 검토로 바꾸기</div>`
        + `<div class="ln"><b>AI가 하는 일</b> · ${u ? u.d : '쓰임을 고르세요'}</div>`
        + `<div class="ln"><b>사람이 하는 일</b> · ${t.hu}</div>`
        + `<div class="ln"><b>시연 산출물</b> · ${t.out}</div>`;
      score(n);
      const tips = [];
      if (t.r === 'hu') tips.push('이 업무의 <strong>최종 결정은 사람 몫</strong>입니다. “결정을 준비하는 자료를 AI로 만든다”로 범위를 좁히세요.');
      if (!u) tips.push('③ AI의 쓰임을 골라 보세요.');
      else if (!fit) tips.push(`이 업무에는 <strong>${t.uses.map((k) => USES[k].n).join('·')}</strong> 쓰임이 더 잘 맞습니다.`);
      if (!st.chk.data) tips.push('시연할 <strong>가상 자료</strong>(예: 가상 메일 3통, 가상 표)를 어떻게 만들지 정하세요.');
      if (!st.chk.safe) tips.push('실제 개인정보·기밀 없이 시연할 방법을 찾으세요. 1주 3차시 규칙.');
      if (!st.chk.num) tips.push('“건당 몇 분 × 월 몇 건”처럼 효과를 <strong>추정할 숫자</strong>를 떠올려 보세요.');
      msg.className = 'callout' + (n === 5 ? ' b' : '');
      msg.innerHTML = n === 5 ? '<strong>개선안으로 쓸 준비가 됐습니다.</strong> 다음 차시 서식의 제목·요약 칸부터 채워 보세요.' : tips.slice(0, 2).join('<br>');
    }
    function score(n) { $('tp-n').textContent = n + ' / 5'; $('tp-bar').style.width = (n * 20) + '%'; }
    drawTasks(); render();
  })();
})();
