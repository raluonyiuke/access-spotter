import axe, { type Result } from 'axe-core';
import { chromium, type Browser } from 'playwright';
import { ensureBrowser } from './browser.js';
import { publicUrl, safeText } from './output.js';
import type { Finding, ScanOptions, ScanReport, WcagVersion } from './model.js';

export function validateUrl(value: string): string {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error('Use a complete URL starting with http:// or https://.'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only http:// and https:// URLs are supported.');
  if (url.username || url.password) throw new Error('URLs containing usernames or passwords are not supported.');
  return url.href;
}

export function profileTags(version: WcagVersion): string[] {
  const tags = ['wcag2a', 'wcag2aa'];
  if (version !== '2.0') tags.push('wcag21a', 'wcag21aa');
  if (version === '2.2') tags.push('wcag22a', 'wcag22aa');
  return tags;
}

function finding(result: Result, status: Finding['status']): Finding {
  return { ruleId: safeText(result.id), status, impact: result.impact || 'unknown',
    description: safeText(result.description), help: safeText(result.help), helpUrl: publicUrl(result.helpUrl),
    wcagCriteria: result.tags.filter(tag => /^wcag\d{3,4}$/.test(tag)).map(tag => `${tag[4]}.${tag[5]}.${tag.slice(6)}`),
    nodes: result.nodes.map(node => ({
      target: node.target.map(selector => safeText(typeof selector === 'string' ? selector : JSON.stringify(selector))),
      guidance: safeText(node.failureSummary || result.description),
    })),
  };
}

export function abortable<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(signal.reason || new Error('Scan interrupted.'));
    signal.addEventListener('abort', abort, { once: true });
    operation.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
    if (signal.aborted) abort();
  });
}

