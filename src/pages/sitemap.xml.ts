import type { APIRoute } from 'astro';
import { config } from '../lib/config';
import { escapeXml } from '../lib/images';
export const GET: APIRoute = () => new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeXml(config.site.url)}</loc></url></urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
