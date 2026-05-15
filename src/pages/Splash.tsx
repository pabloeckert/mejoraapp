/**
 * Splash — P01: Pantalla de bienvenida
 *
 * Fondo negro, animación de entrada por fases, CTA de registro e ingreso.
 * Se muestra una vez por sesión; auto-navega si ya fue vista.
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logoHorizontal from "@/assets/logo-horizontal.png";

const SPLASH_SEEN_KEY = "mc-splash-seen";

export default function Splash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0); // 0=hidden → 1=logo → 2=headline → 3=sub → 4=btns

  const goToAuth = useCallback((replace = true) => {
    sessionStorage.setItem(SPLASH_SEEN_KEY, "true");
    navigate("/auth", { replace });
  }, [navigate]);

  useEffect(() => {
    if (sessionStorage.getItem(SPLASH_SEEN_KEY)) {
      navigate("/auth", { replace: true });
      return;
    }

    // Fases de animación escalonadas
    const t1 = setTimeout(() => setPhase(1), 50);
    const t2 = setTimeout(() => setPhase(2), 250);
    const t3 = setTimeout(() => setPhase(3), 450);
    const t4 = setTimeout(() => setPhase(4), 650);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [navigate]);

  const fade = (show: boolean, extra = "") =>
    `transition-opacity duration-[400ms] ease-out ${show ? "opacity-100" : "opacity-0"} ${extra}`;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#0D0D0D' }}
    >
      {/* Logo */}
      <div className={fade(phase >= 1)}>
        <img
          src={logoHorizontal}
          alt="Mejora Continua"
          className="object-contain brightness-0 invert"
          style={{ maxWidth: 180 }}
        />
      </div>

      {/* Headline */}
      <h1
        className={`font-serif text-xl text-center mt-8 ${fade(phase >= 2)}`}
        style={{ color: '#F2BB16' }}
      >
        La comunidad de líderes que hace crecer empresas
      </h1>

      {/* Sublínea */}
      <p
        className={`font-sans text-sm tracking-widest uppercase text-center mt-2 ${fade(phase >= 3)}`}
        style={{ color: '#6B7280' }}
      >
        C-Level · Directivos · Fundadores · PyMEs
      </p>

      {/* Botones */}
      <div className={`mt-12 flex flex-col gap-3 w-full max-w-xs ${fade(phase >= 4)}`}>
        <button
          onClick={() => goToAuth()}
          className="w-full h-12 rounded-xl font-medium text-white flex items-center justify-center transition-opacity hover:opacity-90 active:scale-95"
          style={{ background: '#D9072D' }}
        >
          Crear cuenta gratis
        </button>
        <button
          onClick={() => goToAuth()}
          className="w-full h-12 rounded-xl text-white flex items-center justify-center transition-opacity hover:opacity-90 active:scale-95"
          style={{ border: '1px solid rgba(255,255,255,0.30)' }}
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
