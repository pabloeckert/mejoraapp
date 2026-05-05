/**
 * Security Utilities — Input sanitization and XSS prevention
 *
 * Provides helpers for sanitizing user input before display or storage.
 */

/**
 * Strip all HTML tags from a string.
 * Used as a secondary defense (primary: Zod transforms).
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Escape HTML entities to prevent XSS when rendering user content.
 * Use this when rendering user-generated content outside of React's JSX context
 * (React auto-escapes JSX text content, but not dangerouslySetInnerHTML or href attributes).
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Validate and sanitize a URL.
 * Returns null if the URL is potentially dangerous (javascript:, data:, etc.).
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http(s) and mailto protocols
    if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) {
      return null;
    }
    return parsed.href;
  } catch {
    // Try as relative URL
    if (url.startsWith("/") && !url.startsWith("//")) {
      return url;
    }
    return null;
  }
}

/**
 * Truncate text to a maximum length, adding ellipsis if needed.
 * Preserves word boundaries.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > maxLength * 0.7 ? truncated.slice(0, lastSpace) : truncated) + "…";
}

/**
 * Generate a safe display name from user data.
 * Falls back through: display_name → nombre + apellido → email prefix → "Usuario"
 */
export function getSafeDisplayName(profile: {
  display_name?: string | null;
  nombre?: string | null;
  apellido?: string | null;
} | null, email?: string | null): string {
  if (profile?.display_name?.trim()) return profile.display_name.trim();
  if (profile?.nombre || profile?.apellido) {
    return `${profile.nombre || ""} ${profile.apellido || ""}`.trim();
  }
  if (email) return email.split("@")[0];
  return "Usuario";
}
