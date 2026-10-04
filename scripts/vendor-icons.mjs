import { writeFile } from 'node:fs/promises';

// Maintenance only. Normal builds never call this script or the network.
const simpleRevision = '9f1c11219a45e1440271e98a143490594a4aba6d';
const awesomeRevision = '14c65a3747d0f3b751f15831fc719236aea8729d';
const icons = ['github', 'gitlab', 'bitbucket', 'stackoverflow', 'npm', 'docker', 'codepen', 'devdotto', 'hackerrank', 'leetcode', 'linkedin', 'x', 'instagram', 'facebook', 'threads', 'bluesky', 'mastodon', 'reddit', 'tumblr', 'telegram', 'whatsapp', 'discord', 'slack', 'youtube', 'twitch', 'tiktok', 'vimeo', 'spotify', 'soundcloud', 'applemusic', 'bandcamp', 'behance', 'dribbble', 'artstation', 'pinterest', 'medium', 'substack', 'patreon', 'kofi', 'buymeacoffee'];
const alternatives = { linkedin: 'linkedin-in', facebook: 'facebook-f', instagram: 'instagram', whatsapp: 'whatsapp', stackoverflow: 'stack-overflow', devdotto: 'dev', x: 'x-twitter', vimeo: 'vimeo-v', applemusic: 'apple' };
const sources = {};
let position = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (position < icons.length) {
    const icon = icons[position++];
    let source = `https://raw.githubusercontent.com/simple-icons/simple-icons/${simpleRevision}/icons/${icon}.svg`;
    let response = await fetch(source);
    let license = 'CC0-1.0 (Simple Icons)';
    if (!response.ok) {
      source = `https://raw.githubusercontent.com/FortAwesome/Font-Awesome/${awesomeRevision}/svgs/brands/${alternatives[icon] || icon}.svg`;
      response = await fetch(source);
      license = 'CC-BY-4.0 (Font Awesome Free)';
    }
    if (!response.ok) throw new Error(`Icon ${icon}: ${response.status} from ${source}`);
    const svg = await response.text();
    if (!svg.includes('<svg')) throw new Error(`Invalid SVG: ${icon}`);
    await writeFile(`src/assets/icons/${icon}.svg`, svg);
    sources[icon] = { source, license };
  }
}));
for (const [name, source] of Object.entries({ 'simple-icons.txt': `https://raw.githubusercontent.com/simple-icons/simple-icons/${simpleRevision}/LICENSE.md`, 'font-awesome.txt': `https://raw.githubusercontent.com/FortAwesome/Font-Awesome/${awesomeRevision}/LICENSE.txt`, 'lucide.txt': 'https://raw.githubusercontent.com/lucide-icons/lucide/main/LICENSE' })) {
  const response = await fetch(source);
  if (!response.ok) throw new Error(`License ${name}: ${response.status}`);
  await writeFile(`src/assets/icons/${name}`, await response.text());
}
await writeFile('src/assets/icons/sources.json', JSON.stringify(Object.fromEntries(Object.entries(sources).sort()), null, 2) + '\n');
console.log(`Vendored ${icons.length} brand icons and upstream licenses.`);
