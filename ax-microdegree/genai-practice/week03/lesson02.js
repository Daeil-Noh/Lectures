// 3주 2차시 전용: 다시 보내기(확률 선택), 두 답 채점기, 잘라 붙이기 vs 합쳐 달라기
// 모든 AI 답변은 미리 써 둔 예시 문장이다(실제 서비스 출력 아님).
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  /* ───────── 1) 같은 질문 다시 보내기 ───────── */
  (function resend() {
    const wrap = $('r-cands'); if (!wrap) return;
    const C = [
      { w: '바삭해서', p: 0.36, s: '바다결 현미칩은 바삭해서 한 봉이 금방 사라져요.' },
      { w: '고소해서', p: 0.26, s: '바다결 현미칩은 고소해서 아침 대용으로도 좋아요.' },
      { w: '가벼워서', p: 0.18, s: '바다결 현미칩은 가벼워서 늦은 밤에도 부담 없어요.' },
      { w: '건강해서', p: 0.12, s: '바다결 현미칩은 건강해서 아이 간식으로도 좋아요.' },
      { w: '매콤해서', p: 0.08, s: '바다결 현미칩은 매콤해서 자꾸 손이 가요.' },
    ];
    const rows = C.map((c) => {
      const d = document.createElement('div'); d.className = 'cand';
      d.innerHTML = `<span>${c.w}</span><span class="tr"><i style="width:${c.p / 0.36 * 100}%"></i></span><span class="pc">${Math.round(c.p * 100)}%</span>`;
      wrap.appendChild(d); return d;
    });
    let r, n, seen, hist, mode = 'sample';
    function reset() {
      r = rng(92); n = 0; seen = new Set(); hist = [];
      rows.forEach((x) => x.classList.remove('pick'));
      $('r-hist').innerHTML = '<div class="muted" style="background:transparent">아직 없음</div>';
      $('r-n').textContent = 0; $('r-u').textContent = 0;
      $('r-msg').innerHTML = mode === 'sample' ? '2주차에 배운 대로 LLM은 다음 말을 <strong>확률에 따라</strong> 고릅니다. 버튼을 여러 번 눌러 보세요.' : '이번에는 늘 <strong>확률 1등</strong>만 고르게 했습니다. 여러 번 보내면 어떻게 될까요?';
    }
    function pick() {
      if (mode === 'top') return 0;
      const x = r(); let acc = 0;
      for (let i = 0; i < C.length; i++) { acc += C[i].p; if (x < acc) return i; }
      return C.length - 1;
    }
    $('r-go').addEventListener('click', () => {
      const i = pick(); n++;
      const dup = seen.has(i); seen.add(i);
      rows.forEach((x, j) => x.classList.toggle('pick', j === i));
      hist.unshift({ n, i, dup });
      $('r-hist').innerHTML = hist.slice(0, 4).map((h, k) => `<div class="${h.dup ? 'dup' : ''}${k === 0 ? ' new' : ''}"><b>${h.n}번째</b>${esc(C[h.i].s)}</div>`).join('');
      $('r-n').textContent = n; $('r-u').textContent = seen.size;
      if (mode === 'top') {
        $('r-msg').innerHTML = n < 3 ? '같은 문장이 나옵니다…' : `${n}번 모두 <strong>똑같은 답</strong>. 안정적이지만, 고를 거리가 없고 늘 가장 흔한 표현만 나옵니다. 그래서 채팅 서비스는 보통 <strong>확률대로</strong> 고르게 둡니다.`;
      } else {
        $('r-msg').innerHTML = n < 3 ? '다시 눌러 보세요.' : `${n}번 보내 <strong>서로 다른 답 ${seen.size}개</strong>. 확률이 낮은 말도 가끔 뽑히기 때문에 같은 질문에도 답이 달라집니다.`;
      }
    });
    $('r-mode').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      $('r-mode').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
      mode = b.dataset.v; reset();
    }));
    $('r-reset').addEventListener('click', reset);
    reset();
  })();

  /* ───────── 2) 두 답 채점기 ───────── */
  (function scorer() {
    const tb = document.querySelector('#s-rub tbody'); if (!tb) return;
    const K = [['acc', '정확성'], ['spec', '구체성'], ['fit', '목적 적합'], ['tone', '톤']];
    const REF = { A: { acc: 1, spec: 1, fit: 3, tone: 3 }, B: { acc: 3, spec: 3, fit: 1, tone: 1 } };
    const WHY = {
      A: '정확성 1 할인율 20% · 구체성 1 가격·끝나는 날 없음 · 목적 3 · 톤 3',
      B: '정확성 3 · 구체성 3 · 목적 1 두 줄이 61~83자 · 톤 1 공문 말투',
    };
    const S = { A: {}, B: {} };
    let shown = false;
    tb.innerHTML = K.map(([k, t]) => `<tr><td class="c">${t}</td>${['A', 'B'].map((w) => `<td><span class="sc" data-w="${w}" data-k="${k}">${[1, 2, 3].map((v) => `<button type="button" data-v="${v}" aria-pressed="false" aria-label="답 ${w} ${t} ${v}점">${v}</button>`).join('')}</span></td>`).join('')}</tr>`).join('');
    const sum = (o) => K.reduce((a, [k]) => a + (o[k] || 0), 0);
    const done = (w) => K.every(([k]) => S[w][k]);
    function render() {
      $('s-ta').textContent = (done('A') ? sum(S.A) : '-') + ' / 12';
      $('s-tb').textContent = (done('B') ? sum(S.B) : '-') + ' / 12';
      const st = $('s-st');
      if (shown) {
        let agree = 0, total = 0;
        ['A', 'B'].forEach((w) => K.forEach(([k]) => { if (S[w][k]) { total++; if (S[w][k] === REF[w][k]) agree++; } }));
        st.className = 'status ok';
        st.innerHTML = `<b class="k">예시 채점: A 8점 · B 8점 ${total ? `(나와 같은 칸 ${agree}/${total})` : ''}</b><span class="why"><b>A</b> ${WHY.A}<br><b>B</b> ${WHY.B}</span>`;
      } else if (done('A') && done('B')) {
        st.className = 'status mid';
        st.innerHTML = `<b class="k">채점 완료: A ${sum(S.A)}점 · B ${sum(S.B)}점</b>점수마다 근거를 한 줄로 말할 수 있나요? 이제 <strong>예시 채점과 비교</strong>해 보세요.`;
      }
    }
    tb.querySelectorAll('.sc').forEach((g) => g.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
      S[g.dataset.w][g.dataset.k] = +b.dataset.v; render();
    })));
    $('s-ref').addEventListener('click', () => {
      shown = !shown;
      $('s-ans').classList.toggle('reveal', shown);
      tb.querySelectorAll('.sc').forEach((g) => g.querySelectorAll('button').forEach((b) => b.classList.toggle('ref', shown && +b.dataset.v === REF[g.dataset.w][g.dataset.k])));
      $('s-ref').innerHTML = shown ? '<svg class="ic"><use href="#i-eye"/></svg> 예시 채점 숨기기' : '<svg class="ic"><use href="#i-eye"/></svg> 예시 채점과 비교하기';
      if (!shown) { const st = $('s-st'); st.className = 'status mid'; st.innerHTML = '<b class="k">다시 채점해 보세요</b>주황 테두리 = 예시 채점의 점수.'; render(); }
      else render();
    });
  })();

  /* ───────── 3) 잘라 붙이기 vs 합쳐 달라기 ───────── */
  (function merge() {
    const slotsEl = $('m-slots'); if (!slotsEl) return;
    const L = {
      A: ['드디어 나왔다, 맵지만 멈출 수 없는 그 맛!', '바다결 미역귀 현미칩 매콤맛, 튀기지 않고 구워 가볍게!', '출시 기념 11월 20일부터 일주일, 2봉 이상 사면 20% 할인!', '지금 자사몰에서 만나 보세요.'],
      B: ['안녕하십니까, 바다결입니다.', '11월 20일(금) 출시하는 ‘미역귀 현미칩 매콤맛’은 튀기지 않고 구운 현미칩에 청양고추로 매운맛을 더한 제품이며, 가격은 1봉 6,900원입니다.', '출시를 기념하여 11월 20일(금)부터 26일(목)까지 2봉 이상 구매하시는 고객께 10% 할인을 제공합니다.', '회원 여러분의 많은 관심 부탁드립니다. 감사합니다.'],
    };
    const MERGED = ['드디어 나왔다, 맵지만 멈출 수 없는 그 맛!', '미역귀 현미칩 매콤맛 1봉 6,900원, 튀기지 않고 구웠어요.', '11/20(금)~26(목) 2봉 이상 사면 10% 할인!', '11월 20일(금) 자사몰에서 먼저 만나요.'];
    const NAMES = ['첫 줄', '제품', '혜택', '마무리'];
    const pick = ['A', 'A', 'A', 'A'];
    let aiMode = false;
    const LONG = 45;
    const len = (t) => [...t].length;
    function score(lines, src) {
      const acc = src[2] === 'A' ? 1 : 3;                                   // A의 혜택 줄은 할인율이 틀림
      const spec = 1 + (src[1] === 'B' ? 1 : 0) + (src[2] === 'B' ? 1 : 0);  // 가격(B 제품 줄), 끝나는 날(B 혜택 줄)
      const nA = src.filter((s) => s === 'A').length;
      const tone = nA >= 3 ? 3 : nA === 2 ? 2 : 1;
      const nLong = lines.filter((t) => len(t) > LONG).length;
      const fit = nLong === 0 ? 3 : nLong === 1 ? 2 : 1;
      return { acc, spec, fit, tone };
    }
    slotsEl.innerHTML = NAMES.map((nm, i) => `<div class="slot"><span>${nm}</span><div class="switch" data-i="${i}"><button type="button" data-v="A" aria-pressed="true">답 A에서</button><button type="button" data-v="B" aria-pressed="false">답 B에서</button></div></div>`).join('');
    function render() {
      let lines, sc, src;
      if (aiMode) {
        lines = MERGED; sc = { acc: 3, spec: 3, fit: 3, tone: 3 }; src = null;
        $('m-cap').textContent = 'AI에게 “말투는 A, 정보는 B, 숫자는 원자료대로” 합쳐 달라고 한 결과';
        $('m-h').innerHTML = '<svg class="ic"><use href="#i-sparkles"/></svg> 예시 답변 — 미리 써 둔 것, 실제 답은 매번 다름';
      } else {
        src = pick; lines = pick.map((w, i) => L[w][i]); sc = score(lines, src);
        $('m-cap').textContent = '내가 줄마다 골라 붙인 문자';
        $('m-h').innerHTML = '<svg class="ic"><use href="#i-log"/></svg> 잘라 붙인 결과';
      }
      $('m-out').innerHTML = lines.map((t, i) => `<span class="l${len(t) > LONG ? ' long' : ''}${src && i === 2 && src[2] === 'A' ? ' wrong' : ''}">${esc(t)}</span>`).join('');
      const lab = { acc: '정확성', spec: '구체성', fit: '목적 적합', tone: '톤' };
      $('m-sc').innerHTML = Object.keys(lab).map((k) => `<div class="meter"><div class="lbl">${lab[k]}</div><div class="val${sc[k] === 1 ? ' o' : ''}">${sc[k]}</div></div>`).join('');
      const tot = sc.acc + sc.spec + sc.fit + sc.tone;
      $('m-tot').textContent = tot + ' / 12';
      const st = $('m-st');
      if (aiMode) { st.className = 'status ok'; st.innerHTML = '<b class="k">합쳐 달라고 한 답: 12점</b>말투는 A, 정보는 B, 길이는 조건대로. 줄을 통째로 옮기는 대신 <strong>기준을 말로 넘겼기</strong> 때문입니다. 그래도 날짜·할인율은 다시 대조!'; }
      else if (sc.acc === 1) { st.className = 'status bad'; st.innerHTML = '<b class="k">정확성 1점 — 탈락</b>혜택 줄을 답 A에서 가져오면 <strong>20% 할인</strong>이 그대로 들어갑니다.'; }
      else if (tot >= 10) { st.className = 'status mid'; st.innerHTML = `<b class="k">잘라 붙이기 최고 수준: ${tot}점</b>그래도 만점은 안 됩니다. 줄을 통째로 옮기면 한쪽 장점(정보)을 얻는 대신 다른 쪽(<strong>말투·길이</strong>)이 깨집니다.`; }
      else { st.className = 'status mid'; st.innerHTML = `<b class="k">${tot}점</b>줄을 바꿔 가며 점수를 올려 보세요. 잘라 붙이기로는 몇 점까지 갈까요?`; }
      $('m-ai').innerHTML = aiMode ? '<svg class="ic"><use href="#i-reset"/></svg> 다시 잘라 붙여 보기' : '<svg class="ic"><use href="#i-sparkles"/></svg> AI에게 합쳐 달라고 하기';
      slotsEl.querySelectorAll('button').forEach((b) => (b.disabled = aiMode));
    }
    slotsEl.querySelectorAll('.switch').forEach((sw) => sw.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      sw.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
      pick[+sw.dataset.i] = b.dataset.v; render();
    })));
    $('m-ai').addEventListener('click', () => { aiMode = !aiMode; render(); });
    render();
  })();
})();
