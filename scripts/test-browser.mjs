import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, rm, access } from 'node:fs/promises';
import { resolve, extname, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { parse, stringify } from 'yaml';
import assert from 'node:assert/strict';
import { initials } from '../src/lib/config.ts';
import defaultTheme from '../src/themes/default.ts';
import materialTheme from '../src/themes/material.ts';
import { sharingImageUrl } from '../src/lib/og.ts';
import monokaiTheme from '../src/themes/monokai.ts';

const require = createRequire(import.meta.url);
const astroPackage = require.resolve('astro/package.json');
const astro = resolve(dirname(astroPackage), JSON.parse(await readFile(astroPackage, 'utf8')).bin.astro);
const original = await readFile('config.yaml', 'utf8');
const example = parse(original);
const selectedTheme = (await import('../src/themes/' + example.site.theme + '.ts')).default;
const artifacts = resolve('artifacts/verification');
await mkdir(artifacts, { recursive: true });
const customFile = 'src/themes/test-font.ts';
try { await access(customFile); throw new Error('Refusing to overwrite an existing test-font theme.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const fixtures = [
  { id: 'default', root: resolve('dist'), prefix: new URL(example.site.url).pathname.replace(/\/+$/, '') + '/', config: example, theme: selectedTheme },
  ...[['material', materialTheme], ['monokai', monokaiTheme]].map(([id, theme]) => ({ id, root: resolve(artifacts, id), prefix: '/' + id + '/', config: { ...example, site: { url: 'https://example.com/' + id + '/', theme: id } }, theme })),
  { id: 'no-name', root: resolve(artifacts, 'no-name'), prefix: '/no-name/', config: { profile: { username: 'visitor' }, site: { url: 'https://example.com/no-name/', theme: 'default' }, links: [{ name: 'My chosen GitHub name', url: 'https://github.com/visitor' }, { name: 'Unknown website', url: 'https://unknown.example/path', hostname: true }] }, theme: defaultTheme },
  { id: 'one-word', root: resolve(artifacts, 'one-word'), prefix: '/one-word/', config: { profile: { fullName: 'Émile', username: 'emile' }, site: { url: 'https://example.com/one-word/', theme: 'default' }, links: [] }, theme: defaultTheme },
  { id: 'pages', root: resolve(artifacts, 'pages'), prefix: '/repository/', config: { profile: { fullName: ' José  García ', username: 'jose' }, site: { url: 'https://person.github.io/repository/', theme: 'test-font' }, links: [{ name: 'A much longer custom link name that must wrap gracefully on small screens', url: 'https://unknown.example/long/path', icon: 'website', hostname: true }] }, theme: materialTheme },
];
const routes = [...fixtures].sort((a, b) => b.prefix.length - a.prefix.length);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.xml': 'application/xml', '.txt': 'text/plain' };
let browser;
let server;
const results = [];
const issues = [];
const requests = [];
try {
  await writeFile(customFile, "import theme from './material';\nexport default { ...theme, fonts: { ...theme.fonts } };\n");
  for (const fixture of fixtures.slice(1)) {
    await writeFile('config.yaml', stringify(fixture.config));
    const build = spawnSync(process.execPath, [astro, 'build', '--outDir', fixture.root], { env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }, encoding: 'utf8' });
    assert.equal(build.status, 0, fixture.id + ' build: ' + build.stderr + build.stdout);
  }
  for (const [id, overrides, expected] of [
    ['bad-theme', { site: { url: 'https://example.com/', theme: 'missing-theme' } }, /does not exist.*Available themes/s],
    ['bad-icon', { links: [{ name: 'Test', url: 'https://example.com', icon: 'missing-icon' }] }, /links.0.icon.*does not exist/s],
  ]) {
    await writeFile('config.yaml', stringify({ ...example, ...overrides }));
    const result = spawnSync(process.execPath, [astro, 'build', '--outDir', resolve(artifacts, id)], { env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stdout + result.stderr, expected, 'Useful error for ' + id);
  }
  await writeFile('config.yaml', original);
  server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const route = routes.find(item => pathname.startsWith(item.prefix));
      const relative = pathname.slice(route.prefix.length) || 'index.html';
      const file = resolve(route.root, relative);
      if (!file.startsWith(route.root + '/') && !file.startsWith(route.root + '\\')) { response.writeHead(403).end(); return; }
      response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
      response.end(await readFile(file));
    } catch { response.writeHead(404).end('Not found'); }
  });
  await new Promise(done => server.listen(4322, '127.0.0.1', done));
  const origin = 'http://127.0.0.1:4322';
  const defaultUrl = origin + fixtures[0].prefix;
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const observe = page => {
    page.on('pageerror', error => issues.push(error.message));
    page.on('response', response => { if (response.status() >= 400) issues.push(response.url() + ': ' + response.status()); });
    page.on('request', request => requests.push(request.url()));
  };
  observe(page);
  const widths = [320, 375, 390, 430, 768, 1280, 1920];
  for (const fixture of fixtures) {
    const profile = fixture.config.profile;
    const name = profile.fullName?.trim().replace(/\s+/g, ' ');
    const favicon = await readFile(resolve(fixture.root, 'favicon.svg'), 'utf8');
    assert.ok(favicon.includes(initials({ fullName: name, username: profile.username })));
    const png = await readFile(resolve(fixture.root, 'og.png'));
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
    const html = await readFile(resolve(fixture.root, 'index.html'), 'utf8');
    assert.ok(html.includes(fixture.config.site.url));
    assert.ok(html.includes(sharingImageUrl(fixture.config.site.url, png)));
    assert.ok((await readFile(resolve(fixture.root, 'robots.txt'), 'utf8')).includes(new URL('sitemap.xml', fixture.config.site.url).href));
    assert.ok((await readFile(resolve(fixture.root, 'sitemap.xml'), 'utf8')).includes(fixture.config.site.url));
    for (const colorScheme of ['light', 'dark']) {
      for (const width of fixture.id === 'default' ? widths : [320, 1280]) {
        await page.setViewportSize({ width, height: 840 });
        await page.emulateMedia({ colorScheme });
        await page.goto(origin + fixture.prefix);
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator('h1').innerText(), name || '@' + profile.username);
        assert.deepEqual(await page.locator('.link-name').allTextContents(), fixture.config.links.map(link => link.name));
        assert.equal(await page.locator('.link-card[href]').count(), fixture.config.links.length);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, fixture.id + ' overflow at ' + width);
        const background = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
        const hex = fixture.theme[colorScheme].background;
        const rgb = 'rgb(' + [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16)).join(', ') + ')';
        assert.equal(background, rgb, 'System mode: ' + fixture.id);
        const cards = await page.locator('.link-card').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().height));
        assert.ok(cards.every(height => height >= 44));
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        assert.deepEqual(axe.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })), [], fixture.id + ' accessibility ' + colorScheme);
        if (width === 320 && ['default', 'material', 'monokai', 'pages'].includes(fixture.id)) await page.screenshot({ path: resolve(artifacts, fixture.id + '-' + colorScheme + '.png'), fullPage: true });
        results.push({ fixture: fixture.id, colorScheme, width, overflow: false, violations: 0 });
      }
    }
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(origin + fixture.prefix);
    const toggle = page.getByRole('switch', { name: 'Dark mode' });
    const assertMode = async mode => {
      assert.equal(await toggle.getAttribute('aria-checked'), String(mode === 'dark'));
      const hex = fixture.theme[mode].background;
      const rgb = 'rgb(' + [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16)).join(', ') + ')';
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor), rgb);
      assert.equal(await page.locator('meta[name="theme-color"]').first().getAttribute('content'), hex);
      const svg = decodeURIComponent((await page.locator('link[rel="icon"]').getAttribute('href')).replace('data:image/svg+xml,', ''));
      assert.ok(svg.includes(`fill="${fixture.theme[mode].accent}"`), 'Favicon accent: ' + fixture.id + ' ' + mode);
      assert.ok(!svg.includes('<rect'), 'Transparent favicon: ' + fixture.id);
    };
    await assertMode('light');
    await toggle.focus();
    await page.keyboard.press('Space');
    await assertMode('dark');
    await page.reload();
    await assertMode('dark');
    await page.emulateMedia({ colorScheme: 'dark' });
    await toggle.click();
    await assertMode('light');
    await page.reload();
    await assertMode('light');
    await page.evaluate(() => localStorage.removeItem('link-site-mode'));
    await page.emulateMedia({ colorScheme: 'light' });
    await page.reload();
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForFunction(() => document.querySelector('.mode-toggle').getAttribute('aria-checked') === 'true');
    await assertMode('dark');
  }
  await page.goto(defaultUrl);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').getAttribute('href'), '#links');
  await page.keyboard.press('Enter');
  for (const link of example.links) {
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').getAttribute('href'), link.url);
    assert.notEqual(await page.locator(':focus').evaluate(element => getComputedStyle(element).outlineStyle), 'none');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.link-card').first().evaluate(element => getComputedStyle(element).transitionDuration), '0s');
  await page.setViewportSize({ width: 320, height: 740 });
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, '200% text overflow');
  // The repository fixture is served only at its actual Pages base path.
  await page.goto(origin + '/repository/');
  assert.ok((await page.locator('h1').evaluate(element => getComputedStyle(element).fontFamily)).includes('Open Sans'));
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const staticPage = await noJs.newPage();
  observe(staticPage);
  await staticPage.goto(defaultUrl);
  assert.equal(await staticPage.locator('.link-card[href]').count(), example.links.length);
  assert.equal(await staticPage.locator('h1').innerText(), example.profile.fullName);
  assert.equal(await staticPage.locator('.mode-toggle').isVisible(), false);
  await noJs.close();
  assert.deepEqual(issues, []);
  assert.ok(requests.every(url => url.startsWith(origin)), 'No remote icon, metadata, or font requests');
  await writeFile(resolve(artifacts, 'results.json'), JSON.stringify({ result: 'passed', layouts: results, requests: requests.length, checks: ['all themes and modes', 'runtime appearance switch and persistence', 'custom font and Pages base', 'no full name', 'one-word Unicode name', 'dynamic link counts', 'generated OG/favicon', 'keyboard', '200% text', 'reduced motion', 'no JavaScript', 'zero remote requests'] }, null, 2));
  console.log('Passed ' + results.length + ' layouts, all theme modes, configuration fixtures, generated assets, fonts, Pages base paths, keyboard, and no-JavaScript checks.');
} finally {
  await writeFile('config.yaml', original);
  await rm(customFile, { force: true });
  if (browser) await browser.close();
  if (server) await new Promise(done => server.close(done));
}
