import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  useCRMInteractions, useCRMClientsMinimal, useCRMActiveProducts,
  useCreateCRMInteraction, useDeleteCRMInteraction,
} from "@/hooks/useCRM";
import { SkeletonTable } from "@/components/ui/skeleton-variants";
import { RESULT_LABELS, RESULT_STYLES, MEDIUM_LABELS, CURRENCIES } from "./constants";

export default function CRMInteractionsTab() {
  const { user } = useAuth();
  const { data: interactions = [], isLoading } = useCRMInteractions(200);
  const { data: clients = [] } = useCRMClientsMinimal();
  const { data: products = [] } = useCRMActiveProducts();
  const createMutation = useCreateCRMInteraction();
  const deleteMutation = useDeleteCRMInteraction();

  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<any>({});
  const [lines, setLines] = useState<{ product_id: string; quantity: number; unit_price: number }[]>([]);

  const filtered = useMemo(() => {
    return interactions.filter((i) => {
      if (search) {
        const s = search.toLowerCase();
        if (!(i.client_name ?? "").toLowerCase().includes(s) && !(i.notes ?? "").toLowerCase().includes(s)) return false;
      }
      if (resultFilter !== "all" && i.result !== resultFilter) return false;
      return true;
    });
  }, [interactions, search, resultFilter]);

  const openNew = () => {
    setForm({ user_id: user?.id, result: "seguimiento", medium: "whatsapp", interaction_date: new Date().toISOString().slice(0, 16) });
    setLines([]);
    setDialogOpen(true);
  };

  const addLine = () => setLines([...lines, { product_id: "", quantity: 1, unit_price: 0 }]);

  const updateLine = (idx: number, field: string, value: any) => {
    const updated = [...lines];
    (updated[idx] as any)[field] = value;
    if (field === "product_id") {
      const p = products.find((pr: any) => pr.id === value);
      if (p) updated[idx].unit_price = (p as any).price || 0;
    }
    setLines(updated);
  };

  const removeLine = (idx: number) => setLines(lines.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!form.client_id) return toast.error("Seleccioná un cliente");
    if (!form.result) return toast.error("Seleccioná un resultado");
    if (!form.medium) return toast.error("Seleccioná un medio");

    const total = lines.reduce((s, l) => s + l.quantity * l.unit_price, 0);

    createMutation.mutate(
      {
        interaction: {
          client_id: form.client_id,
          user_id: user?.id,
          interaction_date: form.interaction_date || new Date().toISOString(),
          result: form.result,
          medium: form.medium,
          notes: form.notes || null,
          next_step: form.next_step || null,
          follow_up_date: form.follow_up_date || null,
          total_amount: total > 0 ? total : form.total_amount || null,
          currency: form.currency || "ARS",
          followup_scenario: form.followup_scenario || null,
          negotiation_state: form.negotiation_state || null,
        },
        lines: lines.filter((l) => l.product_id),
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setForm({});
          setLines([]);
          toast.success("Interacción registrada");
        },
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  if (isLoading) return <SkeletonTable rows={8} cols={7} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={resultFilter} onValueChange={setResultFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Resultado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(RESULT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Nueva interacción</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Medio</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Próximo paso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Sin interacciones</TableCell></TableRow>
              ) : filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="text-body-sm">{format(new Date(i.interaction_date), "dd/MM/yy HH:mm")}</TableCell>
                  <TableCell className="font-medium">{i.client_name || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className={RESULT_STYLES[i.result]}>{RESULT_LABELS[i.result]}</Badge></TableCell>
                  <TableCell className="text-body-sm">{MEDIUM_LABELS[i.medium] || i.medium}</TableCell>
                  <TableCell>{i.total_amount ? `$${i.total_amount.toLocaleString("es-AR")} ${i.currency || ""}` : "—"}</TableCell>
                  <TableCell className="text-body-sm max-w-[150px] truncate">{i.next_step || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => {
                      if (!confirm("¿Eliminar interacción?")) return;
                      deleteMutation.mutate(i.id, { onSuccess: () => toast.success("Eliminada") });
                    }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva interacción</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Cliente *</Label>
              <Select value={form.client_id ?? ""} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Resultado *</Label>
                <Select value={form.result ?? "seguimiento"} onValueChange={(v) => setForm({ ...form, result: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(RESULT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Medio *</Label>
                <Select value={form.medium ?? "whatsapp"} onValueChange={(v) => setForm({ ...form, medium: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(MEDIUM_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Fecha</Label>
              <Input type="datetime-local" value={form.interaction_date ?? ""} onChange={(e) => setForm({ ...form, interaction_date: e.target.value })} />
            </div>
            {(form.result === "presupuesto" || form.result === "venta") && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Monto total</Label>
                  <Input type="number" value={form.total_amount ?? ""} onChange={(e) => setForm({ ...form, total_amount: parseFloat(e.target.value) || null })} />
                </div>
                <div>
                  <Label>Moneda</Label>
                  <Select value={form.currency ?? "ARS"} onValueChange={(v) => setForm({ ...form, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {form.result === "seguimiento" && (
              <div>
                <Label>Fecha de seguimiento</Label>
                <Input type="date" value={form.follow_up_date ?? ""} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} />
              </div>
            )}
            <div><Label>Próximo paso</Label><Input value={form.next_step ?? ""} onChange={(e) => setForm({ ...form, next_step: e.target.value })} placeholder="¿Qué sigue?" /></div>
            <div><Label>Observaciones</Label><Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></div>

            {(form.result === "presupuesto" || form.result === "venta") && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Productos</Label>
                  <Button variant="outline" size="sm" onClick={addLine}><Plus className="h-3 w-3 mr-1" />Agregar</Button>
                </div>
                {lines.map((l, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-end">
                    <div className="flex-1">
                      <Select value={l.product_id} onValueChange={(v) => updateLine(idx, "product_id", v)}>
                        <SelectTrigger><SelectValue placeholder="Producto" /></SelectTrigger>
                        <SelectContent>
                          {products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input type="number" className="w-20" placeholder="Cant." value={l.quantity} onChange={(e) => updateLine(idx, "quantity", parseFloat(e.target.value) || 0)} />
                    <Input type="number" className="w-28" placeholder="Precio" value={l.unit_price} onChange={(e) => updateLine(idx, "unit_price", parseFloat(e.target.value) || 0)} />
                    <Button variant="ghost" size="icon" onClick={() => removeLine(idx)}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
                {lines.length > 0 && (
                  <div className="text-right text-body-sm font-medium mt-1">
                    Total: ${lines.reduce((s, l) => s + l.quantity * l.unit_price, 0).toLocaleString("es-AR")}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
