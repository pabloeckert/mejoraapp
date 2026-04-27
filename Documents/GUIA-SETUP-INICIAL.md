# Guía de Setup — Vercel + Email + Onboarding

## 1. Vercel (producción)

1. Ir a https://vercel.com → **Add New Project**
2. **Import Git Repository** → buscar `pabloeckert/MejoraApp` → Import
3. Vercel detecta Vite automáticamente. Configuración:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm ci`
4. **Environment Variables** (agregar las 3):
   - `VITE_SUPABASE_URL` = (tu URL de Supabase)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = (tu anon key)
   - `VITE_SUPABASE_PROJECT_ID` = (tu project ID)
5. **Deploy** → te da una URL tipo `mejoraapp-xxx.vercel.app`
6. **Dominio custom** (opcional): Settings → Domains → agregar `app.mejoraok.com`
   - Vercel te da los records DNS a configurar en Hostinger

**Resultado:** Cada push a `main` auto-deployea a Vercel.

---

## 2. Email transaccional (admin@mejoraok.com via Resend)

### 2.1 Crear cuenta Resend
1. Ir a https://resend.com → Sign Up (gratis: 3000 emails/mes)
2. Dashboard → **API Keys** → Create API Key → copiar

### 2.2 Verificar dominio
1. Resend Dashboard → **Domains** → Add Domain → `mejoraok.com`
2. Te da 3 records DNS (SPF, DKIM, DMARC) → agregar en Hostinger DNS:
   - **Hostinger** → hPanel → Dominios → DNS/Zona → agregar los records
3. Volver a Resend → Verify

### 2.3 Configurar en Supabase
1. Supabase Dashboard → Edge Functions → Secrets → agregar:
   - `RESEND_API_KEY` = (la API key de Resend)

### 2.4 Cambiar el email remitente
En `supabase/functions/send-onboarding-email/index.ts` línea 8:
```
const FROM_EMAIL = "MejoraApp <admin@mejoraok.com>";
```
(Actualmente dice `hola@mejoraok.com` — cambiar si querés usar admin@)

---

## 3. Onboarding Emails (ya implementado, falta activar)

### 3.1 Ejecutar migración SQL
1. Supabase Dashboard → SQL Editor
2. Copiar contenido de `Documents/MIGRACION-CRM-2026-04-25.sql` → NO, es este:
   `supabase/migrations/20260426000000_onboarding_emails.sql`
3. Ejecutar

### 3.2 Desplegar Edge Function
```bash
supabase functions deploy send-onboarding-email
```
(Requiere Supabase CLI configurado)

### 3.3 Configurar cron
Opción A — pg_cron (en Supabase SQL Editor):
```sql
SELECT cron.schedule(
  'onboarding-emails',
  '0 */6 * * *',  -- cada 6 horas
  $$SELECT net.http_post(
    url := 'https://TU-PROJECT.supabase.co/functions/v1/send-onboarding-email',
    headers := '{"Authorization": "Bearer TU-SERVICE-ROLE-KEY"}'::jsonb
  )$$
);
```

Opción B — GitHub Actions cron (alternativa sin pg_cron):
Ver workflow `onboarding-emails.yml` (lo creo si es necesario)

---

## Verificación Final

| Item | URL | Estado |
|------|-----|--------|
| GitHub Pages (preview) | https://pabloeckert.github.io/MejoraApp/ | ✅ Funcionando |
| Vercel (producción) | https://mejoraapp-xxx.vercel.app | ⏳ Pendiente conectar |
| App actual (Hostinger) | https://app.mejoraok.com | ✅ Funcionando |
| Email transaccional | admin@mejoraok.com | ⏳ Pendiente Resend |
| Onboarding emails | Edge Function | ⏳ Pendiente deploy |
