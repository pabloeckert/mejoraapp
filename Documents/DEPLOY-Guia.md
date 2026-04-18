# MejoraApp — Guía de Deploy

**Última actualización:** 19 Abril 2026

---

## Estado Actual

| Item | Estado |
|---|---|
| **App en producción** | ✅ https://pabloeckert.github.io/mejoraapp/ |
| **Deploy automático** | ✅ GitHub Actions (cada push a `main`) |
| **SSL/HTTPS** | ✅ Incluido (GitHub Pages) |
| **CDN** | ✅ Global (GitHub Pages) |
| **Dominio personalizado** | ⏳ Pendiente configurar DNS |

---

## Cómo Funciona el Deploy

### Flujo automático
```
git push → GitHub Actions → npm ci → npm run build → deploy a GitHub Pages
```

### Archivo de workflow
`.github/workflows/deploy.yml` — configura el pipeline de CI/CD.

### Para deployar manualmente
1. Ir a GitHub → Actions → "Deploy MejoraApp" → Run workflow

---

## Configurar Dominio Personalizado (mejoraok.com)

### Paso 1: Configurar DNS en Hostinger

Entrar a **hPanel → Dominios → mejoraok.com → DNS / Zona DNS**

Agregar estos registros:

| Tipo | Nombre | Valor | TTL |
|---|---|---|---|
| `A` | `@` | `185.199.108.153` | 3600 |
| `A` | `@` | `185.199.109.153` | 3600 |
| `A` | `@` | `185.199.110.153` | 3600 |
| `A` | `@` | `185.199.111.153` | 3600 |
| `CNAME` | `www` | `pabloeckert.github.io` | 3600 |

> **Nota:** Las 4 IPs `A` son los servidores de GitHub Pages.

### Paso 2: Verificar en GitHub

1. Ir a **GitHub → mejoraapp → Settings → Pages**
2. En "Custom domain" debería aparecer `mejoraok.com` (detectado del CNAME)
3. Esperar a que se genere el certificado SSL (puede tardar hasta 24h, normalmente 15 min)
4. Marcar "Enforce HTTPS"

### Paso 3: Verificar

```bash
# Verificar DNS
dig mejoraok.com +short
# Debería mostrar: 185.199.108.153 (o una de las 4 IPs)

# Verificar HTTPS
curl -I https://mejoraok.com
# Debería mostrar: HTTP/2 200
```

---

## Archivos de Documentación

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

## Resolución de Problemas

### La página muestra 404
- Verificar que `public/CNAME` contiene `mejoraok.com`
- Verificar que el deploy de GitHub Actions terminó con éxito

### El certificado SSL no se genera
- Verificar que los registros DNS apuntan correctamente a GitHub Pages
- Esperar hasta 24 horas
- Ir a Settings → Pages → Save (re-dispara la verificación)

### Cambios no aparecen en producción
- Verificar que el push se hizo a la rama `main`
- Revisar GitHub → Actions para ver si el deploy falló
- Limpiar caché del navegador (Ctrl+Shift+R)

---

## Cambiar a Hostinger en el Futuro

Si querés volver a Hostinger más adelante:
1. Subir el contenido de `dist/` por el File Manager de hPanel
2. Cambiar los DNS de vuelta a Hostinger
3. El workflow de GitHub Actions se puede eliminar del archivo `.github/workflows/deploy.yml`

---

*Documento actualizado: 19 Abril 2026*
