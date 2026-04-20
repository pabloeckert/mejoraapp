# MejoraApp

PWA mobile-first para emprendedores argentinos — Comunidad de Negocios.

**Producción:** https://mejoraok.com  
**Repo:** https://github.com/pabloeckert/mejoraapp

## Stack

- **Frontend:** React 18 + TypeScript + Vite 5
- **UI:** Tailwind CSS + shadcn/ui (30+ componentes)
- **Backend:** Supabase (Auth, PostgreSQL, Realtime, Edge Functions)
- **IA:** Multi-provider (Gemini, DeepSeek, Groq) con rotación automática
- **Testing:** Vitest + Testing Library

## Funcionalidades

- 🔍 **Diagnóstico Empresarial** — Test interactivo con 4+ perfiles de resultado
- 📚 **Contenido de Valor** — Artículos, videos, infografías y libros con accordion
- 🧱 **Muro Anónimo** — Posts moderados por IA, likes, comentarios en tiempo real
- 📢 **Novedades** — Canal de comunicación de la marca
- 🔐 **Admin** — Panel seguro con 6 módulos (contenido, IA, muro, usuarios, seguridad)

## Seguridad

- Contraseña admin con SHA-256 salted + migración automática desde legacy
- API keys ofuscadas en localStorage (XSS hardening)
- Moderación IA de posts Y comentarios (Edge Function + client-side)
- Rate limiting: 3 posts/min, 10 comentarios/min
- Error Boundary global para estabilidad
- Lockout tras 5 intentos fallidos (30s)

## Desarrollo

```bash
npm install
npm run dev      # Dev server
npm run build    # Build producción
npm run test     # Tests (24 tests)
```

## Estructura

```
src/
├── components/
│   ├── admin/         # 7 módulos admin
│   ├── tabs/          # 3 tabs principales
│   ├── ui/            # 30+ componentes shadcn
│   └── ErrorBoundary.tsx
├── contexts/          # Auth, Theme
├── pages/             # 5 rutas lazy-loaded
├── services/          # AI multi-provider
├── data/              # Diagnóstico data
└── integrations/      # Supabase client + types
supabase/functions/
├── moderate-post/     # Moderación IA de posts
└── generate-content/  # Generación IA de contenido
```

## Documentación

Ver carpeta `Documents/` para guías de deploy, changelog y manuales.
