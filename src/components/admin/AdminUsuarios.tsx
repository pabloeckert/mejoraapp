import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, User, CheckCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface DiagResult {
  user_id: string;
  perfil: string;
  puntaje_total: number;
}

const fetchProfiles = async (): Promise<Profile[]> => {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
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
  <Card>
    <CardContent className="p-3 flex items-start gap-3">
      <Skeleton className="w-8 h-8 rounded-full" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-2 w-24" />
      </div>
    </CardContent>
  </Card>
);

const AdminUsuarios = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [diagnostics, setDiagnostics] = useState<Record<string, DiagResult>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProfiles(), fetchDiagnostics()]).then(([profs, diags]) => {
      setProfiles(profs);
      setDiagnostics(diags);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <ProfileSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Usuarios ({profiles.length})</h2>

      <div className="space-y-2">
        {profiles.map((p) => {
          const diag = diagnostics[p.user_id];
          return (
            <Card key={p.id}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {p.display_name || "Sin nombre"}
                      </span>
                      {p.has_completed_diagnostic && (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                      {p.empresa && (
                        <span className="text-xs text-muted-foreground">🏢 {p.empresa}</span>
                      )}
                      {p.phone && (
                        <span className="text-xs text-muted-foreground">📱 {p.phone}</span>
                      )}
                      {diag && (
                        <span className="text-xs font-medium text-primary">
                          📊 {diag.perfil} ({diag.puntaje_total}pts)
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Registro: {new Date(p.created_at).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {profiles.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No hay usuarios registrados.</p>
        )}
      </div>
    </div>
  );
};

export default AdminUsuarios;
