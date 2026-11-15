# CRISP: Defect (Bug) Report

**Use when:** You have rough notes about a bug and need a clean report.

| Part | Content |
|------|---------|
| **C**ontext | Application {{application_name}}, environment {{environment}}, build {{build_version}}, notes {{raw_notes}}, evidence <url> |
| **R**ole | QA engineer |
| **I**nstruction | Write a defect report |
| **S**pecifics | Summary, steps to reproduce, expected vs. actual, severity, priority |
| **P**arameters | {{bug_tracker}} format, severity scale S1-S4, each field 1-2 lines |

## Copy-paste prompt
```
Context: Application {{application_name}}, environment {{environment}}, build {{build_version}}. Notes: {{raw_notes}}. Evidence: <url>.
Role: You are a QA engineer.
Instruction: Write a defect report.
Specifics: Include Summary, Steps to Reproduce (numbered), Expected Result, Actual Result, Severity (S1-S4), Priority.
Parameters: Format for {{bug_tracker}}. Keep each field to 1-2 lines.
At the end, list any missing information a developer would need.
```
