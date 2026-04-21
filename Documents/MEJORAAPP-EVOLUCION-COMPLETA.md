# MejoraApp — Evolución Completa
## Desde el minuto cero hasta 22 de abril 2026

**Repositorio:** https://github.com/pabloeckert/mejoraapp  
**Producción:** https://app.mejoraok.com  
**Hosting:** Hostinger (185.212.70.250)  
**Supabase:** pwiduojwgkaoxxuautkp  
**Stack:** React 18 + TypeScript + Vite 5 + Supabase + Tailwind CSS  

---

## 1. Qué es MejoraApp

MejoraApp es la aplicación digital del ecosistema **Mejora Continua** — una comunidad de negocios para líderes empresariales argentinos. Es una SPA (Single Page Application) construida con React que ofrece:

- 🔐 Autenticación completa (email/password + Google OAuth + recuperación)
- 📝 Muro anónimo con posts, likes, comentarios y moderación IA
- 📚 Contenido de valor con categorías y generación IA
- 🔍 Diagnóstico estratégico interactivo (15 preguntas)
- ⚙️ Panel admin con 6 módulos
- 🤖 IA multi-provider (Gemini, DeepSeek, Groq) con rotación automática
- 📱 PWA instalable
- 🌙 Dark mode

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui (30+ componentes) |
| Backend | Supabase (Auth + PostgreSQL + Edge Functions) |
| Base de datos | PostgreSQL con RLS (12 tablas) |
| IA | Gemini + DeepSeek + Groq (rotación automática) |
| PWA | Instalable, service worker activo |
| Tests | Vitest (24 tests, 100% passing) |
| Deploy | GitHub Actions → FTP Hostinger |

---

## 3. Estructura de la Aplicación

### 3.1 Páginas (5, lazy-loaded)
| Ruta | Descripción |
|------|-------------|
| `/` | Index — 4 tabs: Contenido, Diagnóstico, Muro, Novedades |
| `/auth` | Login/Registro + punto secreto admin |
| `/reset-password` | Recuperación de contraseña |
| `/admin` | Panel admin (6 módulos) |
| `*` | 404 NotFound |

### 3.2 Módulos Admin
1. **Contenido** — Gestión de artículos y categorías con soporte multimedia
2. **IA** — Configuración de proveedores (Gemini, DeepSeek, Groq)
3. **Novedades** — Noticias y eventos
4. **Muro** — Moderación de posts anónimos
5. **Usuarios** — Gestión de perfiles y roles
6. **Seguridad** — Master password, preguntas de recuperación, email de respaldo

### 3.3 Base de Datos (12 tablas)
| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfiles de usuario (nombre, apellido, cargo, empresa) |
| `user_roles` | Roles (admin, moderator, user) |
| `wall_posts` | Posts del muro anónimo |
| `wall_comments` | Comentarios con sistema de replies |
| `wall_likes` | Likes en posts |
| `content_categories` | Categorías de contenido |
| `content_posts` | Artículos con multimedia (imagen, video, PDF) |
| `content_guidelines` | Instrucciones IA por categoría |
| `novedades` | Noticias/eventos |
| `diagnostic_results` | Resultados del diagnóstico |
| `moderation_log` | Log de moderación IA |
| `admin_config` | Configuración admin (master password, recovery) |

---

## 4. Evolución Cronológica

### Fase 1: Creación inicial (con Lovable)
- App generada como proyecto Vite + React + shadcn/ui en Lovable.dev
- Stack base: React 18, TypeScript, Vite 5, Tailwind CSS
- Backend: Supabase (Auth + PostgreSQL + Edge Functions)
- 30+ componentes UI de shadcn/ui
- Sistema de tabs con lazy loading

### Fase 2: Funcionalidades core
- Sistema de autenticación completo (email/password + Google OAuth)
- Muro anónimo con posts, likes, comentarios
- Sistema de moderación de comentarios con IA
- Contenido de valor con categorías y multimedia
- Diagnóstico estratégico (15 preguntas, scoring 1-5)
- Panel admin con 6 módulos
- Servicio de IA multi-provider con rotación automática
- API keys ofuscadas (XOR + base64)
- Rate limiting

### Fase 3: Optimización de login y UX
- Eliminación de redundancias en pantalla de login
- Botón admin reemplazado por icono Shield discreto
- Toggle de visibilidad de contraseña
- Dark mode toggle mejorado
- Favicon personalizado (logo MejoraOK)

### Fase 4: Fix Google OAuth
- Cambiado de `lovable.auth.signInWithOAuth()` a `supabase.auth.signInWithOAuth()` nativo
- Requisito: agregar `https://app.mejoraok.com` en Redirect URLs de Supabase

### Fase 5: SPA Routing y Deploy
- Creado `.htaccess` con RewriteRule para SPA fallback
- Cache de assets estáticos (1 año) + compresión gzip
- GitHub Actions workflow configurado (`deploy.yml`)
- Deploy automático: push a main → build → FTP a Hostinger

