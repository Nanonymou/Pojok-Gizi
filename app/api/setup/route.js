import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../lib/prisma";

// Endpoint ini dipakai untuk membuat/mereset akun Nutrisionist langsung di
// database production, TANPA perlu menjalankan `npm run seed` dari komputer
// lokal. Dilindungi oleh SETUP_SECRET (bukan oleh session login), jadi hanya
// bisa dipanggil oleh orang yang tahu SETUP_SECRET.
//
// Cara pakai (setelah env var di bawah diset & di-deploy):
//   Buka di browser:
//   https://domain-vercel-anda.vercel.app/api/setup?secret=ISI_SETUP_SECRET
//
// SANGAT DISARANKAN: setelah dipakai, hapus env var SETUP_SECRET (atau ganti
// nilainya) di Vercel supaya endpoint ini tidak bisa dipanggil ulang oleh
// sembarang orang.

export async function GET(req) {
  return handle(req);
}
export async function POST(req) {
  return handle(req);
}

async function handle(req) {
  const setupSecret = process.env.SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json(
      { error: "SETUP_SECRET belum diset di Environment Variables Vercel." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  if (secret !== setupSecret) {
    return NextResponse.json({ error: "Secret salah" }, { status: 401 });
  }

  const username = process.env.SEED_NUTRISIONIST_USERNAME;
  const password = process.env.SEED_NUTRISIONIST_PASSWORD;
  if (!username || !password) {
    return NextResponse.json(
      { error: "SEED_NUTRISIONIST_USERNAME / SEED_NUTRISIONIST_PASSWORD belum diset." },
      { status: 500 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // Buat tabel otomatis kalau belum ada (aman dipanggil berkali-kali, tidak
    // menghapus data yang sudah ada). Ini menggantikan kebutuhan menjalankan
    // `npx prisma db push` secara manual dari komputer lokal.
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "username" TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'nutrisionist',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MasterPerusahaan" (
        "id" TEXT PRIMARY KEY,
        "nama" TEXT UNIQUE NOT NULL,
        "aktif" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PemeriksaanGizi" (
        "id" TEXT PRIMARY KEY,
        "tanggal" TIMESTAMP(3) NOT NULL,
        "noRm" TEXT NOT NULL,
        "namaKaryawan" TEXT NOT NULL,
        "nikOrId" TEXT NOT NULL,
        "perusahaanId" TEXT NOT NULL REFERENCES "MasterPerusahaan"("id"),
        "kantin" TEXT NOT NULL,
        "jenisKelamin" TEXT NOT NULL,
        "usia" INTEGER NOT NULL,
        "beratBadan" DOUBLE PRECISION NOT NULL,
        "tinggiBadan" DOUBLE PRECISION NOT NULL,
        "persenFat" DOUBLE PRECISION NOT NULL,
        "kategoriFatGender" TEXT NOT NULL,
        "keteranganFat" TEXT NOT NULL,
        "vicFat" DOUBLE PRECISION NOT NULL,
        "keteranganVicFat" TEXT NOT NULL,
        "kalori" DOUBLE PRECISION,
        "bmi" DOUBLE PRECISION NOT NULL,
        "keteranganBmi" TEXT NOT NULL,
        "tindakLanjut" TEXT,
        "createdBy" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RequestGizi" (
        "id" TEXT PRIMARY KEY,
        "nama" TEXT NOT NULL,
        "umur" INTEGER NOT NULL,
        "nikOrId" TEXT NOT NULL,
        "perusahaanId" TEXT NOT NULL REFERENCES "MasterPerusahaan"("id"),
        "hariKonsul" TIMESTAMP(3) NOT NULL,
        "jamKonsul" TEXT NOT NULL,
        "keluhan" TEXT,
        "status" TEXT NOT NULL DEFAULT 'Baru',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const user = await prisma.user.upsert({
      where: { username },
      update: { passwordHash },
      create: { username, passwordHash, role: "nutrisionist" },
    });

    // Daftar perusahaan bisa diatur lewat parameter ?perusahaan=Nama1,Nama2,Nama3
    // Kalau tidak diisi, pakai daftar contoh default (aman dipanggil berkali-kali).
    const perusahaanParam = searchParams.get("perusahaan");
    const perusahaanList = perusahaanParam
      ? perusahaanParam.split(",").map((s) => s.trim()).filter(Boolean)
      : ["PT Contoh Sejahtera", "PT Mahakam Energi", "PT Belayan Resources"];

    for (const nama of perusahaanList) {
      await prisma.masterPerusahaan.upsert({
        where: { nama },
        update: { aktif: true },
        create: { nama },
      });
    }

    // ?resetPerusahaan=1 -> nonaktifkan perusahaan lama yang TIDAK ada di daftar
    // baru ini (tidak dihapus permanen, hanya disembunyikan dari dropdown).
    if (searchParams.get("resetPerusahaan") === "1") {
      await prisma.masterPerusahaan.updateMany({
        where: { nama: { notIn: perusahaanList } },
        data: { aktif: false },
      });
    }

    return NextResponse.json({
      ok: true,
      message: `Akun Nutrisionist "${user.username}" berhasil dibuat/direset. Daftar perusahaan aktif: ${perusahaanList.join(", ")}.`,
    });
  } catch (e) {
    // Tampilkan pesan error asli agar mudah didiagnosis (mis. tabel belum ada,
    // DATABASE_URL salah, dsb). Endpoint ini sudah dilindungi SETUP_SECRET.
    return NextResponse.json(
      {
        ok: false,
        error: "Gagal menyimpan ke database.",
        detail: e.message,
        hint: e.message?.includes("does not exist")
          ? "Tabel database belum dibuat. Jalankan `npx prisma db push` dari komputer lokal dengan DATABASE_URL yang sama dengan di Vercel."
          : "Cek DATABASE_URL di Vercel sudah benar (termasuk ?sslmode=require untuk Neon).",
      },
      { status: 500 }
    );
  }
}
