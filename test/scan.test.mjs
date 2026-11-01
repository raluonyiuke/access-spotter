import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, test } from 'node:test';
import { startFixture } from './helpers/fixtures.mjs';

const execute = promisify(execFile);
const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
let fixture;
before(async () => { fixture = await startFixture(); });
after(async () => { await fixture.close(); });

async function run(path, ...args) {
  try {
    const result = await execute(process.execPath, [cli, 'scan', `${fixture.origin}${path}`, '--json', '--no-install', '--wait', '0', ...args], { timeout: 30_000, maxBuffer: 4_000_000 });
    return { ...result, code: 0, report: JSON.parse(result.stdout) };
  } catch (error) {
    assert.equal(typeof error.code, 'number', error.message);
    return { ...error, report: JSON.parse(error.stdout) };
  }
}

test('broken page reports real failures, selectors, guidance, and both viewports', async () => {
  const result = await run('/broken');
  assert.equal(result.code, 1, result.stderr);
  assert.equal(result.report.summary.decision, 'fail');
  assert.deepEqual(result.report.viewports.map(v => v.width), [1280, 390]);
  for (const viewport of result.report.viewports) {
    const rules = viewport.violations.map(v => v.ruleId);
    for (const rule of ['image-alt', 'label', 'button-name', 'link-name', 'color-contrast']) assert.ok(rules.includes(rule), rule);
    const image = viewport.violations.find(v => v.ruleId === 'image-alt');
    assert.ok(image.wcagCriteria.includes('1.1.1'));
    assert.ok(image.nodes[0].target.length);
    assert.ok(image.nodes[0].guidance);
    assert.ok(!('html' in image.nodes[0]));
  }
});

test('clean fixture returns 0 but still requires human evaluation and never submits forms', async () => {
  const result = await run('/clean?secret=do-not-print#private-fragment');
  assert.equal(result.code, 0, result.stderr);
  assert.equal(result.report.summary.decision, 'needs-human-review');
  assert.ok(result.report.manualChecks.every(check => check.status === 'untested'));
  assert.ok(result.report.viewports.every(v => v.automatedPasses.length > 0));
  assert.ok(!result.stdout.includes('do-not-print'));
  assert.ok(!result.stdout.includes('private-fragment'));
  assert.ok(fixture.visits.every(v => v.method === 'GET'));
});

test('incomplete engine results and iframe omissions remain visible', async () => {
  const review = await run('/review');
  assert.equal(review.code, 0, review.stderr);
  assert.ok(review.report.viewports.some(v => v.needsReview.some(item => item.ruleId === 'color-contrast')));
  const frames = await run('/frame');
  assert.equal(frames.code, 0, frames.stderr);
  assert.ok(frames.report.viewports.every(v => v.iframeCount === 1));
  assert.ok(frames.report.limitations.some(line => line.includes('Iframe')));
});

test('WCAG profiles include cumulative tags and keep Parsing needs-review in older versions', async () => {
  for (const version of ['2.0', '2.1', '2.2']) {
    const result = await run('/targets', '--wcag', version);
    assert.ok([0, 1].includes(result.code), result.stderr);
    const targetSize = result.report.viewports.some(v => v.violations.some(item => item.ruleId === 'target-size'));
    assert.equal(targetSize, version === '2.2');
    assert.equal(result.report.manualChecks.some(check => check.id === '4.1.1'), version !== '2.2');
  }
});

test('HTTP errors, non-HTML, and unexpected origins are execution errors', async () => {
  for (const path of ['/missing', '/data', '/redirect']) {
    const result = await run(path);
    assert.equal(result.code, 2);
    assert.equal(result.report.status, 'error');
    assert.ok(!result.report.viewports);
  }
  assert.equal((await run('/redirect', '--allow-redirect')).code, 0);
});

test('total deadline stops a stalled navigation and readiness selector waits for late content', async () => {
  const timeout = await run('/slow', '--timeout', '1000');
  assert.equal(timeout.code, 2);
  assert.match(timeout.report.error, /exceeded|Timeout/i);
  const delayed = await run('/delayed', '--wait-for', '#ready');
  assert.equal(delayed.code, 1, delayed.stderr);
  assert.ok(delayed.report.viewports.every(v => v.violations.some(item => item.ruleId === 'button-name')));
});

