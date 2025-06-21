from datetime import datetime, timedelta

# Import modul-modul yang sudah dibuat
from app import config
from app.core import user_activity
from app.core import bot_detection
from app.services import payout_calculation
# cloudflare_integration tidak di-import secara langsung untuk eksekusi utama di sini,
# karena itu lebih untuk arsitektur worker.

def simulate_user_session_and_bot_detection(user_id: str, session_token: str, activities: list[tuple[str, str | None, int]]):
    """
    Mensimulasikan sesi pengguna, mencatat aktivitas, melakukan deteksi bot,
    dan menghitung potensi payout.

    Args:
        user_id: ID pengguna.
        session_token: Token sesi pengguna.
        activities: Daftar aktivitas. Setiap tuple berisi:
                    (activity_type: str, content_id: str | None, delay_seconds_from_login: int)
                    delay_seconds_from_login adalah waktu tunda aktivitas dari waktu login.
    """
    print(f"\n--- Memulai Simulasi untuk User: {user_id} ---")

    # 1. Buat sesi pengguna
    session = user_activity.UserSession(user_id, session_token)
    print(f"Sesi dimulai untuk {user_id} pada {session.login_time}")

    # 2. Catat aktivitas berdasarkan data simulasi
    # Asumsikan semua aktivitas ini terjadi dalam satu periode pengukuran T yang didefinisikan di config
    # atau kita bisa menghitung rate berdasarkan durasi aktual sesi.
    # Untuk tujuan deteksi bot per periode, T adalah kunci.

    # Tentukan waktu mulai periode pengukuran (misalnya, sama dengan waktu login untuk batch ini)
    measurement_start_time = session.login_time

    for activity_type, content_id, delay_seconds in activities:
        activity_timestamp = session.login_time + timedelta(seconds=delay_seconds)
        session.record_activity(activity_type, content_id, timestamp=activity_timestamp)

    print(f"Aktivitas dicatat. Aktivitas terakhir pada: {session.last_activity_time}")

    # 3. Hitung Rate_per_min untuk periode pengukuran ini
    # Durasi pengukuran (T) adalah kunci. Sesuai rumus, ini adalah durasi pengukuran, misal 1 menit.
    # Jika kita ingin mengevaluasi aktivitas yang baru saja dicatat dalam satu blok:
    # Kita bisa menggunakan durasi aktual dari aktivitas pertama hingga terakhir dalam batch ini,
    # ATAU menggunakan T standar dari config.

    # Opsi A: Menggunakan durasi aktual dari aktivitas yang disimulasikan
    # duration_simulated_activity_minutes = (session.last_activity_time - measurement_start_time).total_seconds() / 60.0
    # if duration_simulated_activity_minutes == 0: # Jika semua aktivitas instan, beri durasi kecil
    #     duration_simulated_activity_minutes = config.DEFAULT_MEASUREMENT_DURATION_MINUTES / 60 # misal 1 detik

    # Opsi B: Menggunakan durasi pengukuran standar dari config (misal, per 1 menit)
    # Ini lebih sesuai dengan "Rate_per_min = (V+L+C)/T" dimana T adalah durasi pengukuran tetap.
    current_measurement_duration_T = config.DEFAULT_MEASUREMENT_DURATION_MINUTES

    # Dapatkan jumlah aktivitas dalam periode pengukuran ini
    # Jika measurement_start_time adalah login_time, ini akan mengambil semua aktivitas.
    # Jika T adalah 1 menit, dan aktivitas terjadi dalam 1 menit itu, maka ini valid.
    views, likes, comments = session.get_activity_counts_since(measurement_start_time)

    # Jika total durasi aktivitas yang disimulasikan lebih kecil dari T, dan kita ingin
    # rate seolah-olah itu terjadi dalam T, maka kita gunakan T.
    # Jika aktivitas tersebar lebih dari T, kita mungkin perlu memprosesnya per blok T.
    # Untuk simulasi ini, kita anggap semua `activities` yang diberikan masuk dalam satu evaluasi T.

    rate_this_period = bot_detection.calculate_rate_per_minute(
        views, likes, comments, current_measurement_duration_T
    )
    print(f"Aktivitas dalam periode pengukuran (T={current_measurement_duration_T} min): V={views}, L={likes}, C={comments}")
    print(f"Rate per Menit (Rate_this_period): {rate_this_period:.2f}")

    # 4. Deteksi Level Bot
    # Untuk R_bar (rata-rata harian), kita memerlukan beberapa 'rate_this_period' dari interval berbeda.
    # Untuk simulasi ini, kita anggap 'rate_this_period' adalah R_bar sementara untuk keputusan saat ini.
    # Dalam sistem nyata, R_bar akan diakumulasi/dihitung dari banyak periode.
    # Anggap saja R_bar untuk evaluasi saat ini adalah rate_this_period.
    # Jika ingin lebih akurat, kita harus mensimulasikan N interval dan menghitung rata-ratanya.
    # Untuk kesederhanaan, kita gunakan rate_this_period sebagai input untuk deteksi level.
    # Ini berarti kita mengevaluasi berdasarkan aktivitas terkini dalam satu jendela T.

    r_bar_simulated_for_detection = rate_this_period

    bot_level = bot_detection.detect_bot_level(
        r_bar_simulated_for_detection,
        config.MEAN_NORMAL_ACTIVITY,
        config.STD_DEV_NORMAL_ACTIVITY
    )
    print(f"Level Deteksi Bot: {bot_level}")

    # 5. Tindakan Berdasarkan Deteksi Bot
    action_message = bot_detection.handle_bot_detection_action(bot_level, user_id)
    print(f"Tindakan: {action_message}")

    # 6. Perhitungan Payout (jika aktivitas valid)
    if bot_level == "C": # Aktivitas dianggap valid
        # Untuk payout harian, kita perlu R_bar harian.
        # Sekali lagi, kita simulasikan bahwa r_bar_simulated_for_detection adalah R_bar harian pengguna ini.
        # Dalam sistem nyata, R_bar harian dihitung dari (sum of rates in 1-min intervals) / N_INTERVALS_PER_DAY
        # Jika r_bar_simulated_for_detection adalah rate untuk satu interval 1-menit, maka R_bar harian = r_bar_simulated_for_detection
        # (jika pengguna konsisten pada rate itu sepanjang hari). Ini adalah penyederhanaan besar.

        # Mari kita asumsikan r_bar_simulated_for_detection adalah R_bar harian yang sudah dihitung.
        daily_payout = payout_calculation.calculate_daily_payout(
            average_rate_r_bar=r_bar_simulated_for_detection, # Ini adalah R_bar harian
            rate_fee=config.RATE_FEE_PER_ACTIVITY
        )
        print(f"Estimasi Payout Harian (jika rate ini konsisten dan valid): Rp {daily_payout:.2f}")
        # Catatan: Total aktivitas harian = r_bar_simulated_for_detection * 1440
        # Payout = (r_bar_simulated_for_detection * 1440) * config.RATE_FEE_PER_ACTIVITY
    elif bot_level == "A":
        print("Payout dibatalkan karena terdeteksi sebagai bot Level A.")
    elif bot_level == "B":
        print("Payout mungkin ditinjau atau ditunda karena terdeteksi sebagai bot Level B.")

    print(f"--- Simulasi Selesai untuk User: {user_id} ---")
    return {"user_id": user_id, "rate_per_minute": rate_this_period, "bot_level": bot_level}


