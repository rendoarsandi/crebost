# Modul untuk memproses logika keuangan, termasuk payout, fee, dan pajak.

try:
    from app import config # Diubah dari 'import config'
except ModuleNotFoundError:
    # Fallback sederhana jika config.py tidak ditemukan secara langsung.
    # Ini berguna jika modul dijalankan secara terpisah atau dalam struktur folder yang berbeda.
    # Namun, untuk penggunaan normal dalam proyek, config.py harus dapat diimpor.
    print("Peringatan: config.py tidak ditemukan. Menggunakan nilai fallback jika diperlukan oleh fungsi.")
    # Anda bisa mendefinisikan class config placeholder di sini jika perlu untuk pengujian terisolasi,
    # tapi idealnya, config.py tersedia.
    # Contoh:
    # class MockConfig:
    #     PROMOTER_WITHDRAWAL_PPH_RATE = 0.02
    #     PROMOTER_PLATFORM_FEE_RATE = 0.10
    #     CREATOR_PLATFORM_FEE_RATE_ON_ADVERTISER_BUDGET = 0.10
    # config = MockConfig()
    pass

# Fungsi-fungsi akan ditambahkan pada langkah-langkah berikutnya sesuai rencana:
# - process_promoter_withdrawal
# - process_creator_payout_from_budget
# - (dan mungkin fungsi lain terkait keuangan di masa depan)

if __name__ == '__main__':
    # Contoh penggunaan atau tes sederhana bisa ditambahkan di sini nanti
    # setelah fungsi-fungsi diimplementasikan.
    print("Modul finance_processing.py berhasil dibuat dan siap diisi.")
    # Contoh:
    # if hasattr(config, 'PROMOTER_WITHDRAWAL_PPH_RATE'):
    #     print(f"Tarif PPh Promotor dari config: {config.PROMOTER_WITHDRAWAL_PPH_RATE}")
    # else:
    #     print("Konstanta PROMOTER_WITHDRAWAL_PPH_RATE tidak ditemukan di config.")

def process_promoter_withdrawal(user_id: str, gross_withdrawal_amount: float) -> dict:
    """
    Memproses permintaan withdrawal dari promotor, menghitung PPh, fee platform, dan payout bersih.

    Args:
        user_id: ID unik promotor.
        gross_withdrawal_amount: Jumlah kotor yang ingin ditarik oleh promotor.

    Returns:
        Sebuah dictionary yang berisi:
        - 'user_id': ID promotor.
        - 'gross_amount': Jumlah kotor withdrawal.
        - 'platform_fee': Jumlah fee yang diambil oleh platform.
        - 'tax_deducted': Jumlah pajak (PPh) yang dipotong.
        - 'net_payout': Jumlah bersih yang akan diterima promotor.
        - 'error': Pesan error jika ada masalah (misalnya, jumlah negatif).
    """
    if gross_withdrawal_amount < 0:
        return {
            "user_id": user_id,
            "gross_amount": gross_withdrawal_amount,
            "platform_fee": 0.0,
            "tax_deducted": 0.0,
            "net_payout": 0.0,
            "error": "Jumlah withdrawal tidak boleh negatif."
        }

    # Dapatkan tarif dari config. Jika config tidak termuat, ini akan error.
    # Blok try-except di atas hanya untuk kasus modul dijalankan standalone tanpa config.
    # Dalam penggunaan normal, config harus ada.
    try:
        pph_rate = config.PROMOTER_WITHDRAWAL_PPH_RATE
        platform_fee_rate = config.PROMOTER_PLATFORM_FEE_RATE
    except AttributeError as e:
        # Ini terjadi jika config diimpor tapi konstanta spesifik tidak ada
        # atau jika config tidak berhasil diimpor sama sekali dan fallback tidak mendefinisikannya.
        missing_config = str(e)
        return {
            "user_id": user_id,
            "gross_amount": gross_withdrawal_amount,
            "platform_fee": 0.0,
            "tax_deducted": 0.0,
            "net_payout": 0.0,
            "error": f"Konfigurasi rate tidak ditemukan: {missing_config}. Pastikan config.py sudah benar."
        }
    except NameError:
        # Ini terjadi jika 'config' sendiri tidak terdefinisi (impor gagal total dan tidak ada fallback)
        return {
            "user_id": user_id,
            "gross_amount": gross_withdrawal_amount,
            "platform_fee": 0.0,
            "tax_deducted": 0.0,
            "net_payout": 0.0,
            "error": "Modul config tidak berhasil dimuat. Periksa impor dan ketersediaan file."
        }


    tax_deducted_raw = gross_withdrawal_amount * pph_rate
    platform_fee_raw = gross_withdrawal_amount * platform_fee_rate

    # Bulatkan komponen fee dan pajak terlebih dahulu
    rounded_tax_deducted = round(tax_deducted_raw, 2)
    rounded_platform_fee = round(platform_fee_raw, 2)

    # Hitung net payout dari gross dikurangi komponen yang sudah dibulatkan
    net_payout_calculated = gross_withdrawal_amount - rounded_tax_deducted - rounded_platform_fee

    # Pastikan net_payout tidak negatif karena pembulatan atau tarif yang sangat tinggi
    if net_payout_calculated < 0:
        net_payout_calculated = 0 # Atau bisa juga dilempar error, tergantung kebijakan bisnis

    return {
        "user_id": user_id,
        "gross_amount": round(gross_withdrawal_amount, 2),
        "platform_fee": rounded_platform_fee, # Sudah dibulatkan
        "tax_deducted": rounded_tax_deducted, # Sudah dibulatkan
        "net_payout": round(net_payout_calculated, 2), # Bulatkan hasil akhir juga
        "error": None
    }

