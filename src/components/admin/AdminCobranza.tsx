/**
 * AdminCobranza — Panel de gestión de cobranza
 *
 * Muestra: resumen de ingresos, tabla de pagos con datos de usuario,
 * filtro por estado, y registro manual de pagos.
 */

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Loader2,
  Save,
  X,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAction } from "@/hooks/useAdminAction";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type AccessLevel = Database["public"]["Enums"]["access_level"];

interface PaymentRow {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  external_id: string | null;
  status: string;
  access_level_granted: AccessLevel | null;
  period_start: string | null;
  period_end: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined from profiles
  user_name?: string;
  user_empresa?: string;
  user_email?: string;
}

interface PaymentStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalRevenue: number;
  monthRevenue: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: "Pagado", color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" },
  pending: { label: "Pendiente", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
  failed: { label: "Fallido", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" },
  refunded: { label: "Reembolsado", color: "text-muted-foreground", bg: "bg-muted/50 border-border" },
};

const LEVEL_LABELS: Record<AccessLevel, string> = {
  N0: "Gratis",
  N1: "Básico",
  N2: "Premium",
  ADMIN: "Admin",
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: currency || "ARS" }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
};

const fetchPaymentsWithUsers = async (): Promise<PaymentRow[]> => {
  const { data: payments, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  if (!payments || payments.length === 0) return [];

  // Get unique user_ids
  const userIds = [...new Set(payments.map((p) => p.user_id))];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, nombre, apellido, empresa, email")
    .in("user_id", userIds);

  const profileMap = new Map<string, { name: string; empresa: string; email: string }>();
  (profiles ?? []).forEach((p) => {
    const name = [p.nombre, p.apellido].filter(Boolean).join(" ") || p.email || "Sin nombre";
    profileMap.set(p.user_id, { name, empresa: p.empresa || "", email: p.email || "" });
  });

  return payments.map((p) => {
    const profile = profileMap.get(p.user_id);
    return {
      ...p,
      user_name: profile?.name,
      user_empresa: profile?.empresa,
      user_email: profile?.email,
    };
  });
};

const AdminCobranza = () => {
  const { toast } = useToast();
  const { execute: adminAction, loading: adminLoading } = useAdminAction();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // New payment form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    userSearch: "",
    selectedUserId: "",
    amount: "",
    currency: "ARS",
    payment_method: "",
    access_level_granted: "N1" as AccessLevel,
    period_start: "",
    period_end: "",
    notes: "",
  });
  const [userResults, setUserResults] = useState<{ user_id: string; name: string; email: string }[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPaymentsWithUsers();
      setPayments(data);
    } catch (err) {
      console.error("[AdminCobranza]", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Stats
  const stats: PaymentStats = {
    total: payments.length,
    completed: payments.filter((p) => p.status === "completed").length,
    pending: payments.filter((p) => p.status === "pending").length,
    failed: payments.filter((p) => p.status === "failed").length,
    totalRevenue: payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0),
    monthRevenue: payments
      .filter((p) => {
        if (p.status !== "completed") return false;
        const d = new Date(p.created_at);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + p.amount, 0),
  };

  // Filter
  const filtered = payments.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (p.user_name || "").toLowerCase().includes(q) ||
        (p.user_email || "").toLowerCase().includes(q) ||
        (p.user_empresa || "").toLowerCase().includes(q) ||
        (p.external_id || "").toLowerCase().includes(q) ||
        (p.notes || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Search users for new payment
  const handleUserSearch = async (query: string) => {
    setForm((f) => ({ ...f, userSearch: query, selectedUserId: "" }));
    if (query.length < 2) {
      setUserResults([]);
      return;
    }
    setSearchingUsers(true);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, nombre, apellido, email")
      .or(`nombre.ilike.%${query}%,apellido.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(5);
    setUserResults(
      (data ?? []).map((u) => ({
        user_id: u.user_id,
        name: [u.nombre, u.apellido].filter(Boolean).join(" ") || u.email || "Sin nombre",
        email: u.email || "",
      }))
    );
    setSearchingUsers(false);
  };

  const handleSavePayment = async () => {
    if (!form.selectedUserId || !form.amount || saving) return;
    setSaving(true);

    try {
      await adminAction("register-payment", {
        user_id: form.selectedUserId,
        amount: parseFloat(form.amount),
        currency: form.currency,
        payment_method: form.payment_method || null,
        access_level_granted: form.access_level_granted,
        period_start: form.period_start || null,
        period_end: form.period_end || null,
        notes: form.notes || null,
      });
      toast({ title: "Pago registrado" });
      setShowForm(false);
      setForm({
        userSearch: "", selectedUserId: "", amount: "", currency: "ARS",
        payment_method: "", access_level_granted: "N1", period_start: "", period_end: "", notes: "",
      });
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
          label="Ingresos totales"
          value={formatCurrency(stats.totalRevenue, "ARS")}
          bg="bg-emerald-50 dark:bg-emerald-950/30"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
          label="Este mes"
          value={formatCurrency(stats.monthRevenue, "ARS")}
          bg="bg-blue-50 dark:bg-blue-950/30"
        />
        <StatCard
          icon={<CheckCircle className="w-4 h-4 text-green-600" />}
          label="Pagos OK"
          value={String(stats.completed)}
          bg="bg-green-50 dark:bg-green-950/30"
        />
        <StatCard
          icon={<Clock className="w-4 h-4 text-amber-600" />}
          label="Pendientes"
          value={String(stats.pending)}
          bg="bg-amber-50 dark:bg-amber-950/30"
        />
      </div>

      {/* ── Header + Actions ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-foreground">
          Pagos <span className="text-muted-foreground font-normal text-sm">({payments.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 w-44 text-xs"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="completed">Pagados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="failed">Fallidos</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8 text-xs gap-1" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-3.5 h-3.5" />
            Registrar
          </Button>
        </div>
      </div>

      {/* ── New payment form ── */}
      {showForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              Registrar pago manual
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowForm(false)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* User search */}
            <div className="space-y-1.5">
              <Label className="text-xs">Usuario</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={form.userSearch}
                  onChange={(e) => handleUserSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
                {searchingUsers && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
              </div>
              {userResults.length > 0 && (
                <div className="border rounded-lg divide-y">
                  {userResults.map((u) => (
                    <button
                      key={u.user_id}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors",
                        form.selectedUserId === u.user_id && "bg-primary/5"
                      )}
                      onClick={() => {
                        setForm((f) => ({ ...f, selectedUserId: u.user_id, userSearch: u.name }));
                        setUserResults([]);
                      }}
                    >
                      <span className="font-medium">{u.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{u.email}</span>
                    </button>
                  ))}
                </div>
              )}
              {form.selectedUserId && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Usuario seleccionado
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Monto</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="h-9 text-sm"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Moneda</Label>
                <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARS">ARS</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Método</Label>
                <Select value={form.payment_method} onValueChange={(v) => setForm((f) => ({ ...f, payment_method: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mercadopago">MercadoPago</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tiendup">Tiendup</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nivel otorgado</Label>
                <Select value={form.access_level_granted} onValueChange={(v) => setForm((f) => ({ ...f, access_level_granted: v as AccessLevel }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N1">N1 — Básico</SelectItem>
                    <SelectItem value="N2">N2 — Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Inicio período</Label>
                <Input
                  type="date"
                  value={form.period_start}
                  onChange={(e) => setForm((f) => ({ ...f, period_start: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Fin período</Label>
                <Input
                  type="date"
                  value={form.period_end}
                  onChange={(e) => setForm((f) => ({ ...f, period_end: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Notas</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="h-9 text-sm"
                placeholder="Observaciones..."
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={handleSavePayment}
                disabled={!form.selectedUserId || !form.amount || saving}
                className="gap-1.5"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Registrar pago
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Desktop table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pr-3 font-medium">Usuario</th>
              <th className="pb-2 pr-3 font-medium">Monto</th>
              <th className="pb-2 pr-3 font-medium">Método</th>
              <th className="pb-2 pr-3 font-medium">Nivel</th>
              <th className="pb-2 pr-3 font-medium">Estado</th>
              <th className="pb-2 pr-3 font-medium">Período</th>
              <th className="pb-2 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const status = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
              return (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 pr-3">
                    <div>
                      <p className="font-medium text-foreground">{p.user_name || "—"}</p>
                      <p className="text-muted-foreground">{p.user_empresa || p.user_email || ""}</p>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 font-semibold text-foreground">
                    {formatCurrency(p.amount, p.currency)}
                  </td>
                  <td className="py-2.5 pr-3 text-muted-foreground capitalize">
                    {p.payment_method || "—"}
                  </td>
                  <td className="py-2.5 pr-3">
                    {p.access_level_granted && (
                      <Badge variant="outline" className="text-[10px]">
                        {LEVEL_LABELS[p.access_level_granted]}
                      </Badge>
                    )}
                  </td>
                  <td className="py-2.5 pr-3">
                    <Badge variant="outline" className={cn("text-[10px]", status.color, status.bg)}>
                      {status.label}
                    </Badge>
                  </td>
                  <td className="py-2.5 pr-3 text-muted-foreground">
                    {p.period_start && p.period_end
                      ? `${formatDate(p.period_start)} — ${formatDate(p.period_end)}`
                      : "—"}
                  </td>
                  <td className="py-2.5 text-muted-foreground">
                    {formatDate(p.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-2">
        {filtered.map((p) => {
          const status = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
          const isExpanded = expandedId === p.id;

          return (
            <Card key={p.id}>
              <CardContent className="p-3">
                <button
                  className="w-full flex items-center gap-3 text-left"
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {p.user_name || "Sin nombre"}
                      </span>
                      <Badge variant="outline" className={cn("text-[10px]", status.color, status.bg)}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(p.amount, p.currency)} · {formatDate(p.created_at)}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                      <span className="text-muted-foreground">Empresa:</span>
                      <span className="font-medium">{p.user_empresa || "—"}</span>
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium truncate">{p.user_email || "—"}</span>
                      <span className="text-muted-foreground">Método:</span>
                      <span className="font-medium capitalize">{p.payment_method || "—"}</span>
                      <span className="text-muted-foreground">Nivel:</span>
                      <span className="font-medium">{p.access_level_granted ? LEVEL_LABELS[p.access_level_granted] : "—"}</span>
                      <span className="text-muted-foreground">ID externo:</span>
                      <span className="font-medium truncate">{p.external_id || "—"}</span>
                      {p.period_start && (
                        <>
                          <span className="text-muted-foreground">Período:</span>
                          <span className="font-medium">{formatDate(p.period_start)} — {formatDate(p.period_end || "")}</span>
                        </>
                      )}
                      {p.notes && (
                        <>
                          <span className="text-muted-foreground">Notas:</span>
                          <span className="font-medium">{p.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <CreditCard className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          {search || statusFilter !== "all" ? "No se encontraron pagos con ese criterio." : "No hay pagos registrados."}
        </div>
      )}
    </div>
  );
};

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <Card>
      <CardContent className={cn("p-3 flex items-center gap-3", bg)}>
        <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-white/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminCobranza;
