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

  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash, role: "nutrisionist" },
  });

  // Sekalian pastikan master perusahaan contoh ada (aman dipanggil berkali-kali).
  const perusahaanList = ["PT BUMA"];
  for (const nama of perusahaanList) {
    await prisma.masterPerusahaan.upsert({ where: { nama }, update: {}, create: { nama } });
  }

  return NextResponse.json({
    ok: true,
    message: `Akun Nutrisionist "${user.username}" berhasil dibuat/direset. Sekarang bisa login dengan username & password dari SEED_NUTRISIONIST_USERNAME/PASSWORD saat ini.`,
  });
}
