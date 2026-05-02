# Canonical Railway **Dockerfile** builder for org deploy roots (`org-*`).
#
# Install/build stay in MTX (`mtx project railway-ci-install|railway-build`), matching
# `railpack.json` install steps + `railway.json` `buildCommand` — no copied `scripts/*.sh` in the repo.
#
# Refresh in an org: copy this file to the deploy-root `./Dockerfile`, or run:
#   cp "$(mtx-root)/project/Dockerfile.org-host" Dockerfile
#
# Requires network during image build (bootstrap clone). Self-contained artifact must already be in the
# build context (`mtx build server` / `prepare:railway` before deploy).

FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
      jq curl ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . /app

ENV PATH="/usr/local/bin:/usr/bin:${PATH}"

# mtx.sh when piped only installs MTX and exits — same two-step pattern as `railpack.json`.
RUN curl -kLSs https://raw.githubusercontent.com/Meanwhile-Together/MTX/refs/heads/main/mtx.sh | bash

RUN mtx project railway-ci-install \
 && mtx project railway-build

ENV PROJECT_ROOT=/app \
    DISABLE_BROWSER_AUTOMATION=1 \
    NODE_ENV=production

EXPOSE 3001

# Process inherits ENV above. When overriding via Railway service settings, use the same `sh -c "…"`
# pattern as root `railway.json` — exec-form runners do not apply shell assignment syntax.
CMD ["node", "targets/server/dist/index.js"]
