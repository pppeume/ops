"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getSession, hashPassword } from "./auth";

function s(v: FormDataEntryValue | null): string {
  return (v ?? "").toString().trim();
}
function n(v: FormDataEntryValue | null): number {
  return Math.round(Number(s(v).replace(/[^0-9.-]/g, "")) || 0);
}
function d(v: FormDataEntryValue | null): Date {
  const val = s(v);
  return val ? new Date(val) : new Date();
}

async function nextSeq(prefix: string, model: "order" | "contract"): Promise<string> {
  const year = new Date().getFullYear();
  const count =
    model === "order" ? await prisma.order.count() : await prisma.contract.count();
  return `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;
}

// ───────────── 발주 ─────────────

export async function createOrder(formData: FormData) {
  const orderNo = await nextSeq("PO", "order");
  const order = await prisma.order.create({
    data: {
      orderNo,
      title: s(formData.get("title")),
      siteId: n(formData.get("siteId")),
      clientId: n(formData.get("clientId")),
      orderTypeId: n(formData.get("orderTypeId")),
      contractId: n(formData.get("contractId")) || null,
      startDate: d(formData.get("startDate")),
      endDate: d(formData.get("endDate")),
      amount: n(formData.get("amount")),
      description: s(formData.get("description")) || null,
      status: "RECEIVED",
    },
  });
  const partnerId = n(formData.get("partnerId"));
  if (partnerId) {
    await prisma.orderPartner.create({
      data: { orderId: order.id, partnerId, role: "주관" },
    });
  }
  revalidatePath("/orders");
  revalidatePath("/dashboard");
  redirect(`/orders/${order.id}`);
}

export async function updateOrderStatus(formData: FormData) {
  const id = n(formData.get("id"));
  const status = s(formData.get("status"));
  await prisma.order.update({ where: { id }, data: { status } });
  await prisma.notification.create({
    data: {
      type: "STATUS",
      message: `발주 상태가 변경되었습니다. (${status})`,
      targetUrl: `/orders/${id}`,
    },
  });
  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
}

export async function addWorkLog(formData: FormData) {
  const session = await getSession();
  const orderId = n(formData.get("orderId"));
  await prisma.workLog.create({
    data: {
      orderId,
      partnerId: n(formData.get("partnerId")) || null,
      authorId: session?.id ?? null,
      title: s(formData.get("title")),
      content: s(formData.get("content")),
      workedAt: d(formData.get("workedAt")),
    },
  });
  revalidatePath(`/orders/${orderId}`);
}

export async function addDeposit(formData: FormData) {
  const orderId = n(formData.get("orderId"));
  await prisma.deposit.create({
    data: {
      orderId,
      amount: n(formData.get("amount")),
      depositedAt: d(formData.get("depositedAt")),
      status: "CONFIRMED",
      memo: s(formData.get("memo")) || null,
    },
  });
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/settlement");
}

export async function addPayment(formData: FormData) {
  const orderId = n(formData.get("orderId"));
  await prisma.payment.create({
    data: {
      orderId,
      partnerId: n(formData.get("partnerId")),
      amount: n(formData.get("amount")),
      paidAt: d(formData.get("paidAt")),
      status: "CONFIRMED",
      memo: s(formData.get("memo")) || null,
    },
  });
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/settlement");
}

export async function addEvaluation(formData: FormData) {
  const session = await getSession();
  const orderId = n(formData.get("orderId"));
  const score = n(formData.get("score"));
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "D";
  await prisma.partnerEvaluation.create({
    data: {
      orderId,
      partnerId: n(formData.get("partnerId")),
      grade,
      score,
      reason: s(formData.get("reason")) || null,
      evaluator: session?.name ?? null,
    },
  });
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/analysis");
}

// ───────────── 계약 ─────────────

export async function createContract(formData: FormData) {
  const contractNo = await nextSeq("CT", "contract");
  const c = await prisma.contract.create({
    data: {
      contractNo,
      title: s(formData.get("title")),
      siteId: n(formData.get("siteId")),
      clientId: n(formData.get("clientId")),
      startDate: d(formData.get("startDate")),
      endDate: d(formData.get("endDate")),
      amount: n(formData.get("amount")),
      status: s(formData.get("status")) || "ACTIVE",
    },
  });
  revalidatePath("/contracts");
  redirect(`/contracts#${c.id}`);
}

// ───────────── 기준정보 ─────────────

export async function createSite(formData: FormData) {
  await prisma.site.create({
    data: {
      name: s(formData.get("name")),
      address: s(formData.get("address")) || null,
      manager: s(formData.get("manager")) || null,
      contact: s(formData.get("contact")) || null,
      regionId: n(formData.get("regionId")),
      siteTypeId: n(formData.get("siteTypeId")),
    },
  });
  revalidatePath("/sites");
}

export async function createClient(formData: FormData) {
  await prisma.client.create({
    data: {
      name: s(formData.get("name")),
      manager: s(formData.get("manager")) || null,
      contact: s(formData.get("contact")) || null,
    },
  });
  revalidatePath("/clients");
}

export async function createPartner(formData: FormData) {
  await prisma.partner.create({
    data: {
      name: s(formData.get("name")),
      industry: s(formData.get("industry")) || null,
      manager: s(formData.get("manager")) || null,
      contact: s(formData.get("contact")) || null,
    },
  });
  revalidatePath("/partners");
}

export async function createMasterCode(formData: FormData) {
  const kind = s(formData.get("kind"));
  const name = s(formData.get("name"));
  if (!name) return;
  if (kind === "region") await prisma.region.create({ data: { name } });
  else if (kind === "siteType") await prisma.siteType.create({ data: { name } });
  else if (kind === "orderType") await prisma.orderType.create({ data: { name } });
  revalidatePath("/master");
}

// ───────────── 공지 ─────────────

export async function createNotice(formData: FormData) {
  const session = await getSession();
  await prisma.notice.create({
    data: {
      title: s(formData.get("title")),
      content: s(formData.get("content")),
      pinned: s(formData.get("pinned")) === "on",
      authorId: session?.id ?? null,
    },
  });
  revalidatePath("/notices");
  revalidatePath("/dashboard");
}

// ───────────── 사용자 ─────────────

export async function createUser(formData: FormData) {
  const email = s(formData.get("email")).toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return;
  await prisma.user.create({
    data: {
      email,
      name: s(formData.get("name")),
      passwordHash: await hashPassword(s(formData.get("password")) || "user1234!"),
      phone: s(formData.get("phone")) || null,
      roleId: n(formData.get("roleId")),
      affiliationId: n(formData.get("affiliationId")) || null,
    },
  });
  revalidatePath("/users");
}
