#!/usr/bin/env bash
# 현재 브랜치와 main 의 차이를 헤드리스 Claude Code 로 검토해 review.md 에 저장한다.
# 읽기 전용 도구만 허용하고, 반복 횟수를 제한한다.
set -euo pipefail
BASE=${1:-main}
DIFF=$(git diff "$BASE"...HEAD)
if [ -z "$DIFF" ]; then echo "차이가 없습니다 ($BASE...HEAD)"; exit 0; fi
OUT=$(claude -p "$(cat .claude/review_prompt.md)
$DIFF" \
  --allowedTools "Read,Grep,Glob" \
  --max-turns 8 \
  --output-format json)
if command -v jq >/dev/null 2>&1; then
  echo "$OUT" | jq -r '.result' > review.md
  echo "$OUT" | jq '{cost_usd: .total_cost_usd, turns: .num_turns}'
else
  echo "$OUT" | python3 -c 'import json,sys; d=json.load(sys.stdin); open("review.md","w").write(d.get("result","")); print({"cost_usd": d.get("total_cost_usd"), "turns": d.get("num_turns")})'
fi
echo "review.md 에 저장했습니다."
