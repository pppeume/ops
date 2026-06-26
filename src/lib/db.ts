import { PrismaClient } from "@prisma/client";

// 호스팅(Vercel/Supabase/Neon 등)은 연결 문자열을 환경마다 다른 이름으로 주입합니다.
// 우선순위: 명시적 DATABASE_URL → 직접(non-pooling) → 풀링/Prisma → 그 외.
// 이 앱은 최초 1회 DDL(스키마 생성) + 시드를 실행하므로, pgbouncer 트랜잭션 풀링보다
// "직접 연결"이 호환성이 좋아 우선합니다. (데모 트래픽 기준 충분)
function resolveDatabaseUrl(): string | undefined {
  const isPg = (v?: string): v is string => !!v && /^postgres(ql)?:\/\//.test(v);

  if (isPg(process.env.DATABASE_URL)) return process.env.DATABASE_URL;

  const ordered = [
    process.env.POSTGRES_URL_NON_POOLING, // Supabase 직접 연결
    process.env.DATABASE_URL_UNPOOLED, // Neon 직접 연결
    process.env.POSTGRES_PRISMA_URL, // 풀링(pgbouncer) — prisma 호환
    process.env.POSTGRES_URL,
  ].filter(isPg);
  if (ordered.length) return ordered[0];

  // 폴백: 어떤 키든 postgres 연결 문자열이면 사용 (커스텀 접두사 대응)
  const scan = Object.entries(process.env)
    .filter(([, v]) => isPg(v as string))
    .map(([k, v]) => [k, v as string] as const)
    .sort((a, b) => score(b[0]) - score(a[0]));
  return scan[0]?.[1];
}

function score(key: string): number {
  const k = key.toUpperCase();
  if (k.includes("NON_POOLING") || k.includes("UNPOOLED")) return 3;
  if (k.includes("PRISMA")) return 2;
  return 1;
}

const datasourceUrl = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
