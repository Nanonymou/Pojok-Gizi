import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { buildPemeriksaanData } from "../../../../lib/pemeriksaan-helpers";

export async function GET(_req, { params }) {
  const item = await prisma.pemeriksaanGizi.findUnique({
    where: { id: params.id },
    include: { perusahaan: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req, { params }) {
  const body = await req.json().catch(() => ({}));
  try {
    const data = buildPemeriksaanData(body);
    const updated = await prisma.pemeriksaanGizi.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(_req, { params }) {
  await prisma.pemeriksaanGizi.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
