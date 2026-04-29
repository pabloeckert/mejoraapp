/**
 * AdminSecurityMFA — MFA enforcement warning for admin users
 *
 * Checks if the current admin has MFA enabled via Supabase.
 * Shows a warning banner if MFA is not enabled with a button to set it up.
 */

import { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { trackAdminAction } from "@/lib/analytics";

interface MFAStatus {
  loading: boolean;
  enabled: boolean;
  factors: Array<{ id: string; type: string; status: string }>;
}

export function AdminSecurityMFA() {
  const { user } = useAuth();
  const [status, setStatus] = useState<MFAStatus>({
    loading: true,
    enabled: false,
    factors: [],
  });

  useEffect(() => {
    if (!user) return;

    const checkMFA = async () => {
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) {
          console.error("MFA check error:", error);
          setStatus({ loading: false, enabled: false, factors: [] });
          return;
        }

        const totpFactors = data?.totp ?? [];
        const verifiedFactors = totpFactors.filter((f) => f.status === "verified");

        setStatus({
          loading: false,
          enabled: verifiedFactors.length > 0,
          factors: totpFactors.map((f) => ({
            id: f.id,
            type: "totp" as string,
            status: f.status,
          })),
        });
      } catch (err) {
        console.error("MFA check failed:", err);
        setStatus({ loading: false, enabled: false, factors: [] });
      }
    };

    checkMFA();
  }, [user]);

  const handleEnableMFA = () => {
    trackAdminAction("mfa_setup_clicked");
    // Redirect to Supabase MFA enrollment
    // Users can set up TOTP in their account settings
    window.open(
      `${window.location.origin}/auth?mfa=enroll`,
      "_blank"
    );
  };

  if (status.loading) {
    return (
      <Card className="border-muted">
        <CardContent className="flex items-center gap-3 py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Verificando MFA…</span>
        </CardContent>
      </Card>
    );
  }

  if (status.enabled) {
    return (
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="flex items-center gap-3 py-4">
          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              MFA habilitado
            </p>
            <p className="text-caption text-green-700/70 dark:text-green-400/70">
              Tu cuenta tiene autenticación de dos factores activa ({status.factors.length} factor{status.factors.length !== 1 ? "es" : ""}).
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
      <CardContent className="flex items-start gap-3 py-4">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              ⚠️ MFA no habilitado
            </p>
            <p className="text-caption text-amber-700/70 dark:text-amber-400/70">
              Tu cuenta de administrador no tiene autenticación de dos factores. Es altamente recomendable habilitarla para proteger el acceso al panel.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleEnableMFA}
            className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30 gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Habilitar MFA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
