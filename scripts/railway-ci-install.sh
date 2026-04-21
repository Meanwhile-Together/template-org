#!/usr/bin/env bash
# Railpack install: swap in package.deploy.json + lock, npm install only (no git, no build scripts).
# Requires package.deploy.json + npm-packs from npm run prepare:railway (dist is checked in railway-build.sh).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f "$ROOT/package.deploy.json" ] || [ ! -f "$ROOT/package-lock.deploy.json" ]; then
  echo "railway-ci-install: missing package.deploy.json or package-lock.deploy.json" >&2
  echo "  Run locally from this repo:  npm run prepare:railway" >&2
  exit 1
fi

shopt -s nullglob
packs=( "$ROOT/targets/server/npm-packs"/*.tgz )
shopt -u nullglob
if [ ${#packs[@]} -eq 0 ]; then
  echo "railway-ci-install: missing targets/server/npm-packs/*.tgz" >&2
  echo "  Run: npm run prepare:railway" >&2
  exit 1
fi

cp -f "$ROOT/package.deploy.json" "$ROOT/package.json"
cp -f "$ROOT/package-lock.deploy.json" "$ROOT/package-lock.json"
exec npm install --omit=dev --ignore-scripts
