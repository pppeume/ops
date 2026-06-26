import type { PrismaClient } from "@prisma/client";
import { INIT_SQL } from "./initSql";
import { seedDatabase } from "./seed";

// 스키마가 없으면 생성하고, 데이터가 비어 있으면 데모 시드까지 수행.
// 이미 초기화된 경우 가벼운 체크만 하고 즉시 반환(멱등).
export async function ensureInitialized(
  prisma: PrismaClient
): Promise<{ schemaCreated: boolean; seeded: boolean; users: number }> {
  // 1) 스키마 존재 확인 (regclass → text 캐스팅: Prisma 역직렬화 호환)
  const reg = await prisma.$queryRawUnsafe<{ reg: string | null }[]>(
    `SELECT to_regclass('public."User"')::text as reg`
  );
  let schemaCreated = false;
  if (!reg?.[0]?.reg) {
    const statements = INIT_SQL.replace(/^\s*--.*$/gm, "")
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of statements) {
      await prisma.$executeRawUnsafe(stmt);
    }
    schemaCreated = true;
  }

  // 2) 데이터 비어 있으면 시드
  let users = await prisma.user.count();
  let seeded = false;
  if (users === 0) {
    await seedDatabase(prisma);
    seeded = true;
    users = await prisma.user.count();
  }

  return { schemaCreated, seeded, users };
}
