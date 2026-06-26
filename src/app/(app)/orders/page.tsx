import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatKRWShort, formatDate } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import { PageHeader, Card, StatusBadge, Th, Td, TableShell, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { FilterSelect } from "@/components/FilterSelect";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; site?: string };
}) {
  const status = searchParams.status;
  const siteId = searchParams.site ? Number(searchParams.site) : undefined;

  const [orders, sites, counts] = await Promise.all([
    prisma.order.findMany({
      where: { status: status || undefined, siteId },
      orderBy: { createdAt: "desc" },
      include: {
        site: true,
        client: true,
        orderType: true,
        partners: { include: { partner: true } },
      },
    }),
    prisma.site.findMany({ orderBy: { name: "asc" } }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
  ]);

  const countMap: Record<string, number> = {};
  let total = 0;
  for (const c of counts) {
    countMap[c.status] = c._count;
    total += c._count;
  }

  const tabs = [
    { key: "", label: "전체", count: total },
    ...Object.entries(ORDER_STATUS).map(([k, v]) => ({ key: k, label: v.label, count: countMap[k] ?? 0 })),
  ];

  const qs = (next: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status, site: searchParams.site, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const str = p.toString();
    return str ? `?${str}` : "";
  };

  return (
    <div>
      <PageHeader title="발주 관리" description="계약 기준으로 생성된 발주의 진행·정산 현황을 관리합니다.">
        <Link href="/orders/new" className="btn-primary">
          <Icon.plus className="h-4 w-4" /> 발주 등록
        </Link>
      </PageHeader>

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="flex flex-wrap gap-1">
          {tabs.map((t) => {
            const active = (status ?? "") === t.key;
            return (
              <Link
                key={t.key}
                href={`/orders${qs({ status: t.key || undefined })}`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                  active ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-100"
                )}
              >
                {t.label}
                <span className={cn("rounded-full px-1.5 text-xs", active ? "bg-white/20" : "bg-ink-100 text-ink-500")}>
                  {t.count}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="ml-auto">
          <FilterSelect
            paramKey="site"
            placeholder="전체 사업소"
            options={sites.map((s) => ({ value: String(s.id), label: s.name }))}
          />
        </div>
      </Card>

      <Card>
        {orders.length === 0 ? (
          <EmptyState title="발주 내역이 없습니다." hint="필터를 변경하거나 새 발주를 등록해 보세요." />
        ) : (
          <TableShell>
            <thead>
              <tr className="border-b border-ink-100">
                <Th>발주번호</Th>
                <Th>제목 / 유형</Th>
                <Th>사업소 / 발주처</Th>
                <Th>협력업체</Th>
                <Th>기간</Th>
                <Th className="text-right">금액</Th>
                <Th>상태</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {orders.map((o) => (
                <tr key={o.id} className="group transition hover:bg-ink-50/50">
                  <Td>
                    <Link href={`/orders/${o.id}`} className="font-semibold text-brand-700 hover:underline">
                      {o.orderNo}
                    </Link>
                  </Td>
                  <Td>
                    <div className="font-medium text-ink-800">{o.title}</div>
                    <div className="text-xs text-ink-400">{o.orderType.name}</div>
                  </Td>
                  <Td>
                    <div className="text-ink-700">{o.site.name}</div>
                    <div className="text-xs text-ink-400">{o.client.name}</div>
                  </Td>
                  <Td className="text-ink-600">
                    {o.partners[0]?.partner.name ?? "-"}
                    {o.partners.length > 1 && <span className="ml-1 text-xs text-ink-400">+{o.partners.length - 1}</span>}
                  </Td>
                  <Td className="text-xs text-ink-500">
                    {formatDate(o.startDate)} ~ {formatDate(o.endDate)}
                  </Td>
                  <Td className="text-right font-medium tabular-nums">{formatKRWShort(o.amount)}원</Td>
                  <Td><StatusBadge map={ORDER_STATUS} value={o.status} /></Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Card>
    </div>
  );
}
