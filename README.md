# habbits

Веб-приложение на Next.js для просмотра статистики потребления алкоголя и табака в Узбекистане и ведения личного журнала покупок.

## Возможности

- годовые показатели ВОЗ по алкоголю и табаку;
- фильтрация периода, график и таблица;
- регистрация и вход через Better Auth;
- личный журнал покупок алкоголя и табачных изделий;
- хранение данных в Turso через Drizzle ORM.

## Локальный запуск

```bash
npm install
npm run db:migrate
npm run db:habbits
npm run data:import
npm run dev
```

Создайте `.env.local` на основе `.env.example` и задайте `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BETTER_AUTH_SECRET` и `BETTER_AUTH_URL`.

Документация проекта находится в папке [`habbits`](habbits).
