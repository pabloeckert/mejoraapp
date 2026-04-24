# MEJORAAPP — Documentación Maestra

> **Proyecto:** MejoraApp — Comunidad de Líderes Empresariales
> **Stack:** React 18 · TypeScript · Vite 5 · Supabase · Tailwind CSS · shadcn/ui
> **Producción:** https://app.mejoraok.com
> **Repo:** https://github.com/pabloeckert/MejoraApp
> **Última actualización:** 2026-04-24 21:09 GMT+8

---

## 📌 Protocolo de Actualización

> **Cuando digas "documentar"**, este archivo se actualiza con los trabajos realizados en la sesión.
> Todos los archivos de documentación viven en esta carpeta `Documents/`.
> Este documento es la **fuente única de verdad** del proyecto.

### Reglas

1. **Al inicio de cada sesión:** Leer este documento para entender el estado actual.
2. **Al final de cada sesión (o cuando se diga "documentar"):** Actualizar las secciones correspondientes.
3. **Nunca crear archivos sueltos** — todo va aquí o en archivos técnicos puntuales (SQL, etc).
4. **Registro de sesiones:** Agregar fila en la tabla del §10.
5. **Actualizar planes:** Marcar tareas con `[x]` al completar.

---

## 1. Resumen Ejecutivo

MejoraApp es el MVP digital de **Mejora Continua**, comunidad de negocios para líderes empresariales argentinos. Funciona en producción con muro anónimo moderado por IA, contenido de valor, diagnóstico estratégico y panel admin.

**Estado actual:** App funcional con seguridad completa (E1), DevOps completa (E2 6/6), UX completa (E3 6/6), **E4 Analytics y Retención COMPLETA (4/4 sprints)**. **Análisis multidisciplinario completo (2026-04-24).**

---

## 2. Arquitectura del Sistema

### 2.1 Frontend (React SPA)

```
src/
├── pages/              # 5 páginas lazy-loaded
│   ├── Index.tsx       # Dashboard principal con 4 tabs
│   ├── Auth.tsx        # Login/Signup (email + Google OAuth)
│   ├── Admin.tsx       # Panel admin con 6 módulos
│   ├── ResetPassword.tsx
│   └── NotFound.tsx
├── components/
│   ├── admin/          # AdminContenido, AdminIA, AdminMuro, AdminNovedades, AdminUsuarios, AdminSeguridad
│   ├── auth/           # LoginForm, SignupForm, GoogleButton, AdminLoginForm
│   ├── tabs/           # Muro, Novedades, ContenidoDeValor
│   ├── ui/             # 30+ componentes shadcn/ui
│   ├── AppHeader.tsx, BottomNav.tsx, NavLink.tsx
│   ├── DiagnosticTest.tsx
│   ├── ErrorBoundary.tsx
│   ├── Onboarding.tsx
│   └── ProfileCompleteModal.tsx
├── contexts/           # AuthContext, ThemeContext
├── hooks/              # use-toast, useAdminAction, use-mobile
├── data/               # diagnosticData.ts
├── integrations/
│   └── supabase/       # client.ts, types.ts (auto-generado)
├── lib/                # utils.ts, analytics.ts, sentry.ts
├── assets/             # Logo, avatars
├── App.tsx             # Router + providers
└── vite-env.d.ts
```

### 2.2 Backend (Supabase)

**Base de datos:** PostgreSQL con RLS habilitado en todas las tablas.

