"use client";
import { useEffect, useState, type FormEvent } from "react";
import type { Purchase } from "@/lib/habbits";

function blank(): Purchase {
  return { id: crypto.randomUUID(), category: "alcohol", name: "", quantity: 1, unit: "л", date: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(new Date()), note: "" };
}
export function Purchases() {
  const [rows, setRows] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Purchase | null>(null);
  const [category, setCategory] = useState("all");
  const [period, setPeriod] = useState("");
  const [frequency, setFrequency] = useState("month");
  const [page, setPage] = useState(0);
  async function load() {
    try {
      const response = await fetch("/api/purchases");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ошибка загрузки");
      setRows(data);
    } catch (error) { setError(error instanceof Error ? error.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function save(purchase: Purchase, action: string) {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/purchases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purchase, action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDraft(null);
      await load();
    } catch (error) { setError(error instanceof Error ? error.message : "Не удалось сохранить"); }
    finally { setBusy(false); }
  }
  function submit(event: FormEvent) { event.preventDefault(); if (draft && !busy) void save(draft, "save"); }
  const filtered = rows.filter(row => (category === "all" || category === row.category) && row.date.startsWith(period));
  const totals = new Map<string, number>();
  filtered.forEach(row => { const key = (row.category === "alcohol" ? "Алкоголь" : "Табак") + " · " + row.unit; totals.set(key, (totals.get(key) || 0) + row.quantity); });
  return <>
    <header className="page-heading"><div><p className="eyebrow">ЛИЧНЫЙ ЖУРНАЛ</p><h1>Мои покупки</h1><p className="muted">Количество купленных алкогольных и табачных изделий.</p></div><button className="primary" onClick={() => { setDraft(blank()); setError(""); }}>Добавить покупку</button></header>
    {error && <p className="form-error" role="alert">{error} <button onClick={() => { setError(""); void load(); }}>Повторить загрузку</button></p>}
    <div className="filters"><label>Категория<select value={category} onChange={event => { setCategory(event.target.value); setPage(0); }}><option value="all">Все категории</option><option value="alcohol">Алкоголь</option><option value="tobacco">Табачные изделия</option></select></label><label>Период<select value={frequency} onChange={event => { setFrequency(event.target.value); setPeriod(""); setPage(0); }}><option value="month">Месяц</option><option value="year">Год</option></select></label><label>{frequency === "month" ? "Месяц" : "Год"}<input type={frequency === "month" ? "month" : "number"} value={period} placeholder="Все годы" onChange={event => { setPeriod(event.target.value); setPage(0); }}/></label><button onClick={() => { setPeriod(""); setCategory("all"); setPage(0); }}>Сбросить</button></div>
    <div className="metrics"><section className="panel metric"><span>Покупок за период</span><strong>{filtered.length}</strong><p>товарных позиций</p></section>{Array.from(totals).map(([key, value]) => <section className="panel metric" key={key}><span>{key}</span><strong>{value.toLocaleString("ru", { maximumFractionDigits: 3 })}</strong><p>куплено за выбранный период</p></section>)}</div>
    <section className="panel"><div className="section-heading"><h2>История покупок</h2></div>{loading ? <p className="empty">Загрузка…</p> : filtered.length === 0 ? <div className="empty"><h2>Покупок пока нет</h2><p>Добавьте первую запись или измените период.</p></div> : <><div className="table-scroll"><table><thead><tr><th>Дата</th><th>Товар</th><th>Категория</th><th>Количество</th><th>Действия</th></tr></thead><tbody>{filtered.slice(page * 20, page * 20 + 20).map(row => <tr key={row.id}><td>{row.date}</td><td><strong>{row.name}</strong>{row.note && <p className="muted">{row.note}</p>}</td><td>{row.category === "alcohol" ? "Алкоголь" : "Табак"}</td><td>{row.quantity} {row.unit}</td><td><div className="row-actions"><button disabled={busy} onClick={() => setDraft(row)}>Изменить</button><button disabled={busy} onClick={() => { if (window.confirm("Удалить эту покупку?")) void save(row, "delete"); }}>Удалить</button></div></td></tr>)}</tbody></table></div><div className="pagination"><button disabled={page === 0} onClick={() => setPage(page - 1)}>Назад</button><span>{page + 1} / {Math.ceil(filtered.length / 20)}</span><button disabled={(page + 1) * 20 >= filtered.length} onClick={() => setPage(page + 1)}>Далее</button></div></>}</section>
    {draft && <section className="panel purchase-form" aria-label="Форма покупки"><h2>{rows.some(row => row.id === draft.id) ? "Изменить покупку" : "Новая покупка"}</h2><form className="form-stack" onSubmit={submit}><label>Категория<select value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value as Purchase["category"], unit: event.target.value === "tobacco" ? "шт" : "л" })}><option value="alcohol">Алкоголь</option><option value="tobacco">Табачные изделия</option></select></label><label>Название товара<input autoFocus required maxLength={120} value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })}/></label><div className="form-row"><label>Количество<input required type="number" min={draft.unit === "л" ? "0.001" : "1"} max="100000" step={draft.unit === "л" ? "0.001" : "1"} value={draft.quantity} onChange={event => setDraft({ ...draft, quantity: Number(event.target.value) })}/></label><label>Единица<select value={draft.unit} onChange={event => setDraft({ ...draft, unit: event.target.value as Purchase["unit"] })}>{(draft.category === "alcohol" ? ["л","мл","шт","упак"] : ["шт","упак"]).map(unit => <option key={unit}>{unit}</option>)}</select></label></div><label>Дата покупки<input required type="date" value={draft.date} onChange={event => setDraft({ ...draft, date: event.target.value })}/></label><label>Заметка<textarea maxLength={500} value={draft.note} onChange={event => setDraft({ ...draft, note: event.target.value })}/></label><div className="row-actions"><button disabled={busy} className="primary">{busy ? "Сохранение…" : "Сохранить"}</button><button disabled={busy} type="button" onClick={() => setDraft(null)}>Отмена</button></div></form></section>}
  </>;
}
