# DOCUMENTACIÓN COMPILADA DE MEJORAAPP
**Fecha de compilación:** 23 de abril 2026  
**Compilado por:** GitHub Copilot  
**Versión:** 1.0

---

## ÍNDICE
1. [README - Descripción General](#readme)
2. [Plan General de Desarrollo](#plan-general)
3. [Sesión 2026-04-23](#sesión-2026-04-23)
4. [Migración de Seguridad SQL](#migración-seguridad)

---

## README

### MejoraApp — Comunidad de Negocios

**Producción:** [app.mejoraok.com](https://app.mejoraok.com)  
**Stack:** React 18 + TypeScript + Vite + Supabase + Tailwind CSS

#### Descripción

MejoraApp es la aplicación digital del ecosistema Mejora Continua — una comunidad de negocios para líderes empresariales argentinos.

#### Funcionalidades

- 🔐 Autenticación completa (email/password + Google OAuth + recuperación)
- 📝 Muro anónimo con posts, likes, comentarios y moderación IA
- 📚 Contenido de valor con categorías y generación IA
- 🔍 Diagnóstico estratégico interactivo
- ⚙️ Panel admin con 6 módulos
- 🤖 IA multi-provider (Gemini, DeepSeek, Groq) con rotación automática
- 📱 PWA instalable
- 🌙 Dark mode

#### Desarrollo Local

```bash
npm install
npm run dev      # Dev server en http://localhost:8080
npm run build    # Build de producción en dist/
npm run test     # Tests (24 passing)
```

#### Despliegue

**Automático (GitHub Actions)**  
Push a `main` → build automático → deploy a Hostinger via FTP.

**Manual (SmartFTP)**
1. `npm run build`
2. Subir contenido de `dist/` a `/public_html/app/` en Hostinger

#### Stack Tecnológico

| Componente | Tecnología |
|-----------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth + DB + Edge Functions) |
| Database | PostgreSQL (RLS habilitado) |
| IA | Gemini + DeepSeek + Groq |
| Testing | Vitest (24 tests) |

#### Estructura del Proyecto

```
src/
├── pages/           # 5 páginas lazy-loaded
├── components/      # Componentes principales + ErrorBoundary
│   ├── admin/       # 6 módulos admin
│   ├── auth/        # Login, Signup, Google, AdminLogin
│   ├── tabs/        # Muro, Novedades, Contenido
│   └── ui/          # 30+ componentes shadcn/ui
├── contexts/        # AuthContext, ThemeContext
├── services/        # ai.ts (multi-provider)
├── data/            # Datos del diagnóstico
└── integrations/    # Supabase client + tipos
```

#### Acceso Admin

En la pantalla de login (`/auth`) hay un **botón admin con icono Shield**. Click → modo admin (usuario + contraseña). Click otra vez → login normal.

#### Métricas

- **Líneas de código:** ~11,400
- **Archivos TS/TSX:** 93
- **Tests:** 103 (100% passing)
- **Bundle gzipped:** ~350KB
- **Build time:** ~4 segundos

---

## PLAN GENERAL

### MEJORAAPP — Plan General de Desarrollo

**Objetivo final:** Transformar MejoraApp de un MVP funcional en una plataforma sólida, segura y escalable para la comunidad Mejora Continua.

**Última actualización:** 2026-04-23

**Estado actual:** App en producción (app.mejoraok.com), funcional con limitaciones de seguridad y arquitectura.

#### 1. Visión General

MejoraApp es la app digital de **Mejora Continua**, una comunidad de negocios para líderes empresariales argentinos. Ofrece muro anónimo, contenido de valor, diagnóstico estratégico y panel admin.

**Stack:** React 18 + TypeScript + Vite 5 + Supabase + Tailwind CSS + shadcn/ui  
**Métricas actuales:** ~11,400 líneas | 93 archivos TS/TSX | 12 tablas DB | 103 tests | 117+ commits

#### 2. Objetivos por Etapa

##### ETAPA 1 — Seguridad y Estabilización 🔴
**Prioridad:** CRÍTICA  
**Estado:** ✅ Completada (2026-04-23)  
**Bloquea:** Todo lo demás

| # | Tarea | Descripción |
|---|-------|-------------|
| 1.1 | Rotar credenciales expuestas | ✅ Master password eliminada. Tokens de sesión rotados |
| 1.2 | Mover lógica admin a Edge Functions | ✅ admin-action con 13 acciones, todos los módulos migrados |
| 1.3 | RLS admin_config seguro | ✅ Cerrado a solo admins via política RLS + función is_admin() |
| 1.4 | Eliminar "puntito secreto" | ✅ Reemplazado por botón admin legítimo con Shield icon |
| 1.5 | Auditoría de RLS policies | ✅ 7 tablas con políticas mejoradas, función is_admin() |
| 1.6 | Revisar ofuscación de API keys | ✅ Código muerto ai.ts eliminado. IAs 100% server-side |

**Criterio de cierre:** No hay credenciales en el repo, operaciones admin protegidas server-side, RLS sin agujeros.

##### ETAPA 2 — Arquitectura y DevOps 🟡
**Prioridad:** ALTA  
**Estado:** ⏳ 4/6 completadas (2026-04-23)  
**Depende de:** Etapa 1 ✅

| # | Tarea | Descripción |
|---|-------|-------------|
| 2.1 | Entorno de staging | ⏳ Rama `develop` creada. Pendiente: segundo proyecto Supabase |
| 2.2 | Sistema de migraciones SQL | ✅ 12 archivos incrementales en `supabase/migrations/` |
| 2.3 | Tests de integración | ✅ 103 tests (7 archivos), cubren flujos críticos |
| 2.4 | Monitoring y alertas | ⏳ Pendiente (Sentry o similar) |
| 2.5 | Estrategia de rollback | ✅ Workflow `rollback.yml` + health check post-deploy |
| 2.6 | PWA real | ✅ Ya existía: manifest.json + service worker con network-first |

**Criterio de cierre:** Hay staging, tests cubren flujos críticos, deploy es reversible.

##### ETAPA 3 — Experiencia de Usuario 🟢
**Prioridad:** MEDIA  
**Estado:** ⏳ 1/6 completadas (2026-04-23)  
**Depende de:** Etapa 1 ✅

| # | Tarea | Descripción |
|---|-------|-------------|
| 3.1 | Notificaciones email | Alertas de respuestas en muro, novedades, recordatorios |
| 3.2 | Búsqueda de contenido | ✅ Buscar en artículos por título, resumen y contenido |
| 3.3 | Perfil de usuario completo | Bio, avatar, empresa, links — visible para la comunidad |
| 3.4 | Onboarding mejorado | Tour interactivo que explique las 4 tabs y el diagnóstico |
| 3.5 | Diagnóstico: historial | Ver diagnósticos anteriores, comparar evolución |
| 3.6 | Muro: editar/eliminar posts | El autor puede gestionar su propio contenido |

**Criterio de cierre:** El usuario recibe notificaciones, puede buscar, tiene perfil rico.

##### ETAPA 4 — Contenido y Engagement 🔵
**Prioridad:** MEDIA  
**Depende de:** Etapa 3

| # | Tarea | Descripción |
|---|-------|-------------|
| 4.1 | Analytics de uso | Tracking de engagement: qué se lee, qué se comenta, DAU |
| 4.2 | Sistema de categorías dinámico | Admin puede crear/editar categorías desde el panel |
| 4.3 | Contenido programado | Publicaciones con fecha de aparición automática |
| 4.4 | Ranking de comunidad | Top contributors, badges, reconocimiento |
| 4.5 | Diagnóstico con IA | Análisis personalizado generado por IA al completar diagnóstico |
| 4.6 | Exportar resultados | PDF con diagnóstico + recomendaciones para compartir |

**Criterio de cierre:** Hay datos de uso, contenido se gestiona mejor, engagement crece.

##### ETAPA 5 — Escalamiento y Optimización ⚪
**Prioridad:** BAJA (futuro)  
**Depende de:** Etapas 1-4

| # | Tarea | Descripción |
|---|-------|-------------|
| 5.1 | Migrar hosting | De Hostinger+FTP a Vercel/Netlify/Fly.io |
| 5.2 | CDN y optimización de assets | Imágenes responsive, WebP, lazy loading de media |
| 5.3 | Bundle analysis | Reducir los 350KB gzipped — tree shaking, code splitting agresivo |
| 5.4 | i18n base | Preparar para multi-idioma si la comunidad crece |
| 5.5 | API pública | Endpoints para integraciones externas |
| 5.6 | App mobile nativa | Wrapper con Capacitor o React Native |

**Criterio de cierre:** Hosting moderno, bundle optimizado, preparado para crecer.

#### 3. Flujo de Trabajo por Sesión

Cada sesión de desarrollo sigue este ciclo:

```
1. Leer este plan (PLAN-GENERAL.md)
2. Identificar la etapa y tarea actual (marcar con [x] al completar)
3. Ejecutar la tarea
4. Documentar cambios en una nota de sesión (Documents/SESION-YYYY-MM-DD.md)
5. Actualizar el estado de la tarea en este plan
6. Commit + push
```

##### Registro de Sesiones

| Fecha | Etapa | Tareas | Nota |
|-------|-------|--------|------|
| 2026-04-23 | Planificación | Creación del plan general | Plan General |
| 2026-04-23 | E1 + E2 + E3 | E1 completa, E2 (4/6), E3 (1/6) | SESION-2026-04-23.md |

#### 4. Decisiones de Diseño Clave

1. **Supabase como backend único.** No se migra a otro BaaS. Se optimiza el uso de Supabase (Edge Functions, RLS, Realtime).
2. **Mobile-first.** La mayoría de los usuarios acceden desde celular. Toda feature se diseña para móvil primero.
3. **IA como herramienta, no como feature central.** La IA modera y genera contenido, pero la comunidad es el producto.
4. **Sin lock-in.** Si se migra hosting o se cambia algo, el código debe ser portable.
5. **Crecimiento orgánico.** No se over-engineere. Se construye lo que se necesita, no lo que podría necesitarse.

#### 5. Tecnologías Pendientes de Evaluar

| Tech | Uso potencial | Estado |
|------|--------------|--------|
| Sentry | Error tracking | Pendiente evaluar en Etapa 2 |
| Resend | Emails transaccionales | Pendiente evaluar en Etapa 3 |
| Meilisearch | Búsqueda full-text | Pendiente evaluar en Etapa 3 |
| Vercel | Hosting moderno | Pendiente evaluar en Etapa 5 |
| Capacitor | App nativa | Pendiente evaluar en Etapa 5 |

---

## SESIÓN 2026-04-23

### Sesión 2026-04-23 — Documentación Completa

**Fecha:** 23 de abril 2026, 20:41 — 21:32 GMT+8  
**Duración:** ~50 minutos  
**Resultado:** Etapa 1 completa, Etapa 2 (4/6), Etapa 3 (1/6)

#### Resumen Ejecutivo

Sesión de seguridad, DevOps y UX. Se transformó MejoraApp de un MVP con agujeros de seguridad a una app con:
- Todas las operaciones admin protegidas por Edge Functions
- Master password eliminada (redundante + insegura)
- 103 tests automatizados
- CI pipeline + rollback mechanism
- Búsqueda de contenido funcional

#### Etapa 1 — Seguridad ✅ COMPLETA (6/6)

##### 1.1 Código muerto eliminado
- **Archivo:** `src/services/ai.ts` (200 líneas) → ELIMINADO
- **Razón:** Servicio de IA client-side con ofuscación XOR. Nadie lo importaba. Las IAs ya funcionan 100% server-side via Edge Functions
- **Impacto:** Elimina superficie de ataque (API keys en localStorage).

##### 1.2 "Puntito secreto" reemplazado
- **Archivo:** `src/pages/Auth.tsx`
- **Antes:** Puntito de 2x2px invisible debajo del logo (security by obscurity)
- **Ahora:** Botón con icono Shield + texto "Admin" que se expande a "Modo admin"
- **Razón:** El acceso admin requiere credenciales válidas, no oscuridad.

##### 1.3 Edge Function `verify-admin`
- **Archivo:** `supabase/functions/verify-admin/index.ts`
- **Función:** Verifica el rol admin server-side usando `SUPABASE_SERVICE_ROLE_KEY`
- **Uso:** `AdminLoginForm.tsx` y `Admin.tsx` la invocan para verificar permisos
- **Ventaja:** La verificación de rol usa service_role key, no anon key.

##### 1.4 Edge Function `admin-action`
- **Archivo:** `supabase/functions/admin-action/index.ts`
- **Función:** Router de 13 acciones de escritura admin, todas server-side
- **Acciones:**
  - `update-profile` — Editar perfiles de usuario
  - `create-post` / `update-post-status` / `delete-post` — CRUD contenido
  - `create-category` — Crear categorías
  - `upsert-novedad` / `delete-novedad` — CRUD novedades
  - `moderate-post` / `moderate-comment` — Moderación de muro
  - `add-role` / `remove-role` — Gestión de roles admin

- **Hook:** `src/hooks/useAdminAction.ts` — reutilizable en todos los módulos

##### 1.5 Master password eliminada
- **Razón:** Redundante (ya hay Supabase Auth + rol admin) e insegura (SHA-256 sin salt)
- **Código eliminado:** `sha256()`, password dialog, verificación contra `admin_config`
- **BD limpiada:** Eliminados `master_password_hash`, `recovery_*` de `admin_config`
- **Reemplazado por:** Verificación server-side del rol admin via Edge Function

##### 1.6 RLS hardening
- **Script ejecutado:** `MIGRACION-SEGURIDAD-2026-04-23.sql` en Supabase Dashboard
- **Migración incremental:** `supabase/migrations/20260423210000_security_hardening.sql`
- **Cambios:**
  - Tabla `moderation_comments_log` creada con RLS (solo service_role)
  - Función `is_admin()` creada (SECURITY DEFINER, STABLE)
  - `admin_config`: cerrado a solo admins (antes lectura pública)
  - `profiles`: admin puede editar cualquier perfil
  - `user_roles`: solo admin gestiona roles
  - `content_posts`, `content_categories`, `novedades`: lectura pública, escritura solo admin

#### Etapa 2 — DevOps ⏳ (4/6)

##### 2.1 CI Workflow
- **Archivo:** `.github/workflows/ci.yml`
- **Trigger:** PRs a main, pushes a develop
- **Steps:** Install → Lint → Test (103) → Build
- **Resultado:** Tests se ejecutan automáticamente antes de merge

##### 2.2 Deploy mejorado
- **Archivo:** `.github/workflows/deploy.yml`
- **Mejoras:**
  - Tests se ejecutan ANTES del deploy
  - Health check post-deploy (verifica HTTP 200 en producción)
  - Deploy summary incluye razón y commit SHA
  - Input manual para razón de deploy

##### 2.3 Rollback workflow
- **Archivo:** `.github/workflows/rollback.yml`
- **Uso:** Deployar un commit específico (manual desde GitHub Actions)
- **Input:** commit SHA + razón
- **Incluye:** Health check post-rollback

##### 2.4 Tests automatizados (24 → 103)

| Archivo | Tests | Cubre |
|---------|-------|-------|
| security.test.ts | 15 | Session management, Edge Function validation, auth flow |
| diagnosticDeep.test.ts | 20 | Scoring, profiles, edge cases, WhatsApp, question quality |
| muro.test.ts | 22 | timeAgo, pagination, likes, moderation, content validation |
| authAndAdmin.test.ts | 22 | Rate limiting, admin sessions, action routing, content types |
| diagnosticData.test.ts | 18 | shuffle, detectarPerfil, PERFILES |
| utils.test.ts | 5 | cn utility |
| example.test.ts | 1 | placeholder |

##### 2.5 Migraciones SQL
- **12 archivos** en `supabase/migrations/` (11 existentes + 1 nueva)
- **Nueva:** `20260423210000_security_hardening.sql`
- **Sistema:** Migraciones incrementales reemplazan CLEAN_SETUP.sql monolítico

##### 2.6 Rama `develop`
- Creada para flujo de staging
- CI se ejecuta en pushes a develop

##### Pendiente Etapa 2
- 2.1 Staging: segundo proyecto Supabase (setup manual)
- 2.4 Monitoring: Sentry o similar (setup manual)

#### Etapa 3 — UX ⏳ (1/6)

##### 3.1 Búsqueda de contenido
- **Archivo:** `src/components/tabs/ContenidoDeValor.tsx`
- **Feature:** Input de búsqueda con icono Search
- **Filtrado:** Por título, resumen y contenido
- **Combinación:** Se integra con filtro de categoría existente
- **UX:** Clear button, empty state diferenciado, reset de página al buscar

#### Archivos modificados/creados

```
ELIMINADOS:
  src/services/ai.ts

NUEVOS:
  src/hooks/useAdminAction.ts
  supabase/functions/verify-admin/index.ts
  supabase/functions/admin-action/index.ts
  supabase/migrations/20260423210000_security_hardening.sql
  .github/workflows/ci.yml
  .github/workflows/rollback.yml
  .env.example
  src/test/security.test.ts
  src/test/diagnosticDeep.test.ts
  src/test/muro.test.ts
  src/test/authAndAdmin.test.ts

MODIFICADOS:
  src/pages/Auth.tsx
  src/pages/Admin.tsx
  src/components/auth/AdminLoginForm.tsx
  src/components/admin/AdminUsuarios.tsx
  src/components/admin/AdminSeguridad.tsx
  src/components/admin/AdminMuro.tsx
  src/components/admin/AdminNovedades.tsx
  src/components/admin/AdminContenido.tsx
  src/components/tabs/ContenidoDeValor.tsx
  .github/workflows/deploy.yml
  Documents/PLAN-GENERAL.md

DEPLOYADOS:
  verify-admin Edge Function
  admin-action Edge Function

EJECUTADOS:
  MIGRACION-SEGURIDAD-2026-04-23.sql en Supabase
```

#### Commits (13 total)

```
cdd774d docs: actualización final de sesión 2026-04-23
8e78e7f ci: workflow de CI + rama develop para staging
d56f4bd tests: 15 tests de seguridad para Etapa 1
482dce9 ci+tests: rollback workflow, health check, 64 nuevos tests
79bd7db db: migración de seguridad como archivo incremental
b2cd039 docs: plan actualizado — Etapa 2 (4/6), Etapa 1 completa
a4c880f feat: búsqueda de contenido en ContenidoDeValor
8026159 docs: plan — Etapa 3 (1/6), búsqueda completada
0dd0e8a security: Etapa 1 — verificación server-side, eliminar código muerto, hardening
fefbb7c security: eliminar master password, mejorar AdminSeguridad
d760447 security: todas las escrituras admin via Edge Function admin-action
482dce9 ci+tests: rollback workflow, health check, 64 nuevos tests
```

#### Arquitectura de seguridad FINAL

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (navegador)                    │
│                                                           │
│  Login → Supabase Auth → rol verificado                  │
│                                                           │
│  Lecturas → Supabase directo (RLS protegido)            │
│  Escrituras → useAdminAction() → Edge Function          │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                EDGE FUNCTIONS (Supabase)                  │
│                                                           │
│  verify-admin    → Verifica rol admin (service_role)     │
│  admin-action    → 13 acciones de escritura admin        │
│  moderate-post   → Moderación IA de posts                │
│  moderate-comment → Moderación IA de comentarios         │
│  generate-content → Generación IA de contenido           │
└─────────────────────────────────────────────────────────┘
```

#### Pendiente para próxima sesión

##### Crítico
- **Rotar tokens** compartidos en este chat (GitHub, Supabase, FTP)

##### Etapa 2
- 2.1 Staging: segundo proyecto Supabase + deploy a URL de prueba
- 2.4 Monitoring: Sentry o similar

##### Etapa 3
- 3.1 Notificaciones email (respuestas en muro, novedades)
- 3.3 Perfil de usuario completo (bio, avatar, empresa, links)
- 3.4 Onboarding mejorado
- 3.5 Diagnóstico: historial de resultados
- 3.6 Muro: editar/eliminar posts propios

##### Etapa 4
- 4.1 Analytics de uso
- 4.2 Categorías dinámicas desde admin
- 4.3 Contenido programado
- 4.4 Ranking de comunidad
- 4.5 Diagnóstico con IA
- 4.6 Exportar resultados a PDF

---

## MIGRACIÓN DE SEGURIDAD

### Migración de seguridad — 2026-04-23

**Requisito:** Ejecutar en Supabase Dashboard → SQL Editor  
**Prerrequisito:** Las 12 tablas base ya existen (CLEAN_SETUP.sql ejecutado previamente)

#### 1. Tabla moderation_comments_log

```sql
CREATE TABLE IF NOT EXISTS public.moderation_comments_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES public.wall_comments(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Propósito:** Registrar log de moderación de comentarios (solo service_role)

#### 2. Realtime habilitado en tablas críticas

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.wall_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wall_comments;
```

**Nota:** Fallará si ya están agregadas — ignorar errores

#### 3. RLS para moderation_comments_log

```sql
ALTER TABLE public.moderation_comments_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only for moderation_comments_log" ON public.moderation_comments_log;
CREATE POLICY "Service role only for moderation_comments_log"
  ON public.moderation_comments_log
  USING (false)
  WITH CHECK (false);
```

**Propósito:** Solo el service_role puede leer/escribir (Edge Functions)

#### 4. Función helper: is_admin()

```sql
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;
```

**Propósito:** Verificar si un usuario es admin (reutilizable en RLS policies)

#### 5. Políticas RLS mejoradas

##### profiles: lectura pública, escritura solo admin o propio perfil
```sql
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));
```

##### user_roles: solo admin puede gestionar
```sql
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
```

##### admin_config: solo admin puede leer y escribir
```sql
DROP POLICY IF EXISTS "Anyone can read admin config" ON public.admin_config;
DROP POLICY IF EXISTS "Only admins can read admin config" ON public.admin_config;
CREATE POLICY "Only admins can read admin config"
  ON public.admin_config FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can write admin config" ON public.admin_config;
CREATE POLICY "Only admins can write admin config"
  ON public.admin_config FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
```

##### content_posts: lectura pública, escritura solo admin
```sql
DROP POLICY IF EXISTS "Public can read content" ON public.content_posts;
CREATE POLICY "Public can read content"
  ON public.content_posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage content" ON public.content_posts;
CREATE POLICY "Admins can manage content"
  ON public.content_posts
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
```

##### content_categories: lectura pública, escritura solo admin
```sql
DROP POLICY IF EXISTS "Public can read categories" ON public.content_categories;
CREATE POLICY "Public can read categories"
  ON public.content_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.content_categories;
CREATE POLICY "Admins can manage categories"
  ON public.content_categories
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
```

##### novedades: lectura pública, escritura solo admin
```sql
DROP POLICY IF EXISTS "Public can read novedades" ON public.novedades;
CREATE POLICY "Public can read novedades"
  ON public.novedades FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage novedades" ON public.novedades;
CREATE POLICY "Admins can manage novedades"
  ON public.novedades
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
```

---

## RESUMEN FINAL

Esta documentación compilada incluye:

✅ **README:** Descripción general, stack, funcionalidades, estructura  
✅ **PLAN GENERAL:** Roadmap completo (Etapas 1-5), decisiones de diseño  
✅ **SESIÓN 2026-04-23:** Detalle de cambios, commits, archivos modificados  
✅ **MIGRACIÓN SEGURIDAD:** SQL completo para aplicar en Supabase  

**Próximos pasos:**
1. Rotar credenciales compartidas
2. Completar Etapa 2 (staging + monitoring)
3. Comenzar Etapa 3 (notificaciones, perfil de usuario)

---

*Compilado el 23 de abril 2026 — MejoraApp Documentación v1.0*
