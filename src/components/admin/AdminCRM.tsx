import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Users, TrendingUp, DollarSign, FileText, Clock, ShoppingCart,
  Plus, Search, Eye, Pencil, Trash2, Phone, Mail, MapPin,
  Building2, MessageCircle, AlertCircle, Package, X, Check,
  Target, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { format, isBefore, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  useCRMClients, useCRMClient, useCRMClientsMinimal, useUpsertCRMClient, useDeleteCRMClient,
  useCRMProducts, useCRMActiveProducts, useUpsertCRMProduct,
  useCRMInteractions, useCRMClientInteractions, useCreateCRMInteraction, useDeleteCRMInteraction,
  useCRMDashboard, useCRMSellerRanking,
  type CRMClient, type CRMProduct, type CRMInteraction,
} from "@/hooks/useCRM";

// ============================================================
// CONSTANTS
// ============================================================
const STATUS_LABELS: Record<string, string> = { activo: "Activo", potencial: "Potencial", inactivo: "Inactivo" };
const STATUS_STYLES: Record<string, string> = {
  activo: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
  potencial: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  inactivo: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
};
const RESULT_LABELS: Record<string, string> = {
  presupuesto: "Presupuesto", venta: "Venta", seguimiento: "Seguimiento",
  sin_respuesta: "Sin respuesta", no_interesado: "No interesado",
};
const RESULT_STYLES: Record<string, string> = {
  presupuesto: "bg-blue-100 text-blue-800 border-blue-200",
  venta: "bg-green-100 text-green-800 border-green-200",
  seguimiento: "bg-yellow-100 text-yellow-800 border-yellow-200",
  sin_respuesta: "bg-gray-100 text-gray-600 border-gray-200",
  no_interesado: "bg-red-100 text-red-800 border-red-200",
};
const MEDIUM_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp", llamada: "Llamada", email: "Email",
  reunion_presencial: "R. presencial", reunion_virtual: "R. virtual",
  md_instagram: "Instagram", md_facebook: "Facebook", md_linkedin: "LinkedIn",
  visita_campo: "Visita campo",
};
const CHANNELS = ["WhatsApp", "Email", "Redes sociales", "Referido", "Teléfono", "Feria/Evento", "Sitio web", "MejoraApp"];
const RUBROS = ["Forestal", "Agropecuario", "Industrial", "Construcción", "Gobierno", "Particular", "Comercio", "Otro"];
const PROVINCIAS = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones",
  "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz",
  "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán",
];
const CURRENCIES = ["ARS", "USD", "EUR"];
const COLORS = ["hsl(214,58%,41%)", "hsl(45,74%,60%)", "hsl(142,60%,40%)", "hsl(2,52%,53%)", "hsl(280,40%,50%)"];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function AdminCRM() {
  const { user } = useAuth();
  const [tab, setTab] = useState("dashboard");

  // Admin access is already verified by parent Admin.tsx via verify-admin Edge Function
  // No need for a second role check here

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-title font-semibold">CRM — Gestión Comercial</h2>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="interacciones">Interacciones</TabsTrigger>
          <TabsTrigger value="productos">Productos</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard"><CRMDashboard /></TabsContent>
        <TabsContent value="clientes"><CRMClientsTab /></TabsContent>
        <TabsContent value="interacciones"><CRMInteractionsTab /></TabsContent>
        <TabsContent value="productos"><CRMProductsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function CRMDashboard() {
  const { data, isLoading } = useCRMDashboard();
  const { data: ranking = [] } = useCRMSellerRanking();

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Cargando dashboard...</div>;
  if (!data) return null;

  const { stats, interactions = [], clients = [] } = data;

  // Chart: ventas por mes (últimos 6 meses)
  const ventasPorMes = useMemo(() => {
    const now = new Date();
    const months: { name: string; ventas: number; ingresos: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = format(d, "MMM", { locale: es });
      const monthInteractions = (interactions ?? []).filter((int: any) => {
        const id = new Date(int.interaction_date);
        return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear() && int.result === "venta";
      });
      months.push({
        name: label,
        ventas: monthInteractions.length,
        ingresos: monthInteractions.reduce((s: number, i: any) => s + (i.total_amount || 0), 0),
      });
    }
    return months;
  }, [interactions]);

  // Chart: distribución por resultado
  const distribucionResultados = useMemo(() => {
    const counts: Record<string, number> = {};
    (interactions ?? []).forEach((i: any) => {
      counts[i.result] = (counts[i.result] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: RESULT_LABELS[name] || name, value }));
  }, [interactions]);

  // Follow-ups pendientes
  const followupsPendientes = useMemo(() => {
    return (interactions ?? []).filter((i: any) => {
      if (!i.follow_up_date || i.result !== "seguimiento") return false;
      return isBefore(new Date(i.follow_up_date), new Date()) || differenceInDays(new Date(i.follow_up_date), new Date()) <= 3;
    }).slice(0, 5);
  }, [interactions]);

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard icon={Users} label="Clientes" value={stats.total_clients} />
        <KPICard icon={Target} label="Activos" value={stats.active_clients} />
        <KPICard icon={ShoppingCart} label="Ventas (mes)" value={stats.total_ventas} />
        <KPICard icon={DollarSign} label="Ingresos" value={`$${(stats.total_ingresos ?? 0).toLocaleString("es-AR")}`} />
        <KPICard icon={TrendingUp} label="Pipeline" value={`$${(stats.pipeline ?? 0).toLocaleString("es-AR")}`} />
        <KPICard icon={Clock} label="Follow-ups" value={stats.followups_pendientes} highlight={(stats.followups_pendientes ?? 0) > 0} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Chart: Ventas por mes */}
        <Card>
          <CardHeader><CardTitle className="text-subtitle">Ventas por mes</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ventasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RTooltip />
                <Bar dataKey="ventas" fill="hsl(214,58%,41%)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart: Distribución resultados */}
        <Card>
          <CardHeader><CardTitle className="text-subtitle">Distribución de interacciones</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={distribucionResultados} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {distribucionResultados.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ranking vendedores */}
      {ranking.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-subtitle">Ranking vendedores (mes actual)</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Ventas</TableHead>
                  <TableHead>Presupuestos</TableHead>
                  <TableHead>Ingresos</TableHead>
                  <TableHead>Pipeline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((r: any, i: number) => (
                  <TableRow key={r.user_id}>
                    <TableCell className="font-medium">{i + 1}. {r.full_name}</TableCell>
                    <TableCell>{r.ventas_count}</TableCell>
                    <TableCell>{r.presupuestos_count}</TableCell>
                    <TableCell>${(r.ingresos ?? 0).toLocaleString("es-AR")}</TableCell>
                    <TableCell>${(r.pipeline ?? 0).toLocaleString("es-AR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Follow-ups pendientes */}
      {followupsPendientes.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-subtitle">Seguimientos pendientes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {followupsPendientes.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-body">{f.client_name || "Cliente"} — {f.next_step || "Seguimiento"}</span>
                  <Badge variant="outline">{format(new Date(f.follow_up_date), "dd/MM", { locale: es })}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KPICard({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: any; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-yellow-400" : ""}>
      <CardContent className="p-3 flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
          <div className="text-body-sm text-muted-foreground">{label}</div>
          <div className="text-subtitle font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// CLIENTS TAB
// ============================================================
function CRMClientsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
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

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Cargando clientes...</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
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

      {/* Stats */}
      <div className="flex gap-4 text-body-sm text-muted-foreground">
        <span>Total: {clients.length}</span>
        <span>Activos: {clients.filter((c) => c.status === "activo").length}</span>
        <span>Potenciales: {clients.filter((c) => c.status === "potencial").length}</span>
      </div>

      {/* Table */}
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

// ============================================================
// INTERACTIONS TAB
// ============================================================
function CRMInteractionsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
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

  const addLine = () => {
    setLines([...lines, { product_id: "", quantity: 1, unit_price: 0 }]);
  };

  const updateLine = (idx: number, field: string, value: any) => {
    const updated = [...lines];
    (updated[idx] as any)[field] = value;
    // Auto-fill price from product
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

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Cargando interacciones...</div>;

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

            {/* Product lines */}
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

// ============================================================
// PRODUCTS TAB
// ============================================================
function CRMProductsTab() {
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

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Cargando productos...</div>;

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

      {/* Create/Edit Dialog */}
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
