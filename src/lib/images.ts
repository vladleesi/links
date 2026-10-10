import { Resvg } from '@resvg/resvg-js';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config, initials } from './config';
import { theme, fontFile } from './theme';
import { escapeXml, faviconSvg } from './favicon';

export { escapeXml } from './favicon';
export const monogram = initials(config.profile);

export function favicon(): string {
  return faviconSvg(monogram, theme.light.accent, theme.dark.accent, config.site.mode);
}

export function sharingImage(): Uint8Array {
  // Crawlers have no appearance preference; sharing uses the light palette.
  const colors = theme.light;
  const handle = `@${config.profile.username}`;
  const family = theme.fonts.preview ? theme.fonts.heading.split(',')[0].trim().replace(/["']/g, '') : 'Open Sans';
  if (theme.fonts.preview && !/\.(ttf|otf)$/.test(theme.fonts.preview)) throw new Error('Theme fonts.preview must be a local TTF or OTF font.');
  const font = theme.fonts.preview ? fontFile(theme.fonts.preview) : fileURLToPath(new URL('../assets/fonts/OpenSans.ttf', import.meta.url));
  const bodyFamily = theme.fonts.body.split(',')[0].trim().replace(/["']/g, '');
  const bodyFace = theme.fonts.faces?.find(face => face.family === bodyFamily);
  const bodyPath = bodyFace?.src.replace(/\.woff2?$/, '.ttf');
  const bodyFont = bodyPath && existsSync(`public${bodyPath}`) ? fontFile(bodyPath) : font;
  const body = bodyFont === font ? family : bodyFamily;
  const options = { font: { fontFiles: [...new Set([font, bodyFont])], loadSystemFonts: false, defaultFontFamily: family } };
  const svgRoot = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">';
  const text = (value: string, fontFamily: string, size: number, weight: number, x = 0, y = 0, color = colors.text) =>
    `<text x="${x}" y="${y}" font-family="${escapeXml(fontFamily)}" font-size="${size}" font-weight="${weight}" fill="${color}">${escapeXml(value)}</text>`;
  // Measure the actual bundled glyphs, including accents and wide characters.
  const measurements = new Map<string, { x: number; y: number; width: number; height: number }>();
  const measure = (value: string, fontFamily: string, size: number, weight: number) => {
    const key = JSON.stringify([value, fontFamily, weight]);
    let bounds = measurements.get(key);
    if (!bounds) {
      const box = new Resvg(`${svgRoot}${text(value, fontFamily, 100, weight)}</svg>`, options).getBBox();
      bounds = box ? { x: box.x, y: box.y, width: box.width, height: box.height } : { x: 0, y: 0, width: 0, height: 0 };
      measurements.set(key, bounds);
    }
    return { x: bounds.x * size / 100, y: bounds.y * size / 100, width: bounds.width * size / 100, height: bounds.height * size / 100 };
  };
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const characters = (value: string) => [...segmenter.segment(value)].map(part => part.segment);
  let copyX = 0;
  const copyWidth = 776;
  const fit = (value: string, fontFamily: string, weight: number, maximum: number, minimum: number, maxLines: number, color: string, gap: number) => {
    let lines: string[] = [];
    let size = maximum;
    for (; size >= minimum; size -= 2) {
      lines = [''];
      for (const word of value.split(/\s+/u)) {
        const candidate = [lines.at(-1), word].filter(Boolean).join(' ');
        if (measure(candidate, fontFamily, size, weight).width <= copyWidth) {
          lines[lines.length - 1] = candidate;
        } else {
          if (lines.at(-1)) lines.push('');
          // Split unbroken names/handles only at complete grapheme boundaries.
          for (const character of characters(word)) {
            const next = lines.at(-1)! + character;
            if (measure(next, fontFamily, size, weight).width > copyWidth && lines.at(-1)) lines.push(character);
            else lines[lines.length - 1] = next;
            if (lines.length > maxLines) break;
          }
        }
        if (lines.length > maxLines) break;
      }
      if (lines.length <= maxLines || size === minimum) break;
    }
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      const last = characters(lines.at(-1)!);
      while (last.length && measure(last.join('') + '…', fontFamily, size, weight).width > copyWidth) last.pop();
      lines[lines.length - 1] = last.join('').trimEnd() + '…';
    }
    const bounds = lines.map(line => measure(line, fontFamily, size, weight));
    const top = Math.min(...bounds.map(box => box.y));
    const bottom = Math.max(...bounds.map(box => box.y + box.height));
    const leading = Math.max(size * 1.2, bottom - top + 4);
    return { size, width: Math.max(...bounds.map(box => box.width)), height: (lines.length - 1) * leading + bottom - top, gap,
      render: (y: number) => lines.map((line, index) => text(line, fontFamily, size, weight, copyX - bounds[index].x, y - top + index * leading, color)).join('') };
  };
  // The required handle leads; optional details stay smaller even when it shrinks.
  const blocks = [fit(handle, family, 650, 72, 40, 2, colors.text, 0)];
  if (config.profile.fullName) blocks.push(fit(config.profile.fullName, body, 400, 36, 28, 2, colors.text, 16));
  if (config.profile.title) blocks.push(fit(config.profile.title, body, 400, 24, 22, 3, colors.muted, config.profile.fullName ? 28 : 20));
  // Center the visible group, with no space reserved for omitted details.
  const markX = (1200 - 208 - 64 - Math.max(...blocks.map(block => block.width))) / 2;
  copyX = markX + 208 + 64;
  const height = blocks.reduce((sum, block) => sum + block.height + block.gap, 0);
  let y = (630 - height) / 2;
  const copy = blocks.map(block => {
    y += block.gap;
    const markup = block.render(y);
    y += block.height;
    return markup;
  }).join('');
  const markSize = Math.min(64, blocks[0].size * 0.85, 64 * 160 / Math.max(160, measure(monogram, family, 64, 650).width));
  const mark = measure(monogram, family, markSize, 650);
  const svg = `${svgRoot}<rect width="1200" height="630" fill="${colors.background}"/><rect x="${markX}" y="211" width="208" height="208" rx="20" fill="${colors.surface}"/>${text(monogram, family, markSize, 650, markX + 104 - mark.x - mark.width / 2, 315 - mark.y - mark.height / 2, colors.accent)}${copy}</svg>`;
  return new Resvg(svg, options).render().asPng();
}
