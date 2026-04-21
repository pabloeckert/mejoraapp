# MejoraApp — Evolución Completa
## Desde el minuto cero hasta 21 de abril 2026

**Repositorio:** https://github.com/pabloeckert/mejoraapp  
**Producción:** https://app.mejoraok.com  
**Hosting:** Hostinger (185.212.70.250)  
**Stack:** React 18 + TypeScript + Vite 5 + Supabase + Tailwind CSS  
**Último commit:** `eaf374c` — fix: critical Supabase env var mismatch + unified admin login flow

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
- Integración con Lovable auth wrapper (`@lovable.dev/cloud-auth-js`)
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
- Footer simplificado
- Dark mode toggle mejorado (colores distintivos por modo)
- Favicon personalizado (logo MejoraOK)

### Fase 4: Fix Google OAuth
- **Problema:** Error 404 al clickear "Continuar con Google"
- **Causa:** Se usaba `lovable.auth.signInWithOAuth()` que depende del servicio de Lovable
- **Solución:** Cambiado a `supabase.auth.signInWithOAuth()` nativo
- Requisito: agregar `https://app.mejoraok.com` en Redirect URLs de Supabase

### Fase 5: SPA Routing y Deploy
- Creado `.htaccess` con RewriteRule para SPA fallback
- Cache de assets estáticos (1 año)
- Compresión gzip
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
- Preguntas de seguridad para recuperación de admin
- Email de respaldo para recuperación

### Fase 7: Documentación
- Informe integral de la aplicación (`mejoraapp+2026-04-20.docx`)
- Arquitectura de despliegue (`Como_Funciona_MejoraApp.docx`)
- Instructivo de deploy paso a paso
- Instructivo de despliegue sin conocimientos técnicos

### Fase 8: Última sesión (21 abril 2026 — noche) ⭐

#### 8.1 Fix crítico: Error de Supabase
- **Error:** `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: missing OAuth secret"}`
- **Síntoma en browser:** `Missing required Supabase environment variables`
- **Causa raíz:** El `.env` tenía `VITE_SUPABASE_ANON_KEY` pero el código buscaba `VITE_SUPABASE_PUBLISHABLE_KEY` — nombres diferentes, Supabase recibía `undefined`
- **Solución:** Corregido el nombre de variable + mejor manejo en `client.ts` (ya no crashea si falta, loggea cuál falta)

#### 8.2 Login unificado con admin integrado
- **ANTES:** Botón "Admin Login" grande + ruta `/admin-login` separada + 3 pantallas
- **AHORA:** Un solo flujo en `/auth`:
  - Login normal: email + contraseña + Google OAuth
  - El puntito debajo del logo (ya existía como link a `/admin`) ahora es interactivo:
    - Click → el MISMO form cambia a modo admin (usuario + contraseña de admin)
    - Click otra vez → vuelve al login normal
    - Visual: puntito se pone rojo y crece (`scale-150`) cuando está en modo admin
  - Componente nuevo: `AdminLoginForm.tsx`
  - Ya no existe ruta `/admin-login`

#### 8.3 Admin panel simplificado
- **ANTES:** Necesitabas auth Supabase + rol admin + master password (3 capas)
- **AHORA:** Solo verificación de master password (usuario + contraseña de admin_config)
  - El AdminLoginForm verifica contra la tabla `admin_config` en Supabase
  - Hash salted SHA-256 con migración automática de legacy unsalted
  - Session válida por 4 horas en sessionStorage
  - Si no está desbloqueado, redirige a `/auth`
- `AdminGate.tsx` queda como código legacy (no se usa más)

#### 8.4 Limpieza
- Eliminada referencia a `@Lovable` en meta tags de Twitter
- Supabase client con manejo graceful (no crashea si faltan env vars)
- `.htaccess` optimizado (SPA routing + cache + gzip)

#### 8.5 Deploy
- Build exitoso: 35 archivos, ~900KB total
- Build time: ~4 segundos
- Código commiteado y pusheado a GitHub (`eaf374c`)
- **Pendiente:** Subir a Hostinger via SmartFTP (instructivo preparado)

---

## 5. Métricas Actuales

| Métrica | Valor |
|---------|-------|
| **Archivos TS/TSX** | 93 |
| **Líneas de código** | ~11,400 |
| **Tests** | 24 (100% passing) |
| **Bundle gzipped** | ~350KB |
| **Build time** | ~4 segundos |
| **Componentes UI** | 30+ (shadcn/ui) |
| **Total commits** | 117 |
| **Tablas DB** | 12 |
| **Páginas** | 5 (lazy-loaded) |
| **Módulos admin** | 6 |

