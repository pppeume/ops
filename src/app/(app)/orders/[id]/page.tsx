import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  addWorkLog,
  addDeposit,
  addPayment,
  addEvaluation,
  updateOrderStatus,
} from "@/lib/actions";
import { formatKRW, formatDate, formatDateTime, profitRate } from "@/lib/utils";
import { ORDER_STATUS, ORDER_STATUS_FLOW, GRADE, statusMeta } from "@/lib/constants";
import { Card, SectionTitle, StatusBadge, Badge, EmptyState } from "@/components/ui";
import { FormModal, Field, PlusTrigger } from "@/components/forms";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      site: { include: { region: true } },
      client: true,
      orderType: true,
      contract: true,
      partners: { include: { partner: true } },
      workLogs: { orderBy: { workedAt: "desc" }, include: { partner: true, author: true } },
      deposits: { orderBy: { depositedAt: "desc" } },
      payments: { orderBy: { paidAt: "desc" }, include: { partner: true } },
      evaluations: { include: { partner: true } },
    },
  });
  if (!order) notFound();

  const partners = await prisma.partner.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } });

  const income = order.deposits.reduce((s, d) => s + d.amount, 0);
  const cost = order.payments.reduce((s, p) => s + p.amount, 0);
  const profit = income - cost;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/orders" className="text-sm text-ink-400 hover:text-ink-600">← 발주 목록</Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-ink-900">{order.title}</h1>
              <StatusBadge map={ORDER_STATUS} value={order.status} />
            </div>
            <p className="mt-1 font-mono text-sm text-ink-500">{order.orderNo}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-400">발주 금액</p>
            <p className="text-2xl font-bold text-ink-900">{formatKRW(order.amount)}</p>
          </div>
        </div>
      </div>

      {/* Status stepper */}
      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center">
            {ORDER_STATUS_FLOW.map((st, i) => {
              const curIdx = ORDER_STATUS_FLOW.indexOf(order.status as any);
              const done = i <= curIdx;
              const meta = statusMeta(ORDER_STATUS, st);
              return (
                <div key={st} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-4",
                        done ? "bg-brand-600 text-white ring-brand-100" : "bg-ink-100 text-ink-400 ring-white"
                      )}
                    >
                      {i + 1}
                    </div>
                    <span className={cn("text-xs font-medium", done ? "text-ink-800" : "text-ink-400")}>
                      {meta.label}
                    </span>
                  </div>
                  {i < ORDER_STATUS_FLOW.length - 1 && (
                    <div className={cn("mx-2 h-0.5 flex-1", i < curIdx ? "bg-brand-500" : "bg-ink-100")} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1.5 border-t border-ink-100 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            {ORDER_STATUS_FLOW.map((st) => (
              <form key={st} action={updateOrderStatus}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value={st} />
                <button
                  type="submit"
                  disabled={st === order.status}
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                    st === order.status
                      ? "bg-brand-600 text-white"
                      : "border border-ink-200 text-ink-600 hover:bg-ink-50"
                  )}
                >
                  {statusMeta(ORDER_STATUS, st).label}
                </button>
              </form>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: info + worklogs */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionTitle>발주 정보</SectionTitle>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-3">
              <Info label="사업소" value={`${order.site.name} (${order.site.region.name})`} />
              <Info label="발주처" value={order.client.name} />
              <Info label="발주 유형" value={order.orderType.name} />
              <Info label="연계 계약" value={order.contract?.contractNo ?? "—"} />
              <Info label="시작일" value={formatDate(order.startDate)} />
              <Info label="종료일" value={formatDate(order.endDate)} />
              <div className="col-span-2 sm:col-span-3">
                <Info label="설명" value={order.description ?? "—"} />
              </div>
            </dl>
          </Card>

          <Card>
            <SectionTitle
              action={
                <FormModal
                  triggerLabel={<PlusTrigger label="작업기록" />}
                  triggerClassName="btn-ghost btn-sm"
                  title="작업기록 등록"
                  action={addWorkLog}
                >
                  <input type="hidden" name="orderId" value={order.id} />
                  <div className="sm:col-span-2">
                    <Field label="제목" required>
                      <input name="title" required className="input" placeholder="예: 1차 현장 점검" />
                    </Field>
                  </div>
                  <Field label="협력업체">
                    <select name="partnerId" className="input">
                      <option value="">선택</option>
                      {order.partners.map((op) => (
                        <option key={op.partnerId} value={op.partnerId}>{op.partner.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="작업일" required>
                    <input name="workedAt" type="date" required defaultValue={today} className="input" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="내용" required>
                      <textarea name="content" rows={3} required className="input" placeholder="작업 내용을 입력하세요." />
                    </Field>
                  </div>
                </FormModal>
              }
            >
              진행 내역 (작업기록)
            </SectionTitle>
            {order.workLogs.length === 0 ? (
              <EmptyState title="등록된 작업기록이 없습니다." />
            ) : (
              <ol className="relative space-y-5 p-5 pl-8">
                <span className="absolute left-[18px] top-7 bottom-7 w-px bg-ink-100" />
                {order.workLogs.map((w) => (
                  <li key={w.id} className="relative">
                    <span className="absolute -left-[18px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-brand-50" />
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink-800">{w.title}</p>
                      <span className="text-xs text-ink-400">{formatDate(w.workedAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink-600">{w.content}</p>
                    <div className="mt-1.5 flex gap-2 text-xs text-ink-400">
                      {w.partner && <span>{w.partner.name}</span>}
                      {w.author && <span>· {w.author.name}</span>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        {/* Right: financials */}
        <div className="space-y-6">
          <Card>
            <SectionTitle>수익 요약</SectionTitle>
            <div className="space-y-3 p-5">
              <Row label="입금 (발주처)" value={formatKRW(income)} tone="text-ink-800" />
              <Row label="지급 (협력업체)" value={`- ${formatKRW(cost)}`} tone="text-rose-600" />
              <div className="my-2 border-t border-dashed border-ink-200" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-600">순수익</span>
                <span className={cn("text-lg font-bold", profit >= 0 ? "text-emerald-600" : "text-rose-600")}>
                  {formatKRW(profit)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-400">수익률</span>
                <Badge tone={profit >= 0 ? "green" : "red"}>{profitRate(income, cost)}%</Badge>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle
              action={
                <FormModal
                  triggerLabel={<PlusTrigger label="입금" />}
                  triggerClassName="btn-ghost btn-sm"
                  title="입금 등록"
                  action={addDeposit}
                >
                  <input type="hidden" name="orderId" value={order.id} />
                  <Field label="금액 (원)" required>
                    <input name="amount" type="number" required className="input" />
                  </Field>
                  <Field label="입금일" required>
                    <input name="depositedAt" type="date" required defaultValue={today} className="input" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="메모"><input name="memo" className="input" /></Field>
                  </div>
                </FormModal>
              }
            >
              입금 내역
            </SectionTitle>
            <FinList
              items={order.deposits.map((dp) => ({ id: dp.id, top: formatKRW(dp.amount), sub: formatDate(dp.depositedAt), memo: dp.memo }))}
              empty="입금 내역 없음"
            />
          </Card>

          <Card>
            <SectionTitle
              action={
                <FormModal
                  triggerLabel={<PlusTrigger label="지급" />}
                  triggerClassName="btn-ghost btn-sm"
                  title="지급 등록"
                  action={addPayment}
                >
                  <input type="hidden" name="orderId" value={order.id} />
                  <div className="sm:col-span-2">
                    <Field label="협력업체" required>
                      <select name="partnerId" required className="input">
                        {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="금액 (원)" required>
                    <input name="amount" type="number" required className="input" />
                  </Field>
                  <Field label="지급일" required>
                    <input name="paidAt" type="date" required defaultValue={today} className="input" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="메모"><input name="memo" className="input" /></Field>
                  </div>
                </FormModal>
              }
            >
              지급 내역
            </SectionTitle>
            <FinList
              items={order.payments.map((p) => ({ id: p.id, top: formatKRW(p.amount), sub: `${formatDate(p.paidAt)} · ${p.partner.name}`, memo: p.memo }))}
              empty="지급 내역 없음"
            />
          </Card>

          <Card>
            <SectionTitle
              action={
                <FormModal
                  triggerLabel={<PlusTrigger label="평가" />}
                  triggerClassName="btn-ghost btn-sm"
                  title="협력업체 평가"
                  action={addEvaluation}
                >
                  <input type="hidden" name="orderId" value={order.id} />
                  <div className="sm:col-span-2">
                    <Field label="협력업체" required>
                      <select name="partnerId" required className="input">
                        {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="점수 (0-100)" required>
                    <input name="score" type="number" min="0" max="100" required className="input" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="평가 사유"><textarea name="reason" rows={2} className="input" /></Field>
                  </div>
                </FormModal>
              }
            >
              협력업체 평가
            </SectionTitle>
            {order.evaluations.length === 0 ? (
              <EmptyState title="평가 내역 없음" />
            ) : (
              <ul className="divide-y divide-ink-50">
                {order.evaluations.map((e) => (
                  <li key={e.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink-800">{e.partner.name}</p>
                      {e.reason && <p className="text-xs text-ink-400">{e.reason}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ink-700">{e.score}</span>
                      <StatusBadge map={GRADE} value={e.grade} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-ink-800">{value}</dd>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-500">{label}</span>
      <span className={cn("text-sm font-semibold tabular-nums", tone)}>{value}</span>
    </div>
  );
}

function FinList({ items, empty }: { items: { id: number; top: string; sub: string; memo: string | null }[]; empty: string }) {
  if (items.length === 0) return <p className="px-5 py-6 text-center text-sm text-ink-400">{empty}</p>;
  return (
    <ul className="divide-y divide-ink-50">
      {items.map((it) => (
        <li key={it.id} className="flex items-center justify-between px-5 py-3">
          <div>
            <p className="text-sm font-semibold tabular-nums text-ink-800">{it.top}</p>
            <p className="text-xs text-ink-400">{it.sub}</p>
          </div>
          {it.memo && <span className="max-w-[40%] truncate text-xs text-ink-400">{it.memo}</span>}
        </li>
      ))}
    </ul>
  );
}
