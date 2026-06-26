#!/bin/sh
set -e

echo "[entrypoint] DATABASE_URL=${DATABASE_URL}"
echo "[entrypoint] DB 준비 대기 및 스키마 적용..."
i=0
until npx prisma db push --skip-generate --accept-data-loss; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "[entrypoint] DB 연결 실패 — 종료합니다."
    exit 1
  fi
  echo "[entrypoint] DB 연결 대기 중... ($i/30)"
  sleep 2
done

# 사용자 테이블이 비어 있으면(최초 기동) 데모 데이터 시드
if node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.user.count().then(c=>process.exit(c>0?0:1)).catch(()=>process.exit(1))"; then
  echo "[entrypoint] 기존 데이터 확인됨 — 시드 건너뜀."
else
  echo "[entrypoint] 데모 데이터 시드..."
  npx tsx prisma/seed.ts
fi

echo "[entrypoint] 웹 서비스 기동..."
exec "$@"
