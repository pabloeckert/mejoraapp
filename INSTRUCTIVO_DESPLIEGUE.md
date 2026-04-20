# 🚀 Instructivo de Despliegue — MejoraApp
## Para cualquier persona SIN conocimientos técnicos

**Dominio:** app.mejoraok.com  
**Última actualización:** 20 de abril de 2026

---

## 📋 Qué necesitás

- Una computadora con internet
- Un programa FTP gratuito (te decimos cuál descargar)
- Los datos de conexión (los tenés abajo)
- 15 minutos de tu tiempo

---

## Paso 1: Descargar el archivo de despliegue

1.1 Ir al repositorio: **https://github.com/pabloeckert/mejoraapp**

1.2 Buscar el archivo **`mejoraapp-dist.zip`** en la raíz del repositorio

1.3 Hacer clic en el archivo → botón **"Download"** (flecha hacia abajo ↙️)

1.4 Guardar en tu computadora (Escritorio o Descargas está bien)

1.5 **Descomprimir** el archivo ZIP:
   - **Windows:** Clic derecho → "Extraer todo"
   - **Mac:** Doble clic en el ZIP

1.6 Se crea una carpeta llamada **`dist`** con todos los archivos de la app

---

## Paso 2: Descargar e instalar FileZilla (programa FTP)

2.1 Ir a: **https://filezilla-project.org/download.php**

2.2 Descargar la versión para tu sistema (Windows/Mac/Linux)

2.3 Instalarlo como cualquier programa (siguiente, siguiente, finalizar)

---

## Paso 3: Conectar al servidor

3.1 Abrir **FileZilla**

3.2 En la barra superior, ingresar estos datos:

| Campo | Valor |
|-------|-------|
| **Host** | `185.212.70.250` |
| **Usuario** | `u846064658.mejoraok.com` |
| **Contraseña** | `T@beg2301` |
| **Puerto** | `21` |

3.3 Hacer clic en **"Conectar"** (o "Quickconnect")

3.4 Si aparece un aviso de certificado, aceptar (marcar "Siempre confiar")

---

## Paso 4: Subir los archivos

4.1 En el **panel derecho** (servidor), navegar a la carpeta **`public_html`**
   - Si no la ves, hacé doble clic en las carpetas hasta encontrarla

4.2 En el **panel izquierdo** (tu computadora), navegar a la carpeta **`dist`** que descomprimiste

4.3 **Seleccionar TODOS** los archivos dentro de `dist`:
   - **Windows:** Ctrl + A
   - **Mac:** Cmd + A

4.4 **Arrastrar** los archivos al panel derecho (public_html)
   - O clic derecho → "Subir" / "Upload"

4.5 **Esperar** a que termine la subida (1-3 minutos)

> ⚠️ **IMPORTANTE:** Si ya hay archivos en public_html, **SOBRESCRIBIR TODOS**. Esto reemplaza la versión anterior.

---

## Paso 5: Verificar que funciona

5.1 Abrir un navegador web (Chrome, Firefox, Safari, Edge)

5.2 Ir a: **https://app.mejoraok.com**

5.3 Verificar que:
   - ✅ La página carga correctamente
   - ✅ Se ve el logo y la navegación
   - ✅ Los tabs funcionan (Muro, Contenido, Novedades, Diagnóstico)

5.4 Probar en **múltiples dispositivos** (celular, tablet, computadora)

---

## Paso 6: Acceder al Panel Admin

6.1 Ir a: **https://app.mejoraok.com/admin**

6.2 Ingresar la contraseña maestra del admin

6.3 Verificar que los **6 módulos** son accesibles:
   - Contenido
   - IA
   - Novedades
   - Muro
   - Usuarios
   - Seguridad

---

## 🔧 Solución de Problemas

| Problema | Causa Probable | Solución |
|----------|---------------|----------|
| **Página en blanco** | Archivos no subidos bien | Verificar que `index.html` está en `public_html` |
| **Error 404 en rutas** | Falta `.htaccess` | Crear `.htaccess` (ver abajo) |
| **CSS roto / feo** | Rutas incorrectas | Verificar carpeta `dist/assets/` se subió completa |
| **Archivos lentos** | Sin compresión | Contactar hosting para activar gzip |
| **No conecta a Supabase** | Keys faltantes | Verificar que el build incluye las keys correctas |

### Archivo .htaccess (si hay Error 404)

Si al navegar a `/admin` o `/auth` aparece Error 404, crear un archivo de texto llamado `.htaccess` en la raíz de `public_html` con este contenido:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**Cómo crearlo:**
1. Abrir el Bloc de Notas (Windows) o TextEdit (Mac)
2. Pegar el código de arriba
3. Guardar como `.htaccess` (con el punto al inicio, sin extensión .txt)
4. Subirlo a `public_html` por FTP

---

## 📌 Resumen Rápido

1. 📥 Descargar `mejoraapp-dist.zip` de GitHub
2. 📂 Descomprimir (queda carpeta `dist`)
3. 🔌 Conectar FileZilla a `185.212.70.250`
4. 📤 Subir TODO el contenido de `dist` a `public_html`
5. ✅ Verificar en `app.mejoraok.com`

**¡Listo! La app está en producción.** 🎉

---

## 📞 Datos de Conexión FTP

```
Host:     185.212.70.250
Usuario:  u846064658.mejoraok.com
Password: T@beg2301
Puerto:   21
Carpeta:  public_html
```

---

*Documento generado automáticamente — MejoraApp 2026*
