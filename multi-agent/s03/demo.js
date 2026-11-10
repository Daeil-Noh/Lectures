// 3회 직접 해 보기: 컨텍스트 나눠 담기 · 작성–검토 루프
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);
  const mk = (svg, tag, a, txt) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; svg.appendChild(e); return e; };

  /* ── 1. 컨텍스트 나눠 담기 ── */
  const cs = $('ctxSvg');
  if (cs) {
    const LIMIT = 200; // k토큰, 가정
    function draw() {
      const k = +$('kR').value, r = +$('rR').value, mode = $('shareSel').value;
      $('kO').textContent = k; $('rO').textContent = r + 'k';
      // [지침·과제, 도구 결과, 넘겨받은 것]
      const bars = [{ name: '에이전트 하나', seg: [3, k * r, 0] }];
      bars.push({ name: '리드', seg: [5, 0, k * 1.5] });
      for (let i = 0; i < k; i++) {
        const share = mode === 'brief' ? 2 : mode === 'log' ? 10 : 3 + i * r;
        bars.push({ name: '워커 ' + (i + 1), seg: [1, r, share] });
      }
      const tot = (b) => b.seg[0] + b.seg[1] + b.seg[2];
      const maxV = Math.max(LIMIT * 1.15, ...bars.map(tot));
      cs.innerHTML = '';
      const x0 = 92, W = 550, rowH = Math.min(30, 270 / bars.length), sc = W / maxV;
      bars.forEach((b, i) => {
        const y = 6 + i * rowH + (i > 0 ? 8 : 0);
        mk(cs, 'text', { x: 0, y: y + rowH * 0.62, class: 'p-lab', style: 'font-size:' + Math.min(14, rowH * 0.55) + 'px' }, b.name);
        let x = x0;
        ['f-muted', 'f-acc2', 'f-acc'].forEach((cls, j) => { const w = b.seg[j] * sc; if (w > 0) { mk(cs, 'rect', { x, y, width: w, height: rowH - 5, rx: 4, class: cls }); x += w; } });
        mk(cs, 'text', { x: x + 6, y: y + rowH * 0.62, class: 'p-tick' }, Math.round(tot(b)) + 'k');
      });
      const lx = x0 + LIMIT * sc;
      mk(cs, 'line', { x1: lx, x2: lx, y1: 0, y2: 290, stroke: 'var(--bad)', 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      mk(cs, 'text', { x: lx - 4, y: 286, 'text-anchor': 'end', class: 'p-tick' }, '창 한계 ' + LIMIT + 'k');
      mk(cs, 'line', { x1: 0, x2: 660, y1: 6 + rowH - 1, y2: 6 + rowH - 1, class: 'p-grid' });
      const multi = bars.slice(1);
      const mMax = Math.max(...multi.map(tot)), mSum = multi.reduce((a, b) => a + tot(b), 0), single = tot(bars[0]);
      $('maxW').textContent = Math.round(mMax) + 'k';
      $('sumW').textContent = Math.round(mSum) + 'k';
      let note = '에이전트 하나: <b>' + Math.round(single) + 'k</b>' + (single > LIMIT ? ' — <b style="color:var(--bad)">창 한계를 넘습니다.</b>' : ' (창 안에 들어감).');
      note += mode === 'full' ? ' 전체 기록을 넘기면 뒤 워커일수록 창이 커지고 전체 읽은 양이 크게 늘어 <b>격리의 이득이 사라집니다</b>.'
        : mode === 'log' ? ' 결정 로그를 넘기면 오해는 줄고 창은 여전히 작습니다.'
        : ' 브리프만 넘기면 가장 작고 싸지만, 워커가 모르는 맥락이 생깁니다.';
      $('ctxNote').innerHTML = note;
    }
    ['kR', 'rR'].forEach((id) => $(id).addEventListener('input', draw));
    $('shareSel').addEventListener('change', draw);
    draw();
  }

  /* ── 2. 작성–검토 루프 ── */
  const ls = $('loopSvg');
  if (ls) {
    const Q = [0, 1, 2, 3, 4, 5].map((i) => Math.round(55 + 40 * (1 - Math.pow(0.6, i))));
    const NOISE = [2, -1, 1, 0, -2, 1];
    function draw() {
      const th = +$('thR').value, mr = +$('mrR').value, indep = $('indep').checked;
      $('thO').textContent = th; $('mrO').textContent = mr;
      const score = Q.map((q, i) => Math.min(100, q + (indep ? NOISE[i] : 12)));
      let end = mr;
      for (let i = 0; i < mr; i++) if (score[i] >= th) { end = i + 1; break; }
      const passed = score[end - 1] >= th;
      ls.innerHTML = '';
      const x0 = 50, y0 = 280, W = 580, H = 250, xs = (i) => x0 + 40 + i * (W - 80) / 5, ys = (v) => y0 - (v - 40) / 60 * H;
      for (let v = 40; v <= 100; v += 10) { mk(ls, 'line', { x1: x0, x2: x0 + W, y1: ys(v), y2: ys(v), class: 'p-grid' }); mk(ls, 'text', { x: x0 - 8, y: ys(v) + 4, 'text-anchor': 'end', class: 'p-tick' }, v); }
      for (let i = 0; i < 6; i++) mk(ls, 'text', { x: xs(i), y: y0 + 22, 'text-anchor': 'middle', class: 'p-tick', style: i < end ? 'font-weight:800' : 'opacity:.4' }, (i + 1) + '라운드');
      mk(ls, 'line', { x1: x0, x2: x0 + W, y1: ys(th), y2: ys(th), stroke: 'var(--ok)', 'stroke-width': 2.5, 'stroke-dasharray': '7 5' });
      mk(ls, 'text', { x: x0 + W - 4, y: ys(th) - 6, 'text-anchor': 'end', class: 'p-tick', style: 'fill:var(--ok);font-weight:800' }, '통과 기준 ' + th);
      const path = (arr, n) => arr.slice(0, n).map((v, i) => (i ? 'L' : 'M') + xs(i) + ' ' + ys(v)).join(' ');
      mk(ls, 'path', { d: path(Q, end), fill: 'none', stroke: 'var(--accent-2)', 'stroke-width': 3.5 });
      mk(ls, 'path', { d: path(score, end), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.5, 'stroke-dasharray': indep ? '' : '4 4' });
      for (let i = 0; i < end; i++) {
        mk(ls, 'circle', { cx: xs(i), cy: ys(Q[i]), r: 6, class: 'f-acc2' });
        mk(ls, 'circle', { cx: xs(i), cy: ys(score[i]), r: 6, class: 'f-acc' });
      }
      mk(ls, 'text', { x: x0 + 4, y: 18, class: 'p-lab', style: 'fill:var(--accent)' }, '● 검토자가 준 점수');
      mk(ls, 'text', { x: x0 + 170, y: 18, class: 'p-lab', style: 'fill:var(--accent-2)' }, '● 실제 품질');
      $('lpR').textContent = end; $('lpQ').textContent = Q[end - 1];
      $('loopNote').innerHTML = (passed ? '<b>' + end + '라운드에 통과</b>로 멈췄습니다. ' : '<b>최대 라운드</b>에 걸려 멈췄습니다(미통과). ')
        + (indep ? '독립 검토자의 점수는 실제 품질과 거의 같습니다.' : '같은 맥락의 자기 검토는 <b>점수를 후하게</b> 줘서, 실제 품질 <b>' + Q[end - 1] + '점</b>에서 통과시켰습니다.');
    }
    ['thR', 'mrR'].forEach((id) => $(id).addEventListener('input', draw));
    $('indep').addEventListener('change', draw);
    draw();
  }
})();
