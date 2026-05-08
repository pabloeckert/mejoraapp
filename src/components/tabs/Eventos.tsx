/**
 * Eventos — P05: Calendario de eventos
 *
 * Lista de eventos con inscripción por nivel, QR y aforo.
 * N0 ve blur, N1/N2 pueden inscribirse.
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessLevel } from "@/hooks/useAccessLevel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccessGate } from "@/components/AccessGate";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Loader2,
  CheckCircle2,
  QrCode,
  CalendarPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  max_attendees: number | null;
  min_access_level: string;
  image_url: string | null;
  status: string;
}

interface EventRegistration {
  id: string;
  event_id: string;
  status: string;
}

export default function Eventos() {
  const { user } = useAuth();
  const { level } = useAccessLevel(user?.id);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Map<string, EventRegistration>>(new Map());
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("status", "active")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(20);

      if (eventsData) setEvents(eventsData as Event[]);

      // Fetch user registrations
      if (user) {
        const { data: regData } = await supabase
          .from("event_registrations")
          .select("id, event_id, status")
          .eq("user_id", user.id);

        if (regData) {
          const regMap = new Map<string, EventRegistration>();
          for (const reg of regData as EventRegistration[]) {
            regMap.set(reg.event_id, reg);
          }
          setRegistrations(regMap);
        }
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRegister = useCallback(async (eventId: string) => {
    if (!user || registering) return;
    setRegistering(eventId);
    try {
      const { error } = await supabase.from("event_registrations").insert({
        event_id: eventId,
        user_id: user.id,
        status: "registered",
      });
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error("Error registering:", err);
    } finally {
      setRegistering(null);
    }
  }, [user, registering, fetchData]);

  const handleCancel = useCallback(async (eventId: string) => {
    if (!user) return;
    const reg = registrations.get(eventId);
    if (!reg) return;
    try {
      await supabase.from("event_registrations").delete().eq("id", reg.id);
      await fetchData();
    } catch (err) {
      console.error("Error canceling:", err);
    }
  }, [user, registrations, fetchData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("es-AR", { month: "short" }).toUpperCase(),
      weekday: date.toLocaleDateString("es-AR", { weekday: "short" }),
      time: date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const isRegistered = (eventId: string) => registrations.has(eventId);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-title font-extrabold">Eventos</h1>
        <p className="text-sm text-muted-foreground">
          Próximos eventos de la comunidad Mejora Continua
        </p>
      </div>

      {/* Events list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 h-32" />
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold mb-2">No hay eventos próximos</h3>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Pronto publicaremos nuevos eventos. Activá las notificaciones para no perderte nada.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const { day, month, weekday, time } = formatDate(event.event_date);
            const registered = isRegistered(event.id);

            return (
              <AccessGate key={event.id} required="N1" blur>
                <Card className={cn("hover:shadow-card-hover transition-all", registered && "border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/10")}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {/* Date badge */}
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-primary uppercase">{month}</span>
                        <span className="text-xl font-black text-primary leading-none">{day}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-sm leading-tight">{event.title}</h3>
                            {event.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                          </div>
                          {registered && (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 shrink-0">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Inscripto
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {weekday} {time}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          )}
                          {event.max_attendees && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />
                              Máx. {event.max_attendees}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          {registered ? (
                            <>
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                                <QrCode className="w-3.5 h-3.5" />
                                Mi QR
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-muted-foreground"
                                onClick={() => handleCancel(event.id)}
                              >
                                Cancelar inscripción
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleRegister(event.id)}
                              disabled={registering === event.id}
                              className="gap-1.5 text-xs"
                            >
                              {registering === event.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CalendarPlus className="w-3.5 h-3.5" />
                              )}
                              Inscribirme
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccessGate>
            );
          })}
        </div>
      )}
    </div>
  );
}
