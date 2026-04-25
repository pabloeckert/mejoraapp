// Shared CORS helper for MejoraApp Edge Functions
// Import: import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

const ALLOWED_ORIGINS = [
  "https://app.mejoraok.com",
  "http://localhost:8080",
  "http://localhost:5173",
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = ALLOWED_ORIGINS.includes(origin ?? "") ? origin! : "https://app.mejoraok.com";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

/** Returns CORS preflight response if method is OPTIONS, otherwise null */
export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req.headers.get("Origin")) });
  }
  return null;
}

/** Build JSON response headers with CORS */
export function jsonHeaders(origin: string | null): Record<string, string> {
  return { ...getCorsHeaders(origin), "Content-Type": "application/json" };
}
