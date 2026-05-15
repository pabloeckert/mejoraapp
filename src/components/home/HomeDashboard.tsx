/**
 * HomeDashboard — P03: Home dashboard por nivel de membresía
 *
 * Quick Actions dinámicos por nivel + Upgrade CTA.
 */

import { useState } from "react";
import { useMembership } from "@/hooks/useMembership";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { UpgradeModal } from "@/components/UpgradeModal";
import {
  BookOpen,
  Users,
  MessageSquare,
  Calendar,
  Crown,
  AlertTriangle,
  TrendingUp,
  ClipboardList,
  ArrowUpRight,
} from "lucide-react";

interface QuickAction {
  id: string;
  icon: typeof BookOpen;
  label: string;
  tab?: string;
  upgrade?: 'n1' | 'n2';
}

const ACTIONS_N0: QuickAction[] = [
  { id: "diagnostico",  icon: ClipboardList, label: "Diagnóstico",       tab: "diagnostico" },
  { id: "ver-comunidad",icon: Users,         label: "Ver comunidad →",   upgrade: "n1" },
  { id: "contenido",    icon: BookOpen,      label: "Contenido",         tab: "contenido" },
  { id: "subir-nivel",  icon: ArrowUpRight,  label: "Subir nivel →",     upgrade: "n1" },
];

const ACTIONS_N1: QuickAction[] = [
  { id: "muro",      icon: MessageSquare, label: "Nueva consulta", tab: "muro" },
  { id: "eventos",   icon: Calendar,      label: "Eventos",        tab: "eventos" },
  { id: "contenido", icon: BookOpen,      label: "Contenido",      tab: "contenido" },
  { id: "comunidad", icon: Users,         label: "Directorio",     tab: "comunidad" },
];

const ACTIONS_N2: QuickAction[] = [
  { id: "circulo",      icon: Crown,          label: "Círculo Dorado",  tab: "circulo" },
  { id: "mesa",         icon: Users,          label: "Mesa Alianzas",   tab: "circulo" },
  { id: "emergencia",   icon: AlertTriangle,  label: "Emergencia",      tab: "emergencia" },
  { id: "diagnostico",  icon: ClipboardList,  label: "Diagnóstico",     tab: "diagnostico" },
];

const GREETING: Record<string, string> = {
  n0:    "Conocé la comunidad. Tu próximo nivel está a un toque.",
  n1:    "Tu comunidad activa. Seguí creciendo.",
  n2:    "Círculo Dorado activo. Tu red te espera.",
  admin: "Panel de administración.",
};

interface HomeDashboardProps {
  onNavigate: (tab: string) => void;
}

export function HomeDashboard({ onNavigate }: HomeDashboardProps) {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { level, isN2, isAdmin } = useMembership();
  const [upgradeModal, setUpgradeModal] = useState<'n1' | 'n2' | null>(null);

  const firstName = profile?.nombre ?? profile?.display_name?.split(" ")[0] ?? "";

  const actions = isAdmin
    ? ACTIONS_N1
    : isN2
    ? ACTIONS_N2
    : level === "n1"
    ? ACTIONS_N1
    : ACTIONS_N0;

  return (
    <div className="space-y-6">
      {/* Saludo */}
      <div className="px-0 pt-2">
        <h1 className="font-serif text-2xl text-white">
          Buenos días{firstName ? `, ${firstName}` : ""}.
        </h1>
        <p className="font-sans text-sm text-gray-400 mt-1">
          {GREETING[level] ?? GREETING.n0}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const isUpgrade = !!action.upgrade;
          return (
            <button
              key={action.id}
              onClick={() => {
                if (action.upgrade) setUpgradeModal(action.upgrade);
                else if (action.tab) onNavigate(action.tab);
              }}
              className="flex flex-col gap-2 p-4 rounded-xl text-left transition-transform active:scale-95"
              style={{
                background: '#111118',
                border: '1px solid #2A2A3A',
                minHeight: 88,
              }}
            >
              <Icon
                className="w-6 h-6"
                style={{ color: isUpgrade ? '#F2BB16' : '#9CA3AF' }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: isUpgrade ? '#F2BB16' : '#FFFFFF' }}
              >
                {action.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Upgrade CTAs */}
      {level === "n0" && (
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ border: '1px solid #1C4D8C', background: 'rgba(28,77,140,0.06)' }}
        >
          <div>
            <p className="text-sm font-semibold text-white">Únite a la comunidad</p>
            <p className="text-xs text-gray-400 mt-0.5">Accedé al muro, eventos y directorio</p>
          </div>
          <button
            onClick={() => setUpgradeModal("n1")}
            className="text-xs font-semibold px-3 py-2 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: '#1C4D8C', color: '#FFFFFF', minHeight: 44 }}
          >
            Ser Miembro
          </button>
        </div>
      )}

      {level === "n1" && (
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ border: '1px solid #F2BB16', background: 'rgba(242,187,22,0.06)' }}
        >
          <div>
            <p className="text-sm font-semibold text-white">Accedé al Círculo Dorado</p>
            <p className="text-xs text-gray-400 mt-0.5">La red privada de CEOs y Directores</p>
          </div>
          <button
            onClick={() => setUpgradeModal("n2")}
            className="text-xs font-semibold px-3 py-2 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: '#F2BB16', color: '#0D0D0D', minHeight: 44 }}
          >
            Ver Círculo
          </button>
        </div>
      )}

      {isAdmin && (
        <button
          onClick={() => onNavigate("admin")}
          className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-transform active:scale-95"
          style={{ background: '#111118', border: '1px solid #2A2A3A' }}
        >
          <TrendingUp className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-white">Panel de Administración</p>
            <p className="text-xs text-gray-400">Gestionar usuarios y contenido</p>
          </div>
        </button>
      )}

      {/* UpgradeModal */}
      {upgradeModal && (
        <UpgradeModal
          targetLevel={upgradeModal}
          isOpen
          onClose={() => setUpgradeModal(null)}
        />
      )}
    </div>
  );
}
