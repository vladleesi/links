import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

await mkdir('public/images', { recursive: true });
await sharp('assets/avatar-source.png').resize(320, 320).webp({ quality: 84 }).toFile('public/images/avatar.webp');
await sharp('assets/avatar-source.png').resize(192, 192).webp({ quality: 84 }).toFile('public/images/avatar-192.webp');
await sharp('assets/social-source.png').resize(1200, 630, { fit: 'cover' }).png({ palette: true }).toFile('public/og.png');
console.log('Optimized avatar and 1200 × 630 sharing image.');
