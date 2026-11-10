# Lectures — 노대일 강의 자료 모음

동의대학교 인공지능학과 노대일 교수의 특강·강의 자료입니다. 모든 자료는 GitHub Pages로 배포됩니다.

**목록**: https://daeil-noh.github.io/Lectures/

| 강의 | 대상 · 분량 | 주소 |
|---|---|---|
| [멀티 에이전트 시스템 구축](multi-agent/) | 대학원 · 연구실, 5회 15시간 | https://daeil-noh.github.io/Lectures/multi-agent/ |
| [하네스 엔지니어링](harness-engineering/) | 학부 1학년 특강, 60분 | https://daeil-noh.github.io/Lectures/harness-engineering/ |

## 구조

```
index.html            강의 목록
assets/               슬라이드 엔진 · 아이콘 · 목록 페이지 스타일 (강의 공용)
tools/                실습 노트북 빌드·검사(nb.py), 슬라이드 점검(check_lesson.js), 가짜 API(fake_anthropic)
<강의 폴더>/          강의마다 폴더 하나
```

새 강의는 폴더를 하나 추가하고, 위 표와 `index.html` 카드에 한 줄씩 더합니다.
AX 마이크로디그리 정규 교과는 별도 저장소(Deu_Edu_AX_MD)에 있습니다.
