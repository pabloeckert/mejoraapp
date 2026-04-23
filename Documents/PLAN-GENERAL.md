# MEJORAAPP — Plan General de Desarrollo

> **Objetivo final:** Transformar MejoraApp de un MVP funcional en una plataforma sólida, segura y escalable para la comunidad Mejora Continua.
>
> **Última actualización:** 2026-04-23
>
> **Estado actual:** App en producción (app.mejoraok.com), funcional con limitaciones de seguridad y arquitectura.

---

## 1. Visión General

MejoraApp es la app digital de **Mejora Continua**, una comunidad de negocios para líderes empresariales argentinos. Ofrece muro anónimo, contenido de valor, diagnóstico estratégico y panel admin.

**Stack:** React 18 + TypeScript + Vite 5 + Supabase + Tailwind CSS + shadcn/ui
**Métricas actuales:** ~11,400 líneas | 93 archivos TS/TSX | 12 tablas DB | 24 tests | 117+ commits

---

## 2. Objetivos por Etapa

### ETAPA 1 — Seguridad y Estabilización 🔴
**Prioridad:** CRÍTICA
**Estado:** ✅ Completada (2026-04-23)
**Bloquea:** Todo lo demás

| # | Tarea | Descripción |
|---|-------|-------------|
| 1.1 | Rotar credenciales expuestas | ⏳ Master password eliminada. Pendiente: tokens de sesión |
| 1.2 | Mover lógica admin a Edge Functions | ✅ admin-action con 13 acciones, todos los módulos migrados |
| 1.3 | RLS admin_config seguro | ✅ Cerrado a solo admins via política RLS + función is_admin() |
| 1.4 | Eliminar "puntito secreto" | ✅ Reemplazado por botón admin legítimo con Shield icon |
| 1.5 | Auditoría de RLS policies | ✅ 7 tablas con políticas mejoradas, función is_admin() |
| 1.6 | Revisar ofuscación de API keys | ✅ Código muerto ai.ts eliminado. IAs 100% server-side |

**Criterio de cierre:** No hay credenciales en el repo, operaciones admin protegidas server-side, RLS sin agujeros.

---

### ETAPA 2 — Arquitectura y DevOps 🟡
**Prioridad:** ALTA
**Estado:** ⏳ 4/6 completadas (2026-04-23)
**Depende de:** Etapa 1 ✅

| # | Tarea | Descripción |
|---|-------|-------------|
| 2.1 | Entorno de staging | ⏳ Rama `develop` creada. Pendiente: segundo proyecto Supabase |
| 2.2 | Sistema de migraciones SQL | ✅ 12 archivos incrementales en `supabase/migrations/` |
| 2.3 | Tests de integración | ✅ 103 tests (7 archivos), cubren flujos críticos |
| 2.4 | Monitoring y alertas | ⏳ Pendiente (Sentry o similar) |
| 2.5 | Estrategia de rollback | ✅ Workflow `rollback.yml` + health check post-deploy |
| 2.6 | PWA real | ✅ Ya existía: manifest.json + service worker con network-first |

**Criterio de cierre:** Hay staging, tests cubren flujos críticos, deploy es reversible.

---

### ETAPA 3 — Experiencia de Usuario 🟢
**Prioridad:** MEDIA
**Depende de:** Etapa 1

| # | Tarea | Descripción |
|---|-------|-------------|
| 3.1 | Notificaciones email | Alertas de respuestas en muro, novedades, recordatorios |
| 3.2 | Búsqueda de contenido | Buscar en artículos, muro, novedades |
| 3.3 | Perfil de usuario completo | Bio, avatar, empresa, links — visible para la comunidad |
| 3.4 | Onboarding mejorado | Tour interactivo que explique las 4 tabs y el diagnóstico |
| 3.5 | Diagnóstico: historial | Ver diagnósticos anteriores, comparar evolución |
| 3.6 | Muro: editar/eliminar posts | El autor puede gestionar su propio contenido |

**Criterio de cierre:** El usuario recibe notificaciones, puede buscar, tiene perfil rico.

