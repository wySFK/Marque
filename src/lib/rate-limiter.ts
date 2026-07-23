/**
 * Simple in-memory rate limiter for auth and sensitive endpoints.
 *
 * ⚠️ In-memory only — resets on server restart. For multi-instance deployments
 * (Cloudflare, etc.), replace this with a durable store like KV or Redis.
 *
 * Usage:
 *   import { checkRateLimit } from "@/lib/rate-limiter";
 *
 *   if (!checkRateLimit("login:user@example.com", 5, 60_000)) {
 *     return new Response("Too many attempts", { status: 429 });
 *   }
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodically sweep expired entries to prevent memory leaks
const SWEEP_INTERVAL = 60_000; // every 60s
let lastSweep = Date.now();

function sweep() {
  const now = Date.now();
  if (now - lastSweep < SWEEP_INTERVAL) return;
  lastSweep = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

/**
 * Check if the given key is within its rate limit.
 *
 * @param key - Unique identifier (e.g. "login:user@example.com" or "auth:IP_ADDRESS")
 * @param maxRequests - Maximum number of requests allowed within the window
 * @param windowMs - Time window in milliseconds
 * @returns `true` if the request is allowed, `false` if rate-limited
 */
export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  sweep();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Get the number of remaining requests for a given key.
 */
export function getRemainingRequests(key: string, maxRequests: number, windowMs: number): number {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    return maxRequests;
  }

  return Math.max(0, maxRequests - entry.count);
}
