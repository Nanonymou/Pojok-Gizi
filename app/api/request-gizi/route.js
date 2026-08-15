import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { isJamKonsulValid, isWhatsappValid, nextDateForKantin, KANTIN_OPTIONS } from "../../../lib/calculations";
import { buildInitialPemeriksaanFromRequest } from "../../../lib/pemeriksaan-helpers";

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
  const { nama, umur, nikOrId, perusahaanId, kantin, jamKonsul, noWhatsapp, keluhan } = body;

  if (!nama) return err("Nama wajib diisi");
  if (!umur || Number(umur) <= 0) return err("Umur wajib diisi dengan benar");
  if (!nikOrId) return err("NIK atau ID Perusahaan wajib diisi");
  if (!perusahaanId) return err("Perusahaan wajib dipilih");
  if (!KANTIN_OPTIONS.includes(kantin)) return err("Kantin wajib dipilih (Mahakam atau Belayan)");
  if (!isJamKonsulValid(jamKonsul)) {
    return err("Jam Konsul hanya dapat dipilih antara 18:30–20:00");
  }
  if (!isWhatsappValid(noWhatsapp)) {
    return err("Nomor WhatsApp tidak valid. Gunakan format 08xxxxxxxxxx atau 62xxxxxxxxxx");
  }

  // Hari & tanggal konsul dikunci berdasarkan kantin (Mahakam -> Minggu
  // terdekat, Belayan -> Senin terdekat), bukan input bebas dari user.
  const hariKonsul = nextDateForKantin(kantin);

  const created = await prisma.$transaction(async (tx) => {
    const request = await tx.requestGizi.create({
      data: {
        nama,
        umur: Number(umur),
        nikOrId,
        perusahaanId,
        kantin,
        hariKonsul,
        jamKonsul,
        noWhatsapp: noWhatsapp.trim(),
        keluhan: keluhan || null,
        status: "Baru",
      },
    });

    // Setiap request konsultasi otomatis tercatat sebagai entri di data
    // konsultasi (PemeriksaanGizi) dengan status "Menunggu Pemeriksaan".
    await tx.pemeriksaanGizi.create({
      data: buildInitialPemeriksaanFromRequest(request),
    });

    return request;
  });

  return NextResponse.json(created, { status: 201 });
}

function err(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}
