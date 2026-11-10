# 「AI와 데이터 분석」 슬라이드 교안 제작 가이드

동의대학교 인공지능학과 노대일 교수의 이공계열 2학년 공통 교과. 온라인 강좌, **주 3차시 × 차시당 25분 영상**.
대상은 **프로그래밍 경험이 없는 이공계 2학년**. 코드는 처음부터 쓰지 않고 제공된 Colab 실습 파일을 실행·수정하며 익히고, 생성형AI를 코딩 보조 도구로 쓴다.

**기준 품질 = 1주차.** 시작하기 전에 반드시 아래 파일을 끝까지 읽고 구조·말투·밀도를 그대로 따른다.
- `ai-data-analysis/week01/lesson02.html`, `lesson02.js` (데모가 많은 사례 차시)
- `ai-data-analysis/week01/lesson03.html`, `lesson03.js` (토글·카드형 데모)
- `ai-data-analysis/week01/lesson01.html`, `lesson01.js` (산점도·학습 애니메이션 데모)
- `assets/css/slides.css`, `assets/js/slides.js`, `assets/js/icons.js` (공통 — **수정 금지**)

## 1. 파일 위치
```
ai-data-analysis/weekNN/lessonMM.html     슬라이드 교안 (NN=02..14, MM=01..03)
ai-data-analysis/weekNN/lessonMM.js       그 차시의 직접 해 보기 스크립트
ai-data-analysis/weekNN/lessonMM.ipynb    Colab 실습 파일 (코드 실습이 있는 차시만)
ai-data-analysis/weekNN/nb_src/lessonMM.py  실습 파일 원본 (tools/nb.py 형식)
```
- 수정 금지: `assets/*`, `week01/*`, `index.html`, `ai-data-analysis/index.html`, `genai-practice/*`, `tools/*`, `ai-data-analysis/data/*`, `README.md`. 자기 주차 폴더 안에서만 작업한다.
- git commit/push 하지 않는다 (총괄이 한다).

## 2. 슬라이드 구성 (차시당 18~22장, 25분)
1. **표지** — 1주차와 동일한 구조. eyebrow `AI와 데이터 분석 · N주차 M차시`, h1 제목, lead 한 줄, 아래 작성자 블록을 **그대로** 넣는다. 오른쪽에 그 차시를 상징하는 SVG 그림(움직임 약간).
   ```html
   <div class="author"><b>노대일 교수</b><span>동의대학교 인공지능학과</span><span>daeil.noh@deu.ac.kr</span></div>
   ```
   표지의 s-foot 왼쪽은 비워 둔다: `<div class="s-foot"><span></span><span class="no"></span></div>`. 「AX 마이크로디그리」 문구는 어디에도 쓰지 않는다.
2. **학습 목표** (아이콘 타일 3~4개)
3. **오늘의 흐름** (`.tl` 타임라인, 구간 이름만 — 분·총 시간 표시는 넣지 않는다)
4~N. 본문 — 구간마다 `s-head` 에 구간명만 넣는다(우측 상단 시간 표시 넣지 않음). 큰 구간은 `.slide.section` 구분 슬라이드(①②③).
- **정리**(핵심 세 가지), **확인 문제 4개**(2장, `.q` 형식), **다음 차시 예고**(마지막 장, 이전·다음 차시 버튼).
- 한 장에 한 가지 생각. 글은 짧게, 그림·아이콘·도식 위주. 말로 풀 설명은 강의 녹화 때 교수님이 한다.
- 1장 ≈ 1분 남짓으로 분량을 잡되, 슬라이드에는 시간을 적지 않는다(표지·흐름·머리말 모두).

## 3. 직접 해 보기 (차시당 최소 2개, 손 아이콘 표시)
제목 옆에 `<svg class="ic" style="color:var(--accent);font-size:30px"><use href="#i-hand"/></svg>`, s-head 에 `· 직접 해 보기 N`.
- 슬라이더·버튼·토글·클릭 카드·애니메이션으로 **개념을 손으로 체험**하게 한다 (1주차 예: 규칙 만들기 산점도, 학습 애니메이션, 판정 기준 슬라이더, 가명처리 토글).
- 데모 레이아웃은 `.demo`(왼쪽 `.plot`, 오른쪽 `.side`), 컨트롤은 `.ctrl`/`input[type=range]`/`.btn`/`.meter`/`.callout`/`.legend`.
- 데모 숫자가 말이 되는지 **node로 미리 계산해 확인**한다(예: 정확도, 오차가 기대대로 변하는지). 결과 문구는 계산값을 그대로 쓴다.
- 데모용 데이터는 고정 난수(seed)로 생성 — 매번 같은 결과.
- `prefers-reduced-motion` 고려, 다크 모드에서도 보이게 색은 CSS 변수(`var(--accent)` 등)만 쓴다.