| Tabla | Propósito | RLS |
|-------|-----------|-----|
| `profiles` | Perfiles de usuario (nombre, apellido, empresa, cargo) | Usuario lee/escribe el propio. Admin lee todos. |
| `user_roles` | Roles (admin, moderator, user) | Solo admin gestiona |
| `diagnostic_results` | Resultados del diagnóstico estratégico | Usuario ve los propios. Admin ve todos. |
| `wall_posts` | Posts anónimos del muro | Authenticated lee aprobados. Admin lee todos. |
| `wall_comments` | Comentarios en posts del muro | Authenticated lee aprobados. Admin lee todos. |
| `wall_likes` | Likes en posts (unique por user+post) | Todos leen. Usuario gestiona los propios. |
| `content_categories` | Categorías de contenido (tip, estrategia, reflexión, noticia) | Público lee. Admin gestiona. |
| `content_posts` | Artículos/videos/infografías/PDFs | Público lee. Admin gestiona. |
| `content_guidelines` | Lineamientos para generación IA | Solo admin |
| `novedades` | Noticias de la comunidad | Público lee. Admin gestiona. |
| `admin_config` | Configuración admin | Solo admin |
| `moderation_log` | Log de moderación de posts | Solo admin (via service_role) |
| `moderation_comments_log` | Log de moderación de comentarios | Solo service_role |

**Funciones SQL:**
- `is_admin(UUID)` — Verifica rol admin (SECURITY DEFINER)
- `has_role(UUID, app_role)` — Verifica rol específico
- `handle_new_user()` — Trigger: crea perfil al registrarse
- `update_wall_likes_count()` — Trigger: sincroniza likes_count
- `update_wall_post_comments_count()` — Trigger: sincroniza comments_count

### 2.3 Edge Functions (Supabase Deno)

| Función | Propósito | Auth | Rate Limit |
|---------|-----------|------|------------|
| `moderate-post` | Modera posts del muro con IA multi-provider | JWT requerido | 3 posts/min/usuario |
| `moderate-comment` | Modera comentarios con IA multi-provider | JWT requerido | 10 comments/min/usuario |
| `verify-admin` | Verifica rol admin del usuario actual | JWT requerido | — |
| `admin-action` | Router de 13 acciones admin (CRUD completo) | JWT + rol admin | — |
| `generate-content` | Genera contenido con IA (Gemini/Groq) | JWT + rol admin | — |
| `send-push-notification` | Envía push a suscriptores (new_post, reply, novedad) | Service role | — |
| `send-diagnostic-email` | Email follow-up post-diagnóstico vía Resend | Service role | — |

**Cadena de fallback IA:** Gemini → Groq → OpenRouter (DeepSeek) → null (auto-aprobado)

### 2.4 Autenticación

- **Email/Password** via Supabase Auth
- **Google OAuth** configurado
- **Admin login:** Botón con icono Shield en pantalla de auth → usuario + contraseña
- **Session management:** AuthContext con onAuthStateChange
- **Admin verification:** Session flag + re-verificación server-side via `verify-admin` Edge Function

### 2.5 PWA

- `manifest.json` configurado
- Service Worker con estrategia network-first
- Instalable en dispositivos móviles

### 2.6 Arquitectura de Seguridad

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (navegador)                    │
│  Login → Supabase Auth → rol verificado                  │
│  Lecturas → Supabase directo (RLS protegido)            │
│  Escrituras → useAdminAction() → Edge Function          │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                EDGE FUNCTIONS (Supabase)                  │
│  verify-admin    → Verifica rol admin (service_role)     │
│  admin-action    → 13 acciones de escritura admin        │
│  moderate-post   → Moderación IA de posts                │
│  moderate-comment → Moderación IA de comentarios         │
│  generate-content → Generación IA de contenido           │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Módulos Funcionales

### 3.1 Muro Anónimo
- Posts anónimos (máx. 500 chars)
- Likes con conteo denormalizado + toggle (like/unlike)
- Comentarios (máx. 300 chars) con conteo denormalizado
- Moderación IA server-side antes de publicar
- Realtime: suscripción a inserts de posts y comentarios aprobados
- Infinite scroll con IntersectionObserver
- Pull-to-refresh con visual feedback (jalá/soltá/actualizando)
- Eliminar posts propios — doble-tap para confirmar, auto-cancel 5s
- Ctrl+Enter / Cmd+Enter para publicar
- Contador de caracteres cambia color (naranja 400+, rojo 480+)
- Social proof — post count visible en header
- Tooltip fecha absoluta — hover/tap muestra fecha completa
- Cross-navigation — empty state CTA al diagnóstico estratégico
- Textarea comentarios: 44px (target táctil mejorado)

