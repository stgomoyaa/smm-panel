# 🚀 Guía de Deploy en Vercel

Esta guía te llevará paso a paso para hacer deploy de tu panel SMM en Vercel.

## 📋 Prerequisitos

- Cuenta en GitHub (ya tienes tu código subido)
- Cuenta en Vercel (gratis)
- Base de datos PostgreSQL (Neon recomendado - gratis)

## Paso 1: Configurar Base de Datos PostgreSQL

### Opción A: Neon (Recomendado)

1. Ve a [neon.tech](https://neon.tech) y crea una cuenta
2. Crea un nuevo proyecto
3. Copia la **Connection String** que se ve así:
   ```
   postgresql://usuario:password@ep-xxxxx.neon.tech/dbname?sslmode=require
   ```
4. Guárdala - la necesitarás en el siguiente paso

### Opción B: Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto
3. Ve a Settings → Database
4. Copia la **Connection String** (modo "Transaction")

## Paso 2: Deploy en Vercel

### 2.1 Importar Proyecto

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con GitHub
3. Click en **"Add New"** → **"Project"**
4. Selecciona tu repositorio `smm-panel`
5. Click en **"Import"**

### 2.2 Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega estas variables:

#### Variables Requeridas:

```env
# Base de Datos (usa la que copiaste de Neon)
DATABASE_URL=postgresql://usuario:password@ep-xxxxx.neon.tech/dbname?sslmode=require

# NextAuth - URL de tu aplicación
NEXTAUTH_URL=https://tu-proyecto.vercel.app

# NextAuth - Secret (genera uno nuevo)
NEXTAUTH_SECRET=tu_secret_aleatorio_aquí

# Credenciales Admin (opcional, para el script)
ADMIN_EMAIL=admin@purafama.cl
ADMIN_PASSWORD=tu_password_seguro_aquí

# Cron Secret (opcional pero recomendado)
CRON_SECRET=otro_secret_aleatorio_aquí
```

#### ¿Cómo generar los secrets?

**Opción 1 - Desde tu computadora:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Opción 2 - Generador online:**
Ve a [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)

### 2.3 Hacer Deploy

1. Verifica que todo esté configurado
2. Click en **"Deploy"** 🚀
3. Espera 2-3 minutos mientras Vercel hace el build

## Paso 3: Configurar la Base de Datos

Después del primer deploy, necesitas crear las tablas y el usuario admin.

### 3.1 Ejecutar Migraciones

**Desde tu computadora local:**

1. Actualiza temporalmente tu `.env` local con la URL de producción:
   ```env
   DATABASE_URL=postgresql://usuario:password@ep-xxxxx.neon.tech/dbname?sslmode=require
   ```

2. Ejecuta el push de Prisma:
   ```bash
   npx prisma db push
   ```
   
   Esto creará todas las tablas en tu base de datos de producción.

### 3.2 Crear Usuario Admin

Ejecuta el script para crear el usuario admin:

```bash
node scripts/create-admin.js
```

Verás algo como:
```
🔄 Creando usuario admin...
✅ Usuario admin creado exitosamente!
   Email: admin@purafama.cl
   Contraseña: tu_password
```

## Paso 4: Verificar el Deploy

1. Ve a tu URL de Vercel: `https://tu-proyecto.vercel.app`
2. Deberías ver la página principal
3. Ve a `/login` e inicia sesión con:
   - Email: `admin@purafama.cl`
   - Password: El que configuraste

## 🔧 Configuración Adicional

### Dominios Personalizados

1. En Vercel, ve a tu proyecto
2. Settings → Domains
3. Agrega tu dominio personalizado
4. Sigue las instrucciones de DNS

**Importante:** Después de agregar tu dominio, actualiza la variable:
```env
NEXTAUTH_URL=https://tudominio.com
```

### Cron Jobs (Opcional)

Para que los cron jobs funcionen automáticamente:

1. En Vercel, ve a Settings → Cron Jobs
2. Agrega:
   - `/api/cron/process-orders` - cada 5 minutos
   - `/api/cron/update-statuses` - cada 10 minutos

O usa un servicio externo como [cron-job.org](https://cron-job.org):
```
https://tu-proyecto.vercel.app/api/cron/process-orders?secret=TU_CRON_SECRET
https://tu-proyecto.vercel.app/api/cron/update-statuses?secret=TU_CRON_SECRET
```

## 📊 Monitoreo

### Ver Logs en Vercel

1. Ve a tu proyecto en Vercel
2. Click en "Deployments"
3. Click en el deployment activo
4. Pestaña "Functions" para ver logs

### Ver Base de Datos en Neon

1. Ve a [console.neon.tech](https://console.neon.tech)
2. Selecciona tu proyecto
3. Usa el SQL Editor para hacer consultas

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Causa:** Variables de entorno mal configuradas.

**Solución:**
1. Ve a Vercel → Settings → Environment Variables
2. Verifica que `DATABASE_URL` esté correcta
3. Haz un nuevo deploy (Deployments → Redeploy)

### Error: "NEXTAUTH_URL is not defined"

**Solución:**
1. Agrega `NEXTAUTH_URL` en las variables de entorno
2. Redeploy

### Error 500 al hacer login

**Causa:** Puede ser que no exista el usuario admin.

**Solución:**
1. Ejecuta el script `node scripts/create-admin.js` localmente
2. O conéctate a la base de datos y crea el usuario manualmente

### Página en blanco después del deploy

**Causa:** Error en el build o variables de entorno faltantes.

**Solución:**
1. Ve a Vercel → Deployments → [tu deploy]
2. Revisa la pestaña "Build Logs" para ver errores
3. Verifica que todas las variables de entorno estén configuradas

## 🎉 ¡Listo!

Tu panel SMM ahora está en producción. 

### Próximos Pasos:

1. **Cambiar contraseña del admin** por seguridad
2. **Agregar proveedores SMM** desde el panel admin
3. **Crear vendedores** si es necesario
4. **Configurar dominio personalizado**
5. **Configurar cron jobs** para procesamiento automático

## 🔐 Seguridad

- ✅ Cambia el `ADMIN_PASSWORD` después del primer login
- ✅ Usa contraseñas fuertes para `NEXTAUTH_SECRET` y `CRON_SECRET`
- ✅ Nunca compartas tus variables de entorno
- ✅ Activa SSL/HTTPS (Vercel lo hace automáticamente)

## 📚 Recursos

- [Documentación Vercel](https://vercel.com/docs)
- [Documentación Neon](https://neon.tech/docs)
- [Documentación Prisma](https://www.prisma.io/docs)
- [Documentación Next.js](https://nextjs.org/docs)

---

¿Necesitas ayuda? Revisa los logs en Vercel y el archivo `TROUBLESHOOTING.md`
