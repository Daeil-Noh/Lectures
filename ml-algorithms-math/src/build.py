# 수학 포함판 만들기: 원본(ml-algorithms/index.html) + 수학 슬라이드(math_slides.html) → ml-algorithms-math/index.html
# 사용: python3 ml-algorithms-math/src/build.py  (원본을 고친 뒤 다시 실행하면 수학판에도 반영됨)
import os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
import re, sys
src = open(ROOT + '/ml-algorithms/index.html', encoding='utf8').read()
frag = open(HERE + '/math_slides.html', encoding='utf8').read()
s = src

def slide_bounds(s, h2text):
    i = s.index('<h2>' + h2text)
    a = s.rindex('<section', 0, i)
    b = s.index('</section>', i) + len('</section>')
    return a, b

# insert math slides
blocks = re.split(r'<!--@(after|before):(.*?)-->\n', frag)
for k in range(1, len(blocks), 3):
    mode, anchor, html = blocks[k], blocks[k+1], blocks[k+2].strip()
    a, b = slide_bounds(s, anchor)
    if mode == 'after': s = s[:b] + '\n\n' + html + '\n' + s[b:]
    else: s = s[:a] + html + '\n\n' + s[a:]

def rep(old, new, count=1):
    global s
    assert old in s, old[:60]
    s = s.replace(old, new) if count == 0 else s.replace(old, new, count)

rep('<title>머신러닝 알고리즘, 그림으로 이해하기 | 선형회귀부터 앙상블까지</title>',
    '<title>머신러닝 알고리즘, 그림과 수식으로 이해하기 | 선형회귀부터 앙상블까지 (수학 포함판)</title>')
rep('content="수식 대신 그림과 비유로 보는 머신러닝 알고리즘 특강:', 'content="그림으로 직관을 잡고 수식 한 줄로 확인하는 머신러닝 알고리즘 특강(수학 포함판):')
rep('<p class="eyebrow">특강 · 머신러닝 알고리즘</p>', '<p class="eyebrow">특강 · 머신러닝 알고리즘 · 수학 포함판</p>')
rep('<h1>머신러닝 알고리즘,<br>그림으로 이해하기</h1>', '<h1>머신러닝 알고리즘,<br>그림과 수식으로</h1>')
rep('선형회귀부터 앙상블까지 — 수식 대신 그림과 비유로</p>', '선형회귀부터 앙상블까지 — 그림으로 이해하고, 식 한 줄로 확인한다</p>')
rep('<span>약 3시간</span><span>직접 해 보기 9개</span><span>수식은 최소한만</span>', '<span>약 3시간</span><span>직접 해 보기 10개</span><span>수학 슬라이드 15장</span>')
rep('<b>오늘의 약속</b> — 공식을 외우지 않습니다. 대신 각 알고리즘이 <span class="mark">"어떤 생각으로 답을 내는지"</span>를 그림 한 장으로 기억합니다.',
    '<b>오늘의 약속</b> — 그림으로 먼저 이해하고, 그 그림을 <span class="mark">식 한 줄로 다시 씁니다</span>. 식은 외우지 말고 "무엇을 줄이려는 식인지"만 읽습니다.')
rep('<div class="h">9개의 데모</div>', '<div class="h">10개의 데모</div>')
rep('<div class="k">수식</div><div class="h">딱 세 줄</div><div class="d">직선, 여러 요인의 합, S자 곡선. <span class="mathtag">수식 한 줄</span> 표시가 붙은 곳만.</div>',
    '<div class="k">수학</div><div class="h">고등학교 수학이면 충분</div><div class="d">Σ, 지수·로그, 제곱근. 오른쪽 위에 <span class="lv l3">수학</span> 표시가 붙은 장에서 다룹니다.</div>')
rep('<span class="mathtag" style="margin:0">수식 한 줄</span>', '<span class="mathtag" style="margin:0">핵심 식</span>', 0)
rep('<span class="title">머신러닝 알고리즘, 그림으로 이해하기</span>', '<span class="title">머신러닝 알고리즘, 그림과 수식으로 (수학 포함판)</span>')
rep('<span>머신러닝 알고리즘 특강</span>', '<span>머신러닝 알고리즘 특강 · 수학 포함판</span>', 0)
rep('<script src="demo.js"></script>', '<script src="../ml-algorithms/demo.js"></script>\n<script src="math-demo.js"></script>')
rep('<span class="small muted">질문은 daeil.noh@deu.ac.kr</span>', '<a class="btn ghost" href="../ml-algorithms/">그림만 있는 버전</a><span class="small muted">질문은 daeil.noh@deu.ac.kr</span>')

