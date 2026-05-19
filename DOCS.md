# 📘 Documentación Técnica Completa — MejoraApp

> **Versión:** 2026.1  
> **Última actualización:** Mayo 2026  
> **Estado:** Producción Activa  
> **Sitio:** [app.mejoraok.com](https://app.mejoraok.com)

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Stack Tecnológico Detallado](#3-stack-tecnológico-detalhado)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Módulos y Funcionalidades](#5-módulos-y-funcionalidades)
6. [Base de Datos](#6-base-de-datos)
7. [Edge Functions](#7-edge-functions)
8. [Seguridad](#8-seguridad)
9. [Testing y Calidad](#9-testing-y-calidad)
10. [CI/CD y Deploy](#10-cicd-y-deploy)
11. [Performance y Optimización](#11-performance-y-optimización)
12. [Internacionalización](#12-internacionalización)
13. [PWA y Offline](#13-pwa-y-offline)
14. [Analytics y Tracking](#14-analytics-y-tracking)
15. [Guía para Desarrolladores](#15-guía-para-desarrolladores)
16. [API Reference](#16-api-reference)
17. [Troubleshooting](#17-troubleshooting)

---

## 1. Resumen Ejecutivo

### 1.1 Propósito del Proyecto

**MejoraApp** es una plataforma digital integral diseñada para líderes empresariales argentinos que buscan optimizar sus negocios mediante herramientas de diagnóstico, comunidad y mentoría inteligente. La aplicación combina:

- **Diagnóstico Empresarial** — Business Mirror Game de 8 dimensiones
- **Comunidad Privada** — Muro anónimo moderado por IA
- **Contenido Curado** — Artículos, videos e infografías de valor
- **Mentor IA** — Asistente de negocios conversacional
- **CRM Integrado** — Gestión de clientes y productos
- **Sistema de Membresías** — Planes Free y Premium con TienUp

### 1.2 Métricas Clave

| Métrica | Valor |
|---------|-------|
| Componentes React | 101+ |
| Custom Hooks | 17 |
| Servicios | 6 |
| Edge Functions | 14 |
| Tablas de BD | 25+ |
| Tests Unitarios | 103+ |
| Líneas de Código (src/) | ~2,777 (solo tests) |
| Archivos TypeScript/TSX | 178 |

### 1.3 Público Objetivo

- Dueños de PYMEs argentinas
- Emprendedores en etapa de crecimiento
- Consultores de negocios
- Ejecutivos C-level

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Pages (6 rutas lazy-loaded con Suspense)           │    │
│  │  / · /splash · /auth · /reset-password · /admin · * │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Components (101 componentes organizados por dominio)│    │
│  │  admin/ · auth/ · diagnostic/ · mentor/ · muro/     │    │
│  │  community/ · tabs/ · ui/ (shadcn primitives)       │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                      STATE MANAGEMENT                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ React Query  │  │  Context API │  │ localStorage │      │
│  │ Server State │  │ Client State │  │ Persistence  │      │
│  │ stale: 2min  │  │ Auth/Theme/  │  │ Rate Limits  │      │
│  │ retry: 1     │  │ I18n         │  │ Funnel Stage │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                    BUSINESS LOGIC LAYER                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Custom Hooks (17 hooks reutilizables)              │    │
│  │  useAuth · useProfile · useMentor · useWall...      │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Services (6 módulos de lógica de negocio)          │    │
│  │  wall.service.ts · content.service.ts               │    │
│  │  diagnostic.service.ts · business-mirror.service.ts │    │
│  │  tiendup.service.ts · wall.service.ts               │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                   INTEGRATION LAYER                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Supabase Client (auto-generated types)             │    │
│  │  src/integrations/supabase/client.ts                │    │
│  │  Realtime subscriptions · Auth · RPC calls          │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Edge Functions (14 funciones serverless)           │    │
│  │  moderate-post · mentor-chat · verify-admin...      │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                      BACKEND LAYER                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Supabase (PostgreSQL + Auth + Realtime + Storage)  │    │
│  │  25+ tablas · Row Level Security · Triggers         │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  External Services                                  │    │
│  │  TienUp (pagos) · SendGrid (emails) · Web Push      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de Datos

#### 2.2.1 Lectura de Datos (Query Flow)

```typescript
// Ejemplo: Obtener posts del muro
Component (Muro.tsx)
    ↓ llama a hook
useWallInteractions()
    ↓ usa React Query
useQuery(['wall-posts'], wallService.getPosts())
    ↓ servicio hace query
wallService.getPosts() → supabase.from('wall_posts').select(...)
    ↓ Supabase retorna datos
PostgreSQL → RLS check → Data → Cache (2min) → UI
```

#### 2.2.2 Escritura de Datos (Mutation Flow)

```typescript
// Ejemplo: Publicar post
Component (Muro.tsx)
    ↓ submit form
useMutation(wallService.createPost(data))
    ↓ validación Zod
validationSchema.parse(data)
    ↓ servicio inserta
wallService.createPost() → supabase.from('wall_posts').insert()
    ↓ trigger de BD
DB Trigger → moderate-post Edge Function
    ↓ respuesta IA
Moderation result → Post aprobado/rechazado
    ↓ realtime broadcast
Realtime subscription → Todos los clientes actualizados
```

### 2.3 Patrones de Diseño Implementados

| Patrón | Implementación | Ubicación |
|--------|---------------|-----------|
| **Repository** | Services abstraen acceso a DB | `src/services/*.ts` |
| **Provider** | Context API para estado global | `src/contexts/*.tsx` |
| **HOC** | Error boundaries y feature gates | `src/components/*Boundary.tsx` |
| **Strategy** | Diferentes estrategias de cache | React Query config |
| **Observer** | Realtime subscriptions | Supabase channels |
| **Factory** | Generación de contenido IA | `src/lib/pdfExport.ts` |
| **Singleton** | Supabase client | `src/integrations/supabase/client.ts` |

---

## 3. Stack Tecnológico Detallado

### 3.1 Frontend Core

| Tecnología | Versión | Propósito | Configuración Clave |
|------------|---------|-----------|---------------------|
| **React** | 18.3.1 | Framework UI | Concurrent features, Suspense |
| **TypeScript** | 5.8.3 | Type safety | `strict: true`, paths alias |
| **Vite** | 5.4.19 | Build tool & dev server | SWC, HMR, code splitting |
| **React Router** | 6.30.1 | Client-side routing | Lazy routes, nested routes |

### 3.2 UI & Styling

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Tailwind CSS** | 3.4.17 | Utility-first CSS |
| **shadcn/ui** | Latest | Componentes accesibles (30+) |
| **Radix UI** | Varios | Primitivos sin estilos |
| **Lucide React** | 0.462.0 | Iconos (600+ disponibles) |
| **class-variance-authority** | 0.7.1 | Variantes de componentes |

### 3.3 State Management

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **TanStack Query** | 5.83.0 | Server state (caching, sync) |
| **React Context** | Built-in | Auth, Theme, I18n |
| **localStorage** | Native | Persistencia cliente |

### 3.4 Backend & Infraestructura

| Servicio | Propósito | Configuración |
|----------|-----------|---------------|
| **Supabase** | BaaS completo | PostgreSQL 15, Auth, Realtime, Edge Functions |
| **Vercel** | Hosting & CDN | Auto-deploy, preview deployments |
| **GitHub Actions** | CI/CD | Tests, build, deploy automation |

### 3.5 Testing & Quality

| Herramienta | Versión | Tipo | Cobertura |
|-------------|---------|------|-----------|
| **Vitest** | 3.2.4 | Unit tests | 70% branches mínimo |
| **Playwright** | 1.59.1 | E2E tests | Desktop + Mobile |
| **Lighthouse CI** | Latest | Performance | ≥90% accessibility |
| **ESLint** | 9.32.0 | Linting | 0 errors tolerados |

### 3.6 Analytics & Monitoring

| Servicio | Propósito | Eventos Trackeados |
|----------|-----------|-------------------|
| **PostHog** | Product analytics | Funnels, retention, feature usage |
| **Sentry** | Error tracking | Unhandled exceptions, performance |

### 3.7 Dependencias Principales

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",      // Zod integration
    "@radix-ui/*": "^1.x",                 // UI primitives (15 paquetes)
    "@sentry/react": "^8.55.0",            // Error tracking
    "@supabase/supabase-js": "^2.103.2",   // Supabase client
    "@tanstack/react-query": "^5.83.0",    // Server state
    "dompurify": "^3.4.3",                 // XSS prevention
    "jspdf": "^2.5.2",                     // PDF generation
    "posthog-js": "^1.240.0",              // Analytics
    "react-hook-form": "^7.61.1",          // Form handling
    "recharts": "^2.15.4",                 // Charts & graphs
    "sonner": "^1.7.4",                    // Toast notifications
    "zod": "^3.25.76"                      // Schema validation
  }
}
```

---

## 4. Estructura del Proyecto

### 4.1 Árbol de Directorios Completo

```
/workspace
├── .github/                          # GitHub workflows y templates
│   ├── CODEOWNERS                    # Dueños del código
│   ├── PULL_REQUEST_TEMPLATE.md      # Template para PRs
│   └── workflows/
│       ├── ci.yml                    # CI pipeline principal
│       ├── deploy.yml                # Deploy a producción
│       ├── deploy-staging.yml        # Deploy a staging
│       ├── deploy-functions.yml      # Deploy Edge Functions
│       ├── deploy-ghpages.yml        # Deploy GitHub Pages
│       ├── lighthouse.yml            # Lighthouse audits
│       └── onboarding-emails.yml     # Emails automatizados
│
├── .husky/                           # Git hooks
├── .claude/                          # Configuración Claude Code
├── .env.example                      # Variables de entorno template
├── .env.staging.example              # Variables para staging
├── .gitignore                        # Archivos ignorados por Git
├── .lighthouserc.json                # Configuración Lighthouse CI
├── .lintstagedrc.json                # Archivos para lint-staged
├── .nvmrc                            # Versión de Node (22)
├── .vercelignore                     # Archivos ignorados por Vercel
│
├── Documents/                        # Documentación adicional
│   └── MEJORAAPP.md                  # Docs internas
│
├── design/                           # Assets de diseño
│
├── e2e/                              # Tests E2E de Playwright
│   └── *.spec.ts                     # Especificaciones E2E
│
├── public/                           # Assets estáticos
│   ├── sw.js                         # Service Worker
│   ├── manifest.json                 # PWA manifest
│   └── icons/                        # Íconos de la app
│
├── scripts/                          # Scripts de utilidad
│
├── src/                              # Código fuente principal
│   ├── App.tsx                       # Root component con routing
│   ├── main.tsx                      # Entry point
│   ├── index.css                     # Estilos globales
│   ├── vite-env.d.ts                 # Tipos de Vite
│   │
│   ├── assets/                       # Imágenes y recursos
│   │   ├── logo-comunidad.png
│   │   ├── logo-horizontal.png
│   │   ├── chica.png
│   │   └── chico.png
│   │
│   ├── components/                   # Componentes React (101+)
│   │   ├── admin/                    # Panel de administración
│   │   │   ├── AdminCRM.tsx          # CRM con lazy loading
│   │   │   ├── AdminIA.tsx           # Gestión de IA
│   │   │   ├── AdminMuro.tsx         # Moderación del muro
│   │   │   └── crm/                  # Sub-componentes CRM
│   │   │
│   │   ├── auth/                     # Autenticación
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── GoogleButton.tsx
│   │   │   └── AdminLoginForm.tsx
│   │   │
│   │   ├── community/                # Comunidad y perfiles
│   │   │   ├── MemberCard.tsx
│   │   │   └── CommunityProfile.tsx
│   │   │
│   │   ├── diagnostic/               # Flujo del Mirror
│   │   │   ├── DiagnosticIntro.tsx
│   │   │   ├── DiagnosticQuestionView.tsx
│   │   │   ├── DiagnosticLoading.tsx
│   │   │   └── DiagnosticResultView.tsx
│   │   │
│   │   ├── home/                     # Home page components
│   │   │
│   │   ├── mentor/                   # Chat Mentor IA
│   │   │   ├── MentorChat.tsx
│   │   │   ├── MentorMessage.tsx
│   │   │   ├── MentorWelcome.tsx
│   │   │   └── MentorHistory.tsx
│   │   │
│   │   ├── mirror/                   # Business Mirror Game
│   │   │
│   │   ├── muro/                     # Muro anónimo
│   │   │   ├── PostCard.tsx
│   │   │   ├── CommentItem.tsx
│   │   │   └── PostSkeleton.tsx
│   │   │
│   │   ├── tabs/                     # Tabs principales
│   │   │   ├── ContenidoDeValor.tsx
│   │   │   ├── Muro.tsx
│   │   │   ├── Comunidad.tsx
│   │   │   ├── Mentor.tsx
│   │   │   └── Novedades.tsx
│   │   │
│   │   ├── ui/                       # shadcn/ui primitives (30+)
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton-variants.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   └── tooltip.tsx
│   │   │
│   │   ├── AccessGate.tsx            # Control de acceso por nivel
│   │   ├── AppHeader.tsx             # Header principal
│   │   ├── BottomNav.tsx             # Navegación móvil
│   │   ├── CommunityRanking.tsx      # Ranking de miembros
│   │   ├── CommunityRules.tsx        # Reglas de comunidad
│   │   ├── ContentGate.tsx           # Gate para contenido premium
│   │   ├── CookieConsent.tsx         # Consentimiento de cookies
│   │   ├── DataManagement.tsx        # Gestión de datos personales
│   │   ├── DiagnosticTest.tsx        # Test de diagnóstico
│   │   ├── ErrorBoundary.tsx         # Error boundary global
│   │   ├── FeatureBoundary.tsx       # Feature flag boundary
│   │   ├── FeatureGate.tsx           # Gate para features premium
│   │   ├── MembershipBadge.tsx       # Badge de membresía
│   │   ├── NavLink.tsx               # Link de navegación
│   │   ├── NotificationToggle.tsx    # Toggle de notificaciones
│   │   ├── PageLoadingSkeleton.tsx   # Skeleton de carga
│   │   ├── ProfileCompleteModal.tsx  # Modal de perfil completo
│   │   ├── Providers.tsx             # Root providers
│   │   ├── ReportDialog.tsx          # Diálogo de reportes
│   │   ├── RouteErrorBoundary.tsx    # Error boundary por ruta
│   │   ├── SEOHead.tsx               # SEO meta tags
│   │   ├── Servicios.tsx             # Página de servicios
│   │   ├── UpgradeModal.tsx          # Modal de upgrade
│   │   ├── UpgradePrompt.tsx         # Prompt de upgrade
│   │   └── UserProfile.tsx           # Perfil de usuario
│   │
│   ├── contexts/                     # React Contexts
│   │   ├── AuthContext.tsx           # Autenticación y sesión
│   │   ├── I18nContext.tsx           # Internacionalización
│   │   └── ThemeContext.tsx          # Tema claro/oscuro
│   │
│   ├── data/                         # Datos estáticos
│   │   ├── businessMirrorTests.ts    # Preguntas del Mirror
│   │   └── diagnosticData.ts         # Datos de diagnóstico
│   │
│   ├── hooks/                        # Custom hooks (17)
│   │   ├── use-toast.ts              # Toast notifications
│   │   ├── useAccessLevel.ts         # Nivel de acceso de usuario
│   │   ├── useAdminAction.ts         # Acciones de admin
│   │   ├── useContentRecommendations.ts # Recomendaciones de contenido
│   │   ├── useDebounce.ts            # Debounce utility
│   │   ├── useFeatureAccess.ts       # Acceso a features premium
│   │   ├── useLastVisit.ts           # Tracking de última visita
│   │   ├── useLocalStorage.ts        # localStorage tipado
│   │   ├── useMembers.ts             # Miembros de comunidad
│   │   ├── useMembership.ts          # Estado de membresía
│   │   ├── useMentor.ts              # Chat del Mentor IA
│   │   ├── useMirrorResults.ts       # Resultados del Mirror
│   │   ├── usePayments.ts            # Pagos y suscripciones
│   │   ├── useProfile.ts             # Perfil de usuario
│   │   ├── usePullToRefresh.ts       # Pull-to-refresh móvil
│   │   ├── useRanking.ts             # Ranking de comunidad
│   │   └── useWallInteractions.ts    # Interacciones del muro
│   │
│   ├── i18n/                         # Internacionalización
│   │   └── locales/
│   │       └── index.ts              # Keys y traducciones
│   │
│   ├── integrations/                 # Integraciones externas
│   │   └── supabase/
│   │       ├── client.ts             # Cliente de Supabase
│   │       └── types.ts              # Tipos generados de DB
│   │
│   ├── lib/                          # Utilidades y lógica core
│   │   ├── ab-testing.ts             # Sistema A/B testing
│   │   ├── analytics.ts              # PostHog tracking
│   │   ├── brand.ts                  # Configuración de marca
│   │   ├── pdfExport.ts              # Exportación a PDF
│   │   ├── plans.ts                  # Feature flags y planes
│   │   ├── push.ts                   # Web Push notifications
│   │   ├── rateLimit.ts              # Rate limiting client-side
│   │   ├── security.ts               # Sanitización y XSS prevention
│   │   ├── sentry.ts                 # Sentry error tracking
│   │   ├── utils.ts                  # Utilidades (cn helper)
│   │   └── validation.ts             # Zod schemas
│   │
│   ├── pages/                        # Páginas/rutas
│   │   ├── Admin.tsx                 # Panel de administración
│   │   ├── Auth.tsx                  # Login/Registro
│   │   ├── Index.tsx                 # Home page
│   │   ├── NotFound.tsx              # 404 page
│   │   ├── ResetPassword.tsx         # Reset de contraseña
│   │   └── Splash.tsx                # Splash screen
│   │
│   ├── repositories/                 # Repositorio pattern
│   │   └── index.ts                  # Re-exports
│   │
│   ├── services/                     # Capa de servicios (6)
│   │   ├── business-mirror.service.ts # Lógica del Mirror Game
│   │   ├── content.service.ts        # Gestión de contenido
│   │   ├── diagnostic.service.ts     # Diagnóstico empresarial
│   │   ├── index.ts                  # Re-exports
│   │   ├── tiendup.service.ts        # Integración TienUp
│   │   └── wall.service.ts           # Muro y interacciones
│   │
│   └── test/                         # Tests unitarios (103+)
│       ├── setup.ts                  # Configuración de tests
│       ├── admin.test.ts             # Tests de admin
│       ├── authAndAdmin.test.ts      # Auth y admin
│       ├── components.test.tsx       # Tests de componentes
│       ├── diagnosticData.test.ts    # Datos de diagnóstico
│       ├── diagnosticDeep.test.ts    # Tests profundos de diagnóstico
│       ├── edge-cases.test.ts        # Casos borde
│       ├── example.test.ts           # Ejemplo de test
│       ├── hooks-deep.test.ts        # Tests profundos de hooks
│       ├── hooks.test.ts             # Tests de hooks
│       ├── integration.test.ts       # Tests de integración
│       ├── muro.test.ts              # Tests del muro
│       ├── security.test.ts          # Tests de seguridad
│       ├── services.test.ts          # Tests de servicios
│       ├── utils.test.ts             # Tests de utilidades
│       ├── validation.test.ts        # Tests de validación
│       └── *.test.ts                 # Otros tests
│
├── supabase/                         # Configuración de Supabase
│   ├── config.toml                   # Configuración local
│   ├── functions/                    # Edge Functions (14)
│   │   ├── _shared/                  # Código compartido
│   │   ├── activate-membership-manual/
│   │   ├── admin-action/
│   │   ├── generate-content/
│   │   ├── mentor-chat/
│   │   ├── mentor-chat-stream/
│   │   ├── moderate-comment/
│   │   ├── moderate-post/
│   │   ├── send-diagnostic-email/
│   │   ├── send-onboarding-email/
│   │   ├── send-push-notification/
│   │   ├── sync-tiendup/
│   │   ├── tiendup-checkout/
│   │   ├── tiendup-webhook/
│   │   └── verify-admin/
│   │
│   └── migrations/                   # Migraciones de BD (22+)
│       ├── 20260415*.sql             # Migraciones iniciales
│       ├── 20260418*.sql             # Muro y comentarios
│       ├── 20260423*.sql             # Security hardening
│       ├── 20260424*.sql             # Admin audit log
│       ├── 20260426*.sql             # Onboarding emails
│       ├── 20260505*.sql             # Missing tables
│       ├── 20260508*.sql             # Fase 1 cimientos
│       ├── 20260509*.sql             # Business Mirror
│       └── 20260515*.sql             # Membership TienUp
│
├── ARCHITECTURE.md                   # Documentación de arquitectura
├── CHANGELOG.md                      # Historial de cambios
├── CLAUDE.md                         # Guía para Claude Code
├── components.json                   # shadcn/ui config
├── CONTRIBUTING.md                   # Guía de contribución
├── CTO-SESSION.md                    # Session notes CTO
├── DOCS.md                           # Esta documentación
├── GEMINI.md                         # Guía para Gemini
├── INSTRUCTIVO_DESPLIEGUE.md         # Instrucciones de deploy
├── MEJORAAPP-EVOLUCION-COMPLETA-2026-04-21.md
├── MEJORAS-APLICADAS.md              # Mejoras aplicadas
├── package.json                      # Dependencias y scripts
├── playwright.config.ts              # Config de Playwright
├── postcss.config.js                 # Config de PostCSS
├── README.md                         # README principal
├── SECURITY.md                       # Documentación de seguridad
├── tailwind.config.ts                # Config de Tailwind
├── TIENDUP.md                        # Docs de integración TienUp
├── tsconfig.json                     # Config de TypeScript
├── tsconfig.app.json                 # TS config para app
├── tsconfig.node.json                # TS config para node
├── vercel.json                       # Config de Vercel
├── vite.config.ts                    # Config de Vite
└── vitest.config.ts                  # Config de Vitest
```

### 4.2 Convenciones de Nomenclatura

#### Archivos

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes React | `PascalCase.tsx` | `UserProfile.tsx` |
| Custom Hooks | `camelCase.ts` con prefijo `use` | `useDebounce.ts` |
| Servicios | `camelCase.service.ts` | `wall.service.ts` |
| Utilidades | `camelCase.ts` | `rateLimit.ts` |
| Contextos | `PascalCaseContext.tsx` | `AuthContext.tsx` |
| Tipos | `camelCase.ts` | `crm.ts` |
| Tests | `nombre.test.ts` o `nombre.test.tsx` | `services.test.ts` |

#### Imports

```typescript
// ✅ Correcto: Absolute imports con @/
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { wallService } from "@/services";

// ❌ Incorrecto: Relative paths largos
import { Button } from "../../../components/ui/button";
```

#### CSS y Tailwind

```typescript
// Orden recomendado de clases Tailwind
// 1. Layout (flex, grid, position)
// 2. Spacing (margin, padding)
// 3. Typography (font-size, color)
// 4. Visuals (border, shadow, background)
// 5. Interactive (hover, focus, active)

<button className="
  flex items-center justify-center    /* Layout */
  px-4 py-2 gap-2                     /* Spacing */
  text-sm font-medium text-white      /* Typography */
  bg-blue-600 rounded-lg shadow-md    /* Visuals */
  hover:bg-blue-700 focus:ring-2      /* Interactive */
">
  Guardar
</button>
```

---

## 5. Módulos y Funcionalidades

### 5.1 Autenticación y Autorización

#### 5.1.1 Métodos de Autenticación

| Método | Descripción | Endpoint |
|--------|-------------|----------|
| **Email/Password** | Login tradicional con PKCE | `supabase.auth.signInWithPassword()` |
| **Google OAuth** | OAuth 2.0 con Google | `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| **Magic Link** | Email mágico sin contraseña | `supabase.auth.signInWithOtp({ email })` |
| **Admin Login** | Login especial para admins | `/api/verify-admin` Edge Function |

#### 5.1.2 Flujo de Autenticación

```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Estados de autenticación
type AuthState = 
  | 'unauthenticated'    // Usuario no logueado
  | 'loading'           // Cargando sesión
  | 'authenticated'     // Usuario logueado
  | 'admin'             // Usuario admin
```

#### 5.1.3 Control de Acceso

| Componente | Propósito | Uso |
|------------|-----------|-----|
| `AccessGate` | Controla acceso por nivel de usuario | `<AccessGate level="premium">` |
| `FeatureGate` | Gate para features específicos | `<FeatureGate feature="mentor">` |
| `FeatureBoundary` | Boundary con fallback para features | `<FeatureBoundary feature="crm">` |
| `ContentGate` | Gate para contenido premium | `<ContentGate>` |

### 5.2 Business Mirror Game

#### 5.2.1 Descripción

El **Business Mirror Game** es un diagnóstico empresarial interactivo de 8 dimensiones que evalúa el estado actual del negocio del usuario y proporciona recomendaciones personalizadas.

#### 5.2.2 Dimensiones Evaluadas

| Dimensión | Peso | Preguntas | Métricas |
|-----------|------|-----------|----------|
| **Estrategia** | 15% | 8-10 | Claridad de visión, planificación |
| **Finanzas** | 15% | 8-10 | Rentabilidad, flujo de caja |
| **Operaciones** | 12% | 6-8 | Eficiencia, procesos |
| **Marketing** | 12% | 6-8 | Adquisición, retención |
| **Ventas** | 12% | 6-8 | Conversión, pipeline |
| **Equipo** | 12% | 6-8 | Talento, cultura |
| **Tecnología** | 12% | 6-8 | Stack, automatización |
| **Cliente** | 10% | 5-6 | Satisfacción, NPS |

#### 5.2.3 Flujo del Diagnóstico

```
1. Intro → Explicación del proceso
2. Questions → 8 preguntas (una por dimensión)
3. Loading → Cálculo de resultados (2-3s)
4. Results → Score total + perfil dominante
5. Recommendations → Acciones específicas
6. Email → Envío de resultados por email
```

#### 5.2.4 Perfiles de Resultado

| Perfil | Descripción | Color |
|--------|-------------|-------|
| **Visionario** | Fuerte en estrategia, débil en ejecución | Violeta |
| **Operador** | Excelente en operaciones, débil en visión | Azul |
| **Vendedor** | Gran habilidad comercial, débil en sistemas | Verde |
| **Analista** | Fuerte en finanzas, débil en personas | Naranja |
| **Líder** | Balanceado en todas las áreas | Dorado |

### 5.3 Muro Anónimo

#### 5.3.1 Características

- **Anonimato** — Los posts no muestran identidad del autor
- **Moderación IA** — Cada post es revisado antes de publicarse
- **Interacciones** — Likes y comentarios en tiempo real
- **Reportes** — Sistema de reporte de contenido inapropiado

#### 5.3.2 Tipos de Post

```typescript
type PostType = 'text' | 'question' | 'experience' | 'tip';

interface WallPost {
  id: string;
  type: PostType;
  content: string;
  is_anonymous: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  moderation_status: 'pending' | 'approved' | 'rejected';
}
```

#### 5.3.3 Moderación con IA

```typescript
// Flujo de moderación
Post creado → Edge Function `moderate-post`
  ↓
Análisis de contenido (toxicity, spam, inappropriate)
  ↓
Decisión: Aprobar / Rechazar / Revisión manual
  ↓
Notificación al usuario
```

### 5.4 Mentor IA

#### 5.4.1 Descripción

Asistente de negocios conversacional powered by IA que proporciona consejos personalizados basados en el contexto del usuario.

#### 5.4.2 Características

| Feature | Descripción |
|---------|-------------|
| **Chat en tiempo real** | Streaming de respuestas |
| **Historial** | Conversaciones guardadas por sesión |
| **Contexto** | Usa datos del perfil y diagnóstico del usuario |
| **Follow-ups** | Sugiere preguntas de seguimiento |

#### 5.4.3 Endpoints

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/mentor-chat` | POST | Chat normal |
| `/mentor-chat-stream` | POST | Chat con streaming |
| `/mentor-history` | GET | Historial de conversaciones |

### 5.5 CRM Integrado

#### 5.5.1 Tablas del CRM

| Tabla | Propósito | Campos principales |
|-------|-----------|-------------------|
| `crm_clients` | Clientes | nombre, email, teléfono, empresa, estado |
| `crm_products` | Productos | nombre, precio, descripción, categoría |
| `crm_interactions` | Interacciones | tipo, nota, fecha, cliente_id |

#### 5.5.2 Funcionalidades

- **Gestión de Clientes** — CRUD completo de clientes
- **Pipeline de Ventas** — Seguimiento de oportunidades
- **Productos** — Catálogo de productos/servicios
- **Interacciones** — Registro de llamadas, emails, reuniones
- **Reportes** — Dashboard de métricas de ventas

### 5.6 Sistema de Membresías

#### 5.6.1 Planes Disponibles

| Plan | Precio | Features |
|------|--------|----------|
| **Free** | $0 | Mirror básico, Muro (limitado), Contenido (limitado) |
| **Premium** | $9.99/mes | Todo ilimitado, Mentor IA, CRM, Badges exclusivos |
| **Enterprise** | Custom | Multi-user, API access, Soporte dedicado |

#### 5.6.2 Integración con TienUp

```typescript
// src/services/tiendup.service.ts
interface TienUpService {
  createCheckout(planId: string): Promise<CheckoutResponse>;
  handleWebhook(event: WebhookEvent): Promise<void>;
  syncMembership(userId: string): Promise<void>;
  activateManual(userId: string, planId: string): Promise<void>;
}
```

#### 5.6.3 Badges y Gamificación

| Badge | Requisito | Beneficio |
|-------|-----------|-----------|
| **Primer Post** | Publicar primer post en muro | +10 puntos |
| **Diagnóstico Completo** | Completar Business Mirror | +50 puntos |
| **Early Adopter** | Unirse en primeros 100 | Badge exclusivo |
| **Top Contributor** | Top 10 en ranking mensual | Destacado en comunidad |
| **Mentor Pro** | 10+ conversaciones con Mentor | Acceso prioritario |

### 5.7 Contenido de Valor

#### 5.7.1 Tipos de Contenido

| Tipo | Formato | Duración promedio |
|------|---------|-------------------|
| **Artículo** | Texto + imágenes | 5-10 min lectura |
| **Video** | YouTube/Vimeo embed | 3-15 min |
| **Infografía** | Imagen interactiva | 2-5 min |
| **Podcast** | Audio embed | 15-45 min |
| **Plantilla** | Downloadable PDF/Excel | Variable |

#### 5.7.2 Sistema de Recomendaciones

```typescript
// src/hooks/useContentRecommendations.ts
interface RecommendationEngine {
  // Basado en historial de lectura
  byHistory: () => Content[];
  
  // Basado en resultados del diagnóstico
  byDiagnosticProfile: () => Content[];
  
  // Basado en trending
  trending: () => Content[];
  
  // Basado en novedades
  new: () => Content[];
}
```

---

## 6. Base de Datos

### 6.1 Schema Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIOS                             │
├─────────────────────────────────────────────────────────────┤
│ auth.users (Supabase Auth)                                  │
│   └─ 1:1 → profiles                                         │
│         └─ 1:N → wall_posts, wall_comments, wall_likes      │
│         └─ 1:N → diagnostic_results                         │
│         └─ 1:N → user_badges                                │
│         └─ 1:N → mentor_conversations                       │
│         └─ 1:N → push_subscriptions                         │
│         └─ 1:N → nps_responses                              │
│         └─ 1:N → referrals                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         MURO                                │
├─────────────────────────────────────────────────────────────┤
│ wall_posts                                                  │
│   └─ 1:N → wall_comments                                    │
│   └─ 1:N → wall_likes                                       │
│   └─ 1:N → wall_reports                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       CONTENIDO                             │
├─────────────────────────────────────────────────────────────┤
│ content_categories                                          │
│   └─ 1:N → content_posts                                    │
│ content_posts                                               │
│   └─ N:M → content_tags (via content_post_tags)             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    DIAGNÓSTICO                              │
├─────────────────────────────────────────────────────────────┤
│ diagnostic_questions                                        │
│   └─ 1:N → diagnostic_answers                               │
│ diagnostic_results                                          │
│   └─ pertenece a → profiles                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        CRM                                  │
├─────────────────────────────────────────────────────────────┤
│ crm_clients                                                 │
│   └─ 1:N → crm_interactions                                 │
│   └─ 1:N → crm_deals                                        │
│ crm_products                                                │
│   └─ 1:N → crm_deal_products                                │
│ crm_interactions                                            │
│ crm_deals                                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    COMUNIDAD                                │
├─────────────────────────────────────────────────────────────┤
│ community_challenges                                        │
│   └─ N:M → profiles (via challenge_participants)            │
│ user_badges                                                 │
│   └─ pertenece a → profiles                                 │
│ community_ranking (view)                                    │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Tablas Principales

#### 6.2.1 `profiles`

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  job_title TEXT,
  phone TEXT,
  avatar_url TEXT,
  membership_plan TEXT DEFAULT 'free',
  membership_status TEXT DEFAULT 'inactive',
  membership_expires_at TIMESTAMPTZ,
  points INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  diagnostic_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6.2.2 `wall_posts`

```sql
CREATE TABLE wall_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('text', 'question', 'experience', 'tip')),
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT TRUE,
  moderation_status TEXT DEFAULT 'pending',
  moderation_result JSONB,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reports_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wall_posts_user ON wall_posts(user_id);
CREATE INDEX idx_wall_posts_created ON wall_posts(created_at DESC);
CREATE INDEX idx_wall_posts_moderation ON wall_posts(moderation_status);
```

#### 6.2.3 `diagnostic_results`

```sql
CREATE TABLE diagnostic_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  overall_score NUMERIC(5,2),
  profile_type TEXT,
  dimension_scores JSONB, -- {estrategia: 85, finanzas: 72, ...}
  recommendations JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.3 Row Level Security (RLS)

#### 6.2.1 Políticas Principales

```sql
-- Profiles: Usuarios solo ven/editan su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Wall Posts: Todos pueden ver posts aprobados
CREATE POLICY "Anyone can view approved posts"
  ON wall_posts FOR SELECT
  USING (moderation_status = 'approved');

-- Users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON wall_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Diagnostic Results: Solo el usuario ve sus resultados
CREATE POLICY "Users can view own results"
  ON diagnostic_results FOR SELECT
  USING (auth.uid() = user_id);
```

### 6.4 Triggers y Funciones

#### 6.4.1 Trigger: Actualizar contador de likes

```sql
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE wall_posts SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE wall_posts SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wall_likes_count_trigger
AFTER INSERT OR DELETE ON wall_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();
```

#### 6.4.2 Trigger: Crear perfil automático

```sql
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, referral_code)
  VALUES (NEW.id, NEW.email, md5(random()::text));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_profile_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();
```

### 6.5 Migraciones

Las migraciones están organizadas cronológicamente en `supabase/migrations/`:

| Archivo | Fecha | Propósito |
|---------|-------|-----------|
| `20260415*.sql` | Abr 2026 | Setup inicial |
| `20260418*.sql` | Abr 2026 | Muro y comentarios |
| `20260423*.sql` | Abr 2026 | Security hardening |
| `20260424*.sql` | Abr 2026 | Admin audit log, NPS, referrals |
| `20260426*.sql` | Abr 2026 | Onboarding emails |
| `20260505*.sql` | May 2026 | Tablas faltantes |
| `20260508*.sql` | May 2026 | Fase 1 cimientos |
| `20260509*.sql` | May 2026 | Business Mirror |
| `20260515*.sql` | May 2026 | Membership TienUp |

---

## 7. Edge Functions

### 7.1 Visión General

Las Edge Functions de Supabase son funciones serverless que se ejecutan cerca del usuario para baja latencia. MejoraApp utiliza 14 funciones para lógica sensible y operaciones backend.

### 7.2 Funciones Disponibles

| Función | Auth | Método | Propósito | Timeout |
|---------|------|--------|-----------|---------|
| `moderate-post` | Usuario | POST | Moderación IA de posts | 10s |
| `moderate-comment` | Usuario | POST | Moderación IA de comentarios | 10s |
| `verify-admin` | Admin | POST | Verificar rol de admin | 5s |
| `admin-action` | Admin | POST | Ejecutar acciones de admin | 30s |
| `generate-content` | Admin | POST | Generar contenido con IA | 60s |
| `mentor-chat` | Usuario | POST | Chat con Mentor IA | 30s |
| `mentor-chat-stream` | Usuario | POST | Chat streaming con Mentor | 60s |
| `send-push-notification` | Service | POST | Enviar push notification | 5s |
| `send-diagnostic-email` | Service | POST | Email de resultados | 10s |
| `send-onboarding-email` | Service | POST | Email de onboarding | 10s |
| `activate-membership-manual` | Admin | POST | Activar membresía manual | 5s |
| `tiendup-checkout` | Usuario | POST | Crear checkout TienUp | 10s |
| `tiendup-webhook` | None | POST | Webhook de TienUp | 30s |
| `sync-tiendup` | Admin | POST | Sync datos con TienUp | 60s |

### 7.3 Ejemplo: moderate-post

```typescript
// supabase/functions/moderate-post/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // 1. Validar autenticación
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Obtener post de la BD
  const { post_id } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );

  const { data: post } = await supabase
    .from('wall_posts')
    .select('*')
    .eq('id', post_id)
    .single();

  // 3. Llamar a API de moderación (ej: OpenAI, Perspective API)
  const moderationResponse = await fetch('https://api.moderation.ai/v1/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: post.content })
  });

  const { is_safe, categories, score } = await moderationResponse.json();

  // 4. Actualizar estado de moderación
  const newStatus = is_safe ? 'approved' : 'rejected';
  await supabase
    .from('wall_posts')
    .update({
      moderation_status: newStatus,
      moderation_result: { categories, score }
    })
    .eq('id', post_id);

  // 5. Retornar resultado
  return new Response(JSON.stringify({ status: newStatus }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
});
```

### 7.4 Deploy de Edge Functions

```bash
# Deploy individual
npx supabase functions deploy moderate-post

# Deploy todas
npm run deploy:functions

# Deploy via GitHub Actions (automático en push a main)
# Ver .github/workflows/deploy-functions.yml
```

---

## 8. Seguridad

### 8.1 Headers de Seguridad (Vercel)

Configurados en `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://posthog.com https://js.sentry-cdn.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://posthog.com https://*.sentry.io;"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

### 8.2 Validación de Inputs

#### 8.2.1 Zod Schemas (`src/lib/validation.ts`)

```typescript
import { z } from 'zod';

// Login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres')
});

// Registro
export const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener mayúscula')
    .regex(/[0-9]/, 'Debe tener número'),
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  company: z.string().optional(),
  acceptTerms: z.boolean().refine(v => v === true, 'Debes aceptar los términos')
});

// Post del muro
export const wallPostSchema = z.object({
  content: z
    .string()
    .min(10, 'Mínimo 10 caracteres')
    .max(500, 'Máximo 500 caracteres'),
  type: z.enum(['text', 'question', 'experience', 'tip']),
  isAnonymous: z.boolean().default(true)
});

// Perfil
export const profileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  company: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  phone: z.string().regex(/^\+?[0-9\s-]+$/).optional()
});
```

### 8.3 Sanitización XSS

```typescript
// src/lib/security.ts
import DOMPurify from 'dompurify';

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
};

export const sanitizeUrl = (url: string): string => {
  const protocol = new URL(url).protocol;
  if (!['http:', 'https:'].includes(protocol)) {
    return 'about:blank';
  }
  return url;
};
```

### 8.4 Rate Limiting

```typescript
// src/lib/rateLimit.ts
interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const configs: Record<string, RateLimitConfig> = {
  'post:create': { maxAttempts: 5, windowMs: 60000 },      // 5 posts/min
  'comment:create': { maxAttempts: 10, windowMs: 60000 },   // 10 comentarios/min
  'auth:login': { maxAttempts: 5, windowMs: 300000 },       // 5 logins/5min
  'mentor:message': { maxAttempts: 20, windowMs: 60000 }    // 20 mensajes/min
};

export const checkRateLimit = (key: string, userId: string): boolean => {
  const config = configs[key];
  const storageKey = `rate_limit:${userId}:${key}`;
  const now = Date.now();
  
  const attempts = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const recentAttempts = attempts.filter((t: number) => now - t < config.windowMs);
  
  if (recentAttempts.length >= config.maxAttempts) {
    return false; // Rate limited
  }
  
  recentAttempts.push(now);
  localStorage.setItem(storageKey, JSON.stringify(recentAttempts));
  return true;
};
```

### 8.5 Autenticación de Admin

```typescript
// Flujo de verificación de admin
1. Admin ingresa credenciales en /admin
2. Edge Function `verify-admin` valida:
   - Credenciales correctas
   - Rol 'admin' en tabla admin_whitelist
   - IP no bloqueada
3. Si válido: session flag en sessionStorage (4h TTL)
4. Re-verificación en cada carga de /admin
5. Audit log de todas las acciones
```

---

## 9. Testing y Calidad

### 9.1 Estrategia de Testing

```
                    Testing Pyramid
                    
                        /\
                       /  \
                      / E2E \         ~10 tests
                     /________\       
                    /          \      
                   / Integration \     ~20 tests
                  /______________\    
                 /                \   
                /    Unit Tests    \   ~103 tests
               /____________________\ 
```

### 9.2 Tests Unitarios (Vitest)

#### 9.2.1 Configuración

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        branches: 70,
        functions: 25,
        lines: 25,
        statements: 25
      }
    }
  }
});
```

#### 9.2.2 Suite de Tests

| Archivo | Tests | Cobertura |
|---------|-------|-----------|
| `admin.test.ts` | 8 | Admin actions, permissions |
| `authAndAdmin.test.ts` | 12 | Auth flow, admin verification |
| `components.test.tsx` | 15 | Component rendering, interactions |
| `diagnosticData.test.ts` | 10 | Data validation, scoring |
| `diagnosticDeep.test.ts` | 18 | Deep diagnostic logic |
| `edge-cases.test.ts` | 14 | Boundary conditions |
| `hooks.test.ts` | 12 | Hook behavior |
| `hooks-deep.test.ts` | 16 | Complex hook scenarios |
| `integration.test.ts` | 10 | Service integration |
| `muro.test.ts` | 8 | Wall functionality |
| `security.test.ts` | 12 | Security measures |
| `services.test.ts` | 14 | Service layer |
| `utils.test.ts` | 8 | Utility functions |
| `validation.test.ts` | 10 | Zod validation |

**Total: 103+ tests passing**

#### 9.2.3 Ejemplo de Test

```typescript
// src/test/services.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { wallService } from '@/services/wall.service';
import { supabase } from '@/integrations/supabase/client';

describe('wallService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPosts', () => {
    it('should return approved posts ordered by created_at', async () => {
      const mockPosts = [
        { id: '1', content: 'Post 1', created_at: '2024-01-01' },
        { id: '2', content: 'Post 2', created_at: '2024-01-02' }
      ];

      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockPosts, error: null })
      } as any);

      const result = await wallService.getPosts();

      expect(result).toEqual(mockPosts);
      expect(result.length).toBe(2);
    });

    it('should throw error when supabase returns error', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') })
      } as any);

      await expect(wallService.getPosts()).rejects.toThrow('DB error');
    });
  });
});
```

### 9.3 Tests E2E (Playwright)

#### 9.3.1 Configuración

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] }
    }
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry'
  }
});
```

#### 9.3.2 Tests Principales

| Spec | Descripción |
|------|-------------|
| `auth.spec.ts` | Login, registro, logout |
| `diagnostic.spec.ts` | Flujo completo del Mirror |
| `wall.spec.ts` | Publicar, like, comentar |
| `navigation.spec.ts` | Navegación entre tabs |
| `accessibility.spec.ts` | Tests de accesibilidad |

### 9.4 Lighthouse CI

#### 9.4.1 Configuración

```json
// .lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.7 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.8 }],
        "categories:seo": ["warn", { "minScore": 0.8 }]
      }
    }
  }
}
```

### 9.5 ESLint y Type Checking

```json
// package.json scripts
{
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "typecheck": "tsc --noEmit"
}
```

**Reglas:**
- 0 errores tolerados
- Warnings permitidos (documentados)
- TypeScript strict mode activado

---

## 10. CI/CD y Deploy

### 10.1 Pipeline de CI

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type checking
        run: npx tsc --noEmit
      
      - name: Linting
        run: npm run lint
      
      - name: Unit tests
        run: npm run test
      
      - name: Build
        run: npm run build
      
      - name: Bundle size check
        run: |
          SIZE=$(du -sm dist/ | cut -f1)
          if [ $SIZE -gt 5 ]; then
            echo "Bundle size exceeds 5MB limit ($SIZE MB)"
            exit 1
          fi
```

