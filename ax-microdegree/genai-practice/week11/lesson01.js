// 11주 1차시 전용: 이미지 프롬프트 조립기(구도 스케치), 브랜드 일관성 맞추기, 이미지 프롬프트 판정 카드
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);
  const toggle = (btn) => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); return on; };
  let uid = 0;

  // 팔레트: 배경색 / 주 색(테두리·냅킨) / 포인트 / 포장
  const PAL = {
    brand: { bg: 'var(--bd-sand)', main: 'var(--bd-navy)', point: 'var(--bd-coral)', pack: 'var(--bd-sand)' },
    plain: { bg: '#efe8dc', main: '#8a8f98', point: '#c9a36b', pack: '#f1ece2' },
    neon: { bg: '#ff7fbf', main: '#16c7a8', point: '#fff04a', pack: '#ffd1ec' },
    dark: { bg: '#3a3430', main: '#8a6a44', point: '#c94f2c', pack: '#5a4c40' },
    pastel: { bg: '#cfe7f7', main: '#e58fb6', point: '#9fd49a', pack: '#fbe3ee' },
  };

  /* ── 공통: 장면 스케치 그리기 ──
     o = { subj, bg, angle, light, style, pal, space }  (값이 null 이면 '?' 표시) */
  function scene(parent, x, y, w, h, o, opts) {
    opts = opts || {};
    const id = 'sk' + (uid++);
    const P = PAL[o.pal || 'plain'];
    const defs = el('defs', {}, parent);
    const cp = el('clipPath', { id: id + 'c' }, defs); el('rect', { x, y, width: w, height: h, rx: 10 }, cp);
    const f = el('filter', { id: id + 'w', x: '-5%', y: '-5%', width: '110%', height: '110%' }, defs);
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.035, numOctaves: 2, seed: 4 }, f);
    el('feDisplacementMap', { in: 'SourceGraphic', scale: 7 }, f);
    const g = el('g', { 'clip-path': `url(#${id}c)` }, parent);
    const art = el('g', o.style === 'water' ? { filter: `url(#${id}w)`, opacity: 0.92 } : {}, g);
    const ang = o.angle || '45';
    const top = ang === 'top';
    // 배경
    const horizon = y + h * 0.58;
    if (!o.bg) {
      el('rect', { x, y, width: w, height: h, fill: 'var(--surface-2)' }, art);
    } else if (o.bg === 'studio') {
      el('rect', { x, y, width: w, height: h, fill: P.bg }, art);
      if (!top) el('rect', { x, y: horizon, width: w, height: h, fill: P.bg, opacity: 0.7 }, art), el('line', { x1: x, x2: x + w, y1: horizon, y2: horizon, stroke: '#000', 'stroke-opacity': 0.08, 'stroke-width': 2 }, art);
    } else if (o.bg === 'wood') {
      if (top) {
        el('rect', { x, y, width: w, height: h, fill: 'var(--sk-wood)' }, art);
        for (let k = 1; k < 5; k++) el('line', { x1: x + w * k / 5, x2: x + w * k / 5, y1: y, y2: y + h, stroke: 'var(--sk-wood2)', 'stroke-width': 2 }, art);
      } else {
        el('rect', { x, y, width: w, height: h, fill: '#f3e9da' }, art);
        el('rect', { x, y: horizon, width: w, height: h, fill: 'var(--sk-wood)' }, art);
        for (let k = 1; k < 4; k++) el('line', { x1: x, x2: x + w, y1: horizon + (h * 0.42) * k / 4, y2: horizon + (h * 0.42) * k / 4, stroke: 'var(--sk-wood2)', 'stroke-width': 1.5 }, art);
      }
    } else if (o.bg === 'sea') {
      if (top) {
        el('rect', { x, y, width: w, height: h, fill: 'var(--bd-sand)' }, art);
        el('rect', { x, y, width: w, height: h * 0.16, fill: 'var(--sk-sky)' }, art);
        el('path', { d: `M${x} ${y + h * 0.13} q${w / 8} -8 ${w / 4} 0 t${w / 4} 0 t${w / 4} 0 t${w / 4} 0 V${y + h * 0.16} H${x}z`, fill: 'var(--sk-sea)' }, art);
      } else {
        el('rect', { x, y, width: w, height: horizon - y, fill: 'var(--sk-sky)' }, art);
        el('path', { d: `M${x} ${y + h * 0.36} q${w / 8} -10 ${w / 4} 0 t${w / 4} 0 t${w / 4} 0 t${w / 4} 0 V${horizon} H${x}z`, fill: 'var(--sk-sea)' }, art);
        el('path', { d: `M${x + w * 0.5} ${y} V${horizon} M${x} ${y + h * 0.2} H${x + w}`, stroke: '#fff', 'stroke-width': 6 }, art);
        el('rect', { x, y: horizon, width: w, height: h, fill: '#e9dcc6' }, art);
      }
    }
    // 위치·크기
    const s = Math.min(w, h) * (ang === 'close' ? 0.5 : 0.24);
    const cx = x + w * (o.space === 'tr' ? 0.42 : o.space === 'bl' ? 0.6 : 0.5);
    const cy = top ? y + h * (o.space === 'bl' ? 0.42 : 0.56) : ang === 'close' ? y + h * 0.78 : y + h * 0.68;
    // 그림자
    const sh = { morning: [s * 0.35, s * 0.2], sunset: [-s * 0.7, s * 0.15], studio: [0, s * 0.12] }[o.light] || [s * 0.1, s * 0.15];
    if (o.style !== 'illust') el('ellipse', { cx: cx + sh[0], cy: cy + (top ? sh[1] : s * 0.55 + sh[1] * 0.3), rx: s * (o.light === 'sunset' ? 1.5 : 1.15), ry: top ? s * 1.02 : s * 0.3, fill: '#000', opacity: 0.14 }, art);
    // 냅킨 (브랜드 주 색)
    if (o.pal === 'brand' || opts.napkin) {
      if (top) el('rect', { x: cx - s * 1.35, y: cy + s * 0.35, width: s * 1.1, height: s * 0.9, rx: 6, fill: P.main, opacity: 0.85, transform: `rotate(-12 ${cx} ${cy})` }, art);
      else el('path', { d: `M${cx - s * 1.6} ${cy + s * 0.5} L${cx - s * 0.6} ${cy + s * 0.3} L${cx - s * 0.2} ${cy + s * 0.62} L${cx - s * 1.3} ${cy + s * 0.86}Z`, fill: P.main, opacity: 0.85 }, art);
    }
    const stroke = o.style === 'illust' ? 'var(--text)' : P.main;
    const sw = o.style === 'illust' ? 4 : 2.5;
    drawObj(art, o.subj || 'granola', cx, cy, s, ang, P, stroke, sw);
    // 조명
    if (o.light === 'morning') {
      const gid = id + 'g';
      const lg = el('linearGradient', { id: gid, x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
      el('stop', { offset: 0, 'stop-color': '#fff6dc', 'stop-opacity': 0.55 }, lg); el('stop', { offset: 0.6, 'stop-color': '#fff6dc', 'stop-opacity': 0 }, lg);
      el('rect', { x, y, width: w, height: h, fill: `url(#${gid})` }, g);
      const sun = el('g', { transform: `translate(${x + 8} ${y + 8}) scale(${Math.max(1, w / 220)})`, style: 'color:#e0a020' }, g); el('use', { href: '#i-sun', width: 24, height: 24 }, sun);
    } else if (o.light === 'sunset') {
      const gid = id + 'g';
      const lg = el('linearGradient', { id: gid, x1: 1, y1: 0.5, x2: 0, y2: 0.5 }, defs);
      el('stop', { offset: 0, 'stop-color': '#ff9a4a', 'stop-opacity': 0.45 }, lg); el('stop', { offset: 0.8, 'stop-color': '#ff9a4a', 'stop-opacity': 0 }, lg);
      el('rect', { x, y, width: w, height: h, fill: `url(#${gid})` }, g);
      el('circle', { cx: x + w - 4, cy: y + h * 0.45, r: Math.min(w, h) * 0.08, fill: '#ff8a3a', opacity: 0.8 }, g);
    } else if (o.light === 'studio') {
      [[x + w * 0.08, y + 6], [x + w * 0.72, y + 6]].forEach(([lx, ly]) => el('rect', { x: lx, y: ly, width: w * 0.2, height: h * 0.06, rx: 3, fill: '#fff', stroke: '#bbb', 'stroke-width': 1.5 }, g));
    }
    // 여백
    if (o.space) {
      const bx = o.space === 'tr' ? x + w * 0.6 : x + w * 0.06, by = o.space === 'tr' ? y + h * 0.08 : y + h * 0.72;
      el('rect', { x: bx, y: by, width: w * 0.34, height: h * 0.18, rx: 6, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, g);
      if (!opts.small) el('text', { x: bx + w * 0.17, y: by + h * 0.09 + 5, 'text-anchor': 'middle', style: 'font-size:14px;font-weight:800;fill:var(--accent)' }, g).textContent = '글자 자리';
    }
    el('rect', { x, y, width: w, height: h, rx: 10, fill: 'none', stroke: 'var(--line)', 'stroke-width': 2 }, parent);
    return g;
  }

  function drawObj(g, subj, cx, cy, s, ang, P, stroke, sw) {
    const top = ang === 'top';
    const dots = [[-0.35, -0.2, 0.17], [0.05, -0.38, 0.18], [0.38, -0.12, 0.16], [-0.1, 0.12, 0.17], [0.28, 0.28, 0.14], [-0.42, 0.3, 0.12], [0.1, -0.05, 0.12]];
    if (subj === 'granola' || subj === 'nuts') {
      const dc = subj === 'nuts' ? '#9a6a3c' : 'var(--sk-gran)';
      if (top) {
        el('circle', { cx, cy, r: s, fill: 'var(--sk-bowl)', stroke, 'stroke-width': sw }, g);
        el('circle', { cx, cy, r: s * 0.8, fill: subj === 'nuts' ? '#e9d8bf' : '#f6efe2' }, g);
        dots.forEach(([dx, dy, r]) => subj === 'nuts'
          ? el('ellipse', { cx: cx + dx * s, cy: cy + dy * s, rx: r * s * 1.2, ry: r * s * 0.7, fill: dc }, g)
          : el('circle', { cx: cx + dx * s, cy: cy + dy * s, r: r * s, fill: dc }, g));
      } else {
        const rx = s * 1.15, ry = s * 0.36;
        el('path', { d: `M${cx - rx} ${cy} Q${cx - rx * 0.92} ${cy + s * 0.95} ${cx} ${cy + s * 0.98} Q${cx + rx * 0.92} ${cy + s * 0.95} ${cx + rx} ${cy}`, fill: 'var(--sk-bowl)', stroke, 'stroke-width': sw }, g);
        el('ellipse', { cx, cy, rx, ry, fill: subj === 'nuts' ? '#e9d8bf' : '#f6efe2', stroke, 'stroke-width': sw }, g);
        dots.forEach(([dx, dy, r]) => el('ellipse', { cx: cx + dx * rx * 0.9, cy: cy + dy * ry * 1.1 - ry * 0.15, rx: r * s * (subj === 'nuts' ? 1.1 : 0.9), ry: r * s * 0.55, fill: dc }, g));
        if (subj === 'granola') el('path', { d: `M${cx + rx * 0.5} ${cy - ry * 0.2} L${cx + rx * 1.15} ${cy - s * 0.9}`, stroke: '#b9b9b9', 'stroke-width': Math.max(3, s * 0.08), 'stroke-linecap': 'round' }, g);
      }
    } else if (subj === 'chips') {
      // 봉지 (글자 없음)
      const bw = s * 0.95, bh = s * 1.35;
      const bx = cx - s * 1.45, by = top ? cy - bh * 0.7 : cy - bh * 0.95;
      el('rect', { x: bx, y: by, width: bw, height: bh, rx: 6, fill: P.pack, stroke, 'stroke-width': sw, transform: top ? `rotate(-10 ${bx} ${by})` : '' }, g);
      el('rect', { x: bx + bw * 0.2, y: by + bh * 0.35, width: bw * 0.6, height: bh * 0.25, rx: 4, fill: P.point, opacity: 0.85, transform: top ? `rotate(-10 ${bx} ${by})` : '' }, g);
      const px = cx + s * 0.25;
      if (top) el('circle', { cx: px, cy, r: s * 0.9, fill: 'var(--sk-bowl)', stroke, 'stroke-width': sw }, g);
      else el('ellipse', { cx: px, cy: cy + s * 0.25, rx: s * 1.05, ry: s * 0.3, fill: 'var(--sk-bowl)', stroke, 'stroke-width': sw }, g);
      [[-0.4, -0.2, 20], [0.1, -0.35, -15], [0.4, 0.05, 35], [-0.15, 0.2, -40], [0.2, 0.35, 10]].forEach(([dx, dy, rot]) => {
        const qx = px + dx * s, qy = (top ? cy : cy + s * 0.12) + dy * s * (top ? 1 : 0.4);
        el('ellipse', { cx: qx, cy: qy, rx: s * 0.26, ry: s * 0.15, fill: '#c9a36b', stroke: '#8a6a3c', 'stroke-width': 1.2, transform: `rotate(${rot} ${qx} ${qy})` }, g);
      });
    } else if (subj === 'gift') {
      const bw = s * 2, bh = s * 1.2;
      if (top) {
        el('rect', { x: cx - s, y: cy - s * 0.8, width: bw, height: s * 1.6, rx: 6, fill: P.main, stroke, 'stroke-width': sw }, g);
        el('path', { d: `M${cx} ${cy - s * 0.8} V${cy + s * 0.8} M${cx - s} ${cy} H${cx + s}`, stroke: P.point, 'stroke-width': s * 0.18 }, g);
        el('circle', { cx, cy, r: s * 0.2, fill: P.point }, g);
      } else {
        const d = s * 0.45;
        el('path', { d: `M${cx - s} ${cy - bh * 0.4} L${cx - s + d} ${cy - bh * 0.4 - d * 0.6} H${cx + s + d} L${cx + s} ${cy - bh * 0.4}Z`, fill: P.main, opacity: 0.8, stroke, 'stroke-width': sw }, g);
        el('path', { d: `M${cx + s} ${cy - bh * 0.4} L${cx + s + d} ${cy - bh * 0.4 - d * 0.6} V${cy + bh * 0.6 - d * 0.6} L${cx + s} ${cy + bh * 0.6}Z`, fill: P.main, opacity: 0.65, stroke, 'stroke-width': sw }, g);
        el('rect', { x: cx - s, y: cy - bh * 0.4, width: bw, height: bh, fill: P.main, stroke, 'stroke-width': sw }, g);
        el('path', { d: `M${cx} ${cy - bh * 0.4} V${cy + bh * 0.6}`, stroke: P.point, 'stroke-width': s * 0.16 }, g);
        el('path', { d: `M${cx} ${cy - bh * 0.4} q${-s * 0.4} ${-s * 0.5} ${-s * 0.55} ${-s * 0.1} z M${cx} ${cy - bh * 0.4} q${s * 0.4} ${-s * 0.5} ${s * 0.55} ${-s * 0.1} z`, fill: P.point }, g);
      }
    }
  }

  /* ───────── 1) 이미지 프롬프트 조립기 ───────── */
  (function builder() {
    const wrap = $('pb-groups'); if (!wrap) return;
    const G = [
      { k: 'subj', n: '피사체', main: true, opts: [['granola', '그래놀라', '그래놀라 한 그릇, 우유를 막 부은 모습'], ['chips', '현미칩', '미역귀 현미칩을 담은 접시와 봉지 하나'], ['gift', '선물 세트', '리본을 묶은 선물 세트 상자 하나']] },
      { k: 'bg', n: '배경', main: true, opts: [['wood', '원목 식탁', '아침 햇살이 드는 밝은 원목 식탁'], ['sea', '바다 창가', '부산 바다가 멀리 보이는 창가'], ['studio', '단색 배경', '단색 모래 베이지 배경']] },
      { k: 'angle', n: '구도', main: true, opts: [['top', '탑뷰', '위에서 내려다본 구도'], ['45', '45도', '45도 각도, 식탁에 앉은 눈높이'], ['close', '클로즈업', '가까이 클로즈업, 질감이 보이게']] },
      { k: 'light', n: '조명', main: true, opts: [['morning', '아침 자연광', '왼쪽 위에서 드는 부드러운 아침 자연광'], ['studio', '스튜디오', '밝고 균일한 스튜디오 조명'], ['sunset', '해질녘', '오른쪽에서 드는 따뜻한 해질녘 빛']] },
      { k: 'style', n: '스타일', main: true, opts: [['photo', '사진', '사실적인 제품 사진'], ['illust', '일러스트', '밝고 단순한 일러스트'], ['water', '수채화', '부드러운 수채화풍 그림']] },
      { k: 'ratio', n: '비율', main: true, opts: [['1:1', '1:1', '1:1 정사각'], ['4:5', '4:5', '4:5 세로'], ['9:16', '9:16', '9:16 세로'], ['16:9', '16:9', '16:9 가로']] },
      { k: 'extra', n: '추가', multi: true, opts: [['space', '글자 여백', '오른쪽 위에 글자를 넣을 빈 공간을 남겨 줘'], ['notext', '글자 없음', '이미지 안에 글자·로고는 넣지 마'], ['brand', '브랜드 색', '색감은 바다 남색과 모래 베이지 위주로 차분하게']] },
    ];
    const st = { subj: 'granola', bg: null, angle: null, light: null, style: null, ratio: null, extra: new Set() };
    G.forEach((gr) => {
      const row = document.createElement('div'); row.className = 'grp'; row.dataset.k = gr.k;
      row.innerHTML = `<b>${gr.n}</b><div class="chips"></div>`;
      const box = row.querySelector('.chips');
      gr.opts.forEach(([v, label]) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = label; b.dataset.v = v;
        b.setAttribute('aria-pressed', gr.multi ? 'false' : String(st[gr.k] === v));
        b.addEventListener('click', () => {
          if (gr.multi) { toggle(b) ? st.extra.add(v) : st.extra.delete(v); }
          else {
            st[gr.k] = st[gr.k] === v ? null : v;
            box.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.v === st[gr.k])));
          }
          render();
        });
        box.appendChild(b);
      });
      wrap.appendChild(row);
    });
    const txt = (k) => { const gr = G.find((g) => g.k === k); const o = gr.opts.find((x) => x[0] === st[k]); return o ? o[2] : null; };
    const svg = $('pb-sk');
    function render() {
      const main = G.filter((g) => g.main);
      const have = main.filter((g) => st[g.k]);
      const miss = main.filter((g) => !st[g.k]).map((g) => g.n);
      document.querySelectorAll('#pb-groups .grp').forEach((r) => r.classList.toggle('miss', r.dataset.k !== 'extra' && !st[r.dataset.k]));
      $('pb-n').textContent = have.length + ' / 6';
      $('pb-bar').style.width = (have.length / 6 * 100) + '%';
      // 프롬프트
      let p = (txt('style') ? txt('style') + ' ' : '') + '이미지를 만들어 줘.';
      [['subj', '피사체'], ['bg', '배경'], ['angle', '구도'], ['light', '조명'], ['ratio', '비율']].forEach(([k, n]) => { if (st[k]) p += `\n- ${n}: ${txt(k)}`; });
      G[6].opts.forEach(([v, , t]) => { if (st.extra.has(v)) p += '\n- ' + t; });
      $('pb-out').textContent = p;
      // 메시지
      const m = $('pb-msg');
      if (have.length <= 2) m.innerHTML = `빈칸이 많아요. 스케치 아래 <b>?</b> 표시(${miss.join('·')})는 <strong>AI가 마음대로 채울 부분</strong>입니다.`;
      else if (have.length < 6) m.innerHTML = `좋아요. 아직 빠진 요소: <strong>${miss.join(', ')}</strong>`;
      else if (st.extra.size < 3) m.innerHTML = '6요소 완성! <strong>추가</strong> 칸(글자 여백·글자 없음·브랜드 색)도 더해 보세요.';
      else m.innerHTML = '<strong>완성!</strong> 복사해서 Gemini에 붙여 넣고, 결과가 스케치와 얼마나 비슷한지 비교해 보세요.';
      // 스케치
      svg.innerHTML = '';
      const R = { '1:1': 1, '4:5': 0.8, '9:16': 0.5625, '16:9': 16 / 9 }[st.ratio] || 1;
      const M = 340, fw = R >= 1 ? M : M * R, fh = R >= 1 ? M / R : M;
      const fx = (400 - fw) / 2, fy = 8 + (M - fh) / 2;
      scene(svg, fx, fy, fw, fh, { subj: st.subj, bg: st.bg, angle: st.angle, light: st.light, style: st.style, pal: st.extra.has('brand') ? 'brand' : 'plain', space: st.extra.has('space') ? 'tr' : null });
      if (!st.ratio) el('rect', { x: fx, y: fy, width: fw, height: fh, rx: 10, fill: 'none', stroke: 'var(--muted)', 'stroke-width': 3, 'stroke-dasharray': '10 8' }, svg);
      if (st.extra.has('notext') === false && have.length >= 3) {
        // 글자 금지를 안 쓰면: AI가 엉뚱한 글자를 넣을 수도 있음
        el('text', { x: fx + 14, y: fy + fh - 52, style: 'font-size:15px;font-weight:800;fill:var(--bad);opacity:.8' }, svg).textContent = 'GRNAOLA?';
      }
      // 빠진 요소 표시
      const tags = main.map((g) => ({ n: g.n, ok: !!st[g.k], v: st[g.k] ? G.find((x) => x.k === g.k).opts.find((o) => o[0] === st[g.k])[1] : null }));
      let tx = fx + 8; const ty = fy + fh - 34;
      tags.forEach((t) => {
        if (t.ok) return;
        const label = t.n + '?';
        const tw = label.length * 14 + 16;
        el('rect', { x: tx, y: ty, width: tw, height: 26, rx: 13, fill: 'var(--surface)', stroke: 'var(--accent-2)', 'stroke-width': 2 }, svg);
        el('text', { x: tx + tw / 2, y: ty + 18, 'text-anchor': 'middle', style: 'font-size:14px;font-weight:800;fill:var(--accent-2)' }, svg).textContent = label;
        tx += tw + 6;
      });
      if (st.style) {
        const lbl = { photo: '사진', illust: '일러스트', water: '수채화' }[st.style];
        el('rect', { x: fx + fw - 86, y: fy + fh - 34, width: 78, height: 26, rx: 13, fill: 'var(--accent)' }, svg);
        el('text', { x: fx + fw - 47, y: fy + fh - 16, 'text-anchor': 'middle', style: 'font-size:14px;font-weight:800;fill:var(--surface)' }, svg).textContent = lbl;
      }
      if (st.ratio) {
        const rx0 = fx + fw - (st.style ? 150 : 72);
        el('rect', { x: rx0, y: fy + fh - 34, width: 58, height: 26, rx: 13, fill: 'var(--accent)' }, svg);
        el('text', { x: rx0 + 29, y: fy + fh - 16, 'text-anchor': 'middle', style: 'font-size:14px;font-weight:800;fill:var(--surface)' }, svg).textContent = st.ratio;
      }
    }
    render();
  })();

  /* ───────── 2) 브랜드 일관성 맞추기 ───────── */
  (function consist() {
    const box = $('cs-thumbs'); if (!box) return;
    const subj = ['granola', 'chips', 'nuts', 'gift'];
    const V = {
      pal: { fixed: 'brand', vary: ['brand', 'neon', 'dark', 'pastel'] },
      light: { fixed: 'morning', vary: ['morning', 'sunset', 'studio', 'sunset'] },
      angle: { fixed: '45', vary: ['45', 'top', 'close', 'top'] },
      space: { fixed: 'tr', vary: ['tr', null, 'bl', 'bl'] },
    };
    const on = { pal: false, light: false, angle: false, space: false };
    const svgs = subj.map(() => {
      const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 200 250'); s.setAttribute('aria-hidden', 'true');
      box.appendChild(s); return s;
    });
    const LINES = {
      pal: '- 색감: 바다 남색·모래 베이지 위주, 포인트는 산호색 조금',
      light: '- 조명: 왼쪽 위에서 드는 부드러운 아침 자연광',
      angle: '- 구도: 45도 각도, 제품이 화면의 주인공',
      space: '- 여백: 오른쪽 위에 글자 넣을 빈 공간',
    };
    const NAME = { pal: '색', light: '조명', angle: '구도', space: '여백' };
    function render() {
      svgs.forEach((s, i) => {
        s.innerHTML = '';
        const o = { subj: subj[i], bg: 'studio', style: 'photo' };
        for (const k in V) o[k] = on[k] ? V[k].fixed : V[k].vary[i];
        scene(s, 4, 4, 192, 240, o, { small: true });
      });
      const n = Object.values(on).filter(Boolean).length;
      const left = Object.keys(on).filter((k) => !on[k]).map((k) => NAME[k]);
      const st = $('cs-st');
      if (n === 0) { st.className = 'status bad'; st.innerHTML = '<b class="k">제각각</b>한 장씩은 괜찮아도, 나란히 놓으면 <strong>같은 회사 게시물로 보이지 않습니다.</strong>'; }
      else if (n < 4) { st.className = 'status mid'; st.innerHTML = `<b class="k">나아지는 중 (${n}/4)</b>아직 장마다 다른 것: <strong>${left.join(', ')}</strong>`; }
      else { st.className = 'status ok'; st.innerHTML = '<b class="k">한 가족처럼 (4/4)</b>제품은 달라도 <strong>한 브랜드</strong>로 보입니다. 아래 문구를 모든 프롬프트 끝에 붙이세요.'; }
      let t = '[바다결 스타일 고정 문구]';
      Object.keys(LINES).forEach((k) => { if (on[k]) t += '\n' + LINES[k]; });
      t += '\n- 이미지 안에 글자·로고 넣지 않기';
      $('cs-out').textContent = t;
    }
    document.querySelectorAll('#cs-tg .tgl').forEach((b) => b.addEventListener('click', () => { on[b.dataset.k] = toggle(b); render(); }));
    render();
  })();

  /* ───────── 3) 이 이미지 프롬프트 괜찮을까? ───────── */
  (function verdict() {
    const wrap = $('vcards'); if (!wrap) return;
    const items = [
      { q: '그래놀라 한 그릇, 원목 식탁, 위에서 내려다본 구도, 아침 자연광, 사실적 사진, 4:5 세로, 오른쪽 위 여백', k: 'ok', v: '좋음', a: '6요소가 모두 있고 글자 자리도 남겼다.' },
      { q: '요즘 제일 인기 있는 아이돌이 우리 그래놀라를 먹는 광고 사진', k: 'no', v: '만들지 않기', a: '실존 인물의 얼굴·인기를 광고에 무단으로 쓰는 것. 사람이 필요하면 손이나 뒷모습으로.' },
      { q: '그릇 위에 ‘NEW 출시! 30% 할인’ 글자를 크게 넣어 줘', k: 'fix', v: '고쳐서 쓰기', a: '글자가 깨지기 쉽다. 이미지엔 여백만 남기고 문구는 편집 앱에서 넣는다. 할인 내용도 사실인지 확인.' },
      { q: '유명 커피 체인 로고가 찍힌 컵 옆에 우리 현미칩', k: 'no', v: '만들지 않기', a: '다른 회사 로고·상표를 광고에 쓰면 상표권 문제. 로고 없는 머그컵으로 바꾼다.' },
      { q: '예쁜 그래놀라 사진', k: 'fix', v: '고쳐서 쓰기', a: '“예쁜”은 사람마다 다르다. 배경·구도·조명·스타일·비율을 구체적으로.' },
      { q: '실제보다 견과류가 두 배쯤 많아 보이게, 그릇이 넘치도록', k: 'fix', v: '주의 — 고쳐서 쓰기', a: '실제와 다르게 보이면 소비자가 오해할 수 있다(과장 광고). 실제 양에 가깝게, 필요하면 “연출 이미지” 표시.' },
      { q: '인기 애니메이션 캐릭터가 현미칩 봉지를 들고 웃는 그림', k: 'no', v: '만들지 않기', a: '남의 캐릭터는 저작권·상표권 보호 대상. 바다결만의 캐릭터를 새로 기획한다.' },
      { q: '수채화풍으로 부산 바다와 현미칩 봉지 일러스트, 9:16 세로, 아래쪽에 글자 여백, 글자 없음', k: 'ok', v: '좋음', a: '일반적인 화풍(수채화풍)은 괜찮다. 비율·여백·글자 금지까지 챙겼다.' },
    ];
    let opened = 0;
    items.forEach((it) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pcard';
      b.innerHTML = `<span class="pq">${it.q}</span><span class="verdict">${it.v}</span><span class="ans">${it.a}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open', it.k); opened++;
        $('vc-score').textContent = opened + ' / ' + items.length + ' 확인';
      });
      wrap.appendChild(b);
    });
  })();
})();
