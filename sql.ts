import sqlite3 from "sqlite3";

const dbName: string = "./db.sqlite";
const db = new sqlite3.Database(dbName, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the database.");
});

//generic query helper function that returns one row
export async function dbGetRowPromise(query: string, params: string[]) {
  return new Promise(function (resolve, reject) {
    db.get(query, params, function (err, row) {
      if (err) {
        return reject(err);
      }
      resolve(row as any);
    });
  });
}

//generic query helper function that all rows
export async function dbGetRowsPromise(query: string, params: string[] = null) {
  return new Promise(function (resolve, reject) {
    db.all(
      `SELECT ai.* FROM auth_invitations ai
       where ai.auth_id not in (
        select ua.auth_id
        from user_access ua
      )`,
      function (err, rows) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      }
    );
  });
}

//generic insert helper function, returns bool on success or failure
export const dbInsert = (query: string, params: Array<string | number>) => {
  db.run(query, params, (err) => {
    if (err)
      return false;
    return true;
  });
}

//return an auth invitation record if the invitation has not already
//been registered
export const getAuthInviteInfo = async (state: string) => {
  // const query = "select * from auth_invitations ai where ai.state = ?";
  const query = `SELECT ai.* FROM auth_invitations ai
       where ai.state = ?
       and ai.auth_id not in (
        select ua.auth_id
        from user_access ua
      )`;
  const params = [state];
  try {
    return await dbGetRowPromise(query, params);
  } catch (e) {
    console.log(e);
    return null as any;
  }
};

//return a bool on whether a given user already has a record in the user_access table
export const hasUserAlreadyRegistered = async (userId: string) => {
  const query = "select * from user_access ua where ua.user_id = ?";
  const params = [userId];
  try {
    const results = await dbGetRowPromise(query, params);
    if (results) return true;
    return false;
  } catch (e) {
    console.log(e);
    return false;
  }
};

//insert a new user access record
export const insertUserAccess = async (
  refresh_token: string,
  access_token: string,
  access_token_expiration: string,
  scope: string,
  user_id: string,
  auth_id: number
) => {
  const query = `insert into user_access (refresh_token, access_token, access_token_expiration, scope, user_id, auth_id)
                 values (?, ?, ?, ?, ?, ?)`;
  const params = [
    refresh_token,
    access_token,
    access_token_expiration,
    scope,
    user_id,
    auth_id,
  ];
  try {
    return dbInsert(query, params);
  } catch (e) {
    console.log(e);
    return false;
  }
};
