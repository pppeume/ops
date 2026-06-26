import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    // 초기화 여부(테이블/데이터 존재) 진단 — 미초기화면 users=null
    let users: number | null = null;
    try {
      users = await prisma.user.count();
    } catch {
      users = null;
    }
    return NextResponse.json({
      status: "ok",
      db: "up",
      initialized: users !== null && users > 0,
      users,
      time: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "degraded", db: "down", hint: "DATABASE_URL(Postgres) 환경변수를 확인하세요." },
      { status: 503 }
    );
  }
}
