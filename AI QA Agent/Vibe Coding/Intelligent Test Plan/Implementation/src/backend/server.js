const path = require("path");
const fs = require("fs");
const express = require("express");

const implementationDir = path.resolve(__dirname, "../..");
const envPath = path.join(implementationDir, ".env");
require("dotenv").config({ path: envPath });

const app = express();
app.use(express.json({ limit: "100kb" }));

const MISSING = "Insufficient information to determine.";

function adfToText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (Array.isArray(value)) return value.map(adfToText).filter(Boolean).join("\n");
    if (typeof value.text === "string") return value.text;
    if (value.content) return adfToText(value.content);
  }
  return "";
}

async function jiraRequest(url, options = {}) {
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_TOKEN;
  if (!email || !token) throw Object.assign(new Error("Jira configuration is missing."), { status: 503 });
  const auth = Buffer.from(`${email}:${token}`).toString("base64");
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    let status = "Jira request failed.";
    if (response.status === 401) status = "Jira authentication failed.";
    if (response.status === 403) status = "Jira permission denied.";
    if (response.status === 404) status = "Jira issue or project was not found.";
    throw Object.assign(new Error(status), { status: response.status === 404 ? 404 : 502 });
  }
  return response.json();
}

function findAcceptanceCriteria(fields) {
  for (const [name, value] of Object.entries(fields || {})) {
    if (/acceptance.?criteria/i.test(name)) return adfToText(value);
  }
  for (const [name, value] of Object.entries(fields || {})) {
    if (/acceptance.?criteria/i.test(name.replace(/^customfield_\w+$/, ""))) return adfToText(value);
  }
  return "";
}

function extractIssue(issue) {
  const fields = issue.fields || {};
  const description = adfToText(fields.description);
  const acceptanceCriteria = findAcceptanceCriteria(fields);
  return {
    key: issue.key,
    title: fields.summary || MISSING,
    description: description || MISSING,
    acceptanceCriteria: acceptanceCriteria || MISSING,
    status: fields.status?.name || MISSING,
    issueType: fields.issuetype?.name || MISSING,
    priority: fields.priority?.name || MISSING,
    labels: Array.isArray(fields.labels) ? fields.labels : []
  };
}

function deterministicPlan(issue) {
  const scopeRequirements = issue.description === MISSING
    ? MISSING
    : issue.description;
  const acceptance = issue.acceptanceCriteria === MISSING
    ? MISSING
    : issue.acceptanceCriteria;

  return `# Test Plan — ${issue.key}: ${issue.title}

> Status: **DRAFT — pending human review.** Not approved until a QA owner signs off.
> Source: Jira issue ${issue.key}

## 1. Scope & Objectives
- **In scope:**
  - ${scopeRequirements}
  - Acceptance criteria: ${acceptance}
- **Out of scope:** ${MISSING}
- **Objective:** Proposal — verify the Jira-described behavior for ${issue.key}. ${issue.description === MISSING ? MISSING : ""}

## 2. Gaps & Questions for the author
| # | Area | Finding (⚠️/❌) | Question to author |
|---|------|----------------|--------------------|
| 1 | Requirements | ${issue.description === MISSING ? "❌" : "⚠️"} | ${issue.description === MISSING ? "Please provide the requirement details." : "Please confirm whether the retrieved description is complete."} |
| 2 | Acceptance criteria | ${issue.acceptanceCriteria === MISSING ? "❌" : "⚠️"} | ${issue.acceptanceCriteria === MISSING ? "Please provide acceptance criteria." : "Please confirm the acceptance criteria."} |
| 3 | Environment | ❌ | ${MISSING} |

## 3. Test Scenarios
| ID | Priority | Type (pos/neg/boundary) | Scenario | Maps to (AC / gap) |
|---|---|---|---|---|
| TS-1 | P0 | positive | Proposal — verify the behavior documented in the Jira description. | ${issue.description === MISSING ? "Gap: requirement missing" : "Jira description"} |
| TS-2 | P1 | negative | Proposal — verify behavior for invalid or unsupported input if applicable. | ${issue.acceptanceCriteria === MISSING ? "Gap: acceptance criteria missing" : "Derived proposal only"} |

## 4. Test Data & Environment
- **Data:** ${MISSING}
- **Environment / flags:** ${MISSING}
- **Roles / permissions:** ${MISSING}

## 5. Risks & Assumptions
- **Assumptions made:** No assumptions beyond the retrieved Jira description.
- **Risks:** Missing requirements, acceptance criteria, test data, environment, and role details prevent complete coverage.

## 6. Entry / Exit criteria
- **Entry:** ${MISSING}
- **Exit:** ${MISSING}

## 7. Resource Allocation
${MISSING}

## 8. Timelines, Sprint Details
- **Issue status:** ${issue.status}
- **Issue type:** ${issue.issueType}
- **Priority:** ${issue.priority}
- **Labels:** ${issue.labels.length ? issue.labels.join(", ") : MISSING}

---
## HUMAN REVIEW GATE
- **I assumed:** No confirmed requirements beyond retrieved Jira content.
- **I could not confirm:** ${MISSING}
- **Open questions blocking sign-off:** Requirements, acceptance criteria, environment, test data, roles, entry criteria, exit criteria, resources, and timelines may require author confirmation.
- **Approve, or edit, before I write test cases / automation.**`;
}

