/**
 * MemberCard — Card for community member directory
 *
 * Shows: avatar with initials, name, empresa, cargo, bio snippet, badges, stats.
 * Compact variant for list view, featured variant for highlighted cards.
 */

import { Award, MessageSquare, Heart, MapPin, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommunityMember } from "@/hooks/useMembers";

const getInitials = (nombre?: string | null, apellido?: string | null) => {
  const n = nombre?.charAt(0) || "";
  const a = apellido?.charAt(0) || "";
  return (n + a).toUpperCase() || "?";
};

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-purple-600",
  "bg-emerald-600",
  "bg-red-600",
  "bg-amber-600",
  "bg-cyan-600",
  "bg-rose-600",
  "bg-indigo-600",
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface MemberCardProps {
  member: CommunityMember;
  variant?: "compact" | "featured";
  onViewProfile?: (member: CommunityMember) => void;
  className?: string;
}

export const MemberCard = ({
  member,
  variant = "compact",
  onViewProfile,
  className,
}: MemberCardProps) => {
  const displayName =
    member.display_name ||
    `${member.nombre || ""} ${member.apellido || ""}`.trim() ||
    "Miembro";
  const initials = getInitials(member.nombre, member.apellido);
  const avatarColor = getAvatarColor(member.id);
  const bioSnippet = member.bio
    ? member.bio.length > 80
      ? member.bio.slice(0, 80) + "…"
      : member.bio
    : null;

  if (variant === "featured") {
    return (
      <button
        onClick={() => onViewProfile?.(member)}
        className={cn(
          "w-full text-left rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0", avatarColor)}>
            {member.avatar_url ? (
              <img src={member.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground truncate text-sm">{displayName}</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Activo" />
            </div>
            {(member.cargo || member.empresa) && (
              <p className="text-caption text-muted-foreground truncate">
                {member.cargo}{member.cargo && member.empresa && " · "}{member.empresa}
              </p>
            )}
          </div>
        </div>

        {bioSnippet && (
          <p className="mt-2 text-caption text-muted-foreground italic">"{bioSnippet}"</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {member.badge_count > 0 && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-caption font-medium">
                <Award className="w-3 h-3" />
                {member.badge_count}
              </span>
            )}
            {member.total_likes > 0 && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-caption font-medium">
                <Heart className="w-3 h-3" />
                {member.total_likes}
              </span>
            )}
          </div>
          <span className="text-caption text-primary font-semibold">Ver perfil →</span>
        </div>
      </button>
    );
  }

  // Compact variant — list item
  return (
    <button
      onClick={() => onViewProfile?.(member)}
      className={cn(
        "w-full text-left flex items-center gap-3 p-3 rounded-xl border bg-card transition-all hover:shadow-sm hover:border-primary/20",
        className
      )}
    >
      <div className={cn("w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0", avatarColor)}>
        {member.avatar_url ? (
          <img src={member.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground text-sm truncate">{displayName}</span>
          {member.badge_count > 0 && (
            <span className="inline-flex items-center gap-0.5 text-caption text-amber-600">
              <Award className="w-3 h-3" />
              {member.badge_count}
            </span>
          )}
        </div>
        <p className="text-caption text-muted-foreground truncate">
          {member.cargo}{member.cargo && member.empresa && " · "}{member.empresa}
          {member.city && (
            <span className="inline-flex items-center gap-0.5 ml-1">
              <MapPin className="w-2.5 h-2.5" />{member.city}
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-caption text-muted-foreground shrink-0">
        {member.post_count > 0 && (
          <span className="flex items-center gap-0.5" title="Posts">
            <MessageSquare className="w-3 h-3" />{member.post_count}
          </span>
        )}
        {member.total_likes > 0 && (
          <span className="flex items-center gap-0.5" title="Likes">
            <Heart className="w-3 h-3" />{member.total_likes}
          </span>
        )}
      </div>
    </button>
  );
};

export default MemberCard;
