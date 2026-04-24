import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Servicios } from "@/components/Servicios";
import type { Tables } from "@/integrations/supabase/types";

type Novedad = Tables<"novedades">;

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};



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
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold text-foreground mb-1 text-sm">Próximamente</h3>
            <p className="text-xs text-muted-foreground max-w-[260px]">
              Estamos preparando eventos y novedades para la comunidad.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Servicios — sección separada con tracking propio */}
      <Servicios />
    </div>
  );
};

export default Novedades;
