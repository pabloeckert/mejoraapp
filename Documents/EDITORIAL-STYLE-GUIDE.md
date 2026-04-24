# Editorial Style Guide — MejoraApp

> Guía de escritura para mantener consistencia en todo el producto.
> Aplica a: UI copy, notificaciones, emails, contenido generado, documentación.

---

## 1. Voz y Tono

**Voz:** Directa, cercana, argentina, sin vueltas.
**Tono:** Profesional pero humano. No corporativo frío, no informal excesivo.

### Ejemplos de tono correcto
- ✅ "¿Te animás a ver cómo está tu negocio?"
- ✅ "Completá tu perfil para personalizar tu experiencia."
- ✅ "Jalá para actualizar."
- ✅ "¿Qué te está pasando con tu negocio?"

### Ejemplos de tono incorrecto
- ❌ "Le invitamos a completar su perfil." (demasiado formal)
- ❌ "Hey! 🎉 Super genial que estés acá!" (demasiado informal)
- ❌ "Se requiere completar el formulario." (pasivo, frío)

---

## 2. Voseo — Regla Absoluta

**Siempre voseo. Nunca tuteo. Nunca ustedeo.**

| ✅ Correcto | ❌ Incorrecto |
|------------|--------------|
| Completá | Completa / Complete |
| Hacé | Haz / Haga |
| Probá | Prueba / Pruebe |
| Descubrí | Descubre / Descubra |
| ¿Querés? | ¿Quieres? / ¿Quiere? |
| ¿Tenés? | ¿Tienes? / ¿Tiene? |
| ¿Podés? | ¿Puedes? / ¿Puede? |
| Mirá | Mira / Mire |
| Seguí | Sigue / Siga |
| Elegí | Elige / Elija |

### Excepciones
- **Infinitivo es neutral** — "Completar después" está bien (no es tuteo ni voseo).
- **Gerundio es neutral** — "Cargando..." está bien.
- **Imperativo con pronombre** — "Probalo", "Hacelo" (voseo + lo/la/le).

---

## 3. Escala Tipográfica

| Token | Tamaño | Uso | Ejemplo |
|-------|--------|-----|---------|
| `text-caption` | 11px | Labels secundarios, badges, metadata | "hace 2h", "(vos)", badges |
| `text-body-sm` | 13px | Texto auxiliar, descripciones cortas | Subtítulos de cards |
| `text-body` | 14px | Texto principal, párrafos | Contenido de posts |
| `text-subtitle` | 16px | Subtítulos, labels importantes | Nombres de sección |
| `text-title` | 20px | Títulos de cards, modales | Títulos de onboarding |
| `text-heading` | 24px | Títulos de página | "Algo salió mal" |
| `text-display` | 30px | Títulos hero, landing | No usado en app interna |

---

## 4. Contraste y Accesibilidad

- **Texto principal:** `text-foreground` (siempre)
- **Texto secundario:** `text-muted-foreground` (solo para metadata no crítica)
- **Texto importante secundario:** `text-foreground/70` (mejor contraste que muted)
- **Nunca** usar `text-muted-foreground` para información que el usuario NECESITE leer
- **WCAG AA mínimo:** 4.5:1 para texto normal, 3:1 para texto grande

---

## 5. Nombres de Secciones

| Sección | Nombre correcto | ❌ No usar |
|---------|----------------|-----------|
| Tab 1 | Contenido | Tips, Biblioteca |
| Tab 2 | Diagnóstico | Diagnóstico Estratégico (muy largo para nav) |
| Tab 3 | Muro | Muro Anónimo (redundante) |
| Tab 4 | Novedades | Novedades MC |

---

## 6. Mensajes de Error

**Formato:** Qué pasó + qué hacer.

| Escenario | Mensaje |
|-----------|---------|
| Error de red | "No pudimos conectar. Revisá tu conexión e intentá de nuevo." |
| Sesión expirada | "Tu sesión expiró. Volvé a iniciar sesión." |
| Campo requerido | "Completá este campo para continuar." |
| Límite de caracteres | "Máximo {n} caracteres." (sin "Has alcanzado el...") |
| Error genérico | "Algo salió mal. Intentá de nuevo en unos segundos." |

---

## 7. Mensajes de Éxito

| Escenario | Mensaje |
|-----------|---------|
| Post publicado | "¡Publicado!" |
| Perfil completado | "¡Perfil actualizado!" |
| Diagnóstico completado | "¡Listo! Mirá tu resultado." |
| Like dado | (sin mensaje, solo feedback visual) |

---

## 8. CTAs (Call to Action)

| Contexto | CTA |
|----------|-----|
| Acción principal | Verbo en imperativo voseo: "Publicá", "Completá", "Descubrí" |
| Navegación | "Ver contenido", "Hacer diagnóstico" |
| Externo (WhatsApp) | "Hablá por WhatsApp" |
| Peligroso (eliminar) | "Eliminar" (rojo, sin eufemismos) |

---

## 9. Puntuación

- **Puntos suspensivos solo en loading:** "Cargando..."
- **Signos de exclamación:** Solo en mensajes de éxito y saludos. Máximo 1 por mensaje.
- **Signos de interrogación:** Siempre de apertura y cierre: "¿Querés?"
- **Comas:** Separar cláusulas. No antes de "y" en listas simples.

---

## 10. Inglés Técnico

Nombres de features en español siempre que sea posible:

| ✅ Español | ❌ Inglés |
|-----------|----------|
| Contenido | Content |
| Diagnóstico | Diagnostic |
| Muro | Wall |
| Novedades | News/Updates |
| Perfil | Profile |
| Badges | Badges (aceptado — sin traducción clara) |
| Push | Push (aceptado — término técnico) |

---

*Última actualización: 2026-04-24. Actualizar al agregar nuevas convenciones.*
