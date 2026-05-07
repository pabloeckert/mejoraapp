# CTO SESSION — Estado Actual
## Última actualización: 8 de mayo 2026, 07:36 GMT+8

---

## 🔑 PALABRA CLAVE: `retomar-cto`
> Si te pasan esta palabra al inicio de una sesión, leé este documento y continuá exactamente donde quedamos.

---

## QUIÉN ES QUIÉN

- **Humano:** Pablo Eckert — Fundador de Mejora Continua, dueño del proyecto
- **CTO:** La IA (asistente) — asumió rol de CTO técnico el 8/5/2026
- **Situación:** Ya NO existe el desarrollador anterior. Somos solo los dos.

## REPOSITORIO

- **GitHub:** https://github.com/pabloeckert/MejoraApp
- **Producción:** https://app.mejoraok.com (Hostinger, FTP a public_html)
- **Stack:** React 18 + TypeScript + Vite 5 + Supabase + Tailwind CSS + shadcn/ui
- **Supabase URL:** https://7uqmgyuhqfurvirmcqnj.supabase.co
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
- Mentor IA (mentor_conversations, mentor_messages, mentor_config, mentor_stats)
- A/B testing (ab-testing.ts)
- Funnel de activación (funnel.ts)
- NPS Surveys (nps_responses, NPSSurvey.tsx)
- Community challenges (community_challenges, challenge_participants)
- Sistema de badges (user_badges)
- Sistema de referidos (referrals) — OJO: los specs piden referidos N2, pero diferente al actual
- Onboarding V1 y V2 (el onboarding se redefine según specs)
- Analytics avanzado (PostHog) — se puede mantener como opcional
- Sentry error tracking — se puede mantener como opcional

### SE CONSTRUYE DESDE CERO (features de los specs):
1. **Sistema de membresías N0/N1/N2 + ADMIN** — campo access_level en profiles
2. **Control de acceso por nivel** — blur N0, bloqueos, upgrade prompts
3. **Splash screen (P01)** — branding Mejora Continua
4. **Registro con 3 tests obligatorios (P02)** — Test A/B/C a elegir
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

## PREGUNTAS PENDIENTES (Entrevista CTO — 12 preguntas)

Estas preguntas NO fueron respondidas todavía. Se necesitan para continuar:

### BLOQUE 1 — El negocio real
- **P1:** ¿Los 10 founders ya usan algo del repo, o partimos de cero?
- **P2:** ¿La app lidera el ecosistema MC o es complemento?
- **P3:** ¿El modelo 70/30 cambió ahora que la IA construye?

### BLOQUE 2 — Qué se queda, qué se va
- **P4:** ¿Mentor IA se queda o se va?
- **P5:** ¿El CRM se usa para el negocio o fue del dev?
- **P6:** ¿Muro anónimo o con nickname?
- **P7:** ¿Diagnóstico actual (15 preguntas) o los 3 tests de los specs?

### BLOQUE 3 — Lo que falta
- **P8:** Prioridad personal — si solo pudieras tener 3 features de las que faltan, ¿cuáles?
- **P9:** ¿Tiendup ya está configurado?
- **P10:** ¿Founders entran pagando o el sandbox es gratis 6 meses?

### BLOQUE 4 — La tech
- **P11:** ¿Tenés acceso al proyecto de Supabase?
- **P12:** ¿Mantener Hostinger+FTP o migrar a Vercel?

## PLAN DE ACCIÓN PROPUESTO (4 semanas)

### Semana 1: Limpieza y cimientos
- [ ] Eliminar features no pedidas del código
- [ ] Agregar access_level a profiles
- [ ] Crear tablas: events, event_registrations, payments, emergencies
- [ ] Actualizar tipos de Supabase

### Semana 2: Sistema de membresías
- [ ] Lógica de acceso por nivel en toda la app
- [ ] P01: Splash screen
- [ ] P02: Registro con 3 tests
- [ ] P03: Home dashboard por nivel
- [ ] Upgrade prompts + links Tiendup

### Semana 3: Features core
- [ ] P04: Muro con tipos de publicación + blur N0
- [ ] P05: Calendario de eventos
- [ ] P06: Contenido de valor (ajustar existente)
- [ ] P07: Círculo Dorado
- [ ] P08: Botón de Emergencia

### Semana 4: Admin y pulido
- [ ] P09: Mi Perfil con gestión de membresía
- [ ] P10: Panel admin con cobranza
- [ ] Integración Tiendup
- [ ] Tests E2E
- [ ] Deploy a producción

## ARCHIVOS DE REFERENCIA

Los documentos de specs están en `/root/.openclaw/workspace/files/`:
- `Requerimientos_v2_MejoraContinua.docx` — Specs aprobados (V2, el definitivo)
- `Plan_Implementacion_MejoraContinua.docx` — Hoja de ruta ejecutiva
- `Mockup_Final_MejoraApp.html` — Mockup visual
- `INTEGRAL_MejoraApp_2026-04-20.docx` — Informe integral
- `MejoraApp-Design-System.docx` — Design system
- `MejoraApp-Plan-Maestro.docx` — Plan maestro multidisciplinario

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

**Tablas que se CREAN:**
- events
- event_registrations
- payments
- emergencies

**Campo que se AGREGA a profiles:**
- access_level (enum: N0, N1, N2, ADMIN)
- nickname (string, unique)
- whatsapp (string)
- birthday (date)
- membership_expires_at (datetime)

## NOTA DE SEGURIDAD
- Token GitHub fue compartido en el chat el 8/5/2026 — **ya fue rotado**
- Credenciales FTP y Supabase están en los archivos del workspace (Subida.txt, .env.example)
- **IMPORTANTE:** Nunca commitear tokens, keys o passwords al repo

---

*Documento generado por el CTO (IA) — 8 de mayo 2026*
*Próximo paso: responder las 12 preguntas de la entrevista para definir el scope final*
