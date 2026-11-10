// 5회 직접 해 보기: 표본 크기와 신뢰구간 · 인젝션 전파 모형
(function () {
  const $ = (id) => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';

  /* ── 1. 신뢰구간 ── */
  const cs = $('ciSvg');
  if (cs) {
    const mk = (tag, a, txt) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; cs.appendChild(e); return e; };
    function draw() {
      const n = +$('nR').value, p1 = +$('p1R').value / 100, p2 = +$('p2R').value / 100;
      $('nO').textContent = n; $('p1O').textContent = Math.round(p1 * 100) + '%'; $('p2O').textContent = Math.round(p2 * 100) + '%';
      const se = (p) => Math.sqrt(p * (1 - p) / n);
      const lo = (p) => Math.max(0, p - 1.96 * se(p)), hi = (p) => Math.min(1, p + 1.96 * se(p));
      cs.innerHTML = '';
      const x0 = 150, W = 480, X = (v) => x0 + v * W;
      for (let v = 0; v <= 1.001; v += 0.1) { mk('line', { x1: X(v), x2: X(v), y1: 20, y2: 250, class: 'p-grid' }); mk('text', { x: X(v), y: 272, 'text-anchor': 'middle', class: 'p-tick' }, Math.round(v * 100) + '%'); }
      [[p1, '에이전트 하나', 'var(--muted)', 80], [p2, '멀티 에이전트', 'var(--accent)', 180]].forEach(([p, name, col, y]) => {
        mk('text', { x: 4, y: y + 6, class: 'p-lab' }, name);
        mk('rect', { x: X(lo(p)), y: y - 16, width: Math.max(2, X(hi(p)) - X(lo(p))), height: 32, rx: 8, fill: col, 'fill-opacity': 0.18, stroke: col, 'stroke-width': 2 });
        mk('circle', { cx: X(p), cy: y, r: 8, fill: col });
        mk('text', { x: X(hi(p)) + 8, y: y + 5, class: 'p-tick' }, Math.round(lo(p) * 100) + '~' + Math.round(hi(p) * 100) + '%');
      });
      const d = Math.abs(p2 - p1);
      const sep = p2 > p1 ? lo(p2) > hi(p1) : lo(p1) > hi(p2);
      const need = d > 0 ? Math.ceil(Math.pow(1.96 * (Math.sqrt(p1 * (1 - p1)) + Math.sqrt(p2 * (1 - p2))) / d, 2)) : Infinity;
      $('ciV').textContent = d === 0 ? '차이 없음' : sep ? '차이가 보인다' : '구별하기 어렵다';
      $('ciV').style.color = sep ? 'var(--ok)' : 'var(--accent-2)';
      $('ciNote').innerHTML = d === 0 ? '두 통과율이 같습니다.' : (sep ? '두 신뢰구간이 겹치지 않습니다. ' : '두 신뢰구간이 겹칩니다. ')
        + '이 차이(' + Math.round(d * 100) + '%p)를 이렇게 구별하려면 질문이 시스템마다 대략 <b>' + (need === Infinity ? '–' : need) + '개</b> 필요합니다.';
    }
    ['nR', 'p1R', 'p2R'].forEach((id) => $(id).addEventListener('input', draw));
    draw();
  }

  /* ── 2. 인젝션 전파 ── */
  const chain = $('chain');
  if (chain) {
    const st = Array.from(chain.querySelectorAll('.st'));
    const luck = [false, true, false, false, true, false]; // 프롬프트 방어의 '운' (실행마다 다름)
    let run = 0, timer = null;
    function sim() {
      clearInterval(timer);
      const on = {};
      document.querySelectorAll('[data-d]').forEach((c) => (on[c.dataset.d] = c.checked));
      st.forEach((s) => s.classList.remove('hit', 'stop'));
      const lucky = luck[run++ % luck.length];
      let stopAt = -1, why = '';
      if (on[1] && lucky) { stopAt = 0; why = '워커가 이번에는 문서 속 지시를 무시했습니다. 하지만 <b>다시 돌리면 통과할 수 있습니다</b> — 프롬프트 방어는 확률적입니다.'; }
      else if (on[2]) { stopAt = 2; why = '리드는 정해진 형식의 <b>데이터</b>만 받으므로 보고 속 문장을 지시로 따르지 않았습니다.'; }
      else if (on[3]) { stopAt = 3; why = '지시를 따르려 했지만 <b>비공개 자료를 읽을 권한</b>이 없어 막혔습니다.'; }
      else if (on[4]) { stopAt = 4; why = '자료는 읽혔지만 <b>밖으로 보낼 도구</b>가 없어 유출되지 않았습니다. (읽힌 내용이 결과물에 섞이지 않았는지는 따로 확인 필요)'; }
      else if (on[5]) { stopAt = 4; why = '전송 직전에 <b>사람 승인</b>에서 멈췄습니다. 승인 요청이 많아지면 사람이 습관적으로 누르는 위험도 있습니다.'; }
      if (on[1] && !lucky && stopAt !== 0) why = '프롬프트 방어는 이번에 <b>뚫렸고</b>, ' + (why ? '다음 겹에서 막혔습니다: ' + why : '다른 방어가 없었습니다.');
      const last = stopAt === -1 ? st.length - 1 : stopAt;
      let i = 0;
      const tick = () => {
        if (i > last) { clearInterval(timer); finish(); return; }
        st[i].classList.add(i === stopAt ? 'stop' : 'hit'); i++;
      };
      const finish = () => { $('injNote').innerHTML = stopAt === -1 ? '<b style="color:var(--bad)">유출.</b> 심어 둔 한 문장이 워커 → 리드 → 행동까지 이어졌습니다. 방어를 하나씩 켜 보세요.' : why; };
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { while (i <= last) tick(); finish(); return; }
      tick(); timer = setInterval(tick, 450);
    }
    $('injRun').addEventListener('click', sim);
  }
})();
