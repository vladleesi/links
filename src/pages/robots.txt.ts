import type { APIRoute } from 'astro';
import { config } from '../lib/config';
export const GET: APIRoute = () => new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml', config.site.url)}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
