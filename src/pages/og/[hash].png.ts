import type { APIRoute, GetStaticPaths } from 'astro';
import { sharingImage, sharingHash } from '../../lib/images';

// Keep /og.png as a compatibility alias; metadata uses immutable content URLs.
export const getStaticPaths: GetStaticPaths = () => [{ params: { hash: sharingHash() } }];
export const GET: APIRoute = () => new Response(new Uint8Array(sharingImage()).buffer, { headers: { 'Content-Type': 'image/png' } });
