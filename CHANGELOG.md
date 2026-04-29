# Changelog — MejoraApp

Todas las mejoras notables de este proyecto están documentadas aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

## [No publicado] — 2026-04-30

### Añadido
- **Funnel Tracking & NSM** (`src/lib/funnel.ts`): Sistema completo de tracking del funnel de activación.
  - Pasos: signup → onboarding_complete → first_visit → first_post → return_d1 → return_d7 → premium_intent
  - Integrado en AuthContext, Onboarding, Muro, Index.tsx, FeatureGate
  - Hook `useFunnel` para tracking automático del paso actual
- **Freemium Mode** (`src/lib/plans.ts`): Plan "freemium" con features diferenciados.
  - Free: 1 diagnóstico, sin PDF, sin historial, contenido base
  - Premium: diagnósticos ilimitados, PDF, historial, recomendaciones IA, contenido exclusivo
  - `PREMIUM_FEATURES` list para identificar qué requiere upgrade
  - `isPremium()` helper function
- **UpgradeModal** (`src/components/UpgradeModal.tsx`): Modal de upgrade con feature highlight y CTA.
- **MFA Enforcement** (`src/components/admin/AdminSecurityMFA.tsx`): Componente de advertencia para admins sin MFA.
  - Verifica estado de MFA via Supabase
  - Banner de advertencia con link a configuración
  - Integrado en la página Admin
- **SEO dinámico** (`src/components/SEOHead.tsx`): Meta tags dinámicos por ruta con react-helmet-async.
  - Open Graph tags para sharing en redes sociales
  - Twitter Card tags
  - Canonical URLs
  - Configs pre-definidos para cada página (index, auth, admin, 404)
- **ErrorBoundary** (`src/components/ErrorBoundary.tsx`): Ya existía, ahora integrado como wrapper en áreas principales.

### Cambiado
- **Muro.tsx refactorizado**: De 610 líneas monolíticas a componentes modulares.
  - `src/components/muro/PostCard.tsx` (169 líneas) — Tarjeta de post individual
  - `src/components/muro/CommentItem.tsx` (24 líneas) — Comentario individual
  - `src/components/muro/PostSkeleton.tsx` (17 líneas) — Skeleton loading
  - Muro.tsx reducido a 386 líneas como orquestador
- **DiagnosticTest.tsx refactorizado**: De 576 líneas a arquitectura por pasos.
  - `src/components/diagnostic/DiagnosticIntro.tsx` (82 líneas) — Pantalla de inicio
  - `src/components/diagnostic/DiagnosticQuestionView.tsx` (104 líneas) — Vista de pregunta con progress bar
  - `src/components/diagnostic/DiagnosticLoading.tsx` (11 líneas) — Estado de carga
  - `src/components/diagnostic/DiagnosticResultView.tsx` (236 líneas) — Resultado del diagnóstico
  - DiagnosticTest.tsx reducido a 188 líneas como orquestador con state machine
- **Edge Functions migradas a middleware compartido**:
  - `generate-content` — Ahora usa `withMiddleware` con auth admin
  - `send-push-notification` — Usa `withMiddleware` con `auth: false` (service_role)
  - `send-diagnostic-email` — Usa `withMiddleware` con `auth: false` (service_role)
  - Todas las 7 Edge Functions ahora usan el mismo patrón de middleware

### Arreglado
- Progress bar visible en el flujo del diagnóstico (pregunta X de 8)
- Tracking de funnel integrado en los puntos clave del journey

## [2026-04-29] — Sesión autodev completa

### Añadido
- 312 tests unitarios (de 103 originales)
- Services layer: `diagnostic.service.ts`, `wall.service.ts`, `content.service.ts`
- 11 schemas de validación zod
- Design tokens en tailwind.config (spacing, shadows, transitions)
- ARIA labels en BottomNav, AppHeader, Muro
- i18n English completo (160+ claves)
- PWA manifest mejorado (start_url, shortcuts, maskable icons)
- JSON-LD structured data para SEO
- Deploy verification script, Lighthouse CI, lint-staged
- PR template, CODEOWNERS, env.example
- Skeleton components (5 variantes)
- AdminCRM refactor (900→34 líneas)
- Health check post-deploy
- App en producción: app.mejoraok.com (HTTP 200)

## [2026-04-25] — E6 Escalamiento

### Añadido
- CORS centralizado
- CSP headers
- Rate limiting en Edge Functions
- Admin audit log
- Push notification triggers
- Admin whitelist
- Landing page
- Sistema de referidos
- CRM propio
- NPS survey
- Repository Layer
- i18n (es/en)
- Bundle analysis

## [2026-04-24] — E3-E5

### Añadido
- Onboarding progresivo (4 pasos con skip)
- Diagnóstico mejorado (Mirror)
- Muro: eliminar propios posts
- PostHog analytics (28+ eventos)
- Push web + email post-diagnóstico
- Gamificación (8 badges + ranking)
- Servicios con CTA WhatsApp
- Legal: privacidad, términos, cookies, "Mis Datos"
- E2E Playwright (25 tests)
- axe-core accessibility (7 tests)

## [2026-04-23] — E1-E2 Seguridad y Arquitectura

### Añadido
- RLS en todas las tablas
- Edge Functions como gatekeeper admin
- Migraciones SQL (12 archivos)
- Tests de integración (103+)
- Rollback via Vercel
- PWA real
- Staging via rama develop
- Sentry error monitoring
