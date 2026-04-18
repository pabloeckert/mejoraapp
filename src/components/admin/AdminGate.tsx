import { useState, useCallback } from "react";
import { Shield, Lock, Eye, EyeOff, KeyRound, Mail, HelpCircle, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logoHorizontal from "@/assets/logo-horizontal.png";

type Mode = "password" | "forgot" | "questions" | "reset";

interface AdminGateProps {
  onUnlock: () => void;
}

// SHA-256 hash using Web Crypto API
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const AdminGate = ({ onUnlock }: AdminGateProps) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("password");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Recovery state
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [question1, setQuestion1] = useState("");
  const [answer1, setAnswer1] = useState("");
  const [question2, setQuestion2] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryStep, setRecoveryStep] = useState(0);

  const getConfig = useCallback(async (key: string): Promise<string | null> => {
    const { data } = await supabase
      .from("admin_config")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    return data?.value ?? null;
  }, []);

  const setConfig = useCallback(async (key: string, value: string) => {
    await supabase.from("admin_config").upsert({ key, value }, { onConflict: "key" });
  }, []);

  // Verify master password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) return;

    setLoading(true);
    try {
      const storedHash = await getConfig("master_password_hash");
      if (!storedHash) {
        toast({ title: "Error de configuración", description: "No se encontró la contraseña admin.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const inputHash = await sha256(password);
      if (inputHash === storedHash) {
        sessionStorage.setItem("admin_unlocked", "true");
        sessionStorage.setItem("admin_unlocked_at", Date.now().toString());
        toast({ title: "Acceso concedido", description: "Bienvenido al panel de administración." });
        onUnlock();
      } else {
        setAttempts((a) => a + 1);
        toast({
          title: "Contraseña incorrecta",
          description: attempts >= 2 ? "¿Olvidaste tu contraseña? Usá la opción de recuperación." : `Intento ${attempts + 1} de 5`,
          variant: "destructive",
        });
        if (attempts >= 4) {
          toast({ title: "Demasiados intentos", description: "Esperá 30 segundos antes de volver a intentar.", variant: "destructive" });
          setTimeout(() => setAttempts(0), 30000);
        }
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo verificar la contraseña.", variant: "destructive" });
    }
    setLoading(false);
    setPassword("");
  };

  // Load recovery questions
  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      const [q1, q2, email] = await Promise.all([
        getConfig("recovery_question_1"),
        getConfig("recovery_question_2"),
        getConfig("recovery_email"),
      ]);
      setQuestion1(q1 || "Pregunta 1 no configurada");
      setQuestion2(q2 || "Pregunta 2 no configurada");
      setRecoveryEmail(email || "");
      setMode("questions");
    } catch (err) {
      toast({ title: "Error", description: "No se pudieron cargar las preguntas.", variant: "destructive" });
    }
    setLoading(false);
  };

  // Verify security answers
  const handleVerifyAnswers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer1.trim() || !answer2.trim() || loading) return;

    setLoading(true);
    try {
      const [storedHash1, storedHash2] = await Promise.all([
        getConfig("recovery_answer_1_hash"),
        getConfig("recovery_answer_2_hash"),
      ]);

      const [inputHash1, inputHash2] = await Promise.all([
        sha256(answer1.toLowerCase().trim()),
        sha256(answer2.toLowerCase().trim()),
      ]);

      if (inputHash1 === storedHash1 && inputHash2 === storedHash2) {
        setMode("reset");
        toast({ title: "Identidad verificada", description: "Ingresá tu nueva contraseña." });
      } else {
        toast({ title: "Respuestas incorrectas", description: "Verificá e intentá de nuevo.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "No se pudieron verificar las respuestas.", variant: "destructive" });
    }
    setLoading(false);
  };

  // Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || loading) return;

    if (newPassword.length < 8) {
      toast({ title: "Contraseña muy corta", description: "Mínimo 8 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const newHash = await sha256(newPassword);
      await setConfig("master_password_hash", newHash);
      // Increment version to invalidate old sessions
      const version = await getConfig("admin_version");
      await setConfig("admin_version", String(Number(version || "0") + 1));

      sessionStorage.setItem("admin_unlocked", "true");
      sessionStorage.setItem("admin_unlocked_at", Date.now().toString());
      toast({ title: "Contraseña actualizada", description: "Acceso concedido." });
      onUnlock();
    } catch (err) {
      toast({ title: "Error", description: "No se pudo actualizar la contraseña.", variant: "destructive" });
    }
    setLoading(false);
  };

  // Lockout state
  const isLocked = attempts >= 5;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <img src={logoHorizontal} alt="MejoraApp" className="h-12 object-contain" />
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              {mode === "password" ? (
                <Shield className="w-6 h-6 text-primary" />
              ) : mode === "reset" ? (
                <KeyRound className="w-6 h-6 text-primary" />
              ) : (
                <HelpCircle className="w-6 h-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-xl font-bold">
              {mode === "password" && "Acceso Administrador"}
              {mode === "forgot" && "Recuperar Acceso"}
              {mode === "questions" && "Verificar Identidad"}
              {mode === "reset" && "Nueva Contraseña"}
            </CardTitle>
            <CardDescription>
              {mode === "password" && "Ingresá la contraseña maestra para acceder al panel"}
              {mode === "forgot" && "Elegí un método de recuperación"}
              {mode === "questions" && "Respondé las preguntas de seguridad"}
              {mode === "reset" && "Creá una nueva contraseña maestra"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* PASSWORD MODE */}
            {mode === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Contraseña maestra</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={isLocked}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isLocked && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Demasiados intentos. Esperá 30 segundos.
                  </div>
                )}

                <Button type="submit" className="w-full h-11" disabled={loading || isLocked || !password.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                  Verificar
                </Button>

                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  ¿Olvidaste la contraseña?
                </button>
              </form>
            )}

            {/* FORGOT MODE */}
            {mode === "forgot" && (
              <div className="space-y-3">
                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="w-full flex items-center gap-3 p-4 rounded-lg border hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Preguntas de seguridad</p>
                    <p className="text-xs text-muted-foreground">Respondé 2 preguntas para verificar tu identidad</p>
                  </div>
                </button>

                {recoveryEmail && (
                  <div className="w-full flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Email de recuperación</p>
                      <p className="text-xs text-muted-foreground">{recoveryEmail}</p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setMode("password")}
                  className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Volver al login
                </button>
              </div>
            )}

            {/* QUESTIONS MODE */}
            {mode === "questions" && (
              <form onSubmit={handleVerifyAnswers} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Pregunta 1</Label>
                  <p className="text-sm font-medium text-foreground">{question1}</p>
                  <Input
                    placeholder="Tu respuesta"
                    value={answer1}
                    onChange={(e) => setAnswer1(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Pregunta 2</Label>
                  <p className="text-sm font-medium text-foreground">{question2}</p>
                  <Input
                    placeholder="Tu respuesta"
                    value={answer2}
                    onChange={(e) => setAnswer2(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full h-11" disabled={loading || !answer1.trim() || !answer2.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
                  Verificar
                </Button>

                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Volver
                </button>
              </form>
            )}

            {/* RESET MODE */}
            {mode === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-pass">Nueva contraseña</Label>
                  <Input
                    id="new-pass"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-pass">Confirmar contraseña</Label>
                  <Input
                    id="confirm-pass"
                    type="password"
                    placeholder="Repetí la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {/* Password strength indicator */}
                {newPassword.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            newPassword.length >= i * 3
                              ? i <= 2
                                ? "bg-red-400"
                                : i === 3
                                ? "bg-yellow-400"
                                : "bg-green-400"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {newPassword.length < 6 ? "Muy débil" : newPassword.length < 9 ? "Aceptable" : newPassword.length < 12 ? "Buena" : "Fuerte"}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={loading || !newPassword.trim() || !confirmPassword.trim() || newPassword !== confirmPassword}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
                  Cambiar contraseña y entrar
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          🔒 Panel de administración seguro
        </p>
      </div>
    </div>
  );
};

export default AdminGate;
