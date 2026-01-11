# Настройка базы данных для Production на Vercel

## ❌ Проблема на Vercel

На Vercel используется **временная файловая система** - все файлы удаляются при перезапуске.

SQLite хранит данные в файле `dev.db`, поэтому метки теряются.

## ✅ Решение: PostgreSQL на Vercel через Supabase

Нужно использовать **внешнюю БД** - PostgreSQL на Supabase.

**⭐ Подробная инструкция:** Смотрите файл `SUPABASE_SETUP.md` - там всё расписано пошагово!

## ⚡ Быстрый обзор интеграции

1. Создать БД на Supabase - 5 минут
2. Получить Connection String - 2 минуты  
3. Добавить в Vercel Environment Variables - 2 минуты
4. Обновить schema.prisma - 1 минута
5. Git push - готово! ✅

## 📋 Основные шаги

### 1. Supabase Setup

Откройте `SUPABASE_SETUP.md` и следуйте ВСЕ шагам пошагово:
- Как получить Connection String
- Как создать таблицы через SQL
- Как тестировать локально
- Как проверить что всё работает

### 2. Vercel Configuration

```
Settings → Environment Variables
↓
Add New
↓
Name: DATABASE_URL
Value: postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
↓
Save
```

### 3. Update prisma/schema.prisma

Измените файл `prisma/schema.prisma`:

**С этого:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**На это:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. Deploy

```bash
git add .
git commit -m "Switch to PostgreSQL Supabase"
git push origin main
```

Vercel автоматически:
- Установит переменные окружения
- Запустит миграции: `prisma migrate deploy`
- Создаст таблицы в PostgreSQL
- Деплоит приложение

## ✅ Финальный результат

✅ Локально: SQLite (быстро, просто)
✅ На Vercel: PostgreSQL/Supabase (надежно, постоянно)
✅ Все метки сохраняются и НЕ теряются!

## 📚 Подробные гайды

- **SUPABASE_SETUP.md** - полная пошаговая инструкция (прочитайте обязательно!)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma PostgreSQL Docs](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

## 🎯 Не забудьте!

Прочитайте `SUPABASE_SETUP.md` - там все детально разобрано! 👈
