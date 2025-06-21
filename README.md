# Proyek Sistem Deteksi Bot, Payout, dan Keuangan Platform

## 1. Gambaran Umum Proyek

Proyek ini adalah sebuah sistem backend konseptual yang dirancang untuk platform digital (misalnya, platform promosi konten atau media sosial). Tujuan utamanya adalah untuk mendeteksi aktivitas pengguna yang mencurigakan (bot), mengelola perhitungan payout yang adil kepada pengguna (kreator/promotor), menerapkan model harga berbasis penggunaan untuk layanan platform, serta menangani aspek keuangan dasar seperti fee platform dan pemotongan pajak sederhana.

Sistem ini dibangun dengan Python dan dirancang dengan pertimbangan untuk potensi deployment di lingkungan serverless seperti Cloudflare Workers, meskipun implementasi Cloudflare saat ini bersifat konseptual.

## 2. Fitur Inti

*   **Deteksi Aktivitas Bot**:
    *   Mengukur aktivitas pengguna (views, likes, comments) per satuan waktu (`Rate_per_min`).
    *   Menghitung rata-rata aktivitas pengguna harian (`R_bar`).
    *   Mengklasifikasikan pengguna ke dalam level risiko bot (A, B, C) berdasarkan perbandingan `R_bar` dengan parameter statistik populasi pengguna normal (mean $\mu$ dan standar deviasi $\sigma$).
    *   Tindakan otomatis berdasarkan level risiko (misalnya, ban untuk Level A, audit untuk Level B).
*   **Perhitungan Payout Pengguna**:
    *   Menghitung payout harian untuk aktivitas pengguna yang dianggap valid (Level C).
    *   Payout didasarkan pada `R_bar` harian yang valid dan `RateFee` (biaya per unit aktivitas) yang dikonfigurasi.
*   **Model Harga Berbasis Penggunaan (Usage-Based Pricing)**:
    *   Menghitung biaya layanan platform berdasarkan total "rate-unit" (unit aktivitas) yang dikonsumsi.
    *   Menyediakan skema diskon untuk penggunaan volume besar (implikasi paket prabayar).
    *   Menerapkan biaya kelebihan (overage fee) jika penggunaan melebihi batas kredit yang ditentukan.
*   **Pemrosesan Keuangan Platform**:
    *   **Fee Withdrawal Promotor**: Memotong total 12% dari jumlah withdrawal kotor promotor (10% untuk fee platform, 2% untuk PPh).
    *   **Fee Payout Kreator**: Membebankan fee platform sebesar 10% dari jumlah payout kreator sebagai biaya tambahan ke budget pemasang iklan. Kreator menerima jumlah payout penuh.
*   **Integrasi Placeholder**:
    *   **Midtrans**: Simulasi integrasi untuk proses deposit dana kampanye dan withdrawal (payout) pengguna.
    *   **Cloudflare**: Konsep arsitektural untuk deployment menggunakan layanan Cloudflare seperti Workers, D1, R2, dan Durable Objects.

## 3. Struktur Proyek dan Komponen

Proyek ini diorganisir ke dalam beberapa direktori utama untuk memisahkan concerns:

```
project_root/
├── app/  # Semua kode sumber aplikasi
│   ├── __init__.py
│   ├── core/  # Logika inti dan fundamental
│   │   ├── __init__.py
│   │   ├── bot_detection.py
│   │   └── user_activity.py
│   ├── services/  # Layanan spesifik (payout, pricing, finance)
│   │   ├── __init__.py
│   │   ├── payout_calculation.py
│   │   ├── pricing_model.py
│   │   └── finance_processing.py
│   ├── integrations/  # Integrasi dengan layanan eksternal (placeholders)
│   │   ├── __init__.py
│   │   ├── cloudflare_integration.py
│   │   └── midtrans_integration.py
│   ├── config.py  # Konfigurasi global aplikasi
│   └── main.py    # Titik masuk utama simulasi
├── tests/  # Semua tes unit
│   ├── __init__.py
│   ├── test_bot_detection.py
│   ├── test_payout_calculation.py
│   └── test_finance_processing.py
├── wrangler_example.toml  # Contoh konfigurasi Cloudflare Wrangler
└── README.md  # Dokumentasi proyek (file ini)
```

### 3.1. Direktori `app/` - Kode Sumber Aplikasi

