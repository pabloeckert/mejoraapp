import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  User,
  CheckCircle,
  Pencil,
  X,
  Save,
  Search,
  Building2,
  Briefcase,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface DiagResult {
  user_id: string;
  perfil: string;
  puntaje_total: number;
}

interface ExtendedProfile extends Profile {
  auth_email?: string;
}

const fetchProfiles = async (): Promise<ExtendedProfile[]> => {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as ExtendedProfile[]) ?? [];
};

const fetchDiagnostics = async (): Promise<Record<string, DiagResult>> => {
  const { data } = await supabase
    .from("diagnostic_results")
    .select("user_id, perfil, puntaje_total");
  const map: Record<string, DiagResult> = {};
  (data ?? []).forEach((d) => { map[d.user_id] = d as DiagResult; });
  return map;
};

const ProfileSkeleton = () => (
  <div className="flex items-center gap-3 p-3">
    <Skeleton className="w-8 h-8 rounded-full" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
  </div>
);

const AdminUsuarios = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<ExtendedProfile[]>([]);
  const [diagnostics, setDiagnostics] = useState<Record<string, DiagResult>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    empresa: "",
    cargo: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  // Expanded row (mobile)
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [profs, diags] = await Promise.all([fetchProfiles(), fetchDiagnostics()]);
    setProfiles(profs);
    setDiagnostics(diags);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Start editing — admin role already verified on page load via Edge Function
  const requestEdit = (profile: ExtendedProfile) => {
    setEditingId(profile.id);
    setEditForm({
      nombre: profile.nombre || "",
      apellido: profile.apellido || "",
      empresa: profile.empresa || "",
      cargo: profile.cargo || "",
      email: profile.email || profile.auth_email || "",
      phone: profile.phone || "",
    });
  };

  // Save profile changes
  const saveProfile = async () => {
    if (!editingId || saving) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nombre: editForm.nombre.trim() || null,
          apellido: editForm.apellido.trim() || null,
          empresa: editForm.empresa.trim() || null,
          cargo: editForm.cargo.trim() || null,
          email: editForm.email.trim() || null,
          phone: editForm.phone.trim() || null,
          display_name: `${editForm.nombre.trim()} ${editForm.apellido.trim()}`.trim() || null,
        })
        .eq("id", editingId);

      if (error) throw error;

      toast({ title: "Perfil actualizado" });
      setEditingId(null);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
    setSaving(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  // Filter
  const filtered = profiles.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.nombre || "").toLowerCase().includes(q) ||
      (p.apellido || "").toLowerCase().includes(q) ||
      (p.empresa || "").toLowerCase().includes(q) ||
      (p.cargo || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.display_name || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 6 }).map((_, i) => <ProfileSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-foreground">
          Usuarios <span className="text-muted-foreground font-normal text-sm">({profiles.length})</span>
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 w-48 text-xs"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pr-3 font-medium">Nombre</th>
              <th className="pb-2 pr-3 font-medium">Apellido</th>
              <th className="pb-2 pr-3 font-medium">Empresa</th>
              <th className="pb-2 pr-3 font-medium">Cargo</th>
              <th className="pb-2 pr-3 font-medium">Email</th>
              <th className="pb-2 pr-3 font-medium">Teléfono</th>
              <th className="pb-2 pr-3 font-medium">Diagnóstico</th>
              <th className="pb-2 font-medium w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const diag = diagnostics[p.user_id];
              const isEditing = editingId === p.id;

              return (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  {isEditing ? (
                    <>
                      <td className="py-2 pr-3">
                        <Input
                          value={editForm.nombre}
                          onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))}
                          className="h-7 text-xs"
                          placeholder="Nombre"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <Input
                          value={editForm.apellido}
                          onChange={(e) => setEditForm((f) => ({ ...f, apellido: e.target.value }))}
                          className="h-7 text-xs"
                          placeholder="Apellido"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <Input
                          value={editForm.empresa}
                          onChange={(e) => setEditForm((f) => ({ ...f, empresa: e.target.value }))}
                          className="h-7 text-xs"
                          placeholder="Empresa"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <Input
                          value={editForm.cargo}
                          onChange={(e) => setEditForm((f) => ({ ...f, cargo: e.target.value }))}
                          className="h-7 text-xs"
                          placeholder="Cargo"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <Input
                          value={editForm.email}
                          onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                          className="h-7 text-xs"
                          placeholder="Email"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <Input
                          value={editForm.phone}
                          onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                          className="h-7 text-xs"
                          placeholder="Teléfono"
                        />
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        {diag ? `${diag.perfil} (${diag.puntaje_total})` : "—"}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={saveProfile} disabled={saving}>
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 pr-3 font-medium text-foreground">{p.nombre || "—"}</td>
                      <td className="py-2.5 pr-3 text-foreground">{p.apellido || "—"}</td>
                      <td className="py-2.5 pr-3">
                        {p.empresa ? (
                          <span className="flex items-center gap-1 text-foreground/80">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            {p.empresa}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-2.5 pr-3">
                        {p.cargo ? (
                          <span className="flex items-center gap-1 text-foreground/80">
                            <Briefcase className="w-3 h-3 text-muted-foreground" />
                            {p.cargo}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-2.5 pr-3">
                        {p.email ? (
                          <span className="flex items-center gap-1 text-foreground/80">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            {p.email}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-2.5 pr-3">
                        {p.phone ? (
                          <span className="flex items-center gap-1 text-foreground/80">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {p.phone}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-2.5 pr-3">
                        {diag ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            <CheckCircle className="w-3 h-3" />
                            {diag.perfil}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Sin diagnóstico</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => requestEdit(p)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {filtered.map((p) => {
          const diag = diagnostics[p.user_id];
          const isEditing = editingId === p.id;
          const isExpanded = expandedId === p.id || isEditing;

          return (
            <Card key={p.id}>
              <CardContent className="p-3">
                {/* Collapsed header */}
                <button
                  className="w-full flex items-center gap-3 text-left"
                  onClick={() => !isEditing && setExpandedId(isExpanded ? null : p.id)}
                >
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {p.nombre || p.display_name || "Sin nombre"}
                      </span>
                      {p.apellido && <span className="text-sm text-foreground">{p.apellido}</span>}
                      {p.has_completed_diagnostic && (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.empresa && `${p.empresa}`}{p.cargo && ` · ${p.cargo}`}
                      {!p.empresa && !p.cargo && (p.email || "Sin datos")}
                    </p>
                  </div>
                  {isEditing ? null : isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Nombre</Label>
                            <Input
                              value={editForm.nombre}
                              onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Apellido</Label>
                            <Input
                              value={editForm.apellido}
                              onChange={(e) => setEditForm((f) => ({ ...f, apellido: e.target.value }))}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Empresa</Label>
                          <Input
                            value={editForm.empresa}
                            onChange={(e) => setEditForm((f) => ({ ...f, empresa: e.target.value }))}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Cargo</Label>
                          <Input
                            value={editForm.cargo}
                            onChange={(e) => setEditForm((f) => ({ ...f, cargo: e.target.value }))}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Email</Label>
                          <Input
                            value={editForm.email}
                            onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Teléfono</Label>
                          <Input
                            value={editForm.phone}
                            onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" onClick={saveProfile} disabled={saving} className="flex-1">
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                            Guardar
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Nombre:</span>
                          </div>
                          <span className="font-medium">{p.nombre || "—"}</span>

                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Apellido:</span>
                          </div>
                          <span className="font-medium">{p.apellido || "—"}</span>

                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Empresa:</span>
                          </div>
                          <span className="font-medium">{p.empresa || "—"}</span>

                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Cargo:</span>
                          </div>
                          <span className="font-medium">{p.cargo || "—"}</span>

                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Email:</span>
                          </div>
                          <span className="font-medium truncate">{p.email || "—"}</span>

                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Teléfono:</span>
                          </div>
                          <span className="font-medium">{p.phone || "—"}</span>
                        </div>

                        {diag && (
                          <div className="flex items-center gap-1.5 text-xs pt-1">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-muted-foreground">Diagnóstico:</span>
                            <span className="font-medium text-primary">{diag.perfil} ({diag.puntaje_total} pts)</span>
                          </div>
                        )}

                        <div className="text-[10px] text-muted-foreground pt-1">
                          Registro: {new Date(p.created_at).toLocaleDateString("es-AR")}
                        </div>

                        <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={() => requestEdit(p)}>
                          <Pencil className="w-3.5 h-3.5 mr-1" />
                          Editar perfil
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          {search ? "No se encontraron usuarios con ese criterio." : "No hay usuarios registrados."}
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
