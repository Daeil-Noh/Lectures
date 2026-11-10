// 3주 3차시 전용: 온도 격자, 경보 기준 놀이터, 반복문 따라가기, import 실험·라이브러리 카드
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const KW = /^(import|from|as|def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|print|class|with|try|except|lambda|pass|break|continue|range|len)$/;
  function hl(src) {
    const re = /(#[^\n]*)|(f'[^'\n]*'|'[^'\n]*'|"[^"\n]*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)(?=\s*\()|([A-Za-z_][A-Za-z0-9_]*)/g;
    let out = '', i = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(i, m.index));
      if (m[1]) out += '<span class="c">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="s">' + esc(m[2]) + '</span>';
      else if (m[3]) out += '<span class="n">' + m[3] + '</span>';
      else if (m[4]) out += (KW.test(m[4]) ? '<span class="k">' : '<span class="f">') + m[4] + '</span>';
      else out += KW.test(m[5]) ? '<span class="k">' + m[5] + '</span>' : m[5];
      i = re.lastIndex;
    }
    return out + esc(src.slice(i));
  }
  const lineHTML = (arr) => arr.map((s, i) => `<span class="ln"><i class="no">${i + 1}</i>${hl(s)}</span>`).join('');

  // process.csv 의 temp 열 494개 (가상 데이터, 파일 순서 그대로)
  const TEMPS = [211.7, 208.4, 210.2, 214.5, 219.5, 216.1, 225.3, 206.9, 206.0, 214.2, 207.4, 214.6, 199.4, 204.7, 215.6, 211.8, 207.2, 204.6, 224.5, 205.4, 209.3, 217.3, 215.2, 197.5, 217.5, 211.6, 211.9, 216.2, 216.5, 207.2, 210.7, 204.1, 219.7, 204.1, 211.2, 215.7, 205.2, 213.3, 223.3, 201.5, 219.3, 205.7, 204.6, 205.6, 209.7, 215.2, 194.7, 217.8, 218.3, 204.9, 207.6, 216.1, 213.6, 198.5, 203.4, 221.8, 208.7, 218.9, 222.3, 203.1, 213.2, 205.1, 225.5, 195.8, 205.3, 219.0, 213.5, 214.5, 216.4, 213.7, 208.4, 208.7, 202.4, 205.9, 211.6, 207.5, 216.2, 210.1, 217.6, 197.7, 203.4, 198.4, 200.7, 200.1, 206.1, 211.0, 210.1, 199.8, 205.8, 219.9, 201.0, 219.1, 219.9, 208.2, 211.9, 221.0, 213.4, 205.0, 210.4, 220.0, 211.6, 202.5, 202.8, 208.3, 202.5, 219.0, 218.6, 209.3, 207.5, 206.4, 199.5, 198.7, 204.3, 224.6, 223.0, 216.2, 212.6, 210.6, 220.9, 217.8, 208.2, 214.9, 218.2, 216.7, 207.4, 207.0, 208.1, 206.1, 217.7, 223.0, 208.1, 209.0, 228.1, 216.4, 215.9, 205.3, 208.2, 216.8, 216.6, 214.3, 219.8, 212.1, 211.0, 210.8, 215.0, 204.0, 213.4, 216.3, 222.2, 193.2, 214.1, 201.9, 216.5, 211.4, 218.6, 208.9, 215.1, 213.9, 214.6, 202.4, 221.2, 215.1, 207.9, 207.9, 218.6, 204.0, 210.6, 210.8, 211.6, 235.3, 207.0, 210.3, 216.4, 213.7, 210.3, 211.1, 213.5, 204.9, 205.0, 212.8, 207.9, 207.8, 209.7, 209.3, 204.1, 210.8, 204.9, 202.6, 216.7, 218.9, 216.2, 217.0, 217.4, 202.7, 217.8, 216.9, 224.1, 215.1, 203.0, 198.2, 212.3, 208.3, 209.0, 209.5, 213.0, 210.9, 223.7, 219.1, 202.0, 211.2, 214.0, 233.5, 206.2, 204.5, 217.1, 208.1, 214.2, 204.8, 218.7, 207.8, 212.8, 222.0, 219.4, 202.2, 217.1, 199.8, 213.2, 204.3, 213.9, 208.2, 197.7, 213.1, 211.8, 228.2, 209.6, 206.1, 214.9, 195.5, 199.4, 208.2, 210.0, 215.5, 205.6, 208.4, 209.7, 217.4, 206.9, 222.5, 208.5, 218.1, 201.9, 213.2, 212.7, 215.3, 220.0, 211.6, 211.9, 200.9, 218.2, 206.1, 219.9, 215.8, 208.9, 220.1, 203.3, 212.5, 216.9, 206.5, 200.7, 203.9, 214.5, 214.1, 218.9, 219.4, 211.6, 209.0, 227.6, 217.7, 200.9, 220.6, 211.4, 212.2, 204.1, 194.5, 211.1, 206.5, 212.6, 213.6, 203.9, 216.5, 200.7, 213.1, 209.3, 212.8, 231.0, 208.7, 223.1, 220.6, 216.9, 214.5, 212.0, 203.9, 209.6, 217.3, 204.4, 211.5, 212.4, 214.8, 220.6, 200.1, 221.6, 219.5, 211.7, 218.1, 211.2, 219.0, 207.7, 207.3, 216.0, 222.3, 211.0, 198.1, 206.4, 213.4, 207.1, 223.1, 202.9, 209.2, 215.1, 222.9, 205.2, 208.7, 206.1, 204.3, 201.1, 212.9, 212.8, 218.9, 205.1, 218.5, 215.5, 203.8, 210.4, 223.6, 216.7, 197.6, 209.0, 218.3, 202.6, 213.1, 206.4, 206.9, 226.2, 212.6, 203.7, 209.6, 217.3, 206.7, 207.0, 201.0, 213.6, 209.3, 223.2, 218.2, 218.6, 206.6, 204.2, 200.1, 214.7, 209.3, 201.5, 210.1, 231.1, 218.0, 203.6, 219.2, 202.2, 193.8, 196.0, 203.3, 218.3, 219.8, 210.5, 211.4, 217.8, 212.9, 229.9, 215.6, 214.2, 217.4, 195.1, 217.0, 203.1, 221.2, 215.4, 215.5, 212.0, 200.6, 193.1, 209.6, 215.0, 205.3, 213.9, 206.8, 227.4, 214.2, 218.5, 201.5, 212.6, 212.8, 213.4, 210.8, 216.7, 215.3, 207.2, 209.0, 211.8, 213.5, 197.6, 220.4, 217.6, 192.3, 220.0, 212.7, 211.8, 205.7, 203.0, 213.1, 219.7, 204.7, 213.6, 211.6, 223.9, 221.0, 221.3, 217.4, 208.7, 209.2, 204.9, 218.2, 208.3, 231.8, 214.3, 215.6, 211.3, 219.4, 208.4, 224.1, 214.3, 204.7, 214.5, 191.9, 204.9, 207.4, 202.4, 214.7, 206.8, 213.4, 210.9, 207.9, 219.0, 204.3, 214.9, 222.4, 208.1, 203.0, 211.5, 210.2, 214.4, 215.4, 219.1, 209.1, 228.8, 203.6, 222.0, 224.1, 212.2, 203.2, 214.3, 197.4, 207.3, 218.7, 211.2, 217.4, 199.6, 199.1, 219.4, 207.1, 205.5, 215.8, 204.1, 204.4, 209.9, 206.4];

  /* ───────── 1) 도입: 앞 48개 온도 ───────── */
  (function grid() {
    const g = $('tgrid'); if (!g) return;
    g.innerHTML = TEMPS.slice(0, 48).map((t) => `<span class="${t > 220 ? 'hi' : ''}">${t.toFixed(1)}</span>`).join('');
  })();

  /* ───────── 2) 경보 기준 놀이터 ───────── */
  (function alarm() {
    const code = $('a-code'); if (!code) return;
    const sT = $('a-t'), sW = $('a-w'), sD = $('a-d'), swap = $('a-swap');
    const svg = $('a-thermo');
    const LO = 195, HI = 235, Y0 = 410, Y1 = 24, X = 34, W = 30;
    const Y = (v) => Y0 - (v - LO) / (HI - LO) * (Y0 - Y1);
    const zN = el('rect', { x: X, width: W, fill: 'var(--accent-soft)' }, svg);
    const zW = el('rect', { x: X, width: W, fill: 'var(--accent-2-soft)' }, svg);
    const zD = el('rect', { x: X, width: W, fill: 'var(--bad-soft)' }, svg);
    el('rect', { x: X, y: Y1, width: W, height: Y0 - Y1, rx: 8, fill: 'none', stroke: 'var(--line)', 'stroke-width': 2 }, svg);
    for (let v = 195; v <= 235; v += 10) {
      el('line', { x1: X - 6, x2: X, y1: Y(v), y2: Y(v), stroke: 'var(--muted)', 'stroke-width': 1.5 }, svg);
      el('text', { x: X - 10, y: Y(v) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = v;
    }
    const lW = el('line', { x1: X - 2, x2: X + W + 12, stroke: 'var(--accent-2)', 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }, svg);
    const lD = el('line', { x1: X - 2, x2: X + W + 12, stroke: 'var(--bad)', 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }, svg);
    const tW = el('text', { x: X + W + 14, class: 'p-tick', style: 'fill:var(--accent-2);font-weight:800' }, svg);
    const tD = el('text', { x: X + W + 14, class: 'p-tick', style: 'fill:var(--bad);font-weight:800' }, svg);
    const merc = el('rect', { x: X + 9, width: W - 18, rx: 6 }, svg);
    el('circle', { cx: X + W / 2, cy: Y0 + 16, r: 18, fill: 'var(--surface-2)', stroke: 'var(--line)', 'stroke-width': 2 }, svg);
    const bulb = el('circle', { cx: X + W / 2, cy: Y0 + 16, r: 12 }, svg);
    const mk = el('text', { x: X + W + 14, class: 'p-lab' }, svg);

    const LAB = ['정상', '주의: 냉각 확인', '위험: 즉시 정지'];
    const COL = ['var(--accent)', 'var(--accent-2)', 'var(--bad)'];
    // 코드가 실제로 내리는 판정 (순서를 바꾸면 결과도 바뀜)
    const judge = (t, w, d, sw) => sw ? (t >= w ? 1 : t >= d ? 2 : 0) : (t >= d ? 2 : t >= w ? 1 : 0);
    function update() {
      const t = +sT.value, w = +sW.value, d = +sD.value, sw = swap.getAttribute('aria-pressed') === 'true';
      $('a-t-o').textContent = t.toFixed(1) + '℃'; $('a-w-o').textContent = w + '℃'; $('a-d-o').textContent = d + '℃';
      const first = sw ? [w, 1] : [d, 2], second = sw ? [d, 2] : [w, 1];
      const src = [
        `temp = ${t.toFixed(1)}`,
        `if temp >= ${first[0]}:`, `    print('${LAB[first[1]]}')`,
        `elif temp >= ${second[0]}:`, `    print('${LAB[second[1]]}')`,
        'else:', `    print('${LAB[0]}')`,
      ];
      code.innerHTML = lineHTML(src);
      const L = code.querySelectorAll('.ln');
      const c1 = t >= first[0], c2 = !c1 && t >= second[0];
      const st = ['run', 'run', c1 ? 'cur' : 'skip', c1 ? 'skip' : 'run', c2 ? 'cur' : 'skip', c1 || c2 ? 'skip' : 'run', c1 || c2 ? 'skip' : 'cur'];
      L.forEach((l, i) => l.classList.add(st[i]));
      const r = judge(t, w, d, sw);
      $('a-out').textContent = LAB[r];
      // 온도계
      const band = (r, a, b) => { r.setAttribute('y', Y(b)); r.setAttribute('height', Math.max(0, Y(a) - Y(b))); };
      if (d > w) { band(zN, LO, w); band(zW, w, d); band(zD, d, HI); }
      else { band(zN, LO, d); band(zW, d, d); band(zD, d, HI); }
      [[lW, tW, w, '주의'], [lD, tD, d, '위험']].forEach(([ln, tx, v, nm]) => { ln.setAttribute('y1', Y(v)); ln.setAttribute('y2', Y(v)); tx.setAttribute('y', Y(v) + (nm === '위험' ? -4 : 14)); tx.textContent = nm + ' ' + v; tx.style.opacity = Math.abs(Y(v) - Y(t)) < 16 ? 0 : 1; });
      merc.setAttribute('y', Y(t)); merc.setAttribute('height', Y0 + 6 - Y(t)); merc.setAttribute('fill', COL[r]);
      bulb.setAttribute('fill', COL[r]);
      mk.setAttribute('y', Math.max(Y1 + 14, Math.min(Y0, Y(t) + 5))); mk.textContent = '◀ ' + t.toFixed(1);
      mk.setAttribute('x', X + W + 14);
      // 494개 집계
      const n = [0, 0, 0];
      TEMPS.forEach((v) => n[judge(v, w, d, sw)]++);
      const is = $('a-stack').querySelectorAll('i');
      n.forEach((k, i) => { is[i].style.width = (k / TEMPS.length * 100) + '%'; $('a-n' + i).textContent = k + '개'; });
      // 설명
      const msg = $('a-msg');
      if (sw && t >= d && d > w) msg.innerHTML = `${t.toFixed(1)}℃는 <strong>위험</strong>인데 ‘주의’로 판정! 첫 조건 <code>temp &gt;= ${w}</code>가 먼저 참이 되어 <strong>아래는 검사하지 않았습니다.</strong> 494개 중 위험 <strong>${n[2]}개</strong>.`;
      else if (sw && d > w) msg.innerHTML = `순서를 바꾸면 위험 조건까지 갈 일이 없어 494개 중 위험이 <strong>${n[2]}개</strong>가 됩니다. 온도를 ${d}℃ 이상으로 올려 보세요.`;
      else if (d <= w) msg.innerHTML = '위험 기준이 주의 기준보다 낮거나 같으면 ‘주의’ 구간이 <strong>사라집니다.</strong> 기준값끼리의 관계도 확인!';
      else if (r === 2) msg.innerHTML = `${t.toFixed(1)} &gt;= ${d} → 첫 조건이 참 → <strong>위험</strong>. 나머지 elif·else는 건너뜁니다.`;
      else if (r === 1) msg.innerHTML = `${d} 이상은 아니고(거짓), ${w} 이상(참) → <strong>주의</strong>. 기준을 움직이면 494개의 판정도 바뀝니다.`;
      else msg.innerHTML = `두 조건이 모두 거짓 → <strong>else: 정상</strong>. 이제 <strong>조건 순서 바꾸기</strong>를 눌러 보세요.`;
    }
    [sT, sW, sD].forEach((s) => s.addEventListener('input', update));
    swap.addEventListener('click', () => { swap.setAttribute('aria-pressed', swap.getAttribute('aria-pressed') !== 'true'); update(); });
    update();
  })();

  /* ───────── 3) 반복문 따라가기 ───────── */
  (function loop() {
    const code = $('f-code'); if (!code) return;
    const V = [218.2, 222.5, 209.8, 225.1, 216.4, 221.0];
    const f1 = (v) => v.toFixed(1);
    code.innerHTML = lineHTML([
      'temps = [218.2, 222.5, 209.8, 225.1, 216.4, 221.0]',
      'total = 0', 'count = 0',
      'for t in temps:', '    total = total + t', '    if t > 220:', '        count = count + 1',
      'avg = total / len(temps)',
      "print(f'평균 {avg:.1f}℃, 220 초과 {count}개')",
    ]);
    const L = code.querySelectorAll('.ln');
    const row = $('f-row');
    const cells = V.map((v) => { const c = document.createElement('span'); c.className = 'lc'; c.textContent = f1(v); row.appendChild(c); return c; });
    // 실행 단계 미리 만들기
    const S = [];
    let total = null, count = null;
    S.push({ ln: 0, idx: -1, s: { t: null, total, count, avg: null }, msg: '리스트 <strong>temps</strong>에 온도 6개를 넣습니다.' });
    total = 0; S.push({ ln: 1, idx: -1, s: { t: null, total, count, avg: null }, chg: 'total', msg: '합을 쌓을 상자 <strong>total을 0</strong>에서 시작합니다.' });
    count = 0; S.push({ ln: 2, idx: -1, s: { t: null, total, count, avg: null }, chg: 'count', msg: '개수를 셀 상자 <strong>count도 0</strong>에서 시작합니다.' });
    V.forEach((v, k) => {
      S.push({ ln: 3, idx: k, s: { t: v, total, count, avg: null }, chg: 't', msg: `<strong>${k + 1}번째</strong> 값 ${f1(v)}을 꺼내 <strong>t</strong>에 넣습니다.` });
      const old = total; total = Math.round((total + v) * 10) / 10;
      S.push({ ln: 4, idx: k, s: { t: v, total, count, avg: null }, chg: 'total', msg: `total = total + t → ${old === 0 ? '0' : f1(old)} + ${f1(v)} = <strong>${f1(total)}</strong>` });
      const hit = v > 220;
      S.push({ ln: 5, idx: k, hit, s: { t: v, total, count, avg: null }, msg: `${f1(v)} &gt; 220 ? → <strong>${hit ? 'True' : 'False'}</strong>` + (hit ? '' : ' — 들여쓴 count 줄은 건너뜁니다.') });
      if (hit) { count++; S.push({ ln: 6, idx: k, hit, s: { t: v, total, count, avg: null }, chg: 'count', msg: `참이므로 count를 1 늘립니다 → <strong>${count}</strong>` }); }
    });
    S.push({ ln: 3, idx: 6, s: { t: V[5], total, count, avg: null }, msg: '더 꺼낼 값이 없습니다. 반복을 끝내고 <strong>들여쓰기 밖</strong> 다음 줄로 갑니다.' });
    const avg = total / V.length;
    S.push({ ln: 7, idx: 6, s: { t: V[5], total, count, avg }, chg: 'avg', msg: `avg = ${f1(total)} / 6 = <strong>${avg.toFixed(4)}…</strong>` });
    S.push({ ln: 8, idx: 6, out: true, s: { t: V[5], total, count, avg }, msg: `<strong>끝!</strong> 6개를 하나씩 보며 평균과 220℃ 초과 개수를 함께 구했습니다. 값이 494개여도 코드는 그대로입니다.` });
    const OUT = `평균 ${avg.toFixed(1)}℃, 220 초과 ${count}개`;

    let k = -1, timer = null;
    const show = (id, v) => { $('vv-' + id).querySelector('.v').textContent = v; };
    function render() {
      const st = S[k];
      L.forEach((l, i) => l.classList.toggle('cur', !!st && i === st.ln));
      ['t', 'total', 'count', 'avg'].forEach((id) => $('vv-' + id).classList.toggle('chg', !!st && st.chg === id));
      const s = st ? st.s : {};
      show('t', s.t == null ? '-' : f1(s.t));
      show('total', s.total == null ? '-' : (s.total === 0 ? '0' : f1(s.total)));
      show('count', s.count == null ? '-' : s.count);
      show('avg', s.avg == null ? '-' : s.avg.toFixed(2) + '…');
      cells.forEach((c, i) => {
        const idx = st ? st.idx : -1;
        c.classList.toggle('on', i === idx);
        c.classList.toggle('past', i < idx);
        const judged = i < idx || (i === idx && st.ln >= 5);
        c.classList.toggle('hit', judged && V[i] > 220);
      });
      const o = $('f-out');
      o.textContent = st && st.out ? OUT : '(아직 출력 없음)';
      $('f-msg').innerHTML = st ? st.msg : '<strong>한 단계</strong>를 눌러 코드가 어떤 순서로 실행되는지 따라가 보세요. 4~7번 줄이 <strong>6번 반복</strong>됩니다.';
      $('f-n').textContent = `단계 ${k + 1} / ${S.length}`;
      $('f-step').disabled = k >= S.length - 1;
    }
    function stop() { clearInterval(timer); timer = null; $('f-auto').textContent = '자동'; }
    $('f-step').addEventListener('click', () => { stop(); if (k < S.length - 1) { k++; render(); } });
    $('f-auto').addEventListener('click', () => {
      if (timer) { stop(); return; }
      if (k >= S.length - 1) k = -1;
      $('f-auto').textContent = '멈춤';
      timer = setInterval(() => { k++; render(); if (k >= S.length - 1) stop(); }, 650);
    });
    $('f-reset').addEventListener('click', () => { stop(); k = -1; render(); });
    document.addEventListener('slideenter', (e) => { if (!e.detail.slide.contains(code)) stop(); });
    render();
  })();

  /* ───────── 4) import 실험 + 라이브러리 카드 ───────── */
  (function imports() {
    const msg = $('im-msg'); if (!msg) return;
    const cells = Array.from(msg.parentElement.querySelectorAll('.fcell'));
    let imported = false, n = 0;
    const ERR = "NameError: name 'math' is not defined";
    cells.forEach((c, i) => c.querySelector('.runb').addEventListener('click', () => {
      n++; c.querySelector('.cnt').textContent = '[' + n + ']';
      cells.forEach((x) => x.classList.toggle('now', x === c));
      const o = c.querySelector('.fout');
      const set = (t, err) => { o.textContent = t; o.className = 'fout' + (err ? ' err' : ''); };
      if (i === 0) { imported = true; set(''); msg.innerHTML = '공구함 두 개를 꺼냈습니다(출력 없음). 이제 <code>math.</code>, <code>pd.</code>로 안의 도구를 쓸 수 있습니다. 셀 ②, ③을 다시 눌러 보세요.'; }
      else if (!imported) { set(ERR, true); msg.innerHTML = '<strong>NameError</strong>! 공구함을 <strong>import로 꺼내지 않아서</strong> math라는 이름이 없습니다. 3-1의 실행 순서와 같은 문제 — 셀 ①을 먼저!'; }
      else if (i === 1) { set('4.0'); msg.innerHTML = '<code>math.sqrt(16)</code> → <strong>4.0</strong> (제곱근). <strong>공구함.도구( )</strong> 모양으로 씁니다.'; }
      else { set('3.14'); msg.innerHTML = '<code>math.pi</code>는 원주율 3.14159…, 함수 <code>round</code>로 둘째 자리까지 → <strong>3.14</strong>. 함수 안에 함수를 넣어도 됩니다.'; }
    }));
    const INFO = {
      math: { h: 'math — 수학 계산', d: '제곱근·원주율·로그 같은 수학 함수 모음. 파이썬에 기본으로 들어 있습니다.', c: 'import math\nmath.sqrt(16)      # 4.0', w: '오늘 맛보기' },
      pd: { h: 'pandas — 표 데이터', d: 'CSV·엑셀 같은 표를 읽고, 고르고, 집계합니다. 관례적으로 <b>pd</b>라는 별명을 씁니다.', c: "import pandas as pd\ndf = pd.read_csv(DATA + 'process.csv')", w: '이 강의: 5~7주 내내' },
      plt: { h: 'matplotlib — 그래프', d: '막대·선·산점도 그래프를 그립니다. 보통 pyplot 부분을 <b>plt</b>로 불러 씁니다.', c: "import matplotlib.pyplot as plt\nplt.hist(df['temp'])", w: '이 강의: 7주 시각화' },
      sk: { h: 'scikit-learn — 머신러닝', d: '회귀·분류·군집 모델을 몇 줄로 학습시킵니다. import할 때 이름은 <b>sklearn</b>.', c: 'from sklearn.tree import DecisionTreeClassifier', w: '이 강의: 9~12주' },
    };
    const btns = document.querySelectorAll('#libs .lib');
    btns.forEach((b) => b.addEventListener('click', () => {
      const v = INFO[b.dataset.k];
      btns.forEach((x) => x.setAttribute('aria-pressed', x === b));
      $('lib-h').textContent = v.h; $('lib-d').innerHTML = v.d;
      const c = $('lib-c'); c.hidden = false; c.innerHTML = hl(v.c);
      $('lib-w').textContent = v.w;
    }));
  })();
})();
