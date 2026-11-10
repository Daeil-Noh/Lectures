// 9주 1차시 전용: 업무 우선순위 점수, 바다결 업무 카드 나누기, 주제 판정 카드
(function () {
  const $ = (id) => document.getElementById(id);

  /* ───────── 1) 업무 점수 매기기 ─────────
     월 시간 H = 빈도 × 1회 시간 / 60
     시간 점수 T = min(5, H / 2)          (월 10시간 이상이면 만점 5)
     점수 P = round(T × 규칙성 × 4)       (최대 100), 위험도 높음이면 × 0.5 */
  const score = (t) => {
    const H = t.f * t.t / 60, T = Math.min(5, H / 2);
    let P = T * t.r * 4;
    if (t.risk === 'high') P *= 0.5;
    return { H, P: Math.round(P) };
  };
  (function scorer() {
    const board = $('board'); if (!board) return;
    const tasks = [
      { n: '후기 읽고 답글 달기', w: '한서윤 · 온라인 마케팅', f: 20, t: 30, r: 4, risk: 'mid' },
      { n: '주간 매출 보고서', w: '김다은 · 경영지원', f: 4, t: 90, r: 5, risk: 'mid' },
      { n: '재고 확인 · 발주 메일', w: '박준호 · 매장', f: 8, t: 20, r: 5, risk: 'low' },
      { n: '명절 선물 세트 기획', w: '대표 · 1년에 2번(월 1회로 계산)', f: 1, t: 240, r: 1, risk: 'low' },
      { n: '거래처 단가 협상', w: '대표 · 월 2회', f: 2, t: 60, r: 1, risk: 'high' },
    ];
    const rows = tasks.map((t, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'brow'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="rk"></span><span class="nm">${t.n}<small>${t.w}</small></span><span class="tr"><i></i></span><span class="sc"></span>`;
      b.addEventListener('click', () => pick(i));
      board.appendChild(b);
      return b;
    });
    const f = $('t-f'), tt = $('t-t'), r = $('t-r'), seg = $('t-risk');
    let cur = 0;
    function drawBoard() {
      const s = tasks.map(score);
      const order = s.map((v, i) => i).sort((a, b) => s[b].P - s[a].P);
      rows.forEach((row, i) => {
        const rank = order.indexOf(i) + 1;
        const rk = row.querySelector('.rk');
        rk.textContent = rank; rk.classList.toggle('top', rank === 1);
        const bar = row.querySelector('.tr i');
        bar.style.width = s[i].P + '%'; bar.classList.toggle('risk', tasks[i].risk === 'high');
        row.querySelector('.sc').textContent = s[i].P;
        row.setAttribute('aria-pressed', i === cur);
      });
    }
    function show() {
      const t = tasks[cur], s = score(t);
      $('t-f-o').textContent = t.f + '회'; $('t-t-o').textContent = t.t + '분'; $('t-r-o').textContent = t.r + ' / 5';
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.r === t.risk));
      $('t-h').textContent = (Math.round(s.H * 10) / 10) + '시간';
      $('t-p').textContent = s.P;
      const st = $('t-st');
      if (t.risk === 'high') {
        st.className = 'status bad';
        st.innerHTML = '<b class="k">AI는 보조만</b>틀리면 피해가 큰 업무입니다. 자료 정리·초안 정도만 돕게 하고, <strong>판단과 결정은 사람</strong>이 합니다.';
      } else if (s.P >= 60) {
        st.className = 'status ok';
        st.innerHTML = '<b class="k">개선안 1순위 후보</b>자주·오래·같은 방식으로 반복됩니다.' + (t.risk === 'mid' ? ' 단, 위험도 중간 → <strong>사람 확인 단계</strong>를 꼭 넣습니다.' : '');
      } else if (s.P >= 30) {
        st.className = 'status mid';
        st.innerHTML = '<b class="k">후보 — 범위를 좁혀 보기</b>효과가 중간입니다. 업무 중 <strong>가장 반복되는 단계</strong>만 골라 보세요.';
      } else {
        st.className = 'status mid';
        st.innerHTML = '<b class="k">효과가 작은 편</b>' + (t.r <= 2 ? '매번 방식이 달라 규칙으로 맡기기 어렵습니다. 아이디어 내기 같은 <strong>보조</strong>로는 쓸 수 있습니다.' : '한 달에 쓰는 시간이 짧아 아낄 시간이 많지 않습니다.');
      }
      drawBoard();
    }
    function pick(i) {
      cur = i; const t = tasks[i];
      f.value = t.f; tt.value = t.t; r.value = t.r;
      show();
    }
    f.addEventListener('input', () => { tasks[cur].f = +f.value; show(); });
    tt.addEventListener('input', () => { tasks[cur].t = +tt.value; show(); });
    r.addEventListener('input', () => { tasks[cur].r = +r.value; show(); });
    seg.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { tasks[cur].risk = b.dataset.r; show(); }));
    pick(0);
  })();

  /* ───────── 2) 업무 카드 나누기 ───────── */
  (function sorter() {
    const wrap = $('sorts'); if (!wrap) return;
    const L = { a: '맡김', c: '확인', h: '사람' };
    const cards = [
      { n: '후기 문장을 칭찬·불만·문의로 분류', k: 'a', why: '규칙적이고 틀려도 피해가 작다. 애매한 몇 건만 훑어본다.' },
      { n: '불만 후기에 대한 답글 초안', k: 'c', why: '고객에게 나가는 글. 정책·어조를 사람이 꼭 확인한다.' },
      { n: '환불 여부 최종 결정', k: 'h', why: '돈과 책임이 걸린 결정은 사람이 한다.' },
      { n: 'SNS 게시물 문구 후보 5개', k: 'a', why: '후보를 많이 내는 일은 AI가 잘한다. 고르는 건 사람.' },
      { n: '주간 매출 보고서의 숫자 요약', k: 'c', why: '숫자는 원자료와 반드시 대조한다(7주차).' },
      { n: '고객 이름·전화번호가 있는 주문 목록 정리', k: 'h', why: '개인정보는 생성형AI에 넣지 않는다(1-3).' },
      { n: '회의 메모를 할 일 목록으로 정리', k: 'c', why: '담당자·기한이 틀리면 일이 꼬인다. 참석자가 확인.' },
      { n: '거래처 단가 협상', k: 'h', why: '관계·전략 판단. AI는 자료 정리 정도만.' },
      { n: '외국인 손님용 제품 설명 영어 번역', k: 'c', why: '알레르기·성분 표현은 틀리면 위험. 원문과 대조한다.' },
      { n: '보고서 소제목·제목 후보 만들기', k: 'a', why: '틀려도 다시 고르면 되는 가벼운 일.' },
    ];
    let done = 0, same = 0;
    cards.forEach((c) => {
      const d = document.createElement('div');
      d.className = 'scard';
      d.innerHTML = `<span class="nm">${c.n}</span><span class="pick">${['a', 'c', 'h'].map((k) => `<button type="button" data-k="${k}">${L[k]}</button>`).join('')}</span><span class="why"></span>`;
      d.querySelectorAll('.pick button').forEach((b) => b.addEventListener('click', () => {
        if (d.classList.contains('done')) return;
        const ok = b.dataset.k === c.k;
        d.querySelectorAll('.pick button').forEach((x) => { x.disabled = true; if (x.dataset.k === c.k) x.classList.add('ans'); });
        b.classList.add('mine');
        d.classList.add('done', ok ? 'same' : 'diff');
        d.querySelector('.why').innerHTML = `<b style="color:var(--text)">제안: ${L[c.k]}</b> — ${c.why}`;
        done++; if (ok) same++;
        $('so-score').textContent = `${done} / 10 선택 · 제안과 같은 선택 ${same}개` + (done === 10 ? ' — 다르게 고른 카드는 “왜 다르게 봤는지” 말해 보세요.' : '');
      }));
      wrap.appendChild(d);
    });
  })();

  /* ───────── 3) 이 주제, 그대로 내도 될까? ───────── */
  (function topics() {
    const wrap = $('tcards'); if (!wrap) return;
    const items = [
      { n: '“AI로 회사의 모든 업무를 자동화하기”', k: 'fix', v: '고쳐야 함 — 너무 넓다', a: '업무 하나를 골라 좁힌다. 예: “매장 발주 메일 작성”.' },
      { n: '“학과 행사 안내문 초안을 AI로 쓰고 담당 학생이 일정·장소를 확인해 작성 시간 줄이기”', k: 'good', v: '좋음', a: '업무·AI의 일·사람의 확인·효과가 모두 보인다.' },
      { n: '“고객 연락처 목록을 AI에 넣어 맞춤 홍보 문자를 자동 발송하기”', k: 'fix', v: '고쳐야 함 — 위험', a: '개인정보를 넣고, 사람 확인 없이 발송한다. 연락처 없이 문구 초안만 만들고 발송은 사람이.' },
      { n: '“ChatGPT와 Gemini의 차이 조사”', k: 'fix', v: '고쳐야 함 — 업무가 없다', a: '도구 비교는 개선안이 아니다. “어떤 업무를 어떻게 바꾸는지”가 있어야 한다.' },
      { n: '“주간 매출표를 AI로 요약해 보고서 초안을 만들고, 숫자는 담당자가 원자료와 대조하기”', k: 'good', v: '좋음', a: '반복 업무 + 숫자 검증 단계가 분명하다. 기대 효과에 가정을 밝히면 더 좋다.' },
      { n: '“마케팅을 AI로 더 잘하기”', k: 'fix', v: '고쳐야 함 — 막연하다', a: '어떤 마케팅 업무? 누가, 얼마나 자주? 예: “SNS 게시물 문구 초안 만들기”.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('tc-score').textContent = opened + ' / ' + items.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  })();
})();
