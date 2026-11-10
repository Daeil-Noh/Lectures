"""Colab 실습 파일(.ipynb) 만들기·검사 도구 (외부 패키지 없이 동작)

만들기:  python3 tools/nb.py build  원본.py  결과.ipynb
검사:    python3 tools/nb.py check  결과.ipynb      (코드 셀을 순서대로 실행해 오류가 없는지 확인)

원본.py 작성 규칙
  # %% [markdown]     ← 이 아래 주석(# 로 시작하는 줄)은 마크다운 셀이 됩니다. 각 줄의 '# '를 떼어 냅니다.
  # %%                ← 이 아래는 코드 셀입니다.
  # %% [exercise]     ← 학생이 채워 넣는 코드 셀(검사 때도 그대로 실행되므로 실행 가능한 상태로 두세요).

검사할 때 다음은 자동 처리됩니다.
  · '!' 또는 '%' 로 시작하는 줄(예: !pip install ...)은 건너뜁니다.
  · https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/... 주소는 이 저장소의 로컬 파일로 바꿔 읽습니다.
  · import koreanize_matplotlib 은 없어도 오류가 나지 않게 처리합니다.
  · 그래프는 화면에 띄우지 않고(Agg) 실행만 확인합니다.
"""
import json, sys, os, re, io, contextlib, traceback

RAW = 'https://raw.githubusercontent.com/Daeil-Noh/Lectures/main/ax-microdegree/'
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def parse(src):
    cells, kind, buf = [], None, []

    def flush():
        if kind is None:
            return
        text = '\n'.join(buf).strip('\n')
        if not text.strip():
            return
        if kind == 'markdown':
            lines = [re.sub(r'^# ?', '', l) if l.startswith('#') else l for l in text.split('\n')]
            cells.append({'cell_type': 'markdown', 'metadata': {}, 'source': '\n'.join(lines)})
        else:
            cells.append({'cell_type': 'code', 'metadata': {}, 'execution_count': None, 'outputs': [], 'source': text})

    for line in src.split('\n'):
        m = re.match(r'^# %%\s*(\[(markdown|exercise)\])?\s*$', line)
        if m:
            flush()
            kind, buf = ('markdown' if m.group(2) == 'markdown' else 'code'), []
        else:
            buf.append(line)
    flush()
    return cells


def build(src_path, out_path):
    cells = parse(open(src_path, encoding='utf-8').read())
    for c in cells:  # ipynb 형식: source 는 줄 목록
        s = c['source']
        c['source'] = [l + '\n' for l in s.split('\n')[:-1]] + [s.split('\n')[-1]]
    nb = {'cells': cells, 'metadata': {'kernelspec': {'display_name': 'Python 3', 'language': 'python', 'name': 'python3'},
                                        'language_info': {'name': 'python'}, 'colab': {'provenance': []}},
          'nbformat': 4, 'nbformat_minor': 5}
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, ensure_ascii=False, indent=1)
    print(f'built {out_path}: {len(cells)} cells')


def check(nb_path):
    import matplotlib
    matplotlib.use('Agg')
    import builtins
    real_import = builtins.__import__

    def fake_import(name, *a, **k):
        if name == 'koreanize_matplotlib':
            import types
            return types.ModuleType('koreanize_matplotlib')
        return real_import(name, *a, **k)

    builtins.__import__ = fake_import
    try:
        import pandas as pd
        real_read_csv = pd.read_csv

        def local_read_csv(p, *a, **k):
            if isinstance(p, str) and p.startswith(RAW):
                p = os.path.join(ROOT, p[len(RAW):])
            return real_read_csv(p, *a, **k)

        pd.read_csv = local_read_csv
    except ImportError:
        pass
    nb = json.load(open(nb_path, encoding='utf-8'))
    g = {'__name__': '__main__'}
    n_code = 0
    for i, c in enumerate(nb['cells']):
        if c['cell_type'] != 'code':
            continue
        n_code += 1
        src = ''.join(c['source'])
        src = '\n'.join(l for l in src.split('\n') if not l.lstrip().startswith(('!', '%')))
        out = io.StringIO()
        try:
            with contextlib.redirect_stdout(out):
                exec(compile(src, f'cell{i}', 'exec'), g)
        except Exception:
            print(f'FAIL in cell {i}:\n{src}\n---')
            traceback.print_exc()
            sys.exit(1)
        finally:
            import matplotlib.pyplot as plt
            plt.close('all')
    print(f'OK {nb_path}: {n_code} code cells ran without error')


if __name__ == '__main__':
    if len(sys.argv) >= 4 and sys.argv[1] == 'build':
        build(sys.argv[2], sys.argv[3])
    elif len(sys.argv) >= 3 and sys.argv[1] == 'check':
        check(sys.argv[2])
    else:
        print(__doc__)
