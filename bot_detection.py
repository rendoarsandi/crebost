import math

def calculate_rate_per_minute(views: int, likes: int, comments: int, duration_minutes: float) -> float:
    """
    Menghitung aktivitas (views, likes, comments) per menit.

    Args:
        views: Jumlah views selama periode.
        likes: Jumlah likes selama periode.
        comments: Jumlah comments selama periode.
        duration_minutes: Durasi pengukuran dalam menit.

    Returns:
        Nilai aktivitas per menit.
    """
    if duration_minutes <= 0:
        return 0.0
    return (views + likes + comments) / duration_minutes

def calculate_average_rate(rates: list[float]) -> float:
    """
    Menghitung rata-rata dari beberapa interval pengukuran.

    Args:
        rates: Daftar nilai rate per menit dari beberapa interval.

    Returns:
        Rata-rata rate per menit.
    """
    if not rates:
        return 0.0
    return sum(rates) / len(rates)

def detect_bot_level(r_bar: float, mean_normal_activity: float, std_dev_normal_activity: float) -> str:
    """
    Menentukan level deteksi bot berdasarkan R_bar, mean, dan standar deviasi aktivitas normal.

    Args:
        r_bar: Rata-rata aktivitas pengguna (Rate_per_min).
        mean_normal_activity: Rata-rata aktivitas pengguna normal (mu).
        std_dev_normal_activity: Standar deviasi aktivitas pengguna normal (sigma).

    Returns:
        String yang menunjukkan level deteksi ('A', 'B', atau 'C').
    """
    if r_bar > mean_normal_activity + 3 * std_dev_normal_activity:
        return "A"
    elif mean_normal_activity + 2 * std_dev_normal_activity < r_bar <= mean_normal_activity + 3 * std_dev_normal_activity:
        return "B"
    else:
        return "C"

def handle_bot_detection_action(level: str, user_id: str) -> str:
    """
    Menentukan tindakan berdasarkan level deteksi bot.

    Args:
        level: Level deteksi bot ('A', 'B', atau 'C').
        user_id: ID pengguna yang terdeteksi.

    Returns:
        String yang menjelaskan tindakan yang diambil.
    """
    if level == "A":
        # Logika untuk blok akun dan batal payout
        return f"User {user_id}: Akun diblokir otomatis dan payout dibatalkan."
    elif level == "B":
        # Logika untuk kirim notifikasi dan audit manual
        return f"User {user_id}: Peringatan dikirim dan akun dimasukkan ke daftar audit manual."
    elif level == "C":
        return f"User {user_id}: Aktivitas valid."
    else:
        return f"User {user_id}: Level deteksi tidak dikenal."