*   **`app/__init__.py`**: Menjadikan `app` sebagai Python package.
*   **`app/config.py`**:
    *   Menyimpan semua konstanta konfigurasi global. Termasuk parameter deteksi bot, `RateFee`, parameter model harga, tarif fee platform, tarif PPh, dan placeholder konfigurasi Cloudflare.
    *   Dapat dijalankan dengan `python -m app.config` (dari root direktori) untuk melihat nilai konfigurasi.
*   **`app/main.py`**:
    *   Titik masuk utama untuk menjalankan simulasi end-to-end dari alur deteksi bot dan estimasi payout dasar.
    *   Mengintegrasikan modul dari `app.core` dan `app.services`.
    *   Dapat dijalankan dengan `python -m app.main` (dari root direktori).

#### 3.1.1. `app/core/` - Logika Inti

*   **`app/core/__init__.py`**: Menjadikan `core` sebagai sub-package.
*   **`app/core/bot_detection.py`**:
    *   Logika inti untuk sistem deteksi bot (`calculate_rate_per_minute`, `detect_bot_level`, dll.).
    *   Dapat dijalankan dengan `python -m app.core.bot_detection` untuk contoh.
*   **`app/core/user_activity.py`**:
    *   Kelas `UserSession` untuk melacak aktivitas pengguna.
    *   Dapat dijalankan dengan `python -m app.core.user_activity` untuk contoh.

#### 3.1.2. `app/services/` - Layanan Aplikasi

*   **`app/services/__init__.py`**: Menjadikan `services` sebagai sub-package.
*   **`app/services/payout_calculation.py`**:
    *   Fungsi `calculate_daily_payout` untuk estimasi payout harian.
    *   Dapat dijalankan dengan `python -m app.services.payout_calculation` untuk contoh.
*   **`app/services/pricing_model.py`**:
    *   Logika model harga berbasis penggunaan (`calculate_usage_cost_with_overage`).
    *   Dapat dijalankan dengan `python -m app.services.pricing_model` untuk contoh.
*   **`app/services/finance_processing.py`**:
    *   Logika keuangan untuk fee platform dan pajak (`process_promoter_withdrawal`, `process_creator_payout_from_budget`).
    *   Dapat dijalankan dengan `python -m app.services.finance_processing` untuk contoh.

#### 3.1.3. `app/integrations/` - Integrasi Eksternal (Placeholder)

*   **`app/integrations/__init__.py`**: Menjadikan `integrations` sebagai sub-package.
*   **`app/integrations/cloudflare_integration.py`** (Konseptual):
    *   Placeholder simulasi interaksi dengan layanan Cloudflare.
    *   Dapat dijalankan dengan `python -m app.integrations.cloudflare_integration` untuk contoh.
*   **`app/integrations/midtrans_integration.py`** (Placeholder):
    *   Placeholder simulasi interaksi dengan payment gateway Midtrans.
    *   Dapat dijalankan dengan `python -m app.integrations.midtrans_integration` untuk contoh.

### 3.2. Direktori `tests/` - Tes Unit

*   **`tests/__init__.py`**: Menjadikan `tests` sebagai Python package.
*   **`tests/test_bot_detection.py`**: Tes unit untuk `app.core.bot_detection`.
*   **`tests/test_payout_calculation.py`**: Tes unit untuk `app.services.payout_calculation`.
*   **`tests/test_finance_processing.py`**: Tes unit untuk `app.services.finance_processing`.

### 3.3. File Lain di Root Direktori

*   **`wrangler_example.toml`**: Contoh file konfigurasi `wrangler.toml` untuk deployment Cloudflare.
*   **`README.md`** (File ini): Dokumentasi utama proyek.

## 4. Alur Kerja Utama (Konseptual & Simulasi)

1.  **Konfigurasi Sistem**: Administrator mengatur parameter penting di `config.py` (misalnya, threshold deteksi bot, rate fee, tarif pajak, dll.).
2.  **Aktivitas Pengguna**: Pengguna berinteraksi dengan platform, menghasilkan data aktivitas (views, likes, comments). Modul `user_activity.py` mensimulasikan pencatatan ini.
3.  **Deteksi Bot Periodik**:
    *   Sistem secara periodik (misalnya, per menit atau per jam) menghitung `Rate_per_min` untuk pengguna aktif.
    *   Berdasarkan akumulasi data, `R_bar` harian dihitung.
    *   `bot_detection.detect_bot_level` menentukan level risiko pengguna.
    *   Tindakan seperti blokir atau audit diambil berdasarkan level ini.
