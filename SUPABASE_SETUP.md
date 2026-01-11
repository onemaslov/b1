# Полная инструкция по настройке Supabase для Map Markers App

## Шаг 1: Получить Connection String в Supabase

### 1.1 Перейти в Settings проекта

1. Откройте https://supabase.com
2. Вы должны быть в вашем новом проекте
3. Слева в меню найдите **Settings** (иконка шестеренки)
4. Нажмите на **Settings**

### 1.2 Найти Connection String

1. В Settings перейдите на вкладку **Database**
2. Найдите раздел **Connection string**
3. Выберите тип подключения: **Node.js** (это то, что нам нужно)
4. Вы увидите строку вроде:
```
postgresql://postgres:[PASSWORD]@db.[REGION].supabase.co:5432/postgres
```

### 1.3 Заменить PASSWORD

**ВАЖНО:** В Connection String вам нужно заменить `[PASSWORD]` на реальный пароль!

1. Найдите пароль в разделе **Database password** на той же странице Settings
2. Скопируйте пароль
3. В Connection String замените `[PASSWORD]` на скопированный пароль

**Пример (с реальными значениями):**
```
postgresql://postgres:MySecurePassword123@db.xyzabc.supabase.co:5432/postgres
```

### 1.4 Скопировать полную строку

Скопируйте полную Connection String - она вам нужна для Vercel.

---

## Шаг 2: Создать таблицы в Supabase

### 2.1 Открыть SQL Editor

1. В левом меню Supabase найдите **SQL Editor**
2. Нажмите **SQL Editor**
3. Нажмите кнопку **New Query** или **+ New**

### 2.2 Скопировать SQL скрипт

Скопируйте этот SQL код целиком:

```sql
-- Создание таблицы users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы markers
CREATE TABLE IF NOT EXISTS markers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT markers_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создание индекса для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS markers_user_id_idx ON markers(user_id);

-- Вставить тестового пользователя
INSERT INTO users (id, username, password) 
VALUES ('admin123', 'admin', 'qwerty')
ON CONFLICT (id) DO NOTHING;
```

### 2.3 Выполнить SQL

1. Вставьте скопированный SQL в редактор
2. Нажмите кнопку **Run** (синяя кнопка в правом углу)
3. Дождитесь успешного выполнения
4. Вы должны увидеть сообщение об успехе

### 2.4 Проверить таблицы

1. В левом меню найдите **Table Editor**
2. Вы должны увидеть две таблицы:
   - `users` с пользователем `admin:qwerty`
   - `markers` (пока пустая)

---

## Шаг 3: Добавить Connection String в Vercel

### 3.1 Открыть Vercel Project Settings

1. Откройте https://vercel.com
2. Найдите свой проект (Map Markers App)
3. Откройте проект (нажмите на него)
4. Нажмите на вкладку **Settings**

### 3.2 Добавить Environment Variable

1. В левом меню найдите **Environment Variables**
2. Нажмите **Add New**
3. Заполните поля:
   - **Name**: `DATABASE_URL`
   - **Value**: Скопируйте Connection String из Supabase
   - **Environment**: Выберите все (Development, Preview, Production)
4. Нажмите **Save**

**Пример:**
```
DATABASE_URL=postgresql://postgres:MySecurePassword123@db.xyzabc.supabase.co:5432/postgres
```

---

## Шаг 4: Обновить Prisma Schema

### 4.1 Открыть файл prisma/schema.prisma

Найдите строку:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### 4.2 Измените на PostgreSQL

Замените строку `provider = "sqlite"` на `provider = "postgresql"`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Полный блок должен выглядеть так:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4.3 Сохраните файл

После изменения сохраните файл (Ctrl+S или Cmd+S).

---

## Шаг 5: Обновить базовые типы Prisma (если нужно)

Проверьте что в `prisma/schema.prisma` есть правильные модели:

```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  markers   Marker[]

  @@map("users")
}

model Marker {
  id          String   @id @default(cuid())
  title       String
  description String?
  latitude    Float
  longitude   Float
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("markers")
}
```

**ВАЖНО:** Если есть разницу в названиях полей (например `user_id` в БД но `userId` в Prisma), Prisma автоматически их маппирует через `@map`:

```prisma
userId      String  @map("user_id")
```

---

## Шаг 6: Тестировать локально

### 6.1 Обновить локальный .env файл

Создайте файл `.env` в корне проекта (если его еще нет):

```
DATABASE_URL=postgresql://postgres:MySecurePassword123@db.xyzabc.supabase.co:5432/postgres
```

### 6.2 Установить зависимости

```bash
npm install
```

### 6.3 Сгенерировать Prisma Client

```bash
npx prisma generate
```

### 6.4 Запустить локально

```bash
npm run dev
```

### 6.5 Тестировать

1. Откройте http://localhost:3000
2. Введите admin / qwerty
3. Добавьте новую метку
4. **Проверьте** что метка сохранилась в Supabase:
   - Откройте Supabase
   - Table Editor → markers
   - Вы должны увидеть новую метку

---

## Шаг 7: Запустить на Vercel

### 7.1 Git Push

```bash
git add .
git commit -m "Switch to PostgreSQL with Supabase"
git push origin main
```

### 7.2 Vercel автоматически деплоит

1. Vercel автоматически запустит build
2. Build скрипт выполнит миграции: `prisma migrate deploy`
3. Таблицы будут созданы в Supabase автоматически
4. Деплой завершится

### 7.3 Проверить на продакшене

1. Откройте ваш сайт на Vercel (обычно https://youproject.vercel.app)
2. Введите admin / qwerty
3. Добавьте метку
4. **Перезагрузите страницу (F5)**
5. **Метка должна остаться!** ✅

---

## ✅ Финальная Чеклист

- [ ] Скопировал Connection String из Supabase (с правильным паролем)
- [ ] Выполнил SQL скрипт в SQL Editor Supabase
- [ ] Проверил что таблицы созданы (Table Editor)
- [ ] Добавил DATABASE_URL в Vercel Environment Variables
- [ ] Обновил provider на "postgresql" в schema.prisma
- [ ] Сохранил файл schema.prisma
- [ ] Обновил локальный .env файл
- [ ] Запустил `npm install` и `npx prisma generate`
- [ ] Тестировал локально (npm run dev)
- [ ] Запустил git push на main
- [ ] Vercel деплоит автоматически
- [ ] Тестировал на продакшене

---

## 🐛 Решение проблем

### Ошибка: "Cannot find module 'pg'"

```bash
npm install pg
```

### Ошибка: "Connection refused"

Проверьте:
1. Connection String правильный
2. Пароль заменен правильно
3. БД запущена на Supabase

### Ошибка: "relation \"users\" does not exist"

Таблицы не созданы. Повторите шаг 2 (выполнить SQL).

### Метки не сохраняются

1. Проверьте что DATABASE_URL правильно установлен в Vercel
2. Проверьте логи Vercel (Deployments → Logs)
3. Убедитесь что таблицы существуют в Supabase

### Локально работает, на Vercel нет

1. Проверьте что schema.prisma на "postgresql"
2. DATABASE_URL установлен в Vercel Environment Variables
3. `npm run dev` использует правильный .env файл локально

---

## 📞 Полезные ссылки

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Prisma PostgreSQL Docs](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Supabase Connection Strings](https://supabase.com/docs/guides/database/connecting-to-postgres)

---

## 🎯 После интеграции

Все готово! Теперь:
- ✅ Метки сохраняются локально в SQLite
- ✅ Метки сохраняются на Vercel в PostgreSQL (Supabase)
- ✅ Данные не теряются при перезапуске
- ✅ Можно масштабировать приложение

