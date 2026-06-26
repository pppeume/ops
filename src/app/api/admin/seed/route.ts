import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";
import { INIT_SQL } from "@/lib/initSql";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 배포 직후 1회 호출하여 (1) 스키마 생성 + (2) 데모 데이터 시드를 수행하는 보호된 엔드포인트.
//   GET /api/admin/seed?key=<AUTH_SECRET>
// 이미 데이터가 있으면 덮어쓰지 않고 현재 건수를 반환합니다.

async function ensureSchema() {
  // 핵심 테이블 존재 여부로 스키마 부트스트랩 필요 판단
  const exists = await prisma.$queryRawUnsafe<{ reg: string | null }[]>(
    `SELECT to_regclass('public."User"')::text as reg`
  );
  if (exists?.[0]?.reg) return false; // 이미 스키마 존재

  // 주석 라인 제거 후 세미콜론 단위로 실행 (확장 프로토콜은 멀티 스테이트먼트 불가)
  const statements = INIT_SQL.replace(/^\s*--.*$/gm, "")
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    await prisma.$executeRawUnsafe(stmt);
  }
  return true;
}

async function handle(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  const secret = process.env.AUTH_SECRET;
  if (!secret || key !== secret) {
    return NextResponse.json(
      { error: "unauthorized: 올바른 key(AUTH_SECRET)가 필요합니다." },
      { status: 401 }
    );
  }

  try {
    const schemaCreated = await ensureSchema();

    const existing = await prisma.user.count();
    if (existing > 0) {
      return NextResponse.json({
        seeded: false,
        schemaCreated,
        message: "이미 데이터가 존재하여 시드를 건너뜁니다.",
        users: existing,
      });
    }

    const counts = await seedDatabase(prisma);
    return NextResponse.json({
      seeded: true,
      schemaCreated,
      message: "초기화 완료. admin@kolon.com / admin1234do! 로 로그인하세요.",
      counts,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "초기화 실패", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export const GET = handle;
export const POST = handle;
