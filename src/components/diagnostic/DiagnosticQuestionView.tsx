/** DiagnosticQuestionView — Question step with progress bar */

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DiagnosticQuestion } from "@/data/diagnosticData";

interface DiagnosticQuestionViewProps {
  question: DiagnosticQuestion;
  currentIdx: number;
  answers: Record<number, number>;
  progress: number;
  onSelect: (questionId: number, score: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export const DiagnosticQuestionView = ({
  question,
  currentIdx,
  answers,
  progress,
  onSelect,
  onBack,
  onNext,
}: DiagnosticQuestionViewProps) => {
  const labels = ["A", "B", "C", "D"];
  const isLast = currentIdx === 7;
  const hasAnswer = answers[question.id] !== undefined;

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="bg-mc-diag-blue rounded-t-xl px-5 py-4 text-white">
        <div className="text-caption font-bold tracking-widest uppercase opacity-65 mb-1">
          Pregunta {currentIdx + 1} de 8
        </div>
        <h2 className="text-body font-black leading-snug mb-1">{question.title}</h2>
        <p className="text-caption opacity-75 leading-relaxed">{question.sub}</p>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-foreground/15">
        <div
          className="h-full bg-mc-diag-red transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-end px-5 py-1">
        <span className="text-caption text-muted-foreground font-medium">{progress}%</span>
      </div>

      <div className="bg-card rounded-b-xl shadow-lg p-5">
        <div className="space-y-2.5">
          {question.opts.map((opt, i) => {
            const isSelected = answers[question.id] === opt.score;
            return (
              <button
                key={i}
                onClick={() => onSelect(question.id, opt.score)}
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
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
          </Button>
          <Button
            onClick={onNext}
            disabled={!hasAnswer}
            className={cn(
              isLast
                ? "bg-mc-diag-red hover:bg-mc-diag-red/90"
                : "bg-mc-diag-blue hover:bg-mc-diag-blue/90",
              "text-white"
            )}
          >
            {isLast ? "Ver mi Mirror" : "Siguiente"}{" "}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
