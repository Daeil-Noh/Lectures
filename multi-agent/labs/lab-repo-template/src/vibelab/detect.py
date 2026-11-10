"""z-점수 기반 이상탐지."""
import statistics


def fit(train):
    """훈련 구간의 평균과 표준편차."""
    return statistics.fmean(train), statistics.pstdev(train)


def zscores(xs, mean, std):
    return [(x - mean) / std if std else 0.0 for x in xs]


def detect_series(values, n_train=60, k=3.0):
    """앞 n_train 개를 훈련 구간으로 보고, 나머지 구간에서 |z| > k 인 위치(전체 기준 인덱스)를 돌려준다."""
    mean, std = fit(values)
    test = values[n_train:]
    return [n_train + i for i, z in enumerate(zscores(test, mean, std)) if abs(z) > k]
