# STAR: Release Sign-off Summary

**Use when:** You have test results and need a go/no-go conclusion for stakeholders.

| Part | Content |
|------|---------|
| **S**ituation | Release {{release}}, testing ran {{start_date}} to {{end_date}}. Results: {{results_data}} (source: <url>) |
| **T**ask | Write a sign-off summary for {{audience}} |
| **A**ction | Group results by module, list open defects by severity, flag blockers |
| **R**esult | End with a go / no-go recommendation and reasons |

## Copy-paste prompt
```
Situation: Testing for release {{release}} ran {{start_date}} to {{end_date}}. Results: {{results_data}} (source: <url>).
Task: Write a release sign-off summary for {{audience}}.
Action: Group results by module, list open defects by severity, and flag any blockers.
Result: End with a clear go / no-go recommendation and the reasons for it. Keep it under {{word_limit}} words.
If any data is missing, write "TBD". Do not invent numbers.
```
