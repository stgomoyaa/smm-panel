# 🔌 PROVEEDORES SMM COMPATIBLES

Este sistema es compatible con cualquier proveedor SMM que use la **API estándar**.

## ✅ Proveedores Recomendados

### 1. **1xPanel**
- 🌐 Website: [1xpanel.com](https://1xpanel.com)
- 💰 Precio mínimo: $10 USD
- ⚡ Velocidad: Rápida
- 📊 Servicios: 1000+
- 🔑 API: Sí (estándar)

### 2. **CostPanel**
- 🌐 Website: [costpanel.com](https://costpanel.com)
- 💰 Precio mínimo: $5 USD
- ⚡ Velocidad: Media
- 📊 Servicios: 500+
- 🔑 API: Sí (estándar)

### 3. **SMM Heaven**
- 🌐 Website: [smmheaven.com](https://smmheaven.com)
- 💰 Precio mínimo: $10 USD
- ⚡ Velocidad: Rápida
- 📊 Servicios: 800+
- 🔑 API: Sí (estándar)

### 4. **JustAnotherPanel**
- 🌐 Website: [justanotherpanel.com](https://justanotherpanel.com)
- 💰 Precio mínimo: $10 USD
- ⚡ Velocidad: Muy rápida
- 📊 Servicios: 2000+
- 🔑 API: Sí (estándar)

---

## 📋 Cómo Registrarse en un Proveedor

### Paso 1: Registro
1. Ve al sitio web del proveedor
2. Click "Sign Up" o "Register"
3. Completa el formulario:
   - Email
   - Password
   - Nombre (opcional)
4. Confirma tu email

### Paso 2: Recargar Balance
1. Login en el panel
2. Ve a "Add Funds" o "Deposit"
3. Elige método de pago:
   - PayPal
   - Credit Card
   - Bitcoin
   - Otros
4. Recarga mínimo $10-20 USD para empezar

### Paso 3: Obtener API Key
1. Ve a "API" o "API Settings"
2. Encuentra tu API Key (algo como: `abc123xyz789def456`)
3. Copia la API URL (ej: `https://api.1xpanel.com/api/v2`)
4. **¡Guárdalos! Los necesitarás para configurar tu panel**

---

## 🔑 Formato de API Estándar

Los proveedores compatibles deben soportar estos endpoints:

### **1. Obtener Servicios**
```
POST https://api.proveedor.com/v2
key=TU_API_KEY&action=services
```

Respuesta:
```json
[
  {
    "service": "6",
    "name": "Instagram Followers [Real]",
    "type": "default",
    "rate": "0.75",
    "min": "100",
    "max": "100000",
    "category": "Instagram"
  }
]
```

### **2. Crear Orden**
```
POST https://api.proveedor.com/v2
key=TU_API_KEY&action=add&service=6&link=@username&quantity=1000
```

Respuesta:
```json
{
  "order": "12345678"
}
```

### **3. Verificar Estado**
```
POST https://api.proveedor.com/v2
key=TU_API_KEY&action=status&order=12345678
```

Respuesta:
```json
{
  "charge": "0.75",
  "start_count": "1000",
  "status": "Completed",
  "remains": "0",
  "currency": "USD"
}
```

### **4. Obtener Balance**
```
POST https://api.proveedor.com/v2
key=TU_API_KEY&action=balance
```

Respuesta:
```json
{
  "balance": "125.50",
  "currency": "USD"
}
```

---

## ⚠️ Advertencias Importantes

### ❌ NO uses proveedores que:
- No tengan API
- Requieran captcha manual
- Sean muy baratos (pueden ser scam)
- No tengan soporte
- Tengan mala reputación

### ✅ SÍ usa proveedores que:
- Tengan API documentada
- Tengan buen soporte
- Tengan buenas reviews
- Tengan múltiples métodos de pago
- Tengan servicios de calidad

---

## 💡 Tips para Elegir Proveedor

1. **Empieza pequeño**: Recarga $10-20 para probar
2. **Prueba varios**: Cada proveedor tiene diferentes servicios
3. **Compara precios**: Algunos son más baratos que otros
4. **Verifica calidad**: No todos los servicios son iguales
5. **Lee reviews**: Busca en Google opiniones del proveedor

---

## 🔧 Configuración en tu Panel

Una vez tengas tu proveedor:

1. Ve a tu admin: `https://tu-proyecto.vercel.app/admin`
2. Click "Proveedores" → "Añadir Proveedor"
3. Ingresa:
   - **Nombre**: Nombre descriptivo (ej: "1xPanel - Principal")
   - **URL**: URL de la API (ej: `https://api.1xpanel.com/api/v2`)
   - **API Key**: Tu API key del proveedor
4. Click "Añadir"
5. Si la conexión es exitosa, verás el balance del proveedor
6. Click "Sincronizar" para importar todos los servicios

---

## 📊 Múltiples Proveedores

Puedes añadir varios proveedores y el sistema:
- ✅ Los gestiona todos simultáneamente
- ✅ Cada servicio sabe de qué proveedor viene
- ✅ Puedes tener el mismo servicio de varios proveedores
- ✅ Si uno falla, puedes cambiar al otro

**Ejemplo de uso:**
- Proveedor A: Instagram (más barato)
- Proveedor B: TikTok (mejor calidad)
- Proveedor C: YouTube (más rápido)

---

## 🆘 Problemas Comunes

### "Failed to connect to provider"
- ✅ Verifica la URL (debe incluir `/api/v2` o similar)
- ✅ Verifica la API Key (cópiala exactamente)
- ✅ Verifica que el proveedor esté activo
- ✅ Verifica tu conexión a internet

### "Not enough funds"
- ✅ Recarga balance en el proveedor
- ✅ El sistema necesita fondos para comprar servicios

### "Incorrect service ID"
- ✅ Sincroniza de nuevo los servicios
- ✅ El proveedor pudo haber cambiado IDs

---

## 📞 Soporte del Proveedor

Cada proveedor tiene su propio soporte:
- Email
- Telegram
- Ticket system
- Live chat

**Contacta al proveedor si:**
- Tu API Key no funciona
- Tienes problemas con una orden
- Necesitas reembolso
- Tienes dudas sobre servicios

---

## 🎯 Recomendación Final

**Para empezar:**
1. Regístrate en **1xPanel** o **JustAnotherPanel**
2. Recarga $20 USD
3. Obtén tu API Key
4. Configúralo en tu panel
5. Sincroniza servicios
6. ¡Haz tu primera orden!

**Después:**
- Añade más proveedores según necesites
- Compara precios y calidad
- Optimiza tus márgenes de ganancia

---

¡Éxito con tu panel! 🚀
