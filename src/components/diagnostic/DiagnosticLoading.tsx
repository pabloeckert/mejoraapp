/** DiagnosticLoading — Loading spinner while processing diagnostic results */

export const DiagnosticLoading = () => (
  <div className="max-w-xl mx-auto text-center py-16 animate-fade-in">
    <div className="w-12 h-12 border-3 border-mc-diag-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
    <h2 className="text-title font-extrabold text-mc-diag-blue mb-2">Analizando tu negocio…</h2>
    <p className="text-sm text-muted-foreground">
      Procesando tus respuestas y generando tu Mirror personalizado.
    </p>
  </div>
);
