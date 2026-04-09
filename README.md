Things to note clearly for later:

---

General:
While learning TDD and understanding testing deeply, I realised there is this concept called "mock drift", where if multiple teams work over the same features but on backend and frontend separately, the mocks will pass but the real product will break/have bugs. So to avoid this we have to implement something called "contract testing". Tools like Pact, or integration testing help with this.

---

Backend:

Separate sessions and registrations controller because even though they are both associated with auth, keeping them separate separates the login/logout of existing user and registration of new users.

Future improvement for Employee: Could make a case for Job and Country being their own models. In case we want to later store additional details about the job other than title, and if we want to store locations inside country then could make a City model with country foreign key and ensure easier queries for additional drill-downs based on city and country.

Choosing Decimal instead of float/double for salary since it's potentially a financial record used for real transactions

Using shared_examples throughout the tests where ideal to shorten test sizes and make it more readable.

---

Frontend:

Refactoring and testing reused components makes testing easier. I also refactored quite a few of the most used actions in tests to make it more readable and in turn more straightforward to understand

Making my own waitFor in tests with a reduced timeout improves test speeds.

While doing TDD I realised how it can be helpful in narrowing down bugs. For example when I first added the N/A test for missing fields in __test__/EmployeeDetailPage.test.jsx I had set the toBeGreaterThan to 1. And then made the implementation to pass the tests. Then I later realized I had more than 4 nulls set in that test mock employee data. So I set the toBeGreaterThan(4). Then the test failed for some reason. I then realized that since I was rendering salary as a formatted string I hadn't fixed that to be N/A if salary was null. This wouldve lead to a bug or atleast NaN to show up.
