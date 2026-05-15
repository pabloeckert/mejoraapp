# MEJORAAPP — Documento maestro

## Sesión 2026-05-15

### Tareas completadas

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Design system de marca (`src/lib/brand.ts` + `tailwind.config.ts`) | ✅ |
| 2 | Hook `useMembership` tipado | ✅ |
| 3 | Componentes: `MembershipBadge`, `ContentGate`, `UpgradeModal` | ✅ |
| 4 | Migración SQL: `membership_level`, `tiendup_sync_log`, `membership_activations` | ✅ |
| 5 | Edge Function: `sync-tiendup` | ✅ |
| 6 | Edge Function: `activate-membership-manual` | ✅ |
| 7 | UX/UI refactor: Splash, Home, Muro (gating N0), Círculo Dorado (VIP N2) | ✅ |
| 8 | Admin: activación manual + Sync Tiendup en `AdminUsuarios` | ✅ |
| 9 | Deploy: `vercel.json` conservado (mejor que spec), `deploy.yml` + Tiendup secrets | ✅ |

### Estado de tests

**276 / 276 passing** (15 archivos de test)

### URL del deploy

Producción: https://app.mejoraok.com (Vercel, auto-deploy desde main)

### Campos reales de Tiendup API

La app aún no tiene suscripciones activas. Cuando lleguen, la Edge Function `sync-tiendup` logueará:
```
console.log("[sync-tiendup] Primer objeto:", JSON.stringify(subscriptions[0]))
```
Revisar Supabase Edge Function logs para ver la estructura real.

### Arquitectura de membresías implementada

```
Niveles: n0 (free) → n1 (Miembro $50k ARS) → n2 (Círculo $150k ARS) → admin
Fuente de verdad: profiles.access_level (existente, mayúsculas N0/N1/N2/ADMIN)
Columna nueva: profiles.membership_level (minúsculas, se activa al aplicar migración)
Sync: sync-tiendup Edge Function (cron o user-triggered)
Activación manual: activate-membership-manual Edge Function (admin only)
```

### Pendientes para la próxima sesión

1. **Aplicar migración en Supabase**: `supabase db push` o ejecutar `20260515120000_membership_tiendup.sql` en el panel SQL
2. **Deploy Edge Functions**: `supabase functions deploy sync-tiendup` y `supabase functions deploy activate-membership-manual`
3. **Secrets en Supabase**: agregar `TIENDUP_API_KEY`, `CRON_SECRET`, `APP_URL`
4. **Secrets en GitHub**: agregar `VITE_TIENDUP_N1_URL`, `VITE_TIENDUP_N2_URL`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
5. **Vercel project**: conectar repo, configurar dominio `app.mejoraok.com`
6. **Cron job de Tiendup**: crear cron en Supabase o GitHub Actions que llame a `sync-tiendup` cada 6h con header `x-cron-secret`
7. **Campo `membership_level`**: una vez aplicada la migración, agregar a `useProfile`'s select query y actualizar `useMembership` para leerlo directamente
8. **Novedades recientes en Home**: implementar sección con scroll horizontal snap
9. **Quick Actions N1/N2**: revisar con Pablo si las acciones de cada nivel son las correctas
10. **Botón "Verificar membresía"** en perfil: llamar a `sync-tiendup` para el usuario actual

### Pasos manuales para completar el deploy (para Pablo)

#### 1. Supabase — Migración y Edge Functions
```bash
# Aplicar migración
supabase db push

# Deployar Edge Functions
supabase functions deploy sync-tiendup
supabase functions deploy activate-membership-manual

# Agregar secrets
supabase secrets set TIENDUP_API_KEY=tu_api_key_real
supabase secrets set CRON_SECRET=$(openssl rand -hex 32)
supabase secrets set APP_URL=https://app.mejoraok.com
```

#### 2. Vercel — Setup inicial
1. Ir a https://vercel.com/new
2. Importar repo `pabloeckert/MejoraApp`
3. Framework preset: Vite (auto-detectado)
4. Agregar variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_TIENDUP_N1_URL`
   - `VITE_TIENDUP_N2_URL`
5. Conectar dominio `app.mejoraok.com` en Settings → Domains

#### 3. GitHub Secrets — Para el CI/CD
Ir a repo → Settings → Secrets → New repository secret:
- `VERCEL_TOKEN` — obtenés en vercel.com/account/tokens
- `VERCEL_ORG_ID` — en vercel.com/account (o `.vercel/project.json` después del primer deploy)
- `VERCEL_PROJECT_ID` — idem
- `VITE_TIENDUP_N1_URL` — URL de checkout N1
- `VITE_TIENDUP_N2_URL` — URL de checkout N2

#### 4. `.env.local` — Para desarrollo local
Reemplazar los placeholders en `.env.local` con valores reales (ya está en `.gitignore`).