---

## 6. Seguridad Implementada

- ✅ ErrorBoundary global (no crashea la app entera)
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

---

## 7. Flujo de Deploy

### Automático (GitHub Actions)
```
Push a main → npm ci → npm run build (con secrets) → FTP a public_html/app/
```

### Manual (SmartFTP)
1. Conectar a `185.212.70.250:21` con credenciales FTP
2. Navegar a `/public_html/app`
3. Borrar archivos viejos
4. Subir TODO el contenido de `dist/` (~900KB, 35 archivos)
5. Verificar en https://app.mejoraok.com

### Secrets requeridos (GitHub)
| Secret | Valor |
|--------|-------|
| `VITE_SUPABASE_URL` | `https://7uqmgyuhqfurvirmcqnj.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | (anon key de Supabase) |
| `FTP_HOST` | `185.212.70.250` |
| `FTP_USERNAME` | `u846064658.mejoraok.com` |
| `FTP_PASSWORD` | (password FTP) |

---

## 8. Acceso Admin

1. Ir a https://app.mejoraok.com (redirige a `/auth`)
2. Debajo del logo de "Mejora Continua — Comunidad de Negocios" hay un **puntito pequeño**
3. Click en el puntito → se pone rojo y crece → el form cambia a "Acceso Administrador"
4. Ingresar usuario y contraseña de admin
5. Click en el puntito otra vez → vuelve al login normal de usuario

---

## 9. Troubleshooting

| Síntoma | Causa probable | Solución |
|---------|---------------|----------|
| Pantalla en blanco + error Supabase en consola | Env vars no inyectadas | Verificar `.env` tiene `VITE_SUPABASE_PUBLISHABLE_KEY` (no `ANON_KEY`) |
| 404 al refrescar `/auth` o `/admin` | `.htaccess` no llegó | Confirmar que `.htaccess` está en la raíz del hosting |
| Google OAuth da 404 | Redirect URL no configurada | Agregar `https://app.mejoraok.com` en Supabase → Auth → URL Configuration |
| Puntito admin no hace nada | JS no cargó | Hard refresh `Ctrl+Shift+R`, verificar consola del navegador |
| Admin no acepta credenciales | Master password no configurada | Configurar desde Seguridad del panel admin |
| Cambios no aparecen | Cache | Hard refresh: `Ctrl+Shift+R` (Win) / `Cmd+Shift+R` (Mac) |

---

## 10. Commits Significativos

| Hash | Fecha | Descripción |
|------|-------|-------------|
| `eaf374c` | 21/04 | fix: Supabase env var mismatch + unified admin login |
| `7d28d1d` | 21/04 | fix: regenera package-lock.json para CI |
| `7918607` | 21/04 | deploy: Configurar dominio app.mejoraok.com |
| `5d0033b` | 21/04 | security: Remove .env from git tracking |
| `0f5f250` | 20/04 | security+feat: ErrorBoundary, salted passwords, moderación |
| `826427f` | 20/04 | fix: Corrigió spinner infinito en `/index` |
| `f432641` | 20/04 | feat: Punto secreto en login para admin |
| `866a482` | 19/04 | feat: fix Google OAuth, custom favicon, dark mode |
| `addc479` | 19/04 | feat: optimize login screen, .htaccess |
| `49eaec2` | 19/04 | feat: Registration con nombre/apellido + profile modal |
| `c54528a` | 19/04 | feat: Admin user management |

---

## 11. Archivos de Referencia

| Archivo | Descripción |
|---------|-------------|
| `mejoraapp+2026-04-20.docx` | Informe integral de la aplicación |
| `Como_Funciona_MejoraApp.docx` | Arquitectura de despliegue |

---

## 12. Pendientes / Próximos Pasos

1. **Subir build a Hostinger** via SmartFTP (instructivo preparado)
2. **Rotar GitHub token** (fue usado en esta sesión)
3. **Verificar** que app.mejoraok.com carga correctamente
4. **Probar** flujo completo: login usuario + login admin + panel admin
5. **Evaluar** si AdminGate.tsx se puede eliminar (código huérfano)

---

*Documento unificado — generado 21 de abril 2026*  
*Reemplaza: INFORME_ESTADO_2026-04-21.md, CAMBIOS-Optimizacion-2026-04-21.md*
