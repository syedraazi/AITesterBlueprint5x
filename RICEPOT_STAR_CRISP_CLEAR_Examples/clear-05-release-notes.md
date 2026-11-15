# CLEAR: Release Notes

**Use when:** You need release notes for a build or version.

| Part | Content |
|------|---------|
| **C**ontext | Product {{product_name}}, build {{build_number}}, date {{date}}, changes {{change_list}} (source: <url>), audience {{audience}} |
| **L**imit | Short bullets, no internal jargon or ticket codenames, nothing not in the list |
| **E**xample | {{sample_release_notes}} |
| **A**ction | Write notes grouped under New, Fixed, Known Issues, with build and date at the top |
| **R**eview | Check for leftover jargon and missing items |

## Copy-paste prompt
```
Context: Product {{product_name}}, build {{build_number}}, dated {{date}}. Changes: {{change_list}} (source: <url>). Audience: {{audience}}.
Limit: Short bullets. No internal jargon, ticket codenames, or developer-only terms. Use only the changes listed.
Example: Follow this style: {{sample_release_notes}}
Action: Write release notes grouped under New, Fixed, and Known Issues, with the build number and date at the top.
Review: Before finishing, check that no jargon remains and that every item in my change list is covered.
```
