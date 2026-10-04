import { Resvg } from '@resvg/resvg-js';
import { fileURLToPath } from 'node:url';
import { config, initials } from './config';
import { theme, fontFile } from './theme';

export const escapeXml = (text: string) => text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[character]!));
export const monogram = initials(config.profile);

export function favicon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><style>rect{fill:${theme.light.background}}text{fill:${theme.light.accent}}@media(prefers-color-scheme:dark){rect{fill:${theme.dark.background}}text{fill:${theme.dark.accent}}}</style><rect width="64" height="64" rx="12"/><text x="32" y="33" text-anchor="middle" dominant-baseline="central" font-family="system-ui,sans-serif" font-size="${monogram.length > 2 ? 24 : 28}" font-weight="600">${escapeXml(monogram)}</text></svg>`;
}

export function sharingImage(): Uint8Array {
  // Crawlers have no appearance preference; sharing uses the light palette.
  const colors = theme.light;
  const name = config.profile.fullName || `@${config.profile.username}`;
  const handle = `@${config.profile.username}`;
  const nameSize = Math.min(58, 1048 / [...name].length);
  const handleSize = Math.min(32, 1048 / [...handle].length);
  const family = theme.fonts.preview ? theme.fonts.heading.split(',')[0].trim().replace(/["']/g, '') : 'Open Sans';
  if (theme.fonts.preview && !/\.(ttf|otf)$/.test(theme.fonts.preview)) throw new Error('Theme fonts.preview must be a local TTF or OTF font.');
  const font = theme.fonts.preview ? fontFile(theme.fonts.preview) : fileURLToPath(new URL('../assets/fonts/OpenSans.ttf', import.meta.url));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${colors.background}"/><g font-family="${escapeXml(family)}"><text x="72" y="200" font-size="94" font-weight="600" fill="${colors.accent}">${escapeXml(monogram)}</text><text x="72" y="350" font-size="${nameSize}" font-weight="600" fill="${colors.text}">${escapeXml(name)}</text>${config.profile.fullName ? `<text x="72" y="410" font-size="${handleSize}" fill="${colors.muted}">${escapeXml(handle)}</text>` : ''}</g></svg>`;
  return new Resvg(svg, { font: { fontFiles: [font], loadSystemFonts: false, defaultFontFamily: family }, fitTo: { mode: 'original' } }).render().asPng();
}
