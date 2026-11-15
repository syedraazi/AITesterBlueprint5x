# STAR  

### S- Situation :

Requirement {{req_id}} in {{project_name}} changed.
Old Req : {{old_requirement}}
New Req : {{new_requirement}}
Change details: {{Waht was the change in the requirement, what it impacted, env it impacted }} 
Current testing status: {{current_test_status}}. 
Existing test cases: {{test_case_list}}.


### T- Task
Assess the testing impact of this change for {{audience}}.


### A- Action
 - List the test cases that need to be updated, added, or removed. 
 - List affected test data and regression areas. 
 - Point out any already-executed results that are no longer valid.
 - Point Out the Defetcs related to that req which needs to be marked as Invalid

### R- Result
End with 
1. an effort estimate in {{unit}}, 
2. a prioritized re-test plan, and 
3. any risk to the {{release_date}} release date with a recommended decision.

-Use a table for the affected test cases. If information is missing, list it under "Need input". Do not guess.