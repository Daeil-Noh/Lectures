// 3주 3차시 전용: 피드백 다듬기 대화, 좋은/나쁜 피드백 카드, 이어 갈까 새로 할까 카드
// 모든 AI 답변은 미리 써 둔 예시 문장이다(실제 서비스 출력 아님).
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ───────── 1) 피드백으로 다듬기 ───────── */
  (function refine() {
    const log = $('t-log'); if (!log) return;
    const FIRST = '바다결 ‘미역귀 현미칩 매콤맛’ 인스타그램 소개 글 써 줘.\n제품 정보: 튀기지 않고 구운 현미칩, 청양고추로 매운맛, 1봉 6,900원.';
    const HOOK = {
      y: ['자취방 야식, 아직도 튀긴 과자야?', '밤 11시, 자취생 야식 고민 끝.', '월말에도 부담 없는 6,900원 야식.'],
      n: ['바다결이 새로운 맛을 선보입니다!', '기다리던 매콤한 신제품이 나왔습니다.', '바다결의 새로운 간식을 소개합니다.'],
    };
    function compose(s) {
      const y = s.young ? 'y' : 'n';
      const hook = HOOK[y][s.v % 3];
      const prodL = s.young ? '튀기지 않고 구운 현미칩에 청양고추 한 방, 미역귀 현미칩 매콤맛 1봉 6,900원.' : '미역귀 현미칩 매콤맛은 튀기지 않고 구운 현미칩에 청양고추로 매운맛을 더했습니다. 가격은 1봉 6,900원입니다.';
      const prodS = s.young ? '튀기지 않은 현미칩에 청양고추 한 방, 1봉 6,900원.' : '튀기지 않고 구운 현미칩에 청양고추 매운맛, 1봉 6,900원입니다.';
      const extra = s.young ? ['맵다고 내려놨다가 또 집게 되는 맛.', '드라마 한 편이면 한 봉 순삭.'] : ['기름에 튀기지 않아 부담이 적고, 바삭한 식감은 살렸습니다.', '출출한 오후나 야식 시간에 가볍게 즐겨 보세요.', '건강과 맛을 함께 생각하는 분들께 추천합니다.'];
      const num = s.num === 'fake' ? (s.young ? '먹어 본 사람 97%가 재구매했어!' : '고객 만족도 97%를 기록한 인기 제품입니다!')
        : s.num === 'real' ? (s.young ? '원래 맛은 올해 9월까지 8,190봉 팔린 바다결 판매 2위!' : '원래 맛 현미칩은 올해 1~9월 8,190봉이 팔린 바다결 판매량 2위 제품입니다.') : null;
      const close = s.young ? '오늘 밤 한 봉 어때?' : '지금 바다결에서 만나 보세요.';
      const tags = s.young ? '#자취생간식 #매콤야식 #바다결' : '#바다결 #미역귀현미칩 #신제품 #건강간식';
      const lines = s.short ? [hook, prodS, num || close] : [hook, prodL, ...extra, ...(num ? [num] : []), close];
      return { text: lines.join('\n') + (s.short ? '' : '\n\n' + tags), n: lines.length };
    }
    const FB = [
      { k: 'short', ic: 'filter', t: '더 짧게: 해시태그를 빼고 3줄 이내로 줄여 줘. 나머지 내용은 유지해 줘.' },
      { k: 'young', ic: 'user', t: '20대 자취생이 읽는다고 생각하고, 친구에게 말하듯 바꿔 줘.' },
      { k: 'fake', ic: 'alert', t: '숫자 근거 추가해 줘.', risky: true },
      { k: 'real', ic: 'chart', t: '아래 [판매 자료]의 숫자 하나를 근거로 넣어 줘. 자료에 없는 숫자는 쓰지 마.\n[판매 자료] 원래 맛 현미칩 1~9월 8,190봉, 판매량 2위' },
      { k: 'bad', ic: 'x', t: '별로야, 다시 써 줘.', risky: true, again: true },
    ];
    let S, turn, used, wasted;
    const fbWrap = $('t-fb');
    fbWrap.innerHTML = FB.map((f, i) => `<button class="fbtn${f.risky ? ' risky' : ''}" type="button" data-i="${i}"><svg class="ic"><use href="#i-${f.ic}"/></svg><span>${esc(f.t.split('\n')[0])}</span></button>`).join('');
    const btns = [...fbWrap.querySelectorAll('.fbtn')];
    function add(cls, html) {
      const d = document.createElement('div'); d.className = 'msg ' + cls + ' new'; d.innerHTML = html; log.appendChild(d);
      log.scrollTop = log.scrollHeight;
    }
    function aiMsg(label) {
      const a = compose(S);
      add('ai' + (S.num === 'fake' ? ' warn' : ''), `<span class="who">${label}</span>${esc(a.text)}`);
      return a;
    }
    function goals() {
      const a = compose(S);
      const G = [
        [a.n <= 3, '3줄 이내'],
        [S.young, '20대 자취생 말투'],
        [S.num === 'real', '자료의 숫자 근거'],
        [S.num !== 'fake', '지어낸 숫자 없음', true],
      ];
      $('t-goals').innerHTML = G.map(([ok, t, neg]) => `<div class="${ok ? 'ok' : neg ? 'no' : ''}"><i>${ok ? '✓' : neg ? '!' : '·'}</i>${t}</div>`).join('');
      return G.every((g) => g[0]);
    }
    function status(cls, k, m) { const st = $('t-st'); st.className = 'status ' + cls; st.innerHTML = `<b class="k">${k}</b>${m}`; }
    function reset() {
      S = { short: false, young: false, num: null, v: 0 }; turn = 1; used = new Set(); wasted = 0;
      log.innerHTML = '';
      add('user', esc(FIRST));
      aiMsg('첫 답 — 예시');
      btns.forEach((b) => (b.disabled = false));
      goals();
      $('t-turn').textContent = '대화 1턴';
      status('mid', '첫 답은 초안', '오른쪽 위 목표 네 가지를 채우도록 피드백을 골라 보세요. <strong>한 번에 하나씩</strong>.');
    }
    btns.forEach((b) => b.addEventListener('click', () => {
      const f = FB[+b.dataset.i];
      add('user', esc(f.t));
      let msg;
      if (f.k === 'short') { S.short = true; msg = ['ok', '길이만 줄었다', '“나머지는 유지해 줘”라고 했기 때문에 제품 정보·가격은 남고 <strong>길이만</strong> 바뀌었습니다.']; }
      else if (f.k === 'young') { S.young = true; msg = ['ok', '말투와 강조점이 바뀌었다', '대상을 구체적으로 말하자 단어(자취방·야식·월말)와 어미가 <strong>그 사람에게 맞춰</strong> 바뀌었습니다.']; }
      else if (f.k === 'fake') {
        if (S.num === 'real') msg = ['mid', '바뀐 것 없음', '이미 자료의 숫자가 들어 있어 그대로입니다.'];
        else { S.num = 'fake'; msg = ['bad', '97%는 어디서 왔을까?', '자료 없이 숫자를 요구하자 AI가 <strong>출처 없는 숫자를 지어냈습니다</strong>(2-3 환각). 신제품인데 재구매율·만족도가 있을 수 없죠. 같은 대화에 남아 다음 답에도 따라올 수 있습니다.']; }
      }
      else if (f.k === 'real') { const was = S.num; S.num = 'real'; msg = ['ok', '자료의 숫자로 바뀌었다', (was === 'fake' ? '지어낸 97%가 사라지고 ' : '') + '<strong>판매 자료의 8,190봉·판매량 2위</strong>가 들어갔습니다. 숫자는 꼭 내가 준 자료에서 오게 합니다.']; }
      else { S.v++; msg = ['mid', '무엇이 나아졌을까?', '무엇이 별로인지 말하지 않아 <strong>첫 문장만 바뀌었습니다.</strong> 나아졌는지 판단할 기준도 없습니다. 같은 말을 반복하면 운에 맡기는 셈입니다.']; }
      if (f.risky) wasted++;
      turn++;
      aiMsg(turn + '번째 답 — 예시');
      if (!f.again) { used.add(f.k); b.disabled = true; }
      if (f.k === 'real') btns[2].disabled = true;
      $('t-turn').textContent = '대화 ' + turn + '턴';
      if (goals()) status('ok', `목표 달성 — ${turn}턴`, (wasted ? `그중 ${wasted}턴은 막연한 피드백으로 돌아간 길이었습니다. ` : '구체적인 피드백 세 번이면 충분합니다. ') + '이 흐름(첫 프롬프트 + 피드백)을 <strong>프롬프트 노트</strong>에 남겨 두면 다음엔 한 번에 됩니다.');
      else status(msg[0], msg[1], msg[2]);
    }));
    $('t-reset').addEventListener('click', reset);
    reset();
  })();

  /* ───────── 공통: 뒤집는 판단 카드 ───────── */
  function cards(wrapId, items, scoreId, doneMsg) {
    const wrap = $(wrapId); if (!wrap) return;
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $(scoreId).textContent = opened + ' / ' + items.length + ' 확인' + (opened === items.length && doneMsg ? ' — ' + doneMsg : '');
      });
      wrap.appendChild(b);
    });
  }

  /* ───────── 2) 좋은 피드백 vs 나쁜 피드백 ───────── */
  cards('f-cards', [
    { n: '“별로야, 다시.”', k: 'bad', v: '나쁜 피드백', a: '어디가 왜 별로인지 없음.<br><b>→ “첫 문장이 너무 평범해. 질문형으로 바꿔 줘.”</b>' },
    { n: '“두 번째 문단만 절반으로 줄이고, 나머지는 그대로 둬.”', k: 'good', v: '좋은 피드백', a: '범위·방향·유지할 것이 모두 있다.' },
    { n: '“좀 더 전문적으로.”', k: 'mid', v: '애매한 피드백', a: '누구에게 전문적인가?<br><b>→ “거래처 구매 담당자가 읽는다고 생각하고 보관 방법을 추가해 줘.”</b>' },
    { n: '“숫자로 근거를 붙여 줘. 숫자는 아래 판매 자료에 있는 것만 써.”', k: 'good', v: '좋은 피드백', a: '숫자의 출처를 정해 지어내기를 막는다.' },
    { n: '“완벽하게 고쳐 줘.”', k: 'bad', v: '나쁜 피드백', a: '“완벽”의 기준이 없다.<br><b>→ “맞춤법과 띄어쓰기만 고치고, 표현은 바꾸지 마.”</b>' },
    { n: '“20대가 읽기엔 딱딱해. 친구에게 말하듯, 존댓말은 유지해 줘.”', k: 'good', v: '좋은 피드백', a: '이유(딱딱함)·방향·유지할 것(존댓말)이 분명하다.' },
    { n: '“이상한 부분 고쳐.”', k: 'bad', v: '나쁜 피드백', a: '무엇이 이상한지 AI는 모른다.<br><b>→ “셋째 줄 ‘고객님들께서는’이 어색해. ‘여러분’으로.”</b>' },
    { n: '“이렇게 쓴 이유를 먼저 설명하고, 다른 방향의 안을 2개 더 보여 줘.”', k: 'good', v: '좋은 피드백', a: '고치기 전에 AI의 판단을 확인하고 선택지를 넓힌다.' },
  ], 'f-score', '나쁜 피드백은 모두 “어디를·어떻게”가 빠져 있었습니다.');

  /* ───────── 3) 이어 갈까, 새로 시작할까? ───────── */
  cards('n-cards', [
    { n: '방금 받은 SNS 문구에서 마지막 줄만 바꾸고 싶다', k: 'keep', v: '같은 채팅에서 이어 가기', a: '앞에서 정한 조건이 그대로 필요하다. 범위를 콕 집어 피드백.' },
    { n: 'SNS 문구를 끝내고, 이제 거래처에 보낼 견적 메일을 쓰려 한다', k: 'fresh', v: '새 채팅', a: '일이 바뀌었다. 친구 말투·해시태그가 메일에 섞일 수 있다.' },
    { n: '대화가 30번 넘게 오가면서 처음 정한 “3줄 이내”를 자꾸 어긴다', k: 'fresh', v: '정리해서 새 채팅', a: '조건을 프롬프트 하나로 정리해 달라고 한 뒤, 새 채팅에 붙여 넣는다.' },
    { n: 'AI가 처음에 지어낸 숫자를 고쳐 달라고 해도 계속 다시 쓴다', k: 'fresh', v: '새 채팅 + 자료', a: '실수가 대화에 굳었다. 새 채팅에서 자료를 함께 주고 시작한다.' },
    { n: '같은 프롬프트로 결과가 어떻게 달라지는지 비교해 보고 싶다', k: 'fresh', v: '새 채팅', a: '3-2처럼 앞 대화의 영향이 없어야 공정하게 비교된다.' },
    { n: 'AI가 기획안에 필요한 질문 5개를 던졌고, 지금 답하는 중이다', k: 'keep', v: '같은 채팅에서 이어 가기', a: '질문과 답이 곧 맥락이다. 끊으면 처음부터 다시.' },
  ], 'n-score', '기준은 하나: 앞 대화가 다음 답에 도움이 되는가, 방해가 되는가.');
})();
