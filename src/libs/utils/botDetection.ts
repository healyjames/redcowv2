import { ALLOWED_ORIGINS as ALLOWED_ORIGINS_ENV } from "astro:env/server";

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

const allowedOrigins = ALLOWED_ORIGINS_ENV.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export function isOriginAllowed(origin?: string | null) {
    if (!origin) return false;
    return allowedOrigins.includes(origin);
}
