import { prisma } from "@/lib/db";
import { createPartner } from "@/lib/actions";
import { COMMON_STATUS, GRADE } from "@/lib/constants";
import { formatKRWShort } from "@/lib/utils";
import { PageHeader, Card, Th, Td, TableShell, EmptyState, StatusBadge, Badge } from "@/components/ui";
import { FormModal, Field, PlusTrigger } from "@/components/forms";

export const dynamic = "force-dynamic";

function gradeFromScore(score: number): string {
  return score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "D";
}

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { orderLinks: true } },
      evaluations: { select: { score: true } },
      payments: { select: { amount: true } },
    },
  });

  return (
    <div>
      <PageHeader title="협력업체" description="작업을 수행하는 협력업체와 성과를 관리합니다.">
        <FormModal triggerLabel={<PlusTrigger label="협력업체 등록" />} title="협력업체 등록" action={createPartner}>
          <div className="sm:col-span-2">
            <Field label="업체명" required><input name="name" required className="input" /></Field>
          </div>
          <Field label="업종"><input name="industry" className="input" placeholder="예: 기계설비" /></Field>
          <Field label="담당자"><input name="manager" className="input" /></Field>
          <Field label="연락처"><input name="contact" className="input" /></Field>
        </FormModal>
      </PageHeader>

      <Card>
        {partners.length === 0 ? (
          <EmptyState title="등록된 협력업체가 없습니다." />
        ) : (
          <TableShell>
            <thead>
              <tr className="border-b border-ink-100">
                <Th>업체명</Th>
                <Th>업종</Th>
                <Th>담당자</Th>
                <Th className="text-center">참여 발주</Th>
                <Th className="text-right">누적 지급</Th>
                <Th className="text-center">평균 평가</Th>
                <Th>상태</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {partners.map((p) => {
                const avg = p.evaluations.length
                  ? Math.round(p.evaluations.reduce((s, e) => s + e.score, 0) / p.evaluations.length)
                  : null;
                const paid = p.payments.reduce((s, x) => s + x.amount, 0);
                return (
                  <tr key={p.id} className="transition hover:bg-ink-50/50">
                    <Td className="font-medium text-ink-800">{p.name}</Td>
                    <Td><Badge tone="violet">{p.industry ?? "기타"}</Badge></Td>
                    <Td className="text-ink-600">{p.manager ?? "-"}<span className="ml-1 text-xs text-ink-400">{p.contact}</span></Td>
                    <Td className="text-center text-ink-600">{p._count.orderLinks}건</Td>
                    <Td className="text-right font-medium tabular-nums">{formatKRWShort(paid)}원</Td>
                    <Td className="text-center">
                      {avg === null ? <span className="text-ink-300">-</span> : (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="text-sm font-bold text-ink-700">{avg}</span>
                          <StatusBadge map={GRADE} value={gradeFromScore(avg)} />
                        </span>
                      )}
                    </Td>
                    <Td><StatusBadge map={COMMON_STATUS} value={p.status} /></Td>
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
