# Sistem Deteksi Bot dan Manajemen Payout

Proyek ini mengimplementasikan sistem untuk mendeteksi aktivitas bot berdasarkan perilaku pengguna dan mengelola perhitungan payout untuk aktivitas yang valid. Sistem ini dirancang dengan mempertimbangkan deployment di lingkungan Cloudflare.

## Fitur Utama

1.  **Deteksi Bot Berbasis Aktivitas**:
    *   Mengukur aktivitas pengguna (views, likes, comments) per menit (`Rate_per_min`).
    *   Menghitung rata-rata aktivitas pengguna (`R_bar`) selama periode tertentu (misalnya, harian).
    *   Mengklasifikasikan pengguna ke dalam level risiko bot (A, B, C) berdasarkan perbandingan `R_bar` mereka dengan mean ($\mu$) dan standar deviasi ($\sigma$) dari aktivitas pengguna normal.
        *   **Level A**: Aktivitas sangat tinggi (di atas $\mu + 3\sigma$), mengindikasikan kemungkinan besar bot. Akun diblokir dan payout dibatalkan.
        *   **Level B**: Aktivitas mencurigakan ($\mu + 2\sigma < \overline{R} \le \mu + 3\sigma$). Pengguna diberi peringatan dan akun ditandai untuk audit manual.
        *   **Level C**: Aktivitas dianggap valid ($\overline{R} \le \mu + 2\sigma$).

2.  **Perhitungan Payout Harian**:
    *   Payout dihitung untuk pengguna dengan aktivitas valid (Level C).
    *   Rumus: `Payout_harian = (R_bar_harian_valid * Jumlah_Menit_Dalam_Hari) * RateFee`.
    *   `RateFee` adalah nilai bayaran per unit aktivitas.

3.  **Model Harga Berbasis Penggunaan (Usage-Based Pricing)**:
    *   Biaya dikenakan per 1.000 "rate-unit" (satu unit aktivitas = satu rate-unit).
    *   Diskon volume untuk penggunaan dalam jumlah besar (misalnya, di atas 10 juta rate-unit).
    *   Biaya kelebihan (overage fee) dengan tarif premium jika pemakaian melebihi batas kredit yang telah dibeli/ditentukan.

4.  **Arsitektur Cloudflare (Konseptual)**:
    *   **Workers**: Untuk menangani endpoint API (login, tracking aktivitas).
    *   **Durable Objects**: Untuk menyimpan state per pengguna (misalnya, `Rate_per_min` saat ini, status flag).
    *   **R2 Storage**: Untuk menyimpan log aktivitas mentah.
    *   **D1 Database**: Untuk menyimpan data pengguna, kampanye, histori aktivitas terstruktur, dan mungkin threshold.
    *   Contoh konfigurasi `wrangler.toml` disediakan untuk routing subdomain.

## Struktur Proyek

*   `main.py`: Titik masuk utama untuk menjalankan simulasi alur deteksi bot dan payout.
*   `bot_detection.py`: Berisi logika inti untuk menghitung rate aktivitas dan menentukan level deteksi bot.
*   `user_activity.py`: Mengelola data dan sesi aktivitas pengguna (views, likes, comments).
*   `payout_calculation.py`: Menangani perhitungan payout harian.
*   `pricing_model.py`: Mengimplementasikan logika untuk model harga berbasis penggunaan.
*   `config.py`: Menyimpan konstanta konfigurasi (misalnya, $\mu$, $\sigma$, `RateFee`, parameter harga).
*   `cloudflare_integration.py`: Berisi kelas dan fungsi konseptual untuk menunjukkan bagaimana interaksi dengan layanan Cloudflare (Workers, D1, R2, DO) dapat dilakukan.
*   `wrangler_example.toml`: Contoh file konfigurasi `wrangler.toml` untuk deployment Cloudflare.
*   `README.md`: File ini.

## Cara Kerja (Simulasi)

1.  **Konfigurasi**: Parameter seperti `MEAN_NORMAL_ACTIVITY` ($\mu$), `STD_DEV_NORMAL_ACTIVITY` ($\sigma$), dan `RATE_FEE_PER_ACTIVITY` diatur dalam `config.py`.
2.  **Simulasi Sesi Pengguna**: `main.py` menjalankan skenario-skenario:
    *   Sesi pengguna baru dibuat menggunakan `user_activity.UserSession`.
    *   Serangkaian aktivitas (views, likes, comments) disimulasikan untuk pengguna tersebut.
3.  **Perhitungan Rate**:
    *   `bot_detection.calculate_rate_per_minute()` menghitung `Rate_per_min` berdasarkan aktivitas dalam periode pengukuran `T` (default 1 menit).
4.  **Deteksi Bot**:
    *   `bot_detection.detect_bot_level()` membandingkan `Rate_per_min` pengguna (sebagai proxy untuk $\overline{R}$ dalam simulasi ini) dengan threshold $\mu \pm k\sigma$.
    *   Tindakan yang sesuai (`handle_bot_detection_action`) ditentukan.
5.  **Perhitungan Payout**:
    *   Jika pengguna diklasifikasikan sebagai Level C (valid), `payout_calculation.calculate_daily_payout()` mengestimasi payout harian. Dalam simulasi, rate periode tunggal digunakan sebagai proxy untuk $\overline{R}$ harian.
6.  **Perhitungan Biaya (Model Harga)**:
    *   `pricing_model.py` dapat digunakan secara terpisah untuk menghitung biaya berdasarkan total rate-unit yang dikonsumsi, dengan mempertimbangkan diskon volume dan overage.

## Untuk Menjalankan Simulasi

Simulasi utama dapat dijalankan dengan mengeksekusi `main.py`:
```bash
python main.py
```
Ini akan mencetak output dari berbagai skenario pengguna (normal, bot level A, bot level B, dll.) beserta hasil deteksi dan estimasi payout.

Modul lain seperti `pricing_model.py` juga dapat dijalankan secara individual untuk melihat contoh perhitungannya:
```bash
python pricing_model.py
```

## Pengembangan Lebih Lanjut

*   Implementasi penuh interaksi dengan layanan Cloudflare (Workers, D1, R2, DO).
*   Pengembangan mekanisme untuk menghitung $\overline{R}$ secara akurat dari data historis per pengguna yang disimpan di D1/DO.
*   Pembuatan dashboard admin untuk memantau aktivitas, audit pengguna Level B, dan mengelola konfigurasi.
*   Integrasi dengan sistem otentikasi dan manajemen pengguna yang sebenarnya.
*   Pengembangan CI/CD pipeline untuk deployment ke Cloudflare.
```
