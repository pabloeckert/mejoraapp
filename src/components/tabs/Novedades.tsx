import { Sparkles, MessageCircle, Calendar, Monitor, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const novedades = [
  {
    icon: Users,
    title: "Consultoría Estratégica",
    desc: "Sesiones personalizadas para destrabar tu negocio con un plan de acción concreto.",
  },
  {
    icon: Calendar,
    title: "Eventos & Workshops",
    desc: "Capacitaciones prácticas sobre ventas, liderazgo y procesos.",
  },
  {
    icon: Monitor,
    title: "CRM Mejora Continua",
    desc: "Software propio para gestionar clientes, ventas y seguimiento comercial.",
  },
  {
    icon: MessageCircle,
    title: "Contacto Directo",
    desc: "¿Necesitás hablar con un especialista? Estamos a un mensaje.",
    cta: true,
  },
];

const Novedades = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-foreground">Novedades MC</h1>
        <p className="text-sm text-muted-foreground">
          Herramientas, eventos y recursos para impulsar tu negocio.
        </p>
      </div>

      <div className="space-y-3">
        {novedades.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-start gap-4 p-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-mc-dark-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                  {item.cta && (
                    <a
                      href="https://wa.me/543764358152?text=Hola%2C%20quiero%20info%20de%20Mejora%20Continua"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-mc-blue hover:underline"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Escribinos por WhatsApp
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Novedades;