### 10.2 Workflows Disponibles

| Workflow | Trigger | Propósito |
|----------|---------|-----------|
| `ci.yml` | Push/PR | CI principal |
| `deploy.yml` | Push a main | Deploy producción |
| `deploy-staging.yml` | Push a develop | Deploy staging |
| `deploy-functions.yml` | Push a main | Deploy Edge Functions |
| `lighthouse.yml` | Scheduled | Audits periódicos |
| `onboarding-emails.yml` | Manual | Envío de emails |

### 10.3 Estrategia de Branches

```
main (producción)
  │
  ├─ develop (staging)
  │   │
  │   ├─ feature/* (nuevas features)
  │   ├─ bugfix/* (correcciones)
  │   └─ hotfix/* (urgentes)
  │
  └─ release/* (preparación releases)
```

### 10.4 Deploy a Vercel

#### 10.4.1 Configuración

```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "headers": [...],  // Ver sección Seguridad
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

#### 10.4.2 Variables de Entorno en Vercel

| Variable | Entorno | Propósito |
|----------|---------|-----------|
| `VITE_SUPABASE_URL` | All | URL de Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | All | Key pública |
| `VITE_ENVIRONMENT` | All | development/staging/production |
| `VITE_POSTHOG_KEY` | Prod | PostHog analytics |
| `VITE_SENTRY_DSN` | Prod | Sentry DSN |

### 10.5 Health Checks

Después de cada deploy:

```bash
# Verificar disponibilidad
curl -f https://app.mejoraok.com/health