### Fase 6: Seguridad y robustez
- ErrorBoundary global
- Contraseñas hasheadas con salt (SHA-256)
- Moderación de comentarios con IA
- Rate limiting
- Master password con expiración (4h)
- Roles granulares (admin/moderator/user)
- RLS habilitado en Supabase
- `.env` removido del repositorio

### Fase 7: Última sesión anterior (21 abril)
- Fix crítico: Supabase env var mismatch (`VITE_SUPABASE_ANON_KEY` → `VITE_SUPABASE_PUBLISHABLE_KEY`)
- Login unificado con admin integrado (puntito secreto)
- Panel admin simplificado (solo master password)
- Limpieza de meta tags y referencias obsoletas

### Fase 8: Deploy completo y nueva infraestructura (22 abril) ⭐

#### 8.1 Nuevo proyecto Supabase
- **Motivo:** Se eliminó el proyecto anterior y se creó uno nuevo desde cero
- **Proyecto:** `pwiduojwgkaoxxuautkp`
- **URL:** `https://pwiduojwgkaoxxuautkp.supabase.co`
- Se consolidaron las 12 migraciones SQL originales en un único script limpio (`CLEAN_SETUP.sql`)
- Se resolvieron conflictos de tablas duplicadas (admin_config, wall_comments)
- Se reordenaron las dependencias (has_role antes de las policies que lo referencian)

#### 8.2 GitHub Secrets configurados (6/6)
| Secret | Valor |
|--------|-------|
| `VITE_SUPABASE_URL` | `https://pwiduojwgkaoxxuautkp.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | (anon key del proyecto) |
| `VITE_SUPABASE_PROJECT_ID` | `pwiduojwgkaoxxuautkp` |
| `FTP_HOST` | `185.212.70.250` |
| `FTP_USERNAME` | `u846064658.mejoraok.com` |
| `FTP_PASSWORD` | (password FTP) |

Configurados vía GitHub API con encriptación NaCl (libsodium sealed box).

#### 8.3 Deploy a producción
- Build exitoso: 1785 módulos, ~3.66 segundos
- Deploy ejecutado via GitHub Actions (workflow_dispatch)
- **Resultado:** ✅ https://app.mejoraok.com → HTTP 200
- Deploy automático activado: cada push a `main` ejecuta build + FTP

#### 8.4 Base de datos preparada
- Script `CLEAN_SETUP.sql` generado (15 secciones, ~500 líneas)
- Incluye: 12 tablas, RLS, triggers, 4 categorías, 6 artículos de ejemplo
- Master password: `T@beg2301` (hasheada SHA-256)
- **Pendiente:** Ejecutar SQL en Supabase Dashboard → SQL Editor

---

## 5. Métricas Actuales

| Métrica | Valor |
|---------|-------|
| **Archivos TS/TSX** | 93 |
| **Líneas de código** | ~11,400 |
| **Tests** | 24 (100% passing) |
| **Bundle gzipped** | ~350KB |
| **Build time** | ~3.66 segundos |
| **Componentes UI** | 30+ (shadcn/ui) |
| **Total commits** | 117+ |
| **Tablas DB** | 12 |
| **Páginas** | 5 (lazy-loaded) |
| **Módulos admin** | 6 |

---

## 6. Seguridad Implementada

- ✅ ErrorBoundary global
- ✅ Contraseñas hasheadas con salt (SHA-256)
- ✅ Moderación de comentarios con IA
- ✅ Rate limiting
- ✅ API keys ofuscadas (XOR + base64)
- ✅ Master password con expiración (4h)
- ✅ Roles granulares (admin/moderator/user)
- ✅ RLS habilitado en Supabase
- ✅ `.env` removido del repositorio
- ✅ Preguntas de seguridad para recuperación
- ✅ Bloqueo temporal tras 5 intentos fallidos (30s)
- ✅ Hash migration automática (unsalted → salted)
- ✅ GitHub Secrets encriptados (NaCl)

---

## 7. Flujo de Deploy

### Automático (GitHub Actions)
```
Push a main → npm ci → npm run build (con secrets) → FTP a public_html/app/
```

### Manual (GitHub Actions - workflow_dispatch)
```
GitHub → Actions → Build & Deploy → Run workflow
```

### Manual (SmartFTP)
1. Conectar a `185.212.70.250:21` con credenciales FTP
2. Navegar a `/public_html/app`
3. Borrar archivos viejos
4. Subir TODO el contenido de `dist/` (~900KB, 35 archivos)
5. Verificar en https://app.mejoraok.com

### Secrets requeridos (GitHub)
| Secret | Descripción |
|--------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon key de Supabase |
| `VITE_SUPABASE_PROJECT_ID` | Project ID |
| `FTP_HOST` | IP del servidor Hostinger |
| `FTP_USERNAME` | Usuario FTP |
| `FTP_PASSWORD` | Password FTP |

---

## 8. Acceso Admin

1. Ir a https://app.mejoraok.com (redirige a `/auth`)
2. Debajo del logo hay un **puntito pequeño**
3. Click → se pone rojo y crece → form cambia a "Acceso Administrador"
4. Ingresar usuario y contraseña de admin
5. Click otra vez → vuelve al login normal

---

## 9. Setup de Base de Datos

### Archivo: `CLEAN_SETUP.sql`
Script consolidado que crea toda la estructura de BD de cero. Ejecutar una vez en:
**Supabase Dashboard → SQL Editor → New Query → Pegar → Run**

Contenido:
1. Funciones base (update_updated_at_column)
2. Roles (app_role enum + has_role function)
3. Profiles (con auto-creación en signup)
4. Diagnostic results
5. Wall posts + likes + comments (con counters automáticos)
6. Moderation log
7. Novedades
8. Content categories + posts + guidelines
9. Admin config
10. Datos iniciales (4 categorías + 6 artículos + master password)
11. Realtime subscriptions

---

## 10. Troubleshooting

| Síntoma | Causa probable | Solución |
|---------|---------------|----------|
| Pantalla en blanco | Env vars no inyectadas | Verificar GitHub Secrets configurados |
| 404 al refrescar | `.htaccess` no llegó | Confirmar que está en la raíz del hosting |
| Google OAuth da 404 | Redirect URL no configurada | Agregar `https://app.mejoraok.com` en Supabase → Auth → URL Configuration |
| Admin no acepta credenciales | BD no inicializada | Ejecutar `CLEAN_SETUP.sql` en Supabase |
| Cambios no aparecen | Cache | Hard refresh: `Ctrl+Shift+R` |
| Deploy no funciona | Secrets faltantes | Verificar los 6 secrets en GitHub → Settings → Secrets |

