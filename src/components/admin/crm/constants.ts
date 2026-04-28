// Shared constants for CRM module
export const STATUS_LABELS: Record<string, string> = { activo: "Activo", potencial: "Potencial", inactivo: "Inactivo" };
export const STATUS_STYLES: Record<string, string> = {
  activo: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
  potencial: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  inactivo: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
};
export const RESULT_LABELS: Record<string, string> = {
  presupuesto: "Presupuesto", venta: "Venta", seguimiento: "Seguimiento",
  sin_respuesta: "Sin respuesta", no_interesado: "No interesado",
};
export const RESULT_STYLES: Record<string, string> = {
  presupuesto: "bg-blue-100 text-blue-800 border-blue-200",
  venta: "bg-green-100 text-green-800 border-green-200",
  seguimiento: "bg-yellow-100 text-yellow-800 border-yellow-200",
  sin_respuesta: "bg-gray-100 text-gray-600 border-gray-200",
  no_interesado: "bg-red-100 text-red-800 border-red-200",
};
export const MEDIUM_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp", llamada: "Llamada", email: "Email",
  reunion_presencial: "R. presencial", reunion_virtual: "R. virtual",
  md_instagram: "Instagram", md_facebook: "Facebook", md_linkedin: "LinkedIn",
  visita_campo: "Visita campo",
};
export const CHANNELS = ["WhatsApp", "Email", "Redes sociales", "Referido", "Teléfono", "Feria/Evento", "Sitio web", "MejoraApp"];
export const RUBROS = ["Forestal", "Agropecuario", "Industrial", "Construcción", "Gobierno", "Particular", "Comercio", "Otro"];
export const PROVINCIAS = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones",
  "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz",
  "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán",
];
export const CURRENCIES = ["ARS", "USD", "EUR"];
