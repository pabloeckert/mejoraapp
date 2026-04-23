import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Calendar, Loader2, MessageCircle, Users, Monitor } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Novedad = Tables<"novedades">;

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const servicios = [
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

const fetchNovedades = async (): Promise<Novedad[]> => {
  const { data, error } = await supabase
    .from("novedades")
    .select("*")
    .eq("publicado", true)
    .order("published_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
};

const NovedadSkeleton = () => (
  <Card>
    <CardContent className="p-3 space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

const Novedades = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: novedades = [], isLoading } = useQuery({
    queryKey: ["novedades"],
    queryFn: fetchNovedades,
  });

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-foreground">Novedades</h1>
        <p className="text-sm text-muted-foreground">
          Eventos, herramientas y noticias de Mejora Continua.
        </p>
      </div>

      {/* Dynamic novedades from DB */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <NovedadSkeleton key={i} />)}
        </div>
      ) : novedades.length > 0 ? (
        <div className="space-y-3">
          {novedades.map((novedad) => {
            const isExpanded = expanded === novedad.id;
            const dateStr = novedad.published_at || novedad.created_at;

            return (
              <Card key={novedad.id} className="overflow-hidden hover:shadow-sm transition-shadow">
                {novedad.imagen_url && (
                  <div className="aspect-video w-full overflow-hidden bg-secondary">
                    <img
                      src={novedad.imagen_url}
                      alt={novedad.titulo}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(dateStr)}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm leading-snug mb-1">
                    {novedad.titulo}
                  </h3>
                  {novedad.resumen && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                      {novedad.resumen}
                    </p>
                  )}
                  {novedad.contenido && (
                    <>
                      {isExpanded && (
                        <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed mb-2">
                          {novedad.contenido}
                        </div>
                      )}
                      <button
                        onClick={() => toggleExpanded(novedad.id)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {isExpanded ? "Ver menos" : "Leer más"}
                      </button>
                    </>
                  )}
                  {novedad.enlace_externo && (
                    <div className="mt-2">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7" asChild>
                        <a href={novedad.enlace_externo} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                          Ver más
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* Static services section */}
      <div className="space-y-1 pt-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Herramientas y servicios</h2>
      </div>
      <div className="space-y-2">
        {servicios.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-start gap-3 p-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  {item.cta && (
                    <a
                      href="https://wa.me/543764358152?text=Hola%2C%20quiero%20info%20de%20Mejora%20Continua"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-primary hover:underline"
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
