// 9주 3차시 전용: 막연한 질문 구체화, 주제 진단 카드, 보고서 주제 워크시트
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // 받침에 따라 조사 고르기 (한글이 아니면 '을(를)'처럼 둘 다)
  function jong(w) { w = w.trim().replace(/\s*[(（][^)）]*[)）]$/, '').trim(); const c = w.charCodeAt(w.length - 1); if (c >= 0xAC00 && c <= 0xD7A3) return (c - 0xAC00) % 28; return -1; }
  const J = {
    eul: (w) => { const j = jong(w); return j < 0 ? '을(를)' : j ? '을' : '를'; },
    gwa: (w) => { const j = jong(w); return j < 0 ? '과(와)' : j ? '과' : '와'; },
    ro: (w) => { const j = jong(w); return j < 0 ? '(으)로' : (j && j !== 8) ? '으로' : '로'; },
  };

  /* ───────── 1) 막연한 질문 → 다섯 칸 ───────── */
  (function concretize() {
    const pick = $('cz-pick'); if (!pick) return;
    const K = ['목표 변수', '입력 변수', '데이터 출처', '분석 유형', '성공 기준'];
    const S = [
      { tag: '기계 · 설비', q: '설비가 갑자기 멈추는 일을 줄이고 싶다',
        v: ['평소와 다른 상태가 나타난 날 (고장 기록이 드물어 정답 대신 “이상 정도”)', '매일의 진동 rms·peak, 설비 온도, 전류', '설비 센서 일일 기록 — 실습 데이터 vibration.csv (6대 × 120일 = 720행)', '예측 — 이상탐지 (12주)', '실제 고장 7일 전까지 경보, 잘못 경보는 한 달에 2번 이하'],
        f: '설비 6대의 일일 진동·온도·전류 기록(720행)으로 평소와 다른 날을 찾아, 고장 7일 전까지 경보할 수 있는가?' },
      { tag: '화학 · 실험', q: '반응 수율을 높이고 싶다',
        v: ['수율 yield_pct (%)', '반응 온도, 반응 시간, 촉매량', '실험 기록 — 실습 데이터 lab_yield.csv (60회)', '진단 → 예측 (회귀, 10주)', '수율이 가장 높은 조건 범위를 찾고, 시험 오차 ±5%p 이내'],
        f: '실험 60회의 온도·시간·촉매량으로 수율을 예측하고, 수율이 가장 높은 조건 범위를 찾을 수 있는가?' },
      { tag: '환경', q: '우리 동네 공기가 걱정된다',
        v: ['다음 날 초미세먼지(PM2.5) ‘나쁨’ 여부 (나쁨 / 아님)', '오늘의 농도, 기온, 풍속, 습도', '공공데이터포털의 대기오염·기상 관측 자료 (측정소 1곳, 2년치 일별 — 직접 확인 필요)', '예측 — 분류 (11주)', '‘나쁨’인 날의 70% 이상을 하루 전에 맞힘'],
        f: '측정소 1곳의 2년치 일별 관측으로, 오늘의 농도·기상 조건이 다음 날 ‘나쁨’을 미리 알려 줄 수 있는가?' },
      { tag: '건축 · 에너지', q: '건물 에너지를 줄이고 싶다',
        v: ['일별 전력 사용량 (kWh)', '바깥 기온, 요일·공휴일 여부, 재실 인원', '건물 에너지 관리 기록 (관리 부서의 허락 필요)', '진단 → 예측 (회귀)', '사용량과 가장 관련 큰 요인 2가지 확인, 예측 오차 10% 이내'],
        f: '1년치 일별 전력 기록으로, 기온·요일·재실 인원 중 무엇이 사용량과 가장 관련 있는지 찾고 다음 날 사용량을 예측할 수 있는가?' },
    ];
    let cur = 0, step = 0;
    const slots = $('cz-slots');
    S.forEach((s, i) => {
      const b = document.createElement('button'); b.type = 'button';
      b.innerHTML = `<small>${s.tag}</small>${s.q}`;
      b.addEventListener('click', () => { cur = i; step = 0; render(); });
      pick.appendChild(b);
    });
    const MSG = [
      '버튼을 누를 때마다 한 칸씩 채워집니다. 누르기 전에 <strong>먼저 스스로 답해 보세요.</strong>',
      '① “줄이고 싶다·높이고 싶다”를 <strong>잴 수 있는 값</strong>으로 바꿨습니다.',
      '② 예측하는 순간 <strong>미리 알 수 있는 값</strong>만 입력으로.',
      '③ 데이터의 <strong>이름·위치·크기</strong>까지. 아직 확인 안 했다면 그것부터!',
      '④ 질문의 모양을 보고 <strong>기술·진단·예측</strong> 중에서.',
      '⑤ <strong>숫자로 된 기준</strong>이 있어야 결과를 보고 판단할 수 있습니다. 완성!',
    ];
    function render() {
      const s = S[cur];
      pick.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', i === cur));
      $('cz-q').textContent = '“' + s.q + '”';
      slots.innerHTML = K.map((k, i) => `<div class="slot${i < step ? ' on' : ''}${i === step - 1 ? ' new' : ''}"><span class="num">${i + 1}</span><span class="k">${k}</span><span class="v">${i < step ? s.v[i] : '?'}</span></div>`).join('');
      $('cz-final').hidden = step < 5;
      $('cz-final').textContent = '데이터 질문: ' + s.f;
      $('cz-next').disabled = step >= 5;
      $('cz-msg').innerHTML = MSG[step];
    }
    $('cz-next').addEventListener('click', () => { if (step < 5) { step++; render(); } });
    $('cz-reset').addEventListener('click', () => { step = 0; render(); });
    render();
  })();

  /* ───────── 2) 이 주제, 바로 시작할 수 있을까? ───────── */
  (function qcards() {
    const wrap = $('qcards'); if (!wrap) return;
    const items = [
      { n: '“AI로 우리 공장을 스마트하게 만들고 싶다”', k: 'fix', v: '보완 필요 — 목표 변수가 없다', a: '무엇을 알고 싶은지부터. 예: “불량 여부를 공정 조건으로 판정할 수 있는가?”' },
      { n: '“공정 조건 5개로 인장강도를 예측, 평균 오차 2 MPa 이내” (process.csv 494행)', k: 'good', v: '바로 시작 가능', a: '다섯 칸이 모두 채워져 있다. 오늘 도입에서 본 예시.' },
      { n: '“베어링 수명을 예측하고 싶다” (데이터는 앞으로 구할 예정)', k: 'fix', v: '보완 필요 — 데이터 출처가 없다', a: '지금 열어 볼 수 있는 데이터부터 찾는다. 공개 데이터 검색, 또는 vibration.csv로 비슷한 질문.' },
      { n: '“같은 과 학생들의 통학 시간과 학점의 관계”', k: 'fix', v: '보완 필요 — 개인정보', a: '학번·학점은 개인정보(1-3). 사람이 아닌 대상(설비·실험·환경)으로 바꾸거나 공개 통계를 쓴다.' },
      { n: '“실험 5번 한 결과로 최적 조건을 예측하는 모델”', k: 'fix', v: '보완 필요 — 데이터가 너무 적다', a: '5행으로는 모델을 학습·시험하기 어렵다. 기술·진단 분석으로 바꾸거나 실험·공개 데이터를 보탠다.' },
      { n: '“배합 비율로 콘크리트 압축강도 예측” (공개 배합 실험 데이터, 이용 조건 확인함)', k: 'good', v: '바로 시작 가능', a: '목표(압축강도)·입력(배합)·출처가 분명하다. 성공 기준만 숫자로 덧붙이면 완성.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'qcard';
      b.innerHTML = `<span class="nm">${it.n}</span><span class="verdict">${it.k === 'good' ? '✓ ' : '△ '}${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('qc-score').textContent = opened + ' / ' + items.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 3) 보고서 주제 워크시트 ───────── */
  (function worksheet() {
    const ws = $('ws'); if (!ws) return;
    // 입력 칸에서 누른 키(스페이스·화살표·F 등)가 슬라이드 넘기기로 가지 않게 막는다
    ws.addEventListener('keydown', (e) => { if (e.target.closest('input, select, textarea')) e.stopPropagation(); });
    const F = ['major', 'title', 'y', 'x', 'src', 'n', 'ok'];
    const get = (k) => $('w-' + k).value.trim();
    let type = '';
    const KEY = 'w09-topic-form';
    const EX = { major: '기계공학', title: '사출 공정 조건과 제품 강도', y: '인장강도(MPa)', x: '온도, 압력, 속도, 습도, 두께', src: '이 강의 실습 데이터', n: '494', ok: '시험 데이터 평균 오차 2 MPa 이내', type: '예측', priv: true, terms: true };
    function save() {
      try { const o = {}; F.forEach((k) => (o[k] = $('w-' + k).value)); o.type = type; o.priv = $('w-priv').checked; o.terms = $('w-terms').checked; localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* 저장 불가 환경 */ }
    }
    function load(o) {
      F.forEach((k) => ($('w-' + k).value = o[k] || ''));
      type = o.type || ''; $('w-priv').checked = !!o.priv; $('w-terms').checked = !!o.terms;
    }
    try { const s = localStorage.getItem(KEY); if (s) load(JSON.parse(s)); } catch (e) { /* 무시 */ }
    const hole = (t) => `<span class="hole">[${t}]</span>`;
    function render() {
      const v = {}; F.forEach((k) => (v[k] = get(k)));
      ws.querySelectorAll('#w-type button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === type));
      const flags = [];
      const miss = (k, t) => { if (!v[k]) { flags.push(['m', t + (jong(t) > 0 ? '이' : '가') + ' 비어 있습니다']); return true; } return false; };
      miss('title', '주제'); miss('y', '① 목표 변수'); miss('x', '② 입력 변수');
      if (!v.src) flags.push(['m', '③ 데이터 출처를 고르세요']);
      else if (v.src === '아직 모름') flags.push(['m', '③ 데이터 출처 미정 — 실습 데이터·공공데이터부터 찾아보세요']);
      miss('n', '③ 데이터 크기');
      if (!type) flags.push(['m', '④ 분석 유형을 고르세요']);
      miss('ok', '⑤ 성공 기준');
      if (v.y && /품질|성능|효율|좋게|개선|혁신|스마트|최적화/.test(v.y) && !/[0-9(（%]/.test(v.y)) flags.push(['m', '목표 변수가 막연합니다 — 단위가 있는 숫자나 범주로 (예: 인장강도(MPa))']);
      const n = parseInt(v.n.replace(/[^0-9]/g, ''), 10);
      if (v.n && isNaN(n)) flags.push(['w', '데이터 크기는 행 수(숫자)로 적어 보세요']);
      else if (!isNaN(n) && n < 30) flags.push(['w', `${n}행은 모델 학습·시험에 적습니다 — 기술·진단 분석 중심으로`]);
      if (v.ok && !/[0-9]/.test(v.ok)) flags.push(['w', '성공 기준에 숫자를 넣어 보세요 (예: 오차 2 MPa 이내)']);
      if (v.src === '연구실·기업 데이터' && !$('w-terms').checked) flags.push(['m', '연구실·기업 데이터는 담당자 허락이 먼저입니다']);
      if (!$('w-priv').checked) flags.push(['m', '개인정보가 없는지 확인하세요 (1-3)']);
      if (!$('w-terms').checked && v.src !== '연구실·기업 데이터') flags.push(['w', '데이터 이용 조건(출처 표시 등)을 확인하세요']);
      // 완성도: 일곱 칸 + 유형 + 개인정보 점검
      const done = F.filter((k) => v[k] && !(k === 'src' && v[k] === '아직 모름')).length + (type ? 1 : 0) + ($('w-priv').checked ? 1 : 0);
      $('w-score').textContent = done + ' / 9';
      $('w-bar').style.width = (done / 9 * 100) + '%';
      // 문장 만들기
      const Y = v.y ? esc(v.y) : hole('목표 변수'), X = v.x ? esc(v.x) : hole('입력 변수');
      const src = v.src && v.src !== '아직 모름' ? esc(v.src) : hole('데이터 출처');
      const size = !isNaN(n) ? `${n}행` : hole('행 수');
      let act;
      if (type === '기술') act = `${Y}의 현황을 그래프와 통계로 정리한다`;
      else if (type === '진단') act = `${X}${v.x ? J.gwa(v.x) : '과(와)'} ${Y}의 관계를 찾는다`;
      else if (type === '예측') act = `${X}${v.x ? J.ro(v.x) : '(으)로'} ${Y}${v.y ? J.eul(v.y) : '을(를)'} 예측한다`;
      else act = `${X}${v.x ? J.ro(v.x) : '(으)로'} ${Y}${v.y ? J.eul(v.y) : '을(를)'} ${hole('기술·진단·예측')}`;
      $('w-stmt').innerHTML = `<div class="t">${v.major ? '[' + esc(v.major) + '] ' : ''}${v.title ? esc(v.title) : hole('주제')}</div>` +
        `${src}(${size})에서 ${act}. 성공 기준: ${v.ok ? esc(v.ok) : hole('성공 기준')}.`;
      $('w-flags').innerHTML = flags.length
        ? flags.slice(0, 4).map(([c, t]) => `<li class="${c}">${c === 'm' ? '●' : '○'} ${t}</li>`).join('') + (flags.length > 4 ? `<li class="w">… 외 ${flags.length - 4}개</li>` : '')
        : '<li class="ok">✓ 다섯 칸이 모두 채워졌습니다. 이 문장을 주제 양식에 옮겨 적으세요.</li>';
      F.forEach((k) => $('w-' + k).classList.toggle('miss', !v[k] && k !== 'major'));
      save();
    }
    ws.addEventListener('input', render);
    ws.addEventListener('change', render);
    ws.querySelectorAll('#w-type button').forEach((b) => b.addEventListener('click', () => { type = type === b.dataset.v ? '' : b.dataset.v; render(); }));
    $('w-ex').addEventListener('click', () => { load(EX); render(); });
    $('w-clear').addEventListener('click', () => { load({}); render(); });
    $('w-copy').addEventListener('click', async () => {
      const t = $('w-stmt').innerText.replace(/\n/g, ' — ');
      let ok = false;
      try { await navigator.clipboard.writeText(t); ok = true; } catch (e) { ok = false; }
      $('w-copy').textContent = ok ? '복사했습니다' : '복사 실패: 직접 선택';
      setTimeout(() => { $('w-copy').textContent = '문장 복사'; }, 1600);
    });
    render();
  })();
})();
