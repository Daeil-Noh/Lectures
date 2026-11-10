// 4회 직접 해 보기: 서브에이전트 정의 만들기 · worktree 충돌 모형
(function () {
  const $ = (id) => document.getElementById(id);

  /* ── 1. 서브에이전트 정의 만들기 ── */
  const roleSel = $('roleSel');
  if (roleSel) {
    const TOOLS = ['Read', 'Grep', 'Glob', 'Edit', 'Write', 'Bash', 'WebFetch'];
    const ROLE = {
      scout: { name: 'repo-scout', tools: ['Read', 'Grep', 'Glob'], model: 'haiku', iso: false,
        desc: '저장소의 구조·데이터 흐름·실행 방법을 조사해 요약 보고할 때 쓴다. 파일을 고치지 않는다.',
        body: '너는 연구 저장소 조사원이다. 디렉터리 구조, 주요 모듈, 데이터가 흐르는 길, 실행·테스트 명령을 찾아\n10줄 이내로 보고한다. 근거가 된 파일 경로를 함께 적는다.' },
      review: { name: 'code-reviewer', tools: ['Read', 'Grep', 'Glob'], model: 'sonnet', iso: false,
        desc: '코드 변경을 검토할 때 쓴다. 버그, 데이터 누설, 테스트 누락을 찾는다. 수정은 하지 않는다.',
        body: '너는 연구 코드 리뷰어다. CLAUDE.md 의 규칙을 기준으로 검토하고,\n문제마다 파일:줄 · 이유 · 고칠 방법을 적는다. 확신이 낮은 지적은 따로 표시한다.' },
      run: { name: 'experiment-runner', tools: ['Read', 'Bash'], model: 'haiku', iso: false,
        desc: '테스트나 예제 실험을 실행하고 결과를 표로 정리할 때 쓴다.',
        body: '너는 실험 실행 담당이다. CLAUDE.md 의 명령만 실행하고, 결과를 표로 정리한다.\n실패하면 오류 메시지 핵심과 재현 명령을 보고한다. 코드를 고치지 않는다.' },
      refactor: { name: 'refactorer', tools: ['Read', 'Grep', 'Edit', 'Write', 'Bash'], model: 'sonnet', iso: true,
        desc: '맡은 모듈 하나를 리팩터링할 때 쓴다. 다른 모듈은 건드리지 않는다.',
        body: '너는 리팩터링 담당이다. 동작을 바꾸지 않고 구조만 고친다.\n고친 뒤 python -m unittest 가 통과하는지 확인하고, 바꾼 점을 요약해 커밋한다.' }
    };
    const box = $('toolOpts');
    box.innerHTML = TOOLS.map((t) => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join('');
    function load() {
      const r = ROLE[roleSel.value];
      box.querySelectorAll('input').forEach((i) => (i.checked = r.tools.includes(i.value)));
      $('modelSel').value = r.model; $('isoChk').checked = r.iso;
      render();
    }
    function render() {
      const role = roleSel.value, r = ROLE[role];
      const tools = Array.from(box.querySelectorAll('input:checked')).map((i) => i.value);
      const model = $('modelSel').value, iso = $('isoChk').checked;
      const fm = ['---', 'name: ' + r.name, 'description: ' + r.desc];
      if (tools.length) fm.push('tools: ' + tools.join(', '));
      fm.push('model: ' + model);
      if (iso) fm.push('isolation: worktree');
      fm.push('---');
      $('agentMd').textContent = '# .claude/agents/' + r.name + '.md\n' + fm.join('\n') + '\n' + r.body;
      const writes = tools.includes('Edit') || tools.includes('Write');
      const W = [];
      if (!tools.length) W.push('도구 줄이 없으면 <b>모든 도구를 물려받습니다</b>. 의도한 것인지 확인하세요.');
      if (role === 'review' && writes) W.push('리뷰어가 쓰기 도구를 가지면 <b>자기가 고친 것을 자기가 평가</b>하게 됩니다.');
      if (role === 'scout' && writes) W.push('조사 역할에 쓰기 도구는 필요 없습니다. 읽기만 주세요.');
      if ((role === 'scout' || role === 'run') && model === 'opus') W.push('읽기·실행 위주의 반복 작업에 가장 비싼 모델 — 작은 모델로 충분한 경우가 많습니다.');
      if (writes && !iso) W.push('쓰기 도구가 있습니다. 메인 세션과 동시에 돌면 같은 파일을 고칠 수 있으니 <b>isolation: worktree</b>를 고려하세요.');
      if (iso && !writes) W.push('쓰기 도구가 없으면 worktree 격리는 필요 없습니다.');
      if (tools.includes('Bash')) W.push('Bash는 무엇이든 실행할 수 있습니다. <b>권한 규칙·훅</b>으로 명령을 좁히세요.');
      if (tools.includes('WebFetch')) W.push('외부 웹 내용은 <b>프롬프트 인젝션</b> 경로가 될 수 있습니다 (5회).');
      $('agentWarn').innerHTML = W.length ? W.map((w) => '<div>' + w + '</div>').join('') : '<div class="ok">역할에 맞게 도구·모델이 좁혀져 있습니다.</div>';
    }
    roleSel.addEventListener('change', load);
    box.addEventListener('change', render);
    $('modelSel').addEventListener('change', render);
    $('isoChk').addEventListener('change', render);
    load();
  }

  /* ── 2. worktree 충돌 모형 ── */
  const ws = $('wtSvg');
  if (ws) {
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (tag, a, txt) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; ws.appendChild(e); return e; };
    const FILES = ['detect.py', 'features.py', 'test_detect.py', 'test_features.py', 'README.md'];
    const AG = [
      { n: 'A · 임계값 수정', wide: ['detect.py', 'test_detect.py'], narrow: ['detect.py', 'test_detect.py'] },
      { n: 'B · 특징 추가', wide: ['features.py', 'detect.py', 'test_features.py'], narrow: ['features.py', 'test_features.py'] },
      { n: 'C · 문서 정리', wide: ['README.md', 'detect.py'], narrow: ['README.md'] }
    ];
    function draw(run) {
      const on = $('wtOn').checked, split = $('wtSplit').checked;
      ws.innerHTML = '';
      const x0 = 150, cw = 104, y0 = 60, rh = 66;
      FILES.forEach((f, j) => mk('text', { x: x0 + j * cw + cw / 2, y: 36, 'text-anchor': 'middle', class: 'p-lab', style: 'font-size:13px' }, f));
      const touch = {};
      AG.forEach((a, i) => (split ? a.narrow : a.wide).forEach((f) => (touch[f] = (touch[f] || 0) + 1)));
      AG.forEach((a, i) => {
        const y = y0 + i * rh;
        mk('text', { x: 4, y: y + 30, class: 'p-lab', style: 'font-size:14px' }, a.n);
        if (on) mk('text', { x: 4, y: y + 48, class: 'p-tick' }, 'worktree-' + ['fix', 'peak', 'docs'][i]);
        FILES.forEach((f, j) => {
          const x = x0 + j * cw + 8;
          const hit = run && (split ? a.narrow : a.wide).includes(f);
          const clash = hit && touch[f] > 1;
          mk('rect', { x, y: y + 6, width: cw - 16, height: rh - 18, rx: 10, class: hit ? (clash ? (on ? 'f-acc2s' : '') : 'f-accs') : 'f-s2', style: hit && clash && !on ? 'fill:var(--bad-soft)' : '' });
          if (hit) mk('text', { x: x + (cw - 16) / 2, y: y + 6 + (rh - 18) / 2 + 5, 'text-anchor': 'middle', class: clash ? 't-acc2' : 't-acc', style: 'font-size:13px' + (clash && !on ? ';fill:var(--bad)' : '') }, clash ? (on ? '합칠 때 충돌' : '덮어씀!') : '수정');
        });
      });
      if (on) mk('text', { x: 4, y: 316, class: 'p-tick' }, '각자 다른 폴더·브랜치에서 작업 → 마지막에 main으로 합침');
      else mk('text', { x: 4, y: 316, class: 'p-tick' }, '모두 같은 폴더에서 작업');
      if (!run) { $('wtLive').textContent = '–'; $('wtMerge').textContent = '–'; return; }
      const shared = FILES.filter((f) => touch[f] > 1).length;
      $('wtLive').textContent = on ? 0 : shared;
      $('wtMerge').textContent = on ? shared : '–';
      $('wtNote').innerHTML = !on && !split ? '같은 폴더에서 셋이 <b>detect.py</b>를 동시에 고쳐 서로의 변경을 덮어씁니다. 오류도 안 나서 알아채기 어렵습니다.'
        : on && !split ? '작업 중에는 안전하지만, 같은 파일을 고친 브랜치들을 <b>합칠 때 충돌</b>이 납니다.'
        : !on && split ? '범위를 나눠 겹치는 파일은 없습니다. 하지만 같은 폴더라 실행·테스트가 서로의 <b>작업 중 상태</b>를 봅니다.'
        : '쓰기 공간도, 파일 범위도 나눴습니다. 합칠 때도 충돌이 없습니다.';
    }
    $('wtRun').addEventListener('click', () => draw(true));
    $('wtOn').addEventListener('change', () => draw(false));
    $('wtSplit').addEventListener('change', () => draw(false));
    draw(false);
  }
})();
