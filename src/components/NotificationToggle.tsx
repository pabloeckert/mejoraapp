import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  isPushSupported,
  getPermissionState,
  requestPermission,
  subscribe,
  unsubscribe,
  isSubscribed,
} from "@/lib/push";

interface NotificationToggleProps {
  variant?: "button" | "icon";
}

const NotificationToggle = ({ variant = "button" }: NotificationToggleProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // Check support and subscription status on mount
  useEffect(() => {
    if (!isPushSupported()) {
      setSupported(false);
      setLoading(false);
      return;
    }
    setSupported(true);
    isSubscribed().then((sub) => {
      setSubscribed(sub);
      setLoading(false);
    });
  }, []);

  const handleToggle = useCallback(async () => {
    if (!user || toggling) return;
    setToggling(true);

    try {
      if (subscribed) {
        await unsubscribe(user.id);
        setSubscribed(false);
        toast({ title: "Notificaciones desactivadas" });
      } else {
        // Request permission first
        const perm = await requestPermission();
        if (perm !== "granted") {
          toast({
            title: "Permiso denegado",
            description: "Activá las notificaciones en la configuración de tu navegador.",
            variant: "destructive",
          });
          setToggling(false);
          return;
        }

        await subscribe(user.id);
        setSubscribed(true);
        toast({ title: "🔔 Notificaciones activadas", description: "Te avisamos cuando haya novedades." });
      }
    } catch (err) {
      console.error("[Push] Toggle error:", err);
      toast({ title: "Error", description: "No se pudo cambiar la configuración.", variant: "destructive" });
    }

    setToggling(false);
  }, [user, subscribed, toggling, toast]);

  if (!supported || loading) return null;

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleToggle}
        disabled={toggling}
        title={subscribed ? "Desactivar notificaciones" : "Activar notificaciones"}
      >
        {toggling ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : subscribed ? (
          <Bell className="w-4 h-4" />
        ) : (
          <BellOff className="w-4 h-4 text-muted-foreground" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={subscribed ? "outline" : "default"}
      size="sm"
      className="gap-2"
      onClick={handleToggle}
      disabled={toggling}
    >
      {toggling ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : subscribed ? (
        <Bell className="w-4 h-4" />
      ) : (
        <BellOff className="w-4 h-4" />
      )}
      {subscribed ? "Notificaciones activas" : "Activar notificaciones"}
    </Button>
  );
};

export default NotificationToggle;
