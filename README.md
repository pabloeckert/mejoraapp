# MejoraApp — Comunidad de Negocios

**Producción:** [app.mejoraok.com](https://app.mejoraok.com)  
**Stack:** React 18 + TypeScript + Vite + Supabase + Tailwind CSS

## Documentación

**📄 Fuente única de verdad:** [`Documents/DOCUMENTO-MAESTRO.md`](Documents/DOCUMENTO-MAESTRO.md)

Arquitectura, plan, estado actual, guía de estilo, setup, análisis multidisciplinario (30+ perspectivas), y todo lo demás.

> **Cuando digas "documentar"** — el DOCUMENTO-MAESTRO.md se actualiza con los trabajos realizados.

### Documentos en `Documents/`

| Archivo | Propósito |
|---------|-----------|
| `DOCUMENTO-MAESTRO.md` | Fuente única de verdad — todo el proyecto |
| `GUIA-SETUP-INICIAL.md` | Setup: Vercel + Resend + onboarding emails |
| `CHANGELOG-*.md` | Changelog por sesión |
| `*.sql` | Scripts de migración y setup |

## Desarrollo Local

```bash
npm install
npm run dev          # Dev server en http://localhost:8080
npm run build        # Build de producción en dist/
npm run test         # Tests (103+ passing)
npm run test:e2e     # E2E: playwright test
```

## Despliegue

Push a `main` → GitHub Actions (tests) → Vercel auto-deploy → `app.mejoraok.com`
