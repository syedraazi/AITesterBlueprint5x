# CLEAR: Meeting Minutes

**Use when:** You have rough meeting notes and need clean minutes.

| Part | Content |
|------|---------|
| **C**ontext | Meeting {{meeting_name}}, date {{date}}, attendees {{attendees}}, notes {{raw_notes}} |
| **L**imit | Bullets only, under {{word_limit}} words, nothing that was not in the notes |
| **E**xample | {{sample_minutes}} |
| **A**ction | Write minutes in the order Decisions, Action Items, Open Questions |
| **R**eview | List action items missing an owner or due date |

## Copy-paste prompt
```
Context: Meeting {{meeting_name}} on {{date}}. Attendees: {{attendees}}. Notes: {{raw_notes}}.
Limit: Bullets only, under {{word_limit}} words. Use only what is in the notes. Do not invent owners or dates.
Example: Follow this format: {{sample_minutes}}
Action: Write the minutes in the order Decisions, Action Items (owner and due date for each), Open Questions.
Review: At the end, list any action items that are missing an owner or due date.
```
