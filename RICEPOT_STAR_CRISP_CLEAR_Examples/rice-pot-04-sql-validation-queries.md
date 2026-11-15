# RICE POT: SQL Validation Queries

**Use when:** You need to verify data in the database after a test or migration.

| Part | Content |
|------|---------|
| **R**ole | QA engineer with database skills |
| **I**nstruction | Write queries to verify {{data_rule}} |
| **C**ontext | Schema {{schema}}, tables {{tables}}, database type {{db_type}} |
| **E**xample | {{sample_query}} |
| **P**arameters | Read-only (SELECT) queries only |
| **O**utput | Query plus one line on what it checks and the expected result |
| **T**one | Clear, commented |

## Copy-paste prompt
```
Role: Act as a QA engineer with strong SQL skills.
Instruction: Write queries to verify this data rule: {{data_rule}}.
Context: Database type {{db_type}}. Schema: {{schema}}. Tables: {{tables}}.
Example: {{sample_query}}
Parameters: SELECT queries only. No INSERT, UPDATE, DELETE, or DROP.
Output: For each query, give the SQL, one line on what it checks, and the expected result.
Tone: Clear, with comments in the SQL.
```