test('JSON evidence is written on failures; file errors return 2 without a completed result', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'access-spotter-evidence-'));
  try {
    const output = join(dir, 'scan.json');
    const result = await run('/broken', '--output', output);
    assert.equal(result.code, 1);
    assert.deepEqual(JSON.parse(await readFile(output, 'utf8')), result.report);
    const error = await run('/clean', '--output', dir);
    assert.equal(error.code, 2);
    assert.equal(error.report.status, 'error');
    assert.deepEqual(await readdir(dir), ['scan.json']);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('CSP does not prevent evaluation and no-install handles a missing browser clearly', async () => {
  assert.equal((await run('/csp')).code, 0);
  const cache = await mkdtemp(join(tmpdir(), 'access-spotter-no-browser-'));
  try {
    await assert.rejects(execute(process.execPath, [cli, 'scan', `${fixture.origin}/clean`, '--json', '--no-install'], {
      env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: cache }, timeout: 10_000,
    }), error => {
      assert.equal(error.code, 2);
      assert.equal(JSON.parse(error.stdout).status, 'error');
      assert.match(error.stderr, /arc setup/);
      return true;
    });
  } finally { await rm(cache, { recursive: true, force: true }); }
});

for (const [signal, expected] of [['SIGINT', 130], ['SIGTERM', 143]]) {
test(`${signal} cancels a stalled scan and preserves previous evidence`, { skip: process.platform === 'win32' }, async t => {
  const previousRequests = fixture.visits.filter(item => item.path === '/slow').length;
  const directory = await mkdtemp(join(tmpdir(), 'access-spotter-cancel-'));
  const output = join(directory, 'evidence.json');
  const original = '{"previous":"evidence"}\n';
  const { writeFile } = await import('node:fs/promises');
  await writeFile(output, original);
  t.after(() => rm(directory, { recursive: true, force: true }));
  const child = spawn(process.execPath, [cli, 'scan', `${fixture.origin}/slow`, '--no-install', '--json', '--output', output]);
  let stdout = '';
  child.stdout.on('data', chunk => { stdout += chunk; });
  const exited = new Promise(resolve => child.once('exit', code => resolve(code)));
  t.after(() => { if (child.exitCode === null) child.kill('SIGTERM'); });
  const deadline = Date.now() + 10_000;
  while (fixture.visits.filter(item => item.path === '/slow').length === previousRequests) {
    assert.ok(Date.now() < deadline, 'Child did not start navigating in time');
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  child.kill(signal);
  const killTimer = setTimeout(() => child.kill('SIGKILL'), 5000);
  try {
    assert.equal(await exited, expected);
    assert.equal(JSON.parse(stdout).status, 'error');
    assert.equal(await readFile(output, 'utf8'), original);
  } finally { clearTimeout(killTimer); }
});
}

test('a late navigation or second-viewport failure cannot produce a completed result', async () => {
  for (const [path, args] of [['/late-redirect', ['--wait', '300']], ['/second-fails', []]]) {
    const result = await run(path, ...args);
    assert.equal(result.code, 2, result.stderr);
    assert.equal(result.report.status, 'error');
    assert.ok(!result.report.viewports);
  }
});

test('first-use browser installation keeps stdout valid JSON even when the download fails', async () => {
  const cache = await mkdtemp(join(tmpdir(), 'access-spotter-download-'));
  try {
    await assert.rejects(execute(process.execPath, [cli, 'scan', `${fixture.origin}/clean`, '--json'], {
      env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: cache, PLAYWRIGHT_DOWNLOAD_HOST: `${fixture.origin}/browser-mirror` },
      timeout: 30_000, maxBuffer: 4_000_000,
    }), error => {
      assert.equal(error.code, 2);
      assert.equal(JSON.parse(error.stdout).status, 'error');
      assert.match(error.stderr, /Chromium through Playwright/);
      assert.ok(fixture.visits.some(item => item.path.startsWith('/browser-mirror')));
      return true;
    });
  } finally { await rm(cache, { recursive: true, force: true }); }
});

test('default terminal output gives developers a selector, guidance, references, and human checks', async () => {
  await assert.rejects(execute(process.execPath, [cli, 'scan', `${fixture.origin}/broken`, '--no-install', '--wait', '0'], {
    timeout: 30_000, maxBuffer: 4_000_000,
  }), error => {
    assert.equal(error.code, 1);
    for (const text of ['FAIL: image-alt', 'Element:', 'Guidance:', 'Learn more:', 'Human checks still required:', 'does not certify ADA compliance']) {
      assert.ok(error.stdout.includes(text), text);
    }
    assert.equal(error.stderr, '');
    return true;
  });
});
