import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 배포 직후 1회 데모 데이터를 채우기 위한 보호된 엔드포인트.
//   GET /api/admin/seed?key=<AUTH_SECRET>
// 이미 데이터가 있으면 덮어쓰지 않고 현재 건수를 반환합니다.
async function handle(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  const secret = process.env.AUTH_SECRET;
  if (!secret || key !== secret) {
    return NextResponse.json({ error: "unauthorized: 올바른 key(AUTH_SECRET)가 필요합니다." }, { status: 401 });
  }

  const existing = await prisma.user.count();
  if (existing > 0) {
    return NextResponse.json({
      seeded: false,
      message: "이미 데이터가 존재하여 시드를 건너뜁니다.",
      users: existing,
    });
  }

  const counts = await seedDatabase(prisma);
  return NextResponse.json({
    seeded: true,
    message: "데모 데이터 시드 완료. admin@kolon.com / admin1234do! 로 로그인하세요.",
    counts,
  });
}

export const GET = handle;
export const POST = handle;
