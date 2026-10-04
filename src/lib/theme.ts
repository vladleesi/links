import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config, assetPath } from './config';

export interface Colors { background: string; surface: string; text: string; muted: string; border: string; accent: string; hover: string; pressed: string; }
export interface Theme {
  fonts: { body: string; heading: string; faces?: { family: string; src: string; weight?: string; style?: string }[]; preview?: string };
  light: Colors;
  dark: Colors;
}

const modules = import.meta.glob<{ default: Theme }>('../themes/*.ts', { eager: true });
export const themeNames = Object.keys(modules).map(path => path.split('/').at(-1)!.replace(/\.ts$/, '')).sort();
export const theme = modules[`../themes/${config.site.theme}.ts`]?.default;
if (!theme) throw new Error(`config.yaml: site.theme "${config.site.theme}" does not exist. Available themes: ${themeNames.join(', ')}.`);

const colorKeys: (keyof Colors)[] = ['background', 'surface', 'text', 'muted', 'border', 'accent', 'hover', 'pressed'];
for (const mode of ['light', 'dark'] as const) {
  for (const key of colorKeys) if (!/^#[\da-f]{6}$/i.test(theme[mode]?.[key])) throw new Error(`Theme ${config.site.theme}: ${mode}.${key} must be a six-digit hex color.`);
}
if (!theme.fonts?.body || !theme.fonts.heading || /[{};<>]/.test(theme.fonts.body + theme.fonts.heading)) throw new Error(`Theme ${config.site.theme}: supply valid body and heading font families.`);

export function fontFile(path: string): string {
  if (!/^\/fonts\/[\w./-]+\.(?:ttf|otf|woff2?)$/.test(path) || path.split('/').includes('..')) throw new Error(`Theme ${config.site.theme}: use a local /fonts/ asset, received ${path}.`);
  const file = resolve('public', `.${path}`);
  if (!existsSync(file)) throw new Error(`Theme ${config.site.theme}: font file ${path} does not exist.`);
  return file;
}

const faces = theme.fonts.faces || [];
const fontRules = faces.map(face => {
  fontFile(face.src);
  if (/[{};<>"\\]/.test(face.family) || !/^[\d ]+$/.test(face.weight || '400') || !['normal', 'italic'].includes(face.style || 'normal')) throw new Error(`Theme ${config.site.theme}: invalid font face.`);
  return `@font-face{font-family:"${face.family}";src:url("${assetPath(face.src)}");font-weight:${face.weight || '400'};font-style:${face.style || 'normal'};font-display:swap}`;
}).join('');
const variables = (colors: Colors) => colorKeys.map(key => `--${key}:${colors[key]}`).join(';');
export const themeCss = `${fontRules}:root{color-scheme:light;${variables(theme.light)};--font-body:${theme.fonts.body};--font-heading:${theme.fonts.heading}}@media(prefers-color-scheme:dark){:root:not([data-mode]){color-scheme:dark;${variables(theme.dark)}}}:root[data-mode="dark"]{color-scheme:dark;${variables(theme.dark)}}`;
