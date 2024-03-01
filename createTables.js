import sqlite3 from "sqlite3";
const dbName = "./db.sqlite";
const db = new sqlite3.Database(dbName, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the database.");

  //create new tables if they don't exist
  createTables(db);

  //insert dummy records into auth_invitation
  // insertDummyRecords(db);
  
  runQueries(db);
});

function createTables(db) {
  console.log('creating tables...');
  db.exec(
    `create table if not exists auth_invitations  (
        auth_id INTEGER PRIMARY KEY autoincrement not null,
        code text not null,
        codeVerifier text not null,
        state text not null,
        sent_date text not null
      );
      
      create table if not exists user_access (
        id INTEGER PRIMARY KEY autoincrement not null,
        refresh_token text not null,
        access_token text not null,
        access_token_expiration text not null,
        scope text not null,
        user_id text not null,
        email text null,
        auth_id int not null,
        FOREIGN KEY (auth_id)
          REFERENCES auth_invitation (auth_id)
      );`
  );
}

function insertDummyRecords(db) {
  console.log("inserting dummy records...");
  db.exec(
    `insert into auth_invitations (code, codeVerifier, state, sent_date)
        values ('123_code_test', '123_code_test', '123_state_test', '02-20-24');`
  );
}

function runQueries(db) {
  db.all(
    `select * from auth_invitations ai`,
    (err, rows) => {
      rows.forEach((row) => {
        console.log(
          row.auth_id +
            "\t" +
            row.code +
            "\t" +
            row.codeVerifier +
            "\t" +
            row.state +
            "\t" +
            row.sent_date
        );
      });
    }
  );
}