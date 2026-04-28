# MejoraApp — Comunidad de Negocios

**Producción:** [app.mejoraok.com](https://app.mejoraok.com)  
**Stack:** React 18 + TypeScript + Vite + Supabase + Tailwind CSS

## Documentación

**📄 Fuente única de verdad:** [`Documents/DOCUMENTO-MAESTRO.md`](Documents/DOCUMENTO-MAESTRO.md)

Todo el proyecto en un solo documento: arquitectura, plan, estado actual, guía de estilo, setup, glosario, análisis multidisciplinario (30+ perspectivas), y cronograma.

> **Cuando digas "documentar"** — el DOCUMENTO-MAESTRO.md se actualiza con los trabajos realizados.

### Documentos en `Documents/`

| Archivo | Propósito |
|---------|-----------|
| `DOCUMENTO-MAESTRO.md` | Fuente única de verdad — todo el proyecto |
| `*.sql` | Scripts de migración y setup (ejecutados) |

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
