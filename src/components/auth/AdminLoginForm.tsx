import { useState, useCallback } from "react";
import { Shield, Lock, Eye, EyeOff, User, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminLoginFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

// Salted SHA-256 hash using Web Crypto API
async function sha256Salted(message: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const usedSalt = salt || crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const saltedMessage = `${usedSalt}:${message}:${usedSalt.split("").reverse().join("")}`;
  const msgBuffer = new TextEncoder().encode(saltedMessage);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return { hash, salt: usedSalt };
}

// Legacy unsalted hash for backwards-compat
async function sha256Legacy(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const AdminLoginForm = ({ onBack, onSuccess }: AdminLoginFormProps) => {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || loading) return;

    setLoading(true);
    try {
      const [storedUsername, storedHash, storedSalt] = await Promise.all([
        getConfig("admin_username"),
        getConfig("master_password_hash"),
        getConfig("master_password_salt"),
      ]);

      if (!storedHash || !storedUsername) {
        toast({
          title: "Error de configuración",
          description: "El admin no está configurado. Contactá al desarrollador.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const usernameMatches = username.trim().toLowerCase() === storedUsername.toLowerCase();

      let inputHash: string;
      if (storedSalt) {
        const result = await sha256Salted(password, storedSalt);
        inputHash = result.hash;
      } else {
        inputHash = await sha256Legacy(password);
      }
      const passwordMatches = inputHash === storedHash;

      if (usernameMatches && passwordMatches) {
        // Migrate legacy unsalted hash to salted
        if (!storedSalt) {
          const { hash, salt } = await sha256Salted(password);
          await Promise.all([
            setConfig("master_password_hash", hash),
            setConfig("master_password_salt", salt),
          ]);
        }

        sessionStorage.setItem("admin_unlocked", "true");
        sessionStorage.setItem("admin_unlocked_at", Date.now().toString());
        toast({ title: "Acceso concedido", description: "Bienvenido al panel de administración." });
        onSuccess();
      } else {
        setAttempts((a) => a + 1);
        toast({
          title: "Credenciales incorrectas",
          description: attempts >= 2 ? "Verificá tu usuario y contraseña." : `Intento ${attempts + 1} de 5`,
          variant: "destructive",
        });
        if (attempts >= 4) {
          toast({
            title: "Demasiados intentos",
            description: "Esperá 30 segundos antes de volver a intentar.",
            variant: "destructive",
          });
          setTimeout(() => setAttempts(0), 30000);
        }
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo verificar el acceso.", variant: "destructive" });
    }
    setLoading(false);
    setPassword("");
  };

  const isLocked = attempts >= 5;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-1 mb-2">
        <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">Acceso Administrador</p>
        <p className="text-xs text-muted-foreground">Usuario y contraseña de administrador</p>
      </div>

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="admin-user">Usuario</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="admin-user"
            type="text"
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-10"
            disabled={isLocked}
            autoComplete="username"
            autoFocus
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="admin-pass">Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="admin-pass"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            disabled={isLocked}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Ocultar" : "Mostrar"}
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

      <Button
        type="submit"
        className="w-full h-11"
        disabled={loading || isLocked || !username.trim() || !password.trim()}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
        Ingresar al Panel
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        <ArrowLeft className="w-3 h-3" />
        Volver al login de usuario
      </button>
    </form>
  );
};

export default AdminLoginForm;
