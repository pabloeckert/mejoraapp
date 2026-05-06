/**
 * Route-level Error Boundary — Catches errors per route segment
 *
 * Wraps lazy-loaded routes so an error in one doesn't crash the whole app.
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureError } from "@/lib/sentry";

interface Props {
  children: ReactNode;
  routeName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[RouteErrorBoundary:${this.props.routeName}]`, error, errorInfo);
    captureError(error, {
      componentStack: errorInfo.componentStack,
      source: `RouteErrorBoundary:${this.props.routeName}`,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">Error en esta sección</h2>
              <p className="text-sm text-muted-foreground">
                {this.state.error?.message || "Ocurrió un error inesperado."}
              </p>
            </div>
            <Button variant="outline" onClick={this.handleRetry} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
