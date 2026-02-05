/**
 * Script para crear usuario admin en la base de datos de producción
 * Uso: node scripts/create-admin.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Creando usuario admin...')

  const email = (process.env.ADMIN_EMAIL || 'admin@purafama.cl').toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD || 'Manchita2172!'

  // Verificar si el admin ya existe
  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  })

  if (existingAdmin) {
    console.log('⚠️  El usuario admin ya existe')
    console.log(`   Email: ${email}`)
    return
  }

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash(password, 10)

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
      commissionRate: 0,
      status: true,
    },
  })

  console.log('✅ Usuario admin creado exitosamente!')
  console.log(`   Email: ${admin.email}`)
  console.log(`   Contraseña: ${password}`)
  console.log('\n⚠️  Cambia la contraseña después del primer login')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
