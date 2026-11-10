// 7주 1차시 전용: 정답 막대, 좋은 데이터 질문 조립기, 답할 수 있는 질문 카드, 9월 미니 표 검증
// 숫자는 모두 genai-practice/materials/sales_2026.csv 를 pandas로 직접 계산한 값
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);
  const won = (v) => v.toLocaleString('ko-KR');
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };

  // 1~9월 채널별 합계 (135행)
  const CH = ['오픈마켓', '자사몰', '오프라인 매장'];
  const TOT = {
    '오픈마켓': { revenue: 165957900, ad: 66657472, units: 14841, returns: 411 },
    '자사몰': { revenue: 115302400, ad: 41445687, units: 10287, returns: 127 },
    '오프라인 매장': { revenue: 75180200, ad: 6958987, units: 6667, returns: 20 },
  };
  const roas = (c) => TOT[c].revenue / TOT[c].ad;
  const retr = (c) => TOT[c].returns / TOT[c].units * 100;

  /* ───────── 1) 정답 확인용 막대 ───────── */
  function bars(gid, vals, fmt, hiIdx) {
    const g = $(gid); if (!g) return;
    const max = Math.max(...vals.map((v) => v[1]));
    vals.forEach(([name, v], i) => {
      const y = 8 + i * 46;
      el('text', { x: 0, y: y + 21, class: 't-sub', style: 'font-size:14px;font-weight:700;fill:var(--text)' }, g).textContent = name;
      const w = Math.max(4, v / max * 170);
      el('rect', { x: 92, y: y + 4, width: w, height: 26, rx: 6, fill: i === hiIdx ? 'var(--accent-2)' : 'var(--accent)', opacity: i === hiIdx ? 1 : 0.75 }, g);
      el('text', { x: 98 + w, y: y + 22, class: 't-sub', style: 'font-size:13.5px;font-weight:800;fill:var(--text)' }, g).textContent = fmt(v);
    });
  }
  bars('ans-rev', CH.map((c) => [c, TOT[c].revenue]), (v) => (v / 1e8).toFixed(2) + '억', 0);
  bars('ans-roas', CH.map((c) => [c, roas(c)]), (v) => v.toFixed(2) + '원', 0);
  bars('ans-ret', CH.map((c) => [c, retr(c)]), (v) => v.toFixed(2) + '%', 0);

  /* ───────── 2) 좋은 데이터 질문 조립기 ───────── */
  (function builder() {
    const pre = $('qb-pre'); if (!pre) return;
    const T = {
      rev: {
        base: '어느 채널이 제일 잘 팔려?',
        calc: '채널(channel)별로 매출(revenue 열)의 합계를 구해 줘.',
        vague: '오픈마켓이 가장 잘 팔리는 것 같습니다. 판매량도 많고 여러 제품이 고르게 팔립니다. 전반적으로 실적이 좋은 편입니다.',
        vagueNote: '“잘 팔린다”가 판매량인지 매출인지 정하지 않아, AI가 기준을 스스로 골랐습니다. 숫자도 없습니다.',
        unit: '매출', val: (c) => won(TOT[c].revenue) + '원',
        how: '계산: channel별로 revenue 열을 더함 (채널마다 45행)',
      },
      roas: {
        base: '광고 효과가 좋은 채널은?',
        calc: '채널별로 revenue 합계를 ad_spend 합계로 나눈 값(광고비 1원당 매출)을 구해 줘.',
        vague: '자사몰의 광고 효과가 좋아 보입니다. 월별 매출이 꾸준히 늘고 있기 때문입니다.',
        vagueNote: '“광고 효과”를 AI가 마음대로 해석했습니다. 실제로 광고비 1원당 매출이 가장 높은 곳은 오프라인 매장입니다.',
        unit: '광고비 1원당 매출', val: (c) => roas(c).toFixed(2) + '원',
        how: (c) => `${c}: ${won(TOT[c].revenue)} ÷ ${won(TOT[c].ad)}`,
      },
      ret: {
        base: '반품이 많은 채널은?',
        calc: '채널별로 returns 합계를 units 합계로 나누고 100을 곱한 반품률(%)을 구해 줘.',
        vague: '오픈마켓의 반품이 411건으로 가장 많습니다.',
        vagueNote: '반품 “건수”만 답했습니다. 많이 판 채널은 반품 건수도 많기 마련이라, 비교하려면 반품률이 필요합니다.',
        unit: '반품률', val: (c) => retr(c).toFixed(2) + '%',
        how: (c) => `${c}: ${TOT[c].returns} ÷ ${won(TOT[c].units)} × 100`,
      },
    };
    const ADD = {
      scope: '첨부한 sales_2026.csv의 2026년 1~9월 전체(135행)를 기준으로, ',
      show: ' 어떤 열을 썼는지와 계산 과정(중간 합계)도 함께 보여 줘.',
      fmt: ' 결과는 채널별 표로, 값이 큰 순서대로 정리해 줘.',
    };
    const st = { scope: false, calc: false, show: false, fmt: false };
    let topic = 'rev';
    const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    function render() {
      const t = T[topic];
      let h = '';
      if (st.scope) h += '<span class="add">' + esc(ADD.scope) + '</span>';
      h += st.calc ? '<span class="add">' + esc(t.calc) + '</span>' : esc(t.base);
      if (st.show) h += '<span class="add">' + esc(ADD.show) + '</span>';
      if (st.fmt) h += '<span class="add">' + esc(ADD.fmt) + '</span>';
      pre.innerHTML = h;

      const order = CH.slice().sort((a, b) => parseFloat(t.val(b).replace(/,/g, '')) - parseFloat(t.val(a).replace(/,/g, '')));
      let a = '';
      if (!st.calc) {
        a = esc(t.vague) + '\n\n<span style="color:var(--bad);font-weight:700">→ ' + esc(t.vagueNote) + '</span>';
      } else {
        if (st.scope) a += '기준: 2026-01 ~ 2026-09, 135행 전체\n';
        const fn = typeof t.how === 'function';
        if (st.show && !(st.fmt && fn)) {
          if (!fn) a += t.how + '\n';
          else a += '계산\n' + order.map((c) => '· ' + t.how(c)).join('\n') + '\n';
        }
        if (st.fmt) {
          const hc = st.show && fn;
          a += '<table><tr><th>채널</th>' + (hc ? '<th>계산</th>' : '') + '<th>' + t.unit + '</th></tr>' + order.map((c) => `<tr><td>${c}</td>` + (hc ? `<td>${t.how(c).split(': ')[1]}</td>` : '') + `<td style="text-align:right">${t.val(c)}</td></tr>`).join('') + '</table>';
        } else {
          a += CH.map((c) => `${c} ${t.val(c)}`).join(', ') + '입니다.';
        }
      }
      $('qb-ans').innerHTML = a.replace(/\n(?=<table)/, '');
      const n = Object.values(st).filter(Boolean).length;
      $('qb-n').textContent = n + ' / 4';
      $('qb-bar').style.width = n * 25 + '%';
      const s = $('qb-st');
      if (!st.calc) { s.className = 'status bad'; s.innerHTML = '<b class="k">계산 기준이 없음</b>무엇을 어떻게 계산할지 AI가 스스로 정합니다. <strong>②번</strong>이 가장 중요합니다.'; }
      else if (n < 4) { s.className = 'status mid'; s.innerHTML = '<b class="k">숫자는 나왔다</b>' + (!st.show ? '계산 과정이 없으면 <strong>검증할 단서</strong>가 없습니다.' : !st.scope ? '전체 행을 다 썼는지 확인하려면 범위를 밝히세요.' : '형식을 정하면 비교·보고가 쉬워집니다.'); }
      else { s.className = 'status ok'; s.innerHTML = '<b class="k">좋은 데이터 질문</b>범위·기준·과정·형식이 모두 들어 있어 <strong>답을 바로 검증</strong>할 수 있습니다.'; }
    }
    document.querySelectorAll('#qb-topic button').forEach((b) => b.addEventListener('click', () => {
      topic = b.dataset.t;
      document.querySelectorAll('#qb-topic button').forEach((x) => x.setAttribute('aria-pressed', x === b));
      render();
    }));
    document.querySelectorAll('.tgl[data-k]').forEach((b) => b.addEventListener('click', () => { st[b.dataset.k] = toggle(b); render(); }));
    render();
  })();

  /* ───────── 3) 이 표로 답할 수 있을까? ───────── */
  (function qcards() {
    const wrap = $('qcards'); if (!wrap) return;
    const items = [
      { ic: 'chart', n: '9월에 매출이 가장 큰 채널은?', k: 'yes', v: '답할 수 있음', a: 'month·channel·revenue 열로 계산할 수 있다. (답: 오픈마켓)' },
      { ic: 'chat', n: '고객이 반품한 이유는?', k: 'no', v: '답할 수 없음', a: '반품 “수”만 있고 사유 열이 없다. AI가 이유를 지어낼 수 있다.' },
      { ic: 'sparkles', n: '선물 세트가 가장 많이 팔린 달은?', k: 'yes', v: '답할 수 있음', a: 'product·month·units 열로 계산. (답: 9월 332개)' },
      { ic: 'clock', n: '10월 매출은 얼마였나?', k: 'no', v: '답할 수 없음', a: '1~9월 기록뿐이다. AI가 말하는 10월 값은 기록이 아니라 짐작이다.' },
      { ic: 'trend', n: '오픈마켓 광고비를 줄이면 매출도 줄까?', k: 'mid', v: '주의', a: '함께 움직였는지는 볼 수 있지만, 원인과 결과는 이 표만으로 단정할 수 없다.' },
      { ic: 'user', n: '20~30대 고객이 많이 산 제품은?', k: 'no', v: '답할 수 없음', a: '나이 정보가 없다. 고민 ③(신규 고객)에는 다른 데이터가 필요하다.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="ic-badge ${it.k === 'yes' ? '' : 'o'}"><svg class="ic"><use href="#i-${it.ic}"/></svg></span><span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('qc-score').textContent = opened + ' / ' + items.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 4) 9월 미니 표 검증 ───────── */
  (function verify() {
    const tab = $('vt'); if (!tab) return;
    // 2026-09 15행: 제품, 채널, units, revenue, ad_spend, returns
    const R = [
      ['오리지널 그래놀라', '자사몰', 437, 4282600, 817132, 5],
      ['오리지널 그래놀라', '오픈마켓', 563, 5517400, 1229854, 14],
      ['오리지널 그래놀라', '오프라인 매장', 288, 2822400, 94160, 1],
      ['다크초코 그래놀라', '자사몰', 267, 3150600, 717575, 3],
      ['다크초코 그래놀라', '오픈마켓', 362, 4271600, 1446561, 11],
      ['다크초코 그래놀라', '오프라인 매장', 159, 1876200, 159467, 0],
      ['무가당 견과 믹스', '자사몰', 184, 2484000, 1159263, 3],
      ['무가당 견과 믹스', '오픈마켓', 239, 3226500, 1275589, 8],
      ['무가당 견과 믹스', '오프라인 매장', 115, 1552500, 45992, 0],
      ['미역귀 현미칩', '자사몰', 328, 2132000, 1098288, 4],
      ['미역귀 현미칩', '오픈마켓', 339, 2203500, 1559960, 10],
      ['미역귀 현미칩', '오프라인 매장', 170, 1105000, 133312, 0],
      ['선물 세트', '자사몰', 121, 3872000, 865690, 1],
      ['선물 세트', '오픈마켓', 137, 4384000, 1443107, 4],
      ['선물 세트', '오프라인 매장', 74, 2368000, 251491, 0],
    ];
    const COLS = [['units', 2], ['revenue', 3], ['ad_spend', 4], ['returns', 5]];
    let filter = '전체', sel = -1, sorted = false;
    const fbar = $('vt-f');
    ['전체', '자사몰', '오픈마켓', '오프라인 매장'].forEach((f) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = f;
      b.setAttribute('aria-pressed', f === filter);
      b.addEventListener('click', () => { filter = f; fbar.querySelectorAll('button[data-f]').forEach((x) => x.setAttribute('aria-pressed', x === b)); render(); });
      b.dataset.f = f; fbar.appendChild(b);
    });
    const sortB = document.createElement('button'); sortB.type = 'button'; sortB.style.marginLeft = 'auto';
    sortB.textContent = '선택한 열 ↓ 정렬'; sortB.setAttribute('aria-pressed', 'false');
    sortB.addEventListener('click', () => { if (sel < 0) { $('vt-msg').innerHTML = '먼저 <strong>열 이름</strong>을 눌러 정렬할 열을 고르세요.'; return; } sorted = !sorted; sortB.setAttribute('aria-pressed', sorted); render(); });
    fbar.appendChild(sortB);

    function render() {
      let rows = R.map((r, i) => ({ r, i }));
      if (sorted && sel >= 0) rows = rows.slice().sort((a, b) => b.r[COLS[sel][1]] - a.r[COLS[sel][1]]);
      let h = '<thead><tr><th>product</th><th>channel</th>' + COLS.map((c, j) => `<th class="col${j === sel ? ' sel' : ''}" data-j="${j}" tabindex="0" role="button">${c[0]}</th>`).join('') + '</tr></thead><tbody>';
      rows.forEach(({ r }) => {
        const vis = filter === '전체' || r[1] === filter;
        h += `<tr class="${vis ? '' : 'off'}"><td>${r[0]}</td><td>${r[1]}</td>` + COLS.map((c, j) => `<td class="n${j === sel ? ' sel' : ''}">${won(r[c[1]])}</td>`).join('') + '</tr>';
      });
      tab.innerHTML = h + '</tbody>';
      tab.querySelectorAll('th.col').forEach((th) => {
        const pick = () => { const j = +th.dataset.j; sel = sel === j ? -1 : j; if (sel < 0) { sorted = false; sortB.setAttribute('aria-pressed', 'false'); } render(); };
        th.addEventListener('click', pick);
        th.addEventListener('keydown', (e) => { if (e.key === 'Enter') pick(); });
      });
      const vis = R.filter((r) => filter === '전체' || r[1] === filter);
      const sb = $('vt-sum');
      if (sel < 0) sb.innerHTML = `<span>보이는 행 <b>${vis.length}</b>개 · 열 이름(숫자 열)을 눌러 선택해 보세요</span>`;
      else {
        const s = vis.reduce((t, r) => t + r[COLS[sel][1]], 0);
        sb.innerHTML = `<span>선택: <b>${COLS[sel][0]}</b> · ${filter} ${vis.length}행</span><span>합계 <b>${won(s)}</b></span>`;
      }
    }
    render();

    const CL = [
      { t: '9월 매출이 가장 큰 채널은 오픈마켓으로, 19,603,000원입니다.', ok: true, fb: '실제: 맞음 — 오픈마켓 19,603,000 > 자사몰 15,921,200 > 오프라인 9,724,100' },
      { t: '9월 자사몰 매출 합계는 4,657,948원입니다.', ok: false, fb: '실제: 틀림 — 4,657,948은 자사몰 <b>ad_spend(광고비)</b> 합계. 매출은 15,921,200원' },
      { t: '9월 오픈마켓 반품은 47건, 판매량 1,640개로 반품률은 약 2.9%입니다.', ok: true, fb: '실제: 맞음 — 47 ÷ 1,640 × 100 ≈ 2.87%' },
    ];
    let done = 0, right = 0;
    const box = $('claims');
    CL.forEach((c, i) => {
      const d = document.createElement('div'); d.className = 'claim';
      d.innerHTML = `<div><b style="color:var(--accent)">${i + 1}.</b> ${c.t}</div><div class="cb"><button type="button" data-a="1">맞음</button><button type="button" data-a="0">틀림</button></div><div class="fb">${c.fb}</div>`;
      d.querySelectorAll('.cb button').forEach((b) => b.addEventListener('click', () => {
        const guess = b.dataset.a === '1';
        d.querySelectorAll('.cb button').forEach((x) => (x.disabled = true));
        d.classList.add('done', c.ok ? 'right' : 'wrongc');
        d.querySelector('.fb').innerHTML = `<b>내 판정: ${guess ? '맞음' : '틀림'} ${guess === c.ok ? '✓' : '✗'}</b> · ` + c.fb;
        done++; if (guess === c.ok) right++;
        $('vt-msg').innerHTML = done < 3 ? `판정 ${done}/3 — 나머지도 표에서 직접 확인해 보세요.`
          : `<strong>${right}/3</strong> 바르게 판정. 2번은 <strong>열을 잘못 읽은</strong> 답 — 숫자만 봐서는 그럴듯해 보입니다.`;
      }));
      box.appendChild(d);
    });
  })();
})();
