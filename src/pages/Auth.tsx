import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Zap, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { trackLogin } from "@/lib/analytics";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import GoogleButton from "@/components/auth/GoogleButton";
import AdminLoginForm from "@/components/auth/AdminLoginForm";
import logoComunidad from "@/assets/logo-comunidad.png";

type AuthMode = "login" | "signup" | "admin";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setGoogleLoading(false);
    } else {
      trackLogin("google");
    }
  };

  const handleAdminSuccess = () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Hero gradient header ─────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-mc-dark-blue/5 to-transparent dark:from-mc-dark-blue/20" />
        <div className="relative max-w-sm mx-auto px-4 pt-10 pb-6 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src={logoComunidad}
              alt="Mejora Continua - Comunidad de Negocios"
              className="h-14 object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-heading font-extrabold text-foreground leading-tight mb-1">
            Accedé a <span className="text-mc-dark-blue dark:text-primary">MejoraApp</span>
          </h1>
          <p className="text-body text-muted-foreground">
            Comunidad de líderes empresariales
          </p>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mc-dark-blue/10 dark:bg-primary/15 text-caption font-medium text-mc-dark-blue dark:text-primary mt-4">
            <Shield className="w-3.5 h-3.5" />
            Gratis · Anónimo · Moderado por IA
          </div>
        </div>
      </div>

      {/* ── Auth card ────────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center px-4 -mt-1">
        <div className="w-full max-w-sm space-y-4">
          <Card className="shadow-lg border-border/50">
            <CardContent className="p-6">
              {mode === "admin" ? (
                <AdminLoginForm
                  onBack={() => setMode("login")}
                  onSuccess={handleAdminSuccess}
                />
              ) : (
                <>
                  <GoogleButton onClick={handleGoogleLogin} disabled={googleLoading} />

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground tracking-wider">o con email</span>
                    </div>
                  </div>

                  {mode === "login" ? (
                    <LoginForm onSwitchToSignup={() => setMode("signup")} />
                  ) : (
                    <SignupForm onSwitchToLogin={() => setMode("login")} />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Admin toggle — discreet */}
          <div className="flex justify-center">
            <button
              onClick={() => setMode(mode === "admin" ? "login" : "admin")}
              aria-label="Acceso administrador"
              title="Acceso administrador"
              className={`flex items-center gap-1.5 text-caption font-medium transition-all duration-200 px-3 py-1 rounded-full
                ${mode === "admin"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted"
                }`}
            >
              <Shield className="w-3 h-3" />
              {mode === "admin" ? "Modo admin" : "Admin"}
            </button>
          </div>

          {/* ── Stats strip ────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Users, label: "Comunidad", value: "Anónima" },
              { icon: Zap, label: "Mirror", value: "1 min" },
              { icon: BookOpen, label: "Contenido", value: "Gratis" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-4 h-4 mx-auto text-muted-foreground/50 mb-1" />
                <div className="text-caption font-semibold text-foreground">{stat.value}</div>
                <div className="text-caption text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="py-6 px-4 border-t border-border mt-auto">
        <div className="max-w-sm mx-auto flex items-center justify-between text-caption text-muted-foreground">
          <span>MejoraApp by Mejora Continua</span>
          <div className="flex gap-3">
            <a href="/politica-privacidad.html" className="hover:text-foreground transition-colors">Privacidad</a>
            <a href="/terminos-servicio.html" className="hover:text-foreground transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
