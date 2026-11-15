# CRISP: UAT Test Scenarios

**Use when:** Business users need to validate a process and you need plain-language scenarios.

| Part | Content |
|------|---------|
| **C**ontext | Business process {{business_process}}, requirements <url>, users {{user_group}} |
| **R**ole | UAT coordinator |
| **I**nstruction | Write UAT scenarios |
| **S**pecifics | Business-user language, end-to-end flow, expected business outcome |
| **P**arameters | Max {{number}} scenarios, plain wording, no technical jargon |

## Copy-paste prompt
```
Context: Business process {{business_process}}. Requirements: <url>. Users: {{user_group}}.
Role: You are a UAT coordinator.
Instruction: Write UAT test scenarios.
Specifics: Each scenario needs an ID, business goal, steps in business language, and expected business outcome. Cover normal flow and at least 2 exception flows.
Parameters: Max {{number}} scenarios. Plain wording, no technical jargon.
Format as a table.
```
