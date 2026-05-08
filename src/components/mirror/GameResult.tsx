/**
 * GameResult — Pantalla de resultado del Business Mirror Gamer
 *
 * Muestra el perfil obtenido con sus traits, descripción y consejos.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  RotateCcw,
  Share2,
  Clock,
  Trophy,
  Sparkles,
  Home,
} from "lucide-react";
import type { TestDefinition, TestProfile } from "@/data/businessMirrorTests";

interface GameResultProps {
  test: TestDefinition;
  profile: TestProfile;
  totalTime: number;
  saving: boolean;
  onRestart: () => void;
  onBack: () => void;
}

export function GameResult({
  test,
  profile,
  totalTime,
  saving,
  onRestart,
  onBack,
}: GameResultProps) {
  const minutes = Math.floor(totalTime / 60);
  const seconds = totalTime % 60;

  const handleShare = () => {
    const text = `🎮 Hice el test "${test.title}" en Business Mirror Gamer y mi perfil es: ${profile.title} — ${profile.tagline}`;
    const url = window.location.origin;

    if (navigator.share) {
      navigator.share({ text, url }).catch(() => {});
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
      window.open(waUrl, "_blank");
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in space-y-4">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a tests
      </button>

      {/* Result card */}
      <Card className="overflow-hidden">
        {/* Color header */}
        <div
          className="px-6 py-8 text-center text-white"
          style={{ backgroundColor: profile.color }}
        >
          <div className="inline-flex items-center gap-1.5 text-xs font-medium opacity-80 mb-3">
            <Trophy className="w-3.5 h-3.5" />
            Resultado — {test.title}
          </div>
          <h1 className="text-2xl font-extrabold mb-2">{profile.title}</h1>
          <p className="text-sm opacity-90 max-w-xs mx-auto leading-relaxed">
            {profile.tagline}
          </p>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Time */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Completado en {minutes > 0 ? `${minutes}m ` : ""}
            {seconds}s
            {saving && (
              <span className="ml-2 text-xs animate-pulse">Guardando...</span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: profile.color }} />
              Tu perfil
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.description}
            </p>
          </div>

          {/* Traits */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Características</h3>
            <div className="flex flex-wrap gap-2">
              {profile.traits.map((trait) => (
                <Badge
                  key={trait}
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: `${profile.color}12`,
                    color: profile.color,
                  }}
                >
                  {trait}
                </Badge>
              ))}
            </div>
          </div>

          {/* Advice */}
          <Card className="bg-muted/50 border-none">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1.5">💡 Consejo</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile.advice}
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleShare}
              className="w-full gap-2"
              style={{ backgroundColor: profile.color }}
            >
              <Share2 className="w-4 h-4" />
              Compartir resultado
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onRestart} className="flex-1 gap-2">
                <RotateCcw className="w-4 h-4" />
                Repetir
              </Button>
              <Button variant="outline" onClick={onBack} className="flex-1 gap-2">
                <Home className="w-4 h-4" />
                Otros tests
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
