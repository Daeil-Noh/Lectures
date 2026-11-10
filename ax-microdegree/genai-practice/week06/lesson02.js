// 6주 2차시 전용: 출처 신뢰도 점검표, AI 답변 속 주장 3개 판정
(function () {
  const $ = (id) => document.getElementById(id);

  /* ───────── 1) 출처 신뢰도 점검표 ───────── */
  const CRIT = [
    { k: 'who', t: '누가 만들었는지 드러난다 (작성자·기관)' },
    { k: 'when', t: '날짜가 있고, 지금 쓰기에 최근이다' },
    { k: 'how', t: '조사 방법·원자료를 밝힌다' },
    { k: 'why', t: '판매·홍보 같은 이해관계가 없다' },
    { k: 'link', t: '직접 열리고, 그 내용이 실제로 있다' },
    { k: 'cross', t: '독립된 다른 출처에서도 확인된다' },
  ];
  // exp: 전문가 점검 결과(체크해야 할 항목), note: 항목별 설명
  const SRC = [
    { tp: '공식 통계', nm: '국가통계포털(KOSIS) 통계표', title: '국가통계포털(KOSIS)의 통계표 (일반적인 모습)',
      meta: [['누가', '통계표마다 작성기관 표시 · 국가데이터처가 포털 운영'], ['언제', '수록 기간·갱신일 표시'], ['방법', '통계설명자료(조사 방법) 연결'], ['접근', '포털에서 직접 검색해 열람·내려받기']],
      ex: '숫자를 직접 만든 기관의 원자료입니다. 언론·보고서가 이 통계를 다시 인용합니다.',
      exp: ['who', 'when', 'how', 'why', 'link', 'cross'],
      note: { why: '공익 목적의 공식 통계', cross: '언론·보고서가 이 통계를 인용 — 원자료 쪽' } },
    { tp: '협회 조사 (가상)', nm: '한국건강간식협회 「2026 건강 간식 소비자 조사」', title: '「2026 건강 간식 소비자 조사」',
      meta: [['누가', '한국건강간식협회(가상) — 업계 회원사 단체'], ['언제', '2026년 6월 발행 (조사 2026년 5월)'], ['방법', '전국 20~59세 1,000명 온라인 설문, 설문지 공개'], ['접근', '협회 누리집에서 PDF 원문 열림']],
      ex: '“최근 1년 그래놀라 구매 경험: 20대 38%, 30대 41%” (표 3)',
      exp: ['who', 'when', 'how', 'link'],
      note: { why: '업계 단체 — 업계에 유리한 해석이 섞일 수 있음', cross: '같은 조사를 옮긴 기사뿐, 독립된 조사는 아직 못 찾음' } },
    { tp: '언론 기사 (가상)', nm: '가상일보 「아침 대용 그래놀라 찾는 2030」', title: '「아침 대용 그래놀라 찾는 2030」',
      meta: [['누가', '가상일보 김하늘 기자(가상)'], ['언제', '2026.8.12.'], ['방법', '협회 조사를 인용 — 자체 조사 아님'], ['접근', '기사 열림, 제목에 “2030 절반이 그래놀라”']],
      ex: '본문: “협회 조사에 따르면 20대 38%, 30대 41%가 …” — 제목의 ‘절반’은 본문 숫자와 다름',
      exp: ['who', 'when', 'why', 'link'],
      note: { how: '원 조사를 옮긴 2차 출처', cross: '협회 원문을 옮긴 것이라 독립 확인이 아님' } },
    { tp: '블로그 (가상)', nm: '푸드트렌드 블로그 「요즘 뜨는 그래놀라 TOP5」', title: '「요즘 뜨는 그래놀라 TOP5」',
      meta: [['누가', '작성자 표시 없음'], ['언제', '날짜 없음 (댓글이 2025년)'], ['방법', '“시장이 3년 새 2배” — 근거 없음'], ['접근', '페이지는 열림, 제품마다 구매 링크(제휴)']],
      ex: '“그래놀라 시장이 3년 새 2배가 됐다! 지금 사야 할 TOP5는…”',
      exp: ['link'],
      note: { why: '제휴 구매 링크 — 판매 수익이 목적', link: '열리긴 한다 — 하지만 열린다고 믿을 만한 것은 아님' } },
    { tp: 'AI 답변 속 링크 (가상)', nm: '“한국건강간식협회 2026 시장 보고서”', title: 'AI가 제시한 「2026 시장 보고서」',
      meta: [['누가', 'AI는 협회라고 했지만 확인 불가'], ['언제', '알 수 없음'], ['방법', '알 수 없음'], ['접근', 'example.com/kfsa/market-2026 → 페이지를 찾을 수 없음']],
      ex: '협회 누리집 자료실에도 이런 보고서는 없습니다. 다른 곳에서는 출처 없는 블로그 글만 나옵니다.',
      exp: [],
      note: { link: '없는 링크 — 1단계에서 막힘' } },
  ];
  const verdict = (n) => n >= 5 ? ['ok', '인용해도 좋음', '출처를 정확히 적어 인용합니다.']
    : n >= 3 ? ['mid', '한 번 더 확인', '빈 항목을 다른 출처로 채우거나, 한계를 함께 적습니다.']
    : ['bad', '인용하지 않음', '아이디어만 얻고, 원자료를 따로 찾습니다.'];
  (function scorer() {
    const wrap = $('srcs'); if (!wrap) return;
    const ticks = SRC.map(() => new Set());
    let cur = 0, reveal = false;
    const sbtn = SRC.map((s, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'srcbtn';
      b.innerHTML = `<span class="tp">${s.tp}</span><span class="nm">${s.nm}</span><span class="sc"></span>`;
      b.addEventListener('click', () => { cur = i; reveal = false; render(); });
      wrap.appendChild(b); return b;
    });
    const cbtn = CRIT.map((c) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tgl'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="chk"></span><span>${c.t}</span><span class="exp"></span>`;
      b.addEventListener('click', () => { const t = ticks[cur]; t.has(c.k) ? t.delete(c.k) : t.add(c.k); render(); });
      $('crit').appendChild(b); return b;
    });
    $('cr-ans').addEventListener('click', () => { reveal = !reveal; render(); });
    function render() {
      const s = SRC[cur], t = ticks[cur];
      sbtn.forEach((b, i) => { b.setAttribute('aria-pressed', i === cur); b.querySelector('.sc').textContent = ticks[i].size ? ticks[i].size + '점' : ''; });
      $('doc').innerHTML = `<div class="ex-note muted" style="font-size:13px;font-weight:800">${s.tp}</div><div class="dt">${s.title}</div>`
        + '<div class="meta-row">' + s.meta.map(([a, b]) => `<b>${a}</b><span>${b}</span>`).join('') + '</div>'
        + `<div class="ex">${s.ex}</div>`;
      cbtn.forEach((b, i) => {
        const k = CRIT[i].k, on = t.has(k), should = s.exp.includes(k);
        b.setAttribute('aria-pressed', on);
        const e = b.querySelector('.exp');
        if (reveal) { e.className = 'exp ' + (should ? 'y' : 'n'); e.textContent = should ? '✓ 해당' : '✗ 아님'; b.title = s.note[k] || ''; }
        else { e.className = 'exp'; e.textContent = ''; b.title = ''; }
      });
      const n = t.size, [cls, h, d] = verdict(n), st = $('cr-st');
      $('cr-n').textContent = n + ' / 6';
      if (reveal) {
        const en = s.exp.length, [ecls, eh, ed] = verdict(en);
        const diff = CRIT.filter((c) => t.has(c.k) !== s.exp.includes(c.k)).length;
        const notes = Object.values(s.note).join(' · ');
        st.className = 'status ' + ecls;
        st.innerHTML = `<b class="k">점검 결과: ${en}점 · ${eh}</b>${diff ? `내 점검과 <strong>${diff}개 항목</strong>이 다릅니다. ` : '내 점검과 <strong>모두 같습니다.</strong> '}${notes}`;
        $('cr-ans').innerHTML = '점검 결과<br>숨기기';
      } else {
        st.className = 'status ' + cls;
        st.innerHTML = `<b class="k">${h}</b>${n ? d : '왼쪽 출처를 읽고, 해당하는 항목을 체크해 보세요.'}`;
        $('cr-ans').innerHTML = '점검 결과<br>비교하기';
      }
    }
    render();
  })();

  /* ───────── 2) AI 답변 속 주장 3개 판정 ───────── */
  (function claims() {
    const tabs = $('cv-tabs'); if (!tabs) return;
    const C = [
      { ans: 'ok', src: '① 협회 조사 원문 PDF를 열어 “41%”로 찾기',
        ev: '표 3 「최근 1년 그래놀라 구매 경험」 — 20대 <b>38%</b>, 30대 <b>41%</b>. 조사: 2026년 5월, 전국 20~59세 1,000명 온라인 설문.',
        why: '원문에 같은 숫자·같은 대상(30대)·같은 기간(최근 1년)이 있습니다. 보고서에는 <strong>조사 대상과 방법</strong>도 함께 적습니다.' },
      { ans: 'part', src: '② 가상일보 기사를 열어 “절반”·“정기”로 찾기',
        ev: '기사 제목은 “2030 <b>절반</b>이 그래놀라”. 본문은 협회 조사를 인용해 <b>38%·41%</b>. “정기적으로 구매”라는 말은 기사에도 원문에도 <b>없음</b>.',
        why: '근거는 있지만 숫자가 <strong>부풀려졌고</strong>(38~41% → 절반 이상) “정기적”이라는 말이 <strong>덧붙었습니다</strong>. 원문 숫자로 고쳐 씁니다.' },
      { ans: 'no', src: '③ 시장 보고서 링크를 열기 → 협회 자료실·검색으로 다시 찾기',
        ev: '링크: <b>페이지를 찾을 수 없음</b>. 협회 누리집 자료실에 시장 보고서 없음. 소비자 조사 원문에는 시장 규모 내용이 없음. 검색하면 출처 없는 블로그 글만 나옴.',
        why: '출처가 있는지(1단계)부터 확인되지 않습니다. 보고서에서 <strong>빼거나 “확인 필요”</strong>로만 남깁니다.' },
    ];
    const LBL = { ok: '확인됨', part: '일부 다름', no: '확인 안 됨' };
    const picked = [null, null, null];
    let cur = 0;
    const tb = Array.from(tabs.querySelectorAll('button'));
    const vb = Array.from($('cv-v').querySelectorAll('button'));
    const cls = Array.from(document.querySelectorAll('.cl[data-c]'));
    tb.forEach((b, i) => b.addEventListener('click', () => { cur = i; render(); }));
    vb.forEach((b) => b.addEventListener('click', () => {
      if (picked[cur] !== null) return;
      picked[cur] = b.dataset.v; render();
    }));
    function render() {
      const c = C[cur];
      tb.forEach((b, i) => { b.setAttribute('aria-pressed', i === cur); b.classList.toggle('done', picked[i] !== null); });
      cls.forEach((s, i) => s.classList.toggle('on', i === cur));
      $('cv-ev').innerHTML = `<div class="eh"><svg class="ic"><use href="#i-search"/></svg>${c.src}</div>${c.ev}`;
      const p = picked[cur];
      vb.forEach((b) => {
        b.disabled = p !== null;
        b.classList.toggle('right', p !== null && b.dataset.v === c.ans);
        b.classList.toggle('wrong', p !== null && b.dataset.v === p && p !== c.ans);
      });
      const st = $('cv-st');
      const done = picked.filter((x) => x !== null).length, right = picked.filter((x, i) => x === C[i].ans).length;
      $('cv-n').textContent = right + ' / 3';
      if (p === null) {
        st.className = 'status mid';
        st.innerHTML = '<b class="k">찾아본 결과를 읽고 판정하세요</b>' + (done ? `${done}개 판정함. 남은 주장도 눌러 보세요.` : '세 주장 모두 판정하면 결과가 나옵니다.');
      } else {
        const ok = p === c.ans;
        st.className = 'status ' + (c.ans === 'ok' ? 'ok' : c.ans === 'part' ? 'mid' : 'bad');
        st.innerHTML = `<b class="k">${ok ? '맞았습니다' : '정답은 ‘' + LBL[c.ans] + '’'} — ${LBL[c.ans]}</b>${c.why}`
          + (done === 3 ? `<br><strong>세 주장 중 그대로 쓸 수 있는 것은 하나뿐</strong>입니다. 출처가 붙어 있어도 확인 전에는 쓰지 않습니다.` : '');
      }
    }
    render();
  })();
})();
