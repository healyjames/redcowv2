import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    vite: {
        plugins: [],
    },
    site: "https://example.com",
    integrations: [react(), sitemap()],
});