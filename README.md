# KIOT OPS — 외주·유지보수 통합 운영 플랫폼

코오롱 사업소의 외주/유지보수 운영을 **계약 → 발주 → 진행 → 비용 → 정산 → 분석**의
하나의 흐름으로 관리하는 B2B 운영 플랫폼입니다. 제공된 ERD/운영 흐름도(PPTX)를
개발 관점으로 재구성하여 구현했습니다.

![dashboard](https://img.shields.io/badge/Next.js-14-black) ![db](https://img.shields.io/badge/Prisma-SQLite-blue)

## 주요 기능

| 영역 | 화면 | 설명 |
| --- | --- | --- |
| 운영 | **대시보드** | 입금/수익/진행현황 KPI, 입금·지급 추이, 상태 분포, 권역별 발주, 최근 발주, 공지 |
| 운영 | **계약** | 사업소-발주처 간 계약 등록·관리, 계약기간 D-day, 연계 발주 수 |
| 운영 | **발주** | 발주 등록, 상태 필터(접수/진행/완료/마감), 사업소 필터 |
| 운영 | **발주 상세** | 상태 변경 스텝퍼, 작업기록 타임라인, 입금·지급·수익률, 협력업체 평가 |
| 정산·분석 | **정산** | 발주별 입금-지급 집계, 순수익·수익률, 월별 추이, 합계 |
| 정산·분석 | **분석** | 수익 추이, 권역별 분포, 협력업체 지급/평가 순위, 발주 유형 비중 |
| 정산·분석 | **보고서** | 권역별 운영·정산 보고서, PDF(인쇄)/Excel(CSV) 다운로드 |
| 기준정보 | **사업소 / 발주처 / 협력업체 / 기준 코드** | 마스터 데이터 CRUD |
| 시스템 | **공지사항 / 사용자·권한** | 공지 게시, 계정·역할 관리 |

## 기술 스택

- **Next.js 14** (App Router, Server Components, Server Actions)
- **TypeScript** · **Tailwind CSS** (Pretendard)
- **Prisma + SQLite** (Postgres로 손쉽게 전환 가능)
- **JWT 세션** (httpOnly 쿠키) · 미들웨어 기반 접근 제어
- **Recharts** 데이터 시각화

## 빠른 시작

```bash
npm install
npm run setup     # prisma generate + db push + seed (데모 데이터 생성)
npm run dev       # http://localhost:3000
```

### 데모 계정

| 역할 | 이메일 | 비밀번호 |
| --- | --- | --- |
| 시스템 관리자 | `admin@kolon.com` | `admin1234do!` |
| 운영 관리자 | `manager@kolon.com` | `user1234!` |
| 현장 담당자 | `staff@kolon.com` | `user1234!` |
| 조회 전용 | `viewer@kolon.com` | `user1234!` |

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (prisma generate 포함) |
| `npm run start` | 프로덕션 서버 |
| `npm run db:seed` | 데모 데이터 재생성 |
| `npm run db:reset` | DB 초기화 후 재시드 |

## 데이터 모델

PPTX ERD의 4개 도메인을 그대로 반영했습니다.

- **사용자/권한** — `User` `Role` `Affiliation` `UserSiteAssignment`
- **기준정보** — `Region` `SiteType` `OrderType` `Client` `Partner` `Site` `Notice` `Notification`
- **운영 핵심** — `Contract` `Order` `OrderPartner` `WorkLog`
- **정산/분석/보고** — `Deposit` `Payment` `PartnerEvaluation`

스키마: [`prisma/schema.prisma`](prisma/schema.prisma)

## 프로덕션 전환 메모

- `DATABASE_URL`을 Postgres로 교체하고 `provider = "postgresql"` 로 변경
- `AUTH_SECRET`을 환경변수로 주입 (현재 `.env`의 값은 개발용)
- 첨부파일/결재·승인 흐름/세금계산서 등은 PPTX의 "추가 검토" 항목으로, 후속 스프린트 대상