---

### ETAPA 4 — Contenido y Engagement 🔵
**Prioridad:** MEDIA
**Depende de:** Etapa 3

| # | Tarea | Descripción |
|---|-------|-------------|
| 4.1 | Analytics de uso | Tracking de engagement: qué se lee, qué se comenta, DAU |
| 4.2 | Sistema de categorías dinámico | Admin puede crear/editar categorías desde el panel |
| 4.3 | Contenido programado | Publicaciones con fecha de aparición automática |
| 4.4 | Ranking de comunidad | Top contributors, badges, reconocimiento |
| 4.5 | Diagnóstico con IA | Análisis personalizado generado por IA al completar diagnóstico |
| 4.6 | Exportar resultados | PDF con diagnóstico + recomendaciones para compartir |

**Criterio de cierre:** Hay datos de uso, contenido se gestiona mejor, engagement crece.

---

### ETAPA 5 — Escalamiento y Optimización ⚪
**Prioridad:** BAJA (futuro)
**Depende de:** Etapas 1-4

| # | Tarea | Descripción |
|---|-------|-------------|
| 5.1 | Migrar hosting | De Hostinger+FTP a Vercel/Netlify/Fly.io |
| 5.2 | CDN y optimización de assets | Imágenes responsive, WebP, lazy loading de media |
| 5.3 | Bundle analysis | Reducir los 350KB gzipped — tree shaking, code splitting agresivo |
| 5.4 | i18n base | Preparar para multi-idioma si la comunidad crece |
| 5.5 | API pública | Endpoints para integraciones externas |
| 5.6 | App mobile nativa | Wrapper con Capacitor o React Native |

**Criterio de cierre:** Hosting moderno, bundle optimizado, preparado para crecer.

---

## 3. Flujo de Trabajo por Sesión

Cada sesión de desarrollo sigue este ciclo:

```
1. Leer este plan (PLAN-GENERAL.md)
2. Identificar la etapa y tarea actual (marcar con [x] al completar)
3. Ejecutar la tarea
4. Documentar cambios en una nota de sesión (Documents/SESION-YYYY-MM-DD.md)
5. Actualizar el estado de la tarea en este plan
6. Commit + push
```

### Registro de Sesiones

| Fecha | Etapa | Tareas | Nota |
|-------|-------|--------|------|
| 2026-04-23 | Planificación | Creación del plan general | Este documento |
| 2026-04-23 | Etapa 1 — Seguridad | Completa: Edge Functions, RLS hardening, master password eliminada | `SESION-2026-04-23.md` |
| 2026-04-23 | Etapa 2 — DevOps | CI workflow, rollback, 103 tests, migraciones SQL | `SESION-2026-04-23.md` |

---

## 4. Decisiones de Diseño Clave

1. **Supabase como backend único.** No se migra a otro BaaS. Se optimiza el uso de Supabase (Edge Functions, RLS, Realtime).
2. **Mobile-first.** La mayoría de los usuarios acceden desde celular. Toda feature se diseña para móvil primero.
3. **IA como herramienta, no como feature central.** La IA modera y genera contenido, pero la comunidad es el producto.
4. **Sin lock-in.** Si se migra hosting o se cambia algo, el código debe ser portable.
5. **Crecimiento orgánico.** No se over-engineere. Se construye lo que se necesita, no lo que podría necesitarse.

---

## 5. Tecnologías Pendientes de Evaluar

| Tech | Uso potencial | Estado |
|------|--------------|--------|
| Sentry | Error tracking | Pendiente evaluar en Etapa 2 |
| Resend | Emails transaccionales | Pendiente evaluar en Etapa 3 |
| Meilisearch | Búsqueda full-text | Pendiente evaluar en Etapa 3 |
| Vercel | Hosting moderno | Pendiente evaluar en Etapa 5 |
| Capacitor | App nativa | Pendiente evaluar en Etapa 5 |

---

*Este documento es la guía maestra del proyecto. Se actualiza al completar cada etapa.*
