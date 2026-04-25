import { useState, useCallback, useEffect } from "react";
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
import { ArrowLeft, ArrowRight, MessageCircle, BookOpen, Download, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentRecommendations } from "@/hooks/useContentRecommendations";
// Lazy-load PDF export (heavy: jsPDF ~400KB)
const exportDiagnosticPDF = (...args: Parameters<typeof import("@/lib/pdfExport").exportDiagnosticPDF>) =>
  import("@/lib/pdfExport").then(m => m.exportDiagnosticPDF(...args));
import { FeatureGate } from "@/components/FeatureGate";
import {
  trackStartDiagnostic,
  trackCompleteDiagnostic,
  trackShareDiagnosticWA,
  trackRetakeDiagnostic,
  trackDiagnosticCTAPerfil,
  trackDiagnosticPDFExport,
  trackContentRecommendationClick,
  trackFunnelStep,
} from "@/lib/analytics";

type Step = "intro" | "question" | "loading" | "result";

interface DiagnosticProgress {
  shuffledQuestions: DiagnosticQuestion[];
  currentIdx: number;
  answers: Record<number, number>;
  step: Step;
}

const STORAGE_KEY = "mc-diagnostic-progress";

const loadProgress = (): DiagnosticProgress | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveProgress = (progress: DiagnosticProgress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or disabled — non-critical
  }
};

const clearProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

