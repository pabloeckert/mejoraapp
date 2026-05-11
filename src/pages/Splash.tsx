/**
 * Splash — Pantalla de bienvenida (P01)
 *
 * Muestra branding de Mejora Continua en la primera visita.
 * Se muestra una vez, luego se marca como visto y navega a /auth.
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logoHorizontal from "@/assets/logo-horizontal.png";

const SPLASH_SEEN_KEY = "mc-splash-seen";

export default function Splash() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleContinue = useCallback(() => {
    setExiting(true);
    sessionStorage.setItem(SPLASH_SEEN_KEY, "true");
    setTimeout(() => {
      navigate("/auth", { replace: true });
    }, 500);
  }, [navigate]);

  useEffect(() => {
    // Si ya vio el splash, ir directo a auth
    if (sessionStorage.getItem(SPLASH_SEEN_KEY)) {
      navigate("/auth", { replace: true });
      return;
    }

    // Fade in
    requestAnimationFrame(() => setVisible(true));

    // Auto-navegar después de 3 segundos
    const timer = setTimeout(() => {
      handleContinue();
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, handleContinue]);

  return (
    <div
      onClick={handleContinue}
      className={`min-h-screen flex flex-col items-center justify-center bg-mc-dark-blue px-6 cursor-pointer transition-opacity duration-500 ${visible && !exiting ? "opacity-100" : "opacity-0"}`}
    >
      {/* Logo */}
      <div className={`mb-8 transition-all duration-700 ease-out ${visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-90 opacity-0"}`}>
        <img
          src={logoHorizontal}
          alt="Mejora Continua"
          className="h-16 object-contain brightness-0 invert"
        />
      </div>

      {/* Tagline */}
      <p className={`text-white/80 text-lg font-light tracking-wide text-center transition-all duration-600 delay-300 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        Comunidad de Negocios
      </p>

      {/* Divider */}
      <div className={`w-16 h-0.5 bg-white/30 rounded-full my-6 transition-all duration-400 delay-500 ${visible ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`} />

      {/* Subtitle */}
      <p className={`text-white/50 text-sm text-center max-w-xs transition-all duration-600 delay-700 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        Conectá, crecé y transformá tu negocio junto a otros líderes
      </p>

      {/* Tap hint */}
      <p className={`absolute bottom-12 text-white/30 text-xs transition-opacity duration-500 delay-[2000ms] ${visible ? "opacity-100" : "opacity-0"}`}>
        Tocá para continuar
      </p>
    </div>
  );
}
