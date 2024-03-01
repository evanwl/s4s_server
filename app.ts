import express from "express";
const app = express();
import cors from "cors";
import sqlite3 from "sqlite3";
import sqlRoutes from "./routes/sql.js"
import authRoutes from "./routes/auth.js";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database("./db.sqlite", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the database.");
});

db.on("open", () => {
  console.log("Database is ready.");
});

const port = 3001;

app.get("/", (req, res) => {
  res.send("Hello Wonderful Fitbit World!");
});

app.use("/db", sqlRoutes);
app.use("/auth", authRoutes);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
