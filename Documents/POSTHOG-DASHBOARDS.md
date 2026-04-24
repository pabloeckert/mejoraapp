# PostHog Dashboards — Configuración

> Guía para configurar los 3 dashboards de PostHog en https://us.posthog.com

---

## 1. Dashboard: Actividad

**Objetivo:** Monitorear salud general de la app.

| Insight | Tipo | Configuración |
|---------|------|---------------|
| **DAU (Daily Active Users)** | Trends | Event: `$pageview` · Breakdown: `distinct_id` · Unique users · Granularity: Daily |
| **WAU (Weekly Active Users)** | Trends | Event: `$pageview` · Breakdown: `distinct_id` · Unique users · Granularity: Weekly |
| **MAU (Monthly Active Users)** | Trends | Event: `$pageview` · Breakdown: `distinct_id` · Unique users · Granularity: Monthly |
| **Sesiones por día** | Trends | Event: `$pageview` · Total count · Granularity: Daily |
| **Posts por día** | Trends | Event: `publish_post` · Total count · Granularity: Daily |
| **Likes por día** | Trends | Event: `like_post` · Total count · Granularity: Daily |
| **Comentarios por día** | Trends | Event: `comment_post` · Total count · Granularity: Daily |
| **Diagnósticos por día** | Trends | Event: `complete_diagnostic` · Total count · Granularity: Daily |
| **Método de login** | Pie | Event: `login` · Breakdown: `method` (email/google/admin) |

---

## 2. Dashboard: Funnel

**Objetivo:** Medir conversión en cada paso del usuario.

### Funnel principal: Registro → Activación → Retención

```
Step 1: signup          (evento: signup)
Step 2: login           (evento: login)
Step 3: first_post      (evento: publish_post)
Step 4: first_diagnostic (evento: start_diagnostic)
Step 5: complete_diagnostic (evento: complete_diagnostic)
Step 6: return_7d       (evento: $pageview con window de 7 días)
```

### Funnel de diagnóstico

```
Step 1: start_diagnostic
Step 2: complete_diagnostic
Step 3: share_diagnostic_whatsapp
```

### Funnel de contenido

```
Step 1: view_content
Step 2: search_content o filter_category
```

### Funnel de servicios

```
Step 1: service_click
Step 2: service_whatsapp_click
```

---

## 3. Dashboard: Contenido

**Objetivo:** Entender qué contenido funciona mejor.

| Insight | Tipo | Configuración |
|---------|------|---------------|
| **Posts por categoría** | Pie | Event: `view_content` · Breakdown: `category` |
| **Contenido por tipo** | Pie | Event: `view_content` · Breakdown: `content_type` |
| **Búsquedas más frecuentes** | Table | Event: `search_content` · Breakdown: `query` · Top 20 |
| **Categorías filtradas** | Bar | Event: `filter_category` · Breakdown: `category` |
| **Badges ganados** | Bar | Event: `badge_earned` · Breakdown: `badge_slug` |
| **Onboarding completado vs skip** | Pie | Events: `onboarding_complete` vs `onboarding_skip` |
| **Perfil completado vs skip** | Pie | Events: `profile_complete` vs `profile_skip` |
| **Tabs más visitados** | Bar | Event: `tab_switch` · Breakdown: `to_tab` |

---

## 4. Insights de Retención

**En PostHog → Insights → Retention:**

| Retention | Configuración |
|-----------|---------------|
| **D1 Retention** | Event: `$pageview` · Retention type: Day 1 |
| **D7 Retention** | Event: `$pageview` · Retention type: Day 7 |
| **D30 Retention** | Event: `$pageview` · Retention type: Day 30 |

---

## 5. Filtros Recomendados

- **Por ambiente:** Filter por property `$environment` = `production`
- **Por período:** Últimos 30 días como default
- **Excluir desarrollo:** Filter `$current_url` not contains `localhost`

---

## Eventos Disponibles (25+)

### Auth
- `login` (method: email/google/admin)
- `signup` (method: email/google)
- `logout`

### Muro
- `publish_post` (char_count)
- `like_post` (post_id)
- `comment_post` (post_id, char_count)
- `delete_post` (post_id)

### Diagnóstico
- `start_diagnostic`
- `complete_diagnostic` (score, profile)
- `share_diagnostic_whatsapp` (score)
- `retake_diagnostic` (attempt)

### Contenido
- `view_content` (content_id, category, content_type)
- `search_content` (query, result_count)
- `filter_category` (category)

### Onboarding/Profile
- `onboarding_complete`
- `onboarding_skip` (step)
- `profile_complete` (has_whatsapp)
- `profile_skip`

### Navigation
- `tab_switch` (from_tab, to_tab)
- `cross_navigation` (from, to)
- `$pageview` ($current_url)

### Gamificación
- `badge_earned` (badge_slug)
- `ranking_viewed` (position)
- `profile_viewed`
- `profile_edited` (field)

### Servicios/Funnel
- `service_click` (service_id)
- `service_whatsapp_click`
- `diagnostic_cta_perfil` (perfil, puntaje)
- `diagnostic_pdf_export` (perfil)
- `content_recommendation_click` (content_id, perfil)
- `funnel_step` (step, ...data)

### Admin
- `admin_action` (action, target)

---

*Creado: 2026-04-24. Actualizar al agregar nuevos eventos.*
