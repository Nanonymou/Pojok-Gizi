const { SignJWT, jwtVerify } = require("jose");

const COOKIE_NAME = "pg_session";
const SESSION_TTL_SECONDS = 60 * 60 * 4; // 4 jam timeout, sesuai spesifikasi session timeout

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET env var belum diset (minimal 16 karakter acak). Set di Vercel/",
    );
  }
  return new TextEncoder().encode(secret);
}

async function createSessionToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  COOKIE_NAME,
  SESSION_TTL_SECONDS,
  createSessionToken,
  verifySessionToken,
};
