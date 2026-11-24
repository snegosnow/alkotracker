import { client } from "@/db";
import { Statistics } from "@/components/statistics";
import { Shell } from "@/components/shell";
import type { Observation } from "@/lib/habbits";
export const dynamic = "force-dynamic";
export default async function StatisticsPage() {
  const result = await client.execute("SELECT * FROM habit_observations ORDER BY year");
  return <Shell email=""><Statistics observations={result.rows as unknown as Observation[]}/></Shell>;
}
