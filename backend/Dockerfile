FROM node:18-alpine

WORKDIR /app

# Копируем ТОЛЬКО package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --only=production

# Копируем исходный код
COPY src/ ./src/
# Копируем .env файл
COPY .env ./

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3001

CMD ["node", "src/server.js"]