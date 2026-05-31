# syntax=docker/dockerfile:1
# Build context: parent directory (CI) so file: deps resolve.

ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /workspace

# Build boogiepop-auth-sdk (dist/ not in repo — must be compiled)
COPY boogiepop-auth-sdk/ ./boogiepop-auth-sdk/
WORKDIR /workspace/boogiepop-auth-sdk
RUN npm ci && npm run build

# boogiepop-ui (dist/ already committed in repo)
COPY boogiepop-ui/ /workspace/boogiepop-ui/

# Install app deps
WORKDIR /workspace/app
COPY boogiepop-react-seed/package.json boogiepop-react-seed/package-lock.json ./
RUN npm ci

FROM deps AS builder
WORKDIR /workspace/app
COPY boogiepop-react-seed/ .

ARG VITE_REMOTE_BASE=/
ENV VITE_REMOTE_BASE=${VITE_REMOTE_BASE}

ARG VITE_DEV_SERVER_ORIGIN=http://localhost:5173
ENV VITE_DEV_SERVER_ORIGIN=${VITE_DEV_SERVER_ORIGIN}

RUN npm run build

FROM nginx:1.27-alpine AS runner
RUN apk add --no-cache wget
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY boogiepop-react-seed/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/app/dist ./

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
