# RICE POT: Requirement Review

**Use when:** You want to find gaps in a user story before testing starts.

| Part | Content |
|------|---------|
| **R**ole | QA reviewer with business analysis skills |
| **I**nstruction | Find gaps and ambiguities in the user story |
| **C**ontext | Story <url>, text {{story_text}}, product area {{product_area}} |
| **E**xample | {{sample_gap_question}} |
| **P**arameters | Look for ambiguities, missing acceptance criteria, untestable statements, missing error cases |
| **O**utput | Numbered list of questions for the BA/PO |
| **T**one | Polite, specific |

## Copy-paste prompt
```
Role: Act as a QA reviewer with business analysis skills.
Instruction: Review this user story and find gaps.
Context: Story: {{story_text}} (source: <url>). Product area: {{product_area}}.
Example of a good question: {{sample_gap_question}}
Parameters: Look for ambiguous wording, missing acceptance criteria, untestable statements, and missing error or edge cases.
Output: A numbered list of questions to ask the BA/product owner, grouped by theme.
Tone: Polite and specific.
```
