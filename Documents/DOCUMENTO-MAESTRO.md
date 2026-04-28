# DOCUMENTO-MAESTRO.md — Fuente Única de Verdad

> **Proyecto:** MejoraApp — Comunidad de Líderes Empresariales
> **Stack:** React 18 · TypeScript · Vite 5 · Supabase · Tailwind CSS · shadcn/ui
> **Producción:** https://app.mejoraok.com
> **Repo:** https://github.com/pabloeckert/MejoraApp
> **Última actualización:** 2026-04-29

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

| Función | Auth | Rate Limit | Middleware |
|---------|------|------------|------------|
| `moderate-post` | JWT | 3 posts/min | ✅ `withMiddleware` |
| `moderate-comment` | JWT | 10 comments/min | ✅ `withMiddleware` |
| `verify-admin` | JWT + admin | — | ✅ `withMiddleware` |
| `admin-action` (13 acciones) | JWT + admin | 30 req/min + audit log | ✅ `withMiddleware` |
| `generate-content` | JWT + admin | — | Legacy |
| `send-push-notification` | Service role | — | Legacy |
| `send-diagnostic-email` | Service role | — | Legacy |

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

### E7 — Deploy y Activación 🔄 (7/9 ✅)

| # | Tarea | Estado |
|---|-------|--------|
| 7.1 | Fix Realtime channel collision | ✅ |
| 7.2 | Onboarding emails — SQL listo | ✅ (ejecutar en Supabase) |
| 7.3 | Onboarding emails — Edge Function lista | ✅ (desplegar) |
| 7.4 | Onboarding emails — cron workflow | 🟡 (requiere 7.2 + 7.3) |
| 7.5 | Consolidar docs | ✅ |
| 7.6 | GitHub Pages configurado | ✅ |
| 7.7 | Migración gamificación ejecutada | ✅ |
| 7.8 | Migrar a Vercel | 🟡 En progreso (GitHub App instalada, falta import + deploy) |
| 7.9 | Deploy Edge Functions migradas a middleware | 🔴 `supabase functions deploy moderate-post moderate-comment verify-admin admin-action` |

---

## 7. Registro de Sesiones (últimas 10)

| Fecha | Resumen |
|-------|---------|
| 2026-04-29 | **Refactor AdminCRM + Skeleton + Health Check** — AdminCRM 900→34 líneas (split en 4 módulos: CRMDashboard, CRMClientsTab, CRMInteractionsTab, CRMProductsTab + constants). Skeleton components (Card, Table, KPI, Chart, List). Deploy health check (3 intentos post-deploy). 103 tests passing. Push `d75b800`. |
| 2026-04-29 | **Consolidación definitiva + análisis 30+ roles optimizado** — DOCUMENTO-MAESTRO reestructurado como fuente única. Guía setup, glosario y changelog integrados. Plan optimizado E7-E12 con prioridades concretas. Push `5ecfb06`. |
| 2026-04-29 | **Setup Vercel en progreso** — Usuario creó cuenta Vercel con GitHub. Importando repo `MejoraApp`. Pendiente: env vars + deploy. |
| 2026-04-28 | **Sesión completa: análisis + refactor + setup Vercel** — Providers.tsx compositor. ReportDialog en muro. Middleware compartido para Edge Functions. 4 Edge Functions migradas. GLOSARIO.md creado. Setup Vercel guiado. |
| 2026-04-28 | **Consolidación documentación total** — DOCUMENTO-MAESTRO compactado (915→396 líneas). README actualizado. |
| 2026-04-27 | GitHub Pages fix + Vercel setup + onboarding email prep |
| 2026-04-26 | Login UI + renombre Mirror + admin setup + Realtime fix |
| 2026-04-26 | Consolidación docs v2 · E6 completa (12/12) |
| 2026-04-25 | CRM integrado · VAPID keys configuradas |
| 2026-04-25 | Optimización producción · CORS fix crítico · CSP |
| 2026-04-25 | Freemium infrastructure · Feature flags |
| 2026-04-24 | E5 completa: Legal + E2E + UX Polish |

---

## 8. Acciones Pendientes del Usuario

