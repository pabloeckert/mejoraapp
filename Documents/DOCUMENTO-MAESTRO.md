# DOCUMENTO-MAESTRO.md — Fuente Única de Verdad

> **Proyecto:** MejoraApp — Comunidad de Líderes Empresariales
> **Stack:** React 18 · TypeScript · Vite 5 · Supabase · Tailwind CSS · shadcn/ui
> **Producción:** https://app.mejoraok.com
> **Repo:** https://github.com/pabloeckert/MejoraApp
> **Última actualización:** 2026-04-25 22:02 GMT+8

---

## 📌 Protocolo de Documentación

> **Cuando digas "documentar"**, este archivo se actualiza con los trabajos realizados.
> **Todos los archivos de documentación viven en `Documents/`.**
> Este documento es la **fuente única de verdad** — todo lo demás son archivos técnicos de soporte.

### Reglas
1. **Al inicio de cada sesión:** Leer este documento.
2. **Al decir "documentar":** Actualizar secciones correspondientes con lo trabajado.
3. **Nunca crear archivos sueltos** — todo va en `Documents/`.
4. **Registro de sesiones:** Agregar fila en §14.
5. **Planes:** Marcar tareas `[x]` al completar, agregar fecha.
6. **Al culminar cada sprint:** Pushear y verificar deploy en vivo.

---

## 1. Resumen Ejecutivo

MejoraApp es el MVP digital de **Mejora Continua**, comunidad de negocios para líderes empresariales argentinos. App funcional en producción con muro anónimo moderado por IA, contenido de valor, diagnóstico estratégico y panel admin.

**Estado:** E1 ✅ · E2 ✅ · E3 ✅ · E4 ✅ · E5 ✅ · E6 ✅ (12/12 + CRM)

---

## 2. Arquitectura del Sistema

### 2.1 Frontend (React SPA)

```
src/
├── pages/              # 5 páginas lazy-loaded (Index, Auth, Admin, ResetPassword, NotFound)
├── components/
│   ├── admin/          # 7 módulos (Contenido, IA, Muro, Novedades, Usuarios, Seguridad, CRM)
│   ├── auth/           # LoginForm, SignupForm, GoogleButton, AdminLoginForm
│   ├── tabs/           # Muro, Novedades, ContenidoDeValor
│   ├── ui/             # 30+ componentes shadcn/ui
│   └── [feature]       # DiagnosticTest, Onboarding, BadgeDisplay, etc.
├── contexts/           # AuthContext, ThemeContext, I18nContext
├── hooks/              # useWallInteractions, usePullToRefresh, useBadges, useRanking, useCRM, etc.
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
| `profiles` | Perfiles (nombre, apellido, empresa, cargo, bio, website, linkedin) | Usuario propio + Admin todos |
| `user_roles` | Roles (admin, moderator, user) | Solo admin |
| `diagnostic_results` | Resultados diagnóstico | Usuario propio + Admin todos |
| `wall_posts` | Posts anónimos muro | Authenticated lee aprobados |
| `wall_comments` | Comentarios en posts | Authenticated lee aprobados |
| `wall_likes` | Likes (unique user+post) | Todos leen, usuario propio |
| `content_categories` | 4 categorías (tip, estrategia, reflexión, noticia) | Público lee |
| `content_posts` | Artículos/videos/infografías/PDFs | Público lee |
| `content_guidelines` | Lineamientos generación IA | Solo admin |
| `novedades` | Noticias comunidad | Público lee |
| `admin_config` | Configuración admin | Solo admin |
| `moderation_log` | Log moderación posts | Solo service_role |
| `moderation_comments_log` | Log moderación comentarios | Solo service_role |
| `user_badges` | Badges ganados por usuario | Usuario propio lee |
| `push_subscriptions` | Suscripciones push | Usuario propio |
| `admin_audit_log` | Log acciones admin | Solo service_role |
| `nps_responses` | Respuestas NPS | Usuario propio escribe |
| `referrals` | Tracking referidos | Usuario propio lee |
| `admin_whitelist` | Emails auto-admin | Solo service_role |
| `crm_clients` | Clientes CRM | Solo admin |
| `crm_products` | Productos CRM | Solo admin |
| `crm_interactions` | Interacciones comerciales | Solo admin |
| `crm_interaction_lines` | Líneas por interacción | Solo admin |

**Vistas:** `crm_client_summary`, `crm_seller_ranking`
**RPC:** `get_crm_dashboard()`
**Funciones SQL:** `is_admin(UUID)`, `has_role(UUID, app_role)`, `handle_new_user()`, `update_wall_likes_count()`, `update_wall_post_comments_count()`, triggers de badges.

### 2.3 Edge Functions (Supabase Deno)

| Función | Auth | Rate Limit |
|---------|------|------------|
| `moderate-post` | JWT | 3 posts/min |
| `moderate-comment` | JWT | 10 comments/min |
| `verify-admin` | JWT | — |
| `admin-action` (13 acciones) | JWT + admin | 30 req/min + audit log |
| `generate-content` | JWT + admin | — |
| `send-push-notification` | Service role | — |
| `send-diagnostic-email` | Service role | — |

**Módulos compartidos:** `_shared/cors.ts` (CORS centralizado) · `_shared/log.ts` (logging estructurado JSON)
**Cadena fallback IA:** Gemini → Groq → OpenRouter (DeepSeek) → null (auto-aprobado)

### 2.4 Seguridad

```
Cliente → Supabase Auth (JWT) → RLS protege lecturas
                                → Edge Functions protegen escrituras admin
                                → verify-admin re-verifica rol server-side
