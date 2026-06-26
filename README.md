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

## 배포 (웹서비스)

### 1) Docker Compose — 어떤 서버에서도 한 줄로 기동 (권장)

```bash
# 강력한 세션 시크릿을 주입하여 빌드 + 기동
AUTH_SECRET=$(openssl rand -hex 32) docker compose up -d --build
```

- `http://localhost:3000` 접속 → `admin@kolon.com / admin1234do!`
- 컨테이너 기동 시 **자동으로** DB 스키마를 적용하고, 최초 1회 데모 데이터를 시드합니다.
- 운영 데이터는 `kolon_data` **영구 볼륨**(`/app/data/prod.db`)에 저장되어 재기동해도 유지됩니다.
- `GET /api/health` 헬스체크 엔드포인트 내장 (컨테이너 `HEALTHCHECK` 연동).
- 종료: `docker compose down` · 데이터까지 초기화: `docker compose down -v`

> 리버스 프록시(Nginx/Caddy) 뒤에 두고 도메인·HTTPS를 붙이면 그대로 운영 서비스가 됩니다.

### 2) Node 직접 실행 (PM2 / systemd 등)

```bash
npm ci && npm run build
DATABASE_URL="file:/var/lib/kolon-ops/prod.db" \
AUTH_SECRET="$(openssl rand -hex 32)" \
NODE_ENV=production npm run start -- -H 0.0.0.0 -p 3000
```

### 3) Vercel / 서버리스 + Postgres

서버리스 환경은 파일 기반 SQLite가 적합하지 않으므로 Postgres로 전환하세요.

1. `prisma/schema.prisma` 의 `datasource db { provider = "postgresql" }` 로 변경
2. 환경변수 `DATABASE_URL`(Postgres 연결 문자열), `AUTH_SECRET` 설정
3. 배포 후 최초 1회 `npx prisma db push && npx tsx prisma/seed.ts`

### 환경변수

| 변수 | 설명 | 예시 |
| --- | --- | --- |
| `DATABASE_URL` | DB 연결 문자열 | `file:/app/data/prod.db` · `postgresql://...` |
| `AUTH_SECRET` | 세션 서명 키 (**운영 필수 교체**) | `openssl rand -hex 32` 결과 |
| `NODE_ENV` | 실행 모드 | `production` |

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