# renumber 직접 해 보기
n = [0]
def ren(m): n[0] += 1; return f'직접 해 보기 {n[0]}</span>'
s = re.sub(r'직접 해 보기 \d+</span>', ren, s)

# extra CSS
css = open(HERE + '/extra.css', encoding='utf8').read()
rep('</style>\n</head>', css + '</style>\n</head>')

# timing: math slides keep their minutes; others scaled so total = 180
secs = re.findall(r'<section class="slide([^"]*)".*?</section>', s, re.S)
parts = re.split(r'(<section class="slide[^"]*".*?</section>)', s, flags=re.S)
math_total = other = brk = 0
for p in parts:
    if not p.startswith('<section'): continue
    m = float(re.search(r'data-min="([\d.]+)"', p).group(1))
    if 'mathslide' in p or 'class="slide lab' in p: math_total += m
    elif 'breakslide' in p: brk += m
    else: other += m
f = (180 - brk - math_total) / other
out = []
for p in parts:
    if p.startswith('<section') and not ('mathslide' in p or 'class="slide lab' in p or 'breakslide' in p):
        m = float(re.search(r'data-min="([\d.]+)"', p).group(1))
        nm = max(0.5, round(m * f * 2) / 2)
        p = re.sub(r'data-min="[\d.]+"', f'data-min="{nm:g}"', p, count=1)
    out.append(p)
s = ''.join(out)
# Korean words inside formulas: upright sans
from html.parser import HTMLParser
VOID={'br','img','input','meta','link','hr','source','wbr'}
class W(HTMLParser):
    def __init__(s2): super().__init__(convert_charrefs=False); s2.out=[]; s2.st=[]
    def handle_starttag(s2, tag, attrs):
        s2.out.append(s2.get_starttag_text())
        if tag not in VOID: s2.st.append(('mx' in (dict(attrs).get('class') or '').split()) or (bool(s2.st) and s2.st[-1]))
    def handle_startendtag(s2, tag, attrs): s2.out.append(s2.get_starttag_text())
    def handle_endtag(s2, tag):
        s2.out.append('</%s>' % tag)
        if tag not in VOID and s2.st: s2.st.pop()
    def handle_data(s2, d):
        if s2.st and s2.st[-1] and re.search('[가-힣]', d): d = re.sub(r'([가-힣][가-힣 ]*[가-힣]|[가-힣])', r'<span class="ko">\1</span>', d)
        s2.out.append(d)
    def handle_entityref(s2, n): s2.out.append('&%s;' % n)
    def handle_charref(s2, n): s2.out.append('&#%s;' % n)
    def handle_comment(s2, d): s2.out.append('<!--%s-->' % d)
    def handle_decl(s2, d): s2.out.append('<!%s>' % d)
w=W(); w.feed(s); w.close(); s=''.join(w.out)
# trim to 180 min: shave 0.5 from the longest non-math slides
def total(s): return sum(float(x) for x in re.findall(r'data-min="([\d.]+)"', s))
while total(s) > 180:
    cand = [(float(m.group(1)), m.start()) for m in re.finditer(r'data-min="([\d.]+)"', s)]
    cand = [c for c in cand if c[0] < 9 and 'mathslide' not in s[s.rindex('<section',0,c[1]):c[1]] and 'slide lab' not in s[s.rindex('<section',0,c[1]):c[1]]]
    v,pos = max(cand)
    s = s[:pos] + f'data-min="{v-0.5:g}"' + s[s.index('"', pos+10)+1:]
tot = sum(float(x) for x in re.findall(r'data-min="([\d.]+)"', s))
open(ROOT + '/ml-algorithms-math/index.html', 'w', encoding='utf8').write(s)
print('slides', len(re.findall(r'<section class="slide', s)), 'math', s.count('mathslide"') , 'demos', n[0], 'scale %.2f' % f, 'total', tot)
