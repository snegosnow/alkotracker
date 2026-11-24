import { auth } from "@/lib/auth";
import { client } from "@/db";
import { purchaseInput } from "@/lib/habbits";
import { ZodError } from "zod";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Войдите в аккаунт" }, { status: 401 });
  const result = await client.execute({
    sql: "SELECT id, category, name, quantity / 1000.0 AS quantity, unit, date, note FROM habit_purchases WHERE user_id = ? ORDER BY date DESC, id DESC",
    args: [session.user.id],
  });
  return Response.json(result.rows, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const origin = new URL(process.env.BETTER_AUTH_URL || "http://localhost:3000").origin;
  if (request.headers.get("origin") !== origin) return Response.json({ error: "Недопустимый источник" }, { status: 403 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Сессия истекла" }, { status: 401 });
  try {
    const body = await request.json();
    const value = purchaseInput.parse(body.purchase);
    if (body.action === "delete") {
      await client.execute({ sql: "DELETE FROM habit_purchases WHERE id = ? AND user_id = ?", args: [value.id, session.user.id] });
    } else if (body.action === "save") {
      await client.execute({
        sql: "INSERT INTO habit_purchases (id,user_id,category,name,quantity,unit,date,note) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET category=excluded.category,name=excluded.name,quantity=excluded.quantity,unit=excluded.unit,date=excluded.date,note=excluded.note WHERE habit_purchases.user_id=excluded.user_id",
        args: [value.id, session.user.id, value.category, value.name, Math.round(value.quantity * 1000), value.unit, value.date, value.note],
      });
    } else return Response.json({ error: "Неизвестное действие" }, { status: 400 });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) return Response.json({ error: "Проверьте дату, название, количество и единицу товара." }, { status: 400 });
    return Response.json({ error: "Сохранение не удалось. Повторите попытку." }, { status: 500 });
  }
}
