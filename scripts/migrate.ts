import nextEnv from "@next/env";
import { migrate } from "drizzle-orm/libsql/migrator";
nextEnv.loadEnvConfig(process.cwd());
const { db, client } = await import("../src/db/index");
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("Миграции применены.");
client.close();
