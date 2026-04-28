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
import {
  Users, Search, Eye, Pencil, Plus, Phone, Mail, MapPin,
  Building2, MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  useCRMClients, useCRMClientInteractions, useUpsertCRMClient, useDeleteCRMClient,
  type CRMClient,
} from "@/hooks/useCRM";
import { SkeletonTable } from "@/components/ui/skeleton-variants";
import {
  STATUS_LABELS, STATUS_STYLES, RESULT_LABELS, RESULT_STYLES, MEDIUM_LABELS,
  CHANNELS, RUBROS, PROVINCIAS,
} from "./constants";

export default function CRMClientsTab() {
  const { user } = useAuth();
  const { data: clients = [], isLoading } = useCRMClients();
  const upsertMutation = useUpsertCRMClient();
  const deleteMutation = useDeleteCRMClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailClient, setDetailClient] = useState<CRMClient | null>(null);
  const [editing, setEditing] = useState<CRMClient | null>(null);
  const [form, setForm] = useState<Partial<CRMClient>>({});

  const { data: clientInteractions = [] } = useCRMClientInteractions(detailClient?.id ?? null);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (search) {
        const s = search.toLowerCase();
        if (!c.name.toLowerCase().includes(s) && !(c.company ?? "").toLowerCase().includes(s) && !(c.email ?? "").toLowerCase().includes(s)) return false;
      }
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      return true;
    });
  }, [clients, search, statusFilter]);

  const openNew = () => {
    setEditing(null);
    setForm({ assigned_to: user?.id, status: "potencial" });
    setDialogOpen(true);
  };

  const openEdit = (c: CRMClient) => {
    setEditing(c);
    setForm({ ...c });
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
          toast.success(editing ? "Cliente actualizado" : "Cliente creado");
        },
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar cliente y todas sus interacciones?")) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Cliente eliminado"),
      onError: (e: any) => toast.error(e.message),
    });
  };

  if (isLoading) return <SkeletonTable rows={6} cols={6} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, empresa o email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="potencial">Potencial</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Nuevo cliente</Button>
      </div>

      <div className="flex gap-4 text-body-sm text-muted-foreground">
        <span>Total: {clients.length}</span>
        <span>Activos: {clients.filter((c) => c.status === "activo").length}</span>
        <span>Potenciales: {clients.filter((c) => c.status === "potencial").length}</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sin clientes</TableCell></TableRow>
              ) : filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                    {c.contact_name && <div className="text-body-sm text-muted-foreground">{c.contact_name}</div>}
                  </TableCell>
                  <TableCell>{c.company || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className={STATUS_STYLES[c.status]}>{STATUS_LABELS[c.status]}</Badge></TableCell>
                  <TableCell>{c.channel || "—"}</TableCell>
                  <TableCell>{[c.location, c.province].filter(Boolean).join(", ") || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setDetailClient(c)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailClient} onOpenChange={() => setDetailClient(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailClient?.name}</DialogTitle>
          </DialogHeader>
          {detailClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-body-sm">
                {detailClient.company && <div><Building2 className="inline h-4 w-4 mr-1" />{detailClient.company}</div>}
                {detailClient.contact_name && <div><Users className="inline h-4 w-4 mr-1" />{detailClient.contact_name}</div>}
                {detailClient.whatsapp && <div><Phone className="inline h-4 w-4 mr-1" />{detailClient.whatsapp}</div>}
                {detailClient.email && <div><Mail className="inline h-4 w-4 mr-1" />{detailClient.email}</div>}
                {detailClient.province && <div><MapPin className="inline h-4 w-4 mr-1" />{detailClient.province}</div>}
                {detailClient.channel && <div><MessageCircle className="inline h-4 w-4 mr-1" />Canal: {detailClient.channel}</div>}
                {detailClient.segment && <div>Rubro: {detailClient.segment}</div>}
                <div><Badge className={STATUS_STYLES[detailClient.status]}>{STATUS_LABELS[detailClient.status]}</Badge></div>
              </div>
              {detailClient.notes && <div className="p-3 bg-muted rounded text-body-sm">{detailClient.notes}</div>}
              <div>
                <h4 className="text-subtitle font-semibold mb-2">Historial de interacciones ({clientInteractions.length})</h4>
                {clientInteractions.length === 0 ? (
                  <p className="text-muted-foreground text-body-sm">Sin interacciones</p>
                ) : (
                  <div className="space-y-2">
                    {clientInteractions.map((int) => (
                      <div key={int.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <Badge className={RESULT_STYLES[int.result]}>{RESULT_LABELS[int.result]}</Badge>
                          <span className="text-caption text-muted-foreground">
                            {format(new Date(int.interaction_date), "dd/MM/yyyy HH:mm", { locale: es })}
                          </span>
                        </div>
                        <div className="text-body-sm text-muted-foreground">{MEDIUM_LABELS[int.medium] || int.medium}</div>
                        {int.total_amount && (
                          <div className="text-body-sm font-medium mt-1">
                            ${int.total_amount.toLocaleString("es-AR")} {int.currency || "ARS"}
                          </div>
                        )}
                        {int.next_step && <div className="text-body-sm mt-1">→ {int.next_step}</div>}
                        {int.notes && <div className="text-body-sm text-muted-foreground mt-1">{int.notes}</div>}
                        {int.interaction_lines && int.interaction_lines.length > 0 && (
                          <div className="mt-2 text-caption">
                            {int.interaction_lines.map((l) => (
                              <div key={l.id}>{l.product_name} × {l.quantity} = ${l.line_total?.toLocaleString("es-AR")}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Nombre *</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre o empresa" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Empresa</Label><Input value={form.company ?? ""} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div><Label>Contacto</Label><Input value={form.contact_name ?? ""} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>WhatsApp</Label><Input value={form.whatsapp ?? ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+54 ..." /></div>
              <div><Label>Email</Label><Input value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Rubro</Label>
                <Select value={form.segment ?? ""} onValueChange={(v) => setForm({ ...form, segment: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{RUBROS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Canal de ingreso</Label>
                <Select value={form.channel ?? ""} onValueChange={(v) => setForm({ ...form, channel: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Provincia</Label>
                <Select value={form.province ?? ""} onValueChange={(v) => setForm({ ...form, province: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{PROVINCIAS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Localidad</Label><Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            </div>
            <div><Label>Dirección</Label><Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div>
              <Label>Estado</Label>
              <Select value={form.status ?? "potencial"} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="potencial">Potencial</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Observaciones</Label><Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
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
