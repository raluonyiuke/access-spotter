# Access-Recheck

Check website accessibility, record human review, and catch regressions before they ship.

An accessibility QA CLI for developers and people building websites. Scan a website or local development server, find automatically detectable barriers, and get element selectors and guidance for fixing them.

**Available now: single-page automated scans.** Version 0.1.1 scans desktop and narrow viewports, prints actionable findings, saves JSON evidence, and lists checks that need human evaluation. Interactive manual-review recording and regression baselines are planned. The tagline describes the broader project goal.

## Install and scan

Requires Node.js 22 or newer, npm, and a Playwright-supported operating system. Install the ready-built package from GitHub Releases, then scan your site:

```sh
npm install -g https://github.com/raluonyiuke/access-recheck/releases/download/v0.1.1/access-recheck-0.1.1.tgz
arc scan http://localhost:3000
```

Replace the URL with your local development server or a website you are authorized to test. `access-recheck` and `arc` run the same tool. The older `accessrecheck` command is retained as an alias. If another tool already uses `arc`, use `access-recheck`.

No cloning, Git, TypeScript, or source build is required. The first scan downloads Chromium through Playwright, about 200 MB, if it is missing. Package dependencies come from the npm registry. Download and diagnostic messages go to stderr.

If you installed 0.1.0, first run `npm uninstall -g accessrecheck` to remove the old package and avoid command conflicts, then install the new package above.

To run without a global installation:

```sh
npx --yes --package=https://github.com/raluonyiuke/access-recheck/releases/download/v0.1.1/access-recheck-0.1.1.tgz access-recheck scan http://localhost:3000
```

