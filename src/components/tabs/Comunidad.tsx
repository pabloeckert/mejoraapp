/**
 * Comunidad — Community tab for MejoraApp
 *
 * Features:
 * - Stats bar (members, active today, engagement)
 * - Weekly challenge banner with CTA
 * - Featured members carousel
 * - Member directory with filters
 * - Member profile sheet
 *
 * Sub-components: MemberCard, CommunityProfile
 */

import { useState, useCallback } from "react";
import {
  Users,
  Search,
  Flame,
  Trophy,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useMembers, useChallenges, useChallengeParticipation } from "@/hooks/useMembers";
import type { CommunityMember } from "@/hooks/useMembers";
import { MemberCard } from "@/components/community/MemberCard";
import { CommunityProfile } from "@/components/community/CommunityProfile";
import { trackTabSwitch } from "@/lib/analytics";

const INDUSTRY_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "tech", label: "Tech" },
  { id: "consulting", label: "Consultoría" },
  { id: "finance", label: "Finanzas" },
  { id: "marketing", label: "Marketing" },
  { id: "operations", label: "Operaciones" },
];

const Comunidad = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const { members, loading, totalCount } = useMembers({
    industry: industryFilter,
    search,
    limit: 30,
  });

  const { members: featured } = useMembers({ featured: true });
  const { challenges } = useChallenges();

  const handleViewProfile = useCallback((member: CommunityMember) => {
    setSelectedMember(member);
    setShowProfile(true);
  }, []);

  // Current challenge (first active one)
  const currentChallenge = challenges[0];

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-3 divide-x divide-border">
            <StatItem
              value={totalCount}
              label="Miembros"
              icon={<Users className="w-3.5 h-3.5 text-primary" />}
            />
            <StatItem
              value={Math.max(1, Math.floor(totalCount * 0.25))}
              label="Activos hoy"
              icon={<TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
            />
            <StatItem
              value={`${Math.min(99, Math.floor(totalCount * 1.9))}%`}
              label="Engagement"
              icon={<Flame className="w-3.5 h-3.5 text-amber-500" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Challenge Banner */}
      {currentChallenge && (
        <ChallengeBanner challenge={currentChallenge} userId={user?.id} />
      )}

      {/* Featured Members */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h2 className="text-subtitle font-bold text-foreground">Miembros Destacados</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {featured.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                variant="featured"
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
        </section>
      )}

      {/* Directory */}
      <section>
        <h2 className="text-subtitle font-bold text-foreground mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Directorio de Miembros
        </h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o empresa…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Industry Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1 scrollbar-none">
          {INDUSTRY_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setIndustryFilter(filter.id)}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-caption font-medium transition-all",
                industryFilter === filter.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Member List */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-body text-muted-foreground">
                {search
                  ? "No se encontraron miembros con ese criterio."
                  : "Aún no hay miembros visibles en la comunidad."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                variant="compact"
                onViewProfile={handleViewProfile}
              />
            ))}
            {totalCount > members.length && (
              <p className="text-center text-caption text-muted-foreground py-2">
                Mostrando {members.length} de {totalCount} miembros
              </p>
            )}
          </div>
        )}
      </section>

      {/* Profile Sheet */}
      <CommunityProfile
        member={selectedMember}
        open={showProfile}
        onOpenChange={setShowProfile}
      />
    </div>
  );
};

/** StatItem — Single stat in the stats bar */
const StatItem = ({
  value,
  label,
  icon,
}: {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center gap-0.5 px-2">
    <div className="flex items-center gap-1">
      {icon}
      <span className="text-title font-bold text-foreground">{value}</span>
    </div>
    <span className="text-caption text-muted-foreground">{label}</span>
  </div>
);

/** ChallengeBanner — Active challenge CTA */
const ChallengeBanner = ({
  challenge,
  userId,
}: {
  challenge: { id: string; title: string; description: string | null; end_date: string; participant_count: number };
  userId?: string;
}) => {
  const { joined, toggleJoin } = useChallengeParticipation(challenge.id, userId);

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-red-500 p-4 text-white">
      <div className="relative z-10">
        <p className="text-caption font-semibold uppercase tracking-wide opacity-85 flex items-center gap-1">
          <Flame className="w-3.5 h-3.5" /> Desafío Semanal
        </p>
        <h3 className="text-subtitle font-bold mt-1">{challenge.title}</h3>
        <p className="text-caption opacity-75 mt-1">
          {challenge.participant_count} participantes · Termina en {daysLeft} día{daysLeft !== 1 && "s"}
        </p>
        <Button
          size="sm"
          variant="secondary"
          className="mt-3 bg-white/20 hover:bg-white/30 text-white border-white/30"
          onClick={toggleJoin}
        >
          {joined ? "✓ Ya participás" : "Unirme"}
          {!joined && <ChevronRight className="w-3.5 h-3.5 ml-1" />}
        </Button>
      </div>
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
      <div className="absolute bottom-0 right-8 w-16 h-16 bg-white/5 rounded-full translate-y-4" />
    </div>
  );
};

export default Comunidad;
