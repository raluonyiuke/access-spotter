import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { startFixture } from '../helpers/fixtures.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const { version } = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
const execute = promisify(execFile);
const npmCli = process.env.npm_execpath;

async function npm(args, cwd, expected = 0, env = {}) {
  assert.ok(npmCli, 'Run this test through npm run test:package.');
  try {
    const result = await execute(process.execPath, [npmCli, ...args], { cwd, timeout: 600_000, maxBuffer: 4_000_000, env: { ...process.env, ...env } });
    assert.equal(expected, 0, 'Command should have returned the expected failure code.');
    return result.stdout;
  } catch (error) {
    assert.equal(error.code, expected, error.stdout + '\n' + error.stderr);
    return error.stdout;
  }
}

test('release tarball installs without build tools and all commands scan real pages', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'access-recheck-package-'));
  const fixture = await startFixture();
  try {
    await npm(['pack', '--pack-destination', temporary, '--silent'], root);
    const archive = join(temporary, `access-recheck-${version}.tgz`);
    const prefix = join(temporary, 'installed');
    // Normal install, including lifecycle scripts, but no dev dependencies.
    await npm(['install', '--prefix', prefix, '--omit=dev', '--no-audit', '--no-fund', archive], temporary);
    const installed = join(prefix, 'node_modules', 'access-recheck');
    await assert.rejects(readFile(join(prefix, 'node_modules', 'typescript', 'package.json')));
    for (const alias of ['access-recheck', 'arc', 'accessrecheck']) {
      const invoke = args => ['exec', '--offline', '--prefix', prefix, '--', alias, ...args];
      assert.match(await npm(invoke(['--help']), temporary), /arc scan <url>/);
      assert.equal((await npm(invoke(['--version']), temporary)).trim(), version);
      const broken = JSON.parse(await npm(invoke(['scan', `${fixture.origin}/broken`, '--no-install', '--wait', '0', '--json']), temporary, 1));
      assert.equal(broken.summary.decision, 'fail');
      assert.ok(broken.viewports.every(viewport => viewport.violations.some(item => item.ruleId === 'image-alt')));
    }
    if (process.env.ACCESSRECHECK_TEST_FIRST_INSTALL === '1') {
      const env = { PLAYWRIGHT_BROWSERS_PATH: join(temporary, 'fresh-browsers') };
      const first = JSON.parse(await npm(['exec', '--offline', '--prefix', prefix, '--', 'arc', 'scan', `${fixture.origin}/clean`, '--wait', '0', '--json'], temporary, 0, env));
      assert.equal(first.summary.decision, 'needs-human-review');
      assert.match(await npm(['exec', '--offline', '--prefix', prefix, '--', 'arc', 'setup', '--install-timeout', '600000'], temporary, 0, env), /Chromium is ready/);
    }
    const clean = JSON.parse(await npm(['exec', '--offline', '--prefix', prefix, '--', 'arc', 'scan', `${fixture.origin}/clean`, '--no-install', '--wait', '0', '--json'], temporary));
    assert.equal(clean.summary.decision, 'needs-human-review');
    const readme = await readFile(join(installed, 'README.md'), 'utf8');
    for (const [, link] of readme.matchAll(/\]\(([^)]+)\)/g)) {
      if (!/^(https?:|#)/.test(link)) await readFile(join(installed, link.split('#')[0]));
    }
  } finally {
    await fixture.close();
    await rm(temporary, { recursive: true, force: true });
  }
});
