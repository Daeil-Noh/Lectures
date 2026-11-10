"""가상 문헌 MCP 서버 (3회 슬라이드의 예제). 실행: python tools/papers_server.py
필요: pip install mcp   (공식 Python SDK)"""
import json
import os

from mcp.server.fastmcp import FastMCP

HERE = os.path.dirname(os.path.abspath(__file__))
PAPERS = json.load(open(os.path.join(HERE, '..', 'data', 'papers.json'), encoding='utf-8'))['papers']
mcp = FastMCP('lab-papers')


@mcp.tool()
def search_papers(query: str) -> list[dict]:
    """연구실 가상 논문 12편에서 키워드로 찾아 id·제목·연도·분야를 최대 5편 돌려준다. 내용은 read_paper 로 읽는다."""
    words = query.split()
    scored = sorted(((sum((p['title'] + p['abstract']).count(w) for w in words), p) for p in PAPERS), key=lambda x: -x[0])
    return [{'id': p['id'], 'title': p['title'], 'year': p['year'], 'area': p['area']} for s, p in scored if s][:5]


@mcp.tool()
def read_paper(paper_id: str) -> dict:
    """논문 id(예: P07)로 초록 전체를 읽는다. 없는 id면 있는 범위를 알려 준다."""
    for p in PAPERS:
        if p['id'] == paper_id.strip().upper():
            return p
    return {'error': f'{paper_id} 없음. 있는 id: P01~P12'}


if __name__ == '__main__':
    mcp.run()
