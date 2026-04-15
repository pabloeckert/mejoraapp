import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ContenidoDeValor = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-foreground">Contenido de Valor</h1>
        <p className="text-sm text-muted-foreground">
          Artículos, tips y estrategias para hacer crecer tu negocio.
        </p>
      </div>

      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-mc-dark-blue" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Próximamente</h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Contenido generado por IA, alineado con tu perfil y tus desafíos de negocio.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContenidoDeValor;
