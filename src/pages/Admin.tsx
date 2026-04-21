import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Newspaper, MessageSquare, Users, ArrowLeft, BookOpen, Sparkles, LogOut, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminNovedades from "@/components/admin/AdminNovedades";
import AdminMuro from "@/components/admin/AdminMuro";
import AdminUsuarios from "@/components/admin/AdminUsuarios";
import AdminContenido from "@/components/admin/AdminContenido";
import AdminIA from "@/components/admin/AdminIA";
import AdminSeguridad from "@/components/admin/AdminSeguridad";

type AdminTab = "contenido" | "ia" | "novedades" | "muro" | "usuarios" | "seguridad";

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("contenido");
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if master password was already entered this session
  useEffect(() => {
    const flag = sessionStorage.getItem("admin_unlocked");
    const unlockedAt = sessionStorage.getItem("admin_unlocked_at");

    if (flag === "true" && unlockedAt) {
      const elapsed = Date.now() - Number(unlockedAt);
      if (elapsed < 4 * 60 * 60 * 1000) {
        setUnlocked(true);
      } else {
        // Expired
        sessionStorage.removeItem("admin_unlocked");
        sessionStorage.removeItem("admin_unlocked_at");
      }
    }
    setChecking(false);
  }, []);

  const handleLock = () => {
    sessionStorage.removeItem("admin_unlocked");
    sessionStorage.removeItem("admin_unlocked_at");
    navigate("/auth");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not unlocked — redirect to auth for admin login
  if (!unlocked) {
    navigate("/auth");
    return null;
  }

  const tabs: { key: AdminTab; label: string; icon: typeof Newspaper }[] = [
    { key: "contenido", label: "Contenido", icon: BookOpen },
    { key: "ia", label: "IA", icon: Sparkles },
    { key: "novedades", label: "Novedades", icon: Newspaper },
    { key: "muro", label: "Muro", icon: MessageSquare },
    { key: "usuarios", label: "Usuarios", icon: Users },
    { key: "seguridad", label: "Seguridad", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="font-bold text-foreground">Panel Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLock} className="text-xs text-muted-foreground">
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Bloquear
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="sticky top-[53px] z-20 bg-card border-b">
        <div className="max-w-4xl mx-auto flex">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2
                ${activeTab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-4">
        {activeTab === "contenido" && <AdminContenido />}
        {activeTab === "ia" && <AdminIA />}
        {activeTab === "novedades" && <AdminNovedades />}
        {activeTab === "muro" && <AdminMuro />}
        {activeTab === "usuarios" && <AdminUsuarios />}
        {activeTab === "seguridad" && <AdminSeguridad />}
      </main>
    </div>
  );
};

export default Admin;