# Verificar funcionalidad crítica
curl -f https://app.mejoraok.com/api/health-check

# Monitorear errores en Sentry
# Alertas configuradas para >10 errores/hora
```

---

## 11. Performance y Optimización

### 11.1 Bundle Splitting

Vite configura code splitting automático:

```
dist/assets/
├── index-[hash].js          # App principal (~150KB)
├── vendor-react-[hash].js   # React, ReactDOM (~130KB)
├── vendor-router-[hash].js  # React Router (~30KB)
├── vendor-query-[hash].js   # React Query (~45KB)
├── vendor-supabase-[hash].js # Supabase client (~50KB)
├── vendor-ui-[hash].js      # Radix UI (~80KB)
├── vendor-charts-[hash].js  # Recharts (~150KB)
└── pages/
    ├── Admin-[hash].js      # Admin page (lazy)
    ├── Auth-[hash].js       # Auth page (lazy)
    └── ...
```

**Bundle total: ~2.5MB gzipped**

### 11.2 Lazy Loading

Todas las rutas usan lazy loading con Suspense:

```typescript
// src/App.tsx
const Index = lazy(() => import('@/pages/Index'));
const Admin = lazy(() => import('@/pages/Admin'));
const Auth = lazy(() => import('@/pages/Auth'));

function App() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        {/* ... */}
      </Routes>
    </Suspense>
  );
}
```

### 11.3 Caching Strategy

#### 11.3.1 React Query

```typescript
// Configuración global
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,        // 2 minutos
      retry: 1,                         // 1 reintento
      refetchOnWindowFocus: false,      // No refocus al volver
      gcTime: 5 * 60 * 1000,            // 5 minutos en cache
    },
    mutations: {
      retry: 0,                         // Sin reintentos en mutations
    },
  },
});
```

#### 11.3.2 Service Worker

```javascript
// public/sw.js
const CACHE_STRATEGIES = {
  // Navigation: Network-first con fallback
  navigation: 'network-first',
  
  // Assets hashed: Cache-first (immutable)
  assets: 'cache-first',
  
  // API calls: Network-first con cache
  api: 'network-first',
  
  // Images: Cache-first con stale-while-revalidate
  images: 'cache-first'
};
```

### 11.4 Optimizaciones de Imágenes

```typescript
// Mejores prácticas implementadas:
1. WebP format con fallback PNG
2. Lazy loading nativo (<img loading="lazy">)
3. Responsive images con srcset
4. Blur placeholder mientras carga
5. Compresión con Squoosh/Imagemin
```

### 11.5 Métricas de Performance

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| **FCP** (First Contentful Paint) | <1.5s | ~1.2s |
| **LCP** (Largest Contentful Paint) | <2.5s | ~2.1s |
| **CLS** (Cumulative Layout Shift) | <0.1 | ~0.05 |
| **FID** (First Input Delay) | <100ms | ~50ms |
| **TTI** (Time to Interactive) | <3.8s | ~3.2s |
| **Bundle Size** | <5MB | ~2.5MB |

---

## 12. Internacionalización

### 12.1 Sistema i18n Custom

Implementación sin dependencias externas para máximo control:

```typescript
// src/i18n/locales/index.ts
export const translations = {
  es: {
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'auth.login': 'Iniciar sesión',
    'auth.signup': 'Crear cuenta',
    'mirror.title': 'Business Mirror Game',
    'mirror.start': 'Comenzar diagnóstico',
    // ... 200+ keys
  },
  en: {
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'auth.login': 'Sign in',
    'auth.signup': 'Create account',
    'mirror.title': 'Business Mirror Game',
    'mirror.start': 'Start diagnostic',
    // ... (preparado, no completo)
  }
};

