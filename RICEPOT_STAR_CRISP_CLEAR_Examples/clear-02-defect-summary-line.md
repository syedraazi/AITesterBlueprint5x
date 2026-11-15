# CLEAR: Defect Summary Line

**Use when:** You need a one-line defect title that others can understand without opening the ticket.

| Part | Content |
|------|---------|
| **C**ontext | Issue {{issue_description}}, product area {{product_area}}, tracker {{bug_tracker}} |
| **L**imit | One line, under 15 words, no blame, no guessing the cause |
| **E**xample | {{sample_defect_title}} |
| **A**ction | Write 3 title options starting with the product area |
| **R**eview | Pick the best one and confirm it makes sense on its own |

## Copy-paste prompt
```
Context: Issue: {{issue_description}}. Product area: {{product_area}}. Tracker: {{bug_tracker}}.
Limit: One line, under 15 words. No blame and no guessing the root cause.
Example: A good title looks like this: {{sample_defect_title}}
Action: Write 3 title options. Start each with the product area, then say what fails and under what condition.
Review: Pick the best option and explain in one line why it is understandable without opening the ticket.
```
