import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  appName: "habbits",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }) => {
      if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM) return;
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.MAIL_FROM, to: user.email, subject: "habbits — восстановление пароля", text: `Откройте ссылку для смены пароля: ${url}` }),
      });
    },
    revokeSessionsOnPasswordReset: true,
  },
  rateLimit: { enabled: true, storage: "database", window: 60, max: 30, customRules: {
    "/sign-in/email": { window: 60, max: 10 }, "/sign-up/email": { window: 60, max: 5 },
  } },
});
