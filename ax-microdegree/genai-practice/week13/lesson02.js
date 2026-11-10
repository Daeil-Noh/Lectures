// 13주 2차시 전용: 책임 지도, 채용 AI 공정성, 딜레마 카드
(function () {
  const $ = (id) => document.getElementById(id);
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };

  /* ───────── 1) 책임 지도 ───────── */
  (function respMap() {
    const box = $('rm-actors'); if (!box) return;
    const LV = { main: '주된 책임', share: '함께 책임', low: '책임 적음', debate: '의견이 갈림' };
    const A = [['user', 'user', '사용자'], ['co', 'factory', '회사'], ['dev', 'cpu', 'AI 개발사']];
    const C = [
      { ic: 'log', t: '틀린 할인율 홍보글', d: '이준호 주임이 AI가 쓴 홍보글을 확인 없이 게시했다. 실제 10% 할인이 “30% 할인”으로 나갔다.',
        off: { user: ['main', 'AI 초안을 확인하지 않고 게시했다. “AI가 썼다”는 변명이 되지 않는다.'], co: ['share', 'AI 사용 지침·검토 절차가 없었다. 고객에게 사과·보상하는 것도 회사다.'], dev: ['low', '틀릴 수 있다는 한계를 알려 왔다. 다만 정확도를 높일 책임은 남는다.'], n: '고객에게는 “바다결이 틀렸다”입니다. <strong>바깥을 향한 책임은 회사</strong>가 지고, 안에서는 왜 놓쳤는지 따집니다.' },
        on: { user: ['main', '정해진 검토 절차를 건너뛰었다면 개인의 책임이 더 분명해진다.'], co: ['share', '절차가 있어도 고객에 대한 책임은 회사. 절차가 실제로 지켜지게 하는 것도 회사 몫.'], dev: ['low', '위와 같다.'], n: '지침이 있으면 <strong>누가 무엇을 확인할지</strong> 분명해지고, 같은 실수를 미리 막을 수 있습니다.' } },
      { ic: 'chat', t: '상담 챗봇의 엉터리 환불 안내', d: '자사몰 상담 챗봇이 있지도 않은 환불 규정을 안내했고, 고객이 그 말을 믿고 샀다.',
        off: { user: ['low', '직원이 직접 답한 것이 아니다.'], co: ['main', '고객 응대를 챗봇에 맡긴 것은 회사. 회사 누리집의 안내는 회사의 안내다.'], dev: ['debate', '제품의 결함인지, 회사 설정·관리의 문제인지에 따라 의견이 갈린다.'], n: '해외 판정 사례처럼 “챗봇은 별개”라는 주장은 받아들여지기 어렵습니다.' },
        on: { user: ['low', '위와 같다.'], co: ['main', '규정 문서 안에서만 답하고, 모르면 사람에게 연결하도록 설정했다면 피해를 크게 줄였을 것이다.'], dev: ['debate', '위와 같다.'], n: '절차가 있어도 책임은 회사에 남지만, <strong>피해가 생길 가능성</strong>이 크게 줄어듭니다.' } },
      { ic: 'user', t: 'AI 서류 선별에서 한 집단만 탈락', d: '채용 AI 점수만 보고 서류를 걸렀더니, 특정 집단 지원자가 거의 다 탈락했다.',
        off: { user: ['share', '담당자가 점수만 보고 탈락시켰다. 결과를 집단별로 살피지 않았다.'], co: ['main', '도입 전 편향 점검, 사람 검토 절차를 마련할 책임은 회사에 있다.'], dev: ['share', '어떤 데이터로 학습했는지, 편향 점검 결과는 어떤지 알릴 책임.'], n: '채용·대출처럼 <strong>사람의 기회를 좌우하는 AI</strong>는 법에서도 고영향 AI로 더 엄격하게 봅니다.' },
        on: { user: ['share', '탈락자 서류도 사람이 다시 보면 놓친 인재를 찾을 수 있다. 검토를 형식적으로 하면 안 된다.'], co: ['share', '절차를 갖춘 만큼 책임이 줄지만, 점검을 계속할 책임은 남는다.'], dev: ['share', '위와 같다.'], n: '사람이 검토해도 <strong>사람의 편견</strong>이 섞일 수 있습니다. 결과를 집단별로 꾸준히 확인합니다.' } },
      { ic: 'eye', t: '남의 캐릭터와 꼭 닮은 생성 이미지', d: '홍보용으로 만든 AI 이미지가 유명 캐릭터와 매우 비슷하다는 지적을 받았다.',
        off: { user: ['main', '게시 전에 비슷한 작품이 있는지 확인할 사람은 이미지를 쓰는 사람이다.'], co: ['share', '광고·홍보물에 쓰기 전 확인 절차가 없었다.'], dev: ['debate', '학습 데이터와 저작권 문제는 여러 나라에서 소송·논의가 진행 중이다.'], n: '11주차 「AI 생성 콘텐츠의 저작권과 표시」와 이어지는 문제입니다. <strong>결론이 아직 나지 않은 쟁점</strong>도 있습니다.' },
        on: { user: ['main', '절차가 있었는데 건너뛰었다면 개인 책임이 더 분명하다.'], co: ['share', '확인 절차를 갖춘 만큼 위험이 줄어든다.'], dev: ['debate', '위와 같다.'], n: '“비슷한 작품 검색 → 담당자 확인 → 게시” 절차가 있으면 위험을 크게 줄일 수 있습니다.' } },
    ];
    let cur = 0;
    const tg = $('rm-tg');
    const cbtn = C.map((c, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'casebtn';
      b.innerHTML = `<svg class="ic"><use href="#i-${c.ic}"/></svg>${c.t}`;
      b.addEventListener('click', () => { cur = i; render(); }); $('rm-cases').appendChild(b); return b;
    });
    const cards = A.map(([k, ic, nm]) => {
      const d = document.createElement('div'); d.className = 'actor';
      d.innerHTML = `<div class="who"><span class="ic-badge ${k === 'user' ? 'o' : ''}"><svg class="ic"><use href="#i-${ic}"/></svg></span>${nm}</div><span class="lv"></span><div class="why"></div>`;
      box.appendChild(d); return d;
    });
    function render() {
      const c = C[cur], s = tg.getAttribute('aria-pressed') === 'true' ? c.on : c.off;
      cbtn.forEach((b, i) => b.setAttribute('aria-pressed', i === cur));
      $('rm-case').innerHTML = `<b>${c.t}</b>${c.d}`;
      A.forEach(([k], i) => {
        const [lv, why] = s[k];
        cards[i].className = 'actor ' + lv;
        cards[i].querySelector('.lv').textContent = LV[lv];
        cards[i].querySelector('.why').textContent = why === '위와 같다.' ? c.off[k][1] : why;
      });
      $('rm-note').innerHTML = s.n;
    }
    tg.addEventListener('click', () => { toggle(tg); render(); });
    render();
  })();

  /* ───────── 2) 채용 AI 공정성 ───────── */
  (function fairness() {
    const pool = $('f-pool'); if (!pool) return;
    // 지원자 200명: 짝수 = 가 집단, 홀수 = 나 집단. 실제 역량(skill)은 같은 분포에서 뽑는다.
    // proxy = 집단과 관련 깊은 다른 정보(예: 특정 활동 경력) — 가 집단 80%, 나 집단 20%가 가지고 있음
    const r = rng(13), P = [];
    for (let i = 0; i < 200; i++) { const g = i % 2; P.push({ g, skill: gauss(r), proxy: r() < (g === 0 ? 0.8 : 0.2) ? 1 : 0, hn: gauss(r) * 0.25 }); }
    const BIAS = [0, 0.4, 0.8, 1.2], NAME = ['없음', '약간', '보통', '심함'];
    const dots = P.map((p) => { const d = document.createElement('span'); d.className = p.g ? 'na' : 'ga'; pool.appendChild(d); return d; });
    const s = $('f-s'), bDel = $('f-del'), bRev = $('f-rev');
    function run(lv, del, rev) {
      const b = BIAS[lv];
      // 과거 합격 기록을 배운 AI: 집단 항목이 있으면 집단에, 지우면 대신 proxy 에 가산점
      const sc = P.map((p) => p.skill + (del ? b * 0.9 * p.proxy : b * (p.g === 0 ? 1 : 0)));
      const idx = P.map((p, i) => i).sort((a, c) => sc[c] - sc[a]);
      if (!rev) return new Set(idx.slice(0, 30));
      // 상위 20명은 자동 통과, 21~50위(경계 구간)는 사람이 실제 역량을 보고 10명을 고름
      const band = idx.slice(20, 50).sort((a, c) => (P[c].skill + P[c].hn) - (P[a].skill + P[a].hn)).slice(0, 10);
      return new Set([...idx.slice(0, 20), ...band]);
    }
    function update() {
      const lv = +s.value, del = bDel.getAttribute('aria-pressed') === 'true', rev = bRev.getAttribute('aria-pressed') === 'true';
      const pass = run(lv, del, rev);
      dots.forEach((d, i) => d.classList.toggle('pass', pass.has(i)));
      const ga = [...pass].filter((i) => P[i].g === 0).length, na = 30 - ga;
      $('f-o').textContent = NAME[lv];
      $('f-ga').textContent = ga + '%  (' + ga + '명)'; $('f-na').textContent = na + '%  (' + na + '명)';
      $('f-gab').style.width = ga * 3 + '%'; $('f-nab').style.width = na * 3 + '%';
      const gap = Math.abs(ga - na), st = $('f-st');
      if (gap <= 4) { st.className = 'status ok'; st.innerHTML = `<b class="k">비교적 고르게 선별</b>합격률 차이 <strong>${gap}%p</strong>. ${lv === 0 ? '과거 기록에 치우침이 없으면 AI도 고르게 고릅니다.' : '치우침이 있어도 <strong>점검 장치</strong>가 차이를 줄였습니다.'}`; }
      else if (gap <= 10) { st.className = 'status mid'; st.innerHTML = `<b class="k">차이가 남아 있음</b>합격률 차이 <strong>${gap}%p</strong>. ${del && !rev ? '항목을 지워도 <strong>관련 깊은 다른 정보</strong>가 단서가 되어 편향이 남습니다.' : '다른 장치도 함께 써 보세요.'}`; }
      else { st.className = 'status bad'; st.innerHTML = `<b class="k">한 집단에 불리한 AI</b>역량은 같은데 합격률 차이 <strong>${gap}%p</strong>. AI가 과거의 치우침을 <strong>그대로 배웠습니다.</strong>`; }
    }
    s.addEventListener('input', update);
    [bDel, bRev].forEach((b) => b.addEventListener('click', () => { toggle(b); update(); }));
    update();
  })();

  /* ───────── 3) 딜레마 카드 ───────── */
  (function dilemma() {
    const grid = $('d-grid'); if (!grid) return;
    const D = [
      { ic: 'book', t: '과제 문장을 AI가 다듬었다', tag: '기준: 수업 규칙', s: '보고서는 내가 직접 썼고, AI에게는 문장만 매끄럽게 다듬어 달라고 했다. 제출할 때 AI 사용을 밝혀야 할까?',
        o: ['밝힌다', '밝히지 않는다', '수업 규칙부터 확인한다'],
        v: [['g', '기준', '수업·학교 규칙이 먼저다. 규칙이 없다면 <b>밝히는 쪽이 안전</b>하다.'], ['', '관점 A', '읽는 사람이 판단할 수 있게 작은 도움도 밝히자.'], ['', '관점 B', '맞춤법 검사기처럼 도구일 뿐, 생각은 내 것이다.']],
        q: '어디까지가 “도구의 도움”이고, 어디부터 “AI가 쓴 글”일까?' },
      { ic: 'chat', t: 'AI 초안으로 쓴 후기 답글', tag: '의견이 갈림', s: '고객 후기 답글을 AI 초안으로 만들고, 직원이 읽고 고쳐서 올린다. 고객에게 “AI 도움을 받았다”고 알려야 할까?',
        o: ['알린다', '알리지 않는다', '경우에 따라 다르다'],
        v: [['', '관점 A', '고객은 사람이 쓴 줄 안다. 나중에 알면 <b>신뢰</b>를 잃는다.'], ['', '관점 B', '직원이 읽고 고쳐 <b>책임지고</b> 보낸 답이다. 회사 이름으로 낸 글이다.'], ['g', '참고', '사람 없이 <b>AI가 바로 답하는 챗봇</b>이라면 알리는 것이 원칙이다.']],
        q: '고객이라면 어떤 경우에 꼭 알고 싶을까?' },
      { ic: 'user', t: 'AI 점수로 서류 자동 탈락', tag: '기준이 비교적 분명', s: '지원자가 많으니 AI 점수 하위 절반은 사람이 서류를 읽지 않고 바로 탈락시키자는 제안이 나왔다.',
        o: ['찬성', '반대', '조건을 붙여 찬성'],
        v: [['g', '기준', '사람의 기회를 좌우하는 결정은 <b>사람이 검토</b>해야 한다. 법도 완전 자동화된 결정에 대한 설명·거부 권리를 둔다.'], ['', '관점 A', '시간이 부족하다. 효율도 회사의 현실이다.'], ['', '관점 B', '편향된 점수라면 좋은 인재를 통째로 놓친다.']],
        q: '시간을 아끼면서도 사람이 확인하는 방법은 무엇일까?' },
      { ic: 'target', t: '20~30대에게만 쿠폰 광고', tag: '의견이 갈림', s: '신규 고객을 늘리려고 간식 할인 쿠폰 광고를 20~30대에게만 보여 주려 한다.',
        o: ['괜찮다', '문제가 있다', '상품에 따라 다르다'],
        v: [['', '관점 A', '목표 고객을 정하는 것은 마케팅의 기본이다(10주차 페르소나).'], ['', '관점 B', '같은 상품을 나이에 따라 다른 가격으로 판다고 느끼면 <b>반발</b>이 생길 수 있다.'], ['g', '참고', '<b>일자리·주거·금융</b> 광고라면 특정 집단을 빼는 것이 기회를 막는 차별이 될 수 있다.']],
        q: '간식 쿠폰 광고와 채용 공고 광고는 무엇이 다를까?' },
      { ic: 'chart', t: '동료의 검증 안 된 숫자', tag: '기준이 비교적 분명', s: '옆 팀 동료가 AI가 정리한 매출 수치를 확인 없이 보고서에 넣었다. 내가 보기엔 틀린 것 같다.',
        o: ['그냥 둔다', '동료에게 먼저 말한다', '팀장에게 바로 알린다'],
        v: [['g', '기준', '틀린 숫자는 결국 회사의 결정을 흔든다. 보고 전이라면 <b>동료에게 먼저</b> 근거를 함께 확인하자고 말한다.'], ['', '관점 A', '관계가 어색해질까 걱정된다. 내 일이 아니다.'], ['', '관점 B', '이미 보고됐거나 큰 금액이라면 팀장에게 알려야 한다.']],
        q: '내가 그 동료라면 어떻게 들으면 좋을까?' },
      { ic: 'sparkles', t: '유명 작가 화풍으로 홍보 이미지', tag: '의견이 갈림', s: '홍보 이미지를 만들며 프롬프트에 “○○ 작가 스타일로”라고 쓰려 한다. 괜찮을까?',
        o: ['괜찮다', '피한다', '개인 연습은 괜찮고 홍보물은 피한다'],
        v: [['', '관점 A', '화풍(스타일) 자체는 저작권 보호 대상이 아니라는 견해가 많다.'], ['', '관점 B', '작가의 노력에 무임승차하고 생계를 위협한다. 학습 데이터 논쟁·소송도 진행 중이다.'], ['g', '참고', '회사 홍보물이라면 <b>평판·분쟁 위험</b>까지 따져야 한다(11-3).']],
        q: '회사 이름이 걸린 홍보물이라면 어떤 선택이 덜 위험할까?' },
    ];
    const seen = new Set();
    const cards = D.map((d, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'dcard';
      b.innerHTML = `<span class="ic-badge ${d.tag === '의견이 갈림' ? 'o' : ''}"><svg class="ic"><use href="#i-${d.ic}"/></svg></span><span><span class="nm">${d.t}</span><span class="tg">${d.tag}</span></span>`;
      b.addEventListener('click', () => open(i)); grid.appendChild(b); return b;
    });
    function open(i) {
      const d = D[i];
      cards.forEach((c, k) => c.classList.toggle('on', k === i));
      $('d-h').textContent = d.t;
      $('d-sit').textContent = d.s;
      const opts = $('d-opts'), views = $('d-views');
      opts.innerHTML = ''; views.className = 'views';
      views.innerHTML = d.v.map(([k, h, t]) => `<div class="view ${k}"><b>${h}</b> ${t}</div>`).join('') + `<div class="dq">토론해 보기 · ${d.q}</div>`;
      d.o.forEach((t) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'dopt'; b.textContent = '나라면: ' + t; b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => {
          opts.querySelectorAll('.dopt').forEach((x) => x.setAttribute('aria-pressed', x === b));
          views.className = 'views on';
          seen.add(i); cards[i].classList.add('seen');
          $('d-n').textContent = seen.size + ' / ' + D.length + ' 생각해 봄';
        });
        opts.appendChild(b);
      });
    }
  })();
})();
