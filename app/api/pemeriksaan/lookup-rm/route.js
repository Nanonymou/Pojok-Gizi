import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { findLockedNoRm } from "../../../../lib/pemeriksaan-helpers";

// GET /api/pemeriksaan/lookup-rm?nama=...&nikOrId=...
// Dipakai form pemeriksaan untuk autofill & mengunci field No. Rekam Medis
// begitu nama + ID/NIK yang diketik cocok dengan karyawan yang sudah punya RM.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const namaKaryawan = searchParams.get("nama") || "";
  const nikOrId = searchParams.get("nikOrId") || "";
  const noRm = await findLockedNoRm(prisma, { namaKaryawan, nikOrId });
  return NextResponse.json({ noRm: noRm || null, locked: Boolean(noRm) });
}
