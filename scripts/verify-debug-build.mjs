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
const root = { dataset: { mode: 'dark' } };
const picker = { hidden: true };
const select = { value: config.site.theme, addEventListener: (event, listener) => { events[event] = listener; } };
const metas = [{ content: '', removeAttribute() {} }, { content: '', removeAttribute() {} }];
let background;
let observer;
let systemChange;
runInNewContext(runtime, {
  document: {
    documentElement: root,
    getElementById: id => id === 'debug-theme' ? select : picker,
    querySelectorAll: () => metas,
  },
  getComputedStyle: () => ({ getPropertyValue: key => { assert.equal(key, '--background'); return background; } }),
  MutationObserver: class {
    constructor(callback) { observer = callback; }
    observe(target, options) {
      assert.equal(target, root);
      assert.equal(options.attributes, true);
      assert.deepEqual(Array.from(options.attributeFilter), ['data-mode']);
    }
  },
  window: { matchMedia: query => {
    assert.equal(query, '(prefers-color-scheme: dark)');
    return { addEventListener: (event, listener) => { assert.equal(event, 'change'); systemChange = listener; } };
  } },
  queueMicrotask,
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
  background = theme.dark.background;
  select.value = name;
  events.change();
  assert.equal(root.dataset.debugTheme, name, 'Selection switches theme without navigation');
  assert.equal(root.dataset.mode, 'dark', 'Theme selection preserves appearance');
  assert.ok(metas.every(meta => meta.content === background), 'Browser chrome follows the selected theme');
  root.dataset.mode = 'light';
  background = theme.light.background;
  observer();
  assert.ok(metas.every(meta => meta.content === background), 'Appearance changes update browser chrome');
  delete root.dataset.mode;
  background = theme.dark.background;
  systemChange();
  await new Promise(resolve => queueMicrotask(resolve));
  assert.ok(metas.every(meta => meta.content === background), 'System appearance updates browser chrome');
}
console.log('Passed debug theme discovery, initial selection, all palettes/fonts, runtime switching, appearance preservation, and theme-color synchronization.');
