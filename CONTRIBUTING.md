# Contributing

Access-Recheck is in early development. Check the [roadmap](docs/ROADMAP.md) and open an issue before substantial changes so work aligns with the current phase.

Use Node.js 22 or later, run `npm ci` and `npm run setup` to install Chromium, then run `npm run check` and `npm run test:package` before submitting a pull request. Browser tests use local fixture servers. The package check requires npm registry access, installs only into a temporary directory, and scans those fixtures using both installed commands. Include focused tests and documentation for changed behavior. Use local synthetic fixtures rather than client sites or private project content.

Keep uncertainty visible. Never claim that an automated result certifies ADA compliance or establishes full WCAG conformance. Include criterion mappings, evidence, and limitations when adding checks. Browser interactions must avoid submissions, destructive actions, or state changes.

Never commit credentials, private URLs, customer content, or scan evidence containing personal information. Redact sensitive information in issue reports. Follow [SECURITY.md](SECURITY.md) for vulnerabilities.

Be respectful, describe reproducible behavior, and keep pull requests focused. Contributions are provided under the repository's MIT license; preserve third-party licensing notices.