### 3.2 Contenido de Valor
- 4 categorías: Tip, Estrategia, Reflexión, Noticia
- 4 tipos de contenido: article, video, infographic, book/PDF
- Búsqueda por título, resumen y contenido
- Filtro por categoría como pills horizontales (reemplaza dropdown)
- Category badge visible en cada card
- Generación IA desde panel admin

### 3.3 Diagnóstico Estratégico
- Test interactivo con preguntas categorizadas y shuffle aleatorio
- Puntaje y perfil resultante con WhatsApp CTA
- Botón "Ver contenido" post-resultado (no solo WhatsApp)
- Historial de últimos 3 resultados con color, fecha y puntaje
- Botón "Hacerlo de nuevo" si ya tiene historial
- Persistencia en `diagnostic_results` + localStorage para progreso
- Progress bar theme-aware (dark mode compatible)

### 3.4 Novedades
- CRUD admin de noticias
- Publicación con fecha
- Imagen + enlace externo
- Sección estática de servicios (consultoría, eventos, CRM, contacto)
- WhatsApp CTA como pill button (más prominente)
- Empty state "Próximamente" cuando no hay publicaciones
- Título simplificado: "Novedades" (antes "Novedades MC")

### 3.5 Panel Admin (6 módulos)
- **Contenido:** CRUD de posts con tipos de media
- **IA:** Generación de contenido por categoría
- **Novedades:** Gestión de noticias
- **Muro:** Moderación de posts y comentarios
- **Usuarios:** Gestión de perfiles y roles
- **Seguridad:** Configuración de acceso y auditoría

### 3.6 Onboarding
- 4 pasos con skip (Contenido, Diagnóstico, Muro, Novedades)
- Persistencia en localStorage (`mc-onboarding-done`)
- Overlay modal con progress dots
- Se saltea si el usuario ya completó el diagnóstico
- Secuencia correcta — primero onboarding, luego profile (nunca juntos)

### 3.7 ProfileCompleteModal
- Modal que solicita empresa, cargo, WhatsApp
- Permite saltar ("Completar después")
- Se muestra si el perfil no tiene empresa ni cargo
- Campo WhatsApp marcado como "(opcional)"

### 3.8 Header y Navegación
- Avatar con iniciales del usuario (reemplaza icono genérico User)
- Targets táctiles 44×44px (antes 32×32, debajo del mínimo)
- Tab default dinámico — Muro para usuarios recurrentes, Tips para nuevos
- Bottom nav: label "Tips" (antes "Contenido", más corto)

### 3.9 Autenticación
- Errores humanos en login/signup (mapeo de errores técnicos de Supabase)
- Indicador de fuerza de contraseña en registro (débil/aceptable/buena/fuerte)
- Google OAuth feedback — spinner + "Conectando con Google…"
- Loading states descriptivos — "Cargando tu sesión…" / "Verificando tu perfil…"

---

## 4. Despliegue

### Producción (actual)
- **Host:** Hostinger via FTP
- **Dominio:** app.mejoraok.com
- **CI/CD:** GitHub Actions → build → deploy FTP automático a main
- **Rollback:** Workflow `rollback.yml` + health check post-deploy

### Comandos
```bash
npm install
npm run dev       # Dev: http://localhost:8080
npm run build     # Producción: dist/
npm run test      # Tests: vitest run
npm run lint      # Lint: eslint
```

### Staging
- Rama `develop` + workflow `deploy-staging.yml`
- Config: `.env.staging.example` (copiar a `.env.staging` con Supabase staging)
- Deploy automático a `/public_html/app-staging/` en Hostinger

---

## 5. Métricas

| Métrica | Valor |
|---------|-------|
| Líneas de código (TS/TSX) | ~14,000 |
| Archivos totales | 166 |
| Tests | 103 (100% passing) |
| Tablas DB | 13 |
| Edge Functions | 7 |
| Commits | 123+ |
| Bundle gzipped | ~350KB |
| Build time | ~4.4s |
| Eventos analytics | 25+ |

---

## 6. Análisis Multidisciplinario (2026-04-24)

