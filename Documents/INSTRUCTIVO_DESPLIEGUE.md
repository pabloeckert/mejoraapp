# 🚀 Despliegue MejoraApp → app.mejoraok.com

**Última actualización:** 21 abril 2026  
**Modo:** Deploy automático vía GitHub Actions + FTP

---

## 1️⃣ Configurar GitHub Secrets (una sola vez)

Andá a tu repo en GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Cargá estos 6 secrets:

| Nombre | Valor | Dónde sacarlo |
|---|---|---|
| `FTP_HOST` | `185.212.70.250` | Hostinger → Files → FTP Accounts |
| `FTP_USERNAME` | `u846064658.mejoraok.com` | Hostinger → Files → FTP Accounts |
| `FTP_PASSWORD` | (nueva password FTP) | Hostinger → Files → FTP → Change password |
| `VITE_SUPABASE_URL` | `https://bjapgdlsqhmwspavwrke.supabase.co` | Lovable → archivo `.env` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGc...` | Lovable → archivo `.env` |
| `VITE_SUPABASE_PROJECT_ID` | `bjapgdlsqhmwspavwrke` | Lovable → archivo `.env` |

> ⚠️ **CRÍTICO**: Si la password FTP fue compartida en chat alguna vez (incluido este chat), **cambiala antes** desde el panel de Hostinger. Subí solo la nueva.

---

## 2️⃣ ¿Cómo se dispara el deploy?

El workflow `.github/workflows/deploy.yml` corre automáticamente cuando:

- **Hacés `push` a la rama `main`** (Lovable hace push automático cada vez que guardás cambios desde el editor).
- O lo disparás **manualmente** desde **Actions** → "Build & Deploy to Hostinger (FTP)" → **Run workflow**.

Tiempo total: ~2-4 minutos por deploy.

---

## 3️⃣ Qué hace el workflow paso a paso

1. Clona el repo desde GitHub.
2. Instala Node 22 + dependencias (`npm ci`).
3. Compila la app de producción (`npm run build`) inyectando los `VITE_*`.
4. Verifica que `dist/index.html` exista y reporta el tamaño del build.
5. Sube `dist/` por FTP a `/public_html/app/` en Hostinger.
6. Imprime un resumen con commit, branch y status.

---

## 4️⃣ Verificar después del deploy

1. Andá a **https://app.mejoraok.com** → debería abrir tu app, no la página por defecto de Hostinger.
2. Probá refrescar `https://app.mejoraok.com/auth` y `/admin` → no deberían dar 404 (gracias al `.htaccess` en `public/`).
3. Si los assets cargan mal, revisá que el `<base href>` de `index.html` sea `/`.

---

## 5️⃣ Acceso al panel admin

- En la pantalla de login (`/auth`) hay un **punto azul pequeño justo debajo del logo "Comunidad de Negocios"**. Es discreto pero visible. Tocalo.
- Te lleva a `/admin` donde te pide **usuario + contraseña**.
- **Credenciales por defecto:**
  - Usuario: `admin`
  - Contraseña: `T@beg2301`
- **Cambialas inmediatamente** desde la pestaña **Seguridad** del panel.

---

## 6️⃣ Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| Workflow falla con `530 login authentication failed` | Password FTP cambió o secret mal cargado | Verificar `FTP_PASSWORD` en GitHub Secrets |
| Workflow falla en `npm run build` | Falta env var `VITE_*` | Verificar los 3 secrets `VITE_*` |
| Workflow OK pero 404 al refrescar `/auth` | `.htaccess` no llegó | Confirmar que `public/.htaccess` existe en repo y se subió |
| Dominio sigue mostrando default Hostinger | DNS o folder vacío | En Hostinger verificar que `app.` apunte a `/public_html/app` |
| Cambios no aparecen | Cache navegador | Hard refresh: `Ctrl+Shift+R` (Win) / `Cmd+Shift+R` (Mac) |
| Olvidaste contraseña admin | — | Usar "¿Olvidaste la contraseña?" en `/admin` con preguntas de seguridad |

---

## 7️⃣ Rotación de credenciales (cuando se filtran)

1. Hostinger → Files → FTP Accounts → **Change password**
2. GitHub repo → Settings → Secrets → Actions → **Update** `FTP_PASSWORD`
3. Disparar workflow manualmente para verificar.

---

## 8️⃣ Plan B: Deploy manual (si Actions falla)

Si por alguna razón no podés usar Actions:

1. En tu compu local: clonar repo, `npm install`, `npm run build`.
2. Abrir FileZilla, conectar con los datos FTP.
3. Subir el contenido de `dist/` a `/public_html/app/` (sobrescribir).

> Esto es más lento y propenso a errores; usalo solo como respaldo.
