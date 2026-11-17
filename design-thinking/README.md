# 프로젝트와 디자인씽킹 특강 (3회)

동의대학교 인공지능학과 · 노대일 교수 · 「프로젝트와 디자인씽킹」 과목 특강, 매주 60분 × 3회, 강의식(실습 없음)
팀 주제 찾기 · 발표 · 손 자료/AI 자료 만들기를 이미 경험한 학생들이 대상입니다.

**보기**: https://daeil-noh.github.io/Lectures/design-thinking/

| 회차 | 제목 | 주요 내용 |
|---|---|---|
| [1주차](w1/) | 디자인씽킹 다시 보기 | 5단계 · 더블 다이아몬드, 팀 과정의 지름길 3가지, 주스로 사례, 문제 문장 다섯 칸, HMW 질문, 지난 행동을 묻는 인터뷰 |
| [2주차](w2/) | AI 시대의 디자인씽킹 | 손 자료 vs AI 자료, 평균으로 모이는 답, Doshi & Hauser(2024), 단계별 AI의 자리, AI 가상 사용자, 자동화 편향, AI 사용 표시 |
| [3주차](w3/) | 아이디어에서 결과물까지 | 프로토타입 충실도, 오즈의 마법사, MVP · 만들기-측정-배우기, 드롭박스 사례, 위험한 가정 표, 사용자 테스트 원칙, 이어가기 |

회마다 18장 안팎, 발표자 노트의 예정 시간 합계는 약 60분입니다.

## 조작법

`←` `→` 넘기기 · `N` 발표자 노트 · `T` 강의 시계 · `O` 슬라이드 목록 · `F` 전체 화면 · 주소 끝 `#12`로 바로 이동 · 브라우저 인쇄(PDF 저장) 시 한 장씩 출력

## 파일

```
design-thinking/
├─ index.html     3회 목록
├─ dt.css         이 특강 전용 추가 스타일 (공용 엔진 ../assets/ 위에 얹음)
└─ w1/ w2/ w3/    회차별 슬라이드 (1280×720)
```

## 참고 자료

- Design Council, *The Double Diamond* (2005)
- R. Fitzpatrick, *The Mom Test* (2013)
- A. R. Doshi & O. P. Hauser, "Generative AI enhances individual creativity but reduces the collective diversity of novel content", *Science Advances* 10(28), 2024
- E. Ries, *The Lean Startup* (2011)
- D. Houston, *Dropbox: Startup Lessons Learned* (2010)
- J. Nielsen, "Why You Only Need to Test with 5 Users" (2000)
- Juicero 관련 보도: Bloomberg (2017.4), CBS News · Axios (2017.9)

## 점검

```bash
node tools/check_lesson.js design-thinking/w1/index.html /tmp/w1
```
