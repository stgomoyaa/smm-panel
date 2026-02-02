import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@purafama.cl'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  
  console.log('Creating admin user...')
  console.log('Email:', email)
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
      status: true,
    },
  })
  
  console.log('✅ Admin user created/updated:', user.email)
  console.log('Password:', password)
  console.log('\n⚠️  IMPORTANT: Change your password after first login!')
}

main()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
