/**
 * CirculoDorado — P07: Círculo Dorado
 *
 * N0/N1: ContentGate con preview borrosa
 * N2: pantalla VIP completa con Mesa de Alianzas, Emergencia y contenido exclusivo
 */

import { useMembership } from "@/hooks/useMembership";
import { ContentGate } from "@/components/ContentGate";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Users, AlertTriangle, BookOpen, MessageCircle, Calendar } from "lucide-react";

// ── Preview borrosa ───────────────────────────────────────────────

function CirculoPreview() {
  return (
    <div className="space-y-4 p-4">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: 'rgba(242,187,22,0.15)' }}>
          <Crown className="w-7 h-7" style={{ color: '#F2BB16' }} />
        </div>
        <h2 className="text-xl font-bold text-white">Círculo Dorado</h2>
        <p className="text-sm text-gray-400">Red privada de CEOs y Directores</p>
      </div>
      <div className="space-y-3">
        {["Mesa de Alianzas", "Botón de Emergencia", "Contenido VIP", "Reuniones privadas"].map((item) => (
          <div key={item} className="h-16 rounded-xl" style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }} />
        ))}
      </div>
    </div>
  );
}

// ── Vista VIP N2 ──────────────────────────────────────────────────

const VIP_FEATURES = [
  {
    id: "silla",
    title: "Silla de la Verdad",
    description: "Sesiones 1-a-1 con Pablo Eckert. Feedback directo sobre tu negocio.",
    icon: MessageCircle,
    cta: "Agendar sesión",
  },
  {
    id: "contenido",
    title: "Contenido VIP",
    description: "Artículos, herramientas y frameworks exclusivos para miembros premium.",
    icon: BookOpen,
    cta: "Explorar",
  },
  {
    id: "reuniones",
    title: "Reuniones Privadas",
    description: "Encuentros mensuales exclusivos N2. Debate de casos y estrategia.",
    icon: Calendar,
    cta: "Próxima reunión",
  },
];

function VipView() {
  const handleWhatsApp = (title: string) => {
    const text = encodeURIComponent(`Hola! Soy miembro N2 y quiero acceder a "${title}" del Círculo Dorado.`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleEmergencia = () => {
    const text = encodeURIComponent("Emergencia empresarial — necesito asesoría urgente como miembro del Círculo Dorado.");
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Header VIP */}
      <div
        className="rounded-xl p-5 text-center"
        style={{ background: '#0d0d0a', borderTop: '2px solid #F2BB16' }}
      >
        <Crown className="w-8 h-8 mx-auto mb-2" style={{ color: '#F2BB16' }} />
        <h1 className="font-serif text-2xl font-bold" style={{ color: '#F2BB16' }}>
          Círculo Dorado
        </h1>
        <p className="text-sm text-gray-400 mt-1">Tu red de C-Level</p>
      </div>

      {/* Mesa de Alianzas */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Mesa de Alianzas
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {["CEO · Tech", "CFO · Finanzas", "COO · Industria", "Dir. · Marketing"].map((role) => (
            <div
              key={role}
              className="rounded-xl p-3 flex flex-col gap-1"
              style={{ background: '#111118', border: '1px solid #2A2A3A' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: '#1C4D8C' }}
              >
                CD
              </div>
              <span className="text-xs text-gray-300 mt-1">{role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botón de Emergencia */}
      <button
        onClick={handleEmergencia}
        className="w-full rounded-xl p-4 flex items-center gap-3 text-left transition-opacity hover:opacity-90"
        style={{ background: 'rgba(217,7,45,0.10)', border: '1px solid #D9072D' }}
      >
        <AlertTriangle className="w-6 h-6 shrink-0" style={{ color: '#D9072D' }} />
        <div>
          <p className="text-sm font-semibold text-white">Contactar ahora — 1 uso por mes</p>
          <p className="text-xs text-gray-400">Asesoría urgente directa con el founder</p>
        </div>
      </button>

      {/* Contenido VIP */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Contenido exclusivo
        </h2>
        {VIP_FEATURES.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.id}
              className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: '#111118', border: '1px solid #2A2A3A' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(242,187,22,0.10)' }}
              >
                <Icon className="w-5 h-5" style={{ color: '#F2BB16' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">{feat.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{feat.description}</p>
                <button
                  onClick={() => handleWhatsApp(feat.title)}
                  className="mt-2 text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ color: '#F2BB16', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}
                >
                  {feat.cta} →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────

export default function CirculoDorado() {
  const { isN2 } = useMembership();

  return (
    <ContentGate
      requiredLevel="n2"
      preview={<CirculoPreview />}
    >
      {isN2 ? <VipView /> : null}
    </ContentGate>
  );
}
