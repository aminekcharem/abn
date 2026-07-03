#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-autopro}"
PORT="${PORT:-3000}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_PATH="$ROOT_DIR/.next/standalone/server.js"

cd "$ROOT_DIR"

echo "==> Deploying $APP_NAME from $ROOT_DIR"

if [ ! -f ".env" ]; then
  echo "Missing .env file."
  echo "Create it first with DATABASE_URL, AUTH_SECRET, AUTH_TRUST_HOST, APP_URL, and NEXT_PUBLIC_APP_URL."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed or not available in PATH."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not installed or not available in PATH."
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 is not installed. Install it with: sudo npm install -g pm2"
  exit 1
fi

echo "==> Installing dependencies"
npm ci --legacy-peer-deps

echo "==> Validating Prisma schema"
npx prisma validate

echo "==> Applying database migrations"
npx prisma migrate deploy

echo "==> Generating Prisma client"
npm run prisma:generate

echo "==> Building Next.js standalone output"
npm run build

if [ ! -f "$SERVER_PATH" ]; then
  echo "Standalone server was not generated at $SERVER_PATH."
  echo "Check that next.config.ts contains: output: \"standalone\""
  exit 1
fi

echo "==> Copying static assets into standalone output"
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -R .next/static .next/standalone/.next/static

rm -rf .next/standalone/public
cp -R public .next/standalone/public

echo "==> Starting or reloading PM2 app: $APP_NAME"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  PORT="$PORT" HOSTNAME="$HOSTNAME" pm2 reload "$APP_NAME" --update-env
else
  PORT="$PORT" HOSTNAME="$HOSTNAME" pm2 start "$SERVER_PATH" --name "$APP_NAME"
fi

pm2 save

echo "==> Deployment complete"
echo "Local check: curl -I http://127.0.0.1:$PORT"
