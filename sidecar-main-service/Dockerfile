FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
COPY src src
RUN npm run build

FROM node:18-alpine
ENV NODE_ENV=production
RUN apk add --no-cache tini
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY --from=builder /app/dist dist/
EXPOSE 3000
ENTRYPOINT [ "/sbin/tini", "--", "node", "dist/index.js" ]