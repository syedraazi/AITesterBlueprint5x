export const TO_BE_CONFIRMED = "To be confirmed";

function readAdf(node, output) {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((child) => readAdf(child, output));
    return;
  }
  if (node.type === "text") output.push(node.text || "");
  else if (node.type === "hardBreak") output.push("\n");
  else if (node.content) {
    readAdf(node.content, output);
    if (["paragraph", "heading", "listItem"].includes(node.type)) output.push("\n");
  }
}

export function adfToText(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  const parts = [];
  readAdf(value, parts);
  return parts.join("").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function displayName(person) {
  return person?.displayName || person?.name || TO_BE_CONFIRMED;
}

function fieldText(value) {
  if (Array.isArray(value)) return value.map((item) => item?.name || item?.value || "").filter(Boolean);
  return value?.name || value?.value || "";
}

function normalizeLinkedIssues(fields) {
  return (fields.issuelinks || []).map((link) => {
    const linked = link.inwardIssue || link.outwardIssue;
    if (!linked) return null;
    return {
      key: linked.key,
      relation: link.type?.name || TO_BE_CONFIRMED,
      summary: linked.fields?.summary || TO_BE_CONFIRMED,
      status: linked.fields?.status?.name || TO_BE_CONFIRMED
    };
  }).filter(Boolean);
}

function findAcceptanceCriteria(fields, names = {}, configuredField = "") {
  const candidateIds = Object.keys(fields).filter((id) => {
    const name = names[id] || id;
    return /acceptance.?criteria/i.test(name);
  });
  if (configuredField && fields[configuredField] !== undefined) candidateIds.unshift(configuredField);
  for (const id of [...new Set(candidateIds)]) {
    const text = adfToText(fields[id]);
    if (text) return text;
  }
  const description = adfToText(fields.description);
  const criteriaSection = description.match(/(?:^|\n)\s*(?:acceptance criteria|acceptance criteria:)\s*[:\n-]*([\s\S]*?)(?=\n\s*(?:[A-Z][^\n]{1,50}:)?\s*\n|$)/i);
  return criteriaSection?.[1]?.trim() || "";
}

export function mapJiraIssue(issue, names = {}, configuredAcceptanceField = "") {
  const fields = issue.fields || {};
  const description = adfToText(fields.description);
  const epicLinkField = Object.keys(fields).find((id) => /epic link/i.test(names[id] || id));
  const epicLink = epicLinkField ? fields[epicLinkField] : "";
  return {
    key: issue.key || TO_BE_CONFIRMED,
    summary: fields.summary || TO_BE_CONFIRMED,
    description: description || "",
    issueType: fields.issuetype?.name || TO_BE_CONFIRMED,
    priority: fields.priority?.name || TO_BE_CONFIRMED,
    status: fields.status?.name || TO_BE_CONFIRMED,
    labels: Array.isArray(fields.labels) ? fields.labels : [],
    components: (fields.components || []).map((component) => component.name).filter(Boolean),
    fixVersions: (fields.fixVersions || []).map((version) => version.name).filter(Boolean),
    assignee: displayName(fields.assignee),
    reporter: displayName(fields.reporter),
    acceptanceCriteria: findAcceptanceCriteria(fields, names, configuredAcceptanceField),
    warnings: description ? [] : ["Jira ticket description is empty. Scope and requirements need confirmation."],
    linkedIssues: normalizeLinkedIssues(fields),
    subTasks: (fields.subtasks || []).map((subtask) => ({
      key: subtask.key,
      summary: subtask.fields?.summary || TO_BE_CONFIRMED,
      status: subtask.fields?.status?.name || TO_BE_CONFIRMED
    })),
    parentEpic: fields.parent?.key || epicLink?.key || epicLink || TO_BE_CONFIRMED,
    sourceUrl: issue.self || ""
  };
}

function listOrConfirm(values) {
  return values?.length ? values : [TO_BE_CONFIRMED];
}

export function buildStrategy(ticket, defaults, date = new Date().toISOString().slice(0, 10)) {
  const hasDescription = Boolean(ticket.description?.trim());
  const criteria = ticket.acceptanceCriteria?.trim()
    ? ticket.acceptanceCriteria.split(/\n+/).map((item) => item.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim()).filter(Boolean)
    : [];
  const requirements = criteria.length
    ? criteria
    : hasDescription
      ? [ticket.description.trim()]
      : [TO_BE_CONFIRMED];
  const scopeEvidence = [
    ticket.summary,
    hasDescription ? ticket.description.trim() : TO_BE_CONFIRMED,
    `Issue type: ${ticket.issueType || TO_BE_CONFIRMED}; priority: ${ticket.priority || TO_BE_CONFIRMED}; status: ${ticket.status || TO_BE_CONFIRMED}`,
    ticket.components?.length ? `Components: ${ticket.components.join(", ")}` : "",
    ticket.fixVersions?.length ? `Fix versions: ${ticket.fixVersions.join(", ")}` : "",
    ticket.labels?.length ? `Labels: ${ticket.labels.join(", ")}` : ""
  ].filter(Boolean);
  const ticketRisks = [];
  if (ticket.priority && ticket.priority !== TO_BE_CONFIRMED) {
    ticketRisks.push({
      risk: `Jira priority is ${ticket.priority}; confirm whether it changes test depth or release criteria.`,
      impact: ticket.priority,
      likelihood: TO_BE_CONFIRMED,
      mitigation: "Confirm risk response with QA and the product owner."
    });
  }
  if (ticket.linkedIssues?.length) {
    ticketRisks.push({
      risk: `Linked Jira issues may affect scope or sequencing: ${ticket.linkedIssues.map((issue) => issue.key).join(", ")}.`,
      impact: TO_BE_CONFIRMED,
      likelihood: TO_BE_CONFIRMED,
      mitigation: "Review linked issue status and dependencies before test execution."
    });
  }

  return {
    header: {
      title: `Test Strategy: ${ticket.key} - ${ticket.summary}`,
      version: "1.0",
      date,
      author: ticket.reporter || TO_BE_CONFIRMED,
      reviewers: listOrConfirm([ticket.assignee].filter((name) => name && name !== TO_BE_CONFIRMED)),
      relatedDocuments: [
        `Jira: ${ticket.key}${ticket.sourceUrl ? ` (${ticket.sourceUrl})` : ""}`,
        ...ticket.linkedIssues.map((linked) => `${linked.key} (${linked.relation})`)
      ]
    },
    ticket,
    warnings: ticket.warnings || [],
    sections: [
      { title: "1. Purpose", paragraphs: [`Define the test strategy for Jira ${ticket.key} (${ticket.summary}). Scope and detailed behavior are based on the ticket; items not supplied are marked "${TO_BE_CONFIRMED}".`] },
      { title: "2. Scope", paragraphs: [
        `In scope: ${scopeEvidence.join(" — ")}`,
        `Out of scope: ${TO_BE_CONFIRMED}`
      ] },
      { title: "3. Test Objectives", bullets: [
        `Verify the confirmed requirements: ${requirements.join("; ")}`,
        "Identify and communicate defects before acceptance.",
        `Provide test evidence for ${ticket.key} release decisions.`
      ] },
      { title: "4. Test Approach", table: {
        headers: ["Test Level / Type", "Applies?", "Who", "When", "Notes"],
        rows: defaults.testApproach.map((row) => [
          row.level,
          row.applies,
          row.who,
          row.when,
          row.notes
        ])
      }, paragraphs: [`Manual vs. automation: ${defaults.manualAutomation}`] },
      { title: "5. Test Environments", table: {
        headers: ["Environment", "Purpose", "Owner", "Data"],
        rows: defaults.environments.map((row) => [row.environment, row.purpose, row.owner, row.data])
      }, paragraphs: [defaults.environmentEscalation] },
      { title: "6. Test Data Strategy", paragraphs: [defaults.testDataStrategy] },
      { title: "7. Tools", table: {
        headers: ["Purpose", "Tool"],
        rows: defaults.tools.map((row) => [row.purpose, row.tool])
      } },
      { title: "8. Entry and Exit Criteria", subsections: [
        { title: "Entry criteria", bullets: listOrConfirm(defaults.entryCriteria) },
        { title: "Exit criteria", bullets: listOrConfirm(defaults.exitCriteria) }
      ] },
      { title: "9. Defect Management", paragraphs: [
        `Severity: ${defaults.defectManagement.severity}`,
        `Priority: ${defaults.defectManagement.priority}`,
        `Lifecycle: ${defaults.defectManagement.lifecycle}`,
        `Triage: ${defaults.defectManagement.triage}`,
        `Tracker: ${defaults.defectManagement.tracker}`
      ] },
      { title: "10. Roles and Responsibilities", table: {
        headers: ["Role", "Responsibility"],
        rows: defaults.roles.map((row) => [row.role, row.responsibility])
      } },
      { title: "11. Risks and Mitigation", table: {
        headers: ["Risk", "Impact", "Likelihood", "Mitigation"],
        rows: [...defaults.risks, ...ticketRisks].map((row) => [row.risk, row.impact, row.likelihood, row.mitigation])
      } },
      { title: "12. Reporting and Metrics", paragraphs: [
        `Reports: ${defaults.reports.join(", ")}`,
        `Metrics: ${defaults.metrics.join(", ")}`,
        `Audience: ${defaults.reportAudience}`
      ] },
      { title: "13. Traceability", paragraphs: [defaults.traceability], bullets: requirements.map((requirement, index) => `REQ-${index + 1}: ${requirement}`) },
      { title: "14. Assumptions and Dependencies", subsections: [
        { title: "Assumptions", bullets: listOrConfirm(defaults.assumptions) },
        { title: "Dependencies", bullets: listOrConfirm(defaults.dependencies) },
        { title: "Jira relationships", bullets: [
          `Parent epic: ${ticket.parentEpic}`,
          `Fix versions: ${ticket.fixVersions?.length ? ticket.fixVersions.join(", ") : TO_BE_CONFIRMED}`,
          `Linked issues: ${ticket.linkedIssues.length ? ticket.linkedIssues.map((link) => `${link.key} (${link.relation})`).join(", ") : TO_BE_CONFIRMED}`,
          `Sub-tasks: ${ticket.subTasks.length ? ticket.subTasks.map((task) => `${task.key} ${task.summary} (${task.status})`).join("; ") : TO_BE_CONFIRMED}`
        ] }
      ] },
      { title: "15. Approvals", table: {
        headers: ["Name", "Role", "Date", "Status"],
        rows: defaults.approvalRoles.map((role) => [TO_BE_CONFIRMED, role, TO_BE_CONFIRMED, "Pending"])
      } }
    ]
  };
}
