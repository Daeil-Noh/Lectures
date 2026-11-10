# vibelab

설비 진동(RMS) 일별 기록에서 고장 징후를 찾는 간단한 z-점수 이상탐지 예제입니다.
「멀티 에이전트 시스템 구축」 4회 실습용이며, 데이터는 모두 가상입니다.

```bash
export PYTHONPATH=src
python -m unittest -v
python -m vibelab.run data/sample_vibration.csv
```

## 실습 6 안내 (멀티 에이전트 시스템 구축 4회)

이 폴더를 통째로 복사해 새 git 저장소로 시작합니다.

```bash
cp -r Lectures/multi-agent/labs/lab-repo-template ~/vibelab
cd ~/vibelab && git init && git add -A && git commit -m "start"
export PYTHONPATH=src && python -m unittest
claude
```

| 파일 | 역할 |
|---|---|
| `CLAUDE.md` | 명령 · 규칙 · 결정 기록 (세션마다 자동으로 읽힘) |
| `.claude/agents/*.md` | 서브에이전트 4명: repo-scout, code-reviewer, experiment-runner, doc-writer |
| `.claude/settings.json` | 권한 규칙(허용 · 질문 · 거부)과 훅 연결 |
| `.claude/hooks/guard_bash.py` | 위험한 셸 명령 차단 (PreToolUse) |
| `.claude/hooks/run_tests.py` | 파이썬 파일 수정 뒤 테스트 실행 (PostToolUse) |
| `.mcp.json`, `tools/papers_server.py` | 가상 문헌 MCP 서버 (`pip install mcp` 필요) |
| `scripts/review_diff.sh` | 헤드리스 `claude -p` 자동 리뷰 |

코드에는 리뷰어가 찾아낼 만한 문제가 **일부러** 들어 있습니다. 훅 스크립트는 macOS · Linux(또는 WSL) 기준입니다.
