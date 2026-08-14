# Pojok Gizi by Aden

Aplikasi web pencatatan & monitoring status gizi karyawan (Next.js App Router +
Prisma + PostgreSQL). Dua level akses:

- **Publik (tanpa login)**: hanya halaman `/request-gizi`.
- **Nutrisionist (login)**: `/dashboard`, `/pemeriksaan`, `/rekap`.

## Struktur Cepat

```
app/                 # halaman (App Router) + API routes (app/api/*)
lib/                 # kalkulasi auto-calc, prisma client, auth/session
prisma/schema.prisma # skema database
prisma/seed.js       # membuat akun Nutrisionist pertama + master perusahaan
middleware.js         # proteksi route publik vs Nutrisionist
```

Tech stack: Next.js 14, Tailwind CSS, Recharts, Prisma ORM, PostgreSQL (disarankan Neon),
sesi login berbasis JWT httpOnly cookie (bukan NextAuth, agar tetap ringan) + bcrypt untuk hash password.

---

## Opsi Deploy — Ringkasan

Cara paling gampang: **push ke GitHub → import repo itu di Vercel → tambahkan Neon Postgres → deploy**.
Tidak ada opsi "deploy tanpa GitHub" yang sama praktisnya untuk Next.js App Router
dengan API routes seperti ini — Vercel CLI (`vercel deploy`) juga bisa dipakai langsung dari folder lokal
tanpa GitHub sama sekali, dijelaskan di opsi B di bawah.

### Opsi A — Lewat GitHub (direkomendasikan, auto-deploy tiap push)

1. **Buat database Postgres** di [neon.tech](https://neon.tech) (gratis). Salin *connection string*-nya.
2. **Push folder ini ke GitHub**:
   ```bash
   cd pojok-gizi
   git init
   git add .
   git commit -m "Initial commit: Pojok Gizi by Aden"
   git branch -M main
   git remote add origin https://github.com/USERNAME/pojok-gizi.git
   git push -u origin main
   ```
3. Buka [vercel.com/new](https://vercel.com/new) → **Import** repo GitHub tersebut.
4. Saat konfigurasi project, isi **Environment Variables**:
   - `DATABASE_URL` → connection string dari Neon
   - `SESSION_SECRET` → string acak panjang (`openssl rand -base64 32`)
5. Klik **Deploy**. Build otomatis menjalankan `prisma generate` (lewat `postinstall`) lalu `next build`.
6. Setelah deploy pertama sukses, jalankan migrasi + seed **sekali** dari komputer lokal
   (Vercel tidak menjalankan seed otomatis):
   ```bash
   # di folder project lokal, dengan .env berisi DATABASE_URL yang SAMA dengan di Vercel
   npx prisma migrate deploy   # atau: npx prisma db push (untuk setup awal cepat)
   npm run seed                # membuat akun nutrisionist pertama & master perusahaan contoh
   ```
7. Buka domain Vercel Anda. `/request-gizi` publik, login Nutrisionist di `/login`.
8. **Ganti password default** setelah login pertama (lihat bagian "Kredensial Awal" di bawah).

### Opsi B — Tanpa GitHub, langsung dari folder lokal (Vercel CLI)

Jika benar-benar tidak ingin pakai GitHub:

```bash
npm install -g vercel
cd pojok-gizi
vercel login
vercel            # deploy preview
vercel --prod     # deploy production
```

Vercel CLI akan menanyakan environment variables saat pertama kali,
atau bisa diset lewat `vercel env add DATABASE_URL` dan `vercel env add SESSION_SECRET`.
Kekurangannya: tidak ada auto-deploy saat ada perubahan kode — Anda harus jalankan `vercel --prod`
manual setiap update. Untuk proyek yang akan terus dikembangkan, **Opsi A (GitHub) jauh lebih nyaman**
karena setiap `git push` otomatis men-deploy versi terbaru dan Anda punya riwayat perubahan.

---

## Menjalankan di Lokal (opsional, untuk development)

```bash
npm install
cp .env.example .env      # lalu isi DATABASE_URL & SESSION_SECRET
npx prisma db push        # buat tabel di database
npm run seed               # buat akun nutrisionist pertama
npm run dev                 # buka http://localhost:3000
```

## Kredensial Awal

Seed membuat 1 akun Nutrisionist dari env var `SEED_NUTRISIONIST_USERNAME` /
`SEED_NUTRISIONIST_PASSWORD` (default: `nutrisionist` / `ChangeMe123!` bila env
tidak diisi). Password disimpan ter-hash (bcrypt) di database, **tidak pernah**
di source code atau UI publik. Tidak ada halaman registrasi mandiri.

Untuk mengganti password nanti, cara paling sederhana adalah hapus baris user di
database lalu jalankan ulang `npm run seed` dengan `SEED_NUTRISIONIST_PASSWORD`
baru — atau tambahkan halaman "ganti password" di kemudian hari (belum ada di versi ini).

## Catatan Implementasi vs PRD

- Seluruh kalkulasi otomatis (`Kategori %Fat gender`, `Keterangan %Fat`,
  `Keterangan Vic Fat`, `Keterangan BMI`) dihitung ulang di server
  (`lib/pemeriksaan-helpers.js` + `lib/calculations.js`) setiap create/update —
  tidak percaya nilai dari client.
- Validasi `%Fat`/`Vic Fat` ≤ 0 ditolak di frontend maupun backend.
- Boundary BMI final: `BMI ≥ 40` → **Obesitas 3** (lihat `lib/calculations.js`).
- Request Gizi publik **tidak memiliki field Kantin**, hanya menerima Jam Konsul
  18:30–20:00, status default `Baru`.
- Middleware (`middleware.js`) memastikan hanya `/request-gizi`, `/login`, dan
  endpoint publik yang dapat diakses tanpa sesi valid; semua route lain
  (dashboard, pemeriksaan, rekap, serta API terkait) memerlukan login.
- Dashboard chart mengambil data langsung dari database (tidak hardcode),
  otomatis mengikuti filter Periode/Kantin/Perusahaan.

## Yang Masih Bisa Dikembangkan Lebih Lanjut

- Halaman "Master Perusahaan" (tambah/nonaktifkan perusahaan) — API-nya sudah
  ada (`/api/master-perusahaan`), tinggal dibuatkan UI khusus di dashboard.
- Notifikasi real-time untuk Request Gizi baru di header (saat ini perlu refresh
  halaman dashboard).
- Halaman ganti password Nutrisionist dari UI.
- Export tabel rekap ke Excel/PDF.

Struktur kode dibuat modular (lib/calculations.js terpisah dari route) supaya
perubahan boundary atau penambahan fitur di atas mudah dilakukan tanpa
menyentuh logic yang sudah ada.
