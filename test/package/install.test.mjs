import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../../', import.meta.url));
const { version } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 120_000 });
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${command} failed:\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

test('packed package installs both commands and includes linked documentation', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'accessrecheck-package-'));
  try {
    run('npm', ['pack', '--pack-destination', temporary, '--silent'], root);
    const archive = join(temporary, `accessrecheck-${version}.tgz`);
    const prefix = join(temporary, 'installed');
    run('npm', ['install', '--prefix', prefix, '--ignore-scripts', '--no-audit', '--no-fund', archive], temporary);

    for (const alias of ['accessrecheck', 'arc']) {
      const command = join(prefix, 'node_modules', '.bin', alias);
      const help = run(command, ['--help'], temporary);
      assert.match(help, /AccessRecheck/);
      assert.match(help, /Scanning is not implemented yet/);
      assert.equal(run(command, ['--version'], temporary).trim(), version);
      const scan = spawnSync(command, ['scan', 'https://example.com'], {
        cwd: temporary, encoding: 'utf8', timeout: 10_000,
      });
      assert.ifError(scan.error);
      assert.equal(scan.status, 2);
      assert.equal(scan.stdout, '');
    }

    const installed = join(prefix, 'node_modules', 'accessrecheck');
    const readme = readFileSync(join(installed, 'README.md'), 'utf8');
    for (const [, link] of readme.matchAll(/\]\(([^)]+)\)/g)) {
      if (!/^(https?:|#)/.test(link)) {
        assert.ok(existsSync(join(installed, link)), `Missing README target: ${link}`);
      }
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
