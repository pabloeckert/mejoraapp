/**
 * CookieConsent — Banner de consentimiento de cookies/tracking
 *
 * Cumple con Ley 25.326 (Protección de Datos Personales, Argentina).
 * Bloquea PostHog y Sentry hasta que el usuario acepta.
 * Persiste la decisión en localStorage.
 */

import { useState, useEffect } from "react";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CONSENT_KEY = "mc-cookie-consent";

export type ConsentStatus = "accepted" | "rejected" | null;

export function getConsentStatus(): ConsentStatus {
  try {
    return localStorage.getItem(CONSENT_KEY) as ConsentStatus;
  } catch {
    return null;
  }
}

export function setConsentStatus(status: "accepted" | "rejected") {
  try {
    localStorage.setItem(CONSENT_KEY, status);
  } catch {
    // Storage disabled — non-critical
  }
}

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const status = getConsentStatus();
    if (!status) {
      // Show after a short delay to not block initial render
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setConsentStatus("accepted");
    setVisible(false);
    // Reload to activate tracking
    window.location.reload();
  };

  const handleReject = () => {
    setConsentStatus("rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 sm:p-6">
      <Card className="max-w-lg mx-auto shadow-lg border-primary/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Tu privacidad importa
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Usamos cookies y herramientas de análisis (PostHog, Sentry) para
                  mejorar tu experiencia. No compartimos tus datos con terceros.
                  Podés cambiar tu decisión cuando quieras.
                </p>
              </div>
            </div>
            <button
              onClick={handleReject}
              className="text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleAccept} className="flex-1">
              Aceptar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReject}
              className="flex-1"
            >
              Rechazar
            </Button>
          </div>

          <p className="text-caption text-muted-foreground text-center">
            Al aceptar, nos ayudás a mejorar la app. Podés leer nuestra{" "}
            <a
              href="/Documents/PRIVACIDAD.html"
              className="text-primary hover:underline"
              target="_blank"
            >
              política de privacidad
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsent;
