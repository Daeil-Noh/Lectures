"""PreToolUse(Bash) 훅: 위험한 명령을 막는다.
입력: 표준 입력으로 JSON ({"tool_name": "Bash", "tool_input": {"command": "..."}, ...})
종료 코드 2 = 실행을 막고, stderr 내용을 에이전트에게 이유로 전달한다.
※ 정규식 차단은 얕은 방어다. 권한 규칙·샌드박스와 함께 쓴다(5회)."""
import json
import re
import sys

try:
    data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(0)
cmd = (data.get('tool_input') or {}).get('command', '')

BLOCK = [
    (r'\brm\s+-[a-zA-Z]*[rf]', '재귀·강제 삭제(rm -r/-f)'),
    (r'data/raw', '원본 데이터 폴더(data/raw) 접근'),
    (r'git\s+push\b.*(--force|-f\b)', '강제 푸시'),
    (r'(^|\s)(sudo|chmod\s+777)\b', '관리자 권한·권한 개방'),
]
for pat, why in BLOCK:
    if re.search(pat, cmd):
        print(f'[차단] {why} 은(는) 이 저장소 정책상 허용되지 않습니다. '
              '원본 데이터는 건드리지 말고, 결과는 results/ 에 쓰세요. 꼭 필요하면 사람에게 요청하세요.',
              file=sys.stderr)
        sys.exit(2)
sys.exit(0)
