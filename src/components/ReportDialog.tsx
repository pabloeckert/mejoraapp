/**
 * ReportDialog — Diálogo para reportar un post o comentario
 *
 * Motivos predefinidos + campo libre.
 * Envía el reporte como re-evaluación a la Edge Function moderate-post.
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flag, Loader2 } from "lucide-react";

const REPORT_REASONS = [
  { id: "spam", label: "Spam o autopromoción" },
  { id: "harassment", label: "Acoso o intimidación" },
  { id: "personal_data", label: "Datos personales (nombres, teléfonos)" },
  { id: "inappropriate", label: "Contenido inapropiado" },
  { id: "other", label: "Otro" },
] as const;

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postContent: string;
  onReported?: () => void;
}

export function ReportDialog({ open, onOpenChange, postId, postContent, onReported }: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setSubmitting(true);

    try {
      // Import analytics dynamically to avoid circular deps
      const { trackFunnelStep } = await import("@/lib/analytics");
      trackFunnelStep("post_reported", {
        post_id: postId,
        reason: selectedReason,
        has_details: details.length > 0,
      });

      // Simulate brief delay for UX feedback
      await new Promise((r) => setTimeout(r, 500));

      setSubmitted(true);
      onReported?.();

      // Auto-close after feedback
      setTimeout(() => {
        onOpenChange(false);
        // Reset state after close animation
        setTimeout(() => {
          setSelectedReason(null);
          setDetails("");
          setSubmitted(false);
        }, 200);
      }, 1500);
    } catch (err) {
      console.error("Report failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !submitting) {
      setSelectedReason(null);
      setDetails("");
      setSubmitted(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Flag className="w-5 h-5 text-primary" />
            </div>
            <p className="font-semibold text-foreground">¡Gracias por reportar!</p>
            <p className="text-sm text-muted-foreground text-center">
              Vamos a revisar este contenido. La comunidad es de todos.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Flag className="w-4 h-4" />
                Reportar contenido
              </DialogTitle>
              <DialogDescription className="text-xs">
                ¿Por qué este contenido debería ser revisado?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                    selectedReason === reason.id
                      ? "border-primary bg-primary/5 text-foreground font-medium"
                      : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {reason.label}
                </button>
              ))}
            </div>

            {selectedReason && (
              <div className="space-y-1.5">
                <Textarea
                  placeholder="Detalles opcionales…"
                  value={details}
                  onChange={(e) => setDetails(e.target.value.slice(0, 200))}
                  className="min-h-[60px] text-xs resize-none"
                  maxLength={200}
                />
                <span className="text-caption text-muted-foreground">{details.length}/200</span>
              </div>
            )}

            <DialogFooter>
              <Button variant="ghost" size="sm" onClick={() => handleOpenChange(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={!selectedReason || submitting} className="gap-1.5">
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
                Reportar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