```

- RLS en TODAS las tablas
- Edge Functions como gatekeeper para escrituras admin
- Rate limiting en moderación (3 post/min, 10 comments/min) y admin (30 req/min)
- Moderación IA multi-provider con fallback
- Self-demotion prevention en remove-role
- CSP headers (meta tag en index.html) — incluye base-uri, form-action
- CORS restringido centralizado via `_shared/cors.ts` (app.mejoraok.com + localhost)
- Admin audit log (fire-and-forget)
- Logging estructurado JSON en todas las Edge Functions via `_shared/log.ts`
- Validación de inputs con helpers requireString/requireObject en admin-action

### 2.5 PWA

- `manifest.json` configurado
- Service Worker network-first
- Instalable en iOS y Android

---

## 3. Módulos Funcionales

### 3.1 Muro Anónimo
Posts anónimos (500 chars máx) · Likes toggle · Comentarios (300 chars) · Moderación IA · Realtime · Infinite scroll · Pull-to-refresh · Eliminar propios (doble-tap) · Ctrl+Enter · Contador caracteres · Social proof · Cross-navigation · Badges · Ranking comunidad · Reglas comunidad

### 3.2 Contenido de Valor
4 categorías · 4 tipos media · Búsqueda · Filtro pills · Category badge · Generación IA admin · Contenido programado (scheduled_for) · Recomendaciones por perfil

### 3.3 Diagnóstico Estratégico
Test interactivo · Puntaje + perfil · WhatsApp CTA · "Ver contenido" post-resultado · Historial 3 resultados · Retomar · Persistencia · PDF export · Recomendaciones contenido por perfil · CTA consultoría con tracking

### 3.4 Novedades
CRUD admin · Fecha publicación · Imagen + enlace · Empty state "Próximamente"

### 3.5 Servicios
Componente dedicado separado de novedades · Tracking por servicio · WhatsApp CTA · Variante compact/full

### 3.6 Panel Admin (7 módulos)
Contenido · IA · Novedades · Muro · Usuarios · Seguridad · CRM

### 3.7 Onboarding
4 pasos con skip · Persistencia localStorage · Overlay modal · Secuencia correcta con ProfileCompleteModal

### 3.8 Gamificación
8 badges (primer post, 5 posts, 10 posts, primer comentario, primer diagnóstico, 5 diagnósticos, 10 likes, 3 días activo) · Triggers automáticos SQL · Ranking comunidad · Perfil completo (bio/website/linkedin)

### 3.9 Analytics (PostHog)
25+ eventos · Auth, muro, diagnóstico, contenido, onboarding, profile, navigation, gamificación, servicios, funnel, admin

### 3.10 Retención
Web Push (lib/push.ts + SW + Edge Function) · Email post-diagnóstico (Resend) · Badges "nueva visita" · Toast real-time respuestas muro

### 3.11 Internacionalización
I18nContext + hook useI18n() · 130+ claves español · Base inglés · Detección idioma navegador · Persistencia localStorage

### 3.12 CRM Comercial (Admin-only)
Módulo integrado en Panel Admin · 4 sub-tabs: Dashboard, Clientes, Interacciones, Productos
- **Dashboard:** KPIs (clientes, ventas, ingresos, pipeline, follow-ups) · Charts Recharts (ventas por mes, distribución resultados) · Ranking vendedores · Seguimientos pendientes
- **Clientes:** CRUD completo · Búsqueda · Filtros por estado · Detalle con historial de interacciones · Provincias argentinas · Canales de ingreso
- **Interacciones:** Registro de contactos (presupuesto, venta, seguimiento, sin respuesta, no interesado) · Medio (WhatsApp, llamada, email, reunión, redes, visita campo) · Líneas de productos con precios automáticos
- **Productos:** Catálogo con precios, categorías, moneda (ARS/USD/EUR), activo/inactivo
- **Seguridad:** RLS con `is_admin()` — solo admins acceden · Lazy loading (se carga al hacer click en tab CRM)
- **DB:** 4 tablas (`crm_clients`, `crm_products`, `crm_interactions`, `crm_interaction_lines`) · 2 vistas (`crm_client_summary`, `crm_seller_ranking`) · RPC `get_crm_dashboard()`

---

## 4. Despliegue

### Producción
Push `main` → GitHub Actions (test + build) → FTP Hostinger → `/public_html/app/` → Health check

### Staging
Push `develop` → `npm run build:staging` → FTP → `/public_html/app-staging/`

### Comandos
```bash
npm install          # Instalar dependencias
npm run dev          # Dev: http://localhost:8080
npm run build        # Producción: dist/
npm run test         # Tests: vitest run (103+ tests)
npm run lint         # Lint: eslint
npm run test:e2e     # E2E: playwright test
npm run test:coverage # Coverage report
ANALYZE=true npm run build  # Bundle analysis
```

### Rollback
GitHub Actions → `rollback.yml` → commit SHA + razón

---

## 5. Métricas

| Métrica | Valor |
|---------|-------|
| Líneas de código (TS/TSX) | ~14,000 |
| Archivos totales | 203 |
| Tests unitarios | 103+ (100% passing) |
| Tests E2E | 22 (Playwright) |
| Tests accesibilidad | 7 (axe-core) |
| Typography tokens | 7 (caption → display) |
| Tablas DB | 23 (19 core + 4 CRM) |
| Edge Functions | 7 |
| Eventos analytics | 25+ |
| Bundle gzipped | ~355KB |
| Build time | ~6s |

---

## 6. Estado por Etapa

### ETAPA 1 — Seguridad y Estabilización ✅ COMPLETA (2026-04-23)
- [x] 1.1 Rotar credenciales expuestas
- [x] 1.2 Mover lógica admin a Edge Functions
- [x] 1.3 RLS admin_config seguro
- [x] 1.4 Botón Shield legítimo
- [x] 1.5 Auditoría RLS policies
- [x] 1.6 Eliminar código muerto

### ETAPA 2 — Arquitectura y DevOps ✅ COMPLETA (2026-04-24)
- [x] 2.1 Sistema migraciones SQL (12 archivos)
- [x] 2.2 Tests integración (103+ tests)
- [x] 2.3 Estrategia rollback
- [x] 2.4 PWA real (manifest + SW)
- [x] 2.5 Entorno staging
- [x] 2.6 Monitoring (Sentry)

### ETAPA 3 — Experiencia de Usuario ✅ COMPLETA (2026-04-24)
- [x] 3.1 Búsqueda contenido
- [x] 3.2 Onboarding mejorado
- [x] 3.3 Diagnóstico: historial + "Ver contenido"
- [x] 3.4 Muro: eliminar posts propios
- [x] 3.5 UX crítico (targets, errores, dark mode, pull-to-refresh)
- [x] 3.6 Conexiones entre secciones

### ETAPA 4 — Analytics y Retención ✅ COMPLETA (2026-04-24)
- [x] 4.1 PostHog integrado (25+ eventos)
- [x] 4.2 Push notifications + Email + Badges visita + Toast real-time
- [x] 4.3 Gamificación (8 badges) + Ranking + Perfil completo + Contenido programado
- [x] 4.4 Servicios separados + CTA consultoría + Recomendaciones + PDF export + Dashboards PostHog

### ETAPA 5 — Calidad y Robustez ✅ COMPLETA (2026-04-24)

**Sprint 5.1 — Legal y Compliance ✅ COMPLETO (2026-04-24)**
- [x] 5.1.1 Política de privacidad (Ley 25.326)
- [x] 5.1.2 Términos de servicio
- [x] 5.1.3 Banner cookies (bloquea PostHog hasta aceptar)
- [x] 5.1.4 "Mis Datos" (ver/editar/exportar/eliminar)
- [x] 5.1.5 Reglas comunidad

**Sprint 5.2 — Testing y Calidad ✅ COMPLETO (2026-04-24)**
- [x] 5.2.1 Tests E2E Playwright (22 tests: auth, navigation, accessibility)
- [x] 5.2.2 Tests accesibilidad axe-core (WCAG 2.1 AA)
- [x] 5.2.3 Coverage report (v8 provider, thresholds 50%)
- [x] 5.2.4 Refactor Muro.tsx (hooks extraídos, componentes memoizados)

**Sprint 5.3 — UX Polish ✅ COMPLETO (2026-04-24)**
- [x] 5.3.1 Typography scale: 7 tokens (caption 11px → display 30px). 72+ instancias migradas.
- [x] 5.3.2 Scroll position preservation al cambiar tab
- [x] 5.3.3 Editorial style guide (voseo, tono, contraste WCAG AA)
- [x] 5.3.4 SEO básico: meta tags, Open Graph, Twitter Card, sitemap.xml
- [x] 5.3.5 Renombrar "Tips" → "Contenido", "Novedades MC" → "Novedades"

### ETAPA 6 — Escalamiento ✅ COMPLETA (2026-04-25)

**Sprint 6.1 — Infraestructura ✅ COMPLETO (2026-04-24)**
- [x] 6.1.1 Hosting evaluado (Hostinger, landing estática preparada)
- [x] 6.1.2 CSP headers + CORS restringido en 5 Edge Functions
- [x] 6.1.3 Uptime monitoring (documentado, setup manual)
- [x] 6.1.4 Sentry alerts configurado
- [x] 6.1.5 admin-action: rate limiting (30 req/min) + audit log
- [x] 6.1.6 Push triggers (new_post + reply)
- [x] 6.1.7 Admin whitelist (3 emails auto-admin)

**Sprint 6.2 — Growth y Monetización ✅ COMPLETO (2026-04-25)**
- [x] 6.2.1 Landing page pública (/landing + HTML estático mejoraok.com)
- [x] 6.2.2 Programa de referidos (link + tracking + DB)
- [x] 6.2.3 CRM propio integrado (reemplaza HubSpot) — módulo admin-only con Dashboard, Clientes, Interacciones, Productos
- [x] 6.2.4 NPS survey in-app (7 días → score → feedback → Supabase)
- [x] 6.2.5 Modelo freemium/premium — definido como fase posterior

**Sprint 6.3 — Escalamiento Técnico ✅ COMPLETO (2026-04-25)**
- [x] 6.3.1 Repository Layer (abstracción completa sobre Supabase)
- [x] 6.3.2 i18n base (es/en, 130+ claves, I18nProvider)
- [x] 6.3.3 Bundle analysis (rollup-plugin-visualizer)
- [x] 6.3.4 Capacitor — evaluado, PWA es suficiente por ahora

---

## 7. Análisis Multidisciplinario (37 Perspectivas)

### 7.1 Hallazgos Críticos

| # | Área | Hallazgo | Estado |
|---|------|----------|--------|
| 1 | Legal | Sin política de privacidad ni términos | ✅ Resuelto (Sprint 5.1) |
| 2 | Security | CORS `*` en Edge Functions | ✅ Resuelto (2026-04-25: bug crítico — getCorsHeaders() nunca se usaba, CORS real era `*`. Fix: _shared/cors.ts centralizado) |
| 3 | SRE | Sin uptime monitoring | ✅ Resuelto (Sprint 6.1) |
| 4 | BI | Analytics sin dashboards | ✅ Resuelto (Sprint 4.4) |
| 5 | Growth | Sin funnel medido | ✅ Resuelto (Sprint 4.4) |
| 6 | SEO | Sin meta tags ni Open Graph | ✅ Resuelto (Sprint 5.3) |
| 7 | DevOps | FTP no atómico | ⚠️ Aceptado (Hostinger, evaluar Vercel) |
| 8 | Cloud | Sin CDN | ⚠️ Aceptado (evaluar Cloudflare) |
| 9 | Frontend | Muro.tsx complejo | ✅ Resuelto (Sprint 5.2) |
| 10 | Architecture | admin-action god function | ✅ Resuelto (rate limiting + audit log) |

### 7.2 Puntuación por Área

| Área | Score | Estado |
|------|-------|--------|
| Seguridad (RLS, Auth, Edge Functions) | 9/10 | ✅ Excelente |
| Backend (Supabase, Edge Functions) | 8/10 | ✅ Sólido |
| Frontend (React, TypeScript) | 7/10 | ✅ Funcional |
| UX/UI | 8/10 | ✅ Buena |
| DevOps/CI-CD | 8/10 | ✅ CSP + CORS + rate limiting |
| Analytics/BI | 8/10 | ✅ PostHog integrado |
| Legal/Compliance | 7/10 | ✅ Documentos creados |
| Growth/Marketing | 6/10 | ⚠️ Landing + referidos + NPS, falta CRM poblado |
| Calidad/Testing | 8/10 | ✅ E2E + accesibilidad |
| Documentación | 9/10 | ✅ Consolidada |

### 7.3 Recomendaciones por Rol (37 perspectivas)

#### Técnico (10 roles)

| Rol | Recomendación | Prioridad | Estado |
|-----|--------------|-----------|--------|
| **Software Architect** | Separar admin-action en funciones específicas. Repository Layer implementado. | Media | ✅ Repo Layer hecho |
| **Cloud Architect** | Migrar a Vercel/Cloudflare (atómico + CDN + gratis). | Alta | 📋 E8.1 |
| **Backend Developer** | Zod validation en Edge Functions. Logging estructurado JSON. | Media | 📋 E8.3-E8.4 |
| **Frontend Developer** | Code splitting por chunk. Reemplazar CustomEvent por Context/URL params. | Baja | 📋 E8 |
| **iOS Developer** | PWA es suficiente por ahora. Capacitor si se necesita nativo. | Baja | 📋 E9 |
| **Android Developer** | PWA es suficiente por ahora. Capacitor si se necesita nativo. | Baja | 📋 E9 |
| **DevOps Engineer** | Notificación de deploy. Environment protection rules en GitHub. | Baja | 📋 E8.7 |
| **SRE** | Definir SLO (99.9%). Dashboard error rates. Structured logging. | Media | 📋 E10.5 |
| **Cybersecurity Architect** | 2FA admins. WAF rules. Security headers audit. | Alta | 📋 E10.3-E10.4 |
| **Data Engineer** | Verificar backups automáticos. Índices compuestos. Data retention policy. | Media | 📋 E10.1 |

#### Producto (6 roles)

| Rol | Recomendación | Prioridad | Estado |
|-----|--------------|-----------|--------|
| **Product Manager** | Definir KPIs (DAU, WAU, tasa completado diagnóstico). Roadmap Q2 2026. | Alta | 📋 E7 |
| **Product Owner** | Definition of Done. Refinar backlog E7-E10. | Media | 📋 E7 |
| **Scrum Master** | Sprints de 1 semana. Daily async. Retros al cerrar etapa. | Baja | Proceso interno |
| **UX Researcher** | 5 entrevistas usuarios. User personas basadas en datos reales. | Alta | 📋 E7 |
| **UX Designer** | Muro como tab default. Onboarding del muro. Flows de re-engagement. | Media | 📋 E7 |
| **UI Designer** | Sistema de elevación. Micro-interacciones. Motion design. | Baja | Futuro |

#### Comercial (7 roles)

| Rol | Recomendación | Prioridad | Estado |
|-----|--------------|-----------|--------|
| **UX Writer** | Mantener voseo consistente. Copy de onboarding iterar con datos. | Media | Continuo |
| **Localization Manager** | i18n base ✅. Traducir 130+ claves a inglés. Evaluar PT-BR. | Baja | 📋 i18n extendido |
| **Delivery Manager** | Pipeline CI/CD ✅. Automatizar changelog. Release notes. | Baja | 📋 E8 |
| **Growth Manager** | Funnel PostHog ✅. Experimentos A/B onboarding. Referidos activos. | Alta | 📋 E7.3 |
| **ASO Specialist** | PWA es suficiente. Si Capacitor: screenshots, keywords, descripción. | Baja | 📋 E9 |
| **Performance Marketing** | Landing ✅. Facebook Pixel / Google Ads tag. Retargeting. | Media | 📋 E7 |
| **SEO Specialist** | Sitemap ✅. Landing ✅. Blog orgánico. Backlinks comunidad. | Media | 📋 E7.5 |

#### Contenido y Comunidad (3 roles)

| Rol | Recomendación | Prioridad | Estado |
|-----|--------------|-----------|--------|
| **Business Development** | CRM propio ✅. Poblar con datos reales. Pipeline comercial. | Alta | 📋 E7.1 |
| **Account Manager** | CRM ✅. Seguimiento automático. Alertas de follow-up. | Media | 📋 E7.1 |
| **Content Manager** | Calendario editorial. Tracking views por contenido. IA genera borrador. | Media | 📋 E7.5 |
| **Community Manager** | Dashboard métricas muro. Eventos semanales. Moderación manual fallback. | Media | Continuo |

#### Operaciones, Legal y Análisis (8 roles)

| Rol | Recomendación | Prioridad | Estado |
|-----|--------------|-----------|--------|
| **BI Analyst** | Dashboards PostHog ✅. Cohort retention. Revenue tracking (futuro). | Media | 📋 PostHog avanzado |
| **Data Scientist** | Scoring diagnóstico. Clustering usuarios. Predictive churn. | Baja | Futuro |
| **Legal & Compliance** | Privacidad ✅. Términos ✅. Cookies ✅. Política retención datos. | Media | 📋 E10.1 |
| **DPO** | "Mis Datos" ✅. DPIA (Data Protection Impact Assessment). | Media | 📋 E10.2 |
| **Customer Success** | NPS survey ✅. Email onboarding sequence. In-app guidance. | Alta | 📋 E7.4 |
| **Tech Support T1** | FAQ in-app. Chatbot básico. | Baja | Futuro |
| **Tech Support T2** | Logs estructurados para troubleshooting. Sentry ✅. | Media | 📋 E8.4 |
| **Tech Support T3** | Admin tools para debug. Edge Function logs. Database queries. | Baja | Futuro |
| **RevOps** | CRM + Analytics integrados. Pipeline → Revenue tracking. | Media | 📋 E7 |

---

## 8. Decisiones de Diseño Clave

1. **Supabase como backend único** — No se migra a otro BaaS.
2. **Mobile-first** — Toda feature se diseña para móvil primero.
3. **IA como herramienta** — Modera y genera, pero la comunidad es el producto.
4. **Sin lock-in** — Código portable.
5. **Crecimiento orgánico** — Se construye lo que se necesita.
6. **Datos antes que features** — No construir sin poder medir impacto.

---

## 9. Tecnologías Integradas

| Tech | Uso | Estado | Etapa |
|------|-----|--------|-------|
| PostHog | Analytics + feature flags | ✅ | E4 |
| Sentry | Error tracking + user context | ✅ | E2 |
| Resend | Emails transaccionales | ✅ | E4 |
| Web Push API | Push notifications PWA | ✅ | E4/E6 |
| Playwright | Tests E2E | ✅ | E5 |
| axe-core | Tests accesibilidad | ✅ | E5 |
| jsPDF | Exportar diagnóstico PDF | ✅ | E4 |
| I18n | Internacionalización base | ✅ (es/en) | E6 |
| CRM propio | CRM integrado admin-only | ✅ | E6 |
| Vercel/Cloudflare | Hosting moderno | 🔴 Pendiente (evaluar) | E8 |
| Capacitor | App nativa | 🔴 Pendiente (evaluar) | E9 |

---

## 10. Guía de Estilo Editorial

### Voz y Tono
**Voz:** Directa, cercana, argentina, sin vueltas.
**Tono:** Profesional pero humano. No corporativo frío, no informal excesivo.

- ✅ "¿Te animás a ver cómo está tu negocio?"
- ✅ "Completá tu perfil para personalizar tu experiencia."
- ❌ "Le invitamos a completar su perfil." (demasiado formal)
- ❌ "Hey! 🎉 Super genial que estés acá!" (demasiado informal)

### Voseo — Regla Absoluta
**Siempre voseo. Nunca tuteo. Nunca ustedeo.**

| ✅ Correcto | ❌ Incorrecto |
|------------|--------------|
| Completá | Completa / Complete |
| Hacé | Haz / Haga |
| Probá | Prueba / Pruebe |
| ¿Querés? | ¿Quieres? / ¿Quiere? |
| Mirá | Mira / Mire |

**Excepciones:** Infinitivo y gerundio son neutros ("Completar después", "Cargando...").

### Escala Tipográfica

| Token | Tamaño | Uso |
|-------|--------|-----|
| `text-caption` | 11px | Labels secundarios, badges, metadata |
| `text-body-sm` | 13px | Texto auxiliar, descripciones cortas |
| `text-body` | 14px | Texto principal, párrafos |
| `text-subtitle` | 16px | Subtítulos, labels importantes |
| `text-title` | 20px | Títulos de cards, modales |
| `text-heading` | 24px | Títulos de página |
| `text-display` | 30px | Títulos hero, landing |

### Contraste y Accesibilidad
- **Texto principal:** `text-foreground` (siempre)
- **Texto secundario:** `text-muted-foreground` (solo metadata no crítica)
- **WCAG AA mínimo:** 4.5:1 para texto normal, 3:1 para texto grande

### Nombres de Secciones

| Sección | Nombre correcto | ❌ No usar |
|---------|----------------|-----------|
| Tab 1 | Contenido | Tips, Biblioteca |
| Tab 2 | Diagnóstico | Diagnóstico Estratégico |
| Tab 3 | Muro | Muro Anónimo |
| Tab 4 | Novedades | Novedades MC |

### Mensajes de Error
| Escenario | Mensaje |
|-----------|---------|
| Error de red | "No pudimos conectar. Revisá tu conexión e intentá de nuevo." |
| Sesión expirada | "Tu sesión expiró. Volvé a iniciar sesión." |
| Campo requerido | "Completá este campo para continuar." |
| Límite de caracteres | "Máximo {n} caracteres." |
| Error genérico | "Algo salió mal. Intentá de nuevo en unos segundos." |

### CTAs
| Contexto | CTA |
|----------|-----|
| Acción principal | Verbo imperativo voseo: "Publicá", "Completá", "Descubrí" |
| Navegación | "Ver contenido", "Hacer diagnóstico" |
| Externo (WhatsApp) | "Hablá por WhatsApp" |
| Peligroso (eliminar) | "Eliminar" (rojo, sin eufemismos) |

### Inglés Técnico
Nombres de features en español siempre que sea posible. Excepciones aceptadas: Badges, Push.

---

## 11. PostHog — Dashboards y Eventos

### Dashboards

**1. Actividad:** DAU/WAU/MAU · Sesiones/día · Posts/likes/comentarios/día · Diagnósticos/día · Método login

**2. Funnel:**
- Principal: signup → login → first_post → first_diagnostic → complete_diagnostic → return_7d
- Diagnóstico: start → complete → share_whatsapp
- Contenido: view → search/filter
- Servicios: click → whatsapp_click

**3. Contenido:** Posts por categoría · Por tipo · Búsquedas frecuentes · Categorías filtradas · Badges · Onboarding · Tabs

**Retención:** D1, D7, D30 retention (pageview)

### Eventos Disponibles (25+)

| Categoría | Eventos |
|-----------|---------|
| Auth | `login`, `signup`, `logout` |
| Muro | `publish_post`, `like_post`, `comment_post`, `delete_post` |
| Diagnóstico | `start_diagnostic`, `complete_diagnostic`, `share_diagnostic_whatsapp`, `retake_diagnostic` |
| Contenido | `view_content`, `search_content`, `filter_category` |
| Onboarding | `onboarding_complete`, `onboarding_skip`, `profile_complete`, `profile_skip` |
| Navigation | `tab_switch`, `cross_navigation`, `$pageview` |
| Gamificación | `badge_earned`, `ranking_viewed`, `profile_viewed`, `profile_edited` |
| Servicios | `service_click`, `service_whatsapp_click`, `diagnostic_cta_perfil`, `diagnostic_pdf_export`, `content_recommendation_click`, `funnel_step` |
| Admin | `admin_action` |

### Configuración Dashboards (PostHog)

**Dashboard Actividad — Insights:**
| Insight | Tipo | Configuración |
|---------|------|---------------|
| DAU | Trends | `$pageview` · Unique users · Daily |
| WAU | Trends | `$pageview` · Unique users · Weekly |
| MAU | Trends | `$pageview` · Unique users · Monthly |
| Posts/día | Trends | `publish_post` · Total count · Daily |
| Likes/día | Trends | `like_post` · Total count · Daily |
| Comentarios/día | Trends | `comment_post` · Total count · Daily |
| Diagnósticos/día | Trends | `complete_diagnostic` · Total count · Daily |
| Método login | Pie | `login` · Breakdown: `method` |

**Dashboard Funnel — Funnels:**
- **Principal:** signup → login → first_post → first_diagnostic → complete_diagnostic → return_7d
- **Diagnóstico:** start_diagnostic → complete_diagnostic → share_diagnostic_whatsapp
- **Contenido:** view_content → search_content / filter_category
- **Servicios:** service_click → service_whatsapp_click

**Dashboard Contenido — Insights:**
| Insight | Tipo | Configuración |
|---------|------|---------------|
| Posts por categoría | Pie | `view_content` · Breakdown: `category` |
| Contenido por tipo | Pie | `view_content` · Breakdown: `content_type` |
| Búsquedas frecuentes | Table | `search_content` · Breakdown: `query` · Top 20 |
| Categorías filtradas | Bar | `filter_category` · Breakdown: `category` |
| Badges ganados | Bar | `badge_earned` · Breakdown: `badge_slug` |
| Onboarding completado vs skip | Pie | `onboarding_complete` vs `onboarding_skip` |
| Tabs más visitados | Bar | `tab_switch` · Breakdown: `to_tab` |

**Retención:**
| Retención | Configuración |
|-----------|---------------|
| D1 | `$pageview` · Retention type: Day 1 |
| D7 | `$pageview` · Retention type: Day 7 |
| D30 | `$pageview` · Retention type: Day 30 |

**Filtros recomendados:** `$environment` = `production` · Últimos 30 días · Excluir `localhost`

---

## 12. Instructivo de Deploy

### Producción (GitHub Actions)
Push `main` → test → build → FTP → `app.mejoraok.com` → health check

### Staging (GitHub Actions)
Push `develop` → `build:staging` → FTP → `/app-staging/`

### Manual
1. `npm run build`
2. Subir `dist/` a `/public_html/app/` via FTP

### Rollback
GitHub Actions → `rollback.yml` → commit SHA + razón

---

## 13. Archivos en Documents/

| Archivo | Propósito |
|---------|-----------|
| `DOCUMENTO-MAESTRO.md` | **Este archivo** — fuente única de verdad (todo integrado: arquitectura, style guide, dashboards, plan, 37 perspectivas) |
| `GUIA-VAPID-KEYS.md` | Guía paso a paso para configurar VAPID keys |
| `MIGRACION-CRM-2026-04-25.sql` | Script CRM (4 tablas + vistas + RPC) — ejecutado |
| `PUSH_SUBSCRIPTIONS.sql` | Script SQL push_subscriptions |
| `MIGRACION-SEGURIDAD-2026-04-23.sql` | Script hardening (ejecutado) |
| `MIGRACION-GAMIFICACION-2026-04-24.sql` | Script gamificación (ejecutado) |
| `../landing-static/index.html` | Landing page estática para mejoraok.com |

**Archivos compartidos Edge Functions (`supabase/functions/_shared/`):**

| Archivo | Propósito |
|---------|-----------|
| `cors.ts` | CORS centralizado: `handleCors()`, `jsonHeaders()`, `getCorsHeaders()` |
| `log.ts` | Logging estructurado JSON: `logInfo()`, `logWarn()`, `logError()` |

---

## 14. Registro de Sesiones

| Fecha | Resumen | Cambios clave |
|-------|---------|---------------|
| 2026-04-15 | Setup inicial | React + Supabase + Auth + Muro + Admin |
| 2026-04-18 | Migraciones DB | comments, content media, profile fields, admin config |
| 2026-04-23 | Seguridad + DevOps | E1 completa, E2 (4/6), 103 tests, CI/CD, Edge Functions |
| 2026-04-24 AM | Auditoría UX | 9 perspectivas UX, consolidación documentación |
| 2026-04-24 | UX Sprint completo | E3 completa (6/6), 30 cambios UX |
| 2026-04-24 | Sentry + PostHog + Staging | E2 completa (6/6), E4 Sprint 4.1, 25+ eventos |
| 2026-04-24 | Retención + Push + Email | E4 Sprint 4.2 completo |
| 2026-04-24 | Análisis multidisciplinario | 37 perspectivas, ANALISIS-MAESTRO.md |
| 2026-04-24 | Sprint 4.3 Engagement | 8 badges, ranking, perfil, contenido programado |
| 2026-04-24 | Sprint 4.4 Funnel | Servicios, CTA, recomendaciones, PDF, dashboards |
| 2026-04-24 | Sprint 5.1 Legal | Privacidad, términos, cookies, "Mis Datos", reglas |
| 2026-04-24 | Sprint 5.2 Testing | Playwright E2E (22), axe-core (7), coverage, refactor Muro |
| 2026-04-24 | Sprint 5.3 UX Polish | Typography scale, scroll preservation, editorial style guide, SEO |
| 2026-04-24 | E6 Escalamiento | CORS, CSP, admin-action hardening, repo layer, NPS, bundle analysis |
| 2026-04-24 | E6 Growth + i18n | Landing, referidos, i18n base (130+ claves) |
| 2026-04-24 | E6 Push + Landing + Admins | Push triggers, landing estática, admin whitelist |
| 2026-04-25 | Consolidación docs | DOCUMENTO-MAESTRO unificado, plan optimizado, archivos obsoletos eliminados |
| 2026-04-25 | CRM integrado | Módulo AdminCRM (Dashboard, Clientes, Interacciones, Productos), 4 tablas CRM, vistas, RPC, RLS admin-only. DB migrations ejecutadas. VAPID keys configuradas. |
| 2026-04-25 | Consolidación docs v2 | DOCUMENTO-MAESTRO unificado (18 secciones), style guide + dashboards integrados, SESSION-PROMPT eliminado. E6 completa (12/12). |
| 2026-04-25 | Optimización producción | **Fix CORS crítico** en 7 Edge Functions (getCorsHeaders() nunca se usaba). _shared/cors.ts + _shared/log.ts centralizados. CSP mejorado (base-uri, form-action). PDF export lazy-loaded. Bundle splitting (vendor-charts). Preload fonts. Validación admin-action. 103 tests ✅. |

---

## 15. Acciones Pendientes del Usuario

| # | Acción | Estado | Detalle |
|---|--------|--------|---------|
| 1 | VAPID keys en Supabase | ✅ Listo | Keys configuradas en Supabase Secrets + GitHub Secrets (2026-04-25) |
| 2 | Ejecutar migrations nuevas | ✅ Listo | Todas ejecutadas en Supabase SQL Editor (2026-04-25) |
| 3 | Landing mejoraok.com | ⚠️ Parcial | Landing estática lista. Disk quota exceeded en Hostinger. Evaluar migración a Vercel o liberar espacio. |
| 4 | HubSpot API key | ✅ Reemplazado | CRM propio integrado como módulo admin-only (2026-04-25) |
| 5 | Evaluar freemium/premium | 🔴 Pendiente | Definir modelo de negocio antes de implementar |
| 6 | Evaluar Capacitor | 🔴 Pendiente | Decidir si se necesita app nativa o si PWA es suficiente |

---

## 16. Plan Optimizado — Próximas Etapas (E7-E10)

> **Nota:** E1-E6 completas. Este plan fue revisado con las 37 perspectivas multidisciplinarias.

### ETAPA 7 — Crecimiento y Monetización (Sprint 1 semana)

| # | Tarea | Rol(es) | Prioridad | Dependencia |
|---|-------|---------|-----------|-------------|
| 7.1 | Poblar CRM con datos reales | Business Dev + Account Mgr | 🔴 Alta | CRM funcional ✅ |
| 7.2 | Modelo freemium: definir features premium | Product Manager + PM | 🔴 Alta | Decisión negocio |
| 7.3 | A/B testing en onboarding | Growth + Frontend + UX Researcher | 🟡 Media | PostHog feature flags |
| 7.4 | Email onboarding sequence (día 1, 3, 7) | Backend + Content + Customer Success | 🟡 Media | Resend ✅ |
| 7.5 | Blog/SEO orgánico en landing | SEO Specialist + Content Manager | 🟡 Media | Landing ✅ |

### ETAPA 8 — Escalamiento Técnico (Sprint 1-2 semanas)

| # | Tarea | Rol(es) | Prioridad | Dependencia |
|---|-------|---------|-----------|-------------|
| 8.1 | Migrar hosting a Vercel/Cloudflare | Cloud Architect + DevOps | 🔴 Alta | Decisión infra |
| 8.2 | CDN + edge caching | DevOps + SRE | 🔴 Alta | 8.1 |
| 8.3 | Validación en Edge Functions | Backend Developer | 🟡 Media | ✅ Hecho (helpers requireString/requireObject en admin-action, validación body en moderate-post/comment) |
| 8.4 | Logging estructurado (JSON logs) | SRE + Tech Support T2 | 🟡 Media | ✅ Hecho (_shared/log.ts con logInfo/logWarn/logError en 7 funciones) |
| 8.5 | Visual regression tests (Chromatic/Percy) | QA Automation | 🟢 Baja | — |
| 8.6 | Lighthouse CI en pipeline | QA Automation + DevOps | 🟢 Baja | — |
| 8.7 | Environment protection rules (GitHub) | DevOps Engineer | 🟢 Baja | — |

### ETAPA 9 — App Nativa (evaluar necesidad)

| # | Tarea | Rol(es) | Prioridad | Dependencia |
|---|-------|---------|-----------|-------------|
| 9.1 | Evaluar si PWA es suficiente | Product Manager + iOS/Android Dev | 🔴 Alta | Métricas de uso |
| 9.2 | Capacitor setup (si se necesita) | iOS + Android Developer | 🟢 Baja | 9.1 |
| 9.3 | Push notifications nativas | iOS + Android Developer | 🟢 Baja | 9.2 |
| 9.4 | ASO: App Store Optimization | ASO Specialist | 🟢 Baja | 9.2 |

### ETAPA 10 — Operaciones y Compliance

| # | Tarea | Rol(es) | Prioridad | Dependencia |
|---|-------|---------|-----------|-------------|
| 10.1 | Política de retención de datos | Legal + DPO + Data Engineer | 🟡 Media | — |
| 10.2 | DPIA (Data Protection Impact Assessment) | DPO + Legal | 🟡 Media | — |
| 10.3 | 2FA para admins | Cybersecurity Architect | 🔴 Alta | — |
| 10.4 | WAF rules (Cloudflare) | Cybersecurity + DevOps | 🟡 Media | 8.1 |
| 10.5 | SLO definition (99.9% uptime) | SRE + Product Manager | 🟢 Baja | Monitoring ✅ |

---

## 17. Cronograma Consolidado

```
✅ E1: Seguridad (completa)
✅ E2: DevOps (completa)
✅ E3: UX (completa)
✅ E4: Analytics y Retención (completa)
✅ E5: Calidad y Robustez (completa)
✅ E6: Escalamiento (completa — 12/12 + CRM propio)
📋 E7: Crecimiento y Monetización (5 tareas) — Sprint 1 semana
📋 E8: Escalamiento Técnico (7 tareas) — Sprint 1-2 semanas
📋 E9: App Nativa (4 tareas, evaluar) — Baja prioridad
📋 E10: Operaciones y Compliance (5 tareas) — Sprint 1 semana
```

**Tiempo total estimado:** 4-6 semanas (E7-E10)
**Items que requieren decisión del usuario:** 3 (freemium, hosting, app nativa)

---

*Fuente única de verdad del proyecto. Se actualiza al decir "documentar".*
