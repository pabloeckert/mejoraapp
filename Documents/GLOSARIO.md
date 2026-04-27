# Glosario — MejoraApp

> Términos clave del producto. Útil para onboarding de equipo, traductores y documentación.

---

## Producto

| Término | Definición | Contexto |
|---------|-----------|----------|
| **MejoraApp** | Nombre del producto. App digital de la comunidad Mejora Continua. | Marca |
| **Mejora Continua** | Comunidad de líderes empresariales argentinos. | Marca, nombre de la organización |
| **Mirror** | Diagnóstico estratégico interactivo. El usuario responde preguntas y recibe un perfil + puntaje. | Sección principal de la app |
| **Muro** | Feed anónimo donde los miembros comparten dudas, experiencias y reflexiones sobre negocios. | Tab de la app |
| **Contenido de Valor** | Artículos, videos, infografías y PDFs generados por IA o curados por admin. | Tab de la app |
| **Novedades** | Noticias y anuncios de la comunidad. CRUD admin. | Tab de la app |
| **Servicios** | Página con servicios que ofrece la comunidad (consultoría, workshops, etc). | Sección |

## Usuarios

| Término | Definición | Contexto |
|---------|-----------|----------|
| **Miembro** | Usuario registrado de la comunidad. | General |
| **Admin** | Usuario con rol de administrador. Accede al panel admin. | Roles |
| **Moderator** | Usuario con permisos de moderación (sin acceso admin completo). | Roles |
| **Anónimo** | En el muro, todos los posts son anónimos. No se muestra nombre ni email. | Muro |

## Técnico

| Término | Definición | Contexto |
|---------|-----------|----------|
| **RLS** | Row Level Security. Políticas de seguridad a nivel de fila en PostgreSQL/Supabase. | Backend |
| **Edge Function** | Función serverless en Supabase (Deno). Ejecuta lógica de negocio del lado del servidor. | Backend |
| **Moderación IA** | Sistema que usa IA (Gemini → Groq → OpenRouter) para aprobar/rechazar posts y comentarios antes de publicarlos. | Muro |
| **Rate Limiting** | Límite de requests por minuto por usuario. Previene abuso. | Seguridad |
| **PWA** | Progressive Web App. Permite instalar la app en el celular sin pasar por App Store. | Distribución |
| **Feature Flag** | Interruptor que activa/desactiva features. Actualmente en modo ALL_FREE. | Producto |
| **Freemium** | Modelo de negocio con tier gratuito y premium. Preparado pero no activado. | Producto |
| **A/B Testing** | Sistema de pruebas A/B para optimizar onboarding y conversiones. | Growth |

## Comunidad

| Término | Definición | Contexto |
|---------|-----------|----------|
| **Badge** | Insignia que gana el usuario por acciones (primer post, 5 posts, perfil completo, etc). | Gamificación |
| **Ranking** | Leaderboard de la comunidad basado en badges y actividad. | Gamificación |
| **NPS** | Net Promotor Score. Encuesta de satisfacción (0-10). | Métricas |
| **Referido** | Sistema de invitación. Usuarios invitan a otros miembros. | Growth |

## Estilo Editorial

| Término | Regla | Ejemplo |
|---------|-------|---------|
| **Voseo** | Siempre usar "vos", nunca "tú" ni "usted". | "¿Querés?" no "¿Quieres?" |
| **Tono** | Directo, cercano, argentino, sin vueltas. | "Completá el diagnóstico" |
| **Secciones** | Nombres oficiales: Contenido · Mirror · Muro · Novedades | No "Diagnóstico", no "Wall" |

---

*Se actualiza cuando aparecen nuevos términos del producto.*
