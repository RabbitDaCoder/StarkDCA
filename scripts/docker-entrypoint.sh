#!/bin/sh
# ─── StarkDCA — Docker Entrypoint Script ──────────────────────────────
# Runs migrations before starting the application (web or worker).
# Used as the Docker entrypoint for zero-downtime migration on deploy.
#
# Render's preDeployCommand handles migrations separately, but this
# provides a fallback for other hosting environments.

set -e

echo "[entrypoint] Starting StarkDCA service..."
echo "[entrypoint] NODE_ENV=$NODE_ENV"

# Run pending migrations before starting the app
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "[entrypoint] Running database migrations..."
  npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
  echo "[entrypoint] Migrations complete."
fi

# Execute the main command (server.js or worker.js)
echo "[entrypoint] Starting: $@"
exec "$@"
