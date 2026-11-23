# RICEPOT PROMPT: JIRA-to-Test-Strategy Generator

## R: Role
Act as a senior full-stack engineer and QA automation architect with 15 years of
experience in React, Node.js, REST API design, JIRA Cloud integration, PDF generation,
and AI-assisted test strategy. You think like a QA lead: the generated document must be
something a real QA lead would put their name on.

## I: Instructions
1. Build a lightweight web app where the user enters a JIRA ticket key (e.g. SHOP-123),
   the app fetches the ticket, generates a Test Strategy, shows a preview, and offers a
   **Download PDF** button.
2. Folder structure (create it first):
   - `src/` is the only place for implementation code, split into `src/frontend/` (React)
     and `src/backend/` (Node/Express).
   - `Plan/` holds the template and is read-only input. Read it and mirror its sections.
     If no template file is found, use the 15-section structure in the Example below.
3. Backend (`src/backend/`):
   - `GET /api/jira/:key` fetches the issue via JIRA REST API v3
     (`/rest/api/3/issue/{key}`) using Basic auth (email + API token) from `.env`.
   - Extract: key, summary, description (convert Atlassian Document Format to plain text),
     issue type, priority, status, labels, components, fix versions, assignee, reporter,
     acceptance criteria (description section or custom field, configurable), linked
     issues, sub-tasks, parent epic.
   - `POST /api/strategy` takes the normalized ticket and returns a structured Test
     Strategy JSON that follows the template sections.
   - `POST /api/strategy/pdf` takes that JSON and returns a PDF (`application/pdf`).
   - Strategy generation is rule-based with defaults from `config/defaults.json`
     (tools, environments, roles, entry/exit criteria). Add an optional AI step,
     enabled by `AI_ENABLED=true`, that calls the Claude API to refine objectives,
     scope, risks and test approach from the ticket text. The app must work fully
     without it.
4. Frontend (`src/frontend/`, React + Vite):
   - Input field for the ticket key, a **Fetch & Generate** button, loading and error
     states.
   - Read-only preview of the strategy, with section headings matching the PDF.
   - **Download PDF** button, disabled until a strategy exists.
   - Minimal, clean, responsive UI. No heavy UI frameworks.
5. Write a `README.md` covering setup, `.env` variables, how to run, and how to get a
   JIRA API token.
6. Include a few unit tests: ADF-to-text conversion, field mapping, and the strategy
   builder.
7. Use the 'Downwards ARROw' button as download button from designs.   

## C: Context
- Audience: QA leads and QA engineers who currently write Test Strategies by hand from
  JIRA tickets.
- A JIRA ticket (story, epic, or feature) is the source of truth for scope and
  requirements. It rarely contains environments, tools, roles, or risks, so those come
  from configurable defaults, and anything not derivable from the ticket is marked
  **"To be confirmed"** rather than invented.
- Mapping from ticket to document:

| Strategy section | Source |
|---|---|
| Header (title, version, date, author, related docs) | Ticket key/summary, today's date, reporter/assignee, issue links |
| Purpose, Scope, Objectives | Summary, description, acceptance criteria |
| Test Approach (types, who, when) | Issue type, components, labels, with defaults |
| Environments, Test Data, Tools | `config/defaults.json` |
| Entry/Exit Criteria, Defect Management, Roles | `config/defaults.json` |
| Risks | Priority, linked issues, dependencies, plus AI refinement if enabled |
| Traceability | Acceptance criteria listed as numbered requirements |
| Assumptions, Approvals | Defaults plus placeholders |

- Runs locally; the JIRA token must never reach the browser.
- Target: JIRA Cloud (REST API v3).

## E: Example
Use this as the format and section template (the sample is fictional):


Test Strategy: ShopEasy Online Checkout
SAMPLE DOCUMENT. All names, tools, dates, and numbers are fictional.
Version	1.0
Date	2026-11-01
Author	Priya Nair, QA Lead
Reviewers	Mark Evans (Product Owner), Dan Cho (Dev Lead)
Related documents	PRD: ShopEasy Checkout PRD v2.1 / Test Plan: Release 3.2 Test Plan
1. Purpose
This strategy defines how ShopEasy's checkout module is tested across releases. It sets the test types, tools, environments, quality gates, and reporting that all release test plans follow.
2. Scope
In scope: Guest and registered checkout, cart, payment (card, wallet), order confirmation emails, promo codes, address validation, order history.
Out of scope: Warehouse systems, third-party payment gateway internals, mobile app (covered by a separate strategy).
3. Test Objectives
•	Verify every PRD requirement and acceptance criterion is met.
•	Find defects as early as possible, before UAT.
•	Protect payment and personal data accuracy.
•	Provide clear go/no-go evidence for each release.
4. Test Approach
Test Level / Type	Applies?	Who	When	Notes
Unit	Yes	Developers	During development	70% code coverage target
Functional	Yes	QA	Every build	Manual, requirement-based
Integration / SIT	Yes	QA	After integration build	Cart, payment, email, inventory
End-to-End	Yes	QA	Before UAT	Full purchase journeys
Regression	Yes	QA	Every release	Risk-based; automated suite plus manual high-risk checks
UAT	Yes	Business users	Before go-live	Business scenarios only
API	Yes	QA	With integration build	Order and payment endpoints
Performance	Yes	Performance team	Before major releases	Peak checkout load
Security	Yes	Security team	Quarterly	Payment and PII data handling
Usability / Accessibility	Yes	QA	Each major UI change	WCAG 2.1 AA checks
Compatibility	Yes	QA	Each release	Last 2 versions of Chrome, Edge, Safari, Firefox; iOS and Android browsers

