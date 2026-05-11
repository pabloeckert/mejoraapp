# CTO SESSION — Estado Actual
## Última actualización: 12 de mayo 2026, 02:46 GMT+8

---

## 🔑 PALABRA CLAVE: `continuemos`
> Si te pasan esta palabra al inicio de una sesión, leé este documento y continuá exactamente donde quedamos.

---

## QUIÉN ES QUIÉN

- **Humano:** Pablo Eckert — Fundador de Mejora Continua, dueño del proyecto
- **CTO:** La IA (asistente) — asumió rol de CTO técnico el 8/5/2026
- **Situación:** Ya NO existe el desarrollador anterior. Somos solo los dos.

## REPOSITORIO

- **GitHub:** https://github.com/pabloeckert/MejoraApp
- **Producción:** https://app.mejoraok.com → **MIGRAR A VERCEL** (mantener subdominio)
- **Preview (GH Pages):** https://pabloeckert.github.io/MejoraApp/ — Deploy alternativo para borradores
- **Vercel:** https://vercel.com/pablo-ecks-projects/mejoraapp
  - Proyecto: `mejoraapp` (Vite, Node 22)
  - Git conectado a `pabloeckert/MejoraApp` (main)
  - Environment Variables: ✅ Cargadas (VITE_SUPABASE_URL, VITE_SUPABASE_PROJECT_ID, VITE_SUPABASE_PUBLISHABLE_KEY)
  - **Dominio custom `app.mejoraok.com`:** ❌ Pendiente de configurar
  - Último deploy: 10/5/2026 — **PENDIENTE REDEPLOY MANUAL** (ver sección abajo)
  - Fix build Vercel: commit `40bc2cf` — alias `@` cambiado a regex `/^@\//` + `resolve.extensions`
  - Fix bugs: commit `d42d7b1` — BottomNav accent, FeatureGate API, i18n duplicados
  - **Pendiente: Pablo hacer Redeploy en Vercel para probar los fixes**
- **Stack:** React 18 + TypeScript + Vite 5 + Supabase + Tailwind CSS + shadcn/ui
- **Supabase URL:** https://pwiduojwgkaoxxuautkp.supabase.co
- **Branch principal:** main

## DECISIÓN TOMADA: OPCIÓN B — REBUILD SELECTIVO

Se decidió hacer un **rebuild selectivo** (no refactorizar sobre lo existente):

### SE MANTIENE (base técnica sólida):
- Autenticación (email/password + Google OAuth + recuperación)
- Supabase connection + RLS + Edge Functions
- UI components (shadcn/ui, 30+ componentes)
- Estructura de carpetas y arquitectura por capas (Services → Supabase)
- Deploy pipeline (GitHub Actions)
- Tailwind CSS + Vite
- PWA + service worker
- Error boundaries + Route error boundaries

### SE ELIMINA (features no pedidas en los specs):
- CRM completo (crm_clients, crm_products, crm_interactions, crm_interaction_lines)
- A/B testing (ab-testing.ts)
- Funnel de activación (funnel.ts)
- NPS Surveys (nps_responses, NPSSurvey.tsx)
- Community challenges (community_challenges, challenge_participants)
- Sistema de badges (user_badges)
- Sistema de referidos (referrals) — OJO: los specs piden referidos N2, pero diferente al actual
- Onboarding V1 y V2 (el onboarding se redefine según specs)
- Analytics avanzado (PostHog) — se puede mantener como opcional
- Sentry error tracking — se puede mantener como opcional

### SE MANTIENE (además de la base):
- Mentor IA (confirmado por Pablo)

