import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/seed";

const prisma = new PrismaClient();

seedDatabase(prisma, (m) => console.log(m))
  .then((counts) => {
    console.log("✅  시드 완료:", counts);
    console.log("🔑  로그인: admin@kolon.com / admin1234do!");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
