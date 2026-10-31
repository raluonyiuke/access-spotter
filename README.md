# AccessRecheck

Check website accessibility, record human review, and catch regressions before they ship.

An accessibility QA CLI for developers and people building websites. AccessRecheck is being built to fit the work between changing a page and shipping it: find barriers, understand what to fix, check the result, and keep fixed issues from returning.

**Status: Phase 1 scaffold.** The CLI currently provides help and version information only. URL scanning, reports, manual checklists, and baselines are planned; they do not work yet. This project is not published to npm.

## Why this project exists

AccessRecheck was created to make accessibility a repeatable part of building websites: find barriers, understand the fix, check the result, and keep checking as the site changes. The goal is to help developers and website builders make pages people can use, with findings they can act on and a clear record of what still needs attention.

**Common barriers are widespread on popular home pages.** In its February 2026 automated evaluation of one million popular home pages, WebAIM detected WCAG failures on 95.9% of them, averaging 56.1 detected errors per page. Low contrast text, missing image alternatives, missing form labels, empty links, empty buttons, and missing page language accounted for 96% of detected errors. This measures a subset of issues on sampled home pages, not every page or every accessibility barrier. [Source: WebAIM Million 2026](https://webaim.org/projects/million/).

**Checking during development makes the work easier to address.** W3C recommends evaluating accessibility early and throughout development. It also recommends regular reviews as content changes and checks within the publishing process. That is consistent with the workflow we want to build: local checks, understandable fix guidance, and rechecks in pull requests. [Sources: W3C evaluation overview](https://www.w3.org/WAI/test-evaluate/), [W3C guidance on sustaining accessibility](https://www.w3.org/WAI/planning-and-managing/sustain/).

**A clean automated scan leaves questions unanswered.** W3C says tools alone cannot establish accessibility; knowledgeable human evaluation is required. Involving people with disabilities can also reveal usability issues that conformance evaluation alone misses. AccessRecheck's planned manual checklist will help record human review, while keeping untested and uncertain results visible. It will support, rather than replace, expert evaluation and testing with disabled users. [Sources: W3C evaluation overview](https://www.w3.org/WAI/test-evaluate/), [involving users in evaluation](https://www.w3.org/WAI/test-evaluate/involving-users/).

AccessRecheck aims to offer another open-source option that brings actionable findings, human review, and regression tracking together for website builders. Existing tools already support these practices: Playwright documents snapshotting fingerprints of known violations, and a11y-loop combines browser audits, finding comparisons, CI, and a manual-review checklist. AccessRecheck does not claim to have invented these techniques or to offer capabilities its scaffold has not implemented. [Sources: Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing), [a11y-loop](https://github.com/ChanMeng666/a11y-loop).

See the [research notes](docs/RESEARCH.md) for the evidence, limitations, and implications for the planned product, and the [landscape comparison](docs/LANDSCAPE.md) for existing options.

## Who we're building it for

- Developers building websites and web apps who want accessibility checks during local development and pull request review.
- Freelancers and agencies checking client sites before launch and after changes.
- People building sites with a CMS or website builder who want plain-language findings and a checklist they can follow or share with a developer.

The current scaffold requires Git, a terminal, Node.js, and npm. The planned CLI will check browser-accessible pages, including local development servers and authorized staging previews. People using a website builder will need a reachable preview or published URL; a builder-specific integration is not currently planned.

## Intended workflow

The following workflow is planned, not available in the scaffold:

1. Point AccessRecheck at a page on your local development server or a staging site you are authorized to test.
2. Get findings with the affected element, the reason it matters, and guidance on what to fix.
3. Make the change, rerun the checks, and complete the guided keyboard and other human checks that automation cannot settle.
4. Save a baseline and run checks in pull requests so new failures are caught while existing failures stay visible.

The planned HTML report will make it easier to share findings with teammates and clients who do not use the terminal.

## Try the scaffold

Requires Git, Node.js 22 or newer, and npm.

```sh
git clone https://github.com/raluonyiuke/accessrecheck.git
cd accessrecheck
npm ci
npm run build
node dist/cli.js --help
node dist/cli.js --version
```

To install the command locally from this checkout:

```sh
npm install -g .
accessrecheck --help
arc --help
```

Both `accessrecheck` and the short alias `arc` run the same CLI. If another installed tool already uses `arc`, use `accessrecheck` to avoid ambiguity.

A URL or unsupported argument exits with code 2 because scanning is not implemented. Help and version commands exit with code 0; this does not indicate an accessibility result.

## Planned v1

- Single URLs, configured URL lists, and opt-in bounded same-origin crawling.
- axe-core scans at desktop and mobile widths, mapped to WCAG 2.0, 2.1, or 2.2 at levels A and AA.
- Reflow, keyboard interaction, and rendered contrast checks, with uncertain findings sent to human review.
- A guided manual checklist and a readable HTML report with evidence and fix guidance.
- Regression baselines that keep known failures visible and fail CI on new failures.

The intended default is WCAG 2.2 AA. Selecting a profile will not determine which standard legally applies. A clean automated scan must never automatically promote an entire criterion to passed. See the [roadmap](docs/ROADMAP.md) for milestones and acceptance criteria.

## Limits

AccessRecheck does not certify ADA compliance. Automated checks cannot establish WCAG conformance on their own; human evaluation is required. Any future passing result will describe only the tested scope and evidence, not a legal determination. Legal applicability depends on the site and its obligations; this project does not provide legal advice.

## Development

```sh
npm ci
npm run check
npm run test:package
```

The CLI is built with TypeScript. axe-core and Playwright are installed for future scan implementation. Browser installation will be documented when scans are implemented; no browser download is needed for the scaffold checks. GitHub Actions runs type checking, CLI tests, and package installation checks on Node.js 22 and 24. The package check installs a temporary tarball, exercises both commands, and checks that README-linked documentation is included. It requires npm registry access for dependencies and leaves global commands untouched.

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [CHANGELOG.md](CHANGELOG.md).

## Related projects

[Pa11y](https://github.com/pa11y/pa11y) and [Pa11y CI](https://github.com/pa11y/pa11y-ci) provide automated testing and CI workflows. [Playwright with axe](https://playwright.dev/docs/accessibility-testing) supports checks within browser tests and snapshots for known issues. [Accessibility Insights for Web](https://accessibilityinsights.io/docs/web/overview/) offers automated and guided manual assessment. [a11y-loop](https://github.com/ChanMeng666/a11y-loop) documents browser audits, finding comparisons, CI, and a manual-review checklist. These overlap with AccessRecheck's plans. See the [landscape comparison](docs/LANDSCAPE.md) for scope and reuse considerations.

## License

MIT for original AccessRecheck code. Dependencies retain their own licenses, including MPL-2.0 for axe-core. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
