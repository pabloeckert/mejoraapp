# MEJORAAPP — Plan Optimizado por Etapas

> **Fecha:** 2026-04-24
> **Base:** Auditoría técnica + análisis de código completo
> **Objetivo:** Llevar MejoraApp de MVP funcional a plataforma sólida en 4 etapas

---

## Estado Actual (Real)

| Área | Estado | Detalle |
|------|--------|---------|
| Seguridad | ✅ Sólida | RLS hardening, Edge Functions, is_admin(), moderación server-side |
| Tests | 🟡 Aceptable | 103 tests (no 24 como decía el informe original) |
| Deploy | 🟡 Funcional | FTP a Hostinger, CI/CD con GitHub Actions, rollback |
| Moderación IA | ✅ Robusta | 3 providers con fallback, rate limiting, logging |
| Observabilidad | 🔴 Ausente | Sin Sentry, sin analytics, sin métricas de moderación |
| Documentación | ✅ Consolidada | Este documento unificado |
| Staging | 🟡 Parcial | Rama `develop` creada, sin segundo proyecto Supabase |

---

## ETAPA 1 — Completar DevOps (1 semana)

> **Objetivo:** CI/CD completo, staging funcional, observabilidad básica

### 1.1 Sentry — Error Tracking
- [ ] Crear proyecto Sentry (plan free: 5K events/mes)
- [ ] Instalar `@sentry/react` + `@sentry/vite-plugin` para source maps
- [ ] Configurar DSN en `.env` como `VITE_SENTRY_DSN`
- [ ] Inicializar en `main.tsx` con environment (`production`/`staging`)
- [ ] Capturar errores no manejados + errores de Edge Functions
- **Entregable:** Errores visibles en dashboard Sentry con source maps

### 1.2 Analytics Básico
- [ ] Evaluar: Plausible (simple, privacidad, $9/mes self-hosted gratis) vs PostHog (potente, free tier generoso)
- [ ] **Recomendación:** Plausible — suficiente para métricas de comunidad, no invade privacidad
- [ ] Integrar script en `index.html`
- [ ] Trackear: pageviews, eventos de muro (post, comment, like), contenido leído
- **Entregable:** Dashboard con DAU, páginas vistas, engagement por sección

### 1.3 Logging de Moderación IA
- [ ] Dashboard en AdminSeguridad: tasa de aprobación/rechazo por provider
- [ ] Métricas: latencia promedio por provider, fallback rate, posts rechazados
- [ ] Alerta si fallback rate > 20% (indica providers caídos)
- **Entregable:** Visibilidad de salud de la moderación IA

### 1.4 Staging Real
- [ ] Crear segundo proyecto Supabase (plan free)
- [ ] Configurar `develop` branch con deploy automático a staging URL
- [ ] Variables de entorno separadas: `.env.staging` vs `.env.production`
- [ ] Documentar proceso de promoción staging → production
- **Entregable:** Flujo develop → staging → main con validación intermedia

---

## ETAPA 2 — Fortalecer Testing y Calidad (1 semana)

> **Objetivo:** Cobertura medible, calidad de código automatizada

### 2.1 Cobertura de Tests
- [ ] Configurar Vitest coverage (`@vitest/coverage-v8`)
- [ ] Script: `npm run test:coverage`
- [ ] **Objetivo:** 60% cobertura mínima
- [ ] Prioridad: auth flows, moderación, RLS policies, admin actions
- [ ] CI gate: PR no mergea si baja cobertura
- **Entregable:** Reporte de cobertura en cada PR

### 2.2 ESLint + Prettier
- [ ] `eslint.config.js` ya existe — verificar reglas activas
- [ ] Agregar `eslint-plugin-react-hooks` (ya en devDeps)
- [ ] Configurar Prettier con `.prettierrc`
- [ ] Pre-commit hook con `husky` + `lint-staged`
- [ ] CI: lint check obligatorio
- **Entregable:** Código consistente, lint en CI

### 2.3 Tests E2E (opcional según tiempo)
- [ ] Playwright para flujos críticos: registro → login → muro → admin
- [ ] Solo si el tiempo lo permite — los 103 tests unitarios cubren bien

---

## ETAPA 3 — UX y Engagement (2 semanas)

> **Objetivo:** Retención de usuarios, experiencia más completa

### 3.1 Perfil de Usuario
- [ ] Ampliar modal de perfil: bio, links sociales, avatar upload
- [ ] Perfil público visible en muro (sin datos sensibles)
- [ ] Usar Supabase Storage para avatars
- **Entregable:** Usuarios con identidad enriquecida

### 3.2 Notificaciones
- [ ] Email transaccional: respuesta a tu post, novedad publicada
- [ ] **Recomendación:** Resend (free tier: 100 emails/día, DX excelente)
- [ ] Edge Function `send-notification` con templates
- [ ] Preferencias de notificación en perfil
- **Entregable:** Usuarios notificados de actividad relevante

### 3.3 Muro — Gestión de Posts Propios
- [ ] Botón editar/eliminar en posts propios
- [ ] Soft delete (status = 'deleted') o hard delete con confirmación
- [ ] Historial de ediciones en moderation_log
- **Entregable:** Control del propio contenido

### 3.4 Diagnóstico — Historial
- [ ] Lista de diagnósticos anteriores con fechas
- [ ] Comparación visual de evolución (puntaje por categoría)
- [ ] Gráfico simple con chart library ligera
- **Entregable:** Usuario ve su progreso

### 3.5 Onboarding Mejorado
- [ ] Tour de 4 pasos: contenido → muro → diagnóstico → novedades
- [ ] Overlay con tooltips, skip option
- [ ] Persistir "completado" en localStorage
- **Entregable:** Nuevos usuarios entienden la app

---

## ETAPA 4 — Escalamiento (futuro, cuando sea necesario)

### 4.1 Migrar Hosting
- [ ] De FTP/Hostinger a Vercel o Cloudflare Pages
- [ ] Deploy atómico, preview branches, rollback nativo
- [ ] **Cuando:** Cuando el tráfico justifique o cuando Hostinger falle

### 4.2 Bundle Optimization
- [ ] Análisis con `rollup-plugin-visualizer`
- [ ] Tree shaking agresivo
- [ ] Lazy loading de componentes admin
- [ ] **Objetivo:** < 250KB gzipped

### 4.3 Contenido Programado
- [ ] Admin crea contenido con fecha de publicación futura
- [ ] Cron job o Edge Function que publique automáticamente

### 4.4 API Pública
- [ ] Endpoints REST documentados para integraciones
- [ ] API keys con rate limiting

---

## Prioridad de Ejecución

```
ETAPA 1 (ahora) → Sentry + Analytics + Logging + Staging
ETAPA 2 (semana 2) → Cobertura + Lint + CI gate
ETAPA 3 (semanas 3-4) → Perfil + Notificaciones + Muro + Diagnóstico
ETAPA 4 (cuando toque) → Hosting + Optimization + API
```

---

## Decisiones Pendientes (requieren respuesta del equipo)

1. **¿Plausible o PostHog para analytics?** → Recomiendo Plausible (simple, privacidad)
2. **¿Resend o Supabase Auth emails para notificaciones?** → Recomiendo Resend (más flexible)
3. **¿Segundo proyecto Supabase para staging o usar branches con el mismo?** → Recomiendo segundo proyecto (aislamiento real)
4. **¿Migrar hosting ahora o cuando haya problemas?** → Recomiendo esperar (Hostinger funciona, no romper lo que anda)

---

*Este plan se actualiza al completar cada tarea. Marcar con [x] al terminar.*
