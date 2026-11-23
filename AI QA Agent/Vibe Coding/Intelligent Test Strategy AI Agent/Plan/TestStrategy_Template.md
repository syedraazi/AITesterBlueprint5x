## Test Strategy: <JIRA-KEY> : <title>
SAMPLE DOCUMENT. All names, tools, dates, and numbers are fictional.
Version	1.0
Date	2026-11-01
Author	Priya Nair, QA Lead
Reviewers	Mark Evans (Product Owner), Dan Cho (Dev Lead)
Related documents	PRD: ShopEasy Checkout PRD v2.1 / Test Plan: Release 3.2 Test Plan

## Purpose

This strategy defines how ShopEasy's checkout module is tested across releases. It sets the test types, tools, environments, quality gates, and reporting that all release test plans follow.
## Scope
In scope: Guest and registered checkout, cart, payment (card, wallet), order confirmation emails, promo codes, address validation, order history.
Out of scope: Warehouse systems, third-party payment gateway internals, mobile app (covered by a separate strategy).
## Test Objectives
•	Verify every PRD requirement and acceptance criterion is met.
•	Find defects as early as possible, before UAT.
•	Protect payment and personal data accuracy.
•	Provide clear go/no-go evidence for each release.
## Test Approach
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
## Test Environments
Environment	Purpose	Owner	Data
DEV	Developer checks	Dev team	Mock data
QA	Main QA testing	QA team	Test data, sandbox payment gateway
UAT	Business validation	Product team	Masked production-like data

Environment issues that block testing for more than 2 hours are escalated to the DevOps lead.
## Test Data Strategy
Test data is created from scripts and refreshed every sprint. No real customer data or real card numbers are used. Payment tests use gateway sandbox cards. UAT data is a masked copy of production, refreshed quarterly.
## Tools
Purpose	Tool
Test management	TestRail
Defect tracking	Jira
Automation	Selenium with Java
API testing	Postman
CI/CD	Jenkins
Reporting	Excel dashboards, Jira reports
## Entry and Exit Criteria
# Entry criteria
•	PRD reviewed and signed off.
•	Build deployed to the QA environment and smoke test passed.
•	Test cases reviewed and test data ready.
# Exit criteria
•	95% of planned test cases executed; 90% passed.
•	No open Severity 1 or Severity 2 defects.
•	All Severity 3 defects have an agreed plan.
•	Regression suite passed.
•	UAT sign-off received.
## Defect Management
Severity: S1 Critical (blocks checkout or payment), S2 High (major feature broken, no workaround), S3 Medium (feature issue with workaround), S4 Low (cosmetic).
Priority: P1 fix immediately, P2 fix this release, P3 next release, P4 backlog.
Lifecycle: New, Assigned, In Progress, Fixed, Retest, Closed or Reopened.
Triage: Daily 15-minute meeting during test cycles with QA lead, dev lead, and product owner.
Tracker: Jira project SHOP-QA.
## Roles and Responsibilities
Role	Responsibility
QA Lead	Owns strategy and test plan; reports status; gives QA sign-off
QA Engineer	Writes and runs test cases; logs defects; retests fixes
Automation Engineer	Builds and maintains regression automation
Developer	Fixes defects; writes unit tests
Product Owner / BA	Clarifies requirements; leads UAT; approves release
## Risks and Mitigation
Risk	Impact	Likelihood	Mitigation
Requirements change late in the sprint	High	Medium	Impact analysis within 1 day; re-prioritize tests by risk
QA environment unstable	High	Medium	Daily smoke test; escalation path to DevOps
Limited time for regression	Medium	High	Risk-based selection; automate high-value flows
Payment sandbox differs from production	High	Low	Final validation in a production-like UAT environment
## Reporting and Metrics
Reports: Daily Status Report (during test cycles), Weekly Status Report, Defect Report, Test Closure Report.
Metrics: Planned vs. executed test cases, pass/fail rate, open defects by severity, defect leakage to UAT and production, requirement coverage.
Audience: Team, leads, managers; Weekly Status Report also goes to senior management.
## Traceability
Every PRD requirement is linked to test scenarios and test cases in TestRail. The traceability matrix is reviewed before test execution starts and before sign-off.
## Assumptions and Dependencies
•	PRD changes are communicated to QA within 1 business day.
•	The payment gateway sandbox is available during test cycles.
•	Developers deliver builds with release notes.
## Approvals
Name	Role	Date	Status
Priya Nair	QA Lead	2026-11-01	Approved
Mark Evans	Product Owner	2026-11-02	Approved
Dan Cho	Dev Lead	2026-11-02	Approved

