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
        <main className="w-full max-w-md min-h-screen flex flex-col relative px-4 py-6 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}
