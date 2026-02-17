import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL) => `\
User-agent: *
Disallow: /api/
Disallow: /admin/

Crawl-delay: 2
Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
    const sitemapURL = new URL("sitemap-0.xml", site);
    return new Response(getRobotsTxt(sitemapURL));
};
