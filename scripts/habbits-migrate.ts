import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
const { client } = await import("../src/db");
await client.batch([
  "CREATE TABLE IF NOT EXISTS habit_purchases (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, category TEXT NOT NULL CHECK(category IN ('alcohol','tobacco')), name TEXT NOT NULL, quantity INTEGER NOT NULL CHECK(quantity>0), unit TEXT NOT NULL, date TEXT NOT NULL, note TEXT NOT NULL DEFAULT '')",
  "CREATE INDEX IF NOT EXISTS habit_purchases_owner_date ON habit_purchases(user_id,date)",
  "CREATE TABLE IF NOT EXISTS habit_observations (category TEXT NOT NULL, year INTEGER NOT NULL, value REAL NOT NULL CHECK(value>=0), source TEXT NOT NULL, imported TEXT NOT NULL, PRIMARY KEY(category,year))",
], "write");
console.log("Схема habbits готова");
client.close();
