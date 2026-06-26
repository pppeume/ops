import { PrismaClient } from "@prisma/client";
import { INIT_SQL } from "./initSql";
import { seedDatabase } from "./seed";
import { resolveDirectUrl } from "./db";

// 스키마가 없으면 생성하고, 데이터가 비어 있으면 데모 시드까지 수행.
// - 평상시(이미 초기화): 풀링 연결로 가벼운 체크만 → 빠름.
// - 최초 1회(DDL+시드): 직접 연결을 따로 열어 수행 → pgbouncer DDL 멈춤 방지.
export async function ensureInitialized(
  prisma: PrismaClient
): Promise<{ schemaCreated: boolean; seeded: boolean; users: number }> {
  // 빠른 경로: 이미 초기화되어 있으면 즉시 반환 (풀링 연결)
  try {
    const reg = await prisma.$queryRawUnsafe<{ reg: string | null }[]>(
      `SELECT to_regclass('public."User"')::text as reg`
    );
    if (reg?.[0]?.reg) {
      const users = await prisma.user.count();
      if (users > 0) return { schemaCreated: false, seeded: false, users };
    }
  } catch {
    // 테이블 미존재 등 — 아래 초기화로 진행
  }

  // 무거운 초기화: 직접 연결로 수행
  const directUrl = resolveDirectUrl();
  const direct = new PrismaClient({ ...(directUrl ? { datasourceUrl: directUrl } : {}) });
  try {
    const reg = await direct.$queryRawUnsafe<{ reg: string | null }[]>(
      `SELECT to_regclass('public."User"')::text as reg`
    );
    let schemaCreated = false;
    if (!reg?.[0]?.reg) {
      const statements = INIT_SQL.replace(/^\s*--.*$/gm, "")
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      for (const stmt of statements) {
        await direct.$executeRawUnsafe(stmt);
      }
      schemaCreated = true;
    }

    let users = await direct.user.count();
    let seeded = false;
    if (users === 0) {
      await seedDatabase(direct);
      seeded = true;
      users = await direct.user.count();
    }
    return { schemaCreated, seeded, users };
  } finally {
    await direct.$disconnect();
  }
}
