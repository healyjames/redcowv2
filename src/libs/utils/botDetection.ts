const BLOCKED_UA_LIST = [
    "GPTBot",
    "GPT-4o",
    "OpenAI",
    "OAI-SearchBot",
    "Perplexity",
    "PerplexityBot",
    "Claude",
    "Anthropic",
    "BingPreview",
    "CCBot",
    "facebookexternalhit",
    "SemrushBot",
    "AhrefsBot",
    "MJ12bot",
    "Amazonbot",
];

export function isUserAgentBlocked(ua?: string | null) {
    if (!ua) return false;
    const lower = ua.toLowerCase();
    return BLOCKED_UA_LIST.some((frag) => lower.includes(frag.toLowerCase()));
}

export const ALLOWED_ORIGINS = (import.meta.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

if (!ALLOWED_ORIGINS.length) {
    throw new Error("ALLOWED_ORIGINS not set");
}

export function isOriginAllowed(origin?: string | null) {
    if (!origin) return false;
    return ALLOWED_ORIGINS.includes(origin);
}
