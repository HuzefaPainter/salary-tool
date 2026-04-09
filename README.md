Steps to run:
backend/  : bundle install, env vars, db:create, db:migrate, db:seed, rails server or bin/dev
frontend/ : npm install, npm run dev

Steps to run tests:
cd backend && bundle exec rspec --format documentation
cd frontend && npm test

---

General Technical Points to note:

While learning TDD and understanding testing deeply, I realised there is this concept called "mock drift", where if multiple teams work over the same features but on backend and frontend separately, the mocks will pass but the real product will break/have bugs. So to avoid this we have to implement something called "contract testing". Tools like Pact, or integration testing help with this.

PostgreSQL's pg_trgm extension was the main reason for picking it over SQLite. It enables fast case-insensitive partial string matching using GIN trigram indexes. Without this, ILIKE '%john%' queries with leading wildcards cannot use B-tree indexes and result in full table scans. MySQL and SQLite have no equivalent. (No easy equivalent, there's probably ways to do it).

Reason for exposing "Authorization" header in CORS:
Since React and Rails run on separate origins, the Authorization response header must be explicitly exposed in the CORS configuration. Without expose: ['Authorization'], the browser hides the JWT token from JavaScript even though Rails sends it, causing authentication to silently fail. This was the first time I've used React with Rails, and so it took inspecting the actual network response headers to spot that Rails was sending it correctly but JavaScript couldn't see it, which led to me investigating this issue.

---

Backend:

Devise's RegistrationsController and SessionsController inherit from different base controllers and handle fundamentally different concerns, creating new users vs authenticating existing ones. Keeping them separate also allows us to override response formats independently for API mode.

Future improvement for Employee: Could make a case for Job and Country being their own models. In case we want to later store additional details about the job other than title, and if we want to store locations inside country then could make a City model with country foreign key and ensure easier queries for additional drill-downs based on city and country.

Choosing Decimal instead of float/double for salary since it's potentially a financial record used for real transactions. Float and double have rounding errors and hence are unusable compared to decimal

Using shared_examples throughout the tests wherever ideal to shorten test sizes and make it more readable. Example: Ordered by salary asc/desc table tests and employee validation errors while creating and updating.

---

Frontend:

Refactoring and testing reused components made testing easier. I also refactored quite a few of the most used actions in tests to make it more readable and in turn more straightforward to understand. Extracted AuthLayout, FormField, EmployeeForm, BackButton, and Navbar as reusable components. This reduced duplication across pages and meant that testing the shared component once gave coverage across all pages that use it.

Created a custom waitForElement helper wrapping RTL's waitFor with a 200ms timeout instead of the default 1000ms. Since all API calls in tests are mocked and resolve near-instantly, the default timeout was wasting ~800ms per assertion, causing the full test suite to run in 18+ seconds vs under 6 seconds after the change.

While doing TDD I realised how it can be helpful in narrowing down bugs. For example when I first added the N/A test for missing fields in __test__/EmployeeDetailPage.test.jsx I had set the toBeGreaterThan to 1. And then made the implementation to pass the tests. Then I later realized I had more than 4 nulls set in that test mock employee data. So I set the toBeGreaterThan(4). Then the test failed for some reason. I then realized that since I was rendering salary as a formatted string I hadn't fixed that to be N/A if salary was null. This wouldve lead to a bug or atleast NaN to show up.
