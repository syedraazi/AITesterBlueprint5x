# RICE POT: Regression Checklist

**Use when:** A change is going in and you need to know what to re-test.

| Part | Content |
|------|---------|
| **R**ole | QA engineer for {{application_name}} |
| **I**nstruction | Build a regression checklist for this change |
| **C**ontext | Change {{change_summary}}, ticket <url>, impacted modules {{modules}} |
| **E**xample | {{sample_checklist_item}} |
| **P**arameters | Prioritize by risk (High/Med/Low), mark automation candidates |
| **O**utput | Table: Area, Check, Risk, Automate? (Y/N) |
| **T**one | Practical, short |

## Copy-paste prompt
```
Role: Act as a QA engineer for {{application_name}}.
Instruction: Build a regression checklist for this change.
Context: Change: {{change_summary}}. Ticket: <url>. Impacted modules: {{modules}}.
Example: {{sample_checklist_item}}
Parameters: Prioritize by risk (High/Med/Low) and mark which items are automation candidates.
Output: Table with columns Area | Check | Risk | Automate? (Y/N).
Tone: Practical and short.
```
