// DEU AX Micro-Degree 슬라이드 엔진
// · ← → / 스페이스 / 스와이프 / 하단 버튼으로 이동, F 전체화면, #번호로 바로가기
// · .frag 요소는 '다음'을 누를 때마다 하나씩 나타남 (PPT 애니메이션처럼)
// · 슬라이드가 보일 때 document 에 'slideenter' 이벤트 (detail: {index, slide})
(function () {
  const deck = document.querySelector('.deck');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prev = document.querySelector('[data-prev]');
  const next = document.querySelector('[data-next]');
  const count = document.querySelector('.count');
  const bar = document.querySelector('body > .bar') || document.querySelector('.bar');
  const total = slides.length;
  let cur = 0;

  slides.forEach((s, i) => {
    const no = s.querySelector('.s-foot .no');
    if (no) no.textContent = (i + 1) + ' / ' + total;
  });

  function fit() {
    const vp = document.querySelector('.viewport');
    const pad = window.innerWidth < 640 ? 8 : 32;
    const k = Math.min((vp.clientWidth - pad) / 1280, (vp.clientHeight - pad) / 720);
    deck.style.transform = 'translate(-50%, -50%) scale(' + k + ')';
  }

  const frags = (s) => Array.from(s.querySelectorAll('.frag'));
  function setFrags(s, mode) { frags(s).forEach((f) => f.classList.toggle('show', mode === 'all')); }

  function show(i, fromBack) {
    i = Math.max(0, Math.min(total - 1, i));
    const changed = i !== cur;
    cur = i;
    slides.forEach((s, j) => {
      s.classList.toggle('active', j === cur);
      s.setAttribute('aria-hidden', j === cur ? 'false' : 'true');
    });
    if (changed) setFrags(slides[cur], fromBack ? 'all' : 'none');
    count.textContent = (cur + 1) + ' / ' + total;
    bar.style.width = ((cur + 1) / total) * 100 + '%';
    prev.disabled = cur === 0;
    next.disabled = cur === total - 1 && frags(slides[cur]).every((f) => f.classList.contains('show'));
    history.replaceState(null, '', '#' + (cur + 1));
    if (changed) document.dispatchEvent(new CustomEvent('slideenter', { detail: { index: cur, slide: slides[cur] } }));
  }

  function forward() {
    const hidden = frags(slides[cur]).filter((f) => !f.classList.contains('show'));
    if (hidden.length) { hidden[0].classList.add('show'); show(cur); return; }
    if (cur < total - 1) show(cur + 1, false);
  }
  function backward() {
    const shown = frags(slides[cur]).filter((f) => f.classList.contains('show'));
    if (shown.length) { shown[shown.length - 1].classList.remove('show'); show(cur); return; }
    if (cur > 0) show(cur - 1, true);
  }

  prev.addEventListener('click', backward);
  next.addEventListener('click', forward);

  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = e.target.tagName;
    if (tag === 'INPUT' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return; // 슬라이더 조작 중
    const k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && tag !== 'BUTTON')) { e.preventDefault(); forward(); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); backward(); }
    else if (k === 'Home') show(0);
    else if (k === 'End') show(total - 1, true);
    else if (k === 'f' || k === 'F') toggleFs();
  });

  let sx = null, sy = null;
  document.addEventListener('touchstart', (e) => {
    if (e.target.closest('input, .demo')) { sx = null; return; }
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? forward : backward)();
    sx = sy = null;
  });

  function toggleFs() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
    else document.exitFullscreen && document.exitFullscreen();
  }
  const fs = document.querySelector('[data-fs]');
  if (fs) fs.addEventListener('click', toggleFs);

  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', () => {
    const n = parseInt(location.hash.slice(1), 10) - 1;
    if (!isNaN(n) && n !== cur) show(n, true);
  });
  window.addEventListener('beforeprint', () => slides.forEach((s) => setFrags(s, 'all')));
  fit();
  cur = -1;
  show((parseInt(location.hash.slice(1), 10) || 1) - 1, true);
})();

// 퀴즈: <div class="q" data-answer="b" data-explain="..."> 안의 .opts button[data-v]
document.querySelectorAll('.q').forEach((q) => {
  const answer = q.dataset.answer;
  const fb = q.querySelector('.feedback');
  const buttons = q.querySelectorAll('.opts button');
  buttons.forEach((btn) => btn.addEventListener('click', () => {
    const ok = btn.dataset.v === answer;
    buttons.forEach((b) => { b.disabled = true; if (b.dataset.v === answer) b.classList.add('correct'); });
    if (!ok) btn.classList.add('wrong');
    fb.innerHTML = (ok ? '<b class="ok">정답입니다.</b> ' : '<b class="no">다시 생각해 볼까요?</b> ') + q.dataset.explain;
    fb.classList.add('show');
  }));
});

// 코드 블록 색 입히기: <pre class="code"> (파이썬)
document.querySelectorAll('pre.code').forEach((pre) => {
  if (pre.dataset.hl === 'off') return;
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const KW = /^(import|from|as|def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|print|class|with|try|except|lambda|pass|break|continue|range|len)$/;
  const src = pre.textContent;
  let out = '', i = 0;
  const re = /(#[^\n]*)|("""[\s\S]*?"""|'[^'\n]*'|"[^"\n]*"|f'[^'\n]*'|f"[^"\n]*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_가-힣][A-Za-z0-9_가-힣]*)(?=\s*\()|([A-Za-z_][A-Za-z0-9_]*)/g;
  let m;
  while ((m = re.exec(src))) {
    out += esc(src.slice(i, m.index));
    if (m[1]) out += '<span class="c">' + esc(m[1]) + '</span>';
    else if (m[2]) out += '<span class="s">' + esc(m[2]) + '</span>';
    else if (m[3]) out += '<span class="n">' + m[3] + '</span>';
    else if (m[4]) out += (KW.test(m[4]) ? '<span class="k">' : '<span class="f">') + esc(m[4]) + '</span>';
    else out += KW.test(m[5]) ? '<span class="k">' + m[5] + '</span>' : m[5];
    i = re.lastIndex;
  }
  pre.innerHTML = out + esc(src.slice(i));
});

// 프롬프트 복사 버튼: .prompt 안의 .copy → 같은 상자의 pre 내용을 클립보드로
document.querySelectorAll('.prompt .copy').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const pre = btn.closest('.prompt').querySelector('pre');
    const text = pre ? pre.innerText : '';
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      ta.remove();
    }
    const old = btn.textContent;
    btn.textContent = ok ? '복사됨' : '직접 선택해 복사';
    btn.classList.toggle('done', ok);
    setTimeout(() => { btn.textContent = old; btn.classList.remove('done'); }, 1600);
  });
});
