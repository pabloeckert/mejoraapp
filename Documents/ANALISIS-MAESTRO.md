# ANALISIS-MAESTRO.md — Análisis Multidisciplinario Completo

> **Proyecto:** MejoraApp — Comunidad de Líderes Empresariales
> **Stack:** React 18 · TypeScript · Vite 5 · Supabase · Tailwind CSS · shadcn/ui
> **Producción:** https://app.mejoraok.com
> **Repo:** https://github.com/pabloeckert/MejoraApp
> **Fecha del análisis:** 2026-04-24 21:09 GMT+8
> **Alcance:** 37 perspectivas profesionales (12 Técnicas · 10 Producto/Gestión · 8 Comercial · 7 Operaciones/Legal)

---

## Protocolo de Actualización

> **Cuando digas "documentar"**, este archivo se actualiza con los trabajos realizados.
> Todos los archivos de documentación viven en la carpeta `Documents/`.
> Este documento complementa a `MEJORAAPP.md` (fuente única de verdad).

### Reglas
1. Al completar cualquier trabajo mencionado aquí, marcar con `[x]` y agregar fecha.
2. Al decir "documentar", actualizar secciones correspondientes.
3. Nunca crear archivos sueltos — todo va en `Documents/`.

---

# PARTE I — ÁREA TÉCNICA

---

## 1. Software Architect

### Estado Actual
La arquitectura es **SPA + BaaS (Supabase)**, un patrón moderno y apropiado para un MVP con equipo pequeño. El frontend es un monolito React con lazy loading por ruta. El backend es 100% Supabase (Auth + PostgreSQL + Edge Functions).

### Fortalezas
- ✅ **Separación clara:** Frontend SPA ↔ Supabase (Auth/DB/Functions)
- ✅ **Edge Functions como capa de lógica de negocio:** Moderación, admin, generación IA — todo server-side
- ✅ **Cadena de fallback IA:** Gemini → Groq → OpenRouter → null (auto-aprobado) — resiliente
- ✅ **Lazy loading por ruta:** Solo descarga código cuando se necesita
- ✅ **ErrorBoundary global:** Captura errores de rendering sin crash total

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|-----------|----------|---------|
| SA-1 | 🔴 Alto | `admin-action` es una "god function" con 13 acciones en un switch | Acoplamiento alto, difícil de testear individualmente, riesgo al escalar |
| SA-2 | 🟡 Medio | `is_admin()` es SECURITY DEFINER sin auditoría periódica | Si se compromete el rol, todo el panel cae |
| SA-3 | 🟡 Medio | CustomEvent `navigate-tab` para cross-navigation | Acoplamiento implícito entre componentes, difícil de rastrear |
| SA-4 | 🟡 Medio | Sin capa de abstracción sobre Supabase | Si se migra el backend, hay que reescribir todo el frontend |
| SA-5 | 🟢 Bajo | No hay domain modeling explícito | Tipos de Supabase auto-generados, pero sin interfaces de dominio |

### Recomendaciones
1. **Corto plazo:** Separar `admin-action` en funciones específicas (una por dominio: `admin-posts`, `admin-users`, `admin-roles`, etc.)
2. **Mediano plazo:** Crear un Repository Layer (`src/repositories/`) que encapsule todas las llamadas a Supabase
3. **Largo plazo:** Definir interfaces de dominio en `src/domain/` independientes del backend

---

## 2. Cloud Architect

### Estado Actual
- **Hosting:** Hostinger (shared hosting) via FTP
- **Backend:** Supabase (managed PostgreSQL + Edge Functions + Auth)
- **CDN:** Ninguno propio (depende de Supabase y Hostinger)
- **CI/CD:** GitHub Actions → build → FTP deploy

### Fortalezas
- ✅ Supabase como BaaS reduce complejidad operacional significativamente
- ✅ Edge Functions en Supabase = serverless sin gestión de infraestructura
- ✅ GitHub Actions como CI/CD es robusto y gratuito

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|-----------|----------|---------|
| CA-1 | 🔴 Alto | FTP deploy sin atomic deploys | Estado inconsistente si falla a mitad de upload (archivos viejos + nuevos mezclados) |
| CA-2 | 🔴 Alto | Sin CDN para assets estáticos | Tiempo de carga elevado para usuarios en Argentina (servidor lejano) |
| CA-3 | 🟡 Medio | Shared hosting en Hostinger | Sin control sobre TTFB, comparte recursos con otros sitios |
| CA-4 | 🟡 Medio | Sin edge caching para el SPA | Toda request viaja al servidor de Hostinger |
| CA-5 | 🟢 Bajo | Service Worker solo network-first | No cachea assets estáticos offline |

### Recomendaciones
1. **CRÍTICO:** Migrar a Vercel/Cloudflare Pages (deploy atómico + CDN global + edge caching + GRATIS para este tráfico)
2. **Mientras tanto:** Agregar Cloudflare como proxy DNS (CDN + SSL + protección DDoS gratis)
3. **Service Worker:** Implementar cache-first para assets estáticos, network-first para datos

---

## 3. Backend Developer

### Estado Actual
El backend es 100% Supabase: 13 tablas PostgreSQL con RLS, 7 Edge Functions en Deno, Auth integrado.

### Fortalezas
- ✅ RLS habilitado en TODAS las tablas — seguridad a nivel de base de datos
- ✅ Edge Functions con autenticación JWT + verificación de rol admin
- ✅ Rate limiting en moderación (3 posts/min, 10 comments/min)
- ✅ Moderación IA multi-provider con fallback automático
- ✅ Triggers SQL para mantener contadores sincronizados (likes_count, comments_count)

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|-----------|----------|---------|
| BE-1 | 🔴 Alto | `admin-action` acepta cualquier action string sin validación de esquema | Un error de typo causa 500 silencioso |
| BE-2 | 🟡 Medio | Rate limiting solo en moderación | `admin-action` y `generate-content` no tienen límite |
| BE-3 | 🟡 Medio | Sin logging estructurado en Edge Functions | Difícil diagnosticar errores en producción |
| BE-4 | 🟡 Medio | `moderate-comment` duplica toda la lógica de `moderate-post` | Mantenimiento doble |
| BE-5 | 🟢 Bajo | Respuestas de error inconsistentes (algunas con `{error}`, otras con `{success, rejected}`) | Frontend necesita manejar múltiples formatos |

### Recomendaciones
1. **Corto:** Agregar Zod validation en Edge Functions para params de entrada
2. **Corto:** Rate limiting en `admin-action` (ej: 30 acciones/min por admin)
3. **Mediano:** Extraer lógica de moderación a un módulo compartido Deno
4. **Mediano:** Logging estructurado (JSON) con correlation IDs

---

## 4. Frontend Developer

### Estado Actual
React 18 SPA con ~14,000 líneas de código en 93 archivos TS/TSX. Usa shadcn/ui (30+ componentes), React Query, React Router v6, Tailwind CSS.

