import { useState } from "react";
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
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useCRMProducts, useUpsertCRMProduct, type CRMProduct } from "@/hooks/useCRM";
import { SkeletonTable } from "@/components/ui/skeleton-variants";
import { CURRENCIES } from "./constants";

export default function CRMProductsTab() {
  const { data: products = [], isLoading } = useCRMProducts();
  const upsertMutation = useUpsertCRMProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CRMProduct | null>(null);
  const [form, setForm] = useState<Partial<CRMProduct>>({});

  const openNew = () => {
    setEditing(null);
    setForm({ active: true, currency: "ARS", unit: "u", unit_label: "Unidad" });
    setDialogOpen(true);
  };

  const openEdit = (p: CRMProduct) => {
    setEditing(p);
    setForm({ ...p });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name?.trim()) return toast.error("El nombre es obligatorio");
    upsertMutation.mutate(
      { ...(editing ? { id: editing.id } : {}), ...form, name: form.name!.trim() } as any,
      {
        onSuccess: () => {
          setDialogOpen(false);
          setForm({});
          setEditing(null);
          toast.success(editing ? "Producto actualizado" : "Producto creado");
        },
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  if (isLoading) return <SkeletonTable rows={5} cols={6} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Nuevo producto</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sin productos</TableCell></TableRow>
              ) : products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category || "—"}</TableCell>
                  <TableCell>{p.price ? `$${p.price.toLocaleString("es-AR")} ${p.currency}` : "—"}</TableCell>
                  <TableCell>{p.unit_label}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={p.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                      {p.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Nombre *</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Categoría</Label><Input value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div>
                <Label>Moneda</Label>
                <Select value={form.currency ?? "ARS"} onValueChange={(v: any) => setForm({ ...form, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Precio</Label><Input type="number" value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || null })} /></div>
              <div><Label>Unidad</Label><Input value={form.unit ?? ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="u" /></div>
              <div><Label>Etiqueta</Label><Input value={form.unit_label ?? ""} onChange={(e) => setForm({ ...form, unit_label: e.target.value })} placeholder="Unidad" /></div>
            </div>
            <div><Label>Descripción</Label><Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.active ?? true} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <Label>Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? "Guardar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
