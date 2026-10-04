import type { APIRoute } from 'astro';
import { sharingImage } from '../lib/images';
export const GET: APIRoute = () => new Response(new Uint8Array(sharingImage()).buffer, { headers: { 'Content-Type': 'image/png' } });
