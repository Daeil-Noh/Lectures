// 슬라이드 교안 자동 점검: node tools/check_lesson.js <lesson.html> <스크린샷 폴더>
// · 모든 슬라이드를 1366×820 화면에서 열고, 단계별 요소(.frag)를 모두 펼친 뒤 스크린샷을 저장합니다.
// · 스크립트 오류, 슬라이드 아래쪽(꼬리말 영역)이나 오른쪽을 넘치는 요소를 찾아 알려 줍니다.
// · 스크린샷 6장을 한 장으로 모은 grid-N.png 도 만듭니다(눈으로 확인용).
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [file, out] = process.argv.slice(2);
  if (!file || !out) { console.log('usage: node tools/check_lesson.js lesson.html outdir'); process.exit(2); }
  require('fs').mkdirSync(out, { recursive: true });
  const url = 'file://' + path.resolve(file);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1366, height: 820 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/TUNNEL|net::|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
  await p.goto(url); await p.waitForTimeout(700);
  const n = await p.$$eval('.slide', (s) => s.length);
  const problems = [];
  const shots = [];
  for (let i = 1; i <= n; i++) {
    await p.evaluate((i) => { location.hash = '#' + i; }, i);
    await p.waitForTimeout(200);
    for (let k = 0; k < 12; k++) {
      const left = await p.$$eval('.slide.active .frag:not(.show)', (x) => x.length);
      if (!left) break;
      await p.keyboard.press('ArrowRight'); await p.waitForTimeout(60);
    }
    await p.waitForTimeout(350);
    const bad = await p.evaluate(() => {
      const s = document.querySelector('.slide.active');
      const sr = s.getBoundingClientRect(); const k = sr.height / 720;
      const foot = s.querySelector('.s-foot');
      const limitY = foot ? foot.getBoundingClientRect().top - 4 : sr.bottom - 40 * k;
      const res = [];
      s.querySelectorAll('*').forEach((e) => {
        if (e.closest('.s-foot') || e.closest('[hidden]') || e.closest('svg') && e.tagName.toLowerCase() !== 'svg') return;
        const st = getComputedStyle(e);
        if (st.display === 'none' || st.visibility === 'hidden' || st.position === 'absolute' && e.classList.contains('scanline')) return;
        const r = e.getBoundingClientRect();
        if (!r.width || !r.height) return;
        if (r.bottom > limitY + 1) res.push(`아래로 ${Math.round((r.bottom - limitY) / k)}px 넘침: <${e.tagName.toLowerCase()} class="${e.className.baseVal ?? e.className}"> ${(e.textContent || '').trim().slice(0, 40)}`);
        else if (r.right > sr.right - 70 * k + 1) res.push(`오른쪽으로 ${Math.round((r.right - (sr.right - 70 * k)) / k)}px 넘침: <${e.tagName.toLowerCase()}> ${(e.textContent || '').trim().slice(0, 40)}`);
      });
      // 가장 바깥 요소만 남기기
      return res.slice(0, 3);
    });
    if (bad.length) problems.push(`[${i}] ` + bad.join(' | '));
    const f = path.join(out, `s-${String(i).padStart(2, '0')}.png`);
    await p.screenshot({ path: f }); shots.push(f);
  }
  // 그리드 이미지
  const g = await b.newPage({ viewport: { width: 1366, height: 1230 } });
  for (let k = 0; k < shots.length; k += 6) {
    const imgs = shots.slice(k, k + 6).map((s) => `<img src="file://${s}" style="width:683px;height:410px;display:block;float:left">`).join('');
    const gf = path.join(out, `_grid.html`);
    require('fs').writeFileSync(gf, `<body style="margin:0;background:#fff">${imgs}</body>`);
    await g.goto('file://' + gf); await g.waitForTimeout(300);
    await g.screenshot({ path: path.join(out, `grid-${k / 6 + 1}.png`) });
  }
  console.log(`slides: ${n}`);
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'errors: none');
  console.log(problems.length ? 'OVERFLOW:\n' + problems.join('\n') : 'overflow: none');
  console.log(`screenshots: ${out}/s-XX.png, grids: ${out}/grid-N.png`);
  await b.close();
})();
