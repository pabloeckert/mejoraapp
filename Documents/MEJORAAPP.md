# MEJORAAPP — Documentación Maestra

> **Proyecto:** MejoraApp — Comunidad de Líderes Empresariales
> **Stack:** React 18 · TypeScript · Vite 5 · Supabase · Tailwind CSS · shadcn/ui
> **Producción:** https://app.mejoraok.com
> **Repo:** https://github.com/pabloeckert/mejoraapp
> **Última actualización:** 2026-04-24

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
- Test interactivo con preguntas categorizadas y shuffle aleatorio
- Puntaje y perfil resultante con WhatsApp CTA
- Persistencia en `diagnostic_results` + localStorage para progreso

### 3.4 Novedades
- CRUD admin de noticias
- Publicación con fecha
- Imagen + enlace externo
- Sección estática de servicios (consultoría, eventos, CRM, contacto)

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

### 3.7 ProfileCompleteModal
- Modal que solicita empresa, cargo, WhatsApp
- Permite saltar ("Completar después")
- Se muestra si el perfil no tiene empresa ni cargo

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
- Rama `develop` creada
- Pendiente: segundo proyecto Supabase para staging real

---

## 5. Métricas

| Métrica | Valor |
|---------|-------|
| Líneas de código (TS/TSX) | ~11,900 |
| Archivos totales | 156 |
| Tests | 103 (100% passing) |
| Tablas DB | 13 |
| Edge Functions | 5 |
| Commits | 117+ |
| Bundle gzipped | ~350KB |
| Build time | ~4s |

---

## 6. Análisis UX (2026-04-24)

Auditoría completa desde 9 perspectivas de UX.

### 6.1 UX Designer
- ✅ Flujo de autenticación completo (email + Google + recuperación)
- ✅ Onboarding progresivo con skip
- ✅ Diagnóstico con persistencia en localStorage
- ⚠️ Dead end post-diagnóstico (solo link a WhatsApp, sin navegación a contenido)
- ⚠️ ProfileCompleteModal y Onboarding pueden chocar visualmente
- ⚠️ Loading states genéricos (mismo spinner para distintos contextos)

### 6.2 UI Designer
- ✅ Sistema de diseño consistente (shadcn/ui + Tailwind + tokens semánticos)
- ✅ Dark mode implementado
- ⚠️ Header con targets táctiles < 44×44px (recomendado: mínimo 44×44)
- ⚠️ Colores del diagnóstico no respetan dark mode (`bg-red-50` en dark = fondo blanco)
- ⚠️ Typography inconsistente (valores ad-hoc: 10px, 11px, 15px sin escala)
- ⚠️ Avatar genérico (no muestra iniciales ni foto)

### 6.3 UX Researcher
- ✅ Muro anónimo resuelve miedo real de exposición
- ✅ WhatsApp como canal CTA (dominante en Argentina)
- ⚠️ Sin métricas de social proof ("234 personas completaron el diagnóstico")
- ⚠️ Sin feedback loop visible para el usuario
- ⚠️ Shuffle de preguntas puede confundir al retomar

### 6.4 UX Writer / Content Designer
- ✅ Tono argentino auténtico ("¿Te animás?", "Completá")
- ✅ Microcopy con personalidad
- ⚠️ "Contenido de Valor" es largo para bottom nav
- ⚠️ Errores técnicos de Supabase se muestran raw al usuario
- ⚠️ Inconsistencia en voseo/tuteo
- ⚠️ "Novedades MC" es críptico para nuevos usuarios

### 6.5 Information Architect
- ✅ 4 tabs claros sin overlap
- ✅ Admin separado en /admin
- ⚠️ Tab default es siempre "Contenido" (debería ser dinámico)
- ⚠️ Secciones son silos (sin conexión entre diagnóstico → contenido → muro)
- ⚠️ Admin oculto como easter egg (puntito)

### 6.6 Interaction Designer
- ✅ Likes con feedback visual (fill + scale)
- ✅ Transiciones suaves en onboarding
- ✅ Enter para enviar comentario
- ⚠️ Sin pull-to-refresh en el muro
- ⚠️ Comentarios textarea de 36px (target pequeño)
- ⚠️ Sin feedback háptico en PWA
- ⚠️ Scroll position no se preserva al cambiar de tab

### 6.7 Service Designer
- ✅ Ecosistema integrado (diagnóstico → leads → contenido → comunidad → servicios)
- ✅ WhatsApp como puente omnicanal
- ⚠️ Sin onboarding del servicio (qué es Mejora Continua)
- ⚠️ Diagnóstico sin follow-up (no email, no recordatorio)
- ⚠️ Sin integración con CRM propio
- ⚠️ PWA sin push notifications

### 6.8 UX Strategist
- ✅ Nicho claro (comunidad empresarial argentina)
- ✅ Modelo de valor bilateral (usuario: contenido/comunidad, negocio: leads/ventas)
- ⚠️ Retención sin ganchos diarios
- ⚠️ Gamificación ausente (ironía: app de "mejora continua" sin métricas de mejora)
- ⚠️ Sin analytics para iterar

### 6.9 UX Manager / Head of UX

| Área | Nivel |
|---|---|
| Auth & onboarding | ⭐⭐⭐⭐ |
| Navegación | ⭐⭐⭐ |
| Contenido | ⭐⭐⭐ |
| Muro | ⭐⭐⭐⭐ |
| Diagnóstico | ⭐⭐⭐ |
| Admin | ⭐⭐ |
| PWA/Performance | ⭐⭐⭐ |
| Dark mode | ⭐⭐⭐ |

