import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "pg_session";

const PUBLIC_PATHS = [
  "/request-gizi",
  "/login",
  "/api/auth/login",
  "/api/master-perusahaan", // read-only GET used by public form dropdown
];

function isPublic(pathname) {
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) return true;
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

async function verify(token, secret) {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/request-gizi", req.url));
  }

  if (isPublic(pathname)) {
    // Master-perusahaan write endpoints still need protection; only GET is public.
    if (pathname.startsWith("/api/master-perusahaan") && req.method !== "GET") {
      // fallthrough to auth check below
    } else {
      return NextResponse.next();
    }
  }

  // Request Gizi: POST (submit) is public; GET (list) and PATCH (status update)
  // are Nutrisionist-only and fall through to the auth check below.
  if (pathname === "/api/request-gizi" && req.method === "POST") {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.SESSION_SECRET
    ? new TextEncoder().encode(process.env.SESSION_SECRET)
    : null;

  const authed = token && secret ? await verify(token, secret) : false;

  if (!authed) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/pemeriksaan/:path*",
    "/rekap/:path*",
    "/login",
    "/api/:path*",
  ],
};
