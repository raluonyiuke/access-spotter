import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

test('help explains the actual development status and limitations', () => {
  for (const args of [[], ['--help'], ['-h']]) {
    const result = run(...args);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /arc scan <url>/);
    assert.match(result.stdout, /human review still required/);
    assert.match(result.stdout, /does not certify ADA compliance/);
    assert.equal(result.stderr, '');
  }
});

test('version matches the package metadata', () => {
  const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  for (const flag of ['--version', '-v']) {
    const result = run(flag);
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), version);
  }
});

test('bad arguments never return a clean result', () => {
  for (const args of [['scan'], ['example.com'], ['--unknown'], ['--help', 'https://example.com'], ['--version', '--unknown'], ['scan', 'https://example.com', '--wcag', '3.0'], ['scan', 'https://example.com', '--timeout', '-1']]) {
    const result = run(...args);
    assert.equal(result.status, 2);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /Access-Spotter:/);
  }
});
