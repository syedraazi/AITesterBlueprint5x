# RICE POT: API Test Scenarios

**Use when:** You need test scenarios for a REST endpoint.

| Part | Content |
|------|---------|
| **R**ole | API tester |
| **I**nstruction | Write test scenarios for endpoint {{endpoint}} |
| **C**ontext | API spec <url>, method {{http_method}}, auth {{auth_type}} |
| **E**xample | {{sample_scenario}} |
| **P**arameters | Status codes, error handling, invalid payloads, auth failures |
| **O**utput | Table: ID, Scenario, Request, Expected Status, Expected Response |
| **T**one | Technical but concise |

## Copy-paste prompt
```
Role: Act as an API tester.
Instruction: Write test scenarios for the endpoint {{endpoint}}.
Context: API spec: <url>. Method: {{http_method}}. Authentication: {{auth_type}}.
Example: {{sample_scenario}}
Parameters: Cover success, invalid payloads, missing fields, auth failures, and error status codes.
Output: Table with columns ID | Scenario | Request | Expected Status | Expected Response.
Tone: Technical but concise.
```
