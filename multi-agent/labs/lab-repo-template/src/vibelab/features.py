"""진동 신호 특징."""
import math


def rms(xs):
    """제곱 평균 제곱근."""
    if not xs:
        raise ValueError('빈 입력')
    return math.sqrt(sum(x * x for x in xs) / len(xs))


def peak(xs):
    """절댓값 최대."""
    return max(abs(x) for x in xs)


def rolling_windows(xs, w):
    """길이 w 인 이동 창들을 돌려준다. 예: [1,2,3], w=2 → [[1,2],[2,3]]"""
    if w <= 0:
        raise ValueError('w 는 1 이상')
    return [xs[i:i + w] for i in range(len(xs) - w)]
