# Intelligent Test Planning AI Agent

The workspace provides Test Strategy, Test Plan, and Test Case screens with a shared navigation bar and connection settings. Strategy and Plan download as PDF; Test Cases download as Excel.

## Run

Node.js 20+ is required. In this folder, run:

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5180`. The app uses the existing `.env` in this folder. Required settings are `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_TOKEN` (or `JIRA_API_TOKEN`), and `GROQ_API_KEY`. Credentials stay on the backend.

The three agents and their source, templates, and tests are kept under `agents/`.

## Vercel

Deploy the three agent apps first, then deploy this workspace as `ai-intelligent-agent`. Set `VITE_STRATEGY_AGENT_URL`, `VITE_PLAN_AGENT_URL`, and `VITE_CASES_AGENT_URL` to the three deployed app URLs in this project's Vercel build environment, then redeploy the workspace. Add Jira and Groq settings as Vercel environment variables; `.env` files are excluded from deployment.
