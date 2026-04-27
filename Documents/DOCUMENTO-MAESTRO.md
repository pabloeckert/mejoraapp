# DOCUMENTO-MAESTRO.md — Fuente Única de Verdad

> **Proyecto:** MejoraApp — Comunidad de Líderes Empresariales
> **Stack:** React 18 · TypeScript · Vite 5 · Supabase · Tailwind CSS · shadcn/ui
> **Producción:** https://app.mejoraok.com
> **Repo:** https://github.com/pabloeckert/MejoraApp
> **Última actualización:** 2026-04-27

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
| Líneas de código (TS/TSX) | ~14,400 |
| Archivos totales | 207 |
| Tests unitarios | 103+ (100% passing) |
| Tests E2E | 22 (Playwright) |
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
Legal (privacidad, términos, cookies, "Mis Datos") · E2E Playwright (22) · axe-core (7) · Coverage · Refactor Muro · Typography · Scroll preservation · Editorial guide · SEO

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
| 2026-04-27 | GitHub Pages fix + Vercel setup + onboarding email prep |
| 2026-04-26 | Login UI + renombre Mirror + admin setup + Realtime fix |
| 2026-04-26 | GitHub Pages + Fix Realtime + Migración gamificación |
| 2026-04-26 | Consolidación docs v2 · E6 completa (12/12) |
| 2026-04-25 | CRM integrado · VAPID keys configuradas |
| 2026-04-25 | Consolidación docs · Plan optimizado · Push |
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

## 9. Plan Optimizado — Próximas Etapas (E7-E10)

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

---

## 10. Análisis Multidisciplinario (Resumen Ejecutivo)

37 perspectivas analizadas. Puntuación por área:

| Área | Score | Estado |
|------|-------|--------|
| Seguridad (RLS, Auth, Edge Functions) | 9/10 | ✅ Excelente |
| Backend (Supabase, Edge Functions) | 8/10 | ✅ Sólido |
| Frontend (React, TypeScript) | 7/10 | ✅ Funcional |
| UX/UI | 8/10 | ✅ Buena |
| DevOps/CI-CD | 8/10 | ✅ CSP + CORS + rate limiting |
| Analytics/BI | 8/10 | ✅ PostHog integrado |
| Legal/Compliance | 7/10 | ✅ Documentos creados |
| Growth/Marketing | 6/10 | ⚠️ Landing + referidos, falta CRM poblado |
| Calidad/Testing | 8/10 | ✅ E2E + accesibilidad |
| Documentación | 9/10 | ✅ Consolidada |

**Top 3 prioridades:**
1. 🔴 Poblar CRM + definir freemium → monetización
2. 🔴 Conectar Vercel + 2FA → infraestructura production-ready
3. 🟡 A/B testing + SEO orgánico → growth

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
```

**Tiempo estimado E8-E11:** 3-5 semanas
**Próximo paso:** Conectar Vercel + crear Resend + ejecutar SQL onboarding_emails

---

*Fuente única de verdad. Se actualiza al decir "documentar".*
