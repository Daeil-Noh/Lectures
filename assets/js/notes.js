// 발표자 노트·강의 시계·슬라이드 목록 (슬라이드 엔진 보조)
// · 슬라이드 안 <aside class="notes" data-min="3">말할 내용</aside>
// · N: 노트 패널(이 슬라이드 예정 시간, 누적 예정 시간, 경과 시간) · T: 강의 시계 시작/정지 · O: 슬라이드 목록
(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const mins = slides.map((s) => { const n = s.querySelector('aside.notes'); return n ? parseFloat(n.dataset.min || '0') : 0; });
  const total = mins.reduce((a, b) => a + b, 0);
  const cum = []; mins.reduce((a, b, i) => (cum[i] = a + b), 0);

  const panel = document.createElement('div');
  panel.id = 'notes'; panel.setAttribute('aria-live', 'polite');
  document.body.appendChild(panel);
  let started = null, acc = 0, tick = null;
  const fmt = (ms) => { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const elapsed = () => acc + (started ? Date.now() - started : 0);
  const cur = () => Math.max(0, slides.findIndex((s) => s.classList.contains('active')));

  function render() {
    const i = cur();
    const n = slides[i].querySelector('aside.notes');
    const plan = cum[i] || 0;
    const el = elapsed() / 60000;
    const diff = started || acc ? Math.round(el - plan) : null;
    panel.innerHTML = '<div class="hd"><span>슬라이드 <b>' + (i + 1) + '</b> / ' + slides.length + '</span>' +
      '<span>이 장 예정 <b>' + (mins[i] || 0) + '분</b></span>' +
      '<span>누적 예정 <b>' + Math.round(plan) + '분</b> / ' + Math.round(total) + '분</span>' +
      '<span>경과 <b>' + fmt(elapsed()) + '</b>' + (diff === null ? ' (T로 시작)' : diff > 2 ? ' · ' + diff + '분 늦음' : diff < -2 ? ' · ' + (-diff) + '분 여유' : ' · 계획대로') + '</span></div>' +
      '<div class="tx">' + (n ? n.innerHTML : '<i>이 장에는 노트가 없습니다.</i>') + '</div>';
  }
  document.addEventListener('slideenter', () => { if (panel.classList.contains('show')) render(); });

  // 슬라이드 목록 (O)
  const ov = document.createElement('div');
  ov.id = 'overview'; ov.hidden = true;
  ov.innerHTML = '<div class="ov-in"><div class="ov-h">슬라이드 목록 <small>클릭하면 이동 · O 또는 Esc로 닫기</small></div><ol>' + slides.map((s, i) => {
    const h = s.querySelector('h1, h2'); const sec = s.querySelector('.s-head .sec');
    const t = (h ? h.textContent : '').replace(/\s+/g, ' ').trim();
    return '<li><a href="#' + (i + 1) + '"><span class="ov-n">' + (i + 1) + '</span><span class="ov-s">' + (sec ? sec.textContent : '') + '</span>' + t + '</a></li>';
  }).join('') + '</ol></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', (e) => { if (e.target.closest('a') || e.target === ov) ov.hidden = true; });

  document.addEventListener('keydown', (e) => {
    const t = e.target; if (e.altKey || e.ctrlKey || e.metaKey || /TEXTAREA|SELECT/.test(t.tagName) || (t.tagName === 'INPUT' && !/checkbox|radio|range/.test(t.type))) return;
    if (e.key === 'n' || e.key === 'N') { panel.classList.toggle('show'); render(); }
    else if (e.key === 't' || e.key === 'T') {
      if (started) { acc += Date.now() - started; started = null; clearInterval(tick); }
      else { started = Date.now(); tick = setInterval(() => { if (panel.classList.contains('show')) render(); }, 1000); }
      panel.classList.add('show'); render();
    } else if (e.key === 'o' || e.key === 'O') { ov.hidden = !ov.hidden; }
    else if (e.key === 'Escape') { ov.hidden = true; panel.classList.remove('show'); }
  });
})();
