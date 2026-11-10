# %% [markdown]
# # 실습 5 (선택) · 리드 + 워커를 Claude Agent SDK로 옮기기
# **멀티 에이전트 시스템 구축 · 3회** — 노대일 (동의대학교 인공지능학과)
#
# 실습 3에서 직접 짠 리드 + 워커 시스템을 **Claude Agent SDK** 로 다시 만듭니다.
# - 가상 문헌 도구 → SDK 안에서 도는 **MCP 서버** (`@tool`, `create_sdk_mcp_server`)
# - 워커 → **서브에이전트** 정의 (`AgentDefinition`)
# - 루프 · 도구 실행 · 서브에이전트 띄우기 → SDK가 담당
#
# ⚠️ Agent SDK는 Claude Code 실행 파일을 함께 사용합니다. Colab에서 설치가 막히면 자기 PC(로컬)에서 실행하세요.
# SDK는 빠르게 바뀌므로 오류가 나면 설치된 버전의 공식 문서(platform.claude.com → Agent SDK)를 확인하세요. (2026.11 기준 작성)

# %%
!pip -q install claude-agent-sdk anthropic

# %%
# Claude Code 실행 파일 확인 (없으면 설치 시도 — Colab에는 Node.js 가 있음)
import shutil, subprocess
if shutil.which('claude'):
    print(subprocess.run(['claude', '--version'], capture_output=True, text=True).stdout)
else:
    print('claude 실행 파일이 없습니다. 다음 셀에서 설치를 시도합니다.')

# %%
!which claude || npm install -g @anthropic-ai/claude-code

# %%
import os, json, urllib.request
try:
    from google.colab import userdata
    os.environ['ANTHROPIC_API_KEY'] = userdata.get('ANTHROPIC_API_KEY')
except ImportError:
    pass

DATA = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/multi-agent/labs/data/'
with urllib.request.urlopen(DATA + 'papers.json') as f:
    PAPERS = {p['id']: p for p in json.load(f)['papers']}

# %% [markdown]
# ## 1. 도구를 SDK MCP 서버로
# 도구 함수는 `async` 이고, 결과를 `{'content': [{'type': 'text', 'text': ...}]}` 모양으로 돌려줍니다.

# %%
from claude_agent_sdk import (ClaudeSDKClient, ClaudeAgentOptions, AgentDefinition,
                              tool, create_sdk_mcp_server, AssistantMessage, ResultMessage,
                              TextBlock, ToolUseBlock)

@tool('search_papers', '연구실 문헌 모음(가상 논문 12편)에서 키워드로 찾아 최대 5편의 id·제목·연도·분야를 돌려준다. 내용은 read_paper 로 읽는다.', {'query': str})
async def search_papers(args):
    words = args['query'].split()
    scored = sorted(((sum((p['title'] + p['abstract']).count(w) for w in words), p) for p in PAPERS.values()), key=lambda x: -x[0])
    hits = [{'id': p['id'], 'title': p['title'], 'year': p['year'], 'area': p['area']} for s, p in scored if s][:5]
    return {'content': [{'type': 'text', 'text': json.dumps(hits or '검색 결과 없음', ensure_ascii=False)}]}

@tool('read_paper', '논문 id(예: P07)로 초록 전체를 읽는다.', {'paper_id': str})
async def read_paper(args):
    p = PAPERS.get(args['paper_id'].strip().upper())
    if not p:
        return {'content': [{'type': 'text', 'text': f"{args['paper_id']} 없음. 있는 id: P01~P12"}], 'is_error': True}
    return {'content': [{'type': 'text', 'text': json.dumps(p, ensure_ascii=False)}]}

papers_server = create_sdk_mcp_server(name='papers', version='1.0.0', tools=[search_papers, read_paper])
PAPER_TOOLS = ['mcp__papers__search_papers', 'mcp__papers__read_paper']   # mcp__<서버>__<도구>

