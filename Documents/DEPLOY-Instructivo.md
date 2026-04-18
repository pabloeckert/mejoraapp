# MejoraApp — Instructivo de Deploy en Hostinger

**Última actualización:** 19 Abril 2026

---

## MÉTODO 1: Subir desde tu PC (File Manager de hPanel)

Este es el método más confiable. Son 10 minutos una vez y después es automático.

### Paso 1: Descargar el código desde GitHub

**Opción A — Descargar ZIP (más fácil):**
1. Abrí este enlace en tu navegador:
   ```
   https://github.com/pabloeckert/mejoraapp/archive/refs/heads/main.zip
   ```
2. Se descarga un archivo `mejoraapp-main.zip`
3. Extraelo en tu PC (doble clic → Extraer)
4. Vas a tener una carpeta `mejoraapp-main/`

**Opción B — Con Git (si tenés Git instalado):**
```bash
git clone https://github.com/pabloeckert/mejoraapp.git
```

### Paso 2: Instalar dependencias y hacer el build

Necesitás **Node.js** instalado en tu PC (https://nodejs.org — versión 18 o superior).

1. Abrí una terminal/consola en la carpeta del proyecto
2. Ejecutá estos comandos:

```bash
cd mejoraapp
npm install
npm run build
```

3. Se crea una carpeta `dist/` con los archivos listos para producción

> **Alternativa sin instalar nada:** Si no querés instalar Node.js, pedime que genere el zip listo y te lo paso.

### Paso 3: Crear el subdominio en hPanel

1. Entrá a [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Menú → **Dominios** → **Subdominios**
3. Hacé clic en **"Crear subdominio"**
4. Completá:
   - **Nombre del subdominio:** `app`
   - **Dominio:** `mejoraok.com`
   - **Carpeta raíz:** dejar la que sugiere (ej: `public_html/app.mejoraok.com`)
5. Hacé clic en **"Crear"**
6. Esperá unos segundos a que se genere el SSL automáticamente

### Paso 4: Comprimir la carpeta dist/

En tu PC, comprimí la carpeta `dist/` como ZIP:
- **Windows:** Clic derecho en `dist/` → Enviar a → Carpeta comprimida
- **Mac:** Clic derecho en `dist/` → Comprimir "dist"
- **Linux:** `cd mejoraapp && zip -r mejoraapp-dist.zip dist/`

Te queda un archivo `mejoraapp-dist.zip`

### Paso 5: Subir a Hostinger por File Manager

1. En hPanel → **Archivos** → **Administrador de archivos**
2. Navegá a la carpeta del subdominio:
   ```
   domains/app.mejoraok.com/public_html/
   ```
   _(o la carpeta que te creó en el Paso 3)_
3. Hacé clic en el botón **"Subir"** (arriba a la derecha)
4. Seleccioná el archivo `mejoraapp-dist.zip`
5. Esperá a que termine la subida

### Paso 6: Extraer el ZIP

1. En el Administrador de archivos, buscá `mejoraapp-dist.zip`
2. Clic derecho sobre el archivo → **"Extraer"**
3. Confirmá la extracción
4. **Importante:** Verificá que `index.html` quede en la RAÍZ de la carpeta del subdominio, no dentro de una subcarpeta `dist/`
   - Si quedó en `dist/`, seleccioná todo el contenido de `dist/` y movelo un nivel arriba

### Paso 7: Configurar el .htaccess

1. En la raíz de la carpeta del subdominio, buscá si ya existe un archivo `.htaccess`
2. Si no existe, hacé clic en **"Nuevo archivo"** → nombralo `.htaccess`
3. Pegá este contenido:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

4. Guardá el archivo

### Paso 8: Verificar

1. Abrí en tu navegador: **https://app.mejoraok.com**
2. Verificá que la app carga
3. Probá las distintas secciones (Muro, Contenido, Diagnóstico)
4. Si todo funciona: **¡Listo! 🎉**

### Solución de problemas

| Problema | Solución |
|---|---|
| Página en blanco | Abrí DevTools (F12) → Console y verificá errores |
| 404 en rutas internas | Verificá que el `.htaccess` esté correcto |
| Assets no cargan (404 en .js/.css) | Verificá que la carpeta `assets/` se extrajo bien |
| SSL no funciona | Andá a hPanel → SSL y forzá la activación para el subdominio |

---

## MÉTODO 2: Deploy automático desde GitHub a Hostinger

Este método configura un pipeline que, cada vez que hacés cambios en GitHub, automáticamente sube los archivos a Hostinger.

### Requisito previo

El FTP de Hostinger no funciona desde servidores externos (el canal de datos está bloqueado). Para automatizar el deploy, necesitamos usar un **script de deploy que se ejecute en tu propia PC**.

### Opción A: Script de deploy local

1. Creá un archivo `deploy.sh` en la raíz del proyecto:

```bash
#!/bin/bash
# deploy.sh — Deploy MejoraApp a Hostinger

echo "📦 Building..."
npm run build

echo "📁 Preparing zip..."
cd dist
zip -r ../mejoraapp-dist.zip .
cd ..

echo "✅ Build ready: mejoraapp-dist.zip"
echo ""
echo "📋 Próximos pasos:"
echo "1. Abrí hPanel → Administrador de archivos"
echo "2. Navegá a domains/app.mejoraok.com/public_html/"
echo "3. Subí mejoraapp-dist.zip"
echo "4. Extraé el zip"
echo "5. ¡Listo!"
```

2. Hacelo ejecutable: `chmod +x deploy.sh`
3. Ejecutalo: `./deploy.sh`

### Opción B: Deploy automático completo (con Vercel — RECOMENDADA)

Vercel es gratis, deploya automáticamente desde GitHub, y te da una URL como `mejoraapp.vercel.app`. Después podés configurar tu dominio `app.mejoraok.com` para que apunte ahí.

**Ventajas:**
- Deploy automático en cada `git push`
- SSL incluido
- CDN global (más rápido que Hostinger)
- Gratis para siempre
- Sin problemas de FTP

**Pasos:**

1. Creá una cuenta en [vercel.com](https://vercel.com) (podés entrar con GitHub)
2. Hacé clic en **"Add New..."** → **"Project"**
3. Seleccioná el repo `pabloeckert/mejoraapp`
4. Vercel detecta automáticamente que es un proyecto Vite
5. Hacé clic en **"Deploy"**
6. ¡En 30 segundos tu app está online!

**Para usar tu dominio `app.mejoraok.com`:**

1. En Vercel → tu proyecto → **Settings** → **Domains**
2. Agregá `app.mejoraok.com`
3. Vercel te da los registros DNS que necesitás configurar
4. En hPanel → **DNS / Zona DNS** → agregá los registros que te indicó Vercel
5. Listo — `app.mejoraok.com` apunta a Vercel con SSL automático

### Opción C: Deploy automático completo (con Netlify)

Similar a Vercel:

1. Creá cuenta en [netlify.com](https://www.netlify.com/)
2. **"Add new site"** → **"Import an existing project"**
3. Conectá GitHub → seleccioná `pabloeckert/mejoraapp`
4. Configurá:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Hacé clic en **"Deploy"**
6. Para el dominio: **Domain management** → **Add custom domain** → `app.mejoraok.com`

---

## Resumen de opciones

| Método | Tiempo setup | Deploy automático | Costo | Dificultad |
|---|---|---|---|---|
| **1. File Manager** | 10 min | ❌ Manual | Gratis | Fácil |
| **2A. Script local** | 5 min | ❌ Semi-auto | Gratis | Fácil |
| **2B. Vercel** | 3 min | ✅ Automático | Gratis | Muy fácil |
| **2C. Netlify** | 3 min | ✅ Automático | Gratis | Muy fácil |

**Mi recomendación:** Opción 2B (Vercel) — es la más moderna, rápida y sin mantenimiento.

---

## Archivos del proyecto en Documents/

| Archivo | Descripción |
|---|---|
| `MejoraApp_Manual_Completo.md` | Manual completo del proyecto |
| `Informe-Tecnico-MejoraApp.docx` | Informe técnico de mejoras |
| `Tutorial-MejoraApp-Completo.docx` | Tutorial paso a paso |
| `Technical_Paper_PWA.docx` | Manual técnico PWA |
| `CHANGELOG.md` | Historial de cambios |
| `DEPLOY-Guia.md` | Guía técnica de deploy |
| `DEPLOY-Instructivo.md` | Este archivo (instructivo paso a paso) |
| `MejoraApp-Completo.tar.gz` | Código fuente completo |

---

*Documento actualizado: 19 Abril 2026*