export const useI18n = () => {
  const [locale, setLocale] = useLocalStorage<'es' | 'en'>('locale', 'es');
  
  const t = (key: string) => {
    return translations[locale][key] || key;
  };
  
  return { locale, setLocale, t };
};
```

### 12.2 Idiomas Soportados

| Idioma | Código | Estado | Completitud |
|--------|--------|--------|-------------|
| Español | es | ✅ Production | 100% |
| Inglés | en | 🔄 Preparado | ~60% |

### 12.3 Uso en Componentes

```typescript
import { useI18n } from '@/contexts/I18nContext';

function MyComponent() {
  const { t } = useI18n();
  
  return (
    <div>
      <h1>{t('mirror.title')}</h1>
      <button>{t('mirror.start')}</button>
    </div>
  );
}
```

---

## 13. PWA y Offline

### 13.1 Service Worker

Registrado en `src/main.tsx`:

```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('SW registered:', registration.scope);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}
```

### 13.2 Estrategias de Cache

| Tipo | Estrategia | TTL |
|------|------------|-----|
| HTML | Network-first | N/A |
| JS/CSS | Cache-first (hashed) | Forever |
| Imágenes | Cache-first | 30 días |
| API | Network-first | 5 minutos |
| Fonts | Cache-first | 1 año |

### 13.3 Manifest PWA

```json
// public/manifest.json
{
  "name": "MejoraApp — Comunidad de Negocios",
  "short_name": "MejoraApp",
  "description": "Plataforma para líderes empresariales",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "Muro",
      "short_name": "Muro",
      "url": "/?tab=muro",
      "icons": [{ "src": "/icons/muro.png", "sizes": "96x96" }]
    },
    {
      "name": "Mentor",
      "short_name": "Mentor",
      "url": "/?tab=mentor",
      "icons": [{ "src": "/icons/mentor.png", "sizes": "96x96" }]
    }
  ]
}
```

### 13.4 Push Notifications

```typescript
// src/lib/push.ts
export async function subscribeUser() {
  const registration = await navigator.serviceWorker.ready;
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VITE_VAPID_PUBLIC_KEY
  });
  
  // Guardar subscription en BD
  await saveSubscription(subscription);
}

