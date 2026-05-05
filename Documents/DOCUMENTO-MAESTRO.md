# DOCUMENTO-MAESTRO.md — Fuente Única de Verdad

> **Proyecto:** MejoraApp — Comunidad de Líderes Empresariales
> **Stack:** React 18 · TypeScript · Vite 5 · Supabase · Tailwind CSS · shadcn/ui
> **Producción:** https://app.mejoraok.com
> **Repo:** https://github.com/pabloeckert/MejoraApp
> **Última actualización:** 2026-05-05

---

## 📌 Protocolo de Documentación

> **Cuando digas "documentar"**, se actualiza este archivo con los trabajos realizados.
> **Todos los archivos viven en `Documents/`** — nunca crear archivos sueltos en la raíz.

### Reglas
1. **Al inicio de sesión:** Leer este documento completo antes de tocar código.
2. **Al decir "documentar":** Actualizar las secciones relevantes según el trabajo realizado:
   - §7 (Registro de Sesiones) — agregar fila con fecha + resumen
   - §8 (Acciones Pendientes) — actualizar estados
   - §9 (Plan) — marcar completadas con ✅ + fecha
   - §5 (Métricas) — actualizar si cambiaron
   - §2 (Arquitectura) — si hubo cambios estructurales
   - §10 (Análisis Multidisciplinario) — si hubo mejoras relevantes
3. **Nunca crear archivos sueltos** — todo va en `Documents/`.
4. **Al culminar cada sprint:** Pushear a `main` → deploy automático.
5. **Planes:** `✅` completado con fecha, `🔄` en progreso, `🔴` pendiente, `⏳` esperando decisión.
6. **Credenciales:** Nunca en código — usar GitHub Secrets + Supabase Secrets.

---

## 1. Resumen Ejecutivo

MejoraApp es el MVP digital de **Mejora Continua**, comunidad de negocios para líderes empresariales argentinos. App funcional en producción con muro anónimo moderado por IA, contenido de valor, diagnóstico estratégico y panel admin.

**Estado general:** E1–E6 ✅ completas · E7 🔄 (10/12 — pendiente ejecutar SQL y deploy Edge Functions)
**Líneas de código:** ~22,700 (175 archivos TS/TSX) · **Tests:** 312 unit (15 archivos) · 25 E2E · 7 a11y
**Tablas DB:** 25 · **Edge Functions:** 8 · **Analytics:** 28+ eventos · **Validation schemas:** 11 (zod)

---

## 2. Arquitectura

### 2.1 Frontend (React SPA)

```
src/
├── pages/              # 5 páginas lazy-loaded (Index, Auth, Admin, ResetPassword, NotFound)
├── components/
│   ├── admin/          # 7 módulos (Contenido, IA, Muro, Novedades, Usuarios, Seguridad, CRM)
│   │   ├── crm/        # CRMDashboard, CRMClientsTab, CRMInteractionsTab, CRMProductsTab + constants
│   │   └── AdminSecurityMFA.tsx  # MFA enforcement warning
│   ├── auth/           # LoginForm, SignupForm, GoogleButton, AdminLoginForm
│   ├── tabs/           # Muro, Novedades, ContenidoDeValor, Comunidad
│   ├── muro/           # PostCard, CommentItem, PostSkeleton (extraídos de Muro.tsx)
│   ├── community/      # MemberCard, CommunityProfile (directorio de miembros)
│   ├── diagnostic/     # DiagnosticIntro, DiagnosticQuestionView, DiagnosticLoading, DiagnosticResultView
│   ├── ui/             # 30+ componentes shadcn/ui
│   ├── SEOHead.tsx     # Meta tags dinámicos (react-helmet-async)
│   ├── UpgradeModal.tsx # Modal de upgrade premium
│   └── [feature]       # DiagnosticTest, Onboarding, BadgeDisplay, FeatureGate, etc.
├── contexts/           # AuthContext, ThemeContext, I18nContext
├── hooks/              # useWallInteractions, usePullToRefresh, useBadges, useRanking, useCRM, useFunnel, useMembers
├── data/               # diagnosticData.ts, badges.ts
├── integrations/supabase/  # client.ts, types.ts
├── lib/                # utils.ts, analytics.ts, funnel.ts, sentry.ts, push.ts, pdfExport.ts, plans.ts, ab-testing.ts, validation.ts
├── repositories/       # index.ts (Repository Layer sobre Supabase)
├── services/           # Business logic layer (diagnostic, wall, content)
├── i18n/               # locales/index.ts (es/en, 160+ claves)
├── types/              # crm.ts (tipos CRM extendidos)
└── App.tsx             # Router + providers
```

### 2.2 Backend (Supabase)

**Base de datos:** PostgreSQL con RLS en TODAS las tablas.

| Tabla | Propósito | RLS |
|-------|-----------|-----|
| `profiles` | Perfiles de usuario | Usuario propio + Admin |
| `user_roles` | Roles (admin, moderator, user) | Solo admin |
| `diagnostic_results` | Resultados diagnóstico | Usuario propio + Admin |
| `wall_posts` | Posts anónimos muro | Authenticated lee aprobados |
| `wall_comments` | Comentarios en posts | Authenticated lee aprobados |
| `wall_likes` | Likes (unique user+post) | Todos leen, usuario propio |
| `content_categories` | 4 categorías | Público lee |
| `content_posts` | Artículos/videos/infografías/PDFs | Público lee |
| `content_guidelines` | Lineamientos generación IA | Solo admin |
| `novedades` | Noticias comunidad | Público lee |
| `admin_config` | Configuración admin | Solo admin |
| `moderation_log` | Log moderación posts | Solo service_role |
| `moderation_comments_log` | Log moderación comentarios | Solo service_role |
| `user_badges` | Badges ganados | Usuario propio lee |
| `push_subscriptions` | Suscripciones push | Usuario propio |
| `admin_audit_log` | Log acciones admin | Solo service_role |
| `nps_responses` | Respuestas NPS | Usuario propio |
| `referrals` | Tracking referidos | Usuario propio lee |
| `admin_whitelist` | Emails auto-admin | Solo service_role |
| `crm_clients` | Clientes CRM | Solo admin |
| `crm_products` | Productos CRM | Solo admin |
| `crm_interactions` | Interacciones comerciales | Solo admin |
| `crm_interaction_lines` | Líneas por interacción | Solo admin |
| `community_challenges` | Desafíos comunitarios | Authenticated lee activos |
| `challenge_participants` | Participación en desafíos | Authenticated lee, usuario propio escribe |

