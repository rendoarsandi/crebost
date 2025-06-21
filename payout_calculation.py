def calculate_daily_payout(average_rate_r_bar: float, rate_fee: float) -> float:
    """
    Menghitung payout harian berdasarkan rata-rata aktivitas valid (R_bar) dan RateFee.

    Args:
        average_rate_r_bar: Rata-rata aktivitas per menit pengguna dalam sehari (setelah validasi).
                            Ini adalah R_bar yang dianggap valid (misalnya, setelah pengecekan bot level C).
        rate_fee: Nilai bayaran per unit aktivitas (misal Rp 1.500 per view/like/comment unit).

    Returns:
        Jumlah payout harian.
    """
    # Payout dihitung berdasarkan total aktivitas valid dalam satu hari.
    # R_bar adalah rata-rata per menit dari (V+L+C)/1.
    # Jadi, untuk mendapatkan total aktivitas dalam sehari (1440 menit), kita kalikan R_bar dengan 1440.
    # Namun, berdasarkan rumus Payout_harian = R_bar * RateFee, tampaknya R_bar di sini
    # sudah merepresentasikan "nilai" yang akan dikalikan dengan fee, bukan rate per menit murni.
    # Jika R_bar adalah rata-rata (V+L+C)/T di mana T adalah interval (misal 1 menit),
    # dan ada N interval dalam sehari (N=1440), maka total aktivitas adalah sum((V_i+L_i+C_i)/1) untuk i=1 to N.
    # Ini sama dengan N * R_bar (jika R_bar dihitung sebagai rata-rata dari rate per interval).
    # Mari kita asumsikan R_bar yang dimasukkan ke fungsi ini adalah nilai yang sudah siap dikalikan dengan RateFee
    # sesuai deskripsi: Payout_harian = R_bar * RateFee.
    # Jika interpretasinya adalah R_bar adalah rata-rata rate per menit, dan RateFee adalah per aktivitas,
    # maka total aktivitas harian = R_bar * 1440 (menit dalam sehari).
    # Payout = (R_bar * 1440) * RateFee.

    # Berdasarkan rumus yang diberikan: Payout_harian = R_bar * RateFee
    # Ini menyiratkan bahwa R_bar sendiri sudah merupakan "kuantitas" yang akan dibayar,
    # atau RateFee memiliki unit "per R_bar unit".

    # Mari kita klarifikasi asumsi:
    # Asumsi 1: R_bar adalah rata-rata aktivitas per menit. RateFee adalah bayaran per unit aktivitas per menit.
    #   Maka Payout = R_bar * RateFee (misal R_bar = 10 aktivitas/menit, RateFee = Rp 100 / (aktivitas/menit))
    # Asumsi 2: R_bar adalah rata-rata aktivitas per menit. RateFee adalah bayaran per unit aktivitas.
    #   Total aktivitas harian = R_bar * 1440 menit.
    #   Payout = (R_bar * 1440) * RateFee.

    # Deskripsi "Payout dihitung berdasarkan total aktivitas valid dalam satu hari" dan
    # "RateFee adalah nilai bayaran per unit aktivitas (misal Rp 1.500 per view)"
    # lebih condong ke Asumsi 2.
    # Rumus Payout_harian = R_bar * RateFee mungkin merupakan penyederhanaan dimana R_bar
    # yang dimaksud dalam konteks payout sudah dikalikan dengan jumlah menit atau merupakan
    # representasi total "poin" aktivitas.

    # Mengikuti rumus yang diberikan secara harfiah, dengan R_bar adalah rata-rata aktivitas per menit:
    # Payout_harian = R_bar * RateFee.
    # Namun, ini akan menghasilkan payout yang sangat kecil jika RateFee per aktivitas.
    # Contoh: R_bar = 10 aktivitas/menit. RateFee = Rp 1.500 / aktivitas.
    # Payout = 10 * 1500 = Rp 15.000. Ini payout per menit atau per hari?
    # Jika per hari, maka R_bar harusnya total aktivitas atau RateFee per aktivitas/menit.

    # Mari kita gunakan interpretasi yang lebih logis sesuai deskripsi pendukung:
    # Total aktivitas valid harian = R_bar (rata-rata per menit) * 1440 (menit dalam sehari)
    # Payout Harian = Total aktivitas valid harian * RateFee (per aktivitas)

    total_minutes_in_day = 1440
    total_valid_activities_daily = average_rate_r_bar * total_minutes_in_day
    daily_payout = total_valid_activities_daily * rate_fee

    return daily_payout

