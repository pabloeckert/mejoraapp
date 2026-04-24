/**
 * Servicios — Sección dedicada a servicios de Mejora Continua
 *
 * Separada de Novedades para:
 * 1. Tracking independiente de clicks y conversiones
 * 2. Claridad en el funnel (servicios ≠ contenido editorial)
 * 3. Posibilidad de A/B testing por servicio
 */

import {
  Users,
  Calendar,
  Monitor,
  MessageCircle,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackServiceClick, trackServiceWhatsApp } from "@/lib/analytics";

interface Servicio {
  id: string;
  icon: typeof Users;
  title: string;
  desc: string;
  highlight?: boolean;
  cta?: {
    label: string;
    href: string;
    external?: boolean;
  };
}

const servicios: Servicio[] = [
  {
    id: "consultoria",
    icon: Users,
    title: "Consultoría Estratégica",
    desc: "Sesiones personalizadas para destrabar tu negocio con un plan de acción concreto. 45 minutos que pueden cambiar tu rumbo.",
    highlight: true,
    cta: {
      label: "Agendar sesión",
      href: "https://wa.me/543764358152?text=Hola%2C%20quiero%20agendar%20una%20sesi%C3%B3n%20de%20consultor%C3%ADa%20estrat%C3%A9gica",
      external: true,
    },
  },
  {
    id: "eventos",
    icon: Calendar,
    title: "Eventos & Workshops",
    desc: "Capacitaciones prácticas sobre ventas, liderazgo y procesos. Aprendé con otros líderes que enfrentan los mismos desafíos.",
    cta: {
      label: "Ver próximos eventos",
      href: "#novedades",
    },
  },
  {
    id: "crm",
    icon: Monitor,
    title: "CRM Mejora Continua",
    desc: "Software propio para gestionar clientes, ventas y seguimiento comercial. Diseñado para negocios que quieren dejar de improvisar.",
  },
  {
    id: "comunidad",
    icon: Briefcase,
    title: "Comunidad de Negocios",
    desc: "Un espacio donde líderes empresariales comparten experiencias, resuelven dudas y se apoyan mutuamente. Sin ventas, sin humo.",
  },
];

const WA_NUMBER = "543764358152";
const WA_GENERAL_MSG = encodeURIComponent(
  "Hola, quiero info de Mejora Continua"
);

export const Servicios = ({ variant = "full" }: { variant?: "full" | "compact" }) => {
  const handleClick = (servicio: Servicio) => {
    trackServiceClick(servicio.id);
  };

  const handleWhatsApp = () => {
    trackServiceWhatsApp();
  };

  if (variant === "compact") {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              ¿Necesitás ayuda con tu negocio?
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Consultoría estratégica, eventos y herramientas para empresarios.
          </p>
          <Button
            size="sm"
            className="gap-1.5 w-full"
            asChild
            onClick={handleWhatsApp}
          >
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${WA_GENERAL_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Hablar con un especialista
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Servicios</h2>
      </div>

      {servicios.map((servicio) => {
        const Icon = servicio.icon;
        return (
          <Card
            key={servicio.id}
            className={`hover:shadow-sm transition-shadow ${
              servicio.highlight ? "border-primary/20 bg-primary/5" : ""
            }`}
            onClick={() => handleClick(servicio)}
          >
            <CardContent className="flex items-start gap-3 p-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  servicio.highlight
                    ? "bg-primary/10"
                    : "bg-secondary"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    servicio.highlight ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground">
                  {servicio.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {servicio.desc}
                </p>
                {servicio.cta && (
                  <Button
                    size="sm"
                    variant={servicio.highlight ? "default" : "outline"}
                    className="gap-1.5 mt-2 h-7 text-xs"
                    asChild
                  >
                    <a
                      href={servicio.cta.href}
                      target={servicio.cta.external ? "_blank" : undefined}
                      rel={servicio.cta.external ? "noopener noreferrer" : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (servicio.id === "consultoria") handleWhatsApp();
                      }}
                    >
                      {servicio.cta.label}
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* WhatsApp CTA general */}
      <Card className="border-dashed">
        <CardContent className="p-3 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            ¿No encontrás lo que buscás?
          </p>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            asChild
            onClick={handleWhatsApp}
          >
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${WA_GENERAL_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Escribinos por WhatsApp
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Servicios;
