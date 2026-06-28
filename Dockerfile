# KIOT OPS — production web service image
# 단일 컨테이너로 빌드 → DB 스키마 적용/시드 → Next.js 서비스 기동.

FROM node:22-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates wget \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 1) 의존성 설치 (빌드용 devDependencies 포함)
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 2) 빌드 (prisma generate + next build)
FROM deps AS build
COPY . .
RUN npm run build

# 3) 런타임 — 빌드 산출물과 node_modules(prisma/tsx 포함)를 그대로 사용
FROM build AS runner
ENV NODE_ENV=production
ENV PORT=3000
# 런타임 기본값 — 운영 시 compose/호스팅 환경변수로 반드시 재정의할 것
ENV DATABASE_URL=file:/app/data/prod.db
ENV AUTH_SECRET=change-this-secret-in-production-please-0a1b2c3d4e5f
RUN mkdir -p /app/data
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health >/dev/null 2>&1 || exit 1
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
