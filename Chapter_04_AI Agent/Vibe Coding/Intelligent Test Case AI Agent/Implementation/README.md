# Jira Test Case Generator

## Run locally

Requires Node.js 20+. In `Implementation/` run:

```powershell
npm install
npm run dev
```

Open http://localhost:5174. Production: `npm run build`, then `npm start` at http://localhost:3002.

## Configuration

Create `.env` from `.env.example`. Required: `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, and `GROQ_API_KEY`. `GROQ_MODEL` is optional; when unset, the server selects an active chat model from Groq's current model list. Credentials stay on the backend. Create Jira API tokens from Atlassian account security settings and Groq keys from the Groq console.

In this workspace, if `Implementation/.env` is absent, the server falls back to the existing Test Plan implementation `.env`. A local `.env` takes precedence.

## Use

Enter a Jira ticket key, select **Fetch & Generate**, edit the table if needed, and select **Download Excel**. Settings opens Jira and Groq connection tests. The workbook uses the supplied `Plan/vwo-login-dashboard-test-cases.xlsx` template and its exact sheets and columns. `npm run sample:excel` creates a fictional `sample-test-cases.xlsx`.

## Verify and limitations

Run `npm test` for ADF, workbook mapping, and schema checks. Jira-linked PRD issues and TXT, MD, or CSV attachments are imported when accessible; other attachment formats are reported as skipped. Cases are drafts; review proposed priorities and assumptions before execution.
