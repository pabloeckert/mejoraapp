/** DiagnosticIntro — Intro screen for the diagnostic test */

import { Button } from "@/components/ui/button";
import { FeatureGate } from "@/components/FeatureGate";
import { PERFILES } from "@/data/diagnosticData";
import type { DiagnosticHistoryEntry } from "./types";

interface DiagnosticIntroProps {
  history: DiagnosticHistoryEntry[];
  onStart: () => void;
}

export const DiagnosticIntro = ({ history, onStart }: DiagnosticIntroProps) => (
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
        onClick={onStart}
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
