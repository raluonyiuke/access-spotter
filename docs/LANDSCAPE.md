# Accessibility testing landscape

Reviewed 2026-10-31 against upstream documentation. This is a feature-documentation comparison, not a hands-on accuracy or usability benchmark. Listed capabilities are upstream descriptions, not verified performance claims.

- [Pa11y](https://github.com/pa11y/pa11y/blob/main/README.md): existing automated accessibility runner with configurable actions, screenshots, and built-in reporters including HTML.
- [Pa11y CI](https://github.com/pa11y/pa11y-ci/blob/main/README.md): multi-page CI runner with URL lists, sitemaps, thresholds, and configuration.
- [Pa11y HTML reporter](https://github.com/pa11y/pa11y-reporter-html): the old standalone reporter repository is archived; its README explains that the reporter was merged into Pa11y, whose current documentation lists HTML as a built-in reporter.
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing): axe checks within browser tests, known-issue snapshots, and result attachments. Existing Playwright users can add checks to their current tests.
- [Accessibility Insights for Web](https://accessibilityinsights.io/docs/web/overview/): browser-based automated checks, assisted keyboard review, and guided manual assessment with fix guidance.
- [a11y-loop](https://github.com/ChanMeng666/a11y-loop): browser audits across rendering and interaction states, finding comparisons that distinguish fixed/new/remaining issues, CI integration, and a manual-review checklist. There is substantial overlap with Access-Spotter's proposed loop.

Access-Spotter's intended focus is an approachable CLI workflow for developers and website builders, with explicit criterion coverage, recorded human decisions, and visible regression evidence. These are product priorities, not claims of exclusive features. The initial release implements single-page automated scans and JSON output; it does not yet implement the complete workflow described above. See the [research notes](RESEARCH.md) for the rationale and limitations.

Reassess reuse or contribution before expanding the scanner. Do not duplicate a checking engine or infer a market gap from this documentation review. No exhaustive comparison, independent tool evaluation, or usability study has been performed.
