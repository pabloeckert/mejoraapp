/**
 * BadgeDisplay — Muestra badges del usuario
 *
 * Variantes:
 * - compact: pills pequeñas con emoji + nombre (para muro/header)
 * - full: cards con descripción (para perfil)
 * - progress: muestra todos con los ganados resaltados (para motivación)
 */

import { cn } from "@/lib/utils";
import { Award } from "lucide-react";
import { BADGES, BadgeDefinition } from "@/data/badges";
import type { EarnedBadge } from "@/hooks/useBadges";

interface BadgeDisplayProps {
  earnedBadges: EarnedBadge[];
  variant?: "compact" | "full" | "progress";
  maxShow?: number;
  className?: string;
}

export const BadgeDisplay = ({
  earnedBadges,
  variant = "compact",
  maxShow,
  className,
}: BadgeDisplayProps) => {
  const earnedSlugs = new Set(earnedBadges.map((b) => b.slug));

  if (variant === "compact") {
    const toShow = maxShow ? earnedBadges.slice(0, maxShow) : earnedBadges;
    const remaining = maxShow ? Math.max(0, earnedBadges.length - maxShow) : 0;

    if (earnedBadges.length === 0) return null;

    return (
      <div className={cn("flex items-center gap-1 flex-wrap", className)}>
        {toShow.map((badge) => (
          <span
            key={badge.slug}
            className={cn(
              "inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
              badge.bgColor,
              badge.color
            )}
            title={`${badge.name}: ${badge.description}`}
          >
            {badge.emoji} {badge.name}
          </span>
        ))}
        {remaining > 0 && (
          <span className="text-[10px] text-muted-foreground font-medium">
            +{remaining} más
          </span>
        )}
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className={cn("space-y-2", className)}>
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" />
          Logros ({earnedBadges.length}/{BADGES.length})
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {earnedBadges.map((badge) => (
            <div
              key={badge.slug}
              className={cn(
                "flex items-start gap-2 p-2.5 rounded-lg border",
                badge.bgColor,
                "border-transparent"
              )}
            >
              <span className="text-lg">{badge.emoji}</span>
              <div className="min-w-0">
                <p className={cn("text-xs font-bold", badge.color)}>{badge.name}</p>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // variant === "progress"
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Award className="w-3.5 h-3.5" />
        Logros ({earnedBadges.length}/{BADGES.length})
      </h4>
      <div className="grid grid-cols-2 gap-1.5">
        {BADGES.map((badge: BadgeDefinition) => {
          const earned = earnedSlugs.has(badge.slug);
          return (
            <div
              key={badge.slug}
              className={cn(
                "flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-all",
                earned
                  ? cn(badge.bgColor, "border-transparent")
                  : "bg-muted/30 border-border/50 opacity-50"
              )}
            >
              <span className={cn("text-sm", earned ? "" : "grayscale")}>
                {badge.emoji}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[11px] font-semibold",
                    earned ? badge.color : "text-muted-foreground"
                  )}
                >
                  {badge.name}
                </p>
                <p className="text-[9px] text-muted-foreground leading-snug line-clamp-1">
                  {badge.description}
                </p>
              </div>
              {earned && (
                <span className="ml-auto text-[10px]">✓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeDisplay;
