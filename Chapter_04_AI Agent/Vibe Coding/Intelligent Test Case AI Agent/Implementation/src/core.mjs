import { EditableTestCaseSchema, ModelTestCaseSchema, TEST_CASE_HEADERS } from "./schemas.mjs";

export const MAX_PRD_CHARS = 40000;
export const MODEL_CHUNK_CHARS = 10000;

function appendAdf(node, output) {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((child) => appendAdf(child, output));
    return;
  }
  if (node.type === "text") output.push(node.text || "");
  else if (node.type === "hardBreak") output.push("\n");
  else if (node.content) {
    appendAdf(node.content, output);
    if (["paragraph", "heading", "listItem"].includes(node.type)) output.push("\n");
  }
}

export function adfToText(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  const output = [];
  appendAdf(value, output);
  return output.join("").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function splitItems(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((item) => item.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}

function acceptanceCriteria(fields, names, configuredField) {
  if (configuredField && fields[configuredField]) {
    const text = adfToText(fields[configuredField]);
    if (text) return text;
  }
  for (const [id, value] of Object.entries(fields)) {
    if (/acceptance.?criteria/i.test(names[id] || id)) {
      const text = adfToText(value);
      if (text) return text;
    }
  }
  const description = adfToText(fields.description);
  const match = description.match(/(?:^|\n)\s*acceptance criteria\s*:?\s*\n([\s\S]*?)(?=\n\s*[A-Z][^\n]{1,60}:\s*\n|$)/i);
  return match?.[1]?.trim() || "";
}

const nameOf = (item) => item?.displayName || item?.name || "To be confirmed";

export function normalizeJiraIssue(issue, names = {}, configuredAcceptanceField = "") {
  const fields = issue.fields || {};
  const description = adfToText(fields.description);
  const criteria = acceptanceCriteria(fields, names, configuredAcceptanceField);
  const linkedIssues = (fields.issuelinks || []).map((link) => {
    const linked = link.inwardIssue || link.outwardIssue;
    if (!linked) return null;
    return {
      key: linked.key,
      relation: link.type?.name || "To be confirmed",
      summary: linked.fields?.summary || "To be confirmed",
      status: linked.fields?.status?.name || "To be confirmed"
    };
  }).filter(Boolean);
  const epicField = Object.keys(fields).find((id) => /epic link/i.test(names[id] || id));
  const epicLink = epicField ? fields[epicField] : "";
  const attachments = (fields.attachment || []).map((item) => ({
    id: String(item.id || ""),
    filename: String(item.filename || ""),
    mimeType: String(item.mimeType || ""),
    size: Number(item.size || 0),
    content: String(item.content || "")
  }));
  const requirements = splitItems(criteria).map((text, index) => ({ ref: `AC-${index + 1}`, text }));
  if (!requirements.length) {
    const paragraphs = description.split(/\n{2,}/).map((text) => text.trim()).filter(Boolean);
    paragraphs.forEach((text, index) => requirements.push({ ref: `REQ-${index + 1}`, text }));
  }

  return {
    key: String(issue.key || ""),
    summary: String(fields.summary || ""),
    description,
    acceptanceCriteria: criteria,
    requirements,
    issueType: fields.issuetype?.name || "To be confirmed",
    priority: fields.priority?.name || "To be confirmed",
    labels: Array.isArray(fields.labels) ? fields.labels : [],
    components: (fields.components || []).map((item) => item.name).filter(Boolean),
    linkedIssues,
    subTasks: (fields.subtasks || []).map((item) => ({ key: item.key, summary: item.fields?.summary || "" })),
    parentEpic: fields.parent?.key || epicLink?.key || epicLink || "To be confirmed",
    assignee: nameOf(fields.assignee),
    reporter: nameOf(fields.reporter),
    attachments,
    linkedPrdText: "",
    prdText: description,
    sourceUrl: issue.self || "",
    warnings: description ? [] : ["Jira description is empty; provide requirements before generating cases."]
  };
}

export function buildModelChunks(ticket, maxChars = MODEL_CHUNK_CHARS, maxChunks = 4) {
  const requirements = [
    ...(Array.isArray(ticket.requirements) ? ticket.requirements : []),
    ...splitItems(ticket.linkedPrdText).map((text, index) => ({ ref: `LPRD-${index + 1}`, text })),
    ...(ticket.attachments || []).flatMap((attachment, attachmentIndex) =>
      splitItems(attachment.text).map((text, index) => ({ ref: `ATT-${attachmentIndex + 1}-${index + 1}`, text }))
    )
  ];
  if (!requirements.length) {
    requirements.push(...splitItems(ticket.prdText || ticket.description).map((text, index) => ({ ref: `REQ-${index + 1}`, text })));
  }
  const chunks = [];
  let chunk = [];
  let size = 0;
  let truncated = false;
  for (const requirement of requirements) {
    const text = String(requirement.text || "").slice(0, MAX_PRD_CHARS);
    const item = { ref: requirement.ref || `REQ-${chunks.length + chunk.length + 1}`, text };
    const itemSize = item.ref.length + text.length;
    if (chunk.length && size + itemSize > maxChars) {
      chunks.push(chunk);
      chunk = [];
      size = 0;
      if (chunks.length >= maxChunks) {
        truncated = true;
        break;
      }
    }
    if (text.length > maxChars) {
      item.text = text.slice(0, maxChars);
      truncated = true;
    }
    chunk.push(item);
    size += item.ref.length + item.text.length;
  }
  if (chunk.length && chunks.length < maxChunks) chunks.push(chunk);
  if (requirements.length > chunks.reduce((total, items) => total + items.length, 0)) truncated = true;
  return { chunks, truncated };
}

export function toEditableRows(modelCases) {
  const unique = [];
  const seen = new Set();
  for (const testCase of modelCases) {
    const parsed = ModelTestCaseSchema.parse(testCase);
    const identity = `${parsed.requirementRef}|${parsed.type}|${parsed.title}`.toLowerCase();
    if (seen.has(identity)) continue;
    seen.add(identity);
    unique.push(parsed);
  }
  if (!unique.length || unique.length > 72) throw new Error("Generated test case count must be between 1 and 72.");
  return unique.map((testCase, index) => EditableTestCaseSchema.parse({
    "Test Case ID": `TC-${String(index + 1).padStart(3, "0")}`,
    "Test Case detail": `${testCase.title} [${testCase.requirementRef}] [Proposed ${testCase.priority}]`,
    "Positive or Negative Test case": testCase.type,
    "Test case steps": [
      `Preconditions: ${testCase.preconditions}`,
      `Proposed priority: ${testCase.priority}`,
      ...testCase.steps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`)
    ].join("\n"),
    "Actual Result": "",
    "Expected Result": testCase.expectedResult,
    "Pass/Fail Column": "",
    "Comments Column": ""
  }));
}

export function getTemplateMapping(worksheet) {
  const headers = worksheet.getRow(1).values.slice(1).map((value) => String(value || "").trim());
  return {
    name: worksheet.name,
    headers,
    widths: worksheet.columns.map((column) => column.width || null)
  };
}

export function validateTestCaseHeaders(headers) {
  return headers.length === TEST_CASE_HEADERS.length && headers.every((header, index) => header === TEST_CASE_HEADERS[index]);
}

export function hasGroqCompletionChoice(result) {
  return Array.isArray(result?.choices) && result.choices.some((choice) =>
    choice?.message && typeof choice.message === "object"
  );
}

export function normalizeTicketText(ticket) {
  const parts = [
    ticket.description,
    ticket.acceptanceCriteria ? `Acceptance Criteria:\n${ticket.acceptanceCriteria}` : "",
    ticket.linkedPrdText ? `Linked PRD:\n${ticket.linkedPrdText}` : "",
    ...(ticket.attachments || []).filter((item) => item.text).map((item) => `Attached PRD (${item.filename}):\n${item.text}`)
  ].filter(Boolean);
  let text = parts.join("\n\n").trim();
  const truncated = text.length > MAX_PRD_CHARS;
  if (truncated) text = text.slice(0, MAX_PRD_CHARS);
  return { text, truncated };
}
