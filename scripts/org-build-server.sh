#!/usr/bin/env bash
# Build packages + Vite client + unified server in project-bridge with this org's config/, then mirror
# targets/server/dist and targets/client/dist into this repo for mtx deploy / railway up.
# project-bridge's config/ is snapshotted before sync and restored on exit (success or failure).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Build-time fan-out: payload-admin reads VITE_MASTER_AUTH_URL so admin login/register hit the master host.
# Set VITE_MASTER_AUTH_URL in .env, or set MASTER_AUTH_PUBLIC_URL (origin) and we append /auth for the build.
ENV_FILE="$ROOT/.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
fi
if [ -z "${VITE_MASTER_AUTH_URL:-}" ] && [ -n "${MASTER_AUTH_PUBLIC_URL:-}" ]; then
  base="${MASTER_AUTH_PUBLIC_URL%/}"
  export VITE_MASTER_AUTH_URL="${base}/auth"
fi

# Prisma client must be generated for PostgreSQL on hosted builds: Railway often omits DATABASE_URL
# during the Docker build, which previously made db:generate default to sqlite while runtime uses pg.
# Narrowed to hosted signals only so local `npm run dev` (which also runs this script) keeps defaulting
# to SQLite unless the developer opts in explicitly.
if [ -z "${DATABASE_PROVIDER:-}" ]; then
  if [ -n "${RAILWAY_PROJECT_ID:-}${RAILWAY_SERVICE_ID:-}${RAILWAY_ENVIRONMENT:-}${CI:-}${GITHUB_ACTIONS:-}${VERCEL_ENV:-}" ]; then
    export DATABASE_PROVIDER=postgresql
  fi
fi

resolve_project_bridge() {
  if [ -n "${PROJECT_BRIDGE_ROOT:-}" ] && [ -f "${PROJECT_BRIDGE_ROOT}/package.json" ]; then
    echo "$(cd "${PROJECT_BRIDGE_ROOT}" && pwd)"
    return 0
  fi
  local cand
  # Monorepo layout first; optional legacy vendor/project-bridge
  for cand in "$ROOT/../project-bridge" "$ROOT/vendor/project-bridge"; do
    if [ -f "$cand/package.json" ]; then
      echo "$(cd "$cand" && pwd)"
      return 0
    fi
  done
  return 1
}

PB="$(resolve_project_bridge)" || {
  echo "org-build-server: project-bridge not found. Expected vendor/project-bridge, sibling ../project-bridge, or set PROJECT_BRIDGE_ROOT." >&2
  exit 1
}

echo "==> org-build-server: using project-bridge at $PB"

RESTORE_TMP="$(mktemp -d)"
SNAP="$RESTORE_TMP/pb-config-snapshot"

restore_project_bridge_config() {
  trap - EXIT INT TERM
  if [ -d "$SNAP" ]; then
    echo "==> Restoring project-bridge config/ from pre-build snapshot"
    rsync -a --delete "$SNAP/" "$PB/config/" || echo "org-build-server: WARNING: failed to restore project-bridge config/" >&2
  fi
  rm -rf "$RESTORE_TMP"
}

trap restore_project_bridge_config EXIT INT TERM

mkdir -p "$SNAP"
rsync -a "$PB/config/" "$SNAP/"

echo "==> Temporarily sync org config/ -> project-bridge (snapshot will be restored after build)"
rsync -a --delete \
  --exclude 'server.json' \
  --exclude 'server.json.railway' \
  "$ROOT/config/" "$PB/config/"
if [ -f "$ROOT/config/server.json.railway" ]; then
  cp -a "$ROOT/config/server.json.railway" "$PB/config/server.json"
else
  cp -a "$ROOT/config/server.json" "$PB/config/server.json"
fi

echo "==> Install dependencies + build packages, web client, and server (project-bridge)"
(
  cd "$PB"
  npm install
  npm run build:packages
  npm run build:client
  npm run build:server
  # Admin SPA (payload-admin): picks up VITE_MASTER_AUTH_URL / MASTER_AUTH_PUBLIC_URL for master login fan-out
  npm run build:backend
)

echo "==> Mirror server + client dist into org repo (for deploy tarball)"
mkdir -p "$ROOT/targets/server/dist"
rsync -a --delete "$PB/targets/server/dist/" "$ROOT/targets/server/dist/"
mkdir -p "$ROOT/targets/client/dist"
rsync -a --delete "$PB/targets/client/dist/" "$ROOT/targets/client/dist/"

echo "==> org-build-server: done (restoring project-bridge config next)"
