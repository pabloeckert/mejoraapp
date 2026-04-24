# MejoraApp — Comunidad de Negocios

**Producción:** [app.mejoraok.com](https://app.mejoraok.com)  
**Stack:** React 18 + TypeScript + Vite + Supabase + Tailwind CSS

## Descripción

MejoraApp es la aplicación digital del ecosistema Mejora Continua — una comunidad de negocios para líderes empresariales argentinos.

### Funcionalidades

- 🔐 Autenticación completa (email/password + Google OAuth + recuperación)
- 📝 Muro anónimo con posts, likes, comentarios y moderación IA
- 📚 Contenido de valor con categorías y generación IA
- 🔍 Diagnóstico estratégico interactivo
- ⚙️ Panel admin con 6 módulos
- 🤖 IA multi-provider (Gemini, DeepSeek, Groq) con rotación automática
- 📱 PWA instalable
- 🌙 Dark mode
- 🏆 Gamificación (8 badges + ranking comunidad)
- 📊 Analytics (PostHog, 25+ eventos)
- 🌐 i18n (español/inglés)

## Documentación

**📄 Fuente única de verdad:** [`Documents/DOCUMENTO-MAESTRO.md`](Documents/DOCUMENTO-MAESTRO.md)  
Arquitectura, plan de desarrollo, análisis UX, estado actual, y registro de sesiones.

> **Cuando digas "documentar"** — el DOCUMENTO-MAESTRO.md se actualiza con los trabajos realizados.

## Desarrollo Local

```bash
npm install
npm run dev          # Dev server en http://localhost:8080
npm run build        # Build de producción en dist/
npm run test         # Tests (103+ passing)
npm run lint         # Lint: eslint
npm run test:e2e     # E2E: playwright test
npm run test:coverage # Coverage report
ANALYZE=true npm run build  # Bundle analysis
```

## Despliegue

### Automático (GitHub Actions)
Push a `main` → build automático → deploy a Hostinger via FTP.

### Manual
1. `npm run build`
2. Subir contenido de `dist/` a `/public_html/app/` en Hostinger

### Rollback
Desde GitHub Actions → workflow `rollback.yml` → especificar commit SHA + razón.

## Stack

| Componente | Tecnología |
|-----------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth + DB + Edge Functions) |
| Database | PostgreSQL (RLS habilitado, 19 tablas) |
| IA | Gemini + DeepSeek + Groq |
| Testing | Vitest (103+) + Playwright (22 E2E) + axe-core (7) |
| Analytics | PostHog (25+ eventos) |
| Error Tracking | Sentry |
| Email | Resend |
| Push | Web Push API |

## Métricas

- **Líneas de código:** ~14,000
- **Archivos totales:** 203
- **Tests:** 103+ unitarios + 22 E2E + 7 accesibilidad
- **Tablas DB:** 19
- **Edge Functions:** 7
- **Bundle gzipped:** ~355KB

## Estructura

```
src/
├── pages/           # 5 páginas lazy-loaded
├── components/      # Componentes principales + ErrorBoundary
│   ├── admin/       # 6 módulos admin
│   ├── auth/        # Login, Signup, Google, AdminLogin
│   ├── tabs/        # Muro, Novedades, Contenido
│   └── ui/          # 30+ componentes shadcn/ui
├── contexts/        # AuthContext, ThemeContext, I18nContext
├── hooks/           # useWallInteractions, useBadges, useRanking, etc.
├── repositories/    # Repository Layer (abstracción Supabase)
├── i18n/            # Internacionalización (es/en)
├── data/            # Datos del diagnóstico + badges
├── lib/             # analytics, sentry, push, pdfExport, utils
└── integrations/    # Supabase client + tipos
```
