import { defineConfig } from 'astro/config';
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
});