if __name__ == '__main__':
    print("Modul finance_processing.py berhasil dibuat dan siap diisi.")

    # Contoh penggunaan process_promoter_withdrawal
    # Untuk menjalankan ini, pastikan config.py ada dan berisi konstanta yang diperlukan
    # atau uncomment dan sesuaikan MockConfig di atas.

    # Simulasi config jika tidak ada (untuk pengujian di sini)
    if not hasattr(config, 'PROMOTER_WITHDRAWAL_PPH_RATE'):
        class MockConfig:
            PROMOTER_WITHDRAWAL_PPH_RATE = 0.02
            PROMOTER_PLATFORM_FEE_RATE = 0.10
        config = MockConfig()
        print("\nMenggunakan MockConfig untuk contoh karena config.py tidak lengkap atau tidak ada.")

    print("\n--- Contoh Pemrosesan Withdrawal Promotor ---")

    # Kasus 1: Withdrawal normal
    withdrawal1 = process_promoter_withdrawal("promotor001", 100000.0)
    print(f"Withdrawal 1 ({withdrawal1.get('user_id')}):")
    if withdrawal1.get("error"):
        print(f"  Error: {withdrawal1['error']}")
    else:
        print(f"  Jumlah Kotor: {withdrawal1['gross_amount']}")
        print(f"  Fee Platform (10%): {withdrawal1['platform_fee']}")
        print(f"  PPh Dipotong (2%): {withdrawal1['tax_deducted']}")
        print(f"  Jumlah Bersih: {withdrawal1['net_payout']}")
        # Harusnya: Kotor=100000, Fee=10000, PPh=2000, Bersih=88000

    # Kasus 2: Withdrawal jumlah kecil
    withdrawal2 = process_promoter_withdrawal("promotor002", 500.0)
    print(f"\nWithdrawal 2 ({withdrawal2.get('user_id')}):")
    if withdrawal2.get("error"):
        print(f"  Error: {withdrawal2['error']}")
    else:
        print(f"  Jumlah Kotor: {withdrawal2['gross_amount']}")
        print(f"  Fee Platform (10%): {withdrawal2['platform_fee']}")
        print(f"  PPh Dipotong (2%): {withdrawal2['tax_deducted']}")
        print(f"  Jumlah Bersih: {withdrawal2['net_payout']}")
        # Harusnya: Kotor=500, Fee=50, PPh=10, Bersih=440

    # Kasus 3: Withdrawal nol
    withdrawal3 = process_promoter_withdrawal("promotor003", 0.0)
    print(f"\nWithdrawal 3 ({withdrawal3.get('user_id')}):")
    if withdrawal3.get("error"):
        print(f"  Error: {withdrawal3['error']}")
    else:
        print(f"  Jumlah Kotor: {withdrawal3['gross_amount']}")
        print(f"  Fee Platform (10%): {withdrawal3['platform_fee']}")
        print(f"  PPh Dipotong (2%): {withdrawal3['tax_deducted']}")
        print(f"  Jumlah Bersih: {withdrawal3['net_payout']}")
        # Harusnya: Kotor=0, Fee=0, PPh=0, Bersih=0

    # Kasus 4: Withdrawal negatif (error)
    withdrawal4 = process_promoter_withdrawal("promotor004", -1000.0)
    print(f"\nWithdrawal 4 ({withdrawal4.get('user_id')}):")
    if withdrawal4.get("error"):
        print(f"  Error: {withdrawal4['error']}")
    else:
        # Ini tidak akan tercapai jika error handling bekerja
        print(f"  Jumlah Kotor: {withdrawal4['gross_amount']}")
        print(f"  Jumlah Bersih: {withdrawal4['net_payout']}")


