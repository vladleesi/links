import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function releaseNotes(changelog, version) {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) throw new Error('Invalid release version.');
  const heading = new RegExp(`^${version.replaceAll('.', '\\.')} - \\d{4}-\\d{2}-\\d{2}$`);
  const entries = changelog.split(/^## /m).slice(1).filter(entry => heading.test(entry.split(/\r?\n/, 1)[0].trim()));
  if (entries.length !== 1) throw new Error(`CHANGELOG.md: expected one dated entry for ${version}.`);
  const entry = entries[0].trim();
  if (!entry.slice(entry.indexOf('\n') + 1).trim() || !entry.includes('\n')) throw new Error(`CHANGELOG.md: release notes for ${version} are empty.`);
  return `## ${entry}\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
  process.stdout.write(releaseNotes(readFileSync('CHANGELOG.md', 'utf8'), version));
}
