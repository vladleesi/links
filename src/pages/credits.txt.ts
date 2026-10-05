import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = () => {
  const files = ['THIRD_PARTY_NOTICES.md', 'src/assets/icons/sources.json', 'public/fonts/sources.json', 'public/fonts/OFL.txt', 'public/fonts/OFL-OpenSans.txt', 'public/fonts/OFL-SourceSans3.txt', 'public/fonts/OFL-Lora.txt', 'public/fonts/OFL-IBMPlexSans.txt', 'public/fonts/OFL-JetBrainsMono.txt', 'public/fonts/OFL-SpaceGrotesk.txt', 'public/fonts/OFL-Archivo.txt', 'src/assets/icons/simple-icons.txt', 'src/assets/icons/font-awesome.txt', 'src/assets/icons/lucide.txt'];
  const notices = files.map(file => `\n--- ${file} ---\n\n${readFileSync(resolve(file), 'utf8')}`).join('\n');
  return new Response(`Third-party asset credits and licenses\n${notices}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
