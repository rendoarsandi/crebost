import unittest
import sys

# Asumsi file ada di root dan config.py juga dapat dijangkau
try:
    from app.services import finance_processing
    from app import config
except ModuleNotFoundError:
    print("Gagal mengimpor modul aplikasi. Pastikan PYTHONPATH sudah benar atau jalankan tes dari root proyek.")
    # Jika ingin menjalankan tes ini secara terpisah dan modul tidak ditemukan,
    # Anda mungkin perlu menyesuaikan sys.path seperti contoh di file tes lain.
    # sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    sys.exit(1)

class TestFinanceProcessing(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Pastikan konstanta yang diperlukan ada di config.py
        # Jika tidak, tes mungkin gagal karena NameError atau AttributeError saat fungsi diuji memanggil config
        # Ini adalah tempat yang baik untuk memverifikasi atau mock config jika diperlukan untuk tes,
        # tapi karena config.py sudah diupdate, kita asumsikan itu benar.
        if not all(hasattr(config, attr) for attr in [
            'PROMOTER_WITHDRAWAL_PPH_RATE',
            'PROMOTER_PLATFORM_FEE_RATE',
            'CREATOR_PLATFORM_FEE_RATE_ON_ADVERTISER_BUDGET'
        ]):
            print("PERINGATAN TES: Tidak semua konstanta finansial yang dibutuhkan ditemukan di config.py.")
            print("Tes mungkin gagal atau menggunakan nilai fallback dari MockConfig jika ada.")
            # Buat MockConfig jika konstanta tidak ada untuk memungkinkan tes berjalan
            class MockConfig:
                PROMOTER_WITHDRAWAL_PPH_RATE = 0.02
                PROMOTER_PLATFORM_FEE_RATE = 0.10
                CREATOR_PLATFORM_FEE_RATE_ON_ADVERTISER_BUDGET = 0.10
            config_backup = config # Simpan config asli jika ada
            finance_processing.config = MockConfig() # Ganti config di modul finance_processing
            cls.config_was_mocked = True
            cls.original_config = config_backup
        else:
            cls.config_was_mocked = False


    @classmethod
    def tearDownClass(cls):
        # Kembalikan config asli jika di-mock
        if cls.config_was_mocked:
            finance_processing.config = cls.original_config
            print("\nMockConfig dikembalikan ke config asli di finance_processing.")


    def test_process_promoter_withdrawal(self):
        # Skenario 1: Withdrawal normal
        result1 = finance_processing.process_promoter_withdrawal("promo001", 100000.0)
        self.assertIsNone(result1.get("error"))
        self.assertEqual(result1["user_id"], "promo001")
        self.assertEqual(result1["gross_amount"], 100000.0)
        self.assertEqual(result1["platform_fee"], 10000.0) # 10% of 100k
        self.assertEqual(result1["tax_deducted"], 2000.0)   # 2% of 100k
        self.assertEqual(result1["net_payout"], 88000.0)    # 100k - 10k - 2k

        # Skenario 2: Withdrawal nol
        result2 = finance_processing.process_promoter_withdrawal("promo002", 0.0)
        self.assertIsNone(result2.get("error"))
        self.assertEqual(result2["gross_amount"], 0.0)
        self.assertEqual(result2["platform_fee"], 0.0)
        self.assertEqual(result2["tax_deducted"], 0.0)
        self.assertEqual(result2["net_payout"], 0.0)

        # Skenario 3: Withdrawal negatif
        result3 = finance_processing.process_promoter_withdrawal("promo003", -50000.0)
        self.assertIsNotNone(result3.get("error"))
        self.assertIn("negatif", result3["error"].lower())
        self.assertEqual(result3["net_payout"], 0.0) # Pastikan payout tidak dihitung

        # Skenario 4: Pembulatan (jika ada angka desimal kecil)
        # Misal, tarif PPh 0.025 (2.5%)
        # Jika config di-mock, kita bisa ubah sementara untuk tes ini
        if self.config_was_mocked: # Hanya jika kita mengontrol config
            finance_processing.config.PROMOTER_WITHDRAWAL_PPH_RATE = 0.025

        # Untuk pengujian pembulatan, kita asumsikan tarif PPh bisa menghasilkan banyak desimal
        # gross = 123.45, fee_rate = 0.1, pph_rate = 0.02 (default)
        # fee = 12.345 -> 12.35
        # pph = 2.469 -> 2.47
        # net = 123.45 - 12.345 - 2.469 = 108.636 -> 108.64
        # Karena pembulatan dilakukan pada setiap komponen, kita cek hasil akhirnya
        result4 = finance_processing.process_promoter_withdrawal("promo004", 123.45)
        self.assertIsNone(result4.get("error"))
        self.assertEqual(result4["gross_amount"], 123.45)
        self.assertEqual(result4["platform_fee"], 12.35) # 123.45 * 0.1 = 12.345 -> round(12.345, 2) = 12.35
        self.assertEqual(result4["tax_deducted"], 2.47)   # 123.45 * 0.02 = 2.469 -> round(2.469, 2) = 2.47
        self.assertEqual(result4["net_payout"], 108.63)   # 123.45 - 12.345 - 2.469 = 108.636. round(108.636,2) = 108.64
                                                          # Perhitungan manual per komponen: 123.45 - 12.35 - 2.47 = 108.63

        # Kembalikan PPH rate jika diubah
        if self.config_was_mocked:
             finance_processing.config.PROMOTER_WITHDRAWAL_PPH_RATE = 0.02 # Kembalikan ke nilai mock awal


    def test_process_creator_payout_from_budget(self):
        # Skenario 1: Budget cukup
        result1 = finance_processing.process_creator_payout_from_budget("creator001", 1000000.0, 5000000.0)
        self.assertIsNone(result1.get("error"))
        self.assertEqual(result1["creator_id"], "creator001")
        self.assertEqual(result1["payout_to_creator"], 1000000.0)
        self.assertEqual(result1["platform_fee_charged"], 100000.0) # 10% of 1M
        self.assertEqual(result1["total_deducted_from_budget"], 1100000.0) # 1M + 100k
        self.assertEqual(result1["initial_advertiser_budget"], 5000000.0)
        self.assertEqual(result1["remaining_advertiser_budget"], 3900000.0) # 5M - 1.1M

        # Skenario 2: Budget pas-pasan
        result2 = finance_processing.process_creator_payout_from_budget("creator002", 100000.0, 110000.0)
        self.assertIsNone(result2.get("error"))
        self.assertEqual(result2["payout_to_creator"], 100000.0)
        self.assertEqual(result2["platform_fee_charged"], 10000.0)
        self.assertEqual(result2["total_deducted_from_budget"], 110000.0)
        self.assertEqual(result2["remaining_advertiser_budget"], 0.0)

        # Skenario 3: Budget tidak cukup
        result3 = finance_processing.process_creator_payout_from_budget("creator003", 100000.0, 100000.0) # Butuh 110k, ada 100k
        self.assertIsNotNone(result3.get("error"))
        self.assertIn("tidak mencukupi", result3["error"].lower())
        self.assertEqual(result3["initial_advertiser_budget"], 100000.0)
        self.assertEqual(result3["remaining_advertiser_budget"], 100000.0) # Budget tidak berubah

        # Skenario 4: Payout kreator nol
        result4 = finance_processing.process_creator_payout_from_budget("creator004", 0.0, 500000.0)
        self.assertIsNone(result4.get("error"))
        self.assertEqual(result4["payout_to_creator"], 0.0)
        self.assertEqual(result4["platform_fee_charged"], 0.0)
        self.assertEqual(result4["total_deducted_from_budget"], 0.0)
        self.assertEqual(result4["remaining_advertiser_budget"], 500000.0)

        # Skenario 5: Payout kreator negatif
        result5 = finance_processing.process_creator_payout_from_budget("creator005", -10000.0, 500000.0)
        self.assertIsNotNone(result5.get("error"))
        self.assertIn("negatif", result5["error"].lower())
        self.assertEqual(result5["remaining_advertiser_budget"], 500000.0) # Budget tidak berubah

        # Skenario 6: Pembulatan
        # Payout = 123.45, Fee rate = 0.1
        # Fee = 12.345 -> 12.35
        # Total deduct = 123.45 + 12.345 = 135.795 -> 135.80
        # Budget = 200.00
        # Sisa = 200.00 - 135.795 = 64.205 -> 64.21
        # Perhitungan manual per komponen: 200.00 - (123.45 + 12.35) = 200 - 135.80 = 64.20
        result6 = finance_processing.process_creator_payout_from_budget("creator006", 123.45, 200.00)
        self.assertIsNone(result6.get("error"))
        self.assertEqual(result6["payout_to_creator"], 123.45)
        self.assertEqual(result6["platform_fee_charged"], 12.35) # 123.45 * 0.1 = 12.345 -> 12.35
        self.assertEqual(result6["total_deducted_from_budget"], 135.80) # 123.45 + 12.35 = 135.80
        self.assertEqual(result6["remaining_advertiser_budget"], 64.20) # 200.00 - 135.80 = 64.20


if __name__ == '__main__':
    unittest.main()
