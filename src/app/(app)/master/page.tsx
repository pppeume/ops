import { prisma } from "@/lib/db";
import { createMasterCode } from "@/lib/actions";
import { PageHeader, Card, SectionTitle, Badge } from "@/components/ui";
import { FormModal, Field, PlusTrigger } from "@/components/forms";

export const dynamic = "force-dynamic";

export default async function MasterPage() {
  const [regions, siteTypes, orderTypes] = await Promise.all([
    prisma.region.findMany({ orderBy: { id: "asc" }, include: { _count: { select: { sites: true } } } }),
    prisma.siteType.findMany({ orderBy: { id: "asc" }, include: { _count: { select: { sites: true } } } }),
    prisma.orderType.findMany({ orderBy: { id: "asc" }, include: { _count: { select: { orders: true } } } }),
  ]);

  const block = (
    title: string,
    kind: string,
    items: { id: number; name: string; count: number; unit: string }[]
  ) => (
    <Card>
      <SectionTitle
        action={
          <FormModal
            triggerLabel={<PlusTrigger label="추가" />}
            triggerClassName="btn-ghost btn-sm"
            title={`${title} 추가`}
            action={createMasterCode}
          >
            <input type="hidden" name="kind" value={kind} />
            <div className="sm:col-span-2">
              <Field label="이름" required><input name="name" required className="input" /></Field>
            </div>
          </FormModal>
        }
      >
        {title}
      </SectionTitle>
      <ul className="divide-y divide-ink-50">
        {items.map((it) => (
          <li key={it.id} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm font-medium text-ink-800">{it.name}</span>
            <Badge tone="gray">{it.count}{it.unit}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  );

  return (
    <div>
      <PageHeader title="기준 코드 관리" description="권역, 사업소 구분, 발주 유형 등 공통 기준정보를 관리합니다." />
      <div className="grid gap-4 lg:grid-cols-3">
        {block("권역", "region", regions.map((r) => ({ id: r.id, name: r.name, count: r._count.sites, unit: "개소" })))}
        {block("사업소 구분", "siteType", siteTypes.map((t) => ({ id: t.id, name: t.name, count: t._count.sites, unit: "개소" })))}
        {block("발주 유형", "orderType", orderTypes.map((t) => ({ id: t.id, name: t.name, count: t._count.orders, unit: "건" })))}
      </div>
    </div>
  );
}
