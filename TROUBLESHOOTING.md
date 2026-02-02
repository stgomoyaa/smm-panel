# 🐛 TROUBLESHOOTING - Solución de Problemas Comunes

## 🚨 Problemas durante Instalación

### Error: "Cannot find module 'X'"

**Síntomas:**
```
Error: Cannot find module 'next'
Error: Cannot find module 'prisma'
```

**Solución:**
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# O en Windows PowerShell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

---

### Error: "Prisma Client not generated"

**Síntomas:**
```
Error: @prisma/client did not initialize yet
```

**Solución:**
```bash
npx prisma generate
```

---

### Error: "Port 3000 already in use"

**Síntomas:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución Windows:**
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID con el número que viste)
taskkill /PID [PID] /F

# O usa otro puerto
PORT=3001 npm run dev
```

**Solución Mac/Linux:**
```bash
# Ver proceso
lsof -i :3000

# Matar proceso
kill -9 [PID]

# O usa otro puerto
PORT=3001 npm run dev
```

---

## 🗄️ Problemas con Base de Datos

### Error: "Can't reach database server"

**Síntomas:**
```
Error: Can't reach database server at `localhost:5432`
```

**Soluciones:**

**1. Verifica la URL de la base de datos:**
```bash
# En .env, asegúrate que DATABASE_URL sea correcta
cat .env | grep DATABASE_URL
```

**2. Si usas Vercel Postgres:**
```bash
# Descarga las variables de entorno de Vercel
vercel env pull .env.local

# Usa ese archivo
DATABASE_URL=$(cat .env.local | grep DATABASE_URL | cut -d '=' -f2-)
```

**3. Si usas PostgreSQL local:**
```bash
# Verifica que PostgreSQL esté corriendo
# Windows: Servicios → PostgreSQL
# Mac: brew services list
# Linux: systemctl status postgresql
```

---

### Error: "Schema does not match database"

**Síntomas:**
```
Error: The database schema is not in sync with your Prisma schema
```

**Solución:**
```bash
# Aplicar cambios del schema
npx prisma db push

# O crear migración
npx prisma migrate dev --name fix_schema
```

---

### Error: "Table 'users' doesn't exist"

**Síntomas:**
```
Error: Table 'smm_panel.users' doesn't exist
```

**Solución:**
```bash
# Crear todas las tablas
npx prisma db push

# Verificar que se crearon
npx prisma studio
```

---

## 🔐 Problemas de Autenticación

### Error: "No secret provided"

**Síntomas:**
```
Error: [next-auth][error][NO_SECRET]
```

**Solución:**
```bash
# Genera un secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Añádelo a .env
echo "NEXTAUTH_SECRET=tu-secret-generado" >> .env

# Reinicia el servidor
npm run dev
```

---

### No puedo iniciar sesión en admin

**Síntomas:**
- Credenciales incorrectas
- No existe usuario admin

**Solución:**
```bash
# Crear usuario admin
npx ts-node scripts/create-admin.ts

# O con credenciales personalizadas
ADMIN_EMAIL=tu@email.com ADMIN_PASSWORD=TuPassword npx ts-node scripts/create-admin.ts

# Verifica que se creó
npx prisma studio
# Ve a tabla 'users' y verifica que existe
```

---

### Error: "Session callback error"

**Síntomas:**
```
[next-auth][error][SESSION_ERROR]
```

**Solución:**
```bash
# Limpia las cookies del navegador
# Chrome: F12 → Application → Cookies → Eliminar todos

# Verifica NEXTAUTH_URL en .env
# Debe ser:
# Local: http://localhost:3000
# Producción: https://tu-proyecto.vercel.app
```

---

## 🔌 Problemas con API de Proveedores

### Error: "Failed to connect to provider"

**Síntomas:**
- Al añadir proveedor, dice "Failed to connect"

**Soluciones:**

**1. Verifica la URL:**
```
❌ https://1xpanel.com
❌ https://api.1xpanel.com
✅ https://api.1xpanel.com/api/v2
```

**2. Verifica la API Key:**
- Cópiala exactamente como está en el panel del proveedor
- Sin espacios al inicio o final
- Case-sensitive (respeta mayúsculas/minúsculas)

**3. Verifica que el proveedor esté activo:**
- Ve al panel del proveedor
- Verifica que tu cuenta esté activa
- Verifica que tengas balance

**4. Prueba manualmente:**
```bash
# Prueba la conexión con curl
curl -X POST "https://api.1xpanel.com/api/v2" \
  -d "key=TU_API_KEY&action=balance"

