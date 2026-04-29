/**
 * DiagnosticTest — Orchestrator for the diagnostic flow
 *
 * State machine: intro → question → loading → result
 * Sub-components extracted to ./diagnostic/
 */

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  BANCO_PREGUNTAS,
  PERFILES,
  shuffle,
  detectarPerfil,
  type DiagnosticQuestion,
} from "@/data/diagnosticData";
import {
  trackStartDiagnostic,
  trackCompleteDiagnostic,
  trackRetakeDiagnostic,
} from "@/lib/analytics";
import {
  DiagnosticIntro,
  DiagnosticQuestionView,
  DiagnosticLoading,
  DiagnosticResultView,
  type Step,
  type DiagnosticHistoryEntry,
  loadProgress,
  saveProgress,
  clearProgress,
} from "@/components/diagnostic";

const DiagnosticTest = ({ onComplete }: { onComplete: () => void }) => {
  const { user } = useAuth();

  // Restore progress on mount
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

  const [history, setHistory] = useState<DiagnosticHistoryEntry[]>([]);

  // Load diagnostic history
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

  // Persist progress during question phase
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

  const showResult = useCallback(async () => {
    setStep("loading");
    clearProgress();

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

        supabase.functions.invoke("send-diagnostic-email", {
          body: { user_id: user.id, perfil, puntaje: puntajeTotal },
        }).catch(() => {});
      } catch (err) {
        console.error("Error saving diagnostic:", err);
      }
    }
    trackCompleteDiagnostic(puntajeTotal, perfil);
    setTimeout(() => setStep("result"), 2200);
  }, [answers, user]);

  const goNext = useCallback(() => {
    if (currentIdx < 7) setCurrentIdx((i) => i + 1);
    else showResult();
  }, [currentIdx, showResult]);

  const goBack = useCallback(() => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
    else setStep("intro");
  }, [currentIdx]);

  // Computed values
  const currentQuestion = shuffledQuestions[currentIdx];
  const perfil = step === "result" ? detectarPerfil(answers) : null;
  const perfilData = perfil ? PERFILES[perfil] : null;
  const progress = step === "question" ? Math.round(((currentIdx + 1) / 8) * 100) : 0;
  const puntaje = Object.values(answers).reduce((a, b) => a + b, 0);

  // Render based on current step
  switch (step) {
    case "intro":
      return <DiagnosticIntro history={history} onStart={startDiag} />;

    case "question":
      if (!currentQuestion) return null;
      return (
        <DiagnosticQuestionView
          question={currentQuestion}
          currentIdx={currentIdx}
          answers={answers}
          progress={progress}
          onSelect={selectOption}
          onBack={goBack}
          onNext={goNext}
        />
      );

    case "loading":
      return <DiagnosticLoading />;

    case "result":
      if (!perfil || !perfilData) return null;
      return (
        <DiagnosticResultView
          perfil={perfil}
          perfilData={perfilData}
          puntaje={puntaje}
          onComplete={onComplete}
          userName={user?.email?.split("@")[0]}
        />
      );

    default:
      return null;
  }
};

export default DiagnosticTest;
