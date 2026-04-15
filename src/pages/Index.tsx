import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import ContenidoDeValor from "@/components/tabs/ContenidoDeValor";
import Muro from "@/components/tabs/Muro";
import Novedades from "@/components/tabs/Novedades";

const Index = () => {
  const { session, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("contenido");

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
