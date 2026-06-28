import { prisma } from "@/lib/db";
import { createUser } from "@/lib/actions";
import { formatDateTime } from "@/lib/utils";
import { COMMON_STATUS, ROLE_LABELS } from "@/lib/constants";
import { PageHeader, Card, Th, Td, TableShell, EmptyState, StatusBadge, Badge } from "@/components/ui";
import { FormModal, Field, PlusTrigger } from "@/components/forms";

export const dynamic = "force-dynamic";

const roleTone: Record<string, "blue" | "violet" | "green" | "gray"> = {
  ADMIN: "violet", MANAGER: "blue", STAFF: "green", VIEWER: "gray",
};

export default async function UsersPage() {
  const [users, roles, affiliations] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      include: { role: true, affiliation: true, _count: { select: { siteAssignments: true } } },
    }),
    prisma.role.findMany({ orderBy: { id: "asc" } }),
    prisma.affiliation.findMany({ orderBy: { id: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="사용자 · 권한" description="플랫폼 사용자 계정과 역할(권한)을 관리합니다.">
        <FormModal triggerLabel={<PlusTrigger label="사용자 등록" />} title="사용자 등록" action={createUser} size="lg">
          <Field label="이름" required><input name="name" required className="input" /></Field>
          <Field label="이메일" required><input name="email" type="email" required className="input" /></Field>
          <Field label="역할" required>
            <select name="roleId" required className="input">
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </Field>
          <Field label="소속">
            <select name="affiliationId" className="input">
              <option value="">선택 안 함</option>
              {affiliations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
          <Field label="연락처"><input name="phone" className="input" /></Field>
          <Field label="초기 비밀번호"><input name="password" className="input" placeholder="기본: user1234!" /></Field>
        </FormModal>
      </PageHeader>

      <Card>
        {users.length === 0 ? (
          <EmptyState title="등록된 사용자가 없습니다." />
        ) : (
          <TableShell>
            <thead>
              <tr className="border-b border-ink-100">
                <Th>이름 / 이메일</Th>
                <Th>역할</Th>
                <Th>소속</Th>
                <Th className="text-center">배정 사업소</Th>
                <Th>최근 접속</Th>
                <Th>상태</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {users.map((u) => (
                <tr key={u.id} className="transition hover:bg-ink-50/50">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                        {u.name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-ink-800">{u.name}</div>
                        <div className="text-xs text-ink-400">{u.email}</div>
                      </div>
                    </div>
                  </Td>
                  <Td><Badge tone={roleTone[u.role.code] ?? "gray"}>{ROLE_LABELS[u.role.code] ?? u.role.name}</Badge></Td>
                  <Td className="text-ink-600">{u.affiliation?.name ?? "-"}</Td>
                  <Td className="text-center text-ink-600">{u._count.siteAssignments}개소</Td>
                  <Td className="text-xs text-ink-500">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "-"}</Td>
                  <Td><StatusBadge map={COMMON_STATUS} value={u.status} /></Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Card>
    </div>
  );
}
