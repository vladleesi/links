import type { APIRoute } from 'astro';
import { favicon } from '../lib/images';
export const GET: APIRoute = () => new Response(favicon(), { headers: { 'Content-Type': 'image/svg+xml' } });
