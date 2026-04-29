/**
 * NPSSurvey — Encuesta de satisfacción in-app
 *
 * Se muestra después de 7 días de uso activo.
 * Puntuación 0-10 + feedback opcional.
 * Persiste en localStorage para no repetir.
 *
 * Clasificación:
 *   0-6: Detractor
 *   7-8: Pasivo
 *   9-10: Promotor
 */

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { trackFunnelStep } from "@/lib/analytics";

const STORAGE_KEY = "mc-nps-answered";
const MIN_DAYS_ACTIVE = 7;

function shouldShowNPS(): boolean {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return false;
    const firstVisit = localStorage.getItem("mc-first-visit");
    if (!firstVisit) {
      localStorage.setItem("mc-first-visit", String(Date.now()));
      return false;
    }
    const daysSinceFirst = (Date.now() - parseInt(firstVisit)) / (1000 * 60 * 60 * 24);
    return daysSinceFirst >= MIN_DAYS_ACTIVE;
  } catch {
    return false;
  }
}

export function NPSSurvey() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setShow(shouldShowNPS());
  }, []);

  const handleSubmit = async () => {
    if (score === null) return;

    // Save to Supabase (best-effort)
    try {
      await supabase.from("nps_responses").insert({
        user_id: user?.id ?? "",
        score: score ?? 0,
        comment: feedback.trim() || null,
      } as never);
    } catch {
      // Silently fail — NPS is not critical
    }

    trackFunnelStep("nps_submitted", { score, category: score <= 6 ? "detractor" : score <= 8 ? "pasivo" : "promotor" });
    localStorage.setItem(STORAGE_KEY, "true");
    setSubmitted(true);
    setTimeout(() => setShow(false), 2000);
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setShow(false);
  };

  if (!show) return null;

  if (submitted) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto animate-fade-in">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 text-center">
            <p className="text-body font-medium text-foreground">¡Gracias por tu feedback! 🙌</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto animate-fade-in">
      <Card className="border-border shadow-lg">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-subtitle font-semibold text-foreground">¿Qué tan probable es que nos recomiendes?</h3>
            <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Score buttons */}
          <div className="flex gap-1 justify-between">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                onClick={() => setScore(i)}
                className={`w-8 h-8 rounded-lg text-caption font-medium transition-all ${
                  score === i
                    ? i <= 6
                      ? "bg-destructive text-destructive-foreground"
                      : i <= 8
                      ? "bg-mc-yellow text-foreground"
                      : "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {i}
              </button>
            ))}
          </div>

          {/* Labels */}
          <div className="flex justify-between text-caption text-muted-foreground px-1">
            <span>Nada probable</span>
            <span>Muy probable</span>
          </div>

          {/* Feedback (optional) */}
          {score !== null && (
            <div className="space-y-2 animate-fade-in">
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="¿Por qué? (opcional)"
                className="text-body resize-none h-16"
                maxLength={300}
              />
              <Button onClick={handleSubmit} className="w-full" size="sm">
                Enviar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
