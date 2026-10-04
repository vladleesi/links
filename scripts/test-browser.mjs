import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve('dist');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const file = resolve(root, '.' + (url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)));
    if (!file.startsWith(root + '\\') && !file.startsWith(root + '/')) { response.writeHead(403).end(); return; }
    response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    response.end(await readFile(file));
  } catch { response.writeHead(404).end('Not found'); }
});
await new Promise(resolve => server.listen(4322, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:4322';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  await mkdir('artifacts', { recursive: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const remoteRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith(origin)) remoteRequests.push(request.url()); });
  for (const [width, height] of [[320, 740], [375, 812], [390, 844], [430, 932], [768, 1024], [1280, 900], [1920, 1080], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await page.goto(origin);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(650);
    const state = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      cards: [...document.querySelectorAll('.link-card')].map(card => ({ width: card.getBoundingClientRect().width, height: card.getBoundingClientRect().height })),
      avatarLoaded: document.querySelector('.portrait').complete && document.querySelector('.portrait').naturalWidth > 0,
      avatarRequests: performance.getEntriesByType('resource').filter(resource => /\/avatar(?:-192)?\.webp/.test(resource.name)).length,
      preload: document.querySelector('link[rel="preload"][as="image"]')?.getAttribute('href'),
    }));
    assert.equal(state.overflow, false, `No overflow at ${width}×${height}`);
    assert.equal(state.avatarLoaded, true);
    assert.equal(state.avatarRequests, 1, 'Preload and portrait share one request');
    assert.equal(state.preload, '/images/avatar.webp');
    assert.equal(state.cards.length, 5);
    assert.ok(state.cards.every(card => card.width >= 240 && card.height >= 44));
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    assert.deepEqual(axe.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })), [], `Accessibility at ${width}`);
    await page.screenshot({ path: `artifacts/layout-${width}x${height}.png`, fullPage: true });
    results.push({ width, height, ...state, accessibilityViolations: axe.violations.length });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(origin);
  assert.equal(await page.locator('.link-card').first().evaluate(element => getComputedStyle(element).animationName), 'none');
  assert.equal(await page.locator('.link-card').first().evaluate(element => getComputedStyle(element).transitionDuration), '0s');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').getAttribute('href'), '#links');
  await page.keyboard.press('Enter');
  for (const href of ['https://vladleesi.dev', 'https://github.com/vladleesi', 'https://www.linkedin.com/in/vladkochetov', 'https://x.com/vladleesi', 'mailto:hello@vladleesi.dev']) {
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').getAttribute('href'), href, 'Keyboard reaches every card in order');
    assert.notEqual(await page.locator(':focus').evaluate(element => getComputedStyle(element).outlineStyle), 'none');
  }
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No overflow with 200% text');
  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const touchPage = await touch.newPage();
  await touchPage.goto(origin);
  await touchPage.waitForTimeout(700);
  const box = await touchPage.locator('.link-card').first().boundingBox();
  const session = await touch.newCDPSession(touchPage);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + 30, y: box.y + 30 }] });
  await touchPage.waitForFunction(() => getComputedStyle(document.querySelector('.link-card')).borderTopColor === 'rgb(255, 180, 95)');
  assert.equal(await touchPage.locator('.link-card').first().evaluate(element => getComputedStyle(element).borderTopColor), 'rgb(255, 180, 95)', 'Visible touch press feedback');
  await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await touch.close();
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const staticPage = await noJs.newPage();
  await staticPage.goto(origin);
  assert.equal(await staticPage.locator('h1').innerText(), 'Vladislav Kochetov.');
  assert.equal(await staticPage.locator('.link-card[href]').count(), 5);
  await staticPage.screenshot({ path: 'artifacts/no-javascript.png', fullPage: true });
  await noJs.close();
  assert.deepEqual(errors, []);
  assert.deepEqual(remoteRequests, [], 'No third-party browser requests');
  await writeFile('artifacts/browser-results.json', JSON.stringify({ result: 'passed', layouts: results, checks: ['keyboard and focus', 'reduced motion', 'touch feedback', '200% text', 'no JavaScript', 'zero third-party requests', 'zero console errors'] }, null, 2));
  console.log(`Passed ${results.length} layouts, accessibility, keyboard, touch, reduced motion, 200% text, and no-JavaScript checks.`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
