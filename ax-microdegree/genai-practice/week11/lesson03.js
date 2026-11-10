// 11주 3차시 전용: OK·주의·금지 판정 카드, AI 활용 표시 문구 만들기
(function () {
  const $ = (id) => document.getElementById(id);
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };

  /* ───────── 1) OK · 주의 · 금지 ───────── */
  (function judge() {
    const wrap = $('jcards'); if (!wrap) return;
    const items = [
      { ic: 'image', n: 'Gemini로 만든 그래놀라 이미지를 SNS에 올리며 “AI로 만든 연출 이미지” 표시', k: 'ok', v: 'OK', a: '직접 기획·생성하고 표시까지 했다. 서비스 약관의 상업적 이용 조건만 확인.' },
      { ic: 'copyright', n: '다른 회사 광고 사진을 올리고 “이거랑 똑같이 만들어 줘”', k: 'no', v: '금지', a: '원작을 보고 비슷하게 만드는 것(의거성 + 실질적 유사성) → 저작권 침해가 될 수 있다.' },
      { ic: 'pen', n: '“수채화풍, 파스텔 3색, 여백 많은 일러스트로” 요청', k: 'ok', v: 'OK', a: '일반적인 화풍과 특징을 말로 설명했다. 특정 작품을 재현하지 않는다.' },
      { ic: 'user', n: '살아 있는 인기 일러스트 작가 이름을 넣어 “이 작가 스타일 그대로”', k: 'mid', v: '주의', a: '결과가 그 작가 작품과 비슷해질 위험, 분쟁·평판 문제. 이름 대신 특징을 말로 풀어 쓴다.' },
      { ic: 'sparkles', n: '유명 배우 얼굴을 닮은 AI 모델로 광고 이미지 만들기', k: 'no', v: '금지', a: '초상권, 그리고 유명인의 이름·얼굴을 영업에 무단으로 쓰는 부정경쟁행위가 될 수 있다.' },
      { ic: 'user', n: '동료 직원의 사진을 올려 광고 모델 이미지로 바꾸기', k: 'mid', v: '주의 — 동의 먼저', a: '본인의 분명한 동의가 먼저(어디에, 얼마 동안 쓸지 포함). 얼굴 사진은 개인정보이기도 하다.' },
      { ic: 'music', n: '편집 앱의 무료 음원을 넣은 숏폼을 회사 계정에 올리기', k: 'mid', v: '주의 — 조건 확인', a: '“무료”라도 상업적 이용·출처 표시 조건이 다를 수 있다. 음원 이용 조건을 확인한다.' },
      { ic: 'alert', n: 'AI가 만든 이미지를 “내가 직접 그린 작품”이라며 저작권 등록', k: 'no', v: '금지', a: 'AI 산출물을 사람이 창작한 것처럼 등록하면 허위 등록으로 처벌될 수 있다.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="ic-badge ${it.k === 'no' || it.k === 'mid' ? 'o' : ''}"><svg class="ic"><use href="#i-${it.ic}"/></svg></span><span class="nm">${it.n}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('jc-score').textContent = opened + ' / ' + items.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  })();

  /* ───────── 2) AI 활용 표시 문구 만들기 ───────── */
  (function label() {
    const post = $('lb-post'); if (!post) return;
    const st = { type: 'img', pos: 'cap', use: { gen: true, text: false, voice: false }, add: { tool: false, real: false, human: false } };
    function sw(id, key) {
      document.querySelectorAll('#' + id + ' button').forEach((b) => b.addEventListener('click', () => {
        st[key] = b.dataset.v;
        if (key === 'type') { const vb = document.querySelector('#lb-use .tgl[data-k=voice]'); vb.disabled = st.type === 'img'; vb.style.opacity = st.type === 'img' ? .4 : 1; if (st.type === 'img') { st.use.voice = false; vb.setAttribute('aria-pressed', 'false'); } }
        document.querySelectorAll('#' + id + ' button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        render();
      }));
    }
    sw('lb-type', 'type'); sw('lb-pos', 'pos');
    document.querySelectorAll('#lb-use .tgl').forEach((b) => b.addEventListener('click', () => { st.use[b.dataset.k] = toggle(b); render(); }));
    document.querySelectorAll('#lb-add .tgl').forEach((b) => b.addEventListener('click', () => { st.add[b.dataset.k] = toggle(b); render(); }));

    function text() {
      const u = st.use, a = st.add, img = st.type === 'img';
      const s = [];
      if (u.gen) s.push(`${img ? '이 게시물의 이미지는' : '이 영상의 일부 장면은'} 생성형 AI${a.tool ? '(Gemini)' : ''}로 만들었습니다.`);
      if (u.voice) s.push('내레이션은 AI 음성입니다.');
      if (u.text) s.push(`${img ? '문구' : '대본'} 초안 작성에 생성형 AI${a.tool ? '(Gemini·Claude)' : ''}를 활용했습니다.`);
      if (!s.length) return '';
      if (a.real && u.gen) s.push(img ? '연출 이미지로, 실제 제품과 다를 수 있습니다.' : 'AI로 만든 장면은 연출로, 실제 제품과 다를 수 있습니다.');
      if (a.human) s.push('최종 편집과 사실 확인은 바다결 마케팅팀이 했습니다.');
      return s.join(' ');
    }
    function badge() {
      const u = st.use;
      if (u.gen) return st.type === 'img' ? 'AI 생성 이미지' : 'AI 생성 장면 포함';
      if (u.voice) return 'AI 음성 사용';
      if (u.text) return 'AI 활용';
      return '';
    }
    function render() {
      const t = text(), bd = badge(), img = st.type === 'img';
      const onMedia = (st.pos === 'on' || st.pos === 'both') && bd;
      const inCap = (st.pos === 'cap' || st.pos === 'both') && t;
      const cap = img ? '바쁜 아침, 한 그릇이면 충분해<br>#바다결 #그래놀라 #출근전아침' : '아침 또 거를 거예요? 붓기만 하면 준비 끝.<br>#바다결 #그래놀라 #숏폼';
      const sketch = `<svg viewBox="0 0 200 200" style="width:${img ? '78%' : '90%'}" aria-hidden="true"><rect y="120" width="200" height="80" fill="#d2ad84"/><ellipse cx="100" cy="122" rx="62" ry="20" fill="#fff" stroke="#1f4e79" stroke-width="3"/><path d="M38 122 Q42 166 100 170 Q158 166 162 122" fill="#fff" stroke="#1f4e79" stroke-width="3"/><g fill="#b8834a"><circle cx="82" cy="118" r="7"/><circle cx="102" cy="112" r="8"/><circle cx="122" cy="120" r="7"/><circle cx="96" cy="126" r="5"/></g></svg>`;
      let media = `<div class="media ${img ? 'img' : 'vid'}">${sketch}`;
      if (onMedia) media += img ? `<span class="badge">${bd}</span>` : `<span class="endcap">${t.split('.')[0]}.</span>`;
      if (!img) media += `<span class="badge" style="background:rgba(0,0,0,.4)">▶ 0:24</span>`;
      media += '</div>';
      post.innerHTML = `<div class="ph"><span class="av">바</span>바다결 (가상 계정)</div>${media}<div class="cap">${cap}${inCap ? `<span class="ai">${t}</span>` : ''}</div>`;
      $('lb-out').textContent = t || '(AI를 쓴 곳을 하나 이상 고르세요)';
      const s = $('lb-st'), u = st.use, a = st.add;
      if (!u.gen && !u.text && !u.voice) { s.className = 'status ok'; s.innerHTML = '<b class="k">표시할 것 없음</b>AI를 쓰지 않았다면 표시하지 않습니다. 정말 안 썼는지 다시 확인!'; }
      else if (u.gen && !a.real) { s.className = 'status mid'; s.innerHTML = `<b class="k">하나 더</b>제품이 나오는 AI ${img ? '이미지' : '장면'}라면 <strong>“실제 제품과 다를 수 있음”</strong>을 덧붙이세요.`; }
      else if (u.gen && st.pos === 'cap') { s.className = 'status mid'; s.innerHTML = '<b class="k">위치 점검</b>글은 펼쳐 보지 않는 사람도 많습니다. 진짜처럼 보이는 이미지라면 <strong>화면 위</strong>에도 표시해 보세요.'; }
      else if (!u.gen && !u.voice) { s.className = 'status ok'; s.innerHTML = '<b class="k">좋아요</b>대본·문구 보조는 플랫폼 기준상 공개가 필수가 아닌 경우가 많지만(예: 유튜브), <strong>이 수업 과제에서는 밝힙니다.</strong>'; }
      else { s.className = 'status ok'; s.innerHTML = '<b class="k">좋아요</b>무엇을 AI로 만들었는지, 실제와 다를 수 있다는 점이 분명합니다. 복사해서 과제2 양식 3번에 붙여 넣으세요.'; }
    }
    const vb0 = document.querySelector('#lb-use .tgl[data-k=voice]'); vb0.disabled = true; vb0.style.opacity = .4;
    render();
  })();
})();
