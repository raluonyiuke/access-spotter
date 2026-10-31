# Preliminary landscape check

Checked 2026-10-31 against upstream documentation:

- [Pa11y](https://github.com/pa11y/pa11y/blob/main/README.md): existing automated accessibility runner with configurable actions, screenshots, and reporters.
- [Pa11y CI](https://github.com/pa11y/pa11y-ci/blob/main/README.md): multi-page CI runner with URL lists, sitemaps, thresholds, and configuration.
- [Pa11y HTML reporter](https://github.com/pa11y/pa11y-reporter-html): an existing HTML reporting project; its repository is archived.

There is substantial overlap with the automated scanning portion of qa11y. The proposed work centers on explicit version-specific criterion coverage, recorded manual decisions, and regression evidence. This limited documentation review does not establish that no existing project covers the entire brief. Reassess reuse or contribution before implementing the scanner; do not duplicate an engine or claim novelty based on this check.
