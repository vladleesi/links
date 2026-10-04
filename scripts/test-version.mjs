import assert from 'node:assert/strict';
import { verifyVersion } from './verify-version.mjs';
import { releaseNotes } from './release-notes.mjs';

const input = { packageVersion: '1.2.3', lockVersion: '1.2.3', lockRootVersion: '1.2.3' };
assert.equal(verifyVersion(input), '1.2.3');
assert.equal(verifyVersion({ ...input, tag: 'v1.2.3' }), '1.2.3');
assert.equal(verifyVersion({ packageVersion: '0.0.0', lockVersion: '0.0.0', lockRootVersion: '0.0.0' }), '0.0.0');
for (const packageVersion of [undefined, '', '1.2', 'v1.2.3', '01.2.3', '1.02.3', '1.2.03', '-1.2.3', '1.2.3-beta.1', '1.2.3+build']) {
  assert.throws(() => verifyVersion({ ...input, packageVersion }), /MAJOR.MINOR.PATCH/);
}
for (const field of ['lockVersion', 'lockRootVersion']) {
  for (const value of [undefined, '1.2.4']) assert.throws(() => verifyVersion({ ...input, [field]: value }), /must match package.json/);
}
for (const tag of ['', '1.2.3', 'v1.2.4', 'v1.2.3-beta', 'v1.2.3;echo bad']) {
  assert.throws(() => verifyVersion({ ...input, tag }), /Release tag must be v1.2.3/);
}
const changelog = '# Changelog\n\n## 1.2.3 - 2026-10-04\n\n### Added\n\n- A feature.\n\n## 1.2.2 - 2026-10-03\n\n- Previous changes.\n';
assert.equal(releaseNotes(changelog, '1.2.3'), '## 1.2.3 - 2026-10-04\n\n### Added\n\n- A feature.\n');
assert.equal(releaseNotes(changelog.replaceAll('\n', '\r\n'), '1.2.3').includes('A feature.'), true);
assert.throws(() => releaseNotes(changelog, '1.2.4'), /expected one dated entry/);
assert.throws(() => releaseNotes(changelog + '\n## 1.2.3 - 2026-10-05\n\nDuplicate.\n', '1.2.3'), /expected one dated entry/);
assert.throws(() => releaseNotes('## 1.2.3 - 2026-10-04\n\n', '1.2.3'), /empty/);
assert.throws(() => releaseNotes('## 1.2.3 - 2026-10-04', '1.2.3'), /empty/);
assert.throws(() => releaseNotes(changelog, '1.2.3-beta'), /Invalid release version/);
console.log('Passed version format, lockfile consistency, release tag validation, and versioned release notes.');
