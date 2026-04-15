import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import ContenidoDeValor from "@/components/tabs/ContenidoDeValor";
import Muro from "@/components/tabs/Muro";
import Novedades from "@/components/tabs/Novedades";
import DiagnosticTest from "@/components/DiagnosticTest";

const Index = () => {
  const { session, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("contenido");
  const [showDiagnostic, setShowDiagnostic] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const checkDiagnostic = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("has_completed_diagnostic")
        .eq("user_id", session.user.id)
        .single();

      setShowDiagnostic(data ? !data.has_completed_diagnostic : true);
    };

    checkDiagnostic();
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-mc-dark-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // Still checking diagnostic status
  if (showDiagnostic === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-mc-dark-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show diagnostic onboarding
  if (showDiagnostic) {
    return (
      <div className="min-h-screen bg-background px-4 py-6">
        <DiagnosticTest onComplete={() => setShowDiagnostic(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />
      <main className="max-w-lg mx-auto px-4 py-4">
        {activeTab === "contenido" && <ContenidoDeValor />}
        {activeTab === "muro" && <Muro />}
        {activeTab === "novedades" && <Novedades />}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