### Fortalezas
- ✅ Lazy loading por ruta con React.lazy + Suspense
- ✅ React Query para server state (staleTime 2min, retry 1)
- ✅ Memoización de componentes pesados (PostCard, CommentItem)
- ✅ Infinite scroll con IntersectionObserver
- ✅ Pull-to-refresh con feedback visual
- ✅ ErrorBoundary global

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|-----------|----------|---------|
| FE-1 | 🔴 Alto | `Muro.tsx` tiene 14 useState separados | Estado fragmentado, difícil de mantener, re-renders innecesarios |
| FE-2 | 🟡 Medio | `sessionStorage.getItem("mc-visits")` para tab default | Se pierde al cerrar pestaña, no persiste cross-device |
| FE-3 | 🟡 Medio | CustomEvent `navigate-tab` como comunicación entre componentes | Acoplamiento implícito, difícil de debuggear |
| FE-4 | 🟡 Medio | Sin code splitting por chunk (solo por ruta) | shadcn/ui + recharts + embla = bundle grande |
| FE-5 | 🟢 Bajo | Algunos componentes no tienen displayName | React DevTools muestra "Anonymous" |
| FE-6 | 🟢 Bajo | Textarea de comentario envía con Enter sin confirmación | Envíos accidentales |

### Recomendaciones
1. **CRÍTICO:** Refactorizar Muro.tsx → useReducer + sub-componentes (PostList, CommentSection, NewPostForm)
2. **Corto:** Reemplazar CustomEvent por URL params o un TabContext
3. **Mediano:** Implementar code splitting por chunk (separar shadcn, recharts, embla)
4. **Mediano:** Migrar visit count a perfil de Supabase (campo `last_tab_preference`)

---

## 5. iOS Developer

### Estado Actual
MejoraApp es una PWA (Progressive Web App) — no hay app nativa iOS.

### Fortalezas
- ✅ PWA instalable con manifest.json configurado
- ✅ Service Worker para funcionamiento offline básico
- ✅ Meta tags para iOS (apple-mobile-web-app-capable)

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|-----------|----------|---------|
| iOS-1 | 🔴 Alto | No hay push notifications en iOS (Safari no soporta Web Push completo) | Retención limitada en iPhones (60%+ del mercado argentino) |
| iOS-2 | 🟡 Medio | Sin splash screen específico para iOS | Experiencia de inicio genérica |
| iOS-3 | 🟡 Medio | PWA se abre en Safari, no como app standalone en algunos casos | Confusión del usuario |
| iOS-4 | 🟢 Bajo | Sin haptic feedback en interacciones | Experiencia táctil inferior a nativa |

### Recomendaciones
1. **CORTO (si hay presupuesto):** Evaluar Capacitor para wrapping en app nativa — resuelve push notifications + splash screen + haptics
2. **Mientras tanto:** Implementar in-app notifications (toast realtime) como alternativa a push en iOS
3. **Largo:** Considerar React Native si la app crece significativamente

---

## 6. Android Developer

### Estado Actual
Misma situación que iOS: PWA sin app nativa.

### Fortalezas
- ✅ Android tiene mejor soporte para PWA que iOS
- ✅ Web Push funciona en Chrome Android
- ✅ Manifest.json permite instalación como app

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|-----------|----------|---------|
| AND-1 | 🟡 Medio | Sin splash screen nativo (usa fallback CSS) | Parpadeo blanco al abrir |
| AND-2 | 🟡 Medio | Service Worker network-first no cachea assets | Primera carga lenta en conexiones lentas |
| AND-3 | 🟢 Bajo | Sin Adaptive Icon para Android 8+ | Icono con fondo inconsistente en launchers |

### Recomendaciones
1. **Corto:** Agregar iconos adaptativos al manifest (maskable purpose)
2. **Corto:** Implementar cache-first en SW para assets estáticos
3. **Mediano:** Si se usa Capacitor, generar splash screens automáticamente

---

## 7. DevOps Engineer

### Estado Actual
- **CI:** GitHub Actions (test + lint + build en PRs y develop)
- **CD:** Push a main → build → FTP deploy a Hostinger
- **Staging:** Push a develop → build:staging → FTP deploy a /app-staging/
- **Rollback:** Workflow manual con commit SHA
- **Monitoring:** Sentry (error tracking) + PostHog (analytics)

### Fortalezas
- ✅ CI/CD completo con 4 workflows (ci, deploy, staging, rollback)
- ✅ Tests corren antes de cada deploy
- ✅ Health check post-deploy (curl HTTP status)
- ✅ Concurrency groups para evitar deploys paralelos
- ✅ Staging environment separado

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|-----------|----------|---------|
| DO-1 | 🔴 Alto | FTP deploy no es atómico | Posible estado inconsistente si falla a mitad del upload |
| DO-2 | 🟡 Medio | No hay notificación de deploy (Slack/Discord/email) | Equipo no sabe cuándo se deployó |
| DO-3 | 🟡 Medio | Rollback es manual (requiere buscar SHA) | Tiempo de recuperación alto en incidentes |
| DO-4 | 🟡 Medio | No hay environment protection rules en GitHub | Cualquier push a main deploya automáticamente |
| DO-5 | 🟢 Bajo | Secrets hardcodeados en workflow (usa secrets.GITHUB) | Correcto, pero sin rotación automática |

### Recomendaciones
1. **CRÍTICO:** Migrar deploy a Vercel/Cloudflare (atómico + preview deploys + rollback instantáneo)
2. **Corto:** Agregar notificación de deploy a Discord/Slack
3. **Corto:** Implementar environment protection (requerir approval para production)
4. **Mediano:** Implementar canary deployments o blue/green

---

## 8. Site Reliability Engineer (SRE)

### Estado Actual
- **Error tracking:** Sentry con user context
- **Analytics:** PostHog con 25+ eventos
- **Uptime monitoring:** Ninguno
- **SLA definido:** No

### Fortalezas
- ✅ Sentry captura errores con contexto de usuario
- ✅ ErrorBoundary previene crashes totales
- ✅ Health check post-deploy

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|-----------|----------|---------|
| SRE-1 | 🔴 Alto | No hay uptime monitoring | El sitio puede estar caído sin que nadie lo sepa |
| SRE-2 | 🔴 Alto | No hay alertas configuradas (Sentry alerts, uptime alerts) | Detección reactiva, no proactiva |
| SRE-3 | 🟡 Medio | No hay SLA ni SLO definidos | No se puede medir confiabilidad |
| SRE-4 | 🟡 Medio | No hay incident response plan | En caso de caída, no hay procedimiento |
| SRE-5 | 🟡 Medio | Health check solo en deploy, no continuo | Puede caer después del deploy |

### Recomendaciones
1. **CRÍTICO:** Configurar UptimeRobot/BetterStack (gratis) para monitoreo cada 5 minutos
2. **Corto:** Configurar Sentry alerts para errores críticos (>10/hora)
3. **Corto:** Definir SLO: 99.5% uptime, <2s TTFB
4. **Mediano:** Crear runbook de incidentes (procedimiento paso a paso)

---

## 9. Cybersecurity Architect

