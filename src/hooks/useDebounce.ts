/**
 * useDebounce — Hook para debounce de valores
 *
 * Útil para búsquedas, inputs de texto, y cualquier valor que cambia frecuentemente.
 *
 * Uso:
 *   const debouncedQuery = useDebounce(searchQuery, 300);
 */

import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
