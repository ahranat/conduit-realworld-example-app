FROM node:22-bookworm-slim
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json

RUN npm ci
COPY . .

CMD ["npm", "run", "dev", "-w", "backend"]