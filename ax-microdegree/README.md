# AX 마이크로디그리 공통 AI 교과 (구 Deu_Edu_AX_MD)

동의대학교 인공지능학과 공통 AI 교과 온라인 교안 (GitHub Pages로 제공)

**교안 웹사이트: https://daeil-noh.github.io/Lectures/ax-microdegree/**

| 교과 | 대상 | 강의 바로가기 | 폴더 |
|---|---|---|---|
| AI와 데이터 분석 | 이공계열 2학년 | [강의 목록 열기](https://daeil-noh.github.io/Lectures/ax-microdegree/ai-data-analysis/) | [`ai-data-analysis/`](ai-data-analysis/) |
| 생성형AI 활용 실무 | 2학년 (학과 공통) | [강의 목록 열기](https://daeil-noh.github.io/Lectures/ax-microdegree/genai-practice/) | [`genai-practice/`](genai-practice/) |
| 공통 스타일(CSS)·스크립트(JS) | — | — | `assets/` |

## 구조

```
index.html                    # 교과 선택 첫 화면
assets/css/course.css         # 공통 스타일 (교과별 색상: data-course="ai" | "genai")
assets/js/course.js           # 목록 페이지 공통 동작
assets/css/slides.css         # 슬라이드형 교안 스타일 (1280×720 화면을 창 크기에 맞춤)
assets/js/slides.js           # 슬라이드 넘김(← → 키·스와이프·버튼), 단계별 등장(.frag), 퀴즈
assets/js/icons.js            # 공통 선 아이콘 (<svg class="ic"><use href="#i-이름"/></svg>)
ai-data-analysis/
  index.html                  # 주차별 강의 목록
  weekNN/lessonMM.html        # N주 M차시 슬라이드 교안
  weekNN/lessonMM.js          # 그 차시의 직접 해 보기(인터랙티브) 화면
genai-practice/
  index.html                  # 주차별 강의 목록
  materials/                  # 가상 회사 '바다결' 소개·공통 실습 파일(매출·후기 CSV)
  weekNN/lessonMM.html        # N주 M차시 슬라이드 교안 (실습 도구: Gemini·Claude)
  weekNN/materials/           # 그 주차 실습 자료(회의록·메일·양식 등, 모두 가상)
```

## 실습 파일과 데이터

- 코드 실습 차시마다 `weekNN/lessonMM.ipynb` (Colab에서 바로 열림). 원본은 `weekNN/nb_src/lessonMM.py`
- 과제·양식: `week07/assignment1.ipynb`(과제1), `week09/topic_form.ipynb`(보고서 주제), `week11/assignment2.ipynb`(과제2), `week14/report_template.ipynb`(보고서)
- 실습 데이터(가상): `ai-data-analysis/data/` — process.csv, process_raw.csv, vibration.csv, lab_yield.csv (`python3 tools/make_data.py`로 재생성)

## 제작·점검 도구 (`tools/`)

- `LESSON_GUIDE.md` 교안 제작 규칙 · `check_lesson.js` 슬라이드 자동 점검 · `nb.py` 실습 파일 빌드·실행 검사 · `update_index.py` 강의 목록 갱신

## 배포

Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `(root)`

## 슬라이드 조작

← → 키(내용이 한 단계씩 나타난 뒤 다음 장) / 스페이스 / 화면 스와이프 / 하단 ◀ ▶ 버튼으로 넘김, `F` 전체화면. 주소 끝 `#5`처럼 쪽 번호로 바로 이동 가능. 브라우저 인쇄(PDF 저장) 시 한 장씩 출력.
