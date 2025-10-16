# Build
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .


# RUN
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app .

CMD ["npm", "run", "start:dev"]
