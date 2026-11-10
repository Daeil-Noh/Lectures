// 1주 1차시 전용: 다섯 가지 일 예시 대화, 전공·직무별 업무 변화 지도, 업무 분류하기
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ───────── 1) 다섯 가지 일 (미리 써 둔 예시 대화) ───────── */
  (function fiveTasks() {
    const q = $('d1-q'), a = $('d1-a'); if (!q) return;
    const D = {
      draft: {
        q: '바다결 추석 선물 세트 판매 시작을 알리는 사내 공지 초안을 5줄 이내로 써 줘. 판매 채널은 자사몰·오픈마켓·매장 세 곳이야.',
        a: '[사내 공지] 추석 선물 세트 판매 시작 안내\n추석을 맞아 바다결 선물 세트 판매를 시작합니다.\n· 판매 채널: 자사몰, 오픈마켓, 오프라인 매장\n· 판매 기간: [시작일] ~ [종료일]\n문의는 온라인 마케팅팀으로 부탁드립니다.',
        c: '날짜·담당자처럼 AI가 모르는 <strong>사실은 내가 채운다</strong>. 빈칸으로 남겨 달라고 하면 더 안전하다.',
      },
      sum: {
        q: '아래 고객 후기 10개를 장점과 불만으로 나눠서 각각 3줄로 요약해 줘.\n[후기 10개 붙여 넣기]',
        a: '장점\n· 포장이 꼼꼼해 선물용으로 좋다\n· 재구매 의사가 많다\n· 아이들도 잘 먹는다\n\n불만\n· 가격에 비해 양이 적다\n· 배송이 늦은 적이 있다\n· 단맛이 강하다는 의견이 있다',
        c: '요약은 <strong>원문과 대조</strong>한다. 후기에 없던 내용이 끼어들지 않았는지, 중요한 불만이 빠지지 않았는지.',
      },
      res: {
        q: '20~30대 직장인의 간식 트렌드를 조사하려고 해. 확인할 항목 5가지와, 각 항목을 찾아볼 자료의 종류를 표로 정리해 줘.',
        a: '조사할 때 확인할 항목과 자료의 종류입니다.',
        t: [['확인할 항목', '찾아볼 자료'], ['간식 먹는 시간·장소', '소비자 설문 보고서'], ['선호하는 맛·성분', '업계 동향 기사'], ['1회 지출 금액', '통계·협회 자료'], ['구매 채널', '유통사 발표 자료'], ['건강 관심도', '공공기관 조사']],
        c: '조사는 AI가 <strong>출발점</strong>을 잡아 준다. 실제 숫자·자료는 <strong>출처를 직접 찾아 확인</strong>한다(6주).',
      },
      tr: {
        q: '다음 제품 소개를 해외 바이어용 영어로 번역해 줘.\n“부산 바다를 담은 고소한 미역귀 현미칩”',
        a: 'Savory brown rice chips with miyeok-gwi (sea mustard), inspired by the sea of Busan.',
        c: '제품명·원재료 같은 <strong>용어</strong>가 맞는지, 표현이 <strong>상대 문화</strong>에 어색하지 않은지 확인한다(12주).',
      },
      con: {
        q: '다크초코 그래놀라를 소개하는 인스타그램 게시물 문구를 써 줘. 20~30대 직장인 대상, 3줄, 해시태그 3개 포함.',
        a: '퇴근길, 달콤한 한 줌이 필요할 때.\n바다결 다크초코 그래놀라로\n오늘 하루를 가볍게 마무리하세요.\n#바다결 #그래놀라 #퇴근길간식',
        c: '<strong>과장 광고</strong>는 없는지, <strong>우리 브랜드 말투</strong>와 맞는지 사람이 고른다(10주).',
      },
    };
    const btns = document.querySelectorAll('.casebtn[data-k]');
    function pick(k) {
      btns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.k === k));
      q.textContent = D[k].q;
      let h = '<span class="who">AI · 예시 답변</span>' + esc(D[k].a);
      if (D[k].t) h += '<table class="mt">' + D[k].t.map((r, i) => '<tr>' + r.map((c) => (i ? '<td>' : '<th>') + c + (i ? '</td>' : '</th>')).join('') + '</tr>').join('') + '</table>';
      a.innerHTML = h;
      $('d1-chk').querySelector('span').innerHTML = D[k].c;
    }
    btns.forEach((b) => b.addEventListener('click', () => pick(b.dataset.k)));
    pick('draft');
  })();

  /* ───────── 2) 전공·직무별 업무 변화 지도 ───────── */
  (function majorMap() {
    const sw = $('mj'); if (!sw) return;
    const M = {
      biz: { h: '경영(경영지원·기획)', d: '회의록·보고서처럼 <strong>정해진 형식의 글</strong>은 AI가 빨라지고, 숫자와 전략을 정하는 일은 사람에게 남습니다.', t: [
        ['ai', '회의록 정리·요약', '메모를 형식에 맞춰 정리하는 일은 AI가 빠르다. 빠진 결정 사항만 확인한다.'],
        ['ai', '보고서 문장 다듬기', '맞춤법·문장 흐름 교정은 AI가 잘한다. 의미가 바뀌지 않았는지 본다.'],
        ['co', '사업계획서 초안', '목차·문장은 AI와, 목표 숫자와 근거 자료는 사람이 채운다.'],
        ['co', '경쟁사 자료 정리', 'AI가 정리 틀을 잡고, 사람이 출처를 확인해 사실만 남긴다.'],
        ['hu', '투자·가격 결정', '회사의 돈과 위험이 걸린 결정. AI 분석은 참고 자료일 뿐이다.'],
        ['hu', '직원 면담·갈등 조정', '사람의 감정과 신뢰가 걸린 일. 사람이 직접 한다.'],
      ] },
      mkt: { h: '마케팅', d: '광고 문구·게시물 <strong>여러 안</strong>을 순식간에 만들 수 있게 됩니다. 무엇을 고르고 얼마를 쓸지는 사람이 정합니다.', t: [
        ['ai', '광고 문구 여러 안', '10개 안을 받아 사람이 고르고 고친다.'],
        ['ai', 'SNS 게시물 초안', '형식이 정해진 짧은 글. 브랜드 말투만 맞추면 된다.'],
        ['co', '고객 후기 분류', 'AI가 유형을 나누고, 사람이 원문을 보며 기준을 다듬는다.'],
        ['co', '타깃 페르소나 설정', '조사 자료를 주고 AI와 주고받으며 구체화한다(10주).'],
        ['hu', '캠페인 예산 결정', '성과와 위험을 따져 책임지고 정하는 일.'],
        ['hu', '거래처·인플루언서 협상', '관계와 신뢰가 핵심. 사람이 직접 만난다.'],
      ] },
      acc: { h: '회계·재무', d: '표 정리·설명 문장은 AI가 돕지만, <strong>숫자의 정확성</strong>과 기준 해석은 끝까지 사람이 책임집니다.', t: [
        ['ai', '엑셀 정리 방법 묻기', '“이런 표를 만들려면?” 같은 질문에 방법을 잘 알려 준다.'],
        ['ai', '재무 설명 문장 초안', '숫자를 문장으로 풀어 쓰는 일. 숫자는 원본과 대조한다.'],
        ['co', '거래 내역 분류 초안', 'AI가 1차 분류, 사람이 애매한 건을 판단한다.'],
        ['co', '비용 절감 아이디어', 'AI가 아이디어를 내고, 사람이 현실성을 따진다.'],
        ['hu', '세법·회계기준 해석', 'AI 답은 틀릴 수 있다. 원문과 전문가 확인이 필수다.'],
        ['hu', '숫자 최종 검증', '틀린 숫자 하나가 큰 문제가 된다. 사람이 확인하고 서명한다.'],
      ] },
      adm: { h: '행정(공공·사무)', d: '공문·안내문 초안과 규정 요약이 빨라집니다. 단, <strong>민원인의 개인정보</strong>는 AI에 넣지 않습니다(1-3).', t: [
        ['ai', '공문·안내문 초안', '정해진 형식이 있어 AI가 잘 맞춘다(5주).'],
        ['ai', '회의 자료 정리', '흩어진 메모를 항목별로 묶는다.'],
        ['co', '민원 답변 초안', '개인정보를 가리고 내용만 주어 초안을 받은 뒤, 사람이 확인한다.'],
        ['co', '규정·지침 요약', 'AI 요약을 원문 조항과 대조한다.'],
        ['hu', '민원인 상담', '사정을 듣고 공감하며 해결하는 일.'],
        ['hu', '예산 집행 결정', '규정과 책임이 걸린 결정.'],
      ] },
      hum: { h: '글쓰기·번역·교육', d: '개요·초벌 번역·수업 자료 초안이 빨라집니다. <strong>뉘앙스·문화·사람을 가르치는 일</strong>은 사람이 맡습니다.', t: [
        ['ai', '글 개요 짜기', '여러 구성안을 받아 출발점으로 쓴다.'],
        ['ai', '번역 초벌', '빠르게 1차 번역을 받고 다듬는다.'],
        ['co', '글 교정·교열', 'AI 제안을 하나씩 보며 받아들일지 정한다.'],
        ['co', '수업 활동·퀴즈 초안', 'AI가 만든 문제를 교육 목표에 맞게 고친다.'],
        ['hu', '번역 감수·문화적 뉘앙스', '맥락과 문화를 아는 사람이 최종 판단한다.'],
        ['hu', '학습자 피드백·평가', '학생을 이해하고 책임 있게 평가하는 일.'],
      ] },
    };
    const lanes = { ai: $('ln-ai'), co: $('ln-co'), hu: $('ln-hu') };
    const H = $('mj-h'), Dd = $('mj-d');
    function pick(m) {
      sw.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.m === m));
      Object.values(lanes).forEach((l) => (l.innerHTML = ''));
      H.textContent = M[m].h; Dd.innerHTML = M[m].d;
      M[m].t.forEach(([k, name, why]) => {
        const c = document.createElement('button');
        c.type = 'button'; c.className = 'chip'; c.textContent = name;
        c.addEventListener('click', () => {
          document.querySelectorAll('.chip').forEach((x) => x.classList.remove('on'));
          c.classList.add('on');
          const lab = { ai: 'AI가 초안', co: '함께', hu: '사람이 판단' }[k];
          H.textContent = name + ' → ' + lab;
          Dd.textContent = why;
        });
        lanes[k].appendChild(c);
      });
    }
    sw.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => pick(b.dataset.m)));
    pick('biz');
  })();

  /* ───────── 3) 바다결 업무 분류하기 ───────── */
  (function sortTasks() {
    const wrap = $('sorts'); if (!wrap) return;
    const LAB = { ai: 'AI가 초안', co: '함께', hu: '사람이 판단' };
    const T = [
      ['회의 메모를 회의록 형식으로 정리', 'ai', '형식이 정해진 정리 작업. AI가 쓰고, 결정 사항이 맞는지만 확인한다.'],
      ['추석 선물 세트 새 기획 아이디어', 'co', 'AI가 아이디어를 많이 내고, 사람이 회사 사정에 맞게 고르고 발전시킨다.'],
      ['오픈마켓 광고비를 줄일지 결정', 'hu', '돈과 전략이 걸린 결정. AI는 자료 정리까지만.'],
      ['배송 지연 사과 메일 초안', 'ai', '형식이 있는 글. 단, 고객 이름·주문번호는 넣지 않고 초안을 받는다.'],
      ['화가 난 고객과의 전화 응대', 'hu', '감정을 읽고 신뢰를 회복하는 일. 사람이 직접 한다.'],
      ['후기 120건에서 불만 유형 찾기', 'co', 'AI가 1차로 분류하고, 사람이 원문을 보며 기준을 다듬는다.'],
      ['제품 소개문 영어 초벌 번역', 'ai', '초벌은 AI가 빠르다. 용어와 뉘앙스는 사람이 확인한다.'],
      ['신입 직원 채용 최종 결정', 'hu', '사람의 삶에 영향을 주는 결정. AI에게 맡기지 않는다.'],
      ['20~30대 대상 SNS 캠페인 기획', 'co', '타깃 분석·아이디어는 AI와 주고받고, 방향은 사람이 정한다.'],
    ];
    let done = 0, same = 0;
    T.forEach(([name, ans, why]) => {
      const card = document.createElement('div'); card.className = 'sort';
      card.innerHTML = `<div class="nm">${name}</div><div class="pick"></div><div class="why"></div>`;
      const pick = card.querySelector('.pick');
      ['ai', 'co', 'hu'].forEach((k) => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = LAB[k]; b.dataset.k = k;
        b.addEventListener('click', () => {
          if (card.classList.contains('done')) return;
          card.classList.add('done'); done++; if (k === ans) same++;
          pick.querySelectorAll('button').forEach((x) => { x.disabled = true; if (x.dataset.k === ans) x.classList.add('ans', ans); });
          b.classList.add('mine');
          card.querySelector('.why').innerHTML = (k === ans ? '<b style="color:var(--ok)">같은 판단!</b> ' : `<b style="color:var(--accent-2)">이 수업의 기준: ${LAB[ans]}</b> `) + why;
          $('so-score').innerHTML = done < T.length ? `${done} / ${T.length} 선택 · 수업 기준과 같은 판단 ${same}개`
            : `<strong style="color:var(--text)">수업 기준과 같은 판단 ${same} / ${T.length}</strong> — 다르게 고른 카드는 이유를 말해 보세요.`;
        });
        pick.appendChild(b);
      });
      wrap.appendChild(card);
    });
  })();
})();
