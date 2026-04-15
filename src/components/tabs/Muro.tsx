import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Muro = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-foreground">Muro</h1>
        <p className="text-sm text-muted-foreground">
          Consultá de forma anónima. Sin ventas, sin promos — solo consultas reales.
        </p>
      </div>

      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6 text-mc-dark-blue" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Próximamente</h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Muro anónimo moderado por IA con reglas claras. Solo consultas de negocio.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Muro;
