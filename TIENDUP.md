# Tiendup — Integración de Pagos

## Estado: API Key obtenida, pendiente integración

**Última actualización:** 9 de mayo 2026

---

## Datos de acceso

- **API URL:** `https://pablo-usos.public-api.tiendup.com/`
- **API Key:** Guardada en Supabase Edge Functions (no commitear al repo)
- **Rate Limit:** 500 requests/minuto (RPM)

---

## Qué es Tiendup

Plataforma de venta online argentina. Permite vender:
- **Suscripciones** (lo que necesitamos para membresías N1/N2)
- Cursos online
- Eventos
- Archivos descargables
- Sesiones 1-a-1
- Productos físicos

**Sin comisiones por venta.** El dinero va directo a las cuentas de Pablo.

---

## Medios de pago soportados

### Automáticos (pasarelas integradas)
- **MercadoPago** — tarjeta, débito, efectivo (Rapipago/Pago Fácil)
- **Stripe** — tarjetas internacionales
- **PayPal** — pagos internacionales

### Manuales
- Transferencia bancaria
- Efectivo
- Otros métodos custom

---

## API — Lo que sabemos

### Autenticación
- API Key en header de cada request
- La key se genera desde el panel de Tiendup

### Variables de entorno necesarias

**En Supabase Edge Functions (Secrets):**
- `TIENDUP_API_KEY` — API key de Tiendup
- `TIENDUP_WEBHOOK_SECRET` — Secreto para verificar firma HMAC del webhook
- `TIENDUP_PRODUCT_N1_ID` — Product ID del plan N1 (para determinar nivel en webhook)
- `TIENDUP_PRODUCT_N2_ID` — Product ID del plan N2 (para determinar nivel en webhook)

**En Vercel (Environment Variables):**
- `VITE_TIENDUP_PRODUCT_N1` — Product ID del plan N1 (para checkout desde frontend)
- `VITE_TIENDUP_PRODUCT_N2` — Product ID del plan N2 (para checkout desde frontend)

### Endpoints disponibles
La documentación completa está en el panel de Tiendup (acceso con la API key).
Lo que necesitamos:

| Endpoint | Qué hace | Para qué lo usamos |
|---|---|---|
| `GET /products` | Listar productos/suscripciones | Mostrar planes N1/N2 en la app |
| `GET /products/:id` | Detalle de producto | Info del plan seleccionado |
| `POST /sales` | Crear venta/inscripción | Generar link de pago |
| `GET /sales/:id` | Estado de una venta | Verificar pago |
| `GET /subscribers` | Listar suscriptores | Ver quién es N1/N2 |
| `GET /subscribers/:email` | Buscar suscriptor | Verificar membresía activa |

### Rate Limit Headers
Cada respuesta incluye headers con el estado del límite:
```
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 499
X-RateLimit-Reset: <timestamp>
```

---

## Webhooks — Lo que necesitamos

Los webhooks notifican eventos en tiempo real. Configurar desde el panel de Tiendup.

### Eventos relevantes para MejoraApp

| Evento | Qué dispara | Acción en nuestra app |
|---|---|---|
| `sale.completed` | Venta confirmada | Actualizar `access_level` en `profiles` |
| `subscription.activated` | Suscripción activa | Cambiar N0 → N1 o N2 |
| `subscription.cancelled` | Suscripción cancelada | Cambiar N1/N2 → N0 |
| `subscription.expired` | Suscripción vencida | Cambiar N1/N2 → N0 |

### Seguridad del webhook
- Cada webhook tiene una **firma secreta** única
- Se incluye en el header `X-Tiendup-Signature`
- **Validar** que la firma coincida antes de procesar
- Rechazar requests sin firma válida

### URL del webhook
Necesitamos desplegar un Edge Function en Supabase que reciba los webhooks:
```
POST https://pwiduojwgkaoxxuautkp.supabase.co/functions/v1/tiendup-webhook
```

---

## Flujo de integración (plan)

### 1. Configurar productos en Tiendup
Pablo necesita crear en Tiendup:
- **Plan N1 (Básico)** — suscripción mensual/anual
- **Plan N2 (Premium)** — suscripción mensual/anual

### 2. Crear Edge Function: `tiendup-webhook`
```
supabase/functions/tiendup-webhook/index.ts
```
- Recibe POST de Tiendup
- Valida firma secreta
- Según el evento:
  - `sale.completed` → buscar usuario por email → actualizar `access_level`
  - `subscription.activated` → N0 → N1/N2
  - `subscription.cancelled/expired` → N1/N2 → N0
- Registrar en tabla `payments`

### 3. Crear Edge Function: `tiendup-checkout`
```
supabase/functions/tiendup-checkout/index.ts
```
- Recibe `product_id` y `user_id`
- Consulta API de Tiendup para obtener link de pago
- Retorna URL de checkout para abrir en browser

### 4. Integrar en la app
- `UpgradePrompt.tsx` → botón "Upgrade" abre link de Tiendup
- `MiPerfil.tsx` → mostrar estado de suscripción
- `AdminCobranza.tsx` → tabla de pagos desde Tiendup

### 5. Configurar webhook en Tiendup
- URL: Edge Function de Supabase
- Eventos: sale.completed, subscription.activated, subscription.cancelled, subscription.expired
- Firma secreta: guardar en Supabase Secrets

---

## Archivos a crear/modificar

| Archivo | Qué hace |
|---|---|
| `supabase/functions/tiendup-webhook/index.ts` | Recibe webhooks de Tiendup |
| `supabase/functions/tiendup-checkout/index.ts` | Genera link de pago |
| `src/services/tiendup.service.ts` | Cliente API para Tiendup |
| `src/components/UpgradePrompt.tsx` | Integrar link de pago real |
| `src/hooks/useSubscription.ts` | Hook para estado de suscripción |

---

## Próximos pasos (orden)

1. **Pablo:** Crear Plan N1 y N2 en el panel de Tiendup
2. **Pablo:** Copiar los product_ids y compartirlos
3. **CTO:** Crear Edge Function `tiendup-webhook`
4. **CTO:** Crear Edge Function `tiendup-checkout`
5. **CTO:** Crear `tiendup.service.ts`
6. **CTO:** Integrar en `UpgradePrompt.tsx`
7. **Pablo:** Configurar webhook en panel de Tiendup
8. **Test:** Flujo completo de compra → webhook → upgrade

---

## Notas

- La API key **nunca** debe commitearse al repo
- Guardar en Supabase Secrets: `TIENDUP_API_KEY`
- La firma secreta del webhook también en Supabase Secrets: `TIENDUP_WEBHOOK_SECRET`
- Rate limit: 500 RPM — suficiente para nuestro caso de uso
- El video de referencia: https://www.youtube.com/watch?v=HqPskHWavFE