4.  **Perhitungan Payout Harian (Kreator/Promotor Umum)**:
    *   Untuk pengguna dengan aktivitas valid (Level C), `payout_calculation.calculate_daily_payout` menghitung potensi payout mereka berdasarkan `R_bar` dan `RateFee`.
5.  **Proses Withdrawal Promotor**:
    *   Promotor meminta withdrawal.
    *   `finance_processing.process_promoter_withdrawal` menghitung potongan (10% fee platform + 2% PPh) dan jumlah bersih yang akan dibayarkan.
    *   `midtrans_integration.initiate_midtrans_payout` (simulasi) dipanggil untuk proses transfer.
6.  **Proses Payout Kreator**:
    *   Sistem menentukan jumlah payout untuk kreator.
    *   `finance_processing.process_creator_payout_from_budget` menghitung tambahan 10% fee platform yang diambil dari budget pemasang iklan.
    *   Jika budget cukup, payout ke kreator diproses (secara konseptual melalui Midtrans), dan budget iklan dikurangi.
7.  **Deposit Dana Kampanye oleh Advertiser**:
    *   Advertiser melakukan deposit.
    *   `midtrans_integration.initiate_midtrans_deposit` (simulasi) menangani interaksi dengan payment gateway.
8.  **Perhitungan Biaya Layanan Platform**:
    *   Secara periodik (misalnya, bulanan), `pricing_model.calculate_usage_cost_with_overage` digunakan untuk menghitung total biaya yang harus dibayar oleh klien (misalnya, pemasang iklan) berdasarkan total rate-unit yang mereka konsumsi.

## 5. Menjalankan Kode

### 5.1. Menjalankan Simulasi Utama

Untuk menjalankan simulasi deteksi bot dan payout dasar dari `app/main.py`, gunakan perintah berikut dari direktori root proyek:
```bash
python -m app.main
```

### 5.2. Menjalankan Modul Individual (untuk melihat contoh spesifik)

Setiap modul dengan blok `if __name__ == '__main__':` dapat dijalankan secara individual untuk melihat contoh penggunaannya. Jalankan dari direktori root proyek:
```bash
python -m app.config
python -m app.core.bot_detection
python -m app.core.user_activity
python -m app.services.payout_calculation
python -m app.services.pricing_model
python -m app.services.finance_processing
python -m app.integrations.cloudflare_integration
python -m app.integrations.midtrans_integration
```

### 5.3. Menjalankan Tes Unit

Untuk menjalankan semua tes unit yang ada di direktori `tests/`, gunakan perintah berikut dari direktori root proyek:
```bash
python -m unittest discover tests
```
Atau untuk menjalankan tes dari file tertentu (misalnya, `test_bot_detection.py`):
```bash
python -m unittest tests.test_bot_detection
```

## 6. Keterbatasan dan Pengembangan Lebih Lanjut

*   **Implementasi Nyata vs. Konseptual**: Banyak bagian (terutama `cloudflare_integration.py` dan `midtrans_integration.py`) bersifat konseptual dan memerlukan implementasi nyata menggunakan SDK/API terkait.
*   **Manajemen State**: Penyimpanan dan pengelolaan state pengguna (seperti `R_bar` aktual, saldo budget, dll.) memerlukan database (seperti D1) dan/atau Durable Objects.
*   **Otentikasi & Otorisasi**: Belum diimplementasikan.
*   **Antarmuka Pengguna (UI/Admin Panel)**: Proyek ini fokus pada logika backend. UI dan admin panel perlu dikembangkan secara terpisah.
*   **Detail Pajak**: Perhitungan pajak (PPh) saat ini sangat sederhana. Implementasi pajak yang akurat memerlukan konsultasi dengan ahli pajak dan penyesuaian sesuai yurisdiksi. PPN belum diimplementasikan.
*   **Keamanan**: Aspek keamanan (validasi input, proteksi API, dll.) perlu perhatian khusus dalam implementasi produksi.
*   **Skalabilitas dan Performa**: Perlu dipertimbangkan lebih lanjut saat menuju produksi, terutama untuk pengolahan data aktivitas dalam volume besar.
*   **CI/CD Pipeline**: Untuk otomatisasi build, tes, dan deployment.

Proyek ini menyediakan fondasi yang solid untuk dikembangkan menjadi sistem yang lebih lengkap dan siap produksi.
```
