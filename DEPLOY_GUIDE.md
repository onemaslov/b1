# 🔧 Инструкция для деплоя на Vercel с Supabase

## ✅ Что готово:

1. ✅ Schema.prisma настроена на PostgreSQL
2. ✅ Миграция создана
3. ✅ API использует Prisma ORM (совместим с PostgreSQL)
4. ✅ Локально работает с SQLite (через PRAGMA foreign_keys OFF)

## 🚀 Шаги для деплоя:

### 1. Получить Connection String из Supabase

1. Зайдите в [Supabase](https://supabase.com)
2. Откройте свой проект
3. Settings → Database → Connection string
4. Выберите **"URI"** (не Pooling!)
5. Скопируйте строку (выглядит примерно так):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### 2. Добавить в Vercel Environment Variables

1. Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите свой проект
3. Settings → Environment Variables
4. Добавьте переменную:
   - **Name:** `DATABASE_URL`
   - **Value:** (ваш connection string из Supabase)
   - **Environment:** Production, Preview, Development (выберите все)

### 3. Создать пользователя admin в Supabase

Выполните SQL в Supabase SQL Editor:

```sql
INSERT INTO users (id, username, password, "createdAt", "updatedAt")
VALUES ('admin123', 'admin', 'qwerty', NOW(), NOW());
```

### 4. Деплой на Vercel

```bash
git add .
git commit -m "Готов к деплою с PostgreSQL"
git push
```

Или через Vercel Dashboard: Settings → Git → Redeploy

### 5. Проверка

1. Откройте ваш сайт на Vercel
2. Войдите: `admin` / `qwerty`
3. Добавьте метку
4. Обновите страницу (F5) - метка должна остаться!

## 🔍 Если что-то не работает:

### Проблема: "Failed to connect to database"

**Решение:**
- Проверьте что Connection String правильный
- Убедитесь что используете **URI**, а не Pooling connection string
- Проверьте что пароль правильный (нет лишних пробелов)

### Проблема: "Table 'users' does not exist"

**Решение:**
- Миграция не применилась автоматически
- Зайдите в Supabase SQL Editor
- Выполните SQL из файла `prisma/migrations/20260111_init/migration.sql`

### Проблема: "Cannot login"

**Решение:**
- Создайте пользователя admin через SQL (см. Шаг 3)

## 📝 Локальная разработка

Локально продолжайте использовать SQLite:

```bash
# .env.local
DATABASE_URL="file:./dev.db"
```

При коммите `.env.local` игнорируется (он в .gitignore)

## ✨ Готово!

После деплоя:
- ✅ На Vercel работает с PostgreSQL (Supabase)
- ✅ Локально работает с SQLite
- ✅ Метки сохраняются
- ✅ Авторизация работает

Удачи! 🚀

