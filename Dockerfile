FROM node:20-alpine AS builder

WORKDIR /app

# Копируем только файлы зависимостей
COPY package*.json ./
COPY components.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код приложения
COPY . .

# Собираем приложение для production
RUN npm run build -- --logLevel debug

FROM nginx:1.25-alpine

# Удаляем стандартную конфигурацию nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копируем вашу конфигурацию
COPY nginx.conf /etc/nginx/conf.d/

# Копируем собранное приложение из builder-образа
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]