import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

function luminance(hex) {
  const [red, green, blue] = hex.slice(1).match(/../g).map(value => {
    const channel = parseInt(value, 16) / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return .2126 * red + .7152 * green + .0722 * blue;
}

for (const name of ['paper', 'arctic', 'ember', 'console', 'carbon', 'signal', 'control']) {
  const { default: theme } = await import(pathToFileURL(resolve(`src/themes/${name}.ts`)).href);
  for (const mode of ['light', 'dark']) {
    const colors = theme[mode];
    for (const key of ['background', 'surface', 'text', 'muted', 'border', 'accent', 'hover', 'pressed']) {
      assert.match(colors[key], /^#[a-f\d]{6}$/i, `${name} ${mode}.${key}`);
    }
    let minimum = Infinity;
    for (const foreground of ['text', 'muted', 'accent']) {
      for (const background of ['background', 'surface', 'hover', 'pressed']) {
        const a = luminance(colors[foreground]);
        const b = luminance(colors[background]);
        const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
        // Control uses accent for graphical controls/icons, not small text.
        const required = name === 'control' && foreground === 'accent' ? 3 : 4.5;
        assert.ok(ratio >= required, `${name} ${mode}: ${foreground} on ${background} is ${ratio.toFixed(2)}:1; expected at least ${required}:1`);
        minimum = Math.min(minimum, ratio);
      }
    }
    console.log(`${name} ${mode}: minimum text/icon contrast ${minimum.toFixed(2)}:1 across all surface states`);
    if (name === 'control') {
      const a = luminance(colors.accent);
      const b = luminance(colors.background);
      assert.ok((Math.max(a, b) + .05) / (Math.min(a, b) + .05) >= 4.5, `${name} ${mode}: selected text meets 4.5:1`);
    }
  }
  for (const face of theme.fonts.faces) {
    assert.match(face.src, /^\/fonts\/[\w-]+\.(ttf|woff2)$/);
    const font = readFileSync(resolve('public', '.' + face.src));
    assert.ok(font.length > 1000, `${name}: local font has data`);
    assert.equal(font.readUInt32BE(0), face.src.endsWith('.ttf') ? 0x00010000 : 0x774f4632, `${name}: valid font container`);
    assert.ok(theme.fonts.body.includes(face.family) || theme.fonts.heading.includes(face.family));
  }
  assert.match(theme.fonts.preview, /^\/fonts\/[\w-]+\.ttf$/);
  assert.equal(readFileSync(resolve('public', '.' + theme.fonts.preview)).readUInt32BE(0), 0x00010000, `${name}: local preview font`);
}

const manifest = JSON.parse(readFileSync('public/fonts/sources.json', 'utf8'));
for (const font of manifest.fonts) {
  assert.ok(font.source.includes(manifest.revision));
  assert.ok(font.licenseSource.includes(manifest.revision));
  assert.ok(readFileSync(`public/fonts/${font.licenseFile}`, 'utf8').includes('SIL OPEN FONT LICENSE'));
}
console.log('New theme palettes, local font containers, preview fonts, and license provenance passed.');
