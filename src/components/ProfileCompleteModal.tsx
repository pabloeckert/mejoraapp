import { useState } from "react";
import { Building2, Briefcase, Phone, ArrowRight, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileCompleteModalProps {
  userId: string;
  onComplete: () => void;
}

const ProfileCompleteModal = ({ userId, onComplete }: ProfileCompleteModalProps) => {
  const { toast } = useToast();
  const [empresa, setEmpresa] = useState("");
  const [cargo, setCargo] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          empresa: empresa.trim() || null,
          cargo: cargo.trim() || null,
          phone: phone.trim() || null,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({ title: "¡Perfil completado!", description: "Tus datos fueron guardados." });
      onComplete();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudieron guardar los datos.", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleSkip = () => {
    setSkipped(true);
    onComplete();
  };

  if (skipped) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <Card className="w-full sm:max-w-md rounded-b-none sm:rounded-b-2xl rounded-t-2xl sm:rounded-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <CardContent className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Completá tu perfil</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Estos datos nos ayudan a personalizar tu experiencia.
              </p>
            </div>
            <button onClick={handleSkip} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="empresa" className="text-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                Empresa
              </Label>
              <Input
                id="empresa"
                placeholder="¿Dónde trabajás?"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cargo" className="text-xs flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                Cargo
              </Label>
              <Input
                id="cargo"
                placeholder="¿Cuál es tu rol?"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                WhatsApp
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+54 11 1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 h-11 gap-2" disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Guardar
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <button
            onClick={handleSkip}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Completar después
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompleteModal;
