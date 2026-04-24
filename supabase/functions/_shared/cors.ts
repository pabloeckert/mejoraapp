// Shared CORS helper for MejoraApp Edge Functions
// Copy this block to each Edge Function's index.ts

const ALLOWED_ORIGINS = [
  "https://app.mejoraok.com",
  "http://localhost:8080",
  "http://localhost:5173",
];

function getCorsHeaders(origin: string | null) {
  const allowed = ALLOWED_ORIGINS.includes(origin ?? "") ? origin! : "https://app.mejoraok.com";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}
