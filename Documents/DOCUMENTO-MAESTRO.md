# DOCUMENTO-MAESTRO.md — Fuente Única de Verdad

> **Proyecto:** MejoraApp — Comunidad de Líderes Empresariales
> **Stack:** React 18 · TypeScript · Vite 5 · Supabase · Tailwind CSS · shadcn/ui
> **Producción:** https://app.mejoraok.com
> **Repo:** https://github.com/pabloeckert/MejoraApp
> **Última actualización:** 2026-04-28

---

## 📌 Protocolo de Documentación

> **Cuando digas "documentar"**, se actualiza este archivo con los trabajos realizados.
> **Todos los archivos viven en `Documents/`** — nunca crear archivos sueltos en la raíz.

### Reglas
1. **Al inicio de sesión:** Leer este documento completo antes de tocar código.
2. **Al decir "documentar":** Actualizar §7 (Registro de Sesiones), §8 (Acciones Pendientes) y §9 (Plan) con lo trabajado.
3. **Nunca crear archivos sueltos** — todo va en `Documents/`.
4. **Al culminar cada sprint:** Pushear a `main` → deploy automático.
5. **Planes:** `✅` completado con fecha, `🔄` en progreso, `🔴` pendiente, `⏳` esperando decisión.
6. **Credenciales:** Nunca en código — usar GitHub Secrets + Supabase Secrets.

---

## 1. Resumen Ejecutivo

MejoraApp es el MVP digital de **Mejora Continua**, comunidad de negocios para líderes empresariales argentinos. App funcional en producción con muro anónimo moderado por IA, contenido de valor, diagnóstico estratégico y panel admin.

**Estado:** E1 ✅ · E2 ✅ · E3 ✅ · E4 ✅ · E5 ✅ · E6 ✅ · E7 🔄 (deploy pendiente + onboarding emails)

---

## 2. Arquitectura

### 2.1 Frontend (React SPA)

