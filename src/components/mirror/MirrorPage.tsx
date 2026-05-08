/**
 * MirrorPage — Página principal del Business Mirror Gamer
 *
 * Orquesta: Hub (catálogo) ↔ Player (juego activo).
 * Se monta como tab "mirror" en Index.tsx.
 */

import { useState, useCallback } from "react";
import { BusinessMirrorHub } from "./BusinessMirrorHub";
import { GamePlayer } from "./GamePlayer";
import { getTestBySlug } from "@/data/businessMirrorTests";

type MirrorView = "hub" | "playing";

export function MirrorPage() {
  const [view, setView] = useState<MirrorView>("hub");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const handleSelectTest = useCallback((slug: string) => {
    setSelectedSlug(slug);
    setView("playing");
  }, []);

  const handleBack = useCallback(() => {
    setView("hub");
    setSelectedSlug(null);
  }, []);

  if (view === "playing" && selectedSlug) {
    const test = getTestBySlug(selectedSlug);
    if (!test) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Test no encontrado</p>
          <button onClick={handleBack} className="text-sm text-primary mt-2">
            Volver
          </button>
        </div>
      );
    }
    return <GamePlayer test={test} onBack={handleBack} />;
  }

  return <BusinessMirrorHub onSelectTest={handleSelectTest} />;
}
