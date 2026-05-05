# Prompt de continuación — MejoraApp

> Copiá este prompt al inicio de la próxima sesión para retomar exacto donde quedamos.

---

```
Estás trabajando en el proyecto MejoraApp en /root/.openclaw/workspace/MejoraApp.

## Contexto
MejoraApp es una PWA (React 18 + TypeScript + Vite + Supabase + Tailwind CSS) para líderes empresariales argentinos. Producción: app.mejoraok.com. Repo: github.com/pabloeckert/MejoraApp.

## Situación actual (2026-05-06)
- **Auditoría multidisciplinaria completada** — 40+ perspectivas, score 7.2 → 8.2
- **22 archivos mejorados** — seguridad, arquitectura, CI/CD, PWA, i18n, documentación
- **TypeScript strict mode** habilitado
- **CSP + HSTS + security headers** en vercel.json
- **Route-level Error Boundaries** implementados
- **Service Worker corregido** con estrategia diferenciada
- **Tests BLOQUEAN deploy** (antes: solo warning)
- **Documentación completa**: README, ARCHITECTURE, SECURITY, CONTRIBUTING
- **Supabase configurado** — PKCE flow, fetch timeout, realtime config
- **Tests: 103+ passing**, Build: OK

## Archivos clave
- `README.md` — Documentación principal
- `ARCHITECTURE.md` — Arquitectura del proyecto
- `SECURITY.md` — Política de seguridad
- `CONTRIBUTING.md` — Guía de contribución
- `MEJORAS-APLICADAS.md` — Auditoría completa con scores
- `SESSION-STATE.md` — Estado actual detallado
- `CHANGELOG.md` — Historial de cambios

## Acciones pendientes
1. **Revocar token de GitHub** — crear uno nuevo en github.com/settings/tokens
2. **Verificar deploy** en app.mejoraok.com
3. **Edge Functions pendientes** — mentor-chat, send-push-notification, send-diagnostic-email, send-onboarding-email
4. **Coverage threshold** — Agregar mínimo de cobertura en vitest config
5. **Ejecutar SQL consolidado** en Supabase Dashboard (si no se hizo)

## Stack
- React 18 + TypeScript (strict) + Vite 5 + Supabase + Tailwind CSS 3.4
- shadcn/ui + Radix para componentes UI
- React Query para server state
- PostHog para analytics, Sentry para error tracking
- Vitest + Playwright para testing
- Vercel para hosting, GitHub Actions para CI/CD

## Reglas
- Voseo argentino en toda la UI
- Commits convencionales (feat:, fix:, refactor:, docs:)
- Nunca romper tests existentes
- Documentar en CHANGELOG.md al final de cada sesión
- Freemium: NO activar hasta que Mercado Pago esté integrado
- App nativa: NO hasta 30+ DAU sostenidos
- ML propio: NO hasta 1000+ usuarios
- Password policy: 8+ chars, mayúscula, número
- Rate limiting en mutations frecuentes
```
