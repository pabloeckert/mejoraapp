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
Acceso protegido por contraseña maestra (SHA-256 hash) con recuperación por preguntas de seguridad.
- Moderación del muro (posts y comentarios)
- Gestión de contenido (crear, editar, generar con IA)
- Gestión de usuarios y roles (tabla completa con búsqueda y edición)
- Configuración de proveedores de IA
- Configuración de seguridad (cambiar contraseña y preguntas)

**Flujo de acceso admin:**
1. Usuario logueado → `/admin`
2. Si no es admin → redirige a `/`
3. Si es admin → pide contraseña maestra (AdminGate)
4. Sesión válida por 4 horas, luego se bloquea automáticamente
5. Recuperación por preguntas de seguridad si se olvida la contraseña

## 4. Registro y Perfil de Usuario

- **Registro por email:** Campos Nombre + Apellido + Email + Password
- **Registro por Google:** `full_name` se divide automáticamente en nombre y apellido
- **Primer login:** Modal para completar Empresa, Cargo, WhatsApp
- **Admin:** Ve todos los datos en la tabla de usuarios con búsqueda y edición

## 5. Base de Datos (Principales Tablas)

| Tabla | Descripción |
|---|---|
| `profiles` | Perfiles de usuario (nombre, apellido, empresa, cargo, email, teléfono) |
| `admin_config` | Configuración admin (hash SHA-256, preguntas de seguridad) |
| `wall_posts` | Publicaciones del muro anónimo (likes_count, comments_count) |
| `wall_comments` | Respuestas a publicaciones del muro |
| `wall_likes` | Likes en publicaciones |
| `content_posts` | Contenido de valor (article, video, infographic, book) |
| `content_categories` | Categorías de contenido |
| `moderation_log` | Log de moderación automática por IA |
| `user_roles` | Roles de usuario (admin, moderator, user) |

## 6. Configuración de IA

La app soporta múltiples proveedores de IA para generación de contenido y moderación:
- Google Gemini (recomendado, con API key gratuita)
- OpenAI
- Groq
- OpenRouter

La moderación del muro usa IA para filtrar contenido inapropiado automáticamente.

## 7. Instalación como PWA

El usuario puede instalar la app desde el navegador:
1. Abrir la URL de la app
2. El navegador mostrará "Agregar a pantalla de inicio"
3. Confirmar la instalación
4. La app funciona offline parcialmente

## 8. Estructura de Archivos

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

*Documento actualizado: 19 Abril 2026*
