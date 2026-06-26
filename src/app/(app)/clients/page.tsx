import { prisma } from "@/lib/db";
import { createClient } from "@/lib/actions";
import { COMMON_STATUS } from "@/lib/constants";
import { PageHeader, Card, Th, Td, TableShell, EmptyState, StatusBadge } from "@/components/ui";
import { FormModal, Field, PlusTrigger } from "@/components/forms";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { orders: true, contracts: true } } },
  });

  return (
    <div>
      <PageHeader title="발주처" description="발주를 의뢰하는 고객사를 관리합니다.">
        <FormModal triggerLabel={<PlusTrigger label="발주처 등록" />} title="발주처 등록" action={createClient}>
          <div className="sm:col-span-2">
            <Field label="발주처명" required><input name="name" required className="input" /></Field>
          </div>
          <Field label="담당자"><input name="manager" className="input" /></Field>
          <Field label="연락처"><input name="contact" className="input" /></Field>
        </FormModal>
      </PageHeader>

      <Card>
        {clients.length === 0 ? (
          <EmptyState title="등록된 발주처가 없습니다." />
        ) : (
          <TableShell>
            <thead>
              <tr className="border-b border-ink-100">
                <Th>발주처명</Th>
                <Th>담당자</Th>
                <Th>연락처</Th>
                <Th className="text-center">계약/발주</Th>
                <Th>상태</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {clients.map((c) => (
                <tr key={c.id} className="transition hover:bg-ink-50/50">
                  <Td className="font-medium text-ink-800">{c.name}</Td>
                  <Td className="text-ink-600">{c.manager ?? "-"}</Td>
                  <Td className="text-ink-600">{c.contact ?? "-"}</Td>
                  <Td className="text-center text-ink-600">{c._count.contracts} / {c._count.orders}</Td>
                  <Td><StatusBadge map={COMMON_STATUS} value={c.status} /></Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Card>
    </div>
  );
}