### SE CONSTRUYE DESDE CERO (features de los specs):
1. **Sistema de membresías N0/N1/N2 + ADMIN** — campo access_level en profiles
2. **Control de acceso por nivel** — blur N0, bloqueos, upgrade prompts
3. **Splash screen (P01)** — branding Mejora Continua
4. **Registro con tests de gamification (P02)** — Múltiples tests progresivos para conocerse como empresarios
5. **Home dashboard por nivel (P03)** — cards dinámicas según membresía
6. **Muro con tipos de publicación (P04)** — Consulta/Caso/Convocatoria, nickname
7. **Calendario de eventos (P05)** — inscripción por nivel, QR, aforo
8. **Círculo Dorado (P07)** — Contenido VIP, Silla de la Verdad, Reuniones, Mesa de Alianzas
9. **Botón de Emergencia (P08)** — WhatsApp pre-armado, historial, límites
10. **Mi Perfil con gestión de membresía (P09)** — test results, pagos, upgrade
11. **Panel admin con 5 módulos (P10)** — usuarios, contenido, eventos, métricas, cobranza
12. **Integración Tiendup** — links de pago + webhook para niveles automáticos
13. **Tabla payments** — control de cobranza, historial, baja automática
14. **Tabla events + event_registrations** — eventos con QR y aforo

## PREGUNTAS — ✅ RESPONDIDAS (8/5/2026 08:04)

### BLOQUE 1 — El negocio real
- **P1:** Partimos de cero. Los founders NO usan nada del repo actual.
- **P2:** Es complemento. La app es parte de la Comunidad de Negocios de Mejora Continua.
- **P3:** Solo somos los dos (Pablo + CTO IA). El modelo 70/30 ya no aplica.

### BLOQUE 2 — Qué se queda, qué se va
- **P4:** Mentor IA **SE QUEDA**.
- **P5:** CRM era del dev → **SE ELIMINA**.
- **P6:** Muro anónimo para niveles no pagos (N0). Niveles pagos pueden usar nickname.
- **P7:** Modelo de gamificación con múltiples tests generados progresivamente. NO es el diagnóstico actual de 15 preguntas. La idea: empresarios se conocen en distintos aspectos y Pablo obtiene perfil de socios.

### BLOQUE 3 — Lo que falta
- **P8:** Opción D (Recomendación CTO): 1) Membresías+acceso, 2) Home dashboard, 3) Muro con tipos. Círculo Dorado se mantiene en Fase 3.
- **P9:** Tiendup **NO** está configurado.
- **P10:** **NO hay sandbox de 6 meses.** Founders entran al sistema real.

### BLOQUE 4 — La tech
- **P11:** Pablo tiene acceso a Supabase. Lo pueden ver juntos.
- **P12:** **Vercel** — se puede mantener el subdominio app.mejoraok.com.

## DECISIONES CLAVE DERIVADAS

1. **Deploy:** Migrar de Hostinger+FTP → Vercel (mantener app.mejoraok.com) + GitHub Pages como preview alternativo
2. **Muro:** Anónimo N0, nickname N1/N2
3. **Tests/Diagnóstico:** Business Mirror Gamer — ver sección dedicada más abajo
4. **Tiendup:** API disponible — `pablo-usos.public-api.tiendup.com` (API key obtenida 9/5/2026). Integrar como gateway de pagos.
5. **Mentor IA:** Se queda en el scope
6. **CRM:** Se elimina completamente
7. **Founders:** Acceso real, no sandbox

## BUSINESS MIRROR GAMER (Decisión 9/5/2026)

> "Son juegos pero que a la vez te hacen pensar"

- **Nombre:** Business Mirror Gamer
- **Naturaleza:** Beneficio exclusivo de membresía paga (N1/N2). NO define acceso.
- **Concepto:** Tests interactivos tipo juego que evalúan distintos aspectos del empresario
- **Temas (ejemplos):** comunicación asertiva, nivel de ira, cómo estás frente a tu negocio, manejo de crisis, plasticidad
- **Formato:** Juegos que invitan a pensar, para usar en tiempos libres o cuando Pablo quiera evaluar
- **Lanzamiento:** 5 tests iniciales
- **Crecimiento:** +1 test por semana + notificación push a miembros
- **Resultados:** Informativos, no bloqueantes (no afectan acceso)
- **DB:** Tablas `business_mirror_tests` + `business_mirror_results` (migración lista: `20260509_business_mirror_gamer.sql`)
- **Decisión clave:** El Mirror Estratégico existente (8 preguntas, 8 perfiles) se convierte en el Test #1

