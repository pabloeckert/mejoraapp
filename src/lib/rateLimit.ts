/**
 * Rate Limiter — Client-side rate limiting for form submissions
 *
 * Prevents spam and abuse on client-side operations.
 * Uses sliding window algorithm with localStorage persistence.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const STORAGE_PREFIX = "mc_rl_";

/**
 * Check if an action is rate-limited.
 * @param action - Unique action identifier (e.g., "post_wall", "comment")
 * @param maxAttempts - Maximum attempts allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate-limited
 */
export function checkRateLimit(
  action: string,
  maxAttempts: number,
  windowMs: number
): boolean {
  const key = `${STORAGE_PREFIX}${action}`;
  const now = Date.now();

  try {
    const raw = localStorage.getItem(key);
    const entry: RateLimitEntry = raw ? JSON.parse(raw) : { timestamps: [] };

    // Clean old timestamps outside the window
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

    if (entry.timestamps.length >= maxAttempts) {
      return false; // Rate limited
    }

    // Record this attempt
    entry.timestamps.push(now);
    localStorage.setItem(key, JSON.stringify(entry));
    return true;
  } catch {
    // If localStorage fails, allow the action (fail-open for UX)
    return true;
  }
}

/**
 * Get remaining attempts for an action.
 */
export function getRemainingAttempts(
  action: string,
  maxAttempts: number,
  windowMs: number
): number {
  const key = `${STORAGE_PREFIX}${action}`;
  const now = Date.now();

  try {
    const raw = localStorage.getItem(key);
    const entry: RateLimitEntry = raw ? JSON.parse(raw) : { timestamps: [] };
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);
    return Math.max(0, maxAttempts - entry.timestamps.length);
  } catch {
    return maxAttempts;
  }
}

// ── Pre-defined rate limits ────────────────────────────────────

export const RATE_LIMITS = {
  wall_post: { max: 5, windowMs: 60_000 },        // 5 posts per minute
  wall_comment: { max: 10, windowMs: 60_000 },    // 10 comments per minute
  wall_like: { max: 30, windowMs: 60_000 },       // 30 likes per minute
  report: { max: 3, windowMs: 300_000 },           // 3 reports per 5 minutes
  profile_edit: { max: 10, windowMs: 300_000 },    // 10 edits per 5 minutes
  diagnostic: { max: 5, windowMs: 3_600_000 },     // 5 diagnostics per hour
  mentor_message: { max: 30, windowMs: 60_000 },   // 30 messages per minute
} as const;

export type RateLimitAction = keyof typeof RATE_LIMITS;

/**
 * Check rate limit using pre-defined limits.
 */
export function isAllowed(action: RateLimitAction): boolean {
  const limit = RATE_LIMITS[action];
  return checkRateLimit(action, limit.max, limit.windowMs);
}
