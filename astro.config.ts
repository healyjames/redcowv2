import { defineConfig, envField } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();
const brand = process.env.PUBLIC_BRAND;

export default defineConfig({
    vite: {
        plugins: [],
        resolve: {
            alias: {
                "@": path.resolve("./src"),
                "@brand": path.resolve(`./src/assets/${brand}`),
            },
        },
    },

    site: process.env.PUBLIC_SITE_URL,
    integrations: [react(), sitemap()],
    output: "static",
    adapter: cloudflare(),

    env: {
        schema: {
            // Server
            ALLOWED_ORIGINS: envField.string({
                context: "server",
                access: "secret",
            }),
            EMAIL_FROM_NAME: envField.string({
                context: "server",
                access: "secret",
            }),
            EMAIL_FROM: envField.string({
                context: "server",
                access: "secret",
            }),

            // Client
            PUBLIC_BRAND: envField.string({
                context: "client",
                access: "public",
            }),
            PUBLIC_SITE_URL: envField.string({
                context: "client",
                access: "public",
            }),
        },
    },
});