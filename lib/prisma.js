const { PrismaClient } = require("@prisma/client");

// Selalu cache instance PrismaClient di globalThis, TERMASUK di production.
// Di Vercel (serverless), tiap lambda bisa dipakai ulang (warm) untuk
// beberapa request; kalau instance-nya tidak di-cache, gampang membuat
// banyak koneksi Postgres baru dalam waktu singkat yang bikin request jadi
// lambat/antre (apalagi kalau DATABASE_URL bukan connection string "pooled").
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;

module.exports = prisma;
