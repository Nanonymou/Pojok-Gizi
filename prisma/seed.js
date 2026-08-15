const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_NUTRISIONIST_USERNAME || "nutrisionist";
  const password = process.env.SEED_NUTRISIONIST_PASSWORD || "ChangeMe123!";

  const existing = await prisma.user.findUnique({ where: { username } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { username, passwordHash, role: "nutrisionist" },
    });
    console.log(`Created nutrisionist user "${username}".`);
    console.log(
      "IMPORTANT: change this password after first login / rotate SEED_NUTRISIONIST_PASSWORD."
    );
  } else {
    console.log(`User "${username}" already exists, skipping.`);
  }

  const perusahaanList = [
    "PT Contoh Sejahtera",
    "PT Mahakam Energi",
    "PT Belayan Resources",
  ];
  for (const nama of perusahaanList) {
    await prisma.masterPerusahaan.upsert({
      where: { nama },
      update: {},
      create: { nama },
    });
  }
  console.log("Master perusahaan seeded (edit/add via dashboard later).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
