"""예제 실행: python -m vibelab.run data/sample_vibration.csv"""
import csv
import sys

from .detect import detect_series


def load(path):
    with open(path, newline='', encoding='utf-8') as f:
        return [float(r['rms']) for r in csv.DictReader(f)]


def main(path):
    values = load(path)
    alarms = detect_series(values)
    first = alarms[0] + 1 if alarms else None
    print(f'{len(values)}일 중 경보 {len(alarms)}일, 첫 경보: {first}일째')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'data/sample_vibration.csv')
