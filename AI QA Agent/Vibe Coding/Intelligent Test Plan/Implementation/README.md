# Intelligent Test Plan Generator

[Live- link](https://intelligent-test-plan-sooty.vercel.app)

## Install

Prerequisites: Node.js 18 or newer.

```bat
cd implementation
npm install
npm run dev
```

Open http://localhost:5173.

## Configuration

The backend reads `Implementation/.env` automatically. It supports `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_TOKEN`, optional `GROQ_API_KEY`, optional `GROQ_MODEL`, and optional `PORT`.

Do not commit `.env` or expose credentials.

## Run

- Development: `npm run dev`
- Production build: `npm run build`
- Production server: `npm start`

Production server is available at http://localhost:3000.

Enter a Jira issue ID such as `QA-123`, then submit. The Settings page tests Jira and reports Groq configuration status.

## Verification

- Frontend and backend run locally.
- Jira access is tested through the Settings page.
- Groq generation falls back to deterministic generation if unavailable.
- No live Jira result is treated as verified without a real successful API response.

## Vercel

Deploy this `Implementation/` directory as its own Vercel project. Add the needed `.env` values as Vercel project environment variables; `.env` files are excluded from deployment.
