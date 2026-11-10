// 5주 2차시 전용: 어조 슬라이더, 받는 사람 맞추기, 문장 고치기 카드
(function () {
  const $ = (id) => document.getElementById(id);

  /* ───────── 1) 어조 슬라이더 (미리 써 둔 다섯 문장) ───────── */
  (function tone() {
    const s = $('t-s'); if (!s) return;
    const T = [
      { n: '지나치게 딱딱', fit: 30, k: 'mid', h: '공문보다 차갑다',
        t: '귀사의 무궁한 발전을 기원합니다.\n당사 선물 세트의 납품 일정이 포장 자재 입고 지연으로 인하여 부득이하게 변경되었음을 통보하오니 양지하시기 바랍니다.',
        v: '“통보”, “양지하시기 바랍니다” — 미안한 마음이 전해지지 않고, 상대가 해야 할 일도 없습니다.' },
      { n: '격식 있게', fit: 75, k: 'ok', h: '무난하다',
        t: '윤재희 담당자님께,\n11월 2일 발주하신 선물 세트의 납품 일정이 변경되어 안내드립니다. 포장 상자 입고가 늦어져 11. 12.(목) 오전 도착으로 조정되었습니다. 미리 알려 드리지 못한 점 사과드립니다.',
        v: '처음 거래하는 곳이나 공식 안내에 알맞습니다. 그래놀라 일정과 회신 요청이 더해지면 좋습니다.' },
      { n: '정중한 업무체', fit: 95, k: 'ok', h: '거래처에 가장 알맞다',
        t: '윤재희 담당자님, 안녕하세요. 바다결 영업 담당 김하늘입니다.\n먼저 출고 일정을 미리 알려 드리지 못해 죄송합니다. 선물 세트는 포장 상자 입고가 늦어져 11. 12.(목) 오전에 도착하도록 보내 드리겠습니다. 그래놀라 60봉은 예정대로 11. 6.(금)에 받으실 수 있습니다.',
        v: '사과 → 바뀐 날짜 → 대안이 분명하고, 말투는 공손하지만 딱딱하지 않습니다.' },
      { n: '친근하게', fit: 45, k: 'mid', h: '사이에 따라 다르다',
        t: '재희 님, 안녕하세요!\n선물 세트가 조금 늦어질 것 같아요ㅠ 상자가 늦게 들어와서 12일 오전에 도착할 예정이에요. 그래놀라는 6일에 먼저 보내 드릴게요!',
        v: '오래 알고 지낸 담당자라면 몰라도, 업무 메일로는 가볍습니다. <strong>사과가 빠졌습니다.</strong>' },
      { n: '지나치게 가볍게', fit: 8, k: 'bad', h: '신뢰를 잃는다',
        t: '선물세트 좀 늦어요~ 12일쯤 갈 듯?\n그래놀라는 낼 보낼게요 ㅎㅎ',
        v: '“쯤”, “듯” — 날짜가 흐리고, 반말과 웃음 표시까지. 거래처가 진열 계획을 세울 수 없습니다.' },
    ];
    function update() {
      const v = T[+s.value - 1];
      $('t-o').textContent = v.n;
      $('t-txt').textContent = v.t;
      $('t-bar').style.width = v.fit + '%';
      $('t-bar').style.background = v.k === 'bad' ? 'var(--bad)' : v.k === 'mid' ? 'var(--accent-2)' : 'var(--ok)';
      const st = $('t-st'); st.className = 'status ' + v.k;
      st.innerHTML = `<b class="k">${v.h}</b>${v.v}`;
    }
    s.addEventListener('input', update);
    update();
  })();

  /* ───────── 2) 이 문장은 누구에게? ───────── */
  (function recipients() {
    const wrap = $('rcards'); if (!wrap) return;
    const R = { c: '고객', s: '거래처', b: '상사' };
    const items = [
      { a: 'c', t: '주문하신 선물 세트가 파손된 채로 도착해 정말 죄송합니다. 새 상품으로 바꿔 드릴지, 환불해 드릴지 편하신 쪽을 알려 주세요.', w: '공감 + 고를 수 있는 해결책 + 쉬운 말 → 고객' },
      { a: 'b', t: '결론부터 말씀드리면, 카페 온담 선물 세트 납품이 11. 12.로 늦어집니다. 분할 납품으로 대응하려 합니다.', w: '결론 먼저 + 내가 할 대응 → 상사에게 하는 보고' },
      { a: 's', t: '분할 납품 시 추가 배송비는 당사가 부담하겠습니다. 진열 일정에 지장이 없을지 회신 부탁드립니다.', w: '조건(배송비) + 회신 요청, “당사” → 거래처' },
      { a: 'b', t: '고객 보상으로 적립금 3,000원을 드리려 합니다. 규정 범위 안인데 이대로 진행해도 될까요?', w: '내가 받아야 할 승인을 묻는다 → 상사' },
      { a: 's', t: '다음 달 발주 물량을 이번 주 금요일까지 알려 주시면 생산 일정에 반영하겠습니다.', w: '기한이 있는 업무 요청 → 거래처' },
      { a: 'c', t: '회수 택배 기사님이 방문하시면 상자째 주시면 됩니다. 따로 포장하지 않으셔도 됩니다.', w: '고객이 할 일을 아주 쉽게 → 고객' },
    ];
    let right = 0, done = 0;
    items.forEach((it) => {
      const c = document.createElement('div'); c.className = 'rcard';
      c.innerHTML = `<div class="s">“${it.t}”</div><div class="pick">${Object.keys(R).map((k) => `<button type="button" data-k="${k}">${R[k]}</button>`).join('')}</div><div class="why">${it.w}</div>`;
      const bs = c.querySelectorAll('button');
      bs.forEach((b) => b.addEventListener('click', () => {
        bs.forEach((x) => { x.disabled = true; if (x.dataset.k === it.a) x.classList.add('right'); });
        if (b.dataset.k !== it.a) b.classList.add('wrong'); else right++;
        done++; c.classList.add('done');
        $('r-score').textContent = `${right} / ${items.length} 맞힘` + (done === items.length ? ' — 받는 사람을 알려 주면 AI도 이렇게 달리 씁니다.' : '');
      }));
      wrap.appendChild(c);
    });
  })();

  /* ───────── 3) 이 문장, 무엇이 문제? ───────── */
  (function fixes() {
    const wrap = $('fcards'); if (!wrap) return;
    const F = [
      { ty: '사과', b: '택배사 실수로 파손된 것 같습니다. 양해 바랍니다.', p: '남 탓 + 사과가 없다', g: '포장을 더 꼼꼼히 하지 못해 불편을 드려 죄송합니다.' },
      { ty: '사과', b: '불편을 드렸다면 죄송합니다.', p: '“드렸다면” — 조건부 사과', g: '불편을 드려 죄송합니다.' },
      { ty: '거절', b: '그건 규정상 불가능합니다.', p: '이유도 대안도 없다', g: '추가 할인은 어렵지만, 대신 적립금 3,000원을 드리겠습니다.' },
      { ty: '요청', b: '빠른 회신 부탁드립니다.', p: '언제까지인지 모른다', g: '11. 6.(금) 12:00까지 회신 부탁드립니다.' },
      { ty: '약속', b: '최대한 빨리 보내 드리겠습니다.', p: '지킬 수 있는 날짜가 없다', g: '11. 11.(수)에 출고해 12일 오전에 도착하도록 하겠습니다.' },
      { ty: '상사에게 요청', b: '검토해 주세요.', p: '무엇을 결정해 달라는지 모른다', g: '분할 납품안 승인 여부를 오늘 15시까지 알려 주시면 거래처에 회신하겠습니다.' },
    ];
    let n = 0;
    F.forEach((f) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'fcard';
      b.innerHTML = `<span class="ty">${f.ty}</span><span class="bad">“${f.b}”</span><span class="pr">✗ ${f.p}</span><span class="good">✓ ${f.g}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open'); n++;
        $('f-score').textContent = n + ' / ' + F.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  })();
})();