# %% [markdown]
# ## 2. 서브에이전트와 리드 설정
# - `description` 은 리드가 **언제 이 서브에이전트를 쓸지** 판단하는 근거입니다.
# - 리드가 서브에이전트를 부르려면 `Agent` 도구가 허용되어 있어야 합니다.
# - 리드에게는 문헌 도구를 주지 않습니다(직접 조사 금지) — 실습 3과 같은 설계.

# %%
WORKER_PROMPT = ('너는 문헌 조사 워커다. 맡은 범위 안에서만 조사한다. search_papers 로 찾고, 쓸 내용은 read_paper 로 읽고 확인한다. '
                 '모든 주장 끝에 [P07]처럼 id를 단다. 찾지 못한 것도 보고한다. 400자 이내.')
LEAD_PROMPT = ('너는 연구 조사 리드다. 직접 검색하지 말고 paper-scout 서브에이전트에게 맡긴다. 비교 질문은 계열별로 2~3개를 동시에 맡긴다. '
               '각 서브에이전트에게 목표·출력 형식·하지 말 것을 분명히 쓴다. 보고를 종합할 때 [P..] id를 유지하고 서로 다른 내용은 드러낸다. 한국어로 쓴다.')

options = ClaudeAgentOptions(
    system_prompt=LEAD_PROMPT,
    model='claude-sonnet-5-5',
    mcp_servers={'papers': papers_server},
    allowed_tools=['Agent'] + PAPER_TOOLS,
    disallowed_tools=['Bash', 'Write', 'Edit', 'WebSearch', 'WebFetch'],   # 이 실습에 필요 없는 내장 도구는 막는다
    agents={
        'paper-scout': AgentDefinition(
            description='가상 연구실 문헌에서 특정 계열·주제의 방법을 조사해 출처 id와 함께 보고할 때 쓴다.',
            prompt=WORKER_PROMPT,
            tools=PAPER_TOOLS,
            model='haiku'),
    },
    max_turns=20,
)

# %% [markdown]
# ## 3. 실행
# 메시지가 오는 대로 출력합니다. 누가 어떤 도구를 불렀는지 보세요.

# %%
QUESTION = ('설비 예지보전에 쓸 수 있는 방법들을 고전 머신러닝 · 딥러닝 · 양자 머신러닝 계열로 나누어 비교하는 표를 만들어 줘. '
            '표의 열: 방법, 필요한 데이터 양, 장점, 한계, 근거 논문. 모든 주장에 논문 id를 달아.')

final_text, result = '', None
async with ClaudeSDKClient(options=options) as sdk:
    await sdk.query(QUESTION)
    async for msg in sdk.receive_response():
        if isinstance(msg, AssistantMessage):
            for b in msg.content:
                if isinstance(b, ToolUseBlock):
                    print(f'  도구 요청: {b.name} {str(b.input)[:90]}')
                elif isinstance(b, TextBlock):
                    final_text = b.text
        elif isinstance(msg, ResultMessage):
            result = msg
print('\n' + '=' * 60 + '\n' + final_text)

# %%
if result is not None:
    print('턴 수:', result.num_turns, '| 비용(USD):', result.total_cost_usd, '| 시간(ms):', result.duration_ms)

# %% [markdown]
# ## 4. 실습 3과 비교해 기록하기
# | 항목 | 실습 3 (직접 짠 코드) | 실습 5 (Agent SDK) |
# |---|---|---|
# | 코드 줄 수 | | |
# | 비용 · 시간 | | |
# | 워커 수 (누가 정했나) | | |
# | 워커 내부 호출이 보이나 | | |
# | 인용 검사를 붙이기 쉬운가 | | |
#
# **직접 바꿔 보기**: `description` 을 '도우미' 처럼 모호하게 바꾸면 리드가 서브에이전트를 덜 쓰는지 확인해 보세요.
#
# **AI에게 물어볼 만한 질문**: "Claude Agent SDK에서 서브에이전트의 도구 호출을 모두 기록하려면 hooks 를 어떻게 쓰면 되는지 설치된 버전 기준으로 알려 줘."