Auditoría completa desde 18 perspectivas: UX/UI (9 roles), Negocio (4 roles), Ingeniería (4 roles), Calidad/Operaciones (4 roles), Datos (3 roles).

> **Análisis expandido disponible en [`Documents/ANALISIS-MAESTRO.md`](/pabloeckert/MejoraApp/blob/main/Documents/ANALISIS-MAESTRO.md)** — 37 perspectivas profesionales con plan optimizado por etapas de 12 semanas.

### 6.1 UX Designer
- ✅ Flujo de autenticación completo (email + Google + recuperación)
- ✅ Onboarding progresivo con skip inteligente
- ✅ Diagnóstico con persistencia en localStorage
- ✅ Post-diagnóstico: botón "Ver contenido" + historial de resultados
- ✅ ProfileCompleteModal y Onboarding secuenciados (nunca juntos)
- ✅ Loading states descriptivos
- ⚠️ **Tab "Tips" carga primero para nuevos pero el diferencial es el Muro**
- ⚠️ **No hay onboarding específico del muro (anonimato = confianza)**
- ⚠️ **Diagnóstico no indica que se puede retomar si se abandona**

### 6.2 UI Designer
- ✅ Sistema de diseño consistente (shadcn/ui + Tailwind + tokens semánticos)
- ✅ Dark mode implementado correctamente
- ✅ Header con targets táctiles 44×44px
- ✅ Avatar con iniciales del usuario
- ⚠️ **Typography sin escala definida** (valores ad-hoc: 10px, 11px, 15px)
- ⚠️ **Contraste insuficiente** en elementos secundarios (`text-[10px] text-muted-foreground`)
- ⚠️ **Cards sin jerarquía visual** — todas usan el mismo shadow
- ⚠️ **BottomNav indicador activo débil** — línea h-0.5 casi invisible

### 6.3 UX Researcher
- ✅ Muro anónimo resuelve miedo real de exposición
- ✅ WhatsApp como canal CTA (dominante en Argentina)
- ✅ Social proof con post count
- ⚠️ **Sin datos de comportamiento** (no hay analytics)
- ⚠️ **Shuffle de preguntas puede confundir al retomar**

### 6.4 Product Designer
- ⚠️ **Loop de valor no cerrado** — diagnóstico → resultado → WhatsApp → ¿y después?
- ⚠️ **Sin triggers de re-engagement** — sin push, sin email, sin gamificación
- ⚠️ **Modelo de negocio no visible en producto** — servicios enterrados en Novedades

### 6.5 UX Writer / Content Designer
- ✅ Tono argentino auténtico ("¿Te animás?", "Completá")
- ✅ Microcopy con personalidad
- ✅ Errores técnicos mapeados a mensajes humanos
- ⚠️ **Inconsistencia en voseo/tuteo**
- ⚠️ **"Novedades MC" en onboarding vs "Novedades" en app**

### 6.6 Information Architect
- ✅ 4 tabs claros sin overlap funcional
- ✅ Admin separado en ruta distinta
- ✅ Tab default dinámico
- ⚠️ **"Tips" como label es demasiado vago** para artículos/videos/infografías/PDFs
- ⚠️ **Servicios mezclados con novedades** — funnel de ventas disfrazado de contenido

### 6.7 Interaction Designer
- ✅ Likes con feedback visual (fill + scale)
- ✅ Pull-to-refresh en el muro
- ✅ Ctrl+Enter para publicar + contador de caracteres con color
- ⚠️ **Sin feedback háptico en PWA**
- ⚠️ **Scroll position se pierde al cambiar de tab**
- ⚠️ **Enter envía comentario sin confirmación** (fácil enviar accidentalmente)
- ⚠️ **Doble-tap para eliminar sin affordance** (el usuario no sabe que puede eliminar)

### 6.8 Service Designer
- ✅ Ecosistema integrado (diagnóstico → contenido → comunidad)
- ✅ WhatsApp como puente omnicanal
- ⚠️ **Diagnóstico sin follow-up por email**
- ⚠️ **Sin integración con CRM**
- ⚠️ **PWA sin push notifications**

