/**
 * SEOHead — Dynamic meta tags for each page
 *
 * Uses react-helmet-async to manage <head> tags.
 * Includes Open Graph tags for social sharing.
 */

import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description?: string;
  /** Path relative to app origin (e.g., "/", "/auth") */
  path?: string;
  /** OG image URL */
  image?: string;
  /** Additional meta tags */
  meta?: Array<{ name: string; content: string }>;
}

const DEFAULT_DESCRIPTION =
  "Comunidad de líderes empresariales argentinos. Diagnóstico estratégico, contenido de valor y networking anónimo.";

const DEFAULT_IMAGE = "https://app.mejoraok.com/og-image.png";
const SITE_NAME = "MejoraApp";
const ORIGIN = "https://app.mejoraok.com";

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_IMAGE,
  meta = [],
}: SEOHeadProps) {
  const url = `${ORIGIN}${path}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="es_AR" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Additional meta */}
      {meta.map((m, i) => (
        <meta key={i} name={m.name} content={m.content} />
      ))}
    </Helmet>
  );
}

// ── Pre-built SEO configs for each page ────────────────────────

export const SEO_CONFIGS = {
  index: {
    title: "MejoraApp — Comunidad de Líderes Empresariales",
    description:
      "Espacio seguro para líderes empresariales argentinos. Muro anónimo, diagnóstico estratégico, contenido de valor.",
    path: "/",
  },
  auth: {
    title: "Ingresá a MejoraApp",
    description:
      "Accedé a la comunidad de líderes empresariales.",
    path: "/auth",
  },
  admin: {
    title: "Panel Administrativo — MejoraApp",
    description: "Panel de administración para gestionar contenido, usuarios y configuración de MejoraApp.",
    path: "/admin",
  },
  notFound: {
    title: "Página no encontrada — MejoraApp",
    description: "La página que buscás no existe o fue movida. Volvé al inicio de MejoraApp.",
    path: "/404",
  },
} as const;
