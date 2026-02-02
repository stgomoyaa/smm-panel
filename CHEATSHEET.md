# 🛠️ CHEATSHEET - Comandos Útiles

## 📦 NPM / Instalación

```bash
# Instalar todas las dependencias
npm install

# Instalar dependencia específica
npm install nombre-paquete

# Instalar dependencia de desarrollo
npm install -D nombre-paquete

# Actualizar dependencias
npm update

# Limpiar node_modules y reinstalar
rm -rf node_modules
npm install
```

---

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo (http://localhost:3000)
npm run dev

# Build para producción
npm run build

# Iniciar versión de producción
npm start

# Linter
npm run lint
```

---

## 🗄️ Prisma / Base de Datos

```bash
# Generar cliente de Prisma (después de cambiar schema)
npx prisma generate

# Aplicar schema a base de datos (development)
npx prisma db push

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Ver base de datos en navegador (Prisma Studio)
npx prisma studio

# Resetear base de datos (⚠️ CUIDADO: Borra todo)
npx prisma migrate reset

# Ver estado de migraciones
npx prisma migrate status

# Aplicar migraciones pendientes
npx prisma migrate deploy
```

---

## 🔐 Crear Admin

```bash
# Crear/actualizar usuario admin
npx ts-node scripts/create-admin.ts

# O con variables personalizadas
ADMIN_EMAIL=tu@email.com ADMIN_PASSWORD=TuPassword npx ts-node scripts/create-admin.ts
```

---

## 📝 Git

```bash
# Inicializar repositorio
git init

# Ver estado
git status

# Añadir todos los archivos
git add .

# Añadir archivo específico
git add nombre-archivo.tsx

# Commit
git commit -m "Mensaje descriptivo"

# Ver historial
git log
git log --oneline

# Conectar con GitHub
git remote add origin https://github.com/usuario/repo.git

# Subir cambios
git push

# Primera vez
git push -u origin main

# Descargar cambios
git pull

# Ver diferencias
git diff

# Crear rama
git branch nombre-rama

# Cambiar de rama
git checkout nombre-rama

# Crear y cambiar de rama
git checkout -b nombre-rama

# Ver ramas
git branch -a

# Eliminar rama
git branch -d nombre-rama
```

---

## ☁️ Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar (preview)
vercel

# Desplegar a producción
vercel --prod

# Ver logs en tiempo real
vercel logs

# Descargar variables de entorno
vercel env pull

# Ver dominios
vercel domains ls

# Añadir dominio personalizado
vercel domains add tu-dominio.com

# Ver proyectos
vercel ls

# Eliminar deployment
vercel rm nombre-deployment

# Ver información del proyecto
vercel inspect
```

---

## 🔧 TypeScript

```bash
# Verificar tipos
npx tsc --noEmit

# Ver configuración de TypeScript
npx tsc --showConfig
```

---

## 🎨 Tailwind CSS

```bash
# Generar archivo de configuración
npx tailwindcss init

# Generar archivo completo
npx tailwindcss init --full
```

---

## 🧪 Testing (Futuro)

```bash
# Instalar Jest
npm install -D jest @testing-library/react @testing-library/jest-dom

# Correr tests
npm test

# Correr tests en watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

---

## 📊 Análisis

```bash
# Ver tamaño del build
npm run build
# Luego ve a .next/analyze

# Analizar dependencias
npm ls
npm ls --depth=0

# Ver dependencias desactualizadas
npm outdated

# Ver vulnerabilidades
npm audit

# Arreglar vulnerabilidades
npm audit fix
```

---

## 🔍 Debugging

```bash
# Ver variables de entorno
node -e "console.log(process.env)"

# Verificar versión de Node
node -v

# Verificar versión de NPM
npm -v

# Limpiar caché de NPM
npm cache clean --force

# Verificar puerto en uso (Windows)
netstat -ano | findstr :3000

# Matar proceso en puerto (Windows PowerShell)
Stop-Process -Id PID_NUMBER -Force
```

---

## 🔄 Cron Jobs (Desarrollo Local)

```bash
# Procesar órdenes pendientes manualmente
curl http://localhost:3000/api/cron/process-orders

# Actualizar estados manualmente
curl http://localhost:3000/api/cron/update-statuses

# Con secret (si lo configuraste)
curl "http://localhost:3000/api/cron/process-orders?secret=TU_SECRET"
```

---

## 📦 Gestión de Archivos

```bash
# Ver tamaño de carpeta
du -sh node_modules/

# Contar archivos en carpeta
ls -1 | wc -l

# Buscar archivo por nombre
find . -name "nombre-archivo.tsx"

# Buscar texto en archivos
grep -r "texto-a-buscar" .

# Eliminar node_modules recursivamente
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
```

---

## 🔐 Seguridad

```bash
# Generar secret aleatorio para NextAuth
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# O con OpenSSL
openssl rand -base64 32

# Generar UUID
node -e "console.log(require('crypto').randomUUID())"
```

---

## 📝 Notas Rápidas

### Estructura de URLs
```
Frontend público:     https://tu-proyecto.vercel.app
Admin login:          https://tu-proyecto.vercel.app/admin/login
Admin dashboard:      https://tu-proyecto.vercel.app/admin
API public:           https://tu-proyecto.vercel.app/api/public/*
API admin:            https://tu-proyecto.vercel.app/api/admin/*
Cron:                 https://tu-proyecto.vercel.app/api/cron/*
```

### Variables de Entorno Requeridas
```
DATABASE_URL          → Vercel Postgres (auto)
NEXTAUTH_URL          → https://tu-proyecto.vercel.app
NEXTAUTH_SECRET       → Random string (genera uno)
ADMIN_EMAIL           → Email del admin
ADMIN_PASSWORD        → Password del admin
CRON_SECRET           → Random string (opcional)
```

### Puertos Comunes
```
3000  → Next.js dev server
5432  → PostgreSQL
```

### Extensiones VSCode Recomendadas
```
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- GitLens
- Error Lens
```

---

## 🆘 Comandos de Emergencia

```bash
# Si algo no funciona, prueba:

# 1. Limpiar todo
rm -rf node_modules .next
npm install
npm run dev

# 2. Regenerar Prisma
npx prisma generate
npx prisma db push

# 3. Verificar variables de entorno
cat .env

# 4. Ver logs de Vercel
vercel logs --follow

# 5. Reiniciar todo
pkill -f next-server
npm run dev
```

---

## 📚 Recursos Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Git Docs](https://git-scm.com/doc)

---

**¡Guarda este archivo para referencia rápida!** 📌
