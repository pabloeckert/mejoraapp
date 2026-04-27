/**
 * Shared middleware chain for Edge Functions
 *
 * Encadena: CORS → Auth → Rate Limit → Handler
 *
 * Uso:
 *   import { withMiddleware } from "../_shared/middleware.ts";
 *
 *   Deno.serve(withMiddleware({ auth: true, rateLimit: 10 }, async (req, ctx) => {
 *     // ctx.user ya está validado
 *     return new Response(JSON.stringify({ ok: true }));
 *   }));
 */
import { handleCors, jsonHeaders } from "./cors.ts";

interface MiddlewareOptions {
  /** Requiere JWT válido. Default: true */
  auth?: boolean;
  /** Requiere rol admin. Default: false */
  admin?: boolean;
  /** Requests por minuto. 0 = sin límite */
  rateLimit?: number;
}

interface Context {
  user: { id: string; email?: string; role?: string } | null;
  origin: string | null;
}

type Handler = (req: Request, ctx: Context) => Promise<Response> | Response;

// Simple in-memory rate limiter (per Edge Function instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

async function verifyJwt(token: string): Promise<{ id: string; email?: string } | null> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: serviceKey,
      },
    });

    if (!res.ok) return null;
    const user = await res.json();
    return { id: user.id, email: user.email };
  } catch {
    return null;
  }
}

async function checkAdmin(userId: string): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const res = await fetch(
      `${supabaseUrl}/rest/v1/user_roles?user_id=eq.${userId}&role=eq.admin&select=role`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );

    if (!res.ok) return false;
    const roles = await res.json();
    return Array.isArray(roles) && roles.length > 0;
  } catch {
    return false;
  }
}

/**
 * Wraps a handler with CORS + auth + rate limiting middleware.
 */
export function withMiddleware(opts: MiddlewareOptions, handler: Handler) {
  const { auth = true, admin = false, rateLimit = 0 } = opts;

  return async (req: Request): Promise<Response> => {
    const origin = req.headers.get("Origin");

    // CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const headers = jsonHeaders(origin);

    // Auth
    let user: { id: string; email?: string } | null = null;

    if (auth) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Missing or invalid authorization" }), {
          status: 401,
          headers,
        });
      }

      const token = authHeader.replace("Bearer ", "");
      user = await verifyJwt(token);

      if (!user) {
        return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
          status: 401,
          headers,
        });
      }

      // Admin check
      if (admin) {
        const isAdmin = await checkAdmin(user.id);
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Admin access required" }), {
            status: 403,
            headers,
          });
        }
      }
    }

    // Rate limiting
    if (rateLimit > 0) {
      const key = user?.id ?? origin ?? "anonymous";
      if (!checkRateLimit(key, rateLimit)) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
          status: 429,
          headers: { ...headers, "Retry-After": "60" },
        });
      }
    }

    // Execute handler
    const ctx: Context = { user, origin };
    return handler(req, ctx);
  };
}
