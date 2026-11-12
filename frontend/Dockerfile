# 1. Choose an image containing Node.js
FROM node:22-bookworm-slim
# 2. Set the working directory inside the image
WORKDIR /app
# 3. Copy dependency manifests COPY <source> <destination>
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci
COPY . .
CMD ["npm", "run", "dev", "-w", "frontend", "--", "--host", "0.0.0.0"]