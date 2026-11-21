import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";
import { getTemplateMapping, validateTestCaseHeaders } from "../src/core.mjs";
import { TEST_CASE_HEADERS, EditableTestCasesSchema } from "../src/schemas.mjs";

const implementationDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const TEMPLATE_PATH = path.resolve(implementationDir, "../Plan/vwo-login-dashboard-test-cases.xlsx");
export const TEMPLATE_SHEET_NAMES = ["Read Me", "Test Cases"];

export async function inspectTemplate() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(TEMPLATE_PATH);
  const worksheet = workbook.getWorksheet("Test Cases");
  if (!worksheet) throw new Error("The template is missing its Test Cases worksheet.");
  const mapping = getTemplateMapping(worksheet);
  if (!validateTestCaseHeaders(mapping.headers)) {
    throw new Error("The template Test Cases columns do not match the required column mapping.");
  }
  if (workbook.worksheets.map((sheet) => sheet.name).join("|") !== TEMPLATE_SHEET_NAMES.join("|")) {
    throw new Error("The template worksheet names have changed; update the template mapping before export.");
  }
  return { workbook, worksheet, mapping };
}

function updateReadMe(workbook, ticket, cases, warnings) {
  const sheet = workbook.getWorksheet("Read Me");
  if (!sheet) throw new Error("The template is missing its Read Me worksheet.");
  const requirements = ticket.requirements || [];
  const coverage = requirements.length
    ? requirements.map((requirement) => `${requirement.ref}: ${requirement.text}`).join(" | ").slice(0, 4000)
    : "Insufficient information to determine.";

  sheet.getCell("A1").value = `${ticket.key} | TEST CASE WORKBOOK`;
  sheet.getCell("A3").value = "Source Jira issue";
  sheet.getCell("B3").value = `${ticket.key}: ${ticket.summary}`;
  sheet.getCell("A4").value = "Test case count";
  sheet.getCell("B4").value = cases.length;
  sheet.getCell("A5").value = "Requirement coverage";
  sheet.getCell("B5").value = coverage;
  sheet.getCell("B8").value = "Use approved non-production environments and synthetic test identities. Never include real passwords, reset links, session tokens, or personal data in test evidence.";
  sheet.getCell("B9").value = "Actual Result, Pass/Fail Column, and Comments Column are blank for execution. Select Pass, Fail, Blocked, or Not Run from the status dropdown.";
  sheet.getCell("B10").value = "Confirm environment, roles, test data, and integrations from the project owner before execution.";
  sheet.getCell("B11").value = "Security or load testing requires explicit authorization, approved limits, and a designated non-production environment.";
  sheet.getCell("B12").value = "Priorities are proposed for QA review; they are not Jira requirements.";
  sheet.getCell("B13").value = warnings.length ? warnings.join(" ") : "No input truncation was required.";
}

export async function createWorkbookBuffer(ticket, caseRows, warnings = []) {
  const parsedRows = EditableTestCasesSchema.parse(caseRows);
  const { workbook, worksheet } = await inspectTemplate();
  const sampleRow = worksheet.getRow(2);
  const styles = TEST_CASE_HEADERS.map((_, index) => structuredClone(sampleRow.getCell(index + 1).style));

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    row.eachCell({ includeEmpty: true }, (cell) => { cell.value = null; });
    row.hidden = rowNumber > parsedRows.length + 1;
  }
  worksheet.dataValidations.model = {};

  parsedRows.forEach((values, index) => {
    const row = worksheet.getRow(index + 2);
    row.hidden = false;
    TEST_CASE_HEADERS.forEach((header, columnIndex) => {
      row.getCell(columnIndex + 1).value = values[header];
    });
    row.height = 72;
    row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
      cell.style = structuredClone(styles[columnNumber - 1]);
      cell.alignment = { ...cell.alignment, vertical: "top", wrapText: true };
    });
  });

  if (parsedRows.length) {
    const statusValidation = {
      type: "list",
      allowBlank: true,
      showInputMessage: true,
      showErrorMessage: true,
      errorTitle: "Select an execution status",
      error: "Select Pass, Fail, Blocked, or Not Run.",
      formulae: ['"Pass,Fail,Blocked,Not Run"']
    };
    for (let rowNumber = 2; rowNumber <= parsedRows.length + 1; rowNumber += 1) {
      worksheet.dataValidations.add(`G${rowNumber}`, statusValidation);
    }
  }
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: parsedRows.length + 1, column: TEST_CASE_HEADERS.length }
  };
  worksheet.views = [{ state: "frozen", ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft" }];
  updateReadMe(workbook, ticket, parsedRows, warnings);
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export async function writeSampleWorkbook(outputPath, ticket, cases) {
  const buffer = await createWorkbookBuffer(ticket, cases, ["SAMPLE DATA ONLY."]);
  await fs.writeFile(outputPath, buffer);
}
