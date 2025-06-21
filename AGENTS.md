# AGENTS.MD - Panduan untuk Agen AI

Selamat datang di proyek Platform Promosi Konten Kreator! Dokumen ini bertujuan untuk memberikan konteks dan panduan kepada agen AI yang mengerjakan codebase ini.

## Ringkasan Proyek Utama

Platform ini adalah **pasar perantara** yang menghubungkan **Konten Kreator** (yang ingin mempromosikan konten/akun mereka) dengan **Promotor** (yang akan melakukan promosi di akun media sosial eksternal mereka dan dibayar berdasarkan performa).

**Alur Kerja Inti:**
1.  **Kreator**: Membuat kampanye promosi di platform, menentukan budget, dan kriteria (misalnya, bayaran per 1000 views). Mereka juga bisa menyediakan materi promosi.
2.  **Promotor**: Mendaftar di platform, menelusuri kampanye, dan mengambil pekerjaan promosi.
3.  **Promosi oleh Promotor**: Promotor membuat dan mempublikasikan konten promosi di akun media sosial **eksternal** mereka (fokus utama: TikTok, Instagram, YouTube).
4.  **Pelaporan oleh Promotor**: Promotor men-submit URL postingan media sosial mereka ke platform sebagai bukti pelaksanaan promosi.
5.  **Pengambilan Metrik Otomatis**: Platform (melalui Cloudflare Workers & Queues) secara periodik mengambil metrik performa (views, likes, comments) langsung dari **API platform media sosial** terkait (TikTok, Instagram, YouTube) untuk postingan yang disubmit promotor. Ini memerlukan promotor untuk menghubungkan (OAuth) akun media sosial mereka ke platform.
6.  **Analisis & Deteksi Bot**: Metrik yang diambil dianalisis untuk mendeteksi aktivitas yang tidak wajar atau kemungkinan penggunaan bot (misalnya, lonjakan views yang tidak natural, rasio engagement yang aneh).
7.  **Payout**: Promotor dibayar berdasarkan metrik yang telah diverifikasi dan dianggap valid, sesuai dengan rate yang ditentukan dalam kampanye.

**PENTING: Sistem TIDAK melacak aktivitas (views/likes/comments) yang terjadi di dalam platform ini sendiri untuk tujuan promosi utama. Sumber kebenaran metrik adalah API platform media sosial eksternal.**

## Arsitektur Teknis Utama (Cloudflare Centric)

*   **Monorepo (TurboRepo)**:
    *   `apps/`: Aplikasi Next.js (landing, auth, dashboard, admin, api-gateway-nextjs).
    *   `packages/`: Paket bersama (database Prisma, UI, shared-types, config).
    *   `workers/`: Cloudflare Workers untuk tugas backend.
*   **Database**: Cloudflare D1 (diakses melalui Prisma ORM).
*   **Penyimpanan Objek**: Cloudflare R2 (direncanakan untuk aset kampanye).
*   **Streaming Video**: Cloudflare Stream (direncanakan untuk preview materi).
*   **Compute Backend**:
    *   **Cloudflare Workers**:
        *   `metric-scheduler-worker`: Menjadwalkan tugas pengambilan metrik ke queue.
        *   `social-api-harvester-worker`: Mengambil data dari API TikTok, Instagram, YouTube. **Ini adalah bagian yang kompleks dan memerlukan implementasi detail interaksi API per platform.**
        *   `bot-analyzer-worker`: Menganalisis data metrik yang terkumpul, menerapkan aturan deteksi bot. **Logika aturan bot perlu dikembangkan secara iteratif.**
        *   `payout-processor-worker`: Menghitung dan memproses payout.
        *   (Mungkin ada worker lain untuk API backend jika tidak menggunakan Next.js API routes di `apps/api`).
    *   **Cloudflare Queues**: Digunakan untuk mendistribusikan tugas pengambilan metrik (`metric-harvest-queue`).
*   **Otentikasi**: `better-auth` (di `apps/auth`) untuk login pengguna platform (Kreator, Promotor, Admin) via Email/Password, Google, dan direncanakan TikTok, Instagram. Otentikasi ini juga krusial untuk mendapatkan izin OAuth dari Promotor agar sistem bisa mengambil data analitik dari akun media sosial mereka.
*   **Deployment**: Cloudflare Pages untuk aplikasi Next.js, dan Wrangler untuk Workers.

## Fokus Pengembangan Saat Ini (atau Setelahnya)

*   **Implementasi Detail Interaksi API di `social-api-harvester-worker`**: Ini adalah prioritas utama. Setiap platform (TikTok, Instagram Graph API, YouTube Data API) memerlukan penanganan spesifik untuk otentikasi, endpoint, parsing data, dan error handling.
*   **Pengembangan Logika Deteksi Bot di `bot-analyzer-worker`**: Membuat aturan yang efektif berdasarkan metrik yang bisa diambil (misalnya, laju pertumbuhan, rasio, deteksi lonjakan).
*   **Penyempurnaan Alur OAuth Promotor**: Memastikan promotor bisa dengan mudah menghubungkan akun media sosial mereka dan token disimpan/digunakan dengan aman.
*   **Implementasi UI Frontend**: Untuk semua alur pengguna (submit URL, lihat status metrik, lihat payout, koneksi akun medsos) dan admin (monitoring, manajemen threshold).
*   **Pengujian Menyeluruh**: Terutama untuk interaksi API eksternal dan logika deteksi bot.

## Hal yang Perlu Diperhatikan Agen

*   **Rate Limiting API Eksternal**: Selalu perhatikan batasan ini saat mengembangkan `social-api-harvester`. Gunakan antrian dan strategi backoff.
*   **Perubahan API Eksternal**: API media sosial bisa berubah. Kode interaksi API mungkin perlu dipelihara.
*   **Keamanan Token OAuth**: Pastikan token akses promotor disimpan dan digunakan dengan aman.
*   **Placeholder**: Beberapa bagian kode (terutama otentikasi di API endpoint dan logika inti di worker harvester/analyzer) mungkin masih berupa kerangka atau placeholder yang perlu diisi dengan implementasi penuh.

Semoga panduan ini membantu!
