import { z } from "zod";

export const purchaseInput = z.object({
  id: z.string().uuid(),
  category: z.enum(["alcohol", "tobacco"]),
  name: z.string().trim().min(1).max(120),
  quantity: z.number().positive().max(100000).refine(value => Math.abs(value * 1000 - Math.round(value * 1000)) < 0.00001),
  unit: z.enum(["шт", "упак", "л", "мл"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
    const date = new Date(value);
    return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }),
  note: z.string().trim().max(500),
}).refine(value => value.category !== "tobacco" || ["шт", "упак"].includes(value.unit), "Для табака выберите штуки или упаковки")
  .refine(value => value.unit === "л" || Number.isInteger(value.quantity), "Для этой единицы нужно целое количество");

export type Purchase = z.infer<typeof purchaseInput>;
export type Observation = { category: string; year: number; value: number; source: string; imported: string };