if __name__ == '__main__':
    # Contoh penggunaan
    print("Contoh Kalkulasi Rate per Menit:")
    rate1 = calculate_rate_per_minute(views=10, likes=2, comments=1, duration_minutes=1)
    print(f"Rate untuk pengguna 1 (1 menit): {rate1}") # Output: 13.0
    rate2 = calculate_rate_per_minute(views=5, likes=1, comments=0, duration_minutes=0.5)
    print(f"Rate untuk pengguna 2 (0.5 menit): {rate2}") # Output: 12.0
    rate3 = calculate_rate_per_minute(views=100, likes=20, comments=5, duration_minutes=0) # Durasi 0
    print(f"Rate untuk pengguna 3 (0 menit): {rate3}") # Output: 0.0

    print("\nContoh Kalkulasi Rata-Rata Rate:")
    # Misalkan ini adalah rate per menit yang diukur setiap menit selama 5 menit
    user_rates_per_minute = [10.0, 12.5, 11.0, 13.0, 9.5]
    average_user_rate = calculate_average_rate(user_rates_per_minute)
    print(f"Rata-rata rate pengguna selama 5 interval: {average_user_rate}") # Output: 11.2

    # Misalkan ini adalah rate per menit yang diukur dari 1440 interval 1-menit dalam sehari
    # Untuk simulasi, kita gunakan beberapa nilai saja
    daily_rates = [calculate_rate_per_minute(v, l, c, 1) for v, l, c in [(10,1,1), (15,2,0), (8,1,1), (20,3,2)]] # 4 interval
    # Jika N = 1440, maka kita akan memiliki 1440 data rate seperti ini.
    # Untuk contoh ini, kita hanya menggunakan 4 interval.
    # R_bar akan dihitung dari semua interval tersebut.
    # Misal, jika kita punya banyak data, kita bisa menghitung R_bar harian:
    # r_bar_harian = calculate_average_rate(list_of_1440_rates)

    print("\nContoh Deteksi Bot Level:")
    # Parameter populasi normal (contoh)
    mu = 10.0  # Rata-rata aktivitas normal
    sigma = 2.0 # Standar deviasi aktivitas normal

    # Kasus 1: Aktivitas pengguna jauh di atas normal (Bot Level A)
    user_r_bar_high = 17.0 # mu + 3.5*sigma (10 + 3.5*2 = 17)
    level_high = detect_bot_level(user_r_bar_high, mu, sigma)
    print(f"Pengguna dengan R_bar = {user_r_bar_high}: Level {level_high}")
    print(handle_bot_detection_action(level_high, "user_alpha"))

    # Kasus 2: Aktivitas pengguna di atas normal, tapi tidak ekstrim (Bot Level B)
    user_r_bar_medium = 15.0 # mu + 2.5*sigma (10 + 2.5*2 = 15)
    level_medium = detect_bot_level(user_r_bar_medium, mu, sigma)
    print(f"Pengguna dengan R_bar = {user_r_bar_medium}: Level {level_medium}")
    print(handle_bot_detection_action(level_medium, "user_beta"))

    # Kasus 3: Aktivitas pengguna normal (Valid Level C)
    user_r_bar_normal = 11.0 # mu + 0.5*sigma (10 + 0.5*2 = 11)
    level_normal = detect_bot_level(user_r_bar_normal, mu, sigma)
    print(f"Pengguna dengan R_bar = {user_r_bar_normal}: Level {level_normal}")
    print(handle_bot_detection_action(level_normal, "user_gamma"))

    user_r_bar_low = 5.0 # di bawah mu
    level_low = detect_bot_level(user_r_bar_low, mu, sigma)
    print(f"Pengguna dengan R_bar = {user_r_bar_low}: Level {level_low}")
    print(handle_bot_detection_action(level_low, "user_delta"))

    # Kasus batas
    user_r_bar_batas_b_c = mu + 2 * sigma # 10 + 2*2 = 14
    level_batas_b_c = detect_bot_level(user_r_bar_batas_b_c, mu, sigma)
    print(f"Pengguna dengan R_bar = {user_r_bar_batas_b_c} (batas B/C): Level {level_batas_b_c}") # Harusnya C
    print(handle_bot_detection_action(level_batas_b_c, "user_epsilon_c"))

    user_r_bar_batas_a_b = mu + 3 * sigma # 10 + 3*2 = 16
    level_batas_a_b = detect_bot_level(user_r_bar_batas_a_b, mu, sigma)
    print(f"Pengguna dengan R_bar = {user_r_bar_batas_a_b} (batas A/B): Level {level_batas_a_b}") # Harusnya B
    print(handle_bot_detection_action(level_batas_a_b, "user_epsilon_b"))

    # Sedikit di atas batas B
    user_r_bar_sedikit_diatas_b = mu + 2.001 * sigma
    level_sedikit_diatas_b = detect_bot_level(user_r_bar_sedikit_diatas_b, mu, sigma)
    print(f"Pengguna dengan R_bar = {user_r_bar_sedikit_diatas_b:.3f} (sedikit di atas batas B): Level {level_sedikit_diatas_b}") # Harusnya B
    print(handle_bot_detection_action(level_sedikit_diatas_b, "user_zeta"))

    # Sedikit di atas batas A
    user_r_bar_sedikit_diatas_a = mu + 3.001 * sigma
    level_sedikit_diatas_a_val = detect_bot_level(user_r_bar_sedikit_diatas_a, mu, sigma)
    print(f"Pengguna dengan R_bar = {user_r_bar_sedikit_diatas_a:.3f} (sedikit di atas batas A): Level {level_sedikit_diatas_a_val}") # Harusnya A
    print(handle_bot_detection_action(level_sedikit_diatas_a_val, "user_theta"))
