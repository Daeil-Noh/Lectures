# %% [markdown]
# # 13주 3차시 · 생성형AI의 원리
#
# **학습 목표**
# - 아주 작은 “언어 모델”을 직접 만들어, 생성형AI가 **다음 단어를 확률로 고른다**는 것을 확인한다.
# - 온도(temperature)를 바꾸며 답이 왜 매번 달라지는지 본다.
# - 모델이 학습 글에 **없던 문장**을 그럴듯하게 만들어 내는 모습(환각의 씨앗)을 확인한다.
#
# **사용 데이터**: 이 노트북 안에 적은 **가상 설비 점검 일지 문장 40개**
#
# 실제 생성형AI는 이보다 훨씬 많은 글과 훨씬 큰 신경망을 쓰지만, “앞의 글을 보고 다음 토큰을 확률로 고른다”는 원리는 같습니다.
# 이 실습 모델은 단순화를 위해 **바로 앞 단어 하나**만 보고, 토큰 대신 **띄어쓰기 단위 단어**를 씁니다.

# %%
!pip -q install koreanize-matplotlib
import koreanize_matplotlib

import numpy as np
import matplotlib.pyplot as plt
from collections import Counter, defaultdict

# %% [markdown]
# ## 1. 학습할 글 (가상 점검 일지)

# %%
corpus = '''
3호기 진동이 평소보다 커졌다 .
3호기 진동이 갑자기 커졌다 .
3호기 진동이 조금씩 커졌다 .
3호기 온도가 평소보다 높다 .
3호기 베어링을 교체했다 .
3호기 베어링을 점검했다 .
3호기 전류가 평소보다 높다 .
5호기 진동이 평소보다 커졌다 .
5호기 온도가 갑자기 올라갔다 .
5호기 온도가 평소보다 높다 .
5호기 전류가 조금씩 늘었다 .
5호기 소음이 갑자기 커졌다 .
2호기 진동이 정상이다 .
2호기 온도가 정상이다 .
2호기 전류가 정상이다 .
1호기 진동이 정상이다 .
1호기 압력이 평소보다 낮다 .
1호기 압력이 조금씩 낮아졌다 .
4호기 소음이 평소보다 커졌다 .
4호기 냉각수를 보충했다 .
6호기 온도가 조금씩 올라갔다 .
6호기 필터를 교체했다 .
진동이 커지면 베어링을 점검한다 .
진동이 커지면 정비 일정을 잡는다 .
온도가 높으면 냉각수를 점검한다 .
온도가 높으면 필터를 점검한다 .
전류가 늘면 모터를 점검한다 .
소음이 커지면 베어링을 점검한다 .
압력이 낮으면 배관을 점검한다 .
베어링을 교체하면 진동이 줄었다 .
필터를 교체하면 온도가 낮아졌다 .
냉각수를 보충하면 온도가 낮아졌다 .
정비 후 진동이 정상이다 .
정비 후 온도가 정상이다 .
정비 후 소음이 줄었다 .
오늘 3호기 정비 일정을 잡았다 .
오늘 5호기 필터를 교체했다 .
오늘 1호기 배관을 점검했다 .
다음 주 3호기 베어링을 교체한다 .
다음 주 5호기 모터를 점검한다 .
'''
sentences = [s.strip() for s in corpus.strip().split('\n')]
print('문장 수:', len(sentences))
print('예:', sentences[0])

# %% [markdown]
# ## 2. “다음 단어” 세기 = 학습
# 모든 문장에서 **(앞 단어 → 다음 단어)** 쌍을 셉니다. 많이 나온 쌍일수록 확률이 높습니다.
# 문장 시작은 `<시작>` 이라는 가짜 단어로 표시합니다.

# %%
counts = defaultdict(Counter)              # counts['진동이']['평소보다'] = 나온 횟수
for s in sentences:
    words = ['<시작>'] + s.split()
    for a, b in zip(words[:-1], words[1:]):
        counts[a][b] += 1

def next_word_probs(word):
    c = counts[word]
    total = sum(c.values())
    return {w: n / total for w, n in c.most_common()}

print('진동이 →', {w: round(p, 2) for w, p in next_word_probs('진동이').items()})

# %%
# 확률을 막대그래프로 보기
probs = next_word_probs('진동이')
plt.figure(figsize=(6, 3))
plt.bar(list(probs.keys()), list(probs.values()))
plt.title("'진동이' 다음에 올 단어의 확률")
plt.ylabel('확률')
plt.show()