### 6.9 UX Strategist
- ✅ Nicho claro (comunidad empresarial argentina)
- ✅ Modelo de valor bilateral
- ⚠️ **Retención sin ganchos diarios**
- ⚠️ **Gamificación ausente**
- ⚠️ **Sin analytics para iterar**

### 6.10 Product Owner
- ✅ Priorización correcta (seguridad → infraestructura → UX)
- ⚠️ **Sin KPIs definidos** (DAU, tasa completado diagnóstico, posts/usuario)
- ⚠️ **Etapa 4 (analytics) debería ser prioridad antes que features nuevas**

### 6.11 Business Analyst
- ⚠️ **Funnel con agujero** — diagnóstico → WhatsApp → sin tracking de conversión
- ⚠️ **Sección de servicios sin tracking de clicks ni conversiones**

### 6.12 Frontend Developer
- ✅ Lazy loading, React Query, memo, ErrorBoundary
- ⚠️ **Muro.tsx tiene 14 useState** — necesita useReducer o subdivisión
- ⚠️ **`sessionStorage.getItem("mc-visits")` frágil** — mejor campo en perfil Supabase
- ⚠️ **CustomEvent `navigate-tab`** acoplado — mejor Context o URL params

### 6.13 Software Architect
- ✅ Arquitectura limpia SPA + Supabase + Edge Functions
- ✅ Cadena de fallback IA inteligente
- ⚠️ **`admin-action` como "god function"** con 13 acciones — riesgo de acoplamiento
- ⚠️ **`is_admin()` SECURITY DEFINER** — necesita auditoría periódica

### 6.14 QA Engineer
- ✅ 103 tests, 100% passing
- ⚠️ **Sin tests E2E** (Playwright/Cypress)
- ⚠️ **Sin tests de accesibilidad** (axe-core)

### 6.15 DevOps Engineer
- ✅ CI/CD via GitHub Actions
- ⚠️ **FTP sin atomic deploys** — riesgo de estado inconsistente
- ✅ Staging config (workflow + env)
- ✅ Sentry integration (error tracking + user context)

### 6.16 Security Specialist
- ✅ RLS en todas las tablas + Edge Functions con JWT
- ⚠️ **Admin access via Shield es security by obscurity** (mitigado por verify-admin)
- ⚠️ **Rate limiting solo en moderación** — otras funciones sin límite

### 6.17 Technical Writer
- ✅ Documentación maestra excelente (fuente única de verdad)
- ⚠️ **Componentes sin JSDoc** — props no documentados

### 6.18 SEO / ASO Specialist
- ⚠️ **Sin meta tags, Open Graph, structured data**
- ⚠️ **Sin share cards** para WhatsApp/redes

### Resumen de Calificación UX Manager

| Área | Estado | Gap principal |
|---|---|---|
| Auth & Onboarding | ⭐⭐⭐⭐ | Falta onboarding del muro |
| Navegación | ⭐⭐⭐ | Scroll position perdida, label engañoso |
| Contenido | ⭐⭐⭐ | Sin personalización, sin funnel |
| Muro | ⭐⭐⭐⭐ | Falta háptica, menú contextual |
| Diagnóstico | ⭐⭐⭐ | Sin follow-up, sin recomendaciones |
| Admin | ⭐⭐ | No auditado en profundidad |
| Retención | ⭐⭐ | Sin push, sin gamificación, analytics implementado |
| Performance | ⭐⭐⭐ | Bundle OK, sin CDN |

---

## 7. Plan de Desarrollo por Etapas

### ETAPA 1 — Seguridad y Estabilización ✅ COMPLETA
**Fecha de cierre:** 2026-04-23

- [x] 1.1 Rotar credenciales expuestas (master password eliminada)
- [x] 1.2 Mover lógica admin a Edge Functions (admin-action con 13 acciones)
- [x] 1.3 RLS admin_config seguro (función is_admin())
- [x] 1.4 Eliminar "puntito secreto" → botón Shield legítimo
- [x] 1.5 Auditoría de RLS policies (7 tablas mejoradas)
- [x] 1.6 Eliminar código muerto ai.ts (IAs 100% server-side)

