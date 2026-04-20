/**
 * AI Service — Rotación automática entre APIs gratuitas
 *
 * Proveedores soportados (todos con tier gratuito):
 * 1. Google Gemini — 15 req/min gratis en AI Studio
 * 2. DeepSeek V3 — Gratis vía OpenRouter (límite diario)
 * 3. Groq (Llama 3.3 70B) — Gratis, muy rápido
 *
 * Las API keys se guardan ofuscadas en localStorage del navegador.
 * El servicio rota automáticamente entre proveedores disponibles.
 * Si uno falla (rate limit, error), pasa al siguiente.
 */

export type AIProvider = "gemini" | "deepseek" | "groq";

export interface AIProviderConfig {
  name: AIProvider;
  label: string;
  getKey: () => string | null;
  setKey: (key: string) => void;
  endpoint: string;
  buildRequest: (systemPrompt: string, userPrompt: string) => { url: string; headers: Record<string, string>; body: unknown };
  parseResponse: (data: unknown) => string;
  signupUrl: string;
  description: string;
}

// ============================================================
// Key obfuscation — prevents casual XSS extraction
// Not cryptographically secure, but raises the bar significantly
// ============================================================
const OBFUSCATION_SHIFT = 7;

function obfuscateKey(key: string): string {
  return btoa(key.split("").map((c, i) => 
    String.fromCharCode(c.charCodeAt(0) ^ ((i % 256) + OBFUSCATION_SHIFT))
  ).join(""));
}

function deobfuscateKey(encoded: string): string {
  try {
    const decoded = atob(encoded);
    return decoded.split("").map((c, i) => 
      String.fromCharCode(c.charCodeAt(0) ^ ((i % 256) + OBFUSCATION_SHIFT))
    ).join("");
  } catch {
    return "";
  }
}

function getStoredKey(storageKey: string): string | null {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;
  // Support both old plain-text keys and new obfuscated keys
  if (raw.startsWith("obf:")) {
    return deobfuscateKey(raw.slice(4));
  }
  // Auto-migrate plain text keys to obfuscated
  try {
    localStorage.setItem(storageKey, "obf:" + obfuscateKey(raw));
  } catch {}
  return raw;
}

function setStoredKey(storageKey: string, key: string): void {
  localStorage.setItem(storageKey, "obf:" + obfuscateKey(key));
}

// ============================================================
// Provider configurations
// ============================================================

const providers: AIProviderConfig[] = [
  {
    name: "gemini",
    label: "Google Gemini (Gratis)",
    getKey: () => getStoredKey("ai_key_gemini"),
    setKey: (key) => setStoredKey("ai_key_gemini", key),
    endpoint: "generativelanguage.googleapis.com",
    signupUrl: "https://aistudio.google.com/apikey",
    description: "15 req/min gratis. El más generoso.",
    buildRequest: (systemPrompt, userPrompt) => {
      const key = getStoredKey("ai_key_gemini") || "";
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        headers: { "Content-Type": "application/json" },
        body: {
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        },
      };
    },
    parseResponse: (data) => {
      const d = data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      return d.candidates?.[0]?.content?.parts?.[0]?.text || "";
    },
  },
  {
    name: "deepseek",
    label: "DeepSeek V3 vía OpenRouter (Gratis)",
    getKey: () => getStoredKey("ai_key_openrouter"),
    setKey: (key) => setStoredKey("ai_key_openrouter", key),
    endpoint: "openrouter.ai",
    signupUrl: "https://openrouter.ai/settings/keys",
    description: "DeepSeek V3 gratis. El mejor para código y textos largos.",
    buildRequest: (systemPrompt, userPrompt) => {
      const key = getStoredKey("ai_key_openrouter") || "";
      return {
        url: "https://openrouter.ai/api/v1/chat/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: {
          model: "deepseek/deepseek-chat-v3-0324:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        },
      };
    },
    parseResponse: (data) => {
      const d = data as { choices?: Array<{ message?: { content?: string } }> };
      return d.choices?.[0]?.message?.content || "";
    },
  },
  {
    name: "groq",
    label: "Groq Llama 3.3 70B (Gratis)",
    getKey: () => getStoredKey("ai_key_groq"),
    setKey: (key) => setStoredKey("ai_key_groq", key),
    endpoint: "groq.com",
    signupUrl: "https://console.groq.com/keys",
    description: "Llama 3.3 70B gratis. Ultra rápido.",
    buildRequest: (systemPrompt, userPrompt) => {
      const key = getStoredKey("ai_key_groq") || "";
      return {
        url: "https://api.groq.com/openai/v1/chat/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        },
      };
    },
    parseResponse: (data) => {
      const d = data as { choices?: Array<{ message?: { content?: string } }> };
      return d.choices?.[0]?.message?.content || "";
    },
  },
];

// ============================================================
// Public API
// ============================================================

export const aiService = {
  /** Get all provider configs */
  getProviders: () => providers,

  /** Check which providers have keys configured */
  getConfiguredProviders: (): AIProviderConfig[] => {
    return providers.filter((p) => !!p.getKey());
  },

  /** Get the last used provider (for preference) */
  getLastProvider: (): AIProvider | null => {
    return localStorage.getItem("ai_last_provider") as AIProvider | null;
  },

  /** Call AI with automatic rotation between providers */
  async chat(systemPrompt: string, userPrompt: string): Promise<{ content: string; provider: AIProvider }> {
    const configured = this.getConfiguredProviders();
    if (configured.length === 0) {
      throw new Error("No hay proveedores de IA configurados. Andá a Admin → IA y cargá al menos una API key.");
    }

    // Start with last used provider, then rotate
    const lastProvider = this.getLastProvider();
    const ordered = lastProvider
      ? [...configured].sort((a, b) => (a.name === lastProvider ? -1 : b.name === lastProvider ? 1 : 0))
      : configured;

    let lastError: Error | null = null;

    for (const provider of ordered) {
      try {
        const { url, headers, body } = provider.buildRequest(systemPrompt, userPrompt);

        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errorText = await res.text().catch(() => "");
          // Rate limit or quota exceeded — try next provider
          if (res.status === 429 || res.status === 402 || res.status === 403) {
            console.warn(`[AI] ${provider.name}: ${res.status} — rotating to next`);
            lastError = new Error(`${provider.label}: ${res.status} ${errorText}`);
            continue;
          }
          throw new Error(`${provider.label}: ${res.status} ${errorText}`);
        }

        const data = await res.json();
        const content = provider.parseResponse(data);

        if (!content) {
          console.warn(`[AI] ${provider.name}: empty response — rotating`);
          lastError = new Error(`${provider.label}: respuesta vacía`);
          continue;
        }

        // Success — remember this provider
        localStorage.setItem("ai_last_provider", provider.name);
        return { content, provider: provider.name };
      } catch (err) {
        console.warn(`[AI] ${provider.name} failed:`, err);
        lastError = err instanceof Error ? err : new Error(String(err));
        continue; // Try next provider
      }
    }

    throw lastError || new Error("Todos los proveedores de IA fallaron.");
  },
};
