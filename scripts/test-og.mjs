import assert from 'node:assert/strict';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { config } from '../src/lib/config.ts';
import { escapeXml } from '../src/lib/favicon.ts';
import { createSharingImage, sharingSize, sharingImageUrl, sharingImageAlt } from '../src/lib/og.ts';

const root = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">';
const artifacts = resolve('artifacts/og');
await mkdir(artifacts, { recursive: true });
const fixtures = {
  configured: config.profile,
  complete: { username: 'vladleesi', fullName: 'Vladislav Kochetov', title: 'Mobile software engineer' },
  short: { username: 'a' },
  'name-only': { username: 'designer', fullName: 'Jo Li' },
  'title-only': { username: 'creator', title: 'Independent artist' },
  'blank-optionals': { username: 'artist', fullName: '  ', title: '' },
  long: { username: 'a-very-long-and-wide-professional-username-WWW', fullName: 'Alexandra Montgomery-Worthington de la Cruz', title: 'Independent designer, researcher and creative director working across culture, technology and public spaces' },
  multiline: { username: 'wide_WWW_narrow_iiii', fullName: 'Jean-Luc\nPicard', title: 'Research\nDesign\nCommunity' },
  cyrillic: { username: 'александра', fullName: 'Александра Миронова', title: 'Дизайнер и исследователь' },
  greek: { username: 'δημιουργός', fullName: 'Ελένη Παπαδοπούλου', title: 'Σχεδιασμός και δημιουργία' },
  hebrew: { username: 'מעצב', fullName: 'שָׁלוֹם כהן', title: 'עיצוב ויצירה' },
  combining: { username: 'e\u0301lodie', fullName: 'A\u030Angstro\u0308m ßmith', title: 'Cafe\u0301 & art <design> "studio"' },
  unsupported: { username: '李明🙂', fullName: 'مرحبا 世界', title: 'Designer 👩🏽‍💻' },
  unusual: { username: '👨‍👩‍👧‍👦𐐷', fullName: '\u202eArtist\u0001', title: 'Zero\u200bwidth\u2060 text' },
  invisible: { username: '\u200b\u2060', fullName: '\u200b' },
  'stacked-marks': { username: 'a' + '\u0301'.repeat(150), fullName: 'Z' + '\u0301'.repeat(150), title: 'Artist' },
  punctuation: { username: '_'.repeat(500), fullName: '-'.repeat(500), title: '.'.repeat(500) },
  excessive: { username: 'WW'.repeat(160), fullName: 'Long name '.repeat(60), title: 'Extensive professional description '.repeat(70) },
};
const names = (await readdir('src/themes')).filter(file => file.endsWith('.ts')).sort();
const previews = [], results = [];
const luminance = hex => hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255)
  .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
  .reduce((sum, value, i) => sum + value * [.2126, .7152, .0722][i], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
const inside = (box, area, label) => {
  assert.ok(box && box.width > 0 && box.height > 0, `${label}: visible ink`);
  assert.ok(box.x >= area.x - .1 && box.y >= area.y - .1 && box.x + box.width <= area.x + area.width + .1 && box.y + box.height <= area.y + area.height + .1, `${label}: actual rendered bounds stay inside safe area: ${JSON.stringify(box)}`);
};
const safe = { x: sharingSize.margin, y: sharingSize.margin, width: 1200 - 2 * sharingSize.margin, height: 630 - 2 * sharingSize.margin };

const manifest = JSON.parse(await readFile('src/assets/fonts/og/sources.json', 'utf8'));
for (const asset of manifest.fonts) {
  const data = await readFile('src/assets/fonts/og/' + asset.file);
  assert.equal(createHash('sha256').update(data).digest('hex'), asset.sha256, 'Static font checksum');
  assert.equal(createHash('sha256').update(await readFile(asset.source)).digest('hex'), asset.sourceSha256, 'Vendored font source checksum');
  const tables = new Map();
  for (let i = 0; i < data.readUInt16BE(4); i++) {
    const p = 12 + i * 16;
    tables.set(data.toString('ascii', p, p + 4), data.readUInt32BE(p + 8));
  }
  assert.ok(!tables.has('fvar'), 'Weight instances are static');
  assert.equal(data.readUInt16BE(tables.get('OS/2') + 4), asset.weight, 'Real font weight');
  assert.ok((await readFile(asset.license, 'utf8')).includes('SIL OPEN FONT LICENSE'));
}

for (const file of names) {
  const name = file.slice(0, -3);
  const { default: theme } = await import(pathToFileURL(resolve('src/themes', file)));
  for (const mode of ['light', 'dark']) for (const [id, profile] of Object.entries(fixtures)) {
    const image = createSharingImage(profile, theme, mode);
    const colors = theme[mode];
    const label = `${name}/${mode}/${id}`;
    const nonempty = value => Boolean(value?.replace(/[\s\p{Default_Ignorable_Code_Point}]/gu, ''));
    assert.equal(image.blocks.length, 1 + Number(nonempty(profile.fullName)) + Number(nonempty(profile.title)), `${label}: optional fields reserve no space`);
    assert.ok(image.blocks[0].lines[0].startsWith('@'), `${label}: username first`);
    assert.ok(image.blocks[0].size >= 64);
    assert.ok(image.blocks.every((block, i) => !i || block.size < image.blocks[i - 1].size), `${label}: username/name/title hierarchy`);
    assert.ok(image.blocks.every(block => block.size >= block.minimum), `${label}: readable font floors`);
    assert.equal((image.svg.match(/<rect\b/g) || []).length, 1, `${label}: only the background, no logo block`);
    const textElements = [...image.svg.matchAll(/<text\b[^>]*>[\s\S]*?<\/text>/g)].map(match => match[0]);
    assert.deepEqual(textElements.map(text => text.match(/>([\s\S]*?)<\/text>/)[1]), ['Links', ...image.blocks.flatMap(block => block.lines.map(escapeXml))], `${label}: only the contextual cue and profile text`);
    for (const [i, text] of textElements.entries()) {
      const rendered = new Resvg(`${root}${text}</svg>`, image.options);
      const box = rendered.getBBox();
      const actual = box && { x: box.x, y: box.y, width: box.width, height: box.height };
      inside(actual, safe, `${label}/line ${i}`);
      assert.ok(Math.abs(actual.x - image.lineBounds[i].x) < .1, `${label}: optical alignment matches rendered ink`);
    }
    for (let i = 1; i < image.lineBounds.length; i++) {
      assert.ok(image.lineBounds[i].y > image.lineBounds[i - 1].y + image.lineBounds[i - 1].height, `${label}: no overlapping lines`);
    }
    assert.ok(contrast(colors.text, colors.background) >= 4.5, `${label}: main text contrast`);
    assert.ok(contrast(colors.muted, colors.background) >= 4.5, `${label}: supporting text contrast`);
    assert.ok(contrast(colors.accent, colors.background) >= 4.5, `${label}: Links cue contrast`);
    assert.ok(textElements[0].includes(`fill="${colors.accent}"`), `${label}: theme accent`);
    assert.ok(textElements.slice(1).every(text => text.includes(`fill="${colors.text}"`) || text.includes(`fill="${colors.muted}"`)), `${label}: theme text colors`);
    if (['configured', 'complete', 'short', 'long', 'multiline', 'cyrillic', 'greek', 'hebrew', 'combining'].includes(id)) {
      assert.deepEqual(image.warnings, [], `${label}: content fits without omission or unsupported glyphs`);
      for (const block of image.blocks) assert.equal(block.lines.join('').replace(/\s+/gu, ''), block.value.replace(/\s+/gu, ''), `${label}: full text is preserved`);
    }
    if (id === 'unsupported') {
      assert.ok(image.warnings.some(warning => warning.includes('not covered')));
      assert.ok(image.svg.includes('�'), `${label}: unsupported glyphs remain visible`);
    }
    if (id === 'excessive') {
      assert.ok(image.warnings.some(warning => warning.includes('ellipsis')));
      assert.ok(image.svg.includes('…'), `${label}: explicit bounded last resort`);
    }
    if (id === 'multiline') assert.equal(image.blocks[1].lines.length, 2);
    if (id === 'short') assert.ok(image.blocks[0].size >= 200, `${label}: sparse profiles use prominent display type`);
    if (id === 'complete') assert.ok(image.lineBounds[1].width >= safe.width * .6, `${label}: typical usernames use the canvas`);
    if (id === 'long') {
      assert.equal(image.blocks[0].lines.length, 2, `${label}: long handles avoid a short orphan line when two readable lines fit`);
      for (const word of profile.fullName.split(/\s+/u)) assert.ok(image.blocks[1].lines.some(line => line.includes(word)), `${label}: words wrap intact`);
      assert.ok(image.blocks[0].lines.slice(0, -1).every(line => /[-._]$/.test(line)), `${label}: handle wraps at separators`);
    }
    if (id === 'combining') assert.ok(image.svg.includes('&amp;') && image.svg.includes('&lt;design&gt;'));
    const rendered = new Resvg(image.svg, image.options).render();
    const png = rendered.asPng();
    assert.deepEqual(rendered.pixels.subarray(0, 4), Buffer.from([...Buffer.from(colors.background.slice(1), 'hex'), 255]), `${label}: rendered theme background`);
    assert.equal(rendered.width, 1200);
    assert.equal(rendered.height, 630);
    assert.ok(png.length < 300_000, `${label}: compact PNG`);
    results.push({ theme: name, mode, fixture: id, bytes: png.length, warnings: image.warnings });
    if (id === 'complete' || name === 'material' && ['configured', 'short', 'name-only', 'title-only', 'long', 'cyrillic', 'hebrew', 'unsupported'].includes(id)) {
      const filename = `${name}-${id}${mode === 'dark' ? '-dark' : ''}`;
      await writeFile(resolve(artifacts, `${filename}.png`), png);
      for (const width of [600, 300]) {
        await writeFile(resolve(artifacts, `${filename}-${width}.png`), new Resvg(image.svg, { ...image.options, fitTo: { mode: 'width', value: width } }).render().asPng());
      }
      previews.push({ name: label, png });
    }
    if (id === 'configured') {
      // Compare actual glyph paths, not merely the SVG font-weight attributes.
      const sample = weight => new Resvg(`${root}<text y="200" font-family="${image.blocks[0].family}" font-size="100" font-weight="${weight}">Hamburgefonts WWW</text></svg>`, image.options).toString();
      assert.notEqual(sample(400), sample(700), `${name}: regular and bold really render differently`);
      assert.deepEqual(png, new Resvg(createSharingImage(profile, theme, mode).svg, image.options).render().asPng(), `${label}: deterministic PNG`);
      if (mode === 'light') {
        assert.equal(image.svg, createSharingImage(profile, theme).svg, `${name}: omitted mode defaults to light`);
        assert.equal(image.svg, createSharingImage(profile, theme, undefined).svg, `${name}: empty configured mode defaults to light`);
      }
    }
  }
  console.log(`${name}: ${Object.keys(fixtures).length * 2} OG cases passed (light and dark)`);
}

// Root/custom-domain/subpath URLs and exact byte identity invalidate caches.
const png = await readFile(resolve(artifacts, 'material-configured.png'));
const darkPng = await readFile(resolve(artifacts, 'material-configured-dark.png'));
assert.notEqual(sharingImageUrl(config.site.url, png), sharingImageUrl(config.site.url, darkPng), 'Changing mode invalidates the image URL');
for (const site of ['https://example.com/', 'https://example.com/links/', 'https://user.github.io/project/']) {
  const url = sharingImageUrl(site, png);
  assert.ok(url.startsWith(site + 'og/'));
  assert.match(url, /\/og\/[a-f\d]{16}\.png$/);
  assert.equal(url, sharingImageUrl(site, png));
  assert.notEqual(url, sharingImageUrl(site, Buffer.concat([png, Buffer.from('changed')])));
}
const alt = sharingImageAlt(fixtures.complete);
assert.ok(alt.startsWith('Links page for @') && alt.includes(fixtures.complete.title) && !alt.includes('monogram'));
const longAlt = sharingImageAlt({ username: 'a', title: 'e\u0301'.repeat(500) }, 420);
assert.ok(longAlt.length <= 420 && longAlt.endsWith('…') && !longAlt.endsWith('e…'), 'Twitter alt length respects complete graphemes');

// A contact sheet is an inspection artifact, not a site or browser test.
const rows = Math.ceil(previews.length / 3);
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="${rows * 190}"><rect width="100%" height="100%" fill="#ddd"/>${previews.map((preview, i) => `<image x="${i % 3 * 320}" y="${Math.floor(i / 3) * 190}" width="300" height="157.5" href="data:image/png;base64,${preview.png.toString('base64')}"/><text x="${i % 3 * 320 + 4}" y="${Math.floor(i / 3) * 190 + 178}" font-size="13">${preview.name}</text>`).join('')}</svg>`;
await writeFile(resolve(artifacts, 'thumbnails.png'), new Resvg(sheet, { font: { fontFiles: [resolve('public/fonts/opensans.ttf')], loadSystemFonts: false } }).render().asPng());
await writeFile(resolve(artifacts, 'results.json'), JSON.stringify(results, null, 2));
console.log(`Passed ${results.length} OG layouts, real glyph bounds/weights, contrast, Unicode, fallback warnings, dimensions, size, determinism and sharing URLs. Previews: artifacts/og/`);
