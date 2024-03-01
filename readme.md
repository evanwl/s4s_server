1. Make sure to run npm install
2. You need a .env file in the root of the project containing both CLIENT_ID and CLIENT_SECRET variables containing both values from a fitbit developer project.
3. To create brand new fresh tables, delete db.sqlite and run -> node ./createTables.js. Note you will be getting rid of previous authenticated user information.
4. To complile -> npm run build or just npm start which will also build the code.
