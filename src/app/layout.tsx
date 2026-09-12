import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "БУНКЕР — Гра на виживання",
  description: "Хто отримає перепустку у сховище? Мобільна гра на переконання та виживання.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#090d0b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className="dark">
      <body className="min-h-screen bg-[#0a0f0d] text-zinc-100 flex flex-col items-center justify-start overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-300">
        <main className="w-full min-h-screen flex flex-col relative px-2 sm:px-4 lg:px-6 py-2 sm:py-3 transition-all duration-300">
          {children}
        </main>
      </body>
    </html>
  );
}
