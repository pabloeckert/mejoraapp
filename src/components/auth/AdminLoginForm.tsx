import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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

      const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-admin");

      if (verifyError || !verifyData?.authorized) {
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
      <div className="space-y-2">
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLocked}
          autoComplete="email"
          autoFocus
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-pass">Contraseña</Label>
        <div className="relative">
          <Input
            id="admin-pass"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
            disabled={isLocked}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isLocked && (
        <p className="text-xs text-destructive text-center">
          Demasiados intentos. Esperá 30 segundos.
        </p>
      )}

      <Button
        type="submit"
        className="w-full h-11 bg-mc-dark-blue hover:bg-mc-dark-blue/90"
        disabled={loading || isLocked || !email.trim() || !password.trim()}
      >
        {loading ? "Cargando..." : "Iniciar sesión"}
      </Button>

      <p className="text-center text-sm text-muted-foreground pt-2">
        ¿No sos admin?{" "}
        <button
          type="button"
          onClick={onBack}
          className="text-mc-red font-semibold hover:underline"
        >
          Volver al login
        </button>
      </p>
    </form>
  );
};

export default AdminLoginForm;