### Estado Actual
- **Auth:** Supabase Auth (email + Google OAuth)
- **Authorization:** RLS en todas las tablas + Edge Functions con JWT + verificación de rol
- **Rate limiting:** En moderación (3 posts/min, 10 comments/min)
- **Input validation:** Server-side en Edge Functions
- **Secrets:** GitHub Secrets para CI/CD, .env para local

### Fortalezas
- ✅ RLS habilitado en TODAS las tablas — defensa en profundidad
- ✅ Edge Functions como gatekeeper para escrituras admin
- ✅ Verificación de rol admin server-side (no depende del cliente)
- ✅ Moderación IA previene contenido dañino
- ✅ Self-demotion prevention en `remove-role`
- ✅ Rate limiting en endpoints públicos

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|-----------|----------|---------|
| SEC-1 | 🔴 Alto | Admin access via "botón Shield" es security by obscurity | Cualquiera que descubra el patrón puede intentar login admin |
| SEC-2 | 🔴 Alto | `is_admin()` SECURITY DEFINER sin auditoría | Si se compromete un rol admin, no hay detección |
| SEC-3 | 🟡 Medio | Sin Content Security Policy (CSP) | Vulnerable a XSS si se inyecta script |
| SEC-4 | 🟡 Medio | CORS `Access-Control-Allow-Origin: *` en Edge Functions | Cualquier dominio puede llamar las funciones |
| SEC-5 | 🟡 Medio | Sin rate limiting en `admin-action` | Un admin comprometido puede hacer 1000 acciones/min |
| SEC-6 | 🟡 Medio | API keys de IA en Edge Functions como env vars | Visibles en dashboard de Supabase para cualquier admin |
| SEC-7 | 🟢 Bajo | Sin security headers (X-Frame-Options, X-Content-Type-Options) | Clickjacking posible |

### Recomendaciones
1. **CRÍTICO:** Agregar CSP headers (Vite plugin o meta tag)
2. **CRÍTICO:** Restringir CORS a `app.mejoraok.com` + `localhost:8080`
3. **Corto:** Rate limiting en `admin-action` (30 acciones/min)
4. **Corto:** Logging de acciones admin con timestamp + user_id + action
5. **Mediano:** Implementar 2FA para admins (Supabase Auth lo soporta)
6. **Mediano:** Audit log de accesos admin (tabla `admin_access_log`)

---

## 10. Data Engineer

### Estado Actual
- **Database:** PostgreSQL (Supabase) con 13 tablas
- **Migrations:** 12 archivos SQL incrementales
- **Data pipeline:** Ninguno (datos viven solo en Supabase)
- **ETL:** No aplica (MVP)

### Fortalezas
- ✅ Migraciones SQL incrementales (buen control de versiones de esquema)
- ✅ Contadores denormalizados (likes_count, comments_count) para performance
- ✅ Triggers SQL para mantener consistencia

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|-----------|----------|---------|
| DE-1 | 🟡 Medio | No hay backup automatizado visible | Pérdida de datos posible si Supabase falla |
| DE-2 | 🟡 Medio | Sin data retention policy | moderation_log crece indefinidamente |
| DE-3 | 🟢 Bajo | No hay índices compuestos visibles para queries frecuentes | Performance puede degradarse con escala |
| DE-4 | 🟢 Bajo | Sin dashboard de métricas de base de datos | No se monitorea uso de storage, conexiones, etc. |

### Recomendaciones
1. **Corto:** Verificar que Supabase tenga backups habilitados (lo tiene por defecto en plan gratuito: 7 días)
2. **Corto:** Agregar índices compuestos: `(user_id, created_at)` en wall_posts, `(post_id, status)` en wall_comments
3. **Mediano:** Data retention: archivar posts eliminados >30 días
4. **Largo:** Si escala, considerar replicación read-replica

---

## 11. Machine Learning Engineer

### Estado Actual
- **IA para moderación:** Gemini → Groq → OpenRouter (fallback chain)
- **IA para generación de contenido:** Gemini → Groq
- **Modelos:** Gemini 2.0 Flash, Llama 3.3 70B, DeepSeek Chat V3
- **Temperatura:** 0.3 (conservador)
- **Sin fine-tuning:** Usa modelos base con prompts específicos

### Fortalezas
- ✅ Cadena de fallback inteligente — si un provider falla, intenta el siguiente
- ✅ Prompts específicos para contexto argentino (moderación permisiva con tono local)
- ✅ JSON parsing con regex para extraer respuesta de cualquier formato
- ✅ Auto-aprobación si todos los providers fallan (no bloquea al usuario)

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|-----------|----------|---------|
| ML-1 | 🟡 Medio | Sin evaluación de calidad de moderación | No se sabe qué tan bien modera la IA |
| ML-2 | 🟡 Medio | JSON parsing con regex es frágil | Si la IA devuelve texto antes del JSON, puede fallar |
| ML-3 | 🟡 Medio | Sin cache de respuestas de IA | Costo alto si hay posts repetidos |
| ML-4 | 🟢 Bajo | No hay logging de decisiones de moderación para auditoría | No se puede auditar qué rechazó la IA y por qué |
| ML-5 | 🟢 Bajo | Sin rate limiting por provider | Un provider puede rate-limitear y no hay backoff |

### Recomendaciones
1. **Corto:** Logging de todas las decisiones de IA (input + output + provider usado + latency)
2. **Corto:** Mejorar JSON parsing: buscar último `{...}` en vez de primero
3. **Mediano:** Evaluar calidad de moderación con dataset etiquetado (precision/recall)
4. **Mediano:** Cache de respuestas para contenido idéntico (Redis o Supabase)
5. **Largo:** Fine-tuning de modelo pequeño para moderación específica del dominio

---

## 12. QA Automation Engineer

### Estado Actual
- **Unit tests:** 103 tests, 100% passing (Vitest)
- **Integration tests:** Incluidos en los 103 (auth, muro, diagnóstico, seguridad)
- **E2E tests:** Ninguno
- **Accessibility tests:** Ninguno
- **Visual regression tests:** Ninguno

### Fortalezas
- ✅ 103 tests cubriendo flujos críticos
- ✅ Tests de seguridad (RLS, auth, admin access)
- ✅ Tests corren en CI antes de cada deploy
- ✅ Setup de testing robusto (jsdom, testing-library)

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|-----------|----------|---------|
| QA-1 | 🔴 Alto | Sin tests E2E | Flujos críticos (auth → post → diagnóstico) no verificados end-to-end |
| QA-2 | 🟡 Medio | Sin tests de accesibilidad | No se verifica WCAG compliance |
| QA-3 | 🟡 Medio | Sin visual regression testing | Cambios de UI pueden romper diseño sin detección |
| QA-4 | 🟡 Medio | No hay coverage report | No se sabe qué % del código está testeado |
| QA-5 | 🟢 Bajo | No hay test de performance (Lighthouse CI) | Regresiones de performance no detectadas |

