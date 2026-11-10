// 5주 3차시 전용: 오류값 골라내기(온도 분포), 습도 결측 처리 비교, 정리 파이프라인
// 내장 숫자는 모두 ai-data-analysis/data/process_raw.csv (와 정리본 process.csv) 에서 pandas로 뽑은 실제 값이다.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const $ = (id) => document.getElementById(id);
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
  const median = (a) => { const b = a.slice().sort((x, y) => x - y), n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
  const segPick = (wrap, cb) => {
    const bs = Array.from(wrap.querySelectorAll('button'));
    bs.forEach((b) => b.addEventListener('click', () => { bs.forEach((x) => x.setAttribute('aria-pressed', x === b)); cb(b.dataset.v); }));
    return () => bs.find((b) => b.getAttribute('aria-pressed') === 'true').dataset.v;
  };
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };

  /* ───────── 1) 오류값 골라내기 ───────── */
  (function strip() {
    const svg = $('strip'); if (!svg) return;
    // process_raw.csv 의 temp 499개 (×10)
    const RAWT10 = [2117,2084,2102,2145,2195,2161,2253,2069,2060,2142,2074,2146,1994,2047,2156,2118,2072,2046,2245,2054,2093,2173,2152,1975,2175,2116,2119,2162,2165,2072,2107,2041,2197,2041,2112,2157,2052,2133,2233,2015,2193,2057,2046,2056,2097,9999,1947,2178,2183,2049,2076,2161,2136,1985,2034,2218,2087,2189,2223,2031,2132,2051,2255,1958,2053,2190,2135,2145,2164,2137,2084,2087,2024,2059,2116,2075,2162,2101,2176,9999,2034,1984,2007,2001,2061,2110,2101,1998,2058,2199,2010,2191,2199,2082,2119,2210,2134,2050,2104,2200,2116,2025,2028,2083,2025,2190,2186,2093,2075,2064,1995,1987,2043,2246,2230,2162,2126,2106,2209,2178,2082,2149,2182,2167,2074,2070,2081,2061,2177,2230,2081,2090,2281,2164,2159,2053,2082,2168,2166,2143,2198,2121,2110,2108,2150,2040,2134,2163,2222,1932,2141,2019,2165,2114,2186,2089,2151,2139,2146,2024,2212,2151,2079,2079,2186,2040,2106,2108,2116,2353,2070,2103,2164,2137,2103,2111,2135,2049,2050,2128,2079,2078,2097,2093,2041,2108,2049,2026,2167,2189,2162,2170,2174,2027,2178,2169,2241,2151,2030,1982,2123,2083,2090,2095,2130,2109,2237,2191,2020,2112,2140,2335,2062,2045,2171,2081,2142,2048,2187,2078,2128,2220,2194,2022,2171,1998,2132,2043,2139,2082,1977,2131,2118,2282,2096,2061,2149,1955,1994,2082,2100,2155,2056,-10,2097,2174,2069,2225,2085,2181,2019,2132,2127,2153,2200,2116,2119,2009,2182,2061,2199,2158,2089,2201,2033,2125,2169,2065,2007,2039,2145,2141,2189,2194,2116,2090,2276,2177,2009,2206,2114,2122,2041,1945,2111,2065,2126,2136,2039,2165,2007,2131,2093,2128,2310,2087,2231,2206,2169,2145,2120,2039,2096,2173,2044,2115,2124,2148,2206,2001,2216,2195,2117,2181,2112,2190,2077,2073,2160,2223,2110,1981,2064,2134,2071,2231,2029,2092,2151,2229,2052,2087,2061,2043,2011,2129,2128,2189,2051,2185,2155,2038,2104,2236,2167,1976,2090,2183,9999,2131,2064,2069,2262,2126,2037,2096,2173,2067,2070,2010,2136,2093,2232,2182,2186,2066,2042,2001,2147,2093,2015,2101,2311,2180,2036,2192,2022,1938,1960,2033,2183,2198,9999,2114,2178,2129,2299,2156,2142,2174,1951,2170,2031,2212,2154,2155,2120,2006,1931,2096,2150,2053,2139,2068,2274,2142,2185,2015,2126,2128,2134,2108,2167,9999,2072,2090,-10,2135,1976,2204,2176,1923,2200,2127,2118,2057,2030,2131,2197,2047,2136,2116,2239,2210,2213,2174,2087,2092,2049,2182,2083,2318,2143,2156,2113,2194,2084,2241,9999,2047,2145,1919,2049,2074,2024,2147,2068,2134,2109,2079,2190,2043,2149,2224,2081,2030,2115,2102,2144,2154,2191,2091,2288,2036,2220,2241,2122,2032,2143,1974,2073,2187,2112,2174,1996,1991,2194,2071,2055,2158,2041,2044,2099,2064,2125,2083,2173,2106,2156];
    const T = RAWT10.map((v) => v / 10);
    const r = rng(5), jit = T.map(() => r());
    const L = 50, R = 650, X = (v) => L + (v + 50) / 1100 * (R - L);
    // 위: 전체 범위 점 그림
    el('text', { x: L, y: 22, class: 'p-lab' }, svg).textContent = '원본 온도 499개 (전체 범위)';
    const band = el('rect', { y: 34, height: 130, fill: 'var(--ok)', 'fill-opacity': 0.1, stroke: 'var(--ok)', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, svg);
    for (let v = 0; v <= 1000; v += 200) {
      el('line', { x1: X(v), x2: X(v), y1: 34, y2: 164, class: 'p-grid' }, svg);
      el('text', { x: X(v), y: 182, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = v + '℃';
    }
    el('line', { x1: L, x2: R, y1: 164, y2: 164, class: 'p-axis' }, svg);
    const dots = T.map((v, i) => el('circle', { cx: X(v), cy: 44 + jit[i] * 110, r: 3.2 }, svg));
    const lab1 = el('text', { x: X(999.9) - 12, y: 104, 'text-anchor': 'end', class: 'p-tick', style: 'font-weight:800' }, svg); lab1.textContent = '999.9 × 6개';
    const lab2 = el('text', { x: X(-1) + 12, y: 104, class: 'p-tick', style: 'font-weight:800' }, svg); lab2.textContent = '−1.0 × 2개';
    // 아래: 범위 안 값의 히스토그램
    const hT = el('text', { x: L, y: 220, class: 'p-lab' }, svg);
    const HB = 400, HT = 236;
    el('line', { x1: L, x2: R, y1: HB, y2: HB, class: 'p-axis' }, svg);
    const bars = el('g', {}, svg), ticks = el('g', {}, svg);
    const lo = $('st-lo'), hi = $('st-hi');
    function update() {
      const a = +lo.value, b = +hi.value;
      $('st-lo-o').textContent = a + '℃'; $('st-hi-o').textContent = b + '℃';
      band.setAttribute('x', X(a)); band.setAttribute('width', X(b) - X(a));
      const inR = [], outN = [0];
      T.forEach((v, i) => {
        const ok = v >= a && v <= b;
        dots[i].setAttribute('fill', ok ? 'var(--accent)' : 'var(--accent-2)');
        dots[i].setAttribute('fill-opacity', ok ? 0.35 : 1);
        dots[i].setAttribute('r', ok ? 3.2 : 6);
        if (ok) inR.push(v); else outN[0]++;
      });
      const n = outN[0], m = mean(inR);
      $('st-n').textContent = n + '개';
      $('st-m').textContent = m.toFixed(2) + '℃';
      // 히스토그램
      bars.innerHTML = ''; ticks.innerHTML = '';
      const mn = Math.min(...inR), mx = Math.max(...inR), K = 40, w = (mx - mn) / K || 1;
      const cnt = new Array(K).fill(0);
      inR.forEach((v) => cnt[Math.min(K - 1, Math.floor((v - mn) / w))]++);
      const top = Math.max(...cnt), bw = (R - L) / K;
      cnt.forEach((c, k) => { if (c) el('rect', { x: L + k * bw + 1, y: HB - c / top * (HB - HT), width: bw - 2, height: c / top * (HB - HT), rx: 2, fill: 'var(--accent)', 'fill-opacity': 0.75 }, bars); });
      [mn, (mn + mx) / 2, mx].forEach((v, k) => { el('text', { x: k === 0 ? L : k === 1 ? (L + R) / 2 : R, y: HB + 18, 'text-anchor': k === 0 ? 'start' : k === 1 ? 'middle' : 'end', class: 'p-tick' }, ticks).textContent = v.toFixed(1) + '℃'; });
      const mxm = L + (m - mn) / (mx - mn) * (R - L);
      el('line', { x1: mxm, x2: mxm, y1: HT - 4, y2: HB, class: 'p-line', 'stroke-dasharray': '6 4' }, ticks);
      el('text', { x: Math.min(mxm + 6, R - 90), y: HT + 8, class: 'p-tick', style: 'fill:var(--accent-2);font-weight:800' }, ticks).textContent = '평균 ' + m.toFixed(1);
      hT.textContent = `범위 안 값 ${inR.length}개의 분포 (${mn.toFixed(1)} ~ ${mx.toFixed(1)}℃)`;
      const st = $('st-msg');
      if (mx > 300 || mn < 100) { st.className = 'status bad'; st.innerHTML = `<b class="k">오류값이 섞여 있음</b>범위 안에 ${mx > 300 ? '999.9' : '−1.0'}이 남아 평균이 ${m.toFixed(2)}℃로 틀어지고, 아래 분포가 한쪽에 찌그러집니다.`; }
      else if (n === 8) { st.className = 'status ok'; st.innerHTML = '<b class="k">오류값 8개를 정확히 골라냄</b>남은 491개는 191.9~235.3℃ — 사출 성형 온도로 말이 되는 범위입니다.'; }
      else { st.className = 'status mid'; st.innerHTML = `<b class="k">정상값까지 ${n - 8}개 잘라냄</b>범위를 너무 좁히면 실제로 높거나 낮았던 <strong>진짜 측정값</strong>까지 버립니다.`; }
    }
    lo.addEventListener('input', update); hi.addEventListener('input', update);
    update();
  })();

  /* ───────── 2) 습도 결측 처리 비교 ───────── */
  (function hum() {
    const svg = $('hum'); if (!svg) return;
    // 중복 제거 후 humidity 494칸 (×10, -1 = NaN), 빈칸의 실제 값(정리본 process.csv)
    const HUM10 = [607,544,426,671,470,476,834,576,468,753,747,592,793,695,538,679,735,684,746,660,422,465,582,554,650,600,419,624,643,550,643,756,801,603,626,391,565,528,423,-1,816,556,526,556,594,498,650,702,633,496,537,674,529,621,560,502,658,513,-1,782,615,466,441,706,453,539,632,614,605,501,697,676,552,571,477,877,717,495,499,529,571,549,761,534,-1,530,533,290,426,458,583,645,656,713,657,695,652,546,336,569,462,544,717,439,590,589,697,615,591,655,597,589,630,766,451,544,469,568,727,601,606,581,596,830,632,600,605,669,600,517,545,530,470,585,590,646,442,506,694,533,650,662,609,606,616,451,498,558,621,483,537,535,429,-1,620,573,704,596,576,573,666,807,545,484,469,569,448,609,615,532,608,698,538,621,583,612,655,542,378,557,562,275,488,463,420,539,427,613,682,671,793,653,511,623,763,502,527,614,425,628,521,584,604,641,485,700,724,637,-1,620,679,660,657,434,596,638,486,-1,770,620,526,541,737,621,621,612,510,649,745,514,426,576,564,497,629,461,452,453,479,547,419,474,508,529,579,569,611,602,507,505,495,505,475,654,549,486,654,579,385,671,631,536,578,583,647,768,548,528,538,571,538,688,585,585,758,667,787,715,651,661,698,355,610,704,531,417,391,505,679,-1,558,678,590,735,703,561,490,489,642,392,484,589,607,331,526,678,513,724,527,501,617,590,595,557,387,516,576,567,566,530,772,611,682,475,683,597,530,798,470,-1,515,619,461,673,541,429,537,448,547,746,551,585,710,481,-1,489,641,535,594,681,347,473,562,599,513,677,789,511,-1,613,693,717,773,-1,485,426,482,487,500,598,723,-1,652,705,666,526,523,582,455,409,-1,551,302,708,530,627,586,-1,547,668,657,642,515,581,564,418,543,494,516,465,557,523,761,649,646,680,682,553,619,438,-1,496,611,491,652,669,632,517,485,484,479,674,643,775,502,824,585,622,556,537,629,412,598,526,431,494,535,708,682,671,649,773,740,412,518,-1,382,616,498,560,408,616,506,611,676,569,596,627,749,569,600,751,534,428,548,559,492,388,497,637,524,701,668,721,714,617,-1,682,501,485,583,383,617,634,561,-1,563,559,615,-1,704,592,646,598];
    const TRUE10 = [575,644,599,535,427,501,575,571,666,684,583,617,593,614,563,614,587,448,670];
    const H = HUM10.filter((v) => v >= 0).map((v) => v / 10);
    const TRUE = TRUE10.map((v) => v / 10);
    const L = 60, R = 650, B = 360, Tp = 40, x0 = 25, x1 = 90, bw = 2.5, K = (x1 - x0) / bw;
    const X = (v) => L + (v - x0) / (x1 - x0) * (R - L);
    const bin = (v) => Math.min(K - 1, Math.max(0, Math.floor((v - x0) / bw)));
    const base = new Array(K).fill(0); H.forEach((v) => base[bin(v)]++);
    const YMAX = Math.max(...base) + 24;
    const Y = (c) => B - c / YMAX * (B - Tp);
    for (let c = 0; c <= YMAX - 5; c += 10) {
      el('line', { x1: L, x2: R, y1: Y(c), y2: Y(c), class: 'p-grid' }, svg);
      el('text', { x: L - 8, y: Y(c) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = c;
    }
    for (let v = 30; v <= 90; v += 10) el('text', { x: X(v), y: B + 20, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = v + '%';
    el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis' }, svg);
    el('text', { x: (L + R) / 2, y: B + 44, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = '습도 (%) →';
    el('text', { x: 16, y: (Tp + B) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 16 ${(Tp + B) / 2})` }, svg).textContent = '제품 수';
    const gBase = el('g', {}, svg), gFill = el('g', {}, svg), gTrue = el('g', {}, svg), gTxt = el('g', {}, svg);
    base.forEach((c, k) => { if (c) el('rect', { x: L + k * (R - L) / K + 1, y: Y(c), width: (R - L) / K - 2, height: B - Y(c), rx: 2, fill: 'var(--accent)', 'fill-opacity': 0.55 }, gBase); });
    const getM = segPick($('hm-m'), () => update());
    const tb = $('hm-true');
    tb.addEventListener('click', () => { toggle(tb); update(); });
    const MEAN = mean(H), MED = median(H);
    function update() {
      const m = getM(), showT = tb.getAttribute('aria-pressed') === 'true';
      gFill.innerHTML = ''; gTrue.innerHTML = ''; gTxt.innerHTML = '';
      let vals = H.slice(), rows = 494, fillV = null;
      if (m === 'drop') rows = 475;
      if (m === 'mean' || m === 'med') {
        fillV = m === 'mean' ? MEAN : MED;
        vals = H.concat(new Array(19).fill(fillV));
        const k = bin(fillV), c0 = base[k];
        el('rect', { x: L + k * (R - L) / K + 1, y: Y(c0 + 19), width: (R - L) / K - 2, height: Y(c0) - Y(c0 + 19), rx: 2, fill: 'var(--accent-2)' }, gFill);
        el('text', { x: X(fillV) + 14, y: Y(c0 + 19) + 4, class: 'p-tick', style: 'fill:var(--accent-2);font-weight:800' }, gTxt).textContent = `← 채운 19칸이 모두 ${fillV.toFixed(2)}`;
      }
      if (showT) {
        const stack = new Array(K).fill(0);
        TRUE.forEach((v) => { const k = bin(v); stack[k]++; el('circle', { cx: L + (k + 0.5) * (R - L) / K, cy: Y(base[k]) - 9 - (stack[k] - 1) * 13, r: 5.5, fill: 'none', stroke: 'var(--ok)', 'stroke-width': 2.5 }, gTrue); });
      }
      if (m === 'none' || m === 'drop') {
        el('text', { x: R, y: Tp - 14, 'text-anchor': 'end', class: 'p-tick', style: 'font-weight:800;fill:' + (m === 'none' ? 'var(--accent-2)' : 'var(--bad)') }, gTxt).textContent = m === 'none' ? '빈칸 19칸: 계산에서 빠짐 (그림에 없음)' : '빈칸이 있던 19행을 통째로 삭제';
      }
      $('hm-n').textContent = (m === 'drop' ? 475 : m === 'none' ? 475 : 494) + '개';
      $('hm-mean').textContent = mean(vals).toFixed(2);
      $('hm-sd').textContent = sd(vals).toFixed(2);
      const msg = {
        none: 'pandas는 평균을 낼 때 NaN을 <strong>자동으로 빼고</strong> 475개로 계산합니다. 빈칸은 그대로 남아 있습니다.',
        drop: '평균·표준편차는 “그대로”와 같지만 <strong>그 19행의 온도·압력·불량 기록까지</strong> 함께 사라져 494 → 475행.',
        mean: '행은 494개 그대로. 하지만 19칸이 한 값에 몰려 막대가 솟고, 표준편차가 <strong>10.14 → 9.94</strong>로 줄었습니다.',
        med: '중앙값도 한곳에 몰리는 건 같습니다. 이 열은 치우침이 작아 평균(58.06)과 중앙값(58.20)이 비슷합니다.',
      }[m];
      $('hm-msg').innerHTML = msg + (showT ? ` <span style="color:var(--ok);font-weight:800">○ 실제 값</span>은 ${Math.min(...TRUE)}~${Math.max(...TRUE)}%로 흩어져 있었습니다.` : '');
    }
    update();
  })();

  /* ───────── 3) 정리 파이프라인 ───────── */
  (function pipe() {
    const box = $('pp-cols'); if (!box) return;
    // 키 = (A 중복)(B 오류값)(C 두께) + D(none/drop/fill) — 모든 조합을 pandas로 미리 계산한 값
    const P = {"000none":{"rows":499,"na":28,"na_t":0,"na_p":9,"na_h":19,"tmean":220.11,"tmax":999.9,"tmin":-1.0,"thick":"object","thmean":null,"dup":5,"defect":13.8},"000drop":{"rows":471,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":220.63,"tmax":999.9,"tmin":-1.0,"thick":"object","thmean":null,"dup":5,"defect":13.8},"000fill":{"rows":499,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":220.11,"tmax":999.9,"tmin":-1.0,"thick":"object","thmean":null,"dup":5,"defect":13.8,"med":[211.6,80.6,58.15]},"001none":{"rows":499,"na":28,"na_t":0,"na_p":9,"na_h":19,"tmean":220.11,"tmax":999.9,"tmin":-1.0,"thick":"float64","thmean":1.999,"dup":5,"defect":13.8},"001drop":{"rows":471,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":220.63,"tmax":999.9,"tmin":-1.0,"thick":"float64","thmean":1.998,"dup":5,"defect":13.8},"001fill":{"rows":499,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":220.11,"tmax":999.9,"tmin":-1.0,"thick":"float64","thmean":1.999,"dup":5,"defect":13.8,"med":[211.6,80.6,58.15]},"010none":{"rows":499,"na":36,"na_t":8,"na_p":9,"na_h":19,"tmean":211.48,"tmax":235.3,"tmin":191.9,"thick":"object","thmean":null,"dup":5,"defect":13.8},"010drop":{"rows":463,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":211.49,"tmax":235.3,"tmin":191.9,"thick":"object","thmean":null,"dup":5,"defect":14.0},"010fill":{"rows":499,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":211.48,"tmax":235.3,"tmin":191.9,"thick":"object","thmean":null,"dup":5,"defect":13.8,"med":[211.6,80.6,58.15]},"011none":{"rows":499,"na":36,"na_t":8,"na_p":9,"na_h":19,"tmean":211.48,"tmax":235.3,"tmin":191.9,"thick":"float64","thmean":1.999,"dup":5,"defect":13.8},"011drop":{"rows":463,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":211.49,"tmax":235.3,"tmin":191.9,"thick":"float64","thmean":1.998,"dup":5,"defect":14.0},"011fill":{"rows":499,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":211.48,"tmax":235.3,"tmin":191.9,"thick":"float64","thmean":1.999,"dup":5,"defect":13.8,"med":[211.6,80.6,58.15]},"100none":{"rows":494,"na":28,"na_t":0,"na_p":9,"na_h":19,"tmean":220.18,"tmax":999.9,"tmin":-1.0,"thick":"object","thmean":null,"dup":0,"defect":13.8},"100drop":{"rows":466,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":220.72,"tmax":999.9,"tmin":-1.0,"thick":"object","thmean":null,"dup":0,"defect":13.7},"100fill":{"rows":494,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":220.18,"tmax":999.9,"tmin":-1.0,"thick":"object","thmean":null,"dup":0,"defect":13.8,"med":[211.6,80.6,58.2]},"101none":{"rows":494,"na":28,"na_t":0,"na_p":9,"na_h":19,"tmean":220.18,"tmax":999.9,"tmin":-1.0,"thick":"float64","thmean":1.999,"dup":0,"defect":13.8},"101drop":{"rows":466,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":220.72,"tmax":999.9,"tmin":-1.0,"thick":"float64","thmean":1.998,"dup":0,"defect":13.7},"101fill":{"rows":494,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":220.18,"tmax":999.9,"tmin":-1.0,"thick":"float64","thmean":1.999,"dup":0,"defect":13.8,"med":[211.6,80.6,58.2]},"110none":{"rows":494,"na":36,"na_t":8,"na_p":9,"na_h":19,"tmean":211.47,"tmax":235.3,"tmin":191.9,"thick":"object","thmean":null,"dup":0,"defect":13.8},"110drop":{"rows":458,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":211.48,"tmax":235.3,"tmin":191.9,"thick":"object","thmean":null,"dup":0,"defect":14.0},"110fill":{"rows":494,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":211.47,"tmax":235.3,"tmin":191.9,"thick":"object","thmean":null,"dup":0,"defect":13.8,"med":[211.6,80.6,58.2]},"111none":{"rows":494,"na":36,"na_t":8,"na_p":9,"na_h":19,"tmean":211.47,"tmax":235.3,"tmin":191.9,"thick":"float64","thmean":1.999,"dup":0,"defect":13.8},"111drop":{"rows":458,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":211.48,"tmax":235.3,"tmin":191.9,"thick":"float64","thmean":1.998,"dup":0,"defect":14.0},"111fill":{"rows":494,"na":0,"na_t":0,"na_p":0,"na_h":0,"tmean":211.47,"tmax":235.3,"tmin":191.9,"thick":"float64","thmean":1.999,"dup":0,"defect":13.8,"med":[211.6,80.6,58.2]}};
    const st = { A: 0, B: 0, C: 0, D: 'none' };
    document.querySelectorAll('.tgl[data-k]').forEach((b) => b.addEventListener('click', () => { st[b.dataset.k] = toggle(b) ? 1 : 0; render(); }));
    segPick($('pp-d'), (v) => { st.D = v; render(); });
    const key = (s) => `${s.A}${s.B}${s.C}${s.D}`;
    const f1 = (v) => (v === null || v === undefined ? '-' : v.toFixed(1));
    function render() {
      const s = P[key(st)];
      $('pp-rows').textContent = s.rows;
      $('pp-na').textContent = s.na;
      $('pp-dup').textContent = s.dup;
      $('pp-tm').textContent = s.tmean.toFixed(2);
      $('pp-dup').classList.toggle('warn', s.dup > 0);
      $('pp-tm').classList.toggle('warn', s.tmax > 300);
      const nab = (n) => `<span class="badge ${n ? 'na' : 'ok'}">빈칸 ${n}</span>`;
      box.innerHTML =
        `<div class="cc"><div class="nm">temp</div><span class="badge">float64</span> ${nab(s.na_t)}<div class="muted">범위 ${f1(s.tmin)} ~ ${f1(s.tmax)}</div></div>` +
        `<div class="cc"><div class="nm">pressure</div><span class="badge">float64</span> ${nab(s.na_p)}<div class="muted">센서 기록 (bar)</div></div>` +
        `<div class="cc"><div class="nm">humidity</div><span class="badge">float64</span> ${nab(s.na_h)}<div class="muted">센서 기록 (%)</div></div>` +
        `<div class="cc"><div class="nm">thickness</div><span class="badge ${s.thick === 'object' ? 'str' : ''}">${s.thick}</span><div class="muted">${s.thick === 'object' ? '평균 계산 불가 (문자열)' : '평균 ' + s.thmean.toFixed(3) + ' mm'}</div></div>`;
      // 코드 = 기록
      let code = "df = pd.read_csv(DATA + 'process_raw.csv')        # 원본 499행\n";
      if (st.A) code += 'df = df.drop_duplicates()                          # ① 중복 행 삭제\n';
      if (st.B) code += "df['temp'] = df['temp'].replace([999.9, -1.0], np.nan)   # ② 센서 오류값\n";
      if (st.C) code += "df['thickness'] = df['thickness'].str.replace('mm', '').astype(float)   # ③\n";
      if (st.D === 'drop') code += 'df = df.dropna()                                   # ④ 빈칸 있는 행 삭제\n';
      if (st.D === 'fill') code += 'df = df.fillna(df.median(numeric_only=True))       # ④ 중앙값으로 채우기\n';
      $('pp-code').textContent = code.trimEnd();
      // 변경 기록: 한 단계씩 적용하며 앞 상태와 비교
      const log = [], cur = { A: 0, B: 0, C: 0, D: 'none' };
      let prev = P[key(cur)];
      if (st.A) { cur.A = 1; const n = P[key(cur)]; log.push(`① 중복 ${prev.dup}행 삭제: ${prev.rows} → ${n.rows}행`); prev = n; }
      if (st.B) { cur.B = 1; const n = P[key(cur)]; log.push(`② temp 오류값 ${n.na_t}개 → NaN: 평균 ${prev.tmean.toFixed(2)} → ${n.tmean.toFixed(2)}`); prev = n; }
      if (st.C) { cur.C = 1; const n = P[key(cur)]; log.push(`③ thickness ${prev.thick} → ${n.thick} ('mm' 24개 제거)`); prev = n; }
      if (st.D !== 'none') {
        cur.D = st.D; const n = P[key(cur)];
        if (st.D === 'drop') log.push(`④ dropna: ${prev.rows} → ${n.rows}행 (${prev.rows - n.rows}행 삭제)`);
        else { const md = n.med; log.push(`④ 중앙값 채움 ${prev.na}칸: ${st.B ? 'temp ' + md[0] + ', ' : ''}pressure ${md[1]}, humidity ${md[2]}`); }
      }
      $('pp-log').innerHTML = log.length ? log.map((t) => `<li>${t}</li>`).join('') : '<li class="empty">아직 바꾼 것이 없습니다 — 원본 그대로</li>';
      // 상태
      const issues = [];
      if (s.dup) issues.push(`중복 ${s.dup}행`);
      if (s.tmax > 300) issues.push('temp 오류값(999.9·−1.0)');
      if (s.thick === 'object') issues.push('두께가 문자열');
      const el2 = $('pp-st');
      if (st.D === 'fill' && !st.B) { el2.className = 'status bad'; el2.innerHTML = '<b class="k">순서 주의</b>오류값을 NaN으로 바꾸기 전에 채우면, 999.9가 <strong>정상값처럼</strong> 남습니다.'; }
      else if (issues.length) { el2.className = 'status bad'; el2.innerHTML = `<b class="k">아직 남은 문제</b>${issues.join(' · ')}${s.na ? ` · 빈칸 ${s.na}칸` : ''}`; }
      else if (s.na) { el2.className = 'status mid'; el2.innerHTML = `<b class="k">거의 다 왔음</b>빈칸 ${s.na}칸이 남았습니다. 지울지 채울지 정하세요.`; }
      else { el2.className = 'status ok'; el2.innerHTML = `<b class="k">분석 준비 완료</b>${s.rows}행 · 빈칸 0 · 중복 0. ${st.D === 'drop' ? '대신 36행을 잃었습니다.' : '채운 36칸은 추측값임을 기록해 둡니다.'}`; }
    }
    render();
  })();
})();