## 4. 코드 실습 차시 (3주차 이후 대부분)
- 슬라이드에 짧은 코드는 `<pre class="code">…</pre>`(자동 색 입힘, 안에 HTML 태그 넣지 말 것), 결과는 `<pre class="out">…</pre>`, 오류는 `<pre class="out err">`. 노트북 셀 모양이 필요하면 `.cell-ui`.
- 코드 한 덩어리는 8~12줄 이내. 한 줄씩 의미를 그림/주석으로 짚어 준다.
- **실습 파일 슬라이드** 1장을 넣는다:
  ```html
  <a class="colab" href="https://colab.research.google.com/github/Daeil-Noh/Lectures/blob/main/ax-microdegree/ai-data-analysis/weekNN/lessonMM.ipynb" target="_blank" rel="noopener">Colab에서 실습 파일 열기</a>
  ```
- 실습 파일(.ipynb)은 `nb_src/lessonMM.py` 를 쓰고 `python3 tools/nb.py build nb_src/lessonMM.py lessonMM.ipynb` 로 만든 뒤 **`python3 tools/nb.py check lessonMM.ipynb` 가 OK** 여야 한다.
  - 첫 셀: 마크다운 제목(`# N주 M차시 · 제목`), 학습 목표, 사용 데이터 설명.
  - 준비 셀: `!pip -q install koreanize-matplotlib` 다음 줄 `import koreanize_matplotlib` (Colab 한글 그래프용).
  - 데이터는 반드시 이 주소로 읽는다: `DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/ai-data-analysis/data/'` → `pd.read_csv(DATA + 'process.csv')`
  - 코드 셀 8~15개, 주석은 한국어. 각 단계 앞에 마크다운으로 “무엇을 왜 하는지”.
  - `# %% [exercise]` 셀에 “직접 바꿔 보기” 과제 2~3개 (값을 바꾸면 결과가 바뀌는 형태, 기본값으로도 실행되게).
  - 마지막: 정리 마크다운 + “생성형AI에게 물어볼 만한 질문” 예시 1~2개(4주차 이후).
  - Colab 기본 환경(pandas 2.x, scikit-learn 1.x, matplotlib)에서 돌아가는 표준 API만. 외부 설치는 koreanize-matplotlib 만.

## 5. 실습 데이터 (`ai-data-analysis/data/`, 모두 가상 데이터)
| 파일 | 내용 |
|---|---|
| `process.csv` (494행) | 사출 성형 공정 기록. `product_id, date(2026-03-02~, 평일 30일), shift(주간/야간), line(1~3라인), machine(1~6호기), temp(℃, 평균 211), pressure(bar, 평균 80), speed(rpm, 평균 1194), humidity(%, 평균 58), thickness(mm, 평균 2.00), strength(인장강도 MPa, 평균 38.8), defect(0/1, 불량률 13.8%), defect_type(정상/치수불량/찍힘/스크래치)` |
| `process_raw.csv` (499행) | 위 데이터의 **정리 전** 버전: humidity 결측 19개, pressure 결측 9개, temp 센서 오류값 999.9(6개)·-1.0(2개), thickness 일부가 `"2.01mm"` 문자열(→ 문자열 열), 중복 행 5개 |
| `vibration.csv` (720행) | 6대 설비 × 120일 일일 진동. `machine, day, date, rms, peak, temp, current, failure(고장일=1)`. 3호기는 96일째, 5호기는 110일째 고장 — 고장 약 25일 전부터 rms·temp·current 증가. 2% 확률의 순간 튐(잡음) 있음 |
| `lab_yield.csv` (60행) | 실험 조건별 수율. `exp_id, temp(60~100℃), hours(1~5), catalyst(0.5~2.5), yield_pct(평균 64%)`. 90℃·2시간 부근이 최고, 촉매량이 많을수록 약간 높음 |

데이터에 숨은 관계(학생이 “발견”하게 설계할 수 있음, 단 정답처럼 미리 말하지 말 것):
- strength ↔ pressure 상관 0.70 (강함), thickness 0.32, humidity −0.23, temp는 **곡선 관계**(210℃ 부근 최대, 상관계수로는 약하게 보임 → 상관계수의 한계 예시)
- 불량률: 야간 20.3% vs 주간 7.0% (야간에 습도·온도가 조금 높음 → 교란 변수/상관≠인과 예시), strength 낮을수록 불량↑, thickness 얇을수록 치수불량
- 정확한 수치는 직접 계산해서 쓴다(`python3 -c "import pandas as pd; ..."`).
- 실습 파일은 이 데이터만 쓰거나, 노트북 안에서 seed 고정으로 생성한다(인터넷 다운로드 금지 — 단, 2주차 공공데이터 찾기처럼 사이트 소개는 링크만).

## 6. 내용 원칙
- 사실 정확성: 출처 없는 통계·기업 사례 수치 금지. 데모·예시 수치는 “가상 데이터”라고 s-foot 에 표시.
- 잘 알려진 개념·정의만 단정적으로. 확신이 없는 사실은 빼거나 일반적으로 표현.
- 이공계 2학년 눈높이: 수식은 최소, 직관과 그림 우선. 용어는 처음 나올 때 한 줄로 풀이.
- 예시는 제조·공정·실험·설비 중심(1주차 3호기·불량·진동 맥락 이어 쓰기).
- 생성형AI 활용(4주차 이후): 프롬프트 예시는 실제로 쓸 만한 문장으로, “결과 검증” 습관 강조.
- 문체: 제목은 짧은 명사형/질문형, 본문은 “~한다/~합니다” 혼용 가능(1주차와 동일하게).

