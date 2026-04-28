import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Users, TrendingUp, DollarSign, Clock, ShoppingCart, Target } from "lucide-react";
import { useMemo } from "react";
import { format, isBefore, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { useCRMDashboard, useCRMSellerRanking } from "@/hooks/useCRM";
import { SkeletonKPI, SkeletonChart } from "@/components/ui/skeleton-variants";

const RESULT_LABELS: Record<string, string> = {
  presupuesto: "Presupuesto", venta: "Venta", seguimiento: "Seguimiento",
  sin_respuesta: "Sin respuesta", no_interesado: "No interesado",
};
const COLORS = ["hsl(214,58%,41%)", "hsl(45,74%,60%)", "hsl(142,60%,40%)", "hsl(2,52%,53%)", "hsl(280,40%,50%)"];

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

export default function CRMDashboard() {
  const { data, isLoading } = useCRMDashboard();
  const { data: ranking = [] } = useCRMSellerRanking();

  if (isLoading) return (
    <div className="space-y-4">
      <SkeletonKPI count={6} />
      <div className="grid md:grid-cols-2 gap-4"><SkeletonChart /><SkeletonChart /></div>
    </div>
  );
  if (!data) return null;

  const { stats, interactions = [], clients = [] } = data;

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

  const distribucionResultados = useMemo(() => {
    const counts: Record<string, number> = {};
    (interactions ?? []).forEach((i: any) => { counts[i.result] = (counts[i.result] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: RESULT_LABELS[name] || name, value }));
  }, [interactions]);

  const followupsPendientes = useMemo(() => {
    return (interactions ?? []).filter((i: any) => {
      if (!i.follow_up_date || i.result !== "seguimiento") return false;
      return isBefore(new Date(i.follow_up_date), new Date()) || differenceInDays(new Date(i.follow_up_date), new Date()) <= 3;
    }).slice(0, 5);
  }, [interactions]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard icon={Users} label="Clientes" value={stats.total_clients} />
        <KPICard icon={Target} label="Activos" value={stats.active_clients} />
        <KPICard icon={ShoppingCart} label="Ventas (mes)" value={stats.total_ventas} />
        <KPICard icon={DollarSign} label="Ingresos" value={`$${(stats.total_ingresos ?? 0).toLocaleString("es-AR")}`} />
        <KPICard icon={TrendingUp} label="Pipeline" value={`$${(stats.pipeline ?? 0).toLocaleString("es-AR")}`} />
        <KPICard icon={Clock} label="Follow-ups" value={stats.followups_pendientes} highlight={(stats.followups_pendientes ?? 0) > 0} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-subtitle">Ventas por mes</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ventasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RTooltip />
                <Bar dataKey="ventas" fill="hsl(214,58%,41%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
