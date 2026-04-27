import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-5">
        {/* Logo + title + admin dot below */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={logoComunidad}
            alt="Mejora Continua - Comunidad de Negocios"
            className="h-14 object-contain"
          />
          {/* Admin access toggle — visible but discreet */}
          <button
            onClick={() => setMode(mode === "admin" ? "login" : "admin")}
            aria-label="Acceso administrador"
            title="Acceso administrador"
            className={`flex items-center gap-1.5 text-caption font-medium transition-all duration-200 px-2 py-0.5 rounded-full
              ${mode === "admin"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            <Shield className="w-2.5 h-2.5" />
            {mode === "admin" ? "Modo admin" : "Admin"}
          </button>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            {mode === "admin" ? (
              /* Admin login — replaces the normal form */
              <AdminLoginForm
                onBack={() => setMode("login")}
                onSuccess={handleAdminSuccess}
              />
            ) : (
              /* Normal user flow */
              <>
                <GoogleButton onClick={handleGoogleLogin} disabled={googleLoading} />

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">o con email</span>
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
      </div>
    </div>
  );
};

export default Auth;