### ETAPA 2 — Arquitectura y DevOps ✅ COMPLETA
**Fecha de cierre:** 2026-04-24

- [x] 2.1 Sistema de migraciones SQL (12 archivos incrementales)
- [x] 2.2 Tests de integración (103 tests, 7 archivos)
- [x] 2.3 Estrategia de rollback (workflow + health check)
- [x] 2.4 PWA real (manifest + service worker network-first)
- [x] 2.5 Entorno de staging (`.env.staging.example` + workflow `deploy-staging.yml` + script `build:staging`)
- [x] 2.6 Monitoring y alertas (Sentry — `lib/sentry.ts`, user tracking, ErrorBoundary integration)

### ETAPA 3 — Experiencia de Usuario ✅ COMPLETA
**Fecha de cierre:** 2026-04-24

- [x] 3.1 Búsqueda de contenido (por título, resumen, contenido)
- [x] 3.2 Onboarding mejorado (secuenciación, skip si hizo diagnóstico)
- [x] 3.3 Diagnóstico: historial de resultados + botón "Ver contenido"
- [x] 3.4 Muro: eliminar posts propios (doble-tap confirmar)
- [x] 3.5 UX crítico: targets táctiles, errores humanos, dark mode, pull-to-refresh
- [x] 3.6 Conexiones entre secciones (cross-navigation, tab dinámico, social proof)

### ETAPA 4 — Analytics y Retención ⚡ PRIORIDAD CRÍTICA
> **Re-definida a partir del análisis multidisciplinario.** Sin datos no se puede optimizar. Sin retención no hay producto.

**Sprint 4.1 — Analytics ✅ COMPLETO (2026-04-24)**
- [x] 4.1.1 Integrar PostHog — tracking de pageviews, eventos, sesiones (`lib/analytics.ts`)
- [x] 4.1.2 Eventos custom: login (email/google/admin), signup, logout, publish_post, like_post, comment_post, delete_post, start_diagnostic, complete_diagnostic, share_diagnostic_whatsapp, retake_diagnostic, view_content, search_content, filter_category, onboarding_complete, onboarding_skip, profile_complete, profile_skip, tab_switch, page_view, admin_action, cross_navigation (25+ eventos)
- [ ] 4.1.3 Dashboard básico: DAU, WAU, posts/día, diagnósticos/día, tasa completado diagnóstico (configurar en PostHog UI)
- [ ] 4.1.4 Funnel: registro → primer post → primer diagnóstico → retorno en 7 días (configurar en PostHog UI)

**Sprint 4.2 — Retención ✅ COMPLETO (2026-04-24)**
- [x] 4.2.1 Push notifications (Web Push API) — `lib/push.ts` + SW push handler + `NotificationToggle` + Edge Function `send-push-notification`
- [x] 4.2.2 Email follow-up post-diagnóstico (Resend) — Edge Function `send-diagnostic-email` con perfil + recomendación
- [x] 4.2.3 Contenido "nuevo desde tu última visita" badge en tabs (`hooks/useLastVisit.ts` + dot badge en BottomNav)
- [x] 4.2.4 Notificación in-app (toast) para respuestas en muro en tiempo real (Realtime subscription + toast en Muro.tsx)

**Sprint 4.3 — Engagement ✅ COMPLETO (2026-04-24)**
- [x] 4.3.1 Gamificación: 8 badges (primer post, 5 posts, 10 posts, primer comentario, primer diagnóstico, 5 diagnósticos, 10 likes, 3 días activo) + triggers automáticos SQL + hook useBadges + componente BadgeDisplay + toast al ganar badge
- [x] 4.3.2 Ranking de comunidad: vista SQL community_ranking + hook useRanking + componente CommunityRanking expandible en muro
- [x] 4.3.3 Perfil completo: campos bio/website/linkedin en profiles + componente UserProfile (sheet) + avatar clickeable en header + badges progreso
- [x] 4.3.4 Contenido programado: campo scheduled_for + UI admin con datetime picker + badge "Programado" + filtro en frontend

