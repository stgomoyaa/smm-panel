/**
 * Script para borrar todas las categorías y subcategorías
 * Uso: node scripts/delete-all-categories.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Borrando todas las subcategorías...')
  
  try {
    // Primero borrar subcategorías (dependen de categorías)
    const subcategoriesResult = await prisma.subcategory.deleteMany({})
    console.log(`✅ ${subcategoriesResult.count} subcategorías eliminadas`)
    
    // Luego borrar categorías
    console.log('🗑️  Borrando todas las categorías...')
    const categoriesResult = await prisma.category.deleteMany({})
    console.log(`✅ ${categoriesResult.count} categorías eliminadas`)
    
    console.log('\n✨ Todas las categorías y subcategorías han sido eliminadas!')
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
