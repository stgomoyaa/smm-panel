# 🚀 SMM Panel - PuraFama

Panel completo de Social Media Marketing construido con Next.js 14, TypeScript, Prisma y Vercel.

## ✨ Características

- 🎨 **Frontend Moderno**: Next.js 14 con App Router y Tailwind CSS
- 🔐 **Autenticación Segura**: NextAuth.js para admin panel
- 💾 **Base de Datos**: PostgreSQL con Prisma ORM
- 🔌 **Integración SMM**: Compatible con 1xPanel, CostPanel y otros proveedores estándar
- ⚡ **API Routes**: Backend serverless con Next.js
- 🔄 **Cron Jobs**: Procesamiento automático de órdenes y actualización de estados
- 📱 **Responsive**: Diseño adaptable a todos los dispositivos
- 🎯 **TypeScript**: Tipado completo para mayor seguridad

---

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de GitHub
- Cuenta de Vercel (gratis)
- Proveedor SMM con API (1xPanel, CostPanel, etc.)

---

## 🛠️ Instalación Local

### 1. Clonar o descargar el proyecto

Si aún no tienes Git configurado:
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` (copia desde `.env.example`):

```env
# Database (Vercel Postgres te dará esta URL automáticamente)
DATABASE_URL="postgresql://user:password@localhost:5432/smm_panel?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-aleatorio-aqui"

# Admin Credentials
ADMIN_EMAIL="admin@purafama.cl"
ADMIN_PASSWORD="admin123"

# Cron Secret (opcional pero recomendado)
CRON_SECRET="tu-cron-secret-aleatorio"
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Configurar Prisma

```bash
# Generar el cliente de Prisma
npx prisma generate

# Crear la base de datos (si usas PostgreSQL local)
npx prisma db push

# O crear migraciones
npx prisma migrate dev --name init
```

### 5. Crear usuario admin inicial

Crea el archivo `scripts/create-admin.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@purafama.cl'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
      status: true,
    },
  })
  
  console.log('✅ Admin user created:', user.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Ejecuta el script:
```bash
npx ts-node scripts/create-admin.ts
```

### 6. Iniciar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy en Vercel + GitHub

### Paso 1: Crear repositorio en GitHub

1. Ve a [github.com](https://github.com) y crea una nueva cuenta si no tienes
2. Click en "New repository"
3. Nombre: `smm-panel` (o el que prefieras)
4. Marca como privado (recomendado)
5. Click "Create repository"

### Paso 2: Subir código a GitHub

```bash
# Inicializar Git (si no lo hiciste antes)
git init

# Añadir remote
git remote add origin https://github.com/TU_USUARIO/smm-panel.git

# Añadir archivos
git add .

# Commit
git commit -m "Initial commit: SMM Panel"

# Push
git branch -M main
git push -u origin main
```

### Paso 3: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) y regístrate con tu cuenta de GitHub
2. Click en "Add New Project"
3. Importa tu repositorio `smm-panel`
4. Vercel detectará automáticamente que es Next.js

### Paso 4: Configurar Base de Datos en Vercel

1. En tu proyecto de Vercel, ve a "Storage" tab
2. Click "Create Database" → "Postgres"
3. Elige un nombre y región cercana
4. Click "Create"
5. Vercel automáticamente añadirá `DATABASE_URL` a tus variables de entorno

### Paso 5: Configurar Variables de Entorno

En Vercel → Settings → Environment Variables, añade:

```
NEXTAUTH_URL=https://tu-proyecto.vercel.app
NEXTAUTH_SECRET=tu-secret-generado
ADMIN_EMAIL=admin@purafama.cl
ADMIN_PASSWORD=TuPasswordSeguro123!
CRON_SECRET=tu-cron-secret-aleatorio
```

### Paso 6: Deploy

1. Click "Deploy"
2. Espera 2-3 minutos
3. Una vez desplegado, verás tu URL: `https://tu-proyecto.vercel.app`

### Paso 7: Inicializar Base de Datos en Producción

Desde tu terminal local:

```bash
# Conectar a Vercel Postgres
npx vercel env pull .env.local

# Aplicar schema de Prisma
npx prisma db push

# Crear admin user
npx ts-node scripts/create-admin.ts
```

O usa Vercel CLI:
```bash
npm i -g vercel
vercel login
vercel env pull
npx prisma db push
```

---

## ⚙️ Configurar Cron Jobs en Vercel

### Opción 1: Vercel Cron (Recomendado)

Crea `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-orders",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/update-statuses",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Haz commit y push:
```bash
git add vercel.json
git commit -m "Add cron jobs"
git push
```

### Opción 2: Servicio Externo (EasyCron, Cron-Job.org)

Usa estos servicios gratuitos para llamar tus endpoints:

```
https://tu-proyecto.vercel.app/api/cron/process-orders?secret=TU_CRON_SECRET
https://tu-proyecto.vercel.app/api/cron/update-statuses?secret=TU_CRON_SECRET
```

**Frecuencias recomendadas:**
- `process-orders`: Cada 1 minuto
- `update-statuses`: Cada 5 minutos

---

## 📱 Uso del Sistema

### Para el Admin:

1. Ve a `https://tu-proyecto.vercel.app/admin/login`
2. Inicia sesión con tus credenciales
3. **Añadir Proveedor SMM:**
   - Ve a "Proveedores"
   - Click "Añadir Proveedor"
   - Ingresa:
     - Nombre: `1x Panel`
     - URL: `https://api.1xpanel.com/api/v2`
     - API Key: `tu-api-key-aqui`
   - Click "Añadir"
