// 10주 3차시 전용: 캠페인 보드(목표 → 채널·콘텐츠·지표), 아이디어 고르기, 발행 전 체크리스트
(function () {
  const $ = (id) => document.getElementById(id);

  /* ───────── 1) 캠페인 보드 ───────── */
  (function board() {
    const wrap = $('board'); if (!wrap) return;
    // 근거 숫자는 sales_2026.csv·reviews_2026.csv(가상)에서 python3로 계산
    const G = {
      aware: {
        msg: '<strong>알리기</strong>는 많은 사람에게 보이는 것이 먼저. 하지만 보였다고 산다는 보장은 없습니다.',
        ch: [['인스타그램 피드', '사진·후기 카드로 첫인상'], ['짧은 영상', '바쁜 아침 장면 — 반응은 <b>가설</b>, 직접 비교해 확인']],
        ct: [['아침 한 줌 15초 영상', '상황을 보여 주는 콘텐츠'], ['후기 한 줄 카드', '실제 후기로 신뢰']],
        kp: [['도달·조회 수', '보기 단계'], ['저장·공유 수', '반응 단계'], ['주의', '조회 수만으로 성공이라 하지 않는다', true]] },
      first: {
        msg: '<strong>처음 사 보게 하기</strong>는 구매까지 가는 길을 짧게. 링크·쿠폰으로 “어디서 샀는지”를 잴 수 있게 합니다.',
        ch: [['자사몰', '9월 매출이 1월보다 27% 많음'], ['인스타그램 피드 + 링크', '피드에서 자사몰로'], ['오픈마켓 광고', '광고비 58% 사용·매출 47% — 회사 고민 ①, 늘리기 전에 따져 보기', true]],
        ct: [['첫 구매 쿠폰 안내 게시물', '쿠폰 조건은 사람이 확정'], ['후기 한 줄 카드', '구매를 망설이는 이유에 답하기']],
        kp: [['링크 클릭 수', '행동 단계'], ['첫 구매 고객 수', '구매 단계 — 목표에 가장 가까움'], ['쿠폰 사용 건수', '어떤 콘텐츠에서 왔는지 코드별로']] },
      store: {
        msg: '<strong>매장 → 온라인</strong>: “부산 여행 때 매장에서 먹어 보고 주문했어요” 후기 13건이 출발점. 이미 맛본 사람을 자사몰로 잇습니다.',
        ch: [['오프라인 매장 2곳', '맛보기 + 안내 카드'], ['자사몰', '카드의 쿠폰 코드로 첫 구매'], ['인스타그램 피드', '매장 방문 전후로 다시 보기']],
        ct: [['매장 맛보기 + 자사몰 쿠폰 카드', '쿠폰 코드를 매장별로 다르게'], ['후기 한 줄 카드', '“매장에서 맛보고 주문” 후기 활용'], ['아침 한 줌 15초 영상', '집에서의 아침 장면']],
        kp: [['쿠폰 사용 건수', '매장별·코드별로 세기'], ['자사몰 첫 구매 고객 수', '시작 전 4주와 비교'], ['주의', '“양이 적어요” 후기 7건이 모두 매장 — 매장 제품 구성도 확인', true]] },
      again: {
        msg: '<strong>다시 사게 하기</strong>는 이미 산 고객에게. 연락할 수 있는 고객인지, 수신 동의가 있는지부터 확인합니다.',
        ch: [['광고 문자·알림', '<b>수신 동의한 고객만</b> · “(광고)” 표시 · 수신거부 방법'], ['자사몰', '재구매 혜택 안내']],
        ct: [['아침 메뉴 활용법 카드', '요거트·우유와 함께 먹는 방법'], ['재구매 혜택 문자', '짧게, CTA 하나']],
        kp: [['재구매 고객 수', '같은 고객이 다시 산 수'], ['수신거부 수', '보내는 횟수가 지나치지 않은지'], ['주의', '지금 판매 기록에는 신규·재구매 구분이 없다 — 잴 방법부터', true]] },
    };
    const COLS = [['ch', 'map', '추천 채널'], ['ct', 'layers', '콘텐츠 예'], ['kp', 'chart', '성과 지표']];
    function pick(k) {
      const g = G[k];
      wrap.innerHTML = COLS.map(([key, ic, name]) => `<div class="col"><div class="ch"><svg class="ic"><use href="#i-${ic}"/></svg>${name}</div>` +
        g[key].map(([a, b, w]) => `<div class="kc${w ? ' warn' : ''}"><b>${a}</b><small>${b}</small></div>`).join('') + '</div>').join('');
      $('bd-msg').innerHTML = g.msg + '<br><span class="muted">타깃(서윤)과 핵심 메시지는 그대로입니다.</span>';
      document.querySelectorAll('#goals .btn').forEach((b) => b.setAttribute('aria-pressed', b.dataset.g === k));
    }
    document.querySelectorAll('#goals .btn').forEach((b) => b.addEventListener('click', () => pick(b.dataset.g)));
    pick('store');
  })();

  /* ───────── 2) 아이디어 고르기 ───────── */
  (function ideas() {
    const wrap = $('ideas'); if (!wrap) return;
    // fit: 페르소나 적합, ev: 근거, cost: 준비 부담, risk: 위험 (g=좋음, y=주의, r=위험)
    const I = [
      { t: '아침 한 줌 15초 영상', f: '짧은 영상', tg: [['g', '페르소나 ○'], ['g', '근거: 아침 후기 15건'], ['g', '준비 쉬움']], risk: 0, why: '서윤의 아침 장면을 그대로 보여 준다. 음악 이용 조건만 확인.' },
      { t: '후기 한 줄 카드', f: '인스타그램 피드', tg: [['g', '페르소나 ○'], ['g', '근거: 후기 원문'], ['y', '작성자 정보 가리기']], risk: 1, why: '실제 후기라 신뢰를 준다. 원문을 고치지 않고, 작성자를 알아볼 수 없게.' },
      { t: '매장 맛보기 + 자사몰 쿠폰 카드', f: '매장 안내 카드', tg: [['g', '목표와 직결'], ['g', '근거: 매장 후기 13건'], ['y', '쿠폰 조건 확정']], risk: 0, why: '목표(매장 → 온라인)에 가장 가깝고, 쿠폰 사용 수로 잴 수 있다.' },
      { t: '2주 다이어트 챌린지: 먹고 몸무게 인증', f: '인스타그램 피드', tg: [['r', '체중 감량 표방'], ['r', '건강 효능 오인'], ['y', '참여자 개인정보']], risk: 3, why: '일반식품에 체중 감량 효과를 떠올리게 한다 — 10-2의 금지 유형. 탈락.' },
      { t: '유명 연예인 사진에 제품 합성', f: '이미지 광고', tg: [['r', '초상권·사칭'], ['r', '저작권'], ['r', '소비자 기만']], risk: 3, why: '실존 인물이 추천하는 것처럼 보이게 하는 것은 안 된다. 저작권·표시는 11주에서.' },
      { t: '타사 그래놀라와 당 함량 비교표', f: '블로그', tg: [['r', '근거 없는 비교'], ['y', '수치 확인 필요'], ['y', '준비 어려움']], risk: 2, why: '객관적 근거 없이 다른 회사와 비교하면 금지 유형. 수치도 확인이 어렵다.' },
      { t: '부산 여행 코스 + 간식 지도', f: '블로그', tg: [['y', '다른 페르소나(여행객)'], ['g', '근거: 여행 후기 13건'], ['y', '지도·사진 이용 조건']], risk: 1, why: '좋은 아이디어지만 서윤보다 “여행 중인 고객”에 맞는다. 다음 캠페인 후보.' },
      { t: '아침 메뉴 공유 댓글 이벤트', f: '인스타그램 피드', tg: [['g', '반응 늘리기'], ['y', '경품 조건 안내'], ['y', '당첨자 개인정보']], risk: 1, why: '반응은 늘 수 있지만 구매로 이어지는지는 따로 재야 한다. 개인정보 수집은 최소로.' },
    ];
    const on = [];
    function render() {
      wrap.querySelectorAll('.idea').forEach((b, i) => b.setAttribute('aria-pressed', on.includes(i)));
      const p = $('picked');
      p.innerHTML = [0, 1, 2].map((k) => on[k] === undefined ? '<div class="empty">비어 있음</div>' : `<div><b>${I[on[k]].t}</b><br><span class="muted" style="font-size:13px">${I[on[k]].f}</span></div>`).join('');
      const st = $('id-st');
      const risky = on.filter((i) => I[i].risk >= 2);
      if (!on.length) { st.className = 'status mid'; st.innerHTML = '<b class="k">아이디어를 눌러 보세요</b>카드 아래의 표시를 보고 판단합니다.'; return; }
      const last = I[on[on.length - 1]];
      if (risky.length) { st.className = 'status bad'; st.innerHTML = `<b class="k">위험한 아이디어 ${risky.length}개</b>${I[risky[risky.length - 1]].why}`; }
      else if (on.length < 3) { st.className = 'status mid'; st.innerHTML = `<b class="k">${on.length} / 3</b>${last.why}`; }
      else {
        const best = [0, 1, 2].every((i) => on.includes(i));
        st.className = 'status ok';
        st.innerHTML = best ? '<b class="k">3개 완성 — 오늘의 예시와 같은 조합</b>영상·피드·매장 카드로 채널이 겹치지 않고, 모두 근거가 있으며, 목표(매장 → 온라인)를 잴 수 있습니다.'
          : `<b class="k">3개 완성</b>${last.why} 위험한 아이디어는 없습니다. 목표와 가장 가까운 것이 들어 있는지 한 번 더 보세요.`;
      }
    }
    I.forEach((it, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'idea' + (it.risk >= 2 ? ' risky' : ''); b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="t">${it.t}</span><span class="f">${it.f}</span><span class="tags">${it.tg.map(([c, s]) => `<span class="${c}">${s}</span>`).join('')}</span>`;
      b.addEventListener('click', () => {
        const k = on.indexOf(i);
        if (k >= 0) on.splice(k, 1); else { if (on.length >= 3) on.shift(); on.push(i); }
        render();
      });
      wrap.appendChild(b);
    });
    render();
  })();

  /* ───────── 3) 발행 전 체크리스트 ───────── */
  (function checklist() {
    const wrap = $('clist'); if (!wrap) return;
    const C = [
      ['사실 확인', '후기 문장을 원본 파일과 대조했다', '한 글자도 고치지 않은 원문인가'],
      ['사실 확인', '제품명·가격(13,500원)·구매처가 맞다', 'AI가 지어낸 연혁·수치가 없다'],
      ['과장 표현', '효능·체중·최상급 표현이 없다', '10-2 과장 표현 검사 + 사람이 다시 읽기'],
      ['표시 의무', '대가를 받은 후기·추천이면 광고 표시를 했다', '협찬·체험단 후기라면 “광고·협찬”을 제목·첫 부분에'],
      ['저작권', '사진·글꼴·배경 음악의 이용 조건을 확인했다', 'AI로 만든 이미지의 표시는 11-3에서'],
      ['개인정보', '후기 작성자를 알아볼 수 없게 가렸다', '이름·아이디·얼굴이 보이지 않는가 (1-3)'],
      ['성과 측정', '쿠폰 코드·링크가 준비되어 있다', '시작 전 기준값을 기록했다'],
      ['최종 승인', '담당자가 최종 문구를 읽고 승인했다', 'AI가 “문제없음”이라고 한 것으로 대신하지 않는다'],
    ];
    const on = new Set();
    C.forEach(([g, t, s], i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tgl'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="chk"></span><span><span class="g">${g}</span>${t}<small>${s}</small></span>`;
      b.addEventListener('click', () => { on.has(i) ? on.delete(i) : on.add(i); b.setAttribute('aria-pressed', on.has(i)); render(); });
      wrap.appendChild(b);
    });
    function render() {
      const n = on.size;
      $('cl-n').textContent = n + ' / ' + C.length;
      $('cl-bar').style.width = (n / C.length * 100) + '%';
      const st = $('cl-st');
      const miss = C.filter((c, i) => !on.has(i)).map((c) => c[0]);
      const uniq = [...new Set(miss)];
      if (n === C.length) { st.className = 'status ok'; st.innerHTML = '<b class="k">발행 가능</b>모든 항목을 사람이 확인했습니다. 발행 후에도 댓글·문의를 살피고, 지표를 기록합니다.'; }
      else if (n >= 5) { st.className = 'status mid'; st.innerHTML = `<b class="k">거의 다 왔습니다 · 발행 보류</b>남은 항목: ${uniq.join(', ')}`; }
      else { st.className = 'status bad'; st.innerHTML = `<b class="k">발행 보류</b>아직 확인하지 않은 항목: ${uniq.join(', ')}`; }
    }
    render();
  })();
})();
