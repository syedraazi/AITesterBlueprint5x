# RICEPOT PROMPT: Intelligent Test Planning AI Agent (Unified App)

## R: Role
Act as a senior full-stack engineer and QA architect with 15 years of experience in
React, Node.js, JIRA Cloud integration, LLM-assisted test design, and document
generation (PDF, Excel). Build and design this as one cohesive product, not three
separate tools. Outputs must be ones a QA lead would sign off on.

## I: Instructions
1. Build ONE lightweight React application, "Intelligent Test Planning AI Agent", with:
   - A single main workspace where the user switches between three agents using tabs
     or a segmented control, without losing state when switching:
     1. **Test Strategy Builder**: JIRA ticket -> Test Strategy -> PDF
     2. **Test Plan Builder**: JIRA ticket (+ optional strategy) -> Test Plan -> PDF
     3. **Test Case Creator**: JIRA ticket / PRD -> Test Cases -> Excel
   - A separate **Settings** screen (gear icon, always reachable) to configure and
     test connections.
2. Shared input across agents: one JIRA ticket key field at the top of the workspace.
   Fetching once caches the normalized ticket, and all three agents reuse it. Show the
   fetched ticket summary (key, title, type, priority, status) in a collapsible card.
3. Agent chaining: the Test Plan and Test Case agents may use the generated Test
   Strategy as extra context if one exists for the current ticket, and show a
   "Using strategy from <time>" indicator. They must also work without it.
4. Templates (read-only inputs; read them before generating anything):
   - Strategy and Plan templates: `Plan/` folder (PDF/DOCX/MD). Mirror section order
     and headings. If a template is missing, use the 15-section Test Strategy
     structure below and a standard Test Plan structure (see Example).
   - Test case template: `Plan/vwo-login-dashboard-test-cases.xlsx`. Extract sheet
     names, columns, order, widths, header styling, and dropdowns, and mirror them
     exactly. Do not invent columns.
5. Designs: use the screens in the `Design/` folder.
   - Main workspace design -> workspace layout (adapt tabs for the 3 agents).
   - Connection-test design -> Settings screen.
   Follow their layout, colors, and components. If an image is unreadable, say so and
   ask rather than guess.
6. Backend (Node/Express) endpoints:
   - `GET /api/jira/:key`: fetch via JIRA REST API v3, convert ADF to text, return
     normalized data (key, summary, description, acceptance criteria, type, priority,
     status, labels, components, fix versions, assignee, reporter, linked issues,
     sub-tasks, parent epic, linked PRD text where accessible).
   - `POST /api/strategy`, `POST /api/plan`, `POST /api/test-cases`: generate
     structured JSON for each agent via Groq.
   - `POST /api/strategy/pdf`, `POST /api/plan/pdf`: return PDF.
   - `POST /api/test-cases/xlsx` and `GET /api/download/:id`: return the Excel file
     with `Content-Disposition: attachment`.
   - `POST /api/connections/test`: verify JIRA (`/rest/api/3/myself`) and Groq
     (minimal completion); return per-service status and a clear failure reason.
   - `GET/PUT /api/settings`: read and save non-secret settings; secrets are write-only
     and never returned to the browser.
7. Groq integration:
   - Call Groq's OpenAI-compatible chat completions endpoint from the backend only.
   - Model from `GROQ_MODEL` in `.env`; allow overriding it in Settings. Check Groq's
     current model list for a default.
   - Each agent has its own prompt template in `Implementation/src/prompts/`.
   - Request JSON output, validate with a schema, and retry once with a repair prompt.
   - Chunk long PRDs by requirement or acceptance criterion, then merge and
     de-duplicate. Respect rate limits (429) with backoff.
   - Never invent requirements. Anything not derivable from the ticket is marked
     "To be confirmed" (documents) or "Assumption" (test cases).
8. Frontend behavior (React + Vite):
   - Each agent tab has: **Generate**, an editable preview (text fields for documents,
     editable table for test cases), and a download button (PDF or Excel) enabled only
     after successful generation.
   - Loading progress, empty states, and error states per tab.
   - Settings: JIRA base URL, email, API token, Groq API key, model; **Test
     Connection** button per service with pass/fail badges; unsaved-changes warning.
   - Persist non-secret UI state (last ticket key, last tab) in localStorage.
9. Folder structure: all implementation inside `Implementation/`:
   - `Implementation/frontend/` (React app: workspace, tabs, settings)
   - `Implementation/backend/` (Express, routes, JIRA/Groq/PDF/Excel services)
   - `Implementation/src/` (shared code: prompts, JSON schemas, template mappers,
     defaults)
   - `Plan/` and `Design/` are read-only inputs.
