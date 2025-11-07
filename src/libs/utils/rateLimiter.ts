interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW_MS = 45000; // 45 seconds
const RATE_LIMIT_MAX = 3;

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt < now) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Clean every minute

export async function checkRateLimit(ip: string) {
    const key = `rl:booking:${ip}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    // If no entry or expired, create new
    if (!entry || entry.resetAt < now) {
        entry = {
            count: 1,
            resetAt: now + RATE_LIMIT_WINDOW_MS,
        };
        rateLimitStore.set(key, entry);
    } else {
        entry.count++;
    }

    const exceeded = entry.count > RATE_LIMIT_MAX;
    const resetIn = Math.ceil((entry.resetAt - now) / 1000);

    return {
        exceeded,
        count: entry.count,
        remaining: Math.max(0, RATE_LIMIT_MAX - entry.count),
        resetIn,
    };
}
