interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW_MS = 45000; // 45 seconds
const RATE_LIMIT_MAX = 3;

function pruneExpired(now: number) {
    rateLimitStore.forEach((entry, key) => {
        if (entry.resetAt < now) {
            rateLimitStore.delete(key);
        }
    });
}

export async function checkRateLimit(ip: string) {
    const key = `rl:booking:${ip}`;
    const now = Date.now();

    pruneExpired(now);

    const existing = rateLimitStore.get(key);
    const entry: RateLimitEntry = existing
        ? { count: existing.count + 1, resetAt: existing.resetAt }
        : { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };

    rateLimitStore.set(key, entry);

    return {
        exceeded: entry.count > RATE_LIMIT_MAX,
        count: entry.count,
        remaining: Math.max(0, RATE_LIMIT_MAX - entry.count),
        resetIn: Math.ceil((entry.resetAt - now) / 1000),
    };
}
