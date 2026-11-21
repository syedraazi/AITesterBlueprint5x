import { z } from "zod";

export const ModelTestCaseSchema = z.object({
  title: z.string().trim().min(5).max(180),
  requirementRef: z.string().trim().min(1).max(40),
  type: z.enum(["Positive", "Negative"]),
  priority: z.enum(["P1", "P2", "P3", "To be confirmed"]),
  preconditions: z.string().trim().min(1).max(1200),
  steps: z.array(z.string().trim().min(1).max(500)).min(1).max(12),
  expectedResult: z.string().trim().min(5).max(1400)
}).strict();

export const ModelTestCasesSchema = z.object({
  testCases: z.array(ModelTestCaseSchema).min(1).max(30)
}).strict();

export const EditableTestCaseSchema = z.object({
  "Test Case ID": z.string().regex(/^TC-\d{3,}$/),
  "Test Case detail": z.string().trim().min(1).max(500),
  "Positive or Negative Test case": z.enum(["Positive", "Negative"]),
  "Test case steps": z.string().trim().min(1).max(8000),
  "Actual Result": z.string().max(4000),
  "Expected Result": z.string().trim().min(1).max(3000),
  "Pass/Fail Column": z.enum(["", "Pass", "Fail", "Blocked", "Not Run"]),
  "Comments Column": z.string().max(4000)
}).strict();

export const EditableTestCasesSchema = z.array(EditableTestCaseSchema).min(1).max(72);

export const TEST_CASE_HEADERS = [
  "Test Case ID",
  "Test Case detail",
  "Positive or Negative Test case",
  "Test case steps",
  "Actual Result",
  "Expected Result",
  "Pass/Fail Column",
  "Comments Column"
];
