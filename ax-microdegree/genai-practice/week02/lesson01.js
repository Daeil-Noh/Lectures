// 2주 1차시 전용: 한 조각씩 이어 쓰기, 추가 학습 전후, 토큰 나누기, 맥락 창, 프롬프트 = 맥락, 온도
(function () {
  const $ = (id) => document.getElementById(id);
  const pct1 = (v) => (v * 100 >= 10 ? Math.round(v * 100) : (v * 100).toFixed(1)) + '%';
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  /* ───────── 손으로 만든 확률표: “고객님, 주문하신 상품은 [언제] [어떻게] [끝맺음] [인사]” ─────────
     세 번째 값 1 = 엉뚱한 말 (문법은 되지만 내용이 이상함) */
  const START = '고객님, 주문하신 상품은';
  const D = [
    [['내일', 0.46], ['오늘', 0.28], ['모레', 0.14], ['곧', 0.08], ['어제', 0.04, 1]],
    [['도착할', 0.50], ['출고될', 0.28], ['배송될', 0.17], ['노래할', 0.05, 1]],
    [['예정입니다.', 0.62], ['것입니다.', 0.22], ['수도 있습니다.', 0.12], ['맛있습니다.', 0.04, 1]],
    [['감사합니다.', 0.55], ['좋은 하루 보내세요.', 0.27], ['문의는 고객센터로 주세요.', 0.14], ['펭귄이 기다립니다.', 0.04, 1]],
  ];
  const nextDist = (seq) => D[seq.length] || null;
  const isOdd = (seq) => seq.some((w, i) => { const e = D[i].find((x) => x[0] === w); return e && e[2]; });
  const withT = (dist, T) => { const w = dist.map((d) => Math.pow(d[1], 1 / T)); const s = w.reduce((a, b) => a + b, 0); return dist.map((d, i) => [d[0], w[i] / s, d[2]]); };
  function draw(dist, r) { let u = r(), acc = 0; for (const d of dist) { acc += d[1]; if (u < acc) return d; } return dist[dist.length - 1]; }

  function barRow(d, opts) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'bar-row' + (d[2] ? ' odd' : '') + (opts.top ? ' top' : '');
    b.innerHTML = `<span>${d[0]}</span><span class="tr">${opts.ghost != null ? `<i class="ghost" style="width:${(opts.ghost * 100).toFixed(1)}%"></i>` : ''}<i style="width:${(d[1] * 100).toFixed(1)}%"></i></span><span class="pv">${pct1(d[1])}</span>`;
    if (opts.disabled) b.disabled = true;
    if (opts.onclick) b.addEventListener('click', opts.onclick);
    return b;
  }

  /* ───────── 1) 한 조각씩 이어 쓰기 ───────── */
  (function stepGen() {
    const sent = $('g1-sent'); if (!sent) return;
    const r = rng(5);
    const MSG0 = '모델은 <strong>정답을 아는 것이 아니라</strong>, 많이 본 글에서 배운 “다음에 올 법한 말”의 확률을 따집니다.';
    let seq = [], prob = 1, lastNew = false;
    function render() {
      sent.innerHTML = `<span class="w ctx">${START}</span>` + seq.map((w, i) => {
        const d = D[i].find((x) => x[0] === w);
        return `<span class="w${d && d[2] ? ' odd' : ''}${lastNew && i === seq.length - 1 ? ' new' : ''}">${w}</span>`;
      }).join('') + (nextDist(seq) ? '<span class="cur"></span>' : '');
      const dist = nextDist(seq), bars = $('g1-bars'); bars.innerHTML = '';
      $('g1-top').disabled = $('g1-rand').disabled = !dist;
      $('g1-p').textContent = pct1(prob);
      if (!dist) {
        $('g1-q').textContent = '문장 완성!';
        $('g1-msg').innerHTML = isOdd(seq)
          ? `확률이 낮은 말이 섞여 <strong>엉뚱한 문장</strong>이 됐습니다 (이 문장의 확률 ${pct1(prob)}). 문법은 맞아도 내용은 이상합니다. 처음부터 다시 해 보세요.`
          : `완성! 이 문장의 확률은 <strong>${pct1(prob)}</strong>. 모델은 이렇게 <strong>한 조각씩</strong> 확률을 보고 골라 긴 글을 만듭니다.`;
        return;
      }
      $('g1-q').textContent = `“${[START].concat(seq).join(' ')}” 다음 말 후보 — 막대를 눌러 직접 골라도 됩니다`;
      const maxP = Math.max(...dist.map((d) => d[1]));
      dist.forEach((d) => bars.appendChild(barRow(d, { top: d[1] === maxP, onclick: () => choose(d) })));
    }
    function choose(d) { seq.push(d[0]); prob *= d[1]; lastNew = true; render(); }
    $('g1-top').addEventListener('click', () => { const d = nextDist(seq); if (d) choose(d.reduce((a, b) => (b[1] > a[1] ? b : a))); });
    $('g1-rand').addEventListener('click', () => { const d = nextDist(seq); if (d) choose(draw(d, r)); });
    $('g1-reset').addEventListener('click', () => { seq = []; prob = 1; lastNew = false; $('g1-msg').innerHTML = MSG0; render(); });
    render();
  })();

  /* ───────── 2) 추가 학습 전후 ───────── */
  (function tuning() {
    const sw = $('tn-sw'); if (!sw) return;
    const S = {
      pre: {
        h: '① 사전학습만 한 모델',
        d: '“다음에 올 법한 글”만 배운 상태. 질문이 줄줄이 이어지는 글(문제집·게시판 등)을 많이 봤다면, 답 대신 <strong>비슷한 질문을 이어 씁니다.</strong>',
        a: '바다결 고객 후기를 세 줄로 요약해 줘.\n바다결 고객 후기를 다섯 줄로 요약해 줘.\n바다결 매장 후기를 표로 정리해 줘.\n…',
        m: '틀린 것은 아닙니다. “요청 다음에 올 법한 글”을 이어 썼을 뿐 — 하지만 <strong>우리가 원한 답은 아닙니다.</strong>',
      },
      tuned: {
        h: '② 추가 학습까지 한 모델',
        d: '“질문 → 좋은 답” 예시와, 여러 답 가운데 <strong>어느 것이 더 도움이 되는지 사람이 매긴 평가</strong>로 더 배웠습니다.',
        a: '후기에는 재구매, 달지 않은 맛, 빠른 배송, 꼼꼼한 포장을 칭찬하는 말이 많고, “양이 적다”, “문의 답변이 늦다”는 아쉬움도 있습니다.',
        m: '원리는 그대로 <strong>다음 말 예측</strong>. 다만 “요청 뒤에는 그 요청에 맞는 답이 온다”는 패턴을 익혀 <strong>비서처럼</strong> 답합니다.',
      },
    };
    function pick(k) {
      sw.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.k === k));
      $('tn-h').textContent = S[k].h; $('tn-d').innerHTML = S[k].d; $('tn-ans').innerHTML = '<span class="who">AI</span>' + S[k].a; $('tn-msg').innerHTML = S[k].m;
    }
    sw.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => pick(b.dataset.k)));
    pick('pre');
  })();

  /* ───────── 3) 토큰 나누기 (단순화한 예시 사전) ───────── */
  (function tokenizer() {
    const inp = $('tk-in'); if (!inp) return;
    const VOCAB = ('고객 님 , . 주문 하신 상품 은 는 이 가 을 를 의 에 서 도 로 내일 오늘 도착 할 예정 입니다 감사 합니다 바다결 미역 귀 현미 칩 원 그래놀라 견과 믹스 배송 후기 요약 해 줘 회의록 한 줄 으로 작성 간식 선물 세트 매장 다 했 어요 요 ' +
      'Thank thank you for your order the and ing ed s').split(' ');
    const VSET = new Set(VOCAB);
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
          if (!tok) tok = ch;                    // 사전에 없으면 한 글자씩
        }
        out.push({ t: (space ? '▁' : '') + tok, known: VSET.has(tok) || /^[0-9]+$/.test(tok) });
        space = false; i += tok.length;
      }
      return out;
    }
    function render() {
      const toks = tokenize(inp.value);
      $('tk-out').innerHTML = toks.map((k, i) => `<span class="c${i % 4}">${k.t.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`).join('');
      $('tk-c').textContent = [...inp.value.replace(/\s/g, '')].length; $('tk-n').textContent = toks.length;
      const unk = toks.filter((k) => !k.known).length;
      $('tk-msg').innerHTML = unk >= 3
        ? `처음 보는 말 <strong>${unk}조각</strong>이 한 글자씩 쪼개졌습니다. 신조어·드문 말일수록 토큰이 많아집니다. AI가 한 번에 읽을 수 있는 양도 <strong>토큰 수</strong>로 셉니다.`
        : '자주 쓰는 말은 큰 조각 하나, 드문 말은 잘게 쪼개집니다. AI는 글자가 아니라 <strong>토큰</strong> 단위로 읽고 씁니다 — 그래서 “글자 수 정확히 맞추기”에 약합니다.';
    }
    const PRE = ['고객님, 주문하신 상품은 내일 도착할 예정입니다', 'Thank you for your order', '미역귀 현미칩 6,500원', '회의록을 한 줄로 요약해 줘', '꾸안꾸 갓생 간식템'];
    PRE.forEach((t, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.setAttribute('aria-pressed', i === 0);
      b.addEventListener('click', () => { inp.value = t; $('tk-pre').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); render(); });
      $('tk-pre').appendChild(b);
    });
    inp.addEventListener('input', () => { $('tk-pre').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false')); render(); });
    inp.addEventListener('keydown', (e) => e.stopPropagation());   // 입력 중 ← → 키로 슬라이드가 넘어가지 않게
    render();
  })();

  /* ───────── 4) 맥락 창 ───────── */
  (function ctxWindow() {
    const s = $('cw-s'); if (!s) return;
    const WIN = 100;                                 // 맥락 창 크기 (설명용 단위)
    const head = [
      { w: '나', t: '우리 회사는 부산의 건강 간식 회사 바다결이야. 답은 존댓말로, 3줄 이내, 해시태그 없이 써 줘.', n: 20, key: 'rule', cls: 'me key' },
      { w: 'AI', t: '네, 그렇게 하겠습니다.', n: 5 },
      { w: '나', t: '미역귀 현미칩 가격은 6,500원이야.', n: 10, key: 'price', cls: 'me key' },
      { w: 'AI', t: '알겠습니다.', n: 5 },
    ];
    const DOCS = ['지난달 회의록 전문', '고객 후기 120건', '경쟁 제품 조사 메모', '매장 운영 매뉴얼'];
    const tail = { w: '나', t: '미역귀 현미칩 소개 문구 써 줘.', n: 10, cls: 'me' };
    function update() {
      const N = +s.value;
      const msgs = head.concat(DOCS.slice(0, N).map((d) => ({ w: '나', t: `[붙여 넣은 자료] ${d} …`, n: 30, cls: 'doc' })), [tail]);
      const total = msgs.reduce((a, m) => a + m.n, 0), cut = Math.max(0, total - WIN);
      let pos = 0, lost = new Set(), html = '', marked = false;
      msgs.forEach((m) => {
        const start = pos, end = pos + m.n; pos = end;
        const out = end <= cut, part = !out && start < cut;
        if ((out || part) && m.key) lost.add(m.key);
        if (!marked && start >= cut) { if (cut > 0) html += '<div class="winlab">▼ 여기부터 AI가 볼 수 있는 범위 (맥락 창)</div>'; marked = true; }
        html += `<div class="cm ${m.cls || ''}${out ? ' out' : ''}" ${part ? 'style="opacity:.6"' : ''}><span class="who">${m.w}</span><span>${m.t}</span><span class="sz">${m.n}</span></div>`;
      });
      $('cw-list').innerHTML = html;
      $('cw-lab').textContent = cut > 0 ? `맥락 창 = 100칸 · 지금 대화 ${total}칸 → 앞부분 ${cut}칸이 밀려남` : `맥락 창 = 100칸 · 지금 대화 ${total}칸 → 모두 보임`;
      $('cw-o').textContent = N + '개';
      const rule = lost.has('rule'), price = lost.has('price');
      const ans = $('cw-ans'), st = $('cw-st');
      if (!rule && !price) {
        ans.textContent = '바다결 미역귀 현미칩, 한 봉지 6,500원으로 만나는 바삭한 바다의 맛.\n부산에서 정성껏 만든 건강 간식을 드셔 보세요.';
        st.className = 'status ok'; st.innerHTML = '<b class="k">처음 정한 조건을 잘 지킴</b>회사 이름·가격·말투·분량 조건이 모두 맥락 창 안에 있습니다.';
      } else if (!price) {
        ans.textContent = '바삭바삭! 미역귀 현미칩이 드디어 나왔어요! 단돈 6,500원으로 즐기는 고소한 바다 간식. 출출할 때, 운동 끝나고, 영화 볼 때 언제든 좋아요. 한번 먹으면 멈출 수 없는 맛을 지금 경험해 보세요!\n#건강간식 #현미칩 #간식추천';
        st.className = 'status mid'; st.innerHTML = '<b class="k">조건이 밀려남</b>“3줄 이내·해시태그 없이”를 말한 첫 메시지가 창 밖으로 밀려나 <strong>조건을 지키지 못합니다.</strong>';
      } else {
        ans.textContent = '바삭바삭! 미역귀 현미칩이 드디어 나왔어요! 단돈 4,900원으로 즐기는 고소한 바다 간식. 출출할 때, 운동 끝나고 언제든 좋아요. 지금 바로 주문하세요!\n#건강간식 #현미칩 #간식추천';
        st.className = 'status bad'; st.innerHTML = '<b class="k">가격까지 밀려남 → 지어낸 숫자</b>가격 정보가 창 밖으로 나가자 <strong>그럴듯한 가격(4,900원)</strong>을 만들어 냈습니다. 중요한 조건은 다시 알려 주세요.';
      }
    }
    s.addEventListener('input', update);
    update();
  })();

  /* ───────── 5) 프롬프트 = 맥락 ───────── */
  (function promptCtx() {
    const q = $('pc-q'); if (!q) return;
    const st = { co: false, who: false, fmt: false };
    function render() {
      let pre = '';
      if (st.co) pre += '우리 회사는 부산의 건강 간식 회사 바다결이고, 신제품은 미역귀 현미칩(6,500원, 부산 미역귀와 현미로 만든 바삭한 스낵)이야. ';
      if (st.who) pre += '20~30대 직장인이 보는 SNS 게시물이야. ';
      if (st.fmt) pre += '3줄 이내로, 마지막 줄에 해시태그 2개를 붙여 줘. ';
      q.innerHTML = '<span class="who">나</span>' + (pre ? `<span class="ctxin">${pre.trim()}</span> ` : '') + '신제품 소개 문구 써 줘.';
      let a;
      if (st.fmt) {
        a = (st.who ? '야근 전 출출할 때, 서랍 속 건강 간식' : '새로운 맛, 지금 만나 보세요') + '\n' +
            (st.co ? '부산 미역귀와 현미로 만든 바삭한 미역귀 현미칩 · 6,500원' : '좋은 재료로 정성껏 만든 신제품') + '\n' +
            (st.who ? '#오피스간식 #건강간식' : '#신제품 #간식추천');
      } else {
        a = (st.who ? '야근 전 출출할 때, 책상 서랍 속 간식이 고민이신가요? ' : '새로운 맛을 찾고 계신가요? ') +
            (st.co ? '바다결의 미역귀 현미칩은 부산 미역귀와 현미로 만든 바삭한 스낵입니다. ' : '저희 신제품은 좋은 재료로 정성껏 만든 제품입니다. ') +
            (st.who ? '회의 사이 한 줌으로 기분 전환하세요. ' : '남녀노소 누구나 즐길 수 있습니다. ') +
            (st.co ? '한 봉지 6,500원으로 부담 없이 만나 보세요. ' : '합리적인 가격으로 만나 보세요. ') +
            '지금 바로 경험해 보세요! 많은 관심 부탁드립니다.';
      }
      $('pc-a').innerHTML = '<span class="who">AI</span>' + a;
      const n = st.co + st.who + st.fmt;
      $('pc-v').textContent = ['낮음', '조금 나아짐', '꽤 좋음', '거의 바로 사용'][n];
      $('pc-bar').style.width = [15, 45, 72, 92][n] + '%';
      const miss = [];
      if (!st.co) miss.push('제품 이름·가격이 없어 <strong>“신제품”, “합리적인 가격”</strong> 같은 빈말');
      if (!st.who) miss.push('대상이 없어 <strong>“남녀노소 누구나”</strong>');
      if (!st.fmt) miss.push('형식이 없어 <strong>길고 늘어지는 글</strong>');
      $('pc-msg').innerHTML = miss.length ? '빠진 맥락 → ' + miss.join(', ') + '.' : '세 가지 맥락이 모두 들어가 <strong>우리 상황에 맞는 답</strong>이 나왔습니다. 그래도 가격·사실은 최종 확인!';
    }
    document.querySelectorAll('.tgl[data-c]').forEach((b) => b.addEventListener('click', () => { st[b.dataset.c] = toggle(b); render(); }));
    render();
  })();

  /* ───────── 6) 온도 ───────── */
  (function temperature() {
    const s = $('t-s'); if (!s) return;
    const r = rng(42);
    function bars() {
      const T = +s.value, adj = withT(D[0], T), w = $('t-bars'); w.innerHTML = '';
      const maxP = Math.max(...adj.map((d) => d[1]));
      adj.forEach((d, i) => w.appendChild(barRow(d, { ghost: D[0][i][1], top: d[1] === maxP, disabled: true })));
      $('t-o').textContent = T.toFixed(1);
    }
    function gen() {
      const T = +s.value, list = $('t-list'); list.innerHTML = '';
      let odd = 0;
      for (let k = 0; k < 5; k++) {
        const seq = [];
        let d; while ((d = nextDist(seq))) seq.push(draw(withT(d, T), r)[0]);
        if (isOdd(seq)) odd++;
        const div = document.createElement('div');
        div.innerHTML = START + ' ' + seq.map((w, i) => { const e = D[i].find((x) => x[0] === w); return e[2] ? `<b class="odd">${w}</b>` : w; }).join(' ');
        list.appendChild(div);
      }
      $('t-odd').textContent = odd + ' / 5';
      const uniq = new Set([...list.children].map((c) => c.textContent)).size;
      $('t-msg').innerHTML = T <= 0.3
        ? `온도 ${T.toFixed(1)}: 거의 항상 1등 말만 고릅니다 → <strong>서로 다른 답 ${uniq}개</strong>. 일정하지만 늘 같은 답.`
        : T >= 1.5
          ? `온도 ${T.toFixed(1)}: 확률이 고르게 펴져 낮은 말도 자주 뽑힙니다 → 서로 다른 답 ${uniq}개, 엉뚱한 답 <strong>${odd}개</strong>.`
          : `온도 ${T.toFixed(1)}: 확률대로 뽑으니 <strong>같은 질문에도 답이 달라집니다</strong> (서로 다른 답 ${uniq}개). 다시 눌러 보세요.`;
    }
    s.addEventListener('input', () => { bars(); $('t-list').innerHTML = ''; $('t-odd').textContent = '-'; $('t-msg').innerHTML = '“답 5개 만들기”를 눌러 보세요.'; });
    $('t-gen').addEventListener('click', gen);
    bars();
  })();
})();
