/**
 * AccessGate — Control de acceso por nivel de membresía
 *
 * Envuelve contenido que requiere un nivel específico.
 * Si el usuario no tiene acceso, muestra UpgradePrompt.
 *
 * Uso:
 *   <AccessGate required="N1">
 *     <ContenidoPremium />
 *   </AccessGate>
 */

import type { ReactNode } from "react";
import { useAccessLevel, type AccessLevel } from "@/hooks/useAccessLevel";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradePrompt } from "@/components/UpgradePrompt";

interface AccessGateProps {
  required: AccessLevel;
  children: ReactNode;
  /** Si true, difumina el contenido en vez de ocultarlo */
  blur?: boolean;
  /** Mensaje personalizado para el prompt de upgrade */
  message?: string;
}

export function AccessGate({ required, children, blur = false, message }: AccessGateProps) {
  const { user } = useAuth();
  const { hasAccess, isLoading, level } = useAccessLevel(user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-mc-dark-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (hasAccess(required)) {
    return <>{children}</>;
  }

  if (blur) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <UpgradePrompt currentLevel={level} requiredLevel={required} message={message} />
        </div>
      </div>
    );
  }

  return <UpgradePrompt currentLevel={level} requiredLevel={required} message={message} />;
}
