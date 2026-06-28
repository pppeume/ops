import { prisma } from "@/lib/db";
import { getMonthlyRevenue, getRegionDistribution, getPartnerPayments } from "@/lib/queries";
import { formatKRWShort } from "@/lib/utils";
import { GRADE } from "@/lib/constants";
import { PageHeader, Card, SectionTitle, StatusBadge, Th, Td, TableShell } from "@/components/ui";
import { RevenueAreaChart, RegionBarChart, PartnerBarChart } from "@/components/Charts";

export const dynamic = "force-dynamic";

function gradeFromScore(score: number): string {
  return score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "D";
}

export default async function AnalysisPage() {
  const [revenue, regionDist, partnerPay, partners, orderTypes] = await Promise.all([
    getMonthlyRevenue(6),
    getRegionDistribution(),
    getPartnerPayments(),
    prisma.partner.findMany({
      include: {
        evaluations: { select: { score: true } },
        _count: { select: { orderLinks: true } },
      },
    }),
    prisma.orderType.findMany({ include: { _count: { select: { orders: true } } } }),
  ]);

  const ranked = partners
    .map((p) => ({
      name: p.name,
      orders: p._count.orderLinks,
      avg: p.evaluations.length
        ? Math.round(p.evaluations.reduce((s, e) => s + e.score, 0) / p.evaluations.length)
        : null,
    }))
    .filter((p) => p.avg !== null)
    .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));

  const typeTotal = orderTypes.reduce((s, t) => s + t._count.orders, 0) || 1;

  return (
    <div className="space-y-6">
      <PageHeader title="운영 분석" description="수익, 권역, 협력업체 성과를 다각도로 분석합니다." />

      <Card>
        <SectionTitle action={<span className="text-xs text-ink-400">최근 6개월</span>}>수익 추이 (입금·지급)</SectionTitle>
        <div className="p-4"><RevenueAreaChart data={revenue} /></div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle>권역별 발주 분포</SectionTitle>
          <div className="p-4"><RegionBarChart data={regionDist} /></div>
        </Card>
        <Card>
          <SectionTitle>협력업체별 지급액 (상위 6)</SectionTitle>
          <div className="p-4"><PartnerBarChart data={partnerPay} /></div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle>협력업체 평가 순위</SectionTitle>
          <TableShell>
            <thead>
              <tr className="border-b border-ink-100">
                <Th>순위</Th>
                <Th>협력업체</Th>
                <Th className="text-center">참여 발주</Th>
                <Th className="text-center">평균 점수</Th>
                <Th className="text-center">등급</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {ranked.map((p, i) => (
                <tr key={p.name} className="transition hover:bg-ink-50/50">
                  <Td className="font-bold text-ink-400">{i + 1}</Td>
                  <Td className="font-medium text-ink-800">{p.name}</Td>
                  <Td className="text-center text-ink-600">{p.orders}건</Td>
                  <Td className="text-center font-semibold text-ink-800">{p.avg}</Td>
                  <Td className="text-center"><StatusBadge map={GRADE} value={gradeFromScore(p.avg!)} /></Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Card>

        <Card>
          <SectionTitle>발주 유형별 비중</SectionTitle>
          <div className="space-y-4 p-5">
            {orderTypes.map((t) => {
              const pct = Math.round((t._count.orders / typeTotal) * 100);
              return (
                <div key={t.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-700">{t.name}</span>
                    <span className="text-ink-500">{t._count.orders}건 · {pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