export async function sendNotification(title: string, options: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
}
```

---

## 14. Analytics y Tracking

### 14.1 PostHog Events

#### 14.1.1 Eventos Principales

| Evento | Trigger | Propiedades |
|--------|---------|-------------|
| `login` | Inicio de sesión | method, timestamp |
| `signup` | Registro | method, referral_source |
| `onboarding_complete` | Onboarding finalizado | time_spent, step_reached |
| `publish_post` | Post en muro | char_count, post_type, is_anonymous |
| `complete_diagnostic` | Fin del Mirror | score, profile_type, time_spent |
| `mentor_message_sent` | Mensaje al Mentor | conversation_id, length |
| `feature_blocked` | Feature premium bloqueado | feature, current_plan |
| `upgrade_clicked` | Click en upgrade | source, plan_viewed |
| `membership_activated` | Activación de membresía | plan, payment_method |

#### 14.1.2 Implementación

```typescript
// src/lib/analytics.ts
import posthog from 'posthog-js';

posthog.init(VITE_POSTHOG_KEY, {
  api_host: 'https://app.posthog.com',
  autocapture: true,
  capture_pageview: true,
  persistence: 'localStorage'
});

export const track = (event: string, properties?: Record<string, any>) => {
  posthog.capture(event, {
    ...properties,
    timestamp: new Date().toISOString(),
    url: window.location.href
  });
};