## 7. 점검 (끝내기 전에 모두 통과)
1. `node tools/check_lesson.js ai-data-analysis/weekNN/lessonMM.html <스크래치폴더>/wNNmMM` → `errors: none`, `overflow: none`
2. 생성된 `grid-N.png` 를 Read 도구로 **직접 보고** 겹침·잘림·빈 공간·가독성을 확인. 데모는 조작한 상태도 playwright로 찍어 확인(1주차처럼).
3. 실습 파일: `python3 tools/nb.py check ai-data-analysis/weekNN/lessonMM.ipynb` → OK
4. 차시 간 링크: 마지막 장의 이전/다음 버튼 경로가 실제 파일 위치와 맞는지(주차가 바뀌면 `../weekNN/lessonMM.html`).
5. 다크 모드 한 장 이상 확인(`colorScheme: 'dark'`).

## 8. 전체 강의 계획 (확정)
| 주 | 주제 | 1차시 | 2차시 | 3차시 | 비고 |
|---|---|---|---|---|---|
| 1 | AX와 AI 데이터 분석 | AI와 데이터 분석이란? | 제조·연구·로봇 현장의 AX 사례 | 데이터 윤리와 개인정보 기초 | 완성 |
| 2 | 데이터 분석 과정 | 분석 프로세스: 문제 정의부터 해석까지 | 데이터의 종류: 공정·센서·실험 데이터 | 공공데이터·AI허브에서 데이터 찾기 | |
| 3 | 분석 환경 시작하기 | Google Colab 시작하기 | 파이썬 최소 문법 ①: 변수·자료형·리스트 | 파이썬 최소 문법 ②: 조건문·반복문·라이브러리 | |
| 4 | 생성형AI 코딩 도우미 | 생성형AI로 코드 만들고 실행하기 | AI로 오류 메시지 읽고 해결하기 | AI 코드 검증 기초: 환각과 편향 | |
| 5 | 데이터 불러오기와 정리 | 표 데이터 불러오기와 살펴보기(pandas) | 조건으로 고르기와 정렬하기 | 결측치 처리와 자료형 정리 | |
| 6 | 통계로 데이터 읽기 | 평균·중앙값·분산 | 분포와 이상치 | 그룹별 집계로 비교하기 | |
| 7 | 데이터 시각화 | 목적에 맞는 그래프 고르기 | 그래프 그리기 실습 | 상관관계와 인과관계: 공정 변수와 품질 | 과제1 (데이터 시각화) |
| 8 | 중간고사 | 1~7주 내용 오프라인 평가 | | | 교안 없음 |
| 9 | 머신러닝 시작하기 | 머신러닝이란? (지도·비지도 학습) | 학습 데이터와 시험 데이터 나누기 | 전공 문제를 데이터 문제로 바꾸기 | 보고서 주제 제출 |
| 10 | 예측: 회귀 | 회귀의 개념 | 공정 조건으로 품질 예측하기 | 예측 오차로 성능 평가하기 | |
| 11 | 판정: 분류 | 분류의 개념: 의사결정나무와 과적합 | 불량품 판정 실습 | 정확도·정밀도·재현율 | 과제2 (불량품 분류) |
| 12 | 군집과 이상탐지 | 비슷한 것끼리 묶기: 군집 | 이상탐지와 설비 예지보전 | 제공 코드로 이상탐지 실습 | |
| 13 | 딥러닝과 생성형AI | 신경망 원리 직관적으로 이해하기 | 이미지 인식과 비전 검사 | 생성형AI의 원리 | |
| 14 | 전공 분석 보고서 | 예시 프로젝트: AI와 함께 분석 전 과정 따라 하기 | 분석 보고서 작성법 | 결과 해석과 AI 활용 검증 점검 | |
| 15 | 기말고사 | 9~14주 내용 오프라인 평가 및 전공 분석 보고서 제출 | | | 교안 없음 |

평가: 중간고사(8주, 1~7주, 객관식·단답형 대면), 기말고사(15주, 9~14주) + 전공 분석 보고서(15주 제출). 과제1(7주), 과제2(11주), 보고서 주제 제출(9주).

## 용어 (데이터 나누기)
- **훈련 데이터**(train): 모델이 보고 배우는 데이터. 「학습 데이터」 대신 이 말을 쓴다(동사 「학습한다」는 그대로).
- **검증 데이터**(validation): 여러 설정·모델 중 무엇을 쓸지 **고를 때** 비교하는 데이터.
- **시험 데이터**(test): 다 고른 뒤 **마지막에 한 번** 채점하는 데이터. 코드의 `X_test`·`y_test`.
- 이 강의 실습은 훈련·시험 둘로만 나눈다. 시험 데이터로 설정을 비교하는 실습에서는 “원래는 검증 데이터의 역할”임을 밝힌다.
- 「검증」은 데이터 묶음 이름으로는 validation에만 쓴다. AI 답·코드를 확인하는 일(검증 습관)은 그대로 「검증」.
