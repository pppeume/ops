import { prisma } from "./db";
import { ORDER_STATUS } from "./constants";

export async function getKpis() {
  const [orders, deposits, payments, activeContracts, partners, sites] = await Promise.all([
    prisma.order.findMany({ select: { status: true, amount: true } }),
    prisma.deposit.aggregate({ _sum: { amount: true } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.contract.count({ where: { status: "ACTIVE" } }),
    prisma.partner.count({ where: { status: "ACTIVE" } }),
    prisma.site.count(),
  ]);

  const income = deposits._sum.amount ?? 0;
  const cost = payments._sum.amount ?? 0;
  const byStatus: Record<string, number> = {};
  for (const o of orders) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;

  return {
    totalOrders: orders.length,
    inProgress: byStatus["IN_PROGRESS"] ?? 0,
    completed: (byStatus["COMPLETED"] ?? 0) + (byStatus["CLOSED"] ?? 0),
    received: byStatus["RECEIVED"] ?? 0,
    income,
    cost,
    profit: income - cost,
    profitRate: income > 0 ? Math.round(((income - cost) / income) * 1000) / 10 : 0,
    activeContracts,
    partners,
    sites,
    byStatus,
  };
}

function ymKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function getMonthlyRevenue(months = 6) {
  const now = new Date();
  const buckets: { key: string; month: string; income: number; cost: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: ymKey(d), month: `${d.getMonth() + 1}월`, income: 0, cost: 0 });
  }
  const map = new Map(buckets.map((b) => [b.key, b]));

  const [deposits, payments] = await Promise.all([
    prisma.deposit.findMany({ select: { amount: true, depositedAt: true } }),
    prisma.payment.findMany({ select: { amount: true, paidAt: true } }),
  ]);
  for (const d of deposits) {
    const b = map.get(ymKey(d.depositedAt));
    if (b) b.income += d.amount;
  }
  for (const p of payments) {
    const b = map.get(ymKey(p.paidAt));
    if (b) b.cost += p.amount;
  }
  return buckets.map(({ month, income, cost }) => ({ month, income, cost }));
}

export async function getStatusDistribution() {
  const orders = await prisma.order.groupBy({ by: ["status"], _count: true });
  const counts: Record<string, number> = {};
  for (const o of orders) counts[o.status] = o._count;
  return Object.keys(ORDER_STATUS).map((k) => ({
    name: ORDER_STATUS[k].label,
    value: counts[k] ?? 0,
  }));
}

export async function getRegionDistribution() {
  const regions = await prisma.region.findMany({
    include: { sites: { include: { _count: { select: { orders: true } } } } },
  });
  return regions
    .map((r) => ({
      name: r.name,
      value: r.sites.reduce((s, site) => s + site._count.orders, 0),
    }))
    .sort((a, b) => b.value - a.value);
}

export async function getPartnerPayments() {
  const partners = await prisma.partner.findMany({
    include: { payments: { select: { amount: true } } },
  });
  return partners
    .map((p) => ({ name: p.name, value: p.payments.reduce((s, x) => s + x.amount, 0) }))
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}
