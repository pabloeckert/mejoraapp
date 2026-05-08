/**
 * HomeDashboard — P03: Home dashboard por nivel de membresía
 *
 * Muestra cards dinámicas según el access_level del usuario.
 * N0: Contenido limitado + upgrade prompts
 * N1: Contenido completo + features básicos
 * N2: Todo + Círculo Dorado + Business Mirror Gamer
 * ADMIN: Panel de administración
 */

import { useAccessLevel } from "@/hooks/useAccessLevel";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccessGate } from "@/components/AccessGate";
import {
  BookOpen,
  Users,
  MessageSquare,
  Calendar,
  Crown,
  Gamepad2,
  AlertTriangle,
  Settings,
  TrendingUp,
  Sparkles,
} from "lucide-react";

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: typeof BookOpen;
  color: string;
  bgColor: string;
  tab: string;
  minLevel: "N0" | "N1" | "N2" | "ADMIN";
  blur?: boolean;
}

const CARDS: DashboardCard[] = [
  {
    id: "muro",
    title: "Muro",
    description: "Compartí experiencias con la comunidad",
    icon: MessageSquare,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    tab: "muro",
    minLevel: "N0",
  },
  {
    id: "contenido",
    title: "Contenido de Valor",
    description: "Artículos, videos y recursos curados",
    icon: BookOpen,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    tab: "contenido",
    minLevel: "N0",
  },
  {
    id: "comunidad",
    title: "Comunidad",
    description: "Conectá con otros empresarios",
    icon: Users,
    color: "text-violet-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    tab: "comunidad",
    minLevel: "N0",
    blur: true,
  },
  {
    id: "eventos",
    title: "Eventos",
    description: "Calendario de eventos y reuniones",
    icon: Calendar,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    tab: "eventos",
    minLevel: "N1",
  },
  {
    id: "mirror",
    title: "Business Mirror Gamer",
    description: "Juegos que te hacen pensar y crecer",
    icon: Gamepad2,
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    tab: "mirror",
    minLevel: "N1",
  },
  {
    id: "mentor",
    title: "Mentor IA",
    description: "Tu asistente de negocios personal",
    icon: Sparkles,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    tab: "mentor",
    minLevel: "N1",
  },
  {
    id: "circulo",
    title: "Círculo Dorado",
    description: "Contenido VIP, Silla de la Verdad, Mesa de Alianzas",
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    tab: "circulo",
    minLevel: "N2",
  },
  {
    id: "emergencia",
    title: "Botón de Emergencia",
    description: "WhatsApp pre-armado para situaciones urgentes",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    tab: "emergencia",
    minLevel: "N1",
  },
];

interface HomeDashboardProps {
  onNavigate: (tab: string) => void;
}

export function HomeDashboard({ onNavigate }: HomeDashboardProps) {
  const { user } = useAuth();
  const { level, isAdmin, isLoading } = useAccessLevel(user?.id);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 h-28" />
          </Card>
        ))}
      </div>
    );
  }

  const visibleCards = CARDS.filter((card) => {
    if (card.minLevel === "ADMIN") return isAdmin;
    if (card.minLevel === "N2") return level === "N2" || level === "ADMIN";
    if (card.minLevel === "N1") return level !== "N0";
    return true;
  });

  const lockedCards = CARDS.filter((card) => {
    if (card.minLevel === "ADMIN") return !isAdmin;
    if (card.minLevel === "N2") return level !== "N2" && level !== "ADMIN";
    if (card.minLevel === "N1") return level === "N0";
    return false;
  });

  return (
    <div className="space-y-4">
      {/* Saludo personalizado */}
      <div className="space-y-1">
        <h2 className="text-title font-semibold">
          Hola{user?.user_metadata?.nombre ? `, ${user.user_metadata.nombre}` : ""} 👋
        </h2>
        <p className="text-sm text-muted-foreground">
          {level === "N0"
            ? "Explorá la comunidad y descubrí todo lo que tenemos para vos"
            : level === "N1"
            ? "Disfrutá de los beneficios de tu membresía Básica"
            : level === "N2"
            ? "Accedé a todo el contenido premium y el Círculo Dorado"
            : "Panel de administración"}
        </p>
      </div>

      {/* Cards de acceso */}
      <div className="grid grid-cols-2 gap-3">
        {visibleCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => onNavigate(card.tab)}
              className="text-left"
            >
              <Card className="h-full hover:shadow-card-hover transition-shadow cursor-pointer">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className={`w-9 h-9 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-body font-medium leading-tight">{card.title}</p>
                    <p className="text-caption text-muted-foreground mt-0.5 line-clamp-2">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      {/* Upgrade prompt para N0 */}
      {level === "N0" && lockedCards.length > 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto">
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-body font-medium">Desbloqueá más beneficios</p>
              <p className="text-caption text-muted-foreground mt-1">
                Con la membresía Básica accedés a eventos, Mentor IA, Business Mirror Gamer y más
              </p>
            </div>
            <Button
              size="sm"
              onClick={async () => {
                const productId = import.meta.env.VITE_TIENDUP_PRODUCT_N1;
                if (productId) {
                  try {
                    const { openCheckout } = await import("@/services/tiendup.service");
                    await openCheckout(productId);
                    return;
                  } catch { /* fallback */ }
                }
                const text = encodeURIComponent("Hola! Quiero info sobre membresías de Mejora Continua.");
                window.open(`https://wa.me/?text=${text}`, "_blank");
              }}
            >
              Ver membresías
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Admin shortcut */}
      {isAdmin && (
        <button onClick={() => onNavigate("admin")} className="w-full text-left">
          <Card className="border-dashed hover:border-solid transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-body font-medium">Panel de Administración</p>
                <p className="text-caption text-muted-foreground">Gestionar usuarios, contenido y eventos</p>
              </div>
            </CardContent>
          </Card>
        </button>
      )}
    </div>
  );
}
