# ⏰ CONFIGURACIÓN DE CRON JOBS

## 🎯 Problema

Vercel Free (Hobby) solo permite cron jobs que se ejecuten **1 vez al día máximo**.

Nuestro sistema necesita:
- Procesar órdenes: Cada 1 minuto
- Actualizar estados: Cada 5 minutos

---

## ✅ SOLUCIÓN: Usar Hostinger Cron Jobs

Ya que tienes Hostinger, usa sus cron jobs gratuitos.

---

## 📋 Configuración en Hostinger

### Paso 1: Acceder a Cron Jobs

1. Login en **Hostinger**
2. Ve a **hPanel**
3. **Avanzado** → **Cron Jobs**

### Paso 2: Crear Cron Job #1 - Procesar Órdenes

**Configuración:**
- **Tipo de tarea:** Comando
- **Comando:**
  ```bash
  curl -X GET "https://tu-proyecto.vercel.app/api/cron/process-orders?secret=TU_CRON_SECRET"
  ```
- **Frecuencia:** Cada minuto
  - Minuto: `*`
  - Hora: `*`
  - Día: `*`
  - Mes: `*`
  - Día de la semana: `*`

O expresión completa:
```
* * * * *
```

### Paso 3: Crear Cron Job #2 - Actualizar Estados

**Configuración:**
- **Tipo de tarea:** Comando
- **Comando:**
  ```bash
  curl -X GET "https://tu-proyecto.vercel.app/api/cron/update-statuses?secret=TU_CRON_SECRET"
  ```
- **Frecuencia:** Cada 5 minutos
  - Minuto: `*/5`
  - Hora: `*`
  - Día: `*`
  - Mes: `*`
  - Día de la semana: `*`

O expresión completa:
```
*/5 * * * *
```

---

## 🔐 Configurar CRON_SECRET

1. En Vercel → Settings → Environment Variables
2. Añade:
   ```
   CRON_SECRET=un-secret-aleatorio-muy-seguro-123
   ```

3. Usa ese mismo secret en tus comandos de Hostinger

**Genera un secret seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ OPCIÓN ALTERNATIVA: Servicios Externos Gratuitos

Si no quieres usar Hostinger, usa estos servicios:

### 1. **EasyCron** (Gratis)
- Web: https://www.easycron.com
- Plan Free: 1 cron job
- Frecuencia: Cada 1 minuto

### 2. **Cron-Job.org** (Gratis)
- Web: https://cron-job.org
- Plan Free: Ilimitados
- Frecuencia: Cada 1 minuto

### 3. **UptimeRobot** (Gratis)
- Web: https://uptimerobot.com
- Plan Free: 50 monitores
- Frecuencia: Cada 5 minutos

**Configuración:**
1. Crea cuenta
2. Añade URL: `https://tu-proyecto.vercel.app/api/cron/process-orders?secret=XXX`
3. Selecciona frecuencia: 1 minuto
4. Repite para el otro endpoint

---

## 📊 Comparación de Opciones

| Opción | Gratis | Frecuencia | Límite |
|--------|--------|------------|--------|
| **Hostinger Cron** | ✅ | Cada 1 min | Ilimitado* |
| **EasyCron** | ✅ | Cada 1 min | 1 cron job |
| **Cron-Job.org** | ✅ | Cada 1 min | Ilimitado |
| **UptimeRobot** | ✅ | Cada 5 min | 50 monitores |
| **Vercel Free** | ✅ | 1 vez/día | 1 cron job |
| **Vercel Pro** | ❌ $20/mes | Cualquiera | Ilimitado |

*Según el plan de Hostinger que tengas

---

## 🎯 Recomendación

**Usa Hostinger** si ya lo tienes. Es gratis y funciona perfecto.

**Pasos:**
1. Configura los 2 cron jobs en Hostinger
2. Elimina/comenta `vercel.json` (ya no se necesita)
3. Añade `CRON_SECRET` en Vercel
4. ¡Listo!

---

## 🧪 Probar que Funciona

### Manualmente:
```bash
# Probar proceso de órdenes
curl "https://tu-proyecto.vercel.app/api/cron/process-orders?secret=TU_SECRET"

# Probar actualización de estados
curl "https://tu-proyecto.vercel.app/api/cron/update-statuses?secret=TU_SECRET"
```

### Ver logs:
```bash
vercel logs --follow
```

Deberías ver:
```
[process-orders] Successfully processed X orders
[update-statuses] Successfully updated X orders
```

---

## ⚠️ Importante

### Si NO tienes CRON_SECRET configurado:

Las APIs seguirán funcionando, pero **cualquiera** podría llamarlas.

**Recomendado:** Siempre usa CRON_SECRET en producción.

---

## 📖 Documentación

- [Hostinger Cron Jobs](https://support.hostinger.com/en/articles/1583289-how-to-set-up-a-cron-job)
- [Crontab.guru](https://crontab.guru) - Verificar expresiones cron
- [EasyCron Docs](https://www.easycron.com/user)

---

## 🎉 ¡Listo!

Con Hostinger puedes tener cron jobs cada 1 minuto sin pagar nada extra.

**¿Necesitas ayuda configurando en Hostinger? Te puedo guiar paso a paso.**
