// 14주 3차시 전용: 표지, 후기 근거 막대, 예시 A 주석, 광고 숫자 검증, 약한 개선안 찾기, 제출 전 점검표
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  /* sales_2026.csv 오픈마켓 행 월별 합계 (python3로 계산, 원 단위) */
  const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월'];
  const REV = [19918000, 18730600, 17795100, 16070300, 17974300, 18623300, 18513200, 18730100, 19603000];
  const AD = [6670463, 6899640, 6856542, 7251863, 6894632, 7083674, 8870021, 9175566, 6955071];
  const man = (v) => Math.round(v / 10000).toLocaleString('ko-KR');
  const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;

  /* ───────── 0) 표지 막대 ───────── */
  (function cover() {
    const g = $('cv-bars'); if (!g) return;
    AD.forEach((v, i) => {
      const h = (v / 10000 - 560) * 0.38;
      el('rect', { x: 284 + i * 20, y: 330 - h, width: 13, height: h, rx: 3, class: i === 6 || i === 7 ? 'f-acc2' : 'f-acc2s' }, g);
    });
    el('rect', { x: 280, y: 140, width: 160, height: 12, rx: 6, class: 'f-line' }, g);
    el('rect', { x: 280, y: 166, width: 120, height: 12, rx: 6, class: 'f-line' }, g);
  })();

  /* ───────── 1) 1~2점 후기 주제 (reviews_2026.csv로 계산) ───────── */
  (function negBars() {
    const w = $('neg-bars'); if (!w) return;
    const D = [['생각보다 양이 적어요', 7], ['문의 답변이 늦었어요', 6], ['조금 딱딱해서 오래 불려야', 6], ['유통기한이 짧게 남은 제품', 4], ['가격이 조금 부담됩니다', 3], ['배송 중 봉투가 터짐', 1]];
    D.forEach(([t, n]) => {
      const r = document.createElement('div'); r.className = 'hb';
      r.innerHTML = `<span>${t}</span><span class="tr"><i style="width:${n / 7 * 100}%;${t.startsWith('문의') ? 'background:var(--accent)' : ''}"></i></span><b>${n}</b>`;
      w.appendChild(r);
    });
  })();

  /* ───────── 2) 예시 A 주석 ───────── */
  (function annotate() {
    const doc = $('doc'), pins = $('pins'); if (!doc) return;
    const P = [
      { k: '제목', sec: '1. 제목', t: '<mark>고객 후기 답글과 월간 요약</mark>, <mark>생성형AI 초안 + 담당자 검토</mark>로 <mark>월 약 2시간 줄이기(추정)</mark>', w: '업무 · AI 쓰임 · 결과가 한 줄에 들어 있다. 숫자 뒤에 <strong>(추정)</strong>을 붙여 과장하지 않았다.' },
      { k: '근거', sec: '3. 현재 업무와 문제', t: '1~9월 후기 <mark>120건</mark>, 평균 별점 <mark>3.7점</mark>, 1~2점 후기 <mark>27건(22.5%)</mark> — reviews_2026.csv에서 <mark>직접 계산</mark>.\n시간: 후기 1건 확인·답글 작성 약 6분 … 회사 소개를 바탕으로 정한 <mark>가정값</mark>이다.', w: '숫자는 원자료에서 <strong>직접 계산</strong>했고, 알 수 없는 시간은 <strong>가정</strong>이라고 밝히고 이유를 붙였다.' },
      { k: '흐름', sec: '4. AI 활용 방안 — 작업 흐름', t: '1. <mark>(사람)</mark> 지난주 후기를 표로 모은다. <mark>이름·연락처·주문번호는 넣지 않는다.</mark>\n2. <mark>(AI)</mark> 주제별로 분류하고, 1~3점 후기에 답글 초안을 쓴다.\n3. <mark>(사람)</mark> 사실·약속·말투를 확인하고 고쳐서 게시한다.', w: '단계마다 <strong>누가 하는지</strong> 표시했다. 사람이 확인·결정하는 단계와 개인정보를 빼는 단계가 분명하다.' },
      { k: '프롬프트', sec: '4. AI 활용 방안 — 프롬프트', t: '3) 보상·환불·배송 날짜처럼 회사가 정해야 하는 내용은 <mark>약속하지 말고 [담당자 확인]이라고 비워 둬.</mark>\n4) 분류가 애매한 후기는 <mark>‘애매함’으로 표시</mark>하고 이유를 한 줄로 적어 줘.', w: '환각 위험을 <strong>프롬프트 안에서</strong> 미리 막았다. 위험과 대응이 방안에 녹아 있다.' },
      { k: '시연', sec: '5. 시연 결과 — 내가 고친 점', t: '<mark>“3~5분 두었다가”는 AI가 만든 숫자</mark>다. 생산팀에 확인하고 “잠시 두었다가”로 고쳤다.\n오프라인 매장 후기에 <mark>“배송”을 언급한 초안</mark>이 1건 있어 고쳤다.', w: '잘된 점만 쓰지 않았다. <strong>AI가 틀린 점과 내가 고친 점</strong>이 시연의 핵심이다.' },
      { k: '효과', sec: '6. 기대 효과', t: '지금: 19건 × 6분 + 90분 = <mark>204분</mark>\n바꾼 뒤: 10분 + 19건 × 2분 + 20분 = <mark>68분</mark>\n<mark>월 약 136분 절약(추정)</mark>\n확인 방법: 시범 4주 동안 <mark>실제 처리 시간을 기록</mark>한다.', w: '계산식이 보이고, <strong>검토 시간</strong>도 넣었다. 실행 후 <strong>확인할 방법</strong>까지 정했다.' },
      { k: '위험', sec: '7. 위험과 대응', t: '개인정보 · 저작권 · 환각 · 편향 <mark>네 가지 모두</mark> 표로 정리.\n편향: 낮은 별점 후기에만 지나치게 사과하거나 채널별로 말투가 달라짐 → <mark>매주 답글 3건을 골라 말투를 비교 점검</mark>', w: '“해당 적음”도 <strong>이유와 함께</strong> 적었다. 대응이 구체적인 행동이다.' },
      { k: '활용 내역', sec: '9. AI 활용 내역', t: 'Gemini — 9월 후기 분류·답글 초안 → <mark>숫자 삭제, 채널 오류 수정</mark>\nClaude — 같은 프롬프트로 비교 → <mark>프롬프트 수정</mark>\nGemini — 요약 문장 다듬기 → <mark>숫자는 직접 계산한 값으로</mark>', w: '어떤 도구에 무엇을 시켰고 <strong>내가 무엇을 확인·수정했는지</strong> 밝혔다.' },
    ];
    const seen = new Set();
    const btns = P.map((p, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pin'; b.setAttribute('aria-pressed', 'false');
      b.textContent = (i + 1) + ' ' + p.k;
      b.addEventListener('click', () => pick(i));
      pins.appendChild(b);
      return b;
    });
    function pick(i) {
      const p = P[i]; seen.add(i);
      btns.forEach((b, k) => { b.setAttribute('aria-pressed', k === i); b.classList.toggle('seen', seen.has(k)); });
      doc.innerHTML = `<div class="dh"><span>예시 개선안 A · 바다결 온라인 마케팅</span><span>${i + 1} / ${P.length}</span></div><div class="ds">${p.sec}</div><div class="dt">${p.t}</div>`;
      $('why-h').textContent = (i + 1) + '. ' + p.k + ' — 왜 좋은가';
      $('why').innerHTML = p.w;
      $('pin-n').textContent = seen.size + ' / ' + P.length + ' 살펴봄';
    }
    pick(0);
  })();

  /* ───────── 3) 광고 숫자 검증 ───────── */
  (function adCheck() {
    const svg = $('adchart'); if (!svg) return;
    const L = 62, R = 622, T = 30, B = 360, MAX = 2200;
    const Y = (v) => B - v / 10000 / MAX * (B - T);
    const step = (R - L) / 9;
    for (let v = 0; v <= 2000; v += 500) {
      el('line', { x1: L, x2: R, y1: Y(v * 10000), y2: Y(v * 10000), class: 'p-grid' }, svg);
      el('text', { x: L - 8, y: Y(v * 10000) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = v.toLocaleString('ko-KR');
    }
    el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis' }, svg);
    el('text', { x: R, y: 18, 'text-anchor': 'end', class: 'p-tick', style: 'font-size:14px;font-weight:700' }, svg).textContent = '단위: 만 원';
    const hl = el('g', {}, svg);
    const groups = MONTHS.map((m, i) => {
      const x0 = L + i * step + 8, bw = (step - 16) / 2;
      const g = el('g', {}, svg);
      el('rect', { x: x0, y: Y(REV[i]), width: bw, height: B - Y(REV[i]), rx: 4, fill: 'var(--accent)', 'fill-opacity': 0.75 }, g);
      el('rect', { x: x0 + bw, y: Y(AD[i]), width: bw, height: B - Y(AD[i]), rx: 4, fill: 'var(--accent-2)' }, g);
      el('text', { x: x0 + bw, y: B + 20, 'text-anchor': 'middle', class: 'p-tick', style: 'font-size:14px;font-weight:700' }, svg).textContent = m;
      el('text', { x: x0 + bw, y: Y(REV[i]) - 8, 'text-anchor': 'middle', class: 'p-tick', style: 'font-size:12px' }, svg).textContent = (REV[i] / AD[i]).toFixed(2);
      return { x: x0 - 4, w: bw * 2 + 8 };
    });
    // 범례
    el('rect', { x: L + 6, y: 6, width: 14, height: 14, rx: 3, fill: 'var(--accent)', 'fill-opacity': 0.75 }, svg);
    el('text', { x: L + 26, y: 18, class: 'p-tick', style: 'font-size:14px' }, svg).textContent = '매출';
    el('rect', { x: L + 76, y: 6, width: 14, height: 14, rx: 3, fill: 'var(--accent-2)' }, svg);
    el('text', { x: L + 96, y: 18, class: 'p-tick', style: 'font-size:14px' }, svg).textContent = '광고비';
    el('text', { x: L + 160, y: 18, class: 'p-tick', style: 'font-size:14px' }, svg).textContent = '막대 위 숫자 = 매출÷광고비';
    const mark = (ids, color) => {
      hl.innerHTML = '';
      ids.forEach((i) => el('rect', { x: groups[i].x, y: T - 4, width: groups[i].w, height: B - T + 4, rx: 8, fill: color, 'fill-opacity': 0.12, stroke: color, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, hl));
    };
    const a16 = avg(AD.slice(0, 6)), a78 = avg(AD.slice(6, 8)), r16 = avg(REV.slice(0, 6)), r78 = avg(REV.slice(6, 8));
    const pct = (a, b) => ((b / a - 1) * 100).toFixed(1);
    const revMax = REV.indexOf(Math.max(...REV)), ratio = REV.map((v, i) => v / AD[i]), rMin = ratio.indexOf(Math.min(...ratio));
    const C = [
      { t: '① 7~8월 광고비는 1~6월 월평균보다 약 30% 많았다.', ok: Math.abs(+pct(a16, a78) - 30) < 1, c: `1~6월 월평균 ${man(a16)}만 원 → 7~8월 ${man(a78)}만 원 (+${pct(a16, a78)}%)`, m: [6, 7] },
      { t: '② 같은 기간 매출은 약 2% 늘어, 광고비만큼 늘지 않았다.', ok: Math.abs(+pct(r16, r78) - 2) < 1, c: `1~6월 월평균 ${man(r16)}만 원 → 7~8월 ${man(r78)}만 원 (+${pct(r16, r78)}%)`, m: [6, 7] },
      { t: '③ 9개월 중 오픈마켓 매출이 가장 높은 달은 8월이다.', ok: revMax === 7, c: `실제로는 ${MONTHS[revMax]}(${man(REV[revMax])}만 원). 8월은 ${man(REV[7])}만 원 — 광고비가 가장 많은 달과 헷갈렸다.`, m: [revMax, 7] },
      { t: '④ 매출÷광고비가 가장 낮은 달은 8월(2.04)이다.', ok: rMin === 7, c: `${MONTHS[rMin]} ${ratio[rMin].toFixed(2)} — 9개월 중 가장 낮음`, m: [rMin] },
    ];
    const wrap = $('claims'); let n = 0;
    C.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'claim'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span>${c.t}</span><span class="v">검증하기</span><span class="c">${c.c}</span>`;
      b.addEventListener('click', () => {
        wrap.querySelectorAll('.claim').forEach((x) => x.setAttribute('aria-pressed', x === b));
        mark(c.m, c.ok ? 'var(--ok)' : 'var(--bad)');
        if (b.classList.contains('ok') || b.classList.contains('no')) return;
        n++;
        b.classList.add(c.ok ? 'ok' : 'no');
        b.querySelector('.v').textContent = c.ok ? '✓ 맞음' : '✗ 틀림';
        const st = $('cl-st');
        if (!c.ok) { st.className = 'status bad'; st.innerHTML = `<b class="k">${n} / 4 검증 · 오류 발견</b>그럴듯한 문장이지만 <strong>원자료와 다릅니다.</strong> 보고서에 내기 전에 고칩니다.`; }
        else if (n === 4 || wrap.querySelector('.claim.no')) { st.className = n === 4 ? 'status ok' : 'status bad'; st.innerHTML = `<b class="k">${n} / 4 검증</b>${n === 4 ? '네 문장 중 <strong>하나가 틀렸습니다.</strong> 그래서 예시 B는 “핵심 숫자 3개 이상 재계산”을 규칙으로 정했습니다.' : '남은 문장도 확인해 보세요.'}`; }
        else { st.className = 'status mid'; st.innerHTML = `<b class="k">${n} / 4 검증</b>이 문장은 맞습니다. 남은 문장 중 <strong>하나가 틀렸습니다.</strong>`; }
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 4) 약한 개선안 ───────── */
  (function weak() {
    const box = $('weak'); if (!box) return;
    const W = [
      { s: '제목', t: 'AI를 활용한 고객 관리 혁신 방안', h: '흐릿한 제목', d: '어떤 업무를, 어떻게, 얼마나 바꾸는지 보이지 않는다.', f: '→ 업무 + AI 쓰임 + 결과(추정)를 한 줄로' },
      { s: '현재 문제', t: '요즘 후기가 너무 많아서 담당자가 힘들다.', h: '근거 없음', d: '“많다”, “힘들다”는 느낌이다. 얼마나인지 알 수 없다.', f: '→ 120건, 1~2점 27건(22.5%), 건당 6분(가정)' },
      { s: 'AI 활용 방안', t: 'AI가 모든 후기에 자동으로 답글을 달게 한다.', h: '사람의 검토 없음', d: 'AI 답글이 지어낸 약속·규정이 그대로 고객에게 간다.', f: '→ AI 초안 → 사람이 확인·수정 후 게시' },
      { s: '', t: '고객 이름과 주문번호도 함께 넣으면 더 정확한 답글이 나온다.', h: '개인정보', d: '고객 개인정보를 외부 서비스에 보내게 된다(1주 3차시).', f: '→ 제품·채널·별점·문장만, 이름은 [고객명]으로' },
      { s: '시연 결과', t: 'AI에게 후기를 넣어 보니 답글이 잘 나왔다.', h: '입력·출력 없음', d: '무엇을 넣어 무엇이 나왔는지, 무엇을 고쳤는지 보이지 않는다.', f: '→ 입력 일부 + AI 출력 그대로 + 고친 점' },
      { s: '기대 효과', t: '업무 시간이 90% 줄고 고객 만족도가 크게 오를 것이다.', h: '근거 없는 효과', d: '90%는 어디서 나왔나? 검토 시간도 빠졌다.', f: '→ 가정 + 계산식, “추정”, 확인 방법' },
      { s: '위험과 대응', t: '생성형AI는 성능이 좋아 위험은 특별히 없다.', h: '위험을 숨김', d: '환각·개인정보·편향·저작권을 생각하지 않았다는 신호다.', f: '→ 네 가지 위험과 구체적인 대응' },
      { s: '참고 자료', t: '참고 자료: AI 답변', h: 'AI 답변은 출처가 아님', d: '원래 자료를 확인하지 않았다. AI 사용은 활용 내역에 따로 밝힌다.', f: '→ reviews_2026.csv 등 원자료 + AI 활용 내역 표' },
    ];
    box.innerHTML = '<div class="dh" style="font-size:15px;font-weight:800;color:var(--muted);margin-bottom:4px">약한 개선안 · 바다결 고객 후기 (강의용 예시)</div>';
    let n = 0;
    W.forEach((w) => {
      const row = document.createElement('div'); row.className = 'wl';
      row.innerHTML = `<span>${w.s}</span>`;
      const sp = document.createElement('span'); sp.className = 'ws'; sp.tabIndex = 0; sp.setAttribute('role', 'button'); sp.textContent = w.t;
      const show = () => {
        $('wk-h').textContent = w.h; $('wk-d').textContent = w.d; $('wk-f').textContent = w.f;
        if (sp.classList.contains('hit')) return;
        sp.classList.add('hit'); n++;
        const tag = document.createElement('span'); tag.className = 'wtag'; tag.textContent = w.h; sp.after(tag);
        $('wk-n').textContent = n + ' / ' + W.length;
        if (n === W.length) $('wk-h').textContent = w.h + ' — 여덟 곳을 모두 찾았습니다!';
      };
      sp.addEventListener('click', show);
      sp.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); show(); } });
      const wrapSpan = document.createElement('span'); wrapSpan.appendChild(sp);
      row.appendChild(wrapSpan);
      box.appendChild(row);
    });
  })();

  /* ───────── 5) 제출 전 점검표 ───────── */
  (function checklist() {
    const wrap = $('checks'), svg = $('ck-ring'); if (!wrap) return;
    const I = [
      ['제목에 업무·AI 쓰임·결과가 드러난다', '1'], ['요약만 읽어도 문제-방안-효과가 보인다', '2'],
      ['현재 문제에 숫자·사례 근거가 있다', '3'], ['도구·프롬프트·작업 흐름을 따라 할 수 있다', '4'],
      ['시연 결과에 실제 입력·출력 예시가 있다', '5'], ['기대 효과를 가정과 함께 추정치로 썼다', '6'],
      ['개인정보·저작권·환각·편향 위험과 대응이 있다', '7'], ['사람이 확인·결정하는 단계가 있다', '4·7'],
      ['AI 활용 내역(도구·용도·고친 점)을 밝혔다', '9'], ['참고 자료의 원래 출처를 적었다', '10'],
    ];
    const on = new Array(I.length).fill(false);
    const btns = I.map(([t, g], i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'ck'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="chk"></span><span>${t}</span><span class="gn">칸 ${g}</span>`;
      b.addEventListener('click', () => { on[i] = !on[i]; render(); });
      wrap.appendChild(b);
      return b;
    });
    // 점수 고리
    const C = 2 * Math.PI * 62;
    el('circle', { cx: 90, cy: 90, r: 62, fill: 'none', stroke: 'var(--surface-2)', 'stroke-width': 18 }, svg);
    const arc = el('circle', { cx: 90, cy: 90, r: 62, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 18, 'stroke-linecap': 'round', transform: 'rotate(-90 90 90)', 'stroke-dasharray': `0 ${C}`, style: 'transition:stroke-dasharray .3s' }, svg);
    const val = el('text', { x: 90, y: 102, 'text-anchor': 'middle', class: 'ring-v' }, svg);
    el('text', { x: 178, y: 78, class: 'p-lab', style: 'font-size:16px' }, svg).textContent = '점검 점수';
    const sub = el('text', { x: 178, y: 104, class: 'p-tick', style: 'font-size:14px' }, svg);
    el('text', { x: 178, y: 126, class: 'p-tick', style: 'font-size:13px' }, svg).textContent = '항목당 10점';
    function render() {
      btns.forEach((b, i) => b.setAttribute('aria-pressed', on[i]));
      const k = on.filter(Boolean).length, s = k * 10;
      arc.setAttribute('stroke-dasharray', `${C * s / 100} ${C}`);
      arc.setAttribute('stroke-linecap', s ? 'round' : 'butt');
      arc.setAttribute('stroke', s >= 90 ? 'var(--ok)' : s >= 60 ? 'var(--accent)' : 'var(--accent-2)');
      val.textContent = s;
      sub.textContent = k + ' / 10 항목';
      const miss = I.filter((_, i) => !on[i]).map(([t]) => t);
      const st = $('ck-st');
      if (s === 100) { st.className = 'status ok'; st.innerHTML = '<b class="k">제출 준비 완료</b>마지막으로 맞춤법과 숫자를 한 번 더 확인하고, LMS 공지의 형식대로 제출합니다.'; }
      else if (s >= 70) { st.className = 'status mid'; st.innerHTML = `<b class="k">거의 다 왔습니다</b>남은 항목: ${miss.slice(0, 2).join(' / ')}${miss.length > 2 ? ' …' : ''}`; }
      else if (s > 0) { st.className = 'status bad'; st.innerHTML = `<b class="k">보완이 필요합니다</b>먼저 채울 것: ${miss.slice(0, 2).join(' / ')}`; }
      else { st.className = 'status bad'; st.innerHTML = '<b class="k">0점</b>약한 버전은 열 가지 중 어느 것도 통과하지 못합니다. 직접 해 보기 3의 문제 여덟 곳을 떠올려 보세요.'; }
    }
    $('ck-a').addEventListener('click', () => { on.fill(true); render(); });
    $('ck-w').addEventListener('click', () => { on.fill(false); render(); $('ck-st').innerHTML = '<b class="k">약한 버전: 0점</b>제목·근거·흐름·시연·효과·위험·내역·출처 모두 빠져 있습니다. 직접 해 보기 3의 여덟 곳이 그대로 감점입니다.'; });
    $('ck-0').addEventListener('click', () => { on.fill(false); render(); $('ck-st').innerHTML = '<b class="k">내 개선안 점검</b>내 초안에 있는 항목만 눌러 표시해 보세요.'; });
    render();
    $('ck-st').innerHTML = '<b class="k">점검 전</b>항목을 눌러 내 개선안에 있는 것을 표시하거나, 예시를 불러와 비교해 보세요.';
  })();
})();
