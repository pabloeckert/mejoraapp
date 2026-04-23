import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAction } from "@/hooks/useAdminAction";
import { Loader2, Shield, UserPlus, Trash2, User, Crown, CheckCircle, AlertTriangle, Lock, Server, Eye } from "lucide-react";

interface AdminUser {
  user_id: string;
  role: string;
  email?: string;
  nombre?: string;
}

const AdminSeguridad = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { execute: adminAction, loading: adminLoading } = useAdminAction();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      // Get all admin roles
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("role", "admin");

      if (error) throw error;

      // Get profiles for those users
      if (roles && roles.length > 0) {
        const userIds = roles.map((r) => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, email, nombre")
          .in("user_id", userIds);

        const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
        const enriched = roles.map((r) => ({
          ...r,
          email: profileMap.get(r.user_id)?.email || "Sin email",
          nombre: profileMap.get(r.user_id)?.nombre || "",
        }));
        setAdmins(enriched);
      } else {
        setAdmins([]);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    setSaving(true);
    try {
      // Find user by email in profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, email")
        .eq("email", newAdminEmail.trim().toLowerCase())
        .maybeSingle();

      if (profileError || !profile) {
        toast({
          title: "Usuario no encontrado",
          description: "No hay un usuario registrado con ese email.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Check if already admin
      const existing = admins.find((a) => a.user_id === profile.user_id);
      if (existing) {
        toast({ title: "Ya es admin", description: "Ese usuario ya tiene permisos de administrador.", variant: "destructive" });
        setSaving(false);
        return;
      }

      // Add admin role via Edge Function
      await adminAction("add-role", { targetUserId: profile.user_id, role: "admin" });

      toast({ title: "Admin agregado", description: `${profile.email} ahora tiene permisos de admin.` });
      setNewAdminEmail("");
      fetchAdmins();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo agregar el admin.", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleRemoveAdmin = async (userId: string, email: string) => {
    if (userId === user?.id) {
      toast({ title: "No podés eliminarte a vos mismo", variant: "destructive" });
      return;
    }

    try {
      await adminAction("remove-role", { targetUserId: userId, role: "admin" });
      toast({ title: "Admin removido", description: `${email} ya no tiene permisos de admin.` });
      fetchAdmins();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo remover el admin.", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Seguridad</h2>
      </div>

      {/* Current admins */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Administradores
          </CardTitle>
          <CardDescription className="text-xs">
            Los administradores pueden gestionar contenido, usuarios y configuración.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {admins.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">No hay administradores configurados.</p>
          ) : (
            admins.map((admin) => (
              <div key={admin.user_id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {admin.nombre || admin.email}
                      {admin.user_id === user?.id && (
                        <span className="text-[10px] text-primary ml-1.5">(vos)</span>
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{admin.email}</p>
                  </div>
                </div>
                {admin.user_id !== user?.id && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleRemoveAdmin(admin.user_id, admin.email || "")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add admin */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Agregar administrador
          </CardTitle>
          <CardDescription className="text-xs">
            El usuario debe estar registrado en la app primero.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="flex gap-2">
            <Input
              type="email"
              placeholder="email@ejemplo.com"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={saving || !newAdminEmail.trim()}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <UserPlus className="w-3.5 h-3.5 mr-1" />}
              Agregar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Estado de seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span>Autenticación: Supabase Auth (email + Google OAuth)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span>Verificación admin: Server-side (Edge Function)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span>RLS: Habilitado en todas las tablas</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span>IA: Server-side (Edge Functions, keys en secrets)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span>Moderación: Automática con IA server-side</span>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-dashed">
        <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
          <p><strong>Acceso admin:</strong> Login con email + contraseña de Supabase Auth + rol admin verificado server-side.</p>
          <p><strong>Sesión:</strong> Se mantiene por 4 horas, luego se bloquea automáticamente.</p>
          <p><strong>Roles:</strong> Los permisos se verifican via Edge Function (service_role) + RLS en cada tabla.</p>
          <p><strong>Tip:</strong> Agregá al menos 2 admins para no quedar bloqueado.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSeguridad;
