# AccessRecheck

Check website accessibility, record human review, and catch regressions before they ship.

A website accessibility QA kit in early development. The goal is to help teams find barriers, record human review, and catch regressions before shipping.

**Status: Phase 1 scaffold.** The CLI currently provides help and version information only. URL scanning, reports, manual checklists, and baselines are planned; they do not work yet. This project is not published to npm.

## Try the scaffold

Requires Node.js 22 or newer and npm.

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
- A guided manual checklist and a readable HTML report with evidence.
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

The CLI is built with TypeScript. axe-core and Playwright are installed for future scan implementation. Browser installation will be documented when scans are implemented; no browser download is needed for the scaffold checks. GitHub Actions runs type checking, CLI tests, and package installation checks on Node.js 22 and 24. The package check installs a temporary tarball, exercises both commands, and checks that linked documentation is included. It requires npm registry access for dependencies and leaves global commands untouched.

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [CHANGELOG.md](CHANGELOG.md).

## Related projects

[Pa11y](https://github.com/pa11y/pa11y) already provides automated testing, configurable actions, screenshots, and reporters; [Pa11y CI](https://github.com/pa11y/pa11y-ci) supports multi-page CI runs. These are established options for automated testing today. AccessRecheck's proposed focus is explicit criterion coverage, recorded human review, and regression evidence. The [landscape note](docs/LANDSCAPE.md) records the preliminary comparison; it does not claim no comparable tool exists.

## License

MIT for original AccessRecheck code. Dependencies retain their own licenses, including MPL-2.0 for axe-core. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