if __name__ == '__main__':
    # Contoh penggunaan

    # Skenario 1: Pengguna dengan aktivitas rata-rata normal
    # Misalkan R_bar pengguna (setelah divalidasi, level C) adalah 5 aktivitas/menit.
    # Aktivitas ini adalah (Views + Likes + Comments) per menit.
    r_bar_user1 = 5.0  # aktivitas/menit
    rate_fee_per_activity = 1.5 # Misalkan Rp 1.5 (dalam unit mata uang dasar, misal ribuan rupiah, jadi 1.5 = Rp 1.500)
                               # Atau bisa juga 1500 jika ingin outputnya langsung dalam Rupiah.
                               # Kita anggap saja ini adalah nilai moneter per aktivitas.

    payout_user1 = calculate_daily_payout(r_bar_user1, rate_fee_per_activity)
    print(f"Pengguna dengan R_bar = {r_bar_user1} aktivitas/menit:")
    total_activities_user1 = r_bar_user1 * 1440
    print(f"  Total aktivitas valid harian: {total_activities_user1:.2f} aktivitas")
    print(f"  RateFee per aktivitas: Rp {rate_fee_per_activity:.2f}")
    print(f"  Payout harian: Rp {payout_user1:.2f}")
    # Output: 5 * 1440 = 7200 aktivitas. 7200 * 1.5 = Rp 10800.00

    # Skenario 2: Pengguna dengan aktivitas rata-rata lebih tinggi
    r_bar_user2 = 12.5  # aktivitas/menit
    payout_user2 = calculate_daily_payout(r_bar_user2, rate_fee_per_activity)
    print(f"\nPengguna dengan R_bar = {r_bar_user2} aktivitas/menit:")
    total_activities_user2 = r_bar_user2 * 1440
    print(f"  Total aktivitas valid harian: {total_activities_user2:.2f} aktivitas")
    print(f"  RateFee per aktivitas: Rp {rate_fee_per_activity:.2f}")
    print(f"  Payout harian: Rp {payout_user2:.2f}")
    # Output: 12.5 * 1440 = 18000 aktivitas. 18000 * 1.5 = Rp 27000.00

    # Skenario 3: Pengguna dengan aktivitas rata-rata rendah
    r_bar_user3 = 0.5  # aktivitas/menit
    payout_user3 = calculate_daily_payout(r_bar_user3, rate_fee_per_activity)
    print(f"\nPengguna dengan R_bar = {r_bar_user3} aktivitas/menit:")
    total_activities_user3 = r_bar_user3 * 1440
    print(f"  Total aktivitas valid harian: {total_activities_user3:.2f} aktivitas")
    print(f"  RateFee per aktivitas: Rp {rate_fee_per_activity:.2f}")
    print(f"  Payout harian: Rp {payout_user3:.2f}")
    # Output: 0.5 * 1440 = 720 aktivitas. 720 * 1.5 = Rp 1080.00

    # Skenario 4: RateFee berbeda
    rate_fee_premium = 2.0 # Misal Rp 2.0 per aktivitas
    payout_user1_premium_fee = calculate_daily_payout(r_bar_user1, rate_fee_premium)
    print(f"\nPengguna dengan R_bar = {r_bar_user1} aktivitas/menit dan RateFee Premium:")
    print(f"  RateFee per aktivitas: Rp {rate_fee_premium:.2f}")
    print(f"  Payout harian: Rp {payout_user1_premium_fee:.2f}")
    # Output: 5 * 1440 = 7200 aktivitas. 7200 * 2.0 = Rp 14400.00

    # Penting: Fungsi ini mengasumsikan bahwa `average_rate_r_bar` adalah untuk pengguna yang VALID.
    # Jika pengguna terdeteksi sebagai bot (Level A), payout mereka akan dibatalkan (logika ini ada di `bot_detection.py` atau di alur utama).
    # Jika pengguna Level B (peringatan/audit), payout mereka mungkin ditahan atau diproses setelah audit.
    # Fungsi ini hanya menghitung payout jika aktivitas dianggap valid.

    print("\nCatatan: Payout ini dihitung untuk aktivitas yang dianggap VALID (misal, setelah lolos deteksi bot Level C).")
    print("Untuk bot Level A, payout akan dibatalkan. Untuk Level B, mungkin ada peninjauan lebih lanjut.")
