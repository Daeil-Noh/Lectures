import os, sys, unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
from vibelab.detect import fit, detect_series


class TestDetect(unittest.TestCase):
    def test_fit(self):
        m, s = fit([1, 1, 1, 1])
        self.assertEqual((m, s), (1, 0))

    def test_detect_finds_spike(self):
        values = [1.0, 1.1, 0.9, 1.0] * 15 + [1.0, 1.05, 9.0, 1.0]
        self.assertIn(62, detect_series(values, n_train=60, k=3))


if __name__ == '__main__':
    unittest.main()
