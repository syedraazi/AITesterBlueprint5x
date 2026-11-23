import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildStrategy } from "./core.mjs";
import { createStrategyPdf } from "./pdf.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const defaults = JSON.parse(fs.readFileSync(path.join(root, "config/defaults.json"), "utf8"));
const mockTicket = {
  key: "DEMO-123",
  summary: "Sample account settings update",
  description: "SAMPLE DATA ONLY. Update account settings and show a confirmation after saving.",
  issueType: "Story",
  priority: "To be confirmed",
  status: "To be confirmed",
  labels: [],
  components: [],
  fixVersions: [],
  assignee: "To be confirmed",
  reporter: "To be confirmed",
  acceptanceCriteria: "",
  linkedIssues: [],
  subTasks: [],
  parentEpic: "To be confirmed",
  sourceUrl: ""
};
const strategy = buildStrategy(mockTicket, defaults, "2026-11-20");
const output = path.join(root, "sample-test-strategy.pdf");
fs.writeFileSync(output, await createStrategyPdf(strategy));
console.log(`Created ${output}`);