# %% [markdown]
# ## 3. 문장 만들기: 확률대로 뽑고, 이어 붙이고, 반복
# **온도(temperature)**: 확률을 얼마나 고르게 펼칠지 정하는 값
# - 낮으면(0.1) 가장 높은 단어만 거의 매번 → 답이 늘 비슷
# - 높으면(2.0) 낮은 확률의 단어도 자주 → 답이 다양하지만 엉뚱해질 수 있음

# %%
rng = np.random.default_rng(13)            # 고정 난수: 누가 실행해도 같은 결과

def generate(start='<시작>', temperature=1.0, max_words=10):
    word, out = start, ([] if start == '<시작>' else [start])
    for _ in range(max_words):
        p = next_word_probs(word)
        if not p:
            break
        words = list(p.keys())
        w = np.array(list(p.values())) ** (1 / temperature)   # 온도로 확률 모양 바꾸기
        word = rng.choice(words, p=w / w.sum())                  # 확률대로 뽑기
        out.append(word)
        if word == '.':
            break
    return ' '.join(out)

for t in [0.1, 1.0, 2.0]:
    print(f'--- 온도 {t}')
    for _ in range(4):
        print(' ', generate(start='진동이', temperature=t))

# %% [markdown]
# ## 4. 그럴듯하지만 학습 글에 없던 문장 (환각의 씨앗)
# 모델은 단어 쌍만 기억하므로, 쌍들을 이어 붙여 **원래 없던 문장**을 만들 수 있습니다.
# 문법은 그럴듯하지만 **사실인지는 아무도 확인하지 않았습니다.**

# %%
made = [generate(temperature=1.0) for _ in range(20)]
new = [s for s in made if s not in sentences]
print(f'만든 문장 20개 중 학습 글에 없던 문장: {len(new)}개')
for s in new[:6]:
    print('  ', s)

# %% [markdown]
# 예를 들어 “1호기 압력이 평소보다 커졌다 .” 같은 문장은 점검 일지에 **없는 사실**입니다. (실행할 때마다 다른 문장이 나올 수 있습니다)
# 큰 생성형AI도 같은 이유로, 학습한 글의 패턴을 이어 붙여 **그럴듯한 거짓**(환각)을 만들 수 있습니다 → 4주 3차시: 결과 검증

# %% [markdown]
# ### 직접 바꿔 보기 ①: 온도와 시작 단어
# `temperature` 와 `start` 를 바꿔 보세요. 시작 단어는 학습 글에 있는 단어여야 합니다 (예: '5호기', '온도가', '정비').

# %% [exercise]
temperature = 0.5        # ← 0.1, 1.0, 3.0 으로 바꿔 보기
start = '3호기'          # ← '5호기', '온도가', '정비' 로 바꿔 보기

for _ in range(5):
    print(generate(start=start, temperature=temperature))

# %% [markdown]
# ### 직접 바꿔 보기 ②: 학습 글을 바꾸면 모델이 바뀐다
# 아래에 문장을 추가하고 실행하면, 그 문장이 모델의 “지식”이 됩니다. 잘못된 문장을 넣으면? (데이터 품질 = 모델 품질, 1주 1차시)

# %% [exercise]
extra = [
    '3호기 진동이 평소보다 줄었다 .',      # ← 문장을 바꾸거나 더 추가해 보기 (단어 사이 띄어쓰기, 끝에 ' .')
]
for s in extra:
    words = ['<시작>'] + s.split()
    for a, b in zip(words[:-1], words[1:]):
        counts[a][b] += 1

print('진동이 →', {w: round(p, 2) for w, p in next_word_probs('진동이').items()})
print('평소보다 →', {w: round(p, 2) for w, p in next_word_probs('평소보다').items()})

# %% [markdown]
# ## 정리
# 1. 언어 모델은 **앞의 글을 보고 다음 단어(토큰)의 확률**을 계산하고, 그중 하나를 뽑아 이어 붙이기를 반복한다.
# 2. **온도**가 높을수록 답이 다양해지고, 낮을수록 일정해진다. 그래서 같은 질문에도 답이 달라진다.
# 3. 모델은 “사실”이 아니라 “그럴듯한 다음 단어”를 고른다 → 학습 글에 없던 내용도 자신 있게 만든다. **검증은 사람의 몫.**
#
# **생성형AI에게 물어볼 만한 질문**
# - “이 노트북의 generate 함수에서 temperature가 확률을 어떻게 바꾸는지, 숫자 예시로 설명해 줘.”
# - “바로 앞 단어 하나가 아니라 앞 단어 두 개를 보게 바꾸려면 counts를 어떻게 고치면 돼?” → 받은 코드를 실행해 결과를 확인하세요.
