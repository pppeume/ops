import { prisma } from "@/lib/db";
import { createSite } from "@/lib/actions";
import { PageHeader, Card, Th, Td, TableShell, EmptyState, Badge } from "@/components/ui";
import { FormModal, Field, PlusTrigger } from "@/components/forms";

export const dynamic = "force-dynamic";

export default async function SitesPage() {
  const [sites, regions, siteTypes] = await Promise.all([
    prisma.site.findMany({
      orderBy: { name: "asc" },
      include: { region: true, siteType: true, _count: { select: { orders: true, contracts: true } } },
    }),
    prisma.region.findMany({ orderBy: { name: "asc" } }),
    prisma.siteType.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="사업소" description="유지보수 운영 대상 사업소를 관리합니다.">
        <FormModal triggerLabel={<PlusTrigger label="사업소 등록" />} title="사업소 등록" action={createSite}>
          <div className="sm:col-span-2">
            <Field label="사업소명" required>
              <input name="name" required className="input" placeholder="예: 강남 코오롱타워" />
            </Field>
          </div>
          <Field label="권역" required>
            <select name="regionId" required className="input">
              {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </Field>
          <Field label="구분" required>
            <select name="siteTypeId" required className="input">
              {siteTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="주소"><input name="address" className="input" /></Field>
          </div>
          <Field label="담당자"><input name="manager" className="input" /></Field>
          <Field label="연락처"><input name="contact" className="input" /></Field>
        </FormModal>
      </PageHeader>

      <Card>
        {sites.length === 0 ? (
          <EmptyState title="등록된 사업소가 없습니다." />
        ) : (
          <TableShell>
            <thead>
              <tr className="border-b border-ink-100">
                <Th>사업소명</Th>
                <Th>권역</Th>
                <Th>구분</Th>
                <Th>주소</Th>
                <Th>담당자</Th>
                <Th className="text-center">계약/발주</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {sites.map((s) => (
                <tr key={s.id} className="transition hover:bg-ink-50/50">
                  <Td className="font-medium text-ink-800">{s.name}</Td>
                  <Td><Badge tone="blue">{s.region.name}</Badge></Td>
                  <Td className="text-ink-600">{s.siteType.name}</Td>
                  <Td className="max-w-xs truncate text-ink-500">{s.address ?? "-"}</Td>
                  <Td className="text-ink-600">{s.manager ?? "-"}<span className="ml-1 text-xs text-ink-400">{s.contact}</span></Td>
                  <Td className="text-center text-ink-600">{s._count.contracts} / {s._count.orders}</Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Card>
    </div>
  );
}
