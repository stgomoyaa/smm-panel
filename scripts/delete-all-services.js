/**
 * Script para borrar todos los servicios
 * Uso: node scripts/delete-all-services.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Borrando todos los servicios...')

  try {
    const result = await prisma.service.deleteMany({})
    
    console.log(`✅ ${result.count} servicios eliminados exitosamente!`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
