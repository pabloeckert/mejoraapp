# Arquitectura — MejoraApp

## Visión General

MejoraApp es una SPA (Single Page Application) progresiva construida como PWA. Usa una arquitectura por capas con separación clara de responsabilidades.

```
┌─────────────────────────────────────────────────┐
│                    UI Layer                       │
│  Pages → Components → shadcn/ui                  │
├─────────────────────────────────────────────────┤
│                  Hooks Layer                      │
│  Custom hooks (useAuth, useDebounce, etc.)        │
├─────────────────────────────────────────────────┤
│                Services Layer                     │
│  wallService, contentService, diagnosticService   │
├─────────────────────────────────────────────────┤
│              Integration Layer                    │
│  Supabase Client (auto-generated types)           │
├─────────────────────────────────────────────────┤
│                Backend (Supabase)                  │
│  PostgreSQL + Auth + Realtime + Edge Functions     │
└─────────────────────────────────────────────────┘
```

---

## Principios de Diseño

1. **Services > Direct DB calls** — Los componentes nunca llaman a Supabase directamente
2. **Types from Supabase** — Los tipos se generan desde el schema de DB
3. **Zod at boundaries** — Validación en todos los inputs de usuario
4. **Lazy loading** — Rutas se cargan bajo demanda
5. **Error boundaries** — Aislamiento de errores por ruta
6. **Realtime via subscriptions** — Updates en tiempo real para muro y badges

---

## Directorios Clave

### `src/components/`

Componentes organizados por dominio:

```
components/
├── admin/              # Paneles de administración
│   ├── AdminCRM.tsx    # CRM con lazy loading
│   ├── AdminIA.tsx     # Gestión de IA
│   ├── AdminMuro.tsx   # Moderación del muro
│   └── crm/            # Sub-componentes del CRM
├── auth/               # Autenticación
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── GoogleButton.tsx
│   └── AdminLoginForm.tsx
├── diagnostic/         # Flujo del Mirror
│   ├── DiagnosticIntro.tsx
│   ├── DiagnosticQuestionView.tsx
│   ├── DiagnosticLoading.tsx
│   └── DiagnosticResultView.tsx
├── mentor/             # Chat del Mentor IA
│   ├── MentorChat.tsx
│   ├── MentorMessage.tsx
│   ├── MentorWelcome.tsx
│   └── MentorHistory.tsx
├── muro/               # Posts y comentarios
│   ├── PostCard.tsx
│   ├── CommentItem.tsx
│   └── PostSkeleton.tsx
├── community/          # Comunidad
│   ├── MemberCard.tsx
│   └── CommunityProfile.tsx
├── tabs/               # Tabs principales
│   ├── ContenidoDeValor.tsx
│   ├── Muro.tsx
│   ├── Comunidad.tsx
│   ├── Mentor.tsx
│   └── Novedades.tsx
└── ui/                 # Componentes base (shadcn/ui)
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    └── ... (30+ componentes)
```

### `src/lib/`

Lógica de negocio y utilidades:

```
lib/
├── ab-testing.ts       # Sistema de A/B testing
├── analytics.ts        # PostHog event tracking
├── funnel.ts           # Funnel de activación (NSM)
├── plans.ts            # Feature flags y planes
├── pdfExport.ts        # Exportación de PDF
├── push.ts             # Web Push notifications
├── rateLimit.ts        # Rate limiting client-side
├── security.ts         # Sanitización y XSS prevention
├── sentry.ts           # Error tracking
├── utils.ts            # cn() helper
└── validation.ts       # Zod schemas
```

### `src/services/`

Capa de abstracción sobre Supabase:

```
services/
├── index.ts            # Re-exports
├── wall.service.ts     # Muro: posts, comments, likes, realtime
├── content.service.ts  # Contenido: fetch, search, filter, recommendations
└── diagnostic.service.ts # Mirror: questions, results, history
```

### `src/hooks/`

Custom hooks reutilizables:

```
hooks/
├── use-toast.ts        # Toast notifications
├── useDebounce.ts      # Debounce de valores
├── useLocalStorage.ts  # localStorage tipado con sync cross-tab
├── useFeatureAccess.ts # Verificación de features premium
├── useBadges.ts        # Badges del usuario con realtime
├── useProfile.ts       # Perfil de usuario con React Query (5min cache)
├── usePullToRefresh.ts # Pull-to-refresh para móvil
├── useMentor.ts        # Chat del Mentor IA + historial de conversaciones
├── useWallInteractions.ts # Likes y comentarios
├── useRanking.ts       # Ranking de comunidad
├── useMembers.ts       # Directorio de miembros
├── useAdminAction.ts   # Acciones de admin
├── useLastVisit.ts     # Tracking de visitas
├── useContentRecommendations.ts # Recomendaciones
└── useCRM.ts           # CRM data
```

