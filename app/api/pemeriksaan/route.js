import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { KANTIN_OPTIONS } from "../../../lib/calculations";
import { buildPemeriksaanData, findLockedNoRm } from "../../../lib/pemeriksaan-helpers";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const kantin = searchParams.get("kantin");
  const status = searchParams.get("status");
  const perusahaanId = searchParams.get("perusahaanId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const q = searchParams.get("q");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") || 25));

  const where = {};
  if (kantin && KANTIN_OPTIONS.includes(kantin)) where.kantin = kantin;
  if (status) where.status = status;
  if (perusahaanId) where.perusahaanId = perusahaanId;
  if (from || to) {
    where.tanggal = {};
    if (from) where.tanggal.gte = new Date(from);
    if (to) where.tanggal.lte = new Date(to);
  }
  if (q) {
    where.OR = [
      { namaKaryawan: { contains: q, mode: "insensitive" } },
      { nikOrId: { contains: q, mode: "insensitive" } },
      { noRm: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.pemeriksaanGizi.findMany({
      where,
      include: { perusahaan: true },
      orderBy: { tanggal: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.pemeriksaanGizi.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  try {
    const locked = await findLockedNoRm(prisma, {
      namaKaryawan: body.namaKaryawan,
      nikOrId: body.nikOrId,
    });
    if (locked && body.noRm && body.noRm !== locked) {
      return NextResponse.json(
        { error: `No. RM untuk karyawan ini sudah terdaftar sebagai ${locked} dan tidak bisa diubah.` },
        { status: 400 }
      );
    }
    const data = buildPemeriksaanData({ ...body, noRm: locked || body.noRm });
    const created = await prisma.pemeriksaanGizi.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
