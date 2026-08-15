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
