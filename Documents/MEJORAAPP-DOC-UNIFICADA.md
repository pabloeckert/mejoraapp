# MEJORAAPP — Documentación Técnica Unificada

> **Proyecto:** MejoraApp — Comunidad de Líderes Empresariales
> **Stack:** React 18 · TypeScript · Vite 5 · Supabase · Tailwind CSS · shadcn/ui
> **Producción:** https://app.mejoraok.com
> **Repo:** https://github.com/pabloeckert/mejoraapp
> **Última actualización:** 2026-04-24

---

## 1. Resumen Ejecutivo

MejoraApp es el MVP digital de **Mejora Continua**, comunidad de negocios para líderes empresariales argentinos. Funciona en producción con muro anónimo moderado por IA, contenido de valor, diagnóstico estratégico y panel admin.

**Estado actual:** App funcional con seguridad mejorada (Etapa 1 completa), DevOps parcial (Etapa 2 al 67%), y UX en progreso (Etapa 3 al 17%).

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
├── lib/                # utils.ts
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
| `admin_config` | Configuración admin (master password hash, recovery) | Solo admin |
| `moderation_log` | Log de moderación de posts | Solo admin (via service_role en Edge Function) |
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

**Cadena de fallback IA:** Gemini → Groq → OpenRouter (DeepSeek) → null (auto-aprobado)

### 2.4 Autenticación

- **Email/Password** via Supabase Auth
- **Google OAuth** configurado
- **Admin login:** Botón con icono Shield en pantalla de auth → usuario + contraseña master
- **Session management:** AuthContext con onAuthStateChange
- **Admin verification:** Session flag + re-verificación server-side via `verify-admin` Edge Function

### 2.5 PWA

- `manifest.json` configurado
- Service Worker con estrategia network-first
- Instalable en dispositivos móviles

---

## 3. Módulos Funcionales

### 3.1 Muro Anónimo
- Posts anónimos (máx. 500 chars)
- Likes con conteo denormalizado
- Comentarios (máx. 300 chars) con conteo denormalizado
- Moderación IA server-side antes de publicar
- Realtime: suscripción a inserts de posts y comentarios aprobados
- Infinite scroll con IntersectionObserver

### 3.2 Contenido de Valor
- 4 categorías: Tip, Estrategia, Reflexión, Noticia
- 4 tipos de contenido: article, video, infographic, book/PDF
- Búsqueda por título, resumen y contenido
- Generación IA desde panel admin

### 3.3 Diagnóstico Estratégico
- Test interactivo con preguntas categorizadas
- Puntaje y perfil resultante
- Persistencia en `diagnostic_results`

### 3.4 Novedades
- CRUD admin de noticias
- Publicación con fecha
- Imagen + enlace externo

### 3.5 Panel Admin (6 módulos)
- **Contenido:** CRUD de posts con tipos de media
- **IA:** Generación de contenido por categoría
- **Novedades:** Gestión de noticias
- **Muro:** Moderación de posts y comentarios
- **Usuarios:** Gestión de perfiles y roles
- **Seguridad:** Configuración de acceso y auditoría

---

## 4. Estado del Plan de Desarrollo

### ETAPA 1 — Seguridad y Estabilización ✅ COMPLETA
- [x] 1.1 Rotar credenciales expuestas
- [x] 1.2 Mover lógica admin a Edge Functions
- [x] 1.3 RLS admin_config seguro
- [x] 1.4 Eliminar "puntito secreto"
- [x] 1.5 Auditoría de RLS policies
- [x] 1.6 Revisar ofuscación de API keys

### ETAPA 2 — Arquitectura y DevOps (4/6)
- [x] 2.1 Sistema de migraciones SQL
- [x] 2.2 Tests de integración (103 tests)
- [x] 2.3 Estrategia de rollback
- [x] 2.4 PWA real
- [ ] 2.5 Entorno de staging (rama `develop` creada, pendiente segundo proyecto Supabase)
- [ ] 2.6 Monitoring y alertas (Sentry)

### ETAPA 3 — Experiencia de Usuario (1/6)
- [x] 3.1 Búsqueda de contenido
- [ ] 3.2 Notificaciones email
- [ ] 3.3 Perfil de usuario completo
- [ ] 3.4 Onboarding mejorado
- [ ] 3.5 Diagnóstico: historial
- [ ] 3.6 Muro: editar/eliminar posts propios

### ETAPA 4 — Contenido y Engagement (pendiente)
### ETAPA 5 — Escalamiento y Optimización (pendiente)

---

## 5. Despliegue

