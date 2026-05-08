/**
 * GamePlayer — Motor de juegos genérico para Business Mirror Gamer
 *
 * Maneja todos los game_types: classic, puzzle, adventure, mental, logic.
 * Renderiza preguntas, captura respuestas, calcula perfil y guarda resultado.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  Zap,
  RotateCcw,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TestDefinition, TestQuestion, TestOption, TestProfile } from "@/data/businessMirrorTests";
import { getProfileForTest, computeScore, saveMirrorResult } from "@/services/business-mirror.service";
import { GameResult } from "./GameResult";

type GameStep = "intro" | "playing" | "result";

interface GamePlayerProps {
  test: TestDefinition;
  onBack: () => void;
}

export function GamePlayer({ test, onBack }: GamePlayerProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<GameStep>("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [profileResult, setProfileResult] = useState<{ key: string; data: TestProfile } | null>(null);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const questions = test.questions;
  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const isLast = currentIdx >= questions.length - 1;

  // Timer for "mental" game type
  useEffect(() => {
    if (step !== "playing" || test.gameType !== "mental") return;

    const limit = currentQuestion?.timeLimit ?? 15;
    setTimeLeft(limit);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current);
          // Auto-advance on timeout
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, currentIdx, test.gameType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTimeout = useCallback(() => {
    // If no answer selected, give score 0
    if (!answers[currentQuestion?.id]) {
      setAnswers((prev) => ({ ...prev, [currentQuestion?.id]: 0 }));
    }
    // Auto-advance
    if (isLast) {
      finishGame();
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }, [currentQuestion, answers, isLast]); // eslint-disable-line react-hooks/exhaustive-deps

  const startGame = useCallback(() => {
    setStep("playing");
    setCurrentIdx(0);
    setAnswers({});
    setStartTime(Date.now());
    setTotalTime(0);
  }, []);

  const selectOption = useCallback(
    (questionId: number, score: number) => {
      setAnswers((prev) => ({ ...prev, [questionId]: score }));

      // For mental game, auto-advance after selection
      if (test.gameType === "mental") {
        setTimeout(() => {
          if (isLast) {
            finishGame();
          } else {
            setCurrentIdx((i) => i + 1);
          }
        }, 300);
      }
    },
    [test.gameType, isLast]
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const finishGame = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    setTotalTime(elapsed);

    const finalAnswers = { ...answers };
    const result = getProfileForTest(test, finalAnswers, elapsed);

    if (!result) {
      console.error("Could not calculate profile");
      return;
    }

    setProfileResult(result);
    setStep("result");

    // Save to Supabase
    if (user) {
      setSaving(true);
      try {
        const score = computeScore(finalAnswers);
        // We need the test_id from Supabase - fetch it
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: testData } = await supabase
          .from("business_mirror_tests")
          .select("id")
          .eq("slug", test.slug)
          .maybeSingle();

        if (testData) {
          await saveMirrorResult(
            user.id,
            testData.id,
            finalAnswers,
            result.key,
            result.data,
            score,
            elapsed
          );
        }
      } catch (err) {
        console.error("Error saving mirror result:", err);
      } finally {
        setSaving(false);
      }
    }
  }, [answers, startTime, test, user]);

  const goNext = useCallback(() => {
    if (isLast) {
      finishGame();
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }, [isLast, finishGame]);

  const goBack = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
    }
  }, [currentIdx]);

  const restart = useCallback(() => {
    setStep("intro");
    setCurrentIdx(0);
    setAnswers({});
    setProfileResult(null);
    setTotalTime(0);
  }, []);

  // ── Intro Screen ────────────────────────────────────────────

  if (step === "intro") {
    return (
      <div className="max-w-lg mx-auto animate-fade-in space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ backgroundColor: `${test.color}15` }}
            >
              <span className="text-3xl">{getCategoryEmoji(test.category)}</span>
            </div>

            <div>
              <h1 className="text-title font-extrabold">{test.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{test.subtitle}</p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {test.description}
            </p>

            <div className="flex justify-center gap-6 py-2">
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: test.color }}>
                  {questions.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {test.gameType === "mental" ? "ráfagas" : "preguntas"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: test.color }}>
                  {test.timeEstimateMin}
                </div>
                <div className="text-xs text-muted-foreground">minutos</div>
              </div>
            </div>

            {test.gameType === "mental" && (
              <div className="flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 rounded-lg px-3 py-2">
                <Zap className="w-3.5 h-3.5" />
                ⚡ Este test tiene tiempo límite por pregunta
              </div>
            )}

            <Button
              onClick={startGame}
              className="px-8 py-3 text-base font-bold"
              style={{ backgroundColor: test.color }}
            >
              Comenzar →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Playing Screen ──────────────────────────────────────────

  if (step === "playing" && currentQuestion) {
    const selectedScore = answers[currentQuestion.id];

    return (
      <div className="max-w-lg mx-auto animate-fade-in space-y-4">
        {/* Top bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            disabled={currentIdx === 0}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <Progress value={progress} className="h-2" />
          </div>
          <span className="text-xs text-muted-foreground font-medium tabular-nums">
            {currentIdx + 1}/{questions.length}
          </span>
          {timeLeft !== null && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-bold tabular-nums px-2 py-1 rounded-full",
                timeLeft <= 5
                  ? "text-red-600 bg-red-50 dark:bg-red-950/30 animate-pulse"
                  : "text-amber-600 bg-amber-50 dark:bg-amber-950/20"
              )}
            >
              <Clock className="w-3 h-3" />
              {timeLeft}s
            </div>
          )}
        </div>

        {/* Question card */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div>
              <h2 className="font-bold text-lg leading-tight">{currentQuestion.title}</h2>
              {currentQuestion.subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{currentQuestion.subtitle}</p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedScore === opt.score;
                const isClassic = test.gameType === "classic" || test.gameType === "adventure";

                return (
                  <button
                    key={opt.label}
                    onClick={() => selectOption(currentQuestion.id, opt.score)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-xl border-2 transition-all",
                      isSelected
                        ? "border-current bg-primary/5 shadow-sm"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                    style={
                      isSelected
                        ? { borderColor: test.color, backgroundColor: `${test.color}08` }
                        : undefined
                    }
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
                          isSelected
                            ? "text-white"
                            : "bg-muted-foreground/10 text-muted-foreground"
                        )}
                        style={isSelected ? { backgroundColor: test.color } : undefined}
                      >
                        {opt.label}
                      </span>
                      <span className="text-sm leading-relaxed">{opt.text}</span>
                      {isSelected && (
                        <CheckCircle2
                          className="w-4 h-4 shrink-0 mt-0.5 ml-auto"
                          style={{ color: test.color }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        {test.gameType !== "mental" && (
          <div className="flex justify-between">
            <Button variant="ghost" onClick={goBack} disabled={currentIdx === 0}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <Button
              onClick={goNext}
              disabled={selectedScore === undefined}
              style={
                selectedScore !== undefined
                  ? { backgroundColor: test.color }
                  : undefined
              }
            >
              {isLast ? "Ver resultado" : "Siguiente"}
              {!isLast && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ── Result Screen ───────────────────────────────────────────

  if (step === "result" && profileResult) {
    return (
      <GameResult
        test={test}
        profile={profileResult.data}
        totalTime={totalTime}
        saving={saving}
        onRestart={restart}
        onBack={onBack}
      />
    );
  }

  return null;
}

// ── Helpers ────────────────────────────────────────────────────

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    diagnostico: "🪞",
    puzzle: "🧩",
    aventura: "🗺️",
    mental: "🧠",
    logica: "⚡",
  };
  return map[category] ?? "🎮";
}
