

# Plan: MejoraApp — MVP v1

## Resumen

Construir la app **MejoraApp** con 3 secciones principales + test de diagnóstico como onboarding opcional. La app es 100% gratuita, sin anuncios, diseñada para generar masa crítica antes de monetizar.

## Branding

- **Colores**: Rojo `#D9072D`, Azul oscuro `#020659`, Azul `#1C4D8C`, Amarillo `#F2BB16`, Negro `#0D0D0D`
- **Colores del diagnóstico** (variante suave): Azul `#495F93`, Rojo `#C64E4A`, Amarillo `#E5C34B`
- **Tipografía**: Segoe UI / system font stack
- **Logos**: Se integran los 2 logos proporcionados (horizontal con "Networking y Soluciones" y versión "Comunidad de Negocios")

## Arquitectura de la App

```text
┌─────────────────────────────────────────┐
│           Auth (Login/Registro)          │
│   Email + Google + Microsoft + 2FA      │
│   + Opción "Recordarme"                 │
├─────────────────────────────────────────┤
│     Onboarding (opcional)               │
│     Test Diagnóstico (8 preguntas)      │
│     → Resultado con perfil              │
├─────────┬──────────┬────────────────────┤
│ Tab 1   │ Tab 2    │ Tab 3              │
│Contenido│ Muro     │ Novedades MC       │
│de Valor │(anónimo) │                    │
└─────────┴──────────┴────────────────────┘
```

## Fases de implementación

### Fase 1: Infraestructura y Auth
- Activar Lovable Cloud (Supabase)
- Configurar autenticación: Email/password + Google + Microsoft
- Implementar 2FA, "Recordarme" y reset de password
- Crear tablas: `profiles`, `user_roles`, `diagnostic_results`
- Crear página de login/registro con branding MC
- Copiar logos al proyecto

### Fase 2: Test de Diagnóstico
- Portar el widget HTML del diagnóstico a React (8 preguntas, 6 perfiles)
- Mantener toda la lógica existente: aleatorización de preguntas/opciones, scoring, detección de perfil (SATURADO, INVISIBLE, LIDER_SOLO, DESCONECTADO, ESTANCADO, NUEVA_GEN)
- Mostrar resultados con frases espejo, síntomas y CTA
- Guardar resultado en la tabla `diagnostic_results`
- Ofrecer el test post-registro como onboarding opcional ("tentador pero optativo")
- Adaptar el CTA final para que lleve a WhatsApp (número: 543764358152)

### Fase 3: Contenido de Valor (Tab 1)
- Crear tabla `content_posts` (título, cuerpo, categoría, fecha, métricas)
- Feed de artículos/posts con diseño tipo card
- Edge function con Lovable AI para generar contenido desde cero basado en manual de marca, buyer personas y objetivos comerciales
- Sistema de métricas: vistas, likes, engagement por post
- Panel admin para vos: aprobar/editar contenido generado, ver métricas

### Fase 4: Muro Anónimo (Tab 2)
- Crear tabla `wall_posts` (contenido, user_id oculto, fecha, status)
- Feed de publicaciones anónimas (solo consultas, nada de ventas/promos/anuncios)
- Edge function con Lovable AI para moderación automática:
  - Analiza cada post contra las reglas (no ventas, no promos, no spam)
  - Banea/advierte automáticamente con notificación al admin
  - El admin puede levantar o excluir definitivamente al usuario
- Tabla `moderation_log` para historial detallado de cada acción de la IA

### Fase 5: Novedades MC (Tab 3)
- Sección estática/dinámica con contenido de Mejora Continua
- Cards para: consultoría, eventos, CRM propio, servicios
- Contacto directo (WhatsApp, email)
- Venta sutil y encubierta — información de valor que menciona los servicios sin ser invasiva
- Admin puede crear/editar novedades

### Fase 6: Panel Admin
- Vista protegida solo para admin (role-based con `user_roles`)
- Dashboard con métricas: usuarios registrados, diagnósticos completados, actividad del muro, engagement del contenido
- Gestión de moderación: ver casos flaggeados por IA, levantar/excluir usuarios
- Gestión de contenido: revisar/aprobar/editar posts generados por IA

## Detalle técnico

- **Backend**: Lovable Cloud (Supabase) con RLS en todas las tablas
- **IA**: Lovable AI Gateway (`google/gemini-3-flash-preview`) via edge functions para:
  - Generación de contenido (con system prompt que incluye buyer personas, manual de marca, objetivos)
  - Moderación del muro (con reglas claras de lo permitido/prohibido)
- **Auth**: Supabase Auth con providers Email, Google, Microsoft
- **Navegación**: Bottom tab bar mobile-first (3 tabs), responsive
- **Tablas principales**: `profiles`, `user_roles`, `diagnostic_results`, `content_posts`, `wall_posts`, `moderation_log`, `novedades`

## Orden de entrega sugerido

Dado el volumen, sugiero construir por fases aprobadas:
1. Auth + Branding + Layout con tabs (base funcional)
2. Test de Diagnóstico integrado
3. Contenido de Valor + IA
4. Muro Anónimo + Moderación IA
5. Novedades MC
6. Panel Admin

Cada fase se puede probar antes de avanzar a la siguiente.

