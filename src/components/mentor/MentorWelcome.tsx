/**
 * MentorWelcome — Welcome screen for Mentor IA
 *
 * Shows: greeting, value proposition, quick action prompts
 * Adapts to user context (has diagnostic? has profile?)
 */

import { Bot, Lightbulb, BarChart3, Target, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "strategy",
    icon: <Lightbulb className="w-4 h-4" />,
    label: "Estrategia de negocio",
    prompt: "¿Cuáles son las 3 estrategias más efectivas para crecer en el mercado argentino actual?",
  },
  {
    id: "diagnostic",
    icon: <BarChart3 className="w-4 h-4" />,
    label: "Analizar mi diagnóstico",
    prompt: "Analizá mi resultado del Mirror estratégico y decime en qué debería enfocarme.",
  },
  {
    id: "goals",
    icon: <Target className="w-4 h-4" />,
    label: "Definir objetivos",
    prompt: "Ayudame a definir 3 objetivos concretos para mi negocio en los próximos 90 días.",
  },
  {
    id: "problem",
    icon: <Handshake className="w-4 h-4" />,
    label: "Resolver un problema",
    prompt: "Tengo un desafío con mi negocio y necesito una perspectiva fresca. ¿Me ayudás?",
  },
];

interface MentorWelcomeProps {
  userName?: string;
  hasDiagnostic?: boolean;
  onQuickAction: (prompt: string) => void;
}

export const MentorWelcome = ({
  userName,
  hasDiagnostic,
  onQuickAction,
}: MentorWelcomeProps) => {
  const greeting = userName
    ? `¡Hola, ${userName}!`
    : "¡Hola!";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 animate-in zoom-in duration-500">
        <Bot className="w-8 h-8 text-primary" />
      </div>

      {/* Title */}
      <h2 className="text-title font-bold text-foreground text-center mb-1">
        {greeting}
      </h2>
      <p className="text-body text-muted-foreground text-center max-w-xs mb-2">
        Soy tu Mentor IA de Mejora Continua
      </p>
      <p className="text-body-sm text-muted-foreground text-center max-w-sm mb-8">
        Preguntame sobre estrategia, objetivos, crecimiento o cualquier desafío de tu negocio.
      </p>

      {/* Quick Actions */}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-caption text-muted-foreground font-medium uppercase tracking-wider text-center mb-3">
          Para empezar
        </p>
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            className={cn(
              "w-full justify-start gap-3 h-auto py-3.5 px-4",
              "text-body font-normal",
              "hover:bg-primary/5 hover:border-primary/30",
              "transition-all duration-200"
            )}
            onClick={() => onQuickAction(action.prompt)}
          >
            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {action.icon}
            </span>
            {action.label}
          </Button>
        ))}
      </div>

      {/* Context note */}
      {!hasDiagnostic && (
        <p className="text-caption text-muted-foreground text-center mt-6 max-w-xs">
          💡 Hacé el Mirror estratégico para obtener recomendaciones más personalizadas
        </p>
      )}
    </div>
  );
};

export default MentorWelcome;
