import { defineConfig, envField } from "astro/config";
import netlify from "@astrojs/netlify";
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

    site: "https://example.com",
    integrations: [react(), sitemap()],
    output: "static",
    adapter: netlify(),

    env: {
        schema: {
            // Server
            RESEND_API_KEY: envField.string({
                context: "server",
                access: "secret",
            }),
            ALLOWED_ORIGINS: envField.string({
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