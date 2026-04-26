# Minimal wrapper so Railway's DOCKERFILE builder (new-service default) can consume
# the same self-contained artifact that RAILPACK would. All real work (client dist,
# server dist, npm-packs, package.deploy.json) is done locally via `npm run prepare:railway`
# and uploaded.
FROM node:20-slim

WORKDIR /app

COPY . /app

RUN bash scripts/railway-ci-install.sh \
 && bash scripts/railway-build.sh

ENV PROJECT_ROOT=/app \
    DISABLE_BROWSER_AUTOMATION=1 \
    NODE_ENV=production

EXPOSE 3001

CMD ["node", "targets/server/dist/index.js"]
