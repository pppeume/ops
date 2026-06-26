import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const regionId = url.searchParams.get("region");

  const orders = await prisma.order.findMany({
    where: regionId ? { site: { regionId: Number(regionId) } } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      site: { include: { region: true } },
      client: true,
      orderType: true,
      partners: { include: { partner: true } },
      deposits: { select: { amount: true } },
      payments: { select: { amount: true } },
    },
  });

  const header = [
    "발주번호", "제목", "권역", "사업소", "발주처", "유형", "주관협력업체",
    "상태", "발주금액", "입금", "지급", "순수익",
  ];
  const statusLabel: Record<string, string> = {
    RECEIVED: "접수", IN_PROGRESS: "진행", COMPLETED: "완료", CLOSED: "마감",
  };

  const lines = orders.map((o) => {
    const income = o.deposits.reduce((s, d) => s + d.amount, 0);
    const cost = o.payments.reduce((s, p) => s + p.amount, 0);
    return [
      o.orderNo, o.title, o.site.region.name, o.site.name, o.client.name,
      o.orderType.name, o.partners[0]?.partner.name ?? "",
      statusLabel[o.status] ?? o.status,
      o.amount, income, cost, income - cost,
    ]
      .map((v) => {
        const s = String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      })
      .join(",");
  });

  // BOM for Excel Korean compatibility
  const csv = "﻿" + [header.join(","), ...lines].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ops-report-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