export const identify = (userId: string, traits?: Record<string, any>) => {
  posthog.identify(userId, traits);
};
```

### 14.2 Funnel de Activación

```
signup (100%)
    ↓ 85%
onboarding_complete
    ↓ 70%
first_visit
    ↓ 45%
first_post
    ↓ 30%
return_d1 (Day 1 retention)
    ↓ 15%
return_d7 (Day 7 retention)
    ↓ 8%
premium_intent
    ↓ 3%
membership_activated
```

### 14.3 A/B Testing

```typescript
// src/lib/ab-testing.ts
export interface Experiment {
  id: string;
  name: string;
  variants: string[];
  weights: number[];
}

const experiments: Experiment[] = [
  {
    id: 'onboarding-flow-v2',
    name: 'Nuevo flujo de onboarding',
    variants: ['control', 'variant-a', 'variant-b'],
    weights: [0.5, 0.25, 0.25]
  }
];

export const getVariant = (experimentId: string, userId: string): string => {
  const experiment = experiments.find(e => e.id === experimentId);
  if (!experiment) return 'control';
  
  // Hash determinístico por userId
  const hash = hashCode(`${experimentId}-${userId}`) % 100;
  
  let cumulative = 0;
  for (let i = 0; i < experiment.variants.length; i++) {
    cumulative += experiment.weights[i] * 100;
    if (hash < cumulative) {
      return experiment.variants[i];
    }
  }
  
  return experiment.variants[0];
};
```

### 14.4 Sentry Error Tracking

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: VITE_SENTRY_DSN,
  environment: VITE_ENVIRONMENT,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filtrar errores conocidos
    if (event.message?.includes('Network request failed')) {
      return null;
    }
    return event;
  }
});
```

