// 4주 1차시 전용: 예시 개수 슬라이더, 단계 순서 조립기, 출력 형식 고르기
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ───────── 1) 예시 개수에 따라 달라지는 답글 ───────── */
  // 기준: 고객님 호칭 · 후기 내용 짚기 · 유형에 맞는 응대 · 2~3문장 · '바다결 드림' 서명
  const CRIT = ['고객님 호칭', '후기 내용 짚기', '유형에 맞는 응대', '2~3문장', '서명'];
  const REVIEWS = [
    { t: '부산 여행 때 매장에서 먹어 보고 주문했어요', k: '칭찬' },
    { t: '조금 딱딱해서 우유에 오래 불려야 해요', k: '불만' },
    { t: '선물 세트 구성이 조금 더 다양했으면 해요', k: '제안' },
  ];
  const OUT = [
    [ // 예시 0개: "친절한 답글을 써 줘"만
      { tx: '안녕하세요! 😊 부산 여행 중에 저희 매장에 들러 주셨다니 정말 기쁩니다! 앞으로도 맛있는 제품으로 보답하겠습니다. 다음에 또 부산에 오시면 꼭 들러 주세요~ 항상 건강하세요!', f: [0, 1, 1, 0, 0] },
      { tx: '소중한 의견 감사드립니다. 고객님께서 느끼신 불편 사항에 깊이 공감하며, 관련 부서에 전달하여 품질 개선에 적극 반영하도록 하겠습니다. 앞으로 더 나은 바다결이 되겠습니다.', f: [0, 0, 0, 1, 0] },
      { tx: '감사합니다! 참고하겠습니다.', f: [0, 0, 0, 0, 0] },
    ],
    [ // 예시 1개: 칭찬 답글 예시만
      { tx: '고객님, 부산 여행 중에 매장에서 맛보고 주문까지 해 주셔서 감사합니다! 매장에서 드신 그 맛 그대로 보내 드릴게요. — 바다결 드림', f: [1, 1, 1, 1, 1] },
      { tx: '고객님, 우유에 불려 드시는 방법까지 알려 주셔서 감사합니다! 든든한 아침 되시길 바랍니다. — 바다결 드림', f: [1, 1, 0, 1, 1] },
      { tx: '고객님, 선물 세트에 관심 가져 주셔서 감사합니다! 즐거운 선물 되시길 바랍니다. — 바다결 드림', f: [1, 0, 0, 1, 1] },
    ],
    [ // 예시 3개: 칭찬·불만·제안 하나씩
      { tx: '고객님, 부산 여행 중에 매장에서 맛보고 주문까지 해 주셔서 감사합니다! 매장에서 드신 그 맛 그대로 보내 드릴게요. — 바다결 드림', f: [1, 1, 1, 1, 1] },
      { tx: '고객님, 그래놀라가 딱딱해서 오래 불려 드셔야 했다니 죄송합니다. 식감에 대한 의견은 생산팀과 꼭 함께 살펴보겠습니다. — 바다결 드림', f: [1, 1, 1, 1, 1] },
      { tx: '고객님, 선물 세트 구성에 대한 좋은 의견 감사합니다! 더 다양한 구성을 원하신다는 말씀, 상품 기획팀에 꼭 전달하겠습니다. — 바다결 드림', f: [1, 1, 1, 1, 1] },
    ],
  ];
  const MSG = [
    ['bad', '제각각', '말투·길이가 답글마다 다릅니다. 하나는 이모티콘에 다섯 문장, 하나는 딱딱한 공문체, 하나는 한 줄. 후기 내용도 잘 짚지 못합니다.'],
    ['mid', '칭찬만 따라 함', '말투·서명은 맞춰졌지만, 예시가 <strong>칭찬 하나뿐</strong>이라 불만 후기(2번)에도 “감사합니다!”로 답했습니다. 제안(3번)도 전달 약속이 빠졌습니다.'],
    ['ok', '일관된 답글', '칭찬·불만·제안 예시를 <strong>하나씩</strong> 보여 주자 세 답글이 모두 기준을 지킵니다. 예시는 여러 경우를 골고루!'],
  ];
  (function fewShot() {
    const s = $('fs-s'); if (!s) return;
    const wrap = $('fs-cards');
    const cards = REVIEWS.map((r, i) => {
      const d = document.createElement('div'); d.className = 'rcard';
      d.innerHTML = `<div class="rv">후기 ${i + 1} (${r.k}) · <b>${esc(r.t)}</b></div><div class="tx"></div><div class="pills"></div>`;
      wrap.appendChild(d); return d;
    });
    function update() {
      const lv = +s.value, n = [0, 1, 3][lv];
      $('fs-o').textContent = n + '개';
      $('fs-c1').classList.toggle('on', n >= 1);
      $('fs-c2').classList.toggle('on', n >= 3);
      $('fs-c3').classList.toggle('on', n >= 3);
      let total = 0;
      OUT[lv].forEach((o, i) => {
        cards[i].querySelector('.tx').textContent = o.tx;
        cards[i].querySelector('.pills').innerHTML = o.f.map((v, j) => `<span class="pill ${v ? 'y' : 'n'}">${v ? '✓' : '✗'} ${CRIT[j]}</span>`).join('');
        total += o.f.reduce((a, b) => a + b, 0);
      });
      $('fs-v').textContent = total + ' / 15';
      $('fs-bar').style.width = (total / 15 * 100) + '%';
      const [cls, k, m] = MSG[lv];
      const st = $('fs-st'); st.className = 'status ' + cls; st.innerHTML = `<b class="k">${k}</b>${m}`;
    }
    s.addEventListener('input', update);
    update();
  })();

  /* ───────── 2) 단계 순서 조립기 ───────── */
  (function order() {
    const list = $('ord-list'); if (!list) return;
    const S = {
      cls: { t: '후기 유형 분류', s: '칭찬 / 불만 / 제안 중 하나', p: '각 후기를 칭찬 / 불만 / 제안 중 하나로 분류' },
      sum: { t: '핵심 한 줄 요약', s: '고객이 말한 내용 정리', p: '후기의 핵심을 한 줄로 요약' },
      rep: { t: '답글 초안 쓰기', s: '2~3문장, ‘고객님’으로 시작', p: '앞 단계 결과에 맞춰 답글 초안 작성 (2~3문장)' },
      tab: { t: '표로 정리하기', s: '번호 | 유형 | 요약 | 답글', p: '결과를 표로 정리 (열: 번호 | 유형 | 요약 | 답글 초안)' },
    };
    const MIXES = [['rep', 'tab', 'cls', 'sum'], ['tab', 'cls', 'rep', 'sum'], ['cls', 'rep', 'sum', 'tab'], ['sum', 'rep', 'cls', 'tab']];
    let mix = 0, ord = MIXES[0].slice();
    function judge() {
      const pos = {}; ord.forEach((k, i) => (pos[k] = i));
      if (pos.rep < pos.cls) return { bad: ['rep', 'cls'], k: '분류보다 답글이 먼저', m: '유형을 정하기 전에 답글을 쓰면, 불만 후기에 감사 인사를 해 놓고 나중에 ‘불만’으로 분류하는 엇박자가 생깁니다.',
        ex: '<span class="who">예시 답변 조각</span>답글: 후기 2 → “고객님, 좋은 후기 감사합니다!”\n…\n분류: 후기 2 → 불만\n<b>→ 분류와 답글이 서로 맞지 않습니다.</b>' };
      if (pos.rep < pos.sum) return { bad: ['rep', 'sum'], k: '요약보다 답글이 먼저', m: '고객이 무엇을 말했는지 정리하기 전에 답글을 쓰면, 후기 내용을 짚지 못하고 일반적인 인사만 하기 쉽습니다.',
        ex: '<span class="who">예시 답변 조각</span>답글: 후기 3 → “고객님, 소중한 의견 감사합니다. 앞으로 더 노력하겠습니다.”\n<b>→ ‘선물 세트 구성’ 이야기가 빠졌습니다.</b>' };
      if (pos.tab !== 3) return { bad: ['tab'], k: '표 정리가 중간에', m: '표는 내용이 다 만들어진 뒤 마지막에. 중간에 두면 빈칸 많은 표가 먼저 나오거나 표를 두 번 그립니다.',
        ex: '<span class="who">예시 답변 조각</span>| 번호 | 유형 | 요약 | 답글 초안 |\n| 1 | (아직) | (아직) | (아직) |\n<b>→ 채울 내용이 없는 표가 먼저 나옵니다.</b>' };
      return { bad: [], ok: true, k: '좋은 순서', m: '분류 → 요약 → 답글 → 표. 앞 단계 결과가 다음 단계의 근거가 됩니다. 이 프롬프트를 복사해 직접 써 보세요.',
        ex: '<span class="who">예시 답변 조각</span>1단계: 1 칭찬 · 2 불만 · 3 제안\n2단계: 2 → 식감이 딱딱함\n3단계: 2 → “고객님, 딱딱해서 오래 불려 드셔야 했다니 죄송합니다. …”\n4단계: 표로 정리 완료' };
    }
    function render() {
      const j = judge();
      list.innerHTML = '';
      ord.forEach((k, i) => {
        const d = document.createElement('div');
        d.className = 'step' + (j.bad.includes(k) ? ' badpos' : '');
        d.innerHTML = `<span class="no">${i + 1}</span><div>${S[k].t}<small>${S[k].s}</small></div><span class="mv"><button type="button" aria-label="${S[k].t} 위로" ${i === 0 ? 'disabled' : ''}>▲</button><button type="button" aria-label="${S[k].t} 아래로" ${i === ord.length - 1 ? 'disabled' : ''}>▼</button></span>`;
        const [up, dn] = d.querySelectorAll('button');
        up.addEventListener('click', () => move(i, -1));
        dn.addEventListener('click', () => move(i, 1));
        list.appendChild(d);
      });
      $('ord-pre').textContent = '너는 바다결의 고객 응대 담당자야.\n아래 후기들을 다음 순서대로 처리해 줘.\n'
        + ord.map((k, i) => `${i + 1}단계: ${S[k].p}`).join('\n')
        + '\n\n후기 1: 부산 여행 때 매장에서 먹어 보고 주문했어요\n후기 2: 조금 딱딱해서 우유에 오래 불려야 해요\n후기 3: 선물 세트 구성이 조금 더 다양했으면 해요';
      const st = $('ord-st');
      st.className = 'status ' + (j.ok ? 'ok' : 'bad');
      st.innerHTML = `<b class="k">${j.k}</b>${j.m}`;
      const ex = $('ord-ex');
      ex.className = 'msg ai' + (j.ok ? '' : ' warn');
      ex.innerHTML = j.ex;
    }
    function move(i, d) {
      const k = i + d; if (k < 0 || k >= ord.length) return;
      [ord[i], ord[k]] = [ord[k], ord[i]];
      render();
      const btn = list.children[k].querySelectorAll('button')[d < 0 ? 0 : 1];
      if (btn && !btn.disabled) btn.focus();
    }
    $('ord-mix').addEventListener('click', () => { mix = (mix + 1) % MIXES.length; ord = MIXES[mix].slice(); render(); });
    render();
  })();

  /* ───────── 3) 출력 형식 고르기 ───────── */
  (function format() {
    const box = $('fm-btns'); if (!box) return;
    const LINE = {
      prose: '프롬프트 마지막 줄: <b>(형식 지정 없음)</b>',
      list: '프롬프트 마지막 줄: <b>“결과를 후기별 항목으로 나눠 줘.”</b>',
      table: '프롬프트 마지막 줄: <b>“결과는 표로. 열: 번호 | 유형 | 요약 | 답글 초안”</b>',
    };
    const OUTF = {
      prose: '<p style="margin:0 0 8px">첫 번째 후기는 부산 여행 중 매장에서 먹어 보고 주문했다는 내용으로 칭찬에 해당합니다. “고객님, 부산 여행 중 매장에서 맛보고 주문까지 해 주셔서 감사합니다!”처럼 답하면 좋겠습니다.</p><p style="margin:0 0 8px">두 번째 후기는 식감이 딱딱하다는 불만으로 보이며, 사과의 뜻을 전하고 생산팀에 의견을 전달하겠다고 안내하는 것이 좋습니다.</p><p style="margin:0">세 번째 후기는 선물 세트 구성을 다양하게 해 달라는 제안이므로, 감사 인사와 함께 기획팀에 전달하겠다고 쓰면 됩니다.</p>',
      list: '<ul><li><b>후기 1</b> — 칭찬 · 매장 시식 후 주문<br>답글: 고객님, 부산 여행 중 매장에서 맛보고 주문까지 해 주셔서 감사합니다! …</li><li><b>후기 2</b> — 불만 · 식감이 딱딱함<br>답글: 고객님, 딱딱해서 오래 불려 드셔야 했다니 죄송합니다. …</li><li><b>후기 3</b> — 제안 · 선물 세트 구성 다양화<br>답글: 고객님, 선물 세트 구성에 대한 좋은 의견 감사합니다! …</li></ul>',
      table: '<table><thead><tr><th>번호</th><th>유형</th><th>요약</th><th>답글 초안</th></tr></thead><tbody>'
        + '<tr><td>1</td><td>칭찬</td><td>매장 시식 후 주문</td><td>고객님, 부산 여행 중 매장에서 맛보고 주문까지 해 주셔서 감사합니다! …</td></tr>'
        + '<tr><td>2</td><td>불만</td><td>식감이 딱딱함</td><td>고객님, 딱딱해서 오래 불려 드셔야 했다니 죄송합니다. …</td></tr>'
        + '<tr><td>3</td><td>제안</td><td>선물 세트 구성 다양화</td><td>고객님, 선물 세트 구성에 대한 좋은 의견 감사합니다! …</td></tr></tbody></table>',
    };
    const CK = ['한눈에 비교', '엑셀·문서에 옮기기', '빠진 내용 찾기'];
    const V = { prose: ['n', 'n', 'n'], list: ['m', 'm', 'm'], table: ['y', 'y', 'y'] };
    const VT = { y: '좋음', m: '보통', n: '어려움' };
    const M = {
      prose: '줄글은 읽기엔 자연스럽지만, <strong>2번 후기의 답글 문장이 빠진 것</strong>을 알아채기 어렵습니다.',
      list: '항목으로 나누니 훨씬 보기 쉽습니다. 다만 엑셀·문서의 표로 옮기려면 다시 손봐야 합니다.',
      table: '열까지 정해 주니 <strong>그대로 붙여 넣어</strong> 쓸 수 있고, 빈칸도 한눈에 보입니다.',
    };
    const btns = box.querySelectorAll('.tgl');
    function pick(f) {
      btns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.f === f));
      $('fm-line').innerHTML = LINE[f];
      $('fm-out').innerHTML = OUTF[f];
      $('fm-chk').innerHTML = CK.map((c, i) => `<div><span>${c}</span><span class="v ${V[f][i]}">${VT[V[f][i]]}</span></div>`).join('');
      $('fm-msg').innerHTML = M[f];
    }
    btns.forEach((b) => b.addEventListener('click', () => pick(b.dataset.f)));
    pick('prose');
  })();
})();
