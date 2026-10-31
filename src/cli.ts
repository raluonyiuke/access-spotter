#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string };

const help = `AccessRecheck
Check website accessibility, record human review, and catch regressions before they ship.
For developers and people building websites.

Usage: accessrecheck [--help | --version]
       arc [--help | --version]

Options:
  -h, --help     Show this help
  -v, --version  Show the scaffold version

Status: early development. Scanning is not implemented yet.
Planned: URL discovery, WCAG checks, fix guidance, evidence, human review, and baselines.

AccessRecheck does not certify ADA compliance. Automated checks cannot determine
WCAG conformance on their own; human evaluation is required.
`;

const args = process.argv.slice(2);
if (args.length === 0 || (args.length === 1 && ['--help', '-h'].includes(args[0]!))) {
  process.stdout.write(help);
} else if (args.length === 1 && ['--version', '-v'].includes(args[0]!)) {
  process.stdout.write(`${version}\n`);
} else {
  process.stderr.write('accessrecheck: scanning is not implemented yet, or arguments are unsupported. Run accessrecheck --help.\n');
  process.exitCode = 2;
}
