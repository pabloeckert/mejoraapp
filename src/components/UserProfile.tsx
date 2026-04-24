/**
 * UserProfile — Perfil completo del usuario
 *
 * Muestra: avatar con iniciales, nombre, empresa, cargo, bio, links, badges.
 * Permite editar bio y links.
 * Se muestra como modal/sheet desde el header.
 */

import { useState, useEffect } from "react";
import {
  User,
  Building2,
  Briefcase,
  Globe,
  Linkedin,
  Edit3,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBadges } from "@/hooks/useBadges";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProfileData {
  nombre: string | null;
  apellido: string | null;
  empresa: string | null;
  cargo: string | null;
  bio: string | null;
  website: string | null;
  linkedin: string | null;
  display_name: string | null;
}

const getInitials = (nombre?: string | null, apellido?: string | null) => {
  const n = nombre?.charAt(0) || "";
  const a = apellido?.charAt(0) || "";
  return (n + a).toUpperCase() || "?";
};

export const UserProfile = ({ open, onOpenChange }: UserProfileProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { earnedBadges, totalEarned, totalAvailable, loading: badgesLoading } = useBadges(user?.id);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");

  useEffect(() => {
    if (!user || !open) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("nombre, apellido, empresa, cargo, bio, website, linkedin, display_name")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("[Profile] Error:", error);
        setLoading(false);
        return;
      }

      setProfile(data);
      setBio(data.bio || "");
      setWebsite(data.website || "");
      setLinkedin(data.linkedin || "");
      setLoading(false);
    };

    fetchProfile();
  }, [user, open]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        bio: bio.trim() || null,
        website: website.trim() || null,
        linkedin: linkedin.trim() || null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
    } else {
      toast({ title: "Perfil actualizado" });
      setProfile((prev) =>
        prev
          ? { ...prev, bio: bio.trim() || null, website: website.trim() || null, linkedin: linkedin.trim() || null }
          : prev
      );
      setEditing(false);
    }
    setSaving(false);
  };

  const displayName =
    profile?.display_name ||
    [profile?.nombre, profile?.apellido].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "Usuario";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl overflow-y-auto">
        <SheetHeader className="sr-only">
          <SheetTitle>Perfil</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-5 pt-2 pb-8">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                {getInitials(profile?.nombre, profile?.apellido)}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-foreground truncate">{displayName}</h2>
                {profile?.cargo && profile?.empresa && (
                  <p className="text-sm text-muted-foreground">
                    {profile.cargo} en {profile.empresa}
                  </p>
                )}
                {profile?.cargo && !profile?.empresa && (
                  <p className="text-sm text-muted-foreground">{profile.cargo}</p>
                )}
                {!profile?.cargo && profile?.empresa && (
                  <p className="text-sm text-muted-foreground">{profile.empresa}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            {editing ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bio" className="text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Contá un poco sobre vos y tu negocio..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 300))}
                    rows={3}
                    className="resize-none"
                  />
                  <span className="text-[10px] text-muted-foreground">{bio.length}/300</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="website" className="text-xs flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://tu-negocio.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="linkedin" className="text-xs flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-muted-foreground" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/tu-perfil"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                    Guardar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {profile?.bio && (
                  <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {profile?.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </a>
                  )}
                  {profile?.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      LinkedIn
                    </a>
                  )}
                </div>

                <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar perfil
                </Button>
              </>
            )}

            {/* Badges */}
            <div className="pt-2 border-t border-border">
              {badgesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <BadgeDisplay
                  earnedBadges={earnedBadges}
                  variant="progress"
                />
              )}
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{totalEarned}</div>
                <div className="text-[10px] text-muted-foreground">Badges</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{totalAvailable}</div>
                <div className="text-[10px] text-muted-foreground">Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {totalEarned > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0}%
                </div>
                <div className="text-[10px] text-muted-foreground">Completado</div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default UserProfile;
