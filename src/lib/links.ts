import type { Config } from './config';
import { detectIcon, iconIds, isProfileLink, type IconId } from './services';

const files = import.meta.glob<string>('../assets/icons/*.svg', { eager: true, query: '?raw', import: 'default' });
export const icons = Object.fromEntries(Object.entries(files).map(([path, svg]) => [path.split('/').at(-1)!.replace(/\.svg$/, ''), svg])) as Record<IconId, string>;

export interface ResolvedLink { name: string; url: string; icon: IconId; hostname?: string; external: boolean; profile: boolean; }
export function resolveLinks(links: Config['links']): ResolvedLink[] {
  return links.map((link, index) => {
    const icon = link.icon ? link.icon as IconId : detectIcon(link.url);
    if (!iconIds.includes(icon) || !icons[icon]) throw new Error(`config.yaml: links.${index}.icon "${icon}" does not exist. Available icons: ${iconIds.filter(id => id !== 'external').join(', ')}.`);
    const url = new URL(link.url);
    return { name: link.name, url: link.url, icon, hostname: link.hostname && url.hostname ? url.hostname.replace(/^www\./, '') : undefined, external: ['http:', 'https:'].includes(url.protocol), profile: isProfileLink(link.url, icon) };
  });
}
