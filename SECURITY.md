# Security

This is an early single-page accessibility scanner. Use only URLs you are authorized to test. The scanner navigates and runs site scripts in an isolated Chromium context; visiting a page can still trigger network requests and server-side effects. It does not click controls or submit forms.

The scanner does not reuse your normal browser profile or collect raw element HTML, cookies, or request headers. Saved results can contain page titles, selectors, and fix guidance derived from page content. Review and redact reports before sharing. Query strings and fragments in the requested and final URLs are omitted, but this is not a general-purpose secret detector.

Report vulnerabilities privately through [GitHub's security advisory reporting](https://github.com/raluonyiuke/access-spotter/security/advisories/new). If private reporting is unavailable, open an issue asking the maintainer for a private reporting channel without disclosing exploit details or sensitive data.

Do not attach credentials, session cookies, private URLs, or unredacted scan evidence to public issues. Use local synthetic pages to reproduce bugs where possible.