---

## 15. Guía para Desarrolladores

### 15.1 Setup del Entorno

#### 15.1.1 Prerrequisitos

```bash
# Node.js 22+
node --version  # v22.x.x

# npm 10+
npm --version   # 10.x.x

# Git
git --version   # 2.x.x
```

#### 15.1.2 Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/pabloeckert/MejoraApp.git
cd MejoraApp

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.example .env.local

# 4. Editar .env.local con tus credenciales
# VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=tu-key

# 5. Iniciar servidor de desarrollo
npm run dev
```

### 15.2 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Dev server en http://localhost:8080
npm run build            # Build de producción
npm run build:staging    # Build modo staging
npm run build:dev        # Build modo development
npm run preview          # Preview del build

# Testing
npm run test             # Tests unitarios (una pasada)
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Con reporte de cobertura
npm run test:e2e         # Playwright headless
npm run test:e2e:ui      # Playwright con UI
npm run test:e2e:headed  # Playwright con browser visible

# Calidad
npm run lint             # ESLint
npm run lint:fix         # ESLint con auto-fix
npx tsc --noEmit         # Type checking

# Husky
npm run prepare          # Instalar husky hooks
```

### 15.3 Agregar Nueva Feature

#### 15.3.1 Checklist

```markdown
- [ ] Crear branch desde develop: `git checkout -b feature/nombre-feature`
- [ ] Agregar componentes en `src/components/`
- [ ] Agregar hooks en `src/hooks/` si corresponde
- [ ] Agregar tests en `src/test/`
- [ ] Actualizar documentación
- [ ] Correr tests: `npm run test`
- [ ] Correr lint: `npm run lint`
- [ ] Commit con mensaje convencional
- [ ] Push y crear PR
```

#### 15.3.2 Ejemplo: Nuevo Componente

```bash
# 1. Crear archivo del componente
touch src/components/my-feature/MyComponent.tsx

# 2. Implementar componente
```

```typescript
// src/components/my-feature/MyComponent.tsx
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const { t } = useI18n();
  
  return (
    <div className="p-4">
      <h2>{title}</h2>
      <Button onClick={onAction}>
        {t('common.action')}
      </Button>
    </div>
  );
}
```

```bash
# 3. Crear test
touch src/test/my-component.test.tsx

# 4. Implementar test
```

```typescript
// src/test/my-component.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/my-feature/MyComponent';

describe('MyComponent', () => {
  it('renders title correctly', () => {
    render(<MyComponent title="Test Title" onAction={() => {}} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

### 15.4 Convenciones de Código

#### 15.4.1 TypeScript

```typescript
// ✅ Tipado explícito
interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

// ✅ Funciones puras cuando sea posible
const calculateScore = (answers: Answer[]): number => {
  return answers.reduce((sum, a) => sum + a.points, 0);
};

// ✅ Error handling
try {
  await service.doSomething();
} catch (error) {
  logger.error('Failed to do something', error);
  throw new Error('Specific error message');
}
```

#### 15.4.2 React

```typescript
// ✅ Functional components con TypeScript
interface Props {
  name: string;
  age?: number;
}

export function MyComponent({ name, age = 18 }: Props) {
  return <div>{name}</div>;
}

// ✅ Custom hooks
export function useMyFeature() {
  const [state, setState] = useState(false);
  
  const toggle = useCallback(() => {
    setState(prev => !prev);
  }, []);
  
  return { state, toggle };
}

