FROM node:22-alpine

WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY src/ ./src/
COPY public/ ./public/

# Create data directory for SQLite DB
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "src/server.js"]
