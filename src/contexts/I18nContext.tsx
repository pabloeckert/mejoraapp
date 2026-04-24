/**
 * I18nContext — Contexto de internacionalización
 *
 * Provee:
 * - locale: idioma actual
 * - setLocale: cambiar idioma
 * - t(key): función de traducción con fallback
 *
 * Persiste la preferencia en localStorage.
 * Detecta el idioma del navegador en primera visita.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { messages, DEFAULT_LOCALE, type SupportedLocale } from "@/i18n/locales";

const STORAGE_KEY = "mc-locale";

function detectLocale(): SupportedLocale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in messages) return saved as SupportedLocale;
  } catch { /* ignore */ }

  // Detect from browser
  const browserLang = navigator.language?.slice(0, 2)?.toLowerCase();
  if (browserLang in messages) return browserLang as SupportedLocale;

  return DEFAULT_LOCALE;
}

interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(detectLocale);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch { /* ignore */ }
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      return messages[locale]?.[key] || messages[DEFAULT_LOCALE]?.[key] || fallback || key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
