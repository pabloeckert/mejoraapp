# 📋 Informe de Estado — MejoraApp
## 21 de abril de 2026

---

## 1. Información General

| Campo | Valor |
|-------|-------|
| **Nombre** | MejoraApp |
| **Repositorio** | https://github.com/pabloeckert/mejoraapp |
| **Producción** | https://app.mejoraok.com |
| **Hosting** | Hostinger (185.212.70.250) |
| **Stack** | React 18 + TypeScript + Vite 5 + Supabase + Tailwind CSS |
| **Total commits** | 116 |
| **Último commit** | `7d28d1d` — fix: regenera package-lock.json para CI |

---

## 2. Métricas del Código

| Métrica | Valor |
|---------|-------|
| **Archivos TS/TSX** | 92 |
| **Líneas de código** | 11,356 |
| **Tests** | 24 (100% passing) |
| **Bundle gzipped** | ~350KB |
| **Build time** | ~4 segundos |
| **Componentes UI** | 30+ (shadcn/ui) |

---

## 3. Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth + PostgreSQL + Edge Functions) |
| Base de datos | PostgreSQL con RLS |
| IA | Gemini + DeepSeek + Groq (rotación automática) |
| PWA | Instalable, service worker activo |
| Tests | Vitest |
| Deploy | GitHub Actions → GitHub Pages / FTP Hostinger |

---

## 4. Estructura de la Aplicación

### 4.1 Páginas (5, lazy-loaded)
- `/` — Index (4 tabs: Contenido, Diagnóstico, Muro, Novedades)
- `/auth` — Login/Registro con punto secreto para admin
- `/reset-password` — Recuperación de contraseña
- `/admin` — Panel admin (6 módulos)
- `*` — 404 NotFound

### 4.2 Módulos Admin (6)
1. **Contenido** — Gestión de artículos y categorías con soporte multimedia
2. **IA** — Configuración de proveedores (Gemini, DeepSeek, Groq)
3. **Novedades** — Noticias y eventos
4. **Muro** — Moderación de posts anónimos
5. **Usuarios** — Gestión de perfiles y roles
6. **Seguridad** — Configuración de seguridad

### 4.3 Servicio de IA
- Rotación automática entre 3 proveedores gratuitos
- API keys ofuscadas en localStorage (XOR + base64)
- Graceful fallback: si un proveedor falla (429/402/403), pasa al siguiente
- Auto-migración de keys en texto plano a formato ofuscado

### 4.4 Diagnóstico
- 15 preguntas sobre madurez empresarial
- 4 opciones por pregunta con scoring (1-5)
- Genera perfil estratégico basado en puntaje
- Resultados guardados en Supabase

---

## 5. Base de Datos (12 tablas)

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
| `admin_config` | Configuración admin (master password) |

---

## 6. Seguridad (implementada)

- ✅ ErrorBoundary global
- ✅ Contraseñas hasheadas (salted)
- ✅ Moderación de comentarios con IA
- ✅ Rate limiting
- ✅ API keys ofuscadas
- ✅ Master password con expiración (4h)
- ✅ Roles granulares (admin/moderator/user)
- ✅ RLS habilitado en Supabase
- ✅ `.env` removido del repositorio

---

## 7. Estado del Deploy

### 7.1 GitHub Actions
- ✅ Workflow configurado (`deploy.yml`)
- ✅ Build automático en push a `main`
- ✅ Deploy a GitHub Pages funcional
- ⚠️ DNS de `app.mejoraok.com` apunta a Hostinger, no a GitHub Pages

### 7.2 Hostinger
- ✅ Build local funcional (`npm run build`)
- ⚠️ FTP no accesible desde VPS (firewall bloquea conexión de datos)
- ✅ Manualmente subible via FileZilla desde PC local
- 📄 Instructivo disponible en `Documents/INSTRUCTIVO_DESPLIEGUE.md`

### 7.3 Build actual
- Generado el 21/04/2026
- 16 archivos en `dist/` (350KB gzipped)
- Listo para subir a `public_html`

---

## 8. Evolución Reciente (últimos 10 commits significativos)

| Commit | Descripción |
|--------|-------------|
| `7d28d1d` | fix: regenera package-lock.json para CI |
| `7fc36f9` | docs: Agregar Como_Funciona_MejoraApp.docx |
| `248bb29` | docs: Informe definitivo + instructivo |
| `7918607` | deploy: Configurar dominio app.mejoraok.com |
| `5d0033b` | security: Remove .env from git tracking |
| `0f5f250` | security+feat: ErrorBoundary, salted passwords, moderación |
| `826427f` | fix: Corrigió spinner infinito en `/index` |
| `f432641` | feat: Punto secreto en login para admin |
| `49eaec2` | feat: Registration con nombre/apellido + profile modal |
| `c54528a` | feat: Admin user management con edición de perfil |

---

## 9. Archivos en Documents/

| Archivo | Descripción |
|---------|-------------|
| `mejoraapp+2026-04-20.docx` | Informe integral de la aplicación |
| `Como_Funciona_MejoraApp.docx` | Arquitectura de despliegue |
| `INSTRUCTIVO_DESPLIEGUE.md` | Guía de deploy paso a paso |

---

## 10. Próximos Pasos Sugeridos

1. **Subir build a Hostinger** via FileZilla (instructivo en Documents)
2. **Verificar** que app.mejoraok.com carga la app correctamente
3. **Probar** los 4 tabs principales y el panel admin
4. **Configurar variables de entorno** en Supabase si la app no conecta
5. **Evaluar** migrar a GitHub Pages para deploy automático futuro

---

*Informe generado automáticamente — MejoraApp 2026*  
*Workspace: /root/.openclaw/workspace/mejoraapp*
