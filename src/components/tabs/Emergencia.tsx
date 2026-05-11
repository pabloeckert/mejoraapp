/**
 * Emergencia — P08: Botón de Emergencia
 *
 * WhatsApp pre-armado para situaciones urgentes.
 * Registra cada uso en la tabla emergencies.
 * Límite: 3 usos por semana para N1, ilimitado para N2.
 */

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessLevel } from "@/hooks/useAccessLevel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Phone,
  Clock,
  History,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const WA_NUMBER = "543764358152";
const WEEKLY_LIMIT_N1 = 3;

interface EmergencyRecord {
  id: string;
  message: string | null;
  whatsapp_sent: boolean | null;
  sent_at: string | null;
  created_at: string;
}

export default function Emergencia() {
  const { user } = useAuth();
  const { level } = useAccessLevel(user?.id);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<EmergencyRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [weeklyUsed, setWeeklyUsed] = useState(0);

  // Fetch emergency history
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoadingHistory(true);
    supabase
      .from("emergencies")
      .select("id, message, whatsapp_sent, sent_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (cancelled) return;
        if (data) {
          setHistory(data as EmergencyRecord[]);
          // Count uses this week
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const thisWeek = (data as EmergencyRecord[]).filter(
            (r) => new Date(r.created_at) > weekAgo
          );
          setWeeklyUsed(thisWeek.length);
        }
      })
      .catch(() => {})
      .then(() => { if (!cancelled) setLoadingHistory(false); });
    return () => { cancelled = true; };
  }, [user, sending]);

  const isN2 = level === "N2" || level === "ADMIN";
  const isLimited = !isN2 && level === "N1";
  const isOverLimit = isLimited && weeklyUsed >= WEEKLY_LIMIT_N1;

  const handleEmergency = useCallback(async () => {
    if (!user || sending) return;

    setSending(true);
    try {
      // Record in DB
      const { error } = await supabase.from("emergencies").insert({
        user_id: user.id,
        message: message.trim() || null,
        whatsapp_sent: true,
        sent_at: new Date().toISOString(),
      });
      if (error) throw error;

      // Open WhatsApp
      const waMsg = message.trim()
        ? `🚨 EMERGENCIA — ${message.trim()}`
        : `🚨 EMERGENCIA — Necesito hablar urgente con alguien de la comunidad.`;
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMsg)}`;
      window.open(url, "_blank");

      setMessage("");
    } catch (err) {
      console.error("Error registering emergency:", err);
    } finally {
      setSending(false);
    }
  }, [user, message, sending]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <div>
          <h1 className="text-title font-extrabold">Botón de Emergencia</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Situación urgente con tu negocio? Activá y te conectamos.
          </p>
        </div>
      </div>

      {/* Limit warning */}
      {isLimited && (
        <Card className={cn(isOverLimit ? "border-red-200 bg-red-50/50 dark:bg-red-950/20" : "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20")}>
          <CardContent className="p-3 flex items-center gap-3">
            <ShieldAlert className={cn("w-5 h-5 shrink-0", isOverLimit ? "text-red-500" : "text-amber-500")} />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {isOverLimit
                  ? "Límite semanal alcanzado"
                  : `${weeklyUsed}/${WEEKLY_LIMIT_N1} usos esta semana`}
              </p>
              <p className="text-xs text-muted-foreground">
                {isOverLimit
                  ? "Upgrade a N2 para emergencias ilimitadas."
                  : "N2 tiene emergencias ilimitadas."}
              </p>
            </div>
            {isOverLimit && (
              <Button size="sm" variant="outline" onClick={() => {
                const text = encodeURIComponent("Hola! Quiero upgrade a N2 para emergencias ilimitadas.");
                window.open(`https://wa.me/?text=${text}`, "_blank");
              }}>
                Upgrade
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Emergency form */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Textarea
            placeholder="Describí brevemente la situación (opcional)..."
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 300))}
            className="min-h-[60px] resize-none"
            maxLength={300}
          />
          <Button
            onClick={handleEmergency}
            disabled={sending || isOverLimit}
            className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white py-3 text-base font-bold"
            size="lg"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Phone className="w-5 h-5" />
            )}
            {sending ? "Activando..." : "🚨 Activar Emergencia"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Se abrirá WhatsApp con un mensaje pre-armado a Pablo Eckert.
          </p>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Historial</h3>
          </div>
          {loadingHistory ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No usaste el botón de emergencia todavía.
            </p>
          ) : (
            <div className="space-y-2">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground">
                      {record.message || "Emergencia sin mensaje"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.created_at).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {record.whatsapp_sent && (
                        <Badge variant="secondary" className="text-xs">
                          Enviado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
