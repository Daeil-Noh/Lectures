// 5주 2차시 전용: 될까 안 될까 카드, & / | 벤 그림, 필터 만들기, 정렬 체험
// 12행 표 = process.csv 의 df.sample(12, random_state=16). "494행 전체" 개수는 아래 내장 배열(실제 temp·shift·defect_type)로 센다.
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const NS = 'http://www.w3.org/2000/svg';
  const segPick = (wrap, cb) => {
    const bs = Array.from(wrap.querySelectorAll('button'));
    bs.forEach((b) => b.addEventListener('click', () => { bs.forEach((x) => x.setAttribute('aria-pressed', x === b)); cb(b.dataset.v); }));
    return () => bs.find((b) => b.getAttribute('aria-pressed') === 'true').dataset.v;
  };

  // 12행 표본: [인덱스, product_id, shift, line, temp, pressure, thickness, strength, defect_type]
  const S = [
    [390, 'P00391', '야간', '2라인', 195.1, 83.6, 1.956, 34.06, '정상'],
    [18, 'P00019', '야간', '1라인', 224.5, 74.1, 1.901, 32.22, '치수불량'],
    [106, 'P00107', '야간', '2라인', 218.6, 79.3, 2.081, 38.19, '찍힘'],
    [126, 'P00127', '야간', '3라인', 208.1, 81.6, 1.971, 36.81, '정상'],
    [133, 'P00134', '주간', '2라인', 216.4, 83.5, 1.994, 41.30, '정상'],
    [370, 'P00371', '주간', '2라인', 201.5, 84.4, 2.015, 40.28, '정상'],
    [199, 'P00200', '주간', '3라인', 198.2, 80.3, 1.989, 37.88, '정상'],
    [220, 'P00221', '주간', '1라인', 212.8, 75.2, 1.957, 37.19, '정상'],
    [132, 'P00133', '주간', '2라인', 228.1, 71.7, 1.974, 31.70, '스크래치'],
    [425, 'P00426', '야간', '1라인', 205.7, 88.5, 1.946, 39.28, '정상'],
    [264, 'P00265', '야간', '3라인', 203.3, 68.6, 1.952, 34.59, '정상'],
    [137, 'P00138', '야간', '3라인', 216.8, 82.2, 1.932, 40.34, '치수불량'],
  ];
  const HEAD = ['product_id', 'shift', 'line', 'temp', 'pressure', 'thickness', 'strength', 'defect_type'];
  const DIG = { temp: 1, pressure: 1, thickness: 3, strength: 2 };
  const cell = (v, j) => { const h = HEAD[j]; return DIG[h] !== undefined ? `<td class="num" data-c="${h}">${v.toFixed(DIG[h])}</td>` : `<td data-c="${h}">${v}</td>`; };

  /* ───────── 1) 될까 안 될까 ───────── */
  (function cards() {
    const wrap = $('cards'); if (!wrap) return;
    const items = [
      { c: "df['temp']", ok: true, v: '실행됨 → Series', a: '온도 열 하나. 494개 값 + 인덱스.' },
      { c: "df[['temp', 'pressure']]", ok: true, v: '실행됨 → DataFrame (494, 2)', a: '열 이름 리스트를 주면 그 열들만 담은 표.' },
      { c: "df['temp', 'pressure']", ok: false, v: "KeyError: ('temp', 'pressure')", a: '대괄호가 하나면 (temp, pressure)를 <b>이름 하나</b>로 보고 찾다가 실패.' },
      { c: "df['Temp']", ok: false, v: "KeyError: 'Temp'", a: '열 이름은 <b>대소문자까지</b> 정확히. <code>df.columns</code>로 철자 확인.' },
      { c: 'df[temp]', ok: false, v: "NameError: name 'temp' is not defined", a: '따옴표가 없으면 열 이름이 아니라 <b>변수</b>로 본다.' },
      { c: "df[['temp']]", ok: true, v: '실행됨 → DataFrame (494, 1)', a: '열 하나라도 리스트로 주면 Series가 아닌 <b>한 열짜리 표</b>.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="nm">${esc(it.c)}</span><span class="q">실행될까? 결과는 어떤 모양일까?</span><span class="verdict">${it.ok ? '✔ ' : '✖ '}${esc(it.v)}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.ok ? 'yes' : 'no'); opened++;
        $('cards-score').textContent = opened + ' / ' + items.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 2) & / | 벤 그림 ───────── */
  (function venn() {
    const svg = $('venn'); if (!svg) return;
    const A = $('vA'), B = $('vB');
    const defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = '<clipPath id="clipA"><circle cx="190" cy="185" r="80"/></clipPath>';
    svg.insertBefore(defs, svg.firstChild);
    const inter = document.createElementNS(NS, 'circle');
    inter.setAttribute('cx', 300); inter.setAttribute('cy', 185); inter.setAttribute('r', 120);
    inter.setAttribute('clip-path', 'url(#clipA)'); inter.setAttribute('fill', 'var(--accent-2)'); inter.setAttribute('fill-opacity', '.55');
    svg.insertBefore(inter, A.nextSibling.nextSibling);
    const btns = Array.from(document.querySelectorAll('.opbtn'));
    const code = { and: "df[(df['temp'] > 220) & (df['shift'] == '야간')]", or: "df[(df['temp'] > 220) | (df['shift'] == '야간')]" };
    function pick(op) {
      btns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.op === op));
      inter.style.display = op === 'and' ? '' : 'none';
      A.setAttribute('fill-opacity', op === 'or' ? 0.5 : 0.12);
      B.setAttribute('fill-opacity', op === 'or' ? 0.38 : 0.08);
      $('op-code').textContent = code[op];
    }
    btns.forEach((b) => b.addEventListener('click', () => pick(b.dataset.op)));
    pick('and');
  })();

  /* ───────── 3) 필터 만들기 ───────── */
  (function builder() {
    const tab = $('fb-tab'); if (!tab) return;
    // 494행 전체의 temp(×10), shift(D=주간, N=야간), defect_type(0 정상, 1 치수불량, 2 찍힘, 3 스크래치)
    const T10 = [2117,2084,2102,2145,2195,2161,2253,2069,2060,2142,2074,2146,1994,2047,2156,2118,2072,2046,2245,2054,2093,2173,2152,1975,2175,2116,2119,2162,2165,2072,2107,2041,2197,2041,2112,2157,2052,2133,2233,2015,2193,2057,2046,2056,2097,2152,1947,2178,2183,2049,2076,2161,2136,1985,2034,2218,2087,2189,2223,2031,2132,2051,2255,1958,2053,2190,2135,2145,2164,2137,2084,2087,2024,2059,2116,2075,2162,2101,2176,1977,2034,1984,2007,2001,2061,2110,2101,1998,2058,2199,2010,2191,2199,2082,2119,2210,2134,2050,2104,2200,2116,2025,2028,2083,2025,2190,2186,2093,2075,2064,1995,1987,2043,2246,2230,2162,2126,2106,2209,2178,2082,2149,2182,2167,2074,2070,2081,2061,2177,2230,2081,2090,2281,2164,2159,2053,2082,2168,2166,2143,2198,2121,2110,2108,2150,2040,2134,2163,2222,1932,2141,2019,2165,2114,2186,2089,2151,2139,2146,2024,2212,2151,2079,2079,2186,2040,2106,2108,2116,2353,2070,2103,2164,2137,2103,2111,2135,2049,2050,2128,2079,2078,2097,2093,2041,2108,2049,2026,2167,2189,2162,2170,2174,2027,2178,2169,2241,2151,2030,1982,2123,2083,2090,2095,2130,2109,2237,2191,2020,2112,2140,2335,2062,2045,2171,2081,2142,2048,2187,2078,2128,2220,2194,2022,2171,1998,2132,2043,2139,2082,1977,2131,2118,2282,2096,2061,2149,1955,1994,2082,2100,2155,2056,2084,2097,2174,2069,2225,2085,2181,2019,2132,2127,2153,2200,2116,2119,2009,2182,2061,2199,2158,2089,2201,2033,2125,2169,2065,2007,2039,2145,2141,2189,2194,2116,2090,2276,2177,2009,2206,2114,2122,2041,1945,2111,2065,2126,2136,2039,2165,2007,2131,2093,2128,2310,2087,2231,2206,2169,2145,2120,2039,2096,2173,2044,2115,2124,2148,2206,2001,2216,2195,2117,2181,2112,2190,2077,2073,2160,2223,2110,1981,2064,2134,2071,2231,2029,2092,2151,2229,2052,2087,2061,2043,2011,2129,2128,2189,2051,2185,2155,2038,2104,2236,2167,1976,2090,2183,2026,2131,2064,2069,2262,2126,2037,2096,2173,2067,2070,2010,2136,2093,2232,2182,2186,2066,2042,2001,2147,2093,2015,2101,2311,2180,2036,2192,2022,1938,1960,2033,2183,2198,2105,2114,2178,2129,2299,2156,2142,2174,1951,2170,2031,2212,2154,2155,2120,2006,1931,2096,2150,2053,2139,2068,2274,2142,2185,2015,2126,2128,2134,2108,2167,2153,2072,2090,2118,2135,1976,2204,2176,1923,2200,2127,2118,2057,2030,2131,2197,2047,2136,2116,2239,2210,2213,2174,2087,2092,2049,2182,2083,2318,2143,2156,2113,2194,2084,2241,2143,2047,2145,1919,2049,2074,2024,2147,2068,2134,2109,2079,2190,2043,2149,2224,2081,2030,2115,2102,2144,2154,2191,2091,2288,2036,2220,2241,2122,2032,2143,1974,2073,2187,2112,2174,1996,1991,2194,2071,2055,2158,2041,2044,2099,2064];
    const SH = 'DDDDDDDDDDNNNNNNNNNNDDDDDDDNNNNNNNNDDDDDDDNNNNNNNDDDDDDDNNNNNNNNDDDDDDDDDDNNNNNNNDDDDDDDDNNNNNNNNDDDDDDDNNNNNNNNNNDDDDDDDDNNNNNNNNDDDDDDDNNNNNNNNDDDDDDDDDNNNNNNNNDDDDDDDNNNNNNNNNNDDDDDDDDDNNNNNNNNNDDDDDDDDNNNNNNNDDDDDDDDDNNNNNNNNNDDDDDDDDDDNNNNNNNNDDDDDDDDDDNNNNNNNNDDDDDDDNNNNNNNNNDDDDDDDDNNNNNNNNNNDDDDDDDNNNNNNNDDDDDDDDNNNNNNNNDDDDDDDDNNNNNNNNDDDDDDDDDDNNNNNNNNDDDDDDDNNNNNNNDDDDDDDNNNNNNNNNNDDDDDDDNNNNNNNNNDDDDDDDDDNNNNNNNNNDDDDDDDDDNNNNNNNDDDDDDDDNNNNNNNNNNDDDDDDDDNNNNNNNDDDDDDDNNNNNNNNN';
    const DT = '00000000020020000110000000000000000000000000000100010003000000300000000000020000000000000300000010000000002000000200000000020000000030000100000000000000003320000200000001000010000000100000002000201000000000200002000000100000000010000000000000000000000000001000200001000001000020100000000000000020001000000000000001000003000020020100000000000001000000000000202000100000000022030000000000301000000003000000021000000001000300011000100030000000000003030000000000000000000002311000000000000000100000';
    const DTN = ['정상', '치수불량', '찍힘', '스크래치'];
    let h = '<thead><tr><th class="idx"></th>' + HEAD.map((c) => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
    S.forEach((r) => { h += `<tr><td class="idx">${r[0]}</td>` + r.slice(1).map(cell).join('') + '</tr>'; });
    tab.innerHTML = h + '</tbody>';
    const trs = Array.from(tab.querySelectorAll('tbody tr'));
    const chips = $('fb-dt');
    DTN.forEach((n, i) => {
      const c = document.createElement('button'); c.type = 'button'; c.className = 'chip'; c.textContent = n;
      c.setAttribute('aria-pressed', i >= 2 ? 'true' : 'false');
      c.addEventListener('click', () => { c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') !== 'true'); update(); });
      chips.appendChild(c);
    });
    const getOp = segPick($('fb-op'), () => update());
    const getSh = segPick($('fb-sh'), () => update());
    const getJoin = segPick($('fb-join'), () => update());
    const cmp = (a, op, b) => (op === '>' ? a > b : op === '>=' ? a >= b : a < b);
    ['fb-t-on', 'fb-s-on', 'fb-d-on'].forEach((id) => $(id).addEventListener('change', () => update()));
    $('fb-t').addEventListener('input', () => update());
    function update() {
      const th = +$('fb-t').value, op = getOp(), sh = getSh(), join = getJoin();
      const tOn = $('fb-t-on').checked, sOn = $('fb-s-on').checked, dOn = $('fb-d-on').checked;
      const sel = Array.from(chips.children).map((c, i) => (c.getAttribute('aria-pressed') === 'true' ? i : -1)).filter((i) => i >= 0);
      $('fb-t-o').textContent = (th % 1 ? th.toFixed(1) : th) + '℃';
      $('fb-r1').classList.toggle('offrow', !tOn); $('fb-r2').classList.toggle('offrow', !sOn); $('fb-r3').classList.toggle('offrow', !dOn);
      const parts = [], fns = [], fnsAll = [];
      if (tOn) { parts.push(`df['temp'] ${op} ${th % 1 ? th.toFixed(1) : th}`); fns.push((r) => cmp(Math.round(r[4] * 10), op, Math.round(th * 10))); fnsAll.push((i) => cmp(T10[i], op, Math.round(th * 10))); }
      if (sOn) { parts.push(`df['shift'] == '${sh}'`); fns.push((r) => r[2] === sh); fnsAll.push((i) => SH[i] === (sh === '야간' ? 'N' : 'D')); }
      if (dOn) { parts.push(`df['defect_type'].isin([${sel.map((i) => "'" + DTN[i] + "'").join(', ')}])`); fns.push((r) => sel.includes(DTN.indexOf(r[8]))); fnsAll.push((i) => sel.includes(+DT[i])); }
      const and = join === '&';
      const test = (arr, x) => (arr.length === 0 ? true : and ? arr.every((f) => f(x)) : arr.some((f) => f(x)));
      let code;
      if (!parts.length) code = 'df            # 조건 없음 → 전체';
      else if (parts.length === 1) code = `df[${parts[0]}]`;
      else code = 'df[' + parts.map((p) => '(' + p + ')').join(and ? ' &\n   ' : ' |\n   ') + ']';
      $('fb-code').textContent = code;
      let n = 0;
      S.forEach((r, k) => {
        const on = test(fns, r); if (on) n++;
        trs[k].className = parts.length ? (on ? 'on' : 'off') : '';
        trs[k].querySelectorAll('td[data-c]').forEach((td) => {
          const c = td.dataset.c;
          td.classList.toggle('hit', on && ((tOn && c === 'temp') || (sOn && c === 'shift') || (dOn && c === 'defect_type')));
        });
      });
      let N = 0; for (let i = 0; i < T10.length; i++) if (test(fnsAll, i)) N++;
      $('fb-n').textContent = n + '행';
      $('fb-all').textContent = N + '행';
    }
    update();
  })();

  /* ───────── 4) 정렬 체험 ───────── */
  (function sorter() {
    const tab = $('so-tab'); if (!tab) return;
    const keys = { temp: 4, pressure: 5, thickness: 6, strength: 7 };
    let key = 'strength';
    const getDir = segPick($('so-dir'), () => render());
    $('so-n').addEventListener('input', () => render());
    function render() {
      const asc = getDir() === '1', n = +$('so-n').value, j = keys[key];
      $('so-n-o').textContent = n + '개';
      const rows = S.slice().sort((a, b) => (asc ? a[j] - b[j] : b[j] - a[j]));
      let h = '<thead><tr><th class="idx"></th>' + HEAD.map((c) => `<th class="${keys[c] ? 'sortable' : ''}${c === key ? ' key' : ''}" data-k="${c}" ${keys[c] ? 'tabindex="0" role="button"' : ''}>${c}${c === key ? (asc ? ' ↑' : ' ↓') : ''}</th>`).join('') + '</tr></thead><tbody>';
      rows.forEach((r, i) => { h += `<tr class="${i < n ? 'rk' : ''}"><td class="idx">${r[0]}</td>` + r.slice(1).map(cell).join('') + '</tr>'; });
      tab.innerHTML = h + '</tbody>';
      tab.querySelectorAll('th.sortable').forEach((th) => {
        const go = () => { key = th.dataset.k; render(); };
        th.addEventListener('click', go);
        th.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
      });
      $('so-code').textContent = `df.sort_values('${key}'${asc ? '' : ', ascending=False'}).head(${n})\n# 같은 결과: df.${asc ? 'nsmallest' : 'nlargest'}(${n}, '${key}')`;
      const top = rows[0];
      $('so-msg').innerHTML = `${key} ${asc ? '가장 낮은' : '가장 높은'} 제품은 <strong>${top[1]}</strong> (${top[j].toFixed(DIG[key])}) — ${top[8] === '정상' ? '정상품' : '<strong>' + top[8] + '</strong> 불량'}. 인덱스 <strong>${top[0]}</strong>번이 그대로 따라옵니다.`;
    }
    render();
  })();
})();
