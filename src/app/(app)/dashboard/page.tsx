import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  getKpis,
  getMonthlyRevenue,
  getStatusDistribution,
  getRegionDistribution,
} from "@/lib/queries";
import { formatKRWShort, formatDate } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import { Card, StatCard, SectionTitle, StatusBadge, Th, Td, TableShell } from "@/components/ui";
import { RevenueAreaChart, StatusDonut, RegionBarChart } from "@/components/Charts";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

const DONUT_COLORS = ["#94a3b8", "#3366ff", "#10b981", "#8b5cf6"];

export default async function DashboardPage() {
  const [kpi, revenue, statusDist, regionDist, recentOrders, notices] = await Promise.all([
    getKpis(),
    getMonthlyRevenue(6),
    getStatusDistribution(),
    getRegionDistribution(),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { site: true, orderType: true, partners: { include: { partner: true } } },
    }),
    prisma.notice.findMany({ where: { status: "PUBLISHED" }, take: 4, orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900">운영 대시보드</h1>
          <p className="mt-1 text-sm text-ink-500">
            계약·발주·정산 현황을 한눈에 확인하세요. ({formatDate(new Date())} 기준)
          </p>
        </div>
        <Link href="/orders/new" className="btn-primary">
          <Icon.plus className="h-4 w-4" /> 발주 등록
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="누적 입금"
          value={`${formatKRWShort(kpi.income)}원`}
          sub="발주처 기성"
          trend={{ dir: "up", value: `수익률 ${kpi.profitRate}%` }}
          accent="brand"
        />
        <StatCard
          label="순수익"
          value={`${formatKRWShort(kpi.profit)}원`}
          sub={`지급 ${formatKRWShort(kpi.cost)}원`}
          accent="emerald"
        />
        <StatCard
          label="진행 중 발주"
          value={`${kpi.inProgress}건`}
          sub={`완료 ${kpi.completed} · 접수 ${kpi.received}`}
          accent="amber"
        />
        <StatCard
          label="활성 계약 / 사업소"
          value={`${kpi.activeContracts} / ${kpi.sites}`}
          sub={`협력업체 ${kpi.partners}곳`}
          accent="violet"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle action={<span className="text-xs text-ink-400">최근 6개월</span>}>
            입금 · 지급 추이
          </SectionTitle>
          <div className="p-4">
            <RevenueAreaChart data={revenue} />
            <div className="mt-2 flex justify-center gap-6 text-xs text-ink-500">
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-brand-500" /> 입금</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber-500" /> 지급</span>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle>발주 상태 분포</SectionTitle>
          <div className="p-4">
            <StatusDonut data={statusDist} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {statusDist.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <i className="h-2.5 w-2.5 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                  <span className="text-ink-500">{s.name}</span>
                  <span className="ml-auto font-semibold text-ink-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent orders + side column */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle action={<Link href="/orders" className="text-xs font-medium text-brand-600 hover:underline">전체 보기</Link>}>
            최근 발주
          </SectionTitle>
          <TableShell>
            <thead>
              <tr>
                <Th>발주번호</Th>
                <Th>제목 / 사업소</Th>
                <Th>협력업체</Th>
                <Th className="text-right">금액</Th>
                <Th>상태</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {recentOrders.map((o) => (
                <tr key={o.id} className="transition hover:bg-ink-50/50">
                  <Td>
                    <Link href={`/orders/${o.id}`} className="font-medium text-brand-700 hover:underline">
                      {o.orderNo}
                    </Link>
                  </Td>
                  <Td>
                    <div className="font-medium text-ink-800">{o.title}</div>
                    <div className="text-xs text-ink-400">{o.site.name}</div>
                  </Td>
                  <Td className="text-ink-600">{o.partners[0]?.partner.name ?? "-"}</Td>
                  <Td className="text-right font-medium tabular-nums">{formatKRWShort(o.amount)}원</Td>
                  <Td><StatusBadge map={ORDER_STATUS} value={o.status} /></Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle>권역별 발주</SectionTitle>
            <div className="p-4"><RegionBarChart data={regionDist} /></div>
          </Card>
          <Card>
            <SectionTitle action={<Link href="/notices" className="text-xs font-medium text-brand-600 hover:underline">더보기</Link>}>
              공지사항
            </SectionTitle>
            <ul className="divide-y divide-ink-50">
              {notices.map((n) => (
                <li key={n.id} className="flex items-start gap-2 px-5 py-3">
                  {n.pinned && <span className="mt-0.5 shrink-0 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">중요</span>}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-800">{n.title}</p>
                    <p className="text-xs text-ink-400">{formatDate(n.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
