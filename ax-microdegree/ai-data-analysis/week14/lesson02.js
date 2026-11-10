// 14주 2차시 전용: 보고서 뼈대, 결과/해석 카드, 문단 고치기, 좋은 그림, 캡션 검사기
// 숫자는 14-1 예시 프로젝트(process_raw.csv 정리 후 494행, 8:2 분할 random_state=42)에서 계산한 값
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);

  /* ───────── 1) 보고서 뼈대 ───────── */
  (function sections() {
    const wrap = $('sec-list'); if (!wrap) return;
    const S = [
      { n: '제목', ic: 'log', len: 1, l: '한 줄', d: '무엇을, 어떤 데이터로 했는지. 결론을 부풀리지 않는 짧은 명사형.', ex: '사출 성형 공정 조건에 따른 인장강도 예측', tip: '✗ “AI로 불량 문제를 해결하다” — 해결하지 않았다면 쓰지 않는다' },
      { n: '요약', ic: 'book', len: 3, l: '4~5문장', d: '질문·데이터·방법·핵심 결과(숫자)·한계를 한 문단에. 맨 마지막에 쓴다.', ex: '… 시험 데이터에서 평균 절대 오차 1.05 MPa(R² 0.83)로 강도를 예측하였다 …', tip: '다음 장에서 자세히' },
      { n: '배경·질문', ic: 'target', len: 4, l: '반 쪽', d: '왜 중요한가(전공 맥락) → 데이터로 답할 수 있는 질문, 결과 변수와 입력 변수.', ex: '어떤 공정 조건이 인장강도를 좌우하고, 조건만으로 강도를 예측할 수 있는가?', tip: '9주 3차시에 제출한 보고서 주제를 다듬어 쓴다' },
      { n: '데이터', ic: 'database', len: 5, l: '반 쪽', d: '출처, 기간·규모, 변수와 단위, 전처리(무엇을 몇 개 어떻게).', ex: '중복 5행 제거, 온도 오류값 8개 결측 처리, 결측 36개 중앙값 → 494행', tip: '가상 데이터·공개 데이터·연구실 데이터인지 밝힌다' },
      { n: '방법', ic: 'code', len: 4, l: '반 쪽', d: '분석 방법, 훈련/시험 분할 비율과 random_state, 평가 지표, 사용 도구.', ex: '훈련 80%·시험 20% (random_state=42), 시험 MAE·R², 기준: 평균으로 찍기', tip: '다른 사람이 같은 숫자를 다시 낼 수 있을 만큼' },
      { n: '결과', ic: 'chart', len: 8, l: '1~2쪽', d: '관찰한 사실과 숫자만. 그림·표마다 번호와 캡션, 본문에서 번호로 부른다.', ex: '모델 2의 시험 MAE는 1.05 MPa로 기준(2.58 MPa)보다 작았다(표 1).', tip: '해석·인과 표현은 다음 절로 보낸다' },
      { n: '해석', ic: 'bulb', len: 5, l: '반 쪽~1쪽', d: '결과가 질문에 어떤 답을 주는지, 전공 지식으로 왜 그럴 수 있는지. 근거만큼만.', ex: '관찰 범위 안에서는 압력이 강도를 좌우하는 주요 조건으로 보인다.', tip: '상관 ≠ 인과 (7주 3차시)' },
      { n: '한계', ic: 'alert', len: 3, l: '3~5줄', d: '데이터(기간·규모·편향·결측), 방법(분할에 따른 변화, 범위 밖), 인과 여부.', ex: '분할을 바꾸면 시험 R²가 0.79~0.87로 달라졌다.', tip: '숨기지 않는다 — 결과를 어디까지 믿을지 알려 주는 정보' },
      { n: '결론', ic: 'check', len: 2, l: '2~3문장', d: '질문에 대한 답 + 다음에 해 볼 일.', ex: '공정 조건으로 강도를 평균 1 MPa 남짓 오차로 예측할 수 있었다. 압력의 효과는 실험으로 확인할 필요가 있다.', tip: '요약을 그대로 반복하지 않는다' },
      { n: '참고문헌', ic: 'link', len: 2, l: '필요한 만큼', d: '데이터 출처, 참고한 문헌·웹 문서. 같은 형식으로 통일.', ex: '기관(연도). 「데이터명」. 주소 (접근일).', tip: '본문에서 인용한 것만 싣는다' },
      { n: 'AI 활용 내역', ic: 'sparkles', len: 3, l: '표 하나', d: '생성형AI를 쓴 단계, 도구, 요청 내용, 내가 확인·수정한 것.', ex: '정리 | 결측 처리 코드 | 오류 순서 수정, 행 수 대조', tip: '안 썼으면 “사용하지 않음”이라고 쓴다', ai: true },
    ];
    let seen = 0;
    const btns = S.map((s, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'sec-b' + (s.ai ? ' ai' : ''); b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="no">${i + 1}</span>${s.n}<span class="ln" style="width:${s.len * 28}px"></span>`;
      b.addEventListener('click', () => {
        if (!b.classList.contains('seen')) { b.classList.add('seen'); seen++; }
        btns.forEach((x) => x.setAttribute('aria-pressed', x === b));
        $('sc-ic').innerHTML = `<svg class="ic"><use href="#i-${s.ic}"/></svg>`;
        $('sc-ic').className = 'ic-badge' + (s.ai ? ' o' : '');
        $('sc-h').textContent = (i + 1) + '. ' + s.n;
        $('sc-len').textContent = '분량: ' + s.l;
        $('sc-d').textContent = s.d;
        $('sc-ex').hidden = false; $('sc-ex').innerHTML = '<b style="color:var(--accent)">14-1 예시</b> ' + s.ex;
        $('sc-tip').textContent = s.tip;
        $('sc-cnt').textContent = seen + ' / ' + S.length + ' 확인';
      });
      wrap.appendChild(b); return b;
    });
  })();

  /* ───────── 2) 결과? 해석? 과장? ───────── */
  (function sortCards() {
    const wrap = $('ri-cards'); if (!wrap) return;
    const V = { res: '결과 (사실)', int: '해석 (의미)', over: '과장 (근거 이상)' };
    const items = [
      { k: 'res', n: '시험 데이터에서 모델 2의 평균 절대 오차는 1.05 MPa였다.', a: '측정·계산한 숫자 그대로 — 결과 절.' },
      { k: 'int', n: '관찰 범위 안에서는 압력이 강도를 좌우하는 주요 조건으로 보인다.', a: '결과의 의미를 조건과 함께, “보인다”로 — 해석 절.' },
      { k: 'over', n: '압력을 높이면 강도가 반드시 오른다.', a: '관찰 데이터로 인과를 단정. “반드시”도 근거 이상.' },
      { k: 'res', n: '야간 불량률은 20.3%, 주간은 7.0%였다.', a: '집계한 사실 — 결과 절.' },
      { k: 'int', n: '야간에는 습도가 높아(61.9%) 불량이 늘었을 가능성이 있다.', a: '근거(습도 차이)를 대고 가능성으로 — 해석 절.' },
      { k: 'over', n: '이 모델은 어떤 공장에서도 강도를 정확히 예측한다.', a: '한 공장 30일 데이터로 일반화. 평가도 이 데이터 안에서만 했다.' },
      { k: 'res', n: '온도 210℃ 부근 구간의 평균 강도가 가장 높았다(그림 3).', a: '구간 평균을 비교한 사실 — 결과 절.' },
      { k: 'over', n: '온도는 상관계수가 -0.11이므로 강도와 관계가 없다.', a: '상관계수는 직선 관계만 잰다. 실제로는 곡선 관계였다.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="nm">${it.n}</span><span class="verdict">${V[it.k]}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('ri-score').textContent = opened + ' / ' + items.length + ' 확인' + (opened === items.length ? ' — 결과 3 · 해석 2 · 과장 3' : '');
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 3) 문단 고치기 ───────── */
  (function fixPara() {
    const box = $('fx-para'); if (!box) return;
    const P = {
      res: {
        before: '<mark>모델의 정확도가 매우 높게 나왔다<sup>①</sup></mark>. <mark>압력이 강도의 가장 중요한 원인이며 압력을 높이면 품질이 좋아진다<sup>②</sup></mark>. <mark>그래프를 보면<sup>③</sup></mark> 온도도 <mark>영향이 있는 것 같다<sup>④</sup></mark>.',
        after: '모델 2는 시험 데이터(99개)에서 <mark class="good">평균 절대 오차 1.05 MPa, R² 0.83<sup>①</sup></mark>으로 강도를 예측하였으며, 평균으로 찍기의 오차는 2.58 MPa였다<mark class="good">(표 1)<sup>③</sup></mark>. <mark class="good">압력이 1 표준편차(약 6 bar) 높을 때 예측 강도는 2.08 MPa 높았다<sup>②</sup></mark>. 온도는 <mark class="good">210℃ 부근 구간의 평균 강도가 가장 높았다<sup>④</sup></mark><mark class="good">(그림 3)<sup>③</sup></mark>.',
        issues: ['<b>숫자가 없다</b> — “매우 높게”가 얼마인지. 회귀는 정확도가 아니라 MAE·R²', '<b>해석·인과가 섞였다</b> — 결과 절에는 관찰한 크기만', '<b>그림·표 번호가 없다</b> — “그래프”가 어느 것인지', '<b>모호한 표현</b> — 무엇이 어떻게 달랐는지 구체적으로'],
      },
      int: {
        before: '<mark>AI 분석 결과<sup>①</sup></mark> <mark>압력을 120 bar까지 올리면 강도가 50 MPa 이상이 될 것이다<sup>②</sup></mark>. 또 <mark>야간 근무자의 숙련도가 낮아 불량이 많다<sup>③</sup></mark>.',
        after: '<mark class="good">관찰 범위(62~97.5 bar) 안에서는<sup>②</sup></mark> 압력이 높을수록 강도가 높아, 압력이 강도를 좌우하는 주요 조건으로 <mark class="good">보인다<sup>①</sup></mark>. 다만 관찰 데이터의 관계이므로 압력을 바꿨을 때의 효과는 실험으로 확인해야 한다. 야간 불량률(20.3%)이 주간(7.0%)보다 높았으나 <mark class="good">야간은 습도도 높아(61.9% vs 54.1%) 근무조 자체의 영향인지는 이 데이터로 구분할 수 없다<sup>③</sup></mark>.',
        issues: ['<b>“AI 분석 결과”</b> — 판단의 주체는 나. AI는 도구일 뿐', '<b>관찰 범위 밖 예측</b> — 120 bar는 데이터에 없다 (외삽)', '<b>근거 없는 원인</b> — 숙련도는 측정하지 않았다. 습도라는 교란 변수도 있다'],
      },
      lim: {
        before: '<mark>이 분석에는 특별한 한계가 없다<sup>①</sup></mark>. <mark>데이터가 충분히 많아서<sup>②</sup></mark> <mark>결과를 믿을 수 있다<sup>③</sup></mark>.',
        after: '<mark class="good">첫째, 30일(평일) 동안 한 공장에서 기록한 가상 데이터로, 계절·원료 변화는 반영되지 않았다<sup>①</sup></mark>. <mark class="good">둘째, 결측 36개(약 7%)를 중앙값으로 채워 그 행들의 변동이 작게 반영되었다<sup>②</sup></mark>. <mark class="good">셋째, 훈련/시험 분할을 바꾸면 시험 R²가 0.79~0.87로 달라졌다<sup>③</sup></mark>.',
        issues: ['<b>한계가 없는 분석은 없다</b> — 기간·범위부터 적는다', '<b>“충분히 많다”의 근거가 없다</b> — 몇 개, 어떻게 처리했는지', '<b>믿을 수 있는 정도</b>를 숫자로 — 점수의 흔들림'],
      },
    };
    let k = 'res', after = false;
    function render() {
      const p = P[k];
      box.innerHTML = after ? p.after : p.before;
      $('fx-issues').innerHTML = p.issues.map((t, i) => `<div style="${after ? 'border-color:var(--ok);background:var(--ok-soft)' : ''}"><sup style="color:${after ? 'var(--ok)' : 'var(--bad)'}">${'①②③④'[i]}</sup> ${after ? '<b style="color:var(--ok)">고침</b> · ' : ''}${t}</div>`).join('');
      document.querySelectorAll('#fx-tabs button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.k === k));
      $('fx-before').setAttribute('aria-pressed', !after); $('fx-after').setAttribute('aria-pressed', after);
    }
    document.querySelectorAll('#fx-tabs button').forEach((b) => b.addEventListener('click', () => { k = b.dataset.k; after = false; render(); }));
    $('fx-before').addEventListener('click', () => { after = false; render(); });
    $('fx-after').addEventListener('click', () => { after = true; render(); });
    render();
  })();

  /* ───────── 공통: 압력 구간별 평균 강도 막대 ───────── */
  const BANDS = [['75 이하', 35.56, 99], ['75~80', 37.89, 123], ['80~85', 39.45, 164], ['85 초과', 41.76, 108]];
  function barChart(svg, opt) {
    svg.innerHTML = '';
    const W = 640, H = opt.h, L = 70, R = W - 20, T = 26, B = H - 52, Y1 = 45;
    const y = (v) => B - v / Y1 * (B - T);
    for (let v = 0; v <= 40; v += 10) {
      el('line', { x1: L, x2: R, y1: y(v), y2: y(v), class: 'p-grid' }, svg);
      if (opt.axes) el('text', { x: L - 8, y: y(v) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = v;
    }
    el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis' }, svg);
    const w = (R - L) / BANDS.length;
    BANDS.forEach(([lb, v, n], i) => {
      const x = L + i * w + w * 0.2;
      el('rect', { x, y: y(v), width: w * 0.6, height: B - y(v), rx: 5, class: 'f-acc', opacity: 0.45 + i * 0.18 }, svg);
      el('text', { x: x + w * 0.3, y: y(v) - 8, 'text-anchor': 'middle', class: 'p-tick', style: 'font-weight:800;fill:var(--text)' }, svg).textContent = opt.n ? 'n=' + n : v.toFixed(1);
      el('text', { x: x + w * 0.3, y: B + 18, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = lb;
    });
    if (opt.axes) {
      el('text', { x: (L + R) / 2, y: B + 42, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = '성형 압력 구간 (bar)';
      el('text', { x: 16, y: (T + B) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 16 ${(T + B) / 2})` }, svg).textContent = '평균 인장강도 (MPa)';
    }
    return { L, R, T, B, y };
  }

  /* ───────── 4) 좋은 그림 (주석) ───────── */
  (function goodFig() {
    const svg = $('good-fig'); if (!svg) return;
    const g = barChart(svg, { h: 330, axes: true, n: true });
    const mark = (n, x, yy) => { el('circle', { cx: x, cy: yy, r: 13, class: 'f-acc2' }, svg); el('text', { x, y: yy + 5, 'text-anchor': 'middle', style: 'font-size:15px;font-weight:800;fill:#fff' }, svg).textContent = n; };
    mark(2, g.L + 70, g.B + 37);
    mark(2, 34, g.T + 40);
    mark(3, g.L + 14, g.B - 8);
    mark(4, g.R - 30, g.T + 4);
    mark(5, g.L + 30, g.T + 4);
    el('text', { x: g.L + 50, y: g.T + 9, class: 'p-tick', style: 'font-weight:700;fill:var(--accent-2)' }, svg).textContent = '압력이 높은 구간일수록 평균 강도가 높다';
  })();

  /* ───────── 5) 캡션 검사기 ───────── */
  (function capCheck() {
    const svg = $('cap-fig'); if (!svg) return;
    barChart(svg, { h: 300, axes: true, n: true });
    const C = ['그림 번호', '무엇과 무엇 (변수)', '단위', '데이터·개수 (n)', '해석·과장 없이 사실만'];
    const cands = [
      { t: '그래프', r: [0, 0, 0, 0, 1] },
      { t: '그림 1. 압력과 강도', r: [1, 1, 0, 0, 1] },
      { t: '그림 1. 압력을 높이면 강도가 좋아진다는 것을 증명하는 그래프 (n=494, MPa)', r: [1, 1, 1, 1, 0] },
      { t: '그림 1. 성형 압력 구간별 평균 인장강도(MPa). 막대 위 숫자는 구간별 제품 수 (process_raw.csv 정리 후, n=494).', r: [1, 1, 1, 1, 1] },
    ];
    const ck = $('cap-ck');
    const hints = ['“그림 1.”처럼 번호로 시작', '이 그림의 변수: 압력과 강도', 'MPa, bar 같은 단위', '어떤 데이터, 몇 개인지', '“증명”, “반드시”, “때문” 같은 해석은 본문으로'];
    function show(text, r, src) {
      $('cap-show').innerHTML = text ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;') : '<span class="muted">← 오른쪽에서 캡션을 고르거나 직접 써 보세요</span>';
      ck.innerHTML = C.map((c, i) => `<div><span class="m ${r ? (r[i] ? 'y' : 'n') : ''}">${r ? (r[i] ? '✓' : '✗') : ''}</span><span>${c}${r && !r[i] ? ` <span class="muted" style="font-size:13.5px">— ${hints[i]}</span>` : ''}</span></div>`).join('');
      const s = r ? r.reduce((a, b) => a + b, 0) : null;
      $('cap-score').textContent = s === null ? '- / 5' : s + ' / 5' + (s === 5 ? ' 통과' : '');
      $('cap-score').classList.toggle('o', s !== null && s < 5);
      document.querySelectorAll('.cand').forEach((b) => b.setAttribute('aria-pressed', b.dataset.i === String(src)));
    }
    cands.forEach((c, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'cand'; b.dataset.i = i; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<b>${'ABCD'[i]}</b>${c.t.length > 46 ? c.t.slice(0, 44) + '…' : c.t}`;
      b.addEventListener('click', () => { $('cap-input').value = ''; show(c.t, c.r, i); });
      $('cap-cands').appendChild(b);
    });
    // 직접 쓴 캡션: 낱말로만 확인하는 간이 검사
    function auto(t) {
      return [
        /^\s*(그림|Figure|Fig\.?)\s*\d+/i.test(t),
        /압력/.test(t) && /강도/.test(t) && t.replace(/^\s*(그림|Figure|Fig\.?)\s*\d+\.?/i, '').trim().length >= 8,
        /(MPa|bar|℃|°C|%|mm|rpm)/i.test(t),
        /(n\s*=\s*\d+|\d+\s*개|\.csv|데이터)/i.test(t),
        !/(증명|반드시|확실|무조건|때문|좋아진다|해야 한다)/.test(t),
      ].map(Number);
    }
    $('cap-input').addEventListener('input', (e) => { const t = e.target.value; t.trim() ? show(t, auto(t), -1) : show('', null, -1); });
    show('', null, -1);
  })();
})();
