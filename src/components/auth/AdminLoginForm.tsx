import { useState } from "react";
import { Shield, Lock, Eye, EyeOff, Mail, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminLoginFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const AdminLoginForm = ({ onBack, onSuccess }: AdminLoginFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || loading) return;

    setLoading(true);
    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !authData.user) {
        setAttempts((a) => a + 1);
        toast({
          title: "Credenciales incorrectas",
          description: attempts >= 2 ? "Verificá tu email y contraseña." : `Intento ${attempts + 1} de 5`,
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
        setLoading(false);
        setPassword("");
        return;
      }

      // 2. Check if user has admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        // Not an admin — sign out immediately
        await supabase.auth.signOut();
        setAttempts((a) => a + 1);
        toast({
          title: "Acceso denegado",
          description: "Esta cuenta no tiene permisos de administrador.",
          variant: "destructive",
        });
        setLoading(false);
        setPassword("");
        return;
      }

      // 3. Success — admin confirmed
      sessionStorage.setItem("admin_unlocked", "true");
      sessionStorage.setItem("admin_unlocked_at", Date.now().toString());
      toast({ title: "Acceso concedido", description: "Bienvenido al panel de administración." });
      onSuccess();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo verificar el acceso.", variant: "destructive" });
    }
    setLoading(false);
  };

  const isLocked = attempts >= 5;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center space-y-1 mb-2">
        <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">Acceso Administrador</p>
        <p className="text-xs text-muted-foreground">Email y contraseña de tu cuenta admin</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="admin-email"
            type="email"
            placeholder="admin@mejoraok.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={isLocked}
            autoComplete="email"
            autoFocus
          />
        </div>
      </div>

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
        disabled={loading || isLocked || !email.trim() || !password.trim()}
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
