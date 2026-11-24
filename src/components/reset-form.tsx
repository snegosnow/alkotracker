"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function ResetForm({ reset = false }: { reset?: boolean }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const result = reset
        ? await authClient.resetPassword({ newPassword: String(form.get("password")), token: new URLSearchParams(window.location.search).get("token") || "" })
        : await authClient.requestPasswordReset({ email: String(form.get("email")), redirectTo: `${window.location.origin}/reset-password` });
      setMessage(result.error ? "Не удалось выполнить запрос. Проверьте данные и повторите попытку." : reset ? "Пароль изменён. Войдите с новым паролем." : "Если аккаунт существует, письмо для восстановления будет отправлено.");
    } catch { setMessage("Сервис временно недоступен. Повторите попытку."); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-card"><Link className="brand" href="/">habbits.</Link><h1>{reset ? "Новый пароль" : "Восстановление пароля"}</h1><form className="form-stack" onSubmit={submit}>{reset ? <label>Новый пароль<input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" /></label> : <label>Email<input name="email" type="email" required autoComplete="email" /></label>}<button className="primary" disabled={busy}>{busy ? "Подождите…" : "Продолжить"}</button>{message && <p role="status">{message}</p>}<Link href="/login">Вернуться ко входу</Link></form></section></main>;
}
