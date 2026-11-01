import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import type { Readable } from 'node:stream';
import { chromium } from 'playwright';
import { safeText } from './output.js';

const require = createRequire(import.meta.url);

export function relayInstallerOutput(source: Readable, write: (line: string) => void = line => { process.stderr.write(line); }): void {
  source.setEncoding('utf8');
  let pending = '';
  let dropping = false;
  const flush = () => {
    if (!dropping && pending) write(`${safeText(pending)}\n`);
    pending = '';
    dropping = false;
  };
  source.on('data', (chunk: string) => {
    // Buffer complete lines so split URL credentials cannot evade redaction.
    for (const part of chunk.split(/([\r\n])/)) {
      if (part === '\r' || part === '\n') flush();
      else if (!dropping) {
        pending += part;
        if (pending.length > 65_536) {
          write('[Oversized installer message omitted]\n');
          pending = '';
          dropping = true;
        }
      }
    }
  });
  source.once('end', flush);
}

export async function installBrowser(timeout = 600_000, signal?: AbortSignal): Promise<void> {
  process.stderr.write('Access-Spotter: downloading or checking Chromium through Playwright (first download about 200 MB).\n');
  const installSignal = signal ? AbortSignal.any([signal, AbortSignal.timeout(timeout)]) : AbortSignal.timeout(timeout);
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [join(dirname(require.resolve('playwright')), 'cli.js'), 'install', '--no-shell', 'chromium'], {
      stdio: ['ignore', 'pipe', 'pipe'], signal: installSignal,
    });
    relayInstallerOutput(child.stdout);
    relayInstallerOutput(child.stderr);
    const installError = () => new Error(signal?.aborted ? 'Browser setup interrupted.' : `Chromium setup exceeded ${timeout} ms. Retry with a larger --install-timeout value.`);
    child.once('error', error => reject(installSignal.aborted ? installError() : error));
    child.once('close', code => {
      if (installSignal.aborted) reject(installError());
      else if (code === 0) resolve();
      else reject(new Error('Chromium installation failed. Check your connection and run access-spotter setup again.'));
    });
  });
}

export async function ensureBrowser(install: boolean, timeout: number, signal: AbortSignal): Promise<void> {
  // channel: chromium below uses this full browser, rather than headless-shell.
  if (existsSync(chromium.executablePath())) return;
  if (!install) throw new Error('Chromium is not installed. Run access-spotter setup, then retry your scan.');
  await installBrowser(timeout, signal);
}
