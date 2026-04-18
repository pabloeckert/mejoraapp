# MejoraApp — Requerimientos y Cambios

**Última actualización:** 18 Abril 2026

---

## 1. Sistema de Respuestas en el Muro (Wall Comments)

### Requerimiento
Que en la sección Muro Anónimo los usuarios puedan responder a las publicaciones. Las publicaciones deben estar contraídas por defecto, y al tocar se expanden mostrando los comentarios.

### Cambios realizados
| Componente | Cambio |
|---|---|
| `supabase/migrations/20260418150000_add_wall_comments.sql` | Nueva tabla `wall_comments` con RLS, trigger para `comments_count`, realtime |
| `src/components/tabs/Muro.tsx` | Posts contraídos por defecto, tap para expandir y ver/escribir respuestas |
| `src/components/admin/AdminMuro.tsx` | Admin puede ver y moderar comentarios individuales |
| `src/integrations/supabase/types.ts` | Tipos actualizados: `wall_comments`, `comments_count` en `wall_posts` |

### Base de datos
- **Tabla:** `wall_comments` (id, post_id, user_id, content, status, created_at)
- **RLS:** Usuarios autenticados ven aprobados, crean propios, admin actualiza
- **Trigger:** `comments_count` se actualiza automáticamente en `wall_posts`
- **Realtime:** Habilitado para `wall_comments`

---

## 2. Contenido de Valor — Expansible + Multimedia

### Requerimiento
Que el contenido de valor sea expandible (accordion: un solo item abierto a la vez). Soporte para contenido multimedia: videos, imágenes, infografías y libros PDF descargables.

### Cambios realizados
| Componente | Cambio |
|---|---|
| `supabase/migrations/20260418160000_add_content_media_fields.sql` | Nuevos campos: `content_type`, `imagen_url`, `video_url`, `pdf_url`, `resumen` + contenido de ejemplo |
| `src/components/tabs/ContenidoDeValor.tsx` | Accordion (un solo expandido), render de video embed, imagen, descarga PDF, badges por tipo |
| `src/components/admin/AdminContenido.tsx` | Selector de tipo de contenido, campos de URL según tipo, resumen en formulario |
| `src/integrations/supabase/types.ts` | Tipos actualizados con nuevos campos en `content_posts` |

### Tipos de contenido soportados
| `content_type` | Descripción | Campo multimedia |
|---|---|---|
| `article` | Artículo de texto | `imagen_url` (opcional) |
| `video` | Video embebido | `video_url` (YouTube) |
| `infographic` | Infografía visual | `imagen_url` |
| `book` | Libro descargable | `pdf_url` + `imagen_url` (portada) |

### Contenido de ejemplo insertado (6 publicaciones)
1. "Cómo definir tu propuesta de valor en 5 minutos" — **Video**
2. "Los 7 errores que te están fundiendo" — **Infografía**
3. "Guía: Cómo armar tu primer plan de negocios" — **Libro PDF**
4. "Dejá de competir por precio. Ahora." — **Artículo con imagen**
5. "Sistema de seguimiento de clientes en 15 minutos" — **Video**
6. "Mapa de decisiones: ¿Invertir o ahorrar?" — **Infografía**

---

## 3. Unificación de Documentos

### Requerimiento
Unificar las carpetas `Documents/` y `documentos/` en una sola carpeta `Documents/`.

### Cambios realizados
- Movidos archivos de `documentos/` a `Documents/`
- Eliminada carpeta `documentos/`
- Archivos finales en `Documents/`:
  - `MejoraApp_Manual_Completo.md`
  - `Technical_Paper_PWA.docx`
  - `Informe-Tecnico-MejoraApp.docx`
  - `Tutorial-MejoraApp-Completo.docx`
  - `MejoraApp-Completo.tar.gz`
