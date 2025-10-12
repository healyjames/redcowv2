/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly RESEND_API_KEY: string;
    readonly SMTP_HOST?: string;
    readonly SMTP_PORT?: string;
    readonly SMTP_USER?: string;
    readonly SMTP_PASS?: string;
    readonly SENDGRID_API_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
