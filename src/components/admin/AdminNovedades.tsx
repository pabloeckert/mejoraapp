import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAction } from "@/hooks/useAdminAction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Loader2, Save, X } from "lucide-react";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Novedad = Tables<"novedades">;

const emptyForm = {
  titulo: "",
  resumen: "",
  contenido: "",
  imagen_url: "",
  enlace_externo: "",
  publicado: false,
};

const AdminNovedades = () => {
  const { toast } = useToast();
  const { execute: adminAction } = useAdminAction();
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchNovedades = async () => {
    const { data } = await supabase
      .from("novedades")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setNovedades(data);
    setLoading(false);
  };

  useEffect(() => { fetchNovedades(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (n: Novedad) => {
    setEditingId(n.id);
    setForm({
      titulo: n.titulo,
      resumen: n.resumen || "",
      contenido: n.contenido || "",
      imagen_url: n.imagen_url || "",
      enlace_externo: n.enlace_externo || "",
      publicado: n.publicado,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      toast({ title: "El título es obligatorio", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      titulo: form.titulo.trim(),
      resumen: form.resumen.trim() || null,
      contenido: form.contenido.trim() || null,
      imagen_url: form.imagen_url.trim() || null,
      enlace_externo: form.enlace_externo.trim() || null,
      publicado: form.publicado,
      published_at: form.publicado ? new Date().toISOString() : null,
    };

    try {
      await adminAction("upsert-novedad", { novedadId: editingId || undefined, data: payload });
      toast({ title: editingId ? "Novedad actualizada" : "Novedad creada" });
      setShowForm(false);
      fetchNovedades();
    } catch (err) {
      toast({ title: "Error al guardar", description: String(err), variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await adminAction("delete-novedad", { novedadId: id });
      toast({ title: "Novedad eliminada" });
      fetchNovedades();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Novedades ({novedades.length})</h2>
        {!showForm && (
          <Button size="sm" onClick={openNew} className="gap-1.5">
            <Plus className="w-4 h-4" /> Nueva
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{editingId ? "Editar novedad" : "Nueva novedad"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Título *</Label>
              <Input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Título de la novedad"
                maxLength={200}
              />
            </div>
            <div>
              <Label className="text-xs">Resumen</Label>
              <Input
                value={form.resumen}
                onChange={(e) => setForm({ ...form, resumen: e.target.value })}
                placeholder="Resumen corto (opcional)"
                maxLength={300}
              />
            </div>
            <div>
              <Label className="text-xs">Contenido</Label>
              <Textarea
                value={form.contenido}
                onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                placeholder="Contenido completo (opcional)"
                className="min-h-[100px]"
                maxLength={5000}
              />
            </div>
            <div>
              <Label className="text-xs">URL de imagen</Label>
              <Input
                value={form.imagen_url}
                onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
                placeholder="https://..."
                maxLength={500}
              />
            </div>
            <div>
              <Label className="text-xs">Enlace externo</Label>
              <Input
                value={form.enlace_externo}
                onChange={(e) => setForm({ ...form, enlace_externo: e.target.value })}
                placeholder="https://..."
                maxLength={500}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.publicado}
                onCheckedChange={(v) => setForm({ ...form, publicado: v })}
              />
              <Label className="text-xs">Publicar ahora</Label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Guardar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                <X className="w-3.5 h-3.5 mr-1" /> Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {novedades.map((n) => (
          <Card key={n.id}>
            <CardContent className="p-3 flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${n.publicado ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                  <h3 className="text-sm font-semibold text-foreground truncate">{n.titulo}</h3>
                </div>
                {n.resumen && <p className="text-xs text-muted-foreground truncate">{n.resumen}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(n)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(n.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {novedades.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No hay novedades aún.</p>
        )}
      </div>
    </div>
  );
};

export default AdminNovedades;
