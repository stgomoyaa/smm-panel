const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixEmailCase() {
  try {
    console.log('🔧 Normalizando emails a lowercase...\n')
    
    const users = await prisma.user.findMany()
    
    for (const user of users) {
      const normalizedEmail = user.email.toLowerCase().trim()
      
      if (user.email !== normalizedEmail) {
        console.log(`📧 Actualizando: ${user.email} → ${normalizedEmail}`)
        
        await prisma.user.update({
          where: { id: user.id },
          data: { email: normalizedEmail }
        })
      } else {
        console.log(`✅ Ya normalizado: ${user.email}`)
      }
    }
    
    console.log('\n✅ Emails normalizados correctamente')
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixEmailCase()
