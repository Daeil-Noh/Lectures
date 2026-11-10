// 2주 3차시 전용: 환각 찾기, 같은 질문 다섯 번, 페르소나 편향 점검, 확인 강도 카드
(function () {
  const $ = (id) => document.getElementById(id);
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function draw(dist, r) { let u = r(), acc = 0; for (const d of dist) { acc += d[1]; if (u < acc) return d; } return dist[dist.length - 1]; }

  /* ───────── 1) 환각 찾기 ─────────
     정답 수치는 genai-practice/materials/sales_2026.csv · reviews_2026.csv 로 계산 (python3)
     총매출 356,440,500원 · 판매량 오리지널 10,681 > 미역귀 8,190 > 다크초코 6,514 · 오픈마켓 매출 46.6%
     선물 세트 반품 24건 · 후기 120건 평균 3.7점 · 월 매출 최고 9월 45,248,300원 */
  (function spot() {
    const wrap = $('hcards'); if (!wrap) return;
    const V = { ok: ['사실', 't-ok'], bad: ['틀림', 't-bad'], unk: ['확인 불가', 't-unk'] };
    const S = [
      { t: '1~9월 총매출은 약 3억 5,600만 원입니다.', v: 'ok', ex: '판매 자료 매출 합계 356,440,500원 — 맞음. 확인법: 매출 열 합계.' },
      { t: '가장 많이 팔린 제품은 다크초코 그래놀라(약 6,500개)입니다.', v: 'bad', ex: '1위는 오리지널 그래놀라 10,681개. 다크초코(6,514개)는 3위 — 숫자는 맞게 옮기고 순위를 틀림.' },
      { t: '매출의 약 47%가 오픈마켓에서 나왔습니다.', v: 'ok', ex: '오픈마켓 매출 165,957,900원 ÷ 총매출 = 46.6% — 맞음.' },
      { t: '선물 세트는 9개월 동안 반품이 한 건도 없었습니다.', v: 'bad', ex: '선물 세트 반품 합계 24건. 제품 중 가장 적을 뿐 0건이 아님.' },
      { t: '고객 후기 평균 별점은 4.6점으로 매우 높습니다.', v: 'bad', ex: '후기 120건 평균 3.7점. 1~2점 후기도 27건 — 그럴듯한 숫자를 지어냄.' },
      { t: '월 매출은 9월이 가장 높았습니다.', v: 'ok', ex: '9월 45,248,300원으로 가장 높음 — 맞음. 확인법: 월별 합계.' },
      { t: '「2025 건강간식 트렌드 리포트」에 따르면 시장은 매년 23% 성장 중입니다.', v: 'unk', ex: '첨부 자료에 없는 외부 출처. 이 보고서는 수업용으로 지어낸 것 — 가짜 출처의 전형. 원문을 찾을 수 없으면 쓰지 않는다.' },
      { t: '바다결은 2018년 창업 이후 꾸준히 성장해 왔습니다.', v: 'unk', ex: '회사 소개에 창업 연도가 없다. 자료의 빈칸을 그럴듯하게 채운 것.' },
    ];
    let n = 0, hit = 0;
    S.forEach((s) => {
      const c = document.createElement('div'); c.className = 'hcard';
      c.innerHTML = `<div class="tx">${s.t}</div><div class="bt">${Object.keys(V).map((k) => `<button type="button" data-v="${k}">${V[k][0]}</button>`).join('')}</div><div class="ex"></div>`;
      c.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        if (c.classList.contains('done')) return;
        const ok = b.dataset.v === s.v; n++; if (ok) hit++;
        c.querySelectorAll('button').forEach((x) => { x.disabled = true; if (x.dataset.v === s.v) x.classList.add('ans', V[s.v][1]); });
        b.classList.add('pick');
        c.classList.add('done', 'v-' + s.v);
        c.querySelector('.ex').innerHTML = `<strong>${ok ? '맞혔어요' : '정답: ' + V[s.v][0]}</strong> · ${s.ex}`;
        $('h-score').textContent = `${n} / ${S.length} 판정 · ${hit}개 맞힘` + (n === S.length ? ' · 정답 구성: 사실 3, 틀림 3, 확인 불가 2' : '');
      }));
      wrap.appendChild(c);
    });
  })();

  /* ───────── 2) 같은 질문 다섯 번 ───────── */
  (function why() {
    const list = $('w-list'); if (!list) return;
    const r = rng(17);
    const UNK = 'unk', DOCUNK = 'docunk';
    const D0 = [['2018년', 0.30], ['2015년', 0.22], ['2020년', 0.18], ['2016년', 0.12], ['2019년', 0.10], [UNK, 0.08]];
    const D1 = [[DOCUNK, 0.84], ['2018년', 0.09], ['2015년', 0.04], ['2020년', 0.03]];
    let doc = false;
    const say = (a) => a === UNK ? '<b class="ok">정확한 창업 연도는 알 수 없습니다.</b> 공식 자료를 확인해 주세요.'
      : a === DOCUNK ? '붙여 주신 회사 소개에는 <b class="ok">창업 연도가 나와 있지 않습니다.</b>'
      : `바다결은 <b>${a}</b>에 부산에서 창업한 건강 간식 회사입니다.`;
    function q() {
      $('w-q').innerHTML = '<span class="who">나</span>' + (doc ? '<span class="ctxin">[회사 소개 붙여 넣음: 위치·업종·직원·채널·제품·고민]</span> ' : '') + '바다결은 몇 년에 창업했어?';
    }
    function gen() {
      const D = doc ? D1 : D0, ans = [];
      for (let k = 0; k < 5; k++) ans.push(draw(D, r)[0]);
      list.innerHTML = ans.map((a, i) => `<div>${i + 1}. ${say(a)}</div>`).join('');
      const uniq = new Set(ans).size, made = ans.filter((a) => a !== UNK && a !== DOCUNK).length;
      $('w-n').textContent = uniq + '개';
      const st = $('w-st');
      if (!doc) { st.className = 'status bad'; st.innerHTML = `<b class="k">근거 없는 연도 ${made}번</b>모르는 내용인데도 “○○년에 창업” 같은 <strong>흔한 문장 패턴</strong>이 이어질 확률이 높습니다. 물을 때마다 연도가 달라지는 것이 지어낸 신호.`; }
      else { st.className = made ? 'status mid' : 'status ok'; st.innerHTML = `<b class="k">자료를 주니 “없다”가 대부분</b>근거 자료가 맥락에 있으면 빈칸을 덜 채웁니다. 그래도 지어낸 답 ${made}번 — <strong>0이 되지는 않습니다.</strong>`; }
    }
    $('w-doc').addEventListener('click', () => { doc = toggle($('w-doc')); q(); list.innerHTML = ''; $('w-n').textContent = '-'; $('w-st').className = 'status mid'; $('w-st').innerHTML = '<b class="k">조건이 바뀌었습니다</b>“다섯 번 묻기”를 눌러 보세요.'; });
    $('w-gen').addEventListener('click', gen);
    q();
  })();

  /* ───────── 3) 페르소나 편향 점검 ─────────
     [st] = 자료에 근거 없는 고정관념·추측, [ok] = 후기에 근거 있음 (reviews_2026.csv 건수) */
  (function persona() {
    const wrap = $('pers'); if (!wrap) return;
    const P = [
      { h: '① 30대 직장인 고객', segs: [
        ['st', '김지은(32세, 여성)', '요청에 성별이 없는데 여성으로 정함'], ['', ', 사무직 직장인. '],
        ['st', '다이어트 때문에 늘 칼로리를 따진다.', '“여성 = 다이어트” 고정관념. 후기에 없음'], ['', ' '],
        ['ok', '아침을 거르기 쉬워 간편한 아침 대용 간식을 찾는다.', '후기 “아침에 먹기 좋아요” 15건'], ['', ' '],
        ['st', '예쁜 포장과 감성 사진에 쉽게 끌린다.', '성별에 따른 소비 성향 단정'], ['', ' '],
        ['ok', '배송이 빠른 곳을 선호한다.', '후기 “배송이 빨랐어요” 14건'],
      ] },
      { h: '② 50대 선물 세트 고객', segs: [
        ['st', '박영수 부장(56세, 남성)', '성별·직급을 근거 없이 정함'], ['', '. '],
        ['st', '스마트폰 쇼핑이 서툴러 주로 매장에서 산다.', '“50대 = 디지털에 서툴다” 나이 고정관념'], ['', ' '],
        ['st', '선물은 보통 아내가 고르고 본인은 결제만 한다.', '가정 내 성 역할 고정관념'], ['', ' '],
        ['ok', '포장이 꼼꼼해 선물하기 좋은 제품을 찾는다.', '후기 “포장이 꼼꼼해서 선물하기 좋았습니다” 13건'], ['', ' '],
        ['st', '경상도 사람이라 말수가 적고 무뚝뚝하다.', '지역에 따른 성격 단정'],
      ] },
    ];
    const FIX = [
      { h: '① 30대 직장인 고객 (고쳐 쓴 버전)', html: '30대 직장인 고객(성별 구분 없음). 아침 대용으로 바삭하고 덜 단 간식을 찾는다 (후기 “아침에 먹기 좋아요” 15건). 빠른 배송을 중요하게 여긴다 (14건). <span class="asm">[가정]</span> 회사에서 간식으로 먹을 수 있다 — 설문으로 확인 필요.' },
      { h: '② 50대 선물 세트 고객 (고쳐 쓴 버전)', html: '50대 선물 구매 고객(성별 구분 없음). 포장이 꼼꼼해 선물하기 좋은 제품을 찾는다 (13건). 선물 세트 구성이 더 다양하길 바란다 (3건). <span class="asm">[가정]</span> 매장과 온라인 중 어디서 사는지는 채널별 판매 자료로 확인 필요.' },
    ];
    const total = P.reduce((a, p) => a + p.segs.filter((s) => s[0] === 'st').length, 0);
    let mode = 'mark';
    function render() {
      if (mode === 'fix') {
        wrap.innerHTML = FIX.map((f) => `<div class="tile" style="border:2px solid var(--ok)"><div class="h">${f.h}</div><div>${f.html}</div></div>`).join('');
        return;
      }
      wrap.classList.toggle('rev', mode === 'rev');
      wrap.innerHTML = P.map((p, pi) => `<div class="tile"><div class="h">${p.h}</div><div>${p.segs.map((s, si) => s[0] ? `<button type="button" class="tg ${s[0]}" data-i="${pi}-${si}">${s[1]}</button>` : s[1]).join('')}</div>${mode === 'rev' ? `<div class="why">${p.segs.filter((s) => s[0]).map((s) => `${s[0] === 'st' ? '✕' : '✓'} ${s[2]}`).join('<br>')}</div>` : ''}</div>`).join('');
      wrap.querySelectorAll('.tg').forEach((b) => {
        if (marked.has(b.dataset.i)) b.classList.add('mk');
        b.addEventListener('click', () => { if (mode !== 'mark') return; marked.has(b.dataset.i) ? marked.delete(b.dataset.i) : marked.add(b.dataset.i); b.classList.toggle('mk'); status(); });
      });
    }
    const marked = new Set();
    function status() {
      const st = $('p-st');
      if (mode === 'fix') { st.className = 'status ok'; st.innerHTML = '<b class="k">고쳐 쓴 버전</b>성별·나이·지역에 대한 단정을 빼고, <strong>문장마다 근거</strong>를 붙였습니다. 근거 없는 내용은 <strong>[가정]</strong>으로 표시해 확인할 일로 남겼습니다. 프롬프트는 다음 장에.'; return; }
      let right = 0, wrong = 0;
      marked.forEach((id) => { const [pi, si] = id.split('-').map(Number); P[pi].segs[si][0] === 'st' ? right++ : wrong++; });
      if (mode === 'rev') {
        st.className = 'status bad';
        st.innerHTML = `<b class="k">근거 없는 추측 ${total}곳 중 ${right}곳을 찾음${wrong ? ` · 근거 있는 문장 ${wrong}곳을 의심함` : ''}</b>바다결 자료에는 성별·나이·지역 정보가 없습니다. 빨간 표현은 AI가 <strong>학습한 글 속의 흔한 패턴(고정관념)</strong>으로 빈칸을 채운 것입니다.`;
      } else {
        st.className = 'status mid';
        st.innerHTML = `<b class="k">${marked.size}개 표시함</b>바다결 자료(판매·후기)에는 고객의 <strong>성별·나이·출신 지역 정보가 없습니다.</strong> 다 고르면 “점검 결과”를 누르세요.`;
      }
    }
    $('p-rev').addEventListener('click', () => { mode = mode === 'rev' ? 'mark' : 'rev'; $('p-rev').innerHTML = mode === 'rev' ? '<svg class="ic"><use href="#i-hand"/></svg> 다시 표시하기' : '<svg class="ic"><use href="#i-eye"/></svg> 점검 결과'; render(); status(); });
    $('p-fix').addEventListener('click', () => { const on = mode !== 'fix'; mode = on ? 'fix' : 'mark'; wrap.classList.remove('rev'); $('p-fix').innerHTML = on ? '<svg class="ic"><use href="#i-reset"/></svg> 원래 버전' : '<svg class="ic"><use href="#i-reset"/></svg> 고쳐 쓴 버전'; $('p-rev').innerHTML = '<svg class="ic"><use href="#i-eye"/></svg> 점검 결과'; render(); status(); });
    render();
  })();

  /* ───────── 4) 확인 강도 카드 ───────── */
  (function verify() {
    const wrap = $('vcards'); if (!wrap) return;
    const L = { lo: '가볍게 읽고 다듬기', mid: '원자료·원문과 대조', hi: '공식 출처 + 담당자 확인' };
    const C = [
      { ic: 'chat', n: '동료 생일 축하 메시지 문구', k: 'lo', a: '틀려도 피해가 작다. 내가 읽고 어색한 표현만 고친다.' },
      { ic: 'bulb', n: 'SNS 게시물 아이디어 10개', k: 'lo', a: '고르는 것은 나. 과장·사실과 다른 표현만 걸러 낸다.' },
      { ic: 'chart', n: '대표 보고용 3분기 매출 합계', k: 'mid', a: '판매 자료로 직접 계산해 맞춰 본다. 숫자 하나가 의사결정을 바꾼다.' },
      { ic: 'book', n: '보고서에 넣을 통계와 전문가 인용', k: 'mid', a: '원문을 찾아 숫자·문장을 대조. 원문을 못 찾으면 빼거나 “확인 필요”로.' },
      { ic: 'alert', n: '고객에게 보낼 알레르기 성분 안내', k: 'hi', a: '건강과 직결. 실제 제품 표시 원본과 담당자(생산팀) 확인 없이는 보내지 않는다.' },
      { ic: 'shield', n: '식품 포장 표시 규정에 관한 답', k: 'hi', a: '법·규정은 바뀐다. 정부·기관 공식 사이트 원문과 담당 부서·전문가에게 확인.' },
    ];
    let opened = 0;
    C.forEach((it) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="ic-badge ${it.k === 'hi' ? 'o' : ''}"><svg class="ic"><use href="#i-${it.ic}"/></svg></span><span class="nm">${it.n}</span><span class="verdict">${L[it.k]}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => { if (b.classList.contains('open')) return; b.classList.add('open', it.k); opened++; $('v-score').textContent = opened + ' / ' + C.length + ' 확인'; });
      wrap.appendChild(b);
    });
  })();
})();
