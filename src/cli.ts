#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { scan, validateUrl } from './scan.js';
import { installBrowser } from './browser.js';
import { renderReport, safeText, writeReport } from './output.js';
import type { WcagVersion } from './model.js';

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
const help = `Access-Spotter
Find accessibility issues on new and existing websites.
For developers and people building websites.

Usage: arc scan <url> [options]
       access-spotter <url> [options]
       arc setup

Options:
  -h, --help           Show this help
  -v, --version        Show the version
  --wcag <version>    Automated WCAG A/AA tags: 2.0, 2.1, or 2.2 (default 2.2)
  --json              Write machine-readable JSON to stdout
  --output <path>     Also save JSON evidence (replaces an existing file)
  --install-timeout <ms>  Browser download deadline (default 600000)
  --timeout <ms>      Total scan timeout, excluding install (default 60000)
  --wait <ms>         Settle time after each page load (default 1000)
  --wait-for <css>    Wait for a visible selector before scanning each viewport
  --no-install        Do not auto-download a missing Chromium browser
  --allow-redirect    Allow navigation to a different origin

Scans one page at 1280 x 800 and 390 x 844. Missing Chromium downloads on first
use (about 200 MB); arc setup installs it in advance. Download progress goes to stderr.
No crawling, interactive manual-review recording, HTML reports, or baselines yet.

Exit codes: 0 = no automated violations (human review still required),
            1 = automated violations, 2 = input/execution error.
Access-Spotter does not certify ADA compliance. Automated checks cannot determine
WCAG conformance on their own; human evaluation is required.
`;

function integer(value: string | undefined, fallback: number, name: string, minimum: number, maximum = 600_000): number {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < minimum || Number(value) > maximum) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum} milliseconds.`);
  }
  return Number(value);
}

const cancellation = new AbortController();
let interruptedCode = 0;
const interrupt = () => { interruptedCode = 130; cancellation.abort(new Error('Scan interrupted.')); };
const terminate = () => { interruptedCode = 143; cancellation.abort(new Error('Scan terminated.')); };
process.once('SIGINT', interrupt);
process.once('SIGTERM', terminate);
let json = process.argv.slice(2).includes('--json');
try {
  const { values, positionals } = parseArgs({ allowPositionals: true, strict: true, options: {
    help: { type: 'boolean', short: 'h' }, version: { type: 'boolean', short: 'v' },
    wcag: { type: 'string' }, json: { type: 'boolean' }, output: { type: 'string' },
    'install-timeout': { type: 'string' }, timeout: { type: 'string' }, wait: { type: 'string' }, 'wait-for': { type: 'string' },
    'no-install': { type: 'boolean' }, 'allow-redirect': { type: 'boolean' },
  } });
  json = values.json || false;
  if (values.help || values.version) {
    if (positionals.some(item => item !== 'scan' && item !== 'setup') || Object.keys(values).length !== 1) throw new Error('Use --help or --version without scan arguments.');
    process.stdout.write(values.help ? help : `${version}\n`);
  } else if (!positionals.length && !Object.keys(values).length) {
    process.stdout.write(help);
  } else if (positionals[0] === 'setup') {
    if (positionals.length !== 1 || Object.keys(values).some(key => key !== 'install-timeout')) throw new Error('Usage: arc setup [--install-timeout <ms>]');
    await installBrowser(integer(values['install-timeout'], 600_000, '--install-timeout', 100, 3_600_000), cancellation.signal);
    process.stdout.write('Chromium is ready. Run arc scan <url>.\n');
  } else {
    const urls = positionals[0] === 'scan' ? positionals.slice(1) : positionals;
    if (urls.length !== 1) throw new Error('Usage: arc scan <http:// or https:// URL>. Run arc --help for options.');
    const url = validateUrl(urls[0]!);
    const wcag = values.wcag || '2.2';
    if (!['2.0', '2.1', '2.2'].includes(wcag)) throw new Error('--wcag must be 2.0, 2.1, or 2.2.');
    if (values.output !== undefined && !values.output.trim()) throw new Error('--output requires a nonempty file path.');
    if (values['wait-for'] !== undefined && !values['wait-for'].trim()) throw new Error('--wait-for requires a nonempty CSS selector.');
    const report = await scan({ url, wcag: wcag as WcagVersion,
      timeout: integer(values.timeout, 60_000, '--timeout', 100), wait: integer(values.wait, 1000, '--wait', 0),
      install: !values['no-install'], installTimeout: integer(values['install-timeout'], 600_000, '--install-timeout', 100, 3_600_000), allowRedirect: values['allow-redirect'] || false,
      ...(values['wait-for'] ? { waitFor: values['wait-for'] } : {}),
    }, version, cancellation.signal);
    if (values.output) await writeReport(values.output, report);
    process.stdout.write(json ? `${JSON.stringify(report, null, 2)}\n` : renderReport(report));
    if (values.output && !json) process.stderr.write(`JSON evidence saved to ${safeText(values.output)}\n`);
    process.exitCode = report.summary.violationOccurrences ? 1 : 0;
  }
} catch (error) {
  const message = safeText(error instanceof Error ? error.message : String(error));
  if (json) process.stdout.write(`${JSON.stringify({ schemaVersion: 1, status: 'error', error: message })}\n`);
  process.stderr.write(`Access-Spotter: ${message}\n`);
  process.exitCode = interruptedCode || 2;
} finally {
  process.removeListener('SIGINT', interrupt);
  process.removeListener('SIGTERM', terminate);
}
