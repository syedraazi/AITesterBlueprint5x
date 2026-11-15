# CRISP: Test Data Set

**Use when:** A feature needs valid, invalid, and boundary test data.

| Part | Content |
|------|---------|
| **C**ontext | Feature {{feature_name}}, fields {{field_list}}, rules {{validation_rules}} |
| **R**ole | Test data analyst |
| **I**nstruction | Generate a test data set |
| **S**pecifics | Valid, invalid, boundary, and empty values for each field |
| **P**arameters | Table format, {{row_count}} rows, no real customer data |

## Copy-paste prompt
```
Context: Feature {{feature_name}} has these fields: {{field_list}}. Validation rules: {{validation_rules}}.
Role: You are a test data analyst.
Instruction: Generate a test data set.
Specifics: For each field include valid, invalid, boundary, and empty values, and say which rule each row tests.
Parameters: Table format, about {{row_count}} rows. Use fake data only. No real names, emails, card numbers, or IDs.
```
