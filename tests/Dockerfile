FROM mcr.microsoft.com/playwright:v1.65.0-noble
# 2. Set the working directory inside the image
WORKDIR /app
# 3. Copy dependency manifests COPY <source> <destination>
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci
COPY . .
