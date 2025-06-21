import unittest
import sys
import os

# Menambahkan path ke direktori root proyek agar modul dapat diimpor
# Ini mungkin perlu disesuaikan tergantung struktur direktori dan bagaimana tes dijalankan
# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# Jika file tes berada di direktori yang sama dengan modul yang diuji, ini tidak perlu.
# Karena kita berasumsi semua file ada di root, impor langsung seharusnya bekerja.

try:
    import bot_detection
    import config
except ModuleNotFoundError:
    print("Pastikan bot_detection.py dan config.py berada di PYTHONPATH atau direktori yang sama.")
    sys.exit(1)

class TestBotDetection(unittest.TestCase):

    def test_calculate_rate_per_minute(self):
        # Kasus normal
        self.assertAlmostEqual(bot_detection.calculate_rate_per_minute(10, 5, 3, 2), 9.0) # (10+5+3)/2 = 9
        self.assertAlmostEqual(bot_detection.calculate_rate_per_minute(0, 0, 0, 1), 0.0)
        # Kasus dengan durasi 0 atau negatif (harus menghasilkan 0 untuk menghindari ZeroDivisionError)
        self.assertAlmostEqual(bot_detection.calculate_rate_per_minute(10, 5, 3, 0), 0.0)
        self.assertAlmostEqual(bot_detection.calculate_rate_per_minute(10, 5, 3, -1), 0.0)
        # Kasus dengan float duration
        self.assertAlmostEqual(bot_detection.calculate_rate_per_minute(10, 2, 0, 0.5), 24.0) # 12 / 0.5 = 24

    def test_calculate_average_rate(self):
        self.assertAlmostEqual(bot_detection.calculate_average_rate([10.0, 12.0, 8.0, 10.0]), 10.0)
        self.assertAlmostEqual(bot_detection.calculate_average_rate([5.0]), 5.0)
        self.assertAlmostEqual(bot_detection.calculate_average_rate([]), 0.0) # Rata-rata dari list kosong

    def test_detect_bot_level(self):
        # Menggunakan mu dan sigma dari config atau mendefinisikan di sini untuk isolasi tes
        # Untuk konsistensi, mari gunakan nilai yang mirip dengan yang ada di config
        mu = config.MEAN_NORMAL_ACTIVITY # Contoh: 10.0
        sigma = config.STD_DEV_NORMAL_ACTIVITY # Contoh: 2.0

        # Level C: R_bar <= mu + 2*sigma
        # mu + 2*sigma = 10 + 2*2 = 14
        self.assertEqual(bot_detection.detect_bot_level(5.0, mu, sigma), "C")    # Jauh di bawah
        self.assertEqual(bot_detection.detect_bot_level(10.0, mu, sigma), "C")   # Tepat di mu
        self.assertEqual(bot_detection.detect_bot_level(13.9, mu, sigma), "C")   # Dekat batas atas C
        self.assertEqual(bot_detection.detect_bot_level(14.0, mu, sigma), "C")   # Tepat di batas mu + 2*sigma

        # Level B: mu + 2*sigma < R_bar <= mu + 3*sigma
        # mu + 3*sigma = 10 + 3*2 = 16
        self.assertEqual(bot_detection.detect_bot_level(14.001, mu, sigma), "B") # Sedikit di atas batas C
        self.assertEqual(bot_detection.detect_bot_level(15.0, mu, sigma), "B")
        self.assertEqual(bot_detection.detect_bot_level(16.0, mu, sigma), "B")   # Tepat di batas mu + 3*sigma

        # Level A: R_bar > mu + 3*sigma
        self.assertEqual(bot_detection.detect_bot_level(16.001, mu, sigma), "A") # Sedikit di atas batas B
        self.assertEqual(bot_detection.detect_bot_level(20.0, mu, sigma), "A")   # Jauh di atas

    def test_handle_bot_detection_action(self):
        user_id_test = "test_user_123"
        self.assertIn("diblokir otomatis", bot_detection.handle_bot_detection_action("A", user_id_test))
        self.assertIn(user_id_test, bot_detection.handle_bot_detection_action("A", user_id_test))

        self.assertIn("Peringatan dikirim", bot_detection.handle_bot_detection_action("B", user_id_test))
        self.assertIn("audit manual", bot_detection.handle_bot_detection_action("B", user_id_test))
        self.assertIn(user_id_test, bot_detection.handle_bot_detection_action("B", user_id_test))

        self.assertIn("Aktivitas valid", bot_detection.handle_bot_detection_action("C", user_id_test))
        self.assertIn(user_id_test, bot_detection.handle_bot_detection_action("C", user_id_test))

        self.assertIn("tidak dikenal", bot_detection.handle_bot_detection_action("X", user_id_test))

if __name__ == '__main__':
    unittest.main()
