import { useEffect, useState } from "react";
import { LogOut, User, Moon, Sun, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import logoComunidad from "@/assets/logo-comunidad.png";

const AppHeader = () => {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showAdminReturn, setShowAdminReturn] = useState(false);

  // Show "back to admin" only if user already unlocked admin in this session
  useEffect(() => {
    const unlocked = sessionStorage.getItem("admin_unlocked");
    setShowAdminReturn(unlocked === "true");
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <img src={logoComunidad} alt="Mejora Continua - Comunidad de Negocios" className="h-8 object-contain" />
        <div className="flex items-center gap-1">
          {showAdminReturn && (
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              asChild
              title="Volver al panel admin"
            >
              <a href="/admin" aria-label="Volver al panel admin">
                <Shield className="w-5 h-5 text-primary" />
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-full bg-secondary/80 hover:bg-secondary"
            onClick={toggleTheme}
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-mc-dark-blue" />
            )}
          </Button>
          <div className="h-11 w-11 rounded-full bg-primary flex items-center justify-center cursor-default" title="Tu perfil">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} className="h-11 w-11" title="Cerrar sesión">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
