import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function verifyVersion({ packageVersion, lockVersion, lockRootVersion, tag }) {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(packageVersion)) {
    throw new Error('package.json: version must use MAJOR.MINOR.PATCH without leading zeros or prerelease suffixes.');
  }
  if (lockVersion !== packageVersion || lockRootVersion !== packageVersion) {
    throw new Error('package-lock.json: both version fields must match package.json. Use the version:patch/minor/major scripts.');
  }
  if (tag !== undefined && tag !== `v${packageVersion}`) {
    throw new Error(`Release tag must be v${packageVersion}; received ${tag}.`);
  }
  return packageVersion;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  const version = verifyVersion({ packageVersion: pkg.version, lockVersion: lock.version, lockRootVersion: lock.packages?.['']?.version, tag: process.argv[2] });
  console.log(`Version ${version} is consistent${process.argv[2] ? ' with tag ' + process.argv[2] : ''}.`);
}
