import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseDocument } from 'yaml';
import { z } from 'zod';

const webUrl = z.string().trim().refine(value => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !url.search && !url.hash;
  } catch { return false; }
}, 'Use an absolute http(s) URL without credentials, a query, or a fragment.');

const linkUrl = z.string().trim().refine(value => {
  if (/\s/.test(value)) return false;
  try {
    const url = new URL(value);
    return (['http:', 'https:'].includes(url.protocol) && !!url.hostname && !url.username && !url.password)
      || (url.protocol === 'mailto:' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(url.pathname))
      || (url.protocol === 'tel:' && /^\+?[\d().-]+$/.test(url.pathname));
  } catch { return false; }
}, 'Use a valid http(s), mailto:, or tel: URL.');

const schema = z.object({
  profile: z.object({
    fullName: z.string().trim().transform(value => value.replace(/\s+/gu, ' ')).nullish().transform(value => value || undefined),
    title: z.string().trim().transform(value => value.replace(/\s+/gu, ' ')).nullish().transform(value => value || undefined),
    username: z.string().trim().min(1, 'Username is required.').transform(value => value.replace(/^@/, '')).pipe(z.string().min(1, 'Username is required.').regex(/^[^\s/\u0000-\u001f\u007f]+$/u, 'Username must not contain spaces, slashes, or control characters.')),
  }).strict(),
  site: z.object({
    url: webUrl,
    theme: z.string().regex(/^[a-z][a-z0-9-]*$/, 'Use a theme filename, such as default.').default('default'),
    mode: z.preprocess(value => typeof value === 'string' ? value.trim() || undefined : value ?? undefined, z.enum(['light', 'dark']).optional()),
  }).strict(),
  links: z.array(z.object({ name: z.string().trim().min(1, 'Link name is required.'), url: linkUrl, icon: z.string().regex(/^[a-z][a-z0-9-]*$/).optional(), hostname: z.boolean().default(false) }).strict()),
}).strict();

export type Config = z.infer<typeof schema>;

export function parseConfig(source: string): Config {
  const document = parseDocument(source, { uniqueKeys: true });
  if (document.errors.length) throw new Error(`config.yaml: ${document.errors.map(error => error.message).join('\n')}`);
  const result = schema.safeParse(document.toJS({ maxAliasCount: 20 }));
  if (!result.success) throw new Error(`config.yaml:\n${result.error.issues.map(issue => `  ${issue.path.join('.') || 'root'}: ${issue.message}`).join('\n')}`);
  const config = result.data;
  const url = new URL(config.site.url);
  url.pathname = url.pathname.replace(/\/+$/, '') + '/';
  config.site.url = url.href;
  return config;
}

export const config = parseConfig(readFileSync(resolve('config.yaml'), 'utf8'));

export function initials(profile: Config['profile']): string {
  const words = (profile.fullName || profile.username).match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’\-]*/gu) || [profile.username];
  const characters = (value: string) => [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value)].map(part => part.segment);
  const letters = words.length > 1 ? [characters(words[0])[0], characters(words.at(-1)!)[0]] : characters(words[0]).slice(0, 2);
  return letters.join('').toLocaleUpperCase('und');
}

export const displayName = config.profile.fullName || config.profile.username;
export const title = config.profile.fullName ? `${config.profile.fullName} (@${config.profile.username})` : config.profile.username;
export const description = `Links and profiles for ${config.profile.fullName ? `${config.profile.fullName} (@${config.profile.username})` : `@${config.profile.username}`}.`;
export const basePath = new URL(config.site.url).pathname;
export const assetPath = (path: string) => `${basePath}${path.replace(/^\//, '')}`;
