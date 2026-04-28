import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CRMDashboard, CRMClientsTab, CRMInteractionsTab, CRMProductsTab } from "./crm";

/**
 * AdminCRM — Gestión Comercial
 *
 * Componente principal que orquesta las 4 pestañas del CRM:
 * - Dashboard (KPIs, charts, ranking)
 * - Clientes (CRUD, filtros, detalle)
 * - Interacciones (registro, seguimiento)
 * - Productos (catálogo)
 *
 * Cada tab está en su propio archivo en ./crm/
 */
export default function AdminCRM() {
  const [tab, setTab] = useState("dashboard");

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
