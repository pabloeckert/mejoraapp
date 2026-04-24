# Guía VAPID Keys — Push Notifications

> Paso a paso para configurar las keys que permiten enviar push notifications desde MejoraApp.

---

## ¿Qué son las VAPID Keys?

VAPID (Voluntary Application Server Identification) es un mecanismo que permite al servidor enviar push notifications a los navegadores. Necesitás un par de claves:
- **Pública** — se comparte con el navegador (frontend)
- **Privada** — se queda en el servidor (Supabase Edge Functions)

---

## Paso 1: Generar las claves

### Opción A: Usando Node.js (recomendado)

1. Abrí una terminal
2. Ejecutá:
```bash
npx web-push generate-vapid-keys
```

3. Te va a mostrar algo así:
```
=======================================
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa34asdfghjklzxcvbnmqwertyuiop1234567890abc

Private Key:
abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcdefghijklmn
=======================================
```

4. **Copiá ambas claves** — las necesitás en los próximos pasos.

### Opción B: Online

1. Andá a https://vapidkeys.com/
2. Hacé click en "Generate"
3. Copiá la **Public Key** y la **Private Key**

---

## Paso 2: Configurar en Supabase (Backend)

1. Andá a tu proyecto en https://supabase.com/dashboard
2. Menú izquierdo → **Edge Functions** → **Secrets**
3. Agregá estos 3 secrets:

| Nombre del Secret | Valor |
|-------------------|-------|
| `VAPID_PUBLIC_KEY` | Tu clave pública (la del Paso 1) |
| `VAPID_PRIVATE_KEY` | Tu clave privada (la del Paso 1) |
| `VAPID_SUBJECT` | `mailto:pabloeckert@gmail.com` (o tu email) |

4. Hacé click en "Save" para cada uno

---

## Paso 3: Configurar en GitHub Secrets (CI/CD)

1. Andá a https://github.com/pabloeckert/MejoraApp/settings/secrets/actions
2. Hacé click en "New repository secret"
3. Agregá:

| Nombre del Secret | Valor |
|-------------------|-------|
| `VITE_VAPID_PUBLIC_KEY` | Tu clave pública (la misma del Paso 2) |

---

## Paso 4: Configurar en el entorno local (desarrollo)

1. Abrí el archivo `.env` en la raíz del proyecto
2. Agregá esta línea:
```
VITE_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa34asdfghjklzxcvbnmqwertyuiop1234567890abc
```

(reemplazando con tu clave pública real)

---

## Paso 5: Verificar

1. Hacé push a `main` (o esperá al próximo deploy)
2. Abrí https://app.mejoraok.com
3. Andá al header → hacé click en el ícono de notificación (campana)
4. Aceptá los permisos de notificación
5. Verificá en Supabase → Table Editor → `push_subscriptions` que se guardó la suscripción

---

## Notas importantes

- **La clave pública es pública** — se puede ver en el código del navegador, no es sensible
- **La clave privada es secreta** — nunca la compartas ni la pongas en el frontend
- **Si perdés las claves**, generá un par nuevo y actualizá los 3 secrets
- **El email en VAPID_SUBJECT** es para que los servicios de push puedan contactarte si hay problemas

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| "VAPID key not found" | Verificá que `VITE_VAPID_PUBLIC_KEY` esté en `.env` y GitHub Secrets |
| "Push subscription failed" | Verificá que los 3 secrets estén en Supabase Edge Functions → Secrets |
| No llegan notificaciones | Verificá que `send-push-notification` esté deployado y que la suscripción exista en la tabla |
| "Permission denied" | El usuario debe aceptar los permisos del navegador para notificaciones |
