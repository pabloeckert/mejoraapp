import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    Sentry.captureMessage(`404: ${location.pathname}`, "warning");
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-sm space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <Compass className="w-10 h-10 text-muted-foreground/50" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-display font-extrabold text-foreground">404</h1>
          <p className="text-subtitle text-muted-foreground">
            Esta página se perdió en el camino
          </p>
          <p className="text-body text-muted-foreground/70">
            No encontramos lo que buscás. Puede que el link esté roto o que la página ya no exista.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button className="gap-2">
              <Home className="w-4 h-4" />
              Ir al inicio
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver atrás
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
