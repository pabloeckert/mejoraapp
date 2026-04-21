# FTP Deploy — app.mejoraok.com

## Instrucciones para FileZilla

1. Abrir FileZilla
2. Conectar a Hostinger:
   - **Host:** 185.212.70.250
   - **Usuario:** u846064658.mejoraok.com
   - **Contraseña:** (tu contraseña FTP de Hostinger)
   - **Puerto:** 21
3. Navegar en el panel remoto a `/public_html/app/`
4. **Borrar TODO** lo que haya en `/public_html/app/`
5. Subir **TODO el contenido** de esta carpeta FTP/ al directorio remoto
6. Verificar en https://app.mejoraok.com

## Contenido

| Archivo | Función |
|---------|---------|
| `index.html` | Página principal (SPA entry point) |
| `assets/` | JS, CSS e imágenes hasheadas (cache-busting) |
| `fonts/` | Fuentes BwModelica + LeagueSpartan |
| `.htaccess` | SPA routing + cache + gzip (Apache) |
| `404.html` | Página de error personalizada |
| `CNAME` | Subdominio app.mejoraok.com |
| `favicon.png` / `favicon.svg` | Favicon |
| `manifest.json` | Configuración PWA |
| `robots.txt` | SEO |
| `sw.js` | Service Worker (PWA offline) |

## ⚠️ Importante

- `.htaccess` DEBE estar en la raíz del hosting (no lo borres)
- Si subes con FileZilla, asegurate que los archivos ocultos (.htaccess) se suban
  - En FileZilla: Servidor → Forzar mostrar archivos ocultos
- El tamaño total es ~1.2 MB