Manual vs. automation: New and changed features are tested manually first. Stable, repeatable regression flows are automated. Exploratory testing sessions (60 minutes) are run on each new feature.
5. Test Environments
Environment	Purpose	Owner	Data
DEV	Developer checks	Dev team	Mock data
QA	Main QA testing	QA team	Test data, sandbox payment gateway
UAT	Business validation	Product team	Masked production-like data

Environment issues that block testing for more than 2 hours are escalated to the DevOps lead.
6. Test Data Strategy
Test data is created from scripts and refreshed every sprint. No real customer data or real card numbers are used. Payment tests use gateway sandbox cards. UAT data is a masked copy of production, refreshed quarterly.
7. Tools
Purpose	Tool
Test management	TestRail
Defect tracking	Jira
Automation	Selenium with Java
API testing	Postman
CI/CD	Jenkins
Reporting	Excel dashboards, Jira reports
8. Entry and Exit Criteria
Entry criteria
•	PRD reviewed and signed off.
•	Build deployed to the QA environment and smoke test passed.
•	Test cases reviewed and test data ready.
Exit criteria
•	95% of planned test cases executed; 90% passed.
•	No open Severity 1 or Severity 2 defects.
•	All Severity 3 defects have an agreed plan.
•	Regression suite passed.
•	UAT sign-off received.
9. Defect Management
Severity: S1 Critical (blocks checkout or payment), S2 High (major feature broken, no workaround), S3 Medium (feature issue with workaround), S4 Low (cosmetic).
Priority: P1 fix immediately, P2 fix this release, P3 next release, P4 backlog.
Lifecycle: New, Assigned, In Progress, Fixed, Retest, Closed or Reopened.
Triage: Daily 15-minute meeting during test cycles with QA lead, dev lead, and product owner.
Tracker: Jira project SHOP-QA.
10. Roles and Responsibilities
Role	Responsibility
QA Lead	Owns strategy and test plan; reports status; gives QA sign-off
QA Engineer	Writes and runs test cases; logs defects; retests fixes
Automation Engineer	Builds and maintains regression automation
Developer	Fixes defects; writes unit tests
Product Owner / BA	Clarifies requirements; leads UAT; approves release
11. Risks and Mitigation
Risk	Impact	Likelihood	Mitigation
Requirements change late in the sprint	High	Medium	Impact analysis within 1 day; re-prioritize tests by risk
QA environment unstable	High	Medium	Daily smoke test; escalation path to DevOps
Limited time for regression	Medium	High	Risk-based selection; automate high-value flows
Payment sandbox differs from production	High	Low	Final validation in a production-like UAT environment
12. Reporting and Metrics
Reports: Daily Status Report (during test cycles), Weekly Status Report, Defect Report, Test Closure Report.
Metrics: Planned vs. executed test cases, pass/fail rate, open defects by severity, defect leakage to UAT and production, requirement coverage.
Audience: Team, leads, managers; Weekly Status Report also goes to senior management.
13. Traceability
Every PRD requirement is linked to test scenarios and test cases in TestRail. The traceability matrix is reviewed before test execution starts and before sign-off.
14. Assumptions and Dependencies
•	PRD changes are communicated to QA within 1 business day.
•	The payment gateway sandbox is available during test cycles.
•	Developers deliver builds with release notes.
15. Approvals
Name	Role	Date	Status
Priya Nair	QA Lead	2026-11-01	Approved
Mark Evans	Product Owner	2026-11-02	Approved
Dan Cho	Dev Lead	2026-11-02	Approved



Purpose, Scope, Test Objectives, Test Approach table, Test Environments,
Test Data Strategy, Tools, Entry and Exit Criteria, Defect Management,
Roles and Responsibilities, Risks and Mitigation, Reporting and Metrics,
Traceability, Assumptions and Dependencies, Approvals.]

Style notes: header table at the top, numbered section headings, tables for approach,
environments, tools, roles, risks and approvals, bullets for objectives and criteria.

## P: Parameters
- **Stack:** React 18 + Vite; Node 20 + Express; `pdfkit` (or `pdfmake`) for PDF;
  `axios`; `dotenv`; `vitest`/`jest`. Keep dependencies minimal.
- **Env vars:** `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `PORT`,
  `AI_ENABLED`, `ANTHROPIC_API_KEY` (optional).
- **Security:** secrets only in `.env` (git-ignored, with `.env.example` provided);
  validate the ticket key against `^[A-Z][A-Z0-9]+-\d+$`; enable CORS only for the
  frontend origin; never log tokens.
- **Error handling:** clear messages for 401/403 (bad credentials), 404 (ticket not
  found), network failure, and an empty description. The app must not crash.
- **Quality:** PDF is A4, readable, with page numbers, a header table, and tables that
  don't split awkwardly across pages.
- **Performance:** ticket-to-preview in under 5 seconds without AI.
- **Do not:** hard-code credentials, fabricate ticket data, use real customer data in
  samples, or put implementation files outside `src/`.
- **Config:** `config/defaults.json` is editable so teams can set their own tools,
  environments, and roles.

## O: Output
Deliver, in order:
1. Project tree (`Plan/`, `src/frontend/`, `src/backend/`, `config/`, `README.md`,
   `.env.example`).
2. Complete, runnable code for every file, with no placeholders or "...".
3. Setup and run instructions (install, configure `.env`, start backend and frontend).
4. A sample generated Test Strategy PDF using mock ticket data.
5. A short list of limitations and suggested next steps.

## T: Tone
- Code and README: concise, professional, minimal comments that explain why.
- Test Strategy document: formal, neutral, and precise, written the way a QA lead
  writes, with no marketing language. Use "To be confirmed" for unknowns.
- Explanations to the user: plain and direct.