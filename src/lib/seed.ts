import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n: number): Date {
  return daysAgo(-n);
}
function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

/** 데모 데이터 시드. 멱등성을 위해 기존 데이터를 정리한 뒤 재생성합니다. */
export async function seedDatabase(prisma: PrismaClient, log: (m: string) => void = () => {}) {
  log("🌱  기존 데이터 정리...");
  await prisma.partnerEvaluation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.workLog.deleteMany();
  await prisma.orderPartner.deleteMany();
  await prisma.order.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.userSiteAssignment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.site.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.client.deleteMany();
  await prisma.orderType.deleteMany();
  await prisma.siteType.deleteMany();
  await prisma.region.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.affiliation.deleteMany();

  log("👤  사용자 / 권한...");
  const [adminRole, managerRole, staffRole, viewerRole] = await Promise.all([
    prisma.role.create({ data: { name: "시스템 관리자", code: "ADMIN" } }),
    prisma.role.create({ data: { name: "운영 관리자", code: "MANAGER" } }),
    prisma.role.create({ data: { name: "현장 담당자", code: "STAFF" } }),
    prisma.role.create({ data: { name: "조회 전용", code: "VIEWER" } }),
  ]);

  const hq = await prisma.affiliation.create({ data: { name: "코오롱 본사" } });
  const branch = await prisma.affiliation.create({ data: { name: "운영지원팀" } });

  const pw = await bcrypt.hash("admin1234do!", 10);
  const pwUser = await bcrypt.hash("user1234!", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@kolon.com", name: "관리자", passwordHash: pw,
      phone: "02-1234-5678", roleId: adminRole.id, affiliationId: hq.id,
      lastLoginAt: daysAgo(0),
    },
  });
  const manager = await prisma.user.create({
    data: {
      email: "manager@kolon.com", name: "김운영", passwordHash: pwUser,
      phone: "02-1234-5679", roleId: managerRole.id, affiliationId: branch.id,
      lastLoginAt: daysAgo(1),
    },
  });
  const staff = await prisma.user.create({
    data: {
      email: "staff@kolon.com", name: "박현장", passwordHash: pwUser,
      phone: "010-2222-3333", roleId: staffRole.id, affiliationId: branch.id,
      lastLoginAt: daysAgo(2),
    },
  });
  await prisma.user.create({
    data: {
      email: "viewer@kolon.com", name: "이조회", passwordHash: pwUser,
      roleId: viewerRole.id, affiliationId: branch.id,
    },
  });

  log("🗂️   기준정보...");
  const regions = await Promise.all(
    ["수도권", "강원권", "충청권", "영남권", "호남권"].map((name) => prisma.region.create({ data: { name } }))
  );
  const siteTypes = await Promise.all(
    ["오피스빌딩", "물류센터", "산업시설", "복합단지"].map((name) => prisma.siteType.create({ data: { name } }))
  );
  const orderTypes = await Promise.all(
    ["정기점검", "긴급보수", "시설개선", "안전진단", "청소/방역"].map((name) => prisma.orderType.create({ data: { name } }))
  );

  const clients = await Promise.all(
    [
      { name: "코오롱글로벌", manager: "정발주", contact: "02-3677-3000" },
      { name: "코오롱인더스트리", manager: "한구매", contact: "02-3677-4000" },
      { name: "코오롱베니트", manager: "오시설", contact: "02-3677-5000" },
      { name: "에이치디씨", manager: "신관리", contact: "02-2008-9000" },
    ].map((c) => prisma.client.create({ data: c }))
  );

  const partners = await Promise.all(
    [
      { name: "대한설비기술", industry: "기계설비", manager: "최대한", contact: "031-111-2222" },
      { name: "한빛전기공사", industry: "전기", manager: "김한빛", contact: "031-222-3333" },
      { name: "에스원안전", industry: "소방/안전", manager: "이에스", contact: "02-333-4444" },
      { name: "그린환경서비스", industry: "환경/방역", manager: "박그린", contact: "032-444-5555" },
      { name: "미래엘리베이터", industry: "승강기", manager: "정미래", contact: "031-555-6666" },
      { name: "정밀공조시스템", industry: "공조/냉난방", manager: "강정밀", contact: "031-666-7777" },
    ].map((p) => prisma.partner.create({ data: p }))
  );

  const siteData = [
    { name: "강남 코오롱타워", address: "서울 강남구 언주로 451", manager: "윤소장", contact: "02-555-1000", r: 0, t: 0 },
    { name: "마곡 R&D센터", address: "서울 강서구 마곡중앙로 110", manager: "조소장", contact: "02-555-2000", r: 0, t: 3 },
    { name: "이천 물류센터", address: "경기 이천시 마장면 138", manager: "배소장", contact: "031-555-3000", r: 0, t: 1 },
    { name: "원주 산업단지", address: "강원 원주시 호저로 199", manager: "남소장", contact: "033-555-4000", r: 1, t: 2 },
    { name: "청주 복합단지", address: "충북 청주시 흥덕구 1순환로", manager: "표소장", contact: "043-555-5000", r: 2, t: 3 },
    { name: "구미 산업시설", address: "경북 구미시 1공단로 200", manager: "선소장", contact: "054-555-6000", r: 3, t: 2 },
    { name: "광주 물류센터", address: "광주 광산구 평동산단로", manager: "차소장", contact: "062-555-7000", r: 4, t: 1 },
  ];
  const sites = await Promise.all(
    siteData.map((s) =>
      prisma.site.create({
        data: {
          name: s.name, address: s.address, manager: s.manager, contact: s.contact,
          regionId: regions[s.r].id, siteTypeId: siteTypes[s.t].id,
        },
      })
    )
  );

  await prisma.userSiteAssignment.createMany({
    data: [
      { userId: manager.id, siteId: sites[0].id },
      { userId: manager.id, siteId: sites[1].id },
      { userId: staff.id, siteId: sites[2].id },
      { userId: staff.id, siteId: sites[3].id },
    ],
  });

  log("📑  계약...");
  const contracts = [];
  for (let i = 0; i < sites.length; i++) {
    const site = sites[i];
    const client = pick(clients, i);
    const c = await prisma.contract.create({
      data: {
        contractNo: `CT-2026-${String(i + 1).padStart(4, "0")}`,
        title: `${site.name} 연간 유지보수 계약`,
        siteId: site.id, clientId: client.id,
        startDate: daysAgo(200 - i * 10), endDate: daysFromNow(165 + i * 5),
        amount: (300 + i * 80) * 1_000_000,
        status: i === sites.length - 1 ? "DRAFT" : "ACTIVE",
      },
    });
    contracts.push(c);
  }

  log("🧾  발주 / 협력업체 / 작업기록 / 정산...");
  const orderTitles = [
    "공조설비 정기점검", "수배전반 절연저항 측정", "소방시설 작동기능점검",
    "냉각탑 수질관리", "승강기 정기검사 대응", "옥상 방수 보수",
    "지하주차장 배수펌프 정비", "외벽 균열 보수", "전산실 항온항습기 점검",
    "건물 방역 소독", "조명 LED 교체", "보일러 연소설비 점검",
  ];
  const statuses = ["RECEIVED", "IN_PROGRESS", "COMPLETED", "COMPLETED", "CLOSED", "IN_PROGRESS"];

  let orderSeq = 1;
  for (let i = 0; i < 34; i++) {
    const site = pick(sites, i);
    const contract = contracts.find((c) => c.siteId === site.id);
    const client = pick(clients, i);
    const otype = pick(orderTypes, i);
    const status = pick(statuses, i);
    const startedDaysAgo = 90 - (i % 12) * 6;
    const amount = (8 + (i % 9) * 4) * 1_000_000;
    const order = await prisma.order.create({
      data: {
        orderNo: `PO-2026-${String(orderSeq++).padStart(4, "0")}`,
        title: pick(orderTitles, i),
        siteId: site.id, clientId: client.id, orderTypeId: otype.id,
        contractId: contract?.id ?? null,
        startDate: daysAgo(startedDaysAgo), endDate: daysAgo(startedDaysAgo - 30),
        amount, status,
        description: `${site.name} 현장 ${pick(orderTitles, i)} 발주 건`,
      },
    });

    const primary = pick(partners, i);
    await prisma.orderPartner.create({ data: { orderId: order.id, partnerId: primary.id, role: "주관" } });
    if (i % 3 === 0) {
      const secondary = pick(partners, i + 2);
      if (secondary.id !== primary.id) {
        await prisma.orderPartner.create({ data: { orderId: order.id, partnerId: secondary.id, role: "협력" } });
      }
    }

    if (status !== "RECEIVED") {
      await prisma.workLog.create({
        data: {
          orderId: order.id, partnerId: primary.id, authorId: staff.id,
          title: "현장 작업 1차", content: "설비 점검 및 이상 부위 확인, 부품 교체 진행.",
          workedAt: daysAgo(startedDaysAgo - 5), startedAt: daysAgo(startedDaysAgo - 5), endedAt: daysAgo(startedDaysAgo - 5),
        },
      });
    }
    if (status === "COMPLETED" || status === "CLOSED") {
      await prisma.workLog.create({
        data: {
          orderId: order.id, partnerId: primary.id, authorId: staff.id,
          title: "작업 완료 및 검수", content: "작업 완료, 정상 가동 확인 후 사진 보고.",
          workedAt: daysAgo(startedDaysAgo - 25), startedAt: daysAgo(startedDaysAgo - 25), endedAt: daysAgo(startedDaysAgo - 25),
        },
      });
      await prisma.deposit.create({
        data: { orderId: order.id, amount, depositedAt: daysAgo(startedDaysAgo - 28), status: "CONFIRMED", memo: "발주처 기성 입금" },
      });
      const cost = Math.round(amount * (0.75 + (i % 4) * 0.02));
      await prisma.payment.create({
        data: { orderId: order.id, partnerId: primary.id, amount: cost, paidAt: daysAgo(startedDaysAgo - 26), status: "CONFIRMED", memo: "협력업체 작업비 지급" },
      });
      const g = pick(["A", "A", "B", "B", "C"], i);
      await prisma.partnerEvaluation.create({
        data: {
          orderId: order.id, partnerId: primary.id, grade: g,
          score: g === "A" ? 92 : g === "B" ? 84 : 75,
          reason: "납기 준수 및 작업 품질 양호.", evaluator: manager.name,
          evaluatedAt: daysAgo(startedDaysAgo - 24),
        },
      });
    }
  }

  log("📢  공지 / 알림...");
  await prisma.notice.createMany({
    data: [
      { title: "2026년 상반기 정기점검 일정 안내", content: "전 사업소 대상 상반기 정기점검을 6월 내 완료해 주시기 바랍니다.", pinned: true, authorId: admin.id },
      { title: "협력업체 안전관리 강화 지침", content: "현장 작업 시 안전수칙 준수 및 작업기록 등록을 의무화합니다.", pinned: true, authorId: admin.id },
      { title: "정산 마감 프로세스 변경 안내", content: "월별 정산 마감은 익월 5영업일까지 확정 처리합니다.", authorId: manager.id },
      { title: "신규 발주 등록 매뉴얼 배포", content: "발주 등록 화면 개선에 따른 신규 매뉴얼을 공유드립니다.", authorId: manager.id },
    ],
  });
  await prisma.notification.createMany({
    data: [
      { type: "STATUS", message: "PO-2026-0003 발주가 '완료' 상태로 변경되었습니다.", targetUrl: "/orders" },
      { type: "PAYMENT", message: "대한설비기술 작업비 지급이 확정되었습니다.", targetUrl: "/settlement" },
      { type: "SETTLEMENT", message: "5월 정산 마감이 임박했습니다. (D-3)", targetUrl: "/settlement" },
      { type: "NOTICE", message: "신규 공지: 협력업체 안전관리 강화 지침", targetUrl: "/notices" },
    ],
  });

  return {
    users: await prisma.user.count(),
    sites: await prisma.site.count(),
    contracts: await prisma.contract.count(),
    orders: await prisma.order.count(),
    partners: await prisma.partner.count(),
  };
}
