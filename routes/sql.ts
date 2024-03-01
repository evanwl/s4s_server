import sqlite3 from "sqlite3";
import express from "express";
import { dbGetRowsPromise, dbInsert } from "../sql.js";
const router = express.Router();

//get all auth invitations that haven't had a corresponding user_access record
//created yet
router.get("/auth_invitations", async function (req, res) {
  try {
    const query = `SELECT ai.* FROM auth_invitations ai
      where ai.auth_id not in (
      select ua.auth_id
      from user_access ua
    )`;
    dbGetRowsPromise(query).then((results) => {
      res.status(200).json(results);
    })
  } catch (e) {
    res.status(400).json(e);
  }
});

//add an auth invitation after it gets sent/emailed
router.post("/auth_invitations", function (req, res) {
  try {
    const { code, codeVerifier, state, sent_date } = req.body;
    const query = `insert into auth_invitations (code, codeVerifier, state, sent_date)
       values(?, ?, ?, ?)`;
    const params = [code, codeVerifier, state, sent_date];
    dbInsert(query, params);
    res.sendStatus(200);
    return;
  } catch (e) {
    res.status(400).json(e);
  }
});

export default router;