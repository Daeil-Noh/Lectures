// DEU AX Micro-Degree 공통 교안 스크립트

// 읽기 진행 막대
(function () {
  const bar = document.querySelector('.progress');
  if (!bar) return;
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  };
  document.addEventListener('scroll', update, { passive: true });
  update();
})();

// 퀴즈: <div class="q" data-answer="b" data-explain="..."> 안의 .opts button[data-v]
document.querySelectorAll('.q').forEach((q) => {
  const answer = q.dataset.answer;
  const fb = q.querySelector('.feedback');
  const buttons = q.querySelectorAll('.opts button');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const ok = btn.dataset.v === answer;
      buttons.forEach((b) => {
        b.disabled = true;
        if (b.dataset.v === answer) b.classList.add('correct');
      });
      if (!ok) btn.classList.add('wrong');
      fb.innerHTML = (ok ? '<b class="ok">정답입니다.</b> ' : '<b class="no">다시 생각해 볼까요?</b> ') + q.dataset.explain;
      fb.classList.add('show');
    });
  });
});

// 토글 비교: <div data-switch> 안의 .switch button[data-target] 과 [data-panel]
document.querySelectorAll('[data-switch]').forEach((wrap) => {
  const buttons = wrap.querySelectorAll('.switch button');
  const panels = wrap.querySelectorAll('[data-panel]');
  const show = (id) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', b.dataset.target === id));
    panels.forEach((p) => (p.hidden = p.dataset.panel !== id));
  };
  buttons.forEach((b) => b.addEventListener('click', () => show(b.dataset.target)));
  if (buttons[0]) show(buttons[0].dataset.target);
});
