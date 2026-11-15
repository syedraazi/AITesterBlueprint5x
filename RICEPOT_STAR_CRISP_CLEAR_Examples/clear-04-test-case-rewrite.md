# CLEAR: Test Case Rewrite

**Use when:** Existing test steps are vague and need to be made clear and repeatable.

| Part | Content |
|------|---------|
| **C**ontext | Feature {{feature_name}}, original test case {{original_test_case}}, requirements <url> |
| **L**imit | One action per step, no new scenarios, keep the original intent |
| **E**xample | {{sample_good_test_case}} |
| **A**ction | Rewrite with Preconditions, numbered Steps, Expected Result in {{format}} |
| **R**eview | List remaining ambiguity or missing information |

## Copy-paste prompt
```
Context: Feature {{feature_name}}. Requirements: <url>. Original test case: {{original_test_case}}.
Limit: One action per step. Keep the original intent. Do not add new scenarios.
Example: A good test case looks like this: {{sample_good_test_case}}
Action: Rewrite the test case in {{format}} with Preconditions, numbered Steps, and Expected Result. Use exact values, field names, and button names.
Review: After rewriting, list any remaining ambiguity or information you had to assume.
```
