# syntax=docker/dockerfile:1
# One root dependency graph is shared by the two independent build targets.
FROM node:24.19.0-bookworm-slim AS dependencies
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS backend-build
COPY tsconfig.base.json ./
COPY backend ./backend
COPY shared ./shared
RUN pnpm build:backend

FROM dependencies AS production-dependencies
RUN pnpm prune --prod

FROM dependencies AS frontend-build
COPY tsconfig.base.json ./
COPY frontend ./frontend
COPY shared ./shared
COPY scripts/generate-precache.mjs ./scripts/generate-precache.mjs
# Public configuration only. Resolve this path to the browser's current origin.
ENV VITE_API_BASE_URL=/api/v1
ENV VITE_API_AUTH_MODE=proxy
RUN pnpm build:frontend

FROM node:24.19.0-bookworm-slim AS backend
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --from=backend-build --chown=node:node /app/backend/dist ./backend/dist
COPY --from=backend-build --chown=node:node /app/backend/src/db/migrations ./backend/src/db/migrations
COPY --from=backend-build --chown=node:node \
    /app/shared/exercises.json /app/shared/retiredExercises.json /app/shared/archivedExercises.json ./shared/
COPY --chown=node:node docker/backend-healthcheck.mjs ./docker/backend-healthcheck.mjs
USER node
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=6 \
    CMD ["node", "docker/backend-healthcheck.mjs"]
CMD ["node", "backend/dist/backend/src/server.js"]

FROM nginx:1.30.5-alpine AS frontend
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/web-entrypoint.sh /usr/local/bin/form-web-entrypoint.sh
COPY --from=frontend-build /app/dist /usr/share/nginx/html
# An unprivileged process writes temporary files only under /tmp.
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=6 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
ENTRYPOINT ["sh", "/usr/local/bin/form-web-entrypoint.sh"]
CMD ["-g", "daemon off;"]
