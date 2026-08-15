import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const kantin = searchParams.get("kantin");
  const perusahaanId = searchParams.get("perusahaanId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where = {};
  if (kantin) where.kantin = kantin;
  if (perusahaanId) where.perusahaanId = perusahaanId;
  if (from || to) {
    where.tanggal = {};
    if (from) where.tanggal.gte = new Date(from);
    if (to) where.tanggal.lte = new Date(to);
  } else {
    // default: bulan berjalan
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    where.tanggal = { gte: start, lte: end };
  }

  let rows;
  try {
    rows = await prisma.pemeriksaanGizi.findMany({
      where,
      select: {
        kantin: true,
        jenisKelamin: true,
        kategoriFatGender: true,
        keteranganVicFat: true,
        keteranganBmi: true,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Gagal memuat data dashboard.", detail: e.message },
      { status: 500 }
    );
  }

  const kpi = {
    total: rows.length,
    mahakam: rows.filter((r) => r.kantin === "Mahakam").length,
    belayan: rows.filter((r) => r.kantin === "Belayan").length,
    overweightObesitas: rows.filter((r) =>
      ["Overweight", "Obesitas 1", "Obesitas 2", "Obesitas 3"].includes(r.keteranganBmi)
    ).length,
  };

  const jenisKelamin = buildSeries(rows, "jenisKelamin", ["L", "P"]);
  const fat = buildSeries(rows, "kategoriFatGender", [
    "Esensial",
    "Atlet",
    "Kebugaran",
    "Rata-rata",
    "Obesitas",
  ]);
  const vicFat = buildSeries(rows, "keteranganVicFat", ["Normal", "Sedang", "Tinggi", "Obesitas"]);
  const bmi = buildSeries(rows, "keteranganBmi", [
    "Underweight",
    "Normal",
    "Overweight",
    "Obesitas 1",
    "Obesitas 2",
    "Obesitas 3",
  ]);

  return NextResponse.json({ kpi, charts: { jenisKelamin, fat, vicFat, bmi } });
}

function buildSeries(rows, field, categories) {
  return categories.map((cat) => {
    const subset = rows.filter((r) => r[field] === cat);
    return {
      kategori: cat,
      Mahakam: subset.filter((r) => r.kantin === "Mahakam").length,
      Belayan: subset.filter((r) => r.kantin === "Belayan").length,
    };
  });
}
