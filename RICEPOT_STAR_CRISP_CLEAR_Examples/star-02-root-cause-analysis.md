# STAR: Root Cause Analysis (RCA)

**Use when:** A defect escaped to production or a late stage and you need to explain why.

| Part | Content |
|------|---------|
| **S**ituation | Defect {{defect_id}} found in {{environment}} after release {{release}}. Details: {{defect_details}}. Evidence: <url> |
| **T**ask | Write a root cause analysis for {{audience}} |
| **A**ction | Explain what happened, why testing did not catch it, which checks were missing |
| **R**esult | State the root cause, the fix, and 3 preventive actions |

## Copy-paste prompt
```
Situation: Defect {{defect_id}} was found in {{environment}} after release {{release}}. Details: {{defect_details}}. Evidence: <url>.
Task: Write a root cause analysis for {{audience}}.
Action: Explain what happened, why it was not caught in testing, and which test cases or checks were missing.
Result: End with the root cause, the fix, and 3 preventive actions. Under {{word_limit}} words.
Do not assign blame to individuals. If facts are missing, list them under "Need input".
```