### Recomendaciones
1. **CRÍTICO:** Implementar Playwright para E2E tests (3 flujos críticos: auth, muro, diagnóstico)
2. **Corto:** Agregar axe-core para tests de accesibilidad
3. **Corto:** Configurar coverage report en Vitest (`--coverage`)
4. **Mediano:** Visual regression con Playwright screenshots
5. **Mediano:** Lighthouse CI en GitHub Actions

---

# PARTE II — ÁREA DE PRODUCTO Y GESTIÓN

---

## 13. Product Manager

### Estado Actual
MVP funcional en producción con 4 features core: muro anónimo, contenido de valor, diagnóstico estratégico, panel admin. Comunidad de líderes empresariales argentinos.

### Fortalezas
- ✅ Nicho claro y específico (empresarios argentinos)
- ✅ Propuesta de valor diferenciada (anonimato + IA + comunidad)
- ✅ MVP funcional con usuarios reales
- ✅ Priorización correcta hasta ahora (seguridad → infraestructura → UX → datos)

### Problemas Identificados
| # | Severiedad | Problema | Impacto |
|---|------------|----------|---------|
| PM-1 | 🔴 Alto | No hay KPIs definidos ni dashboard de producto | No se puede tomar decisiones basadas en datos |
| PM-2 | 🔴 Alto | No hay roadmap público ni comunicado al equipo | Desarrollo reactivo sin visión de largo plazo |
| PM-3 | 🟡 Medio | Funnel de conversión sin medir | Diagnóstico → WhatsApp → ¿conversión? → sin datos |
| PM-4 | 🟡 Medio | Sin validación de mercado (encuestas, interviews) | Se asume que el mercado quiere lo que se está construyendo |
| PM-5 | 🟡 Medio | Features de retención incompletas (gamificación, push parcial) | Riesgo de churn alto |

### Recomendaciones
1. **CRÍTICO:** Definir KPIs: DAU, WAU, tasa completado diagnóstico, posts/usuario, retorno 7 días
2. **CRÍTICO:** Configurar dashboards en PostHog con los KPIs definidos
3. **Corto:** Roadmap Q2 2026 comunicado al equipo
4. **Mediano:** 5 entrevistas con usuarios para validar hipótesis de producto
5. **Mediano:** Definir North Star Metric (ej: "usuarios activos semanales que postean")

---

## 14. Product Owner

### Estado Actual
Backlog organizado en 6 etapas con sprints. Priorización técnica sólida.

### Fortalezas
- ✅ Priorización correcta (seguridad primero, luego infraestructura, luego UX)
- ✅ Criterios de aceptación implícitos en cada tarea
- ✅ Retrospectivas documentadas (registro de sesiones)

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| PO-1 | 🟡 Medio | Sin Definition of Done formal | Criterios inconsistentes para "completado" |
| PO-2 | 🟡 Medio | Sin backlog refinado para E5/E6 | Equipo no sabe qué viene después de E4 |
| PO-3 | 🟡 Medio | Sin sprint planning formal | Tareas se agrupan por etapa, no por sprint timebox |
| PO-4 | 🟢 Bajo | No hay acceptance criteria escrito | QA no tiene base para verificar features |

### Recomendaciones
1. **Corto:** Definir Definition of Done (code + tests + docs + deploy + analytics)
2. **Corto:** Refinar E5 con acceptance criteria por tarea
3. **Mediano:** Adoptar sprints de 2 semanas con planning/review/retro

---

## 15. Scrum Master / Agile Coach

### Estado Actual
Desarrollo en sprints informales (sesiones de trabajo). Sin ceremonias Scrum formales.

### Fortalezas
- ✅ Ritmo de desarrollo alto (muchas features en poco tiempo)
- ✅ Documentación como sustituto de retrospectivas
- ✅ Priorización colaborativa

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| SM-1 | 🟡 Medio | Sin timeboxing (sprints abiertos) | Difícil predecir cuándo se completa E4 |
| SM-2 | 🟡 Medio | Sin daily standups o equivalentes | Falta de sincronización si el equipo crece |
| SM-3 | 🟢 Bajo | Sin retrospective formal | Mejoras de proceso se pierden |

### Recomendaciones
1. **Corto:** Timebox de 2 semanas por sprint con objetivo claro
2. **Mediano:** Si el equipo crece, adoptar ceremonias ligeras (standup async + retro por escrito)

---

## 16. UX Researcher

### Estado Actual
Sin investigación de usuarios formal. Decisiones basadas en heurísticas y sentido común.

### Fortalezas
- ✅ Muro anónimo resuelve un miedo real (exposición)
- ✅ WhatsApp como CTA es culturalmente correcto para Argentina
- ✅ Social proof (post count) es una técnica de persuasión válida

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| UXR-1 | 🔴 Alto | Sin datos de comportamiento de usuario | No se sabe qué features se usan, cuáles no, dónde abandonan |
| UXR-2 | 🟡 Medio | Sin entrevistas con usuarios reales | Se asumen necesidades sin validar |
| UXR-3 | 🟡 Medio | Sin mapa de empatía del usuario | No se entiende el contexto emocional del usuario |
| UXR-4 | 🟢 Bajo | Shuffle de preguntas del diagnóstico puede confundir | Al retomar, las opciones están en otro orden |

### Recomendaciones
1. **CRÍTICO:** PostHog ya está integrado — configurar dashboards para entender comportamiento
2. **Corto:** 5 entrevistas semi-estructuradas con usuarios actuales
3. **Mediano:** Crear user personas basadas en datos reales
4. **Mediano:** Evaluar si el shuffle de opciones afecta la completitud del diagnóstico

---

## 17. UX Designer

### Estado Actual
Flujo completo de auth → onboarding → contenido → muro → diagnóstico → admin. Dark mode. Responsive.

### Fortalezas
- ✅ Onboarding progresivo con skip inteligente
- ✅ ProfileCompleteModal y Onboarding secuenciados (nunca juntos)
- ✅ Loading states descriptivos ("Cargando tu sesión…", "Verificando tu perfil…")
- ✅ Diagnóstico con historial + botón "Ver contenido" post-resultado
- ✅ Targets táctiles 44×44px (accesibilidad táctil)

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| UXD-1 | 🟡 Medio | Tab "Tips" carga primero para nuevos pero el diferencial es el Muro | Primer impacto no muestra la feature más diferenciadora |
| UXD-2 | 🟡 Medio | No hay onboarding específico del muro (anonimato = confianza) | Usuarios nuevos no entienden que pueden postear anónimo |
| UXD-3 | 🟡 Medio | Diagnóstico no indica que se puede retomar si se abandona | Usuarios pierden progreso y no vuelven |
| UXD-4 | 🟡 Medio | Scroll position se pierde al cambiar de tab | Frustración al volver al muro |
| UXD-5 | 🟢 Bajo | Doble-tap para eliminar sin affordance visual | El usuario no sabe que puede eliminar sus posts |

### Recomendaciones
1. **Corto:** Mostrar Muro como tab default para TODOS (no solo recurrentes)
2. **Corto:** Tooltip al inicio del muro: "Todo lo que publiques acá es 100% anónimo"
3. **Corto:** Banner en diagnóstico: "Tu progreso se guarda automáticamente"
4. **Mediano:** Implementar scroll position preservation con URL params por tab