---

## 11. Archivos de Referencia

| Archivo | Descripción |
|---------|-------------|
| `mejoraapp+2026-04-20.docx` | Informe integral de la aplicación |
| `Como_Funciona_MejoraApp.docx` | Arquitectura de despliegue |
| `CLEAN_SETUP.sql` | Script SQL consolidado para setup de BD |
| `.github/workflows/deploy.yml` | Workflow de deploy automático |

---

## 12. Estado Actual (22 abril 2026)

### ✅ Completado
- App construida y funcional (11,400 líneas, 93 archivos)
- Nuevo proyecto Supabase creado (`pwiduojwgkaoxxuautkp`)
- GitHub Secrets configurados (6/6)
- Deploy automático activado (GitHub Actions → FTP)
- Sitio online: https://app.mejoraok.com (HTTP 200)
- Script de BD preparado (`CLEAN_SETUP.sql`)

### ✅ Completado (22 abril 2026 — sesión automatizada)
1. ~~Ejecutar `CLEAN_SETUP.sql` en Supabase Dashboard~~ → Ejecutado via Management API
2. ~~Configurar Google OAuth redirect URL~~ → Site URL + URI allow list configurados
3. ~~Admin config~~ → Tabla creada, master password `T@beg2301` hasheada, recovery questions configuradas
4. ~~Realtime~~ → Activado en wall_posts y wall_comments

### ⏳ En progreso
1. **Google OAuth** — ✅ Credenciales obtenidas (Client ID + Secret de Google Cloud Console). Pendiente: configurar provider en Supabase (requiere Access Token de Supabase o hacerlo manualmente en el Dashboard).
2. Rotar credenciales expuestas en sesiones (GitHub token, FTP password, Google Client Secret)
3. Asignar rol de admin a primer usuario registrado
4. Verificar flujo completo en producción

---

## 13. Sesión 22 abril 2026 — Configuración Google OAuth

### Credenciales obtenidas
- **Google Cloud Console** — Client ID y Client Secret generados para el proyecto
- **Subdominio** — `app.mejoraok.com` creado y funcionando
- **Infraestructura FTP** — Hostinger confirmada:
  - IP: `185.212.70.250`
  - Usuario: `u846064658.mejoraok.com`
  - Puerto: 21
  - Carpeta: `/home/u846064658/domains/mejoraok.com/public_html/app`

### Siguiente paso
- Configurar Google provider en Supabase (`pwiduojwgkaoxxuautkp`) con el Client ID y Secret
- Opciones:
  1. Vía Supabase Management API (requiere Access Token)
  2. Manual: Supabase Dashboard → Authentication → Providers → Google → pegar Client ID + Secret

### ⚠️ Seguridad
- Se emitieron advertencias de seguridad por credenciales compartidas en texto plano
- Se recomienda rotar: GitHub token, FTP password y Google Client Secret una vez completada la configuración

---

*Documento unificado — última actualización: 22 de abril 2026, 04:15 GMT+8*
