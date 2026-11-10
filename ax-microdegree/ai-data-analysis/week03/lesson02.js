// 3주 2차시 전용: 변수 상자 따라가기, 자료형 맞히기, 리스트 인덱스·슬라이싱
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // slides.js 와 같은 규칙으로 한 줄 색 입히기 (동적으로 그리는 코드용)
  const KW = /^(import|from|as|def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|print|class|with|try|except|lambda|pass|break|continue|range|len)$/;
  function hl(src) {
    const re = /(#[^\n]*)|('[^'\n]*'|"[^"\n]*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)(?=\s*\()|([A-Za-z_][A-Za-z0-9_]*)/g;
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

  /* ───────── 1) 변수 상자 따라가기 ───────── */
  (function boxes() {
    const code = $('v-code'); if (!code) return;
    const L = [
      { src: 'temp = 211.5', cm: '# 3호기 온도', k: 'temp', v: '211.5', ty: 'float', msg: '새 상자 <strong>temp</strong>를 만들고 <strong>211.5</strong>를 넣었습니다. 소수점이 있으니 <strong>float</strong>.' },
      { src: 'count = 120', cm: '# 생산 개수', k: 'count', v: '120', ty: 'int', msg: '새 상자 <strong>count</strong>에 정수 <strong>120</strong>(int).' },
      { src: 'temp = temp + 3', cm: '# 3도 상승', k: 'temp', v: '214.5', ty: 'float', msg: '<strong>오른쪽 먼저</strong>: temp + 3 = 211.5 + 3 = <strong>214.5</strong> → 그 값을 temp 상자에 다시 넣습니다. 이전 값 211.5는 <strong>사라집니다.</strong>' },
      { src: "name = '3호기'", cm: '', k: 'name', v: "'3호기'", ty: 'str', msg: '따옴표 안의 글자 → <strong>문자열(str)</strong> 상자.' },
      { src: 'count = count - 7', cm: '# 불량 7개', k: 'count', v: '113', ty: 'int', msg: '120 - 7 = <strong>113</strong> → count를 <strong>덮어씁니다.</strong>' },
      { src: 'good = count', cm: '# 양품 수', k: 'good', v: '113', ty: 'int', msg: 'count 상자의 값 <strong>113</strong>을 꺼내 새 상자 <strong>good</strong>에 넣습니다. 이제 상자는 모두 4개.' },
    ];
    code.innerHTML = L.map((l, i) => `<span class="ln"><i class="no">${i + 1}</i>${hl(l.src + (l.cm ? '   ' + l.cm : ''))}</span>`).join('');
    const lines = code.querySelectorAll('.ln');
    const wrap = $('v-boxes'), step = $('v-step');
    let n = 0, mem = {};
    function render(changed, old) {
      const keys = Object.keys(mem);
      if (!keys.length) { wrap.innerHTML = '<div class="empty">(아직 빈 메모리)</div>'; return; }
      wrap.innerHTML = '';
      keys.forEach((k) => {
        const d = document.createElement('div');
        d.className = 'vbx' + (k === changed ? ' hit' : '');
        if (k !== changed) d.style.animation = 'none';
        d.innerHTML = `<span class="tag">${k}</span><span class="in">${k === changed && old ? `<span class="old">${esc(old)}</span>` : ''}<span class="val${k === changed ? ' new' : ''}">${esc(mem[k].v)}</span></span><span class="ty">${mem[k].ty}</span>`;
        wrap.appendChild(d);
      });
    }
    function reset() {
      n = 0; mem = {};
      lines.forEach((l) => l.classList.remove('cur', 'done'));
      step.disabled = false; render();
      $('v-n').textContent = '0 / ' + L.length;
      $('v-msg').innerHTML = '오른쪽은 <strong>런타임의 메모리</strong>입니다. <strong>한 줄 실행</strong>을 눌러 보세요.';
    }
    step.addEventListener('click', () => {
      if (n >= L.length) return;
      const l = L[n];
      lines.forEach((x, i) => { x.classList.toggle('cur', i === n); x.classList.toggle('done', i < n); });
      const old = mem[l.k] ? mem[l.k].v : null;
      mem[l.k] = { v: l.v, ty: l.ty };
      render(l.k, old);
      n++;
      $('v-n').textContent = n + ' / ' + L.length;
      $('v-msg').innerHTML = `<b>${n}번 줄</b> · ` + l.msg + (n === L.length ? ' <br><strong>끝!</strong> 같은 이름에 다시 넣으면 덮어쓰고, 새 이름이면 새 상자가 생깁니다.' : '');
      if (n >= L.length) step.disabled = true;
    });
    $('v-reset').addEventListener('click', reset);
    reset();
  })();

  /* ───────── 2) 자료형 맞히기 ───────── */
  (function types() {
    const wrap = $('tcards'); if (!wrap) return;
    const C = [
      { v: '120', t: 'int', ex: '소수점 없는 수 → 정수.' },
      { v: '211.5', t: 'float', ex: '소수점이 있는 수 → 실수.' },
      { v: "'3호기'", t: 'str', ex: '따옴표 안은 글자.' },
      { v: 'True', t: 'bool', ex: '참/거짓 두 값 중 하나. 첫 글자는 대문자.' },
      { v: "'120'", t: 'str', ex: '숫자처럼 보여도 <b>따옴표가 있으면 글자</b>! 계산이 안 된다.' },
      { v: '2.0', t: 'float', ex: '.0이라도 소수점이 있으면 float.' },
      { v: '120 / 12', t: 'float', ex: '나눗셈 결과는 늘 float → <code>10.0</code>' },
      { v: '120 > 100', t: 'bool', ex: '비교의 결과는 <code>True</code> → 3-3 조건문의 재료.' },
    ];
    let right = 0, done = 0;
    C.forEach((c) => {
      const d = document.createElement('div'); d.className = 'tcard';
      d.innerHTML = `<div class="v">${esc(c.v)}</div><div class="gs">${['int', 'float', 'str', 'bool'].map((t) => `<button type="button" data-t="${t}">${t}</button>`).join('')}</div><div class="vd"></div><div class="ex">${c.ex}<br><code>type(${esc(c.v)})</code> → <code>&lt;class '${c.t}'&gt;</code></div>`;
      d.querySelectorAll('.gs button').forEach((b) => b.addEventListener('click', () => {
        const ok = b.dataset.t === c.t; done++; if (ok) right++;
        d.classList.add('done', ok ? 'right' : 'wrong');
        d.querySelector('.vd').textContent = (ok ? '정답! ' : '아쉬워요 — 정답은 ') + c.t;
        $('tc-score').textContent = `맞힌 개수 ${right} / ${C.length}` + (done === C.length ? (right === C.length ? ' — 모두 맞혔습니다!' : ' — 틀린 카드의 설명을 다시 읽어 보세요.') : '');
      }));
      wrap.appendChild(d);
    });
  })();

  /* ───────── 3) 리스트 인덱스·슬라이싱 ───────── */
  (function list() {
    const row = $('l-row'); if (!row) return;
    const BASE = ['210.9', '211.7', '210.0', '213.0', '211.7', '211.1'];
    let vals = BASE.slice(), mode = 'idx', fresh = -1;
    const si = $('l-i'), sa = $('l-a'), sb = $('l-b');
    function draw() {
      const n = vals.length;
      si.min = -(n + 1); si.max = n; sa.max = n; sb.max = n;
      const i = +si.value, a = +sa.value, b = +sb.value;
      $('l-i-o').textContent = i; $('l-a-o').textContent = a; $('l-b-o').textContent = b;
      $('l-len').textContent = n;
      let on = new Set(), codeTxt, out, err = false, msg;
      if (mode === 'idx') {
        codeTxt = `temps[${i}]`;
        if (i >= -n && i < n) {
          const p = i < 0 ? n + i : i; on.add(p); out = vals[p];
          msg = i >= 0 ? `${i}번 칸 = <strong>${p + 1}호기</strong>. 인덱스는 0부터 세므로 호기 번호보다 <strong>하나 작습니다.</strong>`
            : `음수는 <strong>뒤에서부터</strong>: [${i}] → 뒤에서 ${-i}번째 = <strong>${p + 1}호기</strong>.`;
        } else {
          err = true; out = 'IndexError: list index out of range';
          msg = `칸은 ${n}개뿐 — 인덱스는 <strong>0 ~ ${n - 1}</strong> (또는 -${n} ~ -1)까지만 있습니다.`;
        }
      } else {
        codeTxt = `temps[${a}:${b}]`;
        for (let k = a; k < b; k++) on.add(k);
        out = '[' + vals.slice(a, b).join(', ') + ']';
        msg = b <= a ? '시작 a가 끝 b보다 작아야 합니다. 아니면 <strong>빈 리스트 []</strong>가 됩니다.'
          : `${a}번부터 ${b}번 <strong>앞</strong>(${b - 1}번)까지 → <strong>${b - a}칸</strong>. 끝 번호 b는 포함하지 않습니다.`;
      }
      if (fresh >= 0) msg = '<strong>append(212.4)</strong>: 맨 뒤에 7호기 칸이 붙었습니다. len이 7이 되고, 마지막 인덱스는 6 (= -1).';
      let h = '<div class="rowlab"><span>설비</span><span style="height:64px"></span><span style="color:var(--accent)">인덱스</span><span style="color:var(--accent-2)">뒤에서</span></div>';
      vals.forEach((v, k) => {
        const cls = 'lc' + (on.has(k) ? ' on' : (on.size ? ' dim' : '')) + (k === fresh ? ' new' : '');
        h += `<div class="${cls}"><span class="mc">${k + 1}호기</span><span class="bx">${v}</span><span class="ix">${k}</span><span class="nx">${k - n}</span></div>`;
      });
      row.innerHTML = h;
      $('l-code').innerHTML = hl(codeTxt);
      const o = $('l-out'); o.textContent = out; o.className = 'out' + (err ? ' err' : '');
      $('l-msg').innerHTML = msg;
      fresh = -1;
    }
    document.querySelectorAll('#l-mode button').forEach((btn) => btn.addEventListener('click', () => {
      mode = btn.dataset.m;
      document.querySelectorAll('#l-mode button').forEach((x) => x.setAttribute('aria-pressed', x === btn));
      $('c-idx').style.display = mode === 'idx' ? '' : 'none';
      $('c-slc').style.display = mode === 'slc' ? 'grid' : 'none';
      draw();
    }));
    [si, sa, sb].forEach((s) => s.addEventListener('input', draw));
    $('l-app').addEventListener('click', () => {
      if (vals.length >= 7) { $('l-msg').innerHTML = '이 데모에서는 한 번만 추가합니다. ↺ 로 처음 리스트로 돌아갈 수 있습니다.'; return; }
      vals.push('212.4'); fresh = vals.length - 1; draw();
    });
    $('l-rst').addEventListener('click', () => {
      vals = BASE.slice();
      if (+si.value > 5) si.value = 5;
      if (+si.value < -7) si.value = -7;
      if (+sa.value > 6) sa.value = 6; if (+sb.value > 6) sb.value = 6;
      draw();
    });
    draw();
  })();
})();
