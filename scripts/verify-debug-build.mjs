import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { config, assetPath } from '../src/lib/config.ts';

const html = await readFile('dist-debug/index.html', 'utf8');
const names = (await readdir('src/themes')).filter(name => name.endsWith('.ts')).map(name => name.slice(0, -3)).sort();
const options = [...html.matchAll(/<option value="([^"]+)"([^>]*)>/g)];
assert.deepEqual(options.map(option => option[1]), names, 'Dropdown includes every local theme');
assert.equal(options.find(option => /\bselected\b/.test(option[2]))?.[1], config.site.theme, 'Configured theme is initially selected');
assert.match(html, /<label class="sr-only" for="debug-theme">Debug theme<\/label>/);
assert.match(html, /<footer\b[^>]*>[\s\S]*?<span id="debug-theme-picker" hidden>[\s\S]*?<\/footer>/, 'Compact control is in the footer and stays hidden without JavaScript');
const runtime = html.match(/<script>\s*(\(\(\) => \{[\s\S]*?)<\/script>/)?.[1];
assert.ok(runtime, 'Debug runtime is emitted inline');

const events = {};
const appearanceEvents = {};
let themeChanges = 0;
const root = {
  dataset: { mode: 'dark' },
  addEventListener: (type, listener) => { appearanceEvents[type] = listener; },
  dispatchEvent: event => { assert.equal(event.type, 'link-site-theme-change'); themeChanges++; appearanceEvents[event.type](); },
};
const picker = { hidden: true };
const select = { value: config.site.theme, addEventListener: (event, listener) => { events[event] = listener; } };
const metas = [{ content: '', removeAttribute() {} }, { content: '', removeAttribute() {} }];
const favicon = { dataset: { initials: 'VK' }, href: '' };
const toggle = { setAttribute() {}, addEventListener: (type, listener) => { appearanceEvents[type] = listener; } };
const system = { matches: false, addEventListener: (type, listener) => { appearanceEvents[type] = listener; } };
let palette = (await import(pathToFileURL(resolve(`src/themes/${config.site.theme}.ts`)).href)).default.dark;
runInNewContext(html.match(/<script type="module">([\s\S]*?)<\/script>/)[1], {
  document: { documentElement: root, querySelector: selector => selector === '.mode-toggle' ? toggle : favicon, querySelectorAll: () => metas },
  getComputedStyle: () => ({ getPropertyValue: key => palette[key.slice(2)] }),
  window: { matchMedia: () => system },
  localStorage: { setItem() {} },
});
runInNewContext(runtime, {
  Event: class { constructor(type) { this.type = type; } },
  document: {
    documentElement: root,
    getElementById: id => id === 'debug-theme' ? select : picker,
  },
});
assert.equal(picker.hidden, false, 'JavaScript enables the picker');
assert.equal(root.dataset.debugTheme, undefined, 'Initialization keeps the configured theme');

for (const name of names) {
  const { default: theme } = await import(pathToFileURL(resolve(`src/themes/${name}.ts`)).href);
  const selector = `:root[data-debug-theme="${name}"]`;
  assert.ok(html.includes(`${selector}{color-scheme:light;`), `${name}: light CSS included`);
  assert.ok(html.includes(`${selector}:not([data-mode]){color-scheme:dark;`), `${name}: system dark CSS included`);
  assert.ok(html.includes(`${selector}[data-mode="dark"]{color-scheme:dark;`), `${name}: explicit dark CSS included`);
  assert.ok(html.includes(`--font-body:${theme.fonts.body};--font-heading:${theme.fonts.heading}`), `${name}: typography included`);
  for (const face of theme.fonts.faces || []) assert.ok(html.includes(`src:url("${assetPath(face.src)}")`), `${name}: font uses configured base path`);
  for (const mode of ['light', 'dark']) {
    for (const [key, value] of Object.entries(theme[mode])) assert.ok(html.includes(`--${key}:${value}`), `${name} ${mode}: palette included`);
  }
  root.dataset.mode = 'dark';
  palette = theme.dark;
  select.value = name;
  events.change();
  assert.equal(root.dataset.debugTheme, name, 'Selection switches theme without navigation');
  assert.equal(root.dataset.mode, 'dark', 'Theme selection preserves appearance');
  const assertColors = () => {
    assert.ok(metas.every(meta => meta.content === palette.background), 'Browser chrome follows the selected theme and mode');
    assert.ok(decodeURIComponent(favicon.href).includes(`fill="${palette.accent}"`), 'Favicon follows the selected theme and mode');
  };
  assertColors();
  palette = theme.light;
  appearanceEvents.click();
  assert.equal(root.dataset.mode, 'light');
  assertColors();
  delete root.dataset.mode;
  palette = theme.dark;
  system.matches = true;
  appearanceEvents.change();
  assertColors();
}
assert.equal(themeChanges, names.length, 'Each theme selection notifies the shared appearance runtime');
console.log('Passed debug theme discovery, all palettes/fonts, runtime switching, appearance preservation, and favicon/theme-color synchronization.');
