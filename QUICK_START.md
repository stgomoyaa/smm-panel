# 🚀 GUÍA RÁPIDA DE INICIO

## 📝 Pasos para desplegar en Vercel

### 1️⃣ Preparar el código

```bash
# 1. Abre PowerShell o CMD en la carpeta del proyecto
cd "C:\Users\stgom\Desktop\Coding\Pag simon"

# 2. Instalar dependencias
npm install

# 3. Copiar archivo de ejemplo de variables
copy .env.example .env

# 4. Editar .env y añadir tu NEXTAUTH_SECRET
# Genera uno con: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2️⃣ Subir a GitHub

```bash
# 1. Inicializar Git
git init

# 2. Añadir archivos
git add .

# 3. Commit
git commit -m "Initial commit"

# 4. Crear repositorio en GitHub.com (hazlo desde la web)
# Ve a: https://github.com/new
# Crea un repositorio llamado "smm-panel"

# 5. Conectar y subir
git remote add origin https://github.com/TU_USUARIO/smm-panel.git
git branch -M main
git push -u origin main
```

### 3️⃣ Deploy en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click "Sign Up" → Usa tu cuenta de GitHub
3. Click "Add New Project"
4. Importa tu repo `smm-panel`
5. En "Environment Variables", añade:
   ```
   NEXTAUTH_SECRET=tu-secret-aqui
   ADMIN_EMAIL=admin@purafama.cl
   ADMIN_PASSWORD=TuPasswordSeguro123
   CRON_SECRET=otro-secret-aleatorio
   ```
6. Click "Deploy"
7. Espera 2-3 minutos

### 4️⃣ Configurar Base de Datos

1. En Vercel, ve a tu proyecto → "Storage" tab
2. Click "Create Database" → "Postgres"
3. Elige nombre y región
4. Click "Create"
5. Espera 1 minuto
6. Vercel añadirá `DATABASE_URL` automáticamente

### 5️⃣ Inicializar Base de Datos

**Opción A: Desde Vercel CLI (recomendado)**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Descargar variables de entorno
vercel env pull .env.local

# Aplicar schema
npx prisma db push

# Crear admin
npx ts-node scripts/create-admin.ts
```

**Opción B: Manualmente**

1. Copia `DATABASE_URL` desde Vercel → Settings → Environment Variables
2. Pégala en tu archivo `.env.local`
3. Ejecuta:
   ```bash
   npx prisma db push
   npx ts-node scripts/create-admin.ts
   ```

### 6️⃣ ¡Listo! Usar el sistema

**Para Admin:**
- URL: `https://tu-proyecto.vercel.app/admin/login`
- Email: `admin@purafama.cl`
- Password: El que configuraste

**Para empleados:**
- URL: `https://tu-proyecto.vercel.app`
- Ellos solo ven el formulario de orden

---

## ⚙️ Configuración Inicial

### 1. Añadir Proveedor SMM

1. Login en `/admin/login`
2. Ve a "Proveedores"
3. Click "Añadir Proveedor"
4. Ingresa:
   - **Nombre**: `1x Panel` (o el nombre de tu proveedor)
   - **URL**: `https://api.tuprovedor.com/api/v2`
   - **API Key**: Tu API key (consíguela en el panel del proveedor)
5. Click "Añadir"

### 2. Sincronizar Servicios

1. En la tarjeta del proveedor, click "Sincronizar"
2. Espera 10-30 segundos
3. Verás: "X servicios sincronizados"
4. Ve a "Servicios" para verlos

### 3. Personalizar Precios (Opcional)

1. Ve a "Servicios"
2. Click "Editar" en cualquier servicio
3. Cambia el precio (ej: de $0.75 a $5000)
4. Click "Guardar"

### 4. ¡Primera Orden!

1. Abre tu sitio público: `https://tu-proyecto.vercel.app`
2. Selecciona categoría
3. Selecciona servicio
4. Ingresa link de Instagram (ej: `@username`)
5. Ingresa email
6. Click "Ordenar Ahora"
7. Ve a Admin → Órdenes para ver el estado

---

## 🔥 Comandos Más Usados

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build
npm run build

# Base de datos
npx prisma studio          # Ver BD en navegador
npx prisma db push         # Aplicar cambios de schema

# Git
git add .
git commit -m "Cambios"
git push

# Vercel
vercel                     # Deploy preview
vercel --prod              # Deploy a producción
```

---

## ❓ Preguntas Frecuentes

### ¿Cómo consigo un proveedor SMM?

Busca proveedores como:
- 1xPanel
- CostPanel
- SMM Heaven
- Otros que tengan API compatible

Regístrate, recarga balance, y obtén tu API Key.

### ¿Cuánto cuesta hospedar esto?

- **Vercel**: Gratis (hasta 100GB bandwidth)
- **Base de Datos**: Gratis (Vercel Postgres: 256MB)
- **Total**: $0/mes para empezar

### ¿Puedo usar mi propio dominio?

Sí, en Vercel → Settings → Domains → Add Domain

### ¿Cómo actualizo el código?

```bash
git add .
git commit -m "Cambios"
git push
```

Vercel desplegará automáticamente.

### ¿Qué pasa si algo falla?

1. Ve a Vercel → Tu proyecto → Logs
2. Mira los errores
3. Revisa las variables de entorno
4. Verifica la API Key del proveedor

---

## 🎯 Próximos Pasos

1. ✅ Despliega el proyecto
2. ✅ Añade tu primer proveedor
3. ✅ Sincroniza servicios
4. ✅ Personaliza precios
5. ✅ Haz tu primera orden de prueba
6. 🎨 Personaliza colores/diseño
7. 💰 Configura método de pago real (Flow, MercadoPago, etc.)
8. 📱 Comparte el link con tus empleados

---

## 📞 Ayuda

Si tienes problemas, verifica:
- ✅ Variables de entorno en Vercel
- ✅ Base de datos creada y conectada
- ✅ Usuario admin creado
- ✅ API Key del proveedor correcta
- ✅ Cron jobs configurados (vercel.json)

---

**¡Éxito! 🚀**
