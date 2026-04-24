# SESSION-PROMPT.md — Prompt para Próxima Sesión

> ⚠️ **ADVERTENCIA PARA EL ASISTENTE:** Este archivo es tu punto de partida.
> **LEER ESTE ARCHIVO PRIMERO** antes de hacer cualquier cosa.
> Contiene el contexto exacto del proyecto, el estado actual y las instrucciones para continuar.
> **NO inventes ni asumas** — si algo no está acá, preguntá.

---

## 🚀 Instrucciones de Inicio

1. **Leer este archivo completo**
2. **Leer** `Documents/MEJORAAPP.md` — fuente única de verdad del proyecto
3. **Leer** `SOUL.md` y `AGENTS.md` — quién soy y cómo trabajo
4. **Leer** `memory/` (si existe) — notas de sesiones anteriores
5. **Clonar o verificar** el repo: `https://github.com/pabloeckert/MejoraApp`
6. **Confirmar con el usuario** qué quiere hacer antes de arrancar

---

## 📋 Estado del Proyecto (2026-04-24 20:37 GMT+8)

**Proyecto:** MejoraApp — Comunidad de Líderes Empresariales
**Stack:** React 18 · TypeScript · Vite 5 · Supabase · Tailwind CSS · shadcn/ui
**Producción:** https://app.mejoraok.com
**Repo:** https://github.com/pabloeckert/MejoraApp
**Branch principal:** `main` (deploy automático via GitHub Actions → FTP → Hostinger)

### Etapas

| Etapa | Nombre | Estado |
|-------|--------|--------|
| E1 | Seguridad y Estabilización | ✅ Completa (6/6) |
| E2 | Arquitectura y DevOps | ✅ Completa (6/6) |
| E3 | Experiencia de Usuario | ✅ Completa (6/6) |
| E4 | Analytics y Retención | ✅ Completa (4/4 sprints) |
| E5 | Calidad y Robustez | ⏳ 1/3 sprints completados |
| E6 | Escalamiento | 🔴 No iniciada |

### E4 — Estado por Sprint

| Sprint | Estado | Items |
|--------|--------|-------|
| 4.1 Analytics | ✅ Completo | PostHog integrado, 25+ eventos, lib/analytics.ts |
| 4.2 Retención | ✅ Completo | Web Push (lib/push.ts), Email Resend, Badges, Toast |
| 4.3 Engagement | ✅ Completo | 8 badges + triggers automáticos, Ranking comunidad, Perfil completo, Contenido programado |
| 4.4 Funnel | ✅ Completo | Servicios separados, CTA consultoría con tracking, Recomendaciones contenido, PDF export, Dashboards PostHog |

### E5 — Items Pendientes

- 5.1 Tests E2E con Playwright
- 5.2 Tests de accesibilidad (axe-core)
- 5.3 Refactorizar Muro.tsx (14 useState → useReducer)
- 5.4 Typography scale definida
- 5.5 Scroll position preservation al cambiar tab
- 5.6 Editorial style guide (voseo consistente)
- 5.7 SEO básico (meta tags, Open Graph)
- 5.8 Sentry integration (ya hecho en E2.6, pero falta test E2E)

---

## 📦 Qué se Implementó en la Sesión Anterior

### E2 — DevOps (cerrado)
- **Sentry:** `src/lib/sentry.ts` — init, user tracking, ErrorBoundary, breadcrumbs
- **Staging:** `.env.staging.example` + `deploy-staging.yml` + `build:staging`

### E4.1 — Analytics
- **PostHog:** `src/lib/analytics.ts` — 25+ eventos (auth, muro, diagnóstico, contenido, onboarding, profile, navigation)
- Integrado en: AuthContext, LoginForm, SignupForm, Auth page, Muro, ContenidoDeValor, DiagnosticTest, Onboarding, ProfileCompleteModal, Index

### E4.2 — Retención
- **Web Push:** `src/lib/push.ts` + SW push handler + `NotificationToggle` en header
- **Edge Function:** `send-push-notification` (acciones: new_post, reply, new_novedad)
- **Email:** Edge Function `send-diagnostic-email` vía Resend (perfil + puntaje + recomendación)
- **Badges:** `hooks/useLastVisit.ts` — dot badge rojo en tabs con contenido nuevo
- **Toast:** Muro.tsx — notificación real-time cuando alguien responde tu post

### Archivos Creados/Modificados

```
Nuevos:
  src/lib/analytics.ts          — módulo PostHog completo
  src/lib/sentry.ts             — módulo Sentry
  src/lib/push.ts               — módulo Web Push
  src/hooks/useLastVisit.ts     — hook badges "nueva visita"
  src/components/NotificationToggle.tsx — toggle notificaciones
  .env.staging.example          — template staging
  .github/workflows/deploy-staging.yml — workflow staging
  Documents/PUSH_SUBSCRIPTIONS.sql — tabla + RLS
  supabase/functions/send-push-notification/index.ts
  supabase/functions/send-diagnostic-email/index.ts

Modificados:
  src/main.tsx                  — init sentry + analytics
  src/contexts/AuthContext.tsx   — sentry user + analytics identify
  src/components/ErrorBoundary.tsx — sentry capture
  src/components/auth/LoginForm.tsx — trackLogin
  src/components/auth/SignupForm.tsx — trackSignup
  src/pages/Auth.tsx            — trackLogin google
  src/components/tabs/Muro.tsx  — publish/like/comment/delete + toast real-time
  src/components/tabs/ContenidoDeValor.tsx — view/search/filter
  src/components/DiagnosticTest.tsx — start/complete/share + email trigger
  src/components/Onboarding.tsx — complete/skip
  src/components/ProfileCompleteModal.tsx — complete/skip
  src/components/BottomNav.tsx  — badges visuales
  src/components/AppHeader.tsx  — notification toggle
  src/pages/Index.tsx           — pageview + tab switch + badges
  src/integrations/supabase/types.ts — push_subscriptions type
  package.json                  — +posthog-js, +@sentry/react
  .env.example                  — VAPID + Resend vars
```

---

## 🔑 Credenciales y Acceso

- **GitHub Token:** El usuario tiene un PAT configurado. Pedirlo si se necesita hacer push.
- **Supabase:** Las credenciales están en `.env` (no visible en repo).
- **Deploy:** Push a `main` → GitHub Actions → FTP automático a Hostinger.
- **Rollback:** Workflow `rollback.yml` con commit SHA.

---

## ⚠️ Reglas de la Sesión

1. **Leer `Documents/MEJORAAPP.md`** antes de hacer cualquier cambio — es la fuente de verdad.
2. **Cuando el usuario diga "documentar"** — actualizar MEJORAAPP.md con lo hecho y pushear.
3. **Al culminar cada sprint** — pushear y verificar que deploye en vivo.
4. **No crear archivos sueltos** — todo va en la estructura existente.
5. **103 tests deben seguir pasando** — `npm run test` después de cada cambio significativo.
6. **Build debe pasar** — `npm run build` antes de cada push.
7. **No tocar `.env` del usuario** — solo modificar `.env.example`.

---

## 📝 Nota Importante

El usuario trabaja en **horario GMT+8** (Asia/Shanghai).
El idioma del proyecto es **español argentino** (voseo).
El tono debe ser **directo y práctico** — sin vueltas.

---

*Archivo generado automáticamente. Actualizar al inicio de cada sesión.*
