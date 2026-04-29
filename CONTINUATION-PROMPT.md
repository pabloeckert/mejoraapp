# Prompt de continuación — MejoraApp

> Copiá este prompt al inicio de la próxima sesión para retomar exacto donde quedamos.

---

```
Estás trabajando en el proyecto MejoraApp en /root/.openclaw/workspace/MejoraApp.

## Contexto
MejoraApp es una PWA (React 18 + TypeScript + Vite + Supabase + Tailwind CSS) para líderes empresariales argentinos. Producción: app.mejoraok.com. Repo: github.com/pabloeckert/MejoraApp.

## Estado actual (2026-04-30)
- **312 tests passing**, build OK
- **21,500 líneas** en 165 archivos TS/TSX
- **7 Edge Functions** todas con middleware compartido
- **Últimos 8 commits**: refactor Muro/Diagnostic, funnel tracking NSM, freemium mode, MFA admin, SEO dinámico, Edge Functions middleware, docs
- Lee `SESSION-STATE.md` en la raíz del repo para el detalle completo

## Tareas pendientes inmediatas

### Acciones del usuario (requieren intervención manual)
1. Crear cuenta Resend + verificar dominio mejoraok.com
2. Ejecutar SQL `supabase/migrations/20260426000000_onboarding_emails.sql` en Supabase
3. Desplegar EF `send-onboarding-email` via `supabase functions deploy`
4. Agregar `SUPABASE_SERVICE_ROLE_KEY` a GitHub Secrets
5. Deploy Edge Functions migradas: `supabase functions deploy`
6. Verificar realtime en producción

### Tareas técnicas pendientes
1. **Tests E2E contra producción** — `npm run test:e2e` con Playwright contra app.mejoraok.com
2. **Storybook** — Documentar componentes UI (E9.7)
3. **Visual regression** — Playwright snapshots en pantallas críticas (E9.9)
4. **EXPLAIN ANALYZE** — Auditar queries del muro y CRM
5. **Activar freemium** — Cambiar `CURRENT_PLAN_ID` a `"freemium"` en `src/lib/plans.ts` cuando esté listo Mercado Pago
6. **Mercado Pago** — Integrar para suscripción premium
7. **Email drip** — Templates D0/D1/D3/D7 de activación

### Documentos de referencia
- `Documents/DOCUMENTO-MAESTRO.md` — Fuente única de verdad del proyecto
- `SESSION-STATE.md` — Estado detallado de la última sesión
- `CHANGELOG.md` — Historial de cambios
- Documentos externos analizados:
  - `MejoraApp.docx` — Análisis multidisciplinario 30+ roles (audit completo)
  - `Yo-lo-haria-asi.docx` — Filosofía Lovable + anti-patrones + plan 4 sprints

## Reglas
- Voseo argentino en toda la UI
- Commits convencionales (feat:, fix:, refactor:, docs:)
- Nunca romper tests existentes
- Documentar en DOCUMENTO-MAESTRO.md al final de cada sesión
- Freemium: NO activar hasta que Mercado Pago esté integrado
- App nativa: NO hasta 30+ DAU sostenidos
- ML propio: NO hasta 1000+ usuarios
```
