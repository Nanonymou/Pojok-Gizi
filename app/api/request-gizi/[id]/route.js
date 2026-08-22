import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { REQUEST_STATUS_OPTIONS } from "../../../../lib/calculations";

export async function PATCH(req, { params }) {
  const body = await req.json().catch(() => ({}));
  const { status } = body;
  if (!REQUEST_STATUS_OPTIONS.includes(status)) {
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
  }
  const updated = await prisma.requestGizi.update({
    where: { id: params.id },
    data: { status },
  });
  return NextResponse.json(updated);
}

// DELETE: menghapus permanen data seorang karyawan yang masuk lewat Request
// Gizi, BESERTA entri pemeriksaan yang otomatis dibuat dari request tsb.
// Endpoint ini berada di belakang middleware auth (butuh login Nutrisionist/
// Admin), jadi otorisasinya mengikuti sesi login yang sudah ada.
export async function DELETE(_req, { params }) {
  try {
    const existing = await prisma.requestGizi.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Data request gizi tidak ditemukan." }, { status: 404 });
    }

    // Hapus dalam satu transaksi: entri PemeriksaanGizi yang terhubung ke
    // request ini harus dibuang lebih dulu karena ada foreign key ke RequestGizi.
    await prisma.$transaction([
      prisma.pemeriksaanGizi.deleteMany({ where: { requestGiziId: params.id } }),
      prisma.requestGizi.delete({ where: { id: params.id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Gagal menghapus data. Coba lagi.", detail: e.message },
      { status: 500 }
    );
  }
}
