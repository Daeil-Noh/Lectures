// 5주 1차시 전용: DataFrame 해부도, 메서드 탐색(축소 표), 자료형 맞히기 카드
// 표에 나오는 값과 결과는 모두 ai-data-analysis/data/process.csv 에서 pandas로 계산한 실제 값이다.
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const press = (group, btn) => group.forEach((b) => b.setAttribute('aria-pressed', b === btn));

  /* ───────── 1) DataFrame 해부도 ───────── */
  (function anatomy() {
    const tab = $('ana'); if (!tab) return;
    const cols = ['product_id', 'shift', 'temp', 'pressure', 'defect_type'];
    const rows = [
      ['P00001', '주간', 211.7, 68.6, '정상'],
      ['P00002', '주간', 208.4, 84.3, '정상'],
      ['P00003', '주간', 210.2, 83.3, '정상'],
      ['P00004', '주간', 214.5, 90.9, '정상'],
      ['P00005', '주간', 219.5, 85.0, '정상'],
    ];
    let h = '<thead><tr><th class="idx" data-r="h" data-c="i"></th>' + cols.map((c, j) => `<th data-r="h" data-c="${j}">${c}</th>`).join('') + '</tr></thead><tbody>';
    rows.forEach((r, i) => {
      h += `<tr><td class="idx" data-r="${i}" data-c="i">${i}</td>` + r.map((v, j) => `<td data-r="${i}" data-c="${j}" class="${typeof v === 'number' ? 'num' : ''}">${typeof v === 'number' ? v.toFixed(1) : v}</td>`).join('') + '</tr>';
    });
    h += '<tr class="gap"><td colspan="6">⋮ 489행 더 (모두 494행) · 열은 13개 중 5개만 표시</td></tr></tbody>';
    tab.innerHTML = h;
    const cells = Array.from(tab.querySelectorAll('[data-r]'));
    const P = [
      { k: 'row', n: '행 (row)', code: 'df.loc[2]', sel: (r, c) => r === '2',
        out: "df.loc[2]          # 인덱스 2인 행 하나\nproduct_id    P00003\nshift             주간\ntemp             210.2\n…  (13개 항목)\nName: 2, dtype: object",
        msg: '<strong>행</strong> = 관측 하나. 이 데이터에서는 <strong>제품 한 개</strong>의 기록입니다.' },
      { k: 'col', n: '열 (column) = Series', code: "df['temp']", sel: (r, c) => c === '2',
        out: "df['temp']         # 열 하나 = Series\n0      211.7\n1      208.4\n       ...\n493    206.4\nName: temp, Length: 494, dtype: float64",
        msg: '<strong>열</strong> = 변수 하나. 열 하나만 꺼내면 <strong>Series</strong>라는 1차원 자료가 됩니다. 인덱스가 함께 따라옵니다.' },
      { k: 'idx', n: '인덱스 (index)', code: 'df.index', sel: (r, c) => c === 'i' && r !== 'h',
        out: "df.index\nRangeIndex(start=0, stop=494, step=1)",
        msg: '<strong>인덱스</strong> = 행에 붙은 이름표. 따로 정하지 않으면 <strong>0부터</strong> 붙습니다. 그래서 마지막 행은 493번.' },
      { k: 'hdr', n: '열 이름 (columns)', code: 'df.columns', sel: (r, c) => r === 'h' && c !== 'i',
        out: "df.columns\nIndex(['product_id', 'date', 'shift', 'line', 'machine', 'temp',\n       'pressure', 'speed', 'humidity', 'thickness', 'strength',\n       'defect', 'defect_type'],\n      dtype='object')",
        msg: '<strong>열 이름</strong>으로 열을 꺼냅니다. 철자·대소문자가 하나라도 다르면 <code>KeyError</code>.' },
      { k: 'val', n: '값 하나 (행, 열)', code: "df.loc[2, 'temp']", sel: (r, c) => r === '2' && c === '2', hl2: true,
        out: "print(df.loc[2, 'temp'])   # [행 인덱스, 열 이름]\n210.2",
        msg: '<strong>행 인덱스와 열 이름</strong>을 함께 주면 칸 하나. 3호기 일지의 “3월 2일 세 번째 제품 온도”를 찾는 것과 같습니다.' },
    ];
    const btns = P.map((p) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pbtn'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `${p.n}<b>${esc(p.code)}</b>`;
      b.addEventListener('click', () => {
        press(btns, b);
        cells.forEach((c) => {
          const on = p.sel(c.dataset.r, c.dataset.c);
          c.classList.toggle('hl', on && !p.hl2);
          c.classList.toggle('hl2', on && !!p.hl2);
          c.classList.toggle('dim', !on && c.dataset.c !== 'i' && c.dataset.r !== 'h');
        });
        $('ana-out').textContent = p.out;
        $('ana-msg').innerHTML = p.msg;
      });
      $('ana-btns').appendChild(b);
      return b;
    });
  })();

  /* ───────── 2) 메서드 탐색 ───────── */
  (function explorer() {
    const tab = $('mx'); if (!tab) return;
    const cols = ['product_id', 'shift', 'line', 'temp', 'pressure', 'thickness', 'defect', 'defect_type'];
    const dtype = ['object', 'object', 'object', 'float64', 'float64', 'float64', 'int64', 'object'];
    const num = [false, false, false, true, true, true, true, false];
    const rows = [
      [0, 'P00001', '주간', '1라인', 211.7, 68.6, 1.98, 0, '정상'],
      [1, 'P00002', '주간', '3라인', 208.4, 84.3, 1.994, 0, '정상'],
      [2, 'P00003', '주간', '2라인', 210.2, 83.3, 1.967, 0, '정상'],
      [3, 'P00004', '주간', '3라인', 214.5, 90.9, 1.914, 0, '정상'],
      [4, 'P00005', '주간', '1라인', 219.5, 85.0, 2.048, 0, '정상'],
      [5, 'P00006', '주간', '2라인', 216.1, 81.2, 2.101, 0, '정상'],
      null,
      [491, 'P00492', '야간', '2라인', 204.4, 77.5, 2.078, 0, '정상'],
      [492, 'P00493', '야간', '3라인', 209.9, 76.5, 2.007, 0, '정상'],
      [493, 'P00494', '야간', '2라인', 206.4, 84.3, 2.045, 0, '정상'],
    ];
    const fmt = (v, j) => (j === 3 || j === 4 ? v.toFixed(1) : j === 5 ? v.toFixed(3) : v);
    let h = '<thead><tr><th class="idx" data-r="h" data-c="i"></th>' + cols.map((c, j) => `<th data-r="h" data-c="${j}">${c}<span class="dt">${dtype[j]}</span></th>`).join('') + '</tr></thead><tbody>';
    rows.forEach((r, i) => {
      if (!r) { h += '<tr class="gap"><td colspan="9" data-r="gap" data-c="g">⋮ 485행 더 (인덱스 6 ~ 490) ⋮</td></tr>'; return; }
      h += `<tr><td class="idx" data-r="${r[0]}" data-c="i">${r[0]}</td>` + r.slice(1).map((v, j) => `<td data-r="${r[0]}" data-c="${j}" class="${num[j] ? 'num' : ''}">${fmt(v, j)}</td>`).join('') + '</tr>';
    });
    tab.innerHTML = h + '</tbody>';
    const cells = Array.from(tab.querySelectorAll('[data-r]'));
    const edR = $('mx-r'), edC = $('mx-c');

    const M = [
      { code: 'df.shape', sel: () => false, edge: true,
        out: '(494, 13)',
        msg: '<strong>(행, 열)</strong> 개수를 담은 튜플. 괄호가 없는 <strong>속성</strong>입니다. 표 크기부터 확인하는 습관!' },
      { code: 'df.head()', sel: (r) => +r <= 4 && r !== 'h',
        out: '  product_id shift line   temp  pressure  thickness  defect defect_type\n0     P00001    주간  1라인  211.7      68.6      1.980       0          정상\n1     P00002    주간  3라인  208.4      84.3      1.994       0          정상\n2     P00003    주간  2라인  210.2      83.3      1.967       0          정상\n3     P00004    주간  3라인  214.5      90.9      1.914       0          정상\n4     P00005    주간  1라인  219.5      85.0      2.048       0          정상',
        msg: '<strong>앞 5행</strong>(0~4번). 5번 행은 빠졌죠? 개수를 바꾸려면 <code>head(10)</code>.' },
      { code: 'df.tail(3)', sel: (r) => +r >= 491,
        out: '    product_id shift line   temp  pressure  thickness  defect defect_type\n491     P00492    야간  2라인  204.4      77.5      2.078       0          정상\n492     P00493    야간  3라인  209.9      76.5      2.007       0          정상\n493     P00494    야간  2라인  206.4      84.3      2.045       0          정상',
        msg: '<strong>뒤 3행</strong>. 인덱스가 493에서 끝나므로 행은 494개. 파일 끝이 잘리지 않았는지 확인할 때 씁니다.' },
      { code: 'df.columns', sel: (r, c) => r === 'h' && c !== 'i',
        out: "Index(['product_id', 'date', 'shift', 'line', 'machine', 'temp',\n       'pressure', 'speed', 'humidity', 'thickness', 'strength',\n       'defect', 'defect_type'],\n      dtype='object')",
        msg: '<strong>열 이름 13개</strong>. 열을 꺼낼 때 이 철자 그대로 써야 합니다. 화면에 없는 date·machine 등도 들어 있습니다.' },
      { code: 'df.info()', sel: (r, c) => r === 'h' && c !== 'i', dt: true,
        out: "RangeIndex: 494 entries, 0 to 493\nData columns (total 13 columns):\n #   Column       Non-Null Count  Dtype\n 0   product_id   494 non-null    object\n 5   temp         494 non-null    float64\n …   (13개 열 모두 494 non-null)\ndtypes: float64(5), int64(2), object(6)",
        msg: '열마다 <strong>자료형</strong>(머리글 아래 주황 글씨)과 <strong>빈칸 아닌 개수</strong>. 모두 494 → 빈칸 없음.' },
      { code: 'df.describe()', sel: (r, c) => num[+c] === true && r !== 'gap',
        out: '         temp  pressure  thickness  defect\ncount  494.00    494.00     494.00  494.00\nmean   211.44     80.34       2.00    0.14\nstd      7.40      6.11       0.06    0.34\nmin    191.90     62.00       1.80    0.00\nmax    235.30     97.50       2.20    1.00\n(25%·50%·75% 행 생략, 표시한 숫자 열 4개만)',
        msg: '<strong>숫자 열만</strong> 골라 개수·평균·표준편차·최소·최대 등을 계산합니다. 문자열 열은 빠집니다.' },
      { code: "df['defect_type'].value_counts()", wide: true, sel: (r, c) => c === '7' && r !== 'gap',
        out: 'defect_type\n정상      426\n치수불량     30\n찍힘       23\n스크래치     15\nName: count, dtype: int64',
        msg: '한 열의 <strong>값마다 개수</strong>를 많은 순서로. 화면의 9행은 모두 정상이지만, 494행 전체에는 불량이 68개 있습니다.' },
    ];
    function edges(on) {
      edR.textContent = '↕ 494행'; edC.textContent = '↔ 13열';
      edR.classList.toggle('on', on); edC.classList.toggle('on', on);
    }
    const box = $('mx-btns');
    const btns = M.map((m) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'mbtn' + (m.wide ? ' wide' : ''); b.textContent = m.code; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        press(btns, b);
        cells.forEach((c) => {
          const on = m.sel(c.dataset.r, c.dataset.c);
          c.classList.toggle('hl', !!on);
          c.classList.toggle('dim', !on && !m.edge && c.dataset.c !== 'i' && c.dataset.r !== 'h' && c.dataset.r !== 'gap');
        });
        tab.classList.toggle('show-dt', !!m.dt);
        tab.classList.toggle('edgeon', !!m.edge);
        edges(!!m.edge);
        $('mx-out').textContent = m.out;
        $('mx-msg').innerHTML = m.msg;
      });
      box.appendChild(b);
      return b;
    });
  })();

  /* ───────── 3) 자료형 맞히기 ───────── */
  (function dtypes() {
    const wrap = $('dtcards'); if (!wrap) return;
    const items = [
      { n: 'temp', ex: '211.7, 208.4, …', v: 'float64', k: 'num', a: '소수점이 있는 숫자 = 실수(float). 평균·그래프 계산 가능.' },
      { n: 'speed', ex: '1312, 1241, …', v: 'int64', k: 'num', a: '소수점 없는 숫자 = 정수(int).' },
      { n: 'product_id', ex: "'P00001', …", v: 'object', k: 'str', a: '글자가 섞이면 문자열. 계산 대상이 아닌 이름표.' },
      { n: 'line', ex: "'1라인', '3라인', …", v: 'object', k: 'str', a: '숫자가 보여도 “라인” 글자가 붙어 문자열. 범주(그룹)로 쓴다.' },
      { n: 'defect', ex: '0, 1, …', v: 'int64', k: 'num', a: '정수지만 뜻은 불량/정상 두 범주. 평균 = 불량률로 쓸 수 있다.' },
      { n: 'date', ex: "'2026-03-02', …", v: 'object', k: 'str', a: '날짜처럼 보여도 CSV에서는 글자로 읽힌다. 날짜 계산이 필요하면 pd.to_datetime으로 바꾼다.' },
      { n: 'thickness', ex: '1.980, 1.994, …', v: 'float64', k: 'num', a: '실수. 단, 값 하나에라도 “mm”가 붙으면 열 전체가 문자열이 된다 (5-3).' },
      { n: 'defect_type', ex: "'정상', '찍힘', …", v: 'object', k: 'str', a: '문자열 범주. value_counts로 센다.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="nm">${it.n}</span><span class="ex">${esc(it.ex)}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('dt-score').textContent = opened + ' / ' + items.length + ' 확인' + (opened === items.length ? ' — 자료형은 df.dtypes 또는 df.info()로 확인합니다.' : '');
      });
      wrap.appendChild(b);
    });
  })();
})();
