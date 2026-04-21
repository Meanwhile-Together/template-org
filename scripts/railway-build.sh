#!/usr/bin/env bash
# Railway build: nothing to compile when prepare:railway was run locally (artifact deploy is default).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ ! -f "$ROOT/targets/client/dist/index.html" ]; then
  echo "railway-build: missing targets/client/dist/index.html (Vite client not in deploy bundle)." >&2
  echo "  Run: npm run prepare:railway  (org-build-server runs build:client and mirrors targets/client/dist)." >&2
  exit 1
fi

if [ ! -f "$ROOT/targets/server/dist/db/app-client.js" ]; then
  echo "railway-build: missing targets/server/dist/db/app-client.js (Prisma app client not in deploy bundle)." >&2
  echo "  Run: npm run prepare:railway  from a machine with project-bridge (runs db:generate + build:server)." >&2
  exit 1
fi

if [ -f "$ROOT/.railway-self-contained" ] && [ -f "$ROOT/targets/server/dist/index.js" ] && [ -d "$ROOT/node_modules" ]; then
  echo "==> railway-build: self-contained bundle present — skipping server build"
  exit 0
fi

echo "railway-build: self-contained artifact missing." >&2
echo "  On a machine with project-bridge beside this repo, run:  npm run prepare:railway" >&2
echo "  Then deploy so Railway receives targets/server/dist, targets/client/dist, npm-packs, and deploy manifests." >&2
exit 1
