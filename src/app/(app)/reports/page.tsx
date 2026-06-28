import { prisma } from "@/lib/db";
import { getKpis } from "@/lib/queries";
import { formatKRW, formatKRWShort, formatDate, profitRate } from "@/lib/utils";
import { PageHeader, Card, SectionTitle, Th, Td, TableShell } from "@/components/ui";
import { ReportToolbar } from "./ReportToolbar";

export const dynamic = "force-dynamic";

export default async function ReportsPage({ searchParams }: { searchParams: { region?: string } }) {
  const regionId = searchParams.region ? Number(searchParams.region) : undefined;

  const [kpi, regions, byRegion] = await Promise.all([
    getKpis(),
    prisma.region.findMany({ orderBy: { id: "asc" } }),
    prisma.region.findMany({
      where: regionId ? { id: regionId } : undefined,
      orderBy: { id: "asc" },
      include: {
        sites: {
          include: {
            orders: {
              include: { deposits: { select: { amount: true } }, payments: { select: { amount: true } } },
            },
          },
        },
      },
    }),
  ]);

  const regionRows = byRegion.map((r) => {
    let orders = 0, income = 0, cost = 0;
    for (const site of r.sites) {
      for (const o of site.orders) {
        orders += 1;
        income += o.deposits.reduce((s, d) => s + d.amount, 0);
        cost += o.payments.reduce((s, p) => s + p.amount, 0);
      }
    }
    return { name: r.name, sites: r.sites.length, orders, income, cost, profit: income - cost };
  });

  const tot = regionRows.reduce(
    (a, r) => ({ orders: a.orders + r.orders, income: a.income + r.income, cost: a.cost + r.cost }),
    { orders: 0, income: 0, cost: 0 }
  );

  return (
    <div className="space-y-6">
      <PageHeader title="운영 보고서" description="조건별 운영·정산 보고서를 생성하고 PDF/Excel로 내려받습니다.">
        <ReportToolbar regions={regions.map((r) => ({ id: r.id, name: r.name }))} />
      </PageHeader>

      {/* Print-friendly report sheet */}
      <Card className="p-8 print:shadow-none">
        <div className="mb-6 flex items-start justify-between border-b border-ink-200 pb-5">
          <div>
            <h2 className="text-lg font-bold text-ink-900">유지보수 운영 정산 보고서</h2>
            <p className="mt-1 text-sm text-ink-500">
              생성일 {formatDate(new Date())} · {regionId ? regions.find((r) => r.id === regionId)?.name : "전체 권역"}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-lg font-black text-white">K</div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["총 발주", `${tot.orders}건`],
            ["누적 입금", `${formatKRWShort(tot.income)}원`],
            ["누적 지급", `${formatKRWShort(tot.cost)}원`],
            ["순수익", `${formatKRWShort(tot.income - tot.cost)}원`],
          ].map(([l, v]) => (
            <div key={l} className="rounded-lg border border-ink-100 bg-ink-50/50 p-4">
              <p className="text-xs text-ink-400">{l}</p>
              <p className="mt-1 text-lg font-bold text-ink-900">{v}</p>
            </div>
          ))}
        </div>

        <SectionTitle>권역별 운영 현황</SectionTitle>
        <TableShell>
          <thead>
            <tr className="border-b border-ink-100">
              <Th>권역</Th>
              <Th className="text-center">사업소</Th>
              <Th className="text-center">발주</Th>
              <Th className="text-right">입금</Th>
              <Th className="text-right">지급</Th>
              <Th className="text-right">순수익</Th>
              <Th className="text-center">수익률</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {regionRows.map((r) => (
              <tr key={r.name}>
                <Td className="font-medium text-ink-800">{r.name}</Td>
                <Td className="text-center text-ink-600">{r.sites}</Td>
                <Td className="text-center text-ink-600">{r.orders}</Td>
                <Td className="text-right tabular-nums text-ink-700">{formatKRW(r.income)}</Td>
                <Td className="text-right tabular-nums text-rose-600">{formatKRW(r.cost)}</Td>
                <Td className="text-right font-semibold tabular-nums text-emerald-600">{formatKRW(r.profit)}</Td>
                <Td className="text-center text-ink-600">{profitRate(r.income, r.cost)}%</Td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-ink-100 bg-ink-50/50 font-semibold">
              <Td className="text-ink-800">합계</Td>
              <Td></Td>
              <Td className="text-center text-ink-700">{tot.orders}</Td>
              <Td className="text-right tabular-nums text-ink-900">{formatKRW(tot.income)}</Td>
              <Td className="text-right tabular-nums text-rose-600">{formatKRW(tot.cost)}</Td>
              <Td className="text-right tabular-nums text-emerald-600">{formatKRW(tot.income - tot.cost)}</Td>
              <Td className="text-center text-ink-700">{profitRate(tot.income, tot.cost)}%</Td>
            </tr>
          </tfoot>
        </TableShell>

        <p className="mt-6 text-xs text-ink-400">
          본 보고서는 KIOT OPS 운영 데이터를 기준으로 자동 생성되었습니다.
        </p>
      </Card>
    </div>
  );
}
