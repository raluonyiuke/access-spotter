# Research behind Access-Spotter

Reviewed 2026-10-31. This note supports the README's project rationale. It distinguishes published findings from our product decisions. The initial release scans one page at two widths and saves JSON findings. Interactive human-review recording, complete criterion coverage, and regression baselines discussed below remain planned.

## Research approach

We reviewed the original WebAIM study, a published tool-comparison study, W3C guidance and standards, and upstream documentation for existing testing tools. This was a literature and documentation review, not our own benchmark of the tools or a study of Access-Spotter users. We did not conduct customer interviews, measure remediation time, or test whether this proposed workflow improves accessibility outcomes. Those claims require separate validation.

## 1. Basic barriers remain widespread

The [WebAIM Million 2026](https://webaim.org/projects/million/) evaluated rendered home pages from a popularity-based sample using WAVE. Its 95.9% figure concerns pages with automatically detected WCAG failures; the 56.1 average is detected errors per home page. The six categories listed in the README describe 96% of detected errors, not 96% of all possible barriers. These are WebAIM's findings, not Access-Spotter measurements. Data credit: © WebAIM.

Implication for this project: start with understandable, actionable checks for common barriers. These findings do not establish how frequently issues recur on a particular site, which tool is best, or how much work a team will save.

## 2. Accessibility belongs in development and maintenance

The [W3C evaluation overview](https://www.w3.org/WAI/test-evaluate/) recommends early and ongoing evaluation and explains why tools need knowledgeable human evaluation. This supports checks during development rather than relying only on a final launch review.

[W3C's maintenance guidance](https://www.w3.org/WAI/planning-and-managing/sustain/) explains that changing content can introduce issues and recommends reviews within publishing processes. It explicitly asks teams to consider causes such as changes in a CMS and insufficient training.

Product decision: make local development and pull request checks part of the intended workflow. A baseline should identify new failures while continuing to display known failures. This is our implementation direction, not a W3C endorsement of Access-Spotter or a claim that monitoring solves training and process problems.

## 3. Automation and human review answer different questions

The [axe-core documentation](https://github.com/dequelabs/axe-core) describes uncertain results that require manual review and recommends scanning when new UI becomes visible. A scan of one rendered state cannot stand in for all interaction states.

[WCAG 2.2, criterion 1.1.1](https://www.w3.org/TR/WCAG22/#non-text-content) requires a text alternative serving the equivalent purpose, subject to defined exceptions. Detecting whether an attribute exists is different from judging whether its content serves the image's purpose. That distinction illustrates why the planned checklist must address meaning as well as markup.

[W3C's guidance on involving users](https://www.w3.org/WAI/test-evaluate/involving-users/) explains that evaluating with disabled people can uncover usability problems beyond conformance checks. It also warns against generalizing from a small or unrepresentative group and recommends combining user evaluation with standards evaluation.

Product decision: preserve needs-review and untested states, document coverage, and record human decisions with their scope. A guided checklist is not equivalent to screen-reader expertise or user research. Do not promise a fixed percentage of barriers that automation will detect across different sites.

Jonathan Robert Pool's 2023 study, [Accessibility Metatesting: Comparing Nine Testing Tools](https://arxiv.org/abs/2304.07591), compared tools on 121 pages of interest to CVS Health and reported that their findings were complementary. That limited sample and older tool versions do not establish a current ranking or universal detection rate. It reinforces the need to describe an engine's coverage honestly; choosing axe-core does not make other engines redundant. Adding more engines is not part of the initial release scope.

## 4. Regression comparisons require care

[Playwright's accessibility guide](https://playwright.dev/docs/accessibility-testing) documents known-issue handling. It warns that excluding an element also excludes descendants and checks unrelated to the original problem. Its snapshot approach uses identifying fingerprints instead of the complete violations array because incidental markup changes can make snapshots fragile. The guide also notes that fingerprint snapshots add their own complexity and fragility.

Product decision: known failures should remain visible, and updating a baseline should be explicit. Page state, viewport, scan configuration, and finding identity must be considered before calling something fixed or new. An unchanged count can conceal one fixed failure and one new failure. A baseline is a comparison mechanism, not evidence that the remaining failures are acceptable.

## 5. Evidence needs a defined scope

The [W3C evaluation report template](https://www.w3.org/WAI/test-evaluate/report-template/) includes review dates, included and excluded URLs, evaluation methods, tool versions, and recommendations. It notes that a website may change after evaluation and points readers to the WCAG-EM Report Tool for more detailed reporting guidance.

Product decision: planned reports should explain what was checked, when, with which configuration, and what remains untested. Screenshots and saved results can support fixing and reviewing issues; they are not legal certification or proof that every task on a site is usable.

## 6. Existing tools already cover much of the workflow

The [landscape comparison](LANDSCAPE.md) summarizes upstream documentation. CI, manual guidance, reporting, and baseline comparisons are established techniques. The relevant question is whether Access-Spotter can make a useful, maintainable workflow for its intended audience, not whether those techniques are new.

Before expanding the scanner, compare the proposed experience against existing options and assess reuse or contribution. A separate CLI should earn its maintenance cost through a validated user need.

## What the evidence does not establish

- That Access-Spotter improves outcomes, saves a measured amount of time, or is easier than another tool.
- That automated results establish complete WCAG conformance, legal compliance, or protection from complaints.
- That a popular-homepage study describes every website, every user journey, or the needs of all disabled people.
- That a saved manual review remains valid after changes to content, components, or behavior.

Future validation should observe developers and website builders using the workflow, evaluate findings with accessibility practitioners and disabled users, and test whether uncertainty, known failures, and regression decisions are understood correctly.
