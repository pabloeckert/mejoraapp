import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import ContenidoDeValor from "@/components/tabs/ContenidoDeValor";
import Muro from "@/components/tabs/Muro";
import Novedades from "@/components/tabs/Novedades";
import Comunidad from "@/components/tabs/Comunidad";
import Mentor from "@/components/tabs/Mentor";
import DiagnosticTest from "@/components/DiagnosticTest";
import { MirrorPage } from "@/components/mirror/MirrorPage";
import Emergencia from "@/components/tabs/Emergencia";
import ProfileCompleteModal from "@/components/ProfileCompleteModal";
import { HomeDashboard } from "@/components/home/HomeDashboard";
import { trackPageView, trackTabSwitch } from "@/lib/analytics";
import { useLastVisit } from "@/hooks/useLastVisit";
import { useProfileComplete } from "@/hooks/useProfile";
import { SEOHead, SEO_CONFIGS } from "@/components/SEOHead";

const SPLASH_SEEN_KEY = "mc-splash-seen";

const Index = () => {
  const { session, loading, user } = useAuth();
  const { isComplete: profileComplete, isLoading: profileLoading } = useProfileComplete(user?.id);
  const [activeTab, setActiveTab] = useState(() => {
    // Default to muro for returning users who've been here before
    try {
      const visits = parseInt(sessionStorage.getItem("mc-visits") ?? "0", 10);
      sessionStorage.setItem("mc-visits", String(visits + 1));
      if (visits > 0) return "muro";
    } catch { /* ignore */ }
    return "home";
  });
  const { badges, markVisited } = useLastVisit();
  const scrollPositions = useRef<Record<string, number>>({});

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

  // Splash screen — primera visita
  if (!session && !sessionStorage.getItem(SPLASH_SEEN_KEY)) {
    return <Navigate to="/splash" replace />;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (profileLoading || profileComplete === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <div className="w-8 h-8 border-3 border-mc-dark-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Verificando tu perfil…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <SEOHead {...SEO_CONFIGS.index} />
      <AppHeader />
      <main className="max-w-lg mx-auto px-4 py-4" role="main">
        {activeTab === "home" && <HomeDashboard onNavigate={handleTabChange} />}
        {activeTab === "contenido" && <ContenidoDeValor />}
        {activeTab === "diagnostico" && <DiagnosticTest onComplete={() => setActiveTab("home")} />}
        {activeTab === "mirror" && <MirrorPage />}
        {activeTab === "emergencia" && <Emergencia />}
        {activeTab === "muro" && <Muro />}
        {activeTab === "comunidad" && <Comunidad />}
        {activeTab === "mentor" && <Mentor />}
        {activeTab === "novedades" && <Novedades />}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} badges={badges} />

      {/* Profile completion modal */}
      {!profileComplete && user && (
        <ProfileCompleteModal
          userId={user.id}
          onComplete={() => {/* React Query will auto-refetch */}}
        />
      )}
    </div>
  );
};

export default Index;