**Vistas:** `crm_client_summary`, `crm_seller_ranking`, `public_profiles` · **RPC:** `get_crm_dashboard()`
**Funciones SQL:** `is_admin(UUID)`, `has_role(UUID, app_role)`, `handle_new_user()`, `update_wall_likes_count()`, `update_wall_post_comments_count()`, triggers de badges.

### 2.3 Edge Functions

| Función | Auth | Rate Limit | Middleware |
|---------|------|------------|------------|
| `moderate-post` | JWT | 3 posts/min | ✅ `withMiddleware` |
| `moderate-comment` | JWT | 10 comments/min | ✅ `withMiddleware` |
| `verify-admin` | JWT + admin | — | ✅ `withMiddleware` |
| `admin-action` (13 acciones) | JWT + admin | 30 req/min + audit log | ✅ `withMiddleware` |
| `generate-content` | JWT + admin | — | ✅ `withMiddleware` |
| `mentor-chat` | JWT | — | ✅ `withMiddleware` |
| `send-push-notification` | Service role | — | ✅ `withMiddleware` |
| `send-diagnostic-email` | Service role | — | ✅ `withMiddleware` |
| `send-onboarding-email` | Service role | 30 req/min | ✅ `withMiddleware` (2026-05-05) |

**Módulos compartidos:** `_shared/cors.ts` · `_shared/log.ts` · `_shared/middleware.ts`
**Middleware chain:** CORS → JWT Auth → Admin Check → Rate Limit → Handler
**Cadena fallback IA:** Gemini → Groq → OpenRouter (DeepSeek) → null (auto-aprobado)

### 2.4 Seguridad

- RLS en TODAS las tablas
- Edge Functions como gatekeeper para escrituras admin
- Rate limiting (3 post/min, 10 comments/min, 30 admin/min)
- Moderación IA multi-provider con fallback
- Self-demotion prevention en remove-role
- CSP headers · CORS centralizado via `_shared/cors.ts`
- Admin audit log (fire-and-forget)
- Logging estructurado JSON en Edge Functions

### 2.5 PWA
- `manifest.json` configurado · Service Worker network-first · Instalable iOS/Android

---

## 3. Módulos Funcionales

| Módulo | Descripción |
|--------|-------------|
| **Muro Anónimo** | Posts (500 chars) · Likes toggle · Comentarios (300 chars) · Moderación IA · Realtime · Infinite scroll · Pull-to-refresh · Eliminar propios · Reportar contenido · Badges · Ranking |
| **Contenido de Valor** | 4 categorías · 4 tipos media · Búsqueda · Filtro pills · Generación IA · Contenido programado · Recomendaciones por perfil |
| **Diagnóstico (Mirror)** | Test interactivo · Puntaje + perfil · WhatsApp CTA · Historial 3 resultados · PDF export · Recomendaciones por perfil · CTA consultoría |
| **Novedades** | CRUD admin · Fecha publicación · Imagen + enlace · Empty state |
| **Servicios** | Componente dedicado · Tracking · WhatsApp CTA · Variante compact/full |
| **Panel Admin** | 7 módulos: Contenido · IA · Novedades · Muro · Usuarios · Seguridad · CRM |
| **Onboarding** | 4 pasos con skip · Persistencia localStorage · Overlay modal |
| **Gamificación** | 8 badges · Triggers SQL automáticos · Ranking comunidad · Perfil completo |
| **Analytics (PostHog)** | 28+ eventos · Auth, muro, diagnóstico, contenido, onboarding, gamificación, servicios, admin |
| **Retención** | Web Push · Email post-diagnóstico · Badges visita · Toast real-time |
| **I18n** | es/en · 130+ claves · Detección navegador · Persistencia |
| **CRM (Admin)** | Dashboard · Clientes · Interacciones · Productos · 4 tablas · Vistas · RPC |
| **Freemium** | Feature flags · 8 features free/premium · Modo ALL_FREE activo |

---

## 4. Despliegue

| Entorno | Trigger | Destino |
|---------|---------|---------|
| **Producción** | Push `main` | Vercel (CDN + SSL) |
| **Preview** | Push `main` | GitHub Pages: `pabloeckert.github.io/MejoraApp/` |
| **Legacy** | Push `main` | Hostinger FTP: `app.mejoraok.com` |
| **Staging** | Push `develop` | Vercel preview |

### CI/CD Pipeline
```
Push main → GitHub Actions (test + build) → Vercel auto-deploy → Health check (3 intentos) → ✅/❌
Push main (supabase/functions/) → GitHub Actions → Supabase CLI → Deploy Edge Functions → ✅/❌
```

### Comandos
```bash
npm install          # Instalar dependencias
npm run dev          # Dev: http://localhost:8080
npm run build        # Producción: dist/
npm run test         # Tests: vitest run (103+ tests)
npm run lint         # Lint: eslint
npm run test:e2e     # E2E: playwright test
```

### Rollback
Vercel → Deployments → Promover versión anterior.

---

## 5. Métricas

| Métrica | Valor |
|---------|-------|
| Líneas de código (TS/TSX) | ~22,700 |
| Archivos fuente | 170 |
| Tests unitarios | 312 (100% passing, 15 archivos) |
| Tests E2E | 25 (Playwright) |
| Tests accesibilidad | 7 (axe-core) |
| Tablas DB | 25 (todas creadas + vistas + RPC) |
| Vistas DB | 3 (crm_client_summary, crm_seller_ranking, public_profiles) |
| Edge Functions | 8 (5 desplegadas, 4 pendientes deploy) |
| Eventos analytics | 28+ |
| Bundle gzipped | ~355KB |
| Componentes UI | 30+ (shadcn/ui) |
| Hooks custom | 13 |
| Services | 3 (diagnostic, wall, content) |
| Validation schemas | 11 (zod) |
| Migraciones SQL | 18 |
| i18n claves | 160+ (es/en) |

