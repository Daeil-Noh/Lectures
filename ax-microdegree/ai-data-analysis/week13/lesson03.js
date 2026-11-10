// 13주 3차시 전용: 한 단어씩 이어 쓰기, 토큰 나누기, 온도, 환각과 맥락
(function () {
  const $ = (id) => document.getElementById(id);
  const pct = (v) => Math.round(v * 100) + '%';
  const pct1 = (v) => (v * 100 >= 10 ? Math.round(v * 100) : (v * 100).toFixed(1)) + '%';
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  /* ───────── 손으로 만든 확률표: “3호기의 [주어] [꾸밈] [서술] [마무리]” ───────── */
  const START = '3호기의';
  const SUBJ = [['진동이', 0.46], ['온도가', 0.28], ['전류가', 0.16], ['소음이', 0.07], ['고양이가', 0.03, 1]];
  const MOD = [['평소보다', 0.52], ['갑자기', 0.26], ['조금씩', 0.17], ['노래하듯', 0.05, 1]];
  const PRED = {
    '진동이': [['커졌다.', 0.55], ['심해졌다.', 0.25], ['줄었다.', 0.15], ['맛있다.', 0.05, 1]],
    '온도가': [['올라갔다.', 0.55], ['높아졌다.', 0.25], ['내려갔다.', 0.15], ['맛있다.', 0.05, 1]],
    '전류가': [['늘었다.', 0.55], ['튀었다.', 0.25], ['줄었다.', 0.15], ['맛있다.', 0.05, 1]],
    '소음이': [['커졌다.', 0.55], ['심해졌다.', 0.25], ['줄었다.', 0.15], ['맛있다.', 0.05, 1]],
    '고양이가': [['울었다.', 0.5], ['커졌다.', 0.25], ['올라갔다.', 0.15], ['맛있다.', 0.1, 1]],
  };
  const END_UP = [['점검이 필요하다.', 0.55], ['기록해 두자.', 0.25], ['정상 범위다.', 0.15], ['춤을 춘다.', 0.05, 1]];
  const END_DOWN = [['정상 범위다.', 0.5], ['기록해 두자.', 0.35], ['점검이 필요하다.', 0.1], ['춤을 춘다.', 0.05, 1]];
  function nextDist(seq) {        // seq: 고른 단어들 (START 제외)
    const L = seq.length;
    if (L === 0) return SUBJ;
    if (L === 1) return MOD;
    if (L === 2) return PRED[seq[0]];
    if (L === 3) return /줄었다|내려갔다/.test(seq[2]) ? END_DOWN : END_UP;
    return null;
  }
  const isOdd = (seq) => seq.some((w, i) => { const d = nextDist(seq.slice(0, i)); const e = d && d.find((x) => x[0] === w); return e && e[2]; });
  const withT = (dist, T) => { const w = dist.map((d) => Math.pow(d[1], 1 / T)); const s = w.reduce((a, b) => a + b, 0); return dist.map((d, i) => [d[0], w[i] / s, d[2]]); };
  function draw(dist, r) { let u = r(), acc = 0; for (const d of dist) { acc += d[1]; if (u < acc) return d; } return dist[dist.length - 1]; }

  function barRow(d, opts) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'bar-row' + (d[2] ? ' odd' : '') + (opts.top ? ' top' : '');
    b.innerHTML = `<span>${d[0]}</span><span class="tr">${opts.ghost != null ? `<i class="ghost" style="width:${(opts.ghost * 100).toFixed(1)}%"></i>` : ''}<i style="width:${(d[1] * 100).toFixed(1)}%"></i></span><span class="pv">${pct1(d[1])}</span>`;
    if (opts.disabled) b.disabled = true;
    if (opts.onclick) b.addEventListener('click', opts.onclick);
    return b;
  }

  /* ───────── 1) 한 단어씩 이어 쓰기 ───────── */
  (function stepGen() {
    const sent = $('g1-sent'); if (!sent) return;
    const r = rng(5);
    let seq = [], prob = 1, lastNew = false;
    function render() {
      sent.innerHTML = `<span class="w ctx">${START}</span>` + seq.map((w, i) => {
        const d = nextDist(seq.slice(0, i)).find((x) => x[0] === w);
        return `<span class="w${d && d[2] ? ' odd' : ''}${lastNew && i === seq.length - 1 ? ' new' : ''}">${w}</span>`;
      }).join('') + (nextDist(seq) ? '<span class="cur"></span>' : '');
      const dist = nextDist(seq), bars = $('g1-bars'); bars.innerHTML = '';
      $('g1-top').disabled = $('g1-rand').disabled = !dist;
      $('g1-p').textContent = pct1(prob);
      if (!dist) {
        $('g1-q').textContent = '문장 완성!';
        const odd = isOdd(seq);
        $('g1-msg').innerHTML = odd
          ? `확률이 낮은 단어가 섞여 <strong>엉뚱한 문장</strong>이 됐습니다 (이 문장의 확률 ${pct1(prob)}). 문법은 맞아도 내용은 이상합니다.`
          : `완성된 문장의 확률은 <strong>${pct1(prob)}</strong>. 모델은 이렇게 <strong>한 단어씩</strong> 확률을 보고 골라 긴 글을 만듭니다.`;
        return;
      }
      $('g1-q').textContent = `“${[START].concat(seq).join(' ')}” 다음 단어 후보 — 막대를 눌러 직접 골라도 됩니다`;
      const maxP = Math.max(...dist.map((d) => d[1]));
      dist.forEach((d) => bars.appendChild(barRow(d, { top: d[1] === maxP, onclick: () => choose(d) })));
    }
    function choose(d) { seq.push(d[0]); prob *= d[1]; lastNew = true; render(); }
    $('g1-top').addEventListener('click', () => { const d = nextDist(seq); if (d) choose(d.reduce((a, b) => (b[1] > a[1] ? b : a))); });
    $('g1-rand').addEventListener('click', () => { const d = nextDist(seq); if (d) choose(draw(d, r)); });
    $('g1-reset').addEventListener('click', () => { seq = []; prob = 1; lastNew = false; $('g1-msg').innerHTML = '모델은 <strong>정답을 아는 것이 아니라</strong>, 많이 본 글에서 배운 “다음에 올 법한 말”의 확률을 계산합니다.'; render(); });
    render();
  })();

  /* ───────── 2) 토큰 나누기 (단순화한 예시 사전) ───────── */
  (function tokenizer() {
    const inp = $('tk-in'); if (!inp) return;
    const VOCAB = ('호기 진동 이 가 을 를 은 는 의 에 서 도 로 평소 보다 커 졌다 줄 었다 온도 압력 습도 속도 불량 률 데이터 분석 해 줘 점검 필요 하다 했다 합니다 베어링 교체 센서 평균 그래프 그려 코드 파이썬 공정 품질 예측 정상 높 다 야간 주간 비교 하는 짜 학습 모델 기준 경보 설비 ' +
      'the vibr ation of machine increase d ed temperature data analy sis defect rate Python python code night day shift compare mean plot ing s is was high er than usual sensor bearing replace check model train AI process quality bar mm').split(' ');
    const VSET = new Map(VOCAB.map((v, i) => [v, 1000 + i * 7]));
    const MAXL = Math.max(...VOCAB.map((v) => v.length));
    function tokenize(text) {
      const out = []; let i = 0, space = false;
      while (i < text.length) {
        const ch = text[i];
        if (ch === ' ') { space = true; i++; continue; }
        let tok = null;
        if (/[0-9]/.test(ch)) { let j = i; while (j < text.length && j - i < 3 && /[0-9]/.test(text[j])) j++; tok = text.slice(i, j); }
        else {
          for (let L = Math.min(MAXL, text.length - i); L >= 1; L--) { const s = text.slice(i, i + L); if (VSET.has(s)) { tok = s; break; } }
          if (!tok) tok = ch;                      // 사전에 없으면 한 글자씩
        }
        const id = VSET.has(tok) ? VSET.get(tok) : /^[0-9]+$/.test(tok) ? 200 + (+tok % 1000) : 30000 + (tok.codePointAt(0) % 20000);
        out.push({ t: (space ? '▁' : '') + tok, id, known: VSET.has(tok) || /^[0-9]+$/.test(tok) });
        space = false; i += tok.length;
      }
      return out;
    }
    let showId = false;
    function render() {
      const toks = tokenize(inp.value);
      $('tk-out').innerHTML = toks.map((k, i) => `<span class="c${i % 4}">${k.t.replace(/</g, '&lt;')}${showId ? `<small>${k.id}</small>` : ''}</span>`).join('');
      const chars = [...inp.value.replace(/\s/g, '')].length;
      $('tk-c').textContent = chars; $('tk-n').textContent = toks.length;
      const unk = toks.filter((k) => !k.known).length;
      $('tk-msg').innerHTML = unk >= 3
        ? `사전에 없는 말 <strong>${unk}개 조각</strong>이 한 글자씩 쪼개졌습니다. 드문 말일수록 토큰이 많아집니다. 입력 길이 제한·요금도 보통 <strong>토큰 수</strong>로 셉니다.`
        : '자주 나오는 조각은 한 토큰, 드문 말은 잘게 쪼개집니다. 모델은 글자가 아니라 <strong>토큰</strong> 단위로 읽고 씁니다 — 글자 수 세기에 약한 이유 중 하나입니다.';
    }
    const PRE = ['3호기 진동이 평소보다 커졌다', 'The vibration of machine 3 increased', '온도 211.5℃, 압력 80bar', '야간 불량률을 비교하는 파이썬 코드 짜 줘', '갸릉갸릉 뾰롱한 신조어'];
    PRE.forEach((t, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.setAttribute('aria-pressed', i === 0);
      b.addEventListener('click', () => { inp.value = t; $('tk-pre').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); render(); });
      $('tk-pre').appendChild(b);
    });
    inp.addEventListener('input', () => { $('tk-pre').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false')); render(); });
    inp.addEventListener('keydown', (e) => e.stopPropagation());   // 입력 중 ← → 키로 슬라이드가 넘어가지 않게
    $('tk-id').addEventListener('click', () => { showId = toggle($('tk-id')); render(); });
    render();
  })();

  /* ───────── 3) 온도 ───────── */
  (function temperature() {
    const s = $('t-s'); if (!s) return;
    const r = rng(42);
    function bars() {
      const T = +s.value, adj = withT(SUBJ, T), w = $('t-bars'); w.innerHTML = '';
      const maxP = Math.max(...adj.map((d) => d[1]));
      adj.forEach((d, i) => w.appendChild(barRow(d, { ghost: SUBJ[i][1], top: d[1] === maxP, disabled: true })));
      $('t-o').textContent = T.toFixed(1);
    }
    function gen() {
      const T = +s.value, list = $('t-list'); list.innerHTML = '';
      let odd = 0;
      for (let k = 0; k < 5; k++) {
        const seq = [];
        let d; while ((d = nextDist(seq))) seq.push(draw(withT(d, T), r)[0]);
        const o = isOdd(seq); if (o) odd++;
        const div = document.createElement('div');
        div.innerHTML = START + ' ' + seq.map((w, i) => { const e = nextDist(seq.slice(0, i)).find((x) => x[0] === w); return e[2] ? `<b class="odd">${w}</b>` : w; }).join(' ');
        list.appendChild(div);
      }
      $('t-odd').textContent = odd + ' / 5';
      const uniq = new Set([...list.children].map((c) => c.textContent)).size;
      $('t-msg').innerHTML = T <= 0.3
        ? `온도 ${T.toFixed(1)}: 거의 항상 1등 단어만 고릅니다 → <strong>서로 다른 문장 ${uniq}개</strong>. 일정하지만 늘 같은 답.`
        : T >= 1.5
          ? `온도 ${T.toFixed(1)}: 확률이 고르게 펴져 낮은 단어도 자주 뽑힙니다 → 서로 다른 문장 ${uniq}개, 엉뚱한 문장 <strong>${odd}개</strong>.`
          : `온도 ${T.toFixed(1)}: 확률대로 뽑으니 <strong>같은 질문에도 답이 달라집니다</strong> (서로 다른 문장 ${uniq}개). 다시 눌러 보세요.`;
    }
    s.addEventListener('input', () => { bars(); $('t-list').innerHTML = ''; $('t-odd').textContent = '-'; $('t-msg').innerHTML = '“문장 5개 만들기”를 눌러 보세요.'; });
    $('t-gen').addEventListener('click', gen);
    bars();
  })();

  /* ───────── 4) 환각과 맥락 ───────── */
  (function halluc() {
    const chat = $('h-chat'); if (!chat) return;
    const r = rng(9);
    const UNK = '제공된 정보로는 알 수 없습니다';
    const D = {
      none: [['4.5 mm/s', 0.27], ['7.1 mm/s', 0.22], ['2.8 mm/s', 0.18], ['11.2 mm/s', 0.12], ['5.2 mm/s', 0.05], ['7.0 mm/s', 0.1], [UNK, 0.06]],
      ins: [['4.5 mm/s', 0.15], ['7.1 mm/s', 0.12], ['2.8 mm/s', 0.1], ['11.2 mm/s', 0.06], ['5.2 mm/s', 0.03], ['7.0 mm/s', 0.06], [UNK, 0.48]],
      doc: [['4.5 mm/s', 0.03], ['7.1 mm/s', 0.01], ['2.8 mm/s', 0.01], ['11.2 mm/s', 0.0], ['5.2 mm/s', 0.86], ['7.0 mm/s', 0.06], [UNK, 0.03]],
      both: [['4.5 mm/s', 0.02], ['7.1 mm/s', 0.01], ['2.8 mm/s', 0.0], ['11.2 mm/s', 0.0], ['5.2 mm/s', 0.88], ['7.0 mm/s', 0.05], [UNK, 0.04]],
    };
    let doc = false, ins = false, answer = null;
    const key = () => (doc && ins ? 'both' : doc ? 'doc' : ins ? 'ins' : 'none');
    function render() {
      let me = '3호기 진동 경보 기준값이 몇 mm/s야?';
      if (doc) me += '<span class="doc"><b>[붙여 넣은 문서] 설비 정비 기준서</b><br>3호기 진동 경보 기준: 5.2 mm/s · 정지 기준: 7.0 mm/s</span>';
      if (ins) me += '<span class="ins">확실하지 않으면 모른다고 답해 줘.</span>';
      chat.innerHTML = `<div class="bubble me"><small>나</small>${me}</div>` +
        (answer ? `<div class="bubble ai"><small>AI 답 (확률 ${pct1(answer[1])}인 답이 뽑힘)</small>${answer[0] === UNK ? UNK + '. 정비 기준서를 확인해 주세요.' : `3호기 진동 경보 기준은 <strong>${answer[0]}</strong>입니다.`}</div>` : '');
      const dist = D[key()], w = $('h-bars'); w.innerHTML = '';
      dist.filter((d) => d[1] > 0).forEach((d) => {
        const b = barRow([d[0] === UNK ? '“모르겠다”' : d[0], d[1], d[0] !== '5.2 mm/s' && d[0] !== UNK ? 1 : 0], { disabled: true });
        if (d[0] === UNK) b.classList.add('unk');
        if (answer && answer[0] === d[0]) b.classList.add('picked');
        w.appendChild(b);
      });
      const st = $('h-st');
      if (!doc && !ins) { st.className = 'status bad'; st.innerHTML = '<b class="k">근거 없이 지어낸 숫자</b>모델은 이 회사 3호기의 문서를 본 적이 없습니다. 그래도 학습한 글에 흔하던 <strong>그럴듯한 숫자</strong>를 고릅니다. “모른다”는 6%뿐.'; }
      else if (!doc) { st.className = 'status mid'; st.innerHTML = '<b class="k">지시만으로는 부족</b>“모른다”가 48%로 늘었지만, 절반은 여전히 <strong>지어낸 숫자</strong>입니다.'; }
      else { st.className = 'status ok'; st.innerHTML = `<b class="k">맥락이 답을 바꿨다 · 5.2 mm/s ${pct(D[key()][4][1])}</b>근거 문서를 프롬프트에 넣자 정답이 크게 늘었습니다. 그래도 0%가 아님(정지 기준 7.0과 헷갈림) → <strong>원문과 대조</strong>.`; }
    }
    $('h-doc').addEventListener('click', () => { doc = toggle($('h-doc')); answer = null; render(); });
    $('h-ins').addEventListener('click', () => { ins = toggle($('h-ins')); answer = null; render(); });
    $('h-gen').addEventListener('click', () => { answer = draw(D[key()], r); render(); });
    render();
  })();
})();
