import assert from 'node:assert/strict';
import { verifyVersion } from './verify-version.mjs';

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
console.log('Passed version format, lockfile consistency, and release tag validation.');
