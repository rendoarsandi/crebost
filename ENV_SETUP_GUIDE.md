# Panduan Setup Variabel Environment Proyek

Dokumen ini menjelaskan variabel environment penting yang dibutuhkan oleh berbagai layanan dan worker dalam proyek Platform Promosi Konten Kreator. Pastikan variabel ini di-set dengan benar di lingkungan lokal (`.env.local`) dan di pengaturan environment Cloudflare (Pages & Workers) untuk deployment.

**PENTING**: Jangan pernah meng-commit file `.env.local` atau nilai secret aktual ke repository Git Anda.

## 1. Variabel Global / Umum (Biasanya di `.env.local` root dan di Cloudflare)

### 1.1. Konfigurasi Database (Prisma & D1)
*   **`DATABASE_URL`**: URL koneksi untuk database D1 Anda.
    *   **Lokal (untuk Prisma CLI saat development dengan D1 lokal atau remote proxy)**:
        *   Jika menggunakan D1 lokal via `wrangler dev --persist`, Prisma mungkin tidak langsung menggunakan ini, tetapi beberapa perintah Prisma CLI mungkin memerlukannya. Formatnya bisa: `file:./.wrangler/state/v3/d1/YOUR_DB_ID/db.sqlite` (sesuaikan path dan ID).
        *   Atau jika menggunakan Prisma Accelerate/Pulse dengan D1: `prisma://accelerate.prisma-data.net/?api_key=YOUR_ACCELERATE_API_KEY`
    *   **Cloudflare (Worker/Pages)**: Biasanya tidak di-set secara eksplisit sebagai env var jika menggunakan D1 binding. Binding D1 di `wrangler.toml` akan menangani koneksi. Namun, jika ada bagian kode (selain Prisma Client dengan D1 adapter) yang memerlukan URL ini, sesuaikan.
    *   **Catatan**: Prisma Client yang diinisialisasi dengan `PrismaD1` adapter di dalam worker akan menggunakan binding D1 dari `wrangler.toml`, bukan `DATABASE_URL` ini secara langsung. `DATABASE_URL` lebih relevan untuk perintah Prisma CLI seperti `prisma migrate` atau `db push` saat menargetkan D1.

### 1.2. Konfigurasi Otentikasi (`better-auth` / NextAuth.js)
Digunakan terutama oleh aplikasi `apps/auth` dan mungkin oleh aplikasi lain yang perlu memvalidasi sesi atau mengarahkan ke login.

*   **`NEXTAUTH_URL`** (atau **`BETTER_AUTH_URL`** jika `better-auth` menggunakan nama ini): URL publik lengkap dari aplikasi otentikasi Anda.
    *   Lokal: `http://localhost:PORT_APPS_AUTH` (misalnya, `http://localhost:3000` jika `apps/auth` berjalan di port 3000).
    *   Produksi: `https://auth.yourdomain.com`
*   **`NEXTAUTH_SECRET`** (atau **`BETTER_AUTH_SECRET`**): String acak yang sangat panjang dan rahasia, digunakan untuk menandatangani cookie sesi, token JWT, dll. Harus sama di semua lingkungan (lokal, preview, produksi) jika Anda ingin sesi konsisten.
    *   Anda bisa generate dengan `openssl rand -base64 32`.
*   **`GOOGLE_CLIENT_ID`**: Client ID dari Google Cloud Console untuk OAuth Google.
*   **`GOOGLE_CLIENT_SECRET`**: Client Secret dari Google Cloud Console untuk OAuth Google.
*   **`TIKTOK_CLIENT_ID`**: Client ID dari TikTok for Developers untuk OAuth TikTok.
*   **`TIKTOK_CLIENT_SECRET`**: Client Secret dari TikTok for Developers untuk OAuth TikTok.
*   **`INSTAGRAM_CLIENT_ID`**: Client ID (Instagram App ID) dari Meta for Developers untuk Instagram Basic Display API.
*   **`INSTAGRAM_CLIENT_SECRET`**: Client Secret (Instagram App Secret) dari Meta for Developers.

### 1.3. URL Aplikasi Lain (untuk Navigasi & `trustedOrigins`)
Variabel ini digunakan oleh `apps/auth` (di `trustedOrigins`) dan mungkin oleh aplikasi lain untuk link.
*   **`NEXT_PUBLIC_LANDING_URL`**: URL aplikasi `apps/landing`.
    *   Lokal: `http://localhost:PORT_APPS_LANDING`
    *   Produksi: `https://yourdomain.com` atau `https://landing.yourdomain.com`
*   **`NEXT_PUBLIC_DASHBOARD_URL`**: URL aplikasi `apps/dashboard`.
    *   Lokal: `http://localhost:PORT_APPS_DASHBOARD`
    *   Produksi: `https://dashboard.yourdomain.com`
*   **`NEXT_PUBLIC_ADMIN_URL`**: URL aplikasi `apps/admin`.
    *   Lokal: `http://localhost:PORT_APPS_ADMIN`
    *   Produksi: `https://admin.yourdomain.com`

