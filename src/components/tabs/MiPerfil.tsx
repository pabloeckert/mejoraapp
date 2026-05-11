/**
 * MiPerfil — P09: Perfil con gestión de membresía
 *
 * Muestra: datos del usuario, nivel de membresía, resultados de tests,
 * historial de pagos, edición de perfil, y opción de upgrade.
 */

import { useState, useEffect } from "react";
import {
  User,
  Building2,
  Briefcase,
  Crown,
  Star,
  Lock,
  Edit3,
  Save,
  X,
  Loader2,
  Globe,
  Linkedin,
  Calendar,
  Phone,
  Gamepad2,
  CreditCard,
  CheckCircle,
  Clock,
  ArrowRight,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useAccessLevel, type AccessLevel } from "@/hooks/useAccessLevel";
import { usePayments } from "@/hooks/usePayments";
import { useMirrorResults } from "@/hooks/useMirrorResults";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DataManagement } from "@/components/DataManagement";
import { cn } from "@/lib/utils";

const LEVEL_CONFIG: Record<AccessLevel, { label: string; icon: typeof Crown; color: string; bg: string; border: string }> = {
  N0: { label: "Gratis", icon: Lock, color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border" },
  N1: { label: "Básico", icon: Star, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
  N2: { label: "Premium", icon: Crown, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800" },
  ADMIN: { label: "Admin", icon: Shield, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
};

const getInitials = (nombre?: string | null, apellido?: string | null) => {
  const n = nombre?.charAt(0) || "";
  const a = apellido?.charAt(0) || "";
  return (n + a).toUpperCase() || "?";
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount: number | null, currency: string | null) => {
  if (amount == null) return "—";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency || "ARS",
  }).format(amount);
};

export function MiPerfil() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile(user?.id);
  const { level, isAdmin, isExpired, membershipExpiresAt } = useAccessLevel(user?.id);
  const { data: payments, isLoading: paymentsLoading } = usePayments(user?.id);
  const { data: mirrorResults, isLoading: mirrorLoading } = useMirrorResults(user?.id, 5);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    empresa: "",
    cargo: "",
    nickname: "",
    whatsapp: "",
    birthday: "",
    bio: "",
    website: "",
    linkedin: "",
  });

  // Collapsible sections
  const [showResults, setShowResults] = useState(true);
  const [showPayments, setShowPayments] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        nombre: profile.nombre || "",
        apellido: profile.apellido || "",
        empresa: profile.empresa || "",
        cargo: profile.cargo || "",
        nickname: profile.nickname || "",
        whatsapp: profile.whatsapp || "",
        birthday: profile.birthday || "",
        bio: profile.bio || "",
        website: profile.website || "",
        linkedin: profile.linkedin || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        nombre: form.nombre.trim() || null,
        apellido: form.apellido.trim() || null,
        empresa: form.empresa.trim() || null,
        cargo: form.cargo.trim() || null,
        nickname: form.nickname.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        birthday: form.birthday || null,
        bio: form.bio.trim() || null,
        website: form.website.trim() || null,
        linkedin: form.linkedin.trim() || null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "No se pudo guardar el perfil.", variant: "destructive" });
    } else {
      toast({ title: "Perfil actualizado" });
      setEditing(false);
      refetchProfile();
    }
    setSaving(false);
  };

  const cancelEdit = () => {
    if (profile) {
      setForm({
        nombre: profile.nombre || "",
        apellido: profile.apellido || "",
        empresa: profile.empresa || "",
        cargo: profile.cargo || "",
        nickname: profile.nickname || "",
        whatsapp: profile.whatsapp || "",
        birthday: profile.birthday || "",
        bio: profile.bio || "",
        website: profile.website || "",
        linkedin: profile.linkedin || "",
      });
    }
    setEditing(false);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const levelConfig = LEVEL_CONFIG[level];
  const LevelIcon = levelConfig.icon;
  const displayName =
    profile?.display_name ||
    [profile?.nombre, profile?.apellido].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "Usuario";

  return (
    <div className="space-y-4 pb-4">
      {/* ── Header: Avatar + Nombre + Nivel ── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
              {getInitials(profile?.nombre, profile?.apellido)}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <h2 className="text-lg font-bold text-foreground truncate">{displayName}</h2>
              {(profile?.cargo || profile?.empresa) && (
                <p className="text-sm text-muted-foreground truncate">
                  {profile?.cargo}{profile?.cargo && profile?.empresa && " en "}{profile?.empresa}
                </p>
              )}
              {profile?.nickname && (
                <p className="text-xs text-muted-foreground">@{profile.nickname}</p>
              )}

              {/* Badge de nivel */}
              <Badge
                variant="outline"
                className={cn("gap-1.5 mt-1", levelConfig.color, levelConfig.border)}
              >
                <LevelIcon className="w-3.5 h-3.5" />
                {levelConfig.label}
                {isExpired && (
                  <span className="text-red-500 ml-1">(vencida)</span>
                )}
              </Badge>
            </div>
          </div>

          {/* Vencimiento de membresía */}
          {membershipExpiresAt && level !== "N0" && level !== "ADMIN" && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {isExpired ? "Venció" : "Vence"}: {formatDate(membershipExpiresAt)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Upgrade CTA para N0 ── */}
      {level === "N0" && (
        <Card className="border-dashed border-2">
          <CardContent className="p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-body font-medium">Upgrade tu membresía</p>
              <p className="text-caption text-muted-foreground mt-1">
                Accedé a eventos, Mentor IA, Business Mirror Gamer y más beneficios
              </p>
            </div>
            <Button
              size="sm"
              onClick={async () => {
                const productId = import.meta.env.VITE_TIENDUP_PRODUCT_N1;
                if (productId) {
                  try {
                    const { openCheckout } = await import("@/services/tiendup.service");
                    await openCheckout(productId);
                    return;
                  } catch { /* fallback */ }
                }
                const text = encodeURIComponent("Hola! Quiero info sobre membresías de Mejora Continua.");
                window.open(`https://wa.me/?text=${text}`, "_blank");
              }}
              className="gap-2"
            >
              Ver membresías
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Datos del perfil ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Mis datos</CardTitle>
            {!editing ? (
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="gap-1.5 h-8 text-xs">
                <Edit3 className="w-3.5 h-3.5" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 text-xs">
                  <X className="w-3.5 h-3.5 mr-1" />
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="h-8 text-xs">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                  Guardar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nombre</Label>
                  <Input
                    value={form.nombre}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    className="h-9 text-sm"
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Apellido</Label>
                  <Input
                    value={form.apellido}
                    onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))}
                    className="h-9 text-sm"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-muted-foreground" />
                    Empresa
                  </Label>
                  <Input
                    value={form.empresa}
                    onChange={(e) => setForm((f) => ({ ...f, empresa: e.target.value }))}
                    className="h-9 text-sm"
                    placeholder="Tu empresa"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-muted-foreground" />
                    Cargo
                  </Label>
                  <Input
                    value={form.cargo}
                    onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
                    className="h-9 text-sm"
                    placeholder="Tu cargo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nickname</Label>
                  <Input
                    value={form.nickname}
                    onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value.slice(0, 20) }))}
                    className="h-9 text-sm"
                    placeholder="Tu apodo"
                  />
                  <p className="text-[10px] text-muted-foreground">Visible en el muro (N1/N2)</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    WhatsApp
                  </Label>
                  <Input
                    value={form.whatsapp}
                    onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                    className="h-9 text-sm"
                    placeholder="+54 9 11 ..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  Fecha de nacimiento
                </Label>
                <Input
                  type="date"
                  value={form.birthday}
                  onChange={(e) => setForm((f) => ({ ...f, birthday: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Bio</Label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value.slice(0, 300) }))}
                  rows={3}
                  className="resize-none text-sm"
                  placeholder="Contá un poco sobre vos..."
                />
                <p className="text-[10px] text-muted-foreground text-right">{form.bio.length}/300</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    <Globe className="w-3 h-3 text-muted-foreground" />
                    Website
                  </Label>
                  <Input
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                    className="h-9 text-sm"
                    placeholder="https://tu-negocio.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    <Linkedin className="w-3 h-3 text-muted-foreground" />
                    LinkedIn
                  </Label>
                  <Input
                    value={form.linkedin}
                    onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))}
                    className="h-9 text-sm"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <InfoRow icon={<User className="w-4 h-4" />} label="Nombre" value={[profile?.nombre, profile?.apellido].filter(Boolean).join(" ")} />
              <InfoRow icon={<Building2 className="w-4 h-4" />} label="Empresa" value={profile?.empresa} />
              <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Cargo" value={profile?.cargo} />
              {profile?.nickname && <InfoRow icon={<User className="w-4 h-4" />} label="Nickname" value={`@${profile.nickname}`} />}
              {profile?.whatsapp && <InfoRow icon={<Phone className="w-4 h-4" />} label="WhatsApp" value={profile.whatsapp} />}
              {profile?.birthday && <InfoRow icon={<Calendar className="w-4 h-4" />} label="Nacimiento" value={formatDate(profile.birthday)} />}
              {profile?.bio && (
                <div className="pt-1">
                  <p className="text-xs text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm text-foreground">{profile.bio}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {profile?.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
                {profile?.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Business Mirror Gamer — Resultados ── */}
      {level !== "N0" && (
        <Card>
          <CardHeader className="pb-2">
            <button
              className="flex items-center justify-between w-full"
              onClick={() => setShowResults(!showResults)}
            >
              <CardTitle className="text-base flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-pink-500" />
                Business Mirror Gamer
              </CardTitle>
              {showResults ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
          </CardHeader>
          {showResults && (
            <CardContent className="space-y-2">
              {mirrorLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : mirrorResults && mirrorResults.length > 0 ? (
                mirrorResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <div className="w-9 h-9 rounded-full bg-pink-100 dark:bg-pink-950/30 flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-4 h-4 text-pink-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {result.profile || "Sin perfil"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.score != null && `${result.score} pts · `}
                        {result.time_spent_seconds != null && `${Math.round(result.time_spent_seconds / 60)} min · `}
                        {formatDate(result.completed_at)}
                      </p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  Aún no completaste ningún test
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* ── Historial de pagos ── */}
      {level !== "N0" && (
        <Card>
          <CardHeader className="pb-2">
            <button
              className="flex items-center justify-between w-full"
              onClick={() => setShowPayments(!showPayments)}
            >
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Pagos
              </CardTitle>
              {showPayments ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
          </CardHeader>
          {showPayments && (
            <CardContent className="space-y-2">
              {paymentsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : payments && payments.length > 0 ? (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                      payment.status === "completed" ? "bg-green-100 dark:bg-green-950/30" : "bg-muted"
                    )}>
                      <CreditCard className={cn(
                        "w-4 h-4",
                        payment.status === "completed" ? "text-green-600" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.notes || payment.payment_method || "Pago"}
                        {" · "}
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        payment.status === "completed" && "text-green-600 border-green-200",
                        payment.status === "pending" && "text-amber-600 border-amber-200",
                        payment.status === "failed" && "text-red-600 border-red-200"
                      )}
                    >
                      {payment.status === "completed" ? "Pagado" : payment.status === "pending" ? "Pendiente" : payment.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  Sin pagos registrados
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* ── Datos personales (Ley 25.326) ── */}
      <Card>
        <CardContent className="p-5">
          <DataManagement />
        </CardContent>
      </Card>

      {/* ── Cerrar sesión ── */}
      <Button
        variant="outline"
        className="w-full text-destructive hover:text-destructive hover:bg-destructive/5"
        onClick={signOut}
      >
        Cerrar sesión
      </Button>

      {/* ── Legal ── */}
      <div className="flex items-center justify-center gap-4 pt-1">
        <a href="/politica-privacidad.html" target="_blank" className="text-caption text-muted-foreground hover:text-foreground underline">
          Privacidad
        </a>
        <a href="/terminos-servicio.html" target="_blank" className="text-caption text-muted-foreground hover:text-foreground underline">
          Términos
        </a>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs text-muted-foreground w-20">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

export default MiPerfil;
