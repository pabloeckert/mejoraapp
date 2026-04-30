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
  "nav.comunidad": "Comunidad",
  "nav.mentor": "Mentor",
  "nav.novedades": "Novedades",

  // Mentor IA
  "mentor.title": "Mentor IA",
  "mentor.subtitle": "Tu asistente de negocios personalizado",
  "mentor.welcome.greeting": "¡Hola!",
  "mentor.welcome.description": "Soy tu Mentor IA de Mejora Continua",
  "mentor.welcome.prompt": "Preguntame sobre estrategia, objetivos, crecimiento o cualquier desafío de tu negocio.",
  "mentor.welcome.start": "Para empezar",
  "mentor.welcome.no_diagnostic": "Hacé el Mirror estratégico para obtener recomendaciones más personalizadas",
  "mentor.quick.strategy": "Estrategia de negocio",
  "mentor.quick.diagnostic": "Analizar mi diagnóstico",
  "mentor.quick.goals": "Definir objetivos",
  "mentor.quick.problem": "Resolver un problema",
  "mentor.input.placeholder": "Escribí tu consulta...",
  "mentor.input.send": "Enviar",
  "mentor.input.limit": "El Mentor IA puede cometer errores. Verificá la información importante.",
  "mentor.history.title": "Conversaciones",
  "mentor.history.empty": "Todavía no tenés conversaciones",
  "mentor.history.empty_hint": "Empezá a chatear con tu Mentor IA",
  "mentor.history.new": "Nueva conversación",
  "mentor.history.today": "Hoy",
  "mentor.history.yesterday": "Ayer",
  "mentor.error.load": "Error al cargar mensajes",
  "mentor.error.send": "Error al enviar mensaje",
  "mentor.error.session": "No hay sesión activa",
  "mentor.error.unavailable": "El Mentor IA no está disponible en este momento",
  "mentor.error.long": "Mensaje demasiado largo (máx 1000 caracteres)",
  "mentor.error.required": "Mensaje requerido",

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

  // Gamificación
  "gamification.badges": "Tus badges",
  "gamification.ranking": "Ranking",
  "gamification.earned": "Desbloqueados",
  "gamification.new": "¡Badge desbloqueado!",

  // Servicios
  "services.title": "Servicios",
  "services.whatsapp": "Consultanos por WhatsApp",

  // Admin
  "admin.title": "Panel de administración",
  "admin.users": "Usuarios",
  "admin.content": "Contenido",
  "admin.wall": "Muro",
  "admin.news": "Novedades",
  "admin.security": "Seguridad",
  "admin.ia": "IA",
  "admin.crm": "CRM",

  // Cookie consent
  "cookies.title": "Cookies",
  "cookies.message": "Usamos cookies para mejorar tu experiencia.",
  "cookies.accept": "Aceptar",
  "cookies.reject": "Rechazar",

  // Genérico
  "generic.loading": "Cargando…",
  "generic.error": "Algo salió mal",
  "generic.retry": "Intentar de nuevo",
  "generic.save": "Guardar",
  "generic.cancel": "Cancelar",
  "generic.delete": "Eliminar",
  "generic.close": "Cerrar",
  "generic.confirm": "Confirmar",
  "generic.search": "Buscar…",
  "generic.no_results": "Sin resultados",
  "generic.success": "Operación exitosa",
};

