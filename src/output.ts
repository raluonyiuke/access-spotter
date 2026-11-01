import { writeFile, rename, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import type { ScanReport } from './model.js';

export function cleanText(value: string): string {
  return value.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '')
    .replace(/[\x00-\x1f\x7f-\x9f\u202a-\u202e\u2066-\u2069]/g, ' ').trim();
}

export function publicUrl(value: string): string {
  const url = new URL(value);
  url.username = ''; url.password = ''; url.search = ''; url.hash = '';
  return cleanText(url.href);
}

export function safeText(value: string): string {
  return cleanText(value)
    .replace(/https?:\/\/[^\s"'<>]+/gi, text => {
      try { return publicUrl(text); } catch { return '[URL]'; }
    })
    .replace(/\?[^\s"'<>\]\\]+/g, '?[redacted]');
}

export async function writeReport(filename: string, report: ScanReport): Promise<void> {
  const target = resolve(filename);
  const temporary = `${target}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    await rename(temporary, target);
  } finally { await unlink(temporary).catch(() => {}); }
}

export function renderReport(report: ScanReport): string {
  const lines = ['Access-Spotter', `Requested: ${report.requestedUrl}`,
    `Automated axe rules tagged for WCAG ${report.wcag.version} A/AA`, ''];
  for (const viewport of report.viewports) {
    lines.push(`${viewport.name} (${viewport.width} x ${viewport.height})`,
      `Scanned: ${viewport.url}`, `Title: ${viewport.title || '(no title)'}`);
    for (const finding of [...viewport.violations, ...viewport.needsReview]) {
      const label = finding.status === 'fail' ? 'FAIL' : 'NEEDS HUMAN REVIEW';
      lines.push(`  ${label}: ${finding.ruleId} (${finding.impact})`, `  ${finding.help}`,
        `  WCAG: ${finding.wcagCriteria.join(', ') || 'see rule guidance'}`);
      for (const node of finding.nodes) lines.push(`    Element: ${node.target.join(' -> ')}`, `    Guidance: ${node.guidance}`);
      lines.push(`  Learn more: ${finding.helpUrl}`);
    }
    if (!viewport.violations.length) lines.push('  No automated failures found in this viewport.');
    lines.push(`  ${viewport.automatedPasses.length} automated rule passes; these are not full criterion passes.`);
    if (viewport.iframeCount) lines.push(`  ${viewport.iframeCount} iframe(s): content untested.`);
    lines.push('');
  }
  lines.push(`Result: ${report.summary.decision === 'fail' ? 'automated failures found' : 'needs human review'}.`,
    `${report.summary.violationOccurrences} failure occurrence(s), ${report.summary.reviewOccurrences} automated review occurrence(s).`,
    'Occurrences count affected nodes separately in each viewport; the same issue may appear twice.', '', 'Human checks still required:');
  for (const check of report.manualChecks) lines.push(`  [${check.status}] ${check.instructions}`);
  lines.push('', 'Scope and limitations:', ...report.limitations.map(item => `  ${item}`),
    '', 'Access-Spotter does not certify ADA compliance. No automated scan establishes WCAG conformance.');
  return `${lines.join('\n')}\n`;
}