---

## State Management

### Server State → React Query

- Queries para fetch de datos
- Mutations para writes
- `staleTime: 2min` para reducir refetches
- `retry: 1` para queries, `retry: 0` para mutations

### Client State → React Context

- `AuthContext` — Sesión y usuario
- `ThemeContext` — Dark/light mode
- `I18nContext` — Idioma y traducciones

### Local State → localStorage

- Progreso del diagnóstico
- Funnel stage
- A/B test assignments
- Cookie consent
- Rate limit timestamps

---

## Autenticación

```
Usuario → AuthContext → Supabase Auth
                            │
                            ├─ Email/Password (PKCE)
                            ├─ Google OAuth
                            └─ Magic Link
                            
Admin → AdminLoginForm → verify-admin Edge Function → Role check
```

### Flujo de Admin

1. Login con credenciales de admin
2. `verify-admin` Edge Function verifica rol en DB
3. Session flag en sessionStorage (4h TTL)
4. Re-verificación en cada carga de `/admin`

---

## Base de Datos

### Tablas Principales (25)

| Tabla | Propósito |
|-------|-----------|
| `profiles` | Perfiles de usuario |
| `wall_posts` | Posts del muro anónimo |
| `wall_comments` | Comentarios en posts |
| `wall_likes` | Likes en posts |
| `content_posts` | Contenido de valor |
| `content_categories` | Categorías de contenido |
| `diagnostic_results` | Resultados del Mirror |
| `user_badges` | Badges ganados |
| `push_subscriptions` | Suscripciones push |
| `mentor_conversations` | Conversaciones con Mentor IA |
| `crm_clients` | Clientes del CRM |
| `crm_products` | Productos del CRM |
| `crm_interactions` | Interacciones del CRM |
| `community_challenges` | Desafíos de comunidad |
| `nps_surveys` | Encuestas NPS |

### Realtime Subscriptions

- `wall_posts` → INSERT (nuevos posts en tiempo real)
- `wall_comments` → INSERT (nuevos comentarios)
- `user_badges` → INSERT (badges desbloqueados)

---

## Edge Functions (Supabase)

| Función | Auth | Propósito |
|---------|------|-----------|
| `moderate-post` | Usuario | Moderación IA de posts |
| `moderate-comment` | Usuario | Moderación IA de comentarios |
| `verify-admin` | Admin | Verificación de rol admin |
| `admin-action` | Admin | Acciones administrativas |
| `generate-content` | Admin | Generación de contenido con IA |
| `mentor-chat` | Usuario | Chat con Mentor IA |
| `send-push-notification` | Service | Envío de push notifications |
| `send-diagnostic-email` | Service | Email post-diagnóstico |
| `send-onboarding-email` | Service | Email de onboarding |

---

## CI/CD Pipeline

```
PR a main / Push a develop
         │
         ▼
┌─────────────────────┐
│  GitHub Actions CI   │
│  1. npm ci           │
│  2. tsc --noEmit     │
│  3. npm run lint     │
│  4. npm run test     │
│  5. npm run build    │
│  6. Bundle size check│
└─────────────────────┘
         │
    Push a main
         │
         ▼
┌─────────────────────┐
│  Deploy Production   │
│  1. Tests (blocking) │
│  2. Build            │
│  3. Vercel auto-deploy│
│  4. Health check     │
└─────────────────────┘
```

---

## Performance

### Bundle Splitting

```
vendor-react.js     → React, React DOM, React Router
vendor-ui.js        → Radix UI components
vendor-supabase.js  → Supabase client
vendor-query.js     → React Query
vendor-charts.js    → Recharts
[index].js          → App code
```

### Lazy Loading

- Todas las rutas se cargan con `lazy()`
- `Suspense` con `PageLoadingSkeleton`
- Admin CRM con lazy loading adicional

### Caching

- React Query: 2min stale time
- Service Worker: cache-first para assets hashed
- Service Worker: network-first para navigation
- Supabase: localStorage para auth session

---

## Convenciones

### Nombres de Archivos

- Componentes: `PascalCase.tsx` (ej: `PostCard.tsx`)
- Hooks: `camelCase.ts` con prefijo `use` (ej: `useDebounce.ts`)
- Utilidades: `camelCase.ts` (ej: `rateLimit.ts`)
- Servicios: `camelCase.service.ts` (ej: `wall.service.ts`)
- Tipos: `camelCase.ts` (ej: `crm.ts`)

### Imports

```typescript
// Absolute imports con @/
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
```

### CSS

- Tailwind CSS utility classes
- Design tokens via CSS variables (HSL)
- `cn()` helper para conditional classes
- Mobile-first responsive design