10. Write `README.md` (setup, `.env`, getting a JIRA API token and Groq API key, running
    the app) and unit tests: ADF-to-text, test case template column mapping, JSON schema
    validation for all three outputs, and the connection-test service (mocked).
11. Use all the knowledge from All 3 folders Intelligent Test Case, Intelligent Test Plan and Intelligent Test Strategy.

## C: Context
- Audience: QA leads and engineers who currently write strategies, plans, and test
  cases by hand from JIRA tickets and PRDs.
- Workflow: strategy first (how we test), then plan (what, who, when), then test cases
  (the detail). The unified app supports that order but doesn't enforce it.
- The JIRA ticket and its linked PRD are the only sources of requirements. Environments,
  tools, roles, schedules, and risks come from editable defaults
  (`Implementation/src/defaults.json`) or are marked "To be confirmed".
- All AI output is a draft for human review, hence the editable previews.
- Runs locally. Credentials stay on the backend and are never sent to the browser or
  logged. Target: JIRA Cloud (REST API v3).

## E: Example
- **Test Strategy structure (15 sections):** Header table (version, date, author,
  reviewers, related documents); 1 Purpose; 2 Scope (in/out); 3 Test Objectives;
  4 Test Approach (table: level/type, applies, who, when, notes); 5 Test Environments;
  6 Test Data Strategy; 7 Tools; 8 Entry and Exit Criteria; 9 Defect Management;
  10 Roles and Responsibilities; 11 Risks and Mitigation; 12 Reporting and Metrics;
  13 Traceability; 14 Assumptions and Dependencies; 15 Approvals.
  (Use the ShopEasy sample from the earlier prompt as the format reference.)
- **Test Plan structure (default if no template):** Header; 1 Introduction;
  2 Test Items and Features in Scope; 3 Features Not Tested; 4 Test Approach (links
  to the Strategy); 5 Schedule and Milestones; 6 Resources and Roles; 7 Test
  Environment; 8 Test Deliverables; 9 Entry/Exit/Suspension Criteria; 10 Risks and
  Contingencies; 11 Defect Management; 12 Approvals.
- **Test cases:** `Plan/vwo-login-dashboard-test-cases.xlsx` is the authority for
  columns, ID format, wording, and priority/type vocabulary.
  Full path: `C:\Users\sraz2\Desktop\AITesterBlueprint5x\Chapter_04_AI Agent\Vibe Coding\Intelligent Test Case AI Agent\Plan\vwo-login-dashboard-test-cases.xlsx`

## P: Parameters
- **Stack:** React 18 + Vite; Node 20 + Express; `pdfkit` or `pdfmake`; `exceljs`;
  `axios`; `dotenv`; `zod`; `vitest`/`jest`. Minimal dependencies, no heavy UI
  framework.
- **Env vars:** `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `GROQ_API_KEY`,
  `GROQ_MODEL`, `PORT`. Provide `.env.example`; `.env` is git-ignored.
- **Security:** validate the ticket key against `^[A-Z][A-Z0-9]+-\d+$`; CORS limited to
  the frontend origin; mask secrets in Settings; never log tokens.
- **Errors:** clear messages for 401/403, 404, Groq 429 and timeouts, empty
  description, malformed model output, and network failures. The app must never crash,
  and an error in one tab must not affect the others.
- **Quality:** PDFs are A4 with page numbers and tables that don't split awkwardly.
  Excel has the frozen header, filters, and template styling, and is named
  `<KEY>-test-cases-<YYYYMMDD>.xlsx`. Test case IDs are unique, and every case has
  preconditions, steps, expected result, priority, type, and a requirement reference.
- **Performance:** show progress while generating; cap input size and say so if the PRD
  is truncated.
- **Do not:** hard-code credentials, add Excel columns not in the template, use real
  customer data, or place implementation files outside `Implementation/`.

## O: Output
Deliver, in order:
1. Project tree.
2. Complete, runnable code for every file, with no placeholders or "...".
3. Setup and run instructions.
4. Sample outputs from mock ticket data: Strategy PDF, Plan PDF, Test Case `.xlsx`.
5. A short list of limitations and next steps.

## T: Tone
- Code and README: concise, professional, comments only where they explain why.
- Strategy and Plan documents: formal, neutral, precise; "To be confirmed" for unknowns.
- Test cases: imperative, one action per step, objectively verifiable expected results,
  no vague wording like "works properly".
- UI copy and explanations to the user: plain and direct.