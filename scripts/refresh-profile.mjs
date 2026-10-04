import sharp from 'sharp';
import { writeFile, rename, rm } from 'node:fs/promises';

// Optional, explicit refresh. Regular builds and browsers use committed assets.
const source = 'https://avatars.githubusercontent.com/u/30999008?v=4&s=320';
const variants = [320, 192].map(size => ({ size, temporary: `public/images/avatar-refresh-${size}.webp`, destination: size === 320 ? 'public/images/avatar.webp' : 'public/images/avatar-192.webp' }));
try {
  const response = await fetch(source, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Avatar response: ${response.status}`);
  const sourceImage = Buffer.from(await response.arrayBuffer());
  const optimized = await Promise.all(variants.map(variant => sharp(sourceImage).resize(variant.size, variant.size).webp({ quality: 84 }).toBuffer()));
  await Promise.all(variants.map((variant, index) => writeFile(variant.temporary, optimized[index])));
  for (const variant of variants) await rename(variant.temporary, variant.destination);
  console.log('GitHub avatar refreshed. Link descriptions are edited in src/data/profile.ts.');
} catch (error) {
  await Promise.all(variants.map(variant => rm(variant.temporary, { force: true })));
  console.error('Refresh failed; existing avatar and all links are preserved.', error.message);
  process.exitCode = 1;
}
