const RATE_LIMIT_WINDOW_SEC = Number(
    import.meta.env.RATE_LIMIT_WINDOW_SEC ?? 45
);
const RATE_LIMIT_MAX = Number(import.meta.env.RATE_LIMIT_MAX ?? 3);

// Upstash REST endpoint & token (set these in Netlify environment)
const UPSTASH_REST_URL = import.meta.env.UPSTASH_REST_URL; // e.g. https://us1-***.upstash.io
const UPSTASH_REST_TOKEN = import.meta.env.UPSTASH_REST_TOKEN; // REST token

const ALLOWED_ORIGINS = (import.meta.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

if (!ALLOWED_ORIGINS) {
    throw new Error("ALLOWED_ORIGINS is not set");
}

async function upstashIncr(key: string) {
    if (!UPSTASH_REST_URL || !UPSTASH_REST_TOKEN)
        throw new Error("Missing Upstash credentials");

    const url = `${UPSTASH_REST_URL.replace(
        /\/$/,
        ""
    )}/incr/${encodeURIComponent(key)}?_token=${encodeURIComponent(
        UPSTASH_REST_TOKEN
    )}`;

    const res = await fetch(url, { method: "POST" });
    if (!res.ok) throw new Error("Upstash INCR failed");
    const json = await res.json();
    return json.result as number;
}

async function upstashExpire(key: string, seconds: number) {
    const url = `${UPSTASH_REST_URL.replace(
        /\/$/,
        ""
    )}/expire/${encodeURIComponent(key)}/${seconds}?_token=${encodeURIComponent(
        UPSTASH_REST_TOKEN
    )}`;

    const res = await fetch(url, { method: "POST" });
    if (!res.ok) throw new Error("Upstash EXPIRE failed");
    const json = await res.json();
    return json.result;
}

export async function checkRateLimit(ip: string) {
    const key = `rl:booking:${ip}`;
    const count = await upstashIncr(key);
    if (count === 1) {
        try {
            await upstashExpire(key, RATE_LIMIT_WINDOW_SEC);
        } catch (err) {
            console.warn("Upstash EXPIRE failed", err);
        }
    }

    const exceeded = count > RATE_LIMIT_MAX;
    return {
        exceeded,
        count,
        remaining: Math.max(0, RATE_LIMIT_MAX - count),
        resetIn: RATE_LIMIT_WINDOW_SEC,
    };
}
