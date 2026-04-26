#!/usr/bin/env bash
# Delegates to MTX project/org-build-server.sh (single source of truth). For npm/CI without mtx on PATH;
# `npm run build:server` is `mtx build server` in package.json, which is preferred.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
_IMPL=""
if [ -n "${MTX_ROOT:-}" ] && [ -f "$MTX_ROOT/project/org-build-server.sh" ]; then
  _IMPL="$MTX_ROOT/project/org-build-server.sh"
elif [ -f "$ROOT/../MTX/project/org-build-server.sh" ]; then
  _IMPL="$(cd "$ROOT/../MTX" && pwd)/project/org-build-server.sh"
elif [ -f "$ROOT/../../MTX/project/org-build-server.sh" ]; then
  _IMPL="$(cd "$ROOT/../../MTX" && pwd)/project/org-build-server.sh"
fi
if [ -n "$_IMPL" ]; then
  exec bash "$_IMPL" "$ROOT"
fi
echo "org-build-server: cannot find MTX project/org-build-server.sh (set MTX_ROOT or clone MTX beside the workspace)." >&2
exit 1
