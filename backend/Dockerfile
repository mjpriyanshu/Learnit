FROM node:18-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund \
	&& npm cache clean --force

# Copy app source
COPY . .

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]
