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
export function fontFile(path: string, name = config.site.theme): string {
  if (!/^\/fonts\/[\w./-]+\.(?:ttf|otf|woff2?)$/.test(path) || path.split('/').includes('..')) throw new Error(`Theme ${name}: use a local /fonts/ asset, received ${path}.`);
  const file = resolve('public', `.${path}`);
  if (!existsSync(file)) throw new Error(`Theme ${name}: font file ${path} does not exist.`);
  return file;
}

const variables = (colors: Colors) => colorKeys.map(key => `--${key}:${colors[key]}`).join(';');

export function createThemeCss(name: string, selector = ':root'): string {
  const candidate = modules[`../themes/${name}.ts`]?.default;
  if (!candidate) throw new Error(`Theme ${name} does not exist.`);
  for (const mode of ['light', 'dark'] as const) {
    for (const key of colorKeys) if (!/^#[\da-f]{6}$/i.test(candidate[mode]?.[key])) throw new Error(`Theme ${name}: ${mode}.${key} must be a six-digit hex color.`);
  }
  if (!candidate.fonts?.body || !candidate.fonts.heading || /[{};<>]/.test(candidate.fonts.body + candidate.fonts.heading)) throw new Error(`Theme ${name}: supply valid body and heading font families.`);
  const fontRules = (candidate.fonts.faces || []).map(face => {
    fontFile(face.src, name);
    if (/[{};<>"\\]/.test(face.family) || !/^[\d ]+$/.test(face.weight || '400') || !['normal', 'italic'].includes(face.style || 'normal')) throw new Error(`Theme ${name}: invalid font face.`);
    return `@font-face{font-family:"${face.family}";src:url("${assetPath(face.src)}");font-weight:${face.weight || '400'};font-style:${face.style || 'normal'};font-display:swap}`;
  }).join('');
  return `${fontRules}${selector}{color-scheme:light;${variables(candidate.light)};--font-body:${candidate.fonts.body};--font-heading:${candidate.fonts.heading}}@media(prefers-color-scheme:dark){${selector}:not([data-mode]){color-scheme:dark;${variables(candidate.dark)}}}${selector}[data-mode="dark"]{color-scheme:dark;${variables(candidate.dark)}}`;
}

export const themeCss = createThemeCss(config.site.theme);
