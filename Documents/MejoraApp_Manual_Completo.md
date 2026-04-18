# MejoraApp — Manual Completo

## 1. Descripción del Proyecto

MejoraApp es una aplicación web progresiva (PWA) diseñada para emprendedores argentinos. Ofrece herramientas de diagnóstico de negocio, contenido de valor, un muro anónimo para compartir experiencias y una comunidad interactiva.

## 2. Stack Tecnológico

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui + Radix UI
- **Backend:** Supabase (Auth, Database, Realtime, Edge Functions)
- **Estado:** TanStack React Query
- **IA:** Integración multi-proveedor (Gemini, OpenAI, Groq, OpenRouter)
- **PWA:** Service Worker para instalación offline

## 3. Módulos Principales

### 3.1 Diagnóstico
Test diagnóstico interactivo que evalúa la salud del negocio del usuario en múltiples dimensiones.

### 3.2 Contenido de Valor
Feed de contenido educativo con soporte para múltiples formatos:
- **Artículos** — Texto con imagen opcional
- **Videos** — Embed de YouTube
- **Infografías** — Imágenes desplegables
- **Libros PDF** — Descarga directa

Comportamiento accordion: solo un contenido expandido a la vez.

### 3.3 Muro Anónimo
Publicaciones anónimas moderadas por IA con sistema de:
- Publicación anónima (moderada automáticamente)
- Likes
- Respuestas/comentarios (colapsados por defecto, expandibles)
- Tiempo real (Supabase Realtime)

### 3.4 Comunidad
Espacio para interacción entre miembros de la comunidad.

### 3.5 Panel de Administración
- Moderación del muro (posts y comentarios)
- Gestión de contenido (crear, editar, generar con IA)
- Gestión de usuarios y roles
- Configuración de proveedores de IA

## 4. Base de Datos (Principales Tablas)

| Tabla | Descripción |
|---|---|
| `profiles` | Perfiles de usuario |
| `wall_posts` | Publicaciones del muro anónimo |
| `wall_comments` | Respuestas a publicaciones del muro |
| `wall_likes` | Likes en publicaciones |
| `content_posts` | Contenido de valor |
| `content_categories` | Categorías de contenido |
| `moderation_log` | Log de moderación |
| `user_roles` | Roles de usuario (admin, moderator, user) |

## 5. Configuración de IA

La app soporta múltiples proveedores de IA para generación de contenido y moderación:
- Google Gemini (recomendado, con API key gratuita)
- OpenAI
- Groq
- OpenRouter

La moderación del muro usa IA para filtrar contenido inapropiado automáticamente.

## 6. Instalación como PWA

El usuario puede instalar la app desde el navegador:
1. Abrir la URL de la app
2. El navegador mostrará "Agregar a pantalla de inicio"
3. Confirmar la instalación
4. La app funciona offline parcialmente

## 7. Estructura de Archivos

```
mejoraapp/
├── Documents/              # Documentación del proyecto
├── src/
│   ├── components/
│   │   ├── tabs/           # Pestañas principales
│   │   ├── admin/          # Panel de administración
│   │   └── ui/             # Componentes de UI
│   ├── contexts/           # Contextos de React
│   ├── data/               # Datos estáticos
│   ├── integrations/       # Integraciones (Supabase)
│   ├── pages/              # Páginas principales
│   ├── services/           # Servicios (IA)
│   └── hooks/              # Custom hooks
├── supabase/
│   └── migrations/         # Migraciones SQL
└── public/                 # Assets estáticos
```

---

*Documento actualizado: 18 Abril 2026*
