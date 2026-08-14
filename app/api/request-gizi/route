import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { isJamKonsulValid } from "../../../lib/calculations";

// GET: dipakai oleh dashboard Nutrisionist (dilindungi middleware) untuk daftar request.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const where = {};
  if (status) where.status = status;

  const items = await prisma.requestGizi.findMany({
    where,
    include: { perusahaan: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

// POST: endpoint publik, tanpa login. Middleware mengizinkan path ini.
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { nama, umur, nikOrId, perusahaanId, hariKonsul, jamKonsul, keluhan } = body;

  if (!nama) return err("Nama wajib diisi");
  if (!umur || Number(umur) <= 0) return err("Umur wajib diisi dengan benar");
  if (!nikOrId) return err("NIK atau ID Perusahaan wajib diisi");
  if (!perusahaanId) return err("Perusahaan wajib dipilih");
  if (!hariKonsul) return err("Hari Konsul wajib diisi");
  if (!isJamKonsulValid(jamKonsul)) {
    return err("Jam Konsul hanya dapat dipilih antara 18:30–20:00");
  }

  const created = await prisma.requestGizi.create({
    data: {
      nama,
      umur: Number(umur),
      nikOrId,
      perusahaanId,
      hariKonsul: new Date(hariKonsul),
      jamKonsul,
      keluhan: keluhan || null,
      status: "Baru",
    },
  });
  return NextResponse.json(created, { status: 201 });
}

function err(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}