### Los 5 tests iniciales

| # | Nombre | Tipo juego | Qué mide (en el fondo) | Perfiles |
|---|--------|-----------|------------------------|----------|
| 1 | **Mirror Estratégico** | Classic (preguntas) | Estado general del negocio + rol del dueño | 8 perfiles (SATURADO, INVISIBLE, etc.) |
| 2 | **Misión Rescate** | Puzzle | Manejo de crisis + priorización bajo presión | Estratega / Bombero / Paralizado |
| 3 | **El Camino** | Aventura (branching narrative) | Negociación + toma de decisiones | Diplomático / Agresivo / Evitador |
| 4 | **Mind Lab** | Mental (ráfaga) | Comunicación + patrones de respuesta | Conector / Técnico / Caótico |
| 5 | **Logic Gate** | Lógica (escenarios) | Procesos + pensamiento sistémico | Arquitecto / Intuitivo / Improvisador |

### Mecánicas de juego

**Test 1 — Mirror Estratégico (ya existe)**
- 8 preguntas con 4 opciones cada una (A/B/C/D)
- Cada opción tiene score (1-5)
- Perfil se calcula por ejes: operativo, comercial, estratégico, emocional
- Resultado: perfil + tagline + síntomas + CTA

**Test 2 — Misión Rescate (Puzzle)**
- Escenario: "Tu negocio está en crisis. Tenés 10 minutos."
- 5 situaciones de emergencia que requieren priorizar
- Cada situación tiene 3 acciones posibles (solo una es óptima)
- El juego puntua: velocidad + precisión de priorización
- Resultado: perfil de crisis (Estratega/Bombero/Paralizado)

**Test 3 — El Camino (Aventura)**
- Narrativa ramificada: "Llegás a una encrucijada en tu negocio"
- 5 decisiones con 2-3 caminos cada una
- Cada camino lleva a un final diferente
- El juego mapea tus decisiones a un estilo de negociación
- Resultado: perfil negociador (Diplomático/Agresivo/Evitador)

**Test 4 — Mind Lab (Mental)**
- 10 preguntas rápidas (< 15 seg c/u)
- Mezcla: situaciones laborales, respuestas emocionales, patrones
- El juego mide consistencia + velocidad + patrones
- Resultado: perfil comunicador (Conector/Técnico/Caótico)

**Test 5 — Logic Gate (Lógica)**
- 5 escenarios de negocio con múltiples variables
- Elegís la mejor estrategia entre 3 opciones
- El juego evalúa razonamiento sistémico
- Resultado: perfil de procesos (Arquitecto/Intuitivo/Improvisador)

