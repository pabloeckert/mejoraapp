import { useState, useEffect, useRef } from "react";
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
import { NPSSurvey } from "@/components/NPSSurvey";
import { trackPageView, trackTabSwitch } from "@/lib/analytics";
import { useLastVisit } from "@/hooks/useLastVisit";

const Index = () => {
  const { session, loading, user } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    // Default to muro for returning users who've been here before
    try {
      const visits = parseInt(sessionStorage.getItem("mc-visits") ?? "0", 10);
      sessionStorage.setItem("mc-visits", String(visits + 1));
      if (visits > 0) return "muro";
    } catch { /* ignore */ }
    return "contenido";
  });
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { badges, markVisited } = useLastVisit();
  const scrollPositions = useRef<Record<string, number>>({});

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

  // Check onboarding after auth is ready — only if profile is complete and hasn't completed diagnostic
  useEffect(() => {
    if (!loading && session && profileComplete === true) {
      // Skip onboarding if user already completed the diagnostic (they know the app)
      const skipOnboarding = async () => {
        if (!user) return false;
        const { data } = await supabase
          .from("profiles")
          .select("has_completed_diagnostic")
          .eq("user_id", user.id)
          .maybeSingle();
        return data?.has_completed_diagnostic === true;
      };
      skipOnboarding().then((skip) => {
        if (!skip) setShowOnboarding(shouldShowOnboarding());
      });
    }
  }, [loading, session, profileComplete, user]);

  // Listen for cross-tab navigation events (e.g., muro empty → diagnóstico)
  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail;
      if (tab) setActiveTab(tab);
    };
    window.addEventListener("navigate-tab", handler);
    return () => window.removeEventListener("navigate-tab", handler);
  }, []);

  // Track page view on mount and mark initial tab visited
  useEffect(() => {
    trackPageView("/");
    markVisited(activeTab);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track tab switches, save/restore scroll position, and mark visited
  const handleTabChange = (tab: string) => {
    // Save current scroll position
    scrollPositions.current[activeTab] = window.scrollY;
    trackTabSwitch(activeTab, tab);
    markVisited(tab);
    setActiveTab(tab);
    // Restore scroll position for new tab (after render)
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositions.current[tab] ?? 0);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <div className="w-8 h-8 border-3 border-mc-dark-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando tu sesión…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (profileComplete === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <div className="w-8 h-8 border-3 border-mc-dark-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Verificando tu perfil…</p>
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
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} badges={badges} />

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

      {/* NPS survey — shows after 7 days of use */}
      <NPSSurvey />
    </div>
  );
};

export default Index;