### Prioridades UX recomendadas

**Corto plazo (1-2 sem):**
1. Fix targets táctiles del header (44×44px)
2. Mapear errores técnicos a mensajes humanos
3. Secuenciar modales (onboarding → profile)
4. Dark mode audit (colores del diagnóstico)

**Medio plazo (1 mes):**
5. Post-diagnóstico → contenido relevante
6. Pull-to-refresh en el muro
7. Push notifications (Web Push API)
8. Email follow-up post-diagnóstico

**Largo plazo (2-3 meses):**
9. Gamificación (streaks, progreso)
10. Analytics (PostHog/Mixpanel)
11. Integración CRM
12. Tab default dinámico

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

### ETAPA 2 — Arquitectura y DevOps ⏳ (4/6)
- [x] 2.1 Sistema de migraciones SQL (12 archivos incrementales)
- [x] 2.2 Tests de integración (103 tests, 7 archivos)
- [x] 2.3 Estrategia de rollback (workflow + health check)
- [x] 2.4 PWA real (manifest + service worker network-first)
- [ ] 2.5 Entorno de staging (rama `develop` creada, pendiente segundo proyecto Supabase)
- [ ] 2.6 Monitoring y alertas (Sentry)

### ETAPA 3 — Experiencia de Usuario ⏳ (1/6)
- [x] 3.1 Búsqueda de contenido (por título, resumen, contenido)
- [ ] 3.2 Notificaciones email (respuestas en muro, novedades)
- [ ] 3.3 Perfil de usuario completo (bio, avatar, empresa, links)
- [ ] 3.4 Onboarding mejorado (tour interactivo)
- [ ] 3.5 Diagnóstico: historial de resultados
- [ ] 3.6 Muro: editar/eliminar posts propios

### ETAPA 4 — Contenido y Engagement (pendiente)
- [ ] 4.1 Analytics de uso (DAU, engagement por sección)
- [ ] 4.2 Sistema de categorías dinámico (admin CRUD)
- [ ] 4.3 Contenido programado (fecha de publicación futura)
- [ ] 4.4 Ranking de comunidad (top contributors, badges)
- [ ] 4.5 Diagnóstico con IA (análisis personalizado)
- [ ] 4.6 Exportar resultados a PDF

### ETAPA 5 — Escalamiento y Optimización (futuro)
- [ ] 5.1 Migrar hosting (Hostinger+FTP → Vercel/Cloudflare)
- [ ] 5.2 CDN y optimización de assets (WebP, responsive)
- [ ] 5.3 Bundle analysis (< 250KB gzipped)
- [ ] 5.4 i18n base (multi-idioma)
- [ ] 5.5 API pública (endpoints documentados)
- [ ] 5.6 App mobile nativa (Capacitor o React Native)

---

## 8. Decisiones de Diseño Clave

1. **Supabase como backend único** — No se migra a otro BaaS. Se optimiza el uso de Supabase.
2. **Mobile-first** — La mayoría accede desde celular. Toda feature se diseña para móvil primero.
3. **IA como herramienta** — Modera y genera, pero la comunidad es el producto.
4. **Sin lock-in** — Código portable. Si se migra algo, el código debe sobrevivir.
5. **Crecimiento orgánico** — Se construye lo que se necesita, no lo que podría necesitarse.

---

## 9. Tecnologías Pendientes de Evaluar

| Tech | Uso potencial | Estado |
|------|--------------|--------|
| Sentry | Error tracking | Pendiente (Etapa 2) |
| Plausible / PostHog | Analytics | Pendiente (Etapa 4) |
| Resend | Emails transaccionales | Pendiente (Etapa 3) |
| Meilisearch | Búsqueda full-text | Pendiente (Etapa 3) |
| Vercel | Hosting moderno | Pendiente (Etapa 5) |
| Capacitor | App nativa | Pendiente (Etapa 5) |

---

## 10. Registro de Sesiones

| Fecha | Resumen | Archivo |
|-------|---------|---------|
| 2026-04-15 | Setup inicial: React + Supabase + Auth + Muro + Admin | — |
| 2026-04-18 | Migraciones: comments, content media, profile fields, admin config | — |
| 2026-04-23 | E1 completa, E2 (4/6), E3 (1/6). 103 tests. CI/CD. | `SESION-2026-04-23.md` |
| 2026-04-24 | Auditoría UX (9 perspectivas). Consolidación de documentación. Optimización del plan. | Este documento |

---

## 11. Archivos del Proyecto en Documents/

| Archivo | Propósito |
|---------|-----------|
| `MEJORAAPP.md` | Este documento — fuente única de verdad |
| `MIGRACION-SEGURIDAD-2026-04-23.sql` | Script SQL de hardening de seguridad |
| `SESION-2026-04-23.md` | Detalle técnico de la sesión 2026-04-23 |

---

## 12. Instructivo de Deploy

### Automático (GitHub Actions)
Push a `main` → build automático → deploy a Hostinger via FTP.

### Manual (SmartFTP)
1. `npm run build`
2. Subir contenido de `dist/` a `/public_html/app/` en Hostinger

### Rollback
Desde GitHub Actions → workflow `rollback.yml` → especificar commit SHA + razón.

---

*Fuente única de verdad del proyecto. Se actualiza al decir "documentar" o al completar cada etapa.*
