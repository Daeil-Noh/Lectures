// 11주 3차시 전용: 혼동행렬 칸 누르기, 판정 기준 슬라이더, 오류 비용으로 기준 고르기
// 아래 데이터는 process.csv 에서 python3 + scikit-learn 으로 계산한 실제 값입니다.
//   특성 = temp, pressure, speed, humidity, thickness / 정답 = defect
//   train_test_split(test_size=0.3, random_state=42, stratify=y) → 시험 149개 (불량 21개)
//   model = DecisionTreeClassifier(max_depth=3, random_state=42) → predict_proba(X_test)[:, 1]
// 시험 데이터 149개 (제품번호 순): [제품번호, 실제 불량, 나무의 불량 확률]
const TEST = [["P00002",0,0.042],["P00005",0,0.042],["P00009",0,0.042],["P00010",1,0.042],["P00016",0,0.042],["P00017",0,0.042],["P00018",1,0.2317],["P00025",0,0.042],["P00026",0,0.042],["P00032",0,0.042],["P00037",0,0.042],["P00039",0,0.042],["P00045",0,0.042],["P00048",1,0.2317],["P00049",0,0.042],["P00054",0,0.042],["P00055",0,0.042],["P00057",0,0.042],["P00058",0,0.042],["P00060",0,1.0],["P00061",0,0.042],["P00062",0,0.2317],["P00067",0,0.042],["P00070",0,0.2317],["P00071",0,0.042],["P00073",0,0.042],["P00081",0,0.042],["P00091",0,0.2317],["P00099",0,0.2317],["P00100",0,0.042],["P00103",0,0.042],["P00107",1,0.042],["P00111",0,0.042],["P00112",0,0.042],["P00113",0,0.042],["P00116",0,0.042],["P00119",0,0.2317],["P00120",0,0.042],["P00124",1,1.0],["P00137",0,0.042],["P00138",1,0.2317],["P00145",0,0.042],["P00147",0,0.2317],["P00151",0,0.042],["P00152",0,0.2317],["P00158",0,0.2317],["P00171",0,0.2317],["P00173",0,0.042],["P00175",1,0.2317],["P00179",0,0.042],["P00184",0,0.042],["P00185",0,0.042],["P00186",0,0.042],["P00190",0,0.042],["P00194",0,0.042],["P00197",1,0.8571],["P00198",0,0.042],["P00201",0,0.2317],["P00212",1,0.8571],["P00216",0,0.042],["P00217",0,0.042],["P00218",0,0.042],["P00219",1,1.0],["P00220",0,0.042],["P00221",0,0.042],["P00231",0,0.042],["P00232",0,0.042],["P00236",0,0.2317],["P00238",0,0.042],["P00243",0,0.2317],["P00244",0,0.042],["P00245",0,0.042],["P00246",0,0.042],["P00247",0,0.2317],["P00248",0,0.042],["P00258",0,0.042],["P00263",0,0.042],["P00269",0,0.042],["P00270",0,0.042],["P00276",0,0.2317],["P00280",0,0.042],["P00288",0,0.2317],["P00289",0,0.042],["P00293",0,0.042],["P00294",0,0.2317],["P00295",1,0.8571],["P00297",0,0.042],["P00298",0,0.042],["P00302",0,0.042],["P00303",0,0.042],["P00306",0,0.042],["P00308",0,0.042],["P00309",0,0.042],["P00312",0,0.2317],["P00316",0,0.042],["P00319",0,0.2317],["P00332",0,0.042],["P00336",0,0.042],["P00337",0,0.2317],["P00339",0,0.2317],["P00345",0,0.042],["P00348",0,0.042],["P00351",0,0.042],["P00353",0,0.3333],["P00354",0,0.042],["P00360",0,0.042],["P00362",0,0.042],["P00363",1,1.0],["P00367",0,0.042],["P00377",0,0.042],["P00379",0,0.2317],["P00381",0,0.042],["P00384",0,0.042],["P00387",1,0.8571],["P00390",0,0.042],["P00392",0,0.042],["P00396",0,0.2317],["P00397",0,0.042],["P00399",0,0.042],["P00402",0,0.2317],["P00407",1,0.2317],["P00409",0,0.042],["P00415",0,0.042],["P00419",0,0.042],["P00421",0,0.042],["P00422",0,0.042],["P00426",0,1.0],["P00430",0,0.042],["P00431",0,0.042],["P00433",1,0.3333],["P00434",0,0.042],["P00442",0,0.0],["P00444",0,0.042],["P00446",1,0.042],["P00448",1,0.8571],["P00449",0,0.2317],["P00453",0,0.2317],["P00454",0,0.042],["P00455",0,0.042],["P00470",1,0.2317],["P00471",1,0.042],["P00472",1,0.2317],["P00473",1,0.8571],["P00477",0,0.042],["P00479",0,0.042],["P00484",0,0.042],["P00487",0,0.042],["P00492",0,0.042],["P00494",0,0.042]];
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);
  const pct = (v) => (v * 100).toFixed(1) + '%';
  const N = TEST.length, NB = TEST.filter((r) => r[1]).length;
  // 기준 t 에서의 혼동행렬 (불량 확률 ≥ t → 불량)
  function cmAt(t, lazy) {
    let tp = 0, fp = 0, fn = 0, tn = 0;
    TEST.forEach((r) => { const pr = lazy ? 0 : r[2] >= t - 1e-9 ? 1 : 0; if (r[1] && pr) tp++; else if (r[1]) fn++; else if (pr) fp++; else tn++; });
    return { tp, fp, fn, tn };
  }
  const kind = (y, pr) => (y ? (pr ? 'tp' : 'fn') : (pr ? 'fp' : 'tn'));

  /* ───────── 1) 혼동행렬 칸 누르기 ───────── */
  (function cmDemo() {
    const g = $('cm-grid'); if (!g) return;
    const cells = TEST.map(() => { const c = document.createElement('i'); g.appendChild(c); return c; });
    const btns = document.querySelectorAll('#cm1 button.c');
    const mb = document.querySelectorAll('.mbtn');
    const INFO = {
      tp: ['잡은 불량 (TP)', '실제 불량을 불량으로 판정. 검사가 제 역할을 했다 — 출하 전에 걸러진다.', '공장에서: 재작업하거나 폐기, 원인 공정을 점검한다.'],
      fn: ['놓친 불량 (FN)', '실제 불량인데 정상으로 통과. <strong>불량이 고객에게 간다.</strong>', '공장에서: 반품·클레임, 안전 부품이면 사고·리콜 위험.'],
      fp: ['잘못 경보 (FP)', '정상인데 불량으로 판정. 멀쩡한 제품이 검사대에 올라간다.', '공장에서: 재검사 시간·인건비, 폐기 손실. 너무 잦으면 경보를 무시하게 된다.'],
      tn: ['정상 통과 (TN)', '정상을 정상으로. 제품 대부분이 이 칸에 들어간다.', '그래서 불량이 드물면 정확도가 저절로 높아 보인다.'],
    };
    let mode = 'tree', sel = null;
    function render() {
      const c = cmAt(0.5, mode === 'lazy');
      btns.forEach((b) => { b.querySelector('.n').textContent = c[b.dataset.k]; b.setAttribute('aria-pressed', b.dataset.k === sel); });
      TEST.forEach((r, i) => { const k = kind(r[1], mode === 'lazy' ? 0 : r[2] > 0.5 ? 1 : 0); cells[i].className = k + (k === sel ? ' sel' : ''); });
      g.classList.toggle('focus', !!sel);
      mb.forEach((b) => b.setAttribute('aria-pressed', b.dataset.m === mode));
      if (sel) {
        $('cm-h').textContent = INFO[sel][0] + ' · ' + c[sel] + '개';
        $('cm-d').innerHTML = INFO[sel][1];
        $('cm-c').innerHTML = INFO[sel][2];
      }
      $('cm-acc').innerHTML = `정확도 = (잡은 불량 ${c.tp} + 정상 통과 ${c.tn}) ÷ ${N} = <strong>${pct((c.tp + c.tn) / N)}</strong>` + (mode === 'lazy' ? ' — 불량은 하나도 못 잡았는데도!' : '');
    }
    btns.forEach((b) => b.addEventListener('click', () => { sel = sel === b.dataset.k ? null : b.dataset.k; render(); }));
    mb.forEach((b) => b.addEventListener('click', () => { mode = b.dataset.m; render(); }));
    render();
  })();

  /* ───────── 2) 판정 기준 슬라이더 ───────── */
  (function thDemo() {
    const svg = $('th-svg'); if (!svg) return;
    const s = $('th');
    const S = TEST.map((r) => r).sort((a, b) => b[2] - a[2] || (a[0] < b[0] ? -1 : 1));
    const L = 70, R = 684, T0 = 24, B = 236, SB0 = 290, SB1 = 360;
    const w = (R - L) / N, X = (i) => L + i * w, Y = (p) => B - p * (B - T0);
    // 축
    for (let p = 0; p <= 1.0001; p += 0.25) {
      el('line', { x1: L, x2: R, y1: Y(p), y2: Y(p), class: 'p-grid' }, svg);
      el('text', { x: L - 8, y: Y(p) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = p.toFixed(2);
    }
    el('text', { x: 18, y: (T0 + B) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 18 ${(T0 + B) / 2})` }, svg).textContent = '불량 확률';
    const shade = el('rect', { x: L, y: T0 - 8, height: SB1 - T0 + 8, fill: 'var(--accent-2)', 'fill-opacity': 0.08 }, svg);
    let d = '';
    S.forEach((r, i) => { d += (i ? 'L' : 'M') + X(i) + ',' + Y(r[2]) + 'L' + X(i + 1) + ',' + Y(r[2]); });
    el('path', { d, fill: 'none', stroke: 'var(--text)', 'stroke-width': 2.5 }, svg);
    S.forEach((r, i) => el('rect', { x: X(i) + 0.4, y: SB0, width: Math.max(1, w - 0.8), height: SB1 - SB0, fill: r[1] ? 'var(--accent-2)' : 'var(--accent)', 'fill-opacity': r[1] ? 1 : 0.28 }, svg));
    el('text', { x: L, y: SB0 - 8, class: 'p-tick', style: 'font-weight:700' }, svg).textContent = '시험 제품 149개 — 불량 확률이 높은 순으로 한 줄 세우기 (주황 = 실제 불량)';
    const hl = el('line', { x1: L, x2: R, stroke: 'var(--accent-2)', 'stroke-width': 2.5, 'stroke-dasharray': '8 5' }, svg);
    const ht = el('text', { x: R, 'text-anchor': 'end', class: 'p-tick', style: 'font-weight:800;fill:var(--accent-2)' }, svg);
    const vl = el('line', { y1: T0 - 8, y2: SB1 + 6, stroke: 'var(--accent-2)', 'stroke-width': 3 }, svg);
    const lt = el('text', { x: L, y: SB1 + 30, class: 'p-lab', style: 'fill:var(--accent-2)' }, svg);
    const rt = el('text', { x: R, y: SB1 + 30, 'text-anchor': 'end', class: 'p-lab', style: 'fill:var(--accent)' }, svg);
    const bar = (id, v) => { $(id).style.width = (v === null ? 0 : v * 100) + '%'; };
    function update() {
      const t = +s.value;
      $('th-o').textContent = t.toFixed(2) + ' 이상';
      const k = S.filter((r) => r[2] >= t - 1e-9).length, c = cmAt(t);
      const xc = X(k);
      shade.setAttribute('width', xc - L);
      hl.setAttribute('y1', Y(t)); hl.setAttribute('y2', Y(t));
      ht.setAttribute('y', Y(t) - 6); ht.textContent = '기준 ' + t.toFixed(2);
      vl.setAttribute('x1', xc); vl.setAttribute('x2', xc);
      lt.textContent = `◀ 기준선 왼쪽: 불량 판정 ${k}개`;
      rt.textContent = `오른쪽: 정상 판정 ${N - k}개 ▶`;
      const acc = (c.tp + c.tn) / N, prec = c.tp + c.fp ? c.tp / (c.tp + c.fp) : null, rec = c.tp / NB;
      $('th-tp').textContent = c.tp + '/' + NB; $('th-fn').textContent = c.fn; $('th-fp').textContent = c.fp;
      $('th-a').textContent = pct(acc); $('th-p').textContent = prec === null ? '경보 0' : pct(prec); $('th-r').textContent = pct(rec);
      bar('th-ab', acc); bar('th-pb', prec); bar('th-rb', rec);
      const d5 = cmAt(0.5);
      let m;
      if (!k) m = '경보가 <strong>한 번도</strong> 울리지 않습니다 — 게으른 검사기와 같습니다. 정확도는 그대로 높아 보이죠.';
      else if (k === N) m = '모든 제품을 불량으로 — 재현율 100%지만 전수 재검사와 같아 <strong>검사의 의미가 없습니다</strong>.';
      else if (c.tp === d5.tp && c.fp === d5.fp) m = `기본값 0.5(predict)와 같은 결과. 경보는 믿을 만하지만(정밀도 ${pct(prec)}) 불량 <strong>${c.fn}개를 놓칩니다</strong>.`;
      else if (rec > d5.tp / NB) m = `기준을 낮추자 놓친 불량이 <strong>${d5.fn} → ${c.fn}개</strong>. 대신 잘못 경보가 <strong>${d5.fp} → ${c.fp}개</strong>로 늘었습니다.`;
      else m = `기준이 높아 확실한 것만 경보 — 정밀도 ${prec === null ? '-' : pct(prec)}, 하지만 불량 <strong>${c.fn}개</strong>가 그냥 통과합니다.`;
      $('th-msg').innerHTML = m;
    }
    s.addEventListener('input', update);
    update();
  })();

  /* ───────── 3) 오류 비용으로 기준 고르기 ───────── */
  (function costDemo() {
    const svg = $('co-svg'); if (!svg) return;
    const s = $('co');
    const RATIO = [1, 2, 3, 5, 10, 20, 30, 50, 100];
    const TS = Array.from({ length: 101 }, (_, i) => i / 100);
    const CM = TS.map((t) => cmAt(t));
    const L = 70, R = 680, T0 = 30, B = 350;
    const X = (t) => L + t * (R - L);
    const gA = el('g', {}, svg), gD = el('g', {}, svg);
    for (let t = 0; t <= 1.0001; t += 0.25) el('text', { x: X(t), y: B + 20, 'text-anchor': 'middle', class: 'p-tick' }, gA).textContent = t.toFixed(2);
    el('text', { x: (L + R) / 2, y: B + 46, 'text-anchor': 'middle', class: 'p-lab' }, gA).textContent = '불량 판정 기준 (불량 확률 ≥ 기준) →';
    el('text', { x: 16, y: (T0 + B) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 16 ${(T0 + B) / 2})` }, gA).textContent = '총비용 (잘못 경보 1건 = 1)';
    el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis' }, gA);
    function update() {
      const n = RATIO[+s.value];
      $('co-o').textContent = '잘못 경보 ' + n + '건';
      const cost = CM.map((c) => c.fp + n * c.fn);
      const mx = Math.max(...cost) * 1.08, Y = (v) => B - v / mx * (B - T0);
      const mn = Math.min(...cost);
      const i0 = cost.indexOf(mn); let i1 = i0; while (i1 + 1 < cost.length && cost[i1 + 1] === mn) i1++;
      gD.innerHTML = '';
      const step = Math.pow(10, Math.floor(Math.log10(mx / 4)));
      const tick = Math.ceil(mx / 4 / step) * step;
      for (let v = 0; v < mx; v += tick) {
        el('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), class: 'p-grid' }, gD);
        el('text', { x: L - 8, y: Y(v) + 4, 'text-anchor': 'end', class: 'p-tick' }, gD).textContent = v;
      }
      el('rect', { x: X(TS[i0]) - 3, y: T0, width: X(TS[i1]) - X(TS[i0]) + 6, height: B - T0, fill: 'var(--ok)', 'fill-opacity': 0.12 }, gD);
      let d = '';
      cost.forEach((v, i) => { d += i ? 'L' + X(TS[i]) + ',' + Y(cost[i - 1]) + 'L' + X(TS[i]) + ',' + Y(v) : 'M' + X(0) + ',' + Y(v); });
      el('path', { d, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 3, 'stroke-linejoin': 'round' }, gD);
      const c5 = cost[50];
      el('line', { x1: X(0.5), x2: X(0.5), y1: T0, y2: B, stroke: 'var(--muted)', 'stroke-dasharray': '4 5', 'stroke-width': 1.5 }, gD);
      el('circle', { cx: X(0.5), cy: Y(c5), r: 6, fill: 'var(--muted)' }, gD);
      el('text', { x: X(0.5) + 8, y: Y(c5) - 10, class: 'p-tick', style: 'font-weight:700' }, gD).textContent = '기본 0.5: ' + c5;
      const xm = (X(TS[i0]) + X(TS[i1])) / 2;
      el('circle', { cx: xm, cy: Y(mn), r: 7, fill: 'var(--ok)' }, gD);
      el('text', { x: Math.min(R - 60, Math.max(L + 60, xm)), y: Y(mn) + 26, 'text-anchor': 'middle', class: 'p-tick', style: 'font-weight:800;fill:var(--ok)' }, gD).textContent = '최저 ' + mn;
      const c = CM[i0];
      const rng = i0 === i1 ? TS[i0].toFixed(2) : TS[i0].toFixed(2) + '~' + TS[i1].toFixed(2);
      $('co-t').textContent = rng; $('co-c').textContent = mn;
      $('co-fn').textContent = c.fn; $('co-fp').textContent = c.fp;
      $('co-msg').innerHTML = `놓친 불량 1건이 잘못 경보 <strong>${n}건</strong>만큼 비싸다면, 기준을 <strong>${rng}</strong>로 잡을 때 가장 쌉니다 (총비용 ${mn}` + (c5 > mn ? `, 기본 0.5보다 <strong>${c5 - mn}</strong> 절약` : ', 기본 0.5와 같음') + '). 배수를 키우면 가장 싼 기준이 <strong>왼쪽(낮은 쪽)</strong>으로 갑니다.';
    }
    s.addEventListener('input', update);
    update();
  })();
})();
