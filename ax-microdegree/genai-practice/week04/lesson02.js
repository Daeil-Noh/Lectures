// 4주 2차시 전용: 템플릿으로 만들까? 카드, 템플릿 빈칸 채우기, 점검표로 템플릿 고치기
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };
  // 입력 칸에서 스페이스·화살표·F 키가 슬라이드 넘김으로 가지 않게
  const keepKeys = (node) => node.addEventListener('keydown', (e) => e.stopPropagation());

  /* ───────── 1) 템플릿으로 만들까? ───────── */
  (function cards() {
    const wrap = $('tcards'); if (!wrap) return;
    const items = [
      { ic: 'log', n: '매주 금요일 주간 보고', k: 'ok', v: '템플릿 ○', a: '매주 반복, 항목도 같다. 바뀌는 건 그 주의 메모뿐.' },
      { ic: 'user', n: '월요일 회의 메모 → 회의록', k: 'ok', v: '템플릿 ○', a: '회의마다 메모만 다르고 정리 형식은 같다.' },
      { ic: 'chat', n: '하루 여러 건의 고객 문의 답변', k: 'ok', v: '템플릿 ○', a: '가장 자주 반복된다. 단, 고객 이름·주문번호는 지우고 붙여 넣는다.' },
      { ic: 'sparkles', n: '창립 10주년 대표 인사말', k: 'one', v: '그냥 대화로', a: '한 번뿐인 일. 틀을 만들기보다 대화로 여러 번 다듬는 편이 낫다.' },
      { ic: 'book', n: '분기마다 내는 보도자료', k: 'ok', v: '템플릿 ○', a: '자주는 아니어도 구성이 정해져 있다. 지난번 프롬프트를 살려 두면 된다.' },
      { ic: 'bulb', n: '신제품 이름 아이디어 내기', k: 'one', v: '그냥 대화로', a: '정해진 형식보다 자유로운 발상이 중요하다. 대화로 주고받는다.' },
      { ic: 'chart', n: '매달 광고비 점검표 요약', k: 'ok', v: '템플릿 ○', a: '매달 같은 표를 같은 방식으로 요약한다. 숫자는 원본과 꼭 대조.' },
      { ic: 'shield', n: '동료 직원 평가 의견 정리', k: 'warn', v: '주의 · 넣지 않기', a: '개인에 관한 민감한 정보다. 회사 지침 없이 생성형AI에 넣지 않는다.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="ic-badge ${it.k === 'warn' ? 'o' : it.k === 'one' ? 'g' : ''}"><svg class="ic"><use href="#i-${it.ic}"/></svg></span><span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('tc-score').textContent = opened + ' / ' + items.length + ' 확인' + (opened === items.length ? ' — 반복되고 형식이 정해진 일일수록 템플릿이 효과적입니다.' : '');
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 2) 템플릿 빈칸 채우기 ───────── */
  // 템플릿 문장은 materials/prompt_templates.md 와 똑같이 유지한다
  const T = {
    meet: {
      name: '회의록정리_팀공유용_v1',
      f: [
        { k: 'team', l: '회사·팀', type: 'text', v: '바다결 온라인 마케팅팀' },
        { k: 'reader', l: '읽는 사람', type: 'select', o: ['회의에 참석하지 못한 팀원', '대표님', '함께 일하는 협력 업체 담당자'] },
        { k: 'len', l: '분량', type: 'select', o: ['A4 한 쪽 이내', 'A4 반 쪽', '다섯 줄 요약'] },
      ],
      body: '너는 {team}의 회의록 담당자야.\n아래 회의 메모를 읽고 회의록으로 정리해 줘.\n- 읽는 사람: {reader}\n- 분량: {len}\n- 항목: 회의 개요(날짜·참석자) / 논의 내용 / 결정 사항 / 할 일 표(할 일·담당자·기한)\n- 메모에 없는 내용은 지어내지 말고 \'확인 필요\'라고 표시해 줘.\n\n[회의 메모]\n(여기에 회의 메모를 붙여 넣기)',
    },
    ask: {
      name: '고객문의답변_자사몰_v1',
      f: [
        { k: 'co', l: '회사', type: 'text', v: '바다결' },
        { k: 'tone', l: '말투', type: 'select', o: ['정중하고 따뜻하게', '간결하고 사무적으로'] },
        { k: 'len', l: '분량', type: 'select', o: ['4~5문장', '2~3문장', '6~8문장'] },
        { k: 'dept', l: '담당 부서', type: 'text', v: '경영지원팀' },
      ],
      body: '너는 {co}의 고객 상담 담당자야.\n아래 고객 문의에 보낼 답변을 써 줘.\n- 말투: {tone}\n- 분량: {len}\n- 순서: 문의 내용 확인 → 답변 또는 처리 방법 → 추가 안내 → 마무리 인사\n- 환불·보상·배송 일정처럼 회사가 정해야 하는 내용은 약속하지 말고, {dept}에서 확인한 뒤 안내한다고 써 줘.\n- 고객 이름·연락처·주문번호는 쓰지 말고 \'고객님\'이라고 불러 줘.\n\n[고객 문의]\n(여기에 문의 내용을 붙여 넣기 — 이름·연락처·주문번호는 지우고)',
    },
    press: {
      name: '보도자료초안_신제품_v1',
      f: [
        { k: 'co', l: '회사', type: 'text', v: '바다결' },
        { k: 'what', l: '알릴 내용', type: 'text', v: '추석 선물 세트 출시' },
        { k: 'who', l: '독자', type: 'select', o: ['지역 신문 기자', '식품 업계 전문지 기자', '자사몰 고객'] },
        { k: 'len', l: '분량', type: 'select', o: ['A4 한 쪽', '800자 내외'] },
      ],
      body: '너는 {co}의 홍보 담당자야.\n아래 자료로 보도자료 초안을 써 줘.\n- 알릴 내용: {what}\n- 독자: {who}\n- 분량: {len}\n- 구성: 제목 / 부제 / 첫 문단(누가·언제·어디서·무엇을) / 본문 / 회사 소개 한 문단\n- 자료에 없는 숫자·인용문·수상 경력은 만들지 말고 \'(확인 필요)\'로 남겨 둬.\n\n[자료]\n(여기에 사실 자료를 붙여 넣기 — 출시일, 가격, 구성, 판매처 등)',
    },
    week: {
      name: '주간보고_팀장보고용_v1',
      f: [
        { k: 'team', l: '팀', type: 'text', v: '바다결 온라인 마케팅팀' },
        { k: 'reader', l: '읽는 사람', type: 'select', o: ['팀장님', '대표님'] },
        { k: 'len', l: '분량', type: 'select', o: ['항목당 2~3줄', '전체 10줄 이내'] },
      ],
      body: '너는 {team} 소속 직원이야.\n아래 이번 주 업무 메모로 {reader}께 올릴 주간 보고를 써 줘.\n- 분량: {len}\n- 항목: 이번 주 한 일 / 성과·수치 / 문제와 도움이 필요한 일 / 다음 주 계획\n- 각 항목은 글머리표로 쓰고, 숫자는 메모에 있는 것만 써 줘. 없는 숫자는 \'확인 필요\'.\n\n[업무 메모]\n(여기에 이번 주 업무 메모를 붙여 넣기)',
    },
  };
  (function filler() {
    const sel = $('tf-sel'); if (!sel) return;
    const fields = $('tf-fields'), pre = $('tf-pre');
    let cur = 'meet', vals = {};
    function build() {
      fields.innerHTML = '';
      vals = {};
      T[cur].f.forEach((f) => {
        const w = document.createElement('div'); w.className = 'fld';
        const id = 'tf-' + cur + '-' + f.k;
        w.innerHTML = `<label for="${id}">[${f.l}]</label>`;
        let inp;
        if (f.type === 'select') {
          inp = document.createElement('select');
          inp.innerHTML = '<option value="">(비워 두기)</option>' + f.o.map((o) => `<option>${esc(o)}</option>`).join('');
          inp.value = f.o[0];
        } else {
          inp = document.createElement('input'); inp.type = 'text'; inp.value = f.v; inp.setAttribute('autocomplete', 'off');
        }
        inp.id = id;
        keepKeys(inp);
        inp.addEventListener('input', () => { vals[f.k] = inp.value.trim(); render(); });
        inp.addEventListener('change', () => { vals[f.k] = inp.value.trim(); render(); });
        vals[f.k] = inp.value.trim();
        w.appendChild(inp); fields.appendChild(w);
      });
      render();
    }
    function render() {
      const t = T[cur];
      let filled = 0;
      const lab = {}; t.f.forEach((f) => (lab[f.k] = f.l));
      const html = esc(t.body).replace(/\{(\w+)\}/g, (m, k) => {
        const v = vals[k];
        if (v) { filled++; return `<mark class="fill">${esc(v)}</mark>`; }
        return `<mark class="empty">[${lab[k]}]</mark>`;
      });
      pre.innerHTML = html;
      $('tf-name').textContent = t.name;
      const total = t.f.length;
      $('tf-n').textContent = filled + ' / ' + total;
      $('tf-n').classList.toggle('o', filled < total);
      $('tf-msg').innerHTML = filled < total
        ? `빈칸 <strong>${total - filled}개</strong>가 남았습니다. 빨간 <strong>[ ]</strong>를 그대로 보내면 AI가 빈칸 이름을 내용으로 착각할 수 있습니다.`
        : '빈칸을 다 채웠습니다. <strong>복사</strong>해서 Gemini나 Claude에 붙여 넣고, 맨 아래 자리에 자료를 붙여 넣으세요.';
    }
    sel.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      cur = b.dataset.t;
      sel.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
      build();
    }));
    build();
  })();

  /* ───────── 3) 점검표로 템플릿 고치기 ───────── */
  (function checklist() {
    const tg = $('ck-tg'); if (!tg) return;
    const C = [
      { k: 'name', l: '① 이름과 용도가 있다' },
      { k: 'role', l: '② 역할·맥락이 고정돼 있다' },
      { k: 'blank', l: '③ 바뀌는 부분이 [빈칸]이다' },
      { k: 'form', l: '④ 형식·분량이 정해져 있다' },
      { k: 'care', l: '⑤ 주의 사항이 있다' },
      { k: 'use', l: '⑥ 쓰는 법이 적혀 있다' },
    ];
    const on = {};
    C.forEach((c) => {
      on[c.k] = false;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tgl'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span class="chk"></span>' + c.l;
      b.addEventListener('click', () => { on[c.k] = toggle(b); render(); });
      tg.appendChild(b);
    });
    const M = (t) => `<mark>${t}</mark>`;
    const B = (t) => on.blank ? `<b class="bk">${t}</b>` : null;
    function render() {
      const title = $('ck-title');
      if (on.name) { title.className = 'dt'; title.innerHTML = M('주간보고_팀장보고용_v1') + ' <span style="font-weight:600;color:var(--muted);font-size:14px">· 매주 금요일, 팀장님께 올릴 주간 보고</span>'; }
      else { title.className = 'dt none'; title.textContent = '제목 없음'; }
      const team = B('[팀]') || '바다결 온라인 마케팅팀', reader = B('[읽는 사람]') || '팀장님', len = B('[분량]') || '항목당 2~3줄', memo = B('[업무 메모]') || '메모';
      let L = [];
      if (on.role) L.push(M(`너는 ${team} 소속 직원이야.`), M(`아래 이번 주 업무 메모로 ${reader}께 올릴 주간 보고를 써 줘.`));
      else L.push('주간 보고 써 줘.');
      if (on.form) L.push(M(`- 분량: ${len}`), M('- 항목: 이번 주 한 일 / 성과·수치 / 문제와 도움이 필요한 일 / 다음 주 계획'));
      if (on.care) L.push(M("- 숫자는 메모에 있는 것만 써 줘. 없는 숫자는 '확인 필요'."), M('- 사람 이름·고객 정보는 넣지 않는다.'));
      L.push('', on.blank ? `<b class="bk">[업무 메모]</b>\n${M('(여기에 이번 주 업무 메모를 붙여 넣기)')}` : memo);
      $('ck-pre').innerHTML = L.join('\n');
      $('ck-use').innerHTML = on.use ? M('쓰는 법: 금요일 오후, 그 주 업무 메모를 [업무 메모] 자리에 붙여 넣는다. 대괄호는 지우고 채운다.') : '<span style="opacity:.6">쓰는 법: (없음)</span>';
      const n = C.filter((c) => on[c.k]).length;
      $('ck-n').textContent = n + ' / 6';
      $('ck-bar').style.width = (n / 6 * 100) + '%';
      const miss = C.filter((c) => !on[c.k]).map((c) => c.l.slice(2));
      const st = $('ck-st');
      if (n === 6) { st.className = 'status ok'; st.innerHTML = '<b class="k">팀에 공유해도 좋은 템플릿</b>누가 꺼내 써도 같은 형식의 결과가 나옵니다. 저장하고 버전 기록을 남기세요.'; }
      else if (n >= 3) { st.className = 'status mid'; st.innerHTML = `<b class="k">거의 다 왔다</b>빠진 것: ${miss.join(', ')}`; }
      else { st.className = 'status bad'; st.innerHTML = '<b class="k">아직 메모 수준</b>“주간 보고 써 줘”만으로는 매번 결과가 다르고, 다른 사람이 쓰기도 어렵습니다. 항목을 하나씩 켜 보세요.'; }
    }
    render();
  })();
})();
