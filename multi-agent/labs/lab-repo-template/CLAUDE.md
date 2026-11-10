# vibelab — 설비 진동 이상탐지 연구 코드

멀티 에이전트 시스템 구축 4회 실습용 저장소입니다(데이터는 모두 가상).

## 명령
- 테스트: `python -m unittest -v`
- 예제 실행: `python -m vibelab.run data/sample_vibration.csv` (먼저 `export PYTHONPATH=src`)
- 자동 리뷰: `bash scripts/review_diff.sh`

## 규칙
- 표준 라이브러리만 쓴다 (설치 없이 돌아가야 함)
- 임계값(평균·표준편차)은 **훈련 구간**으로만 정한다. 시험 구간이 임계값 계산에 섞이면 데이터 누설이다
- `data/` 의 원본 파일은 수정·삭제하지 않는다. 결과는 `results/` 에 쓴다
- 함수를 바꾸면 `tests/` 에 테스트를 함께 추가한다
- 커밋 메시지는 한국어 한 줄 요약 + 필요하면 본문

## 서브에이전트
- repo-scout: 구조 조사 (읽기 전용, haiku)
- code-reviewer: 변경 검토 (읽기 전용, sonnet) — 고치지 않는다
- experiment-runner: 테스트·예제 실행 (haiku)
- doc-writer: README·결정 기록 갱신 (docs 성격 파일만)

## 결정 기록
- 2026-11: 이상 점수는 z-점수, 기본 k = 3
- 2026-11: 앞 60일을 훈련 구간, 나머지를 시험 구간으로 쓴다
