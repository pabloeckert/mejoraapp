# CTO SESSION — Estado Actual
## Última actualización: 8 de mayo 2026, 08:04 GMT+8

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
- **Producción:** https://app.mejoraok.com → **MIGRAR A VERCEL** (mantener subdominio)
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
- **P8:** Pendiente — CTO presenta opciones (ver abajo).
- **P9:** Tiendup **NO** está configurado.
- **P10:** **NO hay sandbox de 6 meses.** Founders entran al sistema real.

### BLOQUE 4 — La tech
- **P11:** Pablo tiene acceso a Supabase. Lo pueden ver juntos.
- **P12:** **Vercel** — se puede mantener el subdominio app.mejoraok.com.

## DECISIONES CLAVE DERIVADAS

1. **Deploy:** Migrar de Hostinger+FTP → Vercel (mantener app.mejoraok.com)
2. **Muro:** Anónimo N0, nickname N1/N2
3. **Tests/Diagnóstico:** Sistema de gamificación progresiva (múltiples tests, no uno fijo)
4. **Tiendup:** NO existe — hay que buscar alternativa de pago o configurar Tiendup
5. **Mentor IA:** Se queda en el scope
6. **CRM:** Se elimina completamente
7. **Founders:** Acceso real, no sandbox

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

**¿Cuál elegís?**

## PLAN DE ACCIÓN (Revisado — 8/5/2026)

### Fase 0: Setup (esta semana)
- [ ] Configurar Vercel + migrar dominio app.mejoraok.com
- [ ] Configurar .env con credenciales Supabase reales
- [ ] Verificar acceso Supabase juntos
- [ ] Definir alternativa de pago (Tiendup u otro)

### Fase 1: Limpieza y cimientos (Semana 1)
- [ ] Eliminar features no pedidas del código (CRM, badges, referrals, NPS, funnel, A/B testing)
- [ ] Agregar access_level a profiles (N0, N1, N2, ADMIN)
- [ ] Crear tablas: events, event_registrations, payments, emergencies
- [ ] Actualizar tipos de Supabase
- [ ] Definir sistema de tests/gamification con Pablo

### Fase 2: Sistema de membresías (Semana 2)
- [ ] Lógica de acceso por nivel en toda la app
- [ ] P01: Splash screen
- [ ] P02: Registro con primer test
- [ ] P03: Home dashboard por nivel
- [ ] Upgrade prompts + links de pago

### Fase 3: Features core (Semana 3)
- [ ] P04: Muro con tipos de publicación + blur N0
- [ ] P05: Calendario de eventos
- [ ] P06: Contenido de valor (ajustar existente)
- [ ] P07: Círculo Dorado
- [ ] P08: Botón de Emergencia

### Fase 4: Admin y pulido (Semana 4)
- [ ] P09: Mi Perfil con gestión de membresía
- [ ] P10: Panel admin con cobranza
- [ ] Integración pagos
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