---

## 18. UI Designer

### Estado Actual
Sistema de diseño basado en shadcn/ui + Tailwind CSS con tokens semánticos. Dark mode implementado.

### Fortalezas
- ✅ Sistema consistente (shadcn/ui como base)
- ✅ Dark mode correcto con ThemeContext
- ✅ Avatar con iniciales (personalización mínima)
- ✅ Cards con hover states sutiles

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| UID-1 | 🟡 Medio | Typography sin escala definida (valores ad-hoc: 10px, 11px, 15px) | Inconsistencia visual, difícil de mantener |
| UID-2 | 🟡 Medio | Contraste insuficiente en elementos secundarios (`text-[10px] text-muted-foreground`) | Falla WCAG AA |
| UID-3 | 🟡 Medio | Cards sin jerarquía visual — todas usan el mismo shadow | Difícil distinguir importancia |
| UID-4 | 🟢 Bajo | BottomNav indicador activo débil — línea h-0.5 casi invisible | Usuario no sabe en qué tab está |
| UID-5 | 🟢 Bajo | Sin sistema de spacing consistente (valores ad-hoc) | Ritmo visual irregular |

### Recomendaciones
1. **Corto:** Definir typography scale: caption(11) → body(14) → subtitle(16) → title(20) → heading(24)
2. **Corto:** Mejorar contraste: `text-muted-foreground` → `text-foreground/70` para elementos importantes
3. **Mediano:** Sistema de elevación (shadow-sm, shadow-md, shadow-lg) con reglas de aplicación
4. **Mediano:** BottomNav: indicator más visible (pill background en vez de línea)

---

## 19. UX Writer / Content Designer

### Estado Actual
Tono argentino auténtico con voseo. Microcopy con personalidad. Errores técnicos mapeados a humanos.

### Fortalezas
- ✅ "¿Te animás?", "Completá", "Jalá para actualizar" — tono local genuino
- ✅ Errores de Supabase mapeados a mensajes comprensibles
- ✅ Placeholder text con personalidad ("¿Qué te está pasando con tu negocio?")

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| UXW-1 | 🟡 Medio | Inconsistencia en voseo/tuteo | "Completá" (vos) vs "Puedes saltar" (tú) en la misma pantalla |
| UXW-2 | 🟡 Medio | "Novedades MC" en onboarding vs "Novedades" en app | Confusión del usuario |
| UXW-3 | 🟢 Bajo | Sin editorial style guide | Difícil mantener consistencia si crece el equipo |

### Recomendaciones
1. **Corto:** Auditoría completa de strings para unificar voseo
2. **Corto:** Crear editorial style guide mínimo (voseo siempre, tono directo, sin tecnicismos)
3. **Mediano:** Unificar nombres de secciones en todo el código

---

## 20. Information Architect

### Estado Actual
4 tabs principales (Muro, Contenido/Tips, Diagnóstico, Novedades) + Admin en ruta separada.

### Fortalezas
- ✅ 4 tabs claros sin overlap funcional
- ✅ Admin separado en ruta distinta (/admin)
- ✅ Tab default dinámico (Muro para recurrentes, Tips para nuevos)

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| IA-1 | 🟡 Medio | "Tips" como label es demasiado vago | Incluye artículos, videos, infografías, PDFs — no solo tips |
| IA-2 | 🟡 Medio | Servicios mezclados con novedades | Funnel de ventas disfrazado de contenido editorial |
| IA-3 | 🟢 Bajo | Sin search global | No se puede buscar en muro + contenido + novedades |

### Recomendaciones
1. **Corto:** Renombrar "Tips" → "Contenido" o "Biblioteca"
2. **Mediano:** Separar servicios en sección propia (/servicios o tab dedicado)
3. **Largo:** Search global con Meilisearch

---

## 21. Interaction Designer

### Estado Actual
Interacciones: likes con animación, pull-to-refresh, Ctrl+Enter, doble-tap delete, infinite scroll.

### Fortalezas
- ✅ Likes con feedback visual (fill + scale)
- ✅ Pull-to-refresh con 3 estados (jalá/soltá/actualizando)
- ✅ Ctrl+Enter para publicar + contador con cambio de color
- ✅ Infinite scroll con IntersectionObserver

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| IXD-1 | 🟡 Medio | Sin feedback háptico en PWA | Interacciones se sienten "vacías" en móvil |
| IXD-2 | 🟡 Medio | Enter envía comentario sin confirmación | Envíos accidentales frecuentes |
| IXD-3 | 🟡 Medio | Doble-tap para eliminar sin affordance | Usuario no descubre la funcionalidad |
| IXD-4 | 🟢 Bajo | Animaciones limitadas a fade-in | Podría ser más dinámico |

### Recomendaciones
1. **Corto:** Agregar `navigator.vibrate(10)` en likes y deletes
2. **Corto:** Shift+Enter para nueva línea, Enter solo no envía (mostrar hint)
3. **Mediano:** Swipe actions en posts (swipe left → delete, swipe right → like)

---

## 22. Service Designer

### Estado Actual
Ecosistema: Diagnóstico → WhatsApp (puente humano) → Comunidad (muro) → Contenido (educación).

### Fortalezas
- ✅ Ecosistema integrado con múltiples puntos de contacto
- ✅ WhatsApp como puente omnicanal (digital → humano)
- ✅ Diagnóstico como entry point al ecosistema

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| SD-1 | 🟡 Medio | Diagnóstico sin follow-up automatizado | Email post-diagnóstico existe pero no se sabe si se envía correctamente |
| SD-2 | 🟡 Medio | Sin integración con CRM | Leads de WhatsApp no se trackean |
| SD-3 | 🟡 Medio | PWA sin push notifications en iOS | Canal de re-engagement roto para 60%+ de usuarios |

### Recomendaciones
1. **Corto:** Verificar que el email post-diagnóstico se envía correctamente (monitorear logs de Resend)
2. **Mediano:** Integrar con HubSpot/Salesforce para trackear leads de WhatsApp
3. **Largo:** App nativa (Capacitor) para push notifications en iOS

---

## 23. UX Strategist

### Estado Actual
Nicho claro: comunidad empresarial argentina. Modelo de valor: contenido + diagnóstico + comunidad + servicios.

### Fortalezas
- ✅ Nicho específico y defensible
- ✅ Modelo de valor bilateral (valor para miembros + funnel para servicios)
- ✅ IA como diferenciador (moderación + generación de contenido)

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| UXS-1 | 🟡 Medio | Retención sin ganchos diarios | Sin push, sin gamificación, sin streaks |
| UXS-2 | 🟡 Medio | Gamificación ausente | No hay razón para volver diariamente |
| UXS-3 | 🟡 Medio | Modelo de negocio no visible en producto | Servicios enterrados en Novedades |

### Recomendaciones
1. **Corto:** Implementar gamificación básica (badges, streaks, ranking)
2. **Mediano:** Separar servicios como sección visible con CTA claro
3. **Largo:** Programa de referidos con incentivos

---

