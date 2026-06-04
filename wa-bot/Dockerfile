FROM node:22-slim

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV WA_SESSION_PATH=/data/.wwebjs_auth

RUN apt-get update \
  && apt-get install -y \
    chromium \
    fonts-freefont-ttf \
    --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
