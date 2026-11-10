// 4주 1차시 전용: 프롬프트 조립기, 무엇이 빠졌을까 카드, 대화로 다듬기
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
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // slides.js 와 같은 규칙으로 파이썬 코드 색 입히기 (화면에서 코드가 바뀌는 데모용)
  function hl(src) {
    const KW = /^(import|from|as|def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|print|class|with|try|except|lambda|pass|break|continue|range|len)$/;
    const re = /(#[^\n]*)|("""[\s\S]*?"""|'[^'\n]*'|"[^"\n]*"|f'[^'\n]*'|f"[^"\n]*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_가-힣][A-Za-z0-9_가-힣]*)(?=\s*\()|([A-Za-z_][A-Za-z0-9_]*)/g;
    let out = '', i = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(i, m.index));
      if (m[1]) out += '<span class="c">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="s">' + esc(m[2]) + '</span>';
      else if (m[3]) out += '<span class="n">' + m[3] + '</span>';
      else if (m[4]) out += (KW.test(m[4]) ? '<span class="k">' : '<span class="f">') + esc(m[4]) + '</span>';
      else out += KW.test(m[5]) ? '<span class="k">' + m[5] + '</span>' : m[5];
      i = re.lastIndex;
    }
    return out + esc(src.slice(i));
  }
  // lines: [{t: 코드 한 줄, nw: 새로 바뀐 줄인가}]
  const code = (lines) => lines.map((l) => (l.nw ? '<span class="newline">' + hl(l.t) + '</span>' : hl(l.t))).join('\n');

  /* ───────── 1) 프롬프트 조립기 ───────── */
  (function builder() {
    const box = $('pb-prompt'); if (!box) return;
    const on = { goal: false, data: false, cond: false, out: false };
    const P = {
      vague: '불량 분석 코드 짜 줘.',
      goal: '목표: 주간·야간 근무조별 불량률을 비교하고 싶어.',
      data: "데이터: process.csv (DATA + 'process.csv'로 읽음). shift = 근무조(글자, 주간/야간), defect = 불량 여부(정수 0/1, 1이 불량).",
      cond: '조건: pandas만 쓰고, 파이썬 초보자용으로 줄마다 한국어 주석을 달아 줘.',
      out: '출력: 근무조별 불량률을 %로, 소수 첫째 자리까지 표로 보여 줘.',
    };
    const ISSUE = {
      goal: '<b>목표</b> 없음 → 요약 통계만 출력',
      data: '<b>데이터 설명</b> 없음 → 파일·열 이름을 지어냄',
      cond: '<b>조건</b> 없음 → 주석 없음, 낯선 seaborn',
      out: '<b>출력 형식</b> 없음 → 0.203187 그대로',
    };
    function gen() {
      const L = ['import pandas as pd'];
      if (!on.cond) L.push('import seaborn as sns');
      if (on.cond) L.push('# 데이터 불러오기');
      L.push(on.data ? "df = pd.read_csv(DATA + 'process.csv')" : "df = pd.read_csv('data.csv')");
      const G = on.data ? 'shift' : '근무조', D = on.data ? 'defect' : '불량여부';
      if (on.goal) {
        if (on.cond) L.push(`# 근무조(${G})별 불량률 = ${D}(0/1)의 평균`);
        if (on.out) {
          L.push(`rate = df.groupby('${G}')['${D}'].mean() * 100`);
          if (on.cond) L.push('# 비율 × 100 → %, 소수 첫째 자리까지');
          L.push('print(rate.round(1))');
        } else {
          L.push(`rate = df.groupby('${G}')['${D}'].mean()`);
          L.push('print(rate)');
        }
        if (!on.cond) L.push('sns.barplot(x=rate.index, y=rate.values)');
      } else {
        if (on.cond) L.push('# 숫자 열의 요약 통계 출력');
        L.push(on.out ? 'print(df.describe().round(1))' : 'print(df.describe())');
        if (!on.cond) L.push('sns.pairplot(df)');
      }
      return L;
    }
    function render() {
      let h = '<div class="who"><svg class="ic"><use href="#i-user"/></svg> 내 프롬프트</div>';
      h += on.goal ? `<span class="pp c-goal">${P.goal}</span>` : `<span class="pp vague">${P.vague}</span>`;
      ['data', 'cond', 'out'].forEach((k) => { if (on[k]) h += `<span class="pp c-${k}">${P[k]}</span>`; });
      box.innerHTML = h;
      $('pb-code').innerHTML = hl(gen().join('\n'));
      const n = Object.values(on).filter(Boolean).length;
      $('pb-n').textContent = n + ' / 4';
      $('pb-segs').querySelectorAll('i').forEach((s, i) => s.classList.toggle('on', i < n));
      const run = $('pb-run');
      if (!on.data) {
        run.className = 'chip bad';
        run.innerHTML = '<svg class="ic"><use href="#i-x"/></svg> 실행하면 FileNotFoundError <span>— \'data.csv\'는 없는 파일' + (on.goal ? ', \'근무조\'·\'불량여부\'도 없는 열' : '') + '</span>';
      } else if (!on.goal) {
        run.className = 'chip mid';
        run.innerHTML = '<svg class="ic"><use href="#i-alert"/></svg> 실행은 됨 <span>— 하지만 숫자 열 요약 통계뿐, 주간·야간 비교는 없다</span>';
      } else if (!on.out) {
        run.className = 'chip mid';
        run.innerHTML = '<svg class="ic"><use href="#i-alert"/></svg> 실행은 됨 <span>— 야간 0.203187 · 주간 0.069959 (비율 그대로)</span>';
      } else {
        run.className = 'chip ok';
        run.innerHTML = '<svg class="ic"><use href="#i-check"/></svg> 실행됨 <span>— 야간 20.3 · 주간 7.0 (%)' + (on.cond ? '' : ' + 처음 보는 seaborn 그래프') + '</span>';
      }
      const st = $('pb-st');
      const miss = Object.keys(on).filter((k) => !on[k]);
      if (!miss.length) {
        st.className = 'status ok';
        st.innerHTML = '<b class="k">추측할 빈칸이 없다</b>주석까지 달린 코드가 바로 실행됩니다. 이제 <strong>결과가 말이 되는지</strong>만 확인하면 됩니다.';
      } else {
        st.className = 'status ' + (miss.length >= 3 ? 'bad' : 'mid');
        st.innerHTML = `<b class="k">AI가 추측한 곳 ${miss.length}군데</b><ul>` + miss.map((k) => '<li>' + ISSUE[k] + '</li>').join('') + '</ul>';
      }
    }
    document.querySelectorAll('.tgl[data-k]').forEach((b) => b.addEventListener('click', () => { on[b.dataset.k] = toggle(b); render(); }));
    render();
  })();

  /* ───────── 2) 무엇이 빠졌을까? 카드 ───────── */
  (function cards() {
    const wrap = $('pcards'); if (!wrap) return;
    const items = [
      { n: '그래프 그려 줘.', k: 'yes', v: '목표·데이터·출력 형식 모두 빠짐', a: '무엇의 그래프인지, 어떤 열을 쓰는지, 어떤 모양인지 AI가 전부 추측해야 한다.' },
      { n: '1~3라인별 평균 인장강도를 비교하고 싶어. pandas만 쓰고 주석을 달아 줘. 결과는 소수 둘째 자리 표로.', k: 'yes', v: '데이터 설명 빠짐', a: '파일 이름과 line·strength 같은 열 이름이 없다 → AI가 열 이름을 지어낸다.' },
      { n: 'process.csv의 temp(실수, ℃)와 strength(실수, MPa) 열로 코드 짜 줘. 주석도 달아 줘.', k: 'yes', v: '목표 빠짐', a: '두 열로 무엇을 알고 싶은지(평균? 관계? 그래프?)가 없다.' },
      { n: 'process.csv의 machine 열(글자, 1호기~6호기)과 defect 열(정수 0/1)로 설비별 불량률을 구해 줘.', k: 'mid', v: '조건·출력 형식 빠짐', a: '실행은 되겠지만 어떤 도구를 쓸지, 결과를 어떤 모양으로 보여 줄지는 AI 마음대로.' },
      { n: 'process.csv에서 주간·야간(shift 열, 글자)별 평균 습도(humidity 열, 실수 %)를 비교하고 싶어. pandas만, 초보자용 주석. 결과는 소수 첫째 자리 표로.', k: 'no', v: '네 요소 모두 있음', a: '목표·데이터 설명·조건·출력 형식이 다 들어 있다. 이대로 요청하면 된다.' },
      { n: '파일 올릴게. 데이터 분석 과제 대신 다 해 줘.', k: 'yes', v: '목표 없음 + 주의', a: '무엇을 분석할지 없고, 통째로 맡기면 배울 수 없다. 올리기 전에 개인정보·기밀이 없는지 먼저 확인(1-3).' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('pc-score').textContent = opened + ' / ' + items.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 3) 대화로 다듬기 ───────── */
  (function iterate() {
    const pre = $('it-code'); if (!pre) return;
    const S = { line: false, plot: false, explain: false, ran: false, last: null };
    // process.csv 로 직접 계산한 값 (python3 · pandas)
    const SHIFT = [['야간', 20.3], ['주간', 7.0]];
    const LINE = [['1라인', 17.8, 9.3], ['2라인', 20.5, 7.4], ['3라인', 23.1, 4.6]];
    function lines() {
      const L = [{ t: 'import pandas as pd' }];
      if (S.plot) L.push({ t: 'import matplotlib.pyplot as plt', nw: S.last === 'plot' });
      L.push({ t: "df = pd.read_csv(DATA + 'process.csv')" });
      const nl = S.last === 'line';
      L.push({ t: S.line ? '# 라인·근무조별 불량률(%)' : '# 근무조별 불량률(%)', nw: nl });
      L.push({ t: S.line ? "rate = df.groupby(['line', 'shift'])['defect'].mean().unstack() * 100" : "rate = df.groupby('shift')['defect'].mean() * 100", nw: nl });
      L.push({ t: 'print(rate.round(1))' });
      if (S.plot) {
        const np = S.last === 'plot';
        ['# 막대그래프', "rate.plot(kind='bar')", "plt.ylabel('불량률 (%)')", 'plt.show()'].forEach((t) => L.push({ t, nw: np }));
      }
      return L;
    }
    function table() {
      if (S.line) return 'shift    야간   주간\nline\n' + LINE.map((r) => `${r[0]}    ${r[1].toFixed(1)}   ${r[2].toFixed(1)}`).join('\n');
      return 'shift\n' + SHIFT.map((r) => `${r[0]}    ${r[1].toFixed(1).padStart(4)}`).join('\n') + '\nName: defect, dtype: float64';
    }
    function chart(wrap) {
      const svg = el('svg', { viewBox: '0 0 420 186', style: 'width:100%;height:100%' }, wrap);
      const L = 46, R = 410, T = 14, B = 162, Y = (v) => B - v / 25 * (B - T);
      [0, 5, 10, 15, 20, 25].forEach((v) => {
        el('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), class: 'p-grid' }, svg);
        el('text', { x: L - 6, y: Y(v) + 4, 'text-anchor': 'end', class: 'p-tick', style: 'font-size:11px' }, svg).textContent = v;
      });
      el('text', { x: 12, y: (T + B) / 2, 'text-anchor': 'middle', class: 'p-tick', transform: `rotate(-90 12 ${(T + B) / 2})`, style: 'font-size:11px' }, svg).textContent = '불량률 (%)';
      const groups = S.line ? LINE.map((r) => [r[0], [r[1], r[2]]]) : SHIFT.map((r) => [r[0], [r[1]]]);
      const gw = (R - L) / groups.length;
      groups.forEach(([name, vals], gi) => {
        const bw = S.line ? 30 : 56, x0 = L + gi * gw + gw / 2 - (vals.length * bw) / 2;
        vals.forEach((v, k) => {
          el('rect', { x: x0 + k * bw + 2, y: Y(v), width: bw - 4, height: B - Y(v), fill: k ? 'var(--accent-2)' : 'var(--accent)' }, svg);
        });
        el('text', { x: L + gi * gw + gw / 2, y: B + 16, 'text-anchor': 'middle', class: 'p-tick', style: 'font-size:12px' }, svg).textContent = name;
      });
      if (S.line) {
        [['야간', 'var(--accent)'], ['주간', 'var(--accent-2)']].forEach(([t, c], i) => {
          el('rect', { x: L + 10, y: T + 2 + i * 18, width: 12, height: 12, fill: c }, svg);
          el('text', { x: L + 28, y: T + 12 + i * 18, class: 'p-tick', style: 'font-size:12px' }, svg).textContent = t;
        });
      }
    }
    function render() {
      pre.innerHTML = code(lines());
      const out = $('it-out'); out.innerHTML = '';
      $('it-cell').classList.toggle('ran', S.ran);
      $('it-cap').textContent = S.ran ? '실행 완료 · 아래가 실행 결과' : S.last ? 'AI가 고친 코드 · 다시 실행해 보세요 (바뀐 줄 강조)' : 'AI가 준 코드 · 아직 실행 전';
      if (!S.ran) return;
      out.style.cssText = 'display:grid;gap:10px;min-height:0;margin-top:8px;grid-template-columns:' + (S.plot ? 'auto 1fr' : '1fr');
      const p = document.createElement('pre'); p.className = 'out sm'; p.textContent = table(); out.appendChild(p);
      if (S.plot) { const w = document.createElement('div'); w.style.cssText = 'min-height:0;height:150px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:4px'; out.appendChild(w); chart(w); }
    }
    function say() {
      const m = $('it-msg');
      if (S.explain) {
        m.className = 'ai-say';
        m.innerHTML = '<div class="ai-who"><svg class="ic"><use href="#i-sparkles"/></svg> AI의 해석 (예시)</div>' + (S.line
          ? '세 라인 모두 <b>야간</b> 불량률이 더 높고, 차이는 <b>3라인</b>에서 가장 큽니다(23.1% vs 4.6%). 단, 야간엔 온도·습도도 달라 <b>원인이라 단정할 수는 없습니다.</b>'
          : '야간(20.3%)이 주간(7.0%)의 <b>약 3배</b>입니다. 단, 야간엔 온도·습도도 달라 <b>야간 근무가 원인이라 단정할 수는 없습니다.</b>')
          + '<div class="muted" style="font-size:14px;margin-top:2px">→ 숫자가 실행 결과와 같은지 <b>직접 대조</b>하세요.</div>';
        return;
      }
      m.className = 'callout b';
      if (!S.ran && !S.last) m.innerHTML = '먼저 <strong>셀 실행</strong>을 눌러 결과를 보세요.';
      else if (!S.ran) m.innerHTML = 'AI가 코드를 고쳤습니다. <strong>바뀐 줄</strong>을 읽어 보고 다시 실행하세요.';
      else if (!S.line || !S.plot) m.innerHTML = '결과가 나왔습니다. 오른쪽 요청을 <strong>하나씩</strong> 눌러 코드를 다듬어 보세요.';
      else m.innerHTML = '요청 두 번으로 표와 그래프가 완성됐습니다. 이제 <strong>“결과를 해석해 줘”</strong>를 눌러 보세요.';
    }
    $('it-run').addEventListener('click', () => { S.ran = true; render(); say(); });
    document.querySelectorAll('.reqbtn').forEach((b) => b.addEventListener('click', () => {
      if (b.getAttribute('aria-pressed') === 'true') return;
      b.setAttribute('aria-pressed', 'true');
      const r = b.dataset.r;
      if (r === 'explain') { S.explain = true; say(); return; }
      S[r] = true; S.last = r; S.ran = false; S.explain = false;
      document.querySelector('.reqbtn[data-r="explain"]').setAttribute('aria-pressed', 'false');
      render(); say();
    }));
    $('it-reset').addEventListener('click', () => {
      Object.assign(S, { line: false, plot: false, explain: false, ran: false, last: null });
      document.querySelectorAll('.reqbtn').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      render(); say();
    });
    render(); say();
  })();
})();
