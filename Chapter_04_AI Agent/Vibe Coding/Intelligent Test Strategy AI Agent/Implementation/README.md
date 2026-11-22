# Jira Test Strategy

[Live- link](https://intelligent-test-strategy-ai-agent.vercel.app)

## Setup

Requires Node.js 20.19+. Install dependencies and start both services:

```powershell
npm install
npm run dev
```

Open http://localhost:5173. For production: run `npm run build`, then `npm start` (http://localhost:3001).

## Configuration

Create `.env` from `.env.example`. Credentials are read by the backend and never sent to the browser. Required Jira variables: `JIRA_BASE_URL`, `JIRA_EMAIL`, and `JIRA_API_TOKEN` (also accepts `JIRA_TOKEN`). `PORT` and `FRONTEND_ORIGIN` are optional. `JIRA_ACCEPTANCE_CRITERIA_FIELD` may name the Jira custom field ID. `GROQ_API_KEY` enables the Groq connection test in Settings. Optional Claude refinement requires `AI_ENABLED=true` and `ANTHROPIC_API_KEY`.

Create a Jira API token in your Atlassian account security settings, then store it only in `.env`.

Edit `config/defaults.json` to configure the team's test types, environments, tools, criteria, and roles. Unknown ticket details are marked “To be confirmed.”

## Use and verify

Enter a Jira key, choose **Fetch & Generate**, review the 15-section strategy, and select **Download PDF**. Use **Settings** to open **Connections** and test Jira or Groq. Use **Back to Strategy** to return. `npm test` runs the focused unit tests. `npm run sample:pdf` creates a clearly fictional `sample-test-strategy.pdf`.

The `.env` file is loaded from this folder. In this workspace only, if it is absent, the backend can use the sibling Test Plan implementation's `.env`. AI is off by default; Jira credentials and issue access are required for live ticket generation.

## Limitations and next steps

- Live Jira generation requires valid credentials and permission to view the issue.
- Configure and review `config/defaults.json` with the QA team; map a custom acceptance-criteria field if needed.
- Claude refinement is optional and was not live-verified; rule-based generation works without it.

## Vercel

Deploy this `Implementation/` directory as its own Vercel project. Add the needed `.env` values as Vercel project environment variables; `.env` files are excluded from deployment.