# PARTE III — ÁREA COMERCIAL Y DE CRECIMIENTO

---

## 24. Growth Manager

### Estado Actual
Sin estrategia de growth formal. Crecimiento orgánico por boca a boca.

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| GM-1 | 🔴 Alto | Sin funnel de adquisición medido | No se sabe de dónde vienen los usuarios |
| GM-2 | 🔴 Alto | Sin estrategia de activación | Usuarios se registran pero ¿qué % completa el primer post/diagnóstico? |
| GM-3 | 🟡 Medio | Sin loop de viralidad | No hay mecanismo de invitación o referidos |
| GM-4 | 🟡 Medio | Sin experimentos A/B | No se itera sobre hipótesis de conversión |

### Recomendaciones
1. **CRÍTICO:** Configurar funnel en PostHog: registro → primer post → primer diagnóstico → retorno 7 días
2. **Corto:** Agregar "Invitá a un colega" en el muro
3. **Mediano:** Experimentos A/B en onboarding (2 variantes)
4. **Largo:** Programa de referidos con gamificación

---

## 25. ASO Specialist (App Store Optimization)

### Estado Actual
PWA — no está en App Store ni Google Play. No aplica ASO tradicional.

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| ASO-1 | 🟡 Medio | No hay presencia en stores | Descubrible solo por URL directa o búsqueda web |
| ASO-2 | 🟢 Bajo | Sin share cards para WhatsApp/redes | Links compartidos no tienen preview atractivo |

### Recomendaciones
1. **Mediano:** Si se decide ir a stores (Capacitor), aplicar ASO completo
2. **Corto:** Open Graph tags para share cards en WhatsApp/Twitter/LinkedIn

---

## 26. Performance Marketing Manager

### Estado Actual
Sin inversión en paid ads. Crecimiento orgánico.

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| PMM-1 | 🟡 Medio | Sin pixel de tracking (Meta, Google) | No se puede hacer retargeting |
| PMM-2 | 🟡 Medio | Sin landing page dedicada para ads | app.mejoraok.com es la app directa, no una landing |

### Recomendaciones
1. **Mediano:** Landing page en mejoraok.com con CTA a la app + pixel de Meta
2. **Largo:** Campañas de retargeting a usuarios que abandonaron el diagnóstico

---

## 27. SEO Specialist

### Estado Actual
SPA sin SSR. Sin meta tags. Sin structured data. Sin sitemap.

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| SEO-1 | 🔴 Alto | SPA sin SSR — Google puede no indexar contenido | Invisibilidad en buscadores |
| SEO-2 | 🔴 Alto | Sin meta tags ni Open Graph | Links compartidos no tienen preview |
| SEO-3 | 🟡 Medio | Sin sitemap.xml | Google no sabe qué páginas indexar |
| SEO-4 | 🟡 Medio | Sin structured data (JSON-LD) | No aparece en rich snippets |

### Recomendaciones
1. **CRÍTICO:** Agregar meta tags + Open Graph en index.html
2. **Corto:** Crear sitemap.xml (aunque sea básico)
3. **Mediano:** Evaluar si necesita SSR (Next.js/Astro) para SEO — probablemente no para una app autenticada
4. **Mediano:** Landing page pública en mejoraok.com con SEO optimizado

---

## 28. Business Development Manager

### Estado Actual
Modelo de negocio: servicios de consultoría y eventos para empresarios. App como funnel de adquisición.

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| BDM-1 | 🟡 Medio | Sin tracking de conversiones de servicios | No se sabe cuántos leads llegan por la app |
| BDM-2 | 🟡 Medio | Servicios enterrados en Novedades | Funnel de ventas poco visible |
| BDM-3 | 🟢 Bajo | Sin partnerships visibles | Oportunidades de co-marketing perdidas |

### Recomendaciones
1. **Corto:** Tracking de clicks en CTAs de WhatsApp y servicios
2. **Mediano:** Sección de servicios dedicada con analytics
3. **Largo:** Partnerships con cámaras empresariales argentinas

---

## 29. Account Manager

### Estado Actual
Sin gestión formal de cuentas. Interacción directa vía WhatsApp.

### Recomendaciones
1. **Mediano:** CRM básico (HubSpot gratis) para trackear interacciones
2. **Largo:** Account management automatizado con segmentación

---

## 30. Content Manager

### Estado Actual
Contenido generado por IA + admin manual. 4 categorías, 4 tipos de media.

### Fortalezas
- ✅ Generación IA desde panel admin
- ✅ Categorización clara
- ✅ Moderación de calidad antes de publicar

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| CM-1 | 🟡 Medio | Sin calendario editorial | Contenido inconsistente |
| CM-2 | 🟡 Medio | Sin métricas de contenido (qué se lee más) | No se optimiza la oferta de contenido |
| CM-3 | 🟢 Bajo | Sin content recycling | Contenido viejo se pierde |

### Recomendaciones
1. **Corto:** Tracking de views por contenido en PostHog
2. **Mediano:** Calendario editorial semanal
3. **Mediano:** "Contenido destacado" rotativo en la home

---

## 31. Community Manager

### Estado Actual
Muro anónimo como espacio de comunidad. Moderación IA + manual por admin.

### Fortalezas
- ✅ Muro anónimo fomenta participación genuina
- ✅ Moderación IA previene spam y contenido dañino
- ✅ Social proof (post count) incentiva participación

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| CMM-1 | 🟡 Medio | Sin guidelines visibles para la comunidad | Reglas implícitas, no explícitas |
| CMM-2 | 🟡 Medio | Sin métricas de comunidad (DAU, posts/día, engagement rate) | No se mide la salud de la comunidad |
| CMM-3 | 🟢 Bajo | Sin eventos o actividades comunitarias | Comunidad pasiva |

### Recomendaciones
1. **Corto:** "Reglas de la comunidad" accesible desde el muro
2. **Corto:** Dashboard de métricas de comunidad en admin
3. **Mediano:** Eventos semanales ("Tema del día", "Pregunta de la semana")

---

# PARTE IV — ÁREA DE OPERACIONES, LEGAL Y ANÁLISIS

---

## 32. Business Intelligence Analyst

### Estado Actual
PostHog integrado con 25+ eventos. Sin dashboards configurados.

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| BI-1 | 🔴 Alto | Analytics implementado pero sin dashboards | Datos se recopilan pero no se analizan |
| BI-2 | 🟡 Medio | Sin funnel analysis | No se sabe dónde abandonan los usuarios |
| BI-3 | 🟡 Medio | Sin cohort analysis | No se sabe si los usuarios vuelven |

### Recomendaciones
1. **CRÍTICO:** Configurar 3 dashboards en PostHog:
   - **Actividad:** DAU, WAU, MAU, sesiones/día
   - **Funnel:** Registro → primer post → primer diagnóstico → retorno
   - **Contenido:** Posts/día, likes/día, comentarios/día, top posts
2. **Corto:** Cohort retention analysis (¿qué % vuelve a los 7 días?)

---

## 33. Data Scientist

