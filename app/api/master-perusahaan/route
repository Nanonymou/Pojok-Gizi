import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

// GET publik (dipakai dropdown form pemeriksaan & request gizi). Hanya baca.
export async function GET() {
  const items = await prisma.masterPerusahaan.findMany({
    where: { aktif: true },
    orderBy: { nama: "asc" },
  });
  return NextResponse.json({ items });
}

// POST hanya Nutrisionist (dilindungi middleware untuk method selain GET).
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { nama } = body;
  if (!nama) return NextResponse.json({ error: "Nama perusahaan wajib diisi" }, { status: 400 });
  try {
    const created = await prisma.masterPerusahaan.create({ data: { nama } });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Perusahaan sudah ada" }, { status: 400 });
  }
}