def process_creator_payout_from_budget(creator_id: str, payout_to_creator: float, current_advertiser_budget: float) -> dict:
    """
    Memproses payout untuk kreator, menghitung fee platform yang dibebankan
    ke budget pemasang iklan, dan mengupdate sisa budget.

    Args:
        creator_id: ID unik kreator.
        payout_to_creator: Jumlah yang seharusnya diterima oleh kreator.
        current_advertiser_budget: Sisa budget pemasang iklan saat ini.

    Returns:
        Sebuah dictionary yang berisi:
        - 'creator_id': ID kreator.
        - 'payout_to_creator': Jumlah yang dibayarkan ke kreator.
        - 'platform_fee_charged': Fee platform yang dibebankan ke budget iklan.
        - 'total_deducted_from_budget': Total pengurangan dari budget iklan.
        - 'initial_advertiser_budget': Budget awal advertiser sebelum transaksi ini.
        - 'remaining_advertiser_budget': Sisa budget advertiser setelah transaksi.
        - 'error': Pesan error jika ada masalah (misalnya, budget tidak cukup).
    """
    if payout_to_creator < 0:
        return {
            "creator_id": creator_id,
            "payout_to_creator": payout_to_creator,
            "platform_fee_charged": 0.0,
            "total_deducted_from_budget": 0.0,
            "initial_advertiser_budget": current_advertiser_budget,
            "remaining_advertiser_budget": current_advertiser_budget,
            "error": "Jumlah payout kreator tidak boleh negatif."
        }

    try:
        platform_fee_rate = config.CREATOR_PLATFORM_FEE_RATE_ON_ADVERTISER_BUDGET
    except AttributeError as e:
        missing_config = str(e)
        return {
            "creator_id": creator_id,
            "payout_to_creator": payout_to_creator,
            "platform_fee_charged": 0.0,
            "total_deducted_from_budget": 0.0,
            "initial_advertiser_budget": current_advertiser_budget,
            "remaining_advertiser_budget": current_advertiser_budget,
            "error": f"Konfigurasi CREATOR_PLATFORM_FEE_RATE_ON_ADVERTISER_BUDGET tidak ditemukan: {missing_config}."
        }
    except NameError:
        return {
            "creator_id": creator_id,
            "payout_to_creator": payout_to_creator,
            "platform_fee_charged": 0.0,
            "total_deducted_from_budget": 0.0,
            "initial_advertiser_budget": current_advertiser_budget,
            "remaining_advertiser_budget": current_advertiser_budget,
            "error": "Modul config tidak berhasil dimuat. Periksa impor dan ketersediaan file."
        }

    platform_fee_charged = payout_to_creator * platform_fee_rate
    total_deducted_from_budget = payout_to_creator + platform_fee_charged

    if total_deducted_from_budget > current_advertiser_budget:
        return {
            "creator_id": creator_id,
            "payout_to_creator": payout_to_creator,
            "platform_fee_charged": round(platform_fee_charged, 2),
            "total_deducted_from_budget": round(total_deducted_from_budget, 2),
            "initial_advertiser_budget": round(current_advertiser_budget, 2),
            "remaining_advertiser_budget": round(current_advertiser_budget, 2), # Budget tidak berubah karena gagal
            "error": "Budget pemasang iklan tidak mencukupi."
        }

    remaining_advertiser_budget = current_advertiser_budget - total_deducted_from_budget

    return {
        "creator_id": creator_id,
        "payout_to_creator": round(payout_to_creator, 2),
        "platform_fee_charged": round(platform_fee_charged, 2),
        "total_deducted_from_budget": round(total_deducted_from_budget, 2),
        "initial_advertiser_budget": round(current_advertiser_budget, 2),
        "remaining_advertiser_budget": round(remaining_advertiser_budget, 2),
        "error": None
    }

