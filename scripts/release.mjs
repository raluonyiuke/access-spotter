import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
if (!process.env.npm_execpath) throw new Error('Run npm run release:pack.');
const directory = process.argv[2] ? resolve(process.argv[2]) : mkdtempSync(join(tmpdir(), 'accessrecheck-release-'));
mkdirSync(directory, { recursive: true });
const result = spawnSync(process.execPath, [process.env.npm_execpath, 'pack', '--pack-destination', directory, '--silent'], {
  cwd: root, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8',
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
const filename = `accessrecheck-${version}.tgz`;
const archive = join(directory, filename);
const digest = createHash('sha256').update(readFileSync(archive)).digest('hex');
const checksum = join(directory, 'SHA256SUMS');
writeFileSync(checksum, `${digest}  ${filename}\n`);
console.log(JSON.stringify({ directory, archive, checksum, sha256: digest }));
