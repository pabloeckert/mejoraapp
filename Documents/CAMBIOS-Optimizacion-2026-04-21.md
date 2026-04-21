# 🔧 Cambios y Optimizaciones — MejoraApp
## 21 de abril 2026 (sesión matutina)

---

## Resumen

Sesión de optimización del login, fix de Google OAuth, favicon personalizado, mejora del dark mode toggle, y configuración de deploy.

---

## 1. Login Screen — Optimización

### Problema
La versión desplegada en `app.mejoraok.com` mostraba una pantalla redundante:
- "Bienvenido a MejoraOK" + "Tu comunidad de emprendedores"
- Dos tarjetas informativas ("Conecta y crece", "Potencia con IA")
- Botón "Empieza ahora" + botón "Acceder como Administrador" grande
- Subtítulo "Ingresá a la comunidad de negocios" redundante con el título

### Solución (`src/pages/Auth.tsx`)
- Eliminado subtítulo redundante del Card
- Eliminado checkbox "Recordarme" innecesario
- Agregado toggle de visibilidad de contraseña (👁️ icon)
- Footer reducido a solo "🔒 Tu información es privada"
- Ancho del card reducido de `max-w-md` a `max-w-sm`

### Commits
- `addc479` — feat: optimize login screen

---

## 2. Botón Admin — Icono Discreto

### Problema
El botón "Acceder como Administrador" era un botón grande y visible en la landing page.

### Solución
- Reemplazado por un icono `🛡️` (Shield) en la esquina superior derecha
- Semi-transparente (`text-muted-foreground/20`)
- Visible al hover con transición suave
- Accesible: `aria-label="Admin"` + `title="Admin"`
- Link directo a `/admin`

```tsx
<a
  href="/admin"
  aria-label="Admin"
  title="Admin"
  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground/20 hover:text-primary hover:bg-primary/10 transition-all"
>
  <Shield className="w-3.5 h-3.5" />
</a>
```

---

## 3. Google OAuth — Fix Error 404

### Problema
Al clickear "Continuar con Google" se producía un error 404. El código usaba `lovable.auth.signInWithOAuth()` que depende del servicio de Lovable, no configurado para el dominio de producción.

### Solución
Cambiado de wrapper Lovable a Supabase nativo:

```tsx
// ANTES (roto)
const result = await lovable.auth.signInWithOAuth("google", {
  redirect_uri: window.location.origin,
});

// DESPUÉS (funciona)
const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: window.location.origin,
  },
});
```

### Requisito en Supabase
En **Authentication → URL Configuration**, agregar:
- `https://app.mejoraok.com` en **Redirect URLs**

### Commits
- `866a482` — feat: fix Google OAuth

---

## 4. Favicon Personalizado

### Cambio
- Logo MejoraOK subido como `public/favicon.png` (500×500)
- `index.html` actualizado para priorizar PNG sobre SVG:

```html
<link rel="icon" href="/favicon.png" type="image/png" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/favicon.png" />
```

### Archivos
- `public/favicon.png` — logo MejoraOK
- `public/favicon-custom.png` — copia original
- `public/favicon.svg` — fallback SVG existente

---

## 5. Dark Mode Toggle — Más Visible

### Problema
El botón de tema era un icono Ghost sin fondo, difícil de identificar.

### Solución (`src/components/AppHeader.tsx`)
- Agregado fondo redondeado: `bg-secondary/80 hover:bg-secondary`
- Colores distintivos por modo:
  - Dark → ☀️ amarillo (`text-yellow-400`)
  - Light → 🌙 azul (`text-mc-dark-blue`)
- Tooltips: "Modo claro" / "Modo oscuro"

---

## 6. SPA Routing — .htaccess

### Problema
Las rutas como `/admin`, `/auth`, `/reset-password` daban 404 en Hostinger (Apache).

### Solución
Creado `public/.htaccess` con:
- `RewriteRule` para SPA fallback a `index.html`
- Cache de assets estáticos (1 año)
- Compresión gzip

```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !\.[a-zA-Z0-9]{1,5}$
RewriteRule ^ index.html [L]
```

---

## 7. Lazy Loading & Skeleton Loading

### Estado: Ya implementado

| Componente | Skeleton | Lazy Images | Infinite Scroll |
|-----------|----------|-------------|-----------------|
| Muro | ✅ `PostSkeleton` | ✅ `loading="lazy"` | ✅ `IntersectionObserver` |
| Contenido | ✅ `PostSkeleton` | ✅ `loading="lazy"` | ❌ (paginación) |
| Novedades | ✅ `NovedadSkeleton` | ✅ `loading="lazy"` | ❌ (límite 20) |

---

## 8. Deploy Automático

### Pipeline (GitHub Actions)
```
Push a main → npm ci → npm run build (con secrets Supabase) → FTP deploy a public_html/app/
```

### Workflow: `.github/workflows/deploy.yml`
| Step | Acción |
|------|--------|
| Checkout | `actions/checkout@v4` |
| Setup Node | `node 22` con cache npm |
| Build | `npm run build` con env vars de secrets |
| Deploy | `SamKirkland/FTP-Deploy-Action@v4.3.6` |

### Secrets requeridos en GitHub
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `FTP_HOST` = `185.212.70.250`
- `FTP_USERNAME` = `u846064658.mejoraok.com`
- `FTP_PASSWORD`

---

## Commits de esta sesión

| Hash | Mensaje |
|------|---------|
| `addc479` | feat: optimize login screen - remove redundancies, subtle admin icon, add .htaccess |
| `866a482` | feat: custom favicon, fix Google OAuth, improve dark mode toggle |

---

*Documento generado automáticamente — MejoraApp 2026-04-21*
