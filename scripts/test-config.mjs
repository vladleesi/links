import assert from 'node:assert/strict';
import { stringify } from 'yaml';
import { parseConfig, initials } from '../src/lib/config.ts';
import { detectIcon, services } from '../src/lib/services.ts';

const example = { profile: { fullName: 'Vladislav Kochetov', username: 'vladleesi' }, site: { url: 'https://example.com', theme: 'default' }, links: [] };
const parse = value => parseConfig(stringify(value));
assert.equal(parse(example).site.url, 'https://example.com/');
assert.equal(parse(example).site.mode, undefined);
for (const mode of [null, '', '   ']) assert.equal(parse({ ...example, site: { ...example.site, mode } }).site.mode, undefined);
for (const mode of ['light', 'dark']) assert.equal(parse({ ...example, site: { ...example.site, mode: ` ${mode} ` } }).site.mode, mode);
for (const mode of ['system', 'auto', 'DARK', true, 1]) assert.throws(() => parse({ ...example, site: { ...example.site, mode } }), /site.mode/);
assert.equal(parse(example).profile.title, undefined);
for (const title of [null, '', '   ']) assert.equal(parse({ ...example, profile: { ...example.profile, title } }).profile.title, undefined);
assert.equal(parse({ ...example, profile: { username: 'vladleesi', title: '  Mobile   software engineer  ' } }).profile.title, 'Mobile software engineer');
assert.throws(() => parse({ ...example, profile: { ...example.profile, title: 42 } }), /profile.title/);
for (const [fullName, username, expected] of [
  ['Vladislav Kochetov', 'vladleesi', 'VK'], ['  vladislav   kochetov  ', 'vladleesi', 'VK'],
  [undefined, 'vladleesi', 'VL'], ['', 'vladleesi', 'VL'], [null, 'vladleesi', 'VL'],
  ['Vladislav', 'vladleesi', 'VL'], ['a', 'a', 'A'], ['李 小龙', 'li', '李小'],
  ['Émile', 'emile', 'ÉM'], ['e\u0301mile', 'emile', 'ÉM'], ['--- José   García ---', 'jose', 'JG'],
]) {
  const config = parse({ ...example, profile: { fullName, username } });
  assert.equal(initials(config.profile).normalize('NFC'), expected);
}
for (const username of ['', ' ', '@', 'with spaces']) assert.throws(() => parse({ ...example, profile: { username } }), /profile.username/);
assert.throws(() => parse({ ...example, profile: {} }), /profile.username/);
for (const url of ['bad', 'javascript:alert(1)', 'ftp://example.com', 'https://user:secret@example.com', 'https://example.com/?query=1']) assert.throws(() => parse({ ...example, site: { url } }), /site.url/);
for (const url of ['bad', 'javascript:alert(1)', 'data:text/html,test', 'mailto:broken', 'https://user:secret@example.com']) assert.throws(() => parse({ ...example, links: [{ name: 'Link', url }] }), /links.0.url/);
assert.throws(() => parseConfig('profile:\n  username: one\n  username: two'), /config.yaml/);
assert.throws(() => parseConfig('profile: ['), /config.yaml/);
for (const [icon, domains] of Object.entries(services)) for (const domain of domains) {
  assert.equal(detectIcon('https://' + domain + '/person'), icon);
  assert.equal(detectIcon('https://www.' + domain + '/person'), icon);
  assert.equal(detectIcon('https://' + domain + '.evil.example/person'), 'website');
}
assert.equal(detectIcon('https://unknown.example'), 'website');
assert.equal(detectIcon('mailto:hello@example.com'), 'email');
assert.equal(detectIcon('https://youtu.be/example'), 'youtube');
const dynamic = parse({ ...example, links: [{ name: 'Name I chose', url: 'https://github.com/visitor' }, { name: 'Other', url: 'https://example.com' }] });
assert.deepEqual(dynamic.links.map(link => link.name), ['Name I chose', 'Other']);
assert.equal(parse(example).links.length, 0);
assert.equal(parse({ ...example, site: { url: 'https://person.github.io/repository' } }).site.url, 'https://person.github.io/repository/');
console.log('Passed validation, Unicode initials, link order/counts, safe URL schemes, and every service-domain mapping.');
