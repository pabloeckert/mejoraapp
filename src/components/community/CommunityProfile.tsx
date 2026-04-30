/**
 * CommunityProfile — Public profile sheet for viewing other members
 *
 * Shows: avatar, full name, empresa, cargo, bio, badges, stats, links.
 * Accessible from MemberCard tap.
 */

import {
  Building2,
  Briefcase,
  MapPin,
  Globe,
  Linkedin,
  Award,
  MessageSquare,
  Heart,
  ExternalLink,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CommunityMember } from "@/hooks/useMembers";

const getInitials = (nombre?: string | null, apellido?: string | null) => {
  const n = nombre?.charAt(0) || "";
  const a = apellido?.charAt(0) || "";
  return (n + a).toUpperCase() || "?";
};

const AVATAR_COLORS = [
  "bg-blue-600", "bg-purple-600", "bg-emerald-600", "bg-red-600",
  "bg-amber-600", "bg-cyan-600", "bg-rose-600", "bg-indigo-600",
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface CommunityProfileProps {
  member: CommunityMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommunityProfile = ({
  member,
  open,
  onOpenChange,
}: CommunityProfileProps) => {
  if (!member) return null;

  const displayName =
    member.display_name ||
    `${member.nombre || ""} ${member.apellido || ""}`.trim() ||
    "Miembro";
  const initials = getInitials(member.nombre, member.apellido);
  const avatarColor = getAvatarColor(member.id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="sr-only">
          <SheetTitle>Perfil de {displayName}</SheetTitle>
        </SheetHeader>

        {/* Avatar + Name */}
        <div className="flex flex-col items-center pt-4 pb-3">
          <div className={cn("w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl", avatarColor)}>
            {member.avatar_url ? (
              <img src={member.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <h2 className="mt-3 text-title font-bold text-foreground">{displayName}</h2>
          {(member.cargo || member.empresa) && (
            <p className="text-body text-muted-foreground flex items-center gap-1.5 mt-1">
              {member.cargo && <Briefcase className="w-3.5 h-3.5" />}
              {member.cargo}{member.cargo && member.empresa && " · "}{member.empresa}
            </p>
          )}
          {member.city && (
            <p className="text-caption text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />{member.city}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 py-3 border-y border-border">
          <div className="text-center">
            <span className="text-title font-bold text-foreground">{member.badge_count}</span>
            <p className="text-caption text-muted-foreground flex items-center gap-0.5">
              <Award className="w-3 h-3" /> Badges
            </p>
          </div>
          <div className="text-center">
            <span className="text-title font-bold text-foreground">{member.post_count}</span>
            <p className="text-caption text-muted-foreground flex items-center gap-0.5">
              <MessageSquare className="w-3 h-3" /> Posts
            </p>
          </div>
          <div className="text-center">
            <span className="text-title font-bold text-foreground">{member.total_likes}</span>
            <p className="text-caption text-muted-foreground flex items-center gap-0.5">
              <Heart className="w-3 h-3" /> Likes
            </p>
          </div>
        </div>

        {/* Bio */}
        {member.bio && (
          <div className="py-4">
            <h3 className="text-body font-semibold text-foreground mb-1">Sobre mí</h3>
            <p className="text-body text-muted-foreground leading-relaxed">{member.bio}</p>
          </div>
        )}

        {/* Industry */}
        {member.industry && (
          <div className="flex items-center gap-2 py-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-body text-muted-foreground">{member.industry}</span>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-col gap-2 py-4">
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5]/20 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              <span className="text-sm font-medium">LinkedIn</span>
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
          )}
          {member.linkedin === null && (
            <p className="text-caption text-muted-foreground text-center py-2">
              Este miembro aún no compartió links.
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="pb-6">
          <Button
            className="w-full"
            size="lg"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommunityProfile;