## 2. Variabel Spesifik Worker

### 2.1. `workers/social-api-harvester`
Selain D1 binding (dikonfigurasi di `wrangler.toml`), worker ini mungkin memerlukan:
*   **`YOUTUBE_API_KEY`** (Opsional, di `[vars]` pada `wrangler.toml` atau secret): Jika Anda ingin menggunakan API Key untuk mengambil data dari video YouTube publik (selain atau sebagai alternatif dari OAuth pengguna).
*   **Secrets untuk Refresh Token Aplikasi (jika diimplementasikan)**: Jika `social-api-harvester` melakukan refresh token OAuth atas nama *aplikasi Anda sendiri* (bukan pengguna), Client ID dan Secret aplikasi Anda untuk platform tersebut mungkin perlu sebagai secret di Cloudflare. Ini skenario lanjutan.

### 2.2. Worker Lain (`metric-scheduler`, `bot-analyzer`, `payout-processor`)
Umumnya hanya memerlukan D1 binding yang sudah dikonfigurasi di `wrangler.toml` mereka. Jika ada konfigurasi spesifik (misalnya, threshold default untuk `bot-analyzer` yang tidak dari DB), itu bisa ditambahkan sebagai `[vars]` di `wrangler.toml` masing-masing.

## 3. Cara Mengatur Variabel Environment

### 3.1. Pengembangan Lokal
*   Buat file `.env.local` di root direktori monorepo Anda.
*   Tambahkan semua variabel yang relevan ke file ini dengan format `NAMA_VARIABEL=nilai`.
    ```env
    # Contoh .env.local
    DATABASE_URL="file:./.wrangler/state/v3/d1/YOUR_LOCAL_DB_ID/db.sqlite" # Sesuaikan path jika D1 lokal

    NEXTAUTH_URL=http://localhost:3000 # Asumsi apps/auth di port 3000
    NEXTAUTH_SECRET=isisuperrahasiadisiniyangpanjangsekali

    GOOGLE_CLIENT_ID=your_google_client_id_dev
    GOOGLE_CLIENT_SECRET=your_google_client_secret_dev

    TIKTOK_CLIENT_ID=your_tiktok_client_id_dev
    TIKTOK_CLIENT_SECRET=your_tiktok_client_secret_dev

    INSTAGRAM_CLIENT_ID=your_instagram_client_id_dev
    INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret_dev

    NEXT_PUBLIC_LANDING_URL=http://localhost:3001 # Contoh port
    NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3002 # Contoh port
    NEXT_PUBLIC_ADMIN_URL=http://localhost:3003 # Contoh port

    # Untuk worker jika diuji lokal dan memerlukan vars (biasanya wrangler dev mengambil dari wrangler.toml)
    # YOUTUBE_API_KEY_DEV=your_youtube_api_key_dev
    ```
*   Next.js akan otomatis me-load variabel dari `.env.local` untuk aplikasi di `apps/`.
*   Untuk worker yang dijalankan dengan `wrangler dev`, variabel di `[vars]` dalam `wrangler.toml` akan digunakan. Jika Anda perlu override untuk lokal, Anda bisa menggunakan file `.dev.vars` di direktori worker, atau men-setnya di terminal sebelum menjalankan `wrangler dev`.

### 3.2. Deployment Cloudflare
*   **Cloudflare Pages (untuk aplikasi Next.js di `apps/`):**
    *   Buka Dashboard Cloudflare -> Workers & Pages -> Pilih aplikasi Pages Anda.
    *   Navigasi ke Settings -> Environment Variables.
    *   Tambahkan variabel untuk **Production** dan **Preview environments**.
    *   Tandai variabel sensitif (seperti Client Secrets, `NEXTAUTH_SECRET`) sebagai **"Secret"** agar dienkripsi.
*   **Cloudflare Workers (untuk worker di `workers/`):**
    *   Variabel non-sensitif bisa ditaruh di `[vars]` dalam `wrangler.toml` masing-masing worker.
    *   Variabel sensitif **HARUS** di-set sebagai **secret** menggunakan Wrangler CLI:
        ```bash
        npx wrangler secret put NAMA_SECRET_DI_WORKER --env production
        # Anda akan diminta memasukkan nilainya.
        # Contoh: npx wrangler secret put YOUTUBE_API_KEY --env production (jika YOUTUBE_API_KEY adalah secret)
        # npx wrangler secret put SECRET_TIKTOK_APP_CLIENT_SECRET --env production
        ```
        Binding D1 dan Queue sudah diatur di `wrangler.toml` dan tidak perlu di-set sebagai env var terpisah di UI Worker.

Pastikan untuk mengumpulkan semua kredensial API dan secret yang diperlukan dari masing-masing platform (Google, TikTok, Instagram, YouTube) dan layanan email (jika menggunakan EmailProvider standar) sebelum memulai pengembangan atau deployment.
