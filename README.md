# MejoraApp — Comunidad de Negocios

**Producción:** [app.mejoraok.com](https://app.mejoraok.com)  
**Stack:** React 18 + TypeScript + Vite + Supabase + Tailwind CSS

## Descripción

MejoraApp es la aplicación digital del ecosistema Mejora Continua — una comunidad de negocios para líderes empresariales argentinos.

### Funcionalidades

- 🔐 Autenticación completa (email/password + Google OAuth + recuperación)
- 📝 Muro anónimo con posts, likes, comentarios y moderación IA
- 📚 Contenido de valor con categorías y generación IA
- 🔍 Diagnóstico estratégico interactivo
- ⚙️ Panel admin con 6 módulos
- 🤖 IA multi-provider (Gemini, DeepSeek, Groq) con rotación automática
- 📱 PWA instalable
- 🌙 Dark mode

## Documentación

- **Informe integral:** [`Documents/mejoraapp+2026-04-20.docx`](Documents/mejoraapp+2026-04-20.docx)
- **Instructivo de despliegue:** [`INSTRUCTIVO_DESPLIEGUE.md`](INSTRUCTIVO_DESPLIEGUE.md)
- **Build de producción:** [`mejoraapp-dist.zip`](mejoraapp-dist.zip)

## Desarrollo Local

```bash
npm install
npm run dev      # Dev server en http://localhost:8080
npm run build    # Build de producción en dist/
npm run test     # Tests (24 passing)
```

## Despliegue

Ver [INSTRUCTIVO_DESPLIEGUE.md](INSTRUCTIVO_DESPLIEGUE.md) para instrucciones paso a paso sin conocimientos técnicos.

Resumen rápido: ejecutar `npm run build` y subir el contenido de `dist/` a `public_html` por FTP.

## Stack

| Componente | Tecnología |
|-----------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth + DB + Edge Functions) |
| Database | PostgreSQL (RLS habilitado) |
| IA | Gemini + DeepSeek + Groq |
| Testing | Vitest (24 tests) |

## Estructura

```
src/
├── pages/           # 5 páginas lazy-loaded
├── components/      # Componentes principales + ErrorBoundary
│   ├── admin/       # 6 módulos admin
│   ├── tabs/        # Muro, Novedades, Contenido
│   └── ui/          # 30+ componentes shadcn/ui
├── contexts/        # AuthContext, ThemeContext
├── services/        # ai.ts (multi-provider)
├── data/            # Datos del diagnóstico
└── integrations/    # Supabase client + tipos
```

## Métricas

- **Líneas de código:** ~10,774
- **Archivos TS/TSX:** 88
- **Tests:** 24 (100% passing)
- **Bundle gzipped:** ~350KB
- **Build time:** ~4-6 segundos
