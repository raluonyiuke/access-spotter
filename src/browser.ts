import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { cleanText } from './output.js';

const require = createRequire(import.meta.url);

export async function installBrowser(timeout = 600_000, signal?: AbortSignal): Promise<void> {
  process.stderr.write('AccessRecheck: downloading or checking Chromium through Playwright (first download about 200 MB).\n');
  const installSignal = signal ? AbortSignal.any([signal, AbortSignal.timeout(timeout)]) : AbortSignal.timeout(timeout);
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [join(dirname(require.resolve('playwright')), 'cli.js'), 'install', '--no-shell', 'chromium'], {
      stdio: ['ignore', 'pipe', 'pipe'], signal: installSignal,
    });
    child.stdout.on('data', (chunk: Buffer) => process.stderr.write(`${cleanText(chunk.toString())}\n`));
    child.stderr.on('data', (chunk: Buffer) => process.stderr.write(`${cleanText(chunk.toString())}\n`));
    const installError = () => new Error(signal?.aborted ? 'Browser setup interrupted.' : `Chromium setup exceeded ${timeout} ms. Retry with a larger --install-timeout value.`);
    child.once('error', error => reject(installSignal.aborted ? installError() : error));
    child.once('exit', code => {
      if (installSignal.aborted) reject(installError());
      else if (code === 0) resolve();
      else reject(new Error('Chromium installation failed. Check your connection and run arc setup again.'));
    });
  });
}

export async function ensureBrowser(install: boolean, timeout: number, signal: AbortSignal): Promise<void> {
  // channel: chromium below uses this full browser, rather than headless-shell.
  if (existsSync(chromium.executablePath())) return;
  if (!install) throw new Error('Chromium is not installed. Run arc setup, then retry your scan.');
  await installBrowser(timeout, signal);
}
