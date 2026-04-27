import { useState } from "react";
import { X, Users, Target, MessageSquareHeart, Trophy, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackOnboardingComplete, trackOnboardingSkip } from "@/lib/analytics";
import { trackABTest } from "@/lib/ab-testing";

interface OnboardingV2Props {
  onComplete: () => void;
  experimentVariant: string;
}

/**
 * Variant B: Community-first onboarding.
 * Fewer steps (3 vs 4), more emotional copy, social proof,
 * emphasizes belonging over features.
 */
const steps = [
  {
    icon: Users,
    title: "Tu comunidad te espera",
    desc: "Cientos de líderes empresariales ya comparten experiencias, dudas y estrategias en MejoraApp. No estás solo en esto.",
    color: "bg-indigo-500/15 text-indigo-600",
    cta: "Ver la comunidad",
  },
  {
    icon: Target,
    title: "¿Cómo está tu negocio?",
    desc: "8 preguntas, 1 minuto. Descubrí qué está frenando tu crecimiento y recibí un plan de acción personalizado.",
    color: "bg-emerald-500/15 text-emerald-600",
    cta: "Hacer diagnóstico",
  },
  {
    icon: MessageSquareHeart,
    title: "Compartí sin filtro",
    desc: "El muro anónimo es tu espacio para ser honesto. Sin nombres, sin juicio. Solo experiencias reales de gente que entiende tu realidad.",
    color: "bg-purple-500/15 text-purple-600",
    cta: "Explorar el muro",
  },
];

const STORAGE_KEY = "mc-onboarding-done";

const OnboardingV2 = ({ onComplete, experimentVariant }: OnboardingV2Props) => {
  const [step, setStep] = useState(0);

  const handleComplete = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    trackABTest("onboarding_v2", experimentVariant, "converted", { step_completed: step });
    trackOnboardingComplete();
    onComplete();
  };

  const handleSkip = () => {
    trackABTest("onboarding_v2", experimentVariant, "skipped", { step_at_skip: step });
    trackOnboardingSkip(step);
    handleComplete();
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      trackABTest("onboarding_v2", experimentVariant, "viewed", { step: step + 1 });
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
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
            <h2 className="text-title text-foreground">{currentStep.title}</h2>
            <p className="text-body text-muted-foreground leading-relaxed">{currentStep.desc}</p>
          </div>

          {/* Social proof on first step */}
          {step === 0 && (
            <div className="flex items-center justify-center gap-2 text-body-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500"].map((color, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full ${color} border-2 border-background flex items-center justify-center text-white text-[10px] font-bold`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span>+200 líderes activos</span>
            </div>
          )}

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
            <Button onClick={handleNext} className="flex-1 gap-2">
              {currentStep.cta} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Variant indicator (dev only) */}
          {import.meta.env.DEV && (
            <p className="text-center text-caption text-muted-foreground/50">
              A/B: {experimentVariant}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingV2;
