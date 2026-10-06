import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';

export function verifyAppearance(html, configuredMode) {
  const htmlTag = html.match(/<html\b[^>]*>/)[0];
  if (configuredMode) assert.ok(htmlTag.includes(`data-mode="${configuredMode}"`));
  else assert.ok(!htmlTag.includes('data-mode='), 'System mode does not force an appearance');
  const initialization = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const runtime = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];

  for (const mode of [undefined, 'light', 'dark']) {
    for (const saved of [undefined, 'light', 'dark', 'invalid']) {
      for (const systemDark of [false, true]) {
        for (const storageBlocked of [false, true]) {
          const root = { dataset: mode ? { mode } : {} };
          const events = {};
          root.addEventListener = (key, listener) => { events[key] = listener; };
          const toggle = { hidden: true, setAttribute: (key, value) => { toggle[key] = value; }, addEventListener: (key, listener) => { events[key] = listener; } };
          const favicon = { dataset: { initials: 'VK' }, href: '' };
          const metas = ['light-color', 'dark-color'].map(content => ({ content, removeAttribute() {} }));
          const system = { matches: systemDark, addEventListener: (key, listener) => { events[key] = listener; } };
          let persisted;
          const context = {
            document: { documentElement: root, querySelector: selector => selector === '.mode-toggle' ? toggle : favicon, querySelectorAll: () => metas },
            getComputedStyle: () => ({ getPropertyValue: key => {
              const dark = root.dataset.mode ? root.dataset.mode === 'dark' : system.matches;
              return key === '--accent' ? (dark ? '#d0bcff' : '#6750a4') : (dark ? 'dark-color' : 'light-color');
            } }),
            window: { matchMedia: () => system },
            localStorage: {
              getItem: () => { if (storageBlocked) throw new Error('Storage unavailable'); return saved; },
              setItem: (key, value) => { if (storageBlocked) throw new Error('Storage unavailable'); assert.equal(key, 'link-site-mode'); persisted = value; },
            },
          };
          runInNewContext(initialization, context);
          runInNewContext(runtime, context);
          const effectiveMode = !storageBlocked && ['light', 'dark'].includes(saved) ? saved : mode;
          const expectedDark = effectiveMode ? effectiveMode === 'dark' : systemDark;
          assert.equal(toggle.hidden, false, 'Toggle stays available in every mode');
          assert.equal(toggle['aria-checked'], String(expectedDark));
          assert.equal(metas[0].content, expectedDark ? 'dark-color' : 'light-color');
          const assertFavicon = dark => {
            const svg = decodeURIComponent(favicon.href.replace('data:image/svg+xml,', ''));
            assert.ok(svg.includes(`fill="${dark ? '#d0bcff' : '#6750a4'}"`), 'Favicon follows effective appearance');
            assert.ok(svg.includes('>VK</text>') && !svg.includes('<rect'));
          };
          assertFavicon(expectedDark);
          system.matches = !systemDark;
          events.change();
          const afterSystemDark = effectiveMode ? expectedDark : !systemDark;
          assert.equal(toggle['aria-checked'], String(afterSystemDark), 'System changes only affect system appearance');
          assertFavicon(afterSystemDark);
          events.click();
          const switchedMode = afterSystemDark ? 'light' : 'dark';
          assert.equal(root.dataset.mode, switchedMode);
          assert.equal(toggle['aria-checked'], String(!afterSystemDark));
          assert.equal(toggle.title, afterSystemDark ? 'Switch to dark mode' : 'Switch to light mode');
          assert.equal(metas[1].content, afterSystemDark ? 'light-color' : 'dark-color');
          assert.equal(persisted, storageBlocked ? undefined : switchedMode);
          assertFavicon(!afterSystemDark);
          system.matches = !system.matches;
          events.change();
          assert.equal(root.dataset.mode, switchedMode, 'User choice survives later system changes');
        }
      }
    }
  }
}
