Things to note clearly for later:

Server:

Separate sessions and registrations controller because even though they are both associated with auth, keeping them separate separates the login/logout of existing user and registration of new users.

Future improvement for Employee: Could make a case for Job and Country being their own models. In case we want to later store additional details about the job other than title, and if we want to store locations inside country then could make a City model with country foreign key and ensure easier queries for additional drill-downs based on city and country.

Choosing Decimal instead of float/double for salary since it's potentially a financial record used for real transactions
