import { useState, useEffect } from "react";
import { LogOut, User, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logoComunidad from "@/assets/logo-comunidad.png";

const AppHeader = () => {
  const { signOut, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
    });
  }, [user]);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <img src={logoComunidad} alt="Mejora Continua - Comunidad de Negocios" className="h-8 object-contain" />
        <div className="flex items-center gap-1.5">
          {isAdmin && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href="/admin">
                <Shield className="w-4 h-4 text-primary" />
              </a>
            </Button>
          )}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