### Producción (actual)
- **Host:** Hostinger via FTP
- **Dominio:** app.mejoraok.com (subdominio creado)
- **FTP:** ftp://185.212.70.250 → /home/u846064658/domains/mejoraok.com/public_html/app
- **CI/CD:** GitHub Actions → build → deploy FTP automático a main
- **Rollback:** Workflow `rollback.yml` + health check post-deploy

### Build
```bash
npm install
npm run dev       # Dev: http://localhost:8080
npm run build     # Producción: dist/
npm run test      # Tests: vitest run
npm run lint      # Lint: eslint
```

---

## 6. Base de Datos — Schema Completo

### profiles
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | gen_random_uuid() |
| user_id | UUID FK → auth.users | UNIQUE, CASCADE delete |
| display_name | TEXT | |
| avatar_url | TEXT | |
| phone | TEXT | |
| empresa | TEXT | |
| nombre | TEXT | |
| apellido | TEXT | |
| cargo | TEXT | |
| email | TEXT | |
| has_completed_diagnostic | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | auto-update trigger |

### wall_posts
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| user_id | UUID NOT NULL | Sin FK (anon) |
| content | TEXT NOT NULL | |
| status | TEXT | CHECK: approved/rejected/pending |
| likes_count | INTEGER | DEFAULT 0, trigger-synced |
| comments_count | INTEGER | DEFAULT 0, trigger-synced |
| created_at | TIMESTAMPTZ | |

### wall_comments
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| post_id | UUID FK → wall_posts | CASCADE delete |
| user_id | UUID NOT NULL | |
| content | TEXT NOT NULL | |
| status | TEXT | CHECK: approved/rejected/pending |
| created_at | TIMESTAMPTZ | |

### content_posts
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| category_id | UUID FK → content_categories | SET NULL on delete |
| titulo | TEXT NOT NULL | |
| contenido | TEXT NOT NULL | |
| fuente | TEXT | DEFAULT 'ia' |
| estado | TEXT | DEFAULT 'publicado' |
| content_type | TEXT | CHECK: article/video/infographic/book |
| imagen_url | TEXT | |
| video_url | TEXT | |
| pdf_url | TEXT | |
| resumen | TEXT | |
| created_by | UUID | |
| published_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### content_categories, content_guidelines, novedades, user_roles, admin_config, diagnostic_results, wall_likes, moderation_log, moderation_comments_log — ver migraciones para detalle completo.

---

## 7. Edge Functions — Detalle

### moderate-post
- **Input:** `{ content: string }`
- **Proceso:** Rate limit (3/min) → IA moderation → Insert → Log
- **Output:** `{ success: true, post_id }` o `{ rejected: true, reason }`
- **Fallback IA:** Gemini → Groq → OpenRouter → auto-approve

### moderate-comment
- **Input:** `{ post_id: string, content: string }`
- **Proceso:** Rate limit (10/min) → IA moderation → Insert → Log
- **Output:** `{ success: true, comment }` o `{ rejected: true, reason }`

### admin-action
- **Input:** `{ action: string, ...params }`
- **13 acciones:** update-profile, create-post, update-post-status, delete-post, create-category, upsert-novedad, delete-novedad, moderate-post, moderate-comment, add-role, remove-role
- **Auth:** JWT + verificación admin via service_role

### verify-admin
- **Input:** JWT en header
- **Output:** `{ authorized: boolean, user_id, email, role }`

### generate-content
- **Input:** `{ category: string, guidelines?: string }`
- **Output:** `{ titulo, contenido, resumen }` (JSON)
- **Providers:** Gemini → Groq

---

## 8. Métricas

| Métrica | Valor |
|---------|-------|
| Líneas de código (TS/TSX) | ~11,900 |
| Archivos totales | 156 |
| Tests | 103 |
| Tablas DB | 12+ |
| Edge Functions | 5 |
| Commits | 117+ |
| Bundle gzipped | ~350KB |
| Build time | ~4s |

---

## 9. Decisiones de Diseño

1. **Supabase como backend único** — No se migra a otro BaaS
2. **Mobile-first** — La mayoría accede desde celular
3. **IA como herramienta** — Modera y genera, pero la comunidad es el producto
4. **Sin lock-in** — Código portable
5. **Crecimiento orgánico** — Se construye lo que se necesita

---

## 10. Registro de Sesiones

| Fecha | Resumen |
|-------|---------|
| 2026-04-15 | Setup inicial: React + Supabase + Auth + Muro + Admin |
| 2026-04-18 | Migraciones: comments, content media, profile fields, admin config |
| 2026-04-23 | E1 completa, E2 (4/6), E3 (1/6). 103 tests. CI/CD. |
| 2026-04-24 | Auditoría técnica. Consolidación de documentación. Optimización del plan. |

---

*Este documento es la fuente única de verdad del proyecto. Se actualiza con cada cambio significativo.*