// ✅ Memoization cuando corresponde
const ExpensiveComponent = memo(({ data }) => {
  return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;
});
```

### 15.5 Debugging

#### 15.5.1 React DevTools

```bash
# Instalar extensión
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
```

#### 15.5.2 Logging

```typescript
// Usar console con niveles
console.log('Debug info:', data);
console.warn('Potential issue:', warning);
console.error('Error occurred:', error);

// En producción, usar Sentry
Sentry.captureException(error);
```

#### 15.5.3 Network Debugging

```typescript
// Habilitar logs de Supabase
const supabase = createClient(url, key, {
  debug: true
});

// Interceptar requests
fetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
}).then(res => res.json()).then(console.log);
```

---

## 16. API Reference

### 16.1 Servicios

#### 16.1.1 Wall Service

```typescript
// src/services/wall.service.ts
interface WallService {
  // Posts
  getPosts(options?: GetPostsOptions): Promise<WallPost[]>;
  getPostById(id: string): Promise<WallPost>;
  createPost(data: CreatePostInput): Promise<WallPost>;
  updatePost(id: string, data: UpdatePostInput): Promise<WallPost>;
  deletePost(id: string): Promise<void>;
  
  // Comments
  getComments(postId: string): Promise<WallComment[]>;
  createComment(postId: string, content: string): Promise<WallComment>;
  deleteComment(id: string): Promise<void>;
  
  // Likes
  toggleLike(postId: string): Promise<boolean>;
  getLikes(postId: string): Promise<number>;
  
  // Reports
  reportPost(postId: string, reason: string): Promise<void>;
  
  // Realtime
  subscribeToPosts(callback: (post: WallPost) => void): UnsubscribeFn;
  subscribeToComments(postId: string, callback: (comment: WallComment) => void): UnsubscribeFn;
}
```

#### 16.1.2 Content Service

```typescript
// src/services/content.service.ts
interface ContentService {
  // Posts
  getContent(options?: GetContentOptions): Promise<ContentPost[]>;
  getContentById(id: string): Promise<ContentPost>;
  searchContent(query: string): Promise<ContentPost[]>;
  
  // Categories
  getCategories(): Promise<ContentCategory[]>;
  getContentByCategory(categoryId: string): Promise<ContentPost[]>;
  
  // Recommendations
  getRecommendations(userId: string): Promise<ContentPost[]>;
  getTrending(): Promise<ContentPost[]>;
  
  // User interactions
  markAsRead(contentId: string): Promise<void>;
  bookmark(contentId: string): Promise<void>;
  removeBookmark(contentId: string): Promise<void>;
}
```

#### 16.1.3 Diagnostic Service

```typescript
// src/services/diagnostic.service.ts
interface DiagnosticService {
  // Questions
  getQuestions(): Promise<DiagnosticQuestion[]>;
  getQuestionById(id: string): Promise<DiagnosticQuestion>;
  
  // Results
  submitAnswers(answers: AnswerInput): Promise<DiagnosticResult>;
  getResultById(id: string): Promise<DiagnosticResult>;
  getUserResults(userId: string): Promise<DiagnosticResult[]>;
  
  // Email
  sendResultsEmail(resultId: string, email: string): Promise<void>;
}
```

### 16.2 Hooks

#### 16.2.1 useAuth

```typescript
// src/contexts/AuthContext.tsx
function useAuth(): AuthContext {
  return {
    user: User | null,
    profile: Profile | null,
    session: Session | null,
    isLoading: boolean,
    isAdmin: boolean,
    signIn: (email, password) => Promise<void>,
    signUp: (email, password, userData) => Promise<void>,
    signOut: () => Promise<void>,
    refreshProfile: () => Promise<void>
  };
}
```

#### 16.2.2 useProfile

```typescript
// src/hooks/useProfile.ts
function useProfile(userId?: string): UseProfileReturn {
  return {
    profile: Profile | undefined,
    isLoading: boolean,
    isError: boolean,
    updateProfile: (data) => Promise<void>,
    refetch: () => Promise<void>
  };
}
```

#### 16.2.3 useMentor

```typescript
// src/hooks/useMentor.ts
function useMentor(): UseMentorReturn {
  return {
    conversations: Conversation[],
    currentConversation: Conversation | null,
    isLoading: boolean,
    sendMessage: (content: string) => Promise<void>,
    startNewConversation: () => Promise<string>,
    deleteConversation: (id: string) => Promise<void>
  };
}
```

---

## 17. Troubleshooting

### 17.1 Problemas Comunes

#### 17.1.1 Error: "Failed to fetch"

**Causa:** Problema de CORS o red

**Solución:**
```bash
# 1. Verificar conexión
ping app.mejoraok.com

# 2. Verificar CORS en Supabase
# Ir a Dashboard > API Settings > CORS Origins
# Agregar: http://localhost:8080

# 3. Limpiar cache
rm -rf node_modules/.vite
npm run dev
```

#### 17.1.2 Error: "Invalid API key"

**Causa:** Variables de entorno incorrectas

**Solución:**
```bash
# 1. Verificar .env.local
cat .env.local

# 2. Verificar en Supabase Dashboard
# Settings > API > Project URL y anon/public key

# 3. Reiniciar servidor
npm run dev
```

#### 17.1.3 Error: "Module not found"

**Causa:** Import paths incorrectos

**Solución:**
```typescript
// ❌ Incorrecto
import { Button } from '../../../components/ui/button';

// ✅ Correcto
import { Button } from '@/components/ui/button';
```

#### 17.1.4 Error: "TypeScript error TS2345"

**Causa:** Tipos incompatibles

**Solución:**
```typescript
// 1. Identificar el tipo esperado
const expected: ExpectedType = value;

// 2. Usar type assertion si es seguro
const safe = value as ExpectedType;

// 3. O crear tipo compatible
interface Compatible {
  // ... propiedades necesarias
}
```

### 17.2 Debug Mode

```typescript
// Habilitar logs detallados
// src/main.tsx
const DEBUG = true;

if (DEBUG) {
  console.log('App initialized');
  console.log('Environment:', VITE_ENVIRONMENT);
  console.log('User:', user);
}
```

### 17.3 Contactar Soporte

Para issues críticos:

1. **Revisar logs de Sentry**: https://sentry.io/organizations/mejoraapp
2. **Revisar analytics de PostHog**: https://app.posthog.com
3. **Contactar al equipo**: pablo@mejoraok.com

---

## Apéndice A: Recursos Adicionales

### A.1 Enlaces Útiles

| Recurso | URL |
|---------|-----|
| Producción | https://app.mejoraok.com |
| Staging | (configurar según entorno) |
| Supabase Dashboard | https://app.supabase.com |
| Vercel Dashboard | https://vercel.com |
| PostHog | https://app.posthog.com |
| Sentry | https://sentry.io |

### A.2 Documentación Relacionada

- [README.md](README.md) — Inicio rápido
- [ARCHITECTURE.md](ARCHITECTURE.md) — Arquitectura detallada
- [SECURITY.md](SECURITY.md) — Políticas de seguridad
- [CONTRIBUTING.md](CONTRIBUTING.md) — Guía de contribución
- [CHANGELOG.md](CHANGELOG.md) — Historial de cambios
- [CLAUDE.md](CLAUDE.md) — Guía para Claude Code

### A.3 Librerías y Referencias

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
- [TanStack Query](https://tanstack.com/query)

---

## Apéndice B: Glosario

| Término | Definición |
|---------|------------|
| **BaaS** | Backend as a Service |
| **B2B** | Business to Business |
| **CLS** | Cumulative Layout Shift |
| **CORS** | Cross-Origin Resource Sharing |
| **CRM** | Customer Relationship Management |
| **E2E** | End to End (testing) |
| **FCP** | First Contentful Paint |
| **HMR** | Hot Module Replacement |
| **IA** | Inteligencia Artificial |
| **LCP** | Largest Contentful Paint |
| **NPS** | Net Promoter Score |
| **PKCE** | Proof Key for Code Exchange |
| **PWA** | Progressive Web App |
| **RLS** | Row Level Security |
| **RSL** | Real-time Subscriptions Layer |
| **SPA** | Single Page Application |
| **SSR** | Server-Side Rendering |
| **TTI** | Time to Interactive |
| **XSS** | Cross-Site Scripting |

---

*Documento generado para MejoraApp — © 2026 Todos los derechos reservados*