**Sprint 4.4 — Funnel y Optimización ✅ COMPLETO (2026-04-24)**
- [x] 4.4.1 Servicios separados de novedades: componente `Servicios.tsx` dedicado con tracking por servicio (`trackServiceClick`, `trackServiceWhatsApp`), variante compact/full
- [x] 4.4.2 CTA consultoría post-diagnóstico con tracking: `trackDiagnosticCTAPerfil` + `trackFunnelStep("diagnostic_whatsapp_cta")` con perfil y puntaje
- [x] 4.4.3 Recomendaciones de contenido por perfil: hook `useContentRecommendations` que mapea perfil → categorías/keywords → posts relevantes, mostrados en resultado del diagnóstico
- [x] 4.4.4 Exportar diagnóstico a PDF: `lib/pdfExport.ts` con jsPDF dinámico, incluye perfil, puntaje, síntomas, CTA. Botón "Descargar PDF" en resultado
- [x] 4.4.5 Dashboards PostHog: guía de configuración en `Documents/POSTHOG-DASHBOARDS.md` con 3 dashboards (Actividad, Funnel, Contenido) + retención + 25+ eventos documentados

### ETAPA 5 — Calidad y Robustez
> **Depende de E4 (analytics) para priorizar qué arreglar primero.**

- [ ] 5.1 Tests E2E con Playwright (flujos críticos: auth → post → diagnóstico)
- [ ] 5.2 Tests de accesibilidad (axe-core + keyboard navigation)
- [ ] 5.3 Refactorizar Muro.tsx (14 useState → useReducer + sub-componentes)
- [ ] 5.4 Typography scale definida (caption → body → subtitle → title → heading)
- [ ] 5.5 Scroll position preservation al cambiar de tab
- [ ] 5.6 Editorial style guide (voseo consistente)
- [ ] 5.7 SEO básico (meta tags, Open Graph, share cards)
- [ ] 5.8 Sentry integration (error tracking)

### ETAPA 6 — Escalamiento (futuro)
- [ ] 6.1 Migrar hosting (Hostinger+FTP → Vercel/Cloudflare)
- [ ] 6.2 CDN y optimización de assets (WebP, responsive images)
- [ ] 6.3 Bundle analysis y code splitting (< 250KB gzipped)
- [ ] 6.4 i18n base (multi-idioma)
- [ ] 6.5 API pública (endpoints documentados)
- [ ] 6.6 App mobile nativa (Capacitor o React Native)
- [ ] 6.7 Integración CRM propia
- [ ] 6.8 Separar `admin-action` en funciones específicas

---

## 8. Decisiones de Diseño Clave

1. **Supabase como backend único** — No se migra a otro BaaS. Se optimiza el uso de Supabase.
2. **Mobile-first** — La mayoría accede desde celular. Toda feature se diseña para móvil primero.
3. **IA como herramienta** — Modera y genera, pero la comunidad es el producto.
4. **Sin lock-in** — Código portable. Si se migra algo, el código debe sobrevivir.
5. **Crecimiento orgánico** — Se construye lo que se necesita, no lo que podría necesitarse.
6. **Datos antes que features** — No construir nada nuevo sin poder medir su impacto (E4).

---

## 9. Tecnologías Integradas / Pendientes

| Tech | Uso | Estado | Etapa |
|------|-----|--------|-------|
| PostHog | Analytics + feature flags | ✅ Integrado (lib/analytics.ts) | E4 |
| Sentry | Error tracking + user context | ✅ Integrado (lib/sentry.ts) | E2 |
| Resend | Emails transaccionales | ✅ Integrado (Edge Function send-diagnostic-email) | E4 |
| Web Push API | Push notifications PWA | ✅ Integrado (lib/push.ts + SW + Edge Function) | E4 |
| Playwright | Tests E2E | 🔴 Pendiente | E5 |
| Plausible | Analytics alternativo | ⚪ Reemplazado por PostHog | — |
| Meilisearch | Búsqueda full-text | 🟢 Media | E5 |
| Vercel | Hosting moderno | ⚪ Futuro | E6 |
| Capacitor | App nativa | ⚪ Futuro | E6 |

