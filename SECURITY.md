# Política de Seguridad — MejoraApp

## Reporte de Vulnerabilidades

Si encontrás una vulnerabilidad de seguridad, **no abras un issue público**. Enviá un email a [security@mejoraok.com] con:

1. Descripción de la vulnerabilidad
2. Pasos para reproducir
3. Impacto potencial
4. Sugerencia de fix (si tenés)

Respondemos en un máximo de 48 horas.

---

## Medidas de Seguridad Implementadas

### Transport Layer

| Medida | Estado | Detalle |
|--------|--------|---------|
| HTTPS | ✅ | Forzado por Vercel |
| HSTS | ✅ | `max-age=31536000; includeSubDomains; preload` |
| TLS 1.2+ | ✅ | Vercel default |

### HTTP Security Headers

| Header | Valor | Propósito |
|--------|-------|-----------|
| `Content-Security-Policy` | Ver `vercel.json` | Previene XSS, code injection |
| `X-Content-Type-Options` | `nosniff` | Previene MIME sniffing |
| `X-Frame-Options` | `DENY` | Previene clickjacking |
| `X-XSS-Protection` | `1; mode=block` | XSS filter del navegador |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controla info de referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Deshabilita APIs sensibles |

### Content Security Policy (CSP)

```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://us.i.posthog.com https://browser.sentry.io
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob: https:
font-src 'self' data:
connect-src 'self' https://*.supabase.co https://us.i.posthog.com https://o*.ingest.sentry.io wss://*.supabase.co
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
```

### Autenticación

| Medida | Estado | Detalle |
|--------|--------|---------|
| PKCE Flow | ✅ | Más seguro que implicit para SPAs |
| Auto-refresh token | ✅ | Renovación automática de sesión |
| Detect session in URL | ✅ | OAuth redirect y magic links |
| MFA para admins | ✅ | Verificación via Edge Function |
| Session TTL admin | ✅ | 4 horas en sessionStorage |

### Password Policy

- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 número
- Validación client-side con Zod + server-side en Supabase

### Input Validation

| Tipo | Método | Archivo |
|------|--------|---------|
| Formularios auth | Zod schemas | `src/lib/validation.ts` |
| Posts del muro | Zod + HTML strip | `src/lib/validation.ts` |
| Comentarios | Zod + HTML strip | `src/lib/validation.ts` |
| CRM data | Zod schemas | `src/lib/validation.ts` |
| URLs | Sanitización | `src/lib/security.ts` |

### Rate Limiting (Client-side)

| Acción | Límite | Ventana |
|--------|--------|---------|
| Posts en muro | 5 | 1 minuto |
| Comentarios | 10 | 1 minuto |
| Likes | 30 | 1 minuto |
| Reportes | 3 | 5 minutos |
| Edición perfil | 10 | 5 minutos |
| Diagnósticos | 5 | 1 hora |
| Mensajes Mentor | 30 | 1 minuto |

### Data Protection

| Medida | Estado | Detalle |
|--------|--------|---------|
| Cookie consent | ✅ | Ley 25.326 (Argentina) |
| Analytics opt-out | ✅ | Bloqueado hasta consentimiento |
| Sentry opt-out | ✅ | Bloqueado hasta consentimiento |
| localStorage cleanup | ✅ | En logout |
| No PII en analytics | ✅ | Solo user ID, no emails |

### Moderación

- Posts y comentarios pasan por moderación IA (Edge Function)
- Contenido flagged para review manual
- Admin puede eliminar contenido
- Reportes de usuarios

---

## Dependencias de Seguridad

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `@sentry/react` | ^8.55.0 | Error tracking |
| `zod` | ^3.25.76 | Input validation |
| `@supabase/supabase-js` | ^2.103.2 | Auth + DB (RLS) |

---

## Checklist de Seguridad para PRs

- [ ] No hay API keys o secrets en el código
- [ ] Input validado con Zod antes de enviar a DB
- [ ] HTML sanitizado en contenido de usuario
- [ ] No se usa `dangerouslySetInnerHTML`
- [ ] URLs sanitizadas (no `javascript:` o `data:`)
- [ ] Rate limiting en mutations frecuentes
- [ ] Error messages no exponen info sensible
- [ ] Dependencies actualizadas (sin CVEs conocidos)

---

## Supabase Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Las políticas están definidas en Supabase Dashboard.

**Reglas generales:**
- Usuarios solo leen/escriben sus propios datos
- Admins tienen acceso ampliado via Edge Functions
- Contenido público (posts aprobados) legible por todos
- Datos sensibles (push_subscriptions) solo por el usuario dueño

---

## Incident Response

1. **Detección** — Sentry alerta o reporte de usuario
2. **Triaje** — Evaluar severidad (CRITICAL/HIGH/MEDIUM/LOW)
3. **Mitigación** — Fix inmediato para CRITICAL/HIGH
4. **Comunicación** — Notificar a usuarios afectados si aplica
5. **Post-mortem** — Documentar lecciones aprendidas
