// 12주 1차시 전용: 정답 지우기, k-평균 단계 애니메이션, 엘보 그래프, 단위와 거리, 무리 이름 붙이기
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const $ = (id) => document.getElementById(id);
  const KC = ['var(--k1)', 'var(--k2)', 'var(--k3)', 'var(--k4)', 'var(--k5)', 'var(--k6)'];

  /* ───────── 실제 데이터: process.csv 의 [온도, 두께, 불량(0/1), 불량유형(0 정상·1 치수불량·2 찍힘·3 스크래치)] 494행 ───────── */
  const PTS = [[211.7,1.98,0,0],[208.4,1.994,0,0],[210.2,1.967,0,0],[214.5,1.914,0,0],[219.5,2.048,0,0],[216.1,2.101,0,0],[225.3,2.113,0,0],[206.9,2.09,0,0],[206.0,2.091,0,0],[214.2,1.959,1,2],[207.4,1.95,0,0],[214.6,1.94,0,0],[199.4,1.973,1,2],[204.7,1.975,0,0],[215.6,1.84,0,0],[211.8,2.066,0,0],[207.2,2.015,0,0],[204.6,1.897,1,1],[224.5,1.901,1,1],[205.4,1.998,0,0],[209.3,1.968,0,0],[217.3,2.186,0,0],[215.2,2.04,0,0],[197.5,2.135,0,0],[217.5,2.053,0,0],[211.6,2.008,0,0],[211.9,2.026,0,0],[216.2,2.018,0,0],[216.5,2.06,0,0],[207.2,1.957,0,0],[210.7,1.987,0,0],[204.1,2.107,0,0],[219.7,2.178,0,0],[204.1,1.907,0,0],[211.2,1.919,0,0],[215.7,1.872,0,0],[205.2,2.002,0,0],[213.3,2.067,0,0],[223.3,2.165,0,0],[201.5,1.935,0,0],[219.3,2.056,0,0],[205.7,2.117,0,0],[204.6,1.994,0,0],[205.6,1.947,0,0],[209.7,1.961,0,0],[215.2,1.969,0,0],[194.7,2.03,0,0],[217.8,1.925,1,1],[218.3,2.017,0,0],[204.9,1.958,0,0],[207.6,2.129,0,0],[216.1,1.929,1,1],[213.6,2.039,0,0],[198.5,1.98,0,0],[203.4,2.045,0,0],[221.8,1.993,1,3],[208.7,2.053,0,0],[218.9,2.007,0,0],[222.3,2.083,0,0],[203.1,2.033,0,0],[213.2,2.008,0,0],[205.1,1.954,0,0],[225.5,1.988,1,3],[195.8,2.01,0,0],[205.3,2.041,0,0],[219.0,2.104,0,0],[213.5,2.03,0,0],[214.5,1.923,0,0],[216.4,2.065,0,0],[213.7,1.923,0,0],[208.4,2.015,0,0],[208.7,2.062,0,0],[202.4,1.995,0,0],[205.9,2.059,0,0],[211.6,1.956,0,0],[207.5,2.034,1,2],[216.2,2.074,0,0],[210.1,1.98,0,0],[217.6,1.946,0,0],[197.7,2.078,0,0],[203.4,2.097,0,0],[198.4,2.143,0,0],[200.7,1.971,0,0],[200.1,2.033,0,0],[206.1,2.07,0,0],[211.0,2.07,0,0],[210.1,1.964,0,0],[199.8,2.013,0,0],[205.8,2.038,0,0],[219.9,2.058,1,3],[201.0,1.829,0,0],[219.1,2.018,0,0],[219.9,2.021,0,0],[208.2,1.988,0,0],[211.9,1.968,0,0],[221.0,2.08,0,0],[213.4,1.913,1,1],[205.0,1.984,0,0],[210.4,1.954,0,0],[220.0,2.047,0,0],[211.6,1.944,0,0],[202.5,1.963,0,0],[202.8,2.031,0,0],[208.3,2.099,0,0],[202.5,2.021,0,0],[219.0,1.991,0,0],[218.6,2.081,1,2],[209.3,1.989,0,0],[207.5,2.084,0,0],[206.4,2.008,0,0],[199.5,1.996,0,0],[198.7,1.98,0,0],[204.3,1.987,0,0],[224.6,2.026,1,2],[223.0,1.952,0,0],[216.2,2.014,0,0],[212.6,1.906,0,0],[210.6,2.044,0,0],[220.9,1.864,0,0],[217.8,2.076,0,0],[208.2,2.096,0,0],[214.9,1.967,0,0],[218.2,1.984,0,0],[216.7,2.035,1,2],[207.4,1.98,0,0],[207.0,1.98,0,0],[208.1,1.971,0,0],[206.1,1.997,0,0],[217.7,2.007,0,0],[223.0,2.041,0,0],[208.1,1.998,0,0],[209.0,1.873,0,0],[228.1,1.974,1,3],[216.4,1.994,0,0],[215.9,1.992,0,0],[205.3,1.883,0,0],[208.2,1.974,0,0],[216.8,1.932,1,1],[216.6,2.076,0,0],[214.3,2.069,0,0],[219.8,2.012,0,0],[212.1,1.918,0,0],[211.0,2.014,0,0],[210.8,1.998,0,0],[215.0,2.053,0,0],[204.0,1.949,0,0],[213.4,1.94,0,0],[216.3,1.995,0,0],[222.2,1.945,0,0],[193.2,2.05,0,0],[214.1,2.047,0,0],[201.9,1.912,0,0],[216.5,1.949,0,0],[211.4,2.031,0,0],[218.6,1.952,1,3],[208.9,2.025,1,3],[215.1,2.028,1,2],[213.9,1.95,0,0],[214.6,1.997,0,0],[202.4,2.014,0,0],[221.2,1.988,0,0],[215.1,2.069,1,2],[207.9,2.084,0,0],[207.9,2.1,0,0],[218.6,1.986,0,0],[204.0,2.033,0,0],[210.6,2.003,0,0],[210.8,2.033,0,0],[211.6,2.044,0,0],[235.3,1.94,1,1],[207.0,1.909,0,0],[210.3,1.922,0,0],[216.4,1.962,0,0],[213.7,2.013,0,0],[210.3,1.876,1,1],[211.1,2.035,0,0],[213.5,1.896,0,0],[204.9,2.093,0,0],[205.0,2.048,0,0],[212.8,2.0,0,0],[207.9,2.027,0,0],[207.8,1.907,0,0],[209.7,1.862,1,1],[209.3,2.098,0,0],[204.1,2.028,0,0],[210.8,2.01,0,0],[204.9,1.889,0,0],[202.6,1.887,0,0],[216.7,1.96,0,0],[218.9,2.142,0,0],[216.2,1.975,1,2],[217.0,1.969,0,0],[217.4,2.072,0,0],[202.7,2.07,0,0],[217.8,2.064,1,2],[216.9,2.032,0,0],[224.1,1.943,1,1],[215.1,2.082,0,0],[203.0,1.972,0,0],[198.2,1.989,0,0],[212.3,1.935,0,0],[208.3,2.06,0,0],[209.0,2.006,0,0],[209.5,1.892,0,0],[213.0,2.025,0,0],[210.9,2.032,0,0],[223.7,1.97,1,2],[219.1,1.906,0,0],[202.0,2.058,0,0],[211.2,2.008,0,0],[214.0,2.107,0,0],[233.5,1.97,1,2],[206.2,1.982,0,0],[204.5,1.938,0,0],[217.1,1.881,0,0],[208.1,2.054,0,0],[214.2,2.043,0,0],[204.8,2.043,0,0],[218.7,1.926,1,1],[207.8,2.017,0,0],[212.8,1.957,0,0],[222.0,2.023,0,0],[219.4,1.999,0,0],[202.2,1.96,0,0],[217.1,1.989,0,0],[199.8,2.043,0,0],[213.2,1.975,0,0],[204.3,1.886,0,0],[213.9,1.937,1,1],[208.2,2.091,0,0],[197.7,2.005,0,0],[213.1,2.131,0,0],[211.8,1.988,0,0],[228.2,2.106,0,0],[209.6,1.978,0,0],[206.1,1.935,0,0],[214.9,2.044,0,0],[195.5,2.058,0,0],[199.4,2.035,0,0],[208.2,1.996,0,0],[210.0,1.968,0,0],[215.5,2.043,0,0],[205.6,1.894,0,0],[208.4,1.995,0,0],[209.7,2.029,0,0],[217.4,1.976,0,0],[206.9,1.908,0,0],[222.5,1.999,0,0],[208.5,1.941,0,0],[218.1,1.983,0,0],[201.9,2.049,0,0],[213.2,2.086,0,0],[212.7,1.988,0,0],[215.3,1.968,0,0],[220.0,1.956,0,0],[211.6,1.858,0,0],[211.9,1.924,1,1],[200.9,2.047,0,0],[218.2,2.021,0,0],[206.1,1.913,0,0],[219.9,1.981,1,2],[215.8,2.038,0,0],[208.9,2.067,0,0],[220.1,2.029,0,0],[203.3,1.952,0,0],[212.5,1.856,1,1],[216.9,2.008,0,0],[206.5,1.979,0,0],[200.7,2.063,0,0],[203.9,2.024,0,0],[214.5,2.127,0,0],[214.1,1.935,1,1],[218.9,1.994,0,0],[219.4,1.993,0,0],[211.6,1.962,0,0],[209.0,1.951,0,0],[227.6,1.993,1,2],[217.7,1.977,0,0],[200.9,1.942,1,1],[220.6,2.004,0,0],[211.4,2.003,0,0],[212.2,2.027,0,0],[204.1,1.959,0,0],[194.5,2.058,0,0],[211.1,1.98,0,0],[206.5,1.965,0,0],[212.6,2.001,0,0],[213.6,1.95,0,0],[203.9,2.067,0,0],[216.5,1.925,0,0],[200.7,2.124,0,0],[213.1,1.94,0,0],[209.3,2.197,0,0],[212.8,1.8,0,0],[231.0,1.98,1,2],[208.7,2.015,0,0],[223.1,2.015,0,0],[220.6,1.999,0,0],[216.9,1.911,1,1],[214.5,2.104,0,0],[212.0,1.993,0,0],[203.9,1.978,0,0],[209.6,1.986,0,0],[217.3,2.027,0,0],[204.4,1.889,0,0],[211.5,2.008,0,0],[212.4,2.057,0,0],[214.8,1.956,0,0],[220.6,2.043,0,0],[200.1,2.046,0,0],[221.6,2.027,0,0],[219.5,1.95,0,0],[211.7,2.1,0,0],[218.1,1.846,1,1],[211.2,2.04,0,0],[219.0,2.068,0,0],[207.7,1.908,0,0],[207.3,1.966,0,0],[216.0,1.931,0,0],[222.3,1.951,1,3],[211.0,2.051,0,0],[198.1,1.947,0,0],[206.4,1.976,0,0],[213.4,2.033,0,0],[207.1,1.953,1,2],[223.1,1.969,0,0],[202.9,2.015,0,0],[209.2,2.0,1,2],[215.1,1.865,0,0],[222.9,1.946,1,1],[205.2,2.008,0,0],[208.7,1.97,0,0],[206.1,1.863,0,0],[204.3,2.03,0,0],[201.1,1.953,0,0],[212.9,1.987,0,0],[212.8,1.911,0,0],[218.9,1.946,0,0],[205.1,1.903,0,0],[218.5,2.031,0,0],[215.5,1.978,0,0],[203.8,2.035,0,0],[210.4,2.096,0,0],[223.6,1.904,1,1],[216.7,2.01,0,0],[197.6,2.043,0,0],[209.0,2.021,0,0],[218.3,2.014,0,0],[202.6,2.013,0,0],[213.1,1.958,0,0],[206.4,1.998,0,0],[206.9,2.092,0,0],[226.2,2.1,0,0],[212.6,1.987,0,0],[203.7,1.899,0,0],[209.6,2.043,0,0],[217.3,2.024,1,2],[206.7,1.984,0,0],[207.0,1.966,1,2],[201.0,1.99,0,0],[213.6,1.918,0,0],[209.3,1.963,0,0],[223.2,1.937,1,1],[218.2,1.984,0,0],[218.6,2.006,0,0],[206.6,1.867,0,0],[204.2,2.095,0,0],[200.1,1.93,0,0],[214.7,2.111,0,0],[209.3,2.076,0,0],[201.5,2.015,0,0],[210.1,2.015,0,0],[231.1,2.047,1,2],[218.0,2.001,1,2],[203.6,2.059,0,0],[219.2,2.014,1,3],[202.2,2.079,0,0],[193.8,2.103,0,0],[196.0,1.909,0,0],[203.3,1.897,0,0],[218.3,2.073,0,0],[219.8,2.008,0,0],[210.5,1.982,0,0],[211.4,2.038,0,0],[217.8,1.913,0,0],[212.9,2.049,0,0],[229.9,2.012,1,3],[215.6,2.101,0,0],[214.2,1.919,1,1],[217.4,2.032,0,0],[195.1,1.956,0,0],[217.0,2.094,0,0],[203.1,2.003,0,0],[221.2,1.89,0,0],[215.4,1.953,0,0],[215.5,1.921,0,0],[212.0,2.013,0,0],[200.6,1.95,1,3],[193.1,2.033,0,0],[209.6,2.001,0,0],[215.0,1.922,0,0],[205.3,1.929,0,0],[213.9,1.962,0,0],[206.8,1.994,0,0],[227.4,2.039,0,0],[214.2,1.987,1,2],[218.5,1.846,1,1],[201.5,1.956,0,0],[212.6,2.085,0,0],[212.8,1.973,0,0],[213.4,2.045,0,0],[210.8,1.968,0,0],[216.7,1.945,0,0],[215.3,2.015,0,0],[207.2,2.098,0,0],[209.0,1.827,1,1],[211.8,2.021,0,0],[213.5,1.966,0,0],[197.6,2.01,0,0],[220.4,1.961,1,3],[217.6,2.004,0,0],[192.3,2.058,0,0],[220.0,1.967,0,0],[212.7,1.923,1,1],[211.8,1.931,1,1],[205.7,1.946,0,0],[203.0,1.9,0,0],[213.1,2.046,0,0],[219.7,1.923,1,1],[204.7,1.995,0,0],[213.6,1.995,0,0],[211.6,2.04,0,0],[223.9,2.024,1,3],[221.0,2.062,0,0],[221.3,1.943,0,0],[217.4,2.078,0,0],[208.7,1.98,0,0],[209.2,2.139,0,0],[204.9,2.02,0,0],[218.2,2.026,0,0],[208.3,2.005,0,0],[231.8,2.074,0,0],[214.3,1.991,0,0],[215.6,1.985,0,0],[211.3,1.989,0,0],[219.4,2.083,1,3],[208.4,2.002,0,0],[224.1,2.001,1,3],[214.3,1.946,0,0],[204.7,2.081,0,0],[214.5,2.035,0,0],[191.9,1.94,0,0],[204.9,1.953,0,0],[207.4,2.03,0,0],[202.4,2.09,0,0],[214.7,1.953,0,0],[206.8,1.941,0,0],[213.4,2.043,0,0],[210.9,2.069,0,0],[207.9,1.949,0,0],[219.0,2.033,0,0],[204.3,1.916,0,0],[214.9,2.021,0,0],[222.4,2.018,0,0],[208.1,2.049,0,0],[203.0,2.031,0,0],[211.5,2.114,0,0],[210.2,1.979,0,0],[214.4,2.067,0,0],[215.4,1.954,1,2],[219.1,1.996,1,3],[209.1,1.936,1,1],[228.8,1.947,1,1],[203.6,2.029,0,0],[222.0,2.084,0,0],[224.1,1.892,0,0],[212.2,2.0,0,0],[203.2,1.97,0,0],[214.3,2.054,0,0],[197.4,1.937,0,0],[207.3,2.09,0,0],[218.7,2.035,0,0],[211.2,1.906,0,0],[217.4,2.124,0,0],[199.6,1.97,0,0],[199.1,1.988,0,0],[219.4,2.109,0,0],[207.1,2.013,0,0],[205.5,1.798,1,1],[215.8,2.022,0,0],[204.1,1.953,0,0],[204.4,2.078,0,0],[209.9,2.007,0,0],[206.4,2.045,0,0]];
  const N = PTS.length;
  // 표준화(StandardScaler와 같은 방식: 모집단 표준편차)
  const mean = [0, 0], sd = [0, 0];
  PTS.forEach((p) => { mean[0] += p[0] / N; mean[1] += p[1] / N; });
  PTS.forEach((p) => { sd[0] += (p[0] - mean[0]) ** 2 / N; sd[1] += (p[1] - mean[1]) ** 2 / N; });
  sd[0] = Math.sqrt(sd[0]); sd[1] = Math.sqrt(sd[1]);

  /* ───────── 산점도 공통 (가로: 온도, 세로: 두께) ───────── */
  const X0 = 190, X1 = 238, Y0 = 1.78, Y1 = 2.22;
  const L = 66, R = 620, T = 16, B = 360;
  const sx = (t) => L + (t - X0) / (X1 - X0) * (R - L);
  const sy = (h) => B - (h - Y0) / (Y1 - Y0) * (B - T);
  function axes(svg) {
    svg.innerHTML = '';
    for (let t = 195; t <= 235; t += 10) {
      el('line', { x1: sx(t), x2: sx(t), y1: T, y2: B, class: 'p-grid' }, svg);
      el('text', { x: sx(t), y: B + 20, 'text-anchor': 'middle', class: 'p-tick' }, svg).textContent = t;
    }
    for (let h = 1.8; h <= 2.21; h += 0.1) {
      el('line', { x1: L, x2: R, y1: sy(h), y2: sy(h), class: 'p-grid' }, svg);
      el('text', { x: L - 10, y: sy(h) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = h.toFixed(1);
    }
    el('line', { x1: L, x2: R, y1: B, y2: B, class: 'p-axis' }, svg);
    el('line', { x1: L, x2: L, y1: T, y2: B, class: 'p-axis' }, svg);
    el('text', { x: (L + R) / 2, y: B + 46, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = '온도 (℃) →';
    el('text', { x: 16, y: (T + B) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 16 ${(T + B) / 2})` }, svg).textContent = '두께 (mm) →';
  }

  /* ───────── 1) 도입: 정답 지우기 ───────── */
  (function intro() {
    const svg = $('intro'); if (!svg) return;
    axes(svg);
    const g = el('g', {}, svg);
    const dots = PTS.map((p) => el('circle', { cx: sx(p[0]).toFixed(1), cy: sy(p[1]).toFixed(1), r: 4.5, style: 'transition:fill .4s' }, g));
    const sup = $('in-sup'), uns = $('in-uns');
    const nBad = PTS.filter((p) => p[2]).length;
    function set(mode) {
      sup.setAttribute('aria-pressed', mode === 'sup'); uns.setAttribute('aria-pressed', mode === 'uns');
      dots.forEach((d, i) => {
        d.setAttribute('fill', mode === 'sup' ? (PTS[i][2] ? 'var(--accent-2)' : 'var(--accent)') : 'var(--muted)');
        d.setAttribute('fill-opacity', mode === 'sup' ? (PTS[i][2] ? 0.95 : 0.55) : 0.55);
      });
      if (mode === 'sup') {
        $('in-leg').innerHTML = `<span><i class="dot" style="background:var(--accent)"></i>양품 ${N - nBad}개</span><span><i class="dot" style="background:var(--accent-2)"></i>불량 ${nBad}개</span>`;
        $('in-h').textContent = '정답(불량 여부)이 있는 데이터';
        $('in-d').innerHTML = '점마다 <strong>양품/불량 표시</strong>가 붙어 있습니다. 모델은 이 정답을 보고 <strong>판정 규칙</strong>을 배웠습니다. (지도 학습)';
        $('in-msg').innerHTML = '오른쪽 버튼을 눌러 <strong>정답 표시를 지워 보세요.</strong>';
      } else {
        $('in-leg').innerHTML = `<span><i class="dot" style="background:var(--muted)"></i>제품 ${N}개 · 정답 없음</span>`;
        $('in-h').textContent = '정답이 없는 데이터';
        $('in-d').innerHTML = '측정값만 남았습니다. 이제 할 수 있는 일은 <strong>비슷한 점끼리 묶어</strong> 어떤 무리가 있는지 보는 것뿐. (비지도 학습)';
        $('in-msg').innerHTML = '현장에서는 이런 경우가 더 많습니다. 불량 판정·고장 기록은 <strong>모으기 어렵고 비싸기</strong> 때문입니다.';
      }
    }
    sup.addEventListener('click', () => set('sup'));
    uns.addEventListener('click', () => set('uns'));
    set('sup');
  })();

  /* ───────── 2) k-평균 한 단계씩 ───────── */
  // 시작 중심(데이터 점 번호): 파이썬에서 여러 시작점을 시험해, 가장 촘촘한 결과로 수렴하고 움직임이 잘 보이는 것을 고정해 둠
  const INIT = { scaled2: [91, 209], scaled3: [147, 194, 414], scaled4: [177, 51, 41, 453], scaled5: [274, 388, 454, 75, 163], scaled6: [177, 312, 403, 429, 89, 16],
    raw2: [275, 451], raw3: [475, 479, 353], raw4: [455, 459, 266, 328], raw5: [409, 349, 357, 324, 443], raw6: [388, 390, 235, 297, 286, 170] };
  const space = (scaled) => PTS.map((p) => scaled ? [(p[0] - mean[0]) / sd[0], (p[1] - mean[1]) / sd[1]] : [p[0], p[1]]);
  function kmeansRun(k, scaled, maxIt) {    // 끝까지 돌린 결과 (검증·요약용)
    const Z = space(scaled);
    let C = INIT[(scaled ? 'scaled' : 'raw') + k].map((i) => Z[i].slice());
    let lab = null, it = 0;
    while (it < (maxIt || 200)) {
      const nl = Z.map((z) => nearest(z, C));
      if (lab && nl.every((v, i) => v === lab[i])) break;
      lab = nl; C = centers(Z, lab, C); it++;
    }
    return { lab, C, it };
  }
  function nearest(z, C) {
    let b = 0, bd = Infinity;
    C.forEach((c, j) => { const d = (z[0] - c[0]) ** 2 + (z[1] - c[1]) ** 2; if (d < bd) { bd = d; b = j; } });
    return b;
  }
  function centers(Z, lab, C) {
    return C.map((c, j) => {
      let s0 = 0, s1 = 0, n = 0;
      Z.forEach((z, i) => { if (lab[i] === j) { s0 += z[0]; s1 += z[1]; n++; } });
      return n ? [s0 / n, s1 / n] : c.slice();
    });
  }
  window.__w12km = kmeansRun;   // 점검용

  (function kmDemo() {
    const svg = $('km'); if (!svg) return;
    axes(svg);
    const gp = el('g', {}, svg), gt = el('g', {}, svg), gc = el('g', {}, svg);
    const dots = PTS.map((p) => el('circle', { cx: sx(p[0]).toFixed(1), cy: sy(p[1]).toFixed(1), r: 4.2, style: 'transition:fill .35s' }, gp));
    const kS = $('km-k'), scB = $('km-sc');
    let k, scaled, Z, C, lab, phase, it, hist, done, timer = null;
    const toRaw = (c) => scaled ? [c[0] * sd[0] + mean[0], c[1] * sd[1] + mean[1]] : c;
    function draw() {
      dots.forEach((d, i) => {
        d.setAttribute('fill', lab ? KC[lab[i]] : 'var(--muted)');
        d.setAttribute('fill-opacity', lab ? 0.7 : 0.45);
      });
      gt.innerHTML = ''; gc.innerHTML = '';
      hist.forEach((h, j) => {
        if (h.length > 1) el('polyline', { points: h.map((c) => { const r = toRaw(c); return sx(r[0]).toFixed(1) + ',' + sy(r[1]).toFixed(1); }).join(' '), fill: 'none', stroke: KC[j], 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }, gt);
      });
      C.forEach((c, j) => {
        const r = toRaw(c), x = sx(r[0]), y = sy(r[1]);
        el('circle', { cx: x, cy: y, r: 15, fill: 'var(--surface)', stroke: KC[j], 'stroke-width': 3 }, gc);
        el('path', { d: `M${x - 7},${y - 7} L${x + 7},${y + 7} M${x + 7},${y - 7} L${x - 7},${y + 7}`, stroke: KC[j], 'stroke-width': 4, 'stroke-linecap': 'round' }, gc);
      });
      $('km-it').textContent = it + '회';
      $('km-ph').textContent = done ? '완료' : phase === 'assign' ? '배정' : '중심 이동';
      // 무리 요약
      if (lab) {
        $('km-list').innerHTML = C.map((c, j) => {
          let n = 0, st = 0, sh = 0;
          PTS.forEach((p, i) => { if (lab[i] === j) { n++; st += p[0]; sh += p[1]; } });
          return `<div><i style="background:${KC[j]}"></i>${n}개 · 평균 ${(st / n).toFixed(1)}℃ · ${(sh / n).toFixed(3)}mm</div>`;
        }).join('');
      } else $('km-list').innerHTML = '';
    }
    function reset() {
      clearInterval(timer); timer = null;
      k = +kS.value; scaled = scB.getAttribute('aria-pressed') === 'true';
      $('km-k-o').textContent = k;
      Z = space(scaled);
      C = INIT[(scaled ? 'scaled' : 'raw') + k].map((i) => Z[i].slice());
      lab = null; phase = 'assign'; it = 0; done = false; hist = C.map((c) => [c.slice()]);
      $('km-step').disabled = false; $('km-auto').disabled = false;
      $('km-msg').innerHTML = `중심 ${k}개를 데이터 점 중에서 <strong>아무렇게나</strong> 골라 놓았습니다. <strong>한 단계</strong>를 눌러 보세요.`;
      draw();
    }
    function step() {
      if (done) return;
      if (phase === 'assign') {
        const nl = Z.map((z) => nearest(z, C));
        const changed = lab ? nl.filter((v, i) => v !== lab[i]).length : N;
        lab = nl; phase = 'move';
        if (it > 0 && changed === 0) {
          done = true;
          $('km-step').disabled = true; $('km-auto').disabled = true;
          $('km-msg').innerHTML = (scaled
            ? `<strong>${it}번 반복 후 멈춤.</strong> 배정이 더 이상 바뀌지 않습니다. 온도와 두께가 <strong>함께</strong> 무리를 가릅니다.`
            : `<strong>${it}번 반복 후 멈춤.</strong> 그런데 무리가 <strong>세로 띠</strong>로만 나뉘었습니다. 온도 차(수 ℃)에 비해 두께 차(0.0x mm)는 숫자가 작아 <strong>무시</strong>됐습니다.`);
        } else {
          $('km-msg').innerHTML = `<strong>배정:</strong> 모든 점을 가장 가까운 중심의 색으로 칠했습니다.` + (it > 0 ? ` 이번에 무리를 옮긴 점 <strong>${changed}개</strong>.` : '');
        }
      } else {
        const nc = centers(Z, lab, C);
        let mv = 0;
        nc.forEach((c, j) => { const a = toRaw(c), b = toRaw(C[j]); mv = Math.max(mv, Math.abs(a[0] - b[0])); });
        C = nc; C.forEach((c, j) => hist[j].push(c.slice()));
        it++; phase = 'assign';
        $('km-msg').innerHTML = `<strong>이동:</strong> 중심을 자기 무리의 평균 위치로 옮겼습니다 (점선이 지나온 길). 가장 많이 움직인 중심은 온도 방향으로 <strong>${mv.toFixed(1)}℃</strong>.`;
      }
      draw();
    }
    $('km-step').addEventListener('click', () => { if (!timer) step(); });
    $('km-auto').addEventListener('click', () => {
      if (timer || done) return;
      $('km-auto').disabled = true;
      timer = setInterval(() => { step(); if (done) { clearInterval(timer); timer = null; } }, 420);
    });
    $('km-reset').addEventListener('click', reset);
    kS.addEventListener('input', reset);
    scB.addEventListener('click', () => { scB.setAttribute('aria-pressed', scB.getAttribute('aria-pressed') !== 'true'); reset(); });
    document.addEventListener('slideenter', (e) => { if (!e.detail.slide.contains(svg) && timer) { clearInterval(timer); timer = null; $('km-auto').disabled = done; } });
    reset();
  })();

  /* ───────── 3) 엘보 그래프 (파이썬 KMeans 실제 계산값, 표준화한 온도·두께) ───────── */
  (function elbow() {
    const svg = $('elbow'); if (!svg) return;
    const V = [988.0, 666.4, 444.4, 354.1, 292.1, 239.5, 211.0, 185.6];
    const l = 70, r = 610, t = 24, b = 350;
    const ex = (k) => l + (k - 1) / 7 * (r - l), ey = (v) => b - v / 1000 * (b - t);
    for (let v = 0; v <= 1000; v += 250) {
      el('line', { x1: l, x2: r, y1: ey(v), y2: ey(v), class: 'p-grid' }, svg);
      el('text', { x: l - 10, y: ey(v) + 4, 'text-anchor': 'end', class: 'p-tick' }, svg).textContent = v;
    }
    for (let k = 1; k <= 8; k++) el('text', { x: ex(k), y: b + 22, 'text-anchor': 'middle', class: 'p-tick', style: 'font-size:15px' }, svg).textContent = k;
    el('line', { x1: l, x2: r, y1: b, y2: b, class: 'p-axis' }, svg);
    el('text', { x: (l + r) / 2, y: b + 50, 'text-anchor': 'middle', class: 'p-lab' }, svg).textContent = '무리 개수 k →';
    el('text', { x: 18, y: (t + b) / 2, 'text-anchor': 'middle', class: 'p-lab', transform: `rotate(-90 18 ${(t + b) / 2})` }, svg).textContent = '무리 안 흩어짐 →';
    const elbowMark = el('g', { opacity: 0, style: 'transition:opacity .3s' }, svg);
    el('ellipse', { cx: ex(3), cy: ey(V[2]), rx: 34, ry: 26, fill: 'none', stroke: 'var(--accent-2)', 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, elbowMark);
    el('text', { x: ex(3) + 40, y: ey(V[2]) - 26, class: 'p-tick', style: 'fill:var(--accent-2);font-weight:800;font-size:15px' }, elbowMark).textContent = '팔꿈치? (꺾이는 곳)';
    const line = el('polyline', { fill: 'none', stroke: 'var(--accent)', 'stroke-width': 3 }, svg);
    const dots = V.map((v, i) => el('circle', { cx: ex(i + 1), cy: ey(v), r: 7, fill: 'var(--surface)', stroke: 'var(--accent)', 'stroke-width': 3 }, svg));
    const lab = el('text', { 'text-anchor': 'middle', class: 'p-tick', style: 'font-weight:800;font-size:16px;fill:var(--text)' }, svg);
    const s = $('eb-k');
    function update() {
      const k = +s.value;
      $('eb-k-o').textContent = k;
      line.setAttribute('points', V.slice(0, k).map((v, i) => ex(i + 1) + ',' + ey(v)).join(' '));
      dots.forEach((d, i) => { d.style.display = i < k ? '' : 'none'; d.setAttribute('fill', i === k - 1 ? 'var(--accent)' : 'var(--surface)'); });
      lab.setAttribute('x', ex(k)); lab.setAttribute('y', ey(V[k - 1]) - 16); lab.textContent = Math.round(V[k - 1]);
      $('eb-v').textContent = Math.round(V[k - 1]);
      const drop = k > 1 ? (1 - V[k - 1] / V[k - 2]) * 100 : null;
      $('eb-d').textContent = drop === null ? '-' : '−' + drop.toFixed(0) + '%';
      elbowMark.setAttribute('opacity', k >= 4 ? 1 : 0);
      $('eb-msg').innerHTML = k === 1 ? 'k = 1이면 전체가 한 무리 — 흩어짐이 가장 큽니다. k를 하나씩 늘려 보세요.'
        : k <= 3 ? `무리를 하나 더 만들 때마다 흩어짐이 <strong>${drop.toFixed(0)}%</strong>씩 크게 줄어듭니다.`
        : k === 4 ? `k = 3 → 4에서는 <strong>${drop.toFixed(0)}%</strong>만 줄었습니다. 줄어드는 폭이 작아지기 시작하는 곳 — <strong>팔꿈치</strong> 후보는 3 근처.`
        : k < 8 ? `계속 줄긴 하지만 <strong>${drop.toFixed(0)}%</strong>씩. k를 무작정 늘리면 흩어짐은 결국 0(점 하나가 한 무리)이 됩니다 — 의미 없는 묶음.`
        : '그래프가 꺾이는 정도가 <strong>뚜렷하지 않습니다.</strong> 이럴 때 k는 숫자만으로 정하지 않습니다 → 다음 장.';
    }
    s.addEventListener('input', update);
    update();
  })();

  /* ───────── 4) 단위가 다르면? A·B·C 거리 ───────── */
  (function scaleDemo() {
    const wrap = $('sc-cards'); if (!wrap) return;
    const P = { A: PTS[280], B: PTS[265], C: PTS[128] };   // P00281, P00266, P00129
    const info = { A: ['P00281', '기준 제품'], B: ['P00266', ''], C: ['P00129', ''] };
    const typ = ['정상', '치수불량', '찍힘', '스크래치'];
    const cards = {};
    ['A', 'B', 'C'].forEach((k) => {
      const p = P[k], d = document.createElement('div');
      d.className = 'prod';
      const dt = p[0] - P.A[0], dh = p[1] - P.A[1];
      d.innerHTML = `<div class="nm">제품 ${k} <span class="muted" style="font-size:15px;font-weight:600">${info[k][0]}${info[k][1] ? ' · ' + info[k][1] : ''}</span></div>` +
        `<div class="v">온도 <b>${p[0].toFixed(1)}℃</b>${k === 'A' ? '' : ` <span class="muted">(${dt >= 0 ? '+' : ''}${dt.toFixed(1)})</span>`}</div>` +
        `<div class="v">두께 <b>${p[1].toFixed(3)}mm</b>${k === 'A' ? '' : ` <span class="muted">(${dh >= 0 ? '+' : ''}${dh.toFixed(3)})</span>`}</div>` +
        `<div class="muted" style="font-size:15px">기록: ${typ[p[3]]}</div>`;
      wrap.appendChild(d); cards[k] = d;
    });
    const dist = (a, b, std) => {
      const u = std ? (a[0] - b[0]) / sd[0] : a[0] - b[0], v = std ? (a[1] - b[1]) / sd[1] : a[1] - b[1];
      return { d: Math.hypot(u, v), u, v };
    };
    const bR = $('sc-raw'), bS = $('sc-std');
    function set(std) {
      bR.setAttribute('aria-pressed', !std); bS.setAttribute('aria-pressed', std);
      const db = dist(P.A, P.B, std), dc = dist(P.A, P.C, std);
      const mx = Math.max(db.d, dc.d);
      $('sc-b').textContent = db.d.toFixed(2); $('sc-c').textContent = dc.d.toFixed(2);
      $('sc-bb').style.width = (db.d / mx * 100) + '%'; $('sc-bc').style.width = (dc.d / mx * 100) + '%';
      const nearB = db.d < dc.d;
      $('sc-bb').style.background = nearB ? 'var(--accent-2)' : 'var(--accent)';
      $('sc-bc').style.background = nearB ? 'var(--accent)' : 'var(--accent-2)';
      cards.B.classList.toggle('near', nearB); cards.C.classList.toggle('near', !nearB);
      const f = (x) => Math.abs(x).toFixed(std ? 2 : 3);
      $('sc-calc').innerHTML = `A↔B = √(온도 차 ${f(db.u)}² + 두께 차 ${f(db.v)}²)<br>A↔C = √(온도 차 ${f(dc.u)}² + 두께 차 ${f(dc.v)}²)`;
      $('sc-msg').innerHTML = std
        ? `<strong>C가 더 가깝다.</strong> 표준화하면 B의 두께 차이(표준편차 ${Math.abs(db.v).toFixed(1)}개분)가 제대로 보입니다. 실제로 B는 <strong>치수불량</strong>으로 기록된 제품 — 엔지니어 눈에도 B가 “다른” 제품입니다.`
        : `<strong>B가 더 가깝다?</strong> 원래 단위로 재면 두께 차이 ${Math.abs(db.v).toFixed(3)}mm는 숫자가 작아 거의 0. 거리가 <strong>온도 차이로만</strong> 정해집니다.`;
    }
    bR.addEventListener('click', () => set(false));
    bS.addEventListener('click', () => set(true));
    set(false);
  })();

  /* ───────── 5) 무리 이름 붙이기 (표준화 + KMeans k=3 실제 결과) ───────── */
  (function clusterCards() {
    const wrap = $('ccards'); if (!wrap) return;
    const C = [
      { c: 'var(--k1)', n: 161, t: 204.6, h: 2.031, d: 3.1, dim: 0.0, nm: '저온·표준 두께', a: '불량이 거의 없는 <b>안정 조건</b>. 기준으로 삼을 만한 운전 패턴.' },
      { c: 'var(--k2)', n: 174, t: 218.1, h: 2.031, d: 19.0, dim: 2.9, nm: '고온 조건', a: '두께는 정상인데 불량이 많다 → 찍힘·스크래치 쪽. <b>냉각·온도 관리</b> 점검 후보.' },
      { c: 'var(--k3)', n: 159, t: 211.1, h: 1.930, d: 18.9, dim: 15.7, nm: '얇은 제품', a: '불량 대부분이 <b>치수불량</b>. 온도보다 <b>금형·사출량</b>을 먼저 의심.' },
    ];
    C.forEach((v, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'ccard';
      b.innerHTML = `<span class="hd"><i style="background:${v.c}"></i>무리 ${i + 1} <span class="muted" style="font-size:16px;font-weight:600">· ${v.n}개</span></span>` +
        `<span class="st">평균 온도 <b style="color:var(--text)">${v.t.toFixed(1)}℃</b><br>평균 두께 <b style="color:var(--text)">${v.h.toFixed(3)}mm</b></span>` +
        `<span class="nm" style="color:${v.c}">“${v.nm}”</span>` +
        `<span class="rv">불량률 <b class="big" style="color:${v.d > 10 ? 'var(--accent-2)' : 'var(--ok)'}">${v.d.toFixed(1)}%</b>치수불량 비율 ${v.dim.toFixed(1)}%<br>${v.a}</span>`;
      b.addEventListener('click', () => b.classList.add('open'));
      wrap.appendChild(b);
    });
  })();
})();
