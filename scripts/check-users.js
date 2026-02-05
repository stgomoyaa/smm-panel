const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      }
    })

    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos')
      console.log('\n💡 Para crear un usuario admin, ejecuta:')
      console.log('   node scripts/create-admin.js\n')
    } else {
      console.log(`✅ Se encontraron ${users.length} usuario(s):\n`)
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Role: ${user.role}`)
        console.log(`   Status: ${user.status ? '✅ Activo' : '❌ Inactivo'}`)
        console.log('')
      })
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
