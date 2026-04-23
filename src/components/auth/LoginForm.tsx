import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm = ({ onSwitchToSignup }: LoginFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const humanizeAuthError = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes("invalid login credentials") || lower.includes("invalid credentials"))
      return "Email o contraseña incorrectos. Verificá e intentá de nuevo.";
    if (lower.includes("email not confirmed") || lower.includes("email not verified"))
      return "Tu email todavía no fue confirmado. Revisá tu bandeja de entrada.";
    if (lower.includes("too many requests") || lower.includes("rate limit"))
      return "Demasiados intentos. Esperá unos minutos e intentá de nuevo.";
    if (lower.includes("user not found"))
      return "No existe una cuenta con ese email. ¿Querés registrarte?";
    if (lower.includes("network") || lower.includes("fetch"))
      return "Problema de conexión. Verificá tu internet e intentá de nuevo.";
    return "No pudimos iniciar sesión. Intentá de nuevo en unos segundos.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Error al iniciar sesión", description: humanizeAuthError(error.message), variant: "destructive" });
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Ingresá tu email",
        description: "Escribí tu email para recibir el link de recuperación.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Error", description: "No se pudo enviar el email de recuperación. Intentá de nuevo.", variant: "destructive" });
    } else {
      toast({ title: "Email enviado", description: "Revisá tu correo para restablecer tu contraseña." });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Contraseña</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
            autoComplete="current-password"
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

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-mc-blue hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <Button
        type="submit"
        className="w-full h-11 bg-mc-dark-blue hover:bg-mc-dark-blue/90"
        disabled={loading}
      >
        {loading ? "Cargando..." : "Iniciar sesión"}
      </Button>

      <p className="text-center text-sm text-muted-foreground pt-2">
        ¿No tenés cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-mc-red font-semibold hover:underline"
        >
          Registrate
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
