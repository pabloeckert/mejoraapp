import { useState, useEffect } from "react";
import { X, BookOpen, ClipboardCheck, MessageSquare, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: BookOpen,
    title: "Contenido de Valor",
    desc: "Tips, estrategias y reflexiones semanales para hacer crecer tu negocio. Filtrá por categoría y descargá recursos.",
    color: "bg-blue-500/15 text-blue-600",
  },
  {
    icon: ClipboardCheck,
    title: "Diagnóstico Estratégico",
    desc: "8 preguntas, 1 minuto. Descubrí qué está frenando tu crecimiento y recibí un plan de acción personalizado.",
    color: "bg-emerald-500/15 text-emerald-600",
  },
  {
    icon: MessageSquare,
    title: "Muro Anónimo",
    desc: "Compartí experiencias, dudas y frustraciones sin revelar tu identidad. Moderado por IA para mantener calidad.",
    color: "bg-purple-500/15 text-purple-600",
  },
  {
    icon: Sparkles,
    title: "Novedades MC",
    desc: "Eventos, workshops, lanzamientos y herramientas de la comunidad Mejora Continua.",
    color: "bg-amber-500/15 text-amber-600",
  },
];

const STORAGE_KEY = "mc-onboarding-done";

export const shouldShowOnboarding = (): boolean => {
  try {
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return true;
  }
};

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(0);

  const handleComplete = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-sm animate-in zoom-in-95 duration-200">
        <CardContent className="p-6 space-y-5">
          {/* Skip */}
          <div className="flex justify-end">
            <button onClick={handleSkip} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${currentStep.color}`}>
              <Icon className="w-8 h-8" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold text-foreground">{currentStep.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{currentStep.desc}</p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? "bg-primary w-6" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
                Atrás
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} className="flex-1 gap-2">
                Siguiente <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="flex-1 gap-2">
                ¡Empezar! <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
