# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.4.1
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@10.4.1
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Vite bakes VITE_* into the client bundle at build time
ARG VITE_API_BASE_URL
ARG VITE_ENABLE_API_DEBUG=false
ARG VITE_AUTH_REFRESH_403_CODES=TOKEN_EXPIRED,INVALID_TOKEN
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_ENABLE_API_DEBUG=${VITE_ENABLE_API_DEBUG}
ENV VITE_AUTH_REFRESH_403_CODES=${VITE_AUTH_REFRESH_403_CODES}

RUN pnpm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
