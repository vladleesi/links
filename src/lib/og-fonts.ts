import { readFileSync, existsSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import type { Theme } from './theme';

// Only local fonts are loaded: results must not depend on the build machine.
export function sharingFonts(theme: Theme) {
  const local = (path: string) => {
    if (!/^\/fonts\/[\w./-]+\.(ttf|otf)$/.test(path) || path.split('/').includes('..')) throw new Error('Theme fonts.preview must be a local TTF or OTF font.');
    return resolve('public', `.${path}`);
  };
  const primary = (stack: string) => stack.split(',')[0].trim().replace(/["']/g, '');
  const headingFile = local(theme.fonts.preview || '/fonts/opensans.ttf');
  const names: Record<string, string> = { opensans: 'OG Sans', manrope: 'OG Manrope', 'ibm-plex-sans': 'OG IBM Sans', 'jetbrains-mono': 'OG JetBrains Mono', lora: 'OG Serif', 'space-grotesk': 'OG Space Grotesk', archivo: 'OG Archivo', 'source-sans-3': 'OG Humanist' };
  const family = (file: string, fallback: string) => names[basename(file, '.ttf')] || fallback;
  const heading = family(headingFile, theme.fonts.preview ? primary(theme.fonts.heading) : 'Open Sans');
  const face = theme.fonts.faces?.find(face => face.family === primary(theme.fonts.body));
  const bodyPath = face?.src.replace(/\.woff2?$/, '.ttf');
  const bodyFile = bodyPath && existsSync(local(bodyPath)) ? local(bodyPath) : headingFile;
  const body = family(bodyFile, bodyFile === headingFile ? heading : primary(theme.fonts.body));
  const instance = (file: string, weight: number) => {
    const path = resolve('src/assets/fonts/og', `${basename(file, '.ttf')}-${weight}.ttf`);
    return existsSync(path) ? path : file;
  };
  const files = [...new Set([instance(headingFile, 400), instance(headingFile, 700), instance(bodyFile, 400), instance(resolve('public/fonts/opensans.ttf'), 400), instance(resolve('public/fonts/opensans.ttf'), 700), instance(resolve('public/fonts/source-sans-3.ttf'), 400)])];
  return { heading, body, files, covers: fontCoverage(files) };
}

// Read Unicode cmap formats 4 and 12, including non-BMP characters. A missing
// glyph otherwise disappears silently in resvg, invalidating layout measurements.
const coverageCache = new Map<string, (code: number) => boolean>();
function fontCoverage(files: string[]) {
  const fonts = files.map(file => {
    let covers = coverageCache.get(file);
    if (covers) return covers;
    const data = readFileSync(file);
    let cmap = 0;
    for (let i = 0; i < data.readUInt16BE(4); i++) {
      const record = 12 + i * 16;
      if (data.toString('ascii', record, record + 4) === 'cmap') cmap = data.readUInt32BE(record + 8);
    }
    const maps: ((code: number) => boolean)[] = [];
    for (let i = 0; cmap && i < data.readUInt16BE(cmap + 2); i++) {
      const record = cmap + 4 + i * 8;
      const platform = data.readUInt16BE(record);
      const encoding = data.readUInt16BE(record + 2);
      if (platform !== 0 && !(platform === 3 && [1, 10].includes(encoding))) continue;
      const start = cmap + data.readUInt32BE(record + 4);
      const format = data.readUInt16BE(start);
      if (format === 12) {
        const groups = data.readUInt32BE(start + 12);
        maps.push(code => {
          let lo = 0, hi = groups - 1;
          while (lo <= hi) {
            const mid = (lo + hi) >>> 1, p = start + 16 + mid * 12;
            if (code < data.readUInt32BE(p)) hi = mid - 1;
            else if (code > data.readUInt32BE(p + 4)) lo = mid + 1;
            else return data.readUInt32BE(p + 8) + code - data.readUInt32BE(p) !== 0;
          }
          return false;
        });
      } else if (format === 4) {
        const count = data.readUInt16BE(start + 6) / 2;
        const end = start + 14, begin = end + count * 2 + 2, delta = begin + count * 2, offsets = delta + count * 2;
        maps.push(code => {
          if (code > 0xffff) return false;
          for (let j = 0; j < count; j++) {
            if (code > data.readUInt16BE(end + j * 2)) continue;
            if (code < data.readUInt16BE(begin + j * 2)) return false;
            const offset = data.readUInt16BE(offsets + j * 2), shift = data.readInt16BE(delta + j * 2);
            if (!offset) return ((code + shift) & 0xffff) !== 0;
            const glyph = data.readUInt16BE(offsets + j * 2 + offset + (code - data.readUInt16BE(begin + j * 2)) * 2);
            return glyph !== 0 && ((glyph + shift) & 0xffff) !== 0;
          }
          return false;
        });
      }
    }
    covers = code => maps.some(map => map(code));
    coverageCache.set(file, covers);
    return covers;
  });
  return (code: number) => fonts.some(covers => covers(code));
}
