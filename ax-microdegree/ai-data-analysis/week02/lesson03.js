// 2주 3차시 전용: 전공 질문 → 어디서 찾을까, 파일 형식 비교, 데이터 품질 점검표
(function () {
  const $ = (id) => document.getElementById(id);
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };

  /* ───────── 1) 전공 질문 → 어디서 찾을까 ───────── */
  (function match() {
    if (!$('m-q')) return;
    const NAME = { portal: '공공데이터포털', aihub: 'AI허브', kamp: 'KAMP', kosis: 'KOSIS 국가통계포털', self: '직접 측정·실험' };
    const Q = [
      { maj: '기계공학', ic: 'factory', q: '사출 성형 공정 조건으로 불량을 예측해 보고 싶다', need: '필요한 것: 설비의 공정 조건 + 불량 기록', a: 'kamp',
        why: '제조 현장 공정 데이터셋과 분석 가이드북이 모인 곳입니다. 사출성형기 데이터셋도 공개되어 있습니다.' },
      { maj: '전자·컴퓨터공학', ic: 'eye', q: '카메라 영상에서 물체를 찾아내는 AI를 학습시키고 싶다', need: '필요한 것: 정답(라벨)이 붙은 이미지 수천 장 이상', a: 'aihub',
        why: 'AI 학습용으로 라벨을 붙여 만든 이미지·영상 데이터를 제공하는 곳입니다.' },
      { maj: '환경공학', ic: 'activity', q: '우리 지역 대기오염 측정값이 계절에 따라 어떻게 달라지나', need: '필요한 것: 공공기관의 측정소 기록', a: 'portal', also: ['kosis'],
        why: '공공기관이 측정·보유한 데이터를 모아 둔 통합 창구입니다. 기온 등은 기상청 기상자료개방포털도 함께 봅니다.' },
      { maj: '산업경영공학', ic: 'chart', q: '지역별 제조업 사업체 수가 10년 동안 어떻게 변했나', need: '필요한 것: 지역·연도별로 집계된 통계표', a: 'kosis', also: ['portal'],
        why: '지역·산업별로 집계된 국가 통계를 찾을 때는 국가통계포털이 먼저입니다.' },
      { maj: '화학공학', ic: 'flask', q: '내가 새로 설계한 촉매 조건에서 수율이 얼마나 나오나', need: '필요한 것: 아직 아무도 해 보지 않은 조건의 결과', a: 'self',
        why: '새로운 조건의 결과는 어디에도 없습니다. 직접 실험해서 모아야 합니다 — lab_yield.csv 같은 실험 데이터.' },
      { maj: '도시·교통공학', ic: 'map', q: '도로 구간별 교통량이 요일·시간대에 따라 어떻게 다른가', need: '필요한 것: 공공기관이 수집한 교통량 기록', a: 'portal',
        why: '교통 기관들이 공개한 데이터를 파일데이터·오픈API로 찾을 수 있는 곳입니다.' },
    ];
    let cur = 0, score = 0;
    const res = Q.map(() => null);
    const btns = document.querySelectorAll('.site-btn');
    const dots = $('m-dots');
    Q.forEach(() => dots.appendChild(document.createElement('i')));
    function show() {
      const q = Q[cur];
      $('m-maj').innerHTML = `<svg class="ic"><use href="#i-${q.ic}"/></svg> ${q.maj} · 질문 ${cur + 1}`;
      $('m-q').textContent = '“' + q.q + '”';
      $('m-need').textContent = q.need;
      btns.forEach((b) => { b.classList.remove('right', 'wrong'); b.disabled = false; });
      $('m-fb').innerHTML = '오른쪽에서 가장 먼저 찾아볼 곳을 고르세요.';
      dots.querySelectorAll('i').forEach((d, i) => (d.className = res[i] === null ? (i === cur ? 'cur' : '') : res[i] ? 'ok' : 'no'));
      $('m-next').textContent = cur === Q.length - 1 ? '처음부터 →' : '다음 질문 →';
    }
    btns.forEach((b) => b.addEventListener('click', () => {
      const q = Q[cur], s = b.dataset.s;
      if (res[cur] !== null) return;
      const ok = s === q.a, part = !ok && q.also && q.also.includes(s);
      res[cur] = ok || part; if (ok || part) score++;
      btns.forEach((x) => { x.disabled = true; if (x.dataset.s === q.a) x.classList.add('right'); });
      if (!ok) b.classList.add(part ? 'right' : 'wrong');
      $('m-fb').innerHTML = ok ? `<b class="ok">좋습니다!</b> ${q.why}`
        : part ? `<b class="ok">그곳도 좋습니다.</b> 다만 먼저 볼 곳은 <b>${NAME[q.a]}</b> — ${q.why}`
          : `<b class="no">먼저 볼 곳은 ${NAME[q.a]}.</b> ${q.why}`;
      $('m-score').textContent = score + ' / ' + Q.length;
      dots.querySelectorAll('i')[cur].className = res[cur] ? 'ok' : 'no';
    }));
    $('m-next').addEventListener('click', () => {
      if (cur === Q.length - 1) { cur = 0; score = 0; res.fill(null); $('m-score').textContent = '0 / ' + Q.length; }
      else cur++;
      show();
    });
    show();
  })();

  /* ───────── 2) 같은 데이터, 다른 형식 ───────── */
  (function formats() {
    const view = $('fmtview'); if (!view) return;
    const R = [['P00001', '주간', 211.7, 0], ['P00002', '주간', 208.4, 0], ['P00003', '주간', 210.2, 0]];
    const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const F = {
      xlsx: {
        h: '엑셀 표 (.xlsx)', w: '불러오기: pd.read_excel() — 5주차',
        d: '눈으로 보기 가장 편하다. 대신 칸 병합·여러 시트·색칠이 섞이면 분석 전에 정리가 필요하다.',
        html: () => '<table><thead><tr><th>product_id</th><th>shift</th><th>temp</th><th>defect</th></tr></thead><tbody>' + R.map((r) => '<tr>' + r.map((v) => `<td>${v}</td>`).join('') + '</tr>').join('') + '</tbody></table><div class="cap">셀 하나에 값 하나 — 첫 줄이 열 이름이면 가장 좋다</div>',
      },
      csv: {
        h: 'CSV (.csv)', w: '불러오기: pd.read_csv() — 이 강의의 기본',
        d: '쉼표로 칸을 나눈 <b>글자 파일</b>. 가볍고 어디서나 열린다. 한글이 깨지면 인코딩(UTF-8 / CP949)을 확인한다.',
        html: () => '<pre>' + '<span class="k">product_id</span><span class="p">,</span><span class="k">shift</span><span class="p">,</span><span class="k">temp</span><span class="p">,</span><span class="k">defect</span>\n' + R.map((r) => `${r[0]}<span class="p">,</span>${r[1]}<span class="p">,</span><span class="n">${r[2]}</span><span class="p">,</span><span class="n">${r[3]}</span>`).join('\n') + '</pre><div class="cap">첫 줄 = 열 이름, 한 줄 = 한 행</div>',
      },
      json: {
        h: 'JSON (.json)', w: '오픈API 응답에서 자주 본다',
        d: '<b>이름표(키): 값</b> 쌍의 묶음. 기록마다 항목이 달라도 담을 수 있다(반정형). 표로 펴서(평탄화) 분석한다.',
        html: () => '<pre><span class="p">[</span>\n' + R.map((r) => `  <span class="p">{</span><span class="k">"product_id"</span>: <span class="s">"${r[0]}"</span>, <span class="k">"shift"</span>: <span class="s">"${r[1]}"</span>,\n    <span class="k">"temp"</span>: <span class="n">${r[2]}</span>, <span class="k">"defect"</span>: <span class="n">${r[3]}</span><span class="p">}</span>`).join('<span class="p">,</span>\n') + '\n<span class="p">]</span></pre><div class="cap">같은 3행 — 열 이름이 값마다 붙어 있다</div>',
      },
      label: {
        h: '이미지 + 라벨 파일', w: 'AI 학습용 데이터의 흔한 구성',
        d: '이미지 파일(원천)과, 그 이미지의 <b>정답</b>을 적은 라벨 파일(JSON 등)이 짝을 이룬다. 용량이 커서 ZIP으로 나눠 받는 경우가 많다.',
        html: () => '<pre>' + esc('part_0001.jpg   ← 원천 이미지') + '\n' + esc('part_0001.json  ← 라벨') + '\n\n<span class="p">{</span>\n  <span class="k">"image"</span>: <span class="s">"part_0001.jpg"</span>,\n  <span class="k">"label"</span>: <span class="s">"스크래치"</span>,\n  <span class="k">"box"</span>: <span class="p">[</span><span class="n">34</span>, <span class="n">66</span>, <span class="n">20</span>, <span class="n">12</span><span class="p">]</span>   <span class="p">// 흠집 위치 x, y, 너비, 높이</span>\n<span class="p">}</span></pre><div class="cap">라벨의 구조는 데이터셋마다 다르다 → 함께 주는 설명서를 읽는다</div>',
      },
    };
    const sw = document.querySelectorAll('#fmt-sw button');
    function pick(k) {
      sw.forEach((b) => b.setAttribute('aria-pressed', b.dataset.f === k));
      view.innerHTML = F[k].html();
      $('fmt-h').textContent = F[k].h; $('fmt-d').innerHTML = F[k].d; $('fmt-w').textContent = F[k].w;
    }
    sw.forEach((b) => b.addEventListener('click', () => pick(b.dataset.f)));
    pick('xlsx');
  })();

  /* ───────── 3) 데이터 품질 점검표 ───────── */
  (function check() {
    const tg = $('ck-tg'); if (!tg) return;
    const ITEMS = ['① 질문에 필요한 변수(습도·불량)가 있다', '② 기간·간격이 질문에 맞다', '③ 열 설명(정의·단위)이 있다', '④ 결측·오류가 적다', '⑤ 출처·수집 방법이 분명하다', '⑥ 이용 조건이 수업 보고서에 맞다'];
    const C = [
      { t: '「사출 공정 센서·검사 기록」', meta: [['제공', '○○제조데이터센터 (공공기관)'], ['기간', '2024.1~2025.12, 제품 1개 = 1행'], ['열', '온도·습도·압력·불량 여부 + 열 정의서(단위 포함)'], ['결측', '약 3%'], ['이용 조건', '공공누리 제1유형']],
        truth: [1, 1, 1, 1, 1, 1], why: ['습도·불량 열이 모두 있다', '2년치, 제품 단위', '정의서에 단위까지 있다', '3%는 정리로 처리 가능', '공공기관, 수집 방법 안내', '출처만 밝히면 된다'],
        v: ['ok', '사용 가능', '여섯 항목을 모두 통과합니다. 출처를 적고 정리(결측 처리)부터 시작합니다.'] },
      { t: '「지역별 월평균 기상 자료」', meta: [['제공', '기상 관측 기관'], ['기간', '10년, 지역별 한 달 = 1행'], ['열', '지역·월·평균 기온·평균 습도 (설명 있음)'], ['결측', '없음'], ['이용 조건', '출처 표시 후 이용 가능']],
        truth: [0, 0, 1, 1, 1, 1], why: ['불량 기록이 없다', '월평균이라 제품별 습도를 알 수 없다', '설명이 잘 되어 있다', '빈칸 없음', '공식 관측 자료', '출처 표시로 이용 가능'],
        v: ['mid', '단독으로는 부족', '깨끗하고 믿을 만하지만 <strong>내 질문에 필요한 불량 기록이 없고</strong>, 간격도 너무 거칩니다. 다른 데이터의 보조 자료로만 씁니다.'] },
      { t: '「공장데이터_모음_최종.zip」', meta: [['제공', '개인 블로그에 재공유 (원 출처 표시 없음)'], ['기간', '알 수 없음'], ['열', 'temp, hum, ng — 설명 없음'], ['결측', '약 41%'], ['이용 조건', '표시 없음']],
        truth: [0, 0, 0, 0, 0, 0], why: ['hum·ng가 습도·불량인지 확인할 수 없다', '기간을 모른다', '열 설명이 없다', '41%가 비었다', '누가 어떻게 모았는지 모른다', '써도 되는지 알 수 없다'],
        v: ['bad', '쓰지 않는다', '행이 많아 보여도 <strong>뜻·출처·조건을 확인할 수 없습니다</strong>. 원 출처를 찾을 수 없다면 쓰지 않습니다.'] },
    ];
    let c = 0, shown = false;
    const tgl = ITEMS.map((t) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tgl'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="chk"></span><span>${t}</span><span class="res"></span>`;
      b.addEventListener('click', () => { toggle(b); if (shown) reveal(); });
      tg.appendChild(b); return b;
    });
    function load(k) {
      c = k; shown = false;
      document.querySelectorAll('.cbtns .btn').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.c === k));
      const d = C[k];
      $('ck-meta').innerHTML = `<div class="tt">후보 ${'ABC'[k]} ${d.t}</div>` + d.meta.map(([a, b]) => `<div class="mr"><b>${a}</b><span>${b}</span></div>`).join('');
      tgl.forEach((b) => { b.setAttribute('aria-pressed', 'false'); const r = b.querySelector('.res'); r.textContent = ''; r.className = 'res'; b.title = ''; });
      $('ck-v').className = 'verdict';
      $('ck-v').innerHTML = '항목을 읽고, 통과한다고 생각하는 칸에 체크한 뒤 <strong>판정 보기</strong>를 누르세요.';
      $('ck-score').textContent = '- / 6';
    }
    function reveal() {
      shown = true;
      const d = C[c];
      let same = 0;
      tgl.forEach((b, i) => {
        const mine = b.getAttribute('aria-pressed') === 'true' ? 1 : 0;
        if (mine === d.truth[i]) same++;
        const r = b.querySelector('.res');
        r.textContent = d.truth[i] ? '통과' : '미달';
        r.className = 'res ' + (d.truth[i] ? 't' : 'f');
        b.title = d.why[i];
      });
      $('ck-score').textContent = same + ' / 6';
      const miss = d.truth.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
      $('ck-v').className = 'verdict ' + d.v[0];
      $('ck-v').innerHTML = `<b class="k">판정: ${d.v[1]}</b>${d.v[2]}` + (miss.length && miss.length < 6 ? ` <span class="muted">(미달: ${miss.map((i) => d.why[i]).join(' · ')})</span>` : '');
    }
    document.querySelectorAll('.cbtns .btn').forEach((b) => b.addEventListener('click', () => load(+b.dataset.c)));
    $('ck-go').addEventListener('click', reveal);
    load(0);
  })();
})();
