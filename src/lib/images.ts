import { Resvg } from '@resvg/resvg-js';
import { config, initials } from './config';
import { theme } from './theme';
import { faviconSvg } from './favicon';
import { createSharingImage, sharingImageAlt, sharingImageHash, sharingImageUrl } from './og';

export { escapeXml } from './favicon';
export const monogram = initials(config.profile);

export function favicon(): string {
  return faviconSvg(monogram, theme.light.accent, theme.dark.accent, config.site.mode);
}

let png: Uint8Array | undefined;
export function sharingImage(): Uint8Array {
  if (!png) {
    const image = createSharingImage(config.profile, theme, config.site.mode);
    for (const warning of image.warnings) console.warn(`Open Graph: ${warning}`);
    png = new Resvg(image.svg, image.options).render().asPng();
  }
  return png;
}

export const sharingAlt = sharingImageAlt(config.profile);
export const sharingTwitterAlt = sharingImageAlt(config.profile, 420);
export const sharingUrl = () => sharingImageUrl(config.site.url, sharingImage());
export const sharingHash = () => sharingImageHash(sharingImage());
