// 12주 2차시 전용: 개요 프롬프트 조립기, 슬라이드 다듬기, AI 원고 숫자 확인
(function () {
  const $ = (id) => document.getElementById(id);
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ───────── 1) 개요 프롬프트 조립기 ───────── */
  (function outlineBuilder() {
    const pre = $('ob-pre'); if (!pre) return;
    const st = { aud: 'exec', goal: 'decide', n: '5', title: true, vis: true, note: false, num: true };
    let prev = [];
    const AUD = { exec: '대표와 팀장들(경영 회의)', all: '전 직원(월례 공유 시간)' };
    const GOAL = {
      decide: ['듣고 나서 4분기 광고비를 채널별로 어떻게 나눌지 결정해야 해.', '3분기 매출은 늘었지만 오픈마켓 광고비가 매출보다 더 빨리 늘었다. 4분기 광고비를 다시 나누자.'],
      share: ['듣고 나서 3분기 성과를 함께 알고 4분기 목표를 공유하면 돼.', '3분기 매출이 2분기보다 늘었고, 선물 세트와 자사몰이 성장을 이끌었다.'],
    };
    function lines() {
      const L = [];
      L.push('너는 사내 발표 자료를 기획하는 직원이야.');
      L.push(`[상황] 가상 회사 바다결의 2026년 3분기(7~9월) 실적을 ${AUD[st.aud]}에게 발표해. ${GOAL[st.goal][0]}`);
      L.push(`[핵심 메시지] ${GOAL[st.goal][1]}`);
      L.push(`[요청] 슬라이드 ${st.n}장짜리 발표 개요를 표로 만들어 줘.`);
      const cols = ['번호'];
      if (st.title) { L.push('- 제목은 주제가 아니라 결론이 드러나는 한 문장으로.'); cols.push('제목(결론 한 문장)'); } else cols.push('제목');
      if (st.vis) { L.push('- 장마다 넣을 시각 자료(차트 종류)를 한 줄로 제안해.'); cols.push('시각 자료'); }
      if (st.note) { L.push('- 장마다 말하듯이 쓴 발표자 노트를 2~3문장으로.'); cols.push('발표자 노트'); }
      if (st.aud === 'all') L.push('- 처음 듣는 직원도 알아듣게 용어(예: 매출 대비 광고비)를 쉽게 풀어 줘.');
      if (st.num) L.push('- 숫자는 내가 원자료로 확인해서 채울 테니 [ ]로 비워 둬. 숫자를 지어내지 마.');
      L.push(`[형식] 표의 열: ${cols.join(' | ')}`);
      return L;
    }
    function render() {
      const L = lines();
      pre.innerHTML = L.map((l) => (prev.length && !prev.includes(l) ? `<span class="new">${esc(l)}</span>` : esc(l))).join('\n');
      prev = L;
      const m = [];
      if (!st.num) m.push('<strong>숫자 조건이 빠졌습니다.</strong> 자료 없이 숫자를 쓰면 AI가 그럴듯한 숫자를 지어낼 수 있습니다.');
      if (st.n === '8') m.push('장이 늘면 한 장의 메시지가 흐려지기 쉽습니다. 회의 안건 하나라면 5장으로 충분한지 생각해 보세요.');
      if (!st.title) m.push('제목 조건이 없으면 “3분기 실적”처럼 <strong>주제만 있는 제목</strong>이 나오기 쉽습니다.');
      if (st.aud === 'all' && st.goal === 'decide') m.push('전 직원 앞에서 광고비 배분을 <strong>결정</strong>하는 일은 드뭅니다. 청중과 목적이 맞는지 확인!');
      if (!m.length) m.push(st.goal === 'decide' ? '청중·목적·메시지·형식이 모두 들어간 프롬프트입니다. 복사해서 붙여 넣어 보세요.' : '결과 공유용이라 메시지가 <strong>성과 중심</strong>으로 바뀌었습니다. 같은 데이터, 다른 메시지.');
      $('ob-msg').innerHTML = m.join('<br>');
    }
    document.querySelectorAll('.seg').forEach((g) => {
      g.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
        st[g.dataset.k] = b.dataset.v; render();
      }));
    });
    document.querySelectorAll('.tgl[data-t]').forEach((b) => b.addEventListener('click', () => { st[b.dataset.t] = toggle(b); render(); }));
    render();
  })();

  /* ───────── 2) 슬라이드 다듬기 ───────── */
  (function polish() {
    const box = $('ms'); if (!box) return;
    const st = { title: false, cut: false, vis: false, src: false };
    const T0 = '3분기 실적 관련 보고';
    const T1 = '3분기 매출 11.4% 증가 — 선물 세트와 자사몰이 이끌었다';
    const B0 = [
      '3분기(7~9월) 매출은 125,883,900원으로 2분기의 113,007,200원과 비교했을 때 증가하였으며 이는 여러 요인에 의한 것으로 보임',
      '제품별로 보면 선물 세트가 크게 증가하였고 오리지널 그래놀라는 여전히 매출 비중이 가장 높으며 미역귀 현미칩은 소폭 증가함',
      '채널별로는 자사몰과 오프라인 매장이 늘었고 오픈마켓도 늘었으나 광고비가 많이 증가하여 효율이 낮아진 것으로 판단됨',
      '향후 광고비 효율화 방안에 대한 검토가 필요할 것으로 사료됨',
    ];
    const B1 = ['선물 세트 매출 +37.2%', '자사몰 매출 +13.5%', '오프라인 매장 매출 +16.0%'];
    const count = (s) => s.replace(/\s/g, '').length;
    const FULL = count(T0) + B0.reduce((a, b) => a + count(b), 0);
    function render() {
      const t = $('ms-title'); t.textContent = st.title ? T1 : T0; t.classList.toggle('clean', st.title);
      const body = $('ms-body'); body.classList.toggle('clean', st.cut);
      body.innerHTML = (st.cut ? B1 : B0).map((x) => `<li>${x}</li>`).join('') + (st.cut ? '<li class="note">→ 오픈마켓 광고비 이야기는 4번 슬라이드에서 따로</li>' : '');
      $('ms-vis').classList.toggle('on', st.vis);
      $('ms-src').classList.toggle('on', st.src);
      const n = count(t.textContent) + (st.cut ? B1 : B0).reduce((a, b) => a + count(b), 0);
      $('ms-n').textContent = n + '자';
      $('ms-n').classList.toggle('o', n > 100);
      $('ms-bar').style.width = Math.round(n / FULL * 100) + '%';
      const left = [];
      if (!st.title) left.push('제목이 주제뿐 — 결론이 없습니다');
      if (!st.cut) left.push('네 문장에 이야기가 세 가지(매출·제품·광고비)');
      if (!st.vis) left.push('강조할 숫자가 문장 속에 묻혀 있습니다');
      if (!st.src) left.push('어느 자료, 어느 기간인지 알 수 없습니다');
      $('ms-msg').innerHTML = left.length
        ? '<strong>남은 문제</strong><br>· ' + left.join('<br>· ')
        : `<strong>완성!</strong> 글자 수 ${FULL}자 → ${n}자. 한 장에 메시지 하나, 숫자 하나, 출처 하나.`;
    }
    document.querySelectorAll('.tgl[data-m]').forEach((b) => b.addEventListener('click', () => { st[b.dataset.m] = toggle(b); render(); }));
    render();
  })();

  /* ───────── 3) AI 원고 숫자 확인 ───────── */
  (function numCards() {
    const wrap = $('ncards'); if (!wrap) return;
    // 정답 값: sales_2026.csv 를 분기(3개월 합계)로 묶어 계산
    const items = [
      { n: '“3분기 매출은 약 1억 2,588만 원입니다.”', k: 'yes', v: '맞음 ✓', a: '7~9월 매출 합계 125,883,900원.' },
      { n: '“2분기보다 매출이 15% 늘었습니다.”', k: 'no', v: '틀림 ✕ → 11.4%', a: '113,007,200원 → 125,883,900원. (125,883,900 ÷ 113,007,200 − 1) × 100 ≈ 11.4' },
      { n: '“선물 세트 매출은 37.2% 늘었습니다.”', k: 'yes', v: '맞음 ✓', a: '2분기 1,539만 원 → 3분기 2,112만 원.' },
      { n: '“3분기 반품률은 3%입니다.”', k: 'no', v: '틀림 ✕ → 1.7%', a: '반품 189개 ÷ 판매 11,241개 ≈ 1.7%. 오픈마켓만 보면 2.6% — 어느 범위의 숫자인지 확인.' },
      { n: '“고객 만족도는 95%입니다.”', k: 'mid', v: '근거 없음 ✕', a: '판매 파일에 만족도 열이 없다. 후기 별점 4~5점 비율(68%)과도 다른, 지어낸 숫자.' },
      { n: '“오픈마켓 광고비는 17.8% 늘었습니다.”', k: 'yes', v: '맞음 ✓', a: '2분기 2,123만 원 → 3분기 2,500만 원. 같은 기간 오픈마켓 매출은 7.9% 증가.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('nc-score').textContent = opened + ' / ' + items.length + ' 확인' + (opened === items.length ? ' — 6개 중 3개가 틀렸거나 근거가 없습니다. 숫자는 모두 원자료로!' : '');
      });
      wrap.appendChild(b);
    });
  })();
})();