For CI or an explicit setup step, run `arc setup` in advance and scan with `--no-install`. On Linux, Chromium may require system libraries; follow [Playwright's system dependency instructions](https://playwright.dev/docs/browsers#install-system-dependencies). Access-Recheck never installs OS packages or elevates privileges. The release includes SHA-256 checksums. This package is distributed through GitHub Releases and is not yet published to the npm registry.

## What you get

- axe-core checks at **1280 x 800** and **390 x 844**, using fresh browser contexts. The narrow viewport is not mobile device emulation.
- Failures with rule IDs, WCAG criterion tags, affected selectors, fix guidance, and reference links.
- Uncertain axe findings labeled **needs human review**, plus a list of untested human checks.
- JSON output and evidence files suitable for scripts and issue triage.

The same issue can appear in both viewports. Summary counts are affected-node occurrences per viewport, not deduplicated site-wide issues. Automated rule passes do not establish that a complete WCAG criterion passes.

```sh
arc scan https://example.com --output scan.json
arc scan http://localhost:3000 --json
arc scan http://localhost:3000 --wcag 2.1 --wait-for main --timeout 90000
arc --help
```

| Option | Behavior |
| --- | --- |
| `--wcag 2.0`, `2.1`, or `2.2` | Select cumulative axe A/AA tags; default 2.2. This is not a complete criterion inventory. |
| `--json` | Write one JSON result to stdout, including execution errors. |
| `--output path` | Save completed JSON results on exit 0 or 1. Existing files are replaced atomically; the parent directory must exist. |
| `--install-timeout ms` | Browser setup deadline in milliseconds; default 600000. Also accepted by `arc setup`. |
| `--timeout ms` | Total scan deadline across both viewports; default 60000, excluding browser installation. |
| `--wait ms` | Wait after page load in each viewport; default 1000. Later-rendered content can be missed. |
| `--wait-for css` | Wait for a visible selector in each viewport before the settle delay and scan. A selector hidden at 390px will time out. |
| `--no-install` | Fail clearly if Chromium is missing, without downloading it. |
| `--allow-redirect` | Allow a final URL on another origin. Review the final URL and title to ensure the intended page was scanned. Navigation after the initial page load is rejected even with this option. |

Execution errors produce no completed report. If `--output` already exists, an unsuccessful run leaves the old file unchanged; check the exit code and report timestamps before using it. A browser download has a separate ten-minute default deadline, configurable with `--install-timeout` up to one hour.

| Exit code | Meaning |
| --- | --- |
| `0` | No automated violations in the scanned scope. Human review is still required. |
| `1` | Automated violations found. |
| `2` | Invalid input, failed navigation, timeout, browser problem, or output-file error. |

Execution errors take precedence over findings. SIGINT cancels with code 130; SIGTERM cancels with code 143 on platforms that deliver those signals. Invalid or unsupported inputs never count as a successful scan.

## Why this project exists

Access-Recheck was created to make accessibility a repeatable part of building websites: find barriers, understand the fix, check the result, and keep checking as the site changes. The goal is to help developers and website builders make pages people can use, with findings they can act on and a clear record of what still needs attention.

**Common barriers are widespread on popular home pages.** In its February 2026 automated evaluation of one million popular home pages, WebAIM detected WCAG failures on 95.9% of them, averaging 56.1 detected errors per page. Low contrast text, missing image alternatives, missing form labels, empty links, empty buttons, and missing page language accounted for 96% of detected errors. This measures a subset of issues on sampled home pages, not every page or every accessibility barrier. [Source: WebAIM Million 2026](https://webaim.org/projects/million/).

**Checking during development makes the work easier to address.** W3C recommends evaluating accessibility early and throughout development. It also recommends regular reviews as content changes and checks within the publishing process. That is consistent with the workflow we want to build: local checks, understandable fix guidance, and rechecks in pull requests. [Sources: W3C evaluation overview](https://www.w3.org/WAI/test-evaluate/), [W3C guidance on sustaining accessibility](https://www.w3.org/WAI/planning-and-managing/sustain/).

**A clean automated scan leaves questions unanswered.** W3C says tools alone cannot establish accessibility; knowledgeable human evaluation is required. Involving people with disabilities can also reveal usability issues that conformance evaluation alone misses. Access-Recheck's planned manual checklist will help record human review, while keeping untested and uncertain results visible. It will support, rather than replace, expert evaluation and testing with disabled users. [Sources: W3C evaluation overview](https://www.w3.org/WAI/test-evaluate/), [involving users in evaluation](https://www.w3.org/WAI/test-evaluate/involving-users/).

Access-Recheck aims to offer another open-source option that brings actionable findings, human review, and regression tracking together for website builders. Existing tools already support these practices: Playwright documents snapshotting fingerprints of known violations, and a11y-loop combines browser audits, finding comparisons, CI, and a manual-review checklist. Access-Recheck does not claim to have invented these techniques or to offer capabilities that have not been implemented. [Sources: Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing), [a11y-loop](https://github.com/ChanMeng666/a11y-loop).

See the [research notes](docs/RESEARCH.md) for the evidence, limitations, and implications for the planned product, and the [landscape comparison](docs/LANDSCAPE.md) for existing options.

## Who we're building it for

- Developers building websites and web apps who want accessibility checks during local development and pull request review.
- Freelancers and agencies checking client sites before launch and after changes.
- People building sites with a CMS or website builder who want plain-language findings and a checklist they can follow or share with a developer.

Using the tool requires a terminal, Node.js, and npm. It checks browser-accessible HTML pages, including local development servers and public staging previews. People using a website builder need a reachable preview or published URL. There is no sign-in automation or builder-specific integration. A login page returning HTTP 200 can still be scanned, so check the final URL and title before interpreting results.

## Your workflow

1. Run `arc scan <url>` against a page you are building.
2. Use each finding's selector, guidance, and reference link to investigate and fix it.
3. Rerun the scan after changes, then do the listed keyboard, content, zoom, and screen-reader checks.
4. Save JSON evidence with `--output` when sharing findings with teammates.

Interactive recording of human decisions, shareable HTML reports, crawling, and baseline comparisons are planned. The current release does not automatically judge whether a fix is a regression or remember earlier runs.

## Further milestones

- Configured URL lists and opt-in bounded same-origin crawling.
- Complete version-specific WCAG criterion inventories and explicit coverage beyond the automated rule tags.
- Dedicated reflow, keyboard interaction, and additional rendered contrast checks.
- A guided manual checklist and a readable HTML report with evidence and fix guidance.
- Regression baselines that keep known failures visible and fail CI on new failures.

The default automated profile is WCAG 2.2 A/AA. Selecting a profile will not determine which standard legally applies. A clean automated scan must never automatically promote an entire criterion to passed. See the [roadmap](docs/ROADMAP.md) for milestones and acceptance criteria.

## Limits

Only a single loaded state of one page is scanned. HTTPS certificates must be valid; self-signed development certificates are not bypassed. Iframe contents, expanded menus, dialogs, authenticated journeys, and later-rendered content may be untested. This release has no keyboard interaction engine, dedicated 320px reflow test, full criterion inventory, screenshots, or baseline. WCAG 4.1.1 is explicitly listed for human review in the 2.0 and 2.1 profiles, not silently passed.

The tool does not click controls or submit forms, but visiting a URL runs the site's JavaScript and network requests. Use authorized targets and appropriate test data. Queries, fragments, and credentials in the requested and final URLs are omitted from results, and raw element HTML is not collected. Selectors, page titles, and guidance can still contain sensitive content; review evidence before sharing it.

Access-Recheck does not certify ADA compliance. Automated checks cannot establish WCAG conformance on their own; human evaluation is required. A completed scan describes only the tested scope and evidence, not a legal determination. Legal applicability depends on the site and its obligations; this project does not provide legal advice.

## Development

For contributors working from a source checkout (requires Git):

```sh
git clone https://github.com/raluonyiuke/access-recheck.git
cd access-recheck
npm ci
npm run setup
npm run check
npm run test:package
```

The CLI uses TypeScript, axe-core, and Playwright. Runtime dependency versions are pinned so the installed engine and Chromium match the tested release. GitHub Actions runs type checks, real Chromium fixture scans, and package installation checks on Node.js 22 and 24 on Linux and Windows. Local macOS checks run the same suite. The package test installs a built tarball without development tools, exercises both installed commands against fixtures, and checks that README-linked documentation is included. It requires npm registry access and leaves global commands untouched.

To build a release tarball and its SHA-256 checksum without publishing, run `npm run release:pack`.

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [CHANGELOG.md](CHANGELOG.md).

## Related projects

[Pa11y](https://github.com/pa11y/pa11y) and [Pa11y CI](https://github.com/pa11y/pa11y-ci) provide automated testing and CI workflows. [Playwright with axe](https://playwright.dev/docs/accessibility-testing) supports checks within browser tests and snapshots for known issues. [Accessibility Insights for Web](https://accessibilityinsights.io/docs/web/overview/) offers automated and guided manual assessment. [a11y-loop](https://github.com/ChanMeng666/a11y-loop) documents browser audits, finding comparisons, CI, and a manual-review checklist. These overlap with Access-Recheck's plans. See the [landscape comparison](docs/LANDSCAPE.md) for scope and reuse considerations.

## License

MIT for original Access-Recheck code. Dependencies retain their own licenses, including MPL-2.0 for axe-core. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