export async function scan(options: ScanOptions, version: string, cancellation: AbortSignal): Promise<ScanReport> {
  const url = validateUrl(options.url);
  await ensureBrowser(options.install, options.installTimeout, cancellation);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`Scan exceeded ${options.timeout} ms. Increase --timeout, check page readiness, or inspect slow resources.`)), options.timeout);
  const signal = AbortSignal.any([controller.signal, cancellation]);
  let browser: Browser | undefined;
  const startedAt = new Date().toISOString();
  try {
    const activeBrowser = await abortable(chromium.launch({ headless: true, channel: 'chromium', handleSIGINT: false, handleSIGTERM: false, timeout: options.timeout }).then(async launched => {
      if (signal.aborted) { await launched.close(); throw signal.reason; }
      return launched;
    }), signal);
    browser = activeBrowser;
    const viewports: ScanReport['viewports'] = [];
    for (const viewport of [{ name: 'desktop', width: 1280, height: 800 }, { name: 'narrow', width: 390, height: 844 }]) {
      const context = await abortable(activeBrowser.newContext({ viewport: { width: viewport.width, height: viewport.height },
        acceptDownloads: false, serviceWorkers: 'block' }), signal);
      try {
        const page = await abortable(context.newPage(), signal);
        let navigations = 0;
        page.on('framenavigated', frame => { if (frame === page.mainFrame()) navigations++; });
        page.on('dialog', dialog => { void dialog.dismiss().catch(() => {}); });
        const response = await abortable(page.goto(url, { waitUntil: 'load', timeout: options.timeout }), signal);
        if (!response || response.status() >= 400) throw new Error(`Page did not load successfully (HTTP ${response?.status() || 'unknown'}). Check the URL and access requirements.`);
        const contentType = response.headers()['content-type'] || '';
        if (!/^(text\/html|application\/xhtml\+xml)(;|$)/i.test(contentType)) throw new Error('The URL did not return an HTML page. PDF, JSON, downloads, and other content are not supported.');
        const finalUrl = validateUrl(page.url());
        const initialNavigations = navigations;
        const requireStablePage = () => {
          if (navigations !== initialNavigations || page.url() !== finalUrl) throw new Error('The page navigated again after loading. Scan its intended final URL directly so results refer to a stable page.');
        };
        if (!options.allowRedirect && new URL(finalUrl).origin !== new URL(url).origin) throw new Error(`The page redirected to a different origin: ${publicUrl(finalUrl)}. Use the intended final URL directly, or --allow-redirect if this is expected.`);
        if (options.waitFor) await abortable(page.locator(options.waitFor).first().waitFor({ state: 'visible', timeout: options.timeout }), signal);
        await abortable(page.waitForTimeout(options.wait), signal);
        await abortable(page.evaluate(() => document.fonts.ready.then(() => undefined)), signal);
        requireStablePage();
        await abortable(page.evaluate(axe.source), signal);
        const results = await abortable(page.evaluate(async tags => {
          const engine = (window as unknown as { axe: typeof axe }).axe;
          return engine.run(document, { runOnly: { type: 'tag', values: tags }, iframes: false, resultTypes: ['violations', 'incomplete'] });
        }, profileTags(options.wcag)), signal);
        const title = safeText(await abortable(page.title(), signal));
        const iframeCount = await abortable(page.locator('iframe, frame').count(), signal);
        requireStablePage();
        viewports.push({ ...viewport, url: publicUrl(finalUrl), title, iframeCount,
          violations: results.violations.map(result => finding(result, 'fail')),
          needsReview: results.incomplete.map(result => finding(result, 'needs-human-review')),
          automatedPasses: results.passes.map(result => result.id), inapplicableRules: results.inapplicable.map(result => result.id) });
      } finally { await context.close().catch(() => {}); }
    }
    const violationOccurrences = viewports.reduce((count, viewport) => count + viewport.violations.reduce((sum, item) => sum + item.nodes.length, 0), 0);
    const reviewOccurrences = viewports.reduce((count, viewport) => count + viewport.needsReview.reduce((sum, item) => sum + Math.max(1, item.nodes.length), 0), 0);
    const manualChecks: ScanReport['manualChecks'] = [
      { id: 'keyboard', status: 'untested', instructions: 'Use only the keyboard to check meaningful focus order, visible focus, menus, and dialogs.' },
      { id: 'screen-reader', status: 'untested', instructions: 'Check important user journeys with a screen reader and include disabled users in evaluation.' },
      { id: 'content', status: 'untested', instructions: 'Review image descriptions, labels, headings, instructions, and media alternatives for meaning and quality.' },
      { id: 'zoom', status: 'untested', instructions: 'Check zoom, narrow layouts, and content loss manually; a narrow scan is not a reflow test.' },
      { id: 'states', status: 'untested', instructions: 'Review authenticated pages, iframe content, expanded menus, dialogs, and validation/error states separately.' },
    ];
    if (options.wcag !== '2.2') manualChecks.push({ id: '4.1.1', status: 'needs-human-review', instructions: 'WCAG 4.1.1 Parsing is not tested by this scan. Review it separately for WCAG 2.0/2.1 obligations.' });
    return { schemaVersion: 1, status: 'completed', tool: { name: 'AccessRecheck', version, axeVersion: axe.version },
      startedAt, finishedAt: new Date().toISOString(), requestedUrl: publicUrl(url),
      wcag: { version: options.wcag, level: 'AA', scope: 'automated-axe-rules-only' },
      summary: { decision: violationOccurrences ? 'fail' : 'needs-human-review', violationOccurrences, reviewOccurrences },
      viewports, manualChecks, limitations: [
        'One page at two viewport sizes. The narrow viewport is not mobile device emulation.',
        'Only axe rules tagged for the selected WCAG A/AA profile run; this is not a complete criterion inventory.',
        'Only the loaded state is scanned. Iframe contents, interactions, and authenticated journeys are untested.',
        `Waited for page load${options.waitFor ? ' and the configured visible selector' : ''}, then ${options.wait} ms. Later-rendered content may be missed.`,
        'Requested and final URL queries and fragments are omitted. Selectors, page titles, and guidance may still contain sensitive page content.',
        'No interactions are clicked or forms submitted by AccessRecheck. Visiting a page still runs its scripts and network requests.',
      ] };
  } finally { clearTimeout(timer); await browser?.close().catch(() => {}); }
}
