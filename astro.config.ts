import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import path from "node:path";

export default defineConfig({
    vite: {
        plugins: [],
        resolve: {
            alias: {
                "@": path.resolve("./src"),
            },
        },
    },
    site: "https://example.com",
    integrations: [react(), sitemap()],
    output: "static",
});