"""PostToolUse(Edit|Write) 훅: 파이썬 파일을 고친 뒤 테스트를 돌려 실패하면 에이전트에게 알린다.
종료 코드 2 = stderr 내용을 에이전트에게 피드백으로 보여 준다(이미 실행된 수정은 되돌리지 않음)."""
import json
import subprocess
import sys

try:
    data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(0)
path = (data.get('tool_input') or {}).get('file_path', '')
if not path.endswith('.py'):
    sys.exit(0)
r = subprocess.run([sys.executable, '-m', 'unittest', '-q'], capture_output=True, text=True,
                   env={'PYTHONPATH': 'src', 'PATH': '/usr/bin:/bin'}, timeout=120)
if r.returncode != 0:
    tail = '\n'.join((r.stderr or r.stdout).strip().splitlines()[-15:])
    print(f'[테스트 실패] {path} 수정 후 python -m unittest 가 실패했습니다:\n{tail}', file=sys.stderr)
    sys.exit(2)
sys.exit(0)