### Estado Actual
Sin análisis de datos formal. Datos disponibles en Supabase + PostHog.

### Oportunidades
- **Análisis de moderación:** ¿Qué % de posts se rechazan? ¿Cuáles son las razones más comunes?
- **Análisis de diagnóstico:** ¿Cuál es el perfil más común? ¿Hay correlación entre perfil y engagement?
- **Predicción de churn:** ¿Qué comportamientos predicen que un usuario no vuelva?
- **Segmentación:** ¿Qué tipos de usuarios son más activos?

### Recomendaciones
1. **Mediano:** Análisis exploratorio de datos (EDA) con los primeros 30 días de datos
2. **Largo:** Modelo de predicción de churn para intervención proactiva

---

## 34. Legal & Compliance Officer

### Estado Actual
Sin política de privacidad visible. Sin términos de servicio. Sin consentimiento GDPR/LPD explícito.

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| LEG-1 | 🔴 Alto | Sin política de privacidad | Requerido por ley argentina (Ley 25.326 de Protección de Datos Personales) |
| LEG-2 | 🔴 Alto | Sin términos de servicio | Sin protección legal ante uso indebido |
| LEG-3 | 🔴 Alto | Anonimato en muro — ¿realmente anónimo? | Si un juez ordena desanonimizar, ¿hay mecanismo? |
| LEG-4 | 🟡 Medio | Sin consentimiento de cookies/tracking | PostHog y Sentry recopilan datos sin consentimiento explícito |
| LEG-5 | 🟡 Medio | Moderación IA — ¿responsabilidad del contenido? | Si la IA aprueba contenido dañino, ¿quién responde? |

### Recomendaciones
1. **CRÍTICO:** Crear política de privacidad + términos de servicio (abogado especializado)
2. **CRÍTICO:** Banner de consentimiento de cookies/tracking
3. **Corto:** Definir política de retención de datos
4. **Corto:** Mecanismo de denuncia de contenido en el muro
5. **Mediano:** Evaluar si el anonimato cumple con la normativa argentina

---

## 35. Data Protection Officer (DPO)

### Estado Actual
Sin DPO designado. Sin registro de actividades de tratamiento. Sin evaluación de impacto (DPIA).

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| DPO-1 | 🔴 Alto | Sin registro de actividades de tratamiento | Requerido por Ley 25.326 |
| DPO-2 | 🔴 Alto | Datos personales en Supabase sin cifrado a nivel de campo | Solo TLS en tránsito + RLS |
| DPO-3 | 🟡 Medio | Sin mecanismo de ejercer derechos (acceso, rectificación, eliminación) | Usuarios no pueden ver/editar/borrar sus datos |
| DPO-4 | 🟡 Medio | Sin evaluación de impacto de protección de datos (DPIA) | Requerido antes de procesar datos a escala |

### Recomendaciones
1. **CRÍTICO:** Designar DPO o responsable de protección de datos
2. **CRÍTICO:** Crear mecanismo de "Mis Datos" en perfil (ver, editar, eliminar)
3. **Corto:** Registro de actividades de tratamiento
4. **Mediano:** DPIA para el procesamiento de datos del muro anónimo

---

## 36. Customer Success Manager

### Estado Actual
Sin función de customer success. Soporte vía WhatsApp directo.

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| CSM-1 | 🟡 Medio | Sin métricas de satisfacción (NPS, CSAT) | No se mide la satisfacción del usuario |
| CSM-2 | 🟡 Medio | Sin proceso de onboarding follow-up | Después del registro, no hay check-in |
| CSM-3 | 🟢 Bajo | Sin FAQ o centro de ayuda | Usuarios no tienen autosoporte |

### Recomendaciones
1. **Corto:** NPS survey in-app después de 7 días de uso
2. **Mediano:** Email de bienvenida + tips a los 1/3/7 días
3. **Mediano:** FAQ accesible desde la app

---

## 37. Technical Support (Tier 1, 2 & 3)

### Estado Actual
Soporte informal vía WhatsApp. Sin ticketing system. Sin SLA.

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| TS-1 | 🟡 Medio | Sin sistema de tickets | Incidents no se trackean ni priorizan |
| TS-2 | 🟡 Medio | Sin knowledge base | Soporte depende del conocimiento de una persona |
| TS-3 | 🟢 Bajo | Sin auto-diagnóstico de problemas comunes | Cada issue requiere intervención manual |

### Recomendaciones
1. **Corto:** Canal de soporte en la app (form que genera ticket en email)
2. **Mediano:** Knowledge base con problemas comunes y soluciones
3. **Largo:** Chatbot de soporte con IA

---

## 38. Revenue Operations (RevOps)

### Estado Actual
Sin operaciones de revenue formal. Servicios de consultoría como fuente de ingreso principal.

### Problemas Identificados
| # | Severidad | Problema | Impacto |
|---|------------|----------|---------|
| REV-1 | 🟡 Medio | Sin tracking de revenue por canal | No se sabe cuánto ingresa por la app vs otros canales |
| REV-2 | 🟡 Medio | Sin pipeline de ventas visible | Oportunidades se pierden |
| REV-3 | 🟢 Bajo | Sin pricing strategy para servicios premium | Oportunidad de monetización no explorada |

### Recomendaciones
1. **Mediano:** CRM básico para trackear pipeline de servicios
2. **Largo:** Evaluar freemium/premium para features avanzadas de la app

---

# PARTE V — RESUMEN EJECUTIVO Y PRIORIZACIÓN

---

## Hallazgos Críticos (Requieren Atención Inmediata)

| # | Perspectiva | Hallazgo | Prioridad |
|---|-------------|----------|-----------|
| 1 | Legal | Sin política de privacidad ni términos de servicio | 🔴 CRÍTICO |
| 2 | Security | CORS `*` en Edge Functions | 🔴 CRÍTICO |
| 3 | SRE | Sin uptime monitoring | 🔴 CRÍTICO |
| 4 | BI | Analytics implementado pero sin dashboards | 🔴 CRÍTICO |
| 5 | Growth | Sin funnel de adquisición medido | 🔴 CRÍTICO |
| 6 | SEO | Sin meta tags ni Open Graph | 🔴 ALTO |
| 7 | DevOps | FTP deploy no atómico | 🔴 ALTO |
| 8 | Cloud | Sin CDN para assets | 🔴 ALTO |
| 9 | Frontend | Muro.tsx con 14 useState | 🔴 ALTO |
| 10 | Architecture | admin-action god function | 🔴 ALTO |

## Puntuación por Área

| Área | Puntuación | Estado |
|------|-----------|--------|
| Seguridad (RLS, Auth, Edge Functions) | 8/10 | ✅ Sólido con mejoras menores |
| Backend (Supabase, Edge Functions) | 7/10 | ✅ Funcional, necesita refactor |
| Frontend (React, TypeScript) | 7/10 | ✅ Funcional, necesita refactor Muro |
| UX/UI | 7/10 | ✅ Buena base, inconsistencias menores |
| DevOps/CI-CD | 6/10 | ⚠️ Funcional pero FTP es riesgoso |
| Analytics/BI | 4/10 | ⚠️ Implementado sin dashboards |
| Legal/Compliance | 2/10 | 🔴 Crítico — sin documentos legales |
| Growth/Marketing | 2/10 | 🔴 Sin estrategia formal |
| Calidad/Testing | 6/10 | ⚠️ Tests buenos, falta E2E |
| Documentación | 8/10 | ✅ Excelente |

