# Roadmap

This roadmap defines the public milestones for AccessRecheck. Unchecked items are planned, not supported behavior. Each phase should be reviewed before the next begins.

## Audience and workflow

Build for developers and people building websites, including freelancers, agencies, and CMS or website-builder users who can run a CLI against a reachable page. Prioritize local development, authorized staging previews, actionable fixes, and pull request checks. Explain findings in plain language so builders can act on them or share them with a developer. Keep terminal setup requirements explicit.

## 1. Scaffold

- [x] Public repository, TypeScript Node CLI, axe-core and Playwright dependencies.
- [x] Help/version commands, honest unsupported-operation errors, CLI tests, and CI.
- [x] License, contribution instructions, security reporting, and changelog.

## 2. Page discovery

- [ ] Accept one HTTP(S) URL or an explicit configuration file listing URLs.
- [ ] Support reachable local development servers and authorized staging URLs; document preview authentication limitations.
- [ ] Validate configuration and define stable data shapes for pages, evidence, and errors.
- [ ] Opt-in same-origin crawler with depth and page-count limits; enforce origin bounds across redirects.
- [ ] Test discovery against local fixtures, including cycles, redirects, and malformed inputs.

## 3. Automated checks

- [ ] axe-core at 1280px and 390px, with version-specific WCAG A/AA criterion inventories.
- [ ] WCAG 2.0, 2.1, and 2.2 profiles; default 2.2. Include 4.1.1 as needs-review in 2.0/2.1, omit it in 2.2.
- [ ] 320px reflow checks with narrowly documented two-dimensional-layout exceptions.
- [ ] Keyboard/interaction heuristics and configurable selectors, without submitting forms or activating destructive controls.
- [ ] Rendered text contrast; unresolved gradients, images, and transparency require review.
- [ ] Unit tests for each module, including known contrast pairs; broken and clean local fixtures.
- [ ] Preserve uncertainty: successful automated checks alone never establish full criterion conformance.

## 4. Report

- [ ] Self-contained HTML evidence report grouped by criterion, plus terminal summary.
- [ ] Pass, fail, needs-review, and explicit untested coverage; failure screenshots.
- [ ] For actionable findings, show the affected page and element, explain the impact, and provide fix guidance; keep uncertain findings marked for human review.
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
- [ ] Review dependency notices and package contents; ensure no credentials or private scan evidence are included.
- [ ] First-time user can run a scan and understand the report without reading source.
- [ ] Document a local development example and a reachable website-builder preview example, with prerequisites and limitations.

No npm release is part of the scaffold milestone. The package is marked private until a deliberate release preparation change.
