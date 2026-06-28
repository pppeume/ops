import { prisma } from "@/lib/db";
import { createContract } from "@/lib/actions";
import { formatKRW, formatDate, daysBetween } from "@/lib/utils";
import { CONTRACT_STATUS } from "@/lib/constants";
import { PageHeader, Card, StatusBadge, Th, Td, TableShell, EmptyState } from "@/components/ui";
import { FormModal, Field, PlusTrigger } from "@/components/forms";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const [contracts, sites, clients] = await Promise.all([
    prisma.contract.findMany({
      orderBy: { createdAt: "desc" },
      include: { site: true, client: true, _count: { select: { orders: true } } },
    }),
    prisma.site.findMany({ orderBy: { name: "asc" } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  const createForm = (
    <FormModal
      triggerLabel={<PlusTrigger label="계약 등록" />}
      title="계약 등록"
      description="사업소-발주처 간 유지보수 계약을 등록합니다."
      action={createContract}
      size="lg"
    >
      <div className="sm:col-span-2">
        <Field label="계약명" required>
          <input name="title" required className="input" placeholder="예: 강남 코오롱타워 연간 유지보수 계약" />
        </Field>
      </div>
      <Field label="사업소" required>
        <select name="siteId" required className="input">
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>
      <Field label="발주처" required>
        <select name="clientId" required className="input">
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="시작일" required>
        <input name="startDate" type="date" required defaultValue={today} className="input" />
      </Field>
      <Field label="종료일" required>
        <input name="endDate" type="date" required defaultValue={today} className="input" />
      </Field>
      <Field label="계약 금액 (원)" required>
        <input name="amount" type="number" min="0" step="1000" required className="input" />
      </Field>
      <Field label="상태">
        <select name="status" defaultValue="ACTIVE" className="input">
          {Object.entries(CONTRACT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </Field>
    </FormModal>
  );

  return (
    <div>
      <PageHeader title="계약 관리" description="계약 조건을 기준으로 발주가 생성됩니다.">
        {createForm}
      </PageHeader>

      <Card>
        {contracts.length === 0 ? (
          <EmptyState title="등록된 계약이 없습니다." />
        ) : (
          <TableShell>
            <thead>
              <tr className="border-b border-ink-100">
                <Th>계약번호</Th>
                <Th>계약명 / 사업소</Th>
                <Th>발주처</Th>
                <Th>계약기간</Th>
                <Th className="text-right">계약금액</Th>
                <Th className="text-center">발주</Th>
                <Th>상태</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {contracts.map((c) => {
                const remain = daysBetween(now, c.endDate);
                return (
                  <tr key={c.id} id={String(c.id)} className="transition hover:bg-ink-50/50">
                    <Td><span className="font-mono font-medium text-ink-700">{c.contractNo}</span></Td>
                    <Td>
                      <div className="font-medium text-ink-800">{c.title}</div>
                      <div className="text-xs text-ink-400">{c.site.name}</div>
                    </Td>
                    <Td className="text-ink-600">{c.client.name}</Td>
                    <Td className="text-xs text-ink-500">
                      {formatDate(c.startDate)} ~ {formatDate(c.endDate)}
                      {c.status === "ACTIVE" && remain > 0 && (
                        <span className="ml-1 text-brand-500">(D-{remain})</span>
                      )}
                    </Td>
                    <Td className="text-right font-medium tabular-nums">{formatKRW(c.amount)}</Td>
                    <Td className="text-center text-ink-600">{c._count.orders}건</Td>
                    <Td><StatusBadge map={CONTRACT_STATUS} value={c.status} /></Td>
                  </tr>
                );
              })}
            </tbody>
          </TableShell>
        )}
      </Card>
    </div>
  );
}