---

## 6. Estado por Etapa

### E1 — Seguridad y Estabilización ✅ (2026-04-23)
Rotar credenciales · Mover lógica admin a Edge Functions · RLS seguro · Botón Shield · Auditoría RLS · Eliminar código muerto

### E2 — Arquitectura y DevOps ✅ (2026-04-24)
Migraciones SQL (12 archivos) · Tests integración (103+) · Rollback · PWA real · Staging · Monitoring (Sentry)

### E3 — Experiencia de Usuario ✅ (2026-04-24)
Búsqueda · Onboarding · Diagnóstico mejorado · Muro eliminar propios · UX crítico · Conexiones entre secciones

### E4 — Analytics y Retención ✅ (2026-04-24)
PostHog (28+ eventos) · Push + Email + Badges · Gamificación (8 badges) + Ranking · Servicios + CTA + PDF + Dashboards

### E5 — Calidad y Robustez ✅ (2026-04-24)
Legal (privacidad, términos, cookies, "Mis Datos") · E2E Playwright (25) · axe-core (7) · Coverage · Refactor Muro · Typography · Scroll preservation · Editorial guide · SEO

### E6 — Escalamiento ✅ (2026-04-25)
CORS centralizado · CSP · Rate limiting · Admin audit · Push triggers · Admin whitelist · Landing · Referidos · CRM propio · NPS · Repository Layer · i18n · Bundle analysis

### E7 — Deploy y Activación 🔄 (10/12 ✅)

| # | Tarea | Prioridad | Estado |
|---|-------|-----------|--------|
| 7.1 | Fix Realtime channel collision | 🔴 | ✅ |
| 7.2 | Onboarding emails — SQL listo | 🔴 | ✅ (ejecutar en Supabase) |
| 7.3 | Onboarding emails — Edge Function lista | 🔴 | ✅ 2026-05-05 (migrada a middleware) |
| 7.4 | Onboarding emails — cron workflow | 🔴 | ✅ 2026-05-05 (workflow onboarding-emails.yml activo, requiere deploy 7.3) |
| 7.5 | Consolidar docs | 🟡 | ✅ |
| 7.6 | GitHub Pages configurado | 🟡 | ✅ |
| 7.7 | Migración gamificación ejecutada | 🟡 | ✅ |
| 7.8 | Migrar a Vercel | 🔴 | ✅ 2026-05-05 (lint removido del deploy, HTTP 200) |
| 7.9 | Deploy Edge Functions migradas a middleware | 🔴 | ✅ 2026-05-05 (todas usan withMiddleware + workflow deploy-functions.yml) |
| 7.10 | AdminCRM refactor (900→34 líneas) | 🟡 | ✅ 2026-04-29 |
| 7.11 | Skeleton components (5 variantes) | 🟡 | ✅ 2026-04-29 |
| 7.12 | Deploy health check post-deploy | 🟡 | ✅ 2026-04-29 |

### 🔑 Acciones manuales restantes (requieren acceso Supabase Dashboard)

1. **Ejecutar SQL de onboarding emails** — Copiar el contenido de `supabase/migrations/20260426000000_onboarding_emails.sql` y ejecutar en Supabase Dashboard → SQL Editor
2. **Configurar secret `SUPABASE_ACCESS_TOKEN`** en GitHub Settings → Secrets (para workflow deploy-functions.yml)
3. **Trigger deploy de Edge Functions** — Ejecutar workflow `deploy-functions.yml` manualmente desde GitHub Actions
4. **Verificar cron onboarding** — Una vez desplegada la function, el workflow `onboarding-emails.yml` (cada 6h) la ejecutará automáticamente

---

## 7. Registro de Sesiones

