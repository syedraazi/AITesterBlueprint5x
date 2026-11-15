# CRISP: Daily Status Report (DSR)

**Use when:** You need a daily QA status update from rough notes.

| Part | Content |
|------|---------|
| **C**ontext | Project {{project_name}}, date {{date}}, raw notes {{raw_notes}} |
| **R**ole | QA analyst reporting to {{audience}} |
| **I**nstruction | Write a daily status report |
| **S**pecifics | Date, Env, Total, Executed, Passed, Failed, Blocked, Pending, Blocker Detail, Owner |
| **P**arameters | Under 150 words, bullets, neutral tone, RAG status at the top |

## Copy-paste prompt
```
Context: Project {{project_name}}, date {{date}}, environment {{environment}}. Raw notes: {{raw_notes}}.
Role: You are a QA analyst reporting to {{audience}}.
Instruction: Write a daily status report.
Specifics: Include Date, Env, Total Test Cases, Executed, Passed, Failed, Blocked, Pending, Blocker Detail, Owner.
Parameters: Under 150 words, bullet format, neutral tone, RAG status at the top.
If any numbers are missing, list them under "Need input". Do not guess.
```