| # | Acción | Prioridad | Estado |
|---|--------|-----------|--------|
| 1 | Crear cuenta Vercel + importar repo + env vars + deploy | 🔴 Crítico | 🟡 En progreso (cuenta creada, importando repo) |
| 2 | Crear cuenta Resend + verificar dominio `mejoraok.com` | 🔴 Crítico | 🔴 Pendiente |
| 3 | Ejecutar SQL `onboarding_emails` en Supabase SQL Editor | 🔴 Alta | 🔴 Pendiente |
| 4 | Desplegar EF `send-onboarding-email` | 🔴 Alta | 🔴 Pendiente |
| 5 | Agregar `SUPABASE_SERVICE_ROLE_KEY` a GitHub Secrets | 🔴 Alta | 🔴 Pendiente |
| 6 | Deploy Edge Functions migradas a middleware | 🔴 Alta | 🔴 Pendiente |
| 7 | Verificar fix Realtime en producción | 🟡 Media | ⏳ Confirmar |

---

## 9. Plan Optimizado — Próximas Etapas (E7-E12)

### E7 — Deploy y Activación 🔄 (actual — completar esta semana)

| # | Tarea | Prioridad | Estado |
|---|-------|-----------|--------|
| 7.8 | Importar repo en Vercel + env vars + deploy | 🔴 Crítico | 🟡 En progreso (cuenta creada, importando) |
| 7.9 | Deploy Edge Functions con middleware | 🔴 Crítico | 🔴 Pendiente (requiere Supabase CLI) |
| 7.2-7.4 | Onboarding emails (SQL + EF + cron) | 🔴 Alta | 🔴 Pendiente (requiere Resend) |
| 7.10 | AdminCRM refactor (900→34 líneas) | 🟡 Media | ✅ Completado 2026-04-29 |
| 7.11 | Skeleton components (5 variantes) | 🟡 Media | ✅ Completado 2026-04-29 |
| 7.12 | Deploy health check post-deploy | 🟡 Media | ✅ Completado 2026-04-29 |

**Done criteria:** App servida desde Vercel, emails onboarding funcionando, Edge Functions desplegadas.

### E8 — Crecimiento y Activación (Sprint 1 semana)

| # | Tarea | Rol responsable | Prioridad |
|---|-------|-----------------|-----------|
| 8.1 | Definir North Star Metric (30 DAU, 3+ sesiones/semana) | Product Manager | 🔴 Alta |
| 8.2 | Poblar CRM con datos reales (10+ clientes) | Business Dev | 🔴 Alta |
| 8.3 | Activar freemium: definir corte free/premium | Product Owner | 🔴 Alta |
| 8.4 | Funnel analytics: Signup→Onboarding→Post→Return | Growth Manager | 🟡 Media |
| 8.5 | A/B testing en onboarding (variantes) | Growth Manager | 🟡 Media |
| 8.6 | Email templates finales (day1/day3/day7) | Content Manager | 🟡 Media |

**Done criteria:** Freemium activo, CRM poblado, funnel midiendo, emails enviándose.

### E9 — Escalamiento Técnico (Sprint 1-2 semanas)

| # | Tarea | Rol responsable | Prioridad |
|---|-------|-----------------|-----------|
| 9.1 | 2FA para admins (Supabase MFA) | Cybersecurity | 🔴 Alta |
| 9.2 | Health checks post-deploy en CI | DevOps/SRE | 🔴 Alta |
| 9.3 | Separar `lib/` en `lib/` (utils) + `services/` (lógica) | Software Architect | 🟡 Media |
| 9.4 | Reducir componentes >300 líneas (AdminCRM, Muro, DiagnosticTest) | Frontend Dev | 🟡 Media |
| 9.5 | Skeleton loading en pantallas críticas | UX Designer | 🟡 Media |
| 9.6 | Design tokens formales en `tailwind.config.ts` | UI Designer | 🟢 Baja |
| 9.7 | Storybook para componentes UI | Frontend Dev | 🟢 Baja |
| 9.8 | Lighthouse CI en pipeline | DevOps | 🟢 Baja |
| 9.9 | Visual regression tests (Playwright) | QA Automation | 🟢 Baja |

**Done criteria:** 2FA activo, CI con health checks, componentes refactorizados, skeleton loading en muro/diagnóstico.

### E10 — App Nativa (evaluar si 30+ DAU)

| # | Tarea | Prioridad | Condición |
|---|-------|-----------|-----------|
| 10.1 | Evaluar Capacitor para wrapper nativo | ⏳ | Solo si DAU > 30 |
| 10.2 | Push notifications nativas iOS | ⏳ | Solo si >40% usuarios iOS |
| 10.3 | App Store / Play Store deployment | ⏳ | Solo si 10.1 + 10.2 |

**Decisión:** PWA es suficiente por ahora. No invertir hasta tener tracción.

### E11 — Operaciones y Compliance (Sprint 1 semana)

