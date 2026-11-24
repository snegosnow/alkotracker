import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, uniqueIndex, foreignKey, check } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
}, table => [index("session_user_idx").on(table.userId)]);
export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("account_user_idx").on(table.userId)]);
export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(), identifier: text("identifier").notNull(), value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
export const rateLimit = sqliteTable("rate_limit", {
  id: text("id").primaryKey(), key: text("key").notNull().unique(),
  count: integer("count").notNull(), lastRequest: integer("last_request").notNull(),
});
export const profiles = sqliteTable("profiles", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  currency: text("currency").notNull().default("UZS"),
  timeZone: text("time_zone").notNull().default("Asia/Tashkent"),
  currencyLockedAt: integer("currency_locked_at"),
  categoriesInitializedAt: integer("categories_initialized_at").notNull(),
});
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  name: text("name").notNull(), normalizedName: text("normalized_name").notNull(),
  color: text("color").notNull(), icon: text("icon").notNull(), archivedAt: integer("archived_at"),
}, table => [
  uniqueIndex("category_name_unique").on(table.userId, table.type, table.normalizedName),
  uniqueIndex("category_owner_type_unique").on(table.id, table.userId, table.type),
  check("category_type", sql`${table.type} IN ('income','expense')`),
]);
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull(), type: text("type", { enum: ["income", "expense"] }).notNull(),
  amountMinor: integer("amount_minor").notNull(), occurredOn: text("occurred_on").notNull(), note: text("note").notNull().default(""),
  createdAt: integer("created_at").notNull(), updatedAt: integer("updated_at").notNull(),
}, table => [
  foreignKey({ columns: [table.categoryId, table.userId, table.type], foreignColumns: [categories.id, categories.userId, categories.type] }),
  index("transactions_date_idx").on(table.userId, table.occurredOn),
  index("transactions_category_date_idx").on(table.userId, table.categoryId, table.occurredOn),
  check("positive_amount", sql`${table.amountMinor} > 0 AND ${table.amountMinor} <= 1000000000000`),
]);
