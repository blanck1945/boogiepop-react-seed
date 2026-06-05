# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
WORKDIR /app
COPY . .

ARG VITE_REMOTE_BASE=/
ENV VITE_REMOTE_BASE=${VITE_REMOTE_BASE}

ARG NGINX_BASE_PATH=mf
ENV NGINX_BASE_PATH=${NGINX_BASE_PATH}

ARG VITE_DEV_SERVER_ORIGIN=http://localhost:5173
ENV VITE_DEV_SERVER_ORIGIN=${VITE_DEV_SERVER_ORIGIN}

RUN npm run build

FROM nginx:1.27-alpine AS runner
ARG NGINX_BASE_PATH=mf
RUN apk add --no-cache wget
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN sed -i "s|__BASE_PATH__|${NGINX_BASE_PATH}|g" /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist ./

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
