# MejoraApp — Guía de Deploy

**Última actualización:** 19 Abril 2026

---

## Situación

| Item | Detalle |
|---|---|
| **Dominio principal** | `mejoraok.com` — sitio WordPress en Hostinger |
| **App MejoraApp** | React 18 + Vite + Supabase (PWA) |
| **Hosting** | Hostinger (hPanel) |
| **Objetivo** | Publicar la MejoraApp accesible desde la web |

---

## Decisión: Subdominio `app.mejoraok.com`

Se eligió **subdominio** en vez de subcarpeta por estas razones:

| Factor | `app.mejoraok.com` ✅ | `mejoraok.com/app` ❌ |
|---|---|---|
| Separación de WordPress | Totalmente aparte | Mezclado con WordPress |
| Routing SPA | Sin conflictos | .htaccess de WordPress puede romper routing |
| Caché | Sin interferencia | LiteSpeed de WordPress puede dar problemas |
| SSL | Automático | Compartido con WordPress |
| Setup | 1 click en hPanel | Arrastrar archivos dentro de WordPress |

---

## Estado del Deploy

| Item | Estado |
|---|---|
| **Build de producción** | ✅ `npm run build` genera `dist/` correctamente |
| **Tests** | ✅ 24/24 pasan |
| **GitHub repo** | ✅ https://github.com/pabloeckert/mejoraapp |
| **GitHub Pages** | ✅ Backup live en https://pabloeckert.github.io/mejoraapp/ |
| **GitHub Actions** | ✅ Workflow configurado para auto-deploy |
| **Hostinger FTP** | ❌ Canal de datos bloqueado desde servidores remotos |
| **Deploy en Hostinger** | ⏳ Pendiente — requiere subir por File Manager de hPanel |

---

## Pasos para Deploy en Hostinger

### Paso 1: Crear subdominio en hPanel

1. Entrar a **hPanel → Dominios → Subdominios**
2. Crear subdominio:
   - **Nombre del subdominio:** `app`
   - **Dominio:** `mejoraok.com`
   - **Carpeta:** se crea automáticamente (`public_html/app` o similar)
3. Verificar que el SSL se genere automáticamente (Hostinger lo hace)

### Paso 2: Generar zip del build

Desde el repo local o desde GitHub Actions:
```bash
cd mejoraapp
npm run build
cd dist && zip -r ../mejoraapp-dist.zip . && cd ..
```

### Paso 3: Subir por File Manager

1. Entrar a **hPanel → Archivos → Administrador de archivos**
2. Navegar a la carpeta del subdominio `app.mejoraok.com`
3. Subir `mejoraapp-dist.zip`
4. Clic derecho → **Extraer**
5. Verificar que `index.html` esté en la raíz de la carpeta

### Paso 4: Configurar .htaccess

Crear archivo `.htaccess` en la raíz de la carpeta del subdominio:
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

Esto permite que el SPA routing funcione correctamente (todas las rutas redirigen a `index.html`).

### Paso 5: Verificar

- Abrir `https://app.mejoraok.com` en el navegador
- Verificar que la app carga correctamente
- Probar navegación entre secciones
- Verificar que el Service Worker funciona (PWA)

---

## URLs Finales

| Entorno | URL |
|---|---|
| **Producción** | `https://app.mejoraok.com` (cuando se complete el deploy) |
| **Backup GitHub Pages** | `https://pabloeckert.github.io/mejoraapp/` |
| **Sitio principal** | `https://mejoraok.com` (WordPress) |

---

## Problema Técnico: FTP Bloqueado

El FTP de Hostinger bloquea el canal de datos (puertos PASV) desde servidores remotos. Esto impide el deploy automático por FTP desde GitHub Actions o desde este servidor.

**Pruebas realizadas:**
- FTP pasivo (Python ftplib) → timeout en canal de datos
- FTP activo → timeout
- FTPS (TLS) → timeout
- curl con --ftp-skip-pasv-ip → timeout
- Puertos de datos 2299 y 2396 → bloqueados
- GitHub Actions con FTP-Deploy-Action → mismo error

**Solución:** Subir manualmente por el File Manager de hPanel, que usa HTTP y no tiene este problema.

---

## Archivos de Documentación del Proyecto

| Archivo | Contenido |
|---|---|
| `MejoraApp_Manual_Completo.md` | Manual completo del proyecto |
| `Informe-Tecnico-MejoraApp.docx` | Informe técnico de mejoras |
| `Tutorial-MejoraApp-Completo.docx` | Tutorial de deployment |
| `Technical_Paper_PWA.docx` | Manual técnico PWA |
| `CHANGELOG.md` | Historial de cambios |
| `DEPLOY-Guia.md` | Este archivo (guía de deploy) |
| `MejoraApp-Completo.tar.gz` | Código fuente completo |

---

*Documento actualizado: 19 Abril 2026*
