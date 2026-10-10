// A plain in-memory limiter, keyed by whatever the caller passes in (e.g.
// client IP). This is intentionally the simple option, not the strong one:
// it lives in the Node process's memory, so it resets on every cold start
// and isn't shared across concurrent serverless instances. On a platform
// like Vercel that can mean an attacker effectively gets a fresh set of
// attempts per instance. It still meaningfully raises the cost of a casual
// automated brute-force/credential-stuffing run against a single warm
// instance, which is what it's for -- it is not a substitute for a durable,
// shared limiter (e.g. Redis-backed) if that threat model matters more than
// "free and simple."
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

// Crude safeguard against unbounded memory growth if something hammers this
// from a flood of distinct keys (e.g. spoofed/rotating IPs) -- not a real
// defense against that, just a ceiling so this map can't grow forever.
const MAX_TRACKED_KEYS = 10_000;

type Attempt = {
  count: number;
  windowStart: number;
  lockedUntil: number | null;
};

const attempts = new Map<string, Attempt>();

export function isLockedOut(key: string): boolean {
  const entry = attempts.get(key);
  return !!entry?.lockedUntil && Date.now() < entry.lockedUntil;
}

export function msUntilUnlocked(key: string): number {
  const entry = attempts.get(key);
  if (!entry?.lockedUntil) return 0;
  return Math.max(0, entry.lockedUntil - Date.now());
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: now, lockedUntil: null });
    return;
  }

  const count = entry.count + 1;
  attempts.set(key, {
    count,
    windowStart: entry.windowStart,
    lockedUntil: count >= MAX_ATTEMPTS ? now + LOCKOUT_MS : null,
  });

  if (attempts.size > MAX_TRACKED_KEYS) {
    attempts.clear();
  }
}

export function clearAttempts(key: string): void {
  attempts.delete(key);
}
