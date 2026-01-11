# 📋 Полный гайд интеграции Supabase + Vercel

Этот документ объединяет все, что вам нужно знать для интеграции вашего приложения.

## 🎯 Что мы реализовали

- ✅ Map Markers App с авторизацией
- ✅ CRUD операции для меток
- ✅ Работает локально с SQLite
- ✅ Готово к production на Vercel с PostgreSQL

## 📁 Важные файлы для интеграции

### 1. **SUPABASE_SETUP.md** ⭐ ПРОЧИТАЙТЕ ПЕРВЫМ
   - Полная пошаговая инструкция
   - Как получить Connection String
   - Как создать таблицы
   - Как тестировать локально
   - Как проверить на Vercel
   - Решение проблем

### 2. **PRODUCTION_DATABASE.md**
   - Краткий обзор интеграции
   - Ссылка на SUPABASE_SETUP.md

## 🚀 Быстрый путь (если торопитесь)

1. Откройте **SUPABASE_SETUP.md**
2. Следуйте **ВСЕ шаги** в порядке
3. Всё должно работать!

## 📊 Архитектура

```
┌─────────────────────────────────────┐
│       Your Map Markers App          │
├─────────────────────────────────────┤
│   React 18 + Next.js 14 + TypeScript│
├─────────────────────────────────────┤
│  Prisma ORM (управление БД)         │
├─────────────────────────────────────┤
│   ↓ Локально: SQLite                │
│   ↓ Production: PostgreSQL (Supabase)│
└─────────────────────────────────────┘
```

## 🔑 Ключевые компоненты

### Frontend
- `/src/app/page.tsx` - главная страница с картой
- `/src/components/Map.tsx` - компонент карты (Leaflet)
- `/src/components/SearchBar.tsx` - поиск по адресам
- `/src/app/login/page.tsx` - страница авторизации

### Backend (API)
- `/src/app/api/markers/route.ts` - GET/POST метки
- `/src/app/api/markers/[id]/route.ts` - PATCH/DELETE метки
- `/src/app/api/auth/login/route.ts` - авторизация
- `/src/app/api/geocode/route.ts` - поиск адресов

### Database (Prisma)
- `/prisma/schema.prisma` - схема БД
- `/prisma/migrations/` - миграции БД

## 📝 Аутентификация

**Тестовый аккаунт:**
- Логин: `admin`
- Пароль: `qwerty`

Этот аккаунт автоматически создается при первой миграции.

## 🌍 Окружение

### Локальное (.env)
```
DATABASE_URL=file:./dev.db
```
(это значение по умолчанию, можете не указывать)

### Production (Vercel)
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

## ✅ Checklist перед production

- [ ] Создан проект на Supabase
- [ ] Получен Connection String с правильным паролем
- [ ] Выполнены SQL команды (таблицы созданы)
- [ ] DATABASE_URL добавлен в Vercel
- [ ] provider изменен на "postgresql" в schema.prisma
- [ ] Тестировано локально (npm run dev)
- [ ] Git push выполнен
- [ ] Vercel деплоит автоматически
- [ ] Проверено на production (метка остается после refresh)

## 🐛 Если что-то не работает

1. **Ошибка при авторизации:**
   - Проверьте что таблица `users` существует в Supabase
   - Проверьте что пользователь `admin:qwerty` создан

2. **Метки не сохраняются:**
   - Проверьте CONNECTION_URL в Vercel
   - Проверьте что provider = "postgresql"
   - Проверьте логи Vercel (Deployments → View Build Logs)

3. **Локально работает, на Vercel нет:**
   - DATABASE_URL правильно установлена?
   - `prisma migrate deploy` выполнена?
   - Таблицы созданы в Supabase (Table Editor)?

## 📚 Технический стек

- **Frontend:** React 18, Next.js 14, TypeScript
- **Стили:** Tailwind CSS
- **Карты:** Leaflet + OpenStreetMap
- **БД (локально):** SQLite
- **БД (production):** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Хостинг:** Vercel
- **Аутентификация:** Cookie-based sessions

## 🎯 Следующие шаги

1. **Сейчас:** Прочитайте SUPABASE_SETUP.md (все подробно там)
2. **Затем:** Выполните интеграцию пошагово
3. **Наконец:** Тестируйте и деплойте на Vercel

## 💡 Советы

- Сохраняйте Connection String в безопасном месте
- Не коммитьте `.env` файл с реальными данными
- Регулярно проверяйте данные в Supabase (Table Editor)
- Используйте разные БД для development и production

## 📞 Полезные ссылки

- **Supabase:** https://supabase.com/dashboard
- **Vercel:** https://vercel.com/dashboard
- **Prisma:** https://www.prisma.io/docs
- **Этот репо:** GitHub URL вашего проекта

---

**ГЛАВНОЕ:** Откройте `SUPABASE_SETUP.md` и следуйте шагам! Там всё подробно расписано. 👈✅

