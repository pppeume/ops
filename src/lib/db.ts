import { PrismaClient } from "@prisma/client";

const isPg = (v?: string): v is string => !!v && /^postgres(ql)?:\/\//.test(v);

function firstPg(...vals: (string | undefined)[]): string | undefined {
  return vals.find(isPg);
}

function scanEnvForPg(prefer: "POOL" | "DIRECT"): string | undefined {
  const cands = Object.entries(process.env)
    .filter(([, v]) => isPg(v as string))
    .map(([k, v]) => [k.toUpperCase(), v as string] as const);
  const score = (k: string) => {
    const direct = k.includes("NON_POOLING") || k.includes("UNPOOLED");
    if (prefer === "DIRECT") return direct ? 3 : k.includes("PRISMA") ? 1 : 2;
    return k.includes("PRISMA") || k.includes("POOL") ? (direct ? 1 : 3) : 2;
  };
  return cands.sort((a, b) => score(b[0]) - score(a[0]))[0]?.[1];
}

// 런타임 쿼리용 — 풀링(pgbouncer) 연결 우선: 서버리스에서 연결 재사용으로 빠름.
export function resolveRuntimeUrl(): string | undefined {
  return (
    firstPg(
      process.env.DATABASE_URL,
      process.env.POSTGRES_PRISMA_URL,
      process.env.POSTGRES_URL,
      process.env.POSTGRES_URL_NON_POOLING,
      process.env.DATABASE_URL_UNPOOLED
    ) ?? scanEnvForPg("POOL")
  );
}

// 스키마 생성(DDL)/시드용 — 직접 연결 우선: pgbouncer 트랜잭션 풀링의 DDL 멈춤 방지.
export function resolveDirectUrl(): string | undefined {
  return (
    firstPg(
      process.env.DATABASE_URL,
      process.env.POSTGRES_URL_NON_POOLING,
      process.env.DATABASE_URL_UNPOOLED,
      process.env.POSTGRES_PRISMA_URL,
      process.env.POSTGRES_URL
    ) ?? scanEnvForPg("DIRECT")
  );
}

const runtimeUrl = resolveRuntimeUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(runtimeUrl ? { datasourceUrl: runtimeUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
