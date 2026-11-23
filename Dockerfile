FROM node:22-alpine

WORKDIR /app

COPY package*.json .npmrc ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY app/config/databaseUrl.js ./app/config/databaseUrl.js
RUN npm ci

COPY . .
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "--silent", "start"]