const DiagnosticTest = ({ onComplete }: { onComplete: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Try to restore progress on mount
  const [step, setStep] = useState<Step>(() => {
    const saved = loadProgress();
    return saved?.step === "question" ? "question" : "intro";
  });

  const [shuffledQuestions, setShuffledQuestions] = useState<DiagnosticQuestion[]>(() => {
    const saved = loadProgress();
    return saved?.shuffledQuestions ?? [];
  });

  const [currentIdx, setCurrentIdx] = useState(() => {
    const saved = loadProgress();
    return saved?.currentIdx ?? 0;
  });

  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    const saved = loadProgress();
    return saved?.answers ?? {};
  });

  // Diagnostic history
  interface DiagnosticHistoryEntry {
    id: string;
    perfil: string;
    puntaje_total: number;
    created_at: string;
  }
  const [history, setHistory] = useState<DiagnosticHistoryEntry[]>([]);

  useEffect(() => {
    if (!user || step !== "intro") return;
    supabase
      .from("diagnostic_results")
      .select("id, perfil, puntaje_total, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data && data.length > 0) setHistory(data);
      });
  }, [user, step]);

  // Persist progress whenever it changes
  useEffect(() => {
    if (step === "question") {
      saveProgress({ shuffledQuestions, currentIdx, answers, step });
    }
  }, [step, shuffledQuestions, currentIdx, answers]);

  const startDiag = useCallback(() => {
    const shuffled = shuffle(BANCO_PREGUNTAS).map((q) => ({
      ...q,
      opts: shuffle(q.opts),
    }));
    setShuffledQuestions(shuffled);
    setCurrentIdx(0);
    setAnswers({});
    setStep("question");
    if (history.length > 0) {
      trackRetakeDiagnostic(history.length + 1);
    }
    trackStartDiagnostic();
  }, [history.length]);

  const selectOption = useCallback((questionId: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  }, []);

  const goNext = useCallback(() => {
    if (currentIdx < 7) setCurrentIdx((i) => i + 1);
    else showResult();
  }, [currentIdx]);

  const goBack = useCallback(() => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
    else setStep("intro");
  }, [currentIdx]);

  const showResult = useCallback(async () => {
    setStep("loading");
    clearProgress(); // Done — clear saved progress

    const perfil = detectarPerfil(answers);
    const puntajeTotal = Object.values(answers).reduce((a, b) => a + b, 0);

    if (user) {
      try {
        await supabase.from("diagnostic_results").insert({
          user_id: user.id,
          perfil,
          puntaje_total: puntajeTotal,
          respuestas: answers,
        });
        await supabase
          .from("profiles")
          .update({ has_completed_diagnostic: true })
          .eq("user_id", user.id);

        // Send follow-up email (fire and forget — don't block the UI)
        supabase.functions.invoke("send-diagnostic-email", {
          body: { user_id: user.id, perfil, puntaje: puntajeTotal },
        }).catch(() => {}); // Silent fail — email is best-effort
      } catch (err) {
        console.error("Error saving diagnostic:", err);
      }
    }
    trackCompleteDiagnostic(puntajeTotal, perfil);
    setTimeout(() => setStep("result"), 2200);
  }, [answers, user]);

  const currentQuestion = shuffledQuestions[currentIdx];
  const perfil = step === "result" ? detectarPerfil(answers) : null;
  const perfilData = perfil ? PERFILES[perfil] : null;
  const progress = step === "question" ? Math.round((currentIdx / 8) * 100) : 0;

  // INTRO
  if (step === "intro") {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="bg-mc-diag-blue rounded-t-xl px-6 py-7 text-center text-white">
          <h1 className="text-heading font-extrabold leading-tight mb-1">
            ¿Te animás a ver cómo está tu negocio?
          </h1>
          <p className="text-caption opacity-75">8 preguntas. Mirror preciso.</p>
        </div>
        <div className="bg-card rounded-b-xl shadow-lg p-6 text-center">
          <h2 className="text-title font-black text-mc-diag-blue mb-3">
            Tu proyecto puede estar frenado y no lo estás viendo.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            En 1 minuto detectá exactamente qué está ralentizando tu crecimiento y qué necesitás hacer primero.
          </p>
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-2xl font-black text-mc-diag-red">8</div>
              <div className="text-caption text-muted-foreground">preguntas en 1 min</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-mc-diag-red">100%</div>
              <div className="text-caption text-muted-foreground">gratuito</div>
            </div>
          </div>
          <Button
            onClick={startDiag}
            className="bg-mc-diag-red hover:bg-mc-diag-red/90 text-white px-8 py-3 text-base font-bold"
          >
            {history.length > 0 ? "Hacerlo de nuevo →" : "Empezar Mirror →"}
          </Button>

          <FeatureGate feature="diagnostic_history" variant="inline">
            <div className="mt-6 pt-4 border-t border-border text-left">
              <h3 className="text-caption font-bold tracking-widest text-muted-foreground uppercase mb-3">
                Tus Mirrors anteriores
              </h3>
              <div className="space-y-2">
                {history.map((entry) => {
                  const perfilData = PERFILES[entry.perfil];
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: perfilData?.color ?? "#888" }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-caption font-medium text-foreground line-clamp-1">
                          {perfilData?.tagline ?? entry.perfil}
                        </span>
                        <span className="text-caption text-muted-foreground block">
                          {new Date(entry.created_at).toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })} · Puntaje: {entry.puntaje_total}/40
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FeatureGate>
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
          <div className="text-caption font-bold tracking-widest uppercase opacity-65 mb-1">
            Pregunta {currentIdx + 1} de 8
          </div>
          <h2 className="text-body font-black leading-snug mb-1">
            {currentQuestion.title}
          </h2>
          <p className="text-caption opacity-75 leading-relaxed">{currentQuestion.sub}</p>
        </div>
        <div className="h-1 bg-foreground/15">
          <div
            className="h-full bg-mc-diag-red transition-all duration-300"
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
                      ? "border-mc-diag-red bg-red-50 dark:bg-red-950/30"
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
              {currentIdx === 7 ? "Ver mi Mirror" : "Siguiente"}{" "}
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
        <h2 className="text-title font-extrabold text-mc-diag-blue mb-2">Analizando tu negocio…</h2>
        <p className="text-sm text-muted-foreground">
          Procesando tus respuestas y generando tu Mirror personalizado.
        </p>
      </div>
    );
  }

  // RESULT
  if (step === "result" && perfilData) {
    const puntaje = Object.values(answers).reduce((a, b) => a + b, 0);
    const waMsg = encodeURIComponent(
      `Hola, hice el Mirror de Mejora Continua. Mi Mirror es: "${perfilData.tagline}". Quiero hablar.`
    );
    const waLink = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;

    return (
      <DiagnosticResultView
        perfil={perfil!}
        perfilData={perfilData}
        puntaje={puntaje}
        waLink={waLink}
        onComplete={onComplete}
        userName={user?.email?.split("@")[0]}
      />
    );
  }

  return null;
};

