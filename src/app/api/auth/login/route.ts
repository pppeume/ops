import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "이메일과 비밀번호를 입력해 주세요." }, { status: 400 });
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
