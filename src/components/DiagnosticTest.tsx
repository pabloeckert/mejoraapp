import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BANCO_PREGUNTAS,
  PERFILES,
  WA_NUMBER,
  shuffle,
  detectarPerfil,
  DiagnosticQuestion,
} from "@/data/diagnosticData";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Step = "intro" | "question" | "loading" | "result";

const DiagnosticTest = ({ onComplete }: { onComplete: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("intro");
  const [shuffledQuestions, setShuffledQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const startDiag = useCallback(() => {
    const shuffled = shuffle(BANCO_PREGUNTAS).map((q) => ({
      ...q,
      opts: shuffle(q.opts),
    }));
    setShuffledQuestions(shuffled);
    setCurrentIdx(0);
    setAnswers({});
    setStep("question");
  }, []);

  const selectOption = (questionId: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const goNext = () => {
    if (currentIdx < 7) setCurrentIdx((i) => i + 1);
    else showResult();
  };

  const goBack = () => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
    else setStep("intro");
  };

  const showResult = async () => {
    setStep("loading");
    const perfil = detectarPerfil(answers);
    const puntajeTotal = Object.values(answers).reduce((a, b) => a + b, 0);

    if (user) {
      try {
        await supabase.from("diagnostic_results").insert({
          user_id: user.id,
          perfil,
          puntaje_total: puntajeTotal,
          respuestas: answers as any,
        });
        await supabase
          .from("profiles")
          .update({ has_completed_diagnostic: true })
          .eq("user_id", user.id);
      } catch (err) {
        console.error("Error saving diagnostic:", err);
      }
    }
    setTimeout(() => setStep("result"), 2200);
  };

  const currentQuestion = shuffledQuestions[currentIdx];
  const perfil = step === "result" ? detectarPerfil(answers) : null;
  const perfilData = perfil ? PERFILES[perfil] : null;
  const progress = step === "question" ? Math.round((currentIdx / 8) * 100) : 0;

  // INTRO
  if (step === "intro") {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="bg-mc-diag-blue rounded-t-xl px-6 py-7 text-center text-white">
          <h1 className="text-xl font-extrabold leading-tight mb-1">
            ¿Te animás a ver cómo está tu negocio?
          </h1>
          <p className="text-xs opacity-75">8 preguntas. Diagnóstico preciso.</p>
        </div>
        <div className="bg-card rounded-b-xl shadow-lg p-6 text-center">
          <h2 className="text-lg font-black text-mc-diag-blue mb-3">
            Tu proyecto puede estar frenado y no lo estás viendo.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            En 1 minuto detectá exactamente qué está ralentizando tu crecimiento y qué necesitás hacer primero.
          </p>
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-2xl font-black text-mc-diag-red">8</div>
              <div className="text-xs text-muted-foreground">preguntas en 1 min</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-mc-diag-red">100%</div>
              <div className="text-xs text-muted-foreground">gratuito</div>
            </div>
          </div>
          <Button
            onClick={startDiag}
            className="bg-mc-diag-red hover:bg-mc-diag-red/90 text-white px-8 py-3 text-base font-bold"
          >
            Empezar diagnóstico →
          </Button>
        </div>
      </div>
    );
  }

  // QUESTION
  if (step === "question" && currentQuestion) {
    const labels = ["A", "B", "C", "D"];
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="bg-mc-diag-blue rounded-t-xl px-5 py-4 text-white">
          <div className="text-[10px] font-bold tracking-widest uppercase opacity-65 mb-1">
            Pregunta {currentIdx + 1} de 8
          </div>
          <h2 className="text-[15px] font-black leading-snug mb-1">
            {currentQuestion.title}
          </h2>
          <p className="text-[11px] opacity-75 leading-relaxed">{currentQuestion.sub}</p>
        </div>
        <div className="h-1 bg-white/25">
          <div
            className="h-full bg-mc-diag-red transition-all duration-400"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="bg-card rounded-b-xl shadow-lg p-5">
          <div className="space-y-2.5">
            {currentQuestion.opts.map((opt, i) => {
              const isSelected = answers[currentQuestion.id] === opt.score;
              return (
                <button
                  key={i}
                  onClick={() => selectOption(currentQuestion.id, opt.score)}
                  className={cn(
                    "flex items-start gap-3 w-full text-left p-3 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-mc-diag-red bg-red-50"
                      : "border-border hover:border-mc-diag-blue hover:bg-secondary"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-all",
                      isSelected
                        ? "bg-mc-diag-red text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {labels[i]}
                  </div>
                  <span className="text-sm leading-snug text-foreground">{opt.text}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" size="sm" onClick={goBack}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
            </Button>
            <Button
              onClick={goNext}
              disabled={answers[currentQuestion.id] === undefined}
              className={cn(
                currentIdx === 7
                  ? "bg-mc-diag-red hover:bg-mc-diag-red/90"
                  : "bg-mc-diag-blue hover:bg-mc-diag-blue/90",
                "text-white"
              )}
            >
              {currentIdx === 7 ? "Ver mi diagnóstico" : "Siguiente"}{" "}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // LOADING
  if (step === "loading") {
    return (
      <div className="max-w-xl mx-auto text-center py-16 animate-fade-in">
        <div className="w-12 h-12 border-3 border-mc-diag-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-extrabold text-mc-diag-blue mb-2">Analizando tu negocio…</h2>
        <p className="text-sm text-muted-foreground">
          Procesando tus respuestas y generando tu diagnóstico personalizado.
        </p>
      </div>
    );
  }

  // RESULT
  if (step === "result" && perfilData) {
    const waMsg = encodeURIComponent(
      `Hola, hice el diagnóstico de Mejora Continua. Mi diagnóstico es: "${perfilData.tagline}". Quiero hablar.`
    );
    const waLink = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;

    return (
      <div className="max-w-xl mx-auto animate-fade-in space-y-5">
        <div
          className="text-lg font-black text-center text-white py-5 px-5 rounded-xl leading-tight"
          style={{ backgroundColor: perfilData.color }}
        >
          {perfilData.tagline}
        </div>

        <div className="bg-secondary border-l-4 border-mc-diag-blue p-4 rounded-r-xl">
          <p className="text-sm text-foreground leading-relaxed">{perfilData.desc}</p>
        </div>

        <div>
          <h3 className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-3">
            Lo que te dijiste esta semana
          </h3>
          <div className="space-y-2">
            {perfilData.mirror.map((m, i) => (
              <div
                key={i}
                className="py-2.5 px-4 bg-card border border-border rounded-r-xl italic text-sm text-foreground leading-relaxed"
                style={{ borderLeftWidth: 3, borderLeftColor: perfilData.color }}
              >
                {m}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-3">
            Lo que tu negocio está mostrando
          </h3>
          <div className="border border-border rounded-xl overflow-hidden">
            {perfilData.symptoms.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 p-3",
                  i < perfilData.symptoms.length - 1 && "border-b border-border"
                )}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                  style={{
                    borderWidth: 2,
                    borderColor: perfilData.color,
                    color: perfilData.color,
                    backgroundColor: `${perfilData.color}15`,
                  }}
                >
                  !
                </div>
                <span className="text-sm text-foreground leading-snug">{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-mc-diag-blue rounded-xl p-6 text-center text-white">
          <h3 className="text-base font-extrabold mb-2">{perfilData.ctaTitle}</h3>
          <p className="text-xs opacity-80 mb-4 leading-relaxed">{perfilData.ctaText}</p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-mc-diag-red hover:bg-mc-diag-red/90 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Quiero hablar con un especialista →
          </a>
        </div>

        <Button
          onClick={onComplete}
          className="w-full bg-mc-dark-blue hover:bg-mc-dark-blue/90 text-white py-3"
        >
          Continuar a la app →
        </Button>
      </div>
    );
  }

  return null;
};

export default DiagnosticTest;
