# RICEPOT PROMPT: JIRA PRD-to-Test-Cases Generator (Excel)

## R: Role
Act as a senior full-stack engineer and QA manual and automation architect with 15 years
of experience in React, Node.js, JIRA Cloud integration, LLM-assisted test design, and
test case generation. Write test cases the way a senior QA lead would: traceable to
requirements, unambiguous, and executable by someone who has never seen the feature.

## I: Instructions
1. Build a lightweight React application that fetches a JIRA ticket containing the PRD /
   requirements, generates test cases using the Groq API, and exports them to Excel.
2. Read the template first: open the sample workbook in the Plan folder, extract its
   sheet names, column headers, column order, widths, header styling, and any
   dropdowns/data validation, and mirror them exactly in the generated file.
   Do not invent columns. Take example rows as the quality bar for wording and detail.
3. Use both designs in the Design folder:
   - **Screen 1 (main screen):** enter a JIRA ticket key, generate test cases, preview
     them in a table, and use the download link.
   - **Screen 2 (connection screen):** configure and test the JIRA and Groq connections
     and show pass/fail status for each.
   Follow the layout, spacing, colors, and components in the designs. If an image is
   unreadable, say so and ask rather than guessing.
4. Backend (Node/Express):
   - `GET /api/jira/:key` fetches the issue via JIRA REST API v3 and returns normalized
     data: key, summary, description (convert Atlassian Document Format to text),
     acceptance criteria, issue type, priority, labels, components, linked issues,
     sub-tasks, parent epic, and text of any attached or linked PRD if accessible.
   - `POST /api/test-cases` sends the normalized ticket to Groq and returns validated
     test case JSON.
   - `POST /api/connections/test` verifies JIRA (authenticated call to
     `/rest/api/3/myself`) and Groq (minimal chat completion), returning per-service
     status and a clear error reason.
   - `GET /api/download/:id` returns the generated `.xlsx` with the correct headers
     (`Content-Disposition: attachment`).
5. Groq integration:
   - Call the Groq OpenAI-compatible chat completions endpoint from the backend only.
   - Model name comes from `GROQ_MODEL` in `.env`, not hard-coded. Check Groq's current
     model list for a suitable default.
   - Request JSON output, validate it against a schema, and retry once with a repair
     prompt if invalid.
   - For long PRDs, chunk by requirement or acceptance criterion to stay within token
     and rate limits, then merge and de-duplicate results.
   - Prompt the model to cover: positive, negative, boundary, validation, error
     handling, security, usability, and accessibility cases where the requirements imply
     them. Every test case must reference the acceptance criterion or requirement it
     verifies. Mark anything not stated in the ticket as an assumption rather than
     inventing behavior.
6. Excel generation (backend, `exceljs`): populate the template's columns, apply its
   styling, freeze the header row, enable filters, and name the file
   `<TICKET-KEY>-test-cases-<YYYYMMDD>.xlsx`.
7. Frontend (React + Vite): the two screens above, loading, empty and error states, an
   editable preview table before export (so the user can fix rows), and a
   **Download Excel** link enabled only after generation succeeds.
8. Folder structure: put all implementation files inside `Implementation/`:
   - `Implementation/frontend/` (React app)
   - `Implementation/backend/` (Express server, JIRA, Groq, Excel services)
   - `Implementation/src/` (shared code: template mapping, prompt templates, schemas)
   `Plan/` (template) and `Design/` (screens) are read-only inputs.
9. Write a `README.md` (setup, `.env`, how to get a JIRA API token and a Groq API key,
   how to run) and a few unit tests: ADF-to-text, template column mapping, and JSON
   schema validation of model output.

## C: Context
- Audience: QA engineers and leads who write test cases by hand from PRDs.
- The JIRA ticket (or its linked/attached PRD) is the only source of requirements.
  The LLM must not invent features, fields, or business rules.
- Generated test cases are a draft for human review, so the preview must be editable.
- Runs locally. JIRA and Groq credentials stay on the backend and are never sent to the
  browser or logged.
- Target: JIRA Cloud (REST API v3).

## E: Example
- Template: `C:\Users\sraz2\Desktop\AITesterBlueprint5x\Chapter_04_AI Agent\Vibe Coding\Intelligent Test Case AI Agent\Plan\vwo-login-dashboard-test-cases.xlsx`
  (the file `vwo-login-dashboard-test-cases.xlsx`)
- Treat it as the authority for columns, field naming, ID format, level of detail in
  steps and expected results, and priority/type vocabulary.
- Design images: in the `Design` folder (two screens, as described above).

## P: Parameters
- **Stack:** React 18 + Vite; Node 20 + Express; `exceljs`; `axios`; `dotenv`; `zod` (or
  similar) for validation; `vitest`/`jest`. Keep dependencies minimal.
- **Env vars:** `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `GROQ_API_KEY`,
  `GROQ_MODEL`, `PORT`.
- **Security:** secrets only in `.env` (git-ignored, with `.env.example` provided);
  validate the key against `^[A-Z][A-Z0-9]+-\d+$`; CORS limited to the frontend origin;
  never log tokens.
- **Errors:** clear messages for 401/403, 404, Groq rate limit (429) and timeouts, empty
  description, malformed model output, and network failures. The app must never crash.
- **Quality:** unique test case IDs; no duplicates; every case has preconditions, steps,
  expected result, priority, and type; no real customer data in test data.
- **Performance:** show progress while generating; cap input size and say so if the
  PRD is truncated.
- **Do not:** hard-code credentials, add columns not in the template, or place
  implementation files outside `Implementation/`.

## O: Output
Deliver, in order:
1. The project tree.
2. Complete, runnable code for every file, with no placeholders.
3. Setup and run instructions.
4. A sample `.xlsx` generated from mock ticket data.
5. A short list of limitations and next steps.

## T: Tone
- Code and README: concise and professional, comments only where they explain why.
- Test cases: precise, imperative, one action per step, objectively verifiable expected
  results, no vague wording like "works properly".
- Explanations to the user: plain and direct.