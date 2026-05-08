/**
 * CirculoDorado — P07: Círculo Dorado
 *
 * Contenido exclusivo para miembros N2:
 * - Silla de la Verdad: sesiones 1-a-1 con Pablo
 * - Mesa de Alianzas: networking estratégico entre N2
 * - Contenido VIP: artículos, herramientas exclusivas
 * - Reuniones privadas: calendario de encuentros N2
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  MessageCircle,
  Users,
  BookOpen,
  Calendar,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";

const FEATURES = [
  {
    id: "silla",
    title: "Silla de la Verdad",
    description: "Sesiones 1-a-1 con Pablo Eckert. Feedback directo, sin filtros, sobre tu negocio.",
    icon: MessageCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    cta: "Agendar sesión",
    available: true,
  },
  {
    id: "mesa",
    title: "Mesa de Alianzas",
    description: "Networking estratégico con otros miembros N2. Conexiones que generan negocio.",
    icon: Users,
    color: "text-violet-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    cta: "Ver miembros",
    available: true,
  },
  {
    id: "contenido",
    title: "Contenido VIP",
    description: "Artículos, herramientas y frameworks exclusivos para miembros premium.",
    icon: BookOpen,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    cta: "Explorar",
    available: true,
  },
  {
    id: "reuniones",
    title: "Reuniones Privadas",
    description: "Encuentros mensuales exclusivos N2. Debate de casos, estrategia y crecimiento.",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    cta: "Próxima reunión",
    available: true,
  },
];

export default function CirculoDorado() {
  const handleCTA = (feature: typeof FEATURES[0]) => {
    const text = encodeURIComponent(
      `Hola! Soy miembro N2 y quiero acceder a "${feature.title}" del Círculo Dorado.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto">
          <Crown className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-title font-extrabold">Círculo Dorado</h1>
          <p className="text-sm text-muted-foreground mt-1">
            El espacio exclusivo para miembros premium
          </p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
          <Sparkles className="w-3 h-3 mr-1" />
          Solo miembros N2
        </Badge>
      </div>

      {/* Features */}
      <div className="space-y-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.id} className="hover:shadow-card-hover transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl ${feature.bgColor} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {feature.description}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`mt-2 gap-1.5 text-xs ${feature.color}`}
                      onClick={() => handleCTA(feature)}
                    >
                      {feature.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4 text-center space-y-2">
          <Lock className="w-5 h-5 text-amber-600 mx-auto" />
          <p className="text-sm font-medium">Todo el contenido del Círculo Dorado es exclusivo N2</p>
          <p className="text-xs text-muted-foreground">
            Las sesiones, reuniones y contenido están diseñados para empresarios que buscan el siguiente nivel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
