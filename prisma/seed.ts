const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // Создаём администратора
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: 'qwerty', // В production следует хешировать пароли!
      },
    })

    console.log('✅ Пользователь создан:', admin)
  } catch (e) {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

