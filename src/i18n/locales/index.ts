/**
 * i18n — Sistema de internacionalización base
 *
 * Sistema ligero sin dependencias externas.
 * Soporta: español (es) como idioma principal, inglés (en) como preparación.
 *
 * Uso:
 *   import { useI18n } from "@/contexts/I18nContext";
 *   const { t } = useI18n();
 *   <p>{t("muro.title")}</p>
 *
 * Para agregar un idioma nuevo:
 *   1. Crear archivo src/i18n/locales/{lang}.ts
 *   2. Agregar al objeto messages en I18nContext.tsx
 *   3. Agregar al type SupportedLocale
 */

export type SupportedLocale = "es" | "en";

export const DEFAULT_LOCALE: SupportedLocale = "es";

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  es: "Español",
  en: "English",
};

// ── Español (completo) ──────────────────────────────────────────
export const es: Record<string, string> = {
  // Navegación
  "nav.contenido": "Contenido",
  "nav.diagnostico": "Mirror",
  "nav.muro": "Muro",
  "nav.novedades": "Novedades",

  // Muro
  "muro.title": "Muro Anónimo",
  "muro.placeholder": "¿Qué te está pasando con tu negocio?",
  "muro.publish": "Publicar",
  "muro.empty": "Todavía no hay posts. Sé el primero en compartir algo.",
  "muro.pull": "Jalá para actualizar",
  "muro.release": "Soltá para actualizar",
  "muro.updating": "Actualizando…",
  "muro.comment.placeholder": "Escribí un comentario…",
  "muro.comment.send": "Enviar",
  "muro.delete.confirm": "¿Eliminar este post?",
  "muro.rules.title": "Reglas de la comunidad",

  // Diagnóstico
  "diag.title": "Mirror Estratégico",
  "diag.subtitle": "8 preguntas. Mirror preciso.",
  "diag.start": "Empezar Mirror",
  "diag.next": "Siguiente",
  "diag.back": "Atrás",
  "diag.finish": "Ver resultado",
  "diag.analyzing": "Analizando tu negocio…",
  "diag.result.title": "Tu resultado",
  "diag.share": "Compartir por WhatsApp",
  "diag.download": "Descargar PDF",
  "diag.retake": "Hacerlo de nuevo",
  "diag.cta.content": "Ver contenido recomendado",

  // Contenido
  "content.title": "Contenido de Valor",
  "content.search": "Buscar contenido…",
  "content.empty": "No se encontró contenido.",
  "content.read_more": "Leer más",
  "content.all": "Todos",

  // Novedades
  "news.title": "Novedades",
  "news.empty": "Próximamente",

  // Onboarding
  "onboarding.skip": "Saltar",
  "onboarding.next": "Siguiente",
  "onboarding.start": "¡Empezar!",
  "onboarding.back": "Atrás",

  // Perfil
  "profile.title": "Completá tu perfil",
  "profile.empresa": "Empresa",
  "profile.cargo": "Cargo",
  "profile.whatsapp": "WhatsApp (opcional)",
  "profile.save": "Guardar",
  "profile.skip": "Completar después",

  // Auth
  "auth.login": "Iniciar sesión",
  "auth.signup": "Registrarse",
  "auth.email": "Email",
  "auth.password": "Contraseña",
  "auth.forgot": "¿Olvidaste tu contraseña?",
  "auth.google": "Continuar con Google",
  "auth.no_account": "¿No tenés cuenta?",
  "auth.has_account": "¿Ya tenés cuenta?",

  // Genérico
  "generic.loading": "Cargando…",
  "generic.error": "Algo salió mal",
  "generic.retry": "Intentar de nuevo",
  "generic.save": "Guardar",
  "generic.cancel": "Cancelar",
  "generic.delete": "Eliminar",
  "generic.close": "Cerrar",
  "generic.confirm": "Confirmar",
};

// ── Inglés (base, para completar después) ──────────────────────
export const en: Record<string, string> = {
  "nav.contenido": "Content",
  "nav.diagnostico": "Diagnostic",
  "nav.muro": "Wall",
  "nav.novedades": "News",
  "muro.title": "Anonymous Wall",
  "muro.placeholder": "What's happening with your business?",
  "muro.publish": "Publish",
  "muro.empty": "No posts yet. Be the first to share something.",
  "diag.title": "Strategic Diagnostic",
  "diag.subtitle": "8 questions. Precise diagnostic.",
  "diag.start": "Start diagnostic",
  "content.title": "Value Content",
  "content.search": "Search content…",
  "news.title": "News",
  "auth.login": "Log in",
  "auth.signup": "Sign up",
  "auth.email": "Email",
  "auth.password": "Password",
  "generic.loading": "Loading…",
  "generic.error": "Something went wrong",
  // ... (completar según necesidad)
};

export const messages: Record<SupportedLocale, Record<string, string>> = {
  es,
  en,
};
