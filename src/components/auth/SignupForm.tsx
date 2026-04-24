import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { trackSignup } from "@/lib/analytics";

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
  if (pw.length === 0) return { label: "", color: "bg-transparent", width: "w-0" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Débil", color: "bg-destructive", width: "w-1/4" };
  if (score <= 2) return { label: "Aceptable", color: "bg-amber-500", width: "w-2/4" };
  if (score <= 3) return { label: "Buena", color: "bg-yellow-500", width: "w-3/4" };
  return { label: "Fuerte", color: "bg-emerald-500", width: "w-full" };
};

const SignupForm = ({ onSwitchToLogin }: SignupFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const strength = getPasswordStrength(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fullName = `${nombre.trim()} ${apellido.trim()}`.trim();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName || email.split("@")[0],
          nombre: nombre.trim(),
          apellido: apellido.trim(),
        },
      },
    });
    if (error) {
      const lower = error.message.toLowerCase();
      let msg = "No pudimos crear tu cuenta. Intentá de nuevo.";
      if (lower.includes("already registered") || lower.includes("user already") || lower.includes("already been registered"))
        msg = "Ya existe una cuenta con ese email. ¿Querés iniciar sesión?";
      else if (lower.includes("password") && lower.includes("short"))
        msg = "La contraseña debe tener al menos 6 caracteres.";
      else if (lower.includes("invalid email"))
        msg = "El email no parece válido. Verificalo e intentá de nuevo.";
      else if (lower.includes("too many requests") || lower.includes("rate limit"))
        msg = "Demasiados intentos. Esperá unos minutos e intentá de nuevo.";
      toast({ title: "Error al registrarse", description: msg, variant: "destructive" });
    } else {
      toast({ title: "¡Registro exitoso!", description: "Revisá tu email para confirmar tu cuenta." });
      trackSignup("email");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="reg-nombre">Nombre</Label>
          <Input
            id="reg-nombre"
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-apellido">Apellido</Label>
          <Input
            id="reg-apellido"
            type="text"
            placeholder="Tu apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Contraseña</Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="pr-10"
            autoComplete="new-password"
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
        {password.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
            </div>
            <span className="text-[10px] text-muted-foreground w-16 text-right">{strength.label}</span>
          </div>
        )}
      </div>
      <Button
        type="submit"
        className="w-full h-11 bg-mc-red hover:bg-mc-red/90"
        disabled={loading}
      >
        {loading ? "Cargando..." : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground pt-2">
        ¿Ya tenés cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-mc-dark-blue font-semibold hover:underline"
        >
          Iniciá sesión
        </button>
      </p>
    </form>
  );
};

export default SignupForm;