if __name__ == "__main__":
    print("===== Memulai Simulasi Deteksi Bot dan Payout =====")
    print(f"Menggunakan konfigurasi: Mu={config.MEAN_NORMAL_ACTIVITY}, Sigma={config.STD_DEV_NORMAL_ACTIVITY}, RateFee={config.RATE_FEE_PER_ACTIVITY}")
    print(f"Durasi pengukuran standar (T) per periode: {config.DEFAULT_MEASUREMENT_DURATION_MINUTES} menit.")

    # Skenario 1: Pengguna Normal
    # 10 aktivitas dalam 1 menit pengukuran (T=1). Rate = 10/1 = 10. (Sesuai Mu)
    activities_user_normal = [
        ("view", "video1", 5),    # 5 detik setelah login
        ("like", "video1", 10),
        ("view", "video2", 20),
        ("view", "video3", 25),
        ("comment", "video2", 30), # 5 aktivitas
        ("view", "video4", 35),
        ("view", "video5", 40),
        ("like", "video3", 45),
        ("view", "video6", 50),
        ("comment", "video1", 55)  # Total 10 aktivitas, semua dalam 1 menit
    ]
    # Jika T = 1 menit, maka rate = (5+2+3)/1 = 10/1 = 10. (Ini salah, jumlah V+L+C)
    # V=6, L=2, C=2. Total = 10. Rate = 10 / 1 = 10.
    simulate_user_session_and_bot_detection("UserNormal_001", "sess_normal_001", activities_user_normal)

    # Skenario 2: Pengguna Sangat Aktif (Potensi Bot Level A)
    # 30 aktivitas dalam 1 menit pengukuran (T=1). Rate = 30/1 = 30.
    # Mu+3Sigma = 10 + 3*2 = 16. Jadi 30 > 16 -> Level A
    activities_user_high_rate = []
    for i in range(30): # 30 aktivitas
        activities_user_high_rate.append( ("view", f"content{i}", i*2) ) # Tersebar dalam 60 detik
    simulate_user_session_and_bot_detection("UserBotA_002", "sess_bota_002", activities_user_high_rate)


    # Skenario 3: Pengguna Cukup Aktif (Potensi Bot Level B)
    # 15 aktivitas dalam 1 menit pengukuran (T=1). Rate = 15/1 = 15.
    # Mu+2Sigma = 10 + 2*2 = 14. Mu+3Sigma = 16.
    # 14 < 15 <= 16 -> Level B
    activities_user_medium_rate = []
    for i in range(15): # 15 aktivitas
        activities_user_medium_rate.append( ("view", f"content_med{i}", i*3) ) # Tersebar dalam 45 detik
    simulate_user_session_and_bot_detection("UserBotB_003", "sess_botb_003", activities_user_medium_rate)

    # Skenario 4: Pengguna Kurang Aktif
    # 3 aktivitas dalam 1 menit pengukuran (T=1). Rate = 3/1 = 3.
    # 3 <= Mu+2Sigma (14) -> Level C
    activities_user_low_rate = [
        ("view", "articleA", 10),
        ("like", "articleA", 25),
        ("comment", "articleA", 50) # 3 aktivitas dalam 1 menit
    ]
    simulate_user_session_and_bot_detection("UserLow_004", "sess_low_004", activities_user_low_rate)

    # Skenario 5: Aktivitas tinggi tapi durasi pengukuran berbeda (misal T = 0.5 menit)
    # Jika T = 0.5 menit (30 detik) dan ada 10 aktivitas. Rate = 10 / 0.5 = 20.
    # Ini akan jadi level A (20 > 16).
    print(f"\n--- Mengubah T sementara untuk Skenario 5 ---")
    original_T = config.DEFAULT_MEASUREMENT_DURATION_MINUTES
    config.DEFAULT_MEASUREMENT_DURATION_MINUTES = 0.5
    print(f"Durasi pengukuran (T) diubah menjadi: {config.DEFAULT_MEASUREMENT_DURATION_MINUTES} menit untuk skenario ini.")
    activities_short_T = []
    for i in range(10): # 10 aktivitas
        activities_short_T.append( ("view", f"content_shortT{i}", i*2) ) # Tersebar dalam 20 detik (cocok untuk T=0.5 min)
    simulate_user_session_and_bot_detection("UserShortT_005", "sess_shortT_005", activities_short_T)
    config.DEFAULT_MEASUREMENT_DURATION_MINUTES = original_T # Kembalikan T ke nilai awal
    print(f"Durasi pengukuran (T) dikembalikan ke: {config.DEFAULT_MEASUREMENT_DURATION_MINUTES} menit.")

    print("\n===== Simulasi Selesai =====")
