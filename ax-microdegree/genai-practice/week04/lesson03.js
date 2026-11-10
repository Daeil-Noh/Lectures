// 4주 3차시 전용: 루브릭 채점판, 고칠 한 줄 고르기, v1 → v2 전후 비교
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const CRIT = [
    { s: '유형', q: '알맞은 유형인가' },
    { s: '분량', q: '2~3문장인가' },
    { s: '구체성', q: '후기 내용을 짚었나' },
    { s: '약속·사실', q: '지어낸 약속·정보가 없나' },
    { s: '응대', q: '유형에 맞게 응대했나' },
  ];
  // v1 템플릿으로 나온 예시 결과(미리 써 둔 것)와 채점: f = [유형, 분량, 구체성, 약속·사실, 응대]
  const V1 = [
    { r: '선물 세트 구성이 조금 더 다양했으면 해요', ans: '제안', t: '제안', f: [1, 1, 1, 0, 1],
      a: '고객님, 소중한 의견 감사합니다! 말씀하신 대로 다음 명절에는 더 다양한 구성의 선물 세트를 꼭 선보이겠습니다. 앞으로도 많은 관심 부탁드립니다.',
      why: { 3: '‘다음 명절에 꼭 선보이겠다’ — 회사가 정하지 않은 출시 약속' } },
    { r: '유통기한이 짧게 남은 제품이 왔어요', ans: '불만', t: '불만', f: [1, 0, 1, 0, 1],
      a: '고객님, 유통기한이 짧은 제품을 보내 드려 정말 죄송합니다. 불편을 드린 점 깊이 사과드립니다. 확인 후 전액 환불해 드리겠습니다. 앞으로 출고 전 유통기한을 더 꼼꼼히 확인하겠습니다.',
      why: { 1: '4문장 — 길다', 3: '‘전액 환불’ 약속 — 환불은 회사 정책 확인이 먼저' } },
    { r: '조금 딱딱해서 우유에 오래 불려야 해요', ans: '불만', t: '불만', f: [1, 1, 0, 1, 0],
      a: '고객님, 불편을 드려 죄송합니다. 더 좋은 제품으로 보답하겠습니다.',
      why: { 2: '‘딱딱함’을 짚지 않은 일반적인 사과', 4: '사과만 있고 확인·연락 안내가 없다' } },
    { r: '맛은 괜찮은데 특별하진 않아요', ans: '보통', t: '불만', f: [0, 1, 0, 1, 0],
      a: '고객님, 기대에 미치지 못해 죄송합니다. 맛 개선을 위해 노력하겠습니다.',
      why: { 0: '좋지도 나쁘지도 않은 평가 → ‘보통’ (v1에는 보통이 없다)', 2: '‘맛은 괜찮다’는 말을 놓쳤다', 4: '보통 후기에 사과 — 감사 + 개선 의지가 알맞다' } },
    { r: '생각보다 양이 적어요', ans: '불만', t: '불만', f: [1, 1, 1, 0, 0],
      a: '고객님, 양이 적게 느껴지셨다니 아쉽습니다. 다음 주문 때 한 봉 더 넣어 드릴게요! 소중한 의견 감사합니다.',
      why: { 3: '‘한 봉 더’ — 정해지지 않은 보상 약속', 4: '사과·안내 없이 ‘아쉽습니다’' } },
    { r: '가격이 조금 부담됩니다', ans: '불만', t: '불만', f: [1, 1, 1, 1, 1],
      a: '고객님, 가격이 부담되셨다니 죄송합니다. 가격과 구성에 대한 의견은 담당 부서에 전달하겠습니다.', why: {} },
    { r: '무난해요', ans: '보통', t: '칭찬', f: [0, 1, 0, 1, 0],
      a: '고객님, 좋은 후기 감사합니다! 앞으로도 맛있는 제품으로 찾아뵙겠습니다.',
      why: { 0: '‘무난해요’를 칭찬으로 — 보통이 맞다', 2: '후기 내용을 짚지 않았다', 4: '‘좋은 후기’라고 단정했다' } },
    { r: '재구매했어요. 아이들도 잘 먹네요', ans: '칭찬', t: '칭찬', f: [1, 1, 1, 1, 1],
      a: '고객님, 다시 찾아 주셔서 감사합니다! 아이들도 잘 먹는다니 저희도 기쁩니다. 온 가족이 건강한 간식 시간 보내시길 바랍니다.', why: {} },
    { r: '포장이 꼼꼼해서 선물하기 좋았습니다', ans: '칭찬', t: '칭찬', f: [1, 1, 1, 1, 1],
      a: '고객님, 정성 들여 포장한 마음이 전해진 것 같아 기쁩니다. 선물 받으신 분도 좋아하셨으면 좋겠습니다. 감사합니다.', why: {} },
    { r: '견과가 넉넉하게 들어 있어요', ans: '칭찬', t: '칭찬', f: [1, 1, 1, 0, 1],
      a: '고객님, 견과를 넉넉하게 담은 걸 알아봐 주셔서 감사합니다! 저희 선물 세트는 국내산 견과만 사용해 더욱 믿을 수 있습니다. 다음에도 찾아 주세요.',
      why: { 3: '‘국내산 견과만 사용’ — 후기에 없는 제품 정보를 지어냈다' } },
  ];
  // v2 결과 채점: 2번 답글만 아직 4문장
  const V2F = V1.map(() => [1, 1, 1, 1, 1]); V2F[1][1] = 0;
  const colSum = (F) => CRIT.map((_, j) => F.reduce((a, f) => a + f[j], 0));
  const V1F = V1.map((x) => x.f);

  /* ───────── 1) 루브릭 채점판 ───────── */
  (function grade() {
    const tab = $('g-tab'); if (!tab) return;
    const graded = new Set();
    let sel = 3;
    const crit = $('g-crit');
    CRIT.forEach((c, j) => {
      const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<b>${'①②③④⑤'[j]}</b>${c.s}`;
      b.title = c.q;
      b.addEventListener('click', () => { graded.has(j) ? graded.delete(j) : graded.add(j); render(); });
      crit.appendChild(b);
    });
    const all = document.createElement('button'); all.type = 'button'; all.setAttribute('aria-pressed', 'false');
    all.innerHTML = '<b>✓</b>모두';
    all.addEventListener('click', () => { const full = graded.size === 5; graded.clear(); if (!full) CRIT.forEach((_, j) => graded.add(j)); render(); });
    crit.appendChild(all);
    function render() {
      crit.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-pressed', j < 5 ? graded.has(j) : graded.size === 5));
      let h = '<thead><tr><th>#</th><th>후기</th><th>AI 유형</th>' + CRIT.map((c, j) => `<th class="c${graded.has(j) ? ' on' : ''}" title="${c.s}">${'①②③④⑤'[j]}</th>`).join('') + '</tr></thead><tbody>';
      V1.forEach((x, i) => {
        h += `<tr tabindex="0" data-i="${i}" class="${i === sel ? 'sel' : ''}"><td>${i + 1}</td><td>${esc(x.r)}</td><td><span class="typ ${x.t}">${x.t}</span></td>`;
        x.f.forEach((v, j) => { h += graded.has(j) ? `<td class="c ${v ? 'y' : 'n'}">${v ? '✓' : '✗'}</td>` : '<td class="c q">·</td>'; });
        h += '</tr>';
      });
      tab.innerHTML = h + '</tbody>';
      tab.querySelectorAll('tbody tr').forEach((tr) => {
        const go = () => { sel = +tr.dataset.i; render(); const t = tab.querySelector(`tr[data-i="${sel}"]`); if (t) t.focus(); };
        tr.addEventListener('click', go);
        tr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
      });
      const sums = colSum(V1F);
      let got = 0; graded.forEach((j) => (got += sums[j]));
      $('g-done').textContent = graded.size + ' / 5';
      $('g-score').textContent = graded.size ? got + ' / ' + graded.size * 10 : '-';
      const x = V1[sel];
      let d = `<div class="rv">${sel + 1}번 · “${esc(x.r)}” <span class="typ ${x.t}">AI: ${x.t}</span>${x.t !== x.ans && graded.has(0) ? ` <span class="typ ${x.ans}">정답: ${x.ans}</span>` : ''}</div><div class="rp">${esc(x.a)}</div>`;
      const fails = Object.keys(x.why).map(Number).filter((j) => graded.has(j));
      if (!graded.size) d += '<div class="muted" style="font-size:13.5px">오른쪽 위 기준 버튼을 눌러 채점을 시작하세요.</div>';
      else if (fails.length) d += fails.map((j) => `<div class="why">✗ ${'①②③④⑤'[j]} ${CRIT[j].s}: ${x.why[j]}</div>`).join('');
      else d += '<div style="color:var(--ok);font-weight:800;font-size:13.5px">✓ 채점한 기준을 모두 통과</div>';
      if (graded.size === 5) d += `<div class="muted" style="font-size:13px;margin-top:auto">기준별 통과: ${CRIT.map((c, j) => c.s + ' ' + sums[j]).join(' · ')} (각 10건 중)</div>`;
      $('g-detail').innerHTML = d;
    }
    render();
  })();

  /* ───────── 2) 고칠 한 줄 고르기 ───────── */
  (function fixes() {
    const wrap = $('fx'); if (!wrap) return;
    const P = [
      { no: '4·7번 · ① 유형', p: '“무난해요”, “특별하진 않아요”를 불만·칭찬으로 억지 분류', o: ['후기를 더 꼼꼼히 읽으라고 한다', '유형에 ‘보통’을 추가하고 뜻을 적는다'], c: 1, line: '유형: 칭찬 / 불만 / 제안 / 보통 (보통 = 좋지도 나쁘지도 않은 평가)', ex: '고를 칸이 없으면 AI는 가장 가까운 칸에 억지로 넣는다. 선택지를 고친다.' },
      { no: '1·2·5번 · ④ 약속', p: '“전액 환불”, “한 봉 더”, “꼭 선보이겠다” 약속', o: ['환불·보상·출시는 약속하지 말고 고객센터 안내로', '답글을 더 정중하게 쓰라고 한다'], c: 0, line: '환불·교환·보상·신제품 출시는 약속하지 말 것', ex: '정중함의 문제가 아니라 규칙이 없어서다. 회사가 정할 일은 약속하지 않게 한다.' },
      { no: '10번 · ④ 사실', p: '“국내산 견과만 사용” — 후기에 없는 제품 정보', o: ['제품 정보를 더 많이 넣으라고 한다', '후기에 없는 제품 정보는 쓰지 말라고 한다'], c: 1, line: '후기에 없는 제품 정보(원산지·성분 등)는 쓰지 말 것', ex: '그럴듯한 지어낸 사실(환각, 2주 3차시)은 금지 규칙으로 막고, 사람이 확인한다.' },
      { no: '2번 · ② 분량', p: '4문장짜리 긴 답글, 답글마다 길이가 제각각', o: ['‘고객님’으로 시작해 2~3문장', '답글을 짧게 써 줘'], c: 0, line: "답글은 '고객님'으로 시작해 2~3문장", ex: '‘짧게’는 사람마다 다르다. 숫자로 정해 준다(4주 1차시).' },
      { no: '2번 · 팀장 요청', p: '팀장이 부탁한 ‘유통기한 건 따로 표시’가 결과에 없다', o: ['‘확인 필요’ 열을 추가해 ● 표시', '유통기한 후기는 답글에서 빼라고 한다'], c: 0, line: "열에 '확인 필요' 추가 — 유통기한·파손 후기에 ● 표시", ex: '요청받은 일을 템플릿 형식에 넣는다. 빼 버리면 급한 건이 묻힌다.' },
    ];
    const got = [];
    const sum = document.createElement('div'); sum.className = 'fsum';
    function drawSum() {
      sum.innerHTML = `<div class="h">v2에 넣을 한 줄 (${got.length} / 5)</div>` + (got.length ? '<ol>' + got.map((g) => `<li>${esc(g)}</li>`).join('') + '</ol>' : '<div class="muted" style="font-size:14px;margin-top:4px">카드에서 알맞은 고침을 고르면 여기에 모입니다.</div>');
    }
    P.forEach((x) => {
      const d = document.createElement('div'); d.className = 'fcard';
      d.innerHTML = `<div class="pb"><small>${x.no}</small>${esc(x.p)}</div>` + x.o.map((o, k) => `<button type="button" class="op" data-k="${k}">${esc(o)}</button>`).join('') + `<div class="ex">${esc(x.ex)}</div>`;
      const ops = d.querySelectorAll('.op');
      ops.forEach((b) => b.addEventListener('click', () => {
        const k = +b.dataset.k;
        if (k !== x.c) { b.classList.add('wrong'); b.disabled = true; d.classList.add('done'); return; }
        ops.forEach((o) => (o.disabled = true));
        b.classList.add('right'); d.classList.add('done');
        got.push(x.line); drawSum();
      }));
      wrap.appendChild(d);
    });
    wrap.appendChild(sum); drawSum();
  })();

  /* ───────── 3) v1 → v2 전후 비교 ───────── */
  (function beforeAfter() {
    const sw = $('ba-sw'); if (!sw) return;
    const A = (t) => `<mark class="add">${esc(t)}</mark>`;
    const V1T = esc("너는 부산의 건강 간식 회사 '바다결'의 고객 응대 담당자야.\n아래 [후기 목록]을 읽고 다음 순서대로 해 줘.\n1단계: 각 후기를 칭찬 / 불만 / 제안 중 하나로 분류\n2단계: 후기 내용을 한 줄로 요약\n3단계: 고객에게 남길 답글 초안 작성\n결과는 표로 정리해 줘. 열: 번호 | 유형 | 요약 | 답글 초안\n\n[후기 목록]\n(여기에 reviews_q3_10.txt 내용을 붙여 넣기)");
    const V2T = esc("너는 부산의 건강 간식 회사 '바다결'의 고객 응대 담당자야.\n아래 [후기 목록]을 읽고 다음 순서대로 해 줘.\n1단계: 각 후기를 칭찬 / 불만 / 제안") + A(' / 보통') + esc(' 중 하나로 분류\n')
      + A('  (보통 = 좋지도 나쁘지도 않은 평가. 예: 무난해요)') + '\n'
      + esc('2단계: 후기 내용을 한 줄로 요약\n3단계: 고객에게 남길 답글 초안 작성\n')
      + A("  - '고객님'으로 시작해 2~3문장, 후기 내용을 한 가지 이상 구체적으로 언급") + '\n'
      + A('  - 불만에는 사과 + "고객센터로 알려 주시면 확인해 드리겠습니다" 안내') + '\n'
      + A('  - 환불·교환·보상·신제품 출시는 약속하지 말 것') + '\n'
      + A('  - 후기에 없는 제품 정보(원산지·성분 등)는 쓰지 말 것') + '\n'
      + A('  - 답글 예시) 후기: 배송 중에 봉투가 터져서 왔어요') + '\n'
      + A('    → 고객님, 봉투가 터진 채로 받으셔서 많이 불편하셨죠. 정말 죄송합니다. 사진을 고객센터로 보내 주시면 바로 확인해 드리겠습니다.') + '\n'
      + esc('결과는 표로 정리해 줘. 열: 번호 | 유형 | 요약 | ') + A('확인 필요 | ') + esc('답글 초안') + '\n'
      + A("'확인 필요' 열에는 유통기한·파손·이물질처럼 담당 부서가 바로 확인해야 하는 후기에만 ● 표시.") + '\n'
      + esc('\n[후기 목록]\n(여기에 reviews_q3_10.txt 내용을 붙여 넣기)');
    const s1 = colSum(V1F), s2 = colSum(V2F);
    const t1 = s1.reduce((a, b) => a + b, 0), t2 = s2.reduce((a, b) => a + b, 0);
    const bars = $('ba-bars');
    bars.innerHTML = CRIT.map((c, j) => `<div class="brow"><span>${'①②③④⑤'[j]} ${c.s}</span><div class="tr"><div class="bb v1"><i style="width:${s1[j] * 10}%"></i><span>${s1[j]}</span></div><div class="bb v2"><i style="width:${s2[j] * 10}%"></i><span>${s2[j]}</span></div></div></div>`).join('');
    function pick(v) {
      sw.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === v));
      $('ba-name').textContent = v === 'v1' ? '후기분류답글_v1' : '후기분류답글_v2 (초록 = 추가된 부분)';
      $('ba-pre').innerHTML = v === 'v1' ? V1T : V2T;
      bars.className = 'bars ' + (v === 'v1' ? 'dimv2' : 'dimv1');
      $('ba-score').textContent = (v === 'v1' ? t1 : t2) + ' / 50';
      const st = $('ba-st');
      if (v === 'v1') { st.className = 'status bad'; st.innerHTML = `<b class="k">v1: ${t1}점</b>약속·사실(${s1[3]}/10)과 응대(${s1[4]}/10)에서 가장 많이 깎였습니다. ‘보통’ 칸이 없어 유형도 2건 틀렸습니다.`; }
      else { st.className = 'status mid'; st.innerHTML = `<b class="k">v2: ${t2}점 (+${t2 - t1})</b>2번 답글이 아직 4문장입니다. 템플릿을 고쳐도 100%는 아닙니다 → <strong>게시 전 사람 확인</strong>.`; }
    }
    sw.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => pick(b.dataset.v)));
    pick('v1');
  })();
})();
