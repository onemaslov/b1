import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Отключаем foreign keys для SQLite
if (process.env.DATABASE_URL?.includes('file:')) {
  prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF').catch(() => {
    // Игнорируем ошибки
  })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

