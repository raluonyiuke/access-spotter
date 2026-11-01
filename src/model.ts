export type WcagVersion = '2.0' | '2.1' | '2.2';

export interface ScanOptions {
  url: string;
  wcag: WcagVersion;
  timeout: number;
  wait: number;
  waitFor?: string;
  install: boolean;
  installTimeout: number;
  allowRedirect: boolean;
}

export interface Finding {
  ruleId: string;
  status: 'fail' | 'needs-human-review';
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  wcagCriteria: string[];
  nodes: { target: string[]; guidance: string }[];
}

export interface ViewportResult {
  name: string;
  width: number;
  height: number;
  url: string;
  title: string;
  iframeCount: number;
  violations: Finding[];
  needsReview: Finding[];
  automatedPasses: string[];
  inapplicableRules: string[];
}

export interface ScanReport {
  schemaVersion: 1;
  status: 'completed';
  tool: { name: 'Access-Spotter'; version: string; axeVersion: string };
  startedAt: string;
  finishedAt: string;
  requestedUrl: string;
  wcag: { version: WcagVersion; level: 'AA'; scope: 'automated-axe-rules-only' };
  summary: { decision: 'fail' | 'needs-human-review'; violationOccurrences: number; reviewOccurrences: number };
  viewports: ViewportResult[];
  manualChecks: { id: string; status: 'untested' | 'needs-human-review'; instructions: string }[];
  limitations: string[];
}
