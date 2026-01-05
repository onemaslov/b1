# Инструкция по развертыванию

## 🚀 Деплой на Vercel (Рекомендуется)

### Шаг 1: Подготовка базы данных

#### Вариант A: Supabase (Рекомендуется)

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Дождитесь инициализации базы данных
4. Перейдите в Settings → Database
5. Скопируйте **Connection String** в формате URI
6. Измените `[YOUR-PASSWORD]` на реальный пароль

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

#### Вариант B: Railway

1. Перейдите на [railway.app](https://railway.app)
2. Создайте новый проект
3. Добавьте PostgreSQL из Templates
4. Скопируйте переменную `DATABASE_URL`

#### Вариант C: PlanetScale

1. Перейдите на [planetscale.com](https://planetscale.com)
2. Создайте новую базу данных
3. Создайте пароль для production branch
4. Скопируйте connection string

### Шаг 2: Деплой на Vercel

#### Через веб-интерфейс:

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите **"Add New Project"**
3. Импортируйте ваш GitHub репозиторий
4. Настройте проект:
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && next build`
   - **Output Directory**: `.next`

5. Добавьте переменные окружения:
   - Нажмите **"Environment Variables"**
   - Добавьте `DATABASE_URL` со значением connection string из Шага 1
   
6. Нажмите **"Deploy"**

#### Через CLI:

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Деплой
vercel

# Добавьте переменную окружения
vercel env add DATABASE_URL
# Вставьте ваш DATABASE_URL

# Production деплой
vercel --prod
```

### Шаг 3: Применение миграций

После первого деплоя нужно применить миграции к production базе:

#### Вариант A: Через Vercel CLI

```bash
# Установите переменные локально
vercel env pull .env.production

# Примените миграции
DATABASE_URL="ваш-production-url" npx prisma migrate deploy
```

#### Вариант B: Через Prisma Studio (для Supabase)

1. Откройте Supabase Dashboard
2. Перейдите в SQL Editor
3. Выполните SQL из ваших миграций вручную

#### Вариант C: Автоматически через скрипт

Добавьте в `package.json`:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

Измените Build Command в Vercel на `npm run vercel-build`

### Шаг 4: Проверка

1. Откройте URL вашего деплоя
2. Проверьте, что карта загружается
3. Попробуйте добавить метку
4. Проверьте сайдбар и функции редактирования

---

## 🐳 Деплой через Docker (Альтернатива)

### Dockerfile

Создайте `Dockerfile`:

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
```

### Docker Compose

Создайте `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: mapuser
      POSTGRES_PASSWORD: mappassword
      POSTGRES_DB: mapdb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://mapuser:mappassword@db:5432/mapdb
    depends_on:
      - db

volumes:
  postgres_data:
```

### Запуск:

```bash
docker-compose up -d
docker-compose exec app npx prisma migrate deploy
```

---

## ☁️ Деплой на другие платформы

### Railway

1. Перейдите на [railway.app](https://railway.app)
2. Создайте новый проект
3. Добавьте PostgreSQL
4. Добавьте ваш GitHub репозиторий
5. Railway автоматически определит Next.js
6. Добавьте переменную `DATABASE_URL`
7. Деплой произойдёт автоматически

### Netlify

```bash
# Установите Netlify CLI
npm install -g netlify-cli

# Войдите
netlify login

# Деплой
netlify deploy --prod
```

**Примечание**: Для Netlify нужно использовать Serverless функции для API.

### VPS (Ubuntu)

```bash
# Установите Node.js и npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установите PostgreSQL
sudo apt install postgresql postgresql-contrib

# Клонируйте проект
git clone <your-repo>
cd b1

# Установите зависимости
npm install

# Настройте .env
nano .env
# Добавьте DATABASE_URL

# Примените миграции
npx prisma migrate deploy

# Соберите проект
npm run build

# Установите PM2
sudo npm install -g pm2

# Запустите приложение
pm2 start npm --name "map-app" -- start

# Настройте автозапуск
pm2 startup
pm2 save
```

---

## 🔧 Отладка проблем

### Ошибка: "Can't reach database server"

- Проверьте правильность DATABASE_URL
- Убедитесь, что база данных запущена
- Проверьте firewall правила

### Ошибка: "Module not found: Can't resolve 'leaflet'"

- Запустите `npm install`
- Проверьте, что все зависимости установлены

### Карта не отображается на production

- Проверьте, что Leaflet CSS загружается
- Проверьте Console в браузере на ошибки
- Убедитесь, что компонент Map импортирован с `ssr: false`

### Миграции не применяются

```bash
# Сбросить и применить заново (ОСТОРОЖНО: удалит данные!)
npx prisma migrate reset

# Или применить вручную
npx prisma migrate deploy
```

---

## 📊 Мониторинг

### Vercel Analytics

Vercel автоматически предоставляет:
- Web Vitals (Core Web Vitals)
- Real-time logs
- Deployment history

### Добавление Sentry (опционально)

```bash
npm install @sentry/nextjs

npx @sentry/wizard -i nextjs
```

### Health Check Endpoint

Создайте `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', database: 'disconnected' },
      { status: 500 }
    )
  }
}
```

---

## 🔄 Обновление production

```bash
# Локально
git add .
git commit -m "Update feature"
git push origin main

# Vercel автоматически задеплоит
```

Или вручную через CLI:

```bash
vercel --prod
```