# Deberías ver:
# {"balance":"125.50","currency":"USD"}
```

---

### Error: "Not enough funds"

**Síntomas:**
- Órdenes fallan con error "Not enough funds"

**Solución:**
```
1. Ve al panel del proveedor (ej: 1xpanel.com)
2. Login con tu cuenta
3. Ve a "Add Funds" o "Deposit"
4. Recarga balance (mínimo $10-20 USD)
5. Espera 1-2 minutos
6. Reintenta la orden
```

---

### Error: "Incorrect service ID"

**Síntomas:**
- Orden falla con "Incorrect service ID"

**Solución:**
```bash
# Sincroniza de nuevo los servicios del proveedor
# Admin → Proveedores → Click "Sincronizar"

# O desde la base de datos:
# 1. Ve a Admin → Services
# 2. Elimina los servicios viejos
# 3. Sincroniza de nuevo
```

---

## ⏰ Problemas con Cron Jobs

### Las órdenes se quedan en "awaiting"

**Síntomas:**
- Órdenes nunca pasan de "awaiting" a "pending"

**Soluciones:**

**1. Verifica que el cron esté configurado:**
```bash
# Verifica que existe vercel.json
cat vercel.json
```

**2. En Vercel:**
```
1. Ve a tu proyecto en Vercel
2. Settings → Crons
3. Verifica que aparezcan los crons
4. Si no, haz push de vercel.json:
   git add vercel.json
   git commit -m "Add cron config"
   git push
```

**3. Prueba manualmente:**
```bash
# Local
curl http://localhost:3000/api/cron/process-orders

# Producción
curl "https://tu-proyecto.vercel.app/api/cron/process-orders?secret=TU_SECRET"
```

---

### Los estados no se actualizan

**Síntomas:**
- Órdenes se quedan en "pending" o "processing"
- Nunca llegan a "completed"

**Solución:**
```bash
# Prueba el cron de estados manualmente
curl "https://tu-proyecto.vercel.app/api/cron/update-statuses?secret=TU_SECRET"

# Verifica los logs en Vercel
vercel logs --follow

# Verifica que el proveedor responda correctamente
# Admin → Órdenes → Busca el apiOrderId
# Prueba manualmente en el panel del proveedor
```

---

## 🚀 Problemas en Vercel

### Error: "Build failed"

**Síntomas:**
```
Error: Build failed with exit code 1
```

**Soluciones:**

**1. Verifica que el build funcione localmente:**
```bash
npm run build

# Si falla localmente, arregla los errores primero
```

**2. Verifica las variables de entorno:**
```
Vercel → Settings → Environment Variables
Asegúrate que todas estén configuradas:
- DATABASE_URL (auto)
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- ADMIN_EMAIL
- ADMIN_PASSWORD
```

**3. Verifica los logs:**
```bash
vercel logs

# O desde la web: Vercel → Tu proyecto → Deployments → Click en el deployment → View Function Logs
```

---

### Error: "Database connection failed"

**Síntomas:**
```
Error: Can't reach database server
```

**Solución:**
```
1. Ve a Vercel → Storage
2. Verifica que la base de datos esté creada
3. Ve a Settings → Environment Variables
4. Verifica que DATABASE_URL esté configurada
5. Si no está, la base de datos no se conectó correctamente
6. Elimina y vuelve a crear la base de datos
```

---

### Error: "NextAuth configuration invalid"

**Síntomas:**
```
[next-auth][error] INVALID_CALLBACK_URL
```

**Solución:**
```
En Vercel → Settings → Environment Variables:

