import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { Shield, Newspaper, MessageSquare, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminNovedades from "@/components/admin/AdminNovedades";
import AdminMuro from "@/components/admin/AdminMuro";
import AdminUsuarios from "@/components/admin/AdminUsuarios";

type AdminTab = "novedades" | "muro" | "usuarios";

const Admin = () => {
  const { session, loading, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("novedades");

  useEffect(() => {
    if (!user) return;
    const checkAdmin = async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [user]);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const tabs: { key: AdminTab; label: string; icon: typeof Newspaper }[] = [
    { key: "novedades", label: "Novedades", icon: Newspaper },
    { key: "muro", label: "Muro", icon: MessageSquare },
    { key: "usuarios", label: "Usuarios", icon: Users },
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
          <Button variant="ghost" size="sm" asChild>
            <a href="/">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver
            </a>
          </Button>
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
        {activeTab === "novedades" && <AdminNovedades />}
        {activeTab === "muro" && <AdminMuro />}
        {activeTab === "usuarios" && <AdminUsuarios />}
      </main>
    </div>
  );
};

export default Admin;
