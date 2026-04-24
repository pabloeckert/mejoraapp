/**
 * ReferralBanner — Programa de referidos
 *
 * Muestra un banner para invitar colegas con link de referido.
 * El link incluye el user_id como query param.
 * Cuando un nuevo usuario se registra con el link, se guarda la referencia.
 *
 * Componentes:
 * - ReferralBanner: banner expandible en el muro
 * - getReferralLink: genera el link de referido
 * - trackReferral: guarda la referencia al registrarse
 */

import { useState } from "react";
import { Users, Copy, Check, Share2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { trackFunnelStep } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";

/** Genera el link de referido con el user_id */
export function getReferralLink(userId: string): string {
  return `${window.location.origin}/auth?ref=${userId}`;
}

/**
 * Registra una referencia al momento del signup.
 * Llamar desde el signup flow cuando detecta ?ref= en la URL.
 */
export async function trackReferral(referredBy: string, newUserId: string): Promise<void> {
  try {
    await supabase.from("referrals").insert({
      referrer_id: referredBy,
      referred_id: newUserId,
    });
  } catch {
    // Best-effort — no bloquear el signup si falla
  }
}

/** Detecta si la URL actual tiene un referral param */
export function getReferralFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("ref");
}

export function ReferralBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return !!localStorage.getItem("mc-referral-dismissed");
    } catch {
      return false;
    }
  });
  const [copied, setCopied] = useState(false);

  if (!user || dismissed) return null;

  const referralLink = getReferralLink(user.id);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      trackFunnelStep("referral_link_copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MejoraApp — Comunidad de Negocios",
          text: "Unite a MejoraApp, la comunidad de empresarios argentinos. Es gratis y anónimo.",
          url: referralLink,
        });
        trackFunnelStep("referral_shared_native");
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("mc-referral-dismissed", "true");
    setDismissed(true);
  };

  return (
    <Card className="border-mc-dark-blue/20 dark:border-primary/20 bg-gradient-to-r from-mc-dark-blue/5 to-transparent dark:from-primary/10 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-mc-dark-blue/10 dark:bg-primary/15 flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5 text-mc-dark-blue dark:text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-body font-semibold text-foreground">Invitá a un colega</h3>
              <p className="text-caption text-muted-foreground mt-0.5">
                Compartí tu link y sumá alguien a la comunidad.
              </p>
              {/* Link preview */}
              <div className="mt-2 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
                <code className="text-caption text-muted-foreground truncate flex-1">
                  {referralLink}
                </code>
              </div>
              {/* Actions */}
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" className="gap-1.5 h-8 text-caption" onClick={handleCopy}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "¡Copiado!" : "Copiar link"}
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 h-8 text-caption" onClick={handleShare}>
                  <Share2 className="w-3.5 h-3.5" />
                  Compartir
                </Button>
              </div>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
