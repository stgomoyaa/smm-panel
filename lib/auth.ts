import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 [AUTH] Iniciando autenticación...')
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [AUTH] Credenciales faltantes')
          return null
        }

        // Convertir email a lowercase para hacer case-insensitive
        const email = credentials.email.toLowerCase().trim()
        console.log('📧 [AUTH] Email normalizado:', email)

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          console.log('❌ [AUTH] Usuario no encontrado:', email)
          return null
        }

        console.log('✅ [AUTH] Usuario encontrado:', {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status
        })

        if (!user.status) {
          console.log('❌ [AUTH] Usuario inactivo')
          return null
        }

        console.log('🔑 [AUTH] Verificando contraseña...')
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          console.log('❌ [AUTH] Contraseña incorrecta')
          return null
        }

        console.log('✅ [AUTH] Autenticación exitosa')
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
