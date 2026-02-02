# 🏗️ ARQUITECTURA DEL SISTEMA

## 📊 Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND PÚBLICO                              │
│                   (https://tu-app.vercel.app)                    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Formulario de Orden                                      │  │
│  │  - Seleccionar Categoría                                  │  │
│  │  - Seleccionar Servicio                                   │  │
│  │  - Ingresar Link (@username o URL)                        │  │
│  │  - Ingresar Email                                         │  │
│  │  - Click "Ordenar Ahora"                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /api/public/orders
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES                            │
│                    (Backend Serverless)                          │
│                                                                   │
│  /api/public/                                                    │
│  ├─ categories      → Listar categorías activas                 │
│  ├─ services        → Listar servicios por categoría            │
│  └─ orders          → Crear nueva orden                         │
│                                                                   │
│  /api/admin/                                                     │
│  ├─ providers       → CRUD proveedores SMM                      │
│  ├─ services        → CRUD servicios                            │
│  ├─ orders          → Listar órdenes                            │
│  └─ categories      → CRUD categorías                           │
│                                                                   │
│  /api/cron/                                                      │
│  ├─ process-orders  → Enviar órdenes pendientes a proveedor    │
│  └─ update-statuses → Actualizar estados desde proveedor       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Guardar en BD
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL POSTGRES                               │
│                    (Base de Datos)                               │
│                                                                   │
│  Tablas:                                                         │
│  ├─ users           → Usuarios admin                            │
│  ├─ api_providers   → Proveedores SMM (1xPanel, etc.)          │
│  ├─ categories      → Categorías de servicios                   │
│  ├─ services        → Servicios disponibles                     │
│  └─ orders          → Órdenes de clientes                       │
│                                                                   │
│  Orden creada:                                                   │
│  {                                                               │
│    orderId: "20260129ABC123",                                   │
│    status: "awaiting",          ← Esperando procesamiento       │
│    apiOrderId: null,            ← Aún no enviado                │
│    serviceName: "Seguidores IG",                                │
│    link: "@username",                                           │
│    quantity: 1000,                                              │
│    charge: 5000                                                 │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Cron Job (cada 1 min)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL CRON JOB                               │
│                    (Tareas Automáticas)                          │
│                                                                   │
│  Cron #1: /api/cron/process-orders (cada 1 minuto)             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. SELECT * FROM orders WHERE status='awaiting'            │ │
│  │ 2. Para cada orden:                                        │ │
│  │    - Obtener proveedor y API key                           │ │
│  │    - Enviar a API del proveedor                            │ │
│  │    - Actualizar orden con apiOrderId                       │ │
│  │    - Cambiar status a 'pending'                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Cron #2: /api/cron/update-statuses (cada 5 minutos)           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. SELECT * FROM orders WHERE status IN                   │ │
│  │    ('pending', 'processing', 'inprogress')                 │ │
│  │ 2. Agrupar por proveedor                                   │ │
│  │ 3. Consultar estados en batch                              │ │
│  │ 4. Actualizar cada orden con nuevo estado                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST API Request
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PROVEEDOR SMM                                 │
│              (1xPanel, CostPanel, etc.)                          │
│                                                                   │
│  POST https://api.1xpanel.com/api/v2                            │
│  Body: key=XXX&action=add&service=6&link=@user&quantity=1000   │
│                                                                   │
│  Respuesta:                                                      │
│  {                                                               │
│    "order": "12345678"        ← ID en el proveedor              │
│  }                                                               │
│                                                                   │
│  O error:                                                        │
│  {                                                               │
│    "error": "Not enough funds"                                  │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Guardar respuesta
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                                 │
│                    (Orden actualizada)                           │
│                                                                   │
│  {                                                               │
│    orderId: "20260129ABC123",                                   │
│    status: "pending",           ← Estado actualizado            │
│    apiOrderId: "12345678",      ← ID del proveedor guardado     │
│    statusApi: "Pending",                                        │
│    ...                                                           │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Proveedor procesa (5-60 min)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PROVEEDOR SMM                                 │
│                    (Procesando orden)                            │
│                                                                   │
│  Entregando servicio:                                            │
│  - 1000 seguidores a @username                                  │
│  - Entrega gradual en 5-30 minutos                              │
│  - Estado: "In progress" → "Completed"                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Cron verifica estado (cada 5 min)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CRON UPDATE STATUS                            │
│                                                                   │
│  POST https://api.1xpanel.com/api/v2                            │
│  Body: key=XXX&action=status&orders=12345678                    │
│                                                                   │
│  Respuesta:                                                      │
│  {                                                               │
│    "12345678": {                                                │
│      "status": "Completed",       ← Orden completada            │
│      "charge": "0.75",                                          │
│      "start_count": "1000",                                     │
│      "remains": "0",              ← Todo entregado              │
│      "currency": "USD"                                          │
│    }                                                             │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Actualizar en BD
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                                 │
│                    (Orden finalizada)                            │
│                                                                   │
│  {                                                               │
│    orderId: "20260129ABC123",                                   │
│    status: "completed",         ← ✅ COMPLETADO                 │
│    statusApi: "Completed",                                      │
│    startCounter: 1000,                                          │
│    remains: 0,                                                  │
│    ...                                                           │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Cliente puede verificar
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL                                   │
│              (https://tu-app.vercel.app/admin)                   │
│                                                                   │
│  Dashboard:                                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Órdenes                                                     │ │
│  │ ├─ 20260129ABC123  | @username  | ✅ Completado           │ │
│  │ ├─ 20260129DEF456  | @user2     | 🔄 En Progreso         │ │
│  │ └─ 20260129GHI789  | @user3     | ⏳ Pendiente           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Estados de una Orden

```
CLIENTE HACE ORDEN
       ↓
[awaiting]           → Orden creada, esperando ser enviada
       ↓
[pending]            → Enviada al proveedor, esperando inicio
       ↓
[processing]         → Proveedor comenzó a procesar
       ↓
[inprogress]         → Entrega en progreso (ej: 500/1000)
       ↓
[completed] ✅       → Todo entregado exitosamente
```

**Otros estados posibles:**
- `[partial]` → Entregado parcialmente (ej: solo 700/1000)
- `[canceled]` → Cancelado por el proveedor
- `[refunded]` → Reembolsado
- `[error]` → Error en el proceso

---

## 🔐 Autenticación

```
Admin accede a /admin/login
       ↓
NextAuth.js verifica credenciales
       ↓
Compara con usuario en BD (bcrypt)
       ↓
Genera JWT token
       ↓
Guarda en cookie
       ↓
Admin accede a rutas protegidas
```

---

## 💾 Estructura de Base de Datos

```
users
├─ id
├─ email (único)
├─ password (hashed con bcrypt)
├─ name
├─ role (admin)
└─ status (activo/inactivo)

api_providers
├─ id
├─ name (ej: "1x Panel")
├─ url (ej: "https://api.1xpanel.com/api/v2")
├─ apiKey (ej: "abc123xyz789")
├─ balance (ej: 125.50)
├─ currency (USD)
└─ status

categories
├─ id
├─ name (ej: "Instagram")
├─ slug (ej: "instagram")
├─ icon (ej: "📸")
└─ status

services
├─ id
├─ serviceId (público: "sf123456")
├─ categoryId → categories.id
├─ apiProviderId → api_providers.id
├─ apiServiceId (ID en proveedor: "6")
├─ name (ej: "Seguidores Instagram")
├─ price (ej: 5000)
├─ originalPrice (ej: 6000)
├─ discountValue (ej: 20%)
├─ min (ej: 100)
├─ max (ej: 100000)
├─ apiProviderPrice (ej: 0.75 por 1000)
└─ status

orders
├─ id
├─ orderId (público: "20260129ABC123")
├─ email
├─ serviceId → services.id
├─ apiProviderId → api_providers.id
├─ apiServiceId (ID en proveedor)
├─ apiOrderId (ID devuelto por proveedor: "12345678")
├─ link (ej: "@username")
├─ quantity (ej: 1000)
├─ charge (ej: 5000)
├─ status (awaiting, pending, completed, etc.)
├─ statusApi (estado del proveedor)
├─ startCounter
├─ remains
└─ createdAt, updatedAt
```

---

## 📡 Endpoints de API

### Públicos (sin autenticación)
```
GET  /api/public/categories              → Listar categorías
GET  /api/public/services?categoryId=X   → Listar servicios
POST /api/public/orders                  → Crear orden
GET  /api/public/orders/:orderId         → Ver estado de orden
```

### Admin (requiere autenticación)
```
GET    /api/admin/providers              → Listar proveedores
POST   /api/admin/providers              → Crear proveedor
PATCH  /api/admin/providers/:id          → Actualizar proveedor
DELETE /api/admin/providers/:id          → Eliminar proveedor
POST   /api/admin/providers/:id/sync     → Sincronizar servicios

GET    /api/admin/services               → Listar servicios
PATCH  /api/admin/services/:id           → Actualizar servicio
DELETE /api/admin/services/:id           → Eliminar servicio

GET    /api/admin/orders                 → Listar órdenes
GET    /api/admin/categories             → Listar categorías
POST   /api/admin/categories             → Crear categoría
```

### Cron (requiere secret)
```
GET /api/cron/process-orders?secret=X    → Procesar órdenes pendientes
GET /api/cron/update-statuses?secret=X   → Actualizar estados
```

---

## 🎨 Componentes de Frontend

```
app/
├─ page.tsx                    → Formulario público
├─ layout.tsx                  → Layout principal
├─ globals.css                 → Estilos globales
│
└─ admin/
   ├─ layout.tsx               → Layout admin (sidebar)
   ├─ page.tsx                 → Dashboard
   ├─ login/page.tsx           → Login
   ├─ providers/page.tsx       → Gestión proveedores
   ├─ services/page.tsx        → Gestión servicios
   └─ orders/page.tsx          → Gestión órdenes
```

---

## 🚀 Deploy en Vercel

```
Código Local (Git)
       ↓
GitHub Repository
       ↓
Vercel (conecta automáticamente)
       ↓
Build (next build)
       ↓
Deploy a Edge Network
       ↓
URLs:
- https://tu-proyecto.vercel.app (producción)
- https://tu-proyecto-git-rama.vercel.app (preview)
```

**Cuando haces push a GitHub:**
1. Vercel detecta cambios automáticamente
2. Hace build del proyecto
3. Despliega en < 1 minuto
4. URL actualizada

---

## 💡 Flujo de Datos Completo

```
1. Cliente → Formulario
2. Next.js API → Valida datos
3. Prisma → Guarda en PostgreSQL
4. Vercel Cron → Detecta orden nueva
5. Next.js API → Llama a proveedor SMM
6. Proveedor → Procesa servicio
7. Vercel Cron → Consulta estado
8. Prisma → Actualiza BD
9. Admin → Ve orden completada
10. Cliente → Recibe servicio en Instagram
```

---

## 🔒 Seguridad

- ✅ Passwords hasheados con bcrypt
- ✅ JWT tokens para sesiones
- ✅ API Keys nunca expuestas al cliente
- ✅ Variables de entorno seguras
- ✅ Validación de datos en servidor
- ✅ Rate limiting (Vercel)
- ✅ HTTPS automático (Vercel)

---

## 📊 Performance

- ⚡ Edge Functions (respuesta < 100ms)
- ⚡ Static Generation donde sea posible
- ⚡ API Routes optimizadas
- ⚡ Batch queries a proveedores
- ⚡ Caching de servicios
- ⚡ CDN global (Vercel)

---

**Este es el sistema completo funcionando 24/7 de manera automática.** 🚀