async function generateWithGroq(issue) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return deterministicPlan(issue);
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const template = fs.readFileSync(path.join(implementationDir, "TestPlan_Template.md"), "utf8");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `Generate the supplied test plan only. Do not invent requirements. Use exactly "${MISSING}" for missing information. Label proposed testing activities as proposals. Base all claims on the Jira source data.`
        },
        {
          role: "user",
          content: `Template:\n${template}\n\nJira source:\n${JSON.stringify(issue)}`
        }
      ]
    })
  });
  if (!response.ok) return deterministicPlan(issue);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || deterministicPlan(issue);
}

app.post("/api/generate", async (request, response) => {
  const issueId = String(request.body.issueId || "").trim().toUpperCase();
  if (!/^([A-Z][A-Z0-9]*-)[0-9]+$/.test(issueId)) {
    return response.status(400).json({ error: "Enter a valid Jira issue ID, for example QA-123." });
  }
  const baseUrl = (process.env.JIRA_BASE_URL || "").replace(/\/$/, "");
  if (!baseUrl) return response.status(503).json({ error: "Jira configuration is missing." });
  try {
    const issue = await jiraRequest(`${baseUrl}/rest/api/3/issue/${encodeURIComponent(issueId)}?fields=*all`);
    const extracted = extractIssue(issue);
    const plan = await generateWithGroq(extracted);
    response.json({ plan, issueKey: extracted.key });
  } catch (error) {
    response.status(error.status || 502).json({ error: error.message || "Unable to retrieve the Jira issue." });
  }
});

app.get("/api/settings/test/jira", async (_request, response) => {
  const baseUrl = (process.env.JIRA_BASE_URL || "").replace(/\/$/, "");
  if (!baseUrl || !process.env.JIRA_EMAIL || !process.env.JIRA_TOKEN) {
    return response.status(503).json({ error: "Jira configuration is missing." });
  }
  try {
    await jiraRequest(`${baseUrl}/rest/api/3/myself`);
    response.json({ message: "Jira connection successful." });
  } catch (error) {
    response.status(error.status || 502).json({ error: error.message });
  }
});

app.get("/api/settings/test/groq", async (_request, response) => {
  if (!process.env.GROQ_API_KEY) {
    return response.status(503).json({ error: "Groq is not configured; deterministic generation is available." });
  }
  response.json({ message: "Groq API key is configured. Generation can use Groq." });
});

const distDir = path.join(implementationDir, "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((request, response, next) => {
    if (request.method !== "GET" || request.path.startsWith("/api/")) return next();
    response.sendFile(path.join(distDir, "index.html"));
  });
}

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = app;
