/**
 * CommunityRanking — Ranking de top contributors
 *
 * Muestra los miembros más activos de la comunidad.
 * Respetando anonimato: solo muestra display_name y empresa.
 * Sección expandible en el muro.
 */

import { useState } from "react";
import { Trophy, ChevronDown, ChevronUp, Heart, MessageSquare, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRanking, type RankingEntry } from "@/hooks/useRanking";

const MEDAL_COLORS = ["🥇", "🥈", "🥉"];

const RankingRow = ({
  entry,
  position,
  isCurrentUser,
}: {
  entry: RankingEntry;
  position: number;
  isCurrentUser: boolean;
}) => (
  <div
    className={cn(
      "flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors",
      isCurrentUser ? "bg-primary/5 border border-primary/10" : "hover:bg-secondary/50"
    )}
  >
    <span className="w-6 text-center text-sm font-bold shrink-0">
      {position < 3 ? MEDAL_COLORS[position] : (
        <span className="text-muted-foreground text-xs">{position + 1}</span>
      )}
    </span>

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <span className={cn(
          "text-sm font-semibold truncate",
          isCurrentUser ? "text-primary" : "text-foreground"
        )}>
          {entry.display_name}
          {isCurrentUser && <span className="text-[10px] ml-1 opacity-60">(vos)</span>}
        </span>
      </div>
      {entry.empresa && (
        <span className="text-[10px] text-muted-foreground truncate block">
          {entry.empresa}
        </span>
      )}
    </div>

    <div className="flex items-center gap-3 shrink-0 text-[10px] text-muted-foreground">
      {entry.badge_count > 0 && (
        <span className="flex items-center gap-0.5" title="Badges">
          <Award className="w-3 h-3" />
          {entry.badge_count}
        </span>
      )}
      <span className="flex items-center gap-0.5" title="Posts">
        <MessageSquare className="w-3 h-3" />
        {entry.post_count}
      </span>
      <span className="flex items-center gap-0.5" title="Likes recibidos">
        <Heart className="w-3 h-3" />
        {entry.total_likes_received}
      </span>
    </div>
  </div>
);

interface CommunityRankingProps {
  currentUserId?: string;
  limit?: number;
}

export const CommunityRanking = ({
  currentUserId,
  limit = 5,
}: CommunityRankingProps) => {
  const { ranking, loading } = useRanking(limit);
  const [expanded, setExpanded] = useState(false);

  if (loading || ranking.length === 0) return null;

  const displayRanking = expanded ? ranking : ranking.slice(0, 3);

  return (
    <Card className="border-dashed">
      <CardContent className="p-3 space-y-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-foreground">
              Top Contribuidores
            </span>
            <span className="text-[10px] text-muted-foreground">
              ({ranking.length})
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <div className="space-y-1">
          {displayRanking.map((entry, idx) => (
            <RankingRow
              key={entry.user_id}
              entry={entry}
              position={idx}
              isCurrentUser={entry.user_id === currentUserId}
            />
          ))}
        </div>

        {!expanded && ranking.length > 3 && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full text-center text-[10px] text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Ver los {ranking.length} contribuidores →
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityRanking;
