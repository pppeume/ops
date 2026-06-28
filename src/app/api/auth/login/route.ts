import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { ensureInitialized } from "@/lib/bootstrap";

// 최초 로그인 시 스키마 생성 + 데모 시드가 수행될 수 있어 충분한 시간 확보
export const maxDuration = 60;

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "이메일과 비밀번호를 입력해 주세요." }, { status: 400 });
  }

  // 최초 접속 시 DB 스키마/데모 데이터 자동 초기화 (이미 초기화면 가벼운 체크만)
  try {
    await ensureInitialized(prisma);
  } catch (e) {
    console.error("[login] DB 초기화 실패:", e);
    return NextResponse.json(
      {
        error:
          "데이터베이스에 연결할 수 없습니다. 호스팅(예: Vercel)에 Postgres가 연결되어 있고 DATABASE_URL 환경변수가 설정되었는지 확인하세요.",
      },
      { status: 503 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase().trim() },
    include: { role: true },
  });

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "계정을 찾을 수 없거나 비활성 상태입니다." }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const token = await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role.code,
    roleName: user.role.name,
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
