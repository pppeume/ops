import { PrismaClient } from "@prisma/client";

// 호스팅(Vercel/Supabase/Neon 등)은 연결 문자열을 환경마다 다른 이름으로 주입합니다.
// 알려진 이름을 우선 탐색하고, 없으면 process.env 전체에서 postgres URL 형태를 자동 탐지.
function resolveDatabaseUrl(): string | undefined {
  const preferred = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL_UNPOOLED,
  ].filter((v): v is string => !!v && /^postgres(ql)?:\/\//.test(v));
  if (preferred.length) return preferred[0];

  // 폴백: 어떤 키든 postgres 연결 문자열이면 사용. (Supabase 커스텀 접두사 등 대응)
  const candidates = Object.entries(process.env)
    .filter(([, v]) => typeof v === "string" && /^postgres(ql)?:\/\//.test(v as string))
    .map(([k, v]) => [k, v as string] as const)
    // 풀링/Prisma 전용 URL 우선, NON_POOLING 은 후순위
    .sort((a, b) => score(b[0]) - score(a[0]));
  return candidates[0]?.[1];
}

function score(key: string): number {
  const k = key.toUpperCase();
  if (k.includes("NON_POOLING") || k.includes("UNPOOLED")) return 0;
  if (k.includes("PRISMA")) return 3;
  if (k.includes("POOL")) return 2;
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
