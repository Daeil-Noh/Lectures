# 멀티 에이전트 시스템 구축 — 초급부터 고급까지

동의대학교 인공지능학과 · 노대일 교수 · 대학원/연구실 대상 강의 자료 (5회 · 회당 3시간 · 총 15시간)

**강의 웹사이트**: https://daeil-noh.github.io/Lectures/multi-agent/

| 회 | 주제 | 단계 | 실습 |
|---|---|---|---|
| [1회](s01/) | 왜 여러 에이전트인가 — 개념 · 패턴 · 판단 | 초급 | [실습 1](labs/lab01_three_ways.ipynb) 한 번 · 체인 · 병렬 비교 |
| [2회](s02/) | 들여다보고 고쳐 보기 — 도구 루프와 리드 + 워커 | 중급 | [실습 2](labs/lab02_agent_loop.ipynb) 에이전트 루프 · [실습 3](labs/lab03_lead_workers.ipynb) 리드 + 워커 |
| [3회](s03/) | 컨텍스트 · 상태 · 검토 루프, MCP와 프레임워크 | 중급 | [실습 4](labs/lab04_router_reviewer.ipynb) 라우터 + 작성–검토 · [실습 5](labs/lab05_agent_sdk.ipynb) Agent SDK(선택) |
| [4회](s04/) | 코딩 에이전트 여럿 운용하기 — 개발 환경 구축 · Orca | 고급 | [실습 6](labs/lab-repo-template/) 연구실 저장소 템플릿 (로컬 Claude Code) |
| [5회](s05/) | 평가 · 관측 · 안전 · 비용, 미니 프로젝트 발표 | 고급 | [실습 7](labs/lab07_eval_harness.ipynb) 추적 + 평가 하네스 |

## 구조

```
multi-agent/
├─ index.html              강의 목록 · 시간 산정 · 준비물
├─ sNN/index.html          N회 슬라이드 (1280×720, PPT처럼 한 장씩)
├─ sNN/demo.js             N회 '직접 해 보기' 데모
└─ labs/                   Colab 실습(labNN_*.ipynb, 원본 nb_src/*.py), 가상 문헌 data/, 4회용 lab-repo-template/
```
슬라이드 엔진(`../assets/`)과 점검 도구(`../tools/`)는 저장소 최상위에서 모든 강의가 함께 씁니다.

## 슬라이드 조작

`←` `→` 넘기기 · `N` 발표자 노트(장별 예정 시간, 누적 시간, 경과 시간) · `T` 강의 시계 시작/정지 · `O` 슬라이드 목록 · `F` 전체 화면 · 주소 끝 `#12`로 바로 이동 · 브라우저 인쇄(PDF 저장) 시 한 장씩 출력

## 실습 준비

- Colab 실습: Claude API 키를 콘솔에서 발급하고 **사용 한도**를 정한 뒤, Colab 🔑 보안 비밀에 `ANTHROPIC_API_KEY`로 저장
- 4회: 로컬 PC에 git · Node.js · Python 3.10+ · Claude Code · Orca 데스크톱 앱(무료)
- 모델 이름(`claude-sonnet-5-5`, `claude-haiku-5-5` 등) · 가격 · 도구 옵션은 2026년 11월 공식 문서 기준

## 고치고 점검하기

```bash
# (저장소 최상위에서) 실습 파일 다시 만들기
python3 tools/nb.py build multi-agent/labs/nb_src/lab03_lead_workers.py multi-agent/labs/lab03_lead_workers.ipynb
# API 호출 없이 흐름 검사 (가짜 anthropic)
MA_FAKE=1 python3 tools/nb.py check multi-agent/labs/lab03_lead_workers.ipynb
# 슬라이드 점검 (playwright 필요): 넘침·오류 확인 + grid-N.png 스크린샷
node tools/check_lesson.js multi-agent/s03/index.html /tmp/chk-s03
```

## 참고 자료

- Anthropic, *Building effective agents* (2024.12)
- Anthropic Engineering, *How we built our multi-agent research system* (2025.6)
- W. Yan (Cognition), *Don't Build Multi-Agents* (2025.6) · *Multi-Agents: What's Actually Working* (2026.4)
- M. Cemri et al., *Why Do Multi-Agent LLM Systems Fail?*, NeurIPS 2025 (arXiv:2503.13657)
- S. Willison, *The lethal trifecta for AI agents* (2025.6)
- Claude API · Agent SDK · Claude Code 공식 문서
