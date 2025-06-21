import unittest
import sys
import os

# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# Asumsi file ada di root

try:
    from app.services import payout_calculation
    from app import config
except ModuleNotFoundError:
    print("Gagal mengimpor modul aplikasi. Pastikan PYTHONPATH sudah benar atau jalankan tes dari root proyek.")
    print("Contoh: python -m unittest discover")
    sys.exit(1)

class TestPayoutCalculation(unittest.TestCase):

    def test_calculate_daily_payout(self):
        # Menggunakan rate_fee dari config atau mendefinisikan di sini.
        # Fungsi calculate_daily_payout menerima rate_fee sebagai argumen, jadi kita bisa set di sini.
        default_rate_fee = config.RATE_FEE_PER_ACTIVITY # Contoh: 1.5
        minutes_in_day = 1440

        # Skenario 1: R_bar normal, rate_fee standar
        # R_bar = 5 aktivitas/menit
        # Total aktivitas harian = 5 * 1440 = 7200
        # Payout = 7200 * 1.5 = 10800
        self.assertAlmostEqual(payout_calculation.calculate_daily_payout(5.0, default_rate_fee), 10800.0)

        # Skenario 2: R_bar tinggi, rate_fee standar
        # R_bar = 12.5 aktivitas/menit
        # Total aktivitas harian = 12.5 * 1440 = 18000
        # Payout = 18000 * 1.5 = 27000
        self.assertAlmostEqual(payout_calculation.calculate_daily_payout(12.5, default_rate_fee), 27000.0)

        # Skenario 3: R_bar rendah, rate_fee standar
        # R_bar = 0.5 aktivitas/menit
        # Total aktivitas harian = 0.5 * 1440 = 720
        # Payout = 720 * 1.5 = 1080
        self.assertAlmostEqual(payout_calculation.calculate_daily_payout(0.5, default_rate_fee), 1080.0)

        # Skenario 4: R_bar nol
        self.assertAlmostEqual(payout_calculation.calculate_daily_payout(0.0, default_rate_fee), 0.0)

        # Skenario 5: Rate_fee berbeda
        custom_rate_fee = 2.0
        # R_bar = 5 aktivitas/menit
        # Total aktivitas harian = 5 * 1440 = 7200
        # Payout = 7200 * 2.0 = 14400
        self.assertAlmostEqual(payout_calculation.calculate_daily_payout(5.0, custom_rate_fee), 14400.0)

        # Skenario 6: Rate_fee nol
        # R_bar = 10 aktivitas/menit
        # Total aktivitas harian = 10 * 1440 = 14400
        # Payout = 14400 * 0.0 = 0
        self.assertAlmostEqual(payout_calculation.calculate_daily_payout(10.0, 0.0), 0.0)

        # Skenario 7: R_bar dengan desimal
        # R_bar = 3.33 aktivitas/menit
        # Total aktivitas = 3.33 * 1440 = 4795.2
        # Payout = 4795.2 * 1.5 = 7192.8
        self.assertAlmostEqual(payout_calculation.calculate_daily_payout(3.33, default_rate_fee), 7192.8)

if __name__ == '__main__':
    unittest.main()
