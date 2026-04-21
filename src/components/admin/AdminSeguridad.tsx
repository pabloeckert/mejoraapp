import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, KeyRound, HelpCircle, Save, User } from "lucide-react";

async function sha256Salted(message: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const usedSalt = salt || crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const saltedMessage = `${usedSalt}:${message}:${usedSalt.split("").reverse().join("")}`;
  const msgBuffer = new TextEncoder().encode(saltedMessage);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return { hash, salt: usedSalt };
}

async function sha256Legacy(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const AdminSeguridad = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Username
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Security questions
  const [question1, setQuestion1] = useState("");
  const [answer1, setAnswer1] = useState("");
  const [question2, setQuestion2] = useState("");
  const [answer2, setAnswer2] = useState("");

  const getConfig = useCallback(async (key: string): Promise<string | null> => {
    const { data } = await supabase.from("admin_config").select("value").eq("key", key).maybeSingle();
    return data?.value ?? null;
  }, []);

  const setConfig = useCallback(async (key: string, value: string) => {
    await supabase.from("admin_config").upsert({ key, value }, { onConflict: "key" });
  }, []);

  useEffect(() => {
    (async () => {
      const [user, q1, q2] = await Promise.all([
        getConfig("admin_username"),
        getConfig("recovery_question_1"),
        getConfig("recovery_question_2"),
      ]);
      const u = user || "admin";
      setUsername(u);
      setOriginalUsername(u);
      setQuestion1(q1 || "");
      setQuestion2(q2 || "");
      setLoading(false);
    })();
  }, [getConfig]);

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      toast({ title: "El usuario no puede estar vacío", variant: "destructive" });
      return;
    }
    if (trimmed.length < 3) {
      toast({ title: "Usuario muy corto", description: "Mínimo 3 caracteres.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await setConfig("admin_username", trimmed);
      setOriginalUsername(trimmed);
      toast({ title: "Usuario actualizado", description: `Ahora ingresás como '${trimmed}'.` });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim() || !newPassword.trim()) return;

    if (newPassword.length < 8) {
      toast({ title: "Contraseña muy corta", description: "Mínimo 8 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const [storedHash, storedSalt] = await Promise.all([
        getConfig("master_password_hash"),
        getConfig("master_password_salt"),
      ]);

      let currentHash: string;
      if (storedSalt) {
        const r = await sha256Salted(currentPassword, storedSalt);
        currentHash = r.hash;
      } else {
        currentHash = await sha256Legacy(currentPassword);
      }

      if (currentHash !== storedHash) {
        toast({ title: "Contraseña actual incorrecta", variant: "destructive" });
        setSaving(false);
        return;
      }

      const { hash, salt } = await sha256Salted(newPassword);
      await Promise.all([
        setConfig("master_password_hash", hash),
        setConfig("master_password_salt", salt),
      ]);

      const version = await getConfig("admin_version");
      await setConfig("admin_version", String(Number(version || "0") + 1));

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Contraseña actualizada", description: "La contraseña maestra fue cambiada." });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo actualizar.", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleSaveQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question1.trim() || !question2.trim()) {
      toast({ title: "Completá ambas preguntas", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      await setConfig("recovery_question_1", question1.trim());
      await setConfig("recovery_question_2", question2.trim());

      if (answer1.trim()) {
        const { hash, salt } = await sha256Salted(answer1.toLowerCase().trim());
        await Promise.all([
          setConfig("recovery_answer_1_hash", hash),
          setConfig("recovery_answer_1_salt", salt),
        ]);
      }
      if (answer2.trim()) {
        const { hash, salt } = await sha256Salted(answer2.toLowerCase().trim());
        await Promise.all([
          setConfig("recovery_answer_2_hash", hash),
          setConfig("recovery_answer_2_salt", salt),
        ]);
      }

      setAnswer1("");
      setAnswer2("");
      toast({ title: "Preguntas de seguridad actualizadas" });
    } catch (err) {
      toast({ title: "Error", description: "No se pudieron guardar.", variant: "destructive" });
    }
    setSaving(false);
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

      {/* Change admin username */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            Usuario administrador
          </CardTitle>
          <CardDescription className="text-xs">
            Este es el nombre de usuario que ingresás en el login admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveUsername} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="admin-user" className="text-xs">Usuario</Label>
              <Input
                id="admin-user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={saving || !username.trim() || username.trim() === originalUsername}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
              Guardar usuario
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change master password */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            Cambiar contraseña maestra
          </CardTitle>
          <CardDescription className="text-xs">
            Esta contraseña protege el acceso al panel de administración.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="current-pass" className="text-xs">Contraseña actual</Label>
              <Input
                id="current-pass"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-pass" className="text-xs">Nueva contraseña</Label>
              <Input
                id="new-pass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-pass" className="text-xs">Confirmar nueva contraseña</Label>
              <Input
                id="confirm-pass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí la contraseña"
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" size="sm" disabled={saving || !currentPassword.trim() || !newPassword.trim()}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
              Cambiar contraseña
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security questions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Preguntas de seguridad
          </CardTitle>
          <CardDescription className="text-xs">
            Se usan para recuperar el acceso si olvidás la contraseña maestra.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveQuestions} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Pregunta 1</Label>
              <Input
                value={question1}
                onChange={(e) => setQuestion1(e.target.value)}
                placeholder="Ej: ¿Cuál es el nombre de tu primera mascota?"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                Respuesta 1 <span className="text-muted-foreground">(dejar vacío para no cambiar)</span>
              </Label>
              <Input
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
                placeholder="Tu respuesta"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Pregunta 2</Label>
              <Input
                value={question2}
                onChange={(e) => setQuestion2(e.target.value)}
                placeholder="Ej: ¿En qué ciudad naciste?"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                Respuesta 2 <span className="text-muted-foreground">(dejar vacío para no cambiar)</span>
              </Label>
              <Input
                value={answer2}
                onChange={(e) => setAnswer2(e.target.value)}
                placeholder="Tu respuesta"
              />
            </div>
            <Button type="submit" size="sm" disabled={saving || !question1.trim() || !question2.trim()}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
              Guardar preguntas
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-dashed">
        <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
          <p><strong>Acceso:</strong> Se piden usuario y contraseña al entrar al panel admin.</p>
          <p><strong>Sesión:</strong> El acceso se mantiene por 4 horas, luego se bloquea.</p>
          <p><strong>Recuperación:</strong> Si olvidás la contraseña, podés responder las preguntas de seguridad.</p>
          <p><strong>Tip:</strong> Cambiá usuario y contraseña por defecto antes de poner la app en producción.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSeguridad;
