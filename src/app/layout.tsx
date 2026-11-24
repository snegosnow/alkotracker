import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "habbits — Статистика алкоголя и табака",
  description: "Статистика потребления алкоголя и табака в Узбекистане и личный журнал покупок",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" >
      <body>
          {children}
          <Toaster theme="light" richColors position="top-right" />
      </body>
    </html>
  );
}
