# Konfigurasi untuk Deteksi Bot dan Perhitungan Payout

# --- Parameter Deteksi Bot ---
# Rata-rata (mu) aktivitas normal pengguna (V+L+C per menit)
# Ini adalah nilai contoh dan harus disesuaikan berdasarkan data historis pengguna aktual.
MEAN_NORMAL_ACTIVITY: float = 10.0

# Standar deviasi (sigma) aktivitas normal pengguna (V+L+C per menit)
# Ini juga nilai contoh dan harus disesuaikan.
STD_DEV_NORMAL_ACTIVITY: float = 2.0

# Durasi pengukuran standar untuk Rate_per_min dalam menit.
# Misalnya, jika aktivitas dihitung setiap 1 menit.
DEFAULT_MEASUREMENT_DURATION_MINUTES: float = 1.0

# Jumlah interval pengukuran dalam sehari (jika R_bar dihitung dari N interval)
# N = 24 jam * 60 menit/jam / DEFAULT_MEASUREMENT_DURATION_MINUTES
# Jika DEFAULT_MEASUREMENT_DURATION_MINUTES = 1, maka N_INTERVALS_PER_DAY = 1440.
N_INTERVALS_PER_DAY: int = int(24 * 60 / DEFAULT_MEASUREMENT_DURATION_MINUTES)


# --- Parameter Payout ---
# RateFee adalah nilai bayaran per unit aktivitas.
# Misal, jika Rp 1.500 per unit (V+L+C), maka nilainya 1500.
# Jika dalam satuan ribuan rupiah, bisa 1.5.
# Untuk konsistensi, kita gunakan nilai absolutnya.
# (Contoh: 1.5 jika mata uangnya adalah 'ribuan Rupiah', atau 1500 jika 'Rupiah')
# Mari kita asumsikan ini adalah nilai dalam mata uang dasar (misal, Rupiah).
RATE_FEE_PER_ACTIVITY: float = 1.5 # Contoh: Rp 1.5 (dalam unit mata uang dasar) per unit aktivitas (V, L, atau C).

# --- Parameter Model Harga (Usage-Based Pricing) ---
# Biaya per 1.000 rate-unit.
# Rate-unit di sini bisa diinterpretasikan sebagai 1 unit aktivitas (V+L+C).
# Jika R_bar = 10 (aktivitas/menit), maka dalam sehari ada 10 * 1440 = 14400 rate-unit (aktivitas).
# Dinyatakan dalam unit mata uang dasar (misal, Rupiah).
COST_PER_1000_RATE_UNITS: float = 10000.0 # Contoh: Rp 10.000 (dalam unit mata uang dasar) per 1.000 rate-unit (aktivitas).

# Batas rate-unit untuk mendapatkan diskon (paket prepaid credit)
PREPAID_CREDIT_DISCOUNT_THRESHOLD_RATE_UNITS: int = 10_000_000 # 10 juta rate-unit

# Faktor tarif premium untuk kelebihan pemakaian (overage fee)
OVERAGE_FEE_MULTIPLIER: float = 1.5 # 1.5x dari tarif normal


# --- Konfigurasi Cloudflare (Placeholder) ---
# Ini adalah contoh dan mungkin perlu disesuaikan
CLOUDFLARE_ACCOUNT_ID: str = "YOUR_CLOUDFLARE_ACCOUNT_ID"
CLOUDFLARE_API_TOKEN: str = "YOUR_CLOUDFLARE_API_TOKEN"

# Nama layanan atau skrip untuk Workers
WORKER_SERVICE_AUTH: str = "auth"
WORKER_SERVICE_LANDING: str = "landing"
WORKER_SERVICE_DASHBOARD: str = "dashboard"
WORKER_SERVICE_ADMIN: str = "admin"
WORKER_SERVICE_TRACKING_API: str = "tracking-api" # Untuk endpoint tracking aktivitas

# Konfigurasi Durable Objects (Nama Class)
DO_USER_STATE_CLASS_NAME: str = "UserStateDO"

# Konfigurasi R2 Storage
R2_BUCKET_LOGS: str = "activity-logs-bucket"

# Konfigurasi D1 Database
D1_DATABASE_ID: str = "YOUR_D1_DATABASE_ID"
D1_TABLE_USERS: str = "users"
D1_TABLE_CAMPAIGNS: str = "campaigns"
D1_TABLE_VIEWS: str = "views_log" # Mungkin lebih baik views, likes, comments dalam satu tabel aktivitas
D1_TABLE_THRESHOLDS: str = "bot_thresholds" # Bisa juga disimpan sebagai konstanta jika tidak sering berubah