```
src/
├── pages/              # 5 páginas lazy-loaded
├── components/
│   ├── admin/          # 7 módulos (Contenido, IA, Muro, Novedades, Usuarios, Seguridad, CRM)
│   ├── auth/           # LoginForm, SignupForm, GoogleButton, AdminLoginForm
│   ├── tabs/           # Muro, Novedades, ContenidoDeValor
│   ├── ui/             # 30+ componentes shadcn/ui
│   └── [feature]       # DiagnosticTest, Onboarding, BadgeDisplay, etc.
├── contexts/           # AuthContext, ThemeContext, I18nContext
├── hooks/              # useWallInteractions, usePullToRefresh, useBadges, useRanking, useCRM
├── data/               # diagnosticData.ts, badges.ts
├── integrations/supabase/  # client.ts, types.ts
├── lib/                # utils.ts, analytics.ts, sentry.ts, push.ts, pdfExport.ts
├── repositories/       # index.ts (Repository Layer sobre Supabase)
├── i18n/               # locales/index.ts (es/en, 130+ claves)
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

**Vistas:** `crm_client_summary`, `crm_seller_ranking` · **RPC:** `get_crm_dashboard()`
**Funciones SQL:** `is_admin(UUID)`, `has_role(UUID, app_role)`, `handle_new_user()`, `update_wall_likes_count()`, `update_wall_post_comments_count()`, triggers de badges.

### 2.3 Edge Functions

| Función | Auth | Rate Limit |
|---------|------|------------|
| `moderate-post` | JWT | 3 posts/min |
| `moderate-comment` | JWT | 10 comments/min |
| `verify-admin` | JWT | — |
| `admin-action` (13 acciones) | JWT + admin | 30 req/min + audit log |
| `generate-content` | JWT + admin | — |
| `send-push-notification` | Service role | — |
| `send-diagnostic-email` | Service role | — |

**Módulos compartidos:** `_shared/cors.ts` · `_shared/log.ts`
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
| **Muro Anónimo** | Posts (500 chars) · Likes toggle · Comentarios (300 chars) · Moderación IA · Realtime · Infinite scroll · Pull-to-refresh · Eliminar propios · Badges · Ranking |
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
| **Producción** | Push `main` | Vercel (CDN + SSL) — en migración |
| **Preview** | Push `main` | GitHub Pages: `pabloeckert.github.io/MejoraApp/` |
| **Legacy** | Push `main` | Hostinger FTP: `app.mejoraok.com` |
| **Staging** | Push `develop` | Vercel preview |

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
| Líneas de código (TS/TSX) | ~17,000 |
| Archivos fuente | 120+ |
| Tests unitarios | 103+ (100% passing) |
| Tests E2E | 25 (Playwright) |
| Tests accesibilidad | 7 (axe-core) |
| Tablas DB | 23 (19 core + 4 CRM) |
| Edge Functions | 7 |
| Eventos analytics | 28+ |
| Bundle gzipped | ~355KB |

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

### E7 — Deploy y Activación 🔄 (6/8 ✅)

| # | Tarea | Estado |
|---|-------|--------|
| 7.1 | Fix Realtime channel collision | ✅ |
| 7.2 | Onboarding emails — SQL listo | ✅ (ejecutar en Supabase) |
| 7.3 | Onboarding emails — Edge Function lista | ✅ (desplegar) |
| 7.4 | Onboarding emails — cron workflow | 🟡 (requiere 7.2 + 7.3) |
| 7.5 | Consolidar docs | ✅ |
| 7.6 | GitHub Pages configurado | ✅ |
| 7.7 | Migración gamificación ejecutada | ✅ |
| 7.8 | Migrar a Vercel | 🔄 (ver §Setup) |

---

## 7. Registro de Sesiones (últimas 10)

| Fecha | Resumen |
|-------|---------|
| 2026-04-28 | **Middleware migration + Report + Providers refactor** — Edge Functions (moderate-post, moderate-comment, verify-admin, admin-action) migradas a middleware compartido. Providers.tsx compositor. ReportDialog en muro. Glosario creado. Commits `4643837`, `b8c408c`, `d54a3b2`. |
| 2026-04-28 | **Análisis multidisciplinario completo (30+ roles)** — DOCUMENTO-MAESTRO reestructurado con perspectivas de todas las áreas. Plan optimizado por etapas E7-E12. Protocolo "documentar" confirmado. |
| 2026-04-28 | **Consolidación documentación total** — DOCUMENTO-MAESTRO compactado (915→396 líneas). README actualizado. Push `2d700e3`. |
| 2026-04-27 | GitHub Pages fix + Vercel setup + onboarding email prep |
| 2026-04-26 | Login UI + renombre Mirror + admin setup + Realtime fix |
| 2026-04-26 | Consolidación docs v2 · E6 completa (12/12) |
| 2026-04-25 | CRM integrado · VAPID keys configuradas |
| 2026-04-25 | Optimización producción · CORS fix crítico · CSP |
| 2026-04-25 | Freemium infrastructure · Feature flags |
| 2026-04-24 | E5 completa: Legal + E2E + UX Polish |
| 2026-04-24 | E4 completa: PostHog + Retención + Gamificación |

---

## 8. Acciones Pendientes del Usuario

| # | Acción | Estado |
|---|--------|--------|
| 1 | Conectar repo a Vercel | 🔴 `vercel.json` listo, ir a vercel.com/new |
| 2 | Crear cuenta Resend + verificar dominio | 🔴 Resend.com → Add Domain `mejoraok.com` |
| 3 | Ejecutar SQL onboarding_emails en Supabase | 🔴 `supabase/migrations/20260426000000_onboarding_emails.sql` |
| 4 | Desplegar EF send-onboarding-email | 🔴 `supabase functions deploy send-onboarding-email` |
| 5 | Agregar SUPABASE_SERVICE_ROLE_KEY a GitHub Secrets | 🔴 Para cron onboarding |
| 6 | Verificar fix Realtime en producción | ⏳ Confirmar que error ya no aparece |

---

## 9. Plan Optimizado — Próximas Etapas (E7-E12)

### E7 — Deploy y Activación 🔄 (actual)
Pendiente: conectar Vercel · onboarding emails (SQL + EF + cron)

### E8 — Crecimiento y Monetización (Sprint 1 semana)
| # | Tarea | Prioridad |
|---|-------|-----------|
| 8.1 | Poblar CRM con datos reales | 🔴 Alta |
| 8.2 | Definir corte free/premium y activar | 🔴 Alta |
| 8.3 | A/B testing en onboarding | 🟡 Media |
| 8.4 | Blog/SEO orgánico en landing | 🟡 Media |
| 8.5 | Email onboarding: poblar templates finales | 🟡 Media |

### E9 — Escalamiento Técnico (Sprint 1-2 semanas)
| # | Tarea | Prioridad |
|---|-------|-----------|
| 9.1 | Migrar hosting a Vercel | 🔴 Alta (en progreso) |
| 9.2 | CDN + edge caching | 🔴 Alta (incluido en Vercel) |
| 9.3 | 2FA para admins | 🔴 Alta |
| 9.4 | Visual regression tests | 🟢 Baja |
| 9.5 | Lighthouse CI en pipeline | 🟢 Baja |

### E10 — App Nativa (evaluar)
Solo si 30+ DAU. PWA es suficiente por ahora.

### E11 — Operaciones y Compliance (Sprint 1 semana)
| # | Tarea | Prioridad |
|---|-------|-----------|
| 11.1 | Política de retención de datos | 🟡 Media |
| 11.2 | DPIA | 🟡 Media |
| 11.3 | WAF rules (Cloudflare) | 🟡 Media |
| 11.4 | SLO definition (99.9%) | 🟢 Baja |

### E12 — Data & ML (solo si hay tracción)
| # | Tarea | Prioridad |
|---|-------|-----------|
| 12.1 | Data warehouse (Supabase → BigQuery/ClickHouse) | 🟡 Media |
| 12.2 | Pipeline ETL para BI | 🟡 Media |
| 12.3 | Modelo predictivo de churn | 🟢 Baja |
| 12.4 | Recomendaciones ML sobre collaborative filtering | 🟢 Baja |

---

## 10. Análisis Multidisciplinario (30+ Perspectivas)

### 🔧 ÁREA TÉCNICA

#### Software Architect (8/10)
- **Fortalezas:** Separación clara Frontend/Backend. Repository Pattern sobre Supabase. Lazy loading por ruta. Providers encapsulados (Auth, Theme, I18n).
- **Deuda técnica menor:** `App.tsx` con 6 providers anidados — considerar compositor. `src/lib/` mezcla utilidades con lógica de negocio (analytics, sentry, plans).
- **Recomendación:** Extraer un `AppProvider` que componga todos los providers. Separar `lib/` en `lib/` (utilidades puras) y `services/` (lógica de negocio).

#### Cloud Architect (7/10)
- **Fortalezas:** Supabase como BaaS managed elimina ops de DB. Edge Functions serverless. Vercel para hosting con CDN global.
- **Riesgo:** Lock-in moderado en Supabase (RLS, Edge Functions, Auth). Si hay que migrar, el esfuerzo es medio-alto.
- **Recomendación:** El Repository Layer ya abstrae Supabase — bien. Considerar un adapter pattern para Auth si hay que migrar. Vercel region `gru1` (São Paulo) es correcto para LATAM.

#### Backend Developer (8/10)
- **Fortalezas:** 23 tablas bien normalizadas. RLS en todas las tablas. Edge Functions con rate limiting, audit log, CORS centralizado. Fallback IA multi-provider.
- **Mejoras:** Las Edge Functions podrían compartir más middleware (auth check, rate limit). Falta validación de input server-side en algunos endpoints.
- **Recomendación:** Crear un middleware chain en `_shared/middleware.ts` que encadene auth → rate-limit → validate → handler.

#### Frontend Developer (7/10)
- **Fortalezas:** React 18 + TypeScript estricto. 30+ componentes shadcn/ui reutilizables. Lazy loading. Custom hooks para lógica compleja (useWallInteractions, usePullToRefresh).
- **Deuda técnica:** Algunos componentes grandes (>300 líneas): `Muro.tsx`, `AdminCRM.tsx`. Testing de componentes podría ser más granular.
- **Recomendación:** Extraer sub-componentes de los archivos grandes. Agregar Storybook para documentar componentes UI.

#### iOS Developer (N/A — PWA)
- **Estado:** App es PWA, no nativa. `manifest.json` configurado, Service Worker network-first.
- **Evaluación:** Para el DAU actual (<30), PWA es la decisión correcta. Instalable en iOS desde Safari.
- **Riesgo iOS:** Push notifications en iOS PWA tienen soporte limitado desde iOS 16.4+.
- **Recomendación:** Monitorear adopción PWA en iOS. Si >40% de usuarios son iOS y necesitan push nativo, evaluar wrapper (Capacitor).

#### Android Developer (N/A — PWA)
- **Estado:** PWA instalable en Android Chrome con push notifications completas.
- **Evaluación:** Soporte nativo excelente para PWA en Android.
- **Recomendación:** Priorizar experiencia Android en testing. El manifest ya tiene iconos y theme color.

#### DevOps Engineer (8/10)
- **Fortalezas:** CI con GitHub Actions (lint + test + build). Deploy automático a Vercel. Staging separado. Rollback via Vercel. Concurrency control en workflows.
- **Mejoras:** Falta monitoring post-deploy (health checks). No hay alertas si el build falla en producción.
- **Recomendación:** Agregar workflow step que haga `curl` al endpoint post-deploy y verifique 200. Agregar notificación Slack/Discord si deploy falla.

#### Site Reliability Engineer — SRE (7/10)
- **Fortalezas:** Sentry para error tracking. CSP headers. Rate limiting contra abuso. Service Worker para offline resilience.
- **Falta:** SLO/SLI definition. No hay métricas de uptime. No hay runbook para incidentes.
- **Recomendación:** Definir SLO: 99.9% uptime (43 min/mes downtime permitido). Crear runbook básico para: caída de Supabase, rate limit excedido, moderación IA falla.

#### Cybersecurity Architect (9/10)
- **Fortalezas:** RLS en TODAS las tablas. Edge Functions como gatekeeper. Rate limiting por tipo de operación. CSP, CORS centralizado. Admin audit log. Self-demotion prevention. Moderación IA como capa de contenido.
- **Mejoras:** Falta 2FA para admins. No hay WAF. Tokens JWT sin rotación explícita.
- **Recomendación:** Implementar 2FA via Supabase MFA. Agregar Cloudflare como WAF. Definir política de rotación de secrets.

#### Data Engineer (6/10)
- **Fortalezas:** 23 tablas bien estructuradas. Vistas materializadas para CRM. RPC para dashboards.
- **Falta:** No hay pipeline ETL. No hay data warehouse. Analytics en PostHog pero sin consolidar con datos de Supabase.
- **Recomendación:** Cuando haya tracción significativa, crear pipeline: Supabase → ETL → Data Warehouse → BI dashboards.

#### Machine Learning Engineer (5/10)
- **Fortalezas:** Moderación IA con fallback multi-provider (Gemini → Groq → OpenRouter). Sistema de recomendaciones por perfil básico.
- **Falta:** No hay modelo propio. Recomendaciones son rule-based, no ML. No hay pipeline de entrenamiento.
- **Recomendación:** Para MVP actual, rule-based es suficiente. Cuando haya 500+ usuarios, evaluar collaborative filtering para contenido.

#### QA Automation Engineer (8/10)
- **Fortalezas:** 103+ tests unitarios. 25 E2E (Playwright). 7 tests accesibilidad (axe-core). CI pipeline con coverage.
- **Mejoras:** No hay visual regression testing. Tests de integración podrían cubrir más Edge Functions.
- **Recomendación:** Agregar Playwright visual comparison para pantallas críticas. Agregar tests de carga para endpoints públicos.

#### Database Administrator — DBA (8/10)
- **Fortalezas:** 23 tablas normalizadas. Índices implícitos en foreign keys. Migraciones versionadas (17 archivos). RLS policies documentadas.
- **Mejoras:** No hay EXPLAIN ANALYZE de queries críticas. No hay particionamiento para tablas de logs.
- **Recomendación:** Auditar queries del muro (más traffic) con EXPLAIN. Considerar particionar `moderation_log` y `admin_audit_log` por mes cuando crezcan.

---

### 📦 ÁREA DE PRODUCTO Y GESTIÓN

#### Product Manager (7/10)
- **Fortalezas:** MVP bien definido con 7 etapas claras. Priorización basada en impacto. Feature flags para freemium (preparado).
- **Riesgo:** No hay métricas de éxito definidas (¿cuántos DAU es éxito? ¿qué conversión freemium?).
- **Recomendación:** Definir North Star Metric. Ejemplo: "30 DAU activos con 3+ sesiones/semana". Medir desde día 1.

#### Product Owner (7/10)
- **Fortalezas:** Backlog implicito en el plan E7-E12. Prioridades claras (🔴🟡🟢). Cada etapa tiene entregables concretos.
- **Mejoras:** Falta user stories formales. No hay acceptance criteria explícito.
- **Recomendación:** Para E8+, escribir user stories: "Como [rol], quiero [feature], para [beneficio]" con criterios de aceptación.

#### Scrum Master / Agile Coach (6/10)
- **Estado:** Proyecto es solo dev (1 persona). No necesita Scrum formal.
- **Fortalezas:** Sprints implícitos por etapa. Changelog como retrospectiva.
- **Recomendación:** Mantener el ritmo actual. Cuando haya más miembros, implementar ceremonias mínimas: daily async + retro semanal.

#### UX Researcher (6/10)
- **Fortalezas:** Onboarding con skip (respeta al usuario). NPS survey implementado. Empty states con CTA.
- **Falta:** No hay entrevistas de usuario documentadas. No hay heatmap ni session recording.
- **Recomendación:** Agregar PostHog session recordings (gratis hasta 15k events). Entrevistar 5 usuarios reales antes de E8.

#### UX Designer (8/10)
- **Fortalezas:** Mobile-first. Navegación bottom nav. Onboarding progresivo. Pull-to-refresh. Infinite scroll. Feedback visual en todas las acciones.
- **Mejoras:** Diagnóstico podría tener progress indicator más visible. Muro podría beneficiarse de skeleton loading.
- **Recomendación:** Agregar skeleton screens en lugar de spinners para perceived performance.

#### UI Designer (7/10)
- **Fortalezas:** shadcn/ui como base de componentes. Tipografía BwModelica (custom). Escala tipográfica definida. Contraste WCAG AA.
- **Mejoras:** Sin design tokens formales. Colores hardcodeados en algunos componentes.
- **Recomendación:** Extraer design tokens a `tailwind.config.ts` (ya existe pero subutilizado). Documentar paleta de colores en el design system.

#### UX Writer (8/10)
- **Fortalezas:** Voz argentina con voseo consistente. Microcopy humanizado ("Esta página se perdió en el camino"). Empty states con personalidad.
- **Mejoras:** Falta glossary de términos del producto.
- **Recomendación:** Crear glosario en Documents/ con términos clave: "Mirror", "Muro", "Contenido de Valor".

#### Localization Manager (7/10)
- **Fortalezas:** i18n implementado (es/en, 130+ claves). Detección automática de idioma. Persistencia.
- **Falta:** No hay proceso de traducción. No hay context para traductores.
- **Recomendación:** Para expansión a otros mercados, agregar context comments en las claves i18n.

#### Delivery Manager (8/10)
- **Fortalezas:** Deploy automático. Staging separado. Rollback definido. CI con tests obligatorios.
- **Mejoras:** No hay feature branches workflow (todo va a main directo).
- **Recomendación:** Para equipo de 2+ personas, implementar feature branches + PR reviews.

---

### 📈 ÁREA COMERCIAL Y DE CRECIMIENTO

#### Growth Manager (6/10)
- **Fortalezas:** Sistema de referidos implementado. A/B testing framework. Onboarding optimizado.
- **Falta:** No hay funnel analytics completo. No hay estrategia de activación post-signup.
- **Recomendación:** Definir funnel: Signup → Onboarding Complete → First Post → Return Visit → Premium. Medir conversión en cada step.

#### ASO Specialist (N/A — Web App)
- **Estado:** App es web/PWA, no en App Store. No aplica ASO tradicional.
- **Alternativa:** SEO para web (ver SEO Specialist).

#### Performance Marketing Manager (5/10)
- **Fortalezas:** PostHog para tracking. A/B testing para optimización.
- **Falta:** No hay paid ads. No hay attribution tracking. No hay pixel de Meta/Google.
- **Recomendación:** Cuando haya presupuesto de marketing, integrar Meta Pixel + Google Ads conversion tracking en PostHog.

#### SEO Specialist (7/10)
- **Fortalezas:** robots.txt configurado. sitemap.xml. JSON-LD structured data. FAQ visible. Páginas estáticas (términos, privacidad).
- **Mejoras:** SPA con lazy loading puede dificultar crawling. Falta meta tags dinámicos por ruta.
- **Recomendación:** Agregar react-helmet para meta tags dinámicos. Considerar SSR/SSG para landing (Next.js migration si el SEO es crítico).

#### Business Development Manager (6/10)
- **Fortalezas:** CRM propio integrado en admin. Tracking de interacciones comerciales. Dashboard de ventas.
- **Falta:** No hay integración con herramientas externas (HubSpot, Pipedrive). No hay pipeline de leads.
- **Recomendación:** Para MVP, el CRM interno es suficiente. Migrar a HubSpot cuando haya 10+ clientes activos.

#### Account Manager (N/A — MVP)
- **Estado:** No aplica aún. CRM admin es el precursor.
- **Recomendación:** Cuando haya 20+ clientes, definir proceso de account management basado en datos del CRM.

#### Content Manager (7/10)
- **Fortalezas:** 4 categorías de contenido. Generación IA de contenido. Contenido programado. Recomendaciones por perfil.
- **Mejoras:** No hay calendario editorial. No hay workflow de aprobación de contenido.
- **Recomendación:** Crear calendario editorial en el CRM admin. Agregar estado "borrador → revisión → publicado".

#### Community Manager (7/10)
- **Fortalezas:** Muro anónimo con moderación IA. Badges y ranking para engagement. Community rules.
- **Falta:** No hay herramientas de moderación manual (solo IA). No hay sistema de reportes de usuarios.
- **Recomendación:** Agregar botón "Reportar" en posts/comentarios. Crear dashboard de moderación en admin.

---

### ⚖️ ÁREA DE OPERACIONES, LEGAL Y ANÁLISIS

#### Business Intelligence Analyst (6/10)
- **Fortalezas:** PostHog con 28+ eventos. CRM dashboard con vistas SQL. NPS tracking.
- **Falta:** No hay dashboards consolidados. Datos dispersos entre PostHog y Supabase.
- **Recomendación:** Crear dashboard ejecutivo en PostHog con: DAU, posts/día, diagnósticos/día, NPS promedio, conversión freemium.

#### Data Scientist (5/10)
- **Fortalezas:** Datos de engagement disponibles. NPS data. Diagnósticos con scores.
- **Falta:** No hay análisis predictivo. No hay segmentación de usuarios.
- **Recomendación:** Cuando haya 200+ usuarios, hacer clustering de usuarios por comportamiento para personalizar experiencia.

#### Legal & Compliance Officer (7/10)
- **Fortalezas:** Política de privacidad. Términos de servicio. Cookie consent. "Mis Datos" (GDPR). Data deletion implementada.
- **Falta:** No hay DPIA. No hay registro de procesamiento de datos. No hay DPO designado.
- **Recomendación:** Completar DPIA antes de escalar. Registrar procesamiento de datos ante autoridad competente si aplica.

#### Data Protection Officer — DPO (6/10)
- **Fortalezas:** Usuario puede ver y eliminar sus datos. Cookie consent con opt-in. Anonimización en muro.
- **Falta:** No hay procedimiento de breach notification. No hay registro de actividades de procesamiento.
- **Recomendación:** Crear procedimiento de notificación de brechas (72h GDPR). Documentar base legal de cada tratamiento de datos.

#### Customer Success Manager (5/10)
- **Fortalezas:** NPS survey. Email post-diagnóstico. WhatsApp CTA para soporte.
- **Falta:** No hay health score de usuarios. No hay proceso de re-engagement para usuarios inactivos.
- **Recomendación:** Crear health score basado en: última visita, posts, diagnósticos. Automatizar email de re-engagement a los 7 días de inactividad.

#### Technical Support Tier 1 (N/A — MVP)
- **Estado:** WhatsApp CTA como soporte Tier 1.
- **Recomendación:** Cuando haya 50+ tickets/mes, implementar sistema de tickets (Intercom, Crisp).

#### Technical Support Tier 2 (N/A — MVP)
- **Estado:** Dev resuelve directamente.
- **Recomendación:** Documentar troubleshooting guide en Documents/.

#### Technical Support Tier 3 (N/A — MVP)
- **Estado:** Dev + Sentry para bugs.
- **Recomendación:** Sentry ya captura errores. Agregar alertas automáticas para errores críticos.

#### Revenue Operations — RevOps (5/10)
- **Fortalezas:** CRM con pipeline comercial. Feature flags para freemium. Tracking de interacciones.
- **Falta:** No hay métricas de revenue. No hay forecast. No hay integración con herramientas de facturación.
- **Recomendación:** Cuando haya revenue, integrar con herramientas de facturación (Mercado Pago para LATAM). Crear dashboard de MRR, churn, LTV.

---

### 📊 Resumen Ejecutivo por Área

| Área | Score | Estado | Top Prioridad |
|------|-------|--------|---------------|
| **Seguridad** | 9/10 | ✅ Excelente | 2FA para admins |
| **Backend** | 8/10 | ✅ Sólido | Middleware chain |
| **Frontend** | 7/10 | ✅ Funcional | Reducir tamaño componentes |
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

## 14. Archivos en Documents/

| Archivo | Propósito |
|---------|-----------|
| `DOCUMENTO-MAESTRO.md` | **Este archivo** — fuente única de verdad |
| `GUIA-SETUP-INICIAL.md` | Guía paso a paso: Vercel + Resend + onboarding emails |
| `GLOSARIO.md` | Glosario de términos del producto (para equipo, traductores, docs) |
| `CHANGELOG-2026-04-28.md` | Changelog de la sesión |
| `MIGRACION-CRM-2026-04-25.sql` | Script CRM (4 tablas + vistas + RPC) — ejecutado |
| `PUSH_SUBSCRIPTIONS.sql` | Script SQL push_subscriptions |
| `MIGRACION-SEGURIDAD-2026-04-23.sql` | Script hardening — ejecutado |
| `MIGRACION-GAMIFICACION-2026-04-24.sql` | Script gamificación — ejecutado |
| `CLEAN_SETUP.sql` | Setup limpio completo de DB |
| `SECURITY_HARDENING.sql` | Hardening pre-launch |

---

## 15. Cronograma

```
✅ E1: Seguridad (completa)
✅ E2: DevOps (completa)
✅ E3: UX (completa)
✅ E4: Analytics y Retención (completa)
✅ E5: Calidad y Robustez (completa)
✅ E6: Escalamiento (completa — 12/12 + CRM)
🔄 E7: Deploy y Activación (6/8 ✅ — pendiente: Vercel + onboarding emails)
📋 E8: Crecimiento (5 tareas) — Sprint 1 semana
🔄 E9: Escalamiento Técnico (9.1-9.2 en progreso)
📋 E10: App Nativa (evaluar)
📋 E11: Compliance (4 tareas) — Sprint 1 semana
📋 E12: Data & ML (solo si hay tracción)
```

**Tiempo estimado E7-E12:** 4-6 semanas
**Próximo paso:** Conectar Vercel + crear Resend + ejecutar SQL onboarding_emails

---

*Fuente única de verdad. Se actualiza al decir "documentar".*
