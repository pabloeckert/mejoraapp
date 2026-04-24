import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.MODE === "production" ? "production" : import.meta.env.VITE_ENVIRONMENT || "development";

export function initSentry() {
  if (!SENTRY_DSN) {
    console.info("[Sentry] No DSN configured — error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: ENVIRONMENT === "production" ? 0.5 : 1.0,
    release: import.meta.env.VITE_APP_VERSION || "unknown",
    beforeSend(event) {
      // Don't send events in development unless explicitly enabled
      if (ENVIRONMENT === "development" && !import.meta.env.VITE_SENTRY_DEBUG) {
        return null;
      }
      return event;
    },
  });

  console.info(`[Sentry] Initialized — env: ${ENVIRONMENT}`);
}

/**
 * Set user context for Sentry error reports.
 * Call after login, clear on logout.
 */
export function setSentryUser(user: { id: string; email?: string } | null) {
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Capture a handled exception with context.
 */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture a breadcrumb for debugging trail.
 */
export function addBreadcrumb(category: string, message: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: "info",
  });
}