---

## 10. Registro de Sesiones

| Fecha | Resumen | Cambios clave |
|-------|---------|---------------|
| 2026-04-15 | Setup inicial | React + Supabase + Auth + Muro + Admin |
| 2026-04-18 | Migraciones DB | comments, content media, profile fields, admin config |
| 2026-04-23 | Seguridad + DevOps | E1 completa, E2 (4/6), 103 tests, CI/CD, Edge Functions |
| 2026-04-24 AM | Auditoría UX | 9 perspectivas UX, consolidación documentación |
| 2026-04-24 | UX Sprint completo | E3 completa (6/6), 30 cambios UX en 5 sprints |
| 2026-04-24 | Análisis multidisciplinario | 18 perspectivas, redefinición de E4 como prioridad crítica, consolidación documentación |
| 2026-04-24 PM | Sentry + PostHog + Staging | E2 completa (6/6), E4 Sprint 4.1 completo, 25+ eventos analytics, Sentry integration, staging config |
| 2026-04-24 PM | Retención rápida | E4 Sprint 4.2 (2/4): badges "nueva visita" + toast real-time respuestas muro |
| 2026-04-24 PM | Push + Email | E4 Sprint 4.2 completo (4/4): Web Push + Resend email post-diagnóstico + Edge Functions |
| 2026-04-24 PM | Análisis multidisciplinario completo | 37 perspectivas (12 Técnicas, 10 Producto, 8 Comercial, 7 Operaciones). Plan optimizado 12 semanas. Documento ANALISIS-MAESTRO.md creado. |
| 2026-04-24 PM | Sprint 4.3 completo | Gamificación (8 badges + triggers automáticos), Ranking comunidad, Perfil completo (bio/links), Contenido programado. 7 archivos nuevos, 1276 líneas. |
| 2026-04-24 PM | Sprint 4.4 completo | Servicios separados con tracking, CTA consultoría post-diagnóstico, recomendaciones contenido por perfil, PDF export (jsPDF), dashboards PostHog. E4 completa. |

---

## 11. Archivos del Proyecto en Documents/

| Archivo | Propósito |
|---------|-----------|
| `MEJORAAPP.md` | Este documento — fuente única de verdad |
| `ANALISIS-MAESTRO.md` | Análisis multidisciplinario completo (37 perspectivas) + plan optimizado por etapas |
| `POSTHOG-DASHBOARDS.md` | Guía de configuración de dashboards PostHog (Actividad, Funnel, Contenido, Retención) |
| `SESSION-PROMPT.md` | ⚠️ Prompt de inicio para próxima sesión — LEER PRIMERO |
| `PUSH_SUBSCRIPTIONS.sql` | Script SQL tabla push_subscriptions + RLS |
| `MIGRACION-SEGURIDAD-2026-04-23.sql` | Script SQL de hardening de seguridad (ejecutado) |
| `MIGRACION-GAMIFICACION-2026-04-24.sql` | Script SQL gamificación (user_badges, triggers, ranking, profile fields, scheduled_for) |

---

## 12. Instructivo de Deploy

### Producción (GitHub Actions)
Push a `main` → build automático → deploy a Hostinger via FTP → `/public_html/app/`.

### Staging (GitHub Actions)
Push a `develop` → `npm run build:staging` → deploy a Hostinger via FTP → `/public_html/app-staging/`.
Requiere secrets: `VITE_STAGING_SUPABASE_URL`, `VITE_STAGING_SUPABASE_PUBLISHABLE_KEY`.

### Manual (SmartFTP)
1. `npm run build`
2. Subir contenido de `dist/` a `/public_html/app/` en Hostinger

### Rollback
Desde GitHub Actions → workflow `rollback.yml` → especificar commit SHA + razón.

---

*Fuente única de verdad del proyecto. Se actualiza al decir "documentar" o al completar cada etapa.*
