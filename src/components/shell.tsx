"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
const links = [
  { href: "/statistics", title: "Статистика", icon: LayoutDashboard },
];
export function Shell({ email, children }: { email: string; children: React.ReactNode }) {
  const path = usePathname();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error();
      window.location.assign("/login");
    } catch { setError("Не удалось выйти. Повторите попытку."); setBusy(false); }
  }
  return <div className="app-shell">
    <a href="#main-content" className="skip-link">К содержимому</a>
    <aside className="sidebar">
      <Link href="/statistics" className="brand"><span className="brand-icon"><Activity size={23}/></span>habbits<span className="brand-dot">.</span></Link>
      <p className="nav-caption">Статистика потребления</p>
      <nav aria-label="Основная навигация">{links.map(link => <Link key={link.href} className={`nav-link ${path === link.href ? "active" : ""}`} href={link.href} aria-current={path === link.href ? "page" : undefined}><link.icon size={20}/><span>{link.title}</span></Link>)}</nav>
      <div className="sidebar-bottom">{!email && <Link href="/login">Войти в аккаунт</Link>}<span className="avatar">{email.slice(0, 1).toUpperCase()}</span><span className="account-email" title={email}>{email}</span><button className="icon-button" onClick={logout} disabled={busy} hidden={!email} aria-label="Выйти"><LogOut size={18}/></button></div>
      {error && <p role="alert" className="form-error">{error}</p>}
    </aside>
    <div className="workspace"><header className="topbar"><span>Мой аккаунт <span className="breadcrumb">/ {links.find(link => link.href === path)?.title}</span></span><span className="topbar-label">HABBITS</span></header><main id="main-content" tabIndex={-1}>{children}</main></div>
  </div>;
}
