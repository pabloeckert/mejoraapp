import { LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import logoHorizontal from "@/assets/logo-horizontal.png";

const AppHeader = () => {
  const { signOut, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <img src={logoHorizontal} alt="Mejora Continua" className="h-8 object-contain" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-mc-dark-blue flex items-center justify-center">
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
