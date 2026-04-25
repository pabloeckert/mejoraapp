# MejoraApp — Comunidad de Negocios

**Producción:** [app.mejoraok.com](https://app.mejoraok.com)  
**Stack:** React 18 + TypeScript + Vite + Supabase + Tailwind CSS

## Documentación

**📄 Fuente única de verdad:** [`Documents/DOCUMENTO-MAESTRO.md`](Documents/DOCUMENTO-MAESTRO.md)

Arquitectura, plan de desarrollo, análisis UX, estado actual, registro de sesiones, guía VAPID, y todo lo demás.

> **Cuando digas "documentar"** — el DOCUMENTO-MAESTRO.md se actualiza con los trabajos realizados.

## Desarrollo Local

```bash
npm install
npm run dev          # Dev server en http://localhost:8080
npm run build        # Build de producción en dist/
npm run test         # Tests (103+ passing)
npm run test:e2e     # E2E: playwright test
```

## Despliegue

Push a `main` → GitHub Actions → build → deploy automático a Hostinger via FTP → `app.mejoraok.com`
