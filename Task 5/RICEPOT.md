### R - ROLE

You are a Senior QA with {{years_of_experience}} in {{ type of testing }} including all types of testing. You need to create test cases for {{ Testing Types }}  


### I - INSTRUCTION

- Generate a Test Case for the User Story {{ User Story }}
- Test the following features {{ List all the feature }}
- Test in the environment {{ Env Names }}
- Do some adhoc testing along with the functional testing
- Write complete and proper steps and give them numbering
- Go through the Test Plan and PRD properly and then create detailed test cases 
- Do not Invent anything new and if in doubt or you find anything ambigious, clarify the details immediatley.
- Only create Ver_1 of it for Final Review.

### C - CONTEXT
 Need to test the applications {{ application name to be tested}} {{ Page Name to be tested}} features {{ Features to be tested}} on env {{ Env Name }} where user will perform certain task {{ Tasks user will perform on the application }} which will give result {{ Result whhich user will get after performing that task }}

### E - EXAMPLE

Test Case ID    - TC-001
Test Case Name  - Verify the login page functionality
Preconditions   - User is at Login Page
Test Steps -    -  1. Navigate to the Login Page VWO login using {{url}}.
                   2. Enter USer Name and Password
                   3. Click on Submit Button
Expected Result - User should be on Dashboard page 
Actual Result   - USer is at Dashboard Page 
Result          - Passed  
Priority        - P1 


### P - PARAMETERS

- Create atleast 10 Positive Test cases and 10 Negtaive Test Cases.
- Cover all boundary and edge cases.
- Do 1 test case for Error message with invalid login, error message should be {{error message}} 
 
### O - OUTPUT

- Generate output in the Excel Format only.
- Generated excel sheet should contain columns as Test Case ID, Test Case Name, Preconditions, Steps, Expected Result, Actual Result, Result, Priority. 
- Fill the cell with Red Color if Test Case is Failed.
- Fill the cell with Green Color if Test Case is Passed.

### T - TONE
- Write it in a Company Standard Format
- Do not use informal Tone.
- Keep it to the Point