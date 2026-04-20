# 🚀 Instructivo de Despliegue — MejoraApp
## Guía paso a paso sin conocimientos técnicos

**Dominio de producción:** https://app.mejoraok.com  
**Hosting:** Hostinger (185.212.70.250)  
**Última actualización:** 21 de abril de 2026

---

## 📋 Qué necesitás

- Una computadora con internet
- FileZilla (programa FTP gratuito)
- 15 minutos

---

## Paso 1 — Descargar el build

1. Ir a: **https://github.com/pabloeckert/mejoraapp**
2. Buscar el archivo **`mejoraapp-dist.zip`** en la raíz del repositorio
3. Hacer clic → **Download**
4. **Descomprimir** el ZIP:
   - Windows: Clic derecho → "Extraer todo"
   - Mac: Doble clic
5. Se crea una carpeta **`dist`** con los archivos de la app

---

## Paso 2 — Instalar FileZilla

1. Ir a: **https://filezilla-project.org/download.php**
2. Descargar e instalar

---

## Paso 3 — Conectar al servidor

Datos de conexión:

| Campo      | Valor                            |
|------------|----------------------------------|
| **Host**   | `185.212.70.250`                 |
| **Usuario**| `u846064658.mejoraok.com`        |
| **Contraseña** | `T@beg2301`                  |
| **Puerto** | `21`                             |

1. Abrir FileZilla
2. Ingresar los datos arriba
3. Clic en **"Conectar"**
4. Si aparece aviso de certificado → aceptar

---

## Paso 4 — Subir archivos

1. **Panel derecho** (servidor): navegar a la carpeta **`public_html`**
2. **Panel izquierdo** (tu PC): navegar a la carpeta **`dist`**
3. Seleccionar **TODOS** los archivos dentro de `dist` (Ctrl+A / Cmd+A)
4. **Arrastrar** al panel derecho
5. Si pide sobreescribir → **Sí a todo**
6. Esperar 1-3 minutos

> ⚠️ **IMPORTANTE:** Subir el CONTENIDO de `dist`, NO la carpeta `dist` entera.

---

## Paso 5 — Crear/verificar `.htaccess`

Si al navegar a `/admin` o `/auth` aparece Error 404:

1. Abrir el Bloc de Notas
2. Pegar este contenido:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

3. Guardar como **`.htaccess`** (con el punto, SIN extensión .txt)
4. Subir a `public_html` por FileZilla

---

## Paso 6 — Verificar

1. Abrir navegador
2. Ir a: **https://app.mejoraok.com**
3. Verificar que:
   - ✅ Carga la app (no la página por defecto de Hostinger)
   - ✅ Se ve el logo y navegación
   - ✅ Los 4 tabs funcionan (Contenido, Diagnóstico, Muro, Novedades)
4. Probar en celular y tablet

---

## Paso 7 — Acceder al Admin

1. Ir a: **https://app.mejoraok.com/auth**
2. Hacer clic en el **punto secreto** (punto pequeño en la pantalla de login)
3. Ingresar la contraseña maestra del admin
4. Verificar los 6 módulos: Contenido, IA, Novedades, Muro, Usuarios, Seguridad

---

## 🔧 Solución de Problemas

| Problema | Causa | Solución |
|----------|-------|----------|
| Página en blanco | Archivos mal subidos | Verificar que `index.html` está en `public_html` |
| Error 404 en rutas | Falta `.htaccess` | Crear y subir `.htaccess` (Paso 5) |
| CSS roto | Carpeta `assets/` no subida | Verificar que `dist/assets/` se subió completa |
| No conecta a Supabase | Build sin env vars | Hacer build con las variables correctas |

---

## 📌 Resumen rápido

1. 📥 Descargar `mejoraapp-dist.zip` de GitHub
2. 📂 Descomprimir
3. 🔌 Conectar FileZilla
4. 📤 Subir contenido de `dist` a `public_html`
5. ✅ Verificar en app.mejoraok.com

---

*Documento generado automáticamente — MejoraApp 2026*
