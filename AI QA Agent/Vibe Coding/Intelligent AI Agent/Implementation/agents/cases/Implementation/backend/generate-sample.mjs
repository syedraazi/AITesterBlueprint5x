import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeSampleWorkbook } from "./excel.mjs";

const implementationDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ticket = {
  key: "DEMO-123",
  summary: "Sample sign-in form validation",
  requirements: [
    { ref: "AC-1", text: "A registered user can submit valid sign-in credentials." },
    { ref: "AC-2", text: "The form shows a validation message when the email is missing." }
  ]
};
const cases = [
  {
    "Test Case ID": "TC-001",
    "Test Case detail": "Verify sign-in with valid registered credentials [AC-1] [Proposed P1]",
    "Positive or Negative Test case": "Positive",
    "Test case steps": "Preconditions: A registered synthetic test account is available.\nProposed priority: P1\n1. Open the sign-in page.\n2. Enter the account's valid email and password.\n3. Submit the form.",
    "Actual Result": "",
    "Expected Result": "The user is signed in and the application displays the authenticated destination specified by the requirement.",
    "Pass/Fail Column": "",
    "Comments Column": ""
  },
  {
    "Test Case ID": "TC-002",
    "Test Case detail": "Reject sign-in when the email is missing [AC-2] [Proposed P2]",
    "Positive or Negative Test case": "Negative",
    "Test case steps": "Preconditions: The sign-in page is available.\nProposed priority: P2\n1. Leave the email field empty.\n2. Enter a password.\n3. Submit the form.",
    "Actual Result": "",
    "Expected Result": "The form displays the specified missing-email validation and does not sign in the user.",
    "Pass/Fail Column": "",
    "Comments Column": ""
  }
];

const output = path.join(implementationDir, "sample-test-cases.xlsx");
await writeSampleWorkbook(output, ticket, cases);
console.log(`Created ${output}`);