### Estado actual (9/5/2026 05:18)
- [x] Decisión tomada: Opción A (convertir Mirror existente en Test #1)
- [x] DB diseñada: migración `20260509_business_mirror_gamer.sql`
- [x] Types de Supabase actualizados (business_mirror_tests + business_mirror_results)
- [x] Tests data: 5 tests completos con questions, scoring_rules y profiles
- [x] Servicio: business-mirror.service.ts (fetch, save, scoring)
- [x] Componente BusinessMirrorHub (catálogo de tests)
- [x] Componente GamePlayer (motor de juegos genérico — classic, puzzle, adventure, mental, logic)
- [x] Componente GameResult (pantalla de resultado)
- [x] Componente MirrorPage (orquestador Hub ↔ Player)
- [x] Integrado en Index.tsx como tab "mirror"
- [x] Build verificado ✓
- [x] Aplicar migración en Supabase ✅ (9/5/2026 05:53)
- [x] Seed data: insertar los 5 tests ✅ (9/5/2026 05:53)
- [ ] Sistema de notificaciones push (+1 test/semana)

## P8 — OPCIONES DE PRIORIDAD (Top 3 features)

> Pablo: "Me gustaría que me digas cuáles son mis opciones"

### Opción A — Revenue First (monetización rápida)
1. **Sistema de membresías N0/N1/N2** — Lo que abre el negocio
2. **Integración de pagos** — Para que paguen (Tiendup o alternativa)
3. **Control de acceso por nivel** — Blur N0, bloqueos, upgrade prompts

### Opción B — Engagement First (retención y activación)
1. **Home dashboard por nivel** — Primera impresión, lo que ven al entrar
2. **Muro con tipos de publicación** — Donde se genera la comunidad
3. **Sistema de tests/gamification** — Lo que hace única a la app

### Opción C — Completa (equilibrada)
1. **Sistema de membresías** — Base de todo
2. **Muro con tipos de publicación** — Corazón de la comunidad
3. **Mi Perfil + gestión** — Donde el usuario ve su progreso

### Opción D — Mi recomendación como CTO
1. **Sistema de membresías + control de acceso** — Es el cimiento. Sin esto, nada funciona.
2. **Home dashboard por nivel** — Es lo primero que ven. Define la experiencia.
3. **Muro con tipos de publicación** — Es donde vive la comunidad. Sin muro, no hay app.

**Pablo eligió: OPCIÓN D — Recomendación CTO** ✅

1. Sistema de membresías + control de acceso
2. Home dashboard por nivel
3. Muro con tipos de publicación

> El Círculo Dorado (P07) se mantiene en Fase 3 del plan.

## PLAN DE ACCIÓN (Revisado — 8/5/2026)

### Fase 0: Setup (esta semana)
- [x] .env configurado con credenciales Supabase reales (9/5/2026)
- [x] Verificar acceso Supabase juntos ✅
- [x] Aplicar migración Fase 1 en Supabase ✅ (9/5/2026)
- [x] Push a GitHub con token temporal ✅ (9/5/2026)
- [x] Configurar Vercel + migrar dominio app.mejoraok.com — ⚠️ EN PROGRESO
  - [x] Proyecto creado en Vercel ✅
  - [x] Git conectado a GitHub ✅
  - [x] Environment Variables cargadas ✅ (9/5/2026)
  - [x] Fix build Vercel: `__dirname` → `fileURLToPath(import.meta.url)` ✅ (9/5/2026 07:33)
  - [ ] Redeploy con fix — **Pablo: hacer redeploy ahora**
  - [ ] Dominio custom `app.mejoraok.com` — pendiente
  - [ ] Verificar que la app funcione en producción
- [x] GitHub Pages como deploy alternativo (preview/borradores) ✅ (9/5/2026)
  - [x] Workflow `deploy-ghpages.yml` creado
  - [x] 404.html SPA workaround
  - [x] index.html restore script
  - [x] vite.config.ts base path dinámico (`VITE_GITHUB_PAGES`)
  - [ ] **Pablo: Activar GH Pages** — Repo → Settings → Pages → Source: "GitHub Actions"
  - [ ] URL: https://pabloeckert.github.io/MejoraApp/
- [ ] Definir alternativa de pago (Tiendup u otro)

### Fase 1: Limpieza y cimientos (Semana 1) — ✅ COMPLETADA
- [x] Migración SQL preparada (supabase/migrations/20260508_fase1_cimientos.sql)
- [x] .env configurado con Supabase real
- [x] Eliminar features no pedidas del código — 35 archivos, 3140 líneas eliminadas
- [x] Fix pre-existente: comilla faltante en vite.config.ts
- [x] Tests actualizados (273 passing, 2 pre-existentes failing)
- [x] Build verificado ✓
- [x] Aplicar migración en Supabase ✅ (9/5/2026)
- [x] Actualizar tipos de Supabase en el código ✅ (9/5/2026)
- [x] Definir sistema de tests/gamification con Pablo ✅ (9/5/2026)

### Fase 2: Sistema de membresías (Semana 2) — ✅ COMPLETADA
- [x] Lógica de acceso por nivel en toda la app (useAccessLevel + AccessGate) ✅
- [x] P01: Splash screen ✅
- [x] P03: Home dashboard por nivel ✅
- [x] BottomNav actualizada (Inicio | Contenido | Muro | Comunidad | Mentor) ✅
- [x] P02: Business Mirror Gamer ✅ (9/5/2026)
- [ ] Upgrade prompts + links de pago → mover a Fase 4 (Tiendup)

### Fase 3: Features core (Semana 3) — ✅ COMPLETADA
- [x] P04: Muro con tipos de publicación + filtro por tipo ✅ (9/5/2026)
- [x] P05: Calendario de eventos ✅ (9/5/2026)
- [x] P06: Contenido de valor (existente, funcional) ✅
- [x] P07: Círculo Dorado ✅ (9/5/2026)
- [x] P08: Botón de Emergencia ✅ (9/5/2026)

### Fase 4: Admin y pulido (Semana 4)
- [x] P09: Mi Perfil con gestión de membresía ✅ (9/5/2026)
  - Avatar + badge de nivel (N0/N1/N2/ADMIN)
  - Datos editables: nombre, empresa, cargo, nickname, whatsapp, birthday, bio, web, linkedin
  - Resultados de Business Mirror Gamer
  - Historial de pagos
  - CTA de upgrade para N0
  - Gestión de datos (Ley 25.326)
- [x] P10: Panel admin con cobranza ✅ (9/5/2026)
  - Stats: ingresos totales, mes actual, pagados, pendientes
  - Tabla de pagos con datos de usuario (nombre, empresa, email)
  - Filtro por estado (todos, pagados, pendientes, fallidos)
  - Búsqueda por usuario, email, empresa, ID externo
  - Registro manual de pagos con selector de usuario
  - Mobile: cards expandibles | Desktop: tabla
  - Tabs admin scrollables en mobile (7 tabs)
- [x] Integración Tiendup (ver TIENDUP.md para plan detallado) — código completo, pendiente config de Pablo
  - [ ] Pablo: Crear Plan N1/N2 en Tiendup
  - [x] CTO: Edge Function tiendup-webhook ✅ (9/5/2026)
  - [x] CTO: Edge Function tiendup-checkout ✅ (9/5/2026)
  - [x] CTO: tiendup.service.ts + integración UpgradePrompt ✅ (9/5/2026)
  - [ ] Pablo: Configurar webhook en panel Tiendup
  - [ ] Pablo: Agregar secrets en Supabase (TIENDUP_API_KEY, TIENDUP_WEBHOOK_SECRET)
  - [ ] Pablo: Agregar env vars en Vercel (VITE_TIENDUP_PRODUCT_N1, VITE_TIENDUP_PRODUCT_N2)
- [x] Tests E2E ✅ (9/5/2026)
  - e2e/mi-perfil.spec.ts — perfil (redirect, UI, mobile)
  - e2e/admin-cobranza.spec.ts — admin cobranza (redirect, seguridad, API)
  - e2e/bottom-nav.spec.ts — navegación (redirect, splash, PWA)
- [ ] Deploy a producción (Vercel) — ⚠️ EN PROGRESO (variables cargadas, pendiente redeploy + dominio)

## ARCHIVOS DE REFERENCIA

Los documentos de specs están en `/root/.openclaw/workspace/files/`:
- `Requerimientos_v2_MejoraContinua.docx` — Specs aprobados (V2, el definitivo)
- `Plan_Implementacion_MejoraContinua.docx` — Hoja de ruta ejecutiva
- `Mockup_Final_MejoraApp.html` — Mockup visual
- `INTEGRAL_MejoraApp_2026-04-20.docx` — Informe integral
- `MejoraApp-Design-System.docx` — Design system
- `MejoraApp-Plan-Maestro.docx` — Plan maestro multidisciplinario
- `TIENDUP.md` — Plan de integración con Tiendup (pagos)

## DB ACTUAL (28 objetos en Supabase)

**Tablas que se MANTIENEN:**
- profiles, user_roles, admin_config
- wall_posts, wall_comments, wall_likes, moderation_log
- content_categories, content_guidelines, content_posts
- diagnostic_results
- novedades
- push_subscriptions

**Tablas que se ELIMINAN (o se ignoran):**
- crm_clients, crm_products, crm_interactions, crm_interaction_lines
- mentor_conversations, mentor_messages, mentor_config
- community_challenges, challenge_participants
- user_badges, nps_responses, referrals

**Tablas que se CREAN (ya creadas):**
- events ✅
- event_registrations ✅
- payments ✅
- emergencies ✅
- business_mirror_tests ✅
- business_mirror_results ✅

**Campo que se AGREGA a profiles:**
- access_level (enum: N0, N1, N2, ADMIN)
- nickname (string, unique)
- whatsapp (string)
- birthday (date)
- membership_expires_at (datetime)

## PRÓXIMOS PASOS — Orden exacto

### Inmediato (Pablo):
1. **Pablo: Redeploy en Vercel** — Deployments → último → ⋯ → Redeploy (commits `40bc2cf` + `d42d7b1` están en main)
2. **Pablo: Verificar** que `mejoraapp-bice.vercel.app` funcione
3. **Pablo: Configurar dominio** `app.mejoraok.com` en Vercel → Settings → Domains → Add
4. **Pablo: Activar GitHub Pages** — Repo → Settings → Pages → Source: "GitHub Actions"
5. **Pablo: Configurar secrets en GitHub Actions** — Settings → Secrets → Actions:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`

### Tiendup (Pablo):
6. **Pablo: Crear Plan N1 y N2** en panel de Tiendup
7. **Pablo: Copiar product_ids** y compartirlos
8. **Pablo: Configurar webhook** en Tiendup:
   - URL: `https://pwiduojwgkaoxxuautkp.supabase.co/functions/v1/tiendup-webhook`
   - Eventos: sale.completed, subscription.activated, subscription.cancelled, subscription.expired
9. **Pablo: Agregar secrets en Supabase** (Settings → Edge Functions → Secrets):
   - `TIENDUP_API_KEY`
   - `TIENDUP_WEBHOOK_SECRET`
10. **Pablo: Agregar env vars en Vercel**:
   - `VITE_TIENDUP_PRODUCT_N1` (product_id del plan N1)
   - `VITE_TIENDUP_PRODUCT_N2` (product_id del plan N2)

### CTO (cuando Pablo complete lo anterior):
11. Verificar deploy exitoso en producción
12. Testear flujo completo: registro → upgrade → pago → webhook → nivel actualizado
13. Push final con fixes si hace falta
14. Sincronizar tipos de Supabase (types.ts tiene tablas nuevas pero operaciones resuelven a `never`)

## SESIÓN 12/5/2026 — Log

**02:43** — Pablo dice "continuemos". CTO clona repo, lee CTO-SESSION.md.
**02:44** — Estado verificado: Fase 4 completa. Vercel sigue en 404 (DEPLOYMENT_NOT_FOUND).
**02:45** — Build local ✅ (2477 módulos, 8.3s). Tests ✅ (275 passing). TS errors pre-existentes (tipos Supabase).
**02:46** — CTO diagnostica: `import.meta.dirname` puede no ser soportado en el Node de Vercel.
**02:47** — Fix aplicado (commit `42376b4`):
  - `import.meta.dirname` → `fileURLToPath(import.meta.url)` (compatible Node 18+)
  - Debug logs eliminados de vite.config.ts
  - Alias `@` simplificado (sin trailing slash regex)
  - `engines: { node: ">=22" }` en package.json
**02:48** — Fix vite.config: `import.meta.dirname` → `fileURLToPath`. Commit `42376b4`.
**03:00** — Pablo pasa token. Push a main. Pablo hace redeploy → build falla igual.
**03:12** — Pablo pasa log de Vercel: `Could not load src/integrations/supabase/client`. Mismo error que antes.
**03:15** — CTO diagnostica: `.vercelignore` tiene `supabase` (sin `/`), que ignora TODO directorio llamado `supabase` en cualquier nivel, incluyendo `src/integrations/supabase/`. **ESTE era el causa real del 404** — no el alias.
**03:16** — Fix: `supabase` → `/supabase` en `.vercelignore`. Commit `fae7af3`. Pushed.
**03:17** — **Pablo: hacer redeploy en Vercel ahora**

## SESIÓN 10/5/2026 — Log

**06:04** — Pablo dice "continuemos". CTO clona repo, lee CTO-SESSION.md.
**06:07** — Estado verificado: Fase 4 completa. Build ✅, 275 tests ✅.
**06:08** — Pablo pasa log de build Vercel fallido: `vite:load-fallback` no resuelve `client.ts`.
**06:11** — CTO diagnostica: alias `@` en formato objeto causa resolución incorrecta en Vercel.
**06:14** — Fix: alias cambiado a regex `/^@\//` + `resolve.extensions` explícitos. Commit `40bc2cf`.
**06:18** — Pablo pasa token GitHub. Push a main.
**06:19** — CTO encuentra y arregla 3 bugs adicionales:
  - `BottomNav.tsx`: prop `accent` se usaba pero no existía en el array `tabs`
  - `FeatureGate.tsx`: API incompatible con `UpgradePrompt` (props incorrectas)
  - `i18n/locales/index.ts`: 4 keys duplicadas
  - Commit `d42d7b1`, pushed.
**06:24** — Vercel sigue en 404. Pablo necesita redeploy manual.
**06:27** — Pablo pide documentar todo para retomar en próxima sesión.

## SESIÓN 9/5/2026 — Log

**07:21** — Pablo dice "continuemos". CTO lee documentación, clona repo.
**07:22** — Estado: Fase 4 completa. Pendiente: deploy Vercel + config Tiendup.
**07:23** — Pablo va a Vercel. Intenta redeploy → **BUILD FALLA** (alias `@` no resuelve).
**07:24** — CTO diagnostica: `__dirname` con `path` no funciona en entorno Vercel ESM.
**07:33** — Fix: `fileURLToPath(import.meta.url)`. Commit `691c376`, pushed a main.
**07:35** — Pablo pide GitHub Pages como segunda alternativa de deploy (borrador/preview).
**07:35** — CTO crea workflow `deploy-ghpages.yml` + 404.html SPA workaround + script restore en index.html.
**07:35** — Documentación actualizada. **Pablo: Redeploy en Vercel + activar GH Pages en repo settings.**

## NOTA DE SEGURIDAD
- Token GitHub fue compartido en el chat el 8/5/2026 — **ya fue rotado**
- Token GitHub fue compartido en el chat el 9/5/2026 (ghp_P8g...Cdym) — **ya fue rotado**
- Token GitHub fue compartido en el chat el 10/5/2026 (ghp_P8g...Cdym) — **ROTARLO después de esta sesión**
- Credenciales FTP y Supabase están en los archivos del workspace (Subida.txt, .env.example)
- **IMPORTANTE:** Nunca commitear tokens, keys o passwords al repo

---

*Documento generado por el CTO (IA) — 10 de mayo 2026*
*Fase 4 completa. Pendiente: redeploy Vercel (Pablo) + dominio + GitHub Pages + config Tiendup.*
