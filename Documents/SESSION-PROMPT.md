# SESSION-PROMPT.md — Prompt para Próxima Sesión

> **⚠️ ADVERTENCIA PARA EL ASISTENTE:** Este archivo es tu punto de partida.
> **LEER ESTE ARCHIVO PRIMERO** antes de hacer cualquier cosa.
> Contiene el contexto exacto del proyecto, el estado actual y las instrucciones para continuar.
> **NO inventes ni asumas** — si algo no está acá, preguntá.

---

## 🚀 Instrucciones de Inicio

1. **Leer este archivo completo**
2. **Leer** `Documents/DOCUMENTO-MAESTRO.md` — fuente única de verdad del proyecto
3. **Confirmar con el usuario** qué quiere hacer antes de arrancar

---

## 📋 Estado del Proyecto (2026-04-25 05:10 GMT+8)

**Proyecto:** MejoraApp — Comunidad de Líderes Empresariales
**Stack:** React 18 · TypeScript · Vite 5 · Supabase · Tailwind CSS · shadcn/ui
**Producción:** https://app.mejoraok.com
**Repo:** https://github.com/pabloeckert/MejoraApp
**Branch principal:** `main` (deploy automático via GitHub Actions → FTP → Hostinger)

### Etapas — TODAS COMPLETAS

| Etapa | Nombre | Estado |
|-------|--------|--------|
| E1 | Seguridad y Estabilización | ✅ Completa (6/6) |
| E2 | Arquitectura y DevOps | ✅ Completa (6/6) |
| E3 | Experiencia de Usuario | ✅ Completa (6/6) |
| E4 | Analytics y Retención | ✅ Completa (4/4 sprints) |
| E5 | Calidad y Robustez | ✅ Completa (3/3 sprints) |
| E6 | Escalamiento | ✅ Completa (12/12 + CRM propio) |

### Base de Datos — 23 Tablas

**Core (19 tablas):** profiles, user_roles, diagnostic_results, wall_posts, wall_comments, wall_likes, content_categories, content_posts, content_guidelines, novedades, admin_config, moderation_log, moderation_comments_log, user_badges, push_subscriptions, admin_audit_log, nps_responses, referrals, admin_whitelist

**CRM (4 tablas):** crm_clients, crm_products, crm_interactions, crm_interaction_lines

**Vistas:** crm_client_summary, crm_seller_ranking
**RPC:** get_crm_dashboard()

### Stack Completo

| Componente | Tecnología | Estado |
|-----------|-----------|--------|
| Frontend | React 18 + TypeScript + Vite 5 | ✅ |
| UI | Tailwind CSS + shadcn/ui (30+ componentes) | ✅ |
| Backend | Supabase (Auth + DB + 7 Edge Functions) | ✅ |
| Analytics | PostHog (25+ eventos, 3 dashboards) | ✅ |
| Error Tracking | Sentry | ✅ |
| Email | Resend (post-diagnóstico) | ✅ |
| Push | Web Push API (VAPID configurado) | ✅ |
| CRM | Módulo admin-only (Dashboard, Clientes, Interacciones, Productos) | ✅ |
| Testing | Vitest (103+) + Playwright (22 E2E) + axe-core (7) | ✅ |
| i18n | Español/Inglés (130+ claves) | ✅ |
| Legal | Privacidad, Términos, Cookies, "Mis Datos" | ✅ |
| Gamificación | 8 badges + ranking comunidad | ✅ |
| PWA | Manifest + Service Worker + instalable | ✅ |

### Archivos Clave

```
src/
├── components/admin/AdminCRM.tsx    # CRM admin-only (lazy loaded)
├── hooks/useCRM.ts                  # Hooks CRM (clients, products, interactions, dashboard)
├── types/crm.ts                     # Tipos TypeScript CRM
├── pages/Admin.tsx                  # Panel Admin (7 tabs: Contenido, IA, Novedades, Muro, Usuarios, Seguridad, CRM)
├── repositories/index.ts            # Repository Layer
├── i18n/locales/index.ts            # i18n (es/en)
└── lib/                             # analytics, sentry, push, pdfExport, utils

Documents/
├── DOCUMENTO-MAESTRO.md             # Fuente única de verdad (17 secciones)
├── GUIA-VAPID-KEYS.md              # Guía VAPID
├── MIGRACION-CRM-2026-04-25.sql    # Script CRM (ejecutado)
└── ...                              # Scripts SQL anteriores (ejecutados)
```

---

## 📋 Plan Pendiente (E7-E10)

### ETAPA 7 — Crecimiento y Monetización
- 7.1 Poblar CRM con datos reales
- 7.2 Modelo freemium (definir features premium)
- 7.3 A/B testing en onboarding
- 7.4 Email onboarding sequence (día 1, 3, 7)
- 7.5 Blog/SEO orgánico

### ETAPA 8 — Escalamiento Técnico
- 8.1 Migrar hosting a Vercel/Cloudflare
- 8.2 CDN + edge caching
- 8.3 Zod validation en Edge Functions
- 8.4 Logging estructurado
- 8.5 Visual regression tests
- 8.6 Lighthouse CI
- 8.7 Environment protection rules

### ETAPA 9 — App Nativa (evaluar)
- 9.1 Evaluar si PWA es suficiente
- 9.2-9.4 Capacitor + push nativas + ASO

### ETAPA 10 — Operaciones y Compliance
- 10.1 Política retención datos
- 10.2 DPIA
- 10.3 2FA para admins
- 10.4 WAF rules
- 10.5 SLO definition

---

## ⚠️ Reglas de la Sesión

1. **Leer `Documents/DOCUMENTO-MAESTRO.md`** antes de hacer cualquier cambio — es la fuente de verdad.
2. **Cuando el usuario diga "documentar"** — actualizar DOCUMENTO-MAESTRO.md con lo hecho y pushear.
3. **Al culminar cada sprint** — pushear y verificar que deploye en vivo.
4. **No crear archivos sueltos** — todo va en `Documents/`.
5. **103+ tests deben seguir pasando** — `npm run test` después de cada cambio significativo.
6. **Build debe pasar** — `npm run build` antes de cada push.
7. **No tocar `.env` del usuario** — solo modificar `.env.example`.

---

## 🔑 Credenciales y Acceso

- **GitHub Token:** Configurado en la sesión anterior.
- **Supabase:** Las credenciales están en `.env` (no visible en repo).
- **Deploy:** Push a `main` → GitHub Actions → FTP automático a Hostinger.
- **Rollback:** Workflow `rollback.yml` con commit SHA.
- **CRM propio:** Integrado en MejoraApp como módulo admin-only (no requiere servicio externo).

---

## 📝 Nota Importante

- El usuario trabaja en **horario GMT+8** (Asia/Shanghai).
- El idioma del proyecto es **español argentino** (voseo).
- El tono debe ser **directo y práctico** — sin vueltas.
- El CRM de MejoraCRM (github.com/pabloeckert/MejoraCRM) es un proyecto separado. La integración ya está hecha en MejoraApp.
- El usuario tiene cuenta en Hostinger (FTP) y Supabase.

---

*Archivo generado automáticamente. Actualizar al inicio de cada sesión.*
