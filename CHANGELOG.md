# Changelog

## 0.1.2

- Rename the project, package, and primary command to Access-Spotter / access-spotter.
- Use the tagline: Find accessibility issues on new and existing websites.
- Keep arc, access-recheck, and accessrecheck as command aliases.
- Change JSON report tool.name to Access-Spotter and document upgrade steps.
- Preserve previous release artifacts; scanner behavior is unchanged.

## 0.1.1

- Use Access-Recheck for the display name and access-recheck for the repository, package, and primary CLI command.
- Retain arc and the original accessrecheck command as aliases.
- Change the JSON report tool.name field to Access-Recheck.
- Update install links and document migration from the original package.

## 0.1.0

- Ship an installable single-page accessibility scanner through GitHub Releases.
- Run axe-core at desktop and narrow widths with cumulative WCAG 2.0, 2.1, or 2.2 A/AA tags.
- Print affected selectors, guidance, criterion tags, and references; preserve uncertain results for human review.
- Add JSON stdout and atomic JSON evidence files, bounded scan timeouts, readiness controls, and explicit execution errors.
- Set up Chromium automatically on first use or explicitly through `arc setup`; support offline scanning with `--no-install`.
- Test real browser behavior against broken and clean local fixtures, and test both installed CLI commands on Linux and Windows CI.
- Pin runtime dependencies and clean build output before packaging.
- Include the developer and website-builder documentation, sourced project rationale, research notes, and MIT license.

No HTML reports, screenshots, crawling, interactive human-review recording, or regression baselines are included. No npm-registry publication has been made.
