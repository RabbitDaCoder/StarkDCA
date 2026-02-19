#!/bin/sh
# ─── StarkDCA — Production Database Migration Script ──────────────────
# Run Prisma migrations against the production database.
#
# Usage:
#   ./scripts/migrate-deploy.sh                    # uses DATABASE_URL from env
#   DATABASE_URL="postgresql://..." ./scripts/migrate-deploy.sh
#
# This script is safe to run multiple times (idempotent).
# It only applies pending migrations — never generates new ones.

set -e

echo "═══════════════════════════════════════════════════════"
echo "  StarkDCA — Production Migration Deploy"
echo "═══════════════════════════════════════════════════════"

# Validate DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set."
  echo "Export it or pass inline: DATABASE_URL=\"...\" ./scripts/migrate-deploy.sh"
  exit 1
fi

echo ""
echo "Target: $(echo "$DATABASE_URL" | sed 's|://[^@]*@|://***@|')"
echo ""

# Run Prisma migrate deploy (production-safe, applies pending migrations only)
echo "Running prisma migrate deploy..."
npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma

echo ""
echo "Migration complete."
echo "═══════════════════════════════════════════════════════"
