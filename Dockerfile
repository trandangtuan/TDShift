FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql-client ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
ENV NODE_ENV=development
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/mcp/package.json apps/mcp/package.json
COPY packages/core/package.json packages/core/package.json
RUN npm ci

FROM deps AS build
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE
COPY apps apps
COPY packages packages
COPY modules modules
COPY skills skills
RUN npm run build

FROM base AS runner
COPY --from=build /app/package.json /app/package-lock.json /app/tsconfig.base.json ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps apps
COPY --from=build /app/packages packages
COPY --from=build /app/modules modules
COPY --from=build /app/skills skills
EXPOSE 3100
CMD ["npm", "run", "start"]
