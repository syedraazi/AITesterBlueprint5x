# RICE POT: Test Cases

**Use when:** You need structured test cases for a feature or user story.

| Part | Content |
|------|---------|
| **R**ole | Senior QA analyst experienced in {{testing_type}} |
| **I**nstruction | Write test cases for {{feature_name}} |
| **C**ontext | Requirements <url>, business rules {{key_rules}}, environment {{environment}} |
| **E**xample | {{sample_test_case}} |
| **P**arameters | Positive, negative, boundary, edge cases; max {{number}} |
| **O**utput | Table: ID, Title, Preconditions, Steps, Expected Result, Priority |
| **T**one | Clear, concise, no jargon |

## Copy-paste prompt
```
Role: Act as a senior QA analyst experienced in {{testing_type}}.
Instruction: Write test cases for {{feature_name}}.
Context: Requirements: <url>. Business rules: {{key_rules}}. Environment: {{environment}}.
Example: {{sample_test_case}}
Parameters: Cover positive, negative, boundary, and edge cases. Maximum {{number}} test cases.
Output: Table with columns ID | Title | Preconditions | Steps | Expected Result | Priority.
Tone: Clear and concise, no jargon.
```
