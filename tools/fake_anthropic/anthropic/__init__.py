"""실습 노트북 검사용 가짜 anthropic 모듈 (실제 API를 부르지 않음).

- messages.create 는 도구가 있으면 tool_use 를 몇 번 돌려준 뒤 끝내고,
  tool_choice 로 도구를 강제하면 input_schema 에 맞는 가짜 입력을 만듭니다.
- 토큰 수는 글자 수로 대충 셉니다. 흐름(루프·병렬·파싱)만 확인하는 용도입니다.
"""
import asyncio, json, random
from types import SimpleNamespace as NS

__version__ = 'fake-0'
_rng = random.Random(0)


class APIError(Exception):
    pass


class RateLimitError(APIError):
    pass


class APIStatusError(APIError):
    pass


def _fake_value(name, sch, depth=0):
    t = sch.get('type')
    if 'enum' in sch:
        return sch['enum'][0]
    if t == 'object':
        return {k: _fake_value(k, v, depth + 1) for k, v in sch.get('properties', {}).items()}
    if t == 'array':
        n = sch.get('minItems', 3)
        return [_fake_value(name + str(i + 1), sch.get('items', {'type': 'string'}), depth + 1) for i in range(max(n, 2) if depth < 2 else 2)]
    if t == 'integer':
        return 3
    if t == 'number':
        return 0.8
    if t == 'boolean':
        return True
    return f'{name} 예시 내용'


def _count(x):
    return max(1, len(json.dumps(x, ensure_ascii=False, default=str)) // 3)


def _tool_results_so_far(messages):
    n = 0
    for m in messages:
        c = m.get('content') if isinstance(m, dict) else None
        if isinstance(c, list):
            for b in c:
                if isinstance(b, dict) and b.get('type') == 'tool_result':
                    n += 1
    return n


def _create(model=None, max_tokens=None, messages=None, system=None, tools=None, tool_choice=None, **kw):
    messages = messages or []
    intok = _count(messages) + _count(system or '') + _count(tools or [])
    forced = tool_choice and tool_choice.get('type') == 'tool'
    if tools and (forced or _tool_results_so_far(messages) < 2):
        if forced:
            tool = next(t for t in tools if t['name'] == tool_choice['name'])
        else:
            tool = tools[_tool_results_so_far(messages) % len(tools)]
        inp = _fake_value(tool['name'], tool.get('input_schema', {}))
        block = NS(type='tool_use', id='toolu_%06d' % _rng.randrange(10**6), name=tool['name'], input=inp)
        return NS(id='msg_fake', model=model, role='assistant', content=[block], stop_reason='tool_use',
                  usage=NS(input_tokens=intok, output_tokens=_count(inp) + 20, cache_read_input_tokens=0, cache_creation_input_tokens=0))
    text = '(가짜 응답) ' + (str(messages[-1].get('content'))[:60] if messages else '')
    return NS(id='msg_fake', model=model, role='assistant', content=[NS(type='text', text=text)], stop_reason='end_turn',
              usage=NS(input_tokens=intok, output_tokens=_count(text), cache_read_input_tokens=0, cache_creation_input_tokens=0))


class _Messages:
    def create(self, **kw):
        return _create(**kw)


class _AsyncMessages:
    async def create(self, **kw):
        await asyncio.sleep(0.01)
        return _create(**kw)


class Anthropic:
    def __init__(self, *a, **k):
        self.messages = _Messages()


class AsyncAnthropic:
    def __init__(self, *a, **k):
        self.messages = _AsyncMessages()
