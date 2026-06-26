import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureInitialized } from "@/lib/bootstrap";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 배포 직후 수동 초기화용(선택). 일반적으로는 첫 로그인 시 자동 초기화됩니다.
//   GET /api/admin/seed?key=<AUTH_SECRET>
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
    const result = await ensureInitialized(prisma);
    return NextResponse.json({
      ...result,
      message: result.seeded
        ? "초기화 완료. admin@kolon.com / admin1234do! 로 로그인하세요."
        : "이미 초기화되어 있습니다.",
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
