/**
 * DataManagement — Mecanismo de "Mis Datos"
 *
 * Permite al usuario:
 * - Ver sus datos personales
 * - Editar su perfil
 * - Eliminar su cuenta (con confirmación)
 *
 * Cumple con Ley 25.326 (derechos de acceso, rectificación, eliminación).
 */

import { useState, useEffect } from "react";
import {
  Download,
  Edit3,
  Trash2,
  AlertTriangle,
  Loader2,
  Check,
  X,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface UserData {
  nombre: string | null;
  apellido: string | null;
  email: string | null;
  empresa: string | null;
  cargo: string | null;
  phone: string | null;
  bio: string | null;
  website: string | null;
  linkedin: string | null;
  created_at: string;
}

export const DataManagement = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Editable fields
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [cargo, setCargo] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("nombre, apellido, email, empresa, cargo, phone, bio, website, linkedin, created_at")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setUserData(data);
        setNombre(data.nombre || "");
        setApellido(data.apellido || "");
        setEmpresa(data.empresa || "");
        setCargo(data.cargo || "");
        setPhone(data.phone || "");
        setBio(data.bio || "");
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        nombre: nombre.trim() || null,
        apellido: apellido.trim() || null,
        empresa: empresa.trim() || null,
        cargo: cargo.trim() || null,
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        display_name: `${nombre.trim()} ${apellido.trim()}`.trim() || null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "No se pudieron guardar los cambios.", variant: "destructive" });
    } else {
      toast({ title: "Datos actualizados" });
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              nombre: nombre.trim() || null,
              apellido: apellido.trim() || null,
              empresa: empresa.trim() || null,
              cargo: cargo.trim() || null,
              phone: phone.trim() || null,
              bio: bio.trim() || null,
            }
          : prev
      );
      setEditing(false);
    }
    setSaving(false);
  };

  const handleExportData = () => {
    if (!userData) return;

    const dataStr = JSON.stringify(
      {
        perfil: userData,
        exportado: new Date().toISOString(),
        app: "MejoraApp",
      },
      null,
      2
    );

    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mis-datos-mejoraapp-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Datos exportados", description: "Se descargó un archivo JSON con tus datos." });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);

    try {
      // Delete user data from profiles (cascade will handle related data)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      // Sign out
      await signOut();
      toast({
        title: "Cuenta eliminada",
        description: "Tus datos fueron eliminados. Lamentamos verte partir.",
      });
    } catch (err) {
      console.error("Delete account error:", err);
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuenta. Contactanos a privacidad@mejoraok.com",
        variant: "destructive",
      });
    }
    setDeleting(false);
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Mis Datos</h2>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Conforme a la Ley 25.326 de Protección de Datos Personales, tenés derecho a
        acceder, rectificar y eliminar tus datos personales.
      </p>

      {/* View / Edit data */}
      <Card>
        <CardContent className="p-4 space-y-3">
          {editing ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nombre</Label>
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Apellido</Label>
                  <Input value={apellido} onChange={(e) => setApellido(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Empresa</Label>
                <Input value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cargo</Label>
                <Input value={cargo} onChange={(e) => setCargo(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Teléfono</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 300))} rows={3} />
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
            </>
          ) : (
            <div className="space-y-2">
              <DataRow label="Email" value={userData?.email} />
              <DataRow label="Nombre" value={[userData?.nombre, userData?.apellido].filter(Boolean).join(" ")} />
              <DataRow label="Empresa" value={userData?.empresa} />
              <DataRow label="Cargo" value={userData?.cargo} />
              <DataRow label="Teléfono" value={userData?.phone} />
              <DataRow label="Bio" value={userData?.bio} />
              <DataRow label="Miembro desde" value={userData?.created_at ? new Date(userData.created_at).toLocaleDateString("es-AR") : undefined} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        <div className="flex gap-2">
          {!editing && (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1.5 flex-1">
              <Edit3 className="w-3.5 h-3.5" />
              Editar datos
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleExportData} className="gap-1.5 flex-1">
            <Download className="w-3.5 h-3.5" />
            Exportar mis datos
          </Button>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDeleteConfirm(true)}
          className="gap-1.5 w-full text-destructive hover:text-destructive hover:bg-destructive/5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Eliminar mi cuenta
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              ¿Eliminar tu cuenta?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es <strong>irreversible</strong>. Se eliminarán todos tus datos:
              perfil, posts, comentarios, likes, diagnósticos y badges.
              Si tenés dudas, escribinos a privacidad@mejoraok.com
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              Sí, eliminar mi cuenta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const DataRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className={cn("text-xs font-medium", value ? "text-foreground" : "text-muted-foreground/50")}>
      {value || "No especificado"}
    </span>
  </div>
);

export default DataManagement;
