# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos frecuentes

```bash
npm run dev             # Servidor local en http://localhost:8080
npm run build           # Build de producción → dist/
npm run build:staging   # Build en modo staging
npm run lint            # ESLint (0 warnings tolerados)
npm run test            # Vitest (una sola pasada)
npm run test:watch      # Vitest en modo watch
npm run test:coverage   # Vitest con reporte de cobertura
npm run test:e2e        # Playwright headless
npm run test:e2e:ui     # Playwright con UI de debug
npm run test:e2e:headed # Playwright con browser visible
```

## Arquitectura

**MejoraApp** es una PWA para líderes empresariales argentinos. Stack: React 18 + TypeScript + Vite + Supabase + Tailwind CSS. Deploy en Vercel (producción: `app.mejoraok.com`).

### Capas

```
Pages (6, lazy-loaded)
  └─ Components (101, organizados por dominio)
       └─ Hooks (16 custom, wrappean servicios con React Query)
            └─ Services (6 módulos de lógica de negocio)
                 └─ Supabase (Auth, DB, Realtime, Edge Functions)
```

### Routing y entry points

- `src/main.tsx` — inicializa Sentry, PostHog y Service Worker
- `src/App.tsx` — define rutas con lazy-loading
- `src/components/Providers.tsx` — compone 7+ providers (Auth, Theme, I18n, QueryClient, etc.)

Las 6 páginas: `/` (Index), `/splash`, `/auth`, `/reset-password`, `/admin`, `*` (NotFound).

### Estado

- **Server state** → React Query (`staleTime: 2min`, `retry: 1`, `refetchOnWindowFocus: false`)
- **Client state** → Contexts (`AuthContext`, `ThemeContext`, `I18nContext`)
- **Local state** → `localStorage` (progreso de diagnóstico, funnel stage, rate limit timestamps)
- **Realtime** → suscripciones Supabase a `wall_posts`, `wall_comments`, `user_badges`

### Servicios

| Archivo | Responsabilidad |
|---------|----------------|
| `wall.service.ts` | Posts, comments, likes, realtime |
| `content.service.ts` | Fetch, búsqueda y recomendaciones de contenido |
| `diagnostic.service.ts` | Preguntas y resultados del Mirror |
| `business-mirror.service.ts` | Lógica del Business Mirror Game |
| `tiendup.service.ts` | Integración TienUp |

### Componentes por dominio

`src/components/` contiene subcarpetas: `admin/`, `auth/`, `diagnostic/`, `home/`, `mentor/`, `mirror/`, `muro/`, `community/`, `tabs/`, y `ui/` (primitivos shadcn/ui).

## Variables de entorno

Copiar `.env.example` como `.env.local`. Variables requeridas:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_ENVIRONMENT` (`development` | `staging` | `production`)

Opcionales: `VITE_POSTHOG_KEY`, `VITE_SENTRY_DSN`, `VITE_VAPID_PUBLIC_KEY`.

## Supabase

El cliente está en `src/integrations/supabase/client.ts`. Los tipos de la DB se generan automáticamente en `src/integrations/supabase/types.ts` — no editar a mano.

Las Edge Functions están en `supabase/functions/`. Se despliegan con el workflow `deploy-functions.yml`.

## Testing

- **Unitarios**: Vitest con jsdom. Setup en `src/test/setup.ts`. Umbrales: 70% branches, 25% en el resto.
- **E2E**: Playwright. Targets: Desktop Chrome + Pixel 5. No corren en paralelo.
- **Performance**: Lighthouse CI (`accessibility ≥ 90%`, `performance ≥ 70%`).

Para correr un solo test unitario: `npx vitest run src/test/nombre.test.ts`

## Convenciones

- Alias `@/` apunta a `src/`. Usarlo siempre en lugar de rutas relativas largas.
- Validación con **Zod** en todos los formularios (ver `src/lib/validation.ts`).
- Sanitización HTML con **DOMPurify** (`src/lib/security.ts`) antes de renderizar contenido externo.
- Rate limiting client-side en `src/lib/rateLimit.ts`.
- Los tipos globales de la aplicación están en `src/types/`.

## CI/CD

Push a `main` → deploy automático en Vercel (producción).
Push a `develop` → deploy en staging.

El pipeline de CI (`ci.yml`) corre: `tsc --noEmit` → lint → tests → build → check de bundle size (límite: 5 MB).

Pre-commit via Husky + lint-staged: ESLint en `.ts/.tsx`, Prettier en `.json/.md/.css/.html`.
