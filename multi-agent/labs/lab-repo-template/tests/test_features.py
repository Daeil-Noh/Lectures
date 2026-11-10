import os, sys, unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
from vibelab.features import rms, peak


class TestFeatures(unittest.TestCase):
    def test_rms(self):
        self.assertAlmostEqual(rms([3, 4]), (12.5) ** 0.5)

    def test_peak(self):
        self.assertEqual(peak([1, -5, 2]), 5)

    def test_rms_empty(self):
        with self.assertRaises(ValueError):
            rms([])


if __name__ == '__main__':
    unittest.main()