# Pesan ini bisa digunakan untuk memberitahu pengguna agar mengganti nilai placeholder
PLACEHOLDER_MESSAGE: str = "Harap perbarui nilai placeholder di config.py dengan konfigurasi Anda yang sebenarnya."

if __name__ == '__main__':
    print("Konfigurasi dimuat:")
    print(f"  MEAN_NORMAL_ACTIVITY: {MEAN_NORMAL_ACTIVITY}")
    print(f"  STD_DEV_NORMAL_ACTIVITY: {STD_DEV_NORMAL_ACTIVITY}")
    print(f"  DEFAULT_MEASUREMENT_DURATION_MINUTES: {DEFAULT_MEASUREMENT_DURATION_MINUTES}")
    print(f"  N_INTERVALS_PER_DAY: {N_INTERVALS_PER_DAY}")
    print(f"  RATE_FEE_PER_ACTIVITY: {RATE_FEE_PER_ACTIVITY}")
    print(f"  COST_PER_1000_RATE_UNITS: {COST_PER_1000_RATE_UNITS}")
    print(f"  PREPAID_CREDIT_DISCOUNT_THRESHOLD_RATE_UNITS: {PREPAID_CREDIT_DISCOUNT_THRESHOLD_RATE_UNITS}")
    print(f"  OVERAGE_FEE_MULTIPLIER: {OVERAGE_FEE_MULTIPLIER}")

    print(f"\n  {PLACEHOLDER_MESSAGE}")
    print(f"  Contoh Worker service untuk auth: {WORKER_SERVICE_AUTH}")
    print(f"  Contoh R2 Bucket untuk logs: {R2_BUCKET_LOGS}")
    print(f"  Contoh D1 Database ID: {D1_DATABASE_ID}")

# --- Parameter Finansial & Fee (Baru Ditambahkan) ---

# Tarif PPh Pasal 21 (atau PPh terkait lainnya) untuk withdrawal promotor.
# Contoh: 2% = 0.02
PROMOTER_WITHDRAWAL_PPH_RATE: float = 0.02

# Tarif fee platform yang diambil dari withdrawal promotor.
# Contoh: 10% = 0.10
PROMOTER_PLATFORM_FEE_RATE: float = 0.10

# Tarif fee platform yang dibebankan ke budget pemasang iklan saat payout ke kreator.
# Fee ini dihitung berdasarkan jumlah payout ke kreator.
# Contoh: 10% = 0.10
CREATOR_PLATFORM_FEE_RATE_ON_ADVERTISER_BUDGET: float = 0.10


if __name__ == '__main__':
    print("Konfigurasi dimuat:")
    print(f"  MEAN_NORMAL_ACTIVITY: {MEAN_NORMAL_ACTIVITY}")
    print(f"  STD_DEV_NORMAL_ACTIVITY: {STD_DEV_NORMAL_ACTIVITY}")
    print(f"  DEFAULT_MEASUREMENT_DURATION_MINUTES: {DEFAULT_MEASUREMENT_DURATION_MINUTES}")
    print(f"  N_INTERVALS_PER_DAY: {N_INTERVALS_PER_DAY}")
    print(f"  RATE_FEE_PER_ACTIVITY: {RATE_FEE_PER_ACTIVITY}")
    print(f"  COST_PER_1000_RATE_UNITS: {COST_PER_1000_RATE_UNITS}")
    print(f"  PREPAID_CREDIT_DISCOUNT_THRESHOLD_RATE_UNITS: {PREPAID_CREDIT_DISCOUNT_THRESHOLD_RATE_UNITS}")
    print(f"  OVERAGE_FEE_MULTIPLIER: {OVERAGE_FEE_MULTIPLIER}")

    print("\n  Parameter Finansial & Fee:")
    print(f"  PROMOTER_WITHDRAWAL_PPH_RATE: {PROMOTER_WITHDRAWAL_PPH_RATE}")
    print(f"  PROMOTER_PLATFORM_FEE_RATE: {PROMOTER_PLATFORM_FEE_RATE}")
    print(f"  CREATOR_PLATFORM_FEE_RATE_ON_ADVERTISER_BUDGET: {CREATOR_PLATFORM_FEE_RATE_ON_ADVERTISER_BUDGET}")

    print(f"\n  {PLACEHOLDER_MESSAGE}")
    print(f"  Contoh Worker service untuk auth: {WORKER_SERVICE_AUTH}")
    print(f"  Contoh R2 Bucket untuk logs: {R2_BUCKET_LOGS}")
    print(f"  Contoh D1 Database ID: {D1_DATABASE_ID}")
