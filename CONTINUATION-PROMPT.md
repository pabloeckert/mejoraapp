# Prompt de continuación — MejoraApp

> Copiá este prompt al inicio de la próxima sesión para retomar exacto donde quedamos.

---

```
Estás trabajando en el proyecto MejoraApp en /root/.openclaw/workspace/MejoraApp.

## Contexto
MejoraApp es una PWA (React 18 + TypeScript + Vite + Supabase + Tailwind CSS) para líderes empresariales argentinos. Producción: app.mejoraok.com. Repo: github.com/pabloeckert/MejoraApp.

## Situación actual (2026-05-05)
- **Migración desde Hostinger**: acceso a hPanel perdido, no se puede gestionar DNS/dominio
- **Dominio mejoraok.com**: vence 2026-12-01, nameservers apuntan a Hostinger (dns-parking.com)
- **Código seguro en GitHub** — repo clonado localmente
- **Entorno local configurado**: dependencias instaladas, 312/312 tests passing
- **PENDIENTE**: completar `.env` con credenciales Supabase reales (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
- **E7 (Deploy) 🔄**: 10/12 completas, pendiente SQL + deploy Edge Functions
- **22,700 líneas**, 175 archivos, 25 tablas DB, 8 Edge Functions

## Lo que hicimos en esta sesión
1. Evaluamos situación de hosting: Hostinger inaccesible, dominio atado a ellos
2. Hicimos WHOIS del dominio — confirma que vence dic 2026 y los nameservers son de Hostinger
3. Clonamos el repo localmente
4. Instalamos dependencias (576 paquetes)
5. Corrimos tests — 312/312 passing
6. Creamos `.env` desde `.env.example` (pendiente completar)
7. Actualizamos DOCUMENTO-MAESTRO.md, SESSION-STATE.md y este archivo

## Tareas inmediatas para la próxima sesión
1. **Completar `.env`** — necesito las credenciales de Supabase del usuario
2. **`npm run dev`** — levantar la app localmente en localhost:8080
3. **Decidir sobre dominio** — ¿recuperar Hostinger? ¿comprar dominio nuevo?
4. **Seguir E7** — ejecutar SQL pendientes + deploy Edge Functions
5. **Continuar con E8** (Crecimiento) cuando E7 esté cerrada

## Acciones del usuario pendientes (arrastradas)
1. Ejecutar SQL modo comunidad en Supabase
2. Crear cuenta Resend + verificar dominio
3. Ejecutar SQL onboarding_emails
4. Desplegar EF send-onboarding-email
5. Agregar SUPABASE_SERVICE_ROLE_KEY a GitHub Secrets
6. Deploy Edge Functions a prod

## Reglas
- Voseo argentino en toda la UI
- Commits convencionales (feat:, fix:, refactor:, docs:)
- Nunca romper tests existentes
- Documentar en DOCUMENTO-MAESTRO.md al final de cada sesión
- Freemium: NO activar hasta que Mercado Pago esté integrado
- App nativa: NO hasta 30+ DAU sostenidos
- ML propio: NO hasta 1000+ usuarios
```