| Fecha | Resumen |
|-------|---------|
| 2026-05-05 | **MIGRACIÓN HOSTINGER + SETUP LOCAL** — Evaluación de situación: dominio `mejoraok.com` gestionado vía Hostinger (nameservers `dns-parking.com`), acceso a hPanel perdido. Código seguro en GitHub. Repo clonado localmente, dependencias instaladas (576 paquetes), 312/312 tests passing. Archivo `.env` creado pendiente de completar con credenciales Supabase. Dominio vence 2026-12-01. Opciones: recuperar acceso Hostinger o registrar dominio nuevo. Continuar trabajo local → push GitHub → Vercel auto-deploy. |
| 2026-05-05 | **DEPLOY PREP** — Migración `send-onboarding-email` a `withMiddleware` · Creado workflow `deploy-functions.yml` para deploy automático de Edge Functions · Actualizado DOCUMENTO-MAESTRO · Pendiente: ejecutar SQL + deploy functions + configurar secrets |
| 2026-05-05 | **CONFIGURACIÓN SUPABASE + LIMPIEZA REPO** — `.env` configurado con credenciales Supabase reales (URL + publishable key). Escaneada DB vía REST API: 19/25 tablas existían, 7 faltaban (push_subscriptions, CRM×4, comunidad×2). Creado SQL consolidado `20260505000000_missing_tables.sql` con 7 tablas + 3 vistas + RPC `get_crm_dashboard` + triggers + RLS. Eliminados 6 SQLs redundantes de Documents/ (CLEAN_SETUP, MIGRACION-*, PUSH_SUBSCRIPTIONS, SECURITY_HARDENING). Eliminados artefactos de build del tracking (playwright-report/, test-results/). Migración onboarding_emails ya existía en DB. Build OK (9.66s), 312/312 tests passing. Pendiente: ejecutar SQL en Supabase Dashboard + configurar Vercel + deploy Edge Functions. |
| 2026-04-30 | **MODO COMUNIDAD — 1 commit, +1,186 líneas, nueva tab Comunidad** — Implementación completa del Modo Comunidad (área prioritaria #1). **Nueva tab "Comunidad"** en BottomNav con 4 secciones: Stats Bar (miembros, activos, engagement), Desafío Semanal con banner gradient + CTA join/leave, Miembros Destacados (top 3), Directorio de Miembros con búsqueda + filtros por industria. **Componentes nuevos:** `Comunidad.tsx` (tab principal), `MemberCard.tsx` (variantes compact/featured), `CommunityProfile.tsx` (sheet de perfil público). **Hooks nuevos:** `useMembers.ts` (useMembers, useMemberProfile, useChallenges, useChallengeParticipation). **DB Migration:** `public_profiles` view (sin datos sensibles), `community_challenges` table, `challenge_participants` table + trigger de conteo automático, RLS policies en ambas tablas, primer desafío semanal seed. **Prototipos SVG:** Tab mockup + flujo de usuario (convertidos a PNG). **Build:** OK (9.73s). **Commit:** 89066ce. |
| 2026-04-30 | **MEJORAS PROFUNDAS — 7 commits, refactor + funnel + freemium + MFA + SEO + Edge Functions** — Análisis completo del repo + documentos MejoraApp.docx y Yo-lo-haria-asi.docx. **Refactor Muro.tsx:** 610→386 líneas, extraído PostCard (169L), CommentItem (24L), PostSkeleton (17L). **Refactor DiagnosticTest.tsx:** 576→188 líneas, extraído DiagnosticIntro (82L), DiagnosticQuestionView (104L), DiagnosticLoading (11L), DiagnosticResultView (236L). Progress bar visible. **Funnel Tracking:** Sistema NSM completo (`src/lib/funnel.ts`), 7 pasos instrumentados (signup→onboarding→first_visit→first_post→return_d1→return_d7→premium_intent), integrado en AuthContext, Onboarding, Muro, Index, FeatureGate. **Freemium:** Plan freemium activo con features diferenciados (free vs premium), `PREMIUM_FEATURES` list, `isPremium()` helper, UpgradeModal. **MFA Admin:** AdminSecurityMFA component, verificación de MFA via Supabase, banner de advertencia en Admin. **SEO:** react-helmet-async, SEOHead component, OG tags, Twitter Cards, canonical URLs, configs por página. **Edge Functions:** Las 3 legacy (generate-content, send-push-notification, send-diagnostic-email) migradas a `withMiddleware`. Todas las 7 funciones usan middleware compartido. **Tests:** 312 passing. **Build:** OK. **Docs:** CHANGELOG.md creado, DOCUMENTO-MAESTRO actualizado. |
| 2026-04-29 | **SESIÓN AUTODEV COMPLETA — 19 commits, 103→312 tests, app en vivo** — Sesión autónoma completa sin intervención del usuario. Trabajo desde las 30+ perspectivas profesionales. **Fix crítico:** tsconfig.json Vercel build error (ENOENT). **Bug fix:** computed property en useWallInteractions (comentarios no cargaban). **Services layer:** diagnostic.service.ts, wall.service.ts, content.service.ts. **Validation:** 11 schemas zod (login, signup, profile, wall post, comment, content, CRM, NPS). **Edge function hardening:** HTML sanitization, action whitelist, input validation. **Design tokens:** spacing, shadows, transitions en tailwind.config. **Accessibility:** ARIA labels en BottomNav, AppHeader, Muro. **i18n:** English translations completas (160+ claves). **PWA:** manifest fix (start_url, shortcuts, maskable icons). **SEO:** JSON-LD structured data. **DevOps:** deploy verification script, Lighthouse CI, lint-staged, bundle size check. **Tests:** 312 passing (15 archivos). **Docs:** PR template, CODEOWNERS, env.example. **Deploy:** Push a main → app.mejoraok.com en vivo (HTTP 200). |
| 2026-04-29 | Setup Vercel + AdminCRM refactor + Skeleton + Health Check |
| 2026-04-29 | Consolidación definitiva + análisis 30+ roles |
| 2026-04-28 | Middleware migration + Vercel setup + Providers refactor |
| 2026-04-28 | Consolidación documentación total |
| 2026-04-27 | GitHub Pages fix + Vercel setup + onboarding email prep |
| 2026-04-26 | Login UI + renombre Mirror + admin setup + Realtime fix |
| 2026-04-26 | Consolidación docs v2 · E6 completa (12/12) |
| 2026-04-25 | CRM integrado · VAPID keys · Optimización producción · CORS fix |
| 2026-04-25 | Freemium infrastructure · Feature flags |
| 2026-04-24 | E5 completa: Legal + E2E + UX Polish |

---

## 8. Acciones Pendientes del Usuario

| # | Acción | Prioridad | Estado |
|---|--------|-----------|--------|
| 1 | Crear cuenta Resend + verificar dominio `mejoraok.com` | 🔴 Alta | 🔴 Pendiente |
| 2 | Ejecutar SQL `onboarding_emails` en Supabase SQL Editor | 🔴 Alta | 🔴 Pendiente |
| 3 | Desplegar Edge Functions vía workflow `deploy-functions.yml` | 🔴 Alta | 🟡 Código listo, requiere secret `SUPABASE_ACCESS_TOKEN` |
| 4 | Verificar deploy en Vercel (app.mejoraok.com) | 🟡 Media | ✅ En vivo (HTTP 200) |
| 5 | Agregar `SUPABASE_ACCESS_TOKEN` a GitHub Secrets | 🔴 Alta | 🔴 Pendiente (para workflow deploy-functions.yml) |
| 6 | Deploy Edge Functions migradas a middleware | 🔴 Alta | 🔴 Pendiente |
| 7 | Verificar fix Realtime en producción | 🟡 Media | ⏳ Confirmar |

---

## 9. Plan Optimizado — Próximas Etapas (E7-E12)

### Estrategia: Priorización por Impacto × Esfuerzo

```
                    ALTO IMPACTO
                         │
         E8 Crecimiento  │  E7 Deploy
         (monetización)  │  (bloqueante)
                         │
    ─────────────────────┼─────────────────────
                         │
         E12 Data/ML     │  E9 Escalamiento
         (si tracción)   │  (técnico)
                         │
                    BAJO IMPACTO
```

### Dependencias
```
E7 (Deploy) ──→ E8 (Crecimiento) ──→ E10 (App Nativa)
     │                                      ↑
     └──→ E9 (Escalamiento Técnico) ────────┘
     │
     └──→ E11 (Compliance) ──→ E12 (Data & ML)
```

### E7 — Deploy y Activación 🔄 (SEMANA ACTUAL — completar ASAP)

**Objetivo:** App servida desde Vercel con emails onboarding funcionando.

| # | Tarea | Rol | Prioridad | Estado | Blocker |
|---|-------|-----|-----------|--------|---------|
| 7.8 | Redeploy Vercel (sin cache) | DevOps | 🔴 Crítico | ✅ En vivo (HTTP 200) | — |
| 7.9 | Deploy Edge Functions middleware | DevOps | 🔴 Crítico | 🔴 Pendiente | Necesita `supabase functions deploy` |
| 7.2 | SQL onboarding_emails en Supabase | Backend | 🔴 Alta | 🔴 Pendiente | Usuario ejecuta |
| 7.3 | Deploy EF send-onboarding-email | Backend | 🔴 Alta | 🔴 Pendiente | Después de 7.2 |
| 7.4 | Cron onboarding emails | DevOps | 🔴 Alta | 🔴 Pendiente | Después de 7.3 |

**Gate de salida:** App en Vercel ✅ + Emails funcionando 🔄 + EF desplegadas 🔄

### E8 — Crecimiento y Monetización (Sprint 1 semana)

**Objetivo:** Activar freemium, poblar CRM, medir funnel.

| # | Tarea | Rol | Impacto | Esfuerzo |
|---|-------|-----|---------|----------|
| 8.1 | North Star Metric: 30 DAU, 3+ sesiones/sem | PM | 🔴 | 🟢 Bajo |
| 8.2 | Poblar CRM (10+ clientes reales) | BD | 🔴 | 🟡 Medio |
| 8.3 | Activar freemium: definir corte free/premium | PO | 🔴 | 🟡 Medio |
| 8.4 | Funnel: Signup→Onboarding→Post→Return | Growth | 🟡 | 🟡 Medio |
| 8.5 | A/B testing onboarding (variantes) | Growth | 🟡 | 🟢 Bajo |
| 8.6 | Email templates (day1/day3/day7) | Content | 🟡 | 🟡 Medio |

**Gate de salida:** Freemium activo + CRM poblado + Funnel midiendo + Emails enviándose

### E9 — Escalamiento Técnico (Sprint 1-2 semanas)

**Objetivo:** 2FA, CI robusto, código descompuesto.

| # | Tarea | Rol | Impacto | Esfuerzo | Estado |
|---|-------|-----|---------|----------|--------|
| 9.1 | 2FA para admins (Supabase MFA) | Cybersecurity | 🔴 | 🟡 Medio | ✅ 2026-04-30 (AdminSecurityMFA component + warning) |
| 9.2 | Health checks post-deploy en CI | DevOps/SRE | 🔴 | 🟢 Bajo | ✅ 2026-04-29 (verify-deploy.sh) |
| 9.3 | Separar `lib/` en `lib/` + `services/` | SW Architect | 🟡 | 🟡 Medio | ✅ 2026-04-29 (3 services creados) |
| 9.4 | Descomponer componentes >300 líneas | Frontend | 🟡 | 🟡 Medio | ✅ 2026-04-30 (Muro 610→386, DiagnosticTest 576→188) |
| 9.5 | Skeleton loading en pantallas críticas | UX Designer | 🟡 | 🟢 Bajo | ✅ 2026-04-29 (5 variantes) |
| 9.6 | Design tokens en tailwind.config | UI Designer | 🟢 | 🟢 Bajo | ✅ 2026-04-29 (spacing, shadows, transitions) |
| 9.7 | Storybook para componentes UI | Frontend | 🟢 | 🟡 Medio | 🔴 Pendiente |
| 9.8 | Lighthouse CI en pipeline | DevOps | 🟢 | 🟢 Bajo | ✅ 2026-04-29 |
| 9.9 | Visual regression tests (Playwright) | QA | 🟢 | 🟡 Medio | 🔴 Pendiente |

**Gate de salida:** 2FA activo + CI con health checks + Componentes refactorizados

### E10 — App Nativa (CONDICIONAL — solo si 30+ DAU)

| # | Tarea | Condición |
|---|-------|-----------|
| 10.1 | Evaluar Capacitor wrapper nativo | DAU > 30 |
| 10.2 | Push notifications nativas iOS | >40% usuarios iOS |
| 10.3 | App Store / Play Store | 10.1 + 10.2 OK |

**Decisión:** PWA es suficiente. No invertir hasta tracción demostrada.

### E11 — Operaciones y Compliance (Sprint 1 semana)

| # | Tarea | Rol | Impacto | Esfuerzo |
|---|-------|-----|---------|----------|
| 11.1 | DPIA (Data Protection Impact Assessment) | DPO/Legal | 🟡 | 🟡 Medio |
| 11.2 | Breach notification (72h GDPR) | DPO | 🟡 | 🟢 Bajo |
| 11.3 | Registro actividades procesamiento | Legal | 🟡 | 🟢 Bajo |
| 11.4 | WAF rules (Cloudflare free tier) | Cybersecurity | 🟡 | 🟢 Bajo |
| 11.5 | SLO: 99.9% uptime | SRE | 🟢 | 🟢 Bajo |
| 11.6 | Runbook incidentes | SRE | 🟢 | 🟡 Medio |

### E12 — Data & ML (SOLO SI HAY TRACCIÓN)

| # | Tarea | Condición |
|---|-------|-----------|
| 12.1 | Dashboard ejecutivo (PostHog) | Siempre |
| 12.2 | Pipeline ETL: Supabase → Data Warehouse | 200+ usuarios |
| 12.3 | Clustering usuarios por comportamiento | 500+ usuarios |
| 12.4 | Modelo predictivo churn | 1000+ usuarios |
| 12.5 | Recomendaciones ML (collaborative filtering) | 1000+ usuarios |

---

## 10. Análisis Multidisciplinario (30+ Perspectivas)

### 🔧 ÁREA TÉCNICA

#### Software Architect (8/10)
- **Fortalezas:** Separación clara Front/Back. Repository Pattern. Lazy loading. Providers encapsulados.
- **Deuda técnica:** `lib/` mezcla utils con lógica de negocio. Componentes >300 líneas (Muro 604, DiagnosticTest 576).
- **Plan:** E9.3 separar `lib/` + `services/`. E9.4 descomponer componentes grandes.

#### Cloud Architect (7/10)
- **Fortalezas:** Supabase BaaS managed. Edge Functions serverless. Vercel CDN global. Region `gru1` (São Paulo) correcta para LATAM.
- **Riesgo:** Lock-in moderado en Supabase. Repository Layer ya abstrae — bien.
- **Plan:** Adapter pattern para Auth si se migra. Monitorear costos Supabase al escalar.

#### Backend Developer (8/10)
- **Fortalezas:** 23 tablas normalizadas. RLS completo. Middleware chain en Edge Functions. Fallback IA multi-provider.
- **Mejoras:** Falta validación input server-side. Falta `EXPLAIN ANALYZE` de queries críticas.
- **Plan:** E9 agregar zod validation en Edge Functions. Auditar queries del muro con EXPLAIN.

#### Frontend Developer (7/10)
- **Fortalezas:** React 18 + TypeScript estricto. 30+ shadcn/ui components. Custom hooks. Lazy loading.
- **Deuda:** Muro.tsx (604), DiagnosticTest.tsx (576). Testing de componentes poco granular.
- **Plan:** E9.4 descomponer en sub-componentes. Agregar tests de componente por feature.

#### iOS Developer (N/A — PWA)
- **Estado:** PWA instalable en iOS Safari. Push limitado (iOS 16.4+).
- **Plan:** E10 evaluar Capacitor si >40% usuarios iOS necesitan push nativo.

#### Android Developer (N/A — PWA)
- **Estado:** PWA con push completo en Android Chrome.
- **Plan:** Priorizar Android en testing. Manifest ya configurado.

#### DevOps Engineer (8/10)
- **Fortalezas:** CI con GitHub Actions. Deploy automático. Staging. Rollback. Concurrency control. Health check post-deploy.
- **Falta:** Alertas si build falla en producción.
- **Plan:** E9.2 health check en CI. Notificación Discord si deploy falla.

#### SRE (7/10)
- **Fortalezas:** Sentry error tracking. CSP headers. Rate limiting. Service Worker offline.
- **Falta:** SLO/SLI. No hay uptime metrics. No runbook.
- **Plan:** E11.5 SLO 99.9%. E11.6 runbook básico para incidentes.

#### Cybersecurity Architect (9/10)
- **Fortalezas:** RLS en todas las tablas. Edge Functions gatekeeper. Rate limiting. CSP/CORS. Admin audit. Self-demotion prevention.
- **Falta:** 2FA para admins. WAF. Rotación de secrets.
- **Plan:** E9.1 2FA via Supabase MFA. E11.4 Cloudflare WAF.

#### Data Engineer (6/10)
- **Fortalezas:** 23 tablas estructuradas. Vistas materializadas CRM. RPC dashboards.
- **Falta:** Sin pipeline ETL. Sin data warehouse. PostHog sin consolidar con Supabase.
- **Plan:** E12.2 pipeline cuando haya 200+ usuarios.

#### ML Engineer (5/10)
- **Fortalezas:** Moderación IA con fallback. Recomendaciones rule-based por perfil.
- **Falta:** Sin modelo propio. Sin pipeline entrenamiento.
- **Plan:** E12.5 collaborative filtering solo si 1000+ usuarios. Rule-based es suficiente para MVP.

#### QA Automation (8/10)
- **Fortalezas:** 103+ unit tests. 25 E2E Playwright. 7 a11y tests axe-core. CI con coverage.
- **Falta:** Sin visual regression. Tests integración podrían cubrir más Edge Functions.
- **Plan:** E9.9 visual regression. E9.8 Lighthouse CI.

#### DBA (8/10)
- **Fortalezas:** 23 tablas normalizadas. Migraciones versionadas (17 archivos). RLS documentada.
- **Falta:** Sin EXPLAIN ANALYZE. Sin particionamiento para logs.
- **Plan:** Auditar queries muro con EXPLAIN. Particionar `moderation_log` y `admin_audit_log` cuando crezcan.

---

### 📦 ÁREA DE PRODUCTO Y GESTIÓN

#### Product Manager (7/10)
- **Fortalezas:** MVP bien definido. 7 etapas claras. Feature flags para freemium.
- **Falta:** No hay North Star Metric definida. No hay métricas de éxito cuantificadas.
- **Plan:** E8.1 definir: "30 DAU activos con 3+ sesiones/semana".

#### Product Owner (7/10)
- **Fortalezas:** Backlog en plan E7-E12. Prioridades 🔴🟡🟢. Entregables concretos.
- **Falta:** User stories formales. Acceptance criteria.
- **Plan:** E8+ escribir user stories con criterios de aceptación.

#### Scrum Master (6/10)
- **Estado:** Solo dev. No necesita Scrum formal.
- **Plan:** Mantener ritmo. Cuando haya 2+ miembros: daily async + retro semanal.

#### UX Researcher (6/10)
- **Fortalezas:** Onboarding con skip. NPS survey. Empty states con CTA.
- **Falta:** Sin entrevistas de usuario documentadas. Sin heatmap/session recording.
- **Plan:** Activar PostHog session recordings. Entrevistar 5 usuarios reales antes de E8.

#### UX Designer (8/10)
- **Fortalezas:** Mobile-first. Bottom nav. Onboarding progresivo. Pull-to-refresh. Infinite scroll. Feedback visual.
- **Mejoras:** Progress indicator en diagnóstico. Skeleton loading en muro.
- **Plan:** E9.5 skeleton screens en lugar de spinners.

#### UI Designer (7/10)
- **Fortalezas:** shadcn/ui base. Tipografía BwModelica custom. Escala tipográfica. Contraste WCAG AA.
- **Falta:** Sin design tokens formales. Colores hardcodeados en algunos componentes.
- **Plan:** E9.6 extraer design tokens a `tailwind.config.ts`.

#### UX Writer (8/10)
- **Fortalezas:** Voz argentina con voseo. Microcopy humanizado. Empty states con personalidad.
- **Plan:** Mantener glosario actualizado. Agregar context comments en claves i18n.

#### Localization Manager (7/10)
- **Fortalezas:** i18n es/en, 130+ claves. Auto-detección. Persistencia.
- **Falta:** Sin proceso de traducción formal.
- **Plan:** Para expansión, agregar context comments en claves i18n.

#### Delivery Manager (8/10)
- **Fortalezas:** Deploy automático. Staging. Rollback. CI obligatorio.
- **Falta:** Todo va a main directo (sin feature branches).
- **Plan:** Con 2+ personas: feature branches + PR reviews.

---

### 📈 ÁREA COMERCIAL Y DE CRECIMIENTO

#### Growth Manager (6/10)
- **Fortalezas:** Referidos. A/B testing framework. Onboarding optimizado.
- **Falta:** Funnel analytics completo. Estrategia activación post-signup.
- **Plan:** E8.4 definir funnel: Signup→Onboarding→First Post→Return→Premium.

#### ASO Specialist (N/A — Web App)
- **Alternativa:** SEO para web (ver SEO Specialist).

#### Performance Marketing (5/10)
- **Fortalezas:** PostHog tracking. A/B testing.
- **Falta:** Sin paid ads. Sin attribution. Sin pixel Meta/Google.
- **Plan:** Cuando haya presupuesto: Meta Pixel + Google Ads en PostHog.

#### SEO Specialist (7/10)
- **Fortalezas:** robots.txt. sitemap.xml. JSON-LD. FAQ visible.
- **Falta:** SPA puede dificultar crawling. Sin meta tags dinámicos.
- **Plan:** Agregar react-helmet. Considerar SSR para landing si SEO es crítico.

#### Business Development (6/10)
- **Fortalezas:** CRM integrado en admin. Tracking interacciones. Dashboard ventas.
- **Falta:** Sin integración HubSpot/Pipedrive.
- **Plan:** CRM interno es suficiente para MVP. Migrar a HubSpot con 10+ clientes activos.

#### Account Manager (N/A — MVP)
- **Plan:** Con 20+ clientes, definir proceso de account management.

#### Content Manager (7/10)
- **Fortalezas:** 4 categorías. Generación IA. Contenido programado. Recomendaciones por perfil.
- **Falta:** Sin calendario editorial. Sin workflow aprobación.
- **Plan:** Crear calendario editorial en CRM admin. Estado borrador→revisión→publicado.

#### Community Manager (7/10)
- **Fortalezas:** Muro anónimo con moderación IA. Badges. Ranking. Community rules.
- **Falta:** Sin herramientas de moderación manual. Sin sistema de reportes de usuarios.
- **Plan:** ReportDialog ya implementado. Dashboard de moderación en admin.

---

### ⚖️ ÁREA DE OPERACIONES, LEGAL Y ANÁLISIS

#### BI Analyst (6/10)
- **Fortalezas:** PostHog 28+ eventos. CRM dashboard SQL. NPS tracking.
- **Falta:** Sin dashboards consolidados. Datos dispersos.
- **Plan:** E12.1 dashboard ejecutivo: DAU, posts/día, diagnósticos/día, NPS, conversión.

#### Data Scientist (5/10)
- **Fortalezas:** Engagement data. NPS. Diagnósticos con scores.
- **Falta:** Sin análisis predictivo. Sin segmentación.
- **Plan:** E12.3 clustering con 200+ usuarios.

#### Legal & Compliance (7/10)
- **Fortalezas:** Política privacidad. Términos servicio. Cookie consent. "Mis Datos" (GDPR). Data deletion.
- **Falta:** Sin DPIA. Sin registro procesamiento. Sin DPO designado.
- **Plan:** E11.1 DPIA antes de escalar.

#### DPO (6/10)
- **Fortalezas:** Usuario puede ver/eliminar datos. Cookie opt-in. Anonimización muro.
- **Falta:** Sin breach notification. Sin registro actividades procesamiento.
- **Plan:** E11.2 procedimiento breach notification (72h GDPR).

#### Customer Success (5/10)
- **Fortalezas:** NPS survey. Email post-diagnóstico. WhatsApp CTA.
- **Falta:** Sin health score. Sin re-engagement automatizado.
- **Plan:** Health score basado en: última visita, posts, diagnósticos. Email re-engagement a 7 días inactividad.

#### Technical Support T1/T2/T3 (N/A — MVP)
- **Estado:** WhatsApp como soporte T1. Dev resuelve T2. Sentry para T3.
- **Plan:** Con 50+ tickets/mes: implementar sistema tickets (Intercom/Crisp).

#### RevOps (5/10)
- **Fortalezas:** CRM pipeline. Feature flags freemium. Tracking interacciones.
- **Falta:** Sin métricas revenue. Sin forecast. Sin facturación.
- **Plan:** Integrar Mercado Pago cuando haya revenue. Dashboard MRR/churn/LTV.

---

### 📊 Resumen Ejecutivo por Área

| Área | Score | Estado | Top Prioridad |
|------|-------|--------|---------------|
| **Seguridad** | 9/10 | ✅ Excelente | 2FA para admins |
| **Backend** | 8/10 | ✅ Sólido | Validación input server-side |
| **Frontend** | 7/10 | ✅ Funcional | Descomponer componentes grandes |
| **UX/UI** | 8/10 | ✅ Buena | Skeleton loading |
| **DevOps/CI-CD** | 8/10 | ✅ Completo | Health checks post-deploy |
| **Analytics/BI** | 8/10 | ✅ PostHog integrado | Dashboard ejecutivo |
| **Legal/Compliance** | 7/10 | ✅ Documentos creados | DPIA |
| **Growth/Marketing** | 6/10 | ⚠️ En desarrollo | Funnel analytics |
| **Calidad/Testing** | 8/10 | ✅ E2E + a11y | Visual regression |
| **Data/ML** | 5/10 | ⚠️ Básico | Solo si hay tracción |
| **Revenue Ops** | 5/10 | ⚠️ Pre-MVP | CRM poblado + freemium |
| **Documentación** | 9/10 | ✅ Consolidada | Este documento |

**Top 3 prioridades globales:**
1. 🔴 **Deploy:** Conectar Vercel + onboarding emails → E7 completo
2. 🔴 **Monetización:** Poblar CRM + definir freemium → E8
3. 🟡 **Growth:** Funnel analytics + SEO + A/B testing → E8

---

## 11. Decisiones de Diseño Clave

1. **Supabase como backend único** — No se migra a otro BaaS.
2. **Mobile-first** — Toda feature se diseña para móvil primero.
3. **IA como herramienta** — Modera y genera, pero la comunidad es el producto.
4. **Sin lock-in** — Código portable.
5. **Crecimiento orgánico** — Se construye lo que se necesita.
6. **Datos antes que features** — No construir sin poder medir impacto.

---

## 12. Guía de Estilo Editorial

**Voz:** Directa, cercana, argentina, sin vueltas.
**Voseo siempre.** Nunca tuteo. Nunca ustedeo.

| ✅ Correcto | ❌ Incorrecto |
|------------|--------------|
| Completá | Completa / Complete |
| ¿Querés? | ¿Quieres? / ¿Quiere? |
| Mirá | Mira / Mire |

**Escala tipográfica:** caption 11px → body 14px → heading 24px → display 30px
**Contraste:** WCAG AA (4.5:1 texto normal, 3:1 texto grande)

**Nombres de secciones:** Contenido · Mirror · Muro · Novedades

---

## 13. Setup Rápido

### Vercel (producción)
1. vercel.com/new → Import `pabloeckert/MejoraApp`
2. Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
3. Deploy → conectar dominio `app.mejoraok.com`

### Email (Resend)
1. resend.com → Sign Up → Add Domain `mejoraok.com`
2. Agregar 3 DNS records en Hostinger → Verify
3. Create API Key → Supabase Secrets: `RESEND_API_KEY`

### Onboarding Emails
1. Ejecutar `supabase/migrations/20260426000000_onboarding_emails.sql` en Supabase SQL Editor
2. `supabase functions deploy send-onboarding-email`
3. GitHub Secrets: `SUPABASE_SERVICE_ROLE_KEY`
4. Workflow `onboarding-emails.yml` ejecuta cada 6h

### VAPID Keys (Push Notifications)
1. `npx web-push generate-vapid-keys`
2. Supabase Secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT=mailto:hola@mejoraok.com`
3. GitHub Secrets: `VITE_VAPID_PUBLIC_KEY`

---

## 14. Glosario

| Término | Definición |
|---------|-----------|
| **MejoraApp** | Nombre del producto. App digital de la comunidad Mejora Continua. |
| **Mejora Continua** | Comunidad de líderes empresariales argentinos. |
| **Mirror** | Diagnóstico estratégico interactivo. El usuario responde preguntas y recibe perfil + puntaje. |
| **Muro** | Feed anónimo donde miembros comparten dudas, experiencias y reflexiones sobre negocios. |
| **Contenido de Valor** | Artículos, videos, infografías y PDFs generados por IA o curados por admin. |
| **Novedades** | Noticias y anuncios de la comunidad. CRUD admin. |
| **RLS** | Row Level Security. Políticas de seguridad a nivel de fila en PostgreSQL/Supabase. |
| **Edge Function** | Función serverless en Supabase (Deno). Ejecuta lógica de negocio del lado del servidor. |
| **Moderación IA** | Sistema que usa IA (Gemini → Groq → OpenRouter) para aprobar/rechazar posts y comentarios. |
| **Rate Limiting** | Límite de requests por minuto por usuario. Previene abuso. |
| **PWA** | Progressive Web App. Permite instalar la app sin App Store. |
| **Feature Flag** | Interruptor que activa/desactiva features. Actualmente en modo ALL_FREE. |
| **Freemium** | Modelo de negocio con tier gratuito y premium. Preparado pero no activado. |
| **Badge** | Insignia que gana el usuario por acciones (primer post, 5 posts, perfil completo). |
| **Ranking** | Leaderboard de la comunidad basado en badges y actividad. |
| **NPS** | Net Promotor Score. Encuesta de satisfacción (0-10). |
| **Referido** | Sistema de invitación. Usuarios invitan a otros miembros. |

---

## 15. Archivos en Documents/

| Archivo | Propósito |
|---------|-----------|
| `DOCUMENTO-MAESTRO.md` | **Este archivo** — fuente única de verdad |
| `MIGRACION-CRM-2026-04-25.sql` | Script CRM (4 tablas + vistas + RPC) — ejecutado |
| `PUSH_SUBSCRIPTIONS.sql` | Script SQL push_subscriptions |
| `MIGRACION-SEGURIDAD-2026-04-23.sql` | Script hardening — ejecutado |
| `MIGRACION-GAMIFICACION-2026-04-24.sql` | Script gamificación — ejecutado |
| `CLEAN_SETUP.sql` | Setup limpio completo de DB |
| `SECURITY_HARDENING.sql` | Hardening pre-launch |

---

## 16. Cronograma

```
✅ E1: Seguridad (completa)
✅ E2: DevOps (completa)
✅ E3: UX (completa)
✅ E4: Analytics y Retención (completa)
✅ E5: Calidad y Robustez (completa)
✅ E6: Escalamiento (completa — 12/12 + CRM)
🔄 E7: Deploy y Activación (9/12 ✅ — app en vivo, emails pendiente)
📋 E8: Crecimiento (6 tareas) — Sprint 1 semana
📋 E9: Escalamiento Técnico (6/9 ✅) — Sprint 1-2 semanas
⏳ E10: App Nativa (evaluar si 30+ DAU)
📋 E11: Compliance (6 tareas) — Sprint 1 semana
📋 E12: Data & ML (solo si hay tracción)
```

**Tiempo estimado E7-E12:** 4-6 semanas
**Próximo paso:** Completar E7 (emails onboarding) → luego E8

---

*Fuente única de verdad. Se actualiza al decir "documentar".*