if __name__ == '__main__':
    print("Modul finance_processing.py.") # Pesan awal dipindah ke atas agar tidak duplikat

    # Simulasi config jika konstanta yang diperlukan tidak ada di config.py yang diimpor
    # Ini berguna jika menjalankan file ini secara langsung tanpa config.py yang lengkap.
    missing_promoter_configs = not hasattr(config, 'PROMOTER_WITHDRAWAL_PPH_RATE') or \
                               not hasattr(config, 'PROMOTER_PLATFORM_FEE_RATE')
    missing_creator_config = not hasattr(config, 'CREATOR_PLATFORM_FEE_RATE_ON_ADVERTISER_BUDGET')

    if missing_promoter_configs or missing_creator_config:
        class MockConfigForFinance:
            PROMOTER_WITHDRAWAL_PPH_RATE = getattr(config, 'PROMOTER_WITHDRAWAL_PPH_RATE', 0.02)
            PROMOTER_PLATFORM_FEE_RATE = getattr(config, 'PROMOTER_PLATFORM_FEE_RATE', 0.10)
            CREATOR_PLATFORM_FEE_RATE_ON_ADVERTISER_BUDGET = getattr(config, 'CREATOR_PLATFORM_FEE_RATE_ON_ADVERTISER_BUDGET', 0.10)

        # Ganti config yang digunakan oleh fungsi-fungsi dalam modul ini HANYA untuk blok __main__ ini.
        # Ini tidak akan mempengaruhi impor config di modul lain atau saat modul ini diimpor.
        original_config_ref = config
        config = MockConfigForFinance()
        print("\nINFO: Menggunakan MockConfigForFinance untuk contoh di __main__ karena beberapa konstanta tidak ditemukan di config.py yang diimpor.")
        print(f"  Mocked PROMOTER_WITHDRAWAL_PPH_RATE: {config.PROMOTER_WITHDRAWAL_PPH_RATE}")
        print(f"  Mocked PROMOTER_PLATFORM_FEE_RATE: {config.PROMOTER_PLATFORM_FEE_RATE}")
        print(f"  Mocked CREATOR_PLATFORM_FEE_RATE_ON_ADVERTISER_BUDGET: {config.CREATOR_PLATFORM_FEE_RATE_ON_ADVERTISER_BUDGET}")


    # --- Contoh Pemrosesan Withdrawal Promotor (kode dari atas dipindah ke sini) ---
    print("\n--- Contoh Pemrosesan Withdrawal Promotor ---")

    withdrawal1 = process_promoter_withdrawal("promotor001", 100000.0)
    print(f"Withdrawal 1 ({withdrawal1.get('user_id')}):")
    if withdrawal1.get("error"):
        print(f"  Error: {withdrawal1['error']}")
    else:
        print(f"  Jumlah Kotor: {withdrawal1['gross_amount']}")
        print(f"  Fee Platform (10%): {withdrawal1['platform_fee']}")
        print(f"  PPh Dipotong (2%): {withdrawal1['tax_deducted']}")
        print(f"  Jumlah Bersih: {withdrawal1['net_payout']}")

    withdrawal2 = process_promoter_withdrawal("promotor002", 500.0)
    print(f"\nWithdrawal 2 ({withdrawal2.get('user_id')}):")
    if withdrawal2.get("error"):
        print(f"  Error: {withdrawal2['error']}")
    else:
        print(f"  Jumlah Kotor: {withdrawal2['gross_amount']}")
        print(f"  Fee Platform (10%): {withdrawal2['platform_fee']}")
        print(f"  PPh Dipotong (2%): {withdrawal2['tax_deducted']}")
        print(f"  Jumlah Bersih: {withdrawal2['net_payout']}")

    withdrawal3 = process_promoter_withdrawal("promotor003", 0.0)
    print(f"\nWithdrawal 3 ({withdrawal3.get('user_id')}):")
    if withdrawal3.get("error"):
        print(f"  Error: {withdrawal3['error']}")
    else:
        print(f"  Jumlah Kotor: {withdrawal3['gross_amount']}")
        print(f"  Fee Platform (10%): {withdrawal3['platform_fee']}")
        print(f"  PPh Dipotong (2%): {withdrawal3['tax_deducted']}")
        print(f"  Jumlah Bersih: {withdrawal3['net_payout']}")

    withdrawal4 = process_promoter_withdrawal("promotor004", -1000.0)
    print(f"\nWithdrawal 4 ({withdrawal4.get('user_id')}):")
    if withdrawal4.get("error"):
        print(f"  Error: {withdrawal4['error']}")
    else:
        print(f"  Jumlah Kotor: {withdrawal4['gross_amount']}")
        print(f"  Jumlah Bersih: {withdrawal4['net_payout']}")

    # --- Contoh Pemrosesan Payout Kreator dari Budget Iklan ---
    print("\n\n--- Contoh Pemrosesan Payout Kreator dari Budget Iklan ---")

    # Kasus 1: Budget cukup
    payout_k1 = process_creator_payout_from_budget("kreator001", 1000000.0, 5000000.0)
    print(f"Payout Kreator 1 ({payout_k1.get('creator_id')}):")
    if payout_k1.get("error"):
        print(f"  Error: {payout_k1['error']}")
    else:
        print(f"  Payout ke Kreator: {payout_k1['payout_to_creator']}")
        print(f"  Fee Platform (10% dari payout, dibebankan ke budget): {payout_k1['platform_fee_charged']}")
        print(f"  Total Pengurangan dari Budget: {payout_k1['total_deducted_from_budget']}")
        print(f"  Budget Awal Advertiser: {payout_k1['initial_advertiser_budget']}")
        print(f"  Sisa Budget Advertiser: {payout_k1['remaining_advertiser_budget']}")
        # Harusnya: Payout=1jt, Fee=100rb, Total Deduct=1.1jt, Sisa Budget=3.9jt

    # Kasus 2: Budget tidak cukup
    payout_k2 = process_creator_payout_from_budget("kreator002", 1000000.0, 1000000.0) # Budget hanya 1jt, butuh 1.1jt
    print(f"\nPayout Kreator 2 ({payout_k2.get('creator_id')}):")
    if payout_k2.get("error"):
        print(f"  Error: {payout_k2['error']}")
        print(f"  Detail Gagal: Payout={payout_k2.get('payout_to_creator')}, Fee Dihitung={payout_k2.get('platform_fee_charged')}, Total Dibutuhkan={payout_k2.get('total_deducted_from_budget')}, Budget Tersedia={payout_k2.get('initial_advertiser_budget')}")
    else:
        print(f"  Sisa Budget Advertiser: {payout_k2['remaining_advertiser_budget']}")

    # Kasus 3: Payout kreator nol
    payout_k3 = process_creator_payout_from_budget("kreator003", 0.0, 500000.0)
    print(f"\nPayout Kreator 3 ({payout_k3.get('creator_id')}):")
    if payout_k3.get("error"):
        print(f"  Error: {payout_k3['error']}")
    else:
        print(f"  Payout ke Kreator: {payout_k3['payout_to_creator']}")
        print(f"  Fee Platform: {payout_k3['platform_fee_charged']}")
        print(f"  Total Pengurangan dari Budget: {payout_k3['total_deducted_from_budget']}")
        print(f"  Sisa Budget Advertiser: {payout_k3['remaining_advertiser_budget']}")
        # Harusnya: Payout=0, Fee=0, Total Deduct=0, Sisa Budget=500rb

    # Kasus 4: Payout kreator negatif (error)
    payout_k4 = process_creator_payout_from_budget("kreator004", -10000.0, 500000.0)
    print(f"\nPayout Kreator 4 ({payout_k4.get('creator_id')}):")
    if payout_k4.get("error"):
        print(f"  Error: {payout_k4['error']}")
    else:
        print(f"  Sisa Budget Advertiser: {payout_k4['remaining_advertiser_budget']}")
