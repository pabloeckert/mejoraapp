# MejoraApp — Comunidad de Negocios

**Producción:** [app.mejoraok.com](https://app.mejoraok.com)  
**Stack:** React 18 + TypeScript + Vite + Supabase + Tailwind CSS  
**Node:** 22 (ver `.nvmrc`)

---

## 📋 Descripción

MejoraApp es una PWA para líderes empresariales argentinos. Ofrece:

- **Mirror Estratégico** — Diagnóstico de negocio en 8 preguntas con resultados personalizados
- **Muro Anónimo** — Espacio seguro para compartir experiencias con moderación IA
- **Contenido de Valor** — Artículos, videos e infografías curadas
- **Comunidad** — Directorio de miembros, perfiles y desafíos
- **Mentor IA** — Asistente de negocios con historial de conversaciones
- **Panel Admin** — CRM, gestión de contenido, usuarios, seguridad y analytics

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 22+ (ver `.nvmrc`)
- npm 10+
- Cuenta de Supabase (para variables de entorno)

### Instalación

```bash
git clone https://github.com/pabloeckert/MejoraApp.git
cd MejoraApp
npm install
```

### Variables de Entorno

Creá un archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-key-aqui
```

### Desarrollo

```bash
npm run dev          # Dev server en http://localhost:8080
npm run build        # Build de producción en dist/
npm run preview      # Preview del build de producción
```

### Testing

```bash
npm run test         # Tests unitarios (Vitest)
npm run test:watch   # Tests en modo watch
npm run test:coverage # Con reporte de cobertura
npm run test:e2e     # Tests E2E (Playwright)
```

### Linting

```bash
npm run lint         # ESLint
npx tsc --noEmit     # Type checking
```

---

## 🏗️ Arquitectura

Ver [`ARCHITECTURE.md`](ARCHITECTURE.md) para el detalle completo.

### Estructura de Directorios

```
src/
├── components/          # Componentes React
│   ├── admin/           # Panel de administración
│   ├── auth/            # Formularios de autenticación
│   ├── community/       # Perfiles y directorio
│   ├── crm/             # CRM (dentro de admin)
│   ├── diagnostic/      # Flujo del Mirror estratégico
│   ├── mentor/          # Chat del Mentor IA
│   ├── muro/            # Posts, comentarios, likes
│   ├── tabs/            # Tabs principales (Contenido, Muro, etc.)
│   └── ui/              # Componentes UI base (shadcn/ui)
├── contexts/            # React Contexts (Auth, Theme, I18n)
├── data/                # Datos estáticos (badges, preguntas diagnóstico)
├── hooks/               # Custom hooks
├── i18n/                # Internacionalización
├── integrations/        # Supabase client y tipos
├── lib/                 # Utilidades y lógica de negocio
├── pages/               # Páginas/rutas
├── services/            # Capa de servicios (abstracción de Supabase)
├── test/                # Tests unitarios
└── types/               # Tipos TypeScript globales
```

### Flujo de Datos

```
UI Component → Hook → Service → Supabase Client → Supabase DB
     ↑                                                  ↓
     └──────── Realtime subscription ←──────────────────┘
```

---

## 🔐 Seguridad

Ver [`SECURITY.md`](SECURITY.md) para el detalle completo.

### Headers de Seguridad (Vercel)

- `Content-Security-Policy` — Restringe orígenes de scripts, estilos, conexiones
- `Strict-Transport-Security` — HSTS con preload
- `X-Content-Type-Options` — Previene MIME sniffing
- `X-Frame-Options` — Previene clickjacking
- `Permissions-Policy` — Deshabilita cámara, micrófono, geolocalización

### Autenticación

- Supabase Auth con PKCE flow
- OAuth con Google
- Magic links y email/password
- MFA disponible para admins

### Validación

- Zod schemas para todos los formularios (`src/lib/validation.ts`)
- Password mínimo 8 caracteres con mayúscula y número
- Sanitización de HTML en inputs de usuario
- Rate limiting client-side para prevenir spam

---

## 📦 Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Framework | React 18 | UI library |
| Lenguaje | TypeScript 5.8 | Type safety |
| Bundler | Vite 5 | Build tool |
| CSS | Tailwind CSS 3.4 | Utility-first CSS |
| UI | shadcn/ui + Radix | Componentes accesibles |
| Backend | Supabase | Auth, DB, Realtime, Edge Functions |
| State | React Query | Server state management |
| Routing | React Router 6 | Navegación client-side |
| Analytics | PostHog | Event tracking |
| Monitoring | Sentry | Error tracking |
| Testing | Vitest + Playwright | Unit + E2E |
| PWA | Service Worker | Offline support |
| Deploy | Vercel | Hosting + CDN |
| CI/CD | GitHub Actions | Test + deploy automation |

---

## 🧪 Testing

### Unit Tests (Vitest)

- 103+ tests passing
- Coverage reporting con `npm run test:coverage`
- Setup en `src/test/setup.ts`
- Tests en `src/test/*.test.ts`

### E2E Tests (Playwright)

- Config en `playwright.config.ts`
- Proyectos: Desktop Chrome + Mobile (Pixel 5)
- Tests en `e2e/` directory
- Run: `npm run test:e2e`

### Lighthouse CI

- Config en `.lighthouserc.json`
- Assertions: accessibility ≥ 90%, performance ≥ 70%
- Se ejecuta en CI workflow

---

## 🚢 Deploy

### Producción

Push a `main` → GitHub Actions ejecuta:

1. `npm ci` — Instala dependencias
2. `npx tsc --noEmit` — Type checking
3. `npm run lint` — Linting
4. `npm run test` — Tests unitarios
5. `npm run build` — Build de producción
6. Verificación de bundle size (< 5MB)

Si todo pasa, Vercel auto-deploy a `app.mejoraok.com`.

### Staging

Push a `develop` → mismo pipeline que producción → deploy a staging.

### Variables de GitHub Secrets

| Secret | Propósito |
|--------|-----------|
| `VITE_SUPABASE_URL` | URL de Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Key de Supabase |
| `VITE_SUPABASE_PROJECT_ID` | ID del proyecto Supabase |

---

## 📊 Analytics y Tracking

### Eventos Principales

| Evento | Trigger | Propiedades |
|--------|---------|-------------|
| `login` | Inicio de sesión | method (email/google) |
| `signup` | Registro | method |
| `publish_post` | Post en muro | char_count |
| `complete_diagnostic` | Fin del Mirror | score, profile |
| `mentor_message_sent` | Mensaje al Mentor | conversation_id, length |
| `feature_blocked` | Feature premium bloqueado | feature, plan |

### Funnel de Activación

```
signup → onboarding_complete → first_visit → first_post → return_d1 → return_d7 → premium_intent
```

### A/B Testing

- Experimentos definidos en `src/lib/ab-testing.ts`
- Asignación determinística por userId (hash)
- Persistencia en localStorage

---

## 🌍 Internacionalización

- Sistema custom sin dependencias externas
- Idiomas: Español (principal), Inglés (preparación)
- Keys en `src/i18n/locales/index.ts`
- Hook: `useI18n()` → `t("key")`
- Persistencia de preferencia en localStorage

---

## 📱 PWA

- Service Worker con estrategia diferenciada:
  - **Navigation:** Network-first con offline fallback
  - **Assets hashed:** Cache-first (immutable)
  - **Otros:** Network-first con cache
- Manifest completo con shortcuts
- Push notifications via Web Push API

---

## 🤝 Contribuir

Ver [`CONTRIBUTING.md`](CONTRIBUTING.md) para guías detalladas.

### Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
refactor: cambio sin cambio de funcionalidad
docs: documentación
test: agregar o modificar tests
chore: tareas de mantenimiento
```

### Pull Requests

1. Crear branch desde `develop`: `feat/nombre-feature`
2. Hacer cambios + tests
3. Abrir PR a `main`
4. Completar checklist del PR template
5. Esperar review de @pabloeckert

---

## 📄 Licencia

Propietario — © 2026 MejoraApp

---

## 🔗 Links

- **Producción:** [app.mejoraok.com](https://app.mejoraok.com)
- **Repo:** [github.com/pabloeckert/MejoraApp](https://github.com/pabloeckert/MejoraApp)
- **Issues:** [GitHub Issues](https://github.com/pabloeckert/MejoraApp/issues)
