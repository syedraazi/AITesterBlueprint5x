import test from "node:test";
import assert from "node:assert/strict";
import { adfToText, buildModelChunks, hasGroqCompletionChoice, toEditableRows } from "../src/core.mjs";
import { EditableTestCaseSchema, TEST_CASE_HEADERS } from "../src/schemas.mjs";
import { createWorkbookBuffer, inspectTemplate } from "../backend/excel.mjs";

test("converts nested Atlassian document content into readable plain text", () => {
  const adf = {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "First" }, { type: "hardBreak" }, { type: "text", text: "line" }] },
      { type: "paragraph", content: [{ type: "text", text: "Second" }] }
    ]
  };
  assert.equal(adfToText(adf), "First\nline\nSecond");
});

test("matches the sample workbook sheets, columns, widths, freeze, and status dropdown", async () => {
  const { workbook, worksheet, mapping } = await inspectTemplate();
  assert.deepEqual(workbook.worksheets.map((sheet) => sheet.name), ["Read Me", "Test Cases"]);
  assert.equal(mapping.name, "Test Cases");
  assert.deepEqual(mapping.headers, TEST_CASE_HEADERS);
  assert.deepEqual(mapping.widths, [
    14.77734375, 43.77734375, 24.77734375, 66.77734375,
    34.77734375, 58.77734375, 18.77734375, 30.77734375
  ]);
  assert.equal(worksheet.views[0].ySplit, 1);
  assert.deepEqual(worksheet.getCell("G2").dataValidation.formulae, ['"Pass,Fail,Blocked,Not Run"']);
});

test("exports only generated rows while preserving template sheets, filters, and dropdowns", async () => {
  const cases = [{
    "Test Case ID": "TC-001",
    "Test Case detail": "Verify sign-in [AC-1] [Proposed P1]",
    "Positive or Negative Test case": "Positive",
    "Test case steps": "Preconditions: Account is available.\n1. Submit valid credentials.",
    "Actual Result": "",
    "Expected Result": "The user is signed in.",
    "Pass/Fail Column": "",
    "Comments Column": ""
  }];
  const buffer = await createWorkbookBuffer({ key: "DEMO-1", summary: "Fictional test", requirements: [] }, cases, []);
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.getWorksheet("Test Cases");
  assert.deepEqual(workbook.worksheets.map((sheet) => sheet.name), ["Read Me", "Test Cases"]);
  assert.equal(worksheet.rowCount, 73);
  assert.deepEqual(worksheet.getRow(1).values.slice(1), TEST_CASE_HEADERS);
  assert.equal(worksheet.getCell("A2").value, "TC-001");
  assert.equal(worksheet.getCell("A3").value, null);
  assert.equal(worksheet.getRow(3).hidden, true);
  assert.deepEqual(worksheet.getCell("G2").dataValidation.formulae, ['"Pass,Fail,Blocked,Not Run"']);
  assert.ok(worksheet.autoFilter);
});

test("chunks requirements and assigns unique template IDs without adding columns", () => {
  const result = buildModelChunks({
    requirements: [
      { ref: "AC-1", text: "A user can sign in." },
      { ref: "AC-2", text: "An invalid email is rejected." }
    ]
  }, 100, 4);
  assert.equal(result.chunks.length, 1);
  const rows = toEditableRows([
    {
      title: "Verify valid sign-in",
      requirementRef: "AC-1",
      type: "Positive",
      priority: "P1",
      preconditions: "A synthetic account is available.",
      steps: ["Open the sign-in page.", "Enter valid credentials.", "Submit the form."],
      expectedResult: "The sign-in succeeds."
    },
    {
      title: "Reject invalid email",
      requirementRef: "AC-2",
      type: "Negative",
      priority: "P2",
      preconditions: "The sign-in page is open.",
      steps: ["Enter an invalid email.", "Submit the form."],
      expectedResult: "The form reports the specified validation error."
    }
  ]);
  assert.deepEqual(Object.keys(rows[0]), TEST_CASE_HEADERS);
  assert.equal(rows[0]["Test Case ID"], "TC-001");
  assert.equal(rows[1]["Test Case ID"], "TC-002");
  assert.match(rows[0]["Test case steps"], /Preconditions:/);
});

test("validates editable test case fields and rejects an unknown case type", () => {
  const valid = {
    "Test Case ID": "TC-001",
    "Test Case detail": "Verify sign-in [AC-1] [Proposed P1]",
    "Positive or Negative Test case": "Positive",
    "Test case steps": "Preconditions: Account is available.\n1. Submit valid credentials.",
    "Actual Result": "",
    "Expected Result": "The user is signed in.",
    "Pass/Fail Column": "",
    "Comments Column": ""
  };
  assert.equal(EditableTestCaseSchema.safeParse(valid).success, true);
  assert.equal(EditableTestCaseSchema.safeParse({ ...valid, "Positive or Negative Test case": "Boundary" }).success, false);
});

test("recognizes a valid Groq completion even when a reasoning model returns empty text", () => {
  assert.equal(hasGroqCompletionChoice({ choices: [{ message: { content: "" }, finish_reason: "length" }] }), true);
  assert.equal(hasGroqCompletionChoice({ choices: [] }), false);
  assert.equal(hasGroqCompletionChoice({ error: "unauthorized" }), false);
});
