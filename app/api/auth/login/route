import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";
import { COOKIE_NAME, SESSION_TTL_SECONDS, createSessionToken } from "../../../../lib/auth";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { username, password } = body;

  const genericError = NextResponse.json(
    { error: "Username atau password salah" },
    { status: 401 }
  );

  if (!username || !password) return genericError;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return genericError;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return genericError;

  const token = await createSessionToken({ sub: user.id, username: user.username, role: user.role });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
