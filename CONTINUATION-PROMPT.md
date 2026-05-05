# Prompt de continuación — MejoraApp

> Copiá este prompt al inicio de la próxima sesión para retomar exacto donde quedamos.

---

```
Estás trabajando en el proyecto MejoraApp en /root/.openclaw/workspace/MejoraApp.

## Contexto
MejoraApp es una PWA (React 18 + TypeScript + Vite + Supabase + Tailwind CSS) para líderes empresariales argentinos. Producción: app.mejoraok.com. Repo: github.com/pabloeckert/MejoraApp.

## Situación actual (2026-05-05)
- **Supabase configurado** — URL + publishable key en .env
- **DB escaneada** — 19/25 tablas existían, 7 faltaban (creado SQL consolidado)
- **SQL consolidado** en supabase/migrations/20260505000000_missing_tables.sql — PENDIENTE ejecutar en Supabase Dashboard
- **5/9 Edge Functions desplegadas** — faltan: mentor-chat, send-push-notification, send-diagnostic-email, send-onboarding-email
- **app.mejoraok.com devuelve 404** — Vercel no está sirviendo el sitio, necesitamos configurar deploy
- **Dominio mejoraok.com**: vence 2026-12-01, acceso a Hostinger perdido
- **Tests: 312/312 passing**, Build: OK (9.66s)
- **22,700 líneas**, 175 archivos, 25 tablas DB, 8 Edge Functions

## Lo que hicimos en la sesión anterior (2026-05-05)
1. Clonado repo + instaladas dependencias
2. .env configurado con credenciales Supabase reales
3. Escaneada DB Supabase vía REST API — identificadas tablas faltantes
4. Creado SQL consolidado para 7 tablas + 3 vistas + RPC + triggers
5. Eliminados 6 SQLs redundantes de Documents/ y artefactos de build
6. Actualizada documentación (SESSION-STATE.md, CONTINUATION-PROMPT.md)
7. Verificado: build OK, 312/312 tests passing

## Tareas inmediatas para esta sesión
1. **Ejecutar SQL consolidado** en Supabase Dashboard → SQL Editor → verificar que las 25 tablas existan
2. **Configurar Vercel** — necesito token de vercel.com/account/tokens
3. **Deploy Edge Functions** — necesito SUPABASE_ACCESS_TOKEN de Supabase Dashboard → Account → Access Tokens → agregar en GitHub Secrets
4. **Verificar app** en producción
5. **Decidir sobre dominio** — ¿recuperar Hostinger? ¿comprar dominio nuevo?

## Credenciales (ya configuradas)
- Supabase URL: https://pwiduojwgkaoxxuautkp.supabase.co
- Supabase Key: en .env (VITE_SUPABASE_PUBLISHABLE_KEY)
- GitHub Token: configurado para push

## Reglas
- Voseo argentino en toda la UI
- Commits convencionales (feat:, fix:, refactor:, docs:)
- Nunca romper tests existentes
- Documentar en DOCUMENTO-MAESTRO.md al final de cada sesión
- Freemium: NO activar hasta que Mercado Pago esté integrado
- App nativa: NO hasta 30+ DAU sostenidos
- ML propio: NO hasta 1000+ usuarios
```
