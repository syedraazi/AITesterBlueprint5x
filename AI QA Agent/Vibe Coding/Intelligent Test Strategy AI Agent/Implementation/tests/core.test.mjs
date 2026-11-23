import test from "node:test";
import assert from "node:assert/strict";
import { adfToText, buildStrategy, mapJiraIssue } from "../src/backend/core.mjs";
import defaults from "../config/defaults.json" with { type: "json" };

test("converts nested Atlassian document content to plain text", () => {
  const value = {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "First" }, { type: "hardBreak" }, { type: "text", text: "line" }] },
      { type: "paragraph", content: [{ type: "text", text: "Second" }] }
    ]
  };
  assert.equal(adfToText(value), "First\nline\nSecond");
});

test("maps Jira fields and configured acceptance criteria", () => {
  const ticket = mapJiraIssue({
    key: "SHOP-123",
    fields: {
      summary: "Update cart",
      description: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Cart requirement." }] }] },
      issuetype: { name: "Story" },
      status: { name: "Open" },
      customfield_90001: [{ type: "text", text: "Checkout stays available." }],
      customfield_90002: "SHOP-EPIC"
    }
  }, { customfield_90001: "Acceptance Criteria", customfield_90002: "Epic Link" });
  assert.equal(ticket.key, "SHOP-123");
  assert.equal(ticket.description, "Cart requirement.");
  assert.equal(ticket.acceptanceCriteria, "Checkout stays available.");
  assert.equal(ticket.issueType, "Story");
  assert.equal(ticket.parentEpic, "SHOP-EPIC");
});

test("warns when a Jira issue has no description", () => {
  const ticket = mapJiraIssue({ key: "SHOP-123", fields: { summary: "Update cart" } });
  assert.match(ticket.warnings[0], /description is empty/);
});

test("builds the 15-section strategy using defaults and confirms missing data", () => {
  const strategy = buildStrategy({
    key: "SHOP-123",
    summary: "Update cart",
    description: "",
    acceptanceCriteria: "",
    reporter: "Reporter",
    assignee: "Assignee",
    labels: [],
    components: [],
    linkedIssues: [],
    subTasks: [],
    parentEpic: "To be confirmed"
  }, defaults, "2026-11-20");
  assert.equal(strategy.sections.length, 15);
  assert.equal(strategy.header.date, "2026-11-20");
  assert.match(strategy.sections[1].paragraphs[0], /To be confirmed/);
  assert.equal(strategy.sections[3].table.rows.length, defaults.testApproach.length);
});
