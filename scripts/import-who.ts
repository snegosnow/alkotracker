import nextEnv from "@next/env";
import { readFile } from "node:fs/promises";
nextEnv.loadEnvConfig(process.cwd());
const { client } = await import("../src/db");
const input = JSON.parse(await readFile("data/who-uzbekistan.json", "utf8"));
const seen = new Set<string>();
const statements = input.map((item: { category: string; source: string; raw: Record<string,string> }) => {
  const year = Number(item.raw.DIM_TIME);
  const value = Number(item.raw[item.category === "alcohol" ? "RATE_PER_CAPITA_N" : "PERCENT_POP_N"]);
  const key = item.category + year;
  if (!["alcohol", "tobacco"].includes(item.category) || !Number.isInteger(year) || !Number.isFinite(value) || value < 0 || seen.has(key) || item.raw.DIM_GEO_CODE_M49 !== "860" || item.raw.DIM_SEX !== "TOTAL") throw new Error("Некорректная выгрузка");
  seen.add(key);
  return {
    sql: "INSERT INTO habit_observations(category,year,value,source,imported) VALUES(?,?,?,?,?) ON CONFLICT(category,year) DO UPDATE SET value=excluded.value,source=excluded.source,imported=excluded.imported",
    args: [item.category, year, value, item.source, new Date().toISOString()],
  };
});
await client.batch(statements, "write");
console.log("Импортировано наблюдений:", statements.length);
client.close();
