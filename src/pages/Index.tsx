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
import ProfileCompleteModal from "@/components/ProfileCompleteModal";
import Onboarding, { shouldShowOnboarding } from "@/components/Onboarding";

const Index = () => {
  const { session, loading, user } = useAuth();
  const [activeTab, setActiveTab] = useState("contenido");
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfileComplete(false);
      return;
    }

    const checkProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("empresa, cargo, phone")
        .eq("user_id", user.id)
        .maybeSingle();

      const isComplete = !!(data?.empresa || data?.cargo);
      setProfileComplete(isComplete);
    };

    checkProfile();
  }, [user]);

  // Check onboarding after auth is ready
  useEffect(() => {
    if (!loading && session) {
      setShowOnboarding(shouldShowOnboarding());
    }
  }, [loading, session]);

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

  if (profileComplete === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-mc-dark-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />
      <main className="max-w-lg mx-auto px-4 py-4">
        {activeTab === "contenido" && <ContenidoDeValor />}
        {activeTab === "diagnostico" && <DiagnosticTest onComplete={() => setActiveTab("contenido")} />}
        {activeTab === "muro" && <Muro />}
        {activeTab === "novedades" && <Novedades />}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Profile completion modal */}
      {!profileComplete && user && (
        <ProfileCompleteModal
          userId={user.id}
          onComplete={() => setProfileComplete(true)}
        />
      )}

      {/* Onboarding overlay */}
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  );
};

export default Index;
