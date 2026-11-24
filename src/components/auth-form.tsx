"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Activity, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ register = false }: { register?: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setError("");
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    try {
      const result = register
        ? await authClient.signUp.email({ email, password, name: email.split("@")[0] })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(register ? "Не удалось создать аккаунт. Проверьте email и пароль или попробуйте войти." : "Не удалось войти. Проверьте email и пароль и повторите попытку.");
      } else window.location.assign("/dashboard");
    } catch { setError("Не удалось связаться с сервером. Попробуйте ещё раз."); }
    finally { setBusy(false); }
  }
  return <main className="auth-page">
    <section className="auth-card">
      <Link className="brand" href="/"><span className="brand-icon"><Activity size={23} /></span>habbits<span className="brand-dot">.</span></Link>
      <h1>{register ? "Ваш личный журнал" : "С возвращением"}</h1>
      <p className="muted">{register ? "Сохраняйте покупки алкоголя и табачных изделий." : "Войдите, чтобы продолжить вести учёт."}</p>
      <form onSubmit={submit} className="form-stack">
        <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label>
        <label>Пароль<div className="password-field"><input name="password" type={visible ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} minLength={8} maxLength={128} required placeholder="Не менее 8 символов" /><button type="button" className="icon-button" onClick={() => setVisible(!visible)} aria-label={visible ? "Скрыть пароль" : "Показать пароль"}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="primary" disabled={busy}>{busy ? "Подождите…" : register ? "Создать аккаунт" : "Войти"}</button>
      </form>
      {!register && <p className="auth-switch"><Link href="/forgot-password">Забыли пароль?</Link></p>}
      <p className="auth-switch">{register ? "Уже есть аккаунт?" : "Первый раз здесь?"} <Link href={register ? "/login" : "/register"}>{register ? "Войти" : "Создать аккаунт"}</Link></p>
    </section>
    <p className="auth-footer">habbits · Алкоголь и табак</p>
  </main>;
}
