# Roadmap

This roadmap defines the public milestones for Access-Recheck. Unchecked items are planned, not supported behavior. Each phase should be reviewed before the next begins.

## Available in 0.1.1

- Ready-built installable package with `access-recheck` and `arc` commands.
- A single HTTP(S) URL, including local development servers, at desktop and narrow widths.
- axe-core rules selected by cumulative WCAG 2.0, 2.1, or 2.2 A/AA tags, with incomplete findings preserved for human review.
- Terminal fix guidance, JSON evidence, browser setup, and execution/finding exit codes.
- Real browser fixture tests and installed-package scans in CI.

This release covers parts of phases 2, 3, 4, and 7 below. Full criterion inventories, dedicated reflow/keyboard checks, crawling, HTML reports, interactive review recording, and baselines remain incomplete.

## Audience and workflow

Build for developers and people building websites, including freelancers, agencies, and CMS or website-builder users who can run a CLI against a reachable page. Prioritize local development, authorized staging previews, actionable fixes, and pull request checks. Explain findings in plain language so builders can act on them or share them with a developer. Keep terminal setup requirements explicit.

## 1. Scaffold

- [x] Public repository, TypeScript Node CLI, axe-core and Playwright dependencies.
- [x] Help/version commands, honest unsupported-operation errors, CLI tests, and CI.
- [x] License, contribution instructions, security reporting, and changelog.

## 2. Page discovery

- [x] Accept one HTTP(S) URL.
- [ ] Accept an explicit configuration file listing URLs.
- [x] Support reachable local development servers and public staging URLs; document preview authentication limitations.
- [ ] Validate configuration and define stable data shapes for pages, evidence, and errors.
- [ ] Opt-in same-origin crawler with depth and page-count limits; enforce origin bounds across redirects.
- [ ] Test discovery against local fixtures, including cycles, redirects, and malformed inputs.

## 3. Automated checks

- [x] Run axe-core at 1280px and 390px using cumulative version-specific A/AA tags.
- [ ] Add complete version-specific WCAG A/AA criterion inventories.
- [x] WCAG 2.0, 2.1, and 2.2 automated profiles; default 2.2. Include 4.1.1 as needs-review in 2.0/2.1, omit it in 2.2.
- [ ] 320px reflow checks with narrowly documented two-dimensional-layout exceptions.
- [ ] Keyboard/interaction heuristics and configurable selectors, without submitting forms or activating destructive controls.
- [ ] Rendered text contrast; unresolved gradients, images, and transparency require review.
- [ ] Unit tests for each module, including known contrast pairs; broken and clean local fixtures.
- [x] Preserve uncertainty: successful automated checks alone never establish full criterion conformance.

## 4. Report

- [ ] Self-contained HTML evidence report grouped by criterion, plus terminal summary.
- [ ] Pass, fail, needs-review, and explicit untested coverage; failure screenshots.
- [x] Show affected pages and elements, impact, and fix guidance in terminal and JSON output; keep uncertain findings marked for human review.
- [ ] Treat scanned content as untrusted and escape it in output.
- [ ] axe scan of the report itself, plus keyboard and responsive visual checks.

## 5. Human review

- [ ] Guided criterion-specific instructions for alt text quality, meaningful focus order, screen-reader experience, and other manual checks.
- [ ] Record pass, fail, untested, or needs-review, with notes and screenshot evidence.
- [ ] Define evidence scope, timestamps, and invalidation after page changes.

## 6. Regression CI

- [ ] Stable finding identity and explicit stored-baseline updates.
- [ ] Exit 1 on regressions; keep known failures visible as still-open.
- [ ] Distinguish execution errors from scan decisions; define review policy explicitly.
- [ ] Ready-to-use GitHub Action and fixture e2e CI.
- [ ] Document the pull request workflow, including how to start and wait for a local test server before scanning it.

## 7. Release documentation

- [ ] Installation, one-command quick start, configuration, and coverage/limitations documentation verified against implementation.
- [ ] Recheck npm name availability immediately before any npm publication.
- [ ] Verify any legal summaries against primary sources immediately before publishing them.
- [x] Review dependency notices and package contents; ensure no credentials or private scan evidence are included.
- [ ] First-time user can run a scan and understand the report without reading source.
- [ ] Document a local development example and a reachable website-builder preview example, with prerequisites and limitations.

Version 0.1.1 is distributed as a built tarball through GitHub Releases. The package remains marked private to prevent accidental npm-registry publication. Later milestones require a separate release.