// --- Sub-component for result (to use hooks) ---
const DiagnosticResultView = ({
  perfil,
  perfilData,
  puntaje,
  waLink,
  onComplete,
  userName,
}: {
  perfil: string;
  perfilData: NonNullable<ReturnType<typeof PERFILES extends Record<string, infer P> ? () => P : never>>;
  puntaje: number;
  waLink: string;
  onComplete: () => void;
  userName?: string;
}) => {
  const { recommendations, loading: loadingRecs } = useContentRecommendations(perfil, 3);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    try {
      await exportDiagnosticPDF({
        perfil,
        puntaje,
        respuestas: {},
        fecha: new Date().toLocaleDateString("es-AR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        userName,
      });
      trackDiagnosticPDFExport(perfil);
      toast({ title: "PDF descargado", description: "Tu Mirror se guardó como PDF." });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({ title: "Error", description: "No se pudo generar el PDF.", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in space-y-5">
      <div
        className="text-title font-black text-center text-white py-5 px-5 rounded-xl leading-tight"
        style={{ backgroundColor: perfilData.color }}
      >
        {perfilData.tagline}
      </div>

      <div className="bg-secondary border-l-4 border-mc-diag-blue p-4 rounded-r-xl">
        <p className="text-sm text-foreground leading-relaxed">{perfilData.desc}</p>
      </div>

      <div>
        <h3 className="text-caption font-bold tracking-widest text-muted-foreground uppercase mb-3">
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
        <h3 className="text-caption font-bold tracking-widest text-muted-foreground uppercase mb-3">
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
                className="w-5 h-5 rounded-full flex items-center justify-center text-caption font-bold flex-shrink-0 mt-0.5"
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

      {/* CTA de consultoría */}
      <div className="bg-mc-diag-blue rounded-xl p-6 text-center text-white">
        <h3 className="text-base font-extrabold mb-2">{perfilData.ctaTitle}</h3>
        <p className="text-xs opacity-80 mb-4 leading-relaxed">{perfilData.ctaText}</p>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackShareDiagnosticWA(puntaje);
            trackDiagnosticCTAPerfil(perfil, puntaje);
            trackFunnelStep("diagnostic_whatsapp_cta", { perfil, puntaje });
          }}
          className="inline-flex items-center gap-2 bg-mc-diag-red hover:bg-mc-diag-red/90 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Quiero hablar con un especialista →
        </a>
      </div>

      {/* Recomendaciones de contenido */}
      <FeatureGate feature="content_recommendations" variant="inline">
        <div className="space-y-2">
          <h3 className="text-caption font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            Contenido recomendado para tu perfil
          </h3>
          {loadingRecs ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-2">
              {recommendations.map((rec) => (
                <Card
                  key={rec.id}
                  className="hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => {
                    trackContentRecommendationClick(rec.id, perfil);
                    onComplete(); // Navigate to content tab
                  }}
                >
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">
                        {rec.titulo}
                      </p>
                      <p className="text-caption text-muted-foreground line-clamp-2 mt-0.5">
                        {rec.resumen || rec.contenido?.slice(0, 100)}
                      </p>
                      {rec.content_categories && (
                        <span className="text-[9px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                          {rec.content_categories.nombre}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </FeatureGate>

      {/* Action buttons */}
      <div className="flex gap-2">
        <FeatureGate feature="diagnostic_pdf" fallback={
          <Button
            onClick={onComplete}
            className="flex-1 bg-mc-dark-blue hover:bg-mc-dark-blue/90 text-white py-3 gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Ver contenido
          </Button>
        }>
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="flex-1 py-3 gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </Button>
        </FeatureGate>
        <Button
          onClick={onComplete}
          className="flex-1 bg-mc-dark-blue hover:bg-mc-dark-blue/90 text-white py-3 gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Ver contenido
        </Button>
      </div>
    </div>
  );
};

export default DiagnosticTest;