| # | Tarea | Rol responsable | Prioridad |
|---|-------|-----------------|-----------|
| 11.1 | DPIA (Data Protection Impact Assessment) | DPO/Legal | 🟡 Media |
| 11.2 | Procedimiento breach notification (72h GDPR) | DPO | 🟡 Media |
| 11.3 | Registro de actividades de procesamiento | Legal | 🟡 Media |
| 11.4 | WAF rules (Cloudflare free tier) | Cybersecurity | 🟡 Media |
| 11.5 | SLO definition: 99.9% uptime (43 min/mes) | SRE | 🟢 Baja |
| 11.6 | Runbook incidentes (Supabase caído, rate limit, moderación IA falla) | SRE | 🟢 Baja |

**Done criteria:** DPIA completado, WAF activo, SLO definido, runbook creado.

### E12 — Data & ML (solo si hay tracción)

| # | Tarea | Prioridad | Condición |
|---|-------|-----------|-----------|
| 12.1 | Dashboard ejecutivo consolidado (PostHog) | 🟡 Media | Siempre |
| 12.2 | Pipeline ETL: Supabase → Data Warehouse | 🟡 Media | Si 200+ usuarios |
| 12.3 | Clustering de usuarios por comportamiento | 🟢 Baja | Si 500+ usuarios |
| 12.4 | Modelo predictivo de churn | 🟢 Baja | Si 1000+ usuarios |
| 12.5 | Recomendaciones ML (collaborative filtering) | 🟢 Baja | Si 1000+ usuarios |

**Decisión:** Data warehouse solo con tracción significativa. Rule-based recommendations son suficientes para MVP.

---

## 10. Análisis Multidisciplinario (30+ Perspectivas)

### 🔧 ÁREA TÉCNICA

#### Software Architect (8/10)
- **Fortalezas:** Separación clara Front/Back. Repository Pattern. Lazy loading. Providers encapsulados.
- **Deuda técnica:** `lib/` mezcla utils con lógica de negocio. Componentes >300 líneas (AdminCRM 900, Muro 604, DiagnosticTest 576).
- **Plan:** E9.3 separar `lib/` + `services/`. E9.4 descomponer componentes grandes. Extraer sub-componentes de AdminCRM.

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
- **Deuda:** AdminCRM.tsx (900 líneas), Muro.tsx (604), DiagnosticTest.tsx (576). Testing de componentes poco granular.
- **Plan:** E9.4 descomponer en sub-componentes. Agregar tests de componente por feature.

#### iOS Developer (N/A — PWA)
- **Estado:** PWA instalable en iOS Safari. Push limitado (iOS 16.4+).
- **Plan:** E10 evaluar Capacitor si >40% usuarios iOS necesitan push nativo.

#### Android Developer (N/A — PWA)
- **Estado:** PWA con push completo en Android Chrome.
- **Plan:** Priorizar Android en testing. Manifest ya configurado.

#### DevOps Engineer (8/10)
- **Fortalezas:** CI con GitHub Actions. Deploy automático. Staging. Rollback. Concurrency control.
- **Falta:** Health checks post-deploy. Alertas si build falla en producción.
- **Plan:** E9.2 agregar health check (`curl` post-deploy → 200). Notificación Discord si deploy falla.

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
- **Falta:** Glosario ya creado (GLOSARIO.md).
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

> **Nota:** `GUIA-SETUP-INICIAL.md`, `GLOSARIO.md` y `CHANGELOG-*.md` se integraron en este documento (§13, §14, §7 respectivamente).

---

## 16. Cronograma

```
✅ E1: Seguridad (completa)
✅ E2: DevOps (completa)
✅ E3: UX (completa)
✅ E4: Analytics y Retención (completa)
✅ E5: Calidad y Robustez (completa)
✅ E6: Escalamiento (completa — 12/12 + CRM)
🔄 E7: Deploy y Activación (7/9 ✅ — pendiente: Vercel + onboarding emails + EF deploy)
📋 E8: Crecimiento (6 tareas) — Sprint 1 semana
📋 E9: Escalamiento Técnico (9 tareas) — Sprint 1-2 semanas
⏳ E10: App Nativa (evaluar si 30+ DAU)
📋 E11: Compliance (6 tareas) — Sprint 1 semana
📋 E12: Data & ML (solo si hay tracción)
```

**Tiempo estimado E7-E12:** 4-6 semanas
**Próximo paso:** Completar E7 (Vercel + Resend + EF deploy) → luego E8

---

*Fuente única de verdad. Se actualiza al decir "documentar".*