4. **Sincronizar Servicios:**
   - Click "Sincronizar" en el proveedor añadido
   - Espera a que se sincronicen todos los servicios
5. **Personalizar Precios:**
   - Ve a "Servicios"
   - Click "Editar" en cualquier servicio
   - Cambia el precio
   - Click "Guardar"

### Para tus Empleados de Instagram:

1. Comparte el link: `https://tu-proyecto.vercel.app`
2. Ellos verán el formulario de orden
3. Seleccionan categoría → servicio → ingresan link → email
4. Click "Ordenar Ahora"
5. La orden se procesa automáticamente

---

## 🔄 Flujo Completo del Sistema

```
1. Cliente hace orden en el formulario
   ↓
2. Sistema crea orden en BD (status: awaiting)
   ↓
3. Intenta enviar inmediatamente a proveedor SMM
   ↓
4. Si falla, el cron lo reintenta cada minuto
   ↓
5. Proveedor responde con order_id
   ↓
6. Sistema actualiza orden (status: pending)
   ↓
7. Cron verifica estado cada 5 minutos
   ↓
8. Cuando completa, status: completed
   ↓
9. Cliente puede ver su orden completada
```

---

## 🗂️ Estructura del Proyecto

```
smm-panel/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts    # Autenticación
│   │   ├── admin/                         # APIs del admin
│   │   │   ├── providers/                 # CRUD proveedores
│   │   │   ├── services/                  # CRUD servicios
│   │   │   ├── orders/                    # Listar órdenes
│   │   │   └── categories/                # CRUD categorías
│   │   ├── public/                        # APIs públicas
│   │   │   ├── categories/route.ts        # Listar categorías
│   │   │   ├── services/route.ts          # Listar servicios
│   │   │   └── orders/route.ts            # Crear orden
│   │   └── cron/                          # Tareas automáticas
│   │       ├── process-orders/route.ts    # Enviar órdenes
│   │       └── update-statuses/route.ts   # Actualizar estados
│   ├── admin/                             # Panel admin
│   │   ├── login/page.tsx                 # Login admin
│   │   ├── page.tsx                       # Dashboard
│   │   ├── providers/page.tsx             # Gestión proveedores
│   │   ├── services/page.tsx              # Gestión servicios
│   │   └── orders/page.tsx                # Gestión órdenes
│   ├── page.tsx                           # Formulario público
│   ├── layout.tsx                         # Layout principal
│   └── globals.css                        # Estilos globales
├── lib/
│   ├── prisma.ts                          # Cliente Prisma
│   ├── smm-api.ts                         # Cliente SMM API
│   └── utils.ts                           # Utilidades
├── prisma/
│   └── schema.prisma                      # Schema de BD
├── types/
│   └── next-auth.d.ts                     # Tipos NextAuth
├── .env.example                           # Ejemplo de variables
├── package.json                           # Dependencias
├── tsconfig.json                          # Config TypeScript
├── tailwind.config.ts                     # Config Tailwind
└── README.md                              # Este archivo
```

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start

# Prisma
npx prisma studio          # Abrir GUI de BD
npx prisma db push         # Aplicar schema
npx prisma generate        # Generar cliente
npx prisma migrate dev     # Crear migración

# Git
git add .
git commit -m "mensaje"
git push

# Vercel
vercel                     # Deploy preview
vercel --prod              # Deploy producción
vercel logs                # Ver logs
```

---

## 🎨 Personalización

### Cambiar colores del tema:

Edita `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#TU_COLOR',
        600: '#TU_COLOR_OSCURO',
      },
    },
  },
}
```

### Cambiar nombre del sitio:

Edita `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'Tu Nombre - SMM Panel',
  description: 'Tu descripción',
}
```

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'clsx'"
```bash
npm install clsx
```

### Error: "Prisma Client not generated"
```bash
npx prisma generate
```

### Error: "NextAuth secret missing"
```bash
# Genera un nuevo secret
openssl rand -base64 32
# Añádelo a .env como NEXTAUTH_SECRET
```

### Órdenes no se procesan
- Verifica que el cron esté configurado
- Revisa logs en Vercel
- Verifica que la API Key del proveedor sea correcta
- Verifica que haya balance en el proveedor

### No puedo iniciar sesión
- Verifica que creaste el usuario admin
- Verifica NEXTAUTH_SECRET en .env
- Revisa que el email y password sean correctos

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [NextAuth.js Docs](https://next-auth.js.org)

---

## 📝 Licencia

Este proyecto es privado y de uso personal.

---

## 🤝 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel
2. Verifica las variables de entorno
3. Asegúrate de que la base de datos esté configurada
4. Verifica que el proveedor SMM esté activo

---

## 🎉 ¡Listo!

Tu panel SMM está completo y funcionando. Ahora puedes:
- ✅ Añadir proveedores SMM
- ✅ Sincronizar servicios automáticamente
- ✅ Recibir órdenes de clientes
- ✅ Procesar todo automáticamente
- ✅ Ver reportes en tiempo real

**¡Éxito con tu panel!** 🚀
