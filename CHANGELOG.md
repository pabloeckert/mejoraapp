# Changelog — MejoraApp

Todas las mejoras notables de este proyecto están documentadas aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

## [No publicado] — 2026-05-07

### Eliminado
- **`1-App Comunidad de Negocios/`**: 23 archivos de documentación legacy (.docx, .pdf, .html, .md, .txt) — 2.4MB de basura del repo
- **`SESSION-STATE.md`**: Archivo de estado operacional, no pertenece al repo de código
- **`CONTINUATION-PROMPT.md`**: Template de prompt, no es código
- **`ProPlan.md`**: Template de prompt para Lovable, no es código

### Añadido
- **`useProfile` hook** (`src/hooks/useProfile.ts`): Hook con React Query para datos de perfil con caching de 5min. Elimina queries directas duplicadas a Supabase.

### Cambiado
- **`Index.tsx`**: Refactorizado para usar `useProfileComplete` hook en lugar de queries directas a Supabase. Reduce llamadas a la DB y mejora caching.
- **`AppHeader.tsx`**: Usa `useProfile` hook en lugar de query directa a Supabase para obtener iniciales del usuario.
- **`useMentor.ts`**: Añadida función `loadConversation(id)` para seleccionar conversaciones existentes sin window events.
- **`Mentor.tsx`**: Eliminado patrón frágil de `window.dispatchEvent(CustomEvent)` para selección de conversaciones. Ahora usa `loadConversation` del hook directamente. Añadido `aria-live="polite"` al área de contenido.
- **`index.html`**: Eliminado preconnect hardcodeado a URL placeholder de Supabase.
- **`.env.example`**: Corregido valor de ejemplo que parecía un JWT real.
- **`.gitignore`**: Añadidos patrones para prevenir re-adição de archivos .docx, .pdf, .pptx, .xlsx y directorios legacy.

## [No publicado] — 2026-05-06

### Añadido
- **RouteErrorBoundary** (`src/components/RouteErrorBoundary.tsx`): Error boundary por ruta para aislar fallos
- **PageLoadingSkeleton** (`src/components/PageLoadingSkeleton.tsx`): Skeleton UI profesional para carga de rutas lazy
- **Rate Limiter** (`src/lib/rateLimit.ts`): Sistema de rate limiting client-side con sliding window
- **Security Utilities** (`src/lib/security.ts`): Sanitización de HTML, URLs y textos de usuario
- **useDebounce hook** (`src/hooks/useDebounce.ts`): Debounce de valores para búsquedas
- **useLocalStorage hook** (`src/hooks/useLocalStorage.ts`): localStorage tipado con sync cross-tab
- **Vercel config** (`vercel.json`): Headers de seguridad (CSP, HSTS, X-XSS-Protection), cache strategy, SPA rewrites
- **Lighthouse CI config** (`.lighthouserc.json`): Assertions de performance y accessibility
- **`.nvmrc`**: Node 22 para consistencia de entorno
- **Documentación completa**:
  - `README.md` reescrito con setup, arquitectura, stack, deploy
  - `ARCHITECTURE.md`: Arquitectura por capas, state management, CI/CD
  - `SECURITY.md`: Política de seguridad completa
  - `CONTRIBUTING.md`: Guía de contribución
  - `MEJORAS-APLICADAS.md`: Auditoría multidisciplinaria (40+ perspectivas)
- **i18n**: Keys faltantes para comunidad, pull-to-refresh, resultado diagnóstico

### Cambiado
- **tsconfig.json**: `strict: true`, `forceConsistentCasingInFileNames`, `resolveJsonModule`, `esModuleInterop`
- **vite.config.ts**: ESM-correct import para rollup-plugin-visualizer (antes usaba `require()`), hidden sourcemaps
- **Supabase client** (`src/integrations/supabase/client.ts`):
  - PKCE flow (más seguro para SPAs)
  - Fetch timeout global de 30s
  - Realtime rate limiting (eventsPerSecond: 10)
  - `detectSessionInUrl: true` para OAuth
- **Password validation** (`src/lib/validation.ts`): Mínimo 8 caracteres, 1 mayúscula, 1 número (antes solo 6 chars)
- **App.tsx**: Route-level Error Boundaries, PageLoadingSkeleton (antes spinner genérico)
- **main.tsx**: Root element check con fallback, SW error logging
- **Providers.tsx**: Fix duplicate CookieConsent import, mutation retry: 0
- **Content service** (`src/services/content.service.ts`): Fix duplicate `as unknown as unknown` type assertion
- **Service Worker** (`public/sw.js`):
  - Paths corregidos (antes `/app/`, ahora `/`)
  - Estrategia diferenciada: cache-first para assets hashed, network-first para navigation
  - Offline fallback funcional
- **CI workflow** (`.github/workflows/ci.yml`):
  - Type checking con `tsc --noEmit`
  - `.nvmrc` para Node version
  - Bundle size verification
- **Deploy workflow** (`.github/workflows/deploy.yml`):
  - Tests ahora BLOQUEAN el deploy (antes: `|| echo "::warning::"`)

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
