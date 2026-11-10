// 4주 2차시 전용: 트레이스백 해부, 오류↔원인 짝 맞추기, 질문 조립
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };

  /* ───────── 1) 트레이스백 해부 ───────── */
  (function traceback() {
    const tb = $('tb'); if (!tb) return;
    const ar = (s) => '<span class="ar">' + esc(s) + '</span>';
    const P = [
      { k: 'head', ic: 'alert', skip: true,
        html: '<span class="dim">' + '-'.repeat(72) + '</span>\n<span class="ek">KeyError</span>' + ' '.repeat(26) + 'Traceback (most recent call last)',
        h: '맨 위: 오류 종류 + “Traceback”', d: '오류 종류(KeyError)가 맨 위에도 한 번 나옵니다. <b>most recent call last</b> = “가장 최근에 실행된 곳이 맨 마지막”이라는 뜻. 그래서 <b>아래부터</b> 읽습니다.' },
      { k: 'mine', ic: 'code', no: 2,
        html: '/tmp/ipython-input-3.py in &lt;cell line: 0&gt;()\n      2 df = pd.read_csv(DATA + \'process.csv\')\n      3 # 불량 여부별 개수\n' + ar('----> ') + '4 print(df[\'불량\'].value_counts())',
        h: '② 내 셀: 문제가 난 줄', d: '<b>&lt;cell line: 0&gt;</b> = 지금 실행한 내 셀. 화살표 <b>----&gt;</b> 가 4번째 줄 <code>df[\'불량\']</code>을 가리킵니다. <b>고칠 곳은 여기</b>입니다.' },
      { k: 'lib1', ic: 'layers', skip: true,
        html: '/usr/local/lib/…/pandas/core/frame.py in __getitem__(self, key)\n   …\n' + ar('-> ') + '4102             indexer = self.columns.get_loc(key)',
        h: '③ pandas 내부 (1)', d: '내 코드가 pandas를 부르고, pandas가 열을 찾으러 들어간 길입니다. pandas 안쪽 코드라 <b>내가 고칠 곳이 아닙니다.</b> 건너뜁니다.' },
      { k: 'lib2', ic: 'layers', skip: true,
        html: '/usr/local/lib/…/pandas/core/indexes/base.py in get_loc(self, key)\n   …\n' + ar('-> ') + '3812             raise KeyError(key) from err',
        h: '③ pandas 내부 (2)', d: '열 목록에서 \'불량\'을 찾지 못한 pandas가 오류를 일으킨(<b>raise</b>) 곳입니다. 역시 건너뜁니다.' },
      { k: 'last', ic: 'target', no: 1, o: true,
        html: '<span class="ek">KeyError</span>: \'불량\'',
        h: '① 맨 아래: 오류 종류 + 메시지', d: '<b>KeyError</b> = 키(열 이름)를 찾을 수 없다. <b>\'불량\'</b> = 찾지 못한 이름. → “표에 ‘불량’이라는 열이 없다.” <code>df.columns</code>로 실제 이름을 보면 <b>defect</b>입니다.' },
    ];
    const seen = new Set();
    const els = P.map((p) => {
      const s = document.createElement('span');
      s.className = 'part' + (p.skip ? ' skip' : ''); s.tabIndex = 0; s.setAttribute('role', 'button');
      s.innerHTML = (p.no ? '<span class="no">' + p.no + '</span>' : '') + p.html;
      const pick = () => {
        els.forEach((e) => e.classList.remove('on'));
        s.classList.add('on', 'seen'); seen.add(p.k);
        $('tb-ic').className = 'ic-badge' + (p.o ? ' o' : p.skip ? ' g' : '');
        $('tb-ic').innerHTML = `<svg class="ic"><use href="#i-${p.ic}"/></svg>`;
        $('tb-h').textContent = p.h; $('tb-d').innerHTML = p.d;
        $('tb-n').textContent = seen.size + ' / ' + P.length;
      };
      s.addEventListener('click', pick);
      s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(); } });
      tb.appendChild(s);
      return s;
    });
    $('tb-order').addEventListener('click', () => {
      const on = tb.classList.toggle('order');
      $('tb-order').innerHTML = on ? '<svg class="ic"><use href="#i-reset"/></svg> 순서 표시 끄기' : '<svg class="ic"><use href="#i-eye"/></svg> 읽는 순서 보기';
      if (on) {
        els.forEach((e) => e.classList.remove('on'));
        $('tb-ic').className = 'ic-badge o'; $('tb-ic').innerHTML = '<svg class="ic"><use href="#i-eye"/></svg>';
        $('tb-h').textContent = '읽는 순서: ① → ②, 나머지는 흐리게';
        $('tb-d').innerHTML = '① 맨 아래 줄로 <b>무엇이</b> 잘못됐는지, ② 화살표로 <b>어디서</b> 멈췄는지 찾습니다. 흐린 덩어리는 대부분 건너뛰어도 됩니다.';
      }
    });
  })();

  /* ───────── 2) 오류 ↔ 원인 짝 맞추기 ───────── */
  (function match() {
    const L = $('m-left'), R = $('m-right'); if (!L) return;
    const PAIRS = [
      ['<b>NameError</b>: name \'df\' is not defined', 'df를 만드는 셀을 아직 실행하지 않았다'],
      ['<b>KeyError</b>: \'temperature\'', '열 이름이 틀렸다 (실제 열 이름은 temp)'],
      ['<b>TypeError</b>: can only concatenate str (not "numpy.float64") to str', '글자와 숫자를 + 로 이으려 했다'],
      ['<b>ValueError</b>: could not convert string to float: \'2.01mm\'', '‘mm’가 붙은 글자를 숫자로 바꾸려 했다'],
      ['<b>FileNotFoundError</b>: [Errno 2] No such file or directory: \'data.csv\'', '파일 이름이나 경로(DATA 주소)가 틀렸다'],
      ['<b>IndentationError</b>: expected an indented block after \'for\' statement on line 1', 'for 문 다음 줄을 들여 쓰지 않았다'],
    ];
    let sel = null, done = 0, tries = 0;
    function build() {
      L.innerHTML = ''; R.innerHTML = ''; sel = null; done = 0; tries = 0;
      const r = rng(5);
      const order = PAIRS.map((_, i) => ({ i, k: r() })).sort((a, b) => a.k - b.k).map((o) => o.i);
      PAIRS.forEach(([e], i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'mc err'; b.dataset.i = i;
        b.innerHTML = '<span class="tag2">✓</span>' + e;
        b.addEventListener('click', () => { if (b.classList.contains('done')) return; L.querySelectorAll('.mc').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); sel = i; $('m-msg').textContent = '이제 오른쪽에서 원인을 고르세요.'; });
        L.appendChild(b);
      });
      order.forEach((i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'mc'; b.dataset.i = i;
        b.innerHTML = '<span class="tag2">✓</span>' + PAIRS[i][1];
        b.addEventListener('click', () => {
          if (b.classList.contains('done')) return;
          if (sel === null) { $('m-msg').textContent = '먼저 왼쪽에서 오류 메시지를 고르세요.'; return; }
          tries++;
          if (+b.dataset.i === sel) {
            b.classList.add('done'); const l = L.querySelector(`.mc[data-i="${sel}"]`); l.classList.remove('sel'); l.classList.add('done');
            done++; sel = null;
            $('m-n').textContent = done + ' / 6';
            $('m-msg').innerHTML = done === 6 ? `<b style="color:var(--ok)">모두 맞혔습니다!</b> ${tries}번 시도. 오류 종류만 봐도 원인의 방향이 보이죠?` : '정답! 다음 오류를 고르세요.';
          } else {
            b.classList.remove('no'); void b.offsetWidth; b.classList.add('no');
            setTimeout(() => b.classList.remove('no'), 500);
            $('m-msg').textContent = '다시 생각해 보세요. 오류 이름(Name·Key·Type·Value·File·Indentation)이 힌트입니다.';
          }
        });
        R.appendChild(b);
      });
      $('m-n').textContent = '0 / 6';
      $('m-msg').textContent = '왼쪽에서 오류 메시지를 먼저 고르세요.';
    }
    $('m-reset').addEventListener('click', build);
    build();
  })();

  /* ───────── 3) 질문 조립 ───────── */
  (function ask() {
    const q = $('ask-q'); if (!q) return;
    const on = { msg: false, code: false, goal: false, cols: false };
    const PART = {
      msg: '<span class="pp mono">[오류] KeyError   Traceback (most recent call last)\n… ----&gt; 4 print(df[\'불량\'].value_counts()) …\nKeyError: \'불량\'</span>',
      code: '<span class="pp mono">[코드] df = pd.read_csv(DATA + \'process.csv\')\n       print(df[\'불량\'].value_counts())</span>',
      goal: '<span class="pp">[하려던 것] 불량품 개수와 불량률을 알고 싶었어.</span>',
      cols: '<span class="pp">[데이터 열] shift(글자), line(글자), strength(실수), defect(정수 0/1, 1=불량)</span>',
    };
    const pre = (src) => '<pre class="code">' + src + '</pre>';
    const S = (s) => `<span class="s">${s}</span>`, F = (s) => `<span class="f">${s}</span>`, K = (s) => `<span class="k">${s}</span>`, N = (s) => `<span class="n">${s}</span>`;
    function level() {
      const where = on.msg || on.code;
      if (!where) return 0;
      if (!on.msg) return on.cols ? 3 : 1;
      if (!on.code && !on.cols) return 2;
      if (!on.cols) return 3;
      return on.goal ? 5 : 4;
    }
    const ANS = [
      { st: 'bad', k: '일반론뿐', s: 'AI는 무엇이 잘못됐는지 알 수 없어 흔한 점검 목록만 나열합니다.',
        a: '어떤 오류인지 알 수 없어 일반적인 점검 방법을 알려 드릴게요. ① 오타가 없는지 ② 라이브러리를 설치했는지 ③ 셀을 순서대로 실행했는지 ④ 파일 경로가 맞는지 확인해 보세요.' },
      { st: 'bad', k: '되묻기', s: '코드만으로는 어떤 오류인지 모릅니다. 메시지가 필요합니다.',
        a: '보내 주신 코드는 문법상 문제가 없어 보입니다. 어떤 <b>오류 메시지</b>가 나왔는지 전체를 보여 주시겠어요?' },
      { st: 'mid', k: '방향만', s: '원인의 종류는 알지만, 무엇으로 고칠지는 모릅니다.',
        a: '<b>KeyError: \'불량\'</b>은 데이터에 \'불량\'이라는 열이 없다는 뜻입니다. 실행한 코드와 실제 열 이름을 보여 주시면 정확히 고쳐 드릴게요.' },
      { st: 'mid', k: '추측이 섞임', s: 'AI가 올바른 열 이름을 추측합니다. 추측이 틀리면 또 오류가 납니다.',
        a: '<code>df[\'불량\']</code> 부분에서 열을 찾지 못했습니다. 아래처럼 실제 열 이름을 확인해 보세요. 혹시 <b>\'불량여부\'</b> 같은 이름이 아닐까요?' + pre(F('print') + '(df.columns.tolist())') },
      { st: 'ok', k: '정확한 수정', s: '열 목록을 봤기 때문에 추측 없이 고칩니다.',
        a: '열 목록에 \'불량\'은 없고, 불량 여부는 <b>\'defect\'</b>(0/1) 열입니다. 이렇게 고치세요.' + pre(F('print') + '(df[' + S("'defect'") + '].' + F('value_counts') + '())') },
      { st: 'ok', k: '하려던 것까지 반영', s: '오류도 고치고, 원래 알고 싶던 불량률까지 구해 줍니다.',
        a: '불량 여부는 <b>\'defect\'</b>(0/1) 열입니다. 개수와 불량률을 함께 보려면:' + pre(F('print') + '(df[' + S("'defect'") + '].' + F('value_counts') + '())   <span class="c"># 0=양품, 1=불량 개수</span>\n' + F('print') + '(' + S("'불량률(%):'") + ', ' + F('round') + '(df[' + S("'defect'") + '].' + F('mean') + '() * ' + N('100') + ', ' + N('1') + '))') + '0/1의 평균이 곧 불량 비율이라 <code>mean()</code>을 썼습니다.' },
    ];
    function render() {
      let h = '<div class="who"><svg class="ic"><use href="#i-user"/></svg> 내 질문</div>';
      const any = Object.values(on).some(Boolean);
      h += any ? '<span class="pp vague">아래 코드에서 오류가 났어. 원인과 고친 코드를 알려 줘.</span>' : '<span class="pp vague">오류 났어. 고쳐 줘.</span>';
      ['code', 'msg', 'goal', 'cols'].forEach((k) => { if (on[k]) h += PART[k]; });
      q.innerHTML = h;
      const L = level(), A = ANS[L];
      $('ask-a').innerHTML = '<div class="ai-who"><svg class="ic"><use href="#i-sparkles"/></svg> AI의 답 (예시)</div>' + A.a;
      const n = Object.values(on).filter(Boolean).length;
      $('ask-n').textContent = n + ' / 4';
      $('ask-segs').querySelectorAll('i').forEach((s, i) => s.classList.toggle('on', i < n));
      const st = $('ask-st'); st.className = 'status ' + A.st; st.innerHTML = `<b class="k">${A.k}</b>${A.s}`;
    }
    document.querySelectorAll('.tgl[data-k]').forEach((b) => b.addEventListener('click', () => { on[b.dataset.k] = toggle(b); render(); }));
    render();
  })();
})();
