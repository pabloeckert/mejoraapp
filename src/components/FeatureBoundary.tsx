/**
 * FeatureBoundary — Granular error boundary for individual app features.
 *
 * Use this to isolate Muro, Mentor, Mirror, etc. so a crash in one tab
 * doesn't take down the entire app. Unlike ErrorBoundary (full-screen),
 * this renders a compact inline fallback inside the feature's space.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureError } from "@/lib/sentry";

interface Props {
  children: ReactNode;
  /** Feature name for logging (e.g. "Muro", "Mentor", "Mirror") */
  feature: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class FeatureBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error, { componentStack: info.componentStack, source: `FeatureBoundary:${this.props.feature}` });
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground text-sm">
            {this.props.feature} encontró un error
          </p>
          <p className="text-xs text-muted-foreground max-w-[260px]">
            El resto de la app sigue funcionando. Podés reintentar o ir a otra sección.
          </p>
        </div>
        {this.state.error && (
          <p className="text-xs font-mono text-muted-foreground/60 max-w-[280px] break-all">
            {this.state.error.message}
          </p>
        )}
        <Button size="sm" variant="outline" onClick={this.handleReset} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Reintentar
        </Button>
      </div>
    );
  }
}
