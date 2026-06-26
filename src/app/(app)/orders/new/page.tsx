import Link from "next/link";
import { prisma } from "@/lib/db";
import { createOrder } from "@/lib/actions";
import { PageHeader, Card } from "@/components/ui";
import { Field, SubmitButton } from "@/components/forms";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const [sites, clients, orderTypes, partners, contracts] = await Promise.all([
    prisma.site.findMany({ orderBy: { name: "asc" } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.orderType.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.partner.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.contract.findMany({ orderBy: { createdAt: "desc" }, include: { site: true } }),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="발주 등록" description="새 발주를 등록합니다. 등록 후 진행 내역·비용을 추가할 수 있습니다.">
        <Link href="/orders" className="btn-ghost">목록으로</Link>
      </PageHeader>

      <Card className="p-6">
        <form action={createOrder} className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="발주 제목" required>
              <input name="title" required className="input" placeholder="예: 공조설비 정기점검" />
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

          <Field label="발주 유형" required>
            <select name="orderTypeId" required className="input">
              {orderTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>

          <Field label="연계 계약">
            <select name="contractId" className="input">
              <option value="">선택 안 함</option>
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>{c.contractNo} · {c.site.name}</option>
              ))}
            </select>
          </Field>

          <Field label="주관 협력업체">
            <select name="partnerId" className="input">
              <option value="">선택 안 함</option>
              {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>

          <Field label="발주 금액 (원)" required>
            <input name="amount" type="number" min="0" step="1000" required className="input" placeholder="0" />
          </Field>

          <Field label="시작일" required>
            <input name="startDate" type="date" required defaultValue={today} className="input" />
          </Field>

          <Field label="종료일" required>
            <input name="endDate" type="date" required defaultValue={today} className="input" />
          </Field>

          <div className="sm:col-span-2">
            <Field label="설명">
              <textarea name="description" rows={3} className="input" placeholder="발주 내용, 특이사항 등" />
            </Field>
          </div>

          <div className="sm:col-span-2 flex justify-end gap-2 border-t border-ink-100 pt-5">
            <Link href="/orders" className="btn-ghost">취소</Link>
            <SubmitButton>발주 등록</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
