// 14주 3차시 전용: 과장 찾기 카드, 상관≠인과(습도 구간), 과적합(나무 깊이), 최종 점검표
// 숫자는 14-1 예시 프로젝트와 같은 데이터(process_raw.csv 정리 후 494행)·같은 분할(8:2, random_state=42)로 계산한 값
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

  /* ───────── 1) 과장 찾기 ───────── */
  (function overclaim() {
    const wrap = $('oc-cards'); if (!wrap) return;
    const items = [
      { k: 'over', n: '야간 근무자 때문에 불량이 많다.', a: '야간은 습도도 높았다(61.9% vs 54.1%). 관찰 데이터로 원인을 단정할 수 없다.', f: '야간 불량률(20.3%)이 주간(7.0%)보다 높았고, 야간은 습도도 높았다.' },
      { k: 'over', n: '압력을 120 bar로 올리면 강도가 53.8 MPa가 된다.', a: '관찰 범위(62~97.5 bar) 밖 예측이고, 관계를 인과로 썼다.', f: '관찰 범위 안에서 압력이 높을수록 강도가 높았다.' },
      { k: 'over', n: '나무 모델의 R²가 0.999로 거의 완벽하다.', a: '훈련 데이터 점수다. 같은 모델의 시험 R²는 0.48 — 과적합.', f: '나무 모델(깊이 15)의 시험 R²는 0.48로, 선형 모델(0.83)보다 낮았다.' },
      { k: 'fine', n: '시험 데이터(99개)에서 평균 절대 오차 1.05 MPa로 강도를 예측했다.', a: '시험 점수, 개수, 단위가 모두 있다. 기준(2.58 MPa)도 함께 쓰면 더 좋다.' },
      { k: 'over', n: '온도는 강도와 관계가 없다(r = -0.11).', a: '상관계수는 직선 관계만 잰다. 210℃ 부근이 꼭대기인 곡선이었다.', f: '온도와 강도는 직선 관계는 약했으나(r = -0.11), 210℃ 부근에서 강도가 가장 높은 곡선 관계를 보였다.' },
      { k: 'over', n: '이 결과는 모든 사출 성형 공장에 적용된다.', a: '한 공장, 평일 30일의 (가상) 데이터로만 확인했다.', f: '이 결과는 한 공장의 30일 기록에서 얻은 것으로, 다른 조건에서는 다시 확인이 필요하다.' },
      { k: 'over', n: '6호기 불량률이 15.5%로 가장 높으므로 6호기가 불량의 원인이다.', a: '호기별 불량률은 11.1~15.5%, 호기당 75~90개·불량 9~13개로 차이가 작고 개수도 적다.', f: '호기별 불량률은 11.1~15.5%로 큰 차이가 없었다.' },
      { k: 'fine', n: '압력과 강도는 강한 양의 상관(r = 0.69)을 보였다. 인과 관계는 실험으로 확인이 필요하다.', a: '관계의 크기와 한계를 함께 썼다.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="nm">${it.n}</span><span class="verdict">${it.k === 'over' ? '과장' : '적절'}</span><span class="ans">${it.a}</span>${it.f ? `<span class="fix"><b style="color:var(--ok)">고친 문장</b> ${it.f}</span>` : ''}`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('oc-score').textContent = opened + ' / ' + items.length + ' 확인' + (opened === items.length ? ' — 과장 6 · 적절 2. 과장의 공통점: 숫자보다 말이 앞섰다' : '');
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 2) 상관 ≠ 인과: 습도 구간으로 나눠 보기 ───────── */
  (function confound() {
    const box = $('cf-bars'); if (!box) return;
    const ALL = [['전체', 0.070, 243, 0.203, 251]];
    const BY = [['습도 50% 이하', 0.049, 82, 0.136, 22], ['50~60%', 0.050, 101, 0.143, 91], ['60~70%', 0.125, 48, 0.152, 92], ['70% 초과', 0.167, 12, 0.457, 46]];
    const MAX = 0.5;
    function bar(v, n, c) { return `<div class="bar1"><i style="width:${v / MAX * 78}%;background:${c}"></i><span><b>${(v * 100).toFixed(1)}%</b> <span class="muted">(${n})</span></span></div>`; }
    function render(by) {
      const rows = by ? BY : ALL;
      box.classList.toggle('big', !by);
      box.innerHTML = rows.map(([lb, d, dn, n, nn]) => `<div class="gl">${lb}</div><div class="pair">${bar(d, dn, 'var(--accent)')}${bar(n, nn, 'var(--accent-2)')}</div>`).join('');
      $('cf-all').setAttribute('aria-pressed', !by); $('cf-hum').setAttribute('aria-pressed', by);
      const st = $('cf-st');
      st.className = 'status ' + (by ? 'mid' : 'bad');
      st.innerHTML = by
        ? '<b class="k">두 가지가 함께 보인다</b>① 습도가 높을수록 <strong>두 근무조 모두</strong> 불량률이 높다 → 습한 날이 많은 야간이 불리. ② 그래도 같은 습도에서 야간이 높다 → 습도만으로도 설명이 안 된다. 쓸 수 있는 말은 <strong>“관련이 있었다”</strong>까지. 70% 초과 주간은 12개뿐이라 흔들림도 크다.'
        : '<b class="k">이것만 보면…</b>야간 불량률이 약 3배. 하지만 야간은 습한 날이 두 배 넘게 많다. <strong>습도 구간별</strong>로 나눠 보세요.';
    }
    $('cf-all').addEventListener('click', () => render(false));
    $('cf-hum').addEventListener('click', () => render(true));
    render(false);
  })();

  /* ───────── 3) 과적합: 의사결정나무 깊이 ───────── */
  (function overfit() {
    const svg = $('of-plot'); if (!svg) return;
    // [깊이, 학습 R², 시험 R²] — DecisionTreeRegressor(max_depth=d, random_state=42), 입력 조건 5개
    const TR = [[1, 0.33, 0.303], [2, 0.484, 0.483], [3, 0.606, 0.59], [4, 0.686, 0.507], [5, 0.773, 0.474], [6, 0.833, 0.527], [7, 0.88, 0.572], [8, 0.917, 0.473], [9, 0.945, 0.548], [10, 0.965, 0.445], [11, 0.979, 0.461], [12, 0.989, 0.511], [13, 0.995, 0.525], [14, 0.998, 0.502], [15, 0.999, 0.479]];
    const LIN = 0.831;    // 14-1 모델 2(선형 회귀 + 온도²)의 시험 R²
    const L = 72, R = 610, T = 20, B = 350;
    const sx = (d) => L + (d - 1) / 14 * (R - L), sy = (v) => B - v * (B - T);
    for (let v = 0; v <= 1.0001; v += 0.2) {
      el('line', { x1: L, x2: R, y1: sy(v), y2: sy(v), class: 'p-grid' }, svg);
      el('text', { x: L - 8, y: sy(v) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = v.toFixed(1);
    }
    for (let d = 1; d <= 15; d += 2) el('text', { x: sx(d), y: B + 20, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = d;
    el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis' }, svg);
    el('line', { x1: L, x2: L, y1: T, y2: B, class: 'p-axis' }, svg);
    el('text', { x: (L + R) / 2, y: B + 46, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = '나무의 최대 깊이 (복잡할수록 →)';
    el('text', { x: 16, y: (T + B) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 16 ${(T + B) / 2})` }, svg).textContent = 'R² (1에 가까울수록 잘 맞음)';
    el('line', { x1: L, x2: R, y1: sy(LIN), y2: sy(LIN), class: 'p-line2' }, svg);
    el('text', { x: R - 4, y: sy(LIN) + 18, 'text-anchor': 'end', class: 'p-tick', style: 'font-weight:700' }, svg).textContent = '14-1 선형 모델 2의 시험 R² 0.83';
    const gap = el('path', { fill: 'var(--bad)', 'fill-opacity': 0.1 }, svg);
    const ptr = el('polyline', { fill: 'none', stroke: 'var(--accent)', 'stroke-width': 3, 'stroke-linejoin': 'round' }, svg);
    const pte = el('polyline', { fill: 'none', stroke: 'var(--accent-2)', 'stroke-width': 3, 'stroke-linejoin': 'round' }, svg);
    const now = el('line', { y1: T, y2: B, stroke: 'var(--muted)', 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }, svg);
    const dtr = el('circle', { r: 7, class: 'f-acc', stroke: 'var(--surface)', 'stroke-width': 2 }, svg);
    const dte = el('circle', { r: 7, class: 'f-acc2', stroke: 'var(--surface)', 'stroke-width': 2 }, svg);
    const ltr = el('text', { class: 'p-tick', style: 'font-weight:800;fill:var(--accent)' }, svg);
    const lte = el('text', { class: 'p-tick', style: 'font-weight:800;fill:var(--accent-2)' }, svg);
    const s = $('of-d');
    function upd() {
      const d = +s.value, part = TR.slice(0, d);
      ptr.setAttribute('points', part.map((r) => sx(r[0]) + ',' + sy(r[1])).join(' '));
      pte.setAttribute('points', part.map((r) => sx(r[0]) + ',' + sy(r[2])).join(' '));
      gap.setAttribute('d', 'M' + part.map((r) => sx(r[0]) + ',' + sy(r[1])).join(' L') + ' L' + part.slice().reverse().map((r) => sx(r[0]) + ',' + sy(r[2])).join(' L') + ' Z');
      const [, a, b] = TR[d - 1];
      now.setAttribute('x1', sx(d)); now.setAttribute('x2', sx(d));
      dtr.setAttribute('cx', sx(d)); dtr.setAttribute('cy', sy(a)); dte.setAttribute('cx', sx(d)); dte.setAttribute('cy', sy(b));
      const right = d > 11;
      [[ltr, a, '훈련'], [lte, b, '시험']].forEach(([t, v, n]) => { t.setAttribute('x', sx(d) + (right ? -12 : 12)); t.setAttribute('text-anchor', right ? 'end' : 'start'); t.setAttribute('y', sy(v) + (n === '훈련' ? -10 : 20)); t.textContent = n + ' ' + v.toFixed(3); });
      $('of-d-o').textContent = d; $('of-tr').textContent = a.toFixed(3); $('of-te').textContent = b.toFixed(3);
      const st = $('of-st'), g = a - b;
      if (g > 0.15) { st.className = 'status bad'; st.innerHTML = `<b class="k">과적합</b>훈련 ${a.toFixed(3)} vs 시험 ${b.toFixed(3)} — 차이 ${g.toFixed(2)}. 훈련 데이터를 <strong>외웠다</strong>. 훈련 점수를 보고하면 과장.`; }
      else if (b < 0.55) { st.className = 'status mid'; st.innerHTML = `<b class="k">너무 단순</b>훈련·시험 모두 ${b.toFixed(2)} 안팎. 아직 관계를 덜 배웠다.`; }
      else { st.className = 'status ok'; st.innerHTML = `<b class="k">훈련 ≈ 시험</b>차이 ${g.toFixed(2)}로 작다. 그래도 선형 모델 2(0.83)보다 낮아, 보고서에는 <strong>모델 비교 표</strong>로.`; }
    }
    s.addEventListener('input', upd);
    upd();
  })();

  /* ───────── 4) 최종 점검표 ───────── */
  (function checklist() {
    const wrap = $('ck-groups'); if (!wrap) return;
    const G = [
      { h: '결과 해석', ic: 'target', items: [
        { t: '결과가 분석 질문에 직접 답한다', w: 2, f: '결론 첫 문장을 “질문 → 한 문장 답 + 숫자”로' },
        { t: '관계를 인과로 쓰지 않았다', w: 2, f: '“때문에”, “하면 된다”를 찾아 “관련이 있었다”로' },
        { t: '성능은 시험 점수 + 기준과 함께', w: 2, f: '훈련 점수 대신 시험 MAE·R²와 평균 찍기 기준을 표로' },
        { t: '관찰 범위 밖 예측·일반화 없음', w: 1, f: '입력 범위를 적고 “이 데이터 범위 안에서”를 붙이기' } ] },
      { h: '데이터·윤리', ic: 'shield', items: [
        { t: '결측·이상값 처리를 개수와 함께 적었다', w: 1, f: '데이터 절에 “무엇을 몇 개 어떻게” 한 줄씩' },
        { t: '그룹별 개수·치우침을 확인했다', w: 1, f: '평균·비율 옆에 n, 수집 기간·조건을 한계에' },
        { t: '개인정보(이름·학번·사번·얼굴) 없음', w: 2, f: '열 삭제 또는 가명처리, 출력 결과까지 확인' },
        { t: '데이터 출처·이용 조건을 적었다', w: 1, f: '참고문헌에 기관·데이터명·주소·접근일' } ] },
      { h: 'AI 활용', ic: 'sparkles', items: [
        { t: 'AI가 만든 코드를 실행·출력으로 확인', w: 2, f: '행 수·범위를 확인하고 일부를 직접 계산해 대조' },
        { t: 'AI가 쓴 문장의 숫자를 출력과 대조', w: 1, f: '보고서의 숫자를 하나씩 출력 셀과 맞춰 보기' },
        { t: 'AI 활용 내역 표를 채웠다', w: 2, f: '도구·단계·요청·내가 확인한 것, 안 썼으면 “사용하지 않음”' } ] },
      { h: '재현성·형식', ic: 'reset', items: [
        { t: '다시 시작 → 모두 실행, 오류 없음', w: 2, f: '런타임 → 다시 시작 및 모두 실행' },
        { t: '데이터 주소가 Colab에서 열린다, random_state 고정', w: 1, f: '로컬 경로 대신 공개 주소·드라이브, 분할에 random_state' },
        { t: '그림·표 번호와 캡션', w: 1, f: '그림 캡션은 아래, 표 제목은 위, 본문에서 번호로' } ] },
    ];
    const all = [];
    G.forEach((g) => {
      const d = document.createElement('div'); d.className = 'cg';
      d.innerHTML = `<h4><svg class="ic"><use href="#i-${g.ic}"/></svg>${g.h}</h4><div class="items"></div>`;
      const box = d.querySelector('.items');
      g.items.forEach((it) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'tgl'; b.setAttribute('aria-pressed', 'false');
        b.innerHTML = `<span class="chk"></span><span>${it.t}</span>${it.w === 2 ? '<span class="star" title="필수">★</span>' : ''}`;
        b.addEventListener('click', () => { it.on = toggle(b); upd(); });
        box.appendChild(b); all.push(it);
      });
      wrap.appendChild(d);
    });
    const TOT = all.reduce((a, it) => a + it.w, 0);
    function upd() {
      const got = all.filter((it) => it.on).reduce((a, it) => a + it.w, 0);
      const pct = Math.round(got / TOT * 100);
      const miss = all.filter((it) => !it.on).sort((a, b) => b.w - a.w);
      const starMiss = miss.filter((it) => it.w === 2).length;
      $('ck-pct').textContent = pct + '%'; $('ck-bar').style.width = pct + '%';
      $('ck-pct').classList.toggle('o', pct < 100);
      $('ck-bar').style.background = pct === 100 ? 'var(--ok)' : pct >= 60 ? 'var(--accent)' : 'var(--accent-2)';
      const st = $('ck-st');
      if (!miss.length) { st.className = 'status ok'; st.innerHTML = '<b class="k">제출 준비 완료</b>마지막으로 한 번 더 <strong>모두 실행</strong>한 뒤, LMS 공지대로 제출하세요.'; }
      else if (starMiss) { st.className = 'status bad'; st.innerHTML = `<b class="k">아직 제출 전</b>★ 필수 항목 <strong>${starMiss}개</strong>가 남았습니다. 필수부터 고치세요.`; }
      else { st.className = 'status mid'; st.innerHTML = `<b class="k">거의 다 왔다</b>필수는 모두 통과. 나머지 <strong>${miss.length}개</strong>로 완성도를 높이세요.`; }
      $('ck-fix').innerHTML = miss.slice(0, 3).map((it) => `<div>${it.w === 2 ? '<b>★</b> ' : ''}${it.f}</div>`).join('') + (miss.length > 3 ? `<div class="muted" style="border-left-color:var(--line)">… 그 밖에 ${miss.length - 3}개</div>` : '');
    }
    upd();
  })();
})();
