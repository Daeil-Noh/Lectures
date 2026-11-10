// 3주 1차시 전용: Colab 화면 둘러보기, 실행 순서 노트북, 데이터 파일 위치
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const icon = (name) => `<svg class="ic"><use href="#i-${name}"/></svg>`;

  /* ───────── 1) Colab 화면 둘러보기 ───────── */
  (function colabUI() {
    const svg = $('cui'); if (!svg) return;
    const H = [
      { k: 'menu', r: [8, 8, 340, 62], b: [360, 24], ic: 'log', h: '메뉴', d: '「파일」에서 Drive에 사본 저장, 「런타임」에서 모두 실행·세션 다시 시작을 합니다. 이 두 메뉴를 가장 자주 씁니다.', tip: '오늘 쓸 메뉴: 파일 · 런타임' },
      { k: 'add', r: [180, 79, 176, 38], b: [370, 98], ic: 'code', h: '+ 코드 / + 텍스트', d: '새 코드 셀이나 텍스트 셀을 추가합니다. 셀과 셀 사이에 마우스를 올려도 같은 버튼이 나타납니다.', tip: '셀 지우기: 셀을 고른 뒤 오른쪽 위 휴지통' },
      { k: 'conn', r: [532, 79, 158, 38], b: [518, 98], ic: 'cloud', h: '런타임 연결 상태', d: '✓ 표시는 Google의 컴퓨터(런타임)에 연결되었다는 뜻입니다. RAM·디스크는 빌려 쓰는 컴퓨터의 메모리와 저장 공간입니다.', tip: '첫 셀을 실행하면 자동으로 연결된다' },
      { k: 'files', r: [46, 120, 124, 64], b: [150, 202], ic: 'folder', h: '파일 패널 (📁)', d: '런타임에 있는 파일 목록입니다. 위쪽 업로드 버튼으로 내 컴퓨터의 파일을 올릴 수 있습니다. sample_data는 Colab이 기본으로 넣어 둔 예제 폴더입니다.', tip: '주의: 런타임이 끝나면 올린 파일은 사라진다' },
      { k: 'text', r: [184, 126, 506, 62], b: [672, 140], ic: 'text', h: '텍스트 셀', d: '설명·제목을 쓰는 셀입니다. 두 번 클릭하면 편집하고, Shift+Enter로 편집을 마칩니다.', tip: '실습 파일의 설명 글은 모두 텍스트 셀' },
      { k: 'code', r: [186, 198, 504, 54], b: [672, 214], ic: 'play', h: '코드 셀과 ▶ 버튼', d: '파이썬 코드를 쓰는 셀입니다. 왼쪽 ▶를 누르거나, 셀을 클릭하고 Shift+Enter를 누르면 실행됩니다.', tip: '코드를 고친 뒤 다시 실행할 수 있다' },
      { k: 'out', r: [186, 256, 504, 124], b: [672, 300], ic: 'check', h: '실행 결과와 [번호]', d: '결과는 셀 바로 아래에 나타납니다. 실행한 셀의 ▶ 자리에는 [1], [2]처럼 몇 번째로 실행했는지가 남습니다.', tip: '번호로 실행 순서를 알 수 있다 → 직접 해 보기 2' },
    ];
    const seen = new Set();
    const nodes = H.map((s, i) => {
      const g = el('g', { class: 'hot', tabindex: 0, role: 'button', 'aria-label': s.h }, svg);
      el('rect', { x: s.r[0], y: s.r[1], width: s.r[2], height: s.r[3], rx: 10, class: 'hl' }, g);
      const nb = el('g', { class: 'nb', transform: `translate(${s.b[0]} ${s.b[1]})` }, g);
      el('circle', { r: 12 }, nb);
      el('text', { y: 4.5, 'text-anchor': 'middle' }, nb).textContent = i + 1;
      const pick = () => {
        nodes.forEach((n) => n.classList.remove('on'));
        g.classList.add('on', 'seen'); seen.add(s.k);
        $('cu-ic').innerHTML = icon(s.ic);
        $('cu-ic').className = 'ic-badge' + (s.k === 'files' ? ' o' : '');
        $('cu-h').textContent = (i + 1) + '. ' + s.h;
        $('cu-d').textContent = s.d;
        $('cu-tip').textContent = s.tip;
        $('cu-n').textContent = seen.size + ' / ' + H.length + ' 확인' + (seen.size === H.length ? ' — 모두 확인했습니다!' : '');
      };
      g.addEventListener('click', pick);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(); } });
      return g;
    });
  })();

  /* ───────── 2) 실행 순서 노트북 ───────── */
  (function orderNB() {
    const nb = $('fnb'); if (!nb) return;
    const cells = Array.from(nb.querySelectorAll('.fcell'));
    const CIRC = ['①', '②', '③'];
    const ERR = "NameError: name 'temp' is not defined";
    let mem = null, n = 0, hist = [], adds = 0, restarted = false, busy = false;

    function setOut(i, text, err) {
      const o = cells[i].querySelector('.fout');
      o.textContent = text; o.className = 'fout' + (err ? ' err' : '');
      void o.offsetWidth; if (text) o.classList.add('pop');
    }
    function showVar() {
      const v = $('nb-var');
      v.innerHTML = mem === null ? '<span class="empty">(비어 있음) — 기억하는 변수가 없습니다</span>'
        : `<span class="nm">temp</span><span class="vv" style="animation:pop .3s ease">${mem}</span>`;
    }
    function showHist() { $('nb-hist').textContent = hist.length ? hist.slice(-9).map((i) => CIRC[i]).join(' → ') : (restarted ? '- (새 세션)' : '-'); }
    function flashCell(i) {
      cells.forEach((c) => c.classList.remove('now'));
      cells[i].classList.add('now');
      clearTimeout(flashCell.t); flashCell.t = setTimeout(() => cells[i].classList.remove('now'), 700);
    }
    function run(i, quiet) {
      n++; hist.push(i);
      cells[i].querySelector('.cnt').textContent = '[' + n + ']';
      flashCell(i);
      let msg = '';
      if (i === 0) {
        const had = mem !== null;
        mem = 211.5; adds = 0; setOut(0, '');
        msg = had ? '셀 ①을 다시 실행해 temp를 <strong>211.5로 덮어썼습니다.</strong>' : '셀 ①: 런타임이 <strong>temp = 211.5</strong>를 기억합니다. 출력할 것이 없어 결과 칸은 비어 있습니다.';
      } else if (mem === null) {
        setOut(i, ERR, true);
        msg = `셀 ${CIRC[i]}에서 <strong>NameError</strong>! 런타임에 아직 <strong>temp</strong>가 없습니다.` +
          (restarted ? ' 세션을 다시 시작해서 <strong>기억이 지워졌기</strong> 때문입니다.' : ' temp를 만드는 <strong>셀 ①을 먼저</strong> 실행해야 합니다.');
      } else if (i === 1) {
        mem += 5; adds++; setOut(1, '');
        msg = `temp가 <strong>${mem}</strong>이 되었습니다.` + (adds > 1 ? ` 셀 ②를 <strong>${adds}번</strong> 실행해 5가 ${adds}번 더해졌습니다.` : '');
      } else {
        setOut(2, String(mem));
        msg = adds === 0 ? '셀 ②를 건너뛰어 아직 <strong>211.5</strong>입니다.'
          : adds === 1 ? '211.5 + 5 = <strong>216.5</strong>. 이번엔 셀 ②를 <strong>한 번 더</strong> 누르고 ③을 눌러 보세요.'
          : `셀 ②를 ${adds}번 실행해 <strong>${mem}</strong>. 같은 코드도 <strong>실행 횟수와 순서</strong>에 따라 결과가 달라집니다. 이제 <strong>세션 다시 시작</strong>을 눌러 보세요.`;
      }
      showVar(); showHist();
      if (!quiet) $('nb-msg').innerHTML = msg;
    }
    function lock(on) { busy = on; nb.querySelectorAll('button').forEach((b) => (b.disabled = on)); }
    cells.forEach((c, i) => c.querySelector('.runb').addEventListener('click', () => { if (!busy) run(i); }));
    $('nb-restart').addEventListener('click', () => {
      if (busy) return;
      mem = null; n = 0; hist = []; adds = 0; restarted = true;
      cells.forEach((c) => c.classList.remove('now'));
      showVar(); showHist();
      $('nb-msg').innerHTML = '세션을 다시 시작했습니다. 화면의 결과는 남아 있지만 <strong>변수는 모두 지워졌습니다.</strong> 셀 ③만 눌러 보세요. 그다음 <strong>모두 실행</strong>!';
    });
    $('nb-all').addEventListener('click', async () => {
      if (busy) return; lock(true);
      $('nb-msg').innerHTML = '위에서 아래로 한 번씩 실행합니다…';
      for (let i = 0; i < 3; i++) { run(i, true); await wait(550); }
      $('nb-msg').innerHTML = '위에서 아래로 한 번씩 — 결과 <strong>216.5</strong>. 꼬였을 때는 <strong>세션 다시 시작 → 모두 실행</strong>이 가장 확실합니다.';
      lock(false);
    });
    showVar(); showHist();
  })();

  /* ───────── 3) 데이터 파일은 어디에 ───────── */
  (function dataWhere() {
    const rt = $('z-rt'); if (!rt) return;
    const out = $('d-out'), msg = $('d-msg'), st = $('rt-st');
    let uploaded = false, dayAfter = false, everUp = false, upChip = null;
    function connect() {
      if (!rt.classList.contains('off')) return;
      rt.classList.remove('off'); st.className = 'zst'; st.textContent = '● 새 런타임에 연결됨';
    }
    function flash(e) { e.classList.remove('flash'); void e.offsetWidth; e.classList.add('flash'); }
    function result(text, err) { out.textContent = text; out.className = 'out' + (err ? ' err' : ''); flash(out); }
    $('d-up').addEventListener('click', () => {
      connect();
      if (uploaded) { msg.innerHTML = '이미 런타임에 올라가 있습니다. <code>read_csv(\'process.csv\')</code>를 눌러 보세요.'; return; }
      upChip = document.createElement('span'); upChip.className = 'chip new'; upChip.textContent = 'process.csv';
      $('f-rt').appendChild(upChip); flash(rt);
      uploaded = true; everUp = true;
      msg.innerHTML = '업로드 버튼으로 <strong>내 컴퓨터 → 런타임</strong>에 복사했습니다. 이제 파일 이름만으로 읽을 수 있습니다.';
    });
    $('d-local').addEventListener('click', () => {
      connect();
      $('code-local').hidden = false; $('code-url').hidden = true;
      if (uploaded) {
        result('(494, 13)');
        msg.innerHTML = '런타임에 파일이 있어 <strong>성공</strong> — 494행, 13열. 그런데 내일 다시 열면? <strong>창 닫고 다음 날</strong>을 눌러 보세요.';
      } else {
        result("FileNotFoundError: [Errno 2] No such file or directory: 'process.csv'", true);
        msg.innerHTML = dayAfter && everUp
          ? '어제 올린 파일은 <strong>런타임이 끝나면서 지워졌습니다.</strong> 매번 다시 올려야 합니다. 그렇다면 주소(URL)로 읽으면?'
          : '런타임에 <strong>process.csv가 없습니다.</strong> 내 컴퓨터에만 있는 파일은 런타임이 볼 수 없습니다. 먼저 업로드해 보세요.';
      }
    });
    $('d-url').addEventListener('click', () => {
      connect();
      $('code-local').hidden = true; $('code-url').hidden = false;
      flash($('z-web')); flash(rt);
      result('(494, 13)');
      msg.innerHTML = dayAfter
        ? '다음 날에도 <strong>그대로 성공!</strong> 업로드 없이 언제 열어도 같은 결과 — 이 강의가 쓰는 방법입니다.'
        : '인터넷 주소에서 바로 읽어 <strong>성공</strong>. 업로드가 필요 없습니다. <code>DATA</code>는 수업 데이터 폴더의 주소입니다.';
    });
    $('d-off').addEventListener('click', () => {
      if (upChip) { upChip.remove(); upChip = null; }
      uploaded = false; dayAfter = true;
      rt.classList.add('off'); st.className = 'zst off'; st.textContent = '○ 런타임 끝남 (올린 파일 삭제)';
      out.textContent = '(아직 실행하지 않음)'; out.className = 'out';
      msg.innerHTML = '하루가 지나 런타임이 끝났습니다. ' + (everUp ? '<strong>업로드한 파일도 함께 사라졌습니다.</strong> ' : '') + '두 가지 읽기 버튼을 다시 눌러 보세요.';
    });
  })();
})();
