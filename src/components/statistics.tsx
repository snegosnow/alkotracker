"use client";
import { useState } from "react";
import { Activity, Wine, Cigarette, CalendarDays, MapPin } from "lucide-react";
import type { Observation } from "@/lib/habbits";

export function Statistics({ observations }: { observations: Observation[] }) {
  const [category, setCategory] = useState("alcohol");
  const [frequency, setFrequency] = useState("year");
  const [start, setStart] = useState(2000);
  const [end, setEnd] = useState(2025);
  const rows = observations.filter(row => row.category === category && row.year >= start && row.year <= end);
  const latest = rows.at(-1);
  const first = rows[0];
  const unit = category === "alcohol" ? "л" : "%";
  const maximum = Math.max(...rows.map(row => row.value), 1) * 1.15;
  const format = (value: number) => value.toLocaleString("ru", { maximumFractionDigits: 2 });
  return <div className="statistics">
    <header className="page-heading"><div><p className="eyebrow">УЗБЕКИСТАН · ДАННЫЕ ВОЗ</p><h1>Статистика потребления</h1><p className="muted">Алкоголь и табак в цифрах. Динамика среди населения от 15 лет.</p></div></header>
    <div className="category-tabs" aria-label="Вид статистики">
      <button className={category === "alcohol" ? "selected" : ""} onClick={() => setCategory("alcohol")}><Wine size={20}/>Алкоголь</button>
      <button className={category === "tobacco" ? "selected" : ""} onClick={() => setCategory("tobacco")}><Cigarette size={20}/>Табак</button>
    </div>
    <div className="filters"><span className="country"><MapPin size={17}/> Узбекистан</span><label>С года<input type="number" min="2000" max="2030" value={start} onChange={event => setStart(Number(event.target.value))}/></label><label>По год<input type="number" min="2000" max="2030" value={end} onChange={event => setEnd(Number(event.target.value))}/></label><label>Период<select value={frequency} onChange={event => setFrequency(event.target.value)}><option value="year">По годам</option><option value="month">По месяцам</option></select></label></div>
    {start > end && <p role="alert" className="form-error">Начало периода должно предшествовать окончанию.</p>}
    {frequency === "month" ? <section className="panel empty"><CalendarDays size={36}/><h2>Месячные данные пока недоступны</h2><p>В подключённом наборе ВОЗ опубликованы годовые оценки. Выберите «По годам», чтобы посмотреть динамику.</p></section> : <>
    <div className="metrics"><section className="panel metric"><span>Последняя оценка · {latest?.year ?? "—"}</span><strong>{latest ? format(latest.value) : "—"} <small>{unit}</small></strong><p>{category === "alcohol" ? "чистого алкоголя на человека 15+" : "населения 15+ употребляет табак"}</p></section><section className="panel metric"><span>Изменение за период</span><strong>{latest && first ? format(latest.value - first.value) : "—"} <small>{category === "alcohol" ? "л" : "п.п."}</small></strong><p>{first?.year ?? "—"} — {latest?.year ?? "—"}</p></section><section className="panel metric"><span>Доступные наблюдения</span><strong>{rows.length}</strong><p>годовые оценки ВОЗ</p></section></div>
    <section className="panel chart-panel"><div className="section-heading"><div><h2>{category === "alcohol" ? "Потребление алкоголя" : "Распространённость употребления табака"}</h2><p className="muted">{category === "alcohol" ? "Литры чистого алкоголя на человека в год" : "Стандартизованная по возрасту доля населения, %"} · 15+</p></div><Activity size={22}/></div>
      {rows.length ? <div className="bar-chart" role="img" aria-label="График годовых оценок. Точные значения приведены в таблице ниже.">{rows.map(row => <div className="bar-column" key={row.year}><span className="bar-value">{format(row.value)}</span><div className={category === "tobacco" ? "bar tobacco" : "bar"} style={{ height: Math.max(2, row.value / maximum * 210) }} title={row.year + " · " + format(row.value) + " " + unit}/><span className="bar-year">{row.year}</span></div>)}</div> : <div className="empty">За этот период нет данных.</div>}
    </section>
    <section className="panel"><div className="section-heading"><h2>Данные по годам</h2><span className="muted">Узбекистан</span></div><div className="table-scroll"><table><thead><tr><th>Год</th><th>{category === "alcohol" ? "Литры на человека 15+" : "Доля населения 15+, %"}</th><th>Тип данных</th></tr></thead><tbody>{rows.map(row => <tr key={row.year}><td>{row.year}</td><td>{format(row.value)}</td><td>Оценка ВОЗ</td></tr>)}</tbody></table></div></section>
    </>}
    <footer className="source-note"><strong>О данных</strong><p>{category === "alcohol" ? "Общее потребление алкоголя за календарный год, включая зарегистрированное и незарегистрированное потребление." : "Возраст-стандартизованная распространённость употребления курительных и бездымных табачных изделий. Показатель отражает долю населения."} В ряду показаны опубликованные оценки для доступных лет.</p><a href={category === "alcohol" ? "https://data.who.int/indicators/i/EF38E6A/EE6F72A" : "https://data.who.int/indicators/i/847662C/75DDA77"} target="_blank" rel="noreferrer">Источник — World Health Organization · CC BY 4.0</a></footer>
  </div>;
}
