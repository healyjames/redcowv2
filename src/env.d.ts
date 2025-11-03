/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly DEV: boolean;
    readonly RESEND_API_KEY: string;
    readonly RATE_LIMIT_WINDOW_SEC: string;
    readonly RATE_LIMIT_MAX: string;
    readonly ALLOWED_ORIGINS: string;
    readonly BLOCKED_UA: string;
    readonly UPSTASH_REST_URL: string;
    readonly UPSTASH_REST_TOKEN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
