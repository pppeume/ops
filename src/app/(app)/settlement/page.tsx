import Link from "next/link";
import { prisma } from "@/lib/db";
import { getKpis, getMonthlyRevenue } from "@/lib/queries";
import { formatKRW, formatKRWShort, profitRate } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import { PageHeader, Card, SectionTitle, StatCard, StatusBadge, Th, Td, TableShell, Badge } from "@/components/ui";
import { RevenueAreaChart } from "@/components/Charts";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SettlementPage() {
  const [kpi, revenue, orders] = await Promise.all([
    getKpis(),
    getMonthlyRevenue(6),
    prisma.order.findMany({
      where: { OR: [{ deposits: { some: {} } }, { payments: { some: {} } }] },
      orderBy: { updatedAt: "desc" },
      include: {
        site: true,
        deposits: { select: { amount: true } },
        payments: { select: { amount: true } },
      },
    }),
  ]);

  const rows = orders
    .map((o) => {
      const income = o.deposits.reduce((s, d) => s + d.amount, 0);
      const cost = o.payments.reduce((s, p) => s + p.amount, 0);
      return { o, income, cost, profit: income - cost, rate: profitRate(income, cost) };
    })
    .sort((a, b) => b.income - a.income);

  return (
    <div className="space-y-6">
      <PageHeader title="정산 관리" description="발주별 입금-지급을 집계하여 수익과 수익률을 확인합니다." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="누적 입금" value={`${formatKRWShort(kpi.income)}원`} accent="brand" />
        <StatCard label="누적 지급" value={`${formatKRWShort(kpi.cost)}원`} accent="amber" />
        <StatCard label="순수익" value={`${formatKRWShort(kpi.profit)}원`} accent="emerald" />
        <StatCard label="평균 수익률" value={`${kpi.profitRate}%`} accent="violet" />
      </div>

      <Card>
        <SectionTitle action={<span className="text-xs text-ink-400">최근 6개월</span>}>월별 입금·지급 추이</SectionTitle>
        <div className="p-4">
          <RevenueAreaChart data={revenue} />
        </div>
      </Card>

      <Card>
        <SectionTitle action={<span className="text-xs text-ink-400">총 {rows.length}건</span>}>발주별 정산 내역</SectionTitle>
        <TableShell>
          <thead>
            <tr className="border-b border-ink-100">
              <Th>발주번호</Th>
              <Th>사업소</Th>
              <Th className="text-right">입금</Th>
              <Th className="text-right">지급</Th>
              <Th className="text-right">순수익</Th>
              <Th className="text-center">수익률</Th>
              <Th>상태</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {rows.map(({ o, income, cost, profit, rate }) => (
              <tr key={o.id} className="transition hover:bg-ink-50/50">
                <Td>
                  <Link href={`/orders/${o.id}`} className="font-semibold text-brand-700 hover:underline">{o.orderNo}</Link>
                  <div className="text-xs text-ink-400">{o.title}</div>
                </Td>
                <Td className="text-ink-600">{o.site.name}</Td>
                <Td className="text-right tabular-nums text-ink-700">{formatKRW(income)}</Td>
                <Td className="text-right tabular-nums text-rose-600">{formatKRW(cost)}</Td>
                <Td className={cn("text-right font-semibold tabular-nums", profit >= 0 ? "text-emerald-600" : "text-rose-600")}>
                  {formatKRW(profit)}
                </Td>
                <Td className="text-center">
                  <Badge tone={rate >= 15 ? "green" : rate >= 0 ? "amber" : "red"}>{rate}%</Badge>
                </Td>
                <Td><StatusBadge map={ORDER_STATUS} value={o.status} /></Td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-ink-100 bg-ink-50/50 font-semibold">
              <Td className="text-ink-800">합계</Td>
              <Td></Td>
              <Td className="text-right tabular-nums text-ink-900">{formatKRW(kpi.income)}</Td>
              <Td className="text-right tabular-nums text-rose-600">{formatKRW(kpi.cost)}</Td>
              <Td className="text-right tabular-nums text-emerald-600">{formatKRW(kpi.profit)}</Td>
              <Td className="text-center text-ink-700">{kpi.profitRate}%</Td>
              <Td></Td>
            </tr>
          </tfoot>
        </TableShell>
      </Card>
    </div>
  );
}