Asegúrate que NEXTAUTH_URL sea:
✅ https://tu-proyecto.vercel.app (sin / al final)
❌ http://tu-proyecto.vercel.app (debe ser https)
❌ https://tu-proyecto.vercel.app/ (sin / al final)
```

---

## 📱 Problemas en el Frontend

### Error: "Hydration failed"

**Síntomas:**
```
Error: Hydration failed because the initial UI does not match
```

**Solución:**
```bash
# Limpia .next y node_modules
rm -rf .next node_modules
npm install
npm run dev

# Verifica que no tengas:
# - console.log() que generen output diferente en servidor y cliente
# - Fechas formateadas diferente
# - Random values sin usar seed
```

---

### Los servicios no aparecen

**Síntomas:**
- Formulario vacío
- No hay servicios en el dropdown

**Solución:**
```
1. Ve a Admin → Proveedores
2. Click "Sincronizar" en tu proveedor
3. Espera a que termine
4. Ve a Admin → Servicios
5. Verifica que aparezcan servicios
6. Verifica que estén activos (status = true)
7. Recarga la página pública
```

---

### Formulario no envía la orden

**Síntomas:**
- Click en "Ordenar Ahora" no hace nada
- O muestra error genérico

**Solución:**
```
1. Abre DevTools (F12) → Console
2. Ve los errores específicos
3. Verifica que:
   - Seleccionaste categoría
   - Seleccionaste servicio
   - Ingresaste link válido
   - Ingresaste email válido
4. Verifica en Network tab que el request se envíe
```

---

## 🔍 Debugging General

### Ver logs en tiempo real

**Local:**
```bash
# El servidor ya muestra logs en la terminal
npm run dev
```

**Vercel:**
```bash
# Instala Vercel CLI
npm i -g vercel

# Login
vercel login

# Ver logs
vercel logs --follow

# Ver logs de una función específica
vercel logs --follow api/cron/process-orders
```

---

### Prisma Studio (Ver base de datos)

```bash
# Abrir GUI de la base de datos
npx prisma studio

# Abre http://localhost:5555
# Puedes ver y editar todos los datos
```

---

### Verificar variables de entorno

```bash
# Local
cat .env

# Vercel
vercel env ls

# Descargar de Vercel
vercel env pull .env.local
```

---

## 🆘 Último Recurso

Si nada funciona:

```bash
# 1. Elimina todo
rm -rf node_modules .next .vercel

# 2. Reinstala
npm install

# 3. Regenera Prisma
npx prisma generate

# 4. Aplica schema
npx prisma db push

# 5. Crea admin
npx ts-node scripts/create-admin.ts

# 6. Inicia de nuevo
npm run dev
```

---

## 📞 Obtener Ayuda

Si el problema persiste:

1. **Verifica los logs:**
   ```bash
   vercel logs --follow
   ```

2. **Revisa el código de error específico**
   - Copia el error completo
   - Búscalo en Google
   - Revisa GitHub Issues de las librerías

3. **Verifica la documentación:**
   - [Next.js Docs](https://nextjs.org/docs)
   - [Prisma Docs](https://www.prisma.io/docs)
   - [Vercel Docs](https://vercel.com/docs)
   - [NextAuth Docs](https://next-auth.js.org)

4. **Stack Overflow:**
   - Busca el error exacto
   - Incluye: "nextjs 14", "prisma", "vercel"

---

## ✅ Checklist de Diagnóstico

Cuando algo no funciona, verifica:

- [ ] ¿Instalaste las dependencias? (`npm install`)
- [ ] ¿Generaste Prisma? (`npx prisma generate`)
- [ ] ¿Aplicaste el schema? (`npx prisma db push`)
- [ ] ¿Creaste el admin? (`npx ts-node scripts/create-admin.ts`)
- [ ] ¿Configuraste .env correctamente?
- [ ] ¿El servidor está corriendo? (`npm run dev`)
- [ ] ¿La base de datos está activa?
- [ ] ¿Las variables de entorno están en Vercel?
- [ ] ¿Los cron jobs están configurados?
- [ ] ¿Hay errores en los logs de Vercel?

---

**La mayoría de problemas se resuelven limpiando y reinstalando. ¡No te rindas!** 💪