// ── Inglés (base, para completar después) ──────────────────────
export const en: Record<string, string> = {
  "nav.contenido": "Content",
  "nav.diagnostico": "Diagnostic",
  "nav.muro": "Wall",
  "nav.comunidad": "Community",
  "nav.mentor": "Mentor",
  "nav.novedades": "News",

  // Mentor AI
  "mentor.title": "AI Mentor",
  "mentor.subtitle": "Your personalized business assistant",
  "mentor.welcome.greeting": "Hello!",
  "mentor.welcome.description": "I'm your AI Mentor from Mejora Continua",
  "mentor.welcome.prompt": "Ask me about strategy, goals, growth, or any business challenge.",
  "mentor.welcome.start": "To get started",
  "mentor.welcome.no_diagnostic": "Take the strategic Mirror to get more personalized recommendations",
  "mentor.quick.strategy": "Business strategy",
  "mentor.quick.diagnostic": "Analyze my diagnostic",
  "mentor.quick.goals": "Define goals",
  "mentor.quick.problem": "Solve a problem",
  "mentor.input.placeholder": "Type your question...",
  "mentor.input.send": "Send",
  "mentor.input.limit": "The AI Mentor may make mistakes. Verify important information.",
  "mentor.history.title": "Conversations",
  "mentor.history.empty": "You don't have any conversations yet",
  "mentor.history.empty_hint": "Start chatting with your AI Mentor",
  "mentor.history.new": "New conversation",
  "mentor.history.today": "Today",
  "mentor.history.yesterday": "Yesterday",
  "mentor.error.load": "Error loading messages",
  "mentor.error.send": "Error sending message",
  "mentor.error.session": "No active session",
  "mentor.error.unavailable": "The AI Mentor is not available right now",
  "mentor.error.long": "Message too long (max 1000 characters)",
  "mentor.error.required": "Message required",
  "muro.title": "Anonymous Wall",
  "muro.placeholder": "What's happening with your business?",
  "muro.publish": "Publish",
  "muro.empty": "No posts yet. Be the first to share something.",
  "muro.comment.placeholder": "Write a comment…",
  "muro.comment.send": "Send",
  "muro.delete.confirm": "Delete this post?",
  "muro.rules.title": "Community rules",
  "diag.title": "Strategic Diagnostic",
  "diag.subtitle": "8 questions. Precise diagnostic.",
  "diag.start": "Start diagnostic",
  "diag.next": "Next",
  "diag.back": "Back",
  "diag.finish": "See result",
  "diag.analyzing": "Analyzing your business…",
  "diag.share": "Share via WhatsApp",
  "diag.download": "Download PDF",
  "diag.retake": "Retake",
  "diag.cta.content": "View recommended content",
  "content.title": "Value Content",
  "content.search": "Search content…",
  "content.empty": "No content found.",
  "content.read_more": "Read more",
  "content.all": "All",
  "news.title": "News",
  "news.empty": "Coming soon",
  "onboarding.skip": "Skip",
  "onboarding.next": "Next",
  "onboarding.start": "Get started!",
  "onboarding.back": "Back",
  "profile.title": "Complete your profile",
  "profile.empresa": "Company",
  "profile.cargo": "Role",
  "profile.whatsapp": "WhatsApp (optional)",
  "profile.save": "Save",
  "profile.skip": "Complete later",
  "auth.login": "Log in",
  "auth.signup": "Sign up",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.forgot": "Forgot password?",
  "auth.google": "Continue with Google",
  "auth.no_account": "Don't have an account?",
  "auth.has_account": "Already have an account?",
  "gamification.badges": "Your badges",
  "gamification.ranking": "Ranking",
  "gamification.earned": "Unlocked",
  "gamification.new": "Badge unlocked!",
  "services.title": "Services",
  "services.whatsapp": "Contact us via WhatsApp",
  "admin.title": "Admin panel",
  "admin.users": "Users",
  "admin.content": "Content",
  "admin.wall": "Wall",
  "admin.news": "News",
  "admin.security": "Security",
  "admin.ia": "AI",
  "admin.crm": "CRM",
  "cookies.title": "Cookies",
  "cookies.message": "We use cookies to improve your experience.",
  "cookies.accept": "Accept",
  "cookies.reject": "Reject",
  "generic.loading": "Loading…",
  "generic.error": "Something went wrong",
  "generic.retry": "Try again",
  "generic.save": "Save",
  "generic.cancel": "Cancel",
  "generic.delete": "Delete",
  "generic.close": "Close",
  "generic.confirm": "Confirm",
  "generic.search": "Search…",
  "generic.no_results": "No results",
  "generic.success": "Operation successful",
};

export const messages: Record<SupportedLocale, Record<string, string>> = {
  es,
  en,
};