---

# PARTE VI — PLAN OPTIMIZADO POR ETAPAS

---

## ETAPA 4 — Analytics y Retención (en progreso)

### Sprint 4.3 — Engagement (SEMANA 1-2)
- [ ] 4.3.1 Gamificación: badges por actividad (primer post, 10 posts, 5 diagnósticos)
- [ ] 4.3.2 Ranking de comunidad (top contributors visible en muro)
- [ ] 4.3.3 Perfil de usuario completo (bio, avatar upload, empresa, links)
- [ ] 4.3.4 Contenido programado (fecha de publicación futura desde admin)

### Sprint 4.4 — Funnel y Optimización (SEMANA 2-3)
- [ ] 4.4.1 Separar servicios de novedades — sección propia con tracking
- [ ] 4.4.2 CTA de consultoría post-diagnóstico con tracking de conversión
- [ ] 4.4.3 Diagnóstico con recomendación de contenido basada en perfil
- [ ] 4.4.4 Exportar resultados de diagnóstico a PDF
- [ ] 4.4.5 Configurar dashboards PostHog (Actividad, Funnel, Contenido)

---

## ETAPA 5 — Calidad, Robustez y Legal

### Sprint 5.1 — Legal y Compliance ✅ COMPLETO (2026-04-24)
- [x] 5.1.1 Política de privacidad: `public/politica-privacidad.html` — Ley 25.326, 12 secciones, derechos ARCO, contacto AAIP
- [x] 5.1.2 Términos de servicio: `public/terminos-servicio.html` — 12 secciones, uso aceptable, jurisdicción Argentina
- [x] 5.1.3 Banner cookies: `CookieConsent.tsx` — bloquea PostHog hasta aceptar, persiste en localStorage
- [x] 5.1.4 "Mis Datos": `DataManagement.tsx` — ver, editar, exportar JSON, eliminar cuenta con confirmación
- [x] 5.1.5 Reglas comunidad: `CommunityRules.tsx` — expandible en muro, 3 permitidas + 3 prohibidas

### Sprint 5.2 — Testing y Calidad ✅ COMPLETO (2026-04-24)
- [x] 5.2.1 Tests E2E Playwright: `e2e/auth.spec.ts` (8 tests), `e2e/navigation.spec.ts` (7 tests), `e2e/accessibility.spec.ts` (7 tests). Config: `playwright.config.ts` con Chromium + Mobile.
- [x] 5.2.2 Tests accesibilidad: axe-core con `@axe-core/playwright`. Tests de WCAG 2.1 AA en auth, privacy, terms. Heading hierarchy, keyboard access, labels, color contrast.
- [x] 5.2.3 Coverage report: vitest.config.ts con v8 provider, thresholds (50% statements), HTML+LCOV output. CI workflow actualizado con upload-artifact.
- [x] 5.2.4 Refactor Muro.tsx: hooks extraídos `useWallInteractions` + `usePullToRefresh`. Componentes `PostCard` + `CommentItem` memoizados. Reducción de 14 useState a composición limpia.

### Sprint 5.3 — UX Polish (SEMANA 5-6)
- [ ] 5.3.1 Typography scale definida
- [ ] 5.3.2 Scroll position preservation al cambiar tab
- [ ] 5.3.3 Editorial style guide (voseo consistente)
- [ ] 5.3.4 SEO básico (meta tags, Open Graph, sitemap)
- [ ] 5.3.5 Renombrar "Tips" → "Contenido" o "Biblioteca"

---

## ETAPA 6 — Escalamiento

### Sprint 6.1 — Infraestructura (SEMANA 7-8)
- [ ] 6.1.1 Migrar hosting a Vercel/Cloudflare Pages (deploy atómico + CDN)
- [ ] 6.1.2 CSP headers + CORS restringido
- [ ] 6.1.3 Uptime monitoring (BetterStack/UptimeRobot)
- [ ] 6.1.4 Sentry alerts para errores críticos
- [ ] 6.1.5 Separar `admin-action` en funciones específicas

### Sprint 6.2 — Growth y Monetización (SEMANA 8-10)
- [ ] 6.2.1 Landing page pública con SEO optimizado
- [ ] 6.2.2 Programa de referidos básico
- [ ] 6.2.3 Integración CRM (HubSpot gratis)
- [ ] 6.2.4 NPS survey in-app
- [ ] 6.2.5 Evaluar modelo freemium/premium

### Sprint 6.3 — Escalamiento Técnico (SEMANA 10-12)
- [ ] 6.3.1 Repository Layer para abstraer Supabase
- [ ] 6.3.2 i18n base (multi-idioma)
- [ ] 6.3.3 Bundle analysis y code splitting avanzado
- [ ] 6.3.4 Evaluar Capacitor para app nativa

---

## Cronograma Consolidado

```
SEMANA 1-2:  Sprint 4.3 Engagement (gamificación, ranking, perfil)
SEMANA 2-3:  Sprint 4.4 Funnel + Dashboards PostHog
SEMANA 3-4:  Sprint 5.1 Legal ⚠️ PRIORIDAD
SEMANA 4-5:  Sprint 5.2 Testing (E2E, accesibilidad, refactor Muro)
SEMANA 5-6:  Sprint 5.3 UX Polish (typography, SEO, style guide)
SEMANA 7-8:  Sprint 6.1 Infraestructura (Vercel, CSP, monitoring)
SEMANA 8-10: Sprint 6.2 Growth (landing, referidos, CRM, NPS)
SEMANA 10-12: Sprint 6.3 Escalamiento (repo layer, i18n, Capacitor)
```

**Tiempo total estimado:** 12 semanas (3 meses)
**Prioridad inmediata:** Legal (5.1) + Dashboards (4.4.5) + Uptime monitoring (6.1.3)

---

# PARTE VII — ÍNDICE DE DOCUMENTOS EN Documents/

| Archivo | Propósito | Se actualiza cuando... |
|---------|-----------|----------------------|
| `MEJORAAPP.md` | Fuente única de verdad del proyecto | Se dice "documentar" |
| `ANALISIS-MAESTRO.md` | Este documento — análisis multidisciplinario completo | Se completa una tarea del plan |
| `SESSION-PROMPT.md` | Prompt de inicio para próxima sesión | Al inicio de cada sesión |
| `PUSH_SUBSCRIPTIONS.sql` | Script SQL tabla push_subscriptions + RLS | Solo si se modifica el esquema |
| `MIGRACION-SEGURIDAD-2026-04-23.sql` | Script SQL de hardening (ejecutado) | Archivo histórico, no se modifica |

---

*Documento generado el 2026-04-24 21:09 GMT+8. Se actualiza al decir "documentar" o al completar tareas del plan.*